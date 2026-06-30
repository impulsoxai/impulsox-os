// scripts/gerar-imagem.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, execFile } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";

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

// Versão assíncrona: os testes que falam com o mock-server in-process PRECISAM
// dela. execFileSync trava o event loop do processo de teste, então o mock
// (que roda nesse mesmo processo) nunca responde e o fetch do script pendura.
// execFile não bloqueia o loop, então o servidor consegue responder.
function runAsync(args, env = {}) {
  return new Promise((resolve) => {
    execFile("node", [SCRIPT, ...args], { encoding: "utf8", env: { ...process.env, ...env } }, (err, stdout, stderr) => {
      resolve({ code: err ? (err.code ?? 1) : 0, stdout: stdout ?? "", stderr: stderr ?? "" });
    });
  });
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
  const r = await runAsync(["--prompt", "gold studio", "--saida", out], { FAL_KEY: "test", FAL_BASE_URL: url });
  srv.close();
  assert.equal(r.code, 0, r.stderr);
  assert.ok(existsSync(out), "PNG foi escrito");
});

test("dry-run: não chama a Fal e imprime o plano", () => {
  const out = join(tmp, "dry.png");
  const r = run(["--prompt", "x", "--saida", out, "--dry-run"], { FAL_KEY: "" });
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, /minimax/);
  assert.ok(!existsSync(out), "dry-run não escreve arquivo");
});

test("minimax (default) manda aspect_ratio; flux manda image_size", async () => {
  const recebido = {};
  const { srv, url } = await mockFal((req, payload, res) => {
    recebido[req.url] = payload;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ images: [{ url: `data:image/png;base64,${PNG_1x1_B64}` }] }));
  });
  const rm = await runAsync(["--prompt", "x", "--saida", join(tmp, "m.png")], { FAL_KEY: "t", FAL_BASE_URL: url });
  const rf = await runAsync(["--prompt", "x", "--saida", join(tmp, "f.png"), "--modelo", "schnell"], { FAL_KEY: "t", FAL_BASE_URL: url });
  srv.close();
  assert.equal(rm.code, 0, rm.stderr);
  assert.equal(rf.code, 0, rf.stderr);
  const minimaxReq = recebido["/fal-ai/minimax/image-01"];
  const fluxReq = recebido["/fal-ai/flux/schnell"];
  assert.ok(minimaxReq?.aspect_ratio, "minimax manda aspect_ratio");
  assert.ok(!minimaxReq?.image_size, "minimax não manda image_size");
  assert.ok(fluxReq?.image_size, "flux manda image_size");
});

test("erro amigável quando a Fal recusa o prompt (sem images)", async () => {
  const out = join(tmp, "rec.png");
  const { srv, url } = await mockFal((req, payload, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ images: [] }));
  });
  const r = await runAsync(["--prompt", "x", "--saida", out], { FAL_KEY: "test", FAL_BASE_URL: url });
  srv.close();
  assert.equal(r.code, 1);
  assert.match(r.stderr, /recusad|sem imagem/i);
});

test("a FAL_KEY nunca aparece no stderr", async () => {
  const out = join(tmp, "k.png");
  const { srv, url } = await mockFal((req, payload, res) => { res.writeHead(500); res.end("boom"); });
  const r = await runAsync(["--prompt", "x", "--saida", out], { FAL_KEY: "super-secreta-123", FAL_BASE_URL: url });
  srv.close();
  assert.equal(r.code, 1);
  assert.doesNotMatch(r.stderr, /super-secreta-123/);
});

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
