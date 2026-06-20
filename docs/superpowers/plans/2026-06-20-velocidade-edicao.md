# Velocidade na Edição — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-segment editing (accelerate / cut-out / keep-1x) to `editar-video`, driven by a `plano-edicao.json` contract, so a long call becomes a postable highlight reel with natural voice.

**Architecture:** Pure functions in `scripts/lib-edicao.mjs` build the ffmpeg filtergraph and the dry-run summary; `scripts/editar-video.mjs` orchestrates (silence-cut first, then speed). Mirrors the existing `filtroCorteConcat` / `planoCorte` / dry-run pattern. New ffmpeg primitives: `setpts=PTS/N` (video speed), `atempo` (audio speed, pitch-safe), muted-audio per segment.

**Tech Stack:** Node ESM (`.mjs`), `node:test` + `node:assert/strict`, ffmpeg via binary (`FFMPEG_BIN` env). Windows-only MVP.

**Spec:** `docs/superpowers/specs/2026-06-20-velocidade-edicao-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `scripts/lib-edicao.mjs` | Pure functions: parse tabela, normalize trechos, build speed filtergraph, dry-run summary | Modify (add 4 functions) |
| `scripts/lib-edicao.test.mjs` | Unit tests for the new pure functions | Modify (add tests) |
| `scripts/editar-video.mjs` | Orchestration: `--plano`, `--sem-corte-silencio`, silence→speed order, dry-run/render | Modify |
| `scripts/editar-video.test.mjs` | Test for `montarPlanoDryRun` extension (speed plan) | Modify |
| `.claude/skills/editar-video/SKILL.md` | Document the new per-segment editing + dry-run flow | Modify |

**Data contract (`plano-edicao.json`):**
```json
{
  "trechos": [
    { "inicio": 0,    "fim": 120,  "acao": "cortar" },
    { "inicio": 120,  "fim": 480,  "acao": "manter" },
    { "inicio": 480,  "fim": 2100, "acao": "acelerar", "fator": 2, "audio": "mudo" },
    { "inicio": 2100, "fim": 2400, "acao": "manter" }
  ]
}
```
- `acao` ∈ `manter | acelerar | cortar`. `acelerar` requires `fator > 1` and `audio` ∈ `voz | mudo`.

---

## Task 1: `parseTrechosTabela` — parse a tabela de tempos into trechos

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

Parses human-typed lines like `08:00-35:00 2x mudo` or `00:00-02:00 cortar` into trecho objects. Accepts `-`, `–`, or `a` as range separator; `mm:ss` or `hh:mm:ss`; speed as `2x`/`1.5x`; optional `voz`/`mudo` (default `voz`).

- [ ] **Step 1: Write the failing test**

In `scripts/lib-edicao.test.mjs`, add `parseTrechosTabela` to the import list (line 3-7) and append:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `parseTrechosTabela is not a function` / import error.

- [ ] **Step 3: Write minimal implementation**

In `scripts/lib-edicao.mjs`, append:

```javascript
// --- Fase 1: velocidade (edição por trechos) ---

// "mm:ss" ou "hh:mm:ss" -> segundos.
function tempoParaSeg(t) {
  const partes = t.split(":").map(Number);
  return partes.reduce((acc, n) => acc * 60 + n, 0);
}

// Parseia a tabela de tempos digitada pelo dono em trechos.
// Linha: "<inicio><sep><fim> <acao>" onde sep ∈ {-, –, a}, acao ∈ {cortar, manter, <N>x [voz|mudo]}.
export function parseTrechosTabela(texto) {
  const trechos = [];
  for (const linhaRaw of String(texto).split("\n")) {
    const linha = linhaRaw.trim();
    if (!linha) continue;
    const m = linha.match(/^([\d:]+)\s*(?:-|–|a)\s*([\d:]+)\s+(.+)$/i);
    if (!m) continue;
    const inicio = tempoParaSeg(m[1]);
    const fim = tempoParaSeg(m[2]);
    const resto = m[3].trim().toLowerCase();
    if (resto === "cortar") { trechos.push({ inicio, fim, acao: "cortar" }); continue; }
    if (resto === "manter") { trechos.push({ inicio, fim, acao: "manter" }); continue; }
    const mv = resto.match(/^([\d.]+)x(?:\s+(voz|mudo))?$/);
    if (mv) {
      trechos.push({ inicio, fim, acao: "acelerar", fator: Number(mv[1]), audio: mv[2] || "voz" });
    }
  }
  return trechos;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: PASS (all three new tests green, existing tests still green).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): parseTrechosTabela — tabela de tempos -> trechos

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `normalizarTrechos` — sort, validate, fill gaps with `manter`

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

