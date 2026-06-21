import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseSilencedetect, segmentosManter, filtroCorteConcat, planoCorte,
  montarSRT, montarASS, filtroLegenda, filtroLegendaAss, filtroLoudnorm,
  argsThumbnailFrameTexto, argsThumbnailComposta, lerGlossario, corrigirTermos,
  parseTrechosTabela, normalizarTrechos, planoVelocidade,
  cadeiaAtempo, filtroVelocidadeConcat, filtroEscala1080p, filtroZoompan,
  posicaoOverlay,
} from "./lib-edicao.mjs";

const SAIDA = `
[silencedetect @ 0x1] silence_start: 2.5
[silencedetect @ 0x1] silence_end: 4.0 | silence_duration: 1.5
[silencedetect @ 0x1] silence_start: 9.0
[silencedetect @ 0x1] silence_end: 9.3 | silence_duration: 0.3
`;

// --- Task 2 ---

test("parseSilencedetect pareia start/end de cada silêncio", () => {
  const sil = parseSilencedetect(SAIDA);
  assert.deepEqual(sil, [
    { start: 2.5, end: 4.0 },
    { start: 9.0, end: 9.3 },
  ]);
});

test("segmentosManter inverte os silêncios >= minSilencio e aplica folga de borda", () => {
  const seg = segmentosManter(SAIDA, { minSilencio: 0.8, duracaoTotal: 12, folga: 0.15 });
  assert.deepEqual(seg, [
    { inicio: 0, fim: 2.65 },
    { inicio: 3.85, fim: 12 },
  ]);
});

test("segmentosManter sem silêncio relevante devolve o vídeo inteiro", () => {
  const seg = segmentosManter("", { minSilencio: 0.8, duracaoTotal: 10 });
  assert.deepEqual(seg, [{ inicio: 0, fim: 10 }]);
});

// --- Task 3 ---

test("filtroCorteConcat monta trim+atrim+concat pra N segmentos", () => {
  const f = filtroCorteConcat([{ inicio: 0, fim: 2.65 }, { inicio: 3.85, fim: 12 }]);
  assert.equal(
    f,
    "[0:v]trim=start=0:end=2.65,setpts=PTS-STARTPTS[v0];" +
    "[0:a]atrim=start=0:end=2.65,asetpts=PTS-STARTPTS[a0];" +
    "[0:v]trim=start=3.85:end=12,setpts=PTS-STARTPTS[v1];" +
    "[0:a]atrim=start=3.85:end=12,asetpts=PTS-STARTPTS[a1];" +
    "[v0][a0][v1][a1]concat=n=2:v=1:a=1[vout][aout]"
  );
});

test("filtroCorteConcat embute loudnorm dentro do filtergraph quando pedido", () => {
  const f = filtroCorteConcat([{ inicio: 0, fim: 2 }], { loudnorm: "loudnorm=I=-14:TP=-1.5:LRA=11" });
  assert.match(f, /concat=n=1:v=1:a=1\[vout\]\[acat\];\[acat\]loudnorm=I=-14:TP=-1\.5:LRA=11\[aout\]$/);
});

test("planoCorte resume duração depois e quanto foi removido", () => {
  const p = planoCorte([{ inicio: 0, fim: 2.65 }, { inicio: 3.85, fim: 12 }], 12);
  assert.equal(p.cortes, 1);
  assert.equal(Math.round(p.duracaoDepois * 100) / 100, 10.8);
  assert.equal(Math.round(p.percentRemovido), 10);
});

// --- Task 4 ---

test("montarSRT agrupa palavras em legendas e formata timestamp HH:MM:SS,mmm", () => {
  const palavras = [
    { inicio: 0.0, fim: 0.4, texto: "oi" },
    { inicio: 0.4, fim: 0.9, texto: "pessoal" },
    { inicio: 1.0, fim: 1.5, texto: "hoje" },
  ];
  const srt = montarSRT(palavras, { maxPalavras: 2, maxDur: 3 });
  assert.equal(
    srt,
    "1\n00:00:00,000 --> 00:00:00,900\noi pessoal\n\n" +
    "2\n00:00:01,000 --> 00:00:01,500\nhoje\n"
  );
});

test("montarSRT quebra grupo quando passa de maxDur", () => {
  const palavras = [
    { inicio: 0.0, fim: 0.5, texto: "a" },
    { inicio: 4.0, fim: 4.5, texto: "b" },
  ];
  const srt = montarSRT(palavras, { maxPalavras: 7, maxDur: 3 });
  assert.match(srt, /^1\n00:00:00,000 --> 00:00:00,500\na\n\n2\n/);
});

