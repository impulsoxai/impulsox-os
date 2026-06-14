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

// monta os argumentos do ffmpeg: concatena clipes, escala 9:16, queima legenda por
// cena, mixa trilha. Função pura (testável sem rodar ffmpeg).
export function argsFfmpeg({ clipes, legendas, trilha, saida, largura, altura, fonte, cor }) {
  const inputs = clipes.flatMap((c) => ["-i", c]);
  if (trilha) inputs.push("-i", trilha);
  // escala+pad cada clipe pra 9:16 e queima a legenda da cena
  const filtros = clipes.map((_, i) => {
    const txt = (legendas[i] || "").replace(/:/g, "\\:").replace(/'/g, "\\'");
    return `[${i}:v]scale=${largura}:${altura}:force_original_aspect_ratio=increase,` +
      `crop=${largura}:${altura},` +
      `drawtext=fontfile='${fonte}':text='${txt}':fontcolor=${cor}:fontsize=54:` +
      `box=1:boxcolor=black@0.45:boxborderw=18:x=(w-text_w)/2:y=h-h/4[v${i}]`;
  });
  const concatIns = clipes.map((_, i) => `[v${i}]`).join("");
  const filtro = `${filtros.join(";")};${concatIns}concat=n=${clipes.length}:v=1:a=0[vout]`;
  const map = ["-map", "[vout]"];
  if (trilha) map.push("-map", `${clipes.length}:a`, "-shortest");
  return [
    "-y", ...inputs, "-filter_complex", filtro, ...map,
    "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", saida,
  ];
}

// só roda a CLI quando invocado direto (não quando importado por um teste).
if (import.meta.main) {
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
}
