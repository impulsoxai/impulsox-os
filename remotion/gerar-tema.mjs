#!/usr/bin/env node
// gerar-tema.mjs — lê marca/tokens.css e escreve remotion/src/tema.ts com as cores/fontes
// do cliente. Sem tokens.css → mantém os defaults (marca ImpulsoX). Funções puras testáveis.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// defaults (marca ImpulsoX) — usados quando o token não existe na marca do cliente
const DEFAULT_C = {
  fundo: "#06060d", roxo: "#7c3aed", roxoProf: "#4c1d95", roxoSuave: "#a78bfa",
  dourado: "#d4af37", douradoClaro: "#e2c97e", texto: "#f0ebe0",
  textoSuave: "#8a8070", textoMudo: "#4a4540",
};

// extrai { "--cor-x": "valor", ... } de uma string CSS
export function parsearTokens(css) {
  const out = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css))) out[m[1].trim()] = m[2].trim();
  return out;
}

// pega o nome da 1ª família de fonte ("'Space Grotesk', sans-serif" → "Space Grotesk")
export function primeiraFonte(decl, fallback) {
  if (!decl) return fallback;
  const primeiro = decl.split(",")[0].trim().replace(/['"]/g, "");
  return primeiro || fallback;
}

// traduz tokens da marca → objeto C do reel (cada campo cai no default se faltar)
export function mapearCores(tokens) {
  const g = (k, d) => tokens[k] || d;
  return {
    fundo: g("--cor-fundo", DEFAULT_C.fundo),
    roxo: g("--cor-primaria", DEFAULT_C.roxo),
    roxoProf: g("--cor-primaria-prof", DEFAULT_C.roxoProf),
    roxoSuave: g("--cor-primaria-suave", DEFAULT_C.roxoSuave),
    dourado: g("--cor-acento", DEFAULT_C.dourado),
    douradoClaro: g("--cor-acento-claro", DEFAULT_C.douradoClaro),
    texto: g("--cor-texto", DEFAULT_C.texto),
    textoSuave: g("--cor-texto-suave", DEFAULT_C.textoSuave),
    textoMudo: g("--cor-texto-mudo", DEFAULT_C.textoMudo),
  };
}

// monta o conteúdo do tema.ts
export function montarTema(c, fontes) {
  const cores = Object.entries(c).map(([k, v]) => `  ${k}: "${v}",`).join("\n");
  return `// tema.ts — GERADO por gerar-tema.mjs a partir de marca/tokens.css. Não editar à mão.
export const C = {
${cores}
};

export const FONTES = {
  display: "${fontes.display}",
  mono: "${fontes.mono}",
};
`;
}

// CLI: lê a marca (da raiz do projeto), escreve o tema.
if (import.meta.url === `file://${process.argv[1]}` || import.meta.main) {
  const raiz = process.cwd();
  const tokensPath = join(raiz, "marca", "tokens.css");
  let c = { ...DEFAULT_C };
  let fontes = { display: "Space Grotesk", mono: "Space Mono" };
  if (existsSync(tokensPath)) {
    const tokens = parsearTokens(readFileSync(tokensPath, "utf8"));
    c = mapearCores(tokens);
    fontes = {
      display: primeiraFonte(tokens["--fonte-display"], "Space Grotesk"),
      mono: primeiraFonte(tokens["--fonte-corpo"] || tokens["--fonte-mono"], "Space Mono"),
    };
    console.log("tema gerado da marca: " + tokensPath);
  } else {
    console.log("AVISO: marca/tokens.css não encontrado — usando defaults premium (ImpulsoX). (confirmar com a marca)");
  }
  const destino = join(dirname(fileURLToPath(import.meta.url)), "src", "tema.ts");
  writeFileSync(destino, montarTema(c, fontes));
  console.log("escrito: " + destino);
}
