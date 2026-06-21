import { test } from "node:test";
import assert from "node:assert/strict";
import { agruparClusters, focoCentroide, nivelPorForca, montarRegioesZoom, aplicarLimitesAuto } from "./lib-zoom.mjs";

// ============ TASK 1: agruparClusters ============
test("agruparClusters: cliques com gap <= 2.5s = 1 cluster", () => {
  const cliques = [
    { t: 2000, x: 0.2, y: 0.4, tipo: "left" },
    { t: 2400, x: 0.3, y: 0.4, tipo: "left" },
    { t: 3000, x: 0.25, y: 0.45, tipo: "left" },
  ];
  const c = agruparClusters(cliques, { gapMs: 2500 });
  assert.equal(c.length, 1);
  assert.equal(c[0].length, 3);
});

test("agruparClusters: gap > 2.5s separa em 2 clusters", () => {
  const cliques = [
    { t: 2000, x: 0.2, y: 0.4, tipo: "left" },
    { t: 20000, x: 0.8, y: 0.6, tipo: "left" },
  ];
  const c = agruparClusters(cliques, { gapMs: 2500 });
  assert.equal(c.length, 2);
});

test("agruparClusters: lista vazia = nenhum cluster", () => {
  assert.deepEqual(agruparClusters([], { gapMs: 2500 }), []);
});

// ============ TASK 2: focoCentroide ============
test("focoCentroide: média dos x e y do cluster", () => {
  const cluster = [
    { t: 1, x: 0.2, y: 0.4, tipo: "left" },
    { t: 2, x: 0.6, y: 0.6, tipo: "left" },
  ];
  assert.deepEqual(focoCentroide(cluster), { x: 0.4, y: 0.5 });
});

// ============ TASK 3: nivelPorForca ============
test("nivelPorForca: cluster com double-click -> 2.0", () => {
  const cluster = [
    { t: 1, x: 0.5, y: 0.5, tipo: "left" },
    { t: 2, x: 0.5, y: 0.5, tipo: "double" },
  ];
  assert.equal(nivelPorForca(cluster), 2.0);
});

test("nivelPorForca: só left -> 1.5", () => {
  assert.equal(nivelPorForca([{ t: 1, x: 0.5, y: 0.5, tipo: "left" }]), 1.5);
});

test("nivelPorForca: right ganha de left", () => {
  const cluster = [
    { t: 1, x: 0.5, y: 0.5, tipo: "left" },
    { t: 2, x: 0.5, y: 0.5, tipo: "right" },
  ];
  assert.equal(nivelPorForca(cluster), 1.8);
});

// ============ TASK 4: montarRegioesZoom ============
test("montarRegioesZoom: 1 cluster vira 1 região com padding (ms->s)", () => {
  const tel = { cliques: [
    { t: 2000, x: 0.4, y: 0.3, tipo: "double" },
    { t: 3000, x: 0.5, y: 0.3, tipo: "left" },
  ] };
  const { regioes } = montarRegioesZoom(tel, { padInicioS: 0.5, padFimS: 0.8 });
  assert.equal(regioes.length, 1);
  assert.equal(regioes[0].inicio, 1.5);
  assert.equal(regioes[0].fim, 3.8);
  assert.equal(regioes[0].nivel, 2.0);
  assert.deepEqual(regioes[0].foco, { x: 0.45, y: 0.3 });
});

test("montarRegioesZoom: início negativo é clampado em 0", () => {
  const tel = { cliques: [{ t: 200, x: 0.5, y: 0.5, tipo: "left" }] };
  const { regioes } = montarRegioesZoom(tel, { padInicioS: 0.5, padFimS: 0.8 });
  assert.equal(regioes[0].inicio, 0);
});

test("montarRegioesZoom: regiões sobrepostas são fundidas", () => {
  const tel = { cliques: [
    { t: 2000, x: 0.2, y: 0.2, tipo: "left" },
    { t: 3000, x: 0.8, y: 0.8, tipo: "double" },
  ] };
  const { regioes } = montarRegioesZoom(tel, { gapMs: 500, padInicioS: 0.5, padFimS: 0.8 });
  assert.equal(regioes.length, 1);
  assert.equal(regioes[0].inicio, 1.5);
  assert.equal(regioes[0].fim, 3.8);
  assert.equal(regioes[0].nivel, 2.0);
});

test("montarRegioesZoom: sem cliques -> regioes vazio", () => {
  assert.deepEqual(montarRegioesZoom({ cliques: [] }, {}).regioes, []);
});

// ============ TASK 5: aplicarLimitesAuto ============
test("aplicarLimitesAuto: remove região mais curta que minDurS", () => {
  const regioes = [
    { inicio: 1, fim: 1.5, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 },
    { inicio: 10, fim: 13, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 },
  ];
  const r = aplicarLimitesAuto(regioes, { minDurS: 1.5, intervaloMinS: 4 });
  assert.equal(r.length, 1);
  assert.equal(r[0].inicio, 10);
});

test("aplicarLimitesAuto: descarta região muito perto da anterior", () => {
  const regioes = [
    { inicio: 1, fim: 4, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 },
    { inicio: 6, fim: 9, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 },
    { inicio: 15, fim: 18, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 },
  ];
  const r = aplicarLimitesAuto(regioes, { minDurS: 1.5, intervaloMinS: 4 });
  assert.equal(r.length, 2);
  assert.deepEqual(r.map((x) => x.inicio), [1, 15]);
});

test("aplicarLimitesAuto: lista vazia -> vazia", () => {
  assert.deepEqual(aplicarLimitesAuto([], {}), []);
});
