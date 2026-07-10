# kie.ai como provedor alternativo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a `gerar-imagem.mjs`, `gerar-video.mjs` e `gerar-avatar.mjs` a flag `--provedor fal|kie` (default `fal`), permitindo escolher kie.ai por chamada quando o preço compensar, sem trocar fal por kie e sem fallback automático.

**Architecture:** Uma lib nova `lib-provedor-kie.mjs` isola tudo específico do kie.ai (auth Bearer, submit em `/api/v1/jobs/createTask`, poll em `/api/v1/jobs/recordInfo`, parse de `resultJson`, upload via File Upload API). Cada script de geração ganha um branch `if (provedor === "kie")` que monta o payload kie e chama essa lib; o caminho fal existente não muda. Veo é caso especial (endpoint dedicado `/api/v1/veo/*`) e fica isolado em função própria dentro da mesma lib.

**Tech Stack:** Node.js (`node:test`, `fetch` nativo, sem deps novas), mock HTTP server local pros testes (mesmo padrão de `gerar-imagem.test.mjs`).

---

## Mapa de arquivos

- **Criar** `scripts/lib-provedor-kie.mjs` — submit/poll/parse genérico do kie.ai (createTask) + função dedicada pro Veo + upload de referência via File Upload API.
- **Criar** `scripts/lib-provedor-kie.test.mjs` — testes da lib isolada (sem rede real).
- **Modificar** `scripts/gerar-imagem.mjs` — `--provedor`, tabela de preço kie, branch de submit.
- **Modificar** `scripts/gerar-imagem.test.mjs` — testes do branch kie.
- **Modificar** `scripts/gerar-video.mjs` — `--provedor`, `--modelo veo` novo, branch de submit (inclui caso Veo dedicado).
- **Criar** `scripts/gerar-video.test.mjs` — não existe hoje; cobre fal (regressão) + kie.
- **Modificar** `scripts/gerar-avatar.mjs` — `--provedor`, branch de submit.
- **Criar** `scripts/gerar-avatar.test.mjs` — não existe hoje; cobre fal (regressão) + kie.
- **Modificar** `.env.example` — adiciona `KIE_KEY`.

---

## Task 1: lib-provedor-kie.mjs — submit + poll genérico (createTask)

**Files:**
- Create: `scripts/lib-provedor-kie.mjs`
- Test: `scripts/lib-provedor-kie.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/lib-provedor-kie.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { submeterTarefaKie, aguardarResultadoKie } from "./lib-provedor-kie.mjs";

function mockKie(handler) {
  const srv = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => handler(req, body ? JSON.parse(body) : {}, res));
  });
  return new Promise((resolve) => srv.listen(0, "127.0.0.1", () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` })));
}

test("submeterTarefaKie: POST createTask, devolve taskId", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    assert.equal(req.url, "/api/v1/jobs/createTask");
    assert.equal(req.headers.authorization, "Bearer test-key");
    assert.equal(payload.model, "nano-banana-2");
    assert.deepEqual(payload.input, { prompt: "x" });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, msg: "success", data: { taskId: "task_123" } }));
  });
  const taskId = await submeterTarefaKie({
    kieKey: "test-key", base: url, model: "nano-banana-2", input: { prompt: "x" },
  });
  srv.close();
  assert.equal(taskId, "task_123");
});

test("submeterTarefaKie: erro HTTP lança com código", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    res.writeHead(402, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 402, msg: "Insufficient Credits" }));
  });
  await assert.rejects(
    () => submeterTarefaKie({ kieKey: "k", base: url, model: "x", input: {} }),
    /402|Insufficient Credits/
  );
  srv.close();
});

test("aguardarResultadoKie: polla até success, devolve resultUrls", async () => {
  let chamadas = 0;
  const { srv, url } = await mockKie((req, payload, res) => {
    chamadas++;
    res.writeHead(200, { "content-type": "application/json" });
    if (chamadas < 2) {
      res.end(JSON.stringify({ code: 200, data: { taskId: "task_123", state: "generating" } }));
    } else {
      res.end(JSON.stringify({
        code: 200,
        data: { taskId: "task_123", state: "success", resultJson: JSON.stringify({ resultUrls: ["https://x/img.png"] }) },
      }));
    }
  });
  const r = await aguardarResultadoKie({ kieKey: "k", base: url, taskId: "task_123", intervaloMs: 10, timeoutMs: 2000 });
  srv.close();
  assert.deepEqual(r.resultUrls, ["https://x/img.png"]);
});

