#!/usr/bin/env node
/**
 * analisar-ads.mjs — agregador determinístico de exports de Google Ads / Meta Ads.
 * ImpulsoX AI. Sem dependências externas.
 *
 * Uso:
 *   node scripts/analisar-ads.mjs <arquivo.csv> --mapa '<json>' [--plataforma google|meta]
 *
 * --mapa: objeto JSON ligando papéis às colunas reais do CSV. Papéis aceitos:
 *   campanha (obrigatório), custo (obrigatório), cliques, impressoes,
 *   conversoes, valor_conversao
 *   Ex.: --mapa '{"campanha":"Campaign","custo":"Cost","cliques":"Clicks",
 *                 "impressoes":"Impr.","conversoes":"Conversions"}'
 *
 * Saída: JSON em stdout — por campanha e agregado. Números em centavos quando
 * monetários (evita float de dinheiro); taxas com 4 casas.
 */

import { readFileSync } from "node:fs";

function falhar(msg) {
  console.error(`ERRO: ${msg}`);
  process.exit(1);
}

// --- argumentos -------------------------------------------------------------
const args = process.argv.slice(2);
const arquivo = args.find((a) => !a.startsWith("--"));
if (!arquivo) falhar("informe o arquivo CSV.");
const mapaIdx = args.indexOf("--mapa");
if (mapaIdx === -1 || !args[mapaIdx + 1]) falhar("--mapa é obrigatório.");
let mapa;
try {
  mapa = JSON.parse(args[mapaIdx + 1]);
} catch (e) {
  falhar(`--mapa não é JSON válido: ${e.message}`);
}
if (!mapa.campanha || !mapa.custo) falhar("--mapa precisa de 'campanha' e 'custo'.");
const platIdx = args.indexOf("--plataforma");
const plataforma = platIdx !== -1 ? args[platIdx + 1] : "desconhecida";

// --- parser CSV (aspas, vírgula ou ponto-e-vírgula) -------------------------
function parseCSV(texto) {
  // detecta separador pelo texto inteiro (exports têm linhas de título sem separador)
  const sep = (texto.match(/;/g) || []).length > (texto.match(/,/g) || []).length ? ";" : ",";
  const linhas = [];
  let campo = "", linha = [], dentroAspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentroAspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') dentroAspas = false;
      else campo += c;
    } else if (c === '"') dentroAspas = true;
    else if (c === sep) { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo); campo = "";
      if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo !== "" || linha.length) { linha.push(campo); if (linha.some((x) => x.trim() !== "")) linhas.push(linha); }
  return linhas;
}

