#!/usr/bin/env node
/**
 * metricas-instagram.mjs — fecha o loop de medição do IG SEM CSV manual: lê o registro
 * canônico de producao/publicacoes.md (slug -> media_id), puxa os insights da Graph API
 * com o MESMO token que publica (META_TOKEN_PAGINA) e devolve taxas + diagnóstico da
 * régua da casa (lib-desempenho). SÓ LEITURA. Espelho do metricas-youtube.mjs. ImpulsoX AI.
 *
 * Uso:
 *   node scripts/metricas-instagram.mjs --slug <slug> [--seguidores N]
 *   node scripts/metricas-instagram.mjs --media <media_id> [--formato reel|carrossel|post]
 *   node scripts/metricas-instagram.mjs --todas [--dias 7]   # todas as peças da janela
 * Token nunca aparece em log ou erro.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseRegistroIG, parseInsights, montarResultadoIG } from "./lib-instagram-insights.mjs";

const METRICAS = "reach,saved,shares,views,likes,comments";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

function lerRegistros() {
  const p = join("producao", "publicacoes.md");
  if (!existsSync(p)) falhar("producao/publicacoes.md não existe — publique pelo /publicar antes.");
  return parseRegistroIG(readFileSync(p, "utf8"));
}

async function buscarInsights({ mediaId, token, graphBase }) {
  const url = `${graphBase}/${mediaId}/insights?metric=${METRICAS}&access_token=${encodeURIComponent(token)}`;
  const r = await fetch(url);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const detalhe = j?.error?.message ? String(j.error.message).replace(/access_token=[^&\s]+/g, "***") : `HTTP ${r.status}`;
    throw new Error(`insights falharam pra ${mediaId}: ${detalhe}`);
  }
  return parseInsights(j);
}

function diasDesde(dataIso) {
  const d = new Date(dataIso);
  return Number.isNaN(d.getTime()) ? null : Math.round((Date.now() - d.getTime()) / 86400000);
}

if (import.meta.main) {
  try { process.loadEnvFile(); } catch { /* sem .env */ }
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

  const token = process.env.META_TOKEN_PAGINA;
  if (!token) falhar("defina META_TOKEN_PAGINA no .env (o mesmo token que publica lê insights — exige instagram_manage_insights no app).");
  const graphBase = process.env.GRAPH_BASE_URL || "https://graph.facebook.com/v21.0";
  const seguidores = Number(flag("--seguidores")) || 0;

  let alvos = [];
  if (flag("--media")) {
    alvos = [{ slug: flag("--slug") || "(avulso)", id: flag("--media"), formato: flag("--formato") || null, data: null }];
  } else {
    const regs = lerRegistros();
    if (regs.length === 0) falhar("nenhum registro canônico 'IG <slug>: id=...' em publicacoes.md — publicações antigas (só permalink) não têm media_id; publique com a versão nova do /publicar.");
    if (flag("--slug")) {
      const r = regs.find((x) => x.slug === flag("--slug"));
      if (!r) falhar(`slug "${flag("--slug")}" não achado no registro canônico. Slugs: ${regs.map((x) => x.slug).join(", ")}`);
      alvos = [r];
    } else if (args.includes("--todas")) {
      const dias = Number(flag("--dias")) || 0;
      alvos = dias > 0 ? regs.filter((r) => { const d = diasDesde(r.data); return d != null && d <= dias; }) : regs;
      if (alvos.length === 0) falhar(`nenhuma peça na janela de ${flag("--dias")} dias.`);
    } else falhar("informe --slug <slug>, --media <id> ou --todas [--dias N].");
  }

  (async () => {
    const resultados = [];
    for (const a of alvos) {
      try {
        const metricas = await buscarInsights({ mediaId: a.id, token, graphBase });
        resultados.push(montarResultadoIG({
          slug: a.slug, mediaId: a.id, formato: a.formato || null, metricas,
          seguidores, janelaDias: a.data ? diasDesde(a.data) : null,
        }));
      } catch (e) { resultados.push({ slug: a.slug, mediaId: a.id, erro: e.message }); }
    }
    console.log(JSON.stringify({ ok: resultados.every((r) => !r.erro), total: resultados.length, resultados }, null, 2));
  })();
}