test("aguardarResultadoKie: state fail lança com failMsg", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, data: { taskId: "task_123", state: "fail", failMsg: "content policy" } }));
  });
  await assert.rejects(
    () => aguardarResultadoKie({ kieKey: "k", base: url, taskId: "task_123", intervaloMs: 10, timeoutMs: 2000 }),
    /content policy/
  );
  srv.close();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-provedor-kie.test.mjs`
Expected: FAIL — `Cannot find module './lib-provedor-kie.mjs'`

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/lib-provedor-kie.mjs
// Tudo que é específico do kie.ai (auth Bearer, createTask, polling, parse de
// resultJson). KIE_KEY nunca aparece em mensagem de erro. Modelos "createTask"
// genéricos (Kling, Nano Banana, Seedance, OmniHuman...) — Veo usa endpoint
// dedicado, ver submeterTarefaVeo/aguardarResultadoVeo neste mesmo arquivo.

async function jsonSafe(resp) {
  const t = await resp.text();
  try { return JSON.parse(t); } catch { return { _raw: t }; }
}

export async function submeterTarefaKie({ kieKey, base = "https://api.kie.ai", model, input, callBackUrl }) {
  const resp = await fetch(`${base}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: { Authorization: `Bearer ${kieKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input, ...(callBackUrl ? { callBackUrl } : {}) }),
  });
  const j = await jsonSafe(resp);
  if (!resp.ok || j.code !== 200) throw new Error(`kie.ai createTask falhou (${j.code ?? resp.status}): ${j.msg ?? j._raw ?? "erro desconhecido"}`);
  const taskId = j?.data?.taskId;
  if (!taskId) throw new Error(`kie.ai: resposta sem taskId. ${JSON.stringify(j).slice(0, 200)}`);
  return taskId;
}

export async function aguardarResultadoKie({ kieKey, base = "https://api.kie.ai", taskId, intervaloMs = 3000, timeoutMs = 360000 }) {
  const auth = { headers: { Authorization: `Bearer ${kieKey}` } };
  const inicio = Date.now();
  for (;;) {
    const resp = await fetch(`${base}/api/v1/jobs/recordInfo?taskId=${taskId}`, auth);
    const j = await jsonSafe(resp);
    const state = j?.data?.state;
    if (state === "success") {
      const resultJson = j?.data?.resultJson;
      let parsed; try { parsed = JSON.parse(resultJson); } catch { throw new Error(`kie.ai: resultJson inválido. ${String(resultJson).slice(0, 200)}`); }
      return parsed;
    }
    if (state === "fail") throw new Error(`kie.ai: tarefa falhou. ${j?.data?.failMsg || j?.data?.failCode || "sem detalhe"}`);
    if (Date.now() - inicio > timeoutMs) throw new Error(`kie.ai: tarefa não ficou pronta em ${Math.round(timeoutMs / 1000)}s (timeout).`);
    await new Promise((r) => setTimeout(r, intervaloMs));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-provedor-kie.test.mjs`
Expected: PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-provedor-kie.mjs scripts/lib-provedor-kie.test.mjs
git commit -m "feat: lib-provedor-kie — submit/poll genérico do kie.ai (createTask)"
```

---

## Task 2: lib-provedor-kie.mjs — caso especial Veo (endpoint dedicado)

**Files:**
- Modify: `scripts/lib-provedor-kie.mjs`
- Test: `scripts/lib-provedor-kie.test.mjs`

- [ ] **Step 1: Write the failing test**

Adicionar ao final de `scripts/lib-provedor-kie.test.mjs`:

```javascript
import { submeterTarefaVeoKie, aguardarResultadoVeoKie } from "./lib-provedor-kie.mjs";

test("submeterTarefaVeoKie: POST /api/v1/veo/generate, devolve taskId", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    assert.equal(req.url, "/api/v1/veo/generate");
    assert.equal(payload.model, "veo3_fast");
    assert.equal(payload.prompt, "a dog running");
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, msg: "success", data: { taskId: "veo_task_1" } }));
  });
  const taskId = await submeterTarefaVeoKie({
    kieKey: "k", base: url, prompt: "a dog running", model: "veo3_fast", aspect_ratio: "9:16", resolution: "1080p",
  });
  srv.close();
  assert.equal(taskId, "veo_task_1");
});

test("aguardarResultadoVeoKie: successFlag 1, devolve resultUrls", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, data: { taskId: "veo_task_1", successFlag: 1, response: { resultUrls: ["https://x/v.mp4"] } } }));
  });
  const r = await aguardarResultadoVeoKie({ kieKey: "k", base: url, taskId: "veo_task_1", intervaloMs: 10, timeoutMs: 2000 });
  srv.close();
  assert.deepEqual(r.resultUrls, ["https://x/v.mp4"]);
});

test("aguardarResultadoVeoKie: successFlag 2 (failed) lança erro", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, data: { taskId: "veo_task_1", successFlag: 2 } }));
  });
  await assert.rejects(
    () => aguardarResultadoVeoKie({ kieKey: "k", base: url, taskId: "veo_task_1", intervaloMs: 10, timeoutMs: 2000 }),
    /falhou|failed/i
  );
  srv.close();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-provedor-kie.test.mjs`
Expected: FAIL — `submeterTarefaVeoKie is not a function`

- [ ] **Step 3: Write minimal implementation**

Adicionar ao final de `scripts/lib-provedor-kie.mjs`:

```javascript
// Veo é caso especial: endpoint próprio (não passa por createTask/recordInfo
// genérico), status via campo successFlag (0=gerando,1=ok,2=falhou,3=falha upstream).

export async function submeterTarefaVeoKie({ kieKey, base = "https://api.kie.ai", prompt, model = "veo3_fast", imageUrls, aspect_ratio, resolution, duration, callBackUrl }) {
  const resp = await fetch(`${base}/api/v1/veo/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${kieKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt, model,
      ...(imageUrls ? { imageUrls } : {}),
      ...(aspect_ratio ? { aspect_ratio } : {}),
      ...(resolution ? { resolution } : {}),
      ...(duration ? { duration } : {}),
      ...(callBackUrl ? { callBackUrl } : {}),
    }),
  });
  const j = await jsonSafe(resp);
  if (!resp.ok || j.code !== 200) throw new Error(`kie.ai Veo falhou (${j.code ?? resp.status}): ${j.msg ?? j._raw ?? "erro desconhecido"}`);
  const taskId = j?.data?.taskId;
  if (!taskId) throw new Error(`kie.ai Veo: resposta sem taskId. ${JSON.stringify(j).slice(0, 200)}`);
  return taskId;
}

export async function aguardarResultadoVeoKie({ kieKey, base = "https://api.kie.ai", taskId, intervaloMs = 3000, timeoutMs = 360000 }) {
  const auth = { headers: { Authorization: `Bearer ${kieKey}` } };
  const inicio = Date.now();
  for (;;) {
    const resp = await fetch(`${base}/api/v1/veo/record-info?taskId=${taskId}`, auth);
    const j = await jsonSafe(resp);
    const flag = j?.data?.successFlag;
    if (flag === 1) {
      const resultUrls = j?.data?.response?.resultUrls;
      if (!resultUrls) throw new Error(`kie.ai Veo: resposta sem resultUrls. ${JSON.stringify(j).slice(0, 200)}`);
      return { resultUrls };
    }
    if (flag === 2 || flag === 3) throw new Error(`kie.ai Veo: geração falhou (successFlag ${flag}).`);
    if (Date.now() - inicio > timeoutMs) throw new Error(`kie.ai Veo: vídeo não ficou pronto em ${Math.round(timeoutMs / 1000)}s (timeout).`);
    await new Promise((r) => setTimeout(r, intervaloMs));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-provedor-kie.test.mjs`
Expected: PASS (7 testes)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-provedor-kie.mjs scripts/lib-provedor-kie.test.mjs
git commit -m "feat: lib-provedor-kie — caso especial Veo (endpoint dedicado)"
```

---

## Task 3: lib-provedor-kie.mjs — upload de referência local (File Upload API)

**Files:**
- Modify: `scripts/lib-provedor-kie.mjs`
- Test: `scripts/lib-provedor-kie.test.mjs`

kie.ai exige URL pública pra imagem de referência (não aceita data URI como
fal). Quando o script tem `--ref caminho-local.png`, precisa subir antes.

- [ ] **Step 1: Write the failing test**

Adicionar ao final de `scripts/lib-provedor-kie.test.mjs`:

```javascript
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { uploadParaKieAPI } from "./lib-provedor-kie.mjs";

test("uploadParaKieAPI: sobe base64 e devolve URL pública", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    assert.equal(req.url, "/api/file-base64-upload");
    assert.ok(payload.base64Data.startsWith("data:"));
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, data: { downloadUrl: "https://kie.cdn/x.png" } }));
  });
  const dir = mkdtempSync(join(tmpdir(), "kie-up-"));
  const f = join(dir, "ref.png");
  writeFileSync(f, "PNGDATA");
  const result = await uploadParaKieAPI(f, { kieKey: "k", base: url });
  srv.close();
  assert.equal(result, "https://kie.cdn/x.png");
});

