#!/usr/bin/env node
/**
 * detectar-ia.mjs — TERMÔMETRO de "cara-de-IA" (não juiz). Índice 0-100 relativo,
 * calculável em Node puro, sem baixar modelo. Aponta os trechos que vão pesar num
 * detector, pra afiar ANTES de publicar. Exit 0 SEMPRE (termômetro, não gate).
 * NÃO reproduz o score do GPTZero — a fórmula deles é fechada. ZERO deps. ImpulsoX AI.
 *
 * 4 sinais: burstiness (40%) · repetição de n-grama (25%) · densidade de tells (20%) · abertura uniforme (15%).
 * O índice só significa algo comparado ao CHÃO dos exemplares Fable.
 *
 * Uso: node scripts/detectar-ia.mjs <arquivo.md>
 */
import { readFileSync } from "node:fs";
import { varrerVicios, LIMITES } from "./lib-humanizador.mjs";

// tira frontmatter YAML e blocos de código antes de medir prosa
export function limparTexto(texto) {
  return texto
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "");
}

function frases(texto) {
  return texto
    .split(/[.!?]+/)
    .map((f) => f.trim())
    .filter((f) => f.split(/\s+/).filter(Boolean).length >= 1);
}

// ALTO = uniforme = cara-de-IA. 100 - coef. variação escalado.
export function burstiness(texto) {
  const fs = frases(limparTexto(texto));
  if (fs.length < 2) return 50;
  const tam = fs.map((f) => f.split(/\s+/).filter(Boolean).length);
  const media = tam.reduce((a, b) => a + b, 0) / tam.length;
  if (media === 0) return 50;
  const varia = tam.reduce((a, b) => a + (b - media) ** 2, 0) / tam.length;
  const cv = Math.sqrt(varia) / media; // coef. de variação
  // humano ~0.5-0.9; IA ~0.2-0.4. cv 0.6+ = 0 (humano); cv 0.2 = ~73.
  const indice = Math.max(0, Math.min(100, 100 - cv * 165));
  return Math.round(indice);
}

