# Telemetria de Cliques (Fase 3a) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** During screen recording, capture every mouse click (type + normalized position + time) into a `telemetria.json` synchronized with the video — raw material for the zoom brain (Fase 3b).

**Architecture:** Pure functions in `scripts/lib-telemetria.mjs` (normalize a click to 0–1, classify type, assemble the JSON). The orchestrator `scripts/gravar-tela.mjs` turns `uIOhook` on alongside the two ffmpeg processes (same t-zero), collects raw click events, and on ENTER writes `telemetria.json` next to the mp4s. `uiohook-napi` is a prebuilt native dep (no C++ build needed — verified loading on the owner's Node v24).

**Tech Stack:** Node ESM (`.mjs`), `node:test` + `node:assert/strict`, `uiohook-napi` (prebuild), PowerShell for screen resolution, ffmpeg already wired. Windows-only.

**Spec:** `docs/superpowers/specs/2026-06-20-telemetria-cliques-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `scripts/lib-telemetria.mjs` | Pure: normalize click 0–1, classify type, assemble telemetria JSON | Create |
| `scripts/lib-telemetria.test.mjs` | Unit tests for the pure functions | Create |
| `scripts/gravar-tela.mjs` | Wire uIOhook on/off around the ffmpeg spawn, write telemetria.json | Modify |
| `package.json` | Add `uiohook-napi` dependency | Modify |
| `.claude/skills/gravar-tela/SKILL.md` | Note that clicks are captured into telemetria.json | Modify |

**Data contract (`canal-youtube/gravacoes/<slug>/telemetria.json`):**
```json
{
  "t0": "2026-06-20T23:00:00.000Z",
  "tela": { "largura": 1536, "altura": 864, "fonte": "powershell" },
  "cliques": [ { "t": 2300, "x": 0.45, "y": 0.30, "tipo": "left" } ]
}
```

**uiohook event shape** (verified): `EVENT_MOUSE_CLICKED` carries `x`, `y` (absolute px), `button` (1=left, 2=right/middle vary), `clicks` (1=single, 2=double).

---

## Task 1: `normalizarClique` — absolute pixels → 0–1 fraction

**Files:**
- Create: `scripts/lib-telemetria.mjs`
- Create: `scripts/lib-telemetria.test.mjs`

Converts an absolute pixel click to a resolution-independent 0–1 fraction, clamped to [0,1].

- [ ] **Step 1: Write the failing test**

Create `scripts/lib-telemetria.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarClique } from "./lib-telemetria.mjs";

test("normalizarClique: centro da tela = 0.5/0.5", () => {
  assert.deepEqual(
    normalizarClique({ x: 768, y: 432, tela: { largura: 1536, altura: 864 } }),
    { x: 0.5, y: 0.5 }
  );
});

test("normalizarClique: clampa clique fora da tela em [0,1]", () => {
  const r = normalizarClique({ x: -50, y: 9999, tela: { largura: 1536, altura: 864 } });
  assert.equal(r.x, 0);
  assert.equal(r.y, 1);
});