Sorts trechos by `inicio`, rejects overlaps, clamps to `[0, duracaoTotal]`, and fills any uncovered gap with a `manter` trecho (spec §3.1: nothing disappears without an explicit rule).

- [ ] **Step 1: Write the failing test**

Add `normalizarTrechos` to the import list and append:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `normalizarTrechos is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-edicao.mjs`:

```javascript
// Ordena, valida sobreposição, clampa em [0, total] e preenche buracos com "manter".
// Garante cobertura contínua de 0 a duracaoTotal — nada some sem regra explícita.
export function normalizarTrechos(trechos, duracaoTotal) {
  const ordenados = [...trechos]
    .map((t) => ({ ...t, inicio: Math.max(0, t.inicio), fim: Math.min(duracaoTotal, t.fim) }))
    .filter((t) => t.fim > t.inicio)
    .sort((a, b) => a.inicio - b.inicio);

  for (let i = 1; i < ordenados.length; i++) {
    if (ordenados[i].inicio < ordenados[i - 1].fim) {
      throw new Error(`trechos se sobrepõem: ${ordenados[i - 1].fim} > ${ordenados[i].inicio}`);
    }
  }

  const out = [];
  let cursor = 0;
  for (const t of ordenados) {
    if (t.inicio > cursor) out.push({ inicio: cursor, fim: t.inicio, acao: "manter" });
    out.push(t);
    cursor = t.fim;
  }
  if (cursor < duracaoTotal) out.push({ inicio: cursor, fim: duracaoTotal, acao: "manter" });
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): normalizarTrechos — ordena, valida, preenche buracos

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `planoVelocidade` — dry-run summary (duration, counts, warnings)

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

Computes the final duration after applying all trechos, counts per action, and emits an `avisos` array when a `acelerar` trecho has `fator > 2` with `audio: "voz"` (spec §2: warn but obey). Mirrors `planoCorte` (line 51).

- [ ] **Step 1: Write the failing test**

Add `planoVelocidade` to imports and append:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `planoVelocidade is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-edicao.mjs`:

```javascript
// Resumo pro dry-run da velocidade: duração final, contagem por ação, avisos (>2x com voz).
export function planoVelocidade(trechos, duracaoTotal) {
  const contagem = { manter: 0, acelerar: 0, cortar: 0 };
  const avisos = [];
  let duracaoFinal = 0;
  for (const t of trechos) {
    contagem[t.acao] = (contagem[t.acao] || 0) + 1;
    const dur = t.fim - t.inicio;
    if (t.acao === "manter") duracaoFinal += dur;
    else if (t.acao === "acelerar") {
      duracaoFinal += dur / t.fator;
      if (t.audio === "voz" && t.fator > 2) {
        avisos.push(`trecho ${t.inicio}-${t.fim}s a ${t.fator}x com voz: pode ficar difícil de entender.`);
      }
    }
  }
  return {
    duracaoFinal,
    duracaoTotal,
    contagem,
    avisos,
    percentReduzido: duracaoTotal > 0 ? ((duracaoTotal - duracaoFinal) / duracaoTotal) * 100 : 0,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): planoVelocidade — resumo do dry-run + avisos >2x voz

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `filtroVelocidadeConcat` — build the ffmpeg filtergraph

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

Turns the normalized trechos into a `-filter_complex` string. For each non-`cortar` trecho: trim video+audio, apply `setpts=PTS/fator` (video) and `atempo` chain (voz) or silence (mudo), then concat all kept segments. Mirrors `filtroCorteConcat` (line 38). Cut trechos are simply skipped.

- [ ] **Step 1: Write the failing test**

Add `filtroVelocidadeConcat` + helper `cadeiaAtempo` to imports and append:

```javascript
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
  // dois segmentos mantidos no concat (cortar foi pulado)
  assert.match(f, /concat=n=2:v=1:a=1\[vout\]\[aout\]/);
  // trecho mantido: setpts simples, áudio preservado
  assert.match(f, /trim=start=100:end=160,setpts=PTS-STARTPTS\[v0\]/);
  // trecho acelerado: setpts dividido pelo fator
  assert.match(f, /trim=start=160:end=220,setpts=PTS\/2,setpts=PTS-STARTPTS\[v1\]/);
  // áudio mudo: gerado por volume=0 sobre o trecho
  assert.match(f, /volume=0/);
});

test("filtroVelocidadeConcat: acelerar voz usa atempo", () => {
  const trechos = [{ inicio: 0, fim: 60, acao: "acelerar", fator: 2, audio: "voz" }];
  const f = filtroVelocidadeConcat(trechos);
  assert.match(f, /atempo=2/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `filtroVelocidadeConcat is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-edicao.mjs`:

```javascript
// Encadeia atempo (cada filtro vale até 2x; >2 multiplica em série mantendo o pitch).
export function cadeiaAtempo(fator) {
  const fatores = [];
  let restante = fator;
  while (restante > 2) { fatores.push(2); restante /= 2; }
  fatores.push(Number(restante.toFixed(6)));
  return fatores.map((f) => `atempo=${f}`).join(",");
}

// Filtergraph do ffmpeg pra edição por trechos: pula "cortar", acelera/mantém o resto e
// concatena. Vídeo via setpts; áudio via atempo (voz, pitch-safe) ou volume=0 (mudo).
// Espelha filtroCorteConcat: cada segmento mantido vira [vN]/[aN], depois concat.
export function filtroVelocidadeConcat(trechos, { loudnorm } = {}) {
  const mantidos = trechos.filter((t) => t.acao !== "cortar");
  const partes = [];
  mantidos.forEach((t, i) => {
    const acel = t.acao === "acelerar";
    const setptsV = acel ? `setpts=PTS/${t.fator},setpts=PTS-STARTPTS` : "setpts=PTS-STARTPTS";
    partes.push(`[0:v]trim=start=${t.inicio}:end=${t.fim},${setptsV}[v${i}]`);
    if (acel && t.audio === "mudo") {
      partes.push(`[0:a]atrim=start=${t.inicio}:end=${t.fim},asetpts=PTS-STARTPTS,volume=0[a${i}]`);
    } else if (acel) {
      partes.push(`[0:a]atrim=start=${t.inicio}:end=${t.fim},asetpts=PTS-STARTPTS,${cadeiaAtempo(t.fator)}[a${i}]`);
    } else {
      partes.push(`[0:a]atrim=start=${t.inicio}:end=${t.fim},asetpts=PTS-STARTPTS[a${i}]`);
    }
  });
  const labels = mantidos.map((_, i) => `[v${i}][a${i}]`).join("");
  const saidaAudio = loudnorm ? "[acat]" : "[aout]";
  const concat = `${labels}concat=n=${mantidos.length}:v=1:a=1[vout]${saidaAudio}`;
  const norm = loudnorm ? `;[acat]${loudnorm}[aout]` : "";
  return `${partes.join(";")};${concat}${norm}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): filtroVelocidadeConcat + cadeiaAtempo — filtergraph por trechos

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Orchestration — wire `--plano` and `--sem-corte-silencio` into `editar-video.mjs`

**Files:**
- Modify: `scripts/editar-video.mjs`
- Test: `scripts/editar-video.test.mjs`

Adds `--plano <file>` (a `plano-edicao.json`) and `--sem-corte-silencio`. Order: silence-cut (unless disabled) → speed. Dry-run prints both the silence plan (when active) and `planoVelocidade`. Trecho times are referenced against the **raw** video (spec §6 proposal): the speed pass reads `_cortado.mp4` when silence-cut ran, else the raw — times are remapped by the pipeline by applying speed to the post-cut file. For the MVP, when `--plano` is given **with** silence-cut, document that trecho times refer to the raw timeline and the cut is applied first; the speed filter operates on the cut output using proportionally-unchanged absolute trecho boundaries clamped to the cut duration. (Simplest correct behavior: if `--plano` is used, default `--sem-corte-silencio` ON unless the user explicitly cuts — see Step 3 guard.)

- [ ] **Step 1: Write the failing test**

In `scripts/editar-video.test.mjs`, add a test that the dry-run summary includes the speed plan when a plano is supplied. First check the current export surface:

```javascript
import { montarPlanoDryRun } from "./editar-video.mjs";
import { planoVelocidade, normalizarTrechos } from "./lib-edicao.mjs";
import assert from "node:assert/strict";
import { test } from "node:test";

test("montarPlanoDryRun inclui plano de velocidade quando há trechos", () => {
  const trechos = normalizarTrechos(
    [{ inicio: 0, fim: 60, acao: "acelerar", fator: 2, audio: "mudo" }], 120
  );
  const p = montarPlanoDryRun({
    saidaSilencedetect: "", duracaoTotal: 120, slug: "demo", minSilencio: 0.8, trechos,
  });
  assert.ok(p.velocidade, "deve trazer o bloco de velocidade");
  assert.equal(p.velocidade.duracaoFinal, planoVelocidade(trechos, 120).duracaoFinal);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/editar-video.test.mjs`
Expected: FAIL — `p.velocidade` is undefined.

- [ ] **Step 3: Write minimal implementation**

In `scripts/editar-video.mjs`:

(a) Extend imports (line 13) to add the new pure functions:
```javascript
import { segmentosManter, filtroCorteConcat, planoCorte, montarSRT, montarASS, filtroLegendaAss, filtroLoudnorm, lerGlossario, corrigirTermos, parseTrechosTabela, normalizarTrechos, planoVelocidade, filtroVelocidadeConcat } from "./lib-edicao.mjs";
```

(b) Extend `montarPlanoDryRun` (line 25) to optionally include the speed plan:
```javascript
export function montarPlanoDryRun({ saidaSilencedetect, duracaoTotal, slug, minSilencio = 0.8, trechos = null }) {
  const seg = segmentosManter(saidaSilencedetect, { minSilencio, duracaoTotal });
  const p = planoCorte(seg, duracaoTotal);
  const base = `canal-youtube/edicao/${slug}`;
  const out = { dry_run: true, slug, ...p, segmentos: seg.length, saidas: [`${base}/final.mp4`, `${base}/legenda.srt`] };
  if (trechos && trechos.length) out.velocidade = planoVelocidade(trechos, duracaoTotal);
  return out;
}
```

(c) In the CLI block (after line 58), parse the new flags:
```javascript
  const planoArq = flag("--plano");
  const semCorteSilencio = has("--sem-corte-silencio");
```

(d) Load trechos from the plano file (after `duracaoTotal` is known, ~line 67):
```javascript
  let trechos = null;
  if (planoArq) {
    if (!existsSync(planoArq)) falhar(`plano não encontrado: ${planoArq}`);
    const raw = JSON.parse(readFileSync(planoArq, "utf8"));
    trechos = normalizarTrechos(raw.trechos || [], duracaoTotal);
  }
```

(e) Pass `trechos` into the dry-run call (line 70):
```javascript
    console.log(JSON.stringify({ ...montarPlanoDryRun({ saidaSilencedetect: saida, duracaoTotal, slug, minSilencio, trechos }),
      nota: "rode de novo com --confirmar pra renderizar de verdade." }, null, 2));
```

(f) In the render async block, gate the silence cut and add the speed pass. Replace the silence-cut block (lines 84-89) with:
```javascript
      let baseVideo = video;
      if (!semCorteSilencio) {
        registrarPasso({ skill: "/editar-video", etapa: "cortando silêncio + normalizando áudio", status: "inicio" });
        const seg = segmentosManter(saida, { minSilencio, duracaoTotal });
        execFileSync(FFMPEG, ["-y", "-i", video, "-filter_complex", filtroCorteConcat(seg, { loudnorm: filtroLoudnorm() }),
          "-map", "[vout]", "-map", "[aout]", cortado], { stdio: "inherit" });
        baseVideo = cortado;
      }
      if (trechos && trechos.length) {
        registrarPasso({ skill: "/editar-video", etapa: "aplicando velocidade por trechos", status: "inicio" });
        const comVel = join(base, "_velocidade.mp4");
        const lnorm = semCorteSilencio ? filtroLoudnorm() : undefined; // normaliza aqui se o corte não normalizou
        execFileSync(FFMPEG, ["-y", "-i", baseVideo, "-filter_complex", filtroVelocidadeConcat(trechos, { loudnorm: lnorm }),
          "-map", "[vout]", "-map", "[aout]", comVel], { stdio: "inherit" });
        baseVideo = comVel;
      }
```
Then replace every later reference to `cortado` (the transcription input on line 94 and the legend-burn input on line 109) with `baseVideo`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/editar-video.test.mjs`
Expected: PASS.

- [ ] **Step 5: Run the full suite to check for regressions**

Run: `node --test scripts/lib-edicao.test.mjs scripts/editar-video.test.mjs`
Expected: PASS — existing silence-cut tests still green.

- [ ] **Step 6: Commit**

```bash
git add scripts/editar-video.mjs scripts/editar-video.test.mjs
git commit -m "feat(editar-video): --plano (edição por trechos) e --sem-corte-silencio

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Smoke test end-to-end (real ffmpeg)

**Files:**
- None (manual verification with a generated test clip)

Proves the whole pipeline renders and leaves the source untouched.

- [ ] **Step 1: Generate a 30s test clip with a tone**

Run:
```bash
ffmpeg -y -f lavfi -i testsrc=duration=30:size=640x360:rate=30 -f lavfi -i sine=frequency=440:duration=30 -shortest /tmp/teste-velocidade.mp4
```
Expected: `/tmp/teste-velocidade.mp4` created.

- [ ] **Step 2: Write a plano-edicao.json**

Create `/tmp/plano-teste.json`:
```json
{ "trechos": [
  { "inicio": 0,  "fim": 5,  "acao": "cortar" },
  { "inicio": 5,  "fim": 15, "acao": "manter" },
  { "inicio": 15, "fim": 30, "acao": "acelerar", "fator": 3, "audio": "mudo" }
] }
```

- [ ] **Step 3: Dry-run**

Run: `node scripts/editar-video.mjs --video /tmp/teste-velocidade.mp4 --slug teste-vel --plano /tmp/plano-teste.json --sem-corte-silencio`
Expected: JSON with `velocidade.duracaoFinal` ≈ 15 (10s kept + 15s/3 = 5s) and `dry_run: true`.

- [ ] **Step 4: Record source checksum, then render**

Run:
```bash
md5sum /tmp/teste-velocidade.mp4 > /tmp/antes.md5
node scripts/editar-video.mjs --video /tmp/teste-velocidade.mp4 --slug teste-vel --plano /tmp/plano-teste.json --sem-corte-silencio --confirmar
md5sum -c /tmp/antes.md5
```
Expected: render finishes; `final.mp4` exists in `canal-youtube/edicao/teste-vel/`; `md5sum -c` prints `OK` (source byte-identical).

- [ ] **Step 5: Verify output duration**

Run: `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 canal-youtube/edicao/teste-vel/final.mp4`
Expected: ~15s (±1s for keyframe alignment).

- [ ] **Step 6: Clean up the test artifacts**

Run: `rm -rf canal-youtube/edicao/teste-vel /tmp/teste-velocidade.mp4 /tmp/plano-teste.json /tmp/antes.md5`

---

## Task 7: Update the skill doc

**Files:**
- Modify: `.claude/skills/editar-video/SKILL.md`

- [ ] **Step 1: Document per-segment editing + dry-run flow**

In `.claude/skills/editar-video/SKILL.md`, add a section after "## Fluxo" describing: the per-segment model (acelerar/cortar/manter), the two input forms (natural OR tabela via `parseTrechosTabela`), `--plano <arquivo>`, `--sem-corte-silencio` for lives, the warn-above-2x-with-voice rule, and that the raw source is never overwritten (render always produces a new `final.mp4`). Keep the existing voice/tone of the file.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/editar-video/SKILL.md
git commit -m "docs(editar-video): edição por trechos + dry-run + silêncio opcional

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final Verification

- [ ] Run full suite: `node --test scripts/lib-edicao.test.mjs scripts/editar-video.test.mjs` — all green.
- [ ] Confirm spec §5 acceptance cases 1–8 are each covered by a task above.
- [ ] Optionally run `/testpilot` on `scripts/` for the 13-phase QA gate before declaring Fase 1 done.
