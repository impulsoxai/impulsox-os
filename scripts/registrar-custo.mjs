#!/usr/bin/env node
/**
 * registrar-custo.mjs — anexa uma linha em dados/custos.jsonl a cada cobrança de IA.
 * ImpulsoX AI. Alimenta o bloco "Custos de IA" do painel. NUNCA lança — registrar custo
 * não pode derrubar uma geração que já foi paga. custo inválido (NaN) é ignorado.
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export function registrarCusto({ script, modelo, custo }, raiz = process.cwd()) {
  try {
    const c = Number(custo);
    if (!Number.isFinite(c)) return;
    const dir = join(raiz, "dados");
    mkdirSync(dir, { recursive: true });
    const linha = JSON.stringify({
      data: new Date().toISOString().slice(0, 10),
      script, modelo, custo: c,
    });
    appendFileSync(join(dir, "custos.jsonl"), linha + "\n");
  } catch { /* silencioso por design */ }
}
