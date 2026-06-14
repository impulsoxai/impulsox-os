# Fal.ai Imagem + Vídeo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a geração de imagem por IA pra Fal.ai (FLUX, ~13-50x mais barato) e adicionar um pipeline de vídeo/reel legendado, dentro dos padrões de script do ImpulsoX-OS.

**Architecture:** Dois scripts Node ESM sem dependências externas: `scripts/gerar-imagem.mjs` (chama a Fal via `fetch`, escreve PNG) e `scripts/gerar-video.mjs` (orquestra still→anima→costura→legenda→trilha via `ffmpeg`, escreve MP4 vertical). Ambos testados por subprocess com um mock-server HTTP local (zero crédito gasto). Wiring em `/post`, `docs/ferramentas.md` e `.env.example`.

**Tech Stack:** Node 18+ (ESM, `fetch` nativo, `node:test`), Fal.ai REST API (`FAL_KEY`), ffmpeg (binário externo, via `child_process`).

---

## File Structure

- `scripts/gerar-imagem.mjs` (criar) — CLI: prompt → PNG via Fal FLUX. Responsável só por imagem.
- `scripts/gerar-imagem.test.mjs` (criar) — testes CLI por subprocess + mock-server.
- `scripts/gerar-video.mjs` (criar) — CLI: roteiro JSON → reel.mp4. Orquestra imagem+vídeo+ffmpeg.
- `scripts/gerar-video.test.mjs` (criar) — testes do `--dry-run` (parse + plano + comando ffmpeg), sem gastar crédito nem rodar ffmpeg real.
- `docs/ferramentas.md` (modificar) — trocar bloco OpenAI por Fal.ai imagem; +Fal.ai vídeo; +ffmpeg.
- `.env.example` (modificar) — `OPENAI_API_KEY` → `FAL_KEY`.
- `.claude/skills/post/SKILL.md` (modificar) — Modo 3 usa Fal; modo reel entrega vídeo.

**Convenções herdadas (de `scripts/analisar-dados.mjs`):** shebang `#!/usr/bin/env node`; `function falhar(msg){ console.error('ERRO: '+msg); process.exit(1); }`; flags via `process.argv`; **erro sempre em PT, `FAL_KEY` nunca em log**; sem `package.json` deps novas.

**Override de teste:** os scripts leem `FAL_BASE_URL` do ambiente (default `https://fal.run`). Os testes apontam pra um servidor HTTP local, então exercitam o caminho real de `fetch`/parse sem chamar a Fal.

---

## Task 1: gerar-imagem.mjs — argumentos e validação

**Files:**
- Create: `scripts/gerar-imagem.mjs`
- Test: `scripts/gerar-imagem.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// scripts/gerar-imagem.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./gerar-imagem.mjs", import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "img-test-"));
process.on("exit", () => rmSync(tmp, { recursive: true, force: true }));

function run(args, env = {}) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], {
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
    return { code: 0, stdout, stderr: "" };
  } catch (e) {
    return { code: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

test("erro: sem prompt", () => {
  const r = run([], { FAL_KEY: "x" });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /prompt/i);
});

test("erro: sem --saida", () => {
  const r = run(["--prompt", "a calm gold studio"], { FAL_KEY: "x" });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /sa[ií]da/i);
});

test("erro: sem FAL_KEY", () => {
  const r = run(["--prompt", "x", "--saida", join(tmp, "a.png")], { FAL_KEY: "" });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /FAL_KEY/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/gerar-imagem.test.mjs`
