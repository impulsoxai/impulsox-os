# Edição automática do long-form (Fase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar uma gravação de tela narrada crua em vídeo long-form publicável
(silêncio cortado, legenda queimada + `.srt`, intro/outro com a marca, render 16:9) mais
duas opções de thumbnail — automatizando o que é regra e deixando pro humano só a direção.

**Architecture:** Pipeline de scripts pequenos no padrão do repo: `lib-edicao.mjs`
(funções puras testáveis sem ffmpeg/whisper) + `transcrever-local.mjs` (wrapper whisper) +
`editar-video.mjs` (orquestrador, dry-run/`--confirmar`) + `gerar-thumbnail.mjs`. O pipeline
trabalha sobre a gravação real (transcreve áudio, corta silêncio de fato), desacoplado dos
timestamps do roteiro. ffmpeg via binário; whisper local; Fal só na thumbnail opcional.

**Tech Stack:** Node ≥18 ESM (ZERO deps), `node --test`. ffmpeg (instalado, 8.1.1) via
`execFileSync`. whisper local (CLI configurável). Reusa convenção de escape de fonte do
`gerar-video.mjs` e a trava dry-run/`--confirmar` do `publicar-instagram.mjs`.

---

## Task 1: Scaffolding de `canal-youtube/edicao/`

**Files:**
- Create: `canal-youtube/edicao/.gitkeep`
- Create: `canal-youtube/edicao/templates/.gitkeep`
- Create: `canal-youtube/edicao/README.md`

- [ ] **Step 1: Criar os diretórios e o README**

```bash
mkdir -p canal-youtube/edicao/templates
touch canal-youtube/edicao/.gitkeep canal-youtube/edicao/templates/.gitkeep
```

- [ ] **Step 2: Escrever `canal-youtube/edicao/README.md`**

```markdown
# Edição — saídas e templates do canal

> Cada vídeo editado vive em `edicao/<slug>/` (final.mp4, legenda.srt, thumb-frame.png,
> thumb-fal.png). Gerado por `/editar-video` (scripts editar-video.mjs + gerar-thumbnail.mjs).

`templates/` guarda os bumpers de marca usados em todo vídeo:
- `intro.mp4` — abertura curta (~2-3s, logo+título). Opcional: sem ele, o vídeo sai sem intro.
- `outro.mp4` — fecho (~3-5s, CTA/inscreva-se). Opcional.

Dependências: **ffmpeg** (render) e **whisper** local (legenda). Faltando, o
`/editar-video` guia a instalação. WHISPER_BIN/WHISPER_MODEL/WHISPER_IDIOMA no `.env` (opcionais).
```

- [ ] **Step 3: Commit**

```bash
git add canal-youtube/edicao/
git commit -m "feat(edicao): scaffolding canal-youtube/edicao (saídas + templates de marca)"
```

---

## Task 2: `lib-edicao.mjs` — `parseSilencedetect` + `segmentosManter`

**Files:**
- Create: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSilencedetect, segmentosManter } from "./lib-edicao.mjs";

const SAIDA = `
[silencedetect @ 0x1] silence_start: 2.5
[silencedetect @ 0x1] silence_end: 4.0 | silence_duration: 1.5
[silencedetect @ 0x1] silence_start: 9.0
[silencedetect @ 0x1] silence_end: 9.3 | silence_duration: 0.3
`;

test("parseSilencedetect pareia start/end de cada silêncio", () => {
  const sil = parseSilencedetect(SAIDA);
  assert.deepEqual(sil, [
    { start: 2.5, end: 4.0 },
    { start: 9.0, end: 9.3 },
  ]);
});

