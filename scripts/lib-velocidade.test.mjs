import { test } from "node:test";
import assert from "node:assert/strict";
import { faixaDeTempo, calcularPerda, tempoMedioResposta, formatarBRL } from "./lib-velocidade.mjs";

test("faixaDeTempo: limites das faixas", () => {
  assert.equal(faixaDeTempo(0.5).rotulo, "< 1 min");
  assert.equal(faixaDeTempo(5).rotulo, "1–5 min");
  assert.equal(faixaDeTempo(8).rotulo, "5–10 min");
  assert.equal(faixaDeTempo(42 * 60).rotulo, "> 24 h"); // 42h, média de mercado
});

test("faixaDeTempo: entrada inválida → null (não inventa)", () => {
  assert.equal(faixaDeTempo(null), null);
  assert.equal(faixaDeTempo(-3), null);
  assert.equal(faixaDeTempo("abc"), null);
});

test("calcularPerda: 100 leads, hoje responde em 24h, meta 5min", () => {
  const r = calcularPerda({ leadsMes: 100, tempoAtualMin: 60 * 24, tempoMetaMin: 5 });
  // índice 1-24h = 0.08; meta 1-5min = 0.90
  assert.equal(r.leadsQualificadosAtual, 8);
  assert.equal(r.leadsQualificadosMeta, 90);
  assert.equal(r.leadsExtras, 82);
  assert.equal(r.multiplicador, 11.3); // 0.90/0.08 ≈ 11.25 → 11.3 (mostra "11x mais")
  // sem valorPorCliente/taxa → ganho fica pendente
  assert.equal(r.ganhoFinanceiro, null);
  assert.ok(r.pendencias.includes("valorPorCliente"));
});

test("calcularPerda: com valor por cliente e taxa → ganho financeiro por script", () => {
  const r = calcularPerda({
    leadsMes: 100, tempoAtualMin: 60 * 24, tempoMetaMin: 5,
    valorPorCliente: 800, taxaFechamentoBase: 0.2,
  });
  // leadsExtras 82 × taxa 0.2 × R$800 = R$13.120
  assert.equal(r.ganhoFinanceiro, 13120);
  assert.equal(r.pendencias.length, 0);
});

test("calcularPerda: leadsMes ausente → pendência, sem número inventado", () => {
  const r = calcularPerda({ tempoAtualMin: 120, tempoMetaMin: 5 });
  assert.equal(r.leadsExtras, null);
  assert.equal(r.ganhoFinanceiro, null);
  assert.ok(r.pendencias.includes("leadsMes"));
});

test("tempoMedioResposta: média de pares válidos em minutos", () => {
  const pares = [
    { criadoEm: "2026-06-01T10:00:00Z", primeiraRespostaEm: "2026-06-01T10:10:00Z" }, // 10 min
    { criadoEm: "2026-06-01T11:00:00Z", primeiraRespostaEm: "2026-06-01T11:20:00Z" }, // 20 min
  ];
  assert.equal(tempoMedioResposta(pares), 15);
});

test("tempoMedioResposta: ignora pares incompletos/invertidos; vazio → null", () => {
  const pares = [
    { criadoEm: "2026-06-01T10:00:00Z" }, // sem resposta
    { criadoEm: "2026-06-01T12:00:00Z", primeiraRespostaEm: "2026-06-01T11:00:00Z" }, // invertido
  ];
  assert.equal(tempoMedioResposta(pares), null);
  assert.equal(tempoMedioResposta([]), null);
});

test("formatarBRL: null → travessão, número → BRL", () => {
  assert.equal(formatarBRL(null), "—");
  assert.equal(formatarBRL(13120), "R$ 13.120,00");
});
