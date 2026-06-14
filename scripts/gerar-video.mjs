#!/usr/bin/env node
/**
 * gerar-video.mjs — monta um reel vertical legendado a partir de um roteiro.
 * ImpulsoX AI. Sem deps Node; usa ffmpeg (binário) e gerar-imagem.mjs + Fal vídeo.
 *
 * Uso:
 *   FAL_KEY=... node scripts/gerar-video.mjs roteiro.json --saida reel.mp4 \
 *     [--modelo wan|kling] [--ref marca.png] [--trilha musica.mp3] [--dry-run]
 *
 * Pipeline: still on-brand por cena -> anima (Fal) -> costura (ffmpeg) -> legenda
 *   -> trilha -> 1080x1920. NADA gera antes do roteiro aprovado; final passa por /revisar.
 */
import { readFileSync, existsSync } from "node:fs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
const posic = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--saida" && args[i - 1] !== "--modelo" && args[i - 1] !== "--ref" && args[i - 1] !== "--trilha");

const roteiroPath = posic[0];
if (!roteiroPath) falhar("informe o roteiro (.json com {slug, cenas:[{texto,visual,segundos}]}).");
if (!existsSync(roteiroPath)) falhar(`roteiro não encontrado: ${roteiroPath}`);
const modeloVideo = flag("--modelo") || "wan";
const dryRun = has("--dry-run");
const LARGURA = 1080, ALTURA = 1920;

let roteiro;
try { roteiro = JSON.parse(readFileSync(roteiroPath, "utf8")); }
catch { falhar("roteiro não é um JSON válido."); }
const cenas = roteiro?.cenas;
if (!Array.isArray(cenas) || cenas.length === 0) falhar("roteiro sem cenas (precisa de pelo menos uma).");
for (const [i, c] of cenas.entries()) {
  if (!c.texto) falhar(`cena ${i + 1} sem "texto" (a legenda).`);
  if (!c.visual) falhar(`cena ${i + 1} sem "visual" (o prompt da still).`);
}
const duracaoTotal = cenas.reduce((s, c) => s + (Number(c.segundos) || 5), 0);

if (dryRun) {
  console.log(JSON.stringify({
    dry_run: true, slug: roteiro.slug, largura: LARGURA, altura: ALTURA,
    modelo_video: modeloVideo, duracao_total: duracaoTotal,
    cenas: cenas.map((c) => ({ texto: c.texto, segundos: Number(c.segundos) || 5 })),
  }, null, 2));
  process.exit(0);
}
