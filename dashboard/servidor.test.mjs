import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { criarServidor } from "./servidor.mjs";

function repoFixture() {
  const raiz = mkdtempSync(join(tmpdir(), "srv-"));
  mkdirSync(join(raiz, "nucleo"), { recursive: true });
  writeFileSync(join(raiz, "nucleo", "escada.md"), "**Degrau atual:** 2 — x\n");
  writeFileSync(join(raiz, ".env"), "FAL_KEY=segredo-que-nao-pode-vazar-123\n");
  return raiz;
}

test("GET /api/estado devolve o JSON do estado", async () => {
  const raiz = repoFixture();
  const srv = criarServidor(raiz);
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const porta = srv.address().port;
  const resp = await fetch(`http://127.0.0.1:${porta}/api/estado`);
  const j = await resp.json();
  assert.equal(resp.status, 200);
  assert.equal(j.escada.degrau, 2);
  srv.close();
});

test("nenhum segredo do .env aparece no /api/estado", async () => {
  const raiz = repoFixture();
  const srv = criarServidor(raiz);
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const porta = srv.address().port;
  const txt = await (await fetch(`http://127.0.0.1:${porta}/api/estado`)).text();
  assert.doesNotMatch(txt, /segredo-que-nao-pode-vazar/);
  assert.doesNotMatch(txt, /FAL_KEY/);
  srv.close();
});

test("path traversal é negado", async () => {
  const raiz = repoFixture();
  const srv = criarServidor(raiz);
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const porta = srv.address().port;
  const resp = await fetch(`http://127.0.0.1:${porta}/../.env`);
  assert.notEqual(resp.status, 200);
  srv.close();
});

test("/marca/tokens.css é servido quando existe; outros arquivos de marca não", async () => {
  const raiz = repoFixture();
  mkdirSync(join(raiz, "marca"), { recursive: true });
  writeFileSync(join(raiz, "marca", "tokens.css"), ":root{--cor:#7c3aed}");
  writeFileSync(join(raiz, "marca", "design-guide.md"), "conteúdo de marca que não deve vazar");
  const srv = criarServidor(raiz);
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const porta = srv.address().port;
  const css = await fetch(`http://127.0.0.1:${porta}/marca/tokens.css`);
  assert.equal(css.status, 200);
  assert.match(await css.text(), /--cor/);
  const dg = await fetch(`http://127.0.0.1:${porta}/marca/design-guide.md`);
  assert.notEqual(dg.status, 200);
  const txt = await dg.text();
  assert.doesNotMatch(txt, /não deve vazar/);
  srv.close();
});