test("normalizarClique: tela inválida (0) não gera divisão por zero", () => {
  const r = normalizarClique({ x: 100, y: 100, tela: { largura: 0, altura: 0 } });
  assert.ok(Number.isFinite(r.x) && Number.isFinite(r.y));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-telemetria.test.mjs`
Expected: FAIL — module/function not found.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/lib-telemetria.mjs`:

```javascript
// lib-telemetria.mjs — funções puras pra telemetria de cliques (Fase 3a). ZERO deps, sem
// rede, sem disco, sem uiohook: só transformam os eventos crus em JSON. ImpulsoX AI.

const clamp01 = (n) => Math.min(1, Math.max(0, n));

// Pixel absoluto -> fração 0–1 pela resolução da tela. Independe de resolução: um clique no
// centro é 0.5 seja a tela 1536x864 ou 4K. Tela inválida (0) -> 0 em vez de NaN.
export function normalizarClique({ x, y, tela }) {
  const largura = tela?.largura > 0 ? tela.largura : 0;
  const altura = tela?.altura > 0 ? tela.altura : 0;
  return {
    x: largura ? clamp01(x / largura) : 0,
    y: altura ? clamp01(y / altura) : 0,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-telemetria.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-telemetria.mjs scripts/lib-telemetria.test.mjs
git commit -m "feat(telemetria): normalizarClique — pixel -> fração 0-1

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `classificarTipo` — uiohook event → left/right/double

**Files:**
- Modify: `scripts/lib-telemetria.mjs`
- Test: `scripts/lib-telemetria.test.mjs`

Maps a uiohook click event's `button`/`clicks` to a simple type the zoom brain uses.

- [ ] **Step 1: Write the failing test**

Append to `scripts/lib-telemetria.test.mjs` (add `classificarTipo` to the import):

```javascript
test("classificarTipo: clicks>=2 -> double (prioridade)", () => {
  assert.equal(classificarTipo({ button: 1, clicks: 2 }), "double");
});

test("classificarTipo: button 2 ou 3 -> right", () => {
  assert.equal(classificarTipo({ button: 2, clicks: 1 }), "right");
  assert.equal(classificarTipo({ button: 3, clicks: 1 }), "right");
});

test("classificarTipo: default -> left", () => {
  assert.equal(classificarTipo({ button: 1, clicks: 1 }), "left");
  assert.equal(classificarTipo({}), "left");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-telemetria.test.mjs`
Expected: FAIL — `classificarTipo is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-telemetria.mjs`:

```javascript
// Evento de clique do uiohook -> tipo simples pro cérebro do zoom. double tem prioridade
// (gesto mais forte); button 2/3 = direito; o resto = esquerdo.
export function classificarTipo({ button, clicks } = {}) {
  if (clicks >= 2) return "double";
  if (button === 2 || button === 3) return "right";
  return "left";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-telemetria.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-telemetria.mjs scripts/lib-telemetria.test.mjs
git commit -m "feat(telemetria): classificarTipo — left/right/double

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `montarTelemetria` — raw events → canonical JSON

**Files:**
- Modify: `scripts/lib-telemetria.mjs`
- Test: `scripts/lib-telemetria.test.mjs`

Assembles the final telemetria object from t0, screen size, and the list of raw events `{ tMs, x, y, button, clicks }` — normalizing position and classifying type for each, preserving order.

- [ ] **Step 1: Write the failing test**

Append (add `montarTelemetria` to the import):

```javascript
test("montarTelemetria monta JSON normalizado e classificado, em ordem", () => {
  const tela = { largura: 1000, altura: 500, fonte: "powershell" };
  const t = montarTelemetria({
    t0: "2026-06-20T23:00:00.000Z",
    tela,
    eventos: [
      { tMs: 2300, x: 450, y: 250, button: 1, clicks: 1 },
      { tMs: 5800, x: 800, y: 100, button: 1, clicks: 2 },
    ],
  });
  assert.equal(t.t0, "2026-06-20T23:00:00.000Z");
  assert.deepEqual(t.tela, tela);
  assert.deepEqual(t.cliques, [
    { t: 2300, x: 0.45, y: 0.5, tipo: "left" },
    { t: 5800, x: 0.8,  y: 0.2, tipo: "double" },
  ]);
});

test("montarTelemetria sem eventos -> cliques vazio", () => {
  const t = montarTelemetria({ t0: "x", tela: { largura: 100, altura: 100 }, eventos: [] });
  assert.deepEqual(t.cliques, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-telemetria.test.mjs`
Expected: FAIL — `montarTelemetria is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-telemetria.mjs`:

```javascript
// Monta o telemetria.json canônico: para cada evento cru, normaliza a posição e classifica
// o tipo, preservando a ordem. t0/tela passam direto.
export function montarTelemetria({ t0, tela, eventos = [] }) {
  return {
    t0,
    tela,
    cliques: eventos.map((e) => {
      const pos = normalizarClique({ x: e.x, y: e.y, tela });
      return { t: e.tMs, x: pos.x, y: pos.y, tipo: classificarTipo(e) };
    }),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-telemetria.test.mjs`
Expected: PASS (all telemetria tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-telemetria.mjs scripts/lib-telemetria.test.mjs
git commit -m "feat(telemetria): montarTelemetria — eventos crus -> JSON canônico

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Add `uiohook-napi` dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the dependency**

Run: `npm install uiohook-napi`
Expected: adds to `package.json` dependencies; installs a prebuilt binary (no compile).

- [ ] **Step 2: Verify it loads**

Run: `node -e "const { uIOhook } = require('uiohook-napi'); console.log(typeof uIOhook.start)"`
Expected: prints `function`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: adiciona uiohook-napi (captura de cliques, prebuild)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Wire telemetry into `gravar-tela.mjs`

**Files:**
- Modify: `scripts/gravar-tela.mjs`

Turn uIOhook on right before spawning the ffmpeg processes (capturing t0), collect each click as a raw event, and on ENTER turn it off and write `telemetria.json`. The recording already runs foreground and stops on ENTER — telemetry hooks into the same lifecycle.

- [ ] **Step 1: Add imports and a screen-resolution helper**

In `scripts/gravar-tela.mjs`:

(a) Add to the imports near the top:
```javascript
import { uIOhook, EventType } from "uiohook-napi";
import { montarTelemetria } from "./lib-telemetria.mjs";
```
(b) Add this helper near `listarDispositivos` (uses PowerShell, falls back to 1920×1080):
```javascript
// resolução da tela (px) pra normalizar os cliques. PowerShell sem dep nova; fallback 1080p.
function resolucaoTela() {
  try {
    const r = spawnSync("powershell", ["-NoProfile", "-Command",
      "Add-Type -AssemblyName System.Windows.Forms; $b=[System.Windows.Forms.SystemInformation]::VirtualScreen; Write-Output \"$($b.Width)x$($b.Height)\""],
      { encoding: "utf8" });
    const m = String(r.stdout || "").match(/(\d+)x(\d+)/);
    if (m) return { largura: Number(m[1]), altura: Number(m[2]), fonte: "powershell" };
  } catch { /* cai no fallback */ }
  return { largura: 1920, altura: 1080, fonte: "fallback" };
}
```

- [ ] **Step 2: Start telemetry alongside the ffmpeg spawn**

In `iniciar()`, immediately BEFORE the `spawn(FFMPEG, argsCapturaTela...)` line, add:
```javascript
  // telemetria: liga o uiohook no MESMO instante dos ffmpeg (mesmo t-zero) e coleta os cliques.
  const tela = resolucaoTela();
  const t0Iso = new Date().toISOString();
  const t0 = Date.now();
  const eventos = [];
  uIOhook.on("click", (e) => {
    eventos.push({ tMs: Date.now() - t0, x: e.x, y: e.y, button: e.button, clicks: e.clicks });
  });
  uIOhook.start();
```
Note: `uiohook-napi` emits a `"click"` event (alias for `EVENT_MOUSE_CLICKED`) carrying `x,y,button,clicks`. `EventType` is imported in case a raw-event listener is preferred; the named `"click"` event is the simplest and is what this plan uses.

- [ ] **Step 3: Stop telemetry and write the file on ENTER**

After the ENTER `await` and the `console.log("• finalizando os arquivos…")`, BEFORE/around the ffmpeg `q` close, add:
```javascript
  // para a captura de cliques e grava a telemetria sincronizada com o vídeo.
  try { uIOhook.stop(); } catch { /* já parado */ }
  const telemetria = montarTelemetria({ t0: t0Iso, tela, eventos });
  writeFileSync(join(base, "telemetria.json"), JSON.stringify(telemetria, null, 2));
```
(`writeFileSync` and `join` are already imported. Place this so it runs whether or not the ffmpeg close succeeds — telemetry should be saved regardless.)

- [ ] **Step 4: Update the success message**

Change the final `console.log` of `iniciar` (the "✓ pronto" line) to also mention the telemetria file:
```javascript
  console.log(`✓ pronto: ${telaMp4} + ${webcamMp4} + telemetria.json\n→ próximo: /editar-video pra cortar/acelerar/legendar.`);
```

- [ ] **Step 5: Sanity-check the script still parses**

Run: `node scripts/gravar-tela.mjs`
Expected: prints the usage line, exits non-zero, no crash (the import of uiohook must not break startup).

- [ ] **Step 6: Confirm the lib + regression suites stay green**

Run: `node --test scripts/lib-telemetria.test.mjs scripts/lib-gravacao.test.mjs scripts/lib-edicao.test.mjs scripts/editar-video.test.mjs`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add scripts/gravar-tela.mjs
git commit -m "feat(gravar-tela): captura cliques (uiohook) -> telemetria.json sincronizada

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Smoke test end-to-end (real hardware — owner's machine)

**Files:** none. Needs a real mouse; cannot run headless.

- [ ] **Step 1: Record ~8s clicking in three spots**

Run: `node scripts/gravar-tela.mjs iniciar --slug smoke-tel` (uses saved `.env` devices). While the `🔴 gravando` message is shown, click three different places on screen, then press ENTER.

- [ ] **Step 2: Inspect the telemetria**

Run: `cat canal-youtube/gravacoes/smoke-tel/telemetria.json`
Expected: `cliques` has ~3 entries, each with a `t` (ms, increasing), `x`/`y` in [0,1], and a `tipo`. `tela.fonte` is `"powershell"`.

- [ ] **Step 3: Confirm video + telemetry coexist**

Run: `ls canal-youtube/gravacoes/smoke-tel/`
Expected: `tela.mp4`, `webcam.mp4`, `telemetria.json` all present.

- [ ] **Step 4: Clean up**

Run: `rm -rf canal-youtube/gravacoes/smoke-tel`

---

## Task 7: Update the skill doc

**Files:**
- Modify: `.claude/skills/gravar-tela/SKILL.md`

- [ ] **Step 1: Note the telemetry capture**

Add a short paragraph: during the recording, every mouse click is captured into
`telemetria.json` (alongside the mp4s) — it's the raw material the auto-zoom (Fase 3) will use.
The owner does nothing extra; it happens automatically. Mention `uiohook-napi` is a prebuilt
dependency (no build needed). Keep the file's voice.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/gravar-tela/SKILL.md
git commit -m "docs(gravar-tela): telemetria de cliques capturada automaticamente

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final Verification

- [ ] Run unit suite: `node --test scripts/lib-telemetria.test.mjs` — all green.
- [ ] Confirm spec §5 acceptance cases 1–6 each map to a task (1-2 Task 1; 3 Task 2; 4 Task 3; 5 Task 3; 6 smoke Task 6).
- [ ] Owner ran the Task 6 smoke and `telemetria.json` has plausible clicks (the one step needing a real mouse).
- [ ] Regression: Fase 2 recording (tela/webcam/clean-stop) and Fase 1 editing still pass.

> **Carried to execution:** the t-zero sync (uiohook vs ffmpeg) relies on both starting in the same foreground process within milliseconds — accurate enough for click-based zoom. Confirmed only by the real smoke (Task 6).