// --- Melhoria: glossário de transcrição ---

const GLOSSARIO_MD = `# comentário ignorado
real => reel
impulso x => ImpulsoX
`;

test("lerGlossario lê pares errado=>certo e ignora comentário/linha vazia", () => {
  assert.deepEqual(lerGlossario(GLOSSARIO_MD), [
    { errado: "real", certo: "reel" },
    { errado: "impulso x", certo: "ImpulsoX" },
  ]);
});

test("corrigirTermos troca palavra inteira case-insensitive preservando timestamp", () => {
  const palavras = [
    { inicio: 0.0, fim: 0.3, texto: "aquele" },
    { inicio: 0.3, fim: 0.7, texto: "Real" },
    { inicio: 0.7, fim: 1.0, texto: "legal" },
  ];
  const regras = [{ errado: "real", certo: "reel" }];
  assert.deepEqual(corrigirTermos(palavras, regras), [
    { inicio: 0.0, fim: 0.3, texto: "aquele" },
    { inicio: 0.3, fim: 0.7, texto: "reel" },
    { inicio: 0.7, fim: 1.0, texto: "legal" },
  ]);
});

test("corrigirTermos colapsa sequência de N palavras num termo só (timestamp herda o fim)", () => {
  const palavras = [
    { inicio: 0.0, fim: 0.4, texto: "impulso" },
    { inicio: 0.4, fim: 0.9, texto: "X" },
    { inicio: 0.9, fim: 1.2, texto: "rocks" },
  ];
  const regras = [{ errado: "impulso x", certo: "ImpulsoX" }];
  assert.deepEqual(corrigirTermos(palavras, regras), [
    { inicio: 0.0, fim: 0.9, texto: "ImpulsoX" },
    { inicio: 0.9, fim: 1.2, texto: "rocks" },
  ]);
});

test("corrigirTermos não pega substring (palavra inteira só)", () => {
  const palavras = [{ inicio: 0, fim: 0.5, texto: "realmente" }];
  const regras = [{ errado: "real", certo: "reel" }];
  assert.deepEqual(corrigirTermos(palavras, regras), [{ inicio: 0, fim: 0.5, texto: "realmente" }]);
});

// --- Melhoria: karaokê .ass + loudnorm ---

test("montarASS gera cabeçalho + Dialogue com tags \\k por palavra (centésimos)", () => {
  const palavras = [
    { inicio: 0.0, fim: 0.4, texto: "oi" },
    { inicio: 0.4, fim: 0.9, texto: "pessoal" },
  ];
  const ass = montarASS(palavras, { maxPalavras: 7, maxDur: 3 });
  assert.match(ass, /\[Script Info\]/);
  assert.match(ass, /\[V4\+ Styles\]/);
  // grupo único 0.00 -> 0.90; \k40 (0.4s) em "oi", \k50 (0.5s) em "pessoal"
  assert.match(ass, /Dialogue: 0,0:00:00\.00,0:00:00\.90,Default,\{\\k40\}oi \{\\k50\}pessoal/);
});

test("montarASS: palavra ativa em dourado (Primary), base branca (Secondary)", () => {
  const ass = montarASS([{ inicio: 0, fim: 0.5, texto: "x" }]);
  // Primary = destaque dourado #E2C97E -> &H007EC9E2 ; Secondary = branco -> &H00FFFFFF
  assert.match(ass, /Style: Default,Space Grotesk,64,&H007EC9E2,&H00FFFFFF,&H000D0606,&H64000000,1,4,2,2,520/);
  assert.match(ass, /PlayResX: 1080\nPlayResY: 1920/);
});

test("filtroLegendaAss escapa o caminho .ass no padrão Windows", () => {
  assert.equal(filtroLegendaAss({ assCaminho: "C:\\v\\leg.ass" }), "subtitles='C\\:/v/leg.ass'");
});

test("filtroLoudnorm aplica o alvo do YouTube (-14 LUFS) por padrão", () => {
  assert.equal(filtroLoudnorm(), "loudnorm=I=-14:TP=-1.5:LRA=11");
  assert.equal(filtroLoudnorm({ alvoLufs: -16 }), "loudnorm=I=-16:TP=-1.5:LRA=11");
});

// --- Task 5 ---

