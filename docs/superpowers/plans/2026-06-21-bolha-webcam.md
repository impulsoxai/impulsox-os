# Bolha de Webcam (Fase 4) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compose `webcam.mp4` over `tela.mp4` as a round bubble in a corner (with soft shadow) in the `editar-video` render — the "face + screen" format.

**Architecture:** Pure helpers in `lib-edicao.mjs` (`posicaoOverlay`, `filtroBolhaWebcam`) build the ffmpeg `-filter_complex` for the bubble (circular alpha mask via `geq`, shadow via `gblur`, two overlays). `editar-video.mjs` gains a `--webcam <file>` step: when present, the body render switches from `-vf` to `-filter_complex` with two inputs and the bubble chained AFTER the zoom; when absent, behavior is unchanged. Approach proven in ffmpeg.

**Tech Stack:** Node ESM (`.mjs`), `node:test`, ffmpeg (`geq` circular mask, `gblur` shadow, `overlay`). Windows render.

**Spec:** `docs/superpowers/specs/2026-06-21-bolha-webcam-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `scripts/lib-edicao.mjs` | + `posicaoOverlay(canto, margem)` and `filtroBolhaWebcam(opts)` | Modify |
| `scripts/lib-edicao.test.mjs` | tests for both | Modify |
| `scripts/editar-video.mjs` | `--webcam` step: bubble via `-filter_complex` when present | Modify |
| `.claude/skills/editar-video/SKILL.md` | document the bubble | Modify |

**Inputs:** body video (the edited screen) as ffmpeg input `[0:v]`; `webcam.mp4` as `[1:v]`.
**Defaults:** canto `ir` (inferior-direito), bolhaTamanho `0.2`, margem `40`, shadow on.

---

## Task 1: `posicaoOverlay` — corner → overlay x:y expression

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

Maps a corner code to the ffmpeg `overlay` x:y expression, with a margin from the edge.

- [ ] **Step 1: Write the failing test**

Append to `scripts/lib-edicao.test.mjs` (add `posicaoOverlay` to the import):

```javascript
// --- Bolha de webcam (Fase 4) ---

test("posicaoOverlay: cantos viram expressão x:y do overlay", () => {
  assert.equal(posicaoOverlay("ir", 40), "W-w-40:H-h-40"); // inferior-direito
  assert.equal(posicaoOverlay("il", 40), "40:H-h-40");     // inferior-esquerdo
  assert.equal(posicaoOverlay("sr", 40), "W-w-40:40");     // superior-direito
  assert.equal(posicaoOverlay("sl", 40), "40:40");         // superior-esquerdo
});

