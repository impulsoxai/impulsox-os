#!/usr/bin/env node
/**
 * analisar-dados.mjs — agregador determinístico genérico de dados tabulares.
 * ImpulsoX AI. Sem dependências externas.
 *
 * A IA interpreta; o script calcula. Sempre que a análise tem VALOR FINANCEIRO,
 * o número sai daqui (em centavos, sem float de dinheiro), nunca de estimativa.
 *
 * Uso:
 *   node scripts/analisar-dados.mjs <arquivo.csv|.json> \
 *        --valores "Receita,Custo,Qtd" [--dimensao "Categoria"] [--moeda "Receita,Custo"]
 *
 * --valores  (obrigatório) colunas numéricas a somar, separadas por vírgula.
 * --dimensao (opcional)    coluna de categoria pra agrupar; sem ela, só o agregado total.
 * --moeda    (opcional)    subconjunto de --valores a reportar em centavos (dinheiro).
 *
 * Entrada: CSV (vírgula ou ;) ou JSON (array de objetos, ou { "dados": [...] }).
 * XLSX não entra aqui — exportar a aba pra CSV antes (a skill explica). Mantém "sem deps".
 *
 * Saída: JSON em stdout — por dimensão (quando houver) e agregado. Determinístico
 * (mesmo input → mesma saída, exceto gerado_em).
 */

import { readFileSync } from "node:fs";

function falhar(msg) {
  console.error(`ERRO: ${msg}`);
  process.exit(1);
}

// --- argumentos -------------------------------------------------------------
const args = process.argv.slice(2);
const FLAGS_COM_VALOR = new Set(["--valores", "--dimensao", "--moeda"]);
const posicionais = args.filter((a, i) => !a.startsWith("--") && !FLAGS_COM_VALOR.has(args[i - 1]));
const arquivo = posicionais[0];
if (!arquivo) falhar("informe o arquivo (.csv ou .json).");

function flag(nome) {
  const i = args.indexOf(nome);
  return i !== -1 ? args[i + 1] : undefined;
}
function lista(bruto) {
  return (bruto ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

const valores = lista(flag("--valores"));
if (valores.length === 0) falhar("--valores é obrigatório (ex.: --valores \"Receita,Custo\").");
const dimensao = flag("--dimensao");
const moeda = new Set(lista(flag("--moeda")));
for (const m of moeda) if (!valores.includes(m)) falhar(`coluna de --moeda "${m}" precisa estar em --valores.`);

// --- número BR ("1.234,56") ou US ("1,234.56"), com símbolo de moeda --------
function numero(bruto) {
  if (bruto == null) return 0;
  if (typeof bruto === "number") return Number.isFinite(bruto) ? bruto : 0;
  let s = String(bruto).replace(/[^\d.,-]/g, "").trim();
  if (s === "" || s === "-") return 0;
  const ultimaVirgula = s.lastIndexOf(","), ultimoPonto = s.lastIndexOf(".");
  if (ultimaVirgula > ultimoPonto) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// --- parser CSV (aspas, vírgula ou ;) ---------------------------------------
function parseCSV(texto) {
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

// --- ler arquivo → lista de registros (objetos {coluna: valor}) -------------
let texto;
try {
  texto = readFileSync(arquivo, "utf8").replace(/^﻿/, "");
} catch (e) {
  falhar(`não consegui ler "${arquivo}": ${e.code === "ENOENT" ? "arquivo não existe" : e.message}`);
}

const colunasPedidas = [...(dimensao ? [dimensao] : []), ...valores];
let registros;

if (/\.json$/i.test(arquivo) || texto.trimStart().startsWith("[") || texto.trimStart().startsWith("{")) {
  let json;
  try { json = JSON.parse(texto); } catch (e) { falhar(`JSON inválido: ${e.message}`); }
  const arr = Array.isArray(json) ? json : Array.isArray(json?.dados) ? json.dados : null;
  if (!arr) falhar("JSON precisa ser um array de objetos, ou { \"dados\": [...] }.");
  registros = arr;
} else {
  const linhas = parseCSV(texto);
  if (linhas.length < 2) falhar("arquivo sem dados (só cabeçalho ou vazio).");
  // cabeçalho = primeira linha que contém TODAS as colunas pedidas
  const cabIdx = linhas.findIndex((l) => {
    const set = new Set(l.map((c) => c.trim()));
    return colunasPedidas.every((c) => set.has(c));
  });
  if (cabIdx === -1) falhar(`não achei um cabeçalho com as colunas: ${colunasPedidas.join(" | ")}. Confira os nomes contra o arquivo.`);
  const cab = linhas[cabIdx].map((c) => c.trim());
  registros = linhas.slice(cabIdx + 1).map((l) => {
    const o = {};
    cab.forEach((nome, i) => { o[nome] = l[i]; });
    return o;
  });
}

// valida que as colunas existem no primeiro registro
if (registros.length === 0) falhar("nenhum registro de dados encontrado.");
const presentes = new Set(Object.keys(registros[0] ?? {}));
for (const c of colunasPedidas) if (!presentes.has(c)) falhar(`coluna "${c}" não existe nos dados. Colunas: ${[...presentes].join(" | ")}`);

// --- agregação --------------------------------------------------------------
const r4 = (n) => Math.round(n * 10000) / 10000;
const centavos = (n) => Math.round(n * 100);

function novoBucket() {
  const b = { _n: 0 };
  for (const v of valores) b[v] = 0;
  return b;
}
function formatar(bucket) {
  const out = { registros: bucket._n };
  for (const v of valores) {
    if (moeda.has(v)) out[`${v}_centavos`] = centavos(bucket[v]);
    else out[v] = r4(bucket[v]);
  }
  return out;
}

const total = novoBucket();
const grupos = new Map();
let ignorados = 0;

for (const reg of registros) {
  const chave = dimensao ? String(reg[dimensao] ?? "").trim() : null;
  if (dimensao && chave === "") { ignorados++; continue; }
  total._n++;
  for (const v of valores) total[v] += numero(reg[v]);
  if (dimensao) {
    const g = grupos.get(chave) ?? novoBucket();
    g._n++;
    for (const v of valores) g[v] += numero(reg[v]);
    grupos.set(chave, g);
  }
}

// por_dimensao ordenado pelo primeiro valor (decrescente) — ranking estável
let por_dimensao = null;
if (dimensao) {
  const principal = valores[0];
  por_dimensao = [...grupos.entries()]
    .map(([k, b]) => ({ [dimensao]: k, ...formatar(b), _ord: b[principal] }))
    .sort((a, b) => b._ord - a._ord || String(a[dimensao]).localeCompare(String(b[dimensao])))
    .map(({ _ord, ...resto }) => resto);
}

console.log(JSON.stringify({
  arquivo,
  gerado_em: new Date().toISOString(),
  dimensao: dimensao ?? null,
  valores,
  moeda: [...moeda],
  registros_lidos: total._n,
  registros_ignorados: ignorados,
  ...(por_dimensao ? { por_dimensao } : {}),
  agregado: formatar(total),
}, null, 2));
