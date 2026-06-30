// lib-velocidade.mjs — speed-to-lead: quanto o negócio perde por responder devagar.
// Dinheiro/lead só por script, nunca de cabeça (regra da casa). Sem dado → null, não inventa.
//
// Base de evidência (fontes 2026, ver docs/auditoria-esteira-2026-06-29.md):
//  - contato em <5min: ~21x mais qualifica e ~100x mais conecta vs. 30min+ (Lead Response Mgmt / Cira)
//  - odds de qualificar caem ~80% quando a resposta vai de 5min → 10min
//  - <1min: ~391% mais converte que qualquer tempo depois
//  - 78% compra de quem responde PRIMEIRO
// Modelagem: índice de qualificação relativo por faixa de tempo de 1ª resposta (1.0 = ideal <5min).
// Conservador de propósito — vende o mecanismo, não promete número exato (leilão/mercado variam).

// Faixas e o índice de qualificação relativo (quanto da janela ideal você ainda captura).
// Ancorado nos dados acima: <5min = 1.0; cada degrau perde forte; 24h+ ~ resto.
const FAIXAS = [
  { ateMin: 1,        indice: 1.00, rotulo: "< 1 min" },
  { ateMin: 5,        indice: 0.90, rotulo: "1–5 min" },
  { ateMin: 10,       indice: 0.45, rotulo: "5–10 min" },   // queda ~80% no qualify de 5→10min
  { ateMin: 30,       indice: 0.25, rotulo: "10–30 min" },
  { ateMin: 60,       indice: 0.15, rotulo: "30–60 min" },
  { ateMin: 60 * 24,  indice: 0.08, rotulo: "1–24 h" },
  { ateMin: Infinity, indice: 0.04, rotulo: "> 24 h" },     // 42h é a média de mercado do setor
];

// minutos → { indice, rotulo } da faixa correspondente. Sem entrada válida → null.
export function faixaDeTempo(minutos) {
  if (minutos === null || minutos === undefined || Number.isNaN(Number(minutos)) || Number(minutos) < 0) {
    return null;
  }
  const m = Number(minutos);
  for (const f of FAIXAS) {
    if (m <= f.ateMin) return { indice: f.indice, rotulo: f.rotulo };
  }
  return FAIXAS[FAIXAS.length - 1];
}

// Núcleo: dado o tempo de resposta ATUAL e a meta (default <5min), quanto se ganha.
// { leadsMes, tempoAtualMin, tempoMetaMin?, valorPorCliente?, taxaFechamentoBase? }
// → { ...entradas, indiceAtual, indiceMeta, leadsQualificadosAtual, leadsQualificadosMeta,
//     leadsExtras, ganhoFinanceiro, multiplicador, pendencias }
// Qualquer entrada essencial faltando vira pendência (null), nunca número inventado.
export function calcularPerda({
  leadsMes,
  tempoAtualMin,
  tempoMetaMin = 5,
  valorPorCliente = null,
  taxaFechamentoBase = null,
} = {}) {
  const pendencias = [];
  const fAtual = faixaDeTempo(tempoAtualMin);
  const fMeta  = faixaDeTempo(tempoMetaMin);
  const leads  = Number(leadsMes);

  if (fAtual === null) pendencias.push("tempoAtualMin");
  if (fMeta === null)  pendencias.push("tempoMetaMin");
  if (!Number.isFinite(leads) || leads <= 0) pendencias.push("leadsMes");

  // Sem o essencial, devolve a estrutura com null — quem chama marca "confirmar com o cliente".
  if (pendencias.length) {
    return {
      leadsMes: Number.isFinite(leads) ? leads : null,
      tempoAtualMin: tempoAtualMin ?? null,
      tempoMetaMin,
      indiceAtual: fAtual?.indice ?? null,
      indiceMeta: fMeta?.indice ?? null,
      leadsQualificadosAtual: null,
      leadsQualificadosMeta: null,
      leadsExtras: null,
      multiplicador: null,
      ganhoFinanceiro: null,
      valorPorCliente: valorPorCliente ?? null,
      taxaFechamentoBase: taxaFechamentoBase ?? null,
      pendencias,
    };
  }

  const qualAtual = leads * fAtual.indice;
  const qualMeta  = leads * fMeta.indice;
  const leadsExtras = qualMeta - qualAtual;
  const multiplicador = fAtual.indice > 0 ? fMeta.indice / fAtual.indice : null;

  // Ganho financeiro só calcula se há valor por cliente E taxa de fechamento (senão fica pendente).
  let ganhoFinanceiro = null;
  if (valorPorCliente !== null && taxaFechamentoBase !== null) {
    const vpc = Number(valorPorCliente);
    const taxa = Number(taxaFechamentoBase);
    if (Number.isFinite(vpc) && vpc > 0 && Number.isFinite(taxa) && taxa > 0) {
      ganhoFinanceiro = leadsExtras * taxa * vpc;
    } else {
      pendencias.push(valorPorCliente !== null && (!Number.isFinite(vpc) || vpc <= 0) ? "valorPorCliente" : "taxaFechamentoBase");
    }
  } else {
    if (valorPorCliente === null) pendencias.push("valorPorCliente");
    if (taxaFechamentoBase === null) pendencias.push("taxaFechamentoBase");
  }

  return {
    leadsMes: leads,
    tempoAtualMin: Number(tempoAtualMin),
    tempoMetaMin: Number(tempoMetaMin),
    indiceAtual: fAtual.indice,
    indiceMeta: fMeta.indice,
    leadsQualificadosAtual: round1(qualAtual),
    leadsQualificadosMeta: round1(qualMeta),
    leadsExtras: round1(leadsExtras),
    multiplicador: multiplicador === null ? null : round1(multiplicador),
    ganhoFinanceiro: ganhoFinanceiro === null ? null : Math.round(ganhoFinanceiro),
    valorPorCliente: valorPorCliente === null ? null : Number(valorPorCliente),
    taxaFechamentoBase: taxaFechamentoBase === null ? null : Number(taxaFechamentoBase),
    pendencias,
  };
}

// Calcula tempo médio de 1ª resposta (em min) a partir de pares lead→1ª interação do CRM.
// pares: [{ criadoEm, primeiraRespostaEm }]. Ignora pares incompletos. Vazio → null.
export function tempoMedioResposta(pares = []) {
  const difs = [];
  for (const p of pares) {
    if (!p || !p.criadoEm || !p.primeiraRespostaEm) continue;
    const ini = new Date(p.criadoEm).getTime();
    const fim = new Date(p.primeiraRespostaEm).getTime();
    if (Number.isNaN(ini) || Number.isNaN(fim) || fim < ini) continue;
    difs.push((fim - ini) / 60000); // ms → min
  }
  if (!difs.length) return null;
  const media = difs.reduce((a, b) => a + b, 0) / difs.length;
  return round1(media);
}

function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

// BRL pra exibir (mesma régua do lib-roi).
export function formatarBRL(v) {
  if (v === null || v === undefined) return "—";
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
