// lib-edicao.mjs — funções puras pro pipeline de edição (Fase 2). ZERO deps, sem rede,
// sem disco: só montam listas/strings que o orquestrador passa pro ffmpeg. ImpulsoX AI.

// Pareia silence_start/silence_end da saída do ffmpeg silencedetect.
export function parseSilencedetect(saida) {
  const out = [];
  let aberto = null;
  for (const l of String(saida).split("\n")) {
    const ms = l.match(/silence_start:\s*([\d.]+)/);
    if (ms) { aberto = { start: Number(ms[1]), end: null }; out.push(aberto); continue; }
    const me = l.match(/silence_end:\s*([\d.]+)/);
    if (me && aberto) { aberto.end = Number(me[1]); aberto = null; }
  }
  return out;
}

// Lista de trechos a MANTER: complemento dos silêncios >= minSilencio sobre [0, total],
// encolhendo cada remoção por `folga` nas bordas (não cortar respiração/ataque de palavra).
export function segmentosManter(saidaSilencedetect, { minSilencio = 0.8, duracaoTotal, folga = 0.15 } = {}) {
  const silencios = parseSilencedetect(saidaSilencedetect)
    .filter((s) => s.end != null && s.end - s.start >= minSilencio)
    .map((s) => ({ start: s.start + folga, end: s.end - folga }))
    .filter((s) => s.end > s.start);
  const keeps = [];
  let cursor = 0;
  for (const s of silencios) {
    if (s.start > cursor) keeps.push({ inicio: cursor, fim: s.start });
    cursor = s.end;
  }
  if (cursor < duracaoTotal) keeps.push({ inicio: cursor, fim: duracaoTotal });
  return keeps;
}

// Filtro complexo do ffmpeg que costura só os trechos mantidos (vídeo + áudio juntos).
// `loudnorm` (opcional): aplica a normalização DENTRO do filtergraph — o ffmpeg não deixa
// `-af` simples conviver com `-filter_complex` no mesmo stream, então a normalização
// encadeia no áudio concatenado antes do [aout].
export function filtroCorteConcat(segmentos, { loudnorm } = {}) {
  const partes = segmentos.flatMap((s, i) => [
    `[0:v]trim=start=${s.inicio}:end=${s.fim},setpts=PTS-STARTPTS[v${i}]`,
    `[0:a]atrim=start=${s.inicio}:end=${s.fim},asetpts=PTS-STARTPTS[a${i}]`,
  ]);
  const labels = segmentos.map((_, i) => `[v${i}][a${i}]`).join("");
  const saidaAudio = loudnorm ? "[acat]" : "[aout]";
  const concat = `${labels}concat=n=${segmentos.length}:v=1:a=1[vout]${saidaAudio}`;
  const norm = loudnorm ? `;[acat]${loudnorm}[aout]` : "";
  return `${partes.join(";")};${concat}${norm}`;
}

// Resumo pro dry-run: quantos cortes, duração depois, % removido.
export function planoCorte(segmentos, duracaoTotal) {
  const duracaoDepois = segmentos.reduce((acc, s) => acc + (s.fim - s.inicio), 0);
  return {
    cortes: Math.max(0, segmentos.length - 1),
    duracaoDepois,
    percentRemovido: duracaoTotal > 0 ? ((duracaoTotal - duracaoDepois) / duracaoTotal) * 100 : 0,
  };
}

