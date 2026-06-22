import { test } from "node:test";
import assert from "node:assert/strict";
import { taxasInstagram, taxasYouTube, detectarCurva, diagnosticarYouTube, diagnosticarInstagram, parsearCsv } from "./lib-desempenho.mjs";

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

test("diagnosticarYouTube: AVD baixo + intro dip -> hook fraco -> /roteiro-yt", () => {
  const d = diagnosticarYouTube({ taxas: { avdBom: false, ctrVsCanal: "acima" }, curva: { introDip: true, cliffs: [] } });
  const hookFraco = d.find((x) => x.skill === "/roteiro-yt" && /hook/i.test(x.motivo));
  assert.ok(hookFraco);
});
test("diagnosticarYouTube: CTR abaixo + AVD bom -> thumbnail -> /thumbnail", () => {
  const d = diagnosticarYouTube({ taxas: { avdBom: true, ctrVsCanal: "abaixo" }, curva: null });
  assert.ok(d.find((x) => x.skill === "/thumbnail"));
});
test("diagnosticarYouTube: cliff -> /editar-video", () => {
  const d = diagnosticarYouTube({ taxas: { avdBom: true }, curva: { introDip: false, cliffs: [{ tSeg: 90, queda: 0.2 }] } });
  assert.ok(d.find((x) => x.skill === "/editar-video"));
});
test("diagnosticarYouTube tudo bom -> sem conserto", () => {
  const d = diagnosticarYouTube({ taxas: { avdBom: true, ctrVsCanal: "acima" }, curva: { introDip: false, cliffs: [] } });
  assert.equal(d.filter((x) => x.skill).length, 0);
});

test("diagnosticarInstagram: save baixo -> /post slide-resumo", () => {
  const d = diagnosticarInstagram({ saveRate: 0.01, sendRate: 0.02, reachRate: 0.2 });
  assert.ok(d.find((x) => x.skill === "/post" && /salv|guard/i.test(x.motivo)));
});
test("diagnosticarInstagram: send ~0 -> gancho de envio", () => {
  const d = diagnosticarInstagram({ saveRate: 0.05, sendRate: 0.0, reachRate: 0.2 });
  assert.ok(d.find((x) => /envi/i.test(x.motivo)));
});
test("diagnosticarInstagram: reach baixo -> testar reel + hook", () => {
  const d = diagnosticarInstagram({ saveRate: 0.05, sendRate: 0.03, reachRate: 0.05 });
  assert.ok(d.find((x) => /reach|alcance|reel/i.test(x.motivo)));
});
test("diagnosticarInstagram tudo bom -> sem conserto", () => {
  const d = diagnosticarInstagram({ saveRate: 0.07, sendRate: 0.04, reachRate: 0.25 });
  assert.equal(d.length, 0);
});

test("parsearCsv (Instagram Business Suite) mapeia Saves/Shares/Reach e ignora Impressions", () => {
  const csv = "Post Date,Reach,Impressions,Likes,Shares,Saves\n2026-06-01,1000,1300,80,30,50";
  const linhas = parsearCsv(csv);
  assert.equal(linhas[0].reach, 1000);
  assert.equal(linhas[0].saved, 50);
  assert.equal(linhas[0].shares, 30);
  assert.equal(linhas[0].impressions, undefined);
});
test("parsearCsv (YouTube Studio) mapeia Average percentage viewed e CTR", () => {
  const csv = "Views,Average percentage viewed (%),Impressions click-through rate (%)\n1200,42,5.0";
  const linhas = parsearCsv(csv);
  assert.equal(linhas[0].avdPercent, 0.42);
  assert.equal(linhas[0].ctr, 0.05);
});
test("parsearCsv vazio devolve []", () => {
  assert.deepEqual(parsearCsv(""), []);
});