// número em formato BR ("1.234,56") ou US ("1,234.56"), com símbolo de moeda
function numero(bruto) {
  if (bruto == null) return 0;
  let s = String(bruto).replace(/[^\d.,-]/g, "").trim();
  if (s === "" || s === "-") return 0;
  const ultimaVirgula = s.lastIndexOf(","), ultimoPonto = s.lastIndexOf(".");
  if (ultimaVirgula > ultimoPonto) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// --- leitura ----------------------------------------------------------------
const texto = readFileSync(arquivo, "utf8").replace(/^﻿/, "");
const linhas = parseCSV(texto);
if (linhas.length < 2) falhar("CSV sem dados.");

// exports do Google Ads costumam ter linhas de título antes do cabeçalho real:
// procura a linha que contém a coluna 'campanha' do mapa
let cabecalhoIdx = linhas.findIndex((l) => l.some((c) => c.trim() === mapa.campanha));
if (cabecalhoIdx === -1) falhar(`coluna "${mapa.campanha}" não encontrada em nenhuma linha de cabeçalho. Confira o --mapa contra o CSV.`);
const cabecalho = linhas[cabecalhoIdx].map((c) => c.trim());

const idx = {};
for (const [papel, coluna] of Object.entries(mapa)) {
  const i = cabecalho.indexOf(coluna);
  if (i === -1) falhar(`coluna "${coluna}" (papel: ${papel}) não existe no cabeçalho. Colunas: ${cabecalho.join(" | ")}`);
  idx[papel] = i;
}

// linhas de total que as plataformas anexam ao fim — ignorar
const LIXO = /^(total|totais|all campaigns|todas as campanhas|conta|account)/i;

const porCampanha = new Map();
for (const l of linhas.slice(cabecalhoIdx + 1)) {
  const nome = (l[idx.campanha] ?? "").trim();
  if (!nome || LIXO.test(nome)) continue;
  const atual = porCampanha.get(nome) ?? { custo: 0, cliques: 0, impressoes: 0, conversoes: 0, valor_conversao: 0 };
  atual.custo += numero(l[idx.custo]);
  if (idx.cliques != null) atual.cliques += numero(l[idx.cliques]);
  if (idx.impressoes != null) atual.impressoes += numero(l[idx.impressoes]);
  if (idx.conversoes != null) atual.conversoes += numero(l[idx.conversoes]);
  if (idx.valor_conversao != null) atual.valor_conversao += numero(l[idx.valor_conversao]);
  porCampanha.set(nome, atual);
}
if (porCampanha.size === 0) falhar("nenhuma campanha lida — confira o mapeamento.");

// --- métricas ---------------------------------------------------------------
const r4 = (n) => Math.round(n * 10000) / 10000;
const centavos = (n) => Math.round(n * 100);
const campanhas = [...porCampanha.entries()].map(([nome, m]) => ({
  campanha: nome,
  custo_centavos: centavos(m.custo),
  cliques: Math.round(m.cliques),
  impressoes: Math.round(m.impressoes),
  conversoes: r4(m.conversoes),
  valor_conversao_centavos: centavos(m.valor_conversao),
  ctr: m.impressoes > 0 ? r4(m.cliques / m.impressoes) : null,
  cpc_centavos: m.cliques > 0 ? Math.round(centavos(m.custo) / m.cliques) : null,
  cpa_centavos: m.conversoes > 0 ? Math.round(centavos(m.custo) / m.conversoes) : null,
  roas: m.custo > 0 && m.valor_conversao > 0 ? r4(m.valor_conversao / m.custo) : null,
  dado_suficiente: m.cliques >= 100,
}));

// ranking: com conversão primeiro (CPA crescente), depois sem conversão (custo decrescente)
campanhas.sort((a, b) => {
  const ac = a.conversoes > 0, bc = b.conversoes > 0;
  if (ac && !bc) return -1;
  if (!ac && bc) return 1;
  if (ac && bc) return a.cpa_centavos - b.cpa_centavos;
  return b.custo_centavos - a.custo_centavos;
});

const tot = campanhas.reduce((t, c) => ({
  custo_centavos: t.custo_centavos + c.custo_centavos,
  cliques: t.cliques + c.cliques,
  impressoes: t.impressoes + c.impressoes,
  conversoes: r4(t.conversoes + c.conversoes),
  valor_conversao_centavos: t.valor_conversao_centavos + c.valor_conversao_centavos,
}), { custo_centavos: 0, cliques: 0, impressoes: 0, conversoes: 0, valor_conversao_centavos: 0 });

console.log(JSON.stringify({
  plataforma,
  arquivo,
  gerado_em: new Date().toISOString(),
  papeis_mapeados: Object.keys(idx),
  campanhas,
  agregado: {
    ...tot,
    ctr: tot.impressoes > 0 ? r4(tot.cliques / tot.impressoes) : null,
    cpc_centavos: tot.cliques > 0 ? Math.round(tot.custo_centavos / tot.cliques) : null,
    cpa_centavos: tot.conversoes > 0 ? Math.round(tot.custo_centavos / tot.conversoes) : null,
    roas: tot.custo_centavos > 0 && tot.valor_conversao_centavos > 0 ? r4(tot.valor_conversao_centavos / tot.custo_centavos) : null,
  },
}, null, 2));
