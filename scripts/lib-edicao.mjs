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
export function filtroCorteConcat(segmentos) {
  const partes = segmentos.flatMap((s, i) => [
    `[0:v]trim=start=${s.inicio}:end=${s.fim},setpts=PTS-STARTPTS[v${i}]`,
    `[0:a]atrim=start=${s.inicio}:end=${s.fim},asetpts=PTS-STARTPTS[a${i}]`,
  ]);
  const labels = segmentos.map((_, i) => `[v${i}][a${i}]`).join("");
  return `${partes.join(";")};${labels}concat=n=${segmentos.length}:v=1:a=1[vout][aout]`;
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

// Escape de caminho pro filtro do ffmpeg (mesma convenção do gerar-video.mjs): no Windows
// "\" quebra o filtro e ":" do drive vira "\:". Trocar "\" por "/" é o mais robusto.
function escFiltro(caminho) {
  return caminho.replace(/\\/g, "/").replace(/:/g, "\\:");
}

// Filtro que queima a legenda .srt no vídeo (libass via subtitles=).
export function filtroLegenda({ srtCaminho, tamanho = 48, contorno = 3 }) {
  return `subtitles='${escFiltro(srtCaminho)}':force_style='Fontsize=${tamanho},Outline=${contorno}'`;
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