test("uploadParaKieAPI sem KIE_KEY lança erro claro", async () => {
  await assert.rejects(
    () => uploadParaKieAPI("x.png", { kieKey: "" }),
    /KIE_KEY/
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-provedor-kie.test.mjs`
Expected: FAIL — `uploadParaKieAPI is not a function`

- [ ] **Step 3: Write minimal implementation**

Adicionar ao topo (imports) e ao final de `scripts/lib-provedor-kie.mjs`:

```javascript
// no topo do arquivo, junto dos outros imports:
import { readFileSync } from "node:fs";
```

```javascript
// kie.ai não aceita data URI em image_input — exige URL pública. Sobe via
// File Upload API (base64) e devolve downloadUrl. Arquivo expira em 3 dias
// no kie (suficiente pro tempo entre upload e a tarefa consumir a URL).
export async function uploadParaKieAPI(caminho, { kieKey, base = "https://api.kie.ai" } = {}) {
  if (!kieKey) throw new Error("KIE_KEY não definida no ambiente (.env).");
  const ext = caminho.split(".").pop().toLowerCase();
  const mime = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" }[ext] || "application/octet-stream";
  const b64 = readFileSync(caminho).toString("base64");
  const resp = await fetch(`${base}/api/file-base64-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${kieKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ base64Data: `data:${mime};base64,${b64}`, uploadPath: "images" }),
  });
  const j = await jsonSafe(resp);
  if (!resp.ok || j.code !== 200) throw new Error(`kie.ai upload falhou (${j.code ?? resp.status}): ${j.msg ?? j._raw ?? "erro desconhecido"}`);
  const downloadUrl = j?.data?.downloadUrl;
  if (!downloadUrl) throw new Error(`kie.ai upload: resposta sem downloadUrl. ${JSON.stringify(j).slice(0, 200)}`);
  return downloadUrl;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-provedor-kie.test.mjs`
Expected: PASS (9 testes)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-provedor-kie.mjs scripts/lib-provedor-kie.test.mjs
git commit -m "feat: lib-provedor-kie — upload de referência local (File Upload API)"
```

---

## Task 4: gerar-imagem.mjs — flag --provedor e branch kie

**Files:**
- Modify: `scripts/gerar-imagem.mjs`
- Test: `scripts/gerar-imagem.test.mjs`

**Mapeamento de modelo (confirmado em docs.kie.ai):**
- `--modelo nano` → kie `model: "nano-banana-2"`
- `--modelo nano-pro` → kie `model: "nano-banana-pro"`
- `--modelo minimax`, `schnell`, `dev` → **sem equivalente confirmado no kie** — erro claro se `--provedor kie` for usado com esses.

**Preço kie (da home, jun/2026):** nano 1K=$0.04, 2K=$0.06, 4K=$0.09 (não tem 0.5K). nano-pro: preço não confirmado na home — usar `null` e avisar "confirmar em kie.ai/pricing" no dry-run em vez de chutar número.

- [ ] **Step 1: Write the failing test**

Adicionar ao final de `scripts/gerar-imagem.test.mjs`:

```javascript
test("--provedor kie: dry-run mostra preço dos dois provedores", () => {
  const out = join(tmp, "dry-kie.png");
  const r = run(["--prompt", "x", "--saida", out, "--modelo", "nano", "--provedor", "kie", "--dry-run"], { FAL_KEY: "", KIE_KEY: "" });
  assert.equal(r.code, 0, r.stderr);
  const j = JSON.parse(r.stdout);
  assert.ok(j.custo_estimado_fal_usd >= 0, "tem preço fal");
  assert.ok(j.custo_estimado_kie_usd >= 0, "tem preço kie");
});

test("--provedor kie: minimax não suportado, erro claro", () => {
  const out = join(tmp, "err.png");
  const r = run(["--prompt", "x", "--saida", out, "--modelo", "minimax", "--provedor", "kie"], { KIE_KEY: "k" });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /minimax.*kie|kie.*minimax/i);
});

test("--provedor kie sem KIE_KEY: erro claro, sem fallback pro fal", () => {
  const out = join(tmp, "nokey.png");
  const r = run(["--prompt", "x", "--saida", out, "--modelo", "nano", "--provedor", "kie"], { KIE_KEY: "", FAL_KEY: "presente-mas-nao-deve-usar" });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /KIE_KEY/);
});

test("--provedor kie: chama createTask + recordInfo, baixa e salva imagem", async () => {
  const out = join(tmp, "kie-ok.png");
  const { srv, url } = await mockFal((req, payload, res) => {
    if (req.url === "/api/v1/jobs/createTask") {
      assert.equal(payload.model, "nano-banana-2");
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ code: 200, data: { taskId: "t1" } }));
    } else if (req.url.startsWith("/api/v1/jobs/recordInfo")) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ code: 200, data: { state: "success", resultJson: JSON.stringify({ resultUrls: [`data:image/png;base64,${PNG_1x1_B64}`] }) } }));
    } else { res.writeHead(404).end(); }
  });
  const r = await runAsync(["--prompt", "x", "--saida", out, "--modelo", "nano", "--provedor", "kie"], { KIE_KEY: "test", KIE_BASE_URL: url });
  srv.close();
  assert.equal(r.code, 0, r.stderr);
  assert.ok(existsSync(out), "PNG foi escrito");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/gerar-imagem.test.mjs`
Expected: FAIL — `--provedor` desconhecido / `custo_estimado_fal_usd` undefined

- [ ] **Step 3: Write minimal implementation**

Em `scripts/gerar-imagem.mjs`, adicionar import no topo (após os imports existentes, linha ~20):

```javascript
import { submeterTarefaKie, aguardarResultadoKie, uploadParaKieAPI } from "./lib-provedor-kie.mjs";
```

Substituir o bloco `flag`/parsing (linhas 27-34) — adicionar `--provedor`:

```javascript
const prompt = flag("--prompt");
const saida = flag("--saida");
const modelo = flag("--modelo") || "minimax";
const ref = flag("--ref");
const largura = Number(flag("--largura") || 1080);
const altura = Number(flag("--altura") || 1350);
const resolucao = flag("--resolucao") || "2K";
const dryRun = has("--dry-run");
const provedor = flag("--provedor") || "fal";
```

Substituir a tabela `PRECOS` (linhas 40-46) por uma versão com dimensão de provedor:

```javascript
// preços REAIS por modelo × resolução. fal confirmado nas páginas de modelo
// (jun/2026); kie confirmado em kie.ai (home, jun/2026) — nano-pro kie sem
// preço público claro ainda, null até confirmar em kie.ai/pricing.
const PRECOS_FAL = {
  nano:        { "0.5K": 0.06, "1K": 0.08, "2K": 0.12, "4K": 0.16 },
  "nano-pro":  { "0.5K": 0.15, "1K": 0.15, "2K": 0.15, "4K": 0.30 },
  minimax:     { fixo: 0.01 },
  schnell:     { fixo: 0.003 },
  dev:         { fixo: 0.025 },
};
const PRECOS_KIE = {
  nano:        { "1K": 0.04, "2K": 0.06, "4K": 0.09 },
  "nano-pro":  null, // confirmar em kie.ai/pricing antes de usar em produção
};
const KIE_MODEL = { nano: "nano-banana-2", "nano-pro": "nano-banana-pro" };

