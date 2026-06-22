import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarClique, classificarTipo, montarTelemetria, amostrarMovimento } from "./lib-telemetria.mjs";

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

test("classificarTipo: clicks>=2 -> double (prioridade)", () => {
  assert.equal(classificarTipo({ button: 1, clicks: 2 }), "double");
});

test("classificarTipo: button 2 ou 3 -> right", () => {
  assert.equal(classificarTipo({ button: 2, clicks: 1 }), "right");
  assert.equal(classificarTipo({ button: 3, clicks: 1 }), "right");
});

test("classificarTipo: default -> left", () => {
  assert.equal(classificarTipo({ button: 1, clicks: 1 }), "left");
  assert.equal(classificarTipo({}), "left");
});

test("montarTelemetria monta JSON normalizado e classificado, em ordem", () => {
  const tela = { largura: 1000, altura: 500, fonte: "powershell" };
  const t = montarTelemetria({
    t0: "2026-06-20T23:00:00.000Z",
    tela,
    eventos: [
      { tMs: 2300, x: 450, y: 250, button: 1, clicks: 1 },
      { tMs: 5800, x: 800, y: 100, button: 1, clicks: 2 },
    ],
  });
  assert.equal(t.t0, "2026-06-20T23:00:00.000Z");
  assert.deepEqual(t.tela, tela);
  assert.deepEqual(t.cliques, [
    { t: 2300, x: 0.45, y: 0.5, tipo: "left" },
    { t: 5800, x: 0.8,  y: 0.2, tipo: "double" },
  ]);
});

test("montarTelemetria sem eventos -> cliques vazio", () => {
  const t = montarTelemetria({ t0: "x", tela: { largura: 100, altura: 100 }, eventos: [] });
  assert.deepEqual(t.cliques, []);
});

test("amostrarMovimento registra quando passou o intervalo mínimo", () => {
  assert.equal(amostrarMovimento(0, 16, { minIntervalo: 16 }), true);
  assert.equal(amostrarMovimento(0, 20, { minIntervalo: 16 }), true);
});

test("amostrarMovimento pula quando ainda não passou o intervalo", () => {
  assert.equal(amostrarMovimento(100, 110, { minIntervalo: 16 }), false);
});

test("amostrarMovimento sempre registra o primeiro ponto (ultimo = null)", () => {
  assert.equal(amostrarMovimento(null, 0, { minIntervalo: 16 }), true);
});

test("montarTelemetria inclui movimentos normalizados em ordem", () => {
  const t = montarTelemetria({
    t0: "x", tela: { largura: 100, altura: 200 },
    eventos: [], movimentos: [{ tMs: 16, x: 50, y: 100 }, { tMs: 32, x: 100, y: 200 }],
  });
  assert.equal(t.movimentos.length, 2);
  assert.deepEqual(t.movimentos[0], { t: 16, x: 0.5, y: 0.5 });
  assert.deepEqual(t.movimentos[1], { t: 32, x: 1, y: 1 });
});

test("montarTelemetria sem movimentos -> movimentos vazio", () => {
  const t = montarTelemetria({ t0: "x", tela: { largura: 100, altura: 100 }, eventos: [] });
  assert.deepEqual(t.movimentos, []);
});
