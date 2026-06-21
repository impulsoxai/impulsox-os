# Cérebro do Zoom (Fase 3b) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Read `telemetria.json` (clicks) and decide zoom regions → `regioes-zoom.json` (`{inicio, fim, foco, nivel}`), so Fase 3c can apply zoompan automatically.

**Architecture:** Pure functions in `scripts/lib-zoom.mjs` — clean-room (algorithm designed from scratch; no Recordly AGPL code copied). Four steps: temporal cluster (gap), centroid focus, click-strength→zoom-level, padding+overlap-merge. Plus a thin CLI to read/write the JSON files. No video, no hardware — fully unit-testable.

**Tech Stack:** Node ESM (`.mjs`), `node:test` + `node:assert/strict`. Platform-independent (pure logic).

**Spec:** `docs/superpowers/specs/2026-06-21-cerebro-zoom-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `scripts/lib-zoom.mjs` | Pure: cluster, centroid, strength→level, assemble regions (padding+merge) | Create |
| `scripts/lib-zoom.test.mjs` | Unit tests | Create |
| `scripts/zoom-regioes.mjs` | Thin CLI: read telemetria.json → write regioes-zoom.json | Create |

**Input** `telemetria.json` (from 3a): `{ t0, tela, cliques: [{ t, x, y, tipo }] }` — `t` in **ms**.
**Output** `regioes-zoom.json`: `{ regioes: [{ inicio, fim, foco:{x,y}, nivel }] }` — times in **seconds**.

**Defaults (top of lib-zoom.mjs):** `gapMs=2500`, `padInicioS=0.5`, `padFimS=0.8`,
`TABELA_FORCA={ double:2.0, right:1.8, left:1.5 }`.

---

## Task 1: `agruparClusters` — group clicks by time gap

**Files:**
- Create: `scripts/lib-zoom.mjs`
- Create: `scripts/lib-zoom.test.mjs`

Groups a time-sorted click list into clusters: consecutive clicks ≤ `gapMs` apart stay in the same cluster; a larger pause starts a new one.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib-zoom.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { agruparClusters } from "./lib-zoom.mjs";

test("agruparClusters: cliques com gap <= 2.5s = 1 cluster", () => {
  const cliques = [
    { t: 2000, x: 0.2, y: 0.4, tipo: "left" },
    { t: 2400, x: 0.3, y: 0.4, tipo: "left" },
    { t: 3000, x: 0.25, y: 0.45, tipo: "left" },
  ];
  const c = agruparClusters(cliques, { gapMs: 2500 });
  assert.equal(c.length, 1);
  assert.equal(c[0].length, 3);
});

test("agruparClusters: gap > 2.5s separa em 2 clusters", () => {
  const cliques = [
    { t: 2000, x: 0.2, y: 0.4, tipo: "left" },
    { t: 20000, x: 0.8, y: 0.6, tipo: "left" },
  ];
  const c = agruparClusters(cliques, { gapMs: 2500 });
  assert.equal(c.length, 2);
});

test("agruparClusters: lista vazia = nenhum cluster", () => {
  assert.deepEqual(agruparClusters([], { gapMs: 2500 }), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: FAIL — module/function not found.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/lib-zoom.mjs`:

```javascript
// lib-zoom.mjs — cérebro do zoom (Fase 3b), clean-room. Funções puras: cliques -> regiões
// de zoom. ZERO deps, sem vídeo, sem disco. Algoritmo nosso (ideias do Recordly
// reimplementadas, nenhum código copiado). ImpulsoX AI.

export const GAP_MS = 2500;
export const PAD_INICIO_S = 0.5;
export const PAD_FIM_S = 0.8;
export const TABELA_FORCA = { double: 2.0, right: 1.8, left: 1.5 };

// Agrupa cliques (ordenados por t) em clusters: gap <= gapMs fica junto; pausa maior abre
// um novo cluster. Cada cluster é um array de cliques.
export function agruparClusters(cliques, { gapMs = GAP_MS } = {}) {
  if (!cliques || cliques.length === 0) return [];
  const ordenados = [...cliques].sort((a, b) => a.t - b.t);
  const clusters = [[ordenados[0]]];
  for (let i = 1; i < ordenados.length; i++) {
    const anterior = ordenados[i - 1];
    const atual = ordenados[i];
    if (atual.t - anterior.t <= gapMs) clusters[clusters.length - 1].push(atual);
    else clusters.push([atual]);
  }
  return clusters;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-zoom.mjs scripts/lib-zoom.test.mjs
git commit -m "feat(zoom): agruparClusters — cliques por gap temporal

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `focoCentroide` — average position of a cluster

**Files:**
- Modify: `scripts/lib-zoom.mjs`
- Test: `scripts/lib-zoom.test.mjs`

- [ ] **Step 1: Write the failing test**

Append (add `focoCentroide` to the import):

```javascript
test("focoCentroide: média dos x e y do cluster", () => {
  const cluster = [
    { t: 1, x: 0.2, y: 0.4, tipo: "left" },
    { t: 2, x: 0.6, y: 0.6, tipo: "left" },
  ];
  assert.deepEqual(focoCentroide(cluster), { x: 0.4, y: 0.5 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: FAIL — `focoCentroide is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-zoom.mjs`:

```javascript
// Foco do zoom = centroide (média x,y) dos cliques do cluster.
export function focoCentroide(cluster) {
  const n = cluster.length || 1;
  const somaX = cluster.reduce((s, c) => s + c.x, 0);
  const somaY = cluster.reduce((s, c) => s + c.y, 0);
  return { x: somaX / n, y: somaY / n };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-zoom.mjs scripts/lib-zoom.test.mjs
git commit -m "feat(zoom): focoCentroide — centroide do cluster

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `nivelPorForca` — strongest click decides the zoom level

**Files:**
- Modify: `scripts/lib-zoom.mjs`
- Test: `scripts/lib-zoom.test.mjs`

The strongest click type in the cluster sets the level (double > right > left, per TABELA_FORCA).

- [ ] **Step 1: Write the failing test**

Append (add `nivelPorForca` to the import):

```javascript
test("nivelPorForca: cluster com double-click -> 2.0", () => {
  const cluster = [
    { t: 1, x: 0.5, y: 0.5, tipo: "left" },
    { t: 2, x: 0.5, y: 0.5, tipo: "double" },
  ];
  assert.equal(nivelPorForca(cluster), 2.0);
});

test("nivelPorForca: só left -> 1.5", () => {
  assert.equal(nivelPorForca([{ t: 1, x: 0.5, y: 0.5, tipo: "left" }]), 1.5);
});

test("nivelPorForca: right ganha de left", () => {
  const cluster = [
    { t: 1, x: 0.5, y: 0.5, tipo: "left" },
    { t: 2, x: 0.5, y: 0.5, tipo: "right" },
  ];
  assert.equal(nivelPorForca(cluster), 1.8);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: FAIL — `nivelPorForca is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-zoom.mjs`:

```javascript
// Nível de zoom = força do clique mais forte do cluster (double > right > left).
// Tipo desconhecido cai no nível de left (mínimo).
export function nivelPorForca(cluster, { tabela = TABELA_FORCA } = {}) {
  let nivel = tabela.left;
  for (const c of cluster) {
    const n = tabela[c.tipo];
    if (typeof n === "number" && n > nivel) nivel = n;
  }
  return nivel;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-zoom.mjs scripts/lib-zoom.test.mjs
git commit -m "feat(zoom): nivelPorForca — clique mais forte define o nível

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `montarRegioesZoom` — assemble regions (padding + ms→s + overlap merge)

**Files:**
- Modify: `scripts/lib-zoom.mjs`
- Test: `scripts/lib-zoom.test.mjs`

Orchestrates the three above: cluster → region with centroid focus, level, padded `[inicio,fim]`
in seconds (clamped at 0), then merges overlapping regions.

- [ ] **Step 1: Write the failing test**

Append (add `montarRegioesZoom` to the import):

```javascript
test("montarRegioesZoom: 1 cluster vira 1 região com padding (ms->s)", () => {
  const tel = { cliques: [
    { t: 2000, x: 0.4, y: 0.3, tipo: "double" },
    { t: 3000, x: 0.5, y: 0.3, tipo: "left" },
  ] };
  const { regioes } = montarRegioesZoom(tel, { padInicioS: 0.5, padFimS: 0.8 });
  assert.equal(regioes.length, 1);
  assert.equal(regioes[0].inicio, 1.5);   // 2.0 - 0.5
  assert.equal(regioes[0].fim, 3.8);      // 3.0 + 0.8
  assert.equal(regioes[0].nivel, 2.0);    // tem double
  assert.deepEqual(regioes[0].foco, { x: 0.45, y: 0.3 });
});

test("montarRegioesZoom: início negativo é clampado em 0", () => {
  const tel = { cliques: [{ t: 200, x: 0.5, y: 0.5, tipo: "left" }] };
  const { regioes } = montarRegioesZoom(tel, { padInicioS: 0.5, padFimS: 0.8 });
  assert.equal(regioes[0].inicio, 0);     // 0.2 - 0.5 = -0.3 -> 0
});

test("montarRegioesZoom: regiões sobrepostas são fundidas", () => {
  const tel = { cliques: [
    { t: 2000, x: 0.2, y: 0.2, tipo: "left" },   // região ~[1.5, 2.8]
    { t: 3000, x: 0.8, y: 0.8, tipo: "double" }, // região ~[2.5, 3.8] -> sobrepõe
  ] };
  // gap 2.5s mantém 1 cluster aqui; força gap pequeno pra criar 2 clusters que se sobrepõem
  const { regioes } = montarRegioesZoom(tel, { gapMs: 500, padInicioS: 0.5, padFimS: 0.8 });
  assert.equal(regioes.length, 1);            // fundidas
  assert.equal(regioes[0].inicio, 1.5);
  assert.equal(regioes[0].fim, 3.8);
  assert.equal(regioes[0].nivel, 2.0);        // a de maior força
});

test("montarRegioesZoom: sem cliques -> regioes vazio", () => {
  assert.deepEqual(montarRegioesZoom({ cliques: [] }, {}).regioes, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: FAIL — `montarRegioesZoom is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-zoom.mjs`:

```javascript
// Funde regiões cujos intervalos se sobrepõem ou se tocam. A fundida vai do menor início ao
// maior fim; foco e nível vêm da região de MAIOR nível (clique mais forte manda).
function fundirSobreposicao(regioes) {
  if (regioes.length === 0) return [];
  const ord = [...regioes].sort((a, b) => a.inicio - b.inicio);
  const out = [ord[0]];
  for (let i = 1; i < ord.length; i++) {
    const ult = out[out.length - 1];
    const r = ord[i];
    if (r.inicio <= ult.fim) {
      const forte = r.nivel > ult.nivel ? r : ult;
      out[out.length - 1] = {
        inicio: ult.inicio,
        fim: Math.max(ult.fim, r.fim),
        foco: forte.foco,
        nivel: forte.nivel,
      };
    } else {
      out.push(r);
    }
  }
  return out;
}

// Telemetria -> regiões de zoom. Cada cluster vira uma região: foco=centroide, nível=força,
// [inicio,fim] em SEGUNDOS com padding (início clampado em 0). Sobreposições são fundidas.
export function montarRegioesZoom(telemetria, {
  gapMs = GAP_MS, padInicioS = PAD_INICIO_S, padFimS = PAD_FIM_S, tabela = TABELA_FORCA,
} = {}) {
  const cliques = telemetria?.cliques || [];
  const clusters = agruparClusters(cliques, { gapMs });
  const regioes = clusters.map((cluster) => {
    const primeiro = cluster[0].t / 1000;
    const ultimo = cluster[cluster.length - 1].t / 1000;
    return {
      inicio: Math.max(0, primeiro - padInicioS),
      fim: ultimo + padFimS,
      foco: focoCentroide(cluster),
      nivel: nivelPorForca(cluster, { tabela }),
    };
  });
  return { regioes: fundirSobreposicao(regioes) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-zoom.test.mjs`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-zoom.mjs scripts/lib-zoom.test.mjs
git commit -m "feat(zoom): montarRegioesZoom — padding, ms->s, funde sobreposição

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: CLI `zoom-regioes.mjs` — read telemetria.json → write regioes-zoom.json

**Files:**
- Create: `scripts/zoom-regioes.mjs`

Thin orchestration around the pure functions: reads the telemetria, writes the regions.

- [ ] **Step 1: Write the CLI**

Create `scripts/zoom-regioes.mjs`:

```javascript
#!/usr/bin/env node
/**
 * zoom-regioes.mjs — lê o telemetria.json de uma gravação e escreve regioes-zoom.json
 * (o que o /editar-video usa pra aplicar o zoom automático). ImpulsoX AI. Clean-room.
 *
 * Uso: node scripts/zoom-regioes.mjs --slug <nome>
 *      [--gap-ms 2500] [--pad-inicio 0.5] [--pad-fim 0.8]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { montarRegioesZoom } from "./lib-zoom.mjs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const slug = flag("--slug");
  if (!slug) falhar("informe --slug <nome>.");

  const base = join("canal-youtube", "gravacoes", slug);
  const telPath = join(base, "telemetria.json");
  if (!existsSync(telPath)) falhar(`telemetria não encontrada: ${telPath} (gravou com /gravar-tela?)`);

  const telemetria = JSON.parse(readFileSync(telPath, "utf8"));
  const opts = {};
  if (flag("--gap-ms") !== undefined) opts.gapMs = Number(flag("--gap-ms"));
  if (flag("--pad-inicio") !== undefined) opts.padInicioS = Number(flag("--pad-inicio"));
  if (flag("--pad-fim") !== undefined) opts.padFimS = Number(flag("--pad-fim"));

  const regioes = montarRegioesZoom(telemetria, opts);
  const saida = join(base, "regioes-zoom.json");
  writeFileSync(saida, JSON.stringify(regioes, null, 2));
  console.log(JSON.stringify({ ok: true, slug, regioes: regioes.regioes.length, saida }, null, 2));
}
```

- [ ] **Step 2: Sanity-check it parses and errors cleanly without a slug**

Run: `node scripts/zoom-regioes.mjs`
Expected: prints `ERRO: informe --slug <nome>.`, exits non-zero.

- [ ] **Step 3: Sanity-check with a fixture telemetria**

Run:
```bash
mkdir -p canal-youtube/gravacoes/fix-zoom
printf '{"t0":"x","tela":{"largura":1536,"altura":864},"cliques":[{"t":2000,"x":0.4,"y":0.3,"tipo":"double"},{"t":3000,"x":0.5,"y":0.3,"tipo":"left"}]}' > canal-youtube/gravacoes/fix-zoom/telemetria.json
node scripts/zoom-regioes.mjs --slug fix-zoom
cat canal-youtube/gravacoes/fix-zoom/regioes-zoom.json
rm -rf canal-youtube/gravacoes/fix-zoom
```
Expected: prints `ok:true, regioes:1`; the JSON has one region with `inicio:1.5, fim:3.8, nivel:2.0`.

- [ ] **Step 4: Commit**

```bash
git add scripts/zoom-regioes.mjs
git commit -m "feat(zoom): CLI zoom-regioes — telemetria.json -> regioes-zoom.json

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final Verification

- [ ] Run unit suite: `node --test scripts/lib-zoom.test.mjs` — all green.
- [ ] Confirm spec §6 acceptance cases 1–8 each map to a task: 1-2 Task 1; 3 Task 2; 4 Task 3; 5-8 Task 4 (padding, clamp, merge, empty).
- [ ] Regression: existing suites (`lib-edicao`, `editar-video`, `lib-gravacao`, `lib-telemetria`) still pass.
- [ ] No hardware needed — 3b is pure logic; visual validation is 3c.

> **Note for execution:** the overlap-merge test (Task 4) uses `gapMs: 500` to deliberately
> create two adjacent clusters whose padded regions overlap, proving the merge. With the
> default `gapMs: 2500` those same clicks would be one cluster — both behaviors are correct.
