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
  assert.match(r.stdout, /schnell/);
  assert.ok(!existsSync(out), "dry-run não escreve arquivo");
});
