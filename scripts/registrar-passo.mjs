#!/usr/bin/env node
/**
 * registrar-passo.mjs — emite um MARCO legível pro feed "Ao vivo" do painel.
 * ImpulsoX AI. Cada passo vira uma linha em dados/atividade.jsonl que o painel transmite.
 *
 * Uso (script): import { registrarPasso } from "./registrar-passo.mjs"
 *   registrarPasso({ skill: "/post", etapa: "roteiro pronto", status: "ok" })
 *
 * Uso (CLI, pra hooks/skills): node scripts/registrar-passo.mjs "/post" "roteiro pronto" ok
 *
 * NUNCA loga comando cru nem segredo — só skill + etapa legível + status. NUNCA lança
 * (registrar passo não pode derrubar o trabalho). dados/ é gitignored (fica local).
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const STATUS_OK = new Set(["inicio", "ok", "erro", "aviso"]);

export function registrarPasso({ skill, etapa, status = "ok" }, raiz = process.cwd()) {
  try {
    if (!etapa) return;
    const st = STATUS_OK.has(status) ? status : "ok";
    const dir = join(raiz, "dados");
    mkdirSync(dir, { recursive: true });
    const linha = JSON.stringify({
      ts: new Date().toISOString(),
      skill: skill || "sistema",
      etapa: String(etapa).slice(0, 160),
      status: st,
    });
    appendFileSync(join(dir, "atividade.jsonl"), linha + "\n");
  } catch { /* silencioso por design */ }
}

// CLI: registrar-passo.mjs <skill> <etapa> [status]
if (import.meta.main) {
  const [skill, etapa, status] = process.argv.slice(2);
  registrarPasso({ skill, etapa, status });
}