test("posicaoOverlay: canto desconhecido cai no inferior-direito", () => {
  assert.equal(posicaoOverlay("xx", 40), "W-w-40:H-h-40");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `posicaoOverlay is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-edicao.mjs`:

```javascript
// Canto da bolha -> expressão x:y do overlay do ffmpeg (com margem da borda).
// i/s = inferior/superior; r/l = direito/esquerdo. Default: inferior-direito.
export function posicaoOverlay(canto, margem = 40) {
  const x = canto === "il" || canto === "sl" ? `${margem}` : `W-w-${margem}`;
  const y = canto === "sr" || canto === "sl" ? `${margem}` : `H-h-${margem}`;
  return `${x}:${y}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): posicaoOverlay — canto da bolha -> x:y do overlay

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `filtroBolhaWebcam` — full filter_complex for the bubble

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

Builds the full `-filter_complex` string. Takes the body filter chain (the `[0:v]` filters:
scale, legend, zoom — already joined by `,`), the bubble params, and produces the graph that
ends in `[vbolha]`. Returns `{ filtro, mapV }`.

- [ ] **Step 1: Write the failing test**

Append (add `filtroBolhaWebcam` to the import):

```javascript
test("filtroBolhaWebcam: monta máscara circular + sombra + 2 overlays", () => {
  const { filtro, mapV } = filtroBolhaWebcam({
    corpoFiltros: "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1",
    ladoBolha: 384, canto: "ir", margem: 40, sombra: true,
  });
  assert.equal(mapV, "[vbolha]");
  // corpo aplicado no [0:v] e rotulado
  assert.match(filtro, /\[0:v\]scale=1920:1080.*\[vcorpo\]/);
  // webcam recortada em círculo (geq com pow e alpha 255/0)
  assert.match(filtro, /\[1:v\]scale=384:384:force_original_aspect_ratio=increase,crop=384:384/);
  assert.match(filtro, /geq=.*a='if\(lte\(pow\(X-192,2\)\+pow\(Y-192,2\),pow\(192,2\)\),255,0\)'/);
  // sombra com gblur
  assert.match(filtro, /gblur=/);
  // dois overlays na posição do canto (inferior-direito)
  assert.match(filtro, /overlay=W-w-\d+:H-h-\d+/);
  assert.match(filtro, /\[vbolha\]$/);
});

test("filtroBolhaWebcam: sem sombra pula o gblur", () => {
  const { filtro } = filtroBolhaWebcam({
    corpoFiltros: "scale=1920:1080", ladoBolha: 384, canto: "ir", margem: 40, sombra: false,
  });
  assert.doesNotMatch(filtro, /gblur=/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `filtroBolhaWebcam is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-edicao.mjs`:

```javascript
// Filtergraph completo (-filter_complex) pra bolha de webcam REDONDA com sombra no canto.
// corpoFiltros = a cadeia do corpo (escala[,legenda][,zoom]) aplicada no [0:v]. A webcam é
// [1:v]: escala+crop quadrado, máscara circular via geq no alpha. A sombra é um círculo preto
// borrado (gblur) overlaid antes da bolha. Provado no ffmpeg. Devolve { filtro, mapV }.
export function filtroBolhaWebcam({ corpoFiltros, ladoBolha, canto = "ir", margem = 40, sombra = true }) {
  const r = Math.round(ladoBolha / 2);
  const pos = posicaoOverlay(canto, margem);
  const partes = [];
  // corpo no [0:v]
  partes.push(`[0:v]${corpoFiltros}[vcorpo]`);
  // bolha: webcam quadrada + máscara circular
  partes.push(
    `[1:v]scale=${ladoBolha}:${ladoBolha}:force_original_aspect_ratio=increase,crop=${ladoBolha}:${ladoBolha},` +
    `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(pow(X-${r},2)+pow(Y-${r},2),pow(${r},2)),255,0)'[cam]`,
  );
  let ultimo = "[vcorpo]";
  if (sombra) {
    const ladoS = ladoBolha + 36; // sombra um pouco maior
    const rS = Math.round(ladoS / 2);
    const margemS = Math.max(0, margem - 18); // desloca a sombra um pouco
    partes.push(
      `color=c=black@0:s=${ladoS}x${ladoS},format=rgba,` +
      `geq=r=0:g=0:b=0:a='if(lte(pow(X-${rS},2)+pow(Y-${rS},2),pow(${rS},2)),160,0)',gblur=sigma=12[sombra]`,
    );
    partes.push(`${ultimo}[sombra]overlay=${posicaoOverlay(canto, margemS)}[vsombra]`);
    ultimo = "[vsombra]";
  }
  partes.push(`${ultimo}[cam]overlay=${pos}[vbolha]`);
  return { filtro: partes.join(";"), mapV: "[vbolha]" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): filtroBolhaWebcam — bolha redonda + sombra (filter_complex)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `editar-video.mjs` — `--webcam` step

**Files:**
- Modify: `scripts/editar-video.mjs`

When `--webcam <file>` is passed, render the body with `-filter_complex` (two inputs) and the
bubble; otherwise keep the current `-vf` path (zero regression).

- [ ] **Step 1: Read the body-render block**

Read `scripts/editar-video.mjs` lines ~158-172 (the `filtrosCorpo` / `vfCorpo` block that ends
with `execFileSync(FFMPEG, ["-y", "-i", baseVideo, "-vf", vfCorpo, "-c:a", "copy", corpo], ...)`).
Also note the flag parsing area.

- [ ] **Step 2: Import + parse flags**

(a) Add `posicaoOverlay, filtroBolhaWebcam` to the existing import from `./lib-edicao.mjs`
(alongside `filtroZoompan`).

(b) In the flag-parsing area (near `modoZoom`), add:
```javascript
  const webcamArq = flag("--webcam");
  const cantoBolha = flag("--canto") || "ir";
  const bolhaTamanho = Number(flag("--bolha-tamanho")) || 0.2;
  const margemBolha = Number(flag("--margem")) || 40;
```

- [ ] **Step 3: Branch the body render**

Replace the body-render block (the `const filtrosCorpo = [...]` through the `execFileSync(... "-vf" ...)`) with:
```javascript
      const filtrosCorpo = [filtroEscala1080p()];
      if (temLegenda) filtrosCorpo.push(filtroLegendaAss({ assCaminho: tmpAss }));
      if (zoomFiltro) filtrosCorpo.push(zoomFiltro);
      const corpo = join(base, temLegenda ? "_legendado.mp4" : "_1080p.mp4");
      const corpoFiltros = filtrosCorpo.join(",");

      if (webcamArq && existsSync(webcamArq)) {
        // bolha de webcam: dois inputs, -filter_complex; áudio vem do corpo ([0:a]).
        const ladoBolha = Math.round(1920 * bolhaTamanho);
        const { filtro, mapV } = filtroBolhaWebcam({
          corpoFiltros, ladoBolha, canto: cantoBolha, margem: margemBolha, sombra: true,
        });
        execFileSync(FFMPEG, ["-y", "-i", baseVideo, "-i", webcamArq,
          "-filter_complex", filtro, "-map", mapV, "-map", "0:a?",
          "-c:a", "copy", corpo], { stdio: "inherit" });
      } else {
        // sem webcam: caminho atual (-vf simples), zero regressão.
        execFileSync(FFMPEG, ["-y", "-i", baseVideo, "-vf", corpoFiltros,
          "-c:a", "copy", corpo], { stdio: "inherit" });
      }
```
(`existsSync` already imported.)

- [ ] **Step 4: Sanity — script parses**

Run: `node scripts/editar-video.mjs`
Expected: prints the usage/error line, exits non-zero, no crash.

- [ ] **Step 5: Regression suites green**

Run: `node --test scripts/lib-edicao.test.mjs scripts/editar-video.test.mjs scripts/lib-zoom.test.mjs scripts/lib-telemetria.test.mjs scripts/lib-gravacao.test.mjs`
Expected: all pass (default `-vf` path unchanged → existing editar-video test green).

- [ ] **Step 6: Commit**

```bash
git add scripts/editar-video.mjs
git commit -m "feat(editar-video): --webcam compõe a bolha (filter_complex, áudio do corpo)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Smoke test end-to-end (real ffmpeg)

**Files:** none. Render-only (no webcam hardware — uses generated clips).

- [ ] **Step 1: Make a screen clip + a webcam clip**

Run:
```bash
mkdir -p /tmp/bw canal-youtube/gravacoes/smoke-bolha
ffmpeg -y -f lavfi -i "testsrc=duration=12:size=1920x1080:rate=30" -f lavfi -i "sine=frequency=300:duration=12" -shortest canal-youtube/gravacoes/smoke-bolha/tela.mp4
ffmpeg -y -f lavfi -i "testsrc2=duration=12:size=640x480:rate=30" -f lavfi -i "sine=frequency=500:duration=12" -shortest canal-youtube/gravacoes/smoke-bolha/webcam.mp4
```

- [ ] **Step 2: Render with the bubble**

Run: `node scripts/editar-video.mjs --video canal-youtube/gravacoes/smoke-bolha/tela.mp4 --slug smoke-bolha --webcam canal-youtube/gravacoes/smoke-bolha/webcam.mp4 --sem-corte-silencio --sem-intro --zoom nao --confirmar`
Expected: render completes, prints `ok:true`.

- [ ] **Step 3: Verify the bubble is present**

Run:
```bash
ffmpeg -y -i canal-youtube/edicao/smoke-bolha/final.mp4 -ss 1 -frames:v 1 -update 1 /tmp/bw/frame.png
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 canal-youtube/edicao/smoke-bolha/final.mp4
# crop the bottom-right corner where the bubble should be; it must differ from a plain testsrc corner
ffmpeg -y -i canal-youtube/edicao/smoke-bolha/final.mp4 -ss 1 -vf "crop=420:420:1500:660" -frames:v 1 -update 1 /tmp/bw/corner.png
ls -la /tmp/bw/corner.png
```
Expected: final is 1920×1080; `corner.png` exists and is non-trivial (the bubble + shadow render in that corner). Visually the corner has the round webcam over the screen.

- [ ] **Step 4: Verify the no-webcam path still works**

Run: `node scripts/editar-video.mjs --video canal-youtube/gravacoes/smoke-bolha/tela.mp4 --slug smoke-nobolha --sem-corte-silencio --sem-intro --zoom nao --confirmar`
Expected: renders fine (uses `-vf`), final 1920×1080, no bubble.

- [ ] **Step 5: Clean up**

Run: `rm -rf /tmp/bw canal-youtube/gravacoes/smoke-bolha canal-youtube/edicao/smoke-bolha canal-youtube/edicao/smoke-nobolha`

---

## Task 5: Update the skill doc

**Files:**
- Modify: `.claude/skills/editar-video/SKILL.md`

- [ ] **Step 1: Document the bubble**

Add a section: pass `--webcam <webcam.mp4>` to overlay the webcam as a round bubble (with soft
shadow) in a corner. Defaults: inferior-direito, 20% width, margin 40px. Adjustable:
`--canto ir|il|sr|sl`, `--bolha-tamanho 0.2`, `--margem 40`. The webcam's own audio is NOT used
(audio comes from the screen recording, to avoid duplicate audio). Without `--webcam`, no bubble.
Keep the file's voice.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/editar-video/SKILL.md
git commit -m "docs(editar-video): bolha de webcam (--webcam, canto, tamanho)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final Verification

- [ ] Run unit suite: `node --test scripts/lib-edicao.test.mjs` — all green.
- [ ] Confirm spec §6 acceptance cases map: 1 Task 3 (no-webcam = -vf), 2-5 Task 2 (mask/corner/size/shadow), 6 smoke Task 4.
- [ ] Smoke (Task 4) shows the bubble in the rendered corner + the no-webcam path unchanged.
- [ ] Regression: all existing suites pass; default editar-video render identical without `--webcam`.

> **Completes the PRD Gravação & Movimento:** gravar-tela → zoom-regioes → editar-video (--zoom
> auto --webcam) = record → auto-zoom → bubble, all in the pipeline. Next: the owner's usage
> guide tying it all into a simple step-by-step.