function fmtTempoSRT(seg) {
  const ms = Math.round((seg - Math.floor(seg)) * 1000);
  const t = Math.floor(seg);
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${h}:${m}:${s},${String(ms).padStart(3, "0")}`;
}

// Agrupa palavras com timestamp em legendas (até maxPalavras ou maxDur) e devolve .srt.
export function montarSRT(palavras, { maxPalavras = 7, maxDur = 3 } = {}) {
  const grupos = [];
  let g = [];
  for (const p of palavras) {
    if (g.length === 0) { g.push(p); continue; }
    const dur = p.fim - g[0].inicio;
    if (g.length >= maxPalavras || dur > maxDur) { grupos.push(g); g = [p]; }
    else g.push(p);
  }
  if (g.length) grupos.push(g);
  return grupos
    .map((grp, i) =>
      `${i + 1}\n${fmtTempoSRT(grp[0].inicio)} --> ${fmtTempoSRT(grp[grp.length - 1].fim)}\n` +
      `${grp.map((w) => w.texto).join(" ")}\n`
    )
    .join("\n");
}

// Lê o glossário da marca (linhas "errado => certo") em pares pra correção de transcrição.
export function lerGlossario(md) {
  return String(md).split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && l.includes("=>"))
    .map((l) => {
      const [errado, certo] = l.split("=>").map((p) => p.trim());
      return { errado, certo };
    })
    .filter((r) => r.errado && r.certo);
}

function escaparRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Aplica o glossário nas palavras transcritas (case-insensitive, palavra inteira). Regra de
// N palavras ("impulso x") casa a sequência: o "certo" entra na 1ª palavra, as outras da
// sequência viram "". Preserva os timestamps (a 1ª palavra herda o fim da última casada).
export function corrigirTermos(palavras, regras) {
  // ordena por nº de palavras do "errado" (mais longas primeiro) pra "impulso x" ganhar de "x".
  const ordenadas = [...regras].sort((a, b) => b.errado.split(/\s+/).length - a.errado.split(/\s+/).length);
  const out = palavras.map((p) => ({ ...p }));
  for (const regra of ordenadas) {
    const termos = regra.errado.split(/\s+/);
    for (let i = 0; i + termos.length <= out.length; i++) {
      const janela = out.slice(i, i + termos.length);
      if (janela.some((w) => w.texto === "")) continue;
      const casa = janela.every((w, k) => new RegExp(`^${escaparRegex(termos[k])}$`, "i").test(w.texto));
      if (casa) {
        out[i] = { inicio: out[i].inicio, fim: janela[janela.length - 1].fim, texto: regra.certo };
        for (let k = 1; k < termos.length; k++) out[i + k] = { ...out[i + k], texto: "" };
      }
    }
  }
  return out.filter((w) => w.texto !== "");
}

// Agrupa palavras em legendas como o montarSRT (mesma regra), pra reuso.
function agruparPalavras(palavras, maxPalavras, maxDur) {
  const grupos = [];
  let g = [];
  for (const p of palavras) {
    if (g.length === 0) { g.push(p); continue; }
    const dur = p.fim - g[0].inicio;
    if (g.length >= maxPalavras || dur > maxDur) { grupos.push(g); g = [p]; }
    else g.push(p);
  }
  if (g.length) grupos.push(g);
  return grupos;
}

function fmtTempoASS(seg) {
  const cs = Math.round((seg - Math.floor(seg)) * 100); // centésimos (ASS usa 1/100)
  const t = Math.floor(seg);
  const h = Math.floor(t / 3600);
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${h}:${m}:${s}.${String(cs).padStart(2, "0")}`;
}

// Monta legenda karaokê .ass: cada palavra ganha uma tag {\k<dur>} (centésimos), então o
// libass destaca palavra a palavra em sync com a fala — mais retenção que bloco estático.
// Usa os timestamps por palavra que o whisper já entrega (montarSRT joga isso fora).
export function montarASS(palavras, { maxPalavras = 7, maxDur = 3, fonte = "Arial", tamanho = 48 } = {}) {
  const cabecalho =
    "[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n" +
    "[V4+ Styles]\n" +
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Outline, Shadow, Alignment, MarginV\n" +
    `Style: Default,${fonte},${tamanho},&H00FFFFFF,&H0000FFFF,&H00000000,&H64000000,1,3,1,2,80\n\n` +
    "[Events]\nFormat: Layer, Start, End, Style, Text\n";
  const linhas = agruparPalavras(palavras, maxPalavras, maxDur).map((grp) => {
    const inicio = fmtTempoASS(grp[0].inicio);
    const fim = fmtTempoASS(grp[grp.length - 1].fim);
    const texto = grp
      .map((w) => `{\\k${Math.max(1, Math.round((w.fim - w.inicio) * 100))}}${w.texto}`)
      .join(" ");
    return `Dialogue: 0,${inicio},${fim},Default,${texto}`;
  });
  return cabecalho + linhas.join("\n") + "\n";
}

// Escape de caminho pro filtro do ffmpeg (mesma convenção do gerar-video.mjs): no Windows
// "\" quebra o filtro e ":" do drive vira "\:". Trocar "\" por "/" é o mais robusto.
function escFiltro(caminho) {
  return caminho.replace(/\\/g, "/").replace(/:/g, "\\:");
}

// Filtro que queima a legenda .srt no vídeo (libass via subtitles=).
export function filtroLegenda({ srtCaminho, tamanho = 48, contorno = 3 }) {
  return `subtitles='${escFiltro(srtCaminho)}':force_style='Fontsize=${tamanho},Outline=${contorno}'`;
}