test("filtroLegenda escapa o caminho do .srt no padrão Windows e aplica estilo", () => {
  const f = filtroLegenda({ srtCaminho: "C:\\v\\legenda.srt", tamanho: 48, contorno: 3 });
  assert.equal(f, "subtitles='C\\:/v/legenda.srt':force_style='Fontsize=48,Outline=3'");
});

test("argsThumbnailComposta: fundo escuro da marca, texto topo-esquerda, última linha dourada, frame inteiro à direita", () => {
  const a = argsThumbnailComposta({
    frame: "f.png", texto: "REEL EM 15 SEGUNDOS", fonte: "C:\\f\\sg.ttf", saida: "t.png",
  });
  assert.equal(a[0], "-y");
  assert.deepEqual(a.slice(1, 5), ["-f", "lavfi", "-i", "color=c=black:s=1280x720"]);
  assert.deepEqual(a.slice(5, 7), ["-i", "f.png"]);
  const vf = a[a.indexOf("-filter_complex") + 1];
  // fundo preto da marca chapado
  assert.match(vf, /drawbox=x=0:y=0:w=1280:h=720:color=0x06060D:t=fill/);
  // barra-glow roxa de acento
  assert.match(vf, /color=0x7C3AED:t=fill/);
  // texto começa na margem esquerda (x=64 = 5% de 1280), não centralizado
  assert.match(vf, /text='REEL EM':fontcolor=0xF0EBE0:fontsize=88:borderw=6:bordercolor=0x06060D:x=64:y=130/);
  // última linha em dourado
  assert.match(vf, /text='15 SEGUNDOS':fontcolor=0xE2C97E/);
  // frame inteiro à direita, centralizado
  assert.match(vf, /\[1:v\]scale=640:720:force_original_aspect_ratio=decrease\[dir\]/);
  assert.match(vf, /\[bg\]\[dir\]overlay=640\+\(640-overlay_w\)\/2:\(720-overlay_h\)\/2$/);
  assert.deepEqual(a.slice(-3), ["-frames:v", "1", "t.png"]);
});

test("argsThumbnailFrameTexto monta drawtext com contorno e escapa fonte/texto", () => {
  const a = argsThumbnailFrameTexto({
    frame: "f.png", texto: "POSTA SOZINHO", fonte: "C:\\fonts\\b.ttf",
    cor: "white", contorno: "black", largura: 1280, altura: 720, saida: "t.png",
  });
  assert.deepEqual(a, [
    "-y", "-i", "f.png",
    "-vf",
    "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720," +
    "drawtext=fontfile='C\\:/fonts/b.ttf':text='POSTA SOZINHO':fontcolor=white:" +
    "fontsize=96:borderw=8:bordercolor=black:x=(w-text_w)/2:y=h-h/3",
    "-frames:v", "1", "t.png",
  ]);
});

// --- Fase 1: velocidade ---

test("parseTrechosTabela lê cortar, acelerar (com áudio) e manter", () => {
  const txt = `
00:00-02:00 cortar
02:00-08:00 manter
08:00-35:00 2x mudo
35:00-40:00 1.5x voz
`;
  assert.deepEqual(parseTrechosTabela(txt), [
    { inicio: 0,    fim: 120,  acao: "cortar" },
    { inicio: 120,  fim: 480,  acao: "manter" },
    { inicio: 480,  fim: 2100, acao: "acelerar", fator: 2,   audio: "mudo" },
    { inicio: 2100, fim: 2400, acao: "acelerar", fator: 1.5, audio: "voz" },
  ]);
});

test("parseTrechosTabela aceita – e 'a' como separador e hh:mm:ss", () => {
  const txt = `1:00:00 a 1:05:00 manter\n00:10–00:20 cortar`;
  assert.deepEqual(parseTrechosTabela(txt), [
    { inicio: 3600, fim: 3900, acao: "manter" },
    { inicio: 10,   fim: 20,   acao: "cortar" },
  ]);
});

test("parseTrechosTabela: acelerar sem áudio explícito assume voz", () => {
  assert.deepEqual(parseTrechosTabela("00:00-00:30 2x"), [
    { inicio: 0, fim: 30, acao: "acelerar", fator: 2, audio: "voz" },
  ]);
});

test("parseTrechosTabela pula linha com tempo malformado (sem NaN)", () => {
  assert.deepEqual(parseTrechosTabela("00:xx-00:30 cortar"), []);
});