// normaliza pra palavras minúsculas sem pontuação
function palavras(texto) {
  return limparTexto(texto)
    .toLowerCase()
    .replace(/[^\wà-ú\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function ngramas(ps, n) {
  const out = [];
  for (let i = 0; i + n <= ps.length; i++) out.push(ps.slice(i, i + n).join(" "));
  return out;
}

// ALTO = muitos n-gramas repetidos. Média da taxa de repetição de bi e trigrama.
export function repeticaoNgrama(texto) {
  const ps = palavras(texto);
  if (ps.length < 6) return 30;
  const taxa = (n) => {
    const g = ngramas(ps, n);
    if (g.length === 0) return 0;
    const unicos = new Set(g).size;
    return 1 - unicos / g.length; // proporção de repetidos
  };
  const media = (taxa(2) + taxa(3)) / 2;
  return Math.round(Math.max(0, Math.min(100, media * 220)));
}

// tells "de excesso": 1-2 num texto é prosa, só o excedente conta
const TELLS_DE_EXCESSO = { "nao-e-x-e-y": 2 };

// ALTO = muitos tells por palavra. Usa a tabela regexável do lib-humanizador.
export function densidadeTells(texto) {
  const limpo = limparTexto(texto);
  const nPalavras = palavras(limpo).length || 1;
  const vicios = varrerVicios(limpo);
  // conta por tipo pra aplicar a franquia dos tells de excesso
  const porTipo = {};
  for (const v of vicios) porTipo[v.tipo] = (porTipo[v.tipo] || 0) + 1;
  let nTells = 0;
  for (const [tipo, n] of Object.entries(porTipo)) {
    const franquia = TELLS_DE_EXCESSO[tipo] || 0;
    nTells += Math.max(0, n - franquia);
  }
  // ~1 tell a cada 25 palavras já é denso; escala pra 100.
  const porCem = (nTells / nPalavras) * 100;
  return Math.round(Math.max(0, Math.min(100, porCem * 25)));
}

const CONECTORES = ["além disso","adicionalmente","por outro lado","no entanto","entretanto","portanto","dessa forma","desse modo","assim","por fim","finalmente","primeiramente","em primeiro lugar","por sua vez","ademais"];

// parágrafos = blocos separados por linha em branco (mín. 4 palavras pra ignorar título/CTA)
function paragrafos(texto) {
  return limparTexto(texto).split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.split(/\s+/).length >= 4);
}

// ALTO = muitos parágrafos abrindo igual (conector, ou mesma 1ª palavra) = cara-de-IA.
export function aberturaUniforme(texto) {
  const ps = paragrafos(texto);
  if (ps.length < 3) return 20;
  const comConector = ps.filter((p) => CONECTORES.some((c) => p.toLowerCase().startsWith(c))).length;
  const pctConector = (comConector / ps.length) * 100;
  const primeiras = {};
  for (const p of ps) {
    const w = p.split(/\s+/)[0].toLowerCase().replace(/[^\wà-ú]/g, "");
    if (w.length >= 2) primeiras[w] = (primeiras[w] || 0) + 1;
  }
  const maxRepetida = Math.max(0, ...Object.values(primeiras));
  const penalRepeticao = maxRepetida >= 3 ? 40 : 0;
  const penalConector = Math.min(60, Math.max(0, pctConector - LIMITES.max_pct_paragrafos_com_conector) * 2);
  return Math.round(Math.min(100, penalConector + penalRepeticao));
}

const PESOS = { burstiness: 0.40, ngrama: 0.25, tells: 0.20, abertura: 0.15 };

export function indice(texto) {
  const sinais = {
    burstiness: burstiness(texto),
    ngrama: repeticaoNgrama(texto),
    tells: densidadeTells(texto),
    abertura: aberturaUniforme(texto),
  };
  const total = Math.round(
    sinais.burstiness * PESOS.burstiness +
    sinais.ngrama * PESOS.ngrama +
    sinais.tells * PESOS.tells +
    sinais.abertura * PESOS.abertura
  );
  return { total, sinais };
}

// lista os trechos que mais pesam, por linha, pra afiar
export function trechosCulpados(texto) {
  const limpo = limparTexto(texto);
  return varrerVicios(limpo).map((v) => ({
    linha: v.linha,
    motivo: `${v.tipo}: "${v.trecho}"`,
  }));
}

if (import.meta.main) {
  const arquivo = process.argv[2];
  if (!arquivo) { console.error("Uso: node scripts/detectar-ia.mjs <arquivo.md>"); process.exit(1); }
  const texto = readFileSync(arquivo, "utf8");
  const r = indice(texto);
  const barra = (n) => "#".repeat(Math.round(n / 5)).padEnd(20, ".");
  const alerta = (n) => (n >= 60 ? "  <-- pesa" : "");
  console.log(`\nINDICE CARA-DE-IA: ${r.total}/100  (chao dos exemplares Fable: ~9)\n`);
  console.log(`  Burstiness .......... ${String(r.sinais.burstiness).padStart(3)}  ${barra(r.sinais.burstiness)}${alerta(r.sinais.burstiness)}`);
  console.log(`  Repeticao n-grama ... ${String(r.sinais.ngrama).padStart(3)}  ${barra(r.sinais.ngrama)}${alerta(r.sinais.ngrama)}`);
  console.log(`  Densidade de tells .. ${String(r.sinais.tells).padStart(3)}  ${barra(r.sinais.tells)}${alerta(r.sinais.tells)}`);
  console.log(`  Abertura uniforme ... ${String(r.sinais.abertura).padStart(3)}  ${barra(r.sinais.abertura)}${alerta(r.sinais.abertura)}`);
  const tr = trechosCulpados(texto);
  if (tr.length) {
    console.log(`\nTRECHOS QUE MAIS PESAM (afiar aqui):`);
    for (const x of tr.slice(0, 15)) console.log(`  L${String(x.linha).padStart(3)}  ${x.motivo}`);
  }
  console.log("");
  process.exit(0); // termometro: nunca trava
}
