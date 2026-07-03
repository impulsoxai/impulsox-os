// lib-instagram-insights.mjs — funções puras do fechamento do loop IG: parse do registro
// canônico de producao/publicacoes.md, parse da resposta de insights da Graph API e o
// resultado com taxas + diagnóstico (via lib-desempenho). ZERO deps, sem rede. ImpulsoX AI.
import { taxasInstagram, diagnosticarInstagram } from "./lib-desempenho.mjs";

// Linha canônica (escrita pelo publicar-instagram.mjs):
// "IG <slug>: id=..; data=..; formato=..; objetivo=..; mecanica=..; formula=..; capa=..; nota-revisar=..; origem=..; link=.."
export function parseRegistroIG(texto) {
  const out = [];
  for (const linha of String(texto).split(/\r?\n/)) {
    const m = /^IG\s+(\S+):\s*(.+)$/.exec(linha.trim());
    if (!m) continue;
    const reg = { slug: m[1] };
    for (const par of m[2].split(";")) {
      const kv = /^\s*([\w-]+)=(.*)$/.exec(par.trim());
      if (kv) reg[kv[1]] = kv[2].trim();
    }
    if (reg.id) out.push(reg);
  }
  return out;
}

// Resposta de GET /{media_id}/insights?metric=... -> objeto nomeado {reach, saved, ...}.
export function parseInsights(json) {
  const m = {};
  for (const item of json?.data ?? []) {
    const v = item?.values?.[0]?.value ?? item?.total_value?.value ?? null;
    if (item?.name != null && v != null) m[item.name] = v;
  }
  return {
    reach: m.reach ?? null,
    saved: m.saved ?? null,
    shares: m.shares ?? null,
    views: m.views ?? m.plays ?? null,
    likes: m.likes ?? null,
    comments: m.comments ?? null,
  };
}

// Junta métricas + taxas + diagnóstico. `janelaDias` = idade da peça no momento da medição
// (o /desempenho compara peças na MESMA janela — reach acumula com o tempo).
export function montarResultadoIG({ slug, mediaId, formato = null, metricas, seguidores = 0, janelaDias = null }) {
  const taxas = taxasInstagram({
    reach: metricas.reach ?? 0, saved: metricas.saved ?? 0,
    shares: metricas.shares ?? 0, seguidores, formato,
  });
  return {
    slug, mediaId, formato, janelaDias, metricas, taxas,
    diagnostico: diagnosticarInstagram(taxas),
  };
}