test("parseTrechosTabela pula fator malformado (sem NaN)", () => {
  assert.deepEqual(parseTrechosTabela("00:00-00:30 1.2.3x"), []);
});

test("parseTrechosTabela ignora prosa solta sem quebrar as linhas válidas", () => {
  const txt = `isso é um comentário do dono\n00:00-00:30 cortar`;
  assert.deepEqual(parseTrechosTabela(txt), [
    { inicio: 0, fim: 30, acao: "cortar" },
  ]);
});

test("normalizarTrechos preenche buracos com manter e ordena", () => {
  const trechos = [
    { inicio: 480, fim: 600, acao: "acelerar", fator: 2, audio: "mudo" },
    { inicio: 0,   fim: 120, acao: "cortar" },
  ];
  assert.deepEqual(normalizarTrechos(trechos, 720), [
    { inicio: 0,   fim: 120, acao: "cortar" },
    { inicio: 120, fim: 480, acao: "manter" },
    { inicio: 480, fim: 600, acao: "acelerar", fator: 2, audio: "mudo" },
    { inicio: 600, fim: 720, acao: "manter" },
  ]);
});

test("normalizarTrechos clampa o fim na duração total", () => {
  const out = normalizarTrechos([{ inicio: 0, fim: 999, acao: "manter" }], 300);
  assert.deepEqual(out, [{ inicio: 0, fim: 300, acao: "manter" }]);
});

test("normalizarTrechos rejeita sobreposição", () => {
  const trechos = [
    { inicio: 0,  fim: 100, acao: "manter" },
    { inicio: 50, fim: 150, acao: "cortar" },
  ];
  assert.throws(() => normalizarTrechos(trechos, 200), /sobrep/i);
});

test("normalizarTrechos sem trechos = tudo manter", () => {
  assert.deepEqual(normalizarTrechos([], 300), [
    { inicio: 0, fim: 300, acao: "manter" },
  ]);
});

test("planoVelocidade soma a duração final por ação", () => {
  const trechos = [
    { inicio: 0,   fim: 120, acao: "cortar" },                                  // -120s
    { inicio: 120, fim: 480, acao: "manter" },                                  // +360s
    { inicio: 480, fim: 600, acao: "acelerar", fator: 2, audio: "mudo" },       // +60s
  ];
  const p = planoVelocidade(trechos, 600);
  assert.equal(p.duracaoFinal, 420);          // 360 + 60
  assert.equal(p.contagem.cortar, 1);
  assert.equal(p.contagem.manter, 1);
  assert.equal(p.contagem.acelerar, 1);
  assert.deepEqual(p.avisos, []);
});

test("planoVelocidade avisa quando acelera >2x com voz", () => {
  const trechos = [{ inicio: 0, fim: 60, acao: "acelerar", fator: 3, audio: "voz" }];
  const p = planoVelocidade(trechos, 60);
  assert.equal(p.avisos.length, 1);
  assert.match(p.avisos[0], /entender|2x|voz/i);
});

test("planoVelocidade não emite NaN se acelerar vier sem fator válido", () => {
  const p = planoVelocidade([{ inicio: 0, fim: 60, acao: "acelerar", audio: "voz" }], 60);
  assert.ok(Number.isFinite(p.duracaoFinal), "duracaoFinal deve ser finito");
  assert.equal(p.duracaoFinal, 60); // fator inválido -> conta como duração cheia
});

test("cadeiaAtempo encadeia atempo pra fator > 2", () => {
  assert.equal(cadeiaAtempo(2),   "atempo=2");
  assert.equal(cadeiaAtempo(4),   "atempo=2,atempo=2");
  assert.equal(cadeiaAtempo(1.5), "atempo=1.5");
});

test("filtroVelocidadeConcat: manter + acelerar mudo, pula cortar", () => {
  const trechos = [
    { inicio: 0,   fim: 100, acao: "cortar" },
    { inicio: 100, fim: 160, acao: "manter" },
    { inicio: 160, fim: 220, acao: "acelerar", fator: 2, audio: "mudo" },
  ];
  const f = filtroVelocidadeConcat(trechos);
  assert.match(f, /concat=n=2:v=1:a=1\[vout\]\[aout\]/);
  assert.match(f, /trim=start=100:end=160,setpts=PTS-STARTPTS\[v0\]/);
  assert.match(f, /trim=start=160:end=220,setpts=PTS\/2,setpts=PTS-STARTPTS\[v1\]/);
  assert.match(f, /volume=0/);
});

