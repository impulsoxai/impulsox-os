#!/usr/bin/env node
/**
 * gate-voz.mjs — o gate MECÂNICO de voz (camada Standards do Brain de voz; auditoria
 * externa de 10/07/2026). Evolução do lib-humanizador: além dos DUROS/VÍCIOS herdados,
 * checa as regras que vazavam por depender de disciplina do modelo — dois-pontos
 * retórico, pra/pro (hardcoded), CTA×formato, caixa-alta emocional, fecho-muleta.
 * Fonte única de regras: scripts/voz-regras.json. Regra nova regexável entra LÁ
 * (+ caso de teste aqui do lado), nunca só em prosa.
 *
 * Uso:
 *   node scripts/gate-voz.mjs <arquivo|-> [--formato ig-carrossel|linkedin|artigo|email|pagina]
 *                             [--publico] [--html] [--rotulos "Extra:,Outro:"]
 *   exit 0 = pass · exit 1 = falhou (JSON no stdout com linha/coluna de cada achado)
 *
 * O modelo cria, a máquina verifica. ZERO deps. ImpulsoX AI.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { varrerDuros, varrerVicios, varrerBanidas } from "./lib-humanizador.mjs";

const __dirname_gate = dirname(fileURLToPath(import.meta.url));
export const REGRAS = JSON.parse(readFileSync(join(__dirname_gate, "voz-regras.json"), "utf8"));

function posicao(texto, idx) {
  const antes = texto.slice(0, idx);
  const linhas = antes.split("\n");
  return { linha: linhas.length, coluna: linhas[linhas.length - 1].length + 1 };
}

// --- extração de texto de HTML de peça (carrossel) ------------------------------
export function extrairTextoHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<title[\s\S]*?<\/title>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|h1|h2|h3|div|section|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&rarr;/g, "→")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ");
}

// --- legenda.md: só a parte PUBLICADA (frontmatter e notas internas ficam fora) --
export function extrairLegendaPublicada(md) {
  let t = md;
  const fm = t.match(/^---\n[\s\S]*?\n---\n/);
  if (fm) t = t.slice(fm[0].length);
  const corte = t.search(/\n---\n/); // separador das notas internas/alt/produção
  if (corte !== -1) t = t.slice(0, corte);
  // bloco "NOTAS INTERNAS" sem separador ---
  const notas = t.search(/\nNOTAS INTERNAS/i);
  if (notas !== -1) t = t.slice(0, notas);
  return t.trim();
}

// --- dois-pontos: classificar cada ":" ------------------------------------------
export function classificarDoisPontos(texto, rotulosExtra = []) {
  const rotulos = [...REGRAS.dois_pontos.rotulos_permitidos, ...rotulosExtra];
  const out = [];
  const re = /:/g;
  let m;
  while ((m = re.exec(texto))) {
    const i = m.index;
    const depois = texto[i + 1] || "";
    if (depois === "/") continue; // http://
    if (/\d/.test(texto[i - 1] || "") && /\d/.test(depois)) continue; // 9:30
    const inicioLinha = texto.lastIndexOf("\n", i - 1) + 1;
    const prefixo = texto.slice(inicioLinha, i + 1).trim();
    // frontmatter/metadado: linha "campo: valor" com rótulo de 1 palavra
    if (/^[A-Za-zÀ-ú_-]{2,24}:$/.test(prefixo)) continue;
    // rótulo fixo de layout registrado
    if (rotulos.some((r) => prefixo.endsWith(r))) continue;
    // ":" no fim da linha abrindo lista/bloco numerado logo abaixo = enumeração VERTICAL (única isenção de enumeração)
    const fimDaLinha = texto.slice(i + 1).match(/^\s*\n/);
    if (fimDaLinha) {
      const proximas = texto.slice(i + 1).split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 2);
      if (proximas.some((l) => /^(?:[-*•→✓×]|\d+[.)])/.test(l))) continue;
    }
    // Enumeração NA MESMA FRASE ("arquivos: monta o relatório, organiza...") NÃO é mais isenta:
    // conta no budget. o dono achou vários ":" desse padrão numa peça real — as
    // amostras dela têm zero. Norma culta permite, a voz da casa reescreve (ponto ou frase direta).
    out.push({ tipo: "dois-pontos-retorico", trecho: texto.slice(Math.max(0, i - 30), i + 30).replace(/\n/g, " "), ...posicao(texto, i) });
  }
  return out;
}

// --- caixa-alta emocional ---------------------------------------------------------
export function varrerCaixaAlta(texto) {
  const siglas = new Set(REGRAS.caixa_alta.siglas_permitidas.map((s) => s.toUpperCase()));
  const out = [];
  for (const linhaTexto of texto.split("\n").map((l, n) => ({ l, n }))) {
    const letras = (linhaTexto.l.match(/[A-Za-zÀ-úà-ú]/g) || []).length;
    const maius = (linhaTexto.l.match(/[A-ZÀ-Ú]/g) || []).length;
    if (letras >= 3 && maius / letras >= 0.6) continue; // linha-label de design (toda caps — eyebrow, selo, fonte-nota; 3 letras cobre selo "DOR ▲", 11/07)
    const re = /(?<![\wà-úÀ-Ú])[A-ZÀ-Ú]{3,}(?![\wà-úÀ-Ú])/g; // 3+: "SEU" vazou com {4,} (11/07/2026)
    let m;
    while ((m = re.exec(linhaTexto.l))) {
      if (siglas.has(m[0])) continue;
      out.push({ tipo: "caixa-alta-emocional", trecho: m[0], linha: linhaTexto.n + 1, coluna: m.index + 1 });
    }
  }
  return out;
}

// --- buscas literais (fecho-muleta, CTA proibido, avisos lexicais) ---------------
function buscarLiterais(texto, frases, tipo) {
  const out = [];
  for (const f of frases) {
    const re = new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    let m;
    while ((m = re.exec(texto))) out.push({ tipo: `${tipo}:${f}`, trecho: m[0], ...posicao(texto, m.index) });
  }
  return out;
}

// --- gate ------------------------------------------------------------------------
export function gate(textoBruto, { formato = null, publico = false, html = false, legenda = false, rotulosExtra = [] } = {}) {
  const texto = html ? extrairTextoHtml(textoBruto) : legenda ? extrairLegendaPublicada(textoBruto) : textoBruto;

  const duros = varrerDuros(texto);
  const banidas = [
    ...varrerBanidas(texto, REGRAS.banidas_sempre.palavras),
    ...varrerBanidas(texto, REGRAS.banidas_gerais.palavras),
    ...(publico ? varrerBanidas(texto, REGRAS.banidas_publico.palavras) : []),
  ];
  const doisPontos = classificarDoisPontos(texto, rotulosExtra);
  const estouroDoisPontos = doisPontos.length > REGRAS.dois_pontos.budget_retorico ? doisPontos : [];
  const caixaAlta = varrerCaixaAlta(texto);
  // pontuação: regras movidas pro voz-regras.json (fonte única, 13/07/2026); fallback true
  // preserva o comportamento em clone cujo JSON ainda não tem o bloco (template antigo)
  const exclamacao = (REGRAS.pontuacao?.exclamacao_dupla_proibida ?? true)
    ? buscarLiterais(texto, ["!!"], "exclamacao-dupla") : [];
  const pontoVirgula = [];
  if (REGRAS.pontuacao?.ponto_e_virgula_em_prosa_proibido ?? true) {
    const re = /[a-zà-ú]; ?[a-zà-ú]/gi; let m;
    while ((m = re.exec(texto))) pontoVirgula.push({ tipo: "ponto-e-virgula-em-prosa", trecho: texto.slice(Math.max(0, m.index - 20), m.index + 20).replace(/\n/g, " "), ...posicao(texto, m.index + 1) });
  }
  // fragmento "Sem + substantivo." como frase solta: budget da dona (voz-regras.json, 11/07)
  const fragmentosSem = [];
  { const re = /(?<=^|[.!?…]\s|\n)Sem [^.!?\n]{2,35}\.(?=\s|$)/gm; let m; while ((m = re.exec(texto))) fragmentosSem.push({ tipo: "fragmento-sem", trecho: m[0], ...posicao(texto, m.index) }); }
  const estouroSem = fragmentosSem.length > REGRAS.fragmento_sem.budget ? fragmentosSem : [];
  // maiúscula mística: substantivo comum capitalizado no MEIO da frase ("esse Sistema")
  const misticas = [];
  for (const p of REGRAS.maiuscula_mistica.palavras) {
    const re = new RegExp(`(?<=[a-zà-ú] )${p}\\b`, "g"); let m;
    while ((m = re.exec(texto))) {
      const aFrente = texto.slice(m.index, m.index + 40);
      if ((REGRAS.maiuscula_mistica.excecoes || []).some((e) => aFrente.startsWith(e))) continue; // nome próprio da casa
      misticas.push({ tipo: `maiuscula-mistica:${p}`, trecho: texto.slice(Math.max(0, m.index - 20), m.index + p.length), ...posicao(texto, m.index) });
    }
  }
  const fechoMuleta = buscarLiterais(texto, REGRAS.fecho_muleta.frases, "fecho-muleta");
  const ctaProibido = formato && REGRAS.cta_por_formato[formato]
    ? buscarLiterais(texto, REGRAS.cta_por_formato[formato].proibidos, "cta-impossivel-no-formato")
    : [];
  const avisos = buscarLiterais(texto, REGRAS.preferencias_lexicais.avisos.map((a) => a.de), "preferida-outra-forma");
  const vicios = varrerVicios(texto);

  const falhas = [...duros, ...banidas, ...estouroDoisPontos, ...caixaAlta, ...exclamacao, ...pontoVirgula, ...estouroSem, ...misticas, ...fechoMuleta, ...ctaProibido];
  return {
    pass: falhas.length === 0,
    falhas: falhas.sort((a, b) => a.linha - b.linha || a.coluna - b.coluna),
    doisPontosRetoricos: doisPontos.length,
    budgetDoisPontos: REGRAS.dois_pontos.budget_retorico,
    avisos,
    vicios,
    resumo: `${falhas.length} falha(s) · ${doisPontos.length}/${REGRAS.dois_pontos.budget_retorico} dois-pontos retóricos · ${avisos.length} aviso(s) lexical(is) · ${vicios.length} vício(s) informativos`,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const arquivo = args.find((a) => !a.startsWith("--"));
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  if (!arquivo) { console.error("ERRO: informe o arquivo (ou '-' pra stdin)."); process.exit(1); }
  const bruto = arquivo === "-" ? readFileSync(0, "utf8") : readFileSync(arquivo, "utf8");
  const r = gate(bruto, {
    formato: flag("--formato") || null,
    publico: args.includes("--publico"),
    html: args.includes("--html") || /\.html?$/i.test(arquivo),
    legenda: args.includes("--legenda") || /legenda\.md$/i.test(arquivo),
    rotulosExtra: (flag("--rotulos") || "").split(",").map((s) => s.trim()).filter(Boolean),
  });
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.pass ? 0 : 1);
}
