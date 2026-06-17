#!/usr/bin/env node
/**
 * trends-best-effort.mjs — sinal de demanda do Google Trends (related queries). BEST-EFFORT:
 * se bloquear/quebrar, devolve [] com aviso — NUNCA derruba a coleta de temas. ImpulsoX AI.
 *
 * Uso: node scripts/trends-best-effort.mjs "claude code" "ai automation"
 */
import { parseTrends } from "./lib-tema-yt.mjs";

// URL pública do related queries do Trends (endpoint não-oficial; pode mudar/bloquear).
export function urlTrends(termo) {
  const q = encodeURIComponent(termo);
  return `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en-US&tz=180&req=%7B%22restriction%22:%7B%22geo%22:%7B%7D,%22time%22:%22today+3-m%22%7D,%22keywordType%22:%22ENTITY%22,%22term%22:%22${q}%22%7D`;
}

// Best-effort: tenta buscar; qualquer falha -> [] com aviso. Nunca lança.
export async function buscarTrends(termo, { fetchImpl = fetch } = {}) {
  try {
    const r = await fetchImpl(urlTrends(termo), { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) { console.error(`AVISO: Trends indisponível pra "${termo}" (HTTP ${r.status}).`); return []; }
    return parseTrends(await r.text());
  } catch (e) {
    console.error(`AVISO: Trends falhou pra "${termo}" — ${e.message}. Seguindo sem essa fonte.`);
    return [];
  }
}

if (import.meta.main) {
  const termos = process.argv.slice(2);
  if (!termos.length) { console.error("ERRO: informe ao menos um termo."); process.exit(1); }
  Promise.all(termos.map((t) => buscarTrends(t).then((r) => ({ termo: t, relacionados: r }))))
    .then((tudo) => console.log(JSON.stringify(tudo, null, 2)));
}