Expected: FAIL (Cannot find module gerar-imagem.mjs).

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/gerar-imagem.mjs
#!/usr/bin/env node
/**
 * gerar-imagem.mjs — gera imagem por IA via Fal.ai (FLUX). ImpulsoX AI. Sem deps.
 *
 * Uso:
 *   FAL_KEY=... node scripts/gerar-imagem.mjs --prompt "<inglês>" --saida out.png \
 *     [--modelo schnell|dev] [--ref caminho.png] [--largura 1080 --altura 1350] [--dry-run]
 *
 * A chave NUNCA aparece em log nem em erro. Prompt em inglês rende melhor.
 * Regra de segurança: nunca gerar rosto identificável (pessoa real só com foto autorizada).
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

const prompt = flag("--prompt");
const saida = flag("--saida");
const modelo = flag("--modelo") || "schnell";
const ref = flag("--ref");
const largura = Number(flag("--largura") || 1080);
const altura = Number(flag("--altura") || 1350);
const dryRun = has("--dry-run");

if (!prompt) falhar("informe o --prompt (em inglês rende melhor).");
if (!saida) falhar("informe o --saida (caminho do .png).");
const FAL_KEY = process.env.FAL_KEY;
if (!dryRun && !FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env). Sem chave, não dá pra gerar.");
if (ref && !existsSync(ref)) falhar(`imagem-referência não encontrada: ${ref}`);
if (!["schnell", "dev"].includes(modelo)) falhar(`--modelo inválido: ${modelo} (use schnell ou dev).`);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/gerar-imagem.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/gerar-imagem.mjs scripts/gerar-imagem.test.mjs
git commit -m "feat(gerar-imagem): scaffold + validacao de argumentos"
```

---

## Task 2: gerar-imagem.mjs — chamada Fal + escrita do PNG (mock-server)

**Files:**
- Modify: `scripts/gerar-imagem.mjs`
- Test: `scripts/gerar-imagem.test.mjs`

- [ ] **Step 1: Write the failing test** (acrescentar ao test file)

```js
import { createServer } from "node:http";

// sobe um mock da Fal que devolve uma imagem PNG 1x1 em base64 (data URI)
function mockFal(handler) {
  const srv = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => handler(req, JSON.parse(body || "{}"), res));
  });
  return new Promise((resolve) => srv.listen(0, () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` })));
}
const PNG_1x1_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMCAQDJ/J0AAAAASUVORK5CYII=";

test("gera: chama a Fal e escreve o PNG (resposta com URL)", async () => {
  const out = join(tmp, "ok.png");
  const { srv, url } = await mockFal((req, payload, res) => {
    assert.ok(payload.prompt, "payload tem prompt");
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ images: [{ url: `data:image/png;base64,${PNG_1x1_B64}` }] }));
  });
  const r = run(["--prompt", "gold studio", "--saida", out], { FAL_KEY: "test", FAL_BASE_URL: url });
  srv.close();
  assert.equal(r.code, 0, r.stderr);
  assert.ok(existsSync(out), "PNG foi escrito");
});

test("dry-run: não chama a Fal e imprime o plano", () => {
  const out = join(tmp, "dry.png");
  const r = run(["--prompt", "x", "--saida", out, "--dry-run"], { FAL_KEY: "" });
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, /schnell/);
  assert.ok(!existsSync(out), "dry-run não escreve arquivo");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/gerar-imagem.test.mjs`
Expected: FAIL (script sai sem chamar nada / sem escrever PNG).

- [ ] **Step 3: Write minimal implementation** (acrescentar ao fim de `gerar-imagem.mjs`)

```js
// --- monta o payload e o endpoint -------------------------------------------
const BASE = process.env.FAL_BASE_URL || "https://fal.run";
// VERIFICAR no painel da Fal antes de subir: nomes de modelo podem mudar.
const ENDPOINT = ref
  ? `${BASE}/fal-ai/flux/dev/image-to-image`
  : `${BASE}/fal-ai/flux/${modelo === "dev" ? "dev" : "schnell"}`;

function refDataUri(p) {
  const b64 = readFileSync(p).toString("base64");
  const tipo = p.toLowerCase().endsWith(".jpg") || p.toLowerCase().endsWith(".jpeg") ? "jpeg" : "png";
  return `data:image/${tipo};base64,${b64}`;
}
const payload = {
  prompt,
  num_images: 1,
  image_size: { width: largura, height: altura },
  ...(ref ? { image_url: refDataUri(ref), strength: 0.85 } : {}),
};

if (dryRun) {
  console.log(JSON.stringify({ dry_run: true, modelo, endpoint: ENDPOINT, largura, altura, ref: !!ref }, null, 2));
  process.exit(0);
}

// --- chama a Fal e salva ----------------------------------------------------
async function baixar(urlOuData) {
  if (urlOuData.startsWith("data:")) return Buffer.from(urlOuData.split(",")[1], "base64");
  const resp = await fetch(urlOuData);
  if (!resp.ok) falhar(`falha ao baixar a imagem gerada (HTTP ${resp.status}).`);
  return Buffer.from(await resp.arrayBuffer());
}
try {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (resp.status === 401) falhar("FAL_KEY inválida ou sem permissão.");
  if (resp.status === 402) falhar("conta Fal sem crédito. Recarregue antes de gerar.");
  if (resp.status === 429) falhar("limite de uso da Fal atingido (rate limit). Tente em instantes.");
  if (!resp.ok) falhar(`Fal retornou HTTP ${resp.status}. ${(await resp.text()).slice(0, 200)}`);
  const data = await resp.json();
  const img = data?.images?.[0]?.url;
  if (!img) falhar("resposta da Fal sem imagem (prompt pode ter sido recusado).");
  writeFileSync(saida, await baixar(img));
  console.log(JSON.stringify({ ok: true, saida, modelo }, null, 2));
} catch (e) {
  if (e?.code === "ENOTFOUND" || e?.cause) falhar("falha de rede ao chamar a Fal.");
  falhar(String(e?.message || e).replace(FAL_KEY || "", "***"));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/gerar-imagem.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/gerar-imagem.mjs scripts/gerar-imagem.test.mjs
git commit -m "feat(gerar-imagem): chamada Fal FLUX + escrita do PNG + dry-run"
```

---

## Task 3: gerar-imagem.mjs — erro de prompt recusado e chave fora do log

**Files:**
- Test: `scripts/gerar-imagem.test.mjs`

- [ ] **Step 1: Write the failing test** (acrescentar)

```js
test("erro amigável quando a Fal recusa o prompt (sem images)", async () => {
  const out = join(tmp, "rec.png");
  const { srv, url } = await mockFal((req, payload, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ images: [] }));
  });
  const r = run(["--prompt", "x", "--saida", out], { FAL_KEY: "test", FAL_BASE_URL: url });
  srv.close();
  assert.equal(r.code, 1);
  assert.match(r.stderr, /recusad|sem imagem/i);
});

test("a FAL_KEY nunca aparece no stderr", async () => {
  const out = join(tmp, "k.png");
  const { srv, url } = await mockFal((req, payload, res) => { res.writeHead(500); res.end("boom"); });
  const r = run(["--prompt", "x", "--saida", out], { FAL_KEY: "super-secreta-123", FAL_BASE_URL: url });
  srv.close();
  assert.equal(r.code, 1);
  assert.doesNotMatch(r.stderr, /super-secreta-123/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/gerar-imagem.test.mjs`
Expected: a 2ª pode FAIL se o erro vazar a chave. A 1ª já passa (cobre `sem imagem`). Confirme as duas verdes após o passo 3.

- [ ] **Step 3: Write minimal implementation**

O código do Task 2 já cobre os dois casos (mensagem "sem imagem" e `.replace(FAL_KEY,'***')`). Se a 2ª falhar, garanta que TODA chamada a `falhar()` no `catch` passe pelo replace — confirme que não há `console.error` solto com a chave. Nenhuma mudança de código nova deve ser necessária; ajuste só se um teste apontar vazamento.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/gerar-imagem.test.mjs`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/gerar-imagem.test.mjs
git commit -m "test(gerar-imagem): prompt recusado + chave nunca em log"
```

---

## Task 4: gerar-video.mjs — parse do roteiro e plano de cenas (dry-run)

**Files:**
- Create: `scripts/gerar-video.mjs`
- Test: `scripts/gerar-video.test.mjs`

Formato do roteiro (JSON), produzido pelo `/post` e aprovado antes de gerar:
```json
{ "slug":"reel-x", "cenas":[ {"texto":"legenda 1","visual":"prompt da still 1","segundos":5} ] }
```

- [ ] **Step 1: Write the failing test**

```js
// scripts/gerar-video.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./gerar-video.mjs", import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "vid-test-"));
process.on("exit", () => rmSync(tmp, { recursive: true, force: true }));

function run(args, env = {}) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8", env: { ...process.env, ...env } });
    return { code: 0, stdout, stderr: "" };
  } catch (e) { return { code: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" }; }
}
function roteiro(obj) { const p = join(tmp, `r${Math.random().toString(36).slice(2)}.json`); writeFileSync(p, JSON.stringify(obj)); return p; }

test("erro: sem roteiro", () => {
  const r = run([]); assert.equal(r.code, 1); assert.match(r.stderr, /roteiro/i);
});

test("erro: roteiro sem cenas", () => {
  const r = run([roteiro({ slug: "x", cenas: [] }), "--dry-run"]);
  assert.equal(r.code, 1); assert.match(r.stderr, /cena/i);
});

test("dry-run: plano com 2 cenas, vertical 1080x1920, soma a duração", () => {
  const r = run([roteiro({ slug: "x", cenas: [{ texto: "a", visual: "v1", segundos: 5 }, { texto: "b", visual: "v2", segundos: 6 }] }), "--dry-run"]);
  assert.equal(r.code, 0, r.stderr);
  const plano = JSON.parse(r.stdout);
  assert.equal(plano.cenas.length, 2);
  assert.equal(plano.largura, 1080);
  assert.equal(plano.altura, 1920);
  assert.equal(plano.duracao_total, 11);
  assert.equal(plano.modelo_video, "wan");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/gerar-video.test.mjs`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/gerar-video.mjs
#!/usr/bin/env node
/**
 * gerar-video.mjs — monta um reel vertical legendado a partir de um roteiro.
 * ImpulsoX AI. Sem deps Node; usa ffmpeg (binário) e gerar-imagem.mjs + Fal vídeo.
 *
 * Uso:
 *   FAL_KEY=... node scripts/gerar-video.mjs roteiro.json --saida reel.mp4 \
 *     [--modelo wan|kling] [--ref marca.png] [--trilha musica.mp3] [--dry-run]
 *
 * Pipeline: still on-brand por cena -> anima (Fal) -> costura (ffmpeg) -> legenda
 *   -> trilha -> 1080x1920. NADA gera antes do roteiro aprovado; final passa por /revisar.
 */
