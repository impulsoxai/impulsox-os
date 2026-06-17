import { test } from "node:test";
import assert from "node:assert/strict";
import {
  benchmarkRetencao, avaliarFormula, montarQueryAnalytics, diasDesdePublicacao, parseMetricasManual,
} from "./lib-youtube-analytics.mjs";

// --- Task 1: benchmarkRetencao ---

test("benchmarkRetencao: short sempre 70", () => {
  assert.equal(benchmarkRetencao({ ehShort: true, duracaoSeg: 20 }), 70);
});

test("benchmarkRetencao: long por faixa de duração", () => {
  assert.equal(benchmarkRetencao({ ehShort: false, duracaoSeg: 200 }), 70);  // <5min
  assert.equal(benchmarkRetencao({ ehShort: false, duracaoSeg: 500 }), 55);  // 5-10min
  assert.equal(benchmarkRetencao({ ehShort: false, duracaoSeg: 800 }), 45);  // 10-15min
  assert.equal(benchmarkRetencao({ ehShort: false, duracaoSeg: 1200 }), 40); // 15min+
});

// --- Task 2: avaliarFormula ---

test("avaliarFormula: acima do benchmark -> validada", () => {
  assert.equal(avaliarFormula({ averageViewPercentage: 60, benchmark: 55 }), "validada");
});

test("avaliarFormula: abaixo do benchmark com 1 reprovação anterior -> nao funciona", () => {
  assert.equal(avaliarFormula({ averageViewPercentage: 40, benchmark: 55, reprovacoesAnteriores: 1 }), "nao funciona");
});

test("avaliarFormula: abaixo do benchmark sem reprovação anterior -> a testar", () => {
  assert.equal(avaliarFormula({ averageViewPercentage: 40, benchmark: 55, reprovacoesAnteriores: 0 }), "a testar");
});

test("avaliarFormula: mediaCanal sobrepõe o benchmark quando informada", () => {
  // benchmark 55, mas a média do canal é 45 -> APV 50 supera a média -> validada
  assert.equal(avaliarFormula({ averageViewPercentage: 50, benchmark: 55, mediaCanal: 45 }), "validada");
});

// --- Task 3: montarQueryAnalytics + diasDesdePublicacao ---

test("montarQueryAnalytics monta os params certos, sem liveOrOnDemand", () => {
  const q = montarQueryAnalytics({ videoId: "abc123", dataInicio: "2026-05-01", dataFim: "2026-05-28" });
  assert.equal(q.ids, "channel==MINE");
  assert.equal(q.startDate, "2026-05-01");
  assert.equal(q.endDate, "2026-05-28");
  assert.equal(q.metrics, "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained");
  assert.equal(q.filters, "video==abc123");
  assert.equal("dimensions" in q, false); // sem liveOrOnDemand (incompatível com averageViewPercentage)
});

test("diasDesdePublicacao conta os dias corretos", () => {
  const agora = new Date("2026-05-20T00:00:00Z");
  assert.equal(diasDesdePublicacao("2026-05-10T00:00:00Z", agora), 10);
  assert.equal(diasDesdePublicacao("2026-05-19T00:00:00Z", agora), 1);
});

// --- Task 4: parseMetricasManual ---

test("parseMetricasManual extrai os 4 campos de um bloco colado do Studio", () => {
  const texto = `
    Visualizações: 12.500
    Porcentagem média assistida: 58%
    Duração média da visualização: 4:12
    Inscritos ganhos: 37
  `;
  assert.deepEqual(parseMetricasManual(texto), {
    views: 12500,
    averageViewPercentage: 58,
    averageViewDuration: 252,
    subscribersGained: 37,
  });
});

test("parseMetricasManual deixa null o que não achar", () => {
  const r = parseMetricasManual("Porcentagem média assistida: 70%");
  assert.equal(r.averageViewPercentage, 70);
  assert.equal(r.views, null);
  assert.equal(r.subscribersGained, null);
});
