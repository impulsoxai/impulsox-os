#!/usr/bin/env node
/**
 * gerar-shorts.mjs — corta um vídeo longo (final.mp4) em vários shorts verticais (9:16,
 * ≤30s) com legenda karaokê. Trechos vêm de [CORTE-SHORT] do roteiro ou de --cortes
 * (propostos pela IA, aprovados pelo dono). Dry-run por padrão; --confirmar gera. ImpulsoX AI.
 *
 * Uso: node scripts/gerar-shorts.mjs --slug demo [--reenquadre crop|split] \
 *        [--cortes "4:12-4:48,10:00-10:25"] [--confirmar]
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { registrarPasso } from "./registrar-passo.mjs";
import { montarASS, filtroLegendaAss, lerGlossario, corrigirTermos } from "./lib-edicao.mjs";
import { parseTempo, acharCortesPorMarcador, limitar30s, recortarPalavras, filtroReenquadreCrop, filtroReenquadreSplit } from "./lib-shorts.mjs";

const FFMPEG = process.env.FFMPEG_BIN || "ffmpeg";

// Resumo do dry-run — função pura, testável. Aplica limitar30s a cada corte.
export function montarPlanoShorts({ slug, cortes, reenquadre }) {
  const base = `canal-youtube/edicao/${slug}/shorts`;
  const shorts = cortes.map((c, i) => {
    const { inicio, fim } = limitar30s(c);
    return { n: i + 1, inicio, fim, duracao: +(fim - inicio).toFixed(2), razao: c.razao || "", saida: `${base}/short-${i + 1}.mp4` };
  });
  return { dry_run: true, slug, reenquadre, shorts };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

// Lê os cortes: do --cortes "ini-fim,..." OU dos marcadores do roteiro do slug.
function lerCortes({ cortesFlag, roteiroTexto }) {
  if (cortesFlag) {
    return cortesFlag.split(",").map((par) => {
      const [a, b] = par.split("-");
      return { inicio: parseTempo(a.trim()), fim: parseTempo(b.trim()), razao: "" };
    });
  }
  return acharCortesPorMarcador(roteiroTexto || "");
}

// Acha o roteiro do slug (longa/<slug>.md) pra extrair marcadores, se existir.
function lerRoteiro(slug) {
  const p = join("canal-youtube", "roteiros", "longa", `${slug}.md`);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

// Gera UM short: corta o trecho, reenquadra, queima a legenda karaokê do trecho.
function gerarUmShort({ base, final, palavras, corte, n, reenquadre }) {
  const { inicio, fim } = limitar30s(corte);
  const dur = fim - inicio;
  const clipe = join(base, `_clip-${n}.mp4`);
  const assPath = join(base, `_short-${n}.ass`);
  const saida = join(base, `short-${n}.mp4`);

  // 1) corta o trecho do longo
  execFileSync(FFMPEG, ["-y", "-ss", String(inicio), "-t", String(dur), "-i", final, "-c", "copy", clipe], { stdio: "inherit" });

  // 2) legenda do trecho (palavras recortadas + rebaseadas)
  const palavrasTrecho = recortarPalavras(palavras, inicio, fim);
  let temLeg = false;
  if (palavrasTrecho.length) { writeFileSync(assPath, montarASS(palavrasTrecho)); temLeg = true; }

  // 3) reenquadra 9:16 (+ queima legenda se houver). Crop usa -vf; split usa -filter_complex.
  if (reenquadre === "split") {
    const fc = filtroReenquadreSplit({}) + (temLeg ? `,${filtroLegendaAss({ assCaminho: assPath })}` : "");
    execFileSync(FFMPEG, ["-y", "-i", clipe, "-filter_complex", fc, "-c:a", "copy", saida], { stdio: "inherit" });
  } else {
    const vf = filtroReenquadreCrop({}) + (temLeg ? `,${filtroLegendaAss({ assCaminho: assPath })}` : "");
    execFileSync(FFMPEG, ["-y", "-i", clipe, "-vf", vf, "-c:a", "copy", saida], { stdio: "inherit" });
  }
  return saida;
}

if (import.meta.main) {
  try { process.loadEnvFile(); } catch { /* sem .env: usa defaults */ }
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const slug = flag("--slug");
  if (!slug) falhar("informe --slug <nome do vídeo longo>.");
  const base = join("canal-youtube", "edicao", slug);
  const final = flag("--video") || join(base, "final.mp4");
  const reenquadre = flag("--reenquadre") === "split" ? "split" : "crop";
  if (!existsSync(final)) falhar(`vídeo longo não encontrado: ${final} — rode /editar-video antes.`);

  const cortes = lerCortes({ cortesFlag: flag("--cortes"), roteiroTexto: lerRoteiro(slug) });
  if (cortes.length === 0) falhar("nenhum [CORTE-SHORT] no roteiro e nenhum --cortes informado. Modo análise: a IA precisa propor os trechos da transcrição (palavras.json) antes.");

  if (!has("--confirmar")) {
    console.log(JSON.stringify(montarPlanoShorts({ slug, cortes, reenquadre }), null, 2));
    process.exit(0);
  }

  // palavras pra legenda (Fase 2). Sem o arquivo, segue sem legenda nos shorts (aviso).
  const palavrasPath = join(base, "palavras.json");
  let palavras = [];
  if (existsSync(palavrasPath)) {
    palavras = JSON.parse(readFileSync(palavrasPath, "utf8"));
    const glossPath = join("canal-youtube", "glossario.md");
    if (existsSync(glossPath)) palavras = corrigirTermos(palavras, lerGlossario(readFileSync(glossPath, "utf8")));
  } else {
    console.error("AVISO: palavras.json ausente — shorts sairão sem legenda. Re-rode /editar-video pra gerar.");
  }

  mkdirSync(join(base, "shorts"), { recursive: true });
  const gerados = [];
  cortes.forEach((corte, i) => {
    try {
      registrarPasso({ skill: "/shorts", etapa: `gerando short ${i + 1}`, status: "inicio" });
      const saida = gerarUmShort({ base: join(base, "shorts"), final, palavras, corte, n: i + 1, reenquadre });
      gerados.push(saida);
    } catch (e) { console.error(`AVISO: short ${i + 1} falhou — ${e.message}`); }
  });
  registrarPasso({ skill: "/shorts", etapa: `${gerados.length} shorts prontos`, status: "ok" });
  console.log(JSON.stringify({ ok: true, slug, reenquadre, shorts: gerados }, null, 2));
}
