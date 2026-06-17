import { test } from "node:test";
import assert from "node:assert/strict";
import { montarResultado } from "./metricas-youtube.mjs";

test("montarResultado junta métricas + benchmark + veredito", () => {
  const r = montarResultado({
    videoId: "abc", ehShort: false, duracaoSeg: 500,
    metricas: { views: 1000, averageViewPercentage: 60, averageViewDuration: 300, subscribersGained: 10 },
  });
  assert.equal(r.videoId, "abc");
  assert.equal(r.benchmark, 55);        // 5-10min
  assert.equal(r.veredito, "validada"); // 60 >= 55
  assert.equal(r.metricas.views, 1000);
});

test("montarResultado: retenção abaixo do benchmark -> a testar (sem reprovação anterior)", () => {
  const r = montarResultado({
    videoId: "x", ehShort: true, duracaoSeg: 20,
    metricas: { averageViewPercentage: 50 },
  });
  assert.equal(r.benchmark, 70);
  assert.equal(r.veredito, "a testar");
});