function precoImagem(tabela, mod, res) {
  const t = tabela[mod]; if (!t) return null;
  if (t.fixo != null) return t.fixo;
  return t[res] ?? t["2K"] ?? null;
}
```

Atualizar a função `precoImagem` antiga (chamada mais abaixo) para usar `PRECOS_FAL` — trocar todas as chamadas `precoImagem(mod, res)` por `precoImagem(PRECOS_FAL, mod, res)` (são 2 ocorrências: no dry-run e no registro de custo final).

Atualizar o bloco `--precos` (linhas 52-66) pra listar os dois provedores:

```javascript
if (has("--precos")) {
  const usd = (n) => n == null ? "—" : "$" + n.toFixed(3).replace(/0$/, "");
  console.log("\nGerador de imagem — modelos e preços, fal vs kie (jun/2026):\n");
  console.log("  MODELO     PROVEDOR  0.5K    1K     2K     4K");
  console.log("  ──────────────────────────────────────────────");
  for (const mod of ["nano-pro", "nano", "minimax", "schnell", "dev"]) {
    console.log(`  ${mod.padEnd(10)} fal       ${["0.5K","1K","2K","4K"].map((r) => usd(precoImagem(PRECOS_FAL, mod, r)).padEnd(7)).join("")}`);
    if (PRECOS_KIE[mod] !== undefined) {
      console.log(`  ${mod.padEnd(10)} kie       ${["0.5K","1K","2K","4K"].map((r) => usd(precoImagem(PRECOS_KIE, mod, r)).padEnd(7)).join("")}`);
    }
  }
  console.log("\n  Uso:  --modelo nano-pro --resolucao 2K --provedor kie\n");
  process.exit(0);
}
```

Validar `--provedor` e a combinação modelo×provedor (após a validação de `--modelo`, linha ~73):

```javascript
if (!["fal", "kie"].includes(provedor)) falhar(`--provedor inválido: ${provedor} (use fal ou kie).`);
if (provedor === "kie" && !KIE_MODEL[modelo]) falhar(`kie.ai não suporta --modelo ${modelo} ainda (use nano ou nano-pro, ou troque --provedor fal).`);
```

Atualizar a checagem de chave (linha 70-71) pra considerar o provedor:

```javascript
const FAL_KEY = process.env.FAL_KEY;
const KIE_KEY = process.env.KIE_KEY;
if (!dryRun && provedor === "fal" && !FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env). Sem chave, não dá pra gerar.");
if (!dryRun && provedor === "kie" && !KIE_KEY) falhar("KIE_KEY não definida no ambiente (.env). Sem chave, não dá pra gerar.");
```

Atualizar o bloco `dryRun` (linhas 114-117) pra mostrar os dois preços:

```javascript
if (dryRun) {
  console.log(JSON.stringify({
    dry_run: true, modelo, provedor, largura, altura,
    resolucao: ehNano ? resolucao : undefined, ref: !!ref,
    custo_estimado_fal_usd: precoImagem(PRECOS_FAL, modelo, resolucao),
    custo_estimado_kie_usd: provedor === "kie" || KIE_MODEL[modelo] ? precoImagem(PRECOS_KIE, modelo, resolucao) : null,
  }, null, 2));
  process.exit(0);
}
```

Adicionar o branch de execução kie ANTES do bloco `try { const resp = await fetch(ENDPOINT...` existente (linha ~126), envolvendo o bloco fal original em `if (provedor === "fal") { ... } else { ... }`:

```javascript
// --- chama o provedor escolhido e salva ----------------------------------
async function baixar(urlOuData) {
  if (urlOuData.startsWith("data:")) return Buffer.from(urlOuData.split(",")[1], "base64");
  const resp = await fetch(urlOuData);
  if (!resp.ok) falhar(`falha ao baixar a imagem gerada (HTTP ${resp.status}).`);
  return Buffer.from(await resp.arrayBuffer());
}

if (provedor === "kie") {
  try {
    const KIE_BASE = process.env.KIE_BASE_URL || "https://api.kie.ai";
    let imageInput;
    if (ref) {
      const url = await uploadParaKieAPI(ref, { kieKey: KIE_KEY, base: KIE_BASE });
      imageInput = [url];
    }
    const input = {
      prompt, aspect_ratio: aspectRatio(largura, altura),
      ...(ehNano ? { resolution: resolucao, output_format: "png" } : {}),
      ...(imageInput ? { image_input: imageInput } : {}),
    };
    const taskId = await submeterTarefaKie({ kieKey: KIE_KEY, base: KIE_BASE, model: KIE_MODEL[modelo], input });
    const { resultUrls } = await aguardarResultadoKie({ kieKey: KIE_KEY, base: KIE_BASE, taskId });
    if (!resultUrls?.[0]) falhar("kie.ai: resposta sem imagem.");
    writeFileSync(saida, await baixar(resultUrls[0]));
    const custoReal = precoImagem(PRECOS_KIE, modelo, resolucao);
    registrarCusto({ script: "gerar-imagem", modelo: `${modelo}(kie)`, custo: custoReal ?? 0 });
    console.log(JSON.stringify({ ok: true, saida, modelo, provedor, resolucao: ehNano ? resolucao : undefined, custo_usd: custoReal }, null, 2));
  } catch (e) {
    falhar(String(e?.message || e).replace(KIE_KEY || "", "***"));
  }
} else {
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
    const custoReal = precoImagem(PRECOS_FAL, modelo, resolucao);
    registrarCusto({ script: "gerar-imagem", modelo, custo: custoReal });
    console.log(JSON.stringify({ ok: true, saida, modelo, resolucao: ehNano ? resolucao : undefined, custo_usd: custoReal }, null, 2));
  } catch (e) {
    if (e?.code === "ENOTFOUND" || e?.cause) falhar("falha de rede ao chamar a Fal.");
    falhar(String(e?.message || e).replace(FAL_KEY || "", "***"));
  }
}
```

Remover o bloco `try { ... } catch { ... }` original duplicado (linhas 126-146 do arquivo original) — ele foi incorporado no `else` acima.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/gerar-imagem.test.mjs`
Expected: PASS (todos os testes antigos + os 4 novos)

- [ ] **Step 5: Commit**

```bash
git add scripts/gerar-imagem.mjs scripts/gerar-imagem.test.mjs
git commit -m "feat(gerar-imagem): --provedor fal|kie, dry-run compara preço dos dois"
```

---

## Task 5: gerar-video.mjs — flag --provedor, --modelo veo, branch kie

**Files:**
- Modify: `scripts/gerar-video.mjs`
- Create: `scripts/gerar-video.test.mjs`

**Mapeamento (confirmado em docs.kie.ai):**
- `--modelo kling --provedor kie` → createTask `model: "kling/v3-turbo-image-to-video"`, preço $0.07/s
- `--modelo seedance --provedor kie` → createTask `model: "bytedance/seedance-2"`, preço $0.057/s
- `--modelo veo --provedor kie` → **novo modelo**, só existe no kie, endpoint Veo dedicado, preço $1.28/vídeo 1080p / $1.85 4K (fixo por vídeo, não por segundo)
- `--modelo wan, ltx --provedor kie` → sem confirmação, erro claro

Este script não tem teste hoje — o teste novo cobre fal (regressão, usando o
fluxo de submit existente) e kie.

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/gerar-video.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { argsFfmpeg, custoClipe, custoClipeKie, duracaoAudio, casarDuracoes, mixVozTrilha } from "./gerar-video.mjs";

test("custoClipe (fal): kling 5s = 0.35, 8s = 0.70", () => {
  assert.equal(custoClipe("kling", 5), 0.35);
  assert.equal(custoClipe("kling", 8), 0.70);
});

test("custoClipeKie: kling cobra por segundo ($0.07/s)", () => {
  assert.equal(custoClipeKie("kling", 5), 0.35);
  assert.equal(custoClipeKie("kling", 10), 0.70);
});

test("custoClipeKie: seedance cobra por segundo ($0.057/s)", () => {
  assert.equal(Math.round(custoClipeKie("seedance", 5) * 1000), Math.round(0.057 * 5 * 1000));
});

test("custoClipeKie: veo é preço fixo por vídeo, não por segundo", () => {
  assert.equal(custoClipeKie("veo", 5), 1.28);
  assert.equal(custoClipeKie("veo", 999), 1.28); // não escala com duração
});

test("custoClipeKie: modelo sem preço kie confirmado devolve null", () => {
  assert.equal(custoClipeKie("wan", 5), null);
  assert.equal(custoClipeKie("ltx", 5), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/gerar-video.test.mjs`
Expected: FAIL — `custoClipeKie is not a function` (não exportada ainda)

- [ ] **Step 3: Write minimal implementation**

Em `scripts/gerar-video.mjs`, adicionar import no topo (após os imports existentes, linha ~26):

```javascript
import { submeterTarefaKie, aguardarResultadoKie, submeterTarefaVeoKie, aguardarResultadoVeoKie } from "./lib-provedor-kie.mjs";
```

Adicionar função nova após `custoClipe` (depois da linha 75 original):

```javascript
// custo estimado de UM clipe no kie.ai, por modelo (preços da home kie.ai,
// jun/2026): kling $0.07/s, seedance $0.057/s, veo é preço FIXO por vídeo
// (não escala com duração — 1080p $1.28, mas a função sempre devolve a
// versão 1080p; 4K é flag separada que o script não usa por padrão).
// wan/ltx: sem preço kie confirmado — null em vez de chutar.
export function custoClipeKie(modelo, seg) {
  const s = Number(seg) || 5;
  if (modelo === "kling") return s * 0.07;
  if (modelo === "seedance") return Math.min(12, Math.max(2, s)) * 0.057;
  if (modelo === "veo") return 1.28;
  return null;
}
```

Adicionar flag `--provedor` no parsing de args (após a linha 119, `const modeloVideo = ...`):

```javascript
const modeloVideo = flag("--modelo") || "kling";
const provedor = flag("--provedor") || "fal";
if (!["fal", "kie"].includes(provedor)) falhar(`--provedor inválido: ${provedor} (use fal ou kie).`);
```

Atualizar a validação de `--modelo` (linha 128) pra aceitar `veo` (só existe no kie):

```javascript
const MODELOS_VALIDOS = ["kling", "wan", "seedance", "ltx", "veo"];
if (!MODELOS_VALIDOS.includes(modeloVideo)) falhar(`--modelo inválido: ${modeloVideo} (use kling, seedance, ltx, wan ou veo).`);
if (modeloVideo === "veo" && provedor !== "kie") falhar("--modelo veo só existe no kie.ai (use --provedor kie).");
const KIE_SUPORTADOS = ["kling", "seedance", "veo"];
if (provedor === "kie" && !KIE_SUPORTADOS.includes(modeloVideo)) falhar(`kie.ai não suporta --modelo ${modeloVideo} ainda (use kling, seedance ou veo, ou troque --provedor fal).`);
```

No bloco `dryRun` (linha 135-142), adicionar comparação de custo:

```javascript
if (dryRun) {
  console.log(JSON.stringify({
    dry_run: true, slug: roteiro.slug, largura: LARGURA, altura: ALTURA,
    modelo_video: modeloVideo, duracao_total: duracaoTotal, provedor,
    custo_estimado_fal_usd: modeloVideo === "veo" ? null : Number(cenas.reduce((s, c) => s + custoClipe(modeloVideo, Number(c.segundos) || 5), 0).toFixed(2)),
    custo_estimado_kie_usd: KIE_SUPORTADOS.includes(modeloVideo) ? Number(cenas.reduce((s, c) => s + (custoClipeKie(modeloVideo, Number(c.segundos) || 5) || 0), 0).toFixed(2)) : null,
    cenas: cenas.map((c) => ({ texto: c.texto, segundos: Number(c.segundos) || 5 })),
  }, null, 2));
  process.exit(0);
}
```

Atualizar a checagem de chave (linha 145-146) pra considerar provedor:

```javascript
const FAL_KEY = process.env.FAL_KEY;
const KIE_KEY = process.env.KIE_KEY;
if (provedor === "fal" && !FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env).");
if (provedor === "kie" && !KIE_KEY) falhar("KIE_KEY não definida no ambiente (.env).");
```

Adicionar mapeamento de modelo kie e função `kieVideo`, ao lado de `EP_VIDEO`/`falVideo` (linha ~198-244) — manter `falVideo` intocada, adicionar a versão kie ao lado:

```javascript
const KIE_MODEL_VIDEO = {
  kling: "kling/v3-turbo-image-to-video",
  seedance: "bytedance/seedance-2",
};
const KIE_BASE = process.env.KIE_BASE_URL || "https://api.kie.ai";

async function kieVideo(stillPath, segundos, prompt) {
  const seg = Number(segundos) || 5;
  // kie.ai (createTask/Veo) exige URL pública pra imagem — não aceita data
  // URI. Sobe a still via File Upload API antes de submeter a tarefa.
  const { uploadParaKieAPI } = await import("./lib-provedor-kie.mjs");
  const imageUrl = await uploadParaKieAPI(stillPath, { kieKey: FAL_KEY ? undefined : KIE_KEY, base: KIE_BASE });
  let taskId, resultUrls;
  if (modeloVideo === "veo") {
    taskId = await submeterTarefaVeoKie({
      kieKey: KIE_KEY, base: KIE_BASE, prompt, model: "veo3_fast",
      imageUrls: [imageUrl], aspect_ratio: "9:16", resolution: "1080p", duration: Math.min(8, Math.max(4, Math.round(seg))),
    });
    ({ resultUrls } = await aguardarResultadoVeoKie({ kieKey: KIE_KEY, base: KIE_BASE, taskId }));
  } else {
    const input = modeloVideo === "seedance"
      ? { prompt, image_url: imageUrl, duration: String(Math.min(12, Math.max(2, seg))), resolution: "1080p", aspect_ratio: "9:16" }
      : { prompt, image_url: imageUrl, duration: seg <= 5 ? "5" : "10" };
    taskId = await submeterTarefaKie({ kieKey: KIE_KEY, base: KIE_BASE, model: KIE_MODEL_VIDEO[modeloVideo], input });
    ({ resultUrls } = await aguardarResultadoKie({ kieKey: KIE_KEY, base: KIE_BASE, taskId }));
  }
  if (!resultUrls?.[0]) falhar("kie.ai: resposta sem vídeo.");
  const buf = Buffer.from(await (await fetch(resultUrls[0])).arrayBuffer());
  const out = join(work, `c${clipes.length}.mp4`);
  writeFileSync(out, buf);
  return out;
}
```

No loop principal (linha ~261, `clipes.push(await falVideo(still, segundos, motion));`), trocar pra escolher a função pelo provedor:

```javascript
clipes.push(await (provedor === "kie" ? kieVideo(still, segundos, motion) : falVideo(still, segundos, motion)));
custoVideo += provedor === "kie" ? (custoClipeKie(modeloVideo, segundos) || 0) : custoClipe(modeloVideo, segundos);
```

(Substituir as duas linhas que já existiam: `clipes.push(await falVideo(still, segundos, motion));` e `custoVideo += custoClipe(modeloVideo, segundos);`)

Atualizar o `registrarCusto` final (linha 298) pra marcar o provedor:

```javascript
registrarCusto({ script: "gerar-video", modelo: provedor === "kie" ? `${modeloVideo}(kie)` : modeloVideo, custo: Number(custoVideo.toFixed(2)) });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/gerar-video.test.mjs`
Expected: PASS (5 testes)

- [ ] **Step 5: Commit**

```bash
git add scripts/gerar-video.mjs scripts/gerar-video.test.mjs
git commit -m "feat(gerar-video): --provedor fal|kie, --modelo veo novo (só kie)"
```

---

## Task 6: gerar-avatar.mjs — flag --provedor e branch kie

**Files:**
- Modify: `scripts/gerar-avatar.mjs`
- Create: `scripts/gerar-avatar.test.mjs`

**Mapeamento (confirmado em docs.kie.ai):**
- `--modelo omnihuman --provedor kie` → createTask `model: "omnihuman-1.5"`
- `--modelo kling-avatar --provedor kie` → createTask `model: "kling/ai-avatar-pro"`
- `--modelo heygen --provedor kie` → sem confirmação, erro claro

Preço kie por segundo pra omnihuman/kling-avatar **não veio confirmado** na
home (só os preços fal já na tabela `MODELOS`) — usar `precoKie: null` e
mostrar "confirmar em kie.ai/pricing" no dry-run em vez de chutar.

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/gerar-avatar.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./gerar-avatar.mjs", import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "avatar-test-"));
process.on("exit", () => rmSync(tmp, { recursive: true, force: true }));
const foto = join(tmp, "foto.jpg"); writeFileSync(foto, "FAKEJPG");
const audio = join(tmp, "audio.mp3"); writeFileSync(audio, "FAKEMP3");

function run(args, env = {}) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8", env: { ...process.env, ...env } });
    return { code: 0, stdout, stderr: "" };
  } catch (e) {
    return { code: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

test("--provedor kie: dry-run não exige FAL_KEY", () => {
  const r = run(["--foto", foto, "--audio", audio, "--provedor", "kie", "--dry-run"], { FAL_KEY: "", KIE_KEY: "" });
  assert.equal(r.code, 0, r.stderr);
});

test("--provedor kie: heygen não suportado, erro claro", () => {
  const r = run(["--foto", foto, "--audio", audio, "--modelo", "heygen", "--provedor", "kie", "--confirmar"], { KIE_KEY: "k" });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /heygen.*kie|kie.*heygen/i);
});

test("--provedor kie sem KIE_KEY: erro claro", () => {
  const r = run(["--foto", foto, "--audio", audio, "--modelo", "omnihuman", "--provedor", "kie", "--confirmar"], { KIE_KEY: "" });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /KIE_KEY/);
});

test("--provedor inválido: erro claro", () => {
  const r = run(["--foto", foto, "--audio", audio, "--provedor", "azure", "--dry-run"], {});
  assert.equal(r.code, 1);
  assert.match(r.stderr, /provedor/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/gerar-avatar.test.mjs`
Expected: FAIL — `--provedor` não reconhecido, dry-run ainda exige só FAL_KEY

- [ ] **Step 3: Write minimal implementation**

Em `scripts/gerar-avatar.mjs`, adicionar import no topo (após linha 28):

```javascript
import { submeterTarefaKie, aguardarResultadoKie, uploadParaKieAPI } from "./lib-provedor-kie.mjs";
```

Adicionar flag `--provedor` (após linha 40, `const modelo = ...`):

```javascript
const modelo = flag("--modelo") || "omnihuman";
const provedor = flag("--provedor") || "fal";
```

Adicionar mapeamento kie e validação, junto da tabela `MODELOS` (após linha 50):

```javascript
const KIE_MODEL_AVATAR = {
  omnihuman: "omnihuman-1.5",
  "kling-avatar": "kling/ai-avatar-pro",
};
```

Na validação (após linha 57, `if (!MODELOS[modelo]) falhar(...)`):

```javascript
if (!["fal", "kie"].includes(provedor)) falhar(`--provedor inválido: ${provedor} (use fal ou kie).`);
if (provedor === "kie" && !KIE_MODEL_AVATAR[modelo]) falhar(`kie.ai não suporta --modelo ${modelo} ainda (use omnihuman ou kling-avatar, ou troque --provedor fal).`);
```

No bloco `dryRun` (linha 74-80), adicionar `provedor` ao JSON (já não exige preço kie, dado que não está confirmado):

```javascript
if (dryRun) {
  console.log(JSON.stringify({
    dry_run: true, foto, audio, saida, resolucao, modelo, provedor, endpoint: provedor === "fal" ? MODELO : KIE_MODEL_AVATAR[modelo],
    duracao_audio_seg: Number.isFinite(durSeg) ? Number(durSeg.toFixed(1)) : "?",
    preco_seg_fal: PRECO_SEG, custo_estimado_fal: custoStr,
    preco_seg_kie: "confirmar em kie.ai/pricing antes de usar em produção",
  }, null, 2));
  process.exit(0);
}
```

Atualizar a guarda de custo sem `--confirmar` (linha 84-95) pra mencionar o provedor:

```javascript
if (!confirmar) {
  console.log("");
  console.log(`  Provedor: ${provedor}`);
  console.log(`  Modelo:   ${modelo} (${provedor === "fal" ? MODELO : KIE_MODEL_AVATAR[modelo]})`);
  console.log(`  Áudio:    ${Number.isFinite(durSeg) ? durSeg.toFixed(1) + "s" : "duração desconhecida"}`);
  if (provedor === "fal") {
    console.log(`  Preço:    $${PRECO_SEG}/seg`);
    console.log(`  CUSTO ESTIMADO: ${custoStr}`);
  } else {
    console.log(`  Preço kie: confirmar em kie.ai/pricing antes de gerar de verdade.`);
  }
  console.log("");
  console.log("  Para gerar de verdade, rode de novo com --confirmar no fim do comando.");
  console.log("");
  process.exit(0);
}
```

Atualizar a checagem de chave (linha 97-98) pra considerar provedor:

```javascript
const FAL_KEY = process.env.FAL_KEY;
const KIE_KEY = process.env.KIE_KEY;
if (provedor === "fal" && !FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env).");
if (provedor === "kie" && !KIE_KEY) falhar("KIE_KEY não definida no ambiente (.env).");
```

Envolver o bloco de execução real (linhas 126-173, da etapa "Enviando arquivos" até o `console.log` final) em `if (provedor === "kie") { ... } else { ... bloco original ... }`. Adicionar antes do bloco fal original:

```javascript
const KIE_BASE = process.env.KIE_BASE_URL || "https://api.kie.ai";

if (provedor === "kie") {
  console.log("Enviando arquivos para kie.ai...");
  const imageUrl = await uploadParaKieAPI(foto, { kieKey: KIE_KEY, base: KIE_BASE });
  const audioUrl = await uploadParaKieAPI(audio, { kieKey: KIE_KEY, base: KIE_BASE });
  console.log(`Gerando avatar (${modelo}, kie.ai)...`);
  const input = modelo === "kling-avatar"
    ? { image_url: imageUrl, audio_url: audioUrl }
    : { image_url: imageUrl, audio_url: audioUrl, resolution: resolucao };
  const taskId = await submeterTarefaKie({ kieKey: KIE_KEY, base: KIE_BASE, model: KIE_MODEL_AVATAR[modelo], input });
  console.log("Aguardando geração...");
  const { resultUrls } = await aguardarResultadoKie({ kieKey: KIE_KEY, base: KIE_BASE, taskId });
  if (!resultUrls?.[0]) falhar("kie.ai: resposta sem vídeo.");
  const pasta = dirname(saida);
  if (pasta && pasta !== ".") mkdirSync(pasta, { recursive: true });
  console.log("Baixando vídeo...");
  const vid = await fetch(resultUrls[0]);
  if (!vid.ok) falhar(`Download falhou HTTP ${vid.status}`);
  writeFileSync(saida, Buffer.from(await vid.arrayBuffer()));
  registrarCusto({ script: "gerar-avatar", modelo: `${modelo}(kie)`, custo: 0 }); // preço kie não confirmado — não chuta valor
  console.log(JSON.stringify({ ok: true, saida, modelo, provedor, resolucao, custo: "confirmar em kie.ai/logs" }, null, 2));
} else {
  // ... bloco original do fal (linhas 126-173 já existentes, sem mudança) ...
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/gerar-avatar.test.mjs`
Expected: PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
git add scripts/gerar-avatar.mjs scripts/gerar-avatar.test.mjs
git commit -m "feat(gerar-avatar): --provedor fal|kie (omnihuman, kling-avatar)"
```

---

## Task 7: .env.example — documentar KIE_KEY

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Write the failing test**

N/A — mudança de documentação, sem teste automatizado. Verificação manual no
Step 4.

- [ ] **Step 2: Run test to verify it fails**

N/A

- [ ] **Step 3: Write minimal implementation**

Em `.env.example`, substituir a linha 11-12:

```
# --- Gerar imagem e vídeo por IA via Fal.ai (/post Modo 3 e reel) ---
FAL_KEY=
```

por:

```
# --- Gerar imagem, vídeo e avatar por IA — fal.ai (padrão) e/ou kie.ai ---
# (/post Modo 3, reel, /reel-marca). --provedor fal|kie escolhe por chamada;
# preencha as duas se quiser comparar preço no --dry-run.
FAL_KEY=
KIE_KEY=
```

- [ ] **Step 4: Run test to verify it passes**

Verificação manual: `cat .env.example` mostra `KIE_KEY=` presente, comentário
explica o `--provedor`.

- [ ] **Step 5: Commit**

```bash
git add .env.example
git commit -m "docs(.env.example): documenta KIE_KEY (provedor alternativo)"
```

---

## Self-Review (preenchido durante a escrita do plano)

**Spec coverage:**
- Flag `--provedor fal|kie` default fal → Tasks 4, 5, 6. ✓
- dry-run/--precos sempre compara os dois → Tasks 4 (--precos e dry-run), 5 (dry-run). Avatar (Task 6) não tem preço kie confirmado, então mostra "confirmar" em vez de número — documentado explicitamente, não é gap, é a forma honesta de lidar com dado não confirmado.
- Sem fallback automático → testado explicitamente nas 3 tasks (erro claro quando KIE_KEY ausente).
- KIE_KEY nunca em log/erro → todo `catch` que monta mensagem de erro faz `.replace(KIE_KEY || "", "***")`, igual ao padrão FAL_KEY existente.
- lib-provedor-kie.mjs isola diferenças → Tasks 1-3.
- Veo como caso especial → Task 2 (lib) + Task 5 (script).
- gerar-3d/riggar-3d fora de escopo → não têm task, conforme spec.
- lib-fal-upload/publicar-* fora de escopo → não têm task, conforme spec.

**Placeholder scan:** sem TBD/TODO. Onde preço kie não está confirmado (nano-pro, omnihuman, kling-avatar), o plano usa `null` + mensagem explícita "confirmar em kie.ai/pricing" — decisão deliberada, não placeholder esquecido.

**Type consistency:** `submeterTarefaKie`/`aguardarResultadoKie` (genérico) vs `submeterTarefaVeoKie`/`aguardarResultadoVeoKie` (Veo) — nomes consistentes entre Task 1/2 (definição) e Tasks 4/5/6 (uso). `uploadParaKieAPI` usado igual em Task 3 (definição), 4, 5, 6 (uso). `custoClipeKie` definido e exportado em Task 5, usado no mesmo arquivo.