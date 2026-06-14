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