import { readFileSync, existsSync } from "node:fs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
const posic = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--saida" && args[i - 1] !== "--modelo" && args[i - 1] !== "--ref" && args[i - 1] !== "--trilha");

const roteiroPath = posic[0];
if (!roteiroPath) falhar("informe o roteiro (.json com {slug, cenas:[{texto,visual,segundos}]}).");
if (!existsSync(roteiroPath)) falhar(`roteiro não encontrado: ${roteiroPath}`);
const modeloVideo = flag("--modelo") || "wan";
const dryRun = has("--dry-run");
const LARGURA = 1080, ALTURA = 1920;

let roteiro;
try { roteiro = JSON.parse(readFileSync(roteiroPath, "utf8")); }
catch { falhar("roteiro não é um JSON válido."); }
const cenas = roteiro?.cenas;
if (!Array.isArray(cenas) || cenas.length === 0) falhar("roteiro sem cenas (precisa de pelo menos uma).");
for (const [i, c] of cenas.entries()) {
  if (!c.texto) falhar(`cena ${i + 1} sem "texto" (a legenda).`);
  if (!c.visual) falhar(`cena ${i + 1} sem "visual" (o prompt da still).`);
}
const duracaoTotal = cenas.reduce((s, c) => s + (Number(c.segundos) || 5), 0);

