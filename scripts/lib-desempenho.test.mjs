import { test } from "node:test";
import assert from "node:assert/strict";
import { taxasInstagram, taxasYouTube, detectarCurva } from "./lib-desempenho.mjs";

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

test("detectarCurva acha intro dip (perda >40% nos primeiros 30s)", () => {
  const serie = [{ tSeg: 0, retencao: 1.0 }, { tSeg: 30, retencao: 0.5 }, { tSeg: 60, retencao: 0.45 }];
  const d = detectarCurva(serie, { duracaoSeg: 600 });
  assert.equal(d.introDip, true);
});
test("detectarCurva acha cliff (queda >15% num único segmento)", () => {
  const serie = [{ tSeg: 0, retencao: 1.0 }, { tSeg: 30, retencao: 0.9 }, { tSeg: 60, retencao: 0.7 }, { tSeg: 90, retencao: 0.5 }];
  const d = detectarCurva(serie, { duracaoSeg: 600 });
  assert.ok(d.cliffs.length >= 1);
});
test("detectarCurva curva saudável (queda gradual) não marca cliff", () => {
  const serie = [{ tSeg: 0, retencao: 1.0 }, { tSeg: 30, retencao: 0.7 }, { tSeg: 60, retencao: 0.65 }, { tSeg: 90, retencao: 0.6 }];
  const d = detectarCurva(serie, { duracaoSeg: 600 });
  assert.equal(d.cliffs.length, 0);
});
test("detectarCurva sem série devolve null (modo colar sem curva)", () => {
  assert.equal(detectarCurva(null), null);
  assert.equal(detectarCurva([]), null);
});
