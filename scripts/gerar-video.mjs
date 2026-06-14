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
import { readFileSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

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

  // --- orquestração real (still -> anima via Fal -> costura via ffmpeg) -------
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env).");
  const BASE = process.env.FAL_BASE_URL || "https://queue.fal.run";
  const saida = flag("--saida") || join(dirname(roteiroPath), `${roteiro.slug || "reel"}.mp4`);
  const ref = flag("--ref");
  const trilha = flag("--trilha");
  const GERAR_IMG = fileURLToPath(new URL("./gerar-imagem.mjs", import.meta.url));

  // ffmpeg presente?
  try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); }
  catch { falhar("ffmpeg não encontrado. Instale (ex.: choco install ffmpeg / brew install ffmpeg)."); }

  const work = mkdtempSync(join(tmpdir(), "reel-"));
  const clipes = [], legendas = [];
  // VERIFICAR no painel da Fal os nomes de modelo de vídeo antes de subir.
  const MODELO_EP = modeloVideo === "kling" ? "fal-ai/kling-video/v2/standard/image-to-video" : "fal-ai/wan-i2v";

  async function falVideo(stillPath, segundos) {
    const b64 = readFileSync(stillPath).toString("base64");
    const sub = await fetch(`${BASE}/${MODELO_EP}`, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: `data:image/png;base64,${b64}`, duration: String(segundos) }),
    });
    if (!sub.ok) falhar(`Fal vídeo HTTP ${sub.status}.`);
    const { request_id } = await sub.json();
    // polling do queue até completar
    for (let t = 0; t < 120; t++) {
      await new Promise((r) => setTimeout(r, 3000));
      const st = await fetch(`${BASE}/${MODELO_EP}/requests/${request_id}/status`, { headers: { Authorization: `Key ${FAL_KEY}` } });
      const sj = await st.json();
      if (sj.status === "COMPLETED") break;
      if (sj.status === "FAILED") falhar("geração de vídeo falhou na Fal.");
    }
    const res = await fetch(`${BASE}/${MODELO_EP}/requests/${request_id}`, { headers: { Authorization: `Key ${FAL_KEY}` } });
    const rj = await res.json();
    const vurl = rj?.video?.url || rj?.output?.video?.url;
    if (!vurl) falhar("resposta da Fal sem vídeo.");
    const buf = Buffer.from(await (await fetch(vurl)).arrayBuffer());
    const out = join(work, `c${clipes.length}.mp4`);
    writeFileSync(out, buf);
    return out;
  }

  for (const [i, c] of cenas.entries()) {
    const segundos = Number(c.segundos) || 5;
    const still = join(work, `s${i}.png`);
    // still on-brand (schnell pra iterar barato); --ref opcional
    const imgArgs = ["--prompt", c.visual, "--saida", still, "--modelo", "schnell", "--largura", String(LARGURA), "--altura", String(ALTURA)];
    if (ref) imgArgs.push("--ref", ref);
    execFileSync("node", [GERAR_IMG, ...imgArgs], { stdio: "inherit", env: process.env });
    clipes.push(await falVideo(still, segundos));
    legendas.push(c.texto);
  }

  const fonte = process.env.REEL_FONTE || "C:/Windows/Fonts/arialbd.ttf"; // a skill passa a fonte da marca
  const cor = process.env.REEL_COR || "#d4af37";
  execFileSync("ffmpeg", argsFfmpeg({ clipes, legendas, trilha, saida, largura: LARGURA, altura: ALTURA, fonte, cor }), { stdio: "inherit" });
  console.log(JSON.stringify({ ok: true, saida, cenas: cenas.length, duracao_total: duracaoTotal }, null, 2));
}
