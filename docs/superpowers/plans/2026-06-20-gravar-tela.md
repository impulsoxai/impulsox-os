# /gravar-tela — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/gravar-tela` skill + scripts that record screen + mic-voice + webcam as separate raw files (`tela.mp4` + `webcam.mp4`), with the owner controlling start/stop.

**Architecture:** Pure functions in `scripts/lib-gravacao.mjs` (parse ffmpeg device list, build ffmpeg arg arrays, reconcile saved devices). Orchestrator `scripts/gravar-tela.mjs` with `iniciar`/`parar` subcommands: `iniciar` resolves devices (from `.env` or interactive list → saves `.env`), spawns two background ffmpeg processes, writes a state file with PIDs; `parar` sends `q` to each ffmpeg's stdin for a clean MP4 finalize. Pure ffmpeg, no native deps, Windows-only.

**Tech Stack:** Node ESM (`.mjs`), `node:test` + `node:assert/strict`, `node:child_process` (`spawnSync` for device-list + `spawn` detached for recording), ffmpeg (`gdigrab` screen + `dshow` webcam/mic). `process.loadEnvFile()` for `.env`, same as the rest of `scripts/`.

**Spec:** `docs/superpowers/specs/2026-06-20-gravar-tela-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `scripts/lib-gravacao.mjs` | Pure: parse device list, build ffmpeg args, reconcile saved devices | Create |
| `scripts/lib-gravacao.test.mjs` | Unit tests for the pure functions | Create |
| `scripts/gravar-tela.mjs` | Orchestrator: `iniciar` / `parar`, device pick, spawn, state, clean stop | Create |
| `.claude/skills/gravar-tela/SKILL.md` | Owner-facing guide | Create |
| `.gitignore` | Ensure `canal-youtube/gravacoes/` (big mp4s) is ignored | Modify (verify/add) |

**State file** (`canal-youtube/gravacoes/<slug>/.gravando.json`):
```json
{ "slug": "demo", "pids": { "tela": 12345, "webcam": 12346 },
  "arquivos": { "tela": "canal-youtube/gravacoes/demo/tela.mp4", "webcam": "canal-youtube/gravacoes/demo/webcam.mp4" },
  "inicio": "2026-06-20T19:00:00.000Z" }
