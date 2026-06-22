import { test } from "node:test";
import assert from "node:assert/strict";
import { taxasInstagram, taxasYouTube } from "./lib-desempenho.mjs";

test("taxasInstagram calcula save/send/reach rate", () => {
  const t = taxasInstagram({ reach: 1000, saved: 50, shares: 30, seguidores: 5000, formato: "carrossel" });
  assert.equal(t.saveRate, 0.05);   // 50/1000
  assert.equal(t.sendRate, 0.03);   // 30/1000
  assert.equal(t.reachRate, 0.2);   // 1000/5000
});
test("taxasInstagram ignora reach 0 (não divide por zero)", () => {
  const t = taxasInstagram({ reach: 0, saved: 5, shares: 1, seguidores: 100 });
  assert.equal(t.saveRate, 0);
  assert.equal(t.sendRate, 0);
});

test("taxasYouTube classifica AVD por duração (educacional ~42% é ok em 5-15min)", () => {
  const t = taxasYouTube({ avdPercent: 0.42, duracaoSeg: 600, ctr: 0.05, retencao1min: 0.66, mediaCanalCtr: 0.045 });
  assert.equal(t.avdBom, true);
  assert.equal(t.ctrVsCanal, "acima");
  assert.equal(t.primeiroMinBom, true);
});
test("taxasYouTube marca AVD fraco fora da faixa", () => {
  const t = taxasYouTube({ avdPercent: 0.25, duracaoSeg: 600 });
  assert.equal(t.avdBom, false);
});
test("taxasYouTube usa faixa de Shorts (>=70%) quando ehShort", () => {
  const ok = taxasYouTube({ avdPercent: 0.72, duracaoSeg: 45, ehShort: true });
  const ruim = taxasYouTube({ avdPercent: 0.5, duracaoSeg: 45, ehShort: true });
  assert.equal(ok.avdBom, true);
  assert.equal(ruim.avdBom, false);
});
