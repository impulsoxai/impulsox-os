#!/usr/bin/env node
/**
 * gerar-imagem.mjs — gera imagem por IA via Fal.ai (FLUX). ImpulsoX AI. Sem deps.
 *
 * Uso:
 *   FAL_KEY=... node scripts/gerar-imagem.mjs --prompt "<inglês>" --saida out.png \
 *     [--modelo schnell|dev] [--ref caminho.png] [--largura 1080 --altura 1350] [--dry-run]
 *
 * A chave NUNCA aparece em log nem em erro. Prompt em inglês rende melhor.
 * Regra de segurança: nunca gerar rosto identificável (pessoa real só com foto autorizada).
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

const prompt = flag("--prompt");
const saida = flag("--saida");
const modelo = flag("--modelo") || "schnell";
const ref = flag("--ref");
const largura = Number(flag("--largura") || 1080);
const altura = Number(flag("--altura") || 1350);
const dryRun = has("--dry-run");

if (!prompt) falhar("informe o --prompt (em inglês rende melhor).");
if (!saida) falhar("informe o --saida (caminho do .png).");
const FAL_KEY = process.env.FAL_KEY;
if (!dryRun && !FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env). Sem chave, não dá pra gerar.");
if (ref && !existsSync(ref)) falhar(`imagem-referência não encontrada: ${ref}`);
if (!["schnell", "dev"].includes(modelo)) falhar(`--modelo inválido: ${modelo} (use schnell ou dev).`);