```

**`.env` keys:** `GRAVAR_WEBCAM` (dshow video device name), `GRAVAR_MIC` (dshow audio device name).

---

## Task 1: `parseDispositivosDshow` — parse ffmpeg device list

**Files:**
- Create: `scripts/lib-gravacao.mjs`
- Create: `scripts/lib-gravacao.test.mjs`

ffmpeg `-list_devices true -f dshow -i dummy` prints lines to STDERR like:
`[in#0 @ 0x..] "HD User Facing" (video)` then an `Alternative name "@device_..."` line, and `(audio)` for mics. It ends with `Error opening input file dummy` (expected, ignored). Parse into `{ video: [{nome, alt}], audio: [{nome, alt}] }`.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib-gravacao.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDispositivosDshow } from "./lib-gravacao.mjs";

const SAIDA = `[in#0 @ 0x1] "HD User Facing" (video)
[in#0 @ 0x1]   Alternative name "@device_pnp_\\\\?\\usb#vid_0408&pid_a061"
[in#0 @ 0x1] "OBS Virtual Camera" (none)
[in#0 @ 0x1] "Grupo de microfones (Realtek(R) Audio)" (audio)
[in#0 @ 0x1]   Alternative name "@device_cm_{33D9}\\wave_{F7F7}"
Error opening input file dummy.`;

test("parseDispositivosDshow separa vídeo e áudio com alt-name", () => {
  const d = parseDispositivosDshow(SAIDA);
  assert.deepEqual(d.video, [
    { nome: "HD User Facing", alt: "@device_pnp_\\\\?\\usb#vid_0408&pid_a061" },
  ]);
  assert.deepEqual(d.audio, [
    { nome: "Grupo de microfones (Realtek(R) Audio)", alt: "@device_cm_{33D9}\\wave_{F7F7}" },
  ]);
});

test("parseDispositivosDshow ignora (none) e a linha de erro do dummy", () => {
  const d = parseDispositivosDshow(SAIDA);
  assert.equal(d.video.find((v) => v.nome === "OBS Virtual Camera"), undefined);
});

test("parseDispositivosDshow lida com device sem alt-name", () => {
  const d = parseDispositivosDshow(`[in] "Mic Solto" (audio)`);
  assert.deepEqual(d.audio, [{ nome: "Mic Solto", alt: null }]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-gravacao.test.mjs`
Expected: FAIL — module/function not found.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/lib-gravacao.mjs`:

```javascript
// lib-gravacao.mjs — funções puras pra gravação de tela (Fase 2). ZERO deps, sem rede,
// sem disco: só parseiam/montam o que o orquestrador passa pro ffmpeg. ImpulsoX AI.

// Parseia a saída de `ffmpeg -list_devices true -f dshow -i dummy` (vai pro STDERR).
// Cada device é `"Nome" (video|audio|none)`, seguido opcionalmente de uma linha
// `Alternative name "@device_..."`. A última linha "Error opening ... dummy" é esperada.
export function parseDispositivosDshow(saida) {
  const video = [];
  const audio = [];
  let ultimo = null; // {tipo, obj} pra pendurar o alt-name na próxima linha
  for (const linhaRaw of String(saida).split("\n")) {
    const linha = linhaRaw.trim();
    const md = linha.match(/"([^"]+)"\s+\((video|audio|none)\)\s*$/);
    if (md) {
      const tipo = md[2];
      if (tipo === "none") { ultimo = null; continue; }
      const obj = { nome: md[1], alt: null };
      (tipo === "video" ? video : audio).push(obj);
      ultimo = obj;
      continue;
    }
    const ma = linha.match(/Alternative name\s+"([^"]+)"/);
    if (ma && ultimo) { ultimo.alt = ma[1]; ultimo = null; }
  }
  return { video, audio };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-gravacao.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-gravacao.mjs scripts/lib-gravacao.test.mjs
git commit -m "feat(gravacao): parseDispositivosDshow — lista de webcams/mics do ffmpeg

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `argsCapturaTela` — build the gdigrab screen-capture args

**Files:**
- Modify: `scripts/lib-gravacao.mjs`
- Test: `scripts/lib-gravacao.test.mjs`

Builds the ffmpeg argument array to capture the whole desktop via `gdigrab` into an mp4 (no audio — the mic rides with the webcam). Uses `-y`, a frame rate, and a faststart flag so the file stays valid.

- [ ] **Step 1: Write the failing test**

Append to `scripts/lib-gravacao.test.mjs` (add `argsCapturaTela` to the import):

```javascript
test("argsCapturaTela monta gdigrab desktop -> mp4", () => {
  const a = argsCapturaTela({ fps: 30, saida: "out/tela.mp4" });
  assert.deepEqual(a, [
    "-y", "-f", "gdigrab", "-framerate", "30", "-i", "desktop",
    "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "out/tela.mp4",
  ]);
});

test("argsCapturaTela usa fps default 30 quando não informado", () => {
  const a = argsCapturaTela({ saida: "x.mp4" });
  assert.ok(a.includes("30"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-gravacao.test.mjs`
Expected: FAIL — `argsCapturaTela is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-gravacao.mjs`:

```javascript
// Args do ffmpeg pra capturar a TELA inteira (gdigrab, Windows) -> mp4 sem áudio.
// faststart deixa o moov atom utilizável; libx264 veryfast pra não pesar a CPU na captura.
export function argsCapturaTela({ fps = 30, saida }) {
  return [
    "-y", "-f", "gdigrab", "-framerate", String(fps), "-i", "desktop",
    "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", saida,
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-gravacao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-gravacao.mjs scripts/lib-gravacao.test.mjs
git commit -m "feat(gravacao): argsCapturaTela — captura de tela via gdigrab

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `argsCapturaWebcam` — build the dshow webcam+mic args

**Files:**
- Modify: `scripts/lib-gravacao.mjs`
- Test: `scripts/lib-gravacao.test.mjs`

Builds the ffmpeg args to capture the webcam (video) + the mic (audio) via `dshow` into one mp4. The dshow input names a video device and an audio device in a single `-i video=...:audio=...`.

- [ ] **Step 1: Write the failing test**

Append (add `argsCapturaWebcam` to import):

```javascript
test("argsCapturaWebcam monta dshow webcam+mic -> mp4", () => {
  const a = argsCapturaWebcam({
    webcam: "HD User Facing", mic: "Grupo de microfones (Realtek(R) Audio)",
    fps: 30, saida: "out/webcam.mp4",
  });
  assert.deepEqual(a, [
    "-y", "-f", "dshow", "-framerate", "30",
    "-i", "video=HD User Facing:audio=Grupo de microfones (Realtek(R) Audio)",
    "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-movflags", "+faststart", "out/webcam.mp4",
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-gravacao.test.mjs`
Expected: FAIL — `argsCapturaWebcam is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-gravacao.mjs`:

```javascript
// Args do ffmpeg pra capturar WEBCAM (vídeo) + MIC (áudio) via dshow -> um mp4.
// O dshow recebe os dois dispositivos no mesmo -i "video=...:audio=...".
export function argsCapturaWebcam({ webcam, mic, fps = 30, saida }) {
  return [
    "-y", "-f", "dshow", "-framerate", String(fps),
    "-i", `video=${webcam}:audio=${mic}`,
    "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-movflags", "+faststart", saida,
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-gravacao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-gravacao.mjs scripts/lib-gravacao.test.mjs
git commit -m "feat(gravacao): argsCapturaWebcam — webcam+mic via dshow

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `resolverDispositivos` — reconcile saved devices with what's connected

**Files:**
- Modify: `scripts/lib-gravacao.mjs`
- Test: `scripts/lib-gravacao.test.mjs`

Given the saved `.env` config (`{ webcam, mic }`, either may be undefined) and the currently-connected devices (from `parseDispositivosDshow`), decide whether we can record now or must ask the owner to pick. Pure — no I/O.

- [ ] **Step 1: Write the failing test**

Append (add `resolverDispositivos` to import):

```javascript
const DISP = {
  video: [{ nome: "HD User Facing", alt: null }],
  audio: [{ nome: "Mic Realtek", alt: null }, { nome: "Mic USB", alt: null }],
};

test("resolverDispositivos: env válido e conectado -> usa, sem perguntar", () => {
  const r = resolverDispositivos({ webcam: "HD User Facing", mic: "Mic USB" }, DISP);
  assert.deepEqual(r, { precisaEscolher: false, webcam: "HD User Facing", mic: "Mic USB" });
});

test("resolverDispositivos: env vazio -> precisa escolher", () => {
  const r = resolverDispositivos({}, DISP);
  assert.equal(r.precisaEscolher, true);
});

test("resolverDispositivos: mic salvo desconectado -> precisa escolher + motivo", () => {
  const r = resolverDispositivos({ webcam: "HD User Facing", mic: "Mic USB Sumido" }, DISP);
  assert.equal(r.precisaEscolher, true);
  assert.match(r.motivo, /Mic USB Sumido|não.*conect/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-gravacao.test.mjs`
Expected: FAIL — `resolverDispositivos is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/lib-gravacao.mjs`:

```javascript
// Casa o que está salvo no .env com o que está conectado agora. Se ambos existem e estão
// na lista, grava direto. Se falta algum OU o salvo sumiu (USB desplugado), pede escolha.
export function resolverDispositivos(envCfg, disponiveis) {
  const temVideo = (n) => disponiveis.video.some((d) => d.nome === n);
  const temAudio = (n) => disponiveis.audio.some((d) => d.nome === n);
  const { webcam, mic } = envCfg || {};
  if (!webcam || !mic) return { precisaEscolher: true, motivo: "nenhum dispositivo salvo ainda." };
  if (!temVideo(webcam)) return { precisaEscolher: true, motivo: `a webcam salva ("${webcam}") não está conectada.` };
  if (!temAudio(mic)) return { precisaEscolher: true, motivo: `o mic salvo ("${mic}") não está conectado.` };
  return { precisaEscolher: false, webcam, mic };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-gravacao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-gravacao.mjs scripts/lib-gravacao.test.mjs
git commit -m "feat(gravacao): resolverDispositivos — .env vs dispositivos conectados

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Orchestrator `gravar-tela.mjs` — `iniciar` / `parar`

**Files:**
- Create: `scripts/gravar-tela.mjs`
- Modify: `.gitignore`

This is the integration layer. It uses the pure functions, lists devices via ffmpeg, prompts the owner (stdin) when needed, writes the `.env`, spawns two detached ffmpeg processes, persists their PIDs, and stops them cleanly by writing `q` to each stdin. Not unit-tested (it's I/O orchestration) — verified by the smoke test in Task 6.

- [ ] **Step 1: Ensure recordings are git-ignored**

Check `.gitignore` for `canal-youtube/gravacoes/`. If absent, add it (big mp4s must never be committed):

```bash
grep -q "canal-youtube/gravacoes" .gitignore || printf "\n# gravações de tela (arquivos grandes)\ncanal-youtube/gravacoes/\n" >> .gitignore
git add .gitignore
git commit -m "chore: ignora canal-youtube/gravacoes (mp4 grandes)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 2: Write the orchestrator**

Create `scripts/gravar-tela.mjs`:

```javascript
#!/usr/bin/env node
/**
 * gravar-tela.mjs — grava TELA + VOZ(mic) + WEBCAM em arquivos crus separados.
 * O dono controla início/fim. Puro ffmpeg, Windows. ImpulsoX AI.
 *
 * Uso:
 *   node scripts/gravar-tela.mjs iniciar [--slug demo] [--reconfigurar] [--fps 30]
 *   node scripts/gravar-tela.mjs parar   [--slug demo]
 *
 * iniciar: resolve dispositivos (.env ou lista+escolha+salva), dispara 2 ffmpeg
 *   (tela.mp4 + webcam.mp4 com mic) em background, grava os PIDs em .gravando.json.
 * parar: manda 'q' no stdin de cada ffmpeg (finaliza o mp4 sem corromper) e limpa o estado.
 */
import { spawnSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync, appendFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { parseDispositivosDshow, argsCapturaTela, argsCapturaWebcam, resolverDispositivos } from "./lib-gravacao.mjs";

if (import.meta.main) { try { process.loadEnvFile(); } catch { /* sem .env: 1ª vez */ } }
const FFMPEG = process.env.FFMPEG_BIN || "ffmpeg";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const cmd = args[0];
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
const has = (n) => args.includes(n);

// pergunta no terminal (índice de 1) e devolve o item escolhido.
function escolher(lista, titulo) {
  if (lista.length === 0) falhar(`${titulo}: nenhum dispositivo encontrado.`);
  console.log(`\n${titulo}:`);
  lista.forEach((d, i) => console.log(`  ${i + 1}: ${d.nome}`));
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => {
    rl.question(`Escolha (1-${lista.length}) [1]: `, (resp) => {
      rl.close();
      const i = Math.max(1, Math.min(lista.length, Number(resp) || 1)) - 1;
      res(lista[i]);
    });
  });
}

// salva/atualiza GRAVAR_WEBCAM e GRAVAR_MIC no .env da raiz (linha a linha, sem apagar o resto).
function salvarEnv(webcam, mic) {
  const envPath = ".env";
  let linhas = existsSync(envPath) ? readFileSync(envPath, "utf8").split("\n") : [];
  const setK = (k, v) => {
    const idx = linhas.findIndex((l) => l.startsWith(k + "="));
    const linha = `${k}=${v}`;
    if (idx !== -1) linhas[idx] = linha; else linhas.push(linha);
  };
  setK("GRAVAR_WEBCAM", webcam);
  setK("GRAVAR_MIC", mic);
  writeFileSync(envPath, linhas.filter((l) => l !== "").join("\n") + "\n");
}

function listarDispositivos() {
  const r = spawnSync(FFMPEG, ["-hide_banner", "-list_devices", "true", "-f", "dshow", "-i", "dummy"], { encoding: "utf8" });
  return parseDispositivosDshow(r.stderr || ""); // a lista vai pro STDERR
}

async function iniciar() {
  try { execFFmpegVersion(); } catch { falhar("ffmpeg não encontrado no PATH."); }
  const slug = flag("--slug") || "gravacao";
  const fps = Number(flag("--fps")) || 30;
  const base = join("canal-youtube", "gravacoes", slug);
  const estado = join(base, ".gravando.json");
  if (existsSync(estado)) falhar(`já existe gravação em '${slug}'. Rode 'parar' antes.`);

  const disp = listarDispositivos();
  let r = resolverDispositivos({ webcam: process.env.GRAVAR_WEBCAM, mic: process.env.GRAVAR_MIC }, disp);
  if (has("--reconfigurar") || r.precisaEscolher) {
    if (r.motivo) console.log("• " + r.motivo);
    const webcam = await escolher(disp.video, "Webcam");
    const mic = await escolher(disp.audio, "Microfone");
    salvarEnv(webcam.nome, mic.nome);
    r = { precisaEscolher: false, webcam: webcam.nome, mic: mic.nome };
    console.log("✓ salvo no .env (use --reconfigurar pra trocar depois).");
  }

  mkdirSync(base, { recursive: true });
  const telaMp4 = join(base, "tela.mp4");
  const webcamMp4 = join(base, "webcam.mp4");
  const pTela = spawn(FFMPEG, argsCapturaTela({ fps, saida: telaMp4 }), { stdio: ["pipe", "ignore", "ignore"] });
  const pWeb = spawn(FFMPEG, argsCapturaWebcam({ webcam: r.webcam, mic: r.mic, fps, saida: webcamMp4 }), { stdio: ["pipe", "ignore", "ignore"] });
  writeFileSync(estado, JSON.stringify({
    slug, pids: { tela: pTela.pid, webcam: pWeb.pid },
    arquivos: { tela: telaMp4, webcam: webcamMp4 }, inicio: new Date().toISOString(),
  }, null, 2));
  // desgruda os filhos pra eles seguirem gravando depois deste processo sair.
  pTela.unref(); pWeb.unref();
  console.log(`\n🔴 gravando em '${slug}'. Quando terminar: node scripts/gravar-tela.mjs parar --slug ${slug}`);
  process.exit(0);
}

function parar() {
  const slug = flag("--slug") || "gravacao";
  const estado = join("canal-youtube", "gravacoes", slug, ".gravando.json");
  if (!existsSync(estado)) falhar(`nada gravando em '${slug}'.`);
  const st = JSON.parse(readFileSync(estado, "utf8"));
  for (const [nome, pid] of Object.entries(st.pids)) {
    try {
      // 'q' no stdin encerra o ffmpeg LIMPO (escreve o moov atom). No Windows não dá pra
      // reabrir o stdin de outro processo; então usamos taskkill SEM /F (pede encerramento
      // gracioso via WM_CLOSE) como caminho compatível. /F corromperia o mp4.
      spawnSync("taskkill", ["/PID", String(pid), "/T"], { stdio: "ignore" });
    } catch (e) { console.error(`aviso: não consegui parar ${nome} (pid ${pid}): ${e.message}`); }
  }
  rmSync(estado, { force: true });
  console.log(`✓ pronto: ${st.arquivos.tela} + ${st.arquivos.webcam}\n→ próximo: /editar-video pra cortar/acelerar/legendar.`);
}

function execFFmpegVersion() { spawnSync(FFMPEG, ["-version"], { stdio: "ignore" }); }

if (import.meta.main) {
  if (cmd === "iniciar") iniciar();
  else if (cmd === "parar") parar();
  else falhar("uso: node scripts/gravar-tela.mjs iniciar|parar [--slug <nome>] [--reconfigurar]");
}
```

> **Clean-stop note for the implementer:** the spec requires a clean MP4 finalize. The
> ideal is writing `q` to ffmpeg's stdin, but a detached/`unref`'d child's stdin is not
> reliably writable from a *separate* `parar` invocation (different process). The plan uses
> `taskkill /PID <pid> /T` **without `/F`** — on Windows this sends a graceful close that
> ffmpeg traps to finalize the moov atom; `/F` would hard-kill and truncate. The smoke test
> (Task 6) MUST verify the resulting mp4 has a valid duration. If `taskkill` without `/F`
> does NOT finalize cleanly in practice, fall back to keeping `parar` in the SAME process as
> `iniciar` (foreground recording with a keypress to stop) — flag this to the controller
> rather than shipping corrupt mp4s.

- [ ] **Step 3: Sanity-check it parses and prints usage**

Run: `node scripts/gravar-tela.mjs`
Expected: prints the usage line and exits non-zero (no crash).

- [ ] **Step 4: Commit**

```bash
git add scripts/gravar-tela.mjs
git commit -m "feat(gravacao): orquestrador gravar-tela iniciar/parar

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Smoke test end-to-end (real ffmpeg + webcam — owner's machine)

**Files:** none (manual verification). MUST run on the owner's Windows machine with a webcam/mic; cannot run in headless CI.

- [ ] **Step 1: Start a short recording**

Run: `node scripts/gravar-tela.mjs iniciar --slug smoke-grava`
Expected: lists devices (first run), you pick webcam + mic, prints "🔴 gravando".

- [ ] **Step 2: Let it run ~5 seconds, then stop**

Wait ~5s, then run: `node scripts/gravar-tela.mjs parar --slug smoke-grava`
Expected: prints "✓ pronto" with both file paths.

- [ ] **Step 3: Verify both files are valid**

Run:
```bash
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 canal-youtube/gravacoes/smoke-grava/tela.mp4
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 canal-youtube/gravacoes/smoke-grava/webcam.mp4
```
Expected: both print a duration > 0 (≈5s). **If duration errors or is empty, the clean-stop failed → apply the fallback noted in Task 5.**

- [ ] **Step 4: Confirm it feeds the pipeline**

Run: `node scripts/editar-video.mjs --video canal-youtube/gravacoes/smoke-grava/tela.mp4 --slug smoke-grava-edit`
Expected: the dry-run JSON prints (proving the recording is a valid input for the editor).

- [ ] **Step 5: Clean up**

Run: `rm -rf canal-youtube/gravacoes/smoke-grava canal-youtube/edicao/smoke-grava-edit`

---

## Task 7: Skill doc `/gravar-tela`

**Files:**
- Create: `.claude/skills/gravar-tela/SKILL.md`

- [ ] **Step 1: Write the skill doc**

Create `.claude/skills/gravar-tela/SKILL.md` with frontmatter (`name`, `description` covering "/gravar-tela", "gravar minha tela", "grava a apresentação", "captura de tela com webcam") and a body covering: what it records (tela + voz + webcam, crus e separados), how to `iniciar`/`parar`, the device pick on first run + `--reconfigurar`, the mic note (interno OU USB, re-lista se sumir), where files land (`canal-youtube/gravacoes/<slug>/`), and the next step (`/editar-video`). Match the voice of the other SKILL.md files (direct, professor-not-salesman, Portuguese). State the owner controls start/stop (the system does not hold the recording).

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/gravar-tela/SKILL.md
git commit -m "docs(gravar-tela): skill de captura de tela + webcam

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final Verification

- [ ] Run unit suite: `node --test scripts/lib-gravacao.test.mjs` — all green.
- [ ] Confirm spec §7 acceptance cases 1–7 are each covered (1-2 smoke Task 6; 3-4 resolverDispositivos Task 4 + orchestrator; 5 clean-stop Task 5/6; 6 dupla-iniciar guard Task 5; 7 pipeline Task 6 step 4).
- [ ] Owner ran the Task 6 smoke on their machine and both mp4s are valid (the one step that needs real hardware).
- [ ] Optionally run `/testpilot` on `scripts/` before declaring Fase 2 done.

> **Known risk carried to execution:** the clean-stop mechanism (Task 5). If `taskkill` without `/F` does not finalize the mp4, the fallback is foreground recording with keypress-to-stop. This is the one thing that can only be confirmed on real hardware (Task 6 step 3).
