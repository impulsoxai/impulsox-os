#!/usr/bin/env node
/**
 * resolver-canal-yt.mjs — descobre o Channel ID público a partir de um @handle do
 * YouTube, pra preencher canal-youtube/criadores-monitorados.md. ImpulsoX AI.
 * Uso: node scripts/resolver-canal-yt.mjs @Chase-H-AI
 */
import { resolverChannelId } from "./lib-youtube.mjs";

if (import.meta.main) {
  const handle = process.argv[2];
  if (!handle) { console.error("ERRO: informe o @handle do canal."); process.exit(1); }
  resolverChannelId(handle)
    .then((id) => console.log(id))
    .catch((e) => { console.error("ERRO: " + e.message); process.exit(1); });
}
