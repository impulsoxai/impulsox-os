# Conector de publicação no Instagram — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `scripts/publicar-instagram.mjs` publica carrossel, post único e reel no Instagram (Graph API) a partir de uma peça do `/post`, com a mídia hospedada no Fal CDN, dry-run por padrão e `--confirmar` pra publicar de verdade.

**Architecture:** Helper compartilhado `lib-fal-upload.mjs` (extraído do `gerar-avatar.mjs`) sobe a mídia → URL pública. `publicar-instagram.mjs` detecta a mídia da peça, monta o payload do container por tipo (funções puras), e orquestra o fluxo 2-passos da Graph API (criar container → `media_publish`), com base-URL configurável pra testar contra mock — nunca publica de verdade no teste.

**Tech Stack:** Node ≥18 ESM (`fetch`, `FormData`, `Blob` nativos — ZERO deps), `node --test`. Graph API v21.0. Fal CDN (`FAL_KEY`).

---

## File Structure

- `scripts/lib-fal-upload.mjs` — CRIAR. `uploadParaFalCDN(caminho, opts)` → URL pública. Lança Error (não `process.exit`).
- `scripts/lib-fal-upload.test.mjs` — CRIAR. Mock do fluxo token→upload.
- `scripts/gerar-avatar.mjs` — MODIFICAR. Trocar o `uploadArquivo` interno pelo import do helper (mata duplicação).
- `scripts/publicar-instagram.mjs` — CRIAR. Detecção de mídia + payload + orquestração + CLI.
- `scripts/publicar-instagram.test.mjs` — CRIAR. Funções puras + fluxo contra mock Graph API.
- `.claude/skills/publicar/SKILL.md` — MODIFICAR. Refletir o script real.
- `docs/ferramentas.md` — MODIFICAR. Bloco do conector.

**Contrato das funções puras (fixado aqui):**
```js
detectarMidia(dir, tipo) -> ["/abs/slide-01.png", ...]   // ordenado; lança se faltar/contagem inválida
lerLegenda(dir) -> "texto da legenda"                     // de legenda.md; lança se vazio
payloadContainer(tipo, { url, urls, caption, filho })     // -> objeto pro POST /media
```

---

### Task 1: `lib-fal-upload.mjs` — helper de upload pro Fal CDN

**Files:**
- Create: `scripts/lib-fal-upload.mjs`, `scripts/lib-fal-upload.test.mjs`

- [ ] **Step 1: Write the failing test** — `scripts/lib-fal-upload.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { uploadParaFalCDN } from "./lib-fal-upload.mjs";

function mockFal() {
  // 1) /storage/auth/token devolve {base_url: <este server>, token}
  // 2) /files/upload devolve {access_url}
  return createServer((req, res) => {
    if (req.url.includes("/storage/auth/token")) {
      const base = `http://127.0.0.1:${req.socket.localPort}`;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ base_url: base, token: "tok-temp" }));
    } else if (req.url.includes("/files/upload")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ access_url: "https://cdn.fal.test/abc.png" }));
    } else { res.writeHead(404).end("no"); }
  });
}

test("uploadParaFalCDN sobe e devolve access_url", async () => {
  const srv = mockFal();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const dir = mkdtempSync(join(tmpdir(), "up-"));
  const f = join(dir, "x.png"); writeFileSync(f, "PNGDATA");
  const url = await uploadParaFalCDN(f, { falKey: "k", restBase: base });
  assert.equal(url, "https://cdn.fal.test/abc.png");
  srv.close();
});

