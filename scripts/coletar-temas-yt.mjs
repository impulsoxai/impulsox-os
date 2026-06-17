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
import { extrairTema, agruparTemasRepetidos, pontuarTema, dedup } from "./lib-tema-yt.mjs";

const YTDLP = process.env.YTDLP_BIN || "yt-dlp";

// Pipeline puro: itens brutos {titulo, criador, dias, views, pilar} -> temas ranqueados.
export function rankearTemas(itensBrutos, pilares = []) {
  const itens = itensBrutos.map((it) => {
    const tema = extrairTema(it.titulo);
    const pilar = it.pilar ?? (pilares.length ? (classificarRelevancia(it.titulo, pilares).pilar) : null);
    return { tema, criador: it.criador, dias: it.dias, pilar, views: it.views || 0 };
  }).filter((it) => it.tema);
  const agrupados = agruparTemasRepetidos(itens);
  const pontuados = agrupados.map((g) => ({
    ...g,
    score: pontuarTema({ nCriadores: g.nCriadores, diasDesde: g.diasMin, alinhaPilar: !!g.pilar, views: g.viewsMax }),
  }));
  return dedup(pontuados).sort((a, b) => b.score - a.score);
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

// Vídeos recentes de um canal (id|titulo|views). Best-effort: erro -> [].
function videosDoCanal(channelId, limite = 8) {
  try {
    const out = execFileSync(YTDLP, ["--flat-playlist", "--no-warnings", "-I", `1:${limite}`,
      "--print", "%(id)s|%(title)s|%(view_count)s", `https://www.youtube.com/channel/${channelId}/videos`],
      { encoding: "utf8" });
    return out.trim().split("\n").filter(Boolean).map((l) => {
      const [id, titulo, views] = l.split("|");
      return { id, titulo, views: Number(views) || 0 };
    });
  } catch { console.error(`AVISO: não consegui os vídeos do canal ${channelId}.`); return []; }
}

// Busca no YouTube por termo: N vídeos de qualquer canal (ytsearch — relevância do YouTube).
function buscarPorTermo(termo, limite = 8) {
  try {
    const out = execFileSync(YTDLP, ["--flat-playlist", "--no-warnings",
      "--print", "%(id)s|%(title)s|%(view_count)s", `ytsearch${limite}:${termo}`], { encoding: "utf8" });
    return out.trim().split("\n").filter(Boolean).map((l) => {
      const [id, titulo, views] = l.split("|");
      return { id, titulo, views: Number(views) || 0 };
    });
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
  // fonte (a): criadores monitorados
  for (const c of criadores) {
    for (const v of videosDoCanal(c.channelId)) {
      itens.push({ titulo: v.titulo, criador: c.nome, dias: 7, views: v.views, pilar: null });
    }
  }
  // fonte (b): busca por palavra-chave do nicho
  const termosFlag = flag("--termos");
  const termos = termosFlag ? termosFlag.split(",").map((t) => t.trim())
    : pilares.flatMap((p) => p.palavrasChave).slice(0, 4);
  if (termos.length === 0) termos.push("claude code", "ai automation");
  for (const termo of termos) {
    for (const v of buscarPorTermo(termo)) {
      itens.push({ titulo: v.titulo, criador: `busca:${termo}`, dias: 7, views: v.views, pilar: null });
    }
  }

  if (itens.length === 0) falhar("não coletei nenhum vídeo (YouTube bloqueou ou sem criadores/termos). Tente de novo ou rode a skill, que soma a WebSearch.");

  const ranqueados = rankearTemas(itens, pilares);
  const mes = new Date().toISOString().slice(0, 7);
  const dir = join("canal-youtube", "temas");
  mkdirSync(dir, { recursive: true });
  const md = ["# Temas coletados — " + mes, "", ...ranqueados.slice(0, 20).map((t, i) =>
    `${i + 1}. **${t.tema}** — score ${t.score.toFixed(1)} · ${t.nCriadores} criador(es) · pilar: ${t.pilar || "—"} · views máx: ${t.viewsMax}`)].join("\n");
  writeFileSync(join(dir, `${mes}.md`), md + "\n");
  console.log(JSON.stringify({ ok: true, total: ranqueados.length, top: ranqueados.slice(0, 10) }, null, 2));
}
