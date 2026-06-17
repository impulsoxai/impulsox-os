#!/usr/bin/env node
/**
 * metricas-youtube.mjs — puxa métricas por vídeo (YouTube Analytics API ou manual do Studio)
 * e dá o veredito da fórmula pela retenção. SÓ LEITURA. ImpulsoX AI. Reusa OAuth da Fase 3
 * (+ escopo yt-analytics.readonly). YT_REFRESH_TOKEN/secret NUNCA em log ou erro.
 *
 * Uso: node scripts/metricas-youtube.mjs --video <id> [--periodo 28] [--manual "<texto>"]
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { benchmarkRetencao, avaliarFormula, montarQueryAnalytics, diasDesdePublicacao, parseMetricasManual } from "./lib-youtube-analytics.mjs";

// Junta métricas + benchmark + veredito — função pura, testável.
export function montarResultado({ videoId, ehShort, duracaoSeg, metricas, mediaCanal = null, reprovacoesAnteriores = 0 }) {
  const benchmark = benchmarkRetencao({ ehShort, duracaoSeg });
  const veredito = avaliarFormula({ averageViewPercentage: metricas.averageViewPercentage, benchmark, mediaCanal, reprovacoesAnteriores });
  return { videoId, ehShort, duracaoSeg, benchmark, veredito, metricas };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

// Resolve o videoId e a data de publicação a partir de producao/publicacoes.md pelo slug.
function acharPublicacao(slug) {
  const p = join("producao", "publicacoes.md");
  if (!existsSync(p)) return null;
  const linha = readFileSync(p, "utf8").split("\n").find((l) => l.includes(`YouTube ${slug}:`));
  if (!linha) return null;
  const id = (linha.match(/youtu\.be\/([\w-]{11})/) || [])[1];
  const data = (linha.match(/\[([^\]]+)\]/) || [])[1];
  return id ? { videoId: id, data } : null;
}

// Troca refresh_token por access_token (OAuth2). Token nunca volta em erro legível.
async function obterAccessToken({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!r.ok) throw new Error(`OAuth falhou (HTTP ${r.status}) — reautorize com o escopo yt-analytics.readonly.`);
  const j = await r.json();
  if (!j.access_token) throw new Error("OAuth não devolveu access_token — reautorize pelo guia.");
  return j.access_token;
}

// reports.query da Analytics API. Devolve as métricas como objeto nomeado.
async function buscarMetricas({ accessToken, query }) {
  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`Analytics API falhou (HTTP ${r.status}).`);
  const j = await r.json();
  const cols = (j.columnHeaders || []).map((c) => c.name);
  const linha = (j.rows || [])[0];
  if (!linha) return null;
  const m = {};
  cols.forEach((c, i) => { m[c] = linha[i]; });
  return {
    views: m.views ?? null,
    averageViewPercentage: m.averageViewPercentage ?? null,
    averageViewDuration: m.averageViewDuration ?? null,
    subscribersGained: m.subscribersGained ?? null,
  };
}

function janelaDatas(periodoDias) {
  const fim = new Date();
  const inicio = new Date(fim.getTime() - periodoDias * 86400000);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { dataInicio: iso(inicio), dataFim: iso(fim) };
}

if (import.meta.main) {
  try { process.loadEnvFile(); } catch { /* sem .env: modo manual */ }
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

  const slug = flag("--slug");
  let videoId = flag("--video");
  let dataPub = null;
  if (!videoId && slug) {
    const pub = acharPublicacao(slug);
    if (!pub) falhar(`não achei "${slug}" em producao/publicacoes.md — confira o nome ou publique antes.`);
    videoId = pub.videoId; dataPub = pub.data;
  }
  if (!videoId) falhar("informe --video <id> ou --slug <nome> (registrado em publicacoes.md).");

  if (dataPub && diasDesdePublicacao(dataPub) < 7) {
    console.error("AVISO: vídeo com menos de 7 dias — a retenção ainda está instável; o ideal é medir por volta de 14 dias.");
  }

  // ehShort/duração: o dono informa (ou assume long se não vier). A API não devolve isso aqui.
  const ehShort = args.includes("--short");
  const duracaoSeg = Number(flag("--duracao")) || 600;

  const manual = flag("--manual");
  const clientId = process.env.YT_CLIENT_ID, clientSecret = process.env.YT_CLIENT_SECRET, refreshToken = process.env.YT_REFRESH_TOKEN;

  (async () => {
    let metricas;
    if (manual || !(clientId && clientSecret && refreshToken)) {
      if (!manual) falhar("sem credencial OAuth — cole os números do Studio com --manual \"<texto>\".");
      metricas = parseMetricasManual(manual);
    } else {
      try {
        const accessToken = await obterAccessToken({ clientId, clientSecret, refreshToken });
        const periodo = Number(flag("--periodo")) || 28;
        const query = montarQueryAnalytics({ videoId, ...janelaDatas(periodo) });
        metricas = await buscarMetricas({ accessToken, query });
        if (!metricas) falhar("a Analytics API não devolveu dados (vídeo muito novo/privado?) — tente --manual.");
      } catch (e) { falhar(e.message); }
    }
    const r = montarResultado({ videoId, ehShort, duracaoSeg, metricas });
    console.log(JSON.stringify(r, null, 2));
  })();
}
