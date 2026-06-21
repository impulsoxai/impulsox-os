#!/usr/bin/env node
/**
 * zoom-regioes.mjs — lê o telemetria.json de uma gravação e escreve regioes-zoom.json
 * (o que o /editar-video usa pra aplicar o zoom automático). ImpulsoX AI. Clean-room.
 *
 * Uso: node scripts/zoom-regioes.mjs --slug <nome>
 *      [--gap-ms 2500] [--pad-inicio 0.5] [--pad-fim 0.8]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { montarRegioesZoom, aplicarLimitesAuto } from "./lib-zoom.mjs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const slug = flag("--slug");
  if (!slug) falhar("informe --slug <nome>.");

  const base = join("canal-youtube", "gravacoes", slug);
  const telPath = join(base, "telemetria.json");
  if (!existsSync(telPath)) falhar(`telemetria não encontrada: ${telPath} (gravou com /gravar-tela?)`);

  const telemetria = JSON.parse(readFileSync(telPath, "utf8"));
  const opts = {};
  if (flag("--gap-ms") !== undefined) opts.gapMs = Number(flag("--gap-ms"));
  if (flag("--pad-inicio") !== undefined) opts.padInicioS = Number(flag("--pad-inicio"));
  if (flag("--pad-fim") !== undefined) opts.padFimS = Number(flag("--pad-fim"));

  const regioes = montarRegioesZoom(telemetria, opts);
  // anti-tontura: tira zoom curto/colado e usa nível suave 1.4 (close discreto).
  const limitadas = aplicarLimitesAuto(regioes.regioes, {}).map((r) => ({ ...r, nivel: 1.4 }));
  const saidaObj = { regioes: limitadas };
  const saida = join(base, "regioes-zoom.json");
  writeFileSync(saida, JSON.stringify(saidaObj, null, 2));
  console.log(JSON.stringify({ ok: true, slug, regioes: limitadas.length, saida }, null, 2));
}
