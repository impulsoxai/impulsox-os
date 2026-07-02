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
  const j = JSON.parse(r.stdout);
  assert.equal(j.dry_run, true);
  assert.equal(j.provedor, "kie");
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

test("--provedor fal (default): dry-run funciona sem KIE_KEY", () => {
  const r = run(["--foto", foto, "--audio", audio, "--dry-run"], { FAL_KEY: "", KIE_KEY: "" });
  assert.equal(r.code, 0, r.stderr);
  const j = JSON.parse(r.stdout);
  assert.equal(j.dry_run, true);
  assert.equal(j.provedor, "fal");
});