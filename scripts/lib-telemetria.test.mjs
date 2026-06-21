import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarClique } from "./lib-telemetria.mjs";

test("normalizarClique: centro da tela = 0.5/0.5", () => {
  assert.deepEqual(
    normalizarClique({ x: 768, y: 432, tela: { largura: 1536, altura: 864 } }),
    { x: 0.5, y: 0.5 }
  );
});

test("normalizarClique: clampa clique fora da tela em [0,1]", () => {
  const r = normalizarClique({ x: -50, y: 9999, tela: { largura: 1536, altura: 864 } });
  assert.equal(r.x, 0);
  assert.equal(r.y, 1);
});

test("normalizarClique: tela inválida (0) não gera divisão por zero", () => {
  const r = normalizarClique({ x: 100, y: 100, tela: { largura: 0, altura: 0 } });
  assert.ok(Number.isFinite(r.x) && Number.isFinite(r.y));
});
