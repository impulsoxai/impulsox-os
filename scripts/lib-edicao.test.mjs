import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseSilencedetect, segmentosManter, filtroCorteConcat, planoCorte,
  montarSRT, montarASS, filtroLegenda, filtroLegendaAss, filtroLoudnorm,
  argsThumbnailFrameTexto, argsThumbnailComposta, lerGlossario, corrigirTermos,
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

test("argsThumbnailComposta gera fundo lavfi + faixa de cor + frame na metade direita", () => {
  const a = argsThumbnailComposta({
    frame: "f.png", texto: "REEL EM 15 SEGUNDOS", fonte: "C:\\f\\impact.ttf",
    faixaCor: "0xE10600", largura: 1280, altura: 720, saida: "t.png",
  });
  assert.equal(a[0], "-y");
  assert.deepEqual(a.slice(1, 5), ["-f", "lavfi", "-i", "color=c=black:s=1280x720"]);
  assert.deepEqual(a.slice(5, 7), ["-i", "f.png"]);
  const vf = a[a.indexOf("-filter_complex") + 1];
  assert.match(vf, /drawbox=x=0:y=0:w=1280:h=720:color=0xE10600:t=fill/);
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
