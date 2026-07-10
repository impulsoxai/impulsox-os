#!/usr/bin/env node
/**
 * lib-humanizador.mjs — varredura DETERMINÍSTICA dos tells mecânicos de texto de IA em
 * PT-BR. É o gate do /escritor-br: o modelo cria, a máquina verifica (tell mecânico se
 * pega com regex, não com introspecção — o audit do próprio modelo é auto-referente).
 * ZERO deps, funções puras. ImpulsoX AI.
 *
 * Três níveis:
 *  - DUROS  (restrição de "zero"): travessão, meia-risca fora de intervalo, aspa curva,
 *            " -- ". Qualquer um = não entrega.
 *  - BANIDAS (palavras da voz.md do negócio, passadas por parâmetro). Qualquer uma = não entrega.
 *  - VÍCIOS (a tabela do escritor-br, parte regexável + onda 2025): entram no audit como
 *            bullets; a régua de aglomerado é da skill (tell isolado não condena).
 *
 * Uso: node scripts/lib-humanizador.mjs <arquivo> [--banidas "palavra1,palavra2"]
 *      (exit 0 = pass; exit 1 = duros/banidas encontrados; JSON no stdout)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// posição {linha, coluna} (1-based) de um índice no texto
function posicao(texto, idx) {
  const antes = texto.slice(0, idx);
  const linhas = antes.split("\n");
  return { linha: linhas.length, coluna: linhas[linhas.length - 1].length + 1 };
}

function achar(texto, re, tipo) {
  const out = [];
  let m;
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = g.exec(texto))) {
    out.push({ tipo, trecho: m[0].slice(0, 60), ...posicao(texto, m.index) });
    if (m.index === g.lastIndex) g.lastIndex++;
  }
  return out;
}

// --- DUROS -------------------------------------------------------------------
// Meia-risca é permitida SÓ como intervalo colado (2024–2026, seg–sex, 9h–18h):
// char alfanumérico dos dois lados, sem espaço. Todo o resto (e todo travessão) falha.
export function varrerDuros(texto) {
  const out = [];
  out.push(...achar(texto, /—/g, "travessao"));
  let m;
  const re = /–/g;
  while ((m = re.exec(texto))) {
    const antes = texto[m.index - 1] || "";
    const depois = texto[m.index + 1] || "";
    const intervalo = /[0-9a-zA-Zà-úÀ-Ú]/.test(antes) && /[0-9a-zA-Zà-úÀ-Ú]/.test(depois);
    if (!intervalo) out.push({ tipo: "meia-risca", trecho: "–", ...posicao(texto, m.index) });
  }
  out.push(...achar(texto, /[“”‘’]/g, "aspa-curva"));
  out.push(...achar(texto, / -- /g, "duplo-hifen"));
  return out.sort((a, b) => a.linha - b.linha || a.coluna - b.coluna);
}

// --- BANIDAS (da voz.md) ------------------------------------------------------
export function varrerBanidas(texto, banidas = []) {
  const out = [];
  for (const p of banidas.map((s) => s.trim()).filter(Boolean)) {
    const re = new RegExp(`(?<![\\wà-ú])${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\wà-ú])`, "gi");
    out.push(...achar(texto, re, `banida:${p}`));
  }
  return out;
}

// --- VÍCIOS (tabela regexável + onda 2025) -------------------------------------
// ATENÇÃO: \b do JS não enxerga acento ("é" não é \w) — usar as fronteiras B0/B1.
const B0 = "(?<![\\wà-úÀ-Ú])"; // início de palavra (unicode PT)
const B1 = "(?![\\wà-úÀ-Ú])";  // fim de palavra (unicode PT)
const rx = (corpo) => new RegExp(`${B0}(?:${corpo})${B1}`, "gi");

const __dirname_lib = dirname(fileURLToPath(import.meta.url));
let TELLS_JSON;
try {
  TELLS_JSON = JSON.parse(readFileSync(join(__dirname_lib, "tells-ptbr.json"), "utf8"));
} catch (e) {
  throw new Error(`tells-ptbr.json ausente ou inválido (${e.message}). Esperado em scripts/tells-ptbr.json.`);
}
export const LIMITES = TELLS_JSON.limites;

// tells simples vêm do JSON, montados com as fronteiras acento-safe da casa
const VICIOS_SIMPLES = Object.entries(TELLS_JSON.tells_simples).map(([tipo, corpo]) => ({
  tipo,
  re: rx(corpo),
}));

const GERUNDIOS = "buscando|visando|proporcionando|garantindo|possibilitando|permitindo|promovendo|destacando|evidenciando|reforçando|impulsionando";
const HEDGES = "podem?|geralmente|normalmente|em muitos casos|tendem? a|costumam?|na maioria das vezes";
const ADJ = "\\w[\\wà-úÀ-Ú]*(?:oso|osa|ivo|iva|ado|ada|ido|ida|ico|ica|ente|ável|ível|al)";

const VICIOS = [
  ...VICIOS_SIMPLES,
  { tipo: "artefato-chat", re: new RegExp(`(?:^|\\n)\\s*claro[!,]|${B0}(?:ótima pergunta|espero que (?:ajude|tenha ajudado)|quer que eu)${B1}`, "gi") },
  // gerúndio encadeado: 2+ da lista na MESMA frase
  { tipo: "gerundio-encadeado", re: new RegExp(`${B0}(?:${GERUNDIOS})${B1}[^.!?\\n]{1,120}${B0}(?:${GERUNDIOS})${B1}`, "gi") },
  // hedging enfileirado: 2+ hedges na mesma frase (onda 2025)
  { tipo: "hedging-enfileirado", re: new RegExp(`${B0}(?:${HEDGES})${B1}[^.!?\\n]{1,100}${B0}(?:${HEDGES})${B1}`, "gi") },
  // trio adjetival "rápido, prático e eficiente" (primo do tricolon, em adjetivos)
  { tipo: "trio-adjetival", re: new RegExp(`${B0}${ADJ}${B1},\\s*${ADJ}${B1}\\s+e\\s+${ADJ}${B1}`, "gi") },
  // "não é X, é Y" / "não é X, mas Y" — padrão retórico que Fable/Opus adora.
  // Exige o segundo verbo pra não pegar negação comum ("não é caro.").
  { tipo: "nao-e-x-e-y", re: new RegExp(`${B0}não (?:é|são)\\s+(?:um|uma|o|a|os|as)\\s[^.!?\\n]{2,40},\\s*(?:é|são|mas)\\s+(?:um|uma|o|a|os|as)\\s`, "gi") },
];

export function varrerVicios(texto) {
  const out = [];
  for (const v of VICIOS) out.push(...achar(texto, v.re, v.tipo));
  return out.sort((a, b) => a.linha - b.linha || a.coluna - b.coluna);
}

// --- gate ----------------------------------------------------------------------
export function auditar(texto, { banidas = [] } = {}) {
  const duros = varrerDuros(texto);
  const encontradasBanidas = varrerBanidas(texto, banidas);
  const vicios = varrerVicios(texto);
  return {
    pass: duros.length === 0 && encontradasBanidas.length === 0,
    duros,
    banidas: encontradasBanidas,
    vicios,
    resumo: `${duros.length} duro(s) · ${encontradasBanidas.length} banida(s) · ${vicios.length} vício(s)`,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const arquivo = args.find((a) => !a.startsWith("--"));
  const i = args.indexOf("--banidas");
  const banidas = i !== -1 ? (args[i + 1] || "").split(",") : [];
  if (!arquivo) { console.error("ERRO: informe o arquivo de texto (ou '-' pra stdin)."); process.exit(1); }
  const texto = arquivo === "-" ? readFileSync(0, "utf8") : readFileSync(arquivo, "utf8");
  const r = auditar(texto, { banidas });
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.pass ? 0 : 1);
}
