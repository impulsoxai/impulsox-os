# Aplicar o Zoom (Fase 3c) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply dry zoom (via ffmpeg `zoompan`) to the recording's focus points during each region from `regioes-zoom.json`, in the `editar-video` render — closing the grava→zoom→edita loop. Auto mode only, with anti-dizziness limits.

**Architecture:** One pure function in `lib-zoom.mjs` (`aplicarLimitesAuto`), one pure function in `lib-edicao.mjs` (`filtroZoompan` — builds the timeline-conditional zoompan filter string, proven approach), CLI `zoom-regioes.mjs` gains the auto limits + 1.4 level, and `editar-video.mjs` gains a `--zoom auto|nao` step that chains the zoompan filter into the body render + lists zooms in the dry-run.

**Tech Stack:** Node ESM (`.mjs`), `node:test` + `node:assert/strict`, ffmpeg `zoompan` (validated: time-conditional `z` works; `crop+enable` does not). Windows render.

**Spec:** `docs/superpowers/specs/2026-06-21-aplicar-zoom-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `scripts/lib-zoom.mjs` | + `aplicarLimitesAuto` (anti-dizziness: min duration, min interval) | Modify |
| `scripts/lib-zoom.test.mjs` | tests for `aplicarLimitesAuto` | Modify |
| `scripts/lib-edicao.mjs` | + `filtroZoompan` (regions → zoompan filter string) | Modify |
| `scripts/lib-edicao.test.mjs` | tests for `filtroZoompan` | Modify |
| `scripts/zoom-regioes.mjs` | apply auto limits + 1.4 level (overrides TABELA via nivel) | Modify |
| `scripts/editar-video.mjs` | `--zoom auto\|nao` step: chain zoompan into body render + dry-run list | Modify |

**Input** `regioes-zoom.json` (3b): `{ regioes: [{ inicio, fim, foco:{x,y}, nivel }] }` (seconds).

**zoompan filter (validated form, 1920×1080 @ 30fps):** for regions, the zoom `z` is the
region's `nivel` when the frame index `in` is within `[inicio*fps, fim*fps]`, else `1`; `x`/`y`
center the focus. Example for one region [2,4] nivel 1.5 focus (0.45,0.30):
`zoompan=z='if(between(in,60,120),1.5,1)':x='iw*0.45-(iw/zoom/2)':y='ih*0.30-(ih/zoom/2)':d=1:s=1920x1080:fps=30`

---

## Task 1: `aplicarLimitesAuto` — anti-dizziness filtering

**Files:**
- Modify: `scripts/lib-zoom.mjs`
- Test: `scripts/lib-zoom.test.mjs`

Removes regions shorter than `minDurS` and drops a region that starts less than `intervaloMinS` after the previous kept region ended (spacing out zooms).

- [ ] **Step 1: Write the failing test**

Append to `scripts/lib-zoom.test.mjs` (add `aplicarLimitesAuto` to the import):

```javascript
test("aplicarLimitesAuto: remove região mais curta que minDurS", () => {
  const regioes = [
    { inicio: 1, fim: 1.5, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 }, // 0.5s < 1.5
    { inicio: 10, fim: 13, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 }, // 3s ok
  ];
  const r = aplicarLimitesAuto(regioes, { minDurS: 1.5, intervaloMinS: 4 });
  assert.equal(r.length, 1);
  assert.equal(r[0].inicio, 10);
});

test("aplicarLimitesAuto: descarta região muito perto da anterior", () => {
  const regioes = [
    { inicio: 1, fim: 4, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 },   // termina em 4
    { inicio: 6, fim: 9, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 },   // começa 2s depois (<4) -> fora
    { inicio: 15, fim: 18, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 }, // 11s depois -> ok
  ];
  const r = aplicarLimitesAuto(regioes, { minDurS: 1.5, intervaloMinS: 4 });
  assert.equal(r.length, 2);
  assert.deepEqual(r.map((x) => x.inicio), [1, 15]);
});

