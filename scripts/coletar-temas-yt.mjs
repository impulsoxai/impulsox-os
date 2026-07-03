#!/usr/bin/env node
/**
 * coletar-temas-yt.mjs — coleta temas dos criadores monitorados + busca no YouTube por
 * palavra-chave (yt-dlp), pontua e ranqueia. SÓ LEITURA. ImpulsoX AI. yt-dlp já instalado.
 *
 * Uso: node scripts/coletar-temas-yt.mjs [--termos "claude code,ai automation"]
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { lerCriadores, lerPilares, classificarRelevancia } from "./lib-youtube.mjs";
import { extrairTema, agruparTemasRepetidos, pontuarTema, dedup, diasDesdeUploadDate, medianaViews } from "./lib-tema-yt.mjs";

const YTDLP = process.env.YTDLP_BIN || "yt-dlp";

// Pipeline puro: itens brutos {titulo, criador, dias, views, outlier, pilar} -> ranqueados.
// dias = dias REAIS desde o upload (null quando o yt-dlp não devolve a data — recência não
// pontua); outlier = views ÷ mediana do conjunto de origem (demanda de tema).
export function rankearTemas(itensBrutos, pilares = []) {
  const itens = itensBrutos.map((it) => {
    const tema = extrairTema(it.titulo);
    const pilar = it.pilar ?? (pilares.length ? (classificarRelevancia(it.titulo, pilares).pilar) : null);
    return { tema, criador: it.criador, dias: it.dias ?? null, pilar, views: it.views || 0, outlier: it.outlier ?? null };
  }).filter((it) => it.tema);
  const agrupados = agruparTemasRepetidos(itens);
  const pontuados = agrupados.map((g) => ({
    ...g,
    score: pontuarTema({ nCriadores: g.nCriadores, diasDesde: g.diasMin, alinhaPilar: !!g.pilar, views: g.viewsMax, outlier: g.outlierMax }),
  }));
  return dedup(pontuados).sort((a, b) => b.score - a.score);
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

// Parse de uma linha "id|titulo|views|upload_date" do yt-dlp.
function parseLinha(l) {
  const [id, titulo, views, uploadDate] = l.split("|");
  return { id, titulo, views: Number(views) || 0, dias: diasDesdeUploadDate(uploadDate) };
}

// Anexa outlier = views ÷ mediana DO CONJUNTO (canal ou resultado de busca).
function comOutlier(videos) {
  const med = medianaViews(videos.map((v) => v.views));
  return videos.map((v) => ({ ...v, outlier: med > 0 && v.views > 0 ? +(v.views / med).toFixed(2) : null }));
}

// Vídeos recentes de um canal (id|titulo|views|data). Best-effort: erro -> [].
function videosDoCanal(channelId, limite = 8) {
  try {
    const out = execFileSync(YTDLP, ["--flat-playlist", "--no-warnings", "-I", `1:${limite}`,
      "--print", "%(id)s|%(title)s|%(view_count)s|%(upload_date)s", `https://www.youtube.com/channel/${channelId}/videos`],
      { encoding: "utf8" });
    return comOutlier(out.trim().split("\n").filter(Boolean).map(parseLinha));
  } catch { console.error(`AVISO: não consegui os vídeos do canal ${channelId}.`); return []; }
}

// Busca no YouTube por termo: N vídeos de qualquer canal (ytsearch — relevância do YouTube).
// Outlier aqui usa a mediana DO RESULTADO da busca como baseline (proxy — canais mistos).
function buscarPorTermo(termo, limite = 8) {
  try {
    const out = execFileSync(YTDLP, ["--flat-playlist", "--no-warnings",
      "--print", "%(id)s|%(title)s|%(view_count)s|%(upload_date)s", `ytsearch${limite}:${termo}`], { encoding: "utf8" });
    return comOutlier(out.trim().split("\n").filter(Boolean).map(parseLinha));
  } catch { console.error(`AVISO: busca no YouTube falhou pra "${termo}".`); return []; }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

  const criadoresPath = join("canal-youtube", "criadores-monitorados.md");
  const pilaresPath = join("canal-youtube", "pilares.md");
  const criadores = existsSync(criadoresPath) ? lerCriadores(readFileSync(criadoresPath, "utf8")) : [];
  const pilares = existsSync(pilaresPath) ? lerPilares(readFileSync(pilaresPath, "utf8")) : [];

  const itens = [];
  // fonte (a): criadores monitorados — dias reais do upload + outlier vs mediana do canal
  for (const c of criadores) {
    for (const v of videosDoCanal(c.channelId)) {
      itens.push({ titulo: v.titulo, criador: c.nome, dias: v.dias, views: v.views, outlier: v.outlier, pilar: null });
    }
  }
  // fonte (b): busca por palavra-chave do nicho (termos vêm de pilares.md/--termos — o
  // fallback abaixo é EXEMPLO do canal próprio, não serve pra clone de cliente)
  const termosFlag = flag("--termos");
  const termos = termosFlag ? termosFlag.split(",").map((t) => t.trim())
    : pilares.flatMap((p) => p.palavrasChave).slice(0, 4);
  if (termos.length === 0) falhar("nenhum termo de busca: preencha canal-youtube/pilares.md (palavras-chave do NICHO deste negócio) ou passe --termos \"termo1,termo2\".");
  for (const termo of termos) {
    for (const v of buscarPorTermo(termo)) {
      itens.push({ titulo: v.titulo, criador: `busca:${termo}`, dias: v.dias, views: v.views, outlier: v.outlier, pilar: null });
    }
  }

  if (itens.length === 0) falhar("não coletei nenhum vídeo (YouTube bloqueou ou sem criadores/termos). Tente de novo ou rode a skill, que soma a WebSearch.");

  const ranqueados = rankearTemas(itens, pilares);
  const mes = new Date().toISOString().slice(0, 7);
  const dir = join("canal-youtube", "temas");
  mkdirSync(dir, { recursive: true });
  const md = ["# Temas coletados — " + mes, "", ...ranqueados.slice(0, 20).map((t, i) =>
    `${i + 1}. **${t.tema}** — score ${t.score.toFixed(1)} · ${t.nCriadores} criador(es) · pilar: ${t.pilar || "—"} · views máx: ${t.viewsMax} · outlier: ${t.outlierMax != null ? t.outlierMax + "x" : "—"} · idade: ${t.diasMin != null ? t.diasMin + "d" : "?"}`)].join("\n");
  writeFileSync(join(dir, `${mes}.md`), md + "\n");
  console.log(JSON.stringify({ ok: true, total: ranqueados.length, top: ranqueados.slice(0, 10) }, null, 2));
}
