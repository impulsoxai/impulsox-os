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