test("uploadParaFalCDN sem FAL_KEY lança erro claro, sem vazar chave", async () => {
  await assert.rejects(
    () => uploadParaFalCDN("x.png", { falKey: "" }),
    (e) => /FAL_KEY/.test(e.message) && !/segredo/.test(e.message)
  );
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-fal-upload.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation** — `scripts/lib-fal-upload.mjs`:

```js
// Sobe um arquivo local pro Fal CDN e devolve a URL pública (access_url).
// Lança Error (não process.exit) — o chamador trata. FAL_KEY/Bearer nunca em mensagem de erro.
import { readFileSync } from "node:fs";

const MIME = { mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", mp4: "audio/mp4",
  ogg: "audio/ogg", aac: "audio/aac", jpg: "image/jpeg", jpeg: "image/jpeg",
  png: "image/png", webp: "image/webp" };

export async function uploadParaFalCDN(caminho, opts = {}) {
  const falKey = opts.falKey ?? process.env.FAL_KEY;
  const restBase = opts.restBase ?? process.env.FAL_REST_BASE ?? "https://rest.alpha.fal.ai";
  if (!falKey) throw new Error("FAL_KEY não definida no ambiente (.env).");
  const ext = caminho.split(".").pop().toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const nome = caminho.split(/[\\/]/).pop();
  const tr = await fetch(`${restBase}/storage/auth/token?storage_type=fal-cdn-v3`, {
    method: "POST", headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" }, body: "{}",
  });
  const tTxt = await tr.text();
  if (!tr.ok) throw new Error(`Fal auth HTTP ${tr.status}: ${tTxt.slice(0, 200)}`);
  let tj; try { tj = JSON.parse(tTxt); } catch { throw new Error(`Fal auth: resposta inválida. ${tTxt.slice(0, 200)}`); }
  const form = new FormData();
  form.append("file", new Blob([readFileSync(caminho)], { type: mime }), nome);
  const ur = await fetch(`${tj.base_url}/files/upload`, {
    method: "POST", headers: { Authorization: `Bearer ${tj.token}` }, body: form,
  });
  const uTxt = await ur.text();
  if (!ur.ok) throw new Error(`Fal upload HTTP ${ur.status}: ${uTxt.slice(0, 200)}`);
  let uj; try { uj = JSON.parse(uTxt); } catch { throw new Error(`Fal upload: resposta inválida. ${uTxt.slice(0, 200)}`); }
  if (!uj.access_url) throw new Error(`Fal upload: URL não retornada. ${JSON.stringify(uj).slice(0, 200)}`);
  return uj.access_url;
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-fal-upload.test.mjs` → 2 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-fal-upload.mjs scripts/lib-fal-upload.test.mjs
git commit -m "feat(publicar): lib-fal-upload — helper de upload pro Fal CDN (URL pública)"
```

---

### Task 2: Refatorar `gerar-avatar.mjs` pra usar o helper (mata duplicação)

**Files:**
- Modify: `scripts/gerar-avatar.mjs`

- [ ] **Step 1: Trocar o `uploadArquivo` interno pelo import.** No topo (junto dos outros imports):

```js
import { uploadParaFalCDN } from "./lib-fal-upload.mjs";
```

Remover a função `uploadArquivo` inteira (o bloco `async function uploadArquivo(caminho) { ... return uj.access_url; }`) e trocar a chamada `await uploadArquivo(audio)` por:

```js
await uploadParaFalCDN(audio)
```

O `uploadParaFalCDN` lê `FAL_KEY` de `process.env` por default — o `gerar-avatar` já tem `FAL_KEY` no ambiente, então funciona igual. (A diferença: o helper lança Error em vez de `falhar`. Envolver a chamada num try/catch que chama `falhar(e.message)` pra manter o comportamento de saída do script:)

```js
let audioUrl;
try { audioUrl = await uploadParaFalCDN(audio); }
catch (e) { falhar(e.message); }
```

- [ ] **Step 2: Verificar que parseia e os testes seguem verdes**

Run: `node --check scripts/gerar-avatar.mjs && node --test scripts/*.test.mjs dashboard/*.test.mjs`
Expected: parse OK, todos os testes PASS (gerar-avatar não tem teste próprio que importe o upload; a mudança é interna).

- [ ] **Step 3: Commit**

```bash
git add scripts/gerar-avatar.mjs
git commit -m "refactor(avatar): usa lib-fal-upload compartilhado (DRY, mata duplicacao)"
```

---

### Task 3: `detectarMidia` + `lerLegenda` (funções puras)

**Files:**
- Create: `scripts/publicar-instagram.mjs`, `scripts/publicar-instagram.test.mjs`

- [ ] **Step 1: Write the failing test** — `scripts/publicar-instagram.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectarMidia, lerLegenda } from "./publicar-instagram.mjs";

function peca(arquivos, legenda = "Legenda real do post.") {
  const dir = mkdtempSync(join(tmpdir(), "peca-"));
  for (const a of arquivos) writeFileSync(join(dir, a), "DATA");
  if (legenda !== null) writeFileSync(join(dir, "legenda.md"), legenda);
  return dir;
}

test("detectarMidia: carrossel ordena os slide-*.png", () => {
  const dir = peca(["slide-02.png", "slide-01.png", "slide-03.png", "legenda.md"]);
  const m = detectarMidia(dir, "carrossel");
  assert.equal(m.length, 3);
  assert.match(m[0], /slide-01\.png$/);
  assert.match(m[2], /slide-03\.png$/);
});

test("detectarMidia: carrossel com 1 slide lança (precisa 2-10)", () => {
  const dir = peca(["slide-01.png"]);
  assert.throws(() => detectarMidia(dir, "carrossel"), /2 a 10/);
});

test("detectarMidia: post pega o único png; reel pega o mp4", () => {
  const dp = peca(["imagem.png"]);
  assert.match(detectarMidia(dp, "post")[0], /imagem\.png$/);
  const dr = peca(["reel.mp4"]);
  assert.match(detectarMidia(dr, "reel")[0], /reel\.mp4$/);
});

test("detectarMidia: sem mídia lança", () => {
  const dir = peca([]);
  assert.throws(() => detectarMidia(dir, "post"), /nenhuma imagem/i);
});

test("lerLegenda lê legenda.md; vazia lança", () => {
  const dir = peca(["imagem.png"], "Minha legenda.");
  assert.equal(lerLegenda(dir), "Minha legenda.");
  const vazio = peca(["imagem.png"], "   ");
  assert.throws(() => lerLegenda(vazio), /legenda/i);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/publicar-instagram.test.mjs` → FAIL (módulo/funções não existem).

- [ ] **Step 3: Write minimal implementation** — começar `scripts/publicar-instagram.mjs`:

```js
#!/usr/bin/env node
/**
 * publicar-instagram.mjs — publica uma peça do /post no Instagram (Graph API).
 * ImpulsoX AI. Mídia hospedada no Fal CDN. Dry-run por padrão; --confirmar publica.
 * Tokens (META_TOKEN_PAGINA, FAL_KEY) NUNCA em log ou erro.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

// Detecta a mídia da peça por tipo. Lança Error (chamador trata).
export function detectarMidia(dir, tipo) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Error(`pasta da peça não encontrada: ${dir}`);
  const arqs = readdirSync(dir);
  if (tipo === "carrossel") {
    const slides = arqs.filter((a) => /^slide-\d+\.png$/i.test(a)).sort();
    if (slides.length < 2 || slides.length > 10) throw new Error(`carrossel precisa de 2 a 10 slides (achei ${slides.length}).`);
    return slides.map((a) => join(dir, a));
  }
  if (tipo === "reel") {
    const mp4 = arqs.filter((a) => /\.mp4$/i.test(a)).sort();
    if (mp4.length === 0) throw new Error("nenhum vídeo .mp4 na pasta da peça (reel).");
    return [join(dir, mp4[0])];
  }
  // post único: o primeiro png (preferindo um chamado "post"/"imagem", senão o 1º)
  const pngs = arqs.filter((a) => /\.png$/i.test(a)).sort();
  if (pngs.length === 0) throw new Error("nenhuma imagem .png na pasta da peça (post).");
  return [join(dir, pngs[0])];
}

export function lerLegenda(dir) {
  const caminho = join(dir, "legenda.md");
  const txt = existsSync(caminho) ? readFileSync(caminho, "utf8").trim() : "";
  if (!txt) throw new Error("legenda vazia ou legenda.md ausente na pasta da peça.");
  return txt;
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/publicar-instagram.test.mjs` → PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/publicar-instagram.mjs scripts/publicar-instagram.test.mjs
git commit -m "feat(publicar): detectarMidia + lerLegenda da peça do /post"
```

---

### Task 4: `payloadContainer` (payload da Graph API por tipo)

**Files:**
- Modify: `scripts/publicar-instagram.mjs`, `scripts/publicar-instagram.test.mjs`

- [ ] **Step 1: Write the failing test** — anexar:

```js
import { payloadContainer } from "./publicar-instagram.mjs";

test("payloadContainer: post = image_url + caption", () => {
  const p = payloadContainer("post", { url: "u1", caption: "leg" });
  assert.deepEqual(p, { image_url: "u1", caption: "leg" });
});

test("payloadContainer: filho de carrossel = image_url + is_carousel_item", () => {
  const p = payloadContainer("carrossel", { url: "u1", filho: true });
  assert.deepEqual(p, { image_url: "u1", is_carousel_item: "true" });
});

test("payloadContainer: pai do carrossel = CAROUSEL + children + caption", () => {
  const p = payloadContainer("carrossel", { urls: ["a", "b"], caption: "leg" });
  assert.deepEqual(p, { media_type: "CAROUSEL", children: "a,b", caption: "leg" });
});

test("payloadContainer: reel = REELS + video_url + caption", () => {
  const p = payloadContainer("reel", { url: "v1", caption: "leg" });
  assert.deepEqual(p, { media_type: "REELS", video_url: "v1", caption: "leg" });
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/publicar-instagram.test.mjs` → FAIL.

- [ ] **Step 3: Write minimal implementation** — anexar ao `publicar-instagram.mjs`:

```js
// Monta o corpo do POST /{ig}/media por tipo. Graph API quer strings nos params.
// carrossel: chamar com {url, filho:true} pra cada filho; depois {urls:[ids], caption} pro pai.
export function payloadContainer(tipo, { url, urls, caption, filho } = {}) {
  if (tipo === "reel") return { media_type: "REELS", video_url: url, caption };
  if (tipo === "post") return { image_url: url, caption };
  // carrossel
  if (filho) return { image_url: url, is_carousel_item: "true" };
  return { media_type: "CAROUSEL", children: urls.join(","), caption };
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/publicar-instagram.test.mjs` → PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/publicar-instagram.mjs scripts/publicar-instagram.test.mjs
git commit -m "feat(publicar): payloadContainer por tipo (post/carrossel/reel)"
```

---

### Task 5: Orquestração da publicação contra mock Graph API

**Files:**
- Modify: `scripts/publicar-instagram.mjs`, `scripts/publicar-instagram.test.mjs`

- [ ] **Step 1: Write the failing test** — anexar (mock que responde container → publish → permalink):

```js
import { createServer } from "node:http";
import { publicarNoInstagram } from "./publicar-instagram.mjs";

function mockGraph() {
  let containerN = 0;
  return createServer((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      if (req.method === "POST" && /\/media_publish/.test(req.url)) {
        res.end(JSON.stringify({ id: "MEDIA-123" }));
      } else if (req.method === "POST" && /\/media/.test(req.url)) {
        res.end(JSON.stringify({ id: "CONTAINER-" + (++containerN) }));
      } else if (req.method === "GET" && /status_code/.test(req.url)) {
        res.end(JSON.stringify({ status_code: "FINISHED" }));
      } else if (req.method === "GET" && /permalink/.test(req.url)) {
        res.end(JSON.stringify({ permalink: "https://instagram.com/p/XYZ" }));
      } else { res.writeHead(404).end("{}"); }
    });
  });
}

async function comMock(fn) {
  const srv = mockGraph();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try { return await fn(base); } finally { srv.close(); }
}

test("publicarNoInstagram: post devolve id + permalink", async () => {
  await comMock(async (graphBase) => {
    const r = await publicarNoInstagram({ ig: "IGID", token: "T", tipo: "post", urls: ["u1"], caption: "leg", graphBase });
    assert.equal(r.id, "MEDIA-123");
    assert.match(r.permalink, /instagram\.com/);
  });
});

test("publicarNoInstagram: carrossel cria filhos + pai + publica", async () => {
  await comMock(async (graphBase) => {
    const r = await publicarNoInstagram({ ig: "IGID", token: "T", tipo: "carrossel", urls: ["a", "b", "c"], caption: "leg", graphBase });
    assert.equal(r.id, "MEDIA-123");
  });
});

test("publicarNoInstagram: reel polla status e publica", async () => {
  await comMock(async (graphBase) => {
    const r = await publicarNoInstagram({ ig: "IGID", token: "T", tipo: "reel", urls: ["v1"], caption: "leg", graphBase });
    assert.equal(r.id, "MEDIA-123");
  });
});

test("erro da Graph não vaza o token", async () => {
  const srv = createServer((req, res) => { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: { message: "Bad" } })); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  await assert.rejects(
    () => publicarNoInstagram({ ig: "IGID", token: "TOK-SECRETO", tipo: "post", urls: ["u1"], caption: "x", graphBase: base }),
    (e) => !/TOK-SECRETO/.test(e.message)
  );
  srv.close();
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/publicar-instagram.test.mjs` → FAIL.

- [ ] **Step 3: Write minimal implementation** — anexar:

```js
// remove o token de qualquer texto de erro (defesa: nunca vazar credencial)
function semToken(txt, token) { return token ? String(txt).split(token).join("***") : String(txt); }

async function graphPost(base, path, params, token) {
  const body = new URLSearchParams({ ...params, access_token: token });
  const r = await fetch(`${base}/${path}`, { method: "POST", body });
  const txt = await r.text();
  let j; try { j = JSON.parse(txt); } catch { throw new Error(`Graph: resposta inválida. ${semToken(txt, token).slice(0, 200)}`); }
  if (!r.ok || j.error) throw new Error(`Graph erro: ${semToken(JSON.stringify(j.error || j), token).slice(0, 200)}`);
  return j;
}

async function graphGet(base, path, query, token) {
  const qs = new URLSearchParams({ ...query, access_token: token });
  const r = await fetch(`${base}/${path}?${qs}`);
  const txt = await r.text();
  let j; try { j = JSON.parse(txt); } catch { throw new Error(`Graph: resposta inválida. ${semToken(txt, token).slice(0, 200)}`); }
  if (!r.ok || j.error) throw new Error(`Graph erro: ${semToken(JSON.stringify(j.error || j), token).slice(0, 200)}`);
  return j;
}

// orquestra o fluxo 2-passos (container -> media_publish) por tipo. Devolve {id, permalink, tipo}.
export async function publicarNoInstagram({ ig, token, tipo, urls, caption, graphBase = process.env.GRAPH_BASE_URL || "https://graph.facebook.com/v21.0" }) {
  let creationId;
  if (tipo === "carrossel") {
    const filhos = [];
    for (const url of urls) {
      const c = await graphPost(graphBase, `${ig}/media`, payloadContainer("carrossel", { url, filho: true }), token);
      filhos.push(c.id);
    }
    const pai = await graphPost(graphBase, `${ig}/media`, payloadContainer("carrossel", { urls: filhos, caption }), token);
    creationId = pai.id;
  } else {
    const c = await graphPost(graphBase, `${ig}/media`, payloadContainer(tipo, { url: urls[0], caption }), token);
    creationId = c.id;
    if (tipo === "reel") {
      // reel processa: pollar status_code até FINISHED (até ~5 min)
      let pronto = false;
      for (let t = 0; t < 60; t++) {
        const s = await graphGet(graphBase, creationId, { fields: "status_code" }, token);
        if (s.status_code === "FINISHED") { pronto = true; break; }
        if (s.status_code === "ERROR") throw new Error("Instagram: processamento do reel falhou.");
        await new Promise((r) => setTimeout(r, 5000));
      }
      if (!pronto) throw new Error("Instagram: reel não ficou pronto a tempo (timeout).");
    }
  }
  const pub = await graphPost(graphBase, `${ig}/media_publish`, { creation_id: creationId }, token);
  const info = await graphGet(graphBase, pub.id, { fields: "permalink" }, token);
  return { id: pub.id, permalink: info.permalink, tipo };
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/publicar-instagram.test.mjs` → PASS (inclui o teste de que o token não vaza).

- [ ] **Step 5: Commit**

```bash
git add scripts/publicar-instagram.mjs scripts/publicar-instagram.test.mjs
git commit -m "feat(publicar): orquestracao Graph API (post/carrossel/reel) + redacao de token"
```

---

### Task 6: CLI — validação, dry-run, `--confirmar`, registro

**Files:**
- Modify: `scripts/publicar-instagram.mjs`, `scripts/publicar-instagram.test.mjs`

- [ ] **Step 1: Write the failing test** — anexar (dry-run não toca a rede):

```js
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./publicar-instagram.mjs", import.meta.url));

test("CLI dry-run: valida e mostra o plano, sem publicar", () => {
  const dir = peca(["slide-01.png", "slide-02.png"], "Legenda do carrossel.");
  const out = execFileSync("node", [SCRIPT, "--peca", dir, "--tipo", "carrossel"], {
    encoding: "utf8", env: { ...process.env, IG_USUARIO_ID: "IGID", META_TOKEN_PAGINA: "T" },
  });
  assert.match(out, /dry.?run/i);
  assert.match(out, /carrossel/);
  assert.match(out, /2 m[ií]dia/i);
  assert.doesNotMatch(out, /\bT\b token|META_TOKEN/); // não imprime o token
});

test("CLI: sem env obrigatória, erro claro", () => {
  const dir = peca(["imagem.png"]);
  assert.throws(() => execFileSync("node", [SCRIPT, "--peca", dir, "--tipo", "post"], { encoding: "utf8", env: { ...process.env, IG_USUARIO_ID: "", META_TOKEN_PAGINA: "" } }));
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/publicar-instagram.test.mjs` → FAIL (sem CLI).

- [ ] **Step 3: Write minimal implementation** — anexar ao fim do `publicar-instagram.mjs`:

```js
import { registrarPasso } from "./registrar-passo.mjs";
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const pecaDir = flag("--peca");
  const tipo = flag("--tipo");
  const confirmar = has("--confirmar");

  if (!pecaDir) falhar("informe --peca <pasta da peça>.");
  if (!["carrossel", "post", "reel"].includes(tipo)) falhar("--tipo inválido (use carrossel, post ou reel).");

  let midia, caption;
  try { midia = detectarMidia(pecaDir, tipo); caption = lerLegenda(pecaDir); }
  catch (e) { falhar(e.message); }

  const ig = process.env.IG_USUARIO_ID;
  const token = process.env.META_TOKEN_PAGINA;
  if (!ig || !token) falhar("defina IG_USUARIO_ID e META_TOKEN_PAGINA no .env.");

  if (!confirmar) {
    console.log(JSON.stringify({
      dry_run: true, tipo, conta: ig, midias: midia.length,
      arquivos: midia.map((m) => m.split(/[\\/]/).pop()),
      legenda_preview: caption.slice(0, 80), nota: "rode de novo com --confirmar pra publicar de verdade.",
    }, null, 2));
    process.exit(0);
  }

  // publicação real
  (async () => {
    try {
      registrarPasso({ skill: "/publicar", etapa: `publicando no Instagram (${tipo})`, status: "inicio" });
      console.log("Subindo mídia pro Fal CDN...");
      const { uploadParaFalCDN } = await import("./lib-fal-upload.mjs");
      const urls = [];
      for (const m of midia) urls.push(await uploadParaFalCDN(m));
      console.log("Publicando no Instagram...");
      const r = await publicarNoInstagram({ ig, token, tipo, urls, caption });
      // registra em producao/publicacoes.md (cria com cabeçalho se não existe)
      const raiz = process.cwd();
      const pub = join(raiz, "producao", "publicacoes.md");
      mkdirSync(dirname(pub), { recursive: true });
      if (!existsSync(pub)) appendFileSync(pub, "# Publicações\n\n| Data | Canal | Link |\n|---|---|---|\n");
      appendFileSync(pub, `| ${new Date().toISOString().slice(0, 10)} | instagram | ${r.permalink} |\n`);
      registrarPasso({ skill: "/publicar", etapa: `publicado no Instagram: ${r.permalink}`, status: "ok" });
      console.log(JSON.stringify({ ok: true, ...r }, null, 2));
    } catch (e) {
      registrarPasso({ skill: "/publicar", etapa: "falha ao publicar no Instagram", status: "erro" });
      falhar(e.message);
    }
  })();
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/publicar-instagram.test.mjs` → todos PASS.

- [ ] **Step 5: Rodar a suíte inteira**

Run: `node --test scripts/*.test.mjs dashboard/*.test.mjs`
Expected: tudo PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/publicar-instagram.mjs scripts/publicar-instagram.test.mjs
git commit -m "feat(publicar): CLI dry-run + --confirmar + registro em publicacoes.md e feed"
```

---

### Task 7: Wiring — `/publicar` + `docs/ferramentas.md`

**Files:**
- Modify: `.claude/skills/publicar/SKILL.md`, `docs/ferramentas.md`

- [ ] **Step 1: `/publicar` — refletir o script real.** Na seção "Scripts", trocar a frase genérica por como o conector funciona de verdade:

```markdown
## Scripts

`scripts/publicar-instagram.mjs` publica no Instagram (Graph API) a partir de uma peça do
`/post`: `node scripts/publicar-instagram.mjs --peca producao/posts/<slug> --tipo
carrossel|post|reel`. **Sem `--confirmar` é dry-run** (valida e mostra o plano, não posta);
**com `--confirmar` publica de verdade**. A mídia sobe pro Fal CDN (URL pública) antes de
publicar; o resultado vai pra `producao/publicacoes.md` (permalink) e pro feed do painel.
Requer `IG_USUARIO_ID` + `META_TOKEN_PAGINA` no `.env` (conta Professional + página FB + app
Meta com `instagram_business_content_publish`). Limite: 25 posts/24h. Facebook e LinkedIn
seguem o mesmo padrão (conectores irmãos, a criar). Erro de API: reportar a resposta exata,
nunca o token.
```

- [ ] **Step 2: `docs/ferramentas.md` — bloco do conector.** Adicionar na seção "Publicar em redes sociais":

```markdown
### Instagram — publicação via Graph API (`scripts/publicar-instagram.mjs`)
- **Resolve:** publica carrossel, post e reel a partir de uma peça do `/post`. Mídia
  hospedada no Fal CDN (URL pública). Dry-run por padrão; `--confirmar` publica.
- **Conta/.env:** `IG_USUARIO_ID` + `META_TOKEN_PAGINA` (conta Professional vinculada a
  página FB + app Meta com `instagram_business_content_publish`). `FAL_KEY` pro upload.
- **Quem usa:** `/publicar`. Registra em `producao/publicacoes.md` + feed do painel.
- **Pegadinhas:** mídia tem que estar em URL pública no publish (por isso o Fal CDN);
  limite 25 posts/24h; `VIDEO` morreu pra post único (reel usa `REELS`); token nunca em log.
```

- [ ] **Step 3: Rodar a suíte + commit**

Run: `node --test scripts/*.test.mjs dashboard/*.test.mjs`
Expected: tudo PASS.

```bash
git add .claude/skills/publicar/SKILL.md docs/ferramentas.md
git commit -m "docs(publicar): /publicar e ferramentas refletem o conector real do Instagram"
```

---

### Task 8: Propagar pro clone

**Files:** (cópia, sem tocar núcleo/marca/produção do clone)

- [ ] **Step 1: Copiar os arquivos do motor pro clone e validar**

```bash
OS="c:/Users/ACER/Desktop/ImpulsoX-OS"; AI="c:/Users/ACER/Desktop/ImpulsoX-AI"
cp "$OS"/scripts/lib-fal-upload.mjs "$OS"/scripts/lib-fal-upload.test.mjs "$AI/scripts/"
cp "$OS"/scripts/publicar-instagram.mjs "$OS"/scripts/publicar-instagram.test.mjs "$AI/scripts/"
cp "$OS"/scripts/gerar-avatar.mjs "$AI/scripts/gerar-avatar.mjs"
cp "$OS/.claude/skills/publicar/SKILL.md" "$AI/.claude/skills/publicar/SKILL.md"
cp "$OS/docs/ferramentas.md" "$AI/docs/ferramentas.md"
cd "$AI" && node --test scripts/*.test.mjs
```
Expected: todos PASS no clone.

- [ ] **Step 2: Commit + push (clone e template)**

```bash
cd "$AI" && git add scripts/lib-fal-upload.mjs scripts/lib-fal-upload.test.mjs scripts/publicar-instagram.mjs scripts/publicar-instagram.test.mjs scripts/gerar-avatar.mjs .claude/skills/publicar/SKILL.md docs/ferramentas.md && git commit -m "feat: conector de publicacao no Instagram (vindo do template)" && git push
cd "$OS" && git push
```

---

## Self-Review (feito)

- **Cobertura do spec:** lib-fal-upload (Task 1) + refactor gerar-avatar (Task 2) · detectarMidia/lerLegenda (Task 3) · payloadContainer por tipo (Task 4) · orquestração post/carrossel/reel + redação de token (Task 5) · CLI dry-run/`--confirmar`/registro em publicacoes.md + feed (Task 6) · wiring /publicar + docs (Task 7) · propagação (Task 8). Limites da plataforma documentados na Task 7. Tudo coberto.
- **Placeholders:** nenhum — todo passo tem código real.
- **Consistência de tipos:** `detectarMidia`→lista de caminhos; `publicarNoInstagram({ig,token,tipo,urls,caption,graphBase})` consome `payloadContainer(tipo,{url,urls,caption,filho})`; o CLI passa `urls` (as URLs do Fal) batendo com a assinatura. `GRAPH_BASE_URL`/`FAL_REST_BASE` usados igual nos testes e no código.
- **Segurança:** Task 5 tem teste explícito de que o token não vaza no erro; `semToken` redige; dry-run é o default.
- **Nunca publica de verdade no teste:** tudo via mock (`graphBase`/`restBase` apontando pra servidor local).