test("segmentosManter inverte os silêncios >= minSilencio e aplica folga de borda", () => {
  // total 12s; só o silêncio de 1.5s (>=0.8) é cortado; o de 0.3s fica.
  // folga 0.15: o silêncio [2.5,4.0] removido vira [2.65,3.85] => keeps: [0,2.65] e [3.85,12]
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
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-edicao.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
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
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-edicao.test.mjs` → 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): parseSilencedetect + segmentosManter (corte de silêncio determinístico)"
```

---

## Task 3: `lib-edicao.mjs` — `filtroCorteConcat` + `planoCorte`

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Modify: `scripts/lib-edicao.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { filtroCorteConcat, planoCorte } from "./lib-edicao.mjs";

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

test("planoCorte resume duração depois e quanto foi removido", () => {
  const p = planoCorte([{ inicio: 0, fim: 2.65 }, { inicio: 3.85, fim: 12 }], 12);
  assert.equal(p.cortes, 1);
  assert.equal(Math.round(p.duracaoDepois * 100) / 100, 10.8);
  assert.equal(Math.round(p.percentRemovido), 10);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-edicao.test.mjs` → FAIL (funções não exportadas).

- [ ] **Step 3: Write minimal implementation**

```javascript
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
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-edicao.test.mjs` → 5 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): filtroCorteConcat + planoCorte (costura ffmpeg + resumo dry-run)"
```

---

## Task 4: `lib-edicao.mjs` — `montarSRT`

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Modify: `scripts/lib-edicao.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { montarSRT } from "./lib-edicao.mjs";

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
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-edicao.test.mjs` → FAIL (`montarSRT` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
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
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-edicao.test.mjs` → 7 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): montarSRT (palavras com timestamp -> legenda .srt)"
```

---

## Task 5: `lib-edicao.mjs` — `filtroLegenda` + `argsThumbnailFrameTexto`

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Modify: `scripts/lib-edicao.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { filtroLegenda, argsThumbnailFrameTexto } from "./lib-edicao.mjs";

