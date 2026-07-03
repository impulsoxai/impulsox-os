import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRegistroIG, parseInsights, montarResultadoIG } from "./lib-instagram-insights.mjs";
import { lerMetaPeca, removerMeta } from "./lib-peca.mjs";

test("parseRegistroIG lê a linha canônica e ignora as linhas velhas de tabela", () => {
  const txt = `# Publicações

| Data | Canal | Link |
|---|---|---|
| 2026-07-01 | instagram | https://www.instagram.com/p/abc/ |
IG dica-lcp: id=1789; data=2026-07-02; formato=carrossel; objetivo=salvar; mecanica=resultado-especifico; formula=carousel-arc; capa=money-shot; nota-revisar=9; origem=radar; link=https://www.instagram.com/p/xyz/
| 2026-07-03 | linkedin | https://linkedin.com/feed/update/u1 |`;
  const regs = parseRegistroIG(txt);
  assert.equal(regs.length, 1);
  assert.equal(regs[0].slug, "dica-lcp");
  assert.equal(regs[0].id, "1789");
  assert.equal(regs[0].formato, "carrossel");
  assert.equal(regs[0].objetivo, "salvar");
  assert.equal(regs[0]["nota-revisar"], "9");
  assert.equal(regs[0].origem, "radar");
});

test("parseInsights normaliza a resposta da Graph API (values e total_value)", () => {
  const json = { data: [
    { name: "reach", values: [{ value: 1200 }] },
    { name: "saved", total_value: { value: 48 } },
    { name: "shares", values: [{ value: 30 }] },
    { name: "views", values: [{ value: 2200 }] },
  ] };
  assert.deepEqual(parseInsights(json), { reach: 1200, saved: 48, shares: 30, views: 2200, likes: null, comments: null });
});

test("parseInsights de resposta vazia devolve nulls", () => {
  assert.deepEqual(parseInsights({}), { reach: null, saved: null, shares: null, views: null, likes: null, comments: null });
});

test("montarResultadoIG calcula taxas e diagnóstico pela régua da casa", () => {
  const r = montarResultadoIG({
    slug: "x", mediaId: "1", formato: "carrossel",
    metricas: { reach: 1000, saved: 50, shares: 20 }, seguidores: 5000, janelaDias: 7,
  });
  assert.equal(r.taxas.saveRate, 0.05);           // 5% = sólido
  assert.equal(r.taxas.sendRate, 0.02);
  assert.equal(r.taxas.reachRate, 0.2);
  assert.deepEqual(r.diagnostico, []);            // nada a consertar
  const fraco = montarResultadoIG({ slug: "y", mediaId: "2", metricas: { reach: 1000, saved: 5, shares: 1 }, seguidores: 20000 });
  assert.ok(fraco.diagnostico.length >= 2);       // save baixo + send baixo + reach fraco
});

// --- meta da peça (lib-peca) ---

test("lerMetaPeca parseia o bloco --- do topo do legenda.md", () => {
  const txt = `---
slug: dica-lcp
formato: carrossel
objetivo: salvar
mecanica: resultado-especifico
nota-revisar: 9
---
Legenda real da peça aqui. #tag`;
  const meta = lerMetaPeca(txt);
  assert.equal(meta.slug, "dica-lcp");
  assert.equal(meta.objetivo, "salvar");
  assert.equal(meta["nota-revisar"], "9");
  assert.equal(removerMeta(txt), "Legenda real da peça aqui. #tag");
});

test("lerMetaPeca sem bloco devolve {} e removerMeta não toca o texto", () => {
  assert.deepEqual(lerMetaPeca("legenda pura"), {});
  assert.equal(removerMeta("legenda pura"), "legenda pura");
});