if (dryRun) {
  console.log(JSON.stringify({
    dry_run: true, slug: roteiro.slug, largura: LARGURA, altura: ALTURA,
    modelo_video: modeloVideo, duracao_total: duracaoTotal,
    cenas: cenas.map((c) => ({ texto: c.texto, segundos: Number(c.segundos) || 5 })),
  }, null, 2));
  process.exit(0);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/gerar-video.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/gerar-video.mjs scripts/gerar-video.test.mjs
git commit -m "feat(gerar-video): parse do roteiro + plano de cenas (dry-run)"
```

---

## Task 5: gerar-video.mjs — montagem ffmpeg (comando testável)

**Files:**
- Modify: `scripts/gerar-video.mjs`
- Test: `scripts/gerar-video.test.mjs`

Estratégia de teste: extrair a função que **monta os argumentos do ffmpeg** e exportá-la pra um teste unitário importável, sem rodar ffmpeg.

- [ ] **Step 1: Write the failing test** (novo arquivo de teste unitário da função)

```js
// acrescentar ao scripts/gerar-video.test.mjs
import { argsFfmpeg } from "./gerar-video.mjs";

test("argsFfmpeg: gera args com escala vertical e legenda drawtext", () => {
  const a = argsFfmpeg({
    clipes: ["/t/c0.mp4", "/t/c1.mp4"],
    legendas: ["primeira", "segunda"],
    trilha: "/t/m.mp3",
    saida: "/t/reel.mp4",
    largura: 1080, altura: 1920, fonte: "/t/fonte.ttf", cor: "#d4af37",
  });
  const s = a.join(" ");
  assert.match(s, /1080:1920/);          // escala vertical
  assert.match(s, /drawtext/);            // legenda queimada
  assert.match(s, /\/t\/reel\.mp4/);      // saída
  assert.match(s, /\/t\/m\.mp3/);         // trilha
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/gerar-video.test.mjs`
Expected: FAIL (`argsFfmpeg` não exportada).

- [ ] **Step 3: Write minimal implementation** (acrescentar antes do bloco `if (dryRun)`, e exportar)

```js
// monta os argumentos do ffmpeg: concatena clipes, escala 9:16, queima legenda por
// cena, mixa trilha. Função pura (testável sem rodar ffmpeg).
export function argsFfmpeg({ clipes, legendas, trilha, saida, largura, altura, fonte, cor }) {
  const inputs = clipes.flatMap((c) => ["-i", c]);
  if (trilha) inputs.push("-i", trilha);
  // escala+pad cada clipe pra 9:16 e queima a legenda da cena
  const filtros = clipes.map((_, i) => {
    const txt = (legendas[i] || "").replace(/:/g, "\\:").replace(/'/g, "\\'");
    return `[${i}:v]scale=${largura}:${altura}:force_original_aspect_ratio=increase,` +
      `crop=${largura}:${altura},` +
      `drawtext=fontfile='${fonte}':text='${txt}':fontcolor=${cor}:fontsize=54:` +
      `box=1:boxcolor=black@0.45:boxborderw=18:x=(w-text_w)/2:y=h-h/4[v${i}]`;
  });
  const concatIns = clipes.map((_, i) => `[v${i}]`).join("");
  const filtro = `${filtros.join(";")};${concatIns}concat=n=${clipes.length}:v=1:a=0[vout]`;
  const map = ["-map", "[vout]"];
  if (trilha) map.push("-map", `${clipes.length}:a`, "-shortest");
  return [
    "-y", ...inputs, "-filter_complex", filtro, ...map,
    "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", saida,
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/gerar-video.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/gerar-video.mjs scripts/gerar-video.test.mjs
git commit -m "feat(gerar-video): montagem dos args do ffmpeg (funcao pura testavel)"
```

---

## Task 6: gerar-video.mjs — orquestração real (still → anima → ffmpeg)

**Files:**
- Modify: `scripts/gerar-video.mjs`

Sem teste automático novo (gera crédito e roda ffmpeg real). Validação é manual (Task 8). Implementa a parte que, fora do dry-run, executa o pipeline.

- [ ] **Step 1: Implementar o pipeline** (acrescentar ao fim de `gerar-video.mjs`, depois do bloco dry-run)

```js
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env).");
const BASE = process.env.FAL_BASE_URL || "https://queue.fal.run";
const saida = flag("--saida") || join(dirname(roteiroPath), `${roteiro.slug || "reel"}.mp4`);
const ref = flag("--ref");
const trilha = flag("--trilha");
const GERAR_IMG = fileURLToPath(new URL("./gerar-imagem.mjs", import.meta.url));

// ffmpeg presente?
try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); }
catch { falhar("ffmpeg não encontrado. Instale (ex.: choco install ffmpeg / brew install ffmpeg)."); }

const work = mkdtempSync(join(tmpdir(), "reel-"));
const clipes = [], legendas = [];
// VERIFICAR no painel da Fal os nomes de modelo de vídeo antes de subir.
const MODELO_EP = modeloVideo === "kling" ? "fal-ai/kling-video/v2/standard/image-to-video" : "fal-ai/wan-i2v";

async function falVideo(stillPath, segundos) {
  const b64 = readFileSync(stillPath).toString("base64");
  const sub = await fetch(`${BASE}/${MODELO_EP}`, {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: `data:image/png;base64,${b64}`, duration: String(segundos) }),
  });
  if (!sub.ok) falhar(`Fal vídeo HTTP ${sub.status}.`);
  const { request_id } = await sub.json();
  // polling do queue até completar
  for (let t = 0; t < 120; t++) {
    await new Promise((r) => setTimeout(r, 3000));
    const st = await fetch(`${BASE}/${MODELO_EP}/requests/${request_id}/status`, { headers: { Authorization: `Key ${FAL_KEY}` } });
    const sj = await st.json();
    if (sj.status === "COMPLETED") break;
    if (sj.status === "FAILED") falhar("geração de vídeo falhou na Fal.");
  }
  const res = await fetch(`${BASE}/${MODELO_EP}/requests/${request_id}`, { headers: { Authorization: `Key ${FAL_KEY}` } });
  const rj = await res.json();
  const vurl = rj?.video?.url || rj?.output?.video?.url;
  if (!vurl) falhar("resposta da Fal sem vídeo.");
  const buf = Buffer.from(await (await fetch(vurl)).arrayBuffer());
  const out = join(work, `c${clipes.length}.mp4`);
  writeFileSync(out, buf);
  return out;
}

for (const [i, c] of cenas.entries()) {
  const segundos = Number(c.segundos) || 5;
  const still = join(work, `s${i}.png`);
  // still on-brand (schnell pra iterar barato); --ref opcional
  const imgArgs = ["--prompt", c.visual, "--saida", still, "--modelo", "schnell", "--largura", String(LARGURA), "--altura", String(ALTURA)];
  if (ref) imgArgs.push("--ref", ref);
  execFileSync("node", [GERAR_IMG, ...imgArgs], { stdio: "inherit", env: process.env });
  clipes.push(await falVideo(still, segundos));
  legendas.push(c.texto);
}

const fonte = process.env.REEL_FONTE || "C:/Windows/Fonts/arialbd.ttf"; // a skill passa a fonte da marca
const cor = process.env.REEL_COR || "#d4af37";
execFileSync("ffmpeg", argsFfmpeg({ clipes, legendas, trilha, saida, largura: LARGURA, altura: ALTURA, fonte, cor }), { stdio: "inherit" });
console.log(JSON.stringify({ ok: true, saida, cenas: cenas.length, duracao_total: duracaoTotal }, null, 2));
```

- [ ] **Step 2: Sanidade do dry-run (não quebrou)**

Run: `node --test scripts/gerar-video.test.mjs`
Expected: PASS (4 tests) — a orquestração só roda fora do dry-run.

- [ ] **Step 3: Commit**

```bash
git add scripts/gerar-video.mjs
git commit -m "feat(gerar-video): orquestracao still->anima->ffmpeg (Fal video)"
```

---

## Task 7: Wiring — ferramentas.md, .env.example, /post

**Files:**
- Modify: `docs/ferramentas.md`
- Modify: `.env.example`
- Modify: `.claude/skills/post/SKILL.md`

- [ ] **Step 1: `.env.example` — trocar OpenAI por Fal**

Substituir o bloco:
```
# --- Gerar imagem por IA (/post Modo 3) ---
OPENAI_API_KEY=
```
por:
```
# --- Gerar imagem e vídeo por IA via Fal.ai (/post Modo 3 e reel) ---
FAL_KEY=
```

- [ ] **Step 2: `docs/ferramentas.md` — trocar a seção "Gerar imagem por IA"**

Substituir o bloco "### OpenAI — API de geração de imagem (`gpt-image`)" por:
```markdown
### Fal.ai — geração de imagem (FLUX)
- **Resolve:** gera imagem pro carrossel/reel do `/post` (Modo 3) e stills do pipeline de vídeo.
- **Conta:** sim — Fal.ai com crédito pré-pago. **`.env`:** `FAL_KEY`.
- **Script:** `scripts/gerar-imagem.mjs` — `--prompt` (inglês), `--saida`, `--modelo schnell|dev`, `--ref` (imagem-referência da marca). schnell (~$0,003) pra iterar, dev (~$0,025) pro final.
- **Pegadinha:** prompt em inglês rende melhor; nomes de modelo podem mudar (reconferir painel da Fal). Resposta vem como URL ou data-URI — o script trata os dois.
- **Segurança:** nunca rosto identificável sem foto real autorizada. Chave nunca em log.
- **Quem usa:** `/post`, `/identidade`, `/criar-ebook`, `/relatorio`, `/perfil-ig`.

### Fal.ai — geração de vídeo (reel)
- **Resolve:** anima uma still on-brand em clipe (5-15s). Base do reel do `/post`.
- **Conta:** mesma `FAL_KEY`. **Modelos:** Wan 2.5 (~$0,05/s, default) ou Kling (~$0,07/s).
- **Script:** `scripts/gerar-video.mjs` (orquestra still→anima→ffmpeg). Fila assíncrona (submit + polling).
- **Quem usa:** `/post` (modo reel). Custo de um reel 20s ≈ $1-1,50.

### ffmpeg — montagem de vídeo
- **Resolve:** costura clipes, queima legenda, mixa trilha, exporta vertical 1080x1920.
- **Conta:** não — binário local. **Instalar:** `choco install ffmpeg` (Win) / `brew install ffmpeg` (Mac).
- **Quem usa:** `scripts/gerar-video.mjs`. Trilha: arquivo royalty-free em `dados/audio/` do clone.
```

- [ ] **Step 3: `.claude/skills/post/SKILL.md` — Modo 3 e reel**

Onde o Modo 3 menciona geração de imagem, trocar a referência de provider pra Fal (`scripts/gerar-imagem.mjs`, `FAL_KEY`). No modo reel, trocar "entrega o roteiro" por: "entrega o roteiro pra aprovação e, aprovado, **gera o reel** via `scripts/gerar-video.mjs` (still on-brand → anima → legenda → trilha → 1080x1920). Vídeo é a parte cara: só gera depois do roteiro aprovado; o final passa por `/revisar` antes de publicar." Manter a regra "nunca rosto identificável sem foto autorizada".

- [ ] **Step 4: Commit**

```bash
git add docs/ferramentas.md .env.example .claude/skills/post/SKILL.md
git commit -m "feat: wiring Fal.ai (imagem+video) no /post, ferramentas e .env"
```

---

## Task 8: Validação real (1x, barata) + bump de versão

**Files:**
- Modify: `CLAUDE.md` (rodapé de versão)

- [ ] **Step 1: Validar imagem de verdade (com FAL_KEY real)**

Run: `FAL_KEY=<real> node scripts/gerar-imagem.mjs --prompt "a calm gold and dark-violet abstract studio backdrop, premium, minimal" --saida /tmp/teste.png --modelo schnell`
Expected: cria `/tmp/teste.png`. Abrir e conferir que é uma imagem (não erro).

- [ ] **Step 2: Validar um clipe curto (roteiro de 1 cena, 3s)**

Criar `/tmp/r.json`: `{"slug":"t","cenas":[{"texto":"teste","visual":"calm gold abstract motion","segundos":3}]}`
Run: `FAL_KEY=<real> node scripts/gerar-video.mjs /tmp/r.json --saida /tmp/reel.mp4`
Expected: cria `/tmp/reel.mp4` 1080x1920. Conferir com `ffprobe /tmp/reel.mp4` que resolução = 1080x1920.

- [ ] **Step 3: Bump de versão**

Em `CLAUDE.md`, rodapé: `v0.2.3` → `v0.2.4`.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "chore: Fal.ai imagem+video validado; motor v0.2.4"
```

---

## Self-Review (cobertura do spec)

- Fase 1 imagem (Fal substitui OpenAI) → Tasks 1-3. ✓
- Trava de marca (prompt + `--ref`) → Task 2 (image-to-image) + Task 7 (a skill injeta paleta). ✓
- Fase 2 vídeo + legenda + trilha + vertical → Tasks 4-6. ✓
- Guarda de custo (roteiro aprovado → gera → /revisar) → Task 7 (texto do /post). ✓
- ffmpeg documentado + erro se ausente → Task 6 (check) + Task 7 (doc). ✓
- Erros PT, chave fora do log → Tasks 1-3. ✓
- Testes sem gastar crédito (mock-server + dry-run) → Tasks 2, 4, 5. Validação real barata → Task 8. ✓
- `.env.example` e `ferramentas.md` → Task 7. ✓
- Fora de escopo (TikTok, TTS) → não há task (correto). ✓

> Nota pro engenheiro: os nomes exatos de endpoint/modelo da Fal (FLUX, Wan, Kling) e os
> campos de payload **podem mudar** — reconferir o painel/README oficial da Fal antes de
> subir (regra da casa pra ferramenta de terceiro). A estrutura (auth `Key`, sync pra
> imagem, queue+polling pra vídeo, resposta com `url`/data-URI) está correta; só os
> slugs de modelo e nomes de campo merecem conferência.
