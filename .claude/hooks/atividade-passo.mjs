#!/usr/bin/env node
/**
 * atividade-passo.mjs — hook PostToolUse: emite um MARCO legível pro feed "Ao vivo"
 * do painel quando o OS faz algo visível (escreve peça, gera mídia, publica, salva).
 * ImpulsoX AI.
 *
 * Gated: só age em workspace ImpulsoX (tem nucleo/). Nunca falha, nunca bloqueia (exit 0).
 * Curadoria: só marcos legíveis — ações de produção/publicação/mídia/commit. Resto é ignorado.
 * Segurança: nunca loga comando cru nem segredo — só uma frase de marco + o nome do arquivo.
 */
import { existsSync } from "node:fs";
import { join, basename } from "node:path";
import { registrarPasso } from "../../scripts/registrar-passo.mjs";

let entrada = "";
process.stdin.on("data", (d) => (entrada += d));
process.stdin.on("end", () => {
  try {
    const ev = JSON.parse(entrada || "{}");
    const cwd = ev.cwd || process.cwd();
    if (!existsSync(join(cwd, "nucleo"))) return; // só em clone ImpulsoX
    const m = marco(ev);
    if (m) registrarPasso({ skill: m.skill, etapa: m.etapa, status: m.status || "ok" }, cwd);
  } catch { /* nunca falha */ }
  process.exit(0);
});

// mapeia uma ação do OS -> marco legível (ou null pra ignorar)
function marco(ev) {
  const tool = ev.tool_name || "";
  const inp = ev.tool_input || {};
  const fp = (inp.file_path || "").replace(/\\/g, "/");
  if (/Write|Edit/.test(tool) && /\/producao\//.test(fp)) {
    const nome = basename(fp);
    if (fp.endsWith(".png")) return { skill: "produção", etapa: "imagem renderizada: " + nome };
    if (nome === "legenda.md") return { skill: "produção", etapa: "legenda salva" };
    return { skill: "produção", etapa: "peça atualizada: " + nome };
  }
  // Geração (imagem/vídeo/avatar/publicar) NÃO é sniffada do comando bash — isso dava
  // falso positivo (node --test, node --check, cp do arquivo). Os próprios scripts
  // emitem o marco via registrar-passo só quando rodam de verdade.
  if (tool === "Bash" && /\bgit\s+commit\b/.test(inp.command || "")) {
    return { skill: "git", etapa: "salvo no histórico" };
  }
  return null;
}