test("aplicarLimitesAuto: lista vazia -> vazia", () => {
  assert.deepEqual(aplicarLimitesAuto([], {}), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: FAIL — `aplicarLimitesAuto is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-zoom.mjs`:

```javascript
export const MIN_DUR_S = 1.5;
export const INTERVALO_MIN_S = 4;

// Anti-tontura: tira zoom curto demais (< minDurS) e espaça os zooms (descarta a região que
// começa menos de intervaloMinS depois do fim da última região mantida).
export function aplicarLimitesAuto(regioes, { minDurS = MIN_DUR_S, intervaloMinS = INTERVALO_MIN_S } = {}) {
  const out = [];
  let fimAnterior = -Infinity;
  for (const r of regioes) {
    if (r.fim - r.inicio < minDurS) continue;
    if (r.inicio - fimAnterior < intervaloMinS) continue;
    out.push(r);
    fimAnterior = r.fim;
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-zoom.mjs scripts/lib-zoom.test.mjs
git commit -m "feat(zoom): aplicarLimitesAuto — anti-tontura (duração + intervalo)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `filtroZoompan` — regions → ffmpeg zoompan string

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

Builds the timeline-conditional zoompan filter string from regions. No regions → `null` (no filter applied).

- [ ] **Step 1: Write the failing test**

Append to `scripts/lib-edicao.test.mjs` (add `filtroZoompan` to the import):

```javascript
// --- Zoom (Fase 3c) ---

test("filtroZoompan: 1 região vira zoompan condicional no tempo", () => {
  const regioes = [{ inicio: 2, fim: 4, foco: { x: 0.45, y: 0.30 }, nivel: 1.5 }];
  const f = filtroZoompan(regioes, { fps: 30, largura: 1920, altura: 1080 });
  assert.match(f, /zoompan=z='if\(between\(in,60,120\),1\.5,/);
  assert.match(f, /iw\*0\.45-\(iw\/zoom\/2\)/);
  assert.match(f, /ih\*0\.3-\(ih\/zoom\/2\)/);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `filtroZoompan is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-edicao.mjs`:

```javascript
// Filtro ffmpeg zoompan pra zoom SECO nas regiões: z vira o nível na janela de frames da
// região (between(in, inicio*fps, fim*fps)), senão 1. x/y centram o foco. Provado: zoompan é
// timeline-aware (crop+enable não é). Foco e nível usam o MESMO `zoom` que o z resolve no frame.
// Sem regiões -> null (o chamador não aplica filtro). Várias regiões = if aninhado.
export function filtroZoompan(regioes, { fps = 30, largura = 1920, altura = 1080 } = {}) {
  if (!regioes || regioes.length === 0) return null;
  // monta o z aninhado: if(between(in,a,b), nivel, if(between(in,c,d), nivel2, 1))
  let zExpr = "1";
  for (let i = regioes.length - 1; i >= 0; i--) {
    const r = regioes[i];
    const f0 = Math.round(r.inicio * fps);
    const f1 = Math.round(r.fim * fps);
    zExpr = `if(between(in,${f0},${f1}),${r.nivel},${zExpr})`;
  }
  // x/y: o foco da região ativa. Como só uma região fica ativa por frame, e o foco varia,
  // usamos a mesma estrutura aninhada pro x e y (foco da região ativa; fora, centro 0.5).
  const focoExpr = (campo, dim) => {
    let e = "0.5";
    for (let i = regioes.length - 1; i >= 0; i--) {
      const r = regioes[i];
      const f0 = Math.round(r.inicio * fps);
      const f1 = Math.round(r.fim * fps);
      e = `if(between(in,${f0},${f1}),${r.foco[campo]},${e})`;
    }
    return `${dim}*(${e})-(${dim}/zoom/2)`;
  };
  return `zoompan=z='${zExpr}':x='${focoExpr("x", "iw")}':y='${focoExpr("y", "ih")}':d=1:s=${largura}x${altura}:fps=${fps}`;
}
```

> Note: the test only asserts substrings (`between(in,60,120)`, `1.5`, the focus expression,
> the size). The nested-if structure satisfies those. The `0.3` in the test matches
> `r.foco.y = 0.30` rendered by JS as `0.3`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): filtroZoompan — regiões -> filtro zoompan (zoom seco temporal)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `zoom-regioes.mjs` — apply auto limits + 1.4 level

**Files:**
- Modify: `scripts/zoom-regioes.mjs`

After building regions with `montarRegioesZoom`, apply `aplicarLimitesAuto` and set every
region's level to the gentle 1.4 (anti-dizziness, spec §3).

- [ ] **Step 1: Read the current CLI**

Read `scripts/zoom-regioes.mjs`. It imports `montarRegioesZoom`, reads `telemetria.json`,
calls `montarRegioesZoom(telemetria, opts)`, writes `regioes-zoom.json`.

- [ ] **Step 2: Apply limits + level**

(a) Extend the import: `import { montarRegioesZoom, aplicarLimitesAuto } from "./lib-zoom.mjs";`

(b) After `const regioes = montarRegioesZoom(telemetria, opts);`, replace the write step so it
applies the auto limits and the gentle level:
```javascript
  const limitadas = aplicarLimitesAuto(regioes.regioes, {}).map((r) => ({ ...r, nivel: 1.4 }));
  const saidaObj = { regioes: limitadas };
  const saida = join(base, "regioes-zoom.json");
  writeFileSync(saida, JSON.stringify(saidaObj, null, 2));
  console.log(JSON.stringify({ ok: true, slug, regioes: limitadas.length, saida }, null, 2));
```
(Remove the old write/console block that used `regioes` directly.)

- [ ] **Step 3: Sanity-check with a fixture**

Run:
```bash
mkdir -p canal-youtube/gravacoes/fix-zc
printf '{"t0":"x","tela":{"largura":1536,"altura":864},"cliques":[{"t":2000,"x":0.4,"y":0.3,"tipo":"double"},{"t":2400,"x":0.5,"y":0.3,"tipo":"left"},{"t":2800,"x":0.45,"y":0.3,"tipo":"left"}]}' > canal-youtube/gravacoes/fix-zc/telemetria.json
node scripts/zoom-regioes.mjs --slug fix-zc
cat canal-youtube/gravacoes/fix-zc/regioes-zoom.json
rm -rf canal-youtube/gravacoes/fix-zc
```
Expected: a region with `nivel:1.4` (3 clicks span 0.8s — but note: 0.8s < minDurS 1.5 means it
could be filtered; if so the output is `regioes:[]`, which is correct anti-dizziness behavior).
Either a 1.4-level region OR empty — both are valid; confirm no crash and `nivel` is 1.4 when present.

- [ ] **Step 4: Commit**

```bash
git add scripts/zoom-regioes.mjs
git commit -m "feat(zoom): zoom-regioes aplica limites anti-tontura + nível 1.4

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `editar-video.mjs` — `--zoom auto|nao` step + dry-run list

**Files:**
- Modify: `scripts/editar-video.mjs`

Chain the zoompan filter into the body render when `--zoom auto` (default) and a
`regioes-zoom.json` exists for the slug; list the zooms in the dry-run.

- [ ] **Step 1: Read the body-render block**

Read `scripts/editar-video.mjs` around the `vfCorpo` block (the part that builds
`const vfCorpo = temLegenda ? ... : filtroEscala1080p();` and runs the ffmpeg that writes `corpo`).
Also note the flag parsing (`flag`/`has`) and the dry-run print.

- [ ] **Step 2: Parse the flag + load regions**

(a) Extend the `./lib-edicao.mjs` import to include `filtroZoompan`.

(b) In the CLI flag-parsing area, add:
```javascript
  const modoZoom = flag("--zoom") || "auto"; // auto | nao
```

(c) Where `slug`/`base` are known in the render block, after computing `baseVideo`, load regions:
```javascript
      // zoom automático: lê as regiões (se houver) pra encadear no render do corpo.
      let zoomFiltro = null;
      const regioesPath = join("canal-youtube", "gravacoes", slug, "regioes-zoom.json");
      if (modoZoom === "auto" && existsSync(regioesPath)) {
        const { regioes } = JSON.parse(readFileSync(regioesPath, "utf8"));
        zoomFiltro = filtroZoompan(regioes, { fps: 30, largura: 1920, altura: 1080 });
      }
```
Note: `existsSync`, `readFileSync`, `join` already imported.

- [ ] **Step 3: Chain zoom into the body filtergraph**

Replace the `vfCorpo` construction so the zoom (when present) is appended AFTER the 1080p
scale (zoom operates on the final-size frame):
```javascript
      const filtrosCorpo = [filtroEscala1080p()];
      if (temLegenda) filtrosCorpo.push(filtroLegendaAss({ assCaminho: tmpAss }));
      if (zoomFiltro) filtrosCorpo.push(zoomFiltro);
      const corpo = join(base, temLegenda ? "_legendado.mp4" : "_1080p.mp4");
      const vfCorpo = filtrosCorpo.join(",");
      execFileSync(FFMPEG, ["-y", "-i", baseVideo, "-vf", vfCorpo,
        "-c:a", "copy", corpo], { stdio: "inherit" });
```

- [ ] **Step 4: List zooms in the dry-run**

In the dry-run branch (before the `process.exit(0)` that prints the plan), add the zoom list
when applicable. Right where the dry-run JSON is assembled, compute and include:
```javascript
    // lista de zooms pro dono conferir/podar antes de renderizar
    let zoomLista = [];
    const _regioesPath = join("canal-youtube", "gravacoes", slug, "regioes-zoom.json");
    if ((flag("--zoom") || "auto") === "auto" && existsSync(_regioesPath)) {
      const { regioes } = JSON.parse(readFileSync(_regioesPath, "utf8"));
      zoomLista = regioes.map((r) => ({
        em: `${Math.floor(r.inicio / 60)}:${String(Math.round(r.inicio % 60)).padStart(2, "0")}`,
        nivel: r.nivel, dur: Number((r.fim - r.inicio).toFixed(1)),
      }));
    }
```
and include `zooms: zoomLista` in the dry-run JSON object that gets printed.

- [ ] **Step 5: Run the test + regression suites**

Run: `node --test scripts/lib-edicao.test.mjs scripts/editar-video.test.mjs scripts/lib-zoom.test.mjs scripts/lib-telemetria.test.mjs scripts/lib-gravacao.test.mjs`
Expected: all pass (no regression; the existing editar-video test still green).

- [ ] **Step 6: Commit**

```bash
git add scripts/editar-video.mjs
git commit -m "feat(editar-video): --zoom auto aplica zoompan + lista zooms no dry-run

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Smoke test end-to-end (real ffmpeg)

**Files:** none. Uses generated clips — runs on the owner's machine (no webcam needed; this is render-only).

- [ ] **Step 1: Make a 1080p test clip + a regions file**

Run:
```bash
mkdir -p /tmp/zc canal-youtube/gravacoes/smoke-zoom
ffmpeg -y -f lavfi -i "testsrc=duration=12:size=1920x1080:rate=30" -f lavfi -i "sine=frequency=300:duration=12" -shortest canal-youtube/gravacoes/smoke-zoom/tela.mp4
printf '{"regioes":[{"inicio":3,"fim":6,"foco":{"x":0.3,"y":0.3},"nivel":1.5}]}' > canal-youtube/gravacoes/smoke-zoom/regioes-zoom.json
```

- [ ] **Step 2: Dry-run shows the zoom**

Run: `node scripts/editar-video.mjs --video canal-youtube/gravacoes/smoke-zoom/tela.mp4 --slug smoke-zoom --sem-corte-silencio --sem-intro`
Expected: dry-run JSON includes `zooms` with one entry around `0:03`, nivel 1.5.

- [ ] **Step 3: Render and verify the zoom is visible**

Run:
```bash
node scripts/editar-video.mjs --video canal-youtube/gravacoes/smoke-zoom/tela.mp4 --slug smoke-zoom --sem-corte-silencio --sem-intro --confirmar
ffmpeg -y -i canal-youtube/edicao/smoke-zoom/final.mp4 -ss 1 -frames:v 1 /tmp/zc/fora.png
ffmpeg -y -i canal-youtube/edicao/smoke-zoom/final.mp4 -ss 4 -frames:v 1 /tmp/zc/dentro.png
md5sum /tmp/zc/fora.png /tmp/zc/dentro.png
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 canal-youtube/edicao/smoke-zoom/final.mp4
```
Expected: the two frames have different md5 (zoom changed the image at t=4 vs t=1); final is 1920×1080.

- [ ] **Step 4: Clean up**

Run: `rm -rf /tmp/zc canal-youtube/gravacoes/smoke-zoom canal-youtube/edicao/smoke-zoom`

---

## Task 6: Update the skill docs

**Files:**
- Modify: `.claude/skills/editar-video/SKILL.md`
- Modify: `.claude/skills/gravar-tela/SKILL.md`

- [ ] **Step 1: Document the auto-zoom flow**

In `editar-video/SKILL.md`, add a section: auto-zoom is applied from `regioes-zoom.json` when
`--zoom auto` (default); the dry-run lists the zooms so the owner can prune; `--zoom nao` turns
it off; manual live zoom is not supported (headless) — use Recordly for that. In
`gravar-tela/SKILL.md`, add one line pointing to the next step: after recording, run
`node scripts/zoom-regioes.mjs --slug <nome>` to generate the zoom regions, then `/editar-video`.
Keep both files' voice.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/editar-video/SKILL.md .claude/skills/gravar-tela/SKILL.md
git commit -m "docs(zoom): fluxo do auto-zoom (zoom-regioes -> editar-video --zoom)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final Verification

- [ ] Run unit suite: `node --test scripts/lib-zoom.test.mjs scripts/lib-edicao.test.mjs` — all green.
- [ ] Confirm spec §7 acceptance cases map: 1 Task 1 (minDur), 2 Task 1 (interval), 3-4 Task 2 (zoompan/empty), smoke (case 7) Task 5, dry-run list (case 8) Task 4.
- [ ] Smoke (Task 5) shows the zoom visible in the rendered final.mp4 (the proof the loop is closed).
- [ ] Regression: all existing suites pass; `--zoom nao` / no regions file = identical to before.

> **Closes the loop:** after this, gravar-tela (record + telemetry) → zoom-regioes (brain) →
> editar-video --zoom auto (apply) produces a video with automatic zoom on the clicks. Next:
> the owner's usage guide (his request), then Fase 4 (frame/webcam bubble) if worth it.