test("filtroLegenda escapa o caminho do .srt no padrão Windows e aplica estilo", () => {
  const f = filtroLegenda({ srtCaminho: "C:\\v\\legenda.srt", tamanho: 48, contorno: 3 });
  assert.equal(f, "subtitles='C\\:/v/legenda.srt':force_style='Fontsize=48,Outline=3'");
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
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-edicao.test.mjs` → FAIL (funções não exportadas).

- [ ] **Step 3: Write minimal implementation**

```javascript
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
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-edicao.test.mjs` → 9 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): filtroLegenda + argsThumbnailFrameTexto (queima de legenda e capa)"
```

---

## Task 6: `transcrever-local.mjs` — parsing da saída do whisper

**Files:**
- Create: `scripts/transcrever-local.mjs`
- Test: `scripts/transcrever-local.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseWhisperJson } from "./transcrever-local.mjs";

test("parseWhisperJson extrai palavras com timestamp dos segments", () => {
  const obj = { segments: [
    { start: 0, end: 1, text: " oi pessoal", words: [
      { word: " oi", start: 0.0, end: 0.4 },
      { word: " pessoal", start: 0.4, end: 0.9 },
    ] },
  ] };
  assert.deepEqual(parseWhisperJson(obj), [
    { inicio: 0.0, fim: 0.4, texto: "oi" },
    { inicio: 0.4, fim: 0.9, texto: "pessoal" },
  ]);
});

test("parseWhisperJson cai pra blocos de segment quando não há words", () => {
  const obj = { segments: [{ start: 0, end: 2, text: " bloco unico " }] };
  assert.deepEqual(parseWhisperJson(obj), [{ inicio: 0, fim: 2, texto: "bloco unico" }]);
});

test("parseWhisperJson devolve [] sem segments", () => {
  assert.deepEqual(parseWhisperJson({}), []);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/transcrever-local.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
#!/usr/bin/env node
/**
 * transcrever-local.mjs — transcreve um áudio com whisper LOCAL (grátis, offline). Devolve
 * palavras com timestamp pra legenda. WHISPER_BIN/WHISPER_MODEL/WHISPER_IDIOMA no .env
 * (defaults: whisper / small / pt). Erro guiado se o binário não existir. ImpulsoX AI.
 *
 * Uso: node scripts/transcrever-local.mjs <audio> [--json saida.json]
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Normaliza a saída JSON do whisper (openai-whisper word_timestamps) em palavras.
export function parseWhisperJson(obj) {
  const palavras = [];
  for (const seg of obj.segments || []) {
    for (const w of seg.words || []) {
      palavras.push({ inicio: w.start, fim: w.end, texto: String(w.word || "").trim() });
    }
  }
  if (palavras.length === 0) {
    for (const seg of obj.segments || []) {
      palavras.push({ inicio: seg.start, fim: seg.end, texto: String(seg.text || "").trim() });
    }
  }
  return palavras;
}

// Roda o whisper local e devolve as palavras. `exec` injetável pra teste.
export function transcrever(audio, { bin, modelo, idioma, exec = execFileSync } = {}) {
  const whisperBin = bin || process.env.WHISPER_BIN || "whisper";
  const whisperModelo = modelo || process.env.WHISPER_MODEL || "small";
  const whisperIdioma = idioma || process.env.WHISPER_IDIOMA || "pt";
  const dir = mkdtempSync(join(tmpdir(), "whisper-"));
  try {
    exec(whisperBin, [
      audio, "--model", whisperModelo, "--language", whisperIdioma,
      "--word_timestamps", "True", "--output_format", "json", "--output_dir", dir,
    ], { stdio: "pipe" });
  } catch (e) {
    if (e.code === "ENOENT") {
      throw new Error(`whisper não encontrado ('${whisperBin}'). Instale (ex: pip install -U openai-whisper) ou aponte WHISPER_BIN no .env.`);
    }
    throw new Error(`whisper falhou: ${String(e.message).slice(0, 200)}`);
  }
  const nome = audio.split(/[\\/]/).pop().replace(/\.[^.]+$/, "");
  const jsonPath = join(dir, `${nome}.json`);
  if (!existsSync(jsonPath)) throw new Error("whisper rodou mas não gerou o JSON esperado.");
  return parseWhisperJson(JSON.parse(readFileSync(jsonPath, "utf8")));
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const audio = process.argv[2];
  const i = process.argv.indexOf("--json");
  if (!audio) falhar("informe o arquivo de áudio.");
  try {
    const palavras = transcrever(audio);
    const saida = JSON.stringify(palavras, null, 2);
    if (i !== -1 && process.argv[i + 1]) writeFileSync(process.argv[i + 1], saida);
    else console.log(saida);
  } catch (e) { falhar(e.message); }
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/transcrever-local.test.mjs` → 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/transcrever-local.mjs scripts/transcrever-local.test.mjs
git commit -m "feat(edicao): transcrever-local — whisper local com erro guiado e parsing testável"
```

---

## Task 7: `editar-video.mjs` — orquestrador (dry-run + `--confirmar`)

**Files:**
- Create: `scripts/editar-video.mjs`
- Test: `scripts/editar-video.test.mjs`

- [ ] **Step 1: Write the failing test** (testa só a função pura de plano, sem rodar ffmpeg)

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { montarPlanoDryRun } from "./editar-video.mjs";

test("montarPlanoDryRun resume corte, duração e arquivos de saída", () => {
  const saidaSil = `
[silencedetect @ 0x1] silence_start: 2.5
[silencedetect @ 0x1] silence_end: 4.0 | silence_duration: 1.5
`;
  const plano = montarPlanoDryRun({ saidaSilencedetect: saidaSil, duracaoTotal: 12, slug: "demo", minSilencio: 0.8 });
  assert.equal(plano.dry_run, true);
  assert.equal(plano.cortes, 1);
  // silêncio 1.5s − 2×0.15 de folga = 1.2s removido de 12s = 10%
  assert.equal(Math.round(plano.percentRemovido), 10);
  assert.deepEqual(plano.saidas, ["canal-youtube/edicao/demo/final.mp4", "canal-youtube/edicao/demo/legenda.srt"]);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/editar-video.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
#!/usr/bin/env node
/**
 * editar-video.mjs — edita a gravação crua do long-form: corta silêncio, transcreve
 * (whisper local), queima legenda + gera .srt, cola intro/outro da marca, renderiza 16:9.
 * Dry-run por padrão; --confirmar renderiza. ImpulsoX AI. ffmpeg via binário.
 *
 * Uso: node scripts/editar-video.mjs --video bruto.mp4 --slug demo [--min-silencio 0.8]
 *        [--tela tela.mp4 --voz voz.wav] [--sem-intro] [--confirmar]
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { segmentosManter, filtroCorteConcat, planoCorte, montarSRT, filtroLegenda } from "./lib-edicao.mjs";
import { transcrever } from "./transcrever-local.mjs";
import { registrarPasso } from "./registrar-passo.mjs";

const FFMPEG = process.env.FFMPEG_BIN || "ffmpeg";

// Resumo do dry-run a partir da saída do silencedetect — função pura, testável.
export function montarPlanoDryRun({ saidaSilencedetect, duracaoTotal, slug, minSilencio = 0.8 }) {
  const seg = segmentosManter(saidaSilencedetect, { minSilencio, duracaoTotal });
  const p = planoCorte(seg, duracaoTotal);
  const base = `canal-youtube/edicao/${slug}`;
  return { dry_run: true, slug, ...p, segmentos: seg.length, saidas: [`${base}/final.mp4`, `${base}/legenda.srt`] };
}

// Roda silencedetect e devolve {saida, duracaoTotal}. Isola a chamada de rede/disco.
function detectarSilencio(video, minSilencio) {
  const saida = execFileSync(FFMPEG, [
    "-i", video, "-af", `silencedetect=noise=-30dB:d=${minSilencio}`, "-f", "null", "-",
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const md = saida.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  const duracaoTotal = md ? Number(md[1]) * 3600 + Number(md[2]) * 60 + Number(md[3]) : 0;
  return { saida, duracaoTotal };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const slug = flag("--slug");
  const video = flag("--video") || flag("--tela");
  const voz = flag("--voz");
  const minSilencio = Number(flag("--min-silencio")) || 0.8;
  const confirmar = has("--confirmar");
  const semIntro = has("--sem-intro");

  if (!slug) falhar("informe --slug <nome>.");
  if (!video) falhar("informe --video <arquivo> (ou --tela + --voz).");
  if (!existsSync(video)) falhar(`arquivo não encontrado: ${video}`);
  try { execFileSync(FFMPEG, ["-version"], { stdio: "ignore" }); }
  catch { falhar("ffmpeg não encontrado no PATH. Instale o ffmpeg pra editar vídeo."); }

  const { saida, duracaoTotal } = detectarSilencio(video, minSilencio);
  if (duracaoTotal < 10) falhar(`gravação curta demais (${duracaoTotal.toFixed(1)}s) — confira o arquivo.`);

  if (!confirmar) {
    console.log(JSON.stringify({ ...montarPlanoDryRun({ saidaSilencedetect: saida, duracaoTotal, slug, minSilencio }),
      nota: "rode de novo com --confirmar pra renderizar de verdade." }, null, 2));
    process.exit(0);
  }

  (async () => {
    const base = join("canal-youtube", "edicao", slug);
    mkdirSync(base, { recursive: true });
    const cortado = join(base, "_cortado.mp4");
    const tmpSrt = join(base, "legenda.srt");
    const final = join(base, "final.mp4");
    try {
      registrarPasso({ skill: "/editar-video", etapa: "cortando silêncio", status: "inicio" });
      const seg = segmentosManter(saida, { minSilencio, duracaoTotal });
      execFileSync(FFMPEG, ["-y", "-i", video, "-filter_complex", filtroCorteConcat(seg),
        "-map", "[vout]", "-map", "[aout]", cortado], { stdio: "inherit" });

      registrarPasso({ skill: "/editar-video", etapa: "transcrevendo (whisper local)", status: "inicio" });
      let temLegenda = false;
      try {
        const palavras = transcrever(voz || cortado);
        if (palavras.length) { writeFileSync(tmpSrt, montarSRT(palavras)); temLegenda = true; }
      } catch (e) { console.error("AVISO: legenda pulada — " + e.message); }

      const corpo = temLegenda ? join(base, "_legendado.mp4") : cortado;
      if (temLegenda) {
        execFileSync(FFMPEG, ["-y", "-i", cortado, "-vf", filtroLegenda({ srtCaminho: tmpSrt }),
          "-c:a", "copy", corpo], { stdio: "inherit" });
      }

      const intro = join("canal-youtube", "edicao", "templates", "intro.mp4");
      const outro = join("canal-youtube", "edicao", "templates", "outro.mp4");
      const partes = [];
      if (!semIntro && existsSync(intro)) partes.push(intro);
      partes.push(corpo);
      if (!semIntro && existsSync(outro)) partes.push(outro);
      if (partes.length > 1) {
        const lista = join(base, "_concat.txt");
        writeFileSync(lista, partes.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n"));
        execFileSync(FFMPEG, ["-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", final], { stdio: "inherit" });
        rmSync(lista, { force: true });
      } else {
        execFileSync(FFMPEG, ["-y", "-i", corpo, "-c", "copy", final], { stdio: "inherit" });
      }

      registrarPasso({ skill: "/editar-video", etapa: `vídeo pronto: ${final}`, status: "ok" });
      console.log(JSON.stringify({ ok: true, slug, final, srt: temLegenda ? tmpSrt : null }, null, 2));
    } catch (e) {
      registrarPasso({ skill: "/editar-video", etapa: "falha ao editar vídeo", status: "erro" });
      falhar(e.message);
    }
  })();
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/editar-video.test.mjs` → 1 PASS. Depois `node --check scripts/editar-video.mjs` → sem erro.

- [ ] **Step 5: Commit**

```bash
git add scripts/editar-video.mjs scripts/editar-video.test.mjs
git commit -m "feat(edicao): editar-video.mjs — orquestrador dry-run/--confirmar (corte+legenda+intro/outro)"
```

---

## Task 8: `gerar-thumbnail.mjs` — frame+texto (sempre) + Fal (preview/confirmar)

**Files:**
- Create: `scripts/gerar-thumbnail.mjs`
- Test: `scripts/gerar-thumbnail.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { argsExtrairFrame, planoFal } from "./gerar-thumbnail.mjs";

test("argsExtrairFrame pega 1 frame no tempo dado", () => {
  assert.deepEqual(argsExtrairFrame("v.mp4", 3, "frame.png"), [
    "-y", "-ss", "3", "-i", "v.mp4", "-frames:v", "1", "frame.png",
  ]);
});

test("planoFal monta o preview sem chamar a Fal (só com --confirmar gera)", () => {
  const p = planoFal({ conceito: "terminal com brilho neon", slug: "demo" });
  assert.equal(p.dry_run, true);
  assert.match(p.prompt, /terminal com brilho neon/);
  assert.equal(p.saida, "canal-youtube/edicao/demo/thumb-fal.png");
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/gerar-thumbnail.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
#!/usr/bin/env node
/**
 * gerar-thumbnail.mjs — capa do vídeo. SEMPRE gera a versão frame+texto (ffmpeg,
 * determinística, on-brand). Com --fal, mostra o preview do plano e só gera por IA
 * (gerar-imagem.mjs) com --confirmar (não gasta sem confirmar). ImpulsoX AI.
 *
 * Uso: node scripts/gerar-thumbnail.mjs --slug demo --texto "POSTA SOZINHO" \
 *        [--frame 3 | --frame capa.png] [--video bruto.mp4] [--fonte caminho.ttf]
 *        [--fal --conceito "..." [--confirmar]]
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { argsThumbnailFrameTexto } from "./lib-edicao.mjs";

const FFMPEG = process.env.FFMPEG_BIN || "ffmpeg";

// Args do ffmpeg pra extrair 1 frame de um vídeo no tempo `seg` (segundos).
export function argsExtrairFrame(video, seg, saida) {
  return ["-y", "-ss", String(seg), "-i", video, "-frames:v", "1", saida];
}

// Preview do plano da thumbnail por IA — NÃO chama a Fal (isso é só com --confirmar).
export function planoFal({ conceito, slug }) {
  return {
    dry_run: true,
    prompt: `Thumbnail de YouTube, alto contraste, 1 sujeito dominante: ${conceito}. Sem texto na imagem.`,
    saida: `canal-youtube/edicao/${slug}/thumb-fal.png`,
    nota: "rode com --confirmar pra gerar via Fal (tem custo).",
  };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const slug = flag("--slug");
  const texto = flag("--texto");
  const fonte = flag("--fonte") || join("marca", "fontes", "display.ttf");
  if (!slug) falhar("informe --slug <nome>.");

  const base = join("canal-youtube", "edicao", slug);
  mkdirSync(base, { recursive: true });

  // 1) versão frame+texto (sempre), se houver texto e um frame/vídeo de origem
  const frameArg = flag("--frame");
  const video = flag("--video");
  if (texto && (frameArg || video)) {
    let frame = frameArg && frameArg.endsWith(".png") ? frameArg : join(base, "_frame.png");
    if (!(frameArg && frameArg.endsWith(".png"))) {
      const seg = Number(frameArg) || 1;
      if (!video) falhar("pra extrair frame por tempo, passe --video.");
      execFileSync(FFMPEG, argsExtrairFrame(video, seg, frame), { stdio: "ignore" });
    }
    const saidaFrame = join(base, "thumb-frame.png");
    execFileSync(FFMPEG, argsThumbnailFrameTexto({ frame, texto, fonte, saida: saidaFrame }), { stdio: "ignore" });
    console.log(`thumb frame+texto: ${saidaFrame}`);
  }

  // 2) alternativa Fal (preview por padrão; gera só com --confirmar)
  if (has("--fal")) {
    const conceito = flag("--conceito") || texto || "";
    const plano = planoFal({ conceito, slug });
    if (!has("--confirmar")) { console.log(JSON.stringify(plano, null, 2)); process.exit(0); }
    const saidaFal = join(base, "thumb-fal.png");
    try {
      execFileSync("node", [join("scripts", "gerar-imagem.mjs"), plano.prompt, "--saida", saidaFal], { stdio: "inherit" });
      console.log(`thumb Fal: ${saidaFal}`);
    } catch (e) { falhar("geração Fal falhou: " + e.message); }
  }
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/gerar-thumbnail.test.mjs` → 2 PASS. Depois `node --check scripts/gerar-thumbnail.mjs` → sem erro.

- [ ] **Step 5: Commit**

```bash
git add scripts/gerar-thumbnail.mjs scripts/gerar-thumbnail.test.mjs
git commit -m "feat(edicao): gerar-thumbnail.mjs — frame+texto sempre, Fal sob preview/--confirmar"
```

---

## Task 9: Skill nova `/editar-video`

**Files:**
- Create: `.claude/skills/editar-video/SKILL.md`

- [ ] **Step 1: Criar o arquivo da skill**

```markdown
---
name: editar-video
description: >
  Use pra editar a gravação crua do vídeo do canal YouTube — "/editar-video", "edita esse
  vídeo", "corta o silêncio e põe legenda", "monta o vídeo pra subir", ou depois de gravar
  a tela seguindo um roteiro do /roteiro-yt. Corta silêncio, gera legenda (queimada +
  .srt), cola intro/outro da marca, renderiza o long-form 16:9 e monta a thumbnail.
---

# /editar-video — Edição automática do long-form

Transforma a gravação crua em vídeo publicável sem horas de edição. Automatiza o que é
regra (corte de silêncio, legenda, intro/outro, render, thumbnail); o que é direção
criativa fica com o dono. Trabalha sobre a gravação real, não sobre os timestamps do
roteiro (o corte muda os tempos).

Autoria: ImpulsoX AI. Conteúdo original.

## Pré-checagem

1. **A gravação existe?** Pedir o caminho do arquivo (um .mp4 com tela+voz, ou tela + voz
   separados). Sem arquivo, não há o que editar.
2. **ffmpeg e whisper instalados?** Na primeira falha, guiar a instalação (ffmpeg pro
   render; whisper local pra legenda). Sem whisper, o vídeo sai sem legenda queimada — avisar.
3. **Slug do vídeo?** Nome curto pra pasta de saída (`canal-youtube/edicao/<slug>/`).

## Fluxo

1. **Dry-run primeiro.** Rodar `node scripts/editar-video.mjs --video <arq> --slug <slug>`
   (sem `--confirmar`) — mostra o plano: duração depois do corte, nº de cortes, % removido.
   Traduzir pro dono em linguagem simples ("vou tirar 1min30 de pausas, sobra 8min").
2. **Com OK, renderizar.** Rodar de novo com `--confirmar`. Gera `final.mp4` +
   `legenda.srt` em `canal-youtube/edicao/<slug>/`.
3. **Thumbnail.** Rodar `node scripts/gerar-thumbnail.mjs --slug <slug> --texto "<=5
   palavras>" --video <arq> --frame <tempo>` → `thumb-frame.png`. Oferecer a alternativa
   por IA (`--fal --conceito "<conceito do /roteiro-yt>"`) — **avisar do custo** e só rodar
   `--confirmar` com o aval do dono.
4. **Apontar os arquivos** e sugerir `/revisar` antes do upload (Fase 3).

## Templates de marca

`canal-youtube/edicao/templates/intro.mp4` e `outro.mp4` (opcionais) entram em todo vídeo.
Sem eles, o vídeo sai sem bumper — avisar uma vez e seguir.

## Regras

- Dry-run antes de renderizar — o dono vê quanto vai cortar antes de gastar tempo de CPU.
- Corte só de silêncio (determinístico) — nunca decide o que é "erro" de fala.
- Custo Fal (thumbnail por IA) só com confirmação explícita; a versão frame+texto é grátis.
- Legenda local (whisper) tem custo zero. Falhou a transcrição → vídeo sai sem legenda
  queimada, com aviso — não trava o render.
- Vídeo é pra ser revisado pelo dono antes do upload — esta skill entrega o arquivo, não publica.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/editar-video/SKILL.md
git commit -m "feat(editar-video): skill nova — orquestra a edição em linguagem de leigo"
```

---

## Task 10: Documentar dependências (`.env.example` + `docs/ferramentas.md`)

**Files:**
- Modify: `.env.example`
- Modify: `docs/ferramentas.md`

- [ ] **Step 1: Acrescentar as variáveis ao `.env.example`**

Acrescentar ao fim do `.env.example`:

```
# Edição de vídeo (Fase 2) — whisper local; todas opcionais (têm default)
WHISPER_BIN=
WHISPER_MODEL=
WHISPER_IDIOMA=
FFMPEG_BIN=
```

- [ ] **Step 2: Adicionar bloco em `docs/ferramentas.md`**

Adicionar uma seção descrevendo o pipeline de edição (Fase 2): scripts `editar-video.mjs`,
`gerar-thumbnail.mjs`, `transcrever-local.mjs`, `lib-edicao.mjs`; dependências ffmpeg +
whisper local; trava dry-run/`--confirmar`; saídas em `canal-youtube/edicao/<slug>/`; custo
zero exceto thumbnail Fal opcional. Seguir o formato dos blocos existentes do arquivo (ler
um bloco vizinho antes de escrever pra casar o estilo).

- [ ] **Step 3: Commit**

```bash
git add .env.example docs/ferramentas.md
git commit -m "docs(edicao): .env.example (whisper/ffmpeg) + bloco de ferramentas da Fase 2"
```

---

## Task 11: Verificação final

**Files:** nenhum novo — só validação.

- [ ] **Step 1: Sintaxe de todos os scripts novos**

```bash
node --check scripts/lib-edicao.mjs && \
node --check scripts/transcrever-local.mjs && \
node --check scripts/editar-video.mjs && \
node --check scripts/gerar-thumbnail.mjs
```

Esperado: sem saída (sucesso).

- [ ] **Step 2: Suíte completa da Fase 2**

```bash
node --test scripts/lib-edicao.test.mjs scripts/transcrever-local.test.mjs scripts/editar-video.test.mjs scripts/gerar-thumbnail.test.mjs
```

Esperado: todos `pass`, `0 fail`.

- [ ] **Step 3: Confirmar que nenhum teste roda ffmpeg/whisper/Fal de verdade**

```bash
grep -rn "execFileSync\|spawn\|fetch(" scripts/lib-edicao.test.mjs scripts/transcrever-local.test.mjs scripts/editar-video.test.mjs scripts/gerar-thumbnail.test.mjs
```

Esperado: nenhuma ocorrência (todos os testes batem só nas funções puras).

- [ ] **Step 4: Smoke test manual opcional (gravação real, fora do CI)**

Quando o dono tiver uma gravação de teste:
```bash
node scripts/editar-video.mjs --video <gravacao.mp4> --slug teste
```
Esperado: o plano do dry-run (duração depois, nº de cortes, % removido) impresso, sem
renderizar. Com `--confirmar`, gera `canal-youtube/edicao/teste/final.mp4`.