// Filtro que queima a legenda karaokê .ass (estilo embutido no próprio arquivo).
export function filtroLegendaAss({ assCaminho }) {
  return `subtitles='${escFiltro(assCaminho)}'`;
}

// Filtro de normalização de loudness pro padrão do YouTube (-14 LUFS, TP -1.5, LRA 11,
// EBU R128). Tira o som amador/irregular da gravação de tela crua.
export function filtroLoudnorm({ alvoLufs = -14, truePeak = -1.5, lra = 11 } = {}) {
  return `loudnorm=I=${alvoLufs}:TP=${truePeak}:LRA=${lra}`;
}

// Args do ffmpeg pra thumbnail COMPOSTA 16:9 (1280x720), calibrada pela pesquisa de CTR +
// identidade da marca: fundo ESCURO chapado (contraste alto no feed branco/mobile), frame
// inteiro à direita (sem cortar o rosto), texto no TOPO-ESQUERDA (longe do timestamp do
// canto inferior-direito) com a ÚLTIMA linha em cor de destaque (palavra-chave). Cores em
// 0xRRGGBB; defaults = marca ImpulsoX (preto/off-white/dourado). `texto` quebra por palavra.
export function argsThumbnailComposta({
  frame, texto, fonte, saida, largura = 1280, altura = 720,
  fundoCor = "0x06060D",      // preto da marca
  textoCor = "0xF0EBE0",      // off-white quente
  destaqueCor = "0xE2C97E",   // dourado claro — última linha (palavra-chave)
  contorno = "0x06060D",      // contorno = fundo, pra legibilidade sem caixa
  glowCor = "0x7C3AED",       // roxo da marca — faixa-glow sutil atrás do texto
} = {}) {
  const metade = Math.round(largura / 2);
  const palavras = texto.split(/\s+/);
  const linhas = [];
  for (let i = 0; i < palavras.length; i += 2) linhas.push(palavras.slice(i, i + 2).join(" "));
  const margemX = Math.round(largura * 0.05);
  const margemTopo = Math.round(altura * 0.18);
  const passoLinha = 110;
  const desenhos = linhas.map((linha, i) => {
    const txt = linha.replace(/:/g, "\\:").replace(/'/g, "\\'");
    const ehDestaque = i === linhas.length - 1; // última linha = palavra-chave em dourado
    const y = margemTopo + i * passoLinha;
    return `drawtext=fontfile='${escFiltro(fonte)}':text='${txt}':` +
      `fontcolor=${ehDestaque ? destaqueCor : textoCor}:fontsize=88:` +
      `borderw=6:bordercolor=${contorno}:x=${margemX}:y=${y}`;
  }).join(",");
  // fundo escuro chapado + barra-glow roxa fininha na base do bloco de texto (acento de
  // marca, 10% da composição) + texto topo-esquerda. Frame inteiro à direita, centralizado.
  const yBarra = margemTopo + linhas.length * passoLinha + 10;
  const vf =
    `[0:v]scale=${largura}:${altura},drawbox=x=0:y=0:w=${largura}:h=${altura}:color=${fundoCor}:t=fill,` +
    `drawbox=x=${margemX}:y=${yBarra}:w=${Math.round(largura * 0.22)}:h=10:color=${glowCor}:t=fill,` +
    `${desenhos}[bg];` +
    `[1:v]scale=${metade}:${altura}:force_original_aspect_ratio=decrease[dir];` +
    `[bg][dir]overlay=${metade}+(${metade}-overlay_w)/2:(${altura}-overlay_h)/2`;
  return ["-y", "-f", "lavfi", "-i", `color=c=black:s=${largura}x${altura}`, "-i", frame,
    "-filter_complex", vf, "-frames:v", "1", saida];
}

// Args do ffmpeg pra queimar ≤5 palavras sobre um frame (capa 1280x720), legível no mobile.
export function argsThumbnailFrameTexto({ frame, texto, fonte, cor = "white", contorno = "black", largura = 1280, altura = 720, saida }) {
  const txt = texto.replace(/:/g, "\\:").replace(/'/g, "\\'");
  const vf =
    `scale=${largura}:${altura}:force_original_aspect_ratio=increase,crop=${largura}:${altura},` +
    `drawtext=fontfile='${escFiltro(fonte)}':text='${txt}':fontcolor=${cor}:` +
    `fontsize=96:borderw=8:bordercolor=${contorno}:x=(w-text_w)/2:y=h-h/3`;
  return ["-y", "-i", frame, "-vf", vf, "-frames:v", "1", saida];
}