test("filtroVelocidadeConcat: acelerar voz usa atempo", () => {
  const trechos = [{ inicio: 0, fim: 60, acao: "acelerar", fator: 2, audio: "voz" }];
  const f = filtroVelocidadeConcat(trechos);
  assert.match(f, /atempo=2/);
});

test("filtroVelocidadeConcat com loudnorm encadeia no áudio final", () => {
  const trechos = [{ inicio: 0, fim: 60, acao: "manter" }];
  const f = filtroVelocidadeConcat(trechos, { loudnorm: "loudnorm=I=-14:TP=-1.5:LRA=11" });
  assert.match(f, /\[acat\]/);
  assert.match(f, /loudnorm=I=-14/);
  assert.match(f, /\[aout\]/);
});

test("cadeiaAtempo guarda contra fator inválido (sem loop infinito)", () => {
  assert.equal(cadeiaAtempo(0), "atempo=1");
  assert.equal(cadeiaAtempo(-3), "atempo=1");
  assert.equal(cadeiaAtempo(Number.POSITIVE_INFINITY), "atempo=1");
});

test("filtroVelocidadeConcat: acelerar mudo comprime o áudio (a/v casam) antes de mutar", () => {
  const trechos = [{ inicio: 0, fim: 60, acao: "acelerar", fator: 2, audio: "mudo" }];
  const f = filtroVelocidadeConcat(trechos);
  // áudio do trecho mudo passa pelo atempo (mesma compressão do vídeo) E zera o volume
  assert.match(f, /atempo=2/);
  assert.match(f, /volume=0/);
  assert.match(f, /setpts=PTS\/2/);
});

// --- Escala 1080p (padrão YouTube long-form) ---

test("filtroEscala1080p escala pra 1920x1080 mantendo aspect, com pad e sar", () => {
  const f = filtroEscala1080p();
  // escala cabendo dentro de 1920x1080 sem distorcer, depois pad pro frame cheio centralizado
  assert.match(f, /scale=1920:1080:force_original_aspect_ratio=decrease/);
  assert.match(f, /pad=1920:1080:\(ow-iw\)\/2:\(oh-ih\)\/2/);
  assert.match(f, /setsar=1/);
});

test("filtroEscala1080p aceita dimensões custom (ex: short vertical)", () => {
  const f = filtroEscala1080p({ largura: 1080, altura: 1920 });
  assert.match(f, /scale=1080:1920:force_original_aspect_ratio=decrease/);
  assert.match(f, /pad=1080:1920/);
});

// --- Zoom (Fase 3c) ---

test("filtroZoompan: 1 região vira zoompan condicional no tempo", () => {
  const regioes = [{ inicio: 2, fim: 4, foco: { x: 0.45, y: 0.30 }, nivel: 1.5 }];
  const f = filtroZoompan(regioes, { fps: 30, largura: 1920, altura: 1080 });
  assert.match(f, /zoompan=z='if\(between\(in,60,120\),1\.5,/);
  assert.match(f, /iw\*\(.*0\.45.*\)-\(iw\/zoom\/2\)/);
  assert.match(f, /s=1920x1080:fps=30/);
});

test("filtroZoompan: várias regiões encadeiam if aninhado", () => {
  const regioes = [
    { inicio: 1, fim: 2, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 },
    { inicio: 5, fim: 6, foco: { x: 0.2, y: 0.2 }, nivel: 2.0 },
  ];
  const f = filtroZoompan(regioes, { fps: 30, largura: 1920, altura: 1080 });
  assert.match(f, /between\(in,30,60\)/);
  assert.match(f, /between\(in,150,180\)/);
});

test("filtroZoompan: sem regiões -> null", () => {
  assert.equal(filtroZoompan([], { fps: 30, largura: 1920, altura: 1080 }), null);
});

// --- Bolha de webcam (Fase 4) ---

test("posicaoOverlay: cantos viram expressão x:y do overlay", () => {
  assert.equal(posicaoOverlay("ir", 40), "W-w-40:H-h-40");
  assert.equal(posicaoOverlay("il", 40), "40:H-h-40");
  assert.equal(posicaoOverlay("sr", 40), "W-w-40:40");
  assert.equal(posicaoOverlay("sl", 40), "40:40");
});
test("posicaoOverlay: canto desconhecido cai no inferior-direito", () => {
  assert.equal(posicaoOverlay("xx", 40), "W-w-40:H-h-40");
});
