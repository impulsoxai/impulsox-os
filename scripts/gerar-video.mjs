#!/usr/bin/env node
/**
 * gerar-video.mjs — monta um reel vertical legendado a partir de um roteiro.
 * ImpulsoX AI. Sem deps Node; usa ffmpeg (binário) e gerar-imagem.mjs + Fal vídeo.
 *
 * Uso:
 *   FAL_KEY=... node scripts/gerar-video.mjs roteiro.json --saida reel.mp4 \
 *     [--modelo kling|wan] [--ref marca.png] [--trilha musica.mp3] [--dry-run]
 *
 * --modelo kling (default): Kling 2.5 Turbo Pro (cinematográfico, ~$0,35/5s). wan: mais barato/fraco.
 * Vídeo de IA fica bom com SUJEITO REAL (produto, cena); gráfico abstrato deforma.
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
  // escape do caminho da fonte pro filtro do ffmpeg: no Windows, "\" quebra o filtro
  // e o ":" do drive precisa virar "\:". Trocar "\" por "/" é o jeito mais robusto.
  const fonteEsc = fonte.replace(/\\/g, "/").replace(/:/g, "\\:");
  // escala+pad cada clipe pra 9:16 e queima a legenda da cena
  const filtros = clipes.map((_, i) => {
    const txt = (legendas[i] || "").replace(/:/g, "\\:").replace(/'/g, "\\'");
    return `[${i}:v]scale=${largura}:${altura}:force_original_aspect_ratio=increase,` +
      `crop=${largura}:${altura},` +
      `drawtext=fontfile='${fonteEsc}':text='${txt}':fontcolor=${cor}:fontsize=54:` +
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
  const modeloVideo = flag("--modelo") || "kling";
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
  const MODELO_EP = modeloVideo === "kling" ? "fal-ai/kling-video/v2.5-turbo/pro/image-to-video" : "fal-ai/wan-i2v";

  async function falVideo(stillPath, segundos, prompt) {
    const imageUrl = `data:image/png;base64,${readFileSync(stillPath).toString("base64")}`;
    // Wan i2v: prompt (obrigatório) + num_frames (81-100) @ frames_per_second; NÃO tem "duration".
    // Kling: prompt + duration "5"|"10". aspect_ratio 9:16 pro vertical.
    const payload = modeloVideo === "kling"
      ? { prompt, image_url: imageUrl, duration: (Number(segundos) || 5) <= 5 ? "5" : "10", negative_prompt: "blur, distortion, warping, morphing, deformed, artifacts, jitter" }
      : { prompt, image_url: imageUrl, num_frames: Math.min(100, Math.max(81, Math.round((Number(segundos) || 5) * 16))), frames_per_second: 16, resolution: "720p", aspect_ratio: "9:16" };
    const sub = await fetch(`${BASE}/${MODELO_EP}`, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const subTxt = await sub.text();
    if (!sub.ok) falhar(`Fal vídeo HTTP ${sub.status}. ${subTxt.slice(0, 200)}`);
    let subJson; try { subJson = JSON.parse(subTxt); } catch { falhar(`Fal vídeo: submit devolveu corpo inválido. ${subTxt.slice(0, 200)}`); }
    // A Fal devolve as URLs certas de status/resultado — usar elas (robusto pra modelos
    // com path multi-segmento, ex. Kling). Fallback monta na mão (modelos de path simples).
    const statusUrl = subJson.status_url || `${BASE}/${MODELO_EP}/requests/${subJson.request_id}/status`;
    const responseUrl = subJson.response_url || `${BASE}/${MODELO_EP}/requests/${subJson.request_id}`;
    const auth = { headers: { Authorization: `Key ${FAL_KEY}` } };
    for (let t = 0; t < 120; t++) {
      await new Promise((r) => setTimeout(r, 3000));
      let sj; try { sj = JSON.parse(await (await fetch(statusUrl, auth)).text()); } catch { continue; }
      if (sj.status === "COMPLETED") break;
      if (sj.status === "FAILED" || sj.status === "ERROR") falhar(`geração de vídeo falhou na Fal (${sj.status}).`);
      if (t === 119) falhar("Fal: vídeo não ficou pronto em 6 minutos (timeout).");
    }
    const rj = await (await fetch(responseUrl, auth)).json();
    const vurl = rj?.video?.url || rj?.output?.video?.url || rj?.videos?.[0]?.url;
    if (!vurl) falhar("resposta da Fal sem vídeo. " + JSON.stringify(rj).slice(0, 200));
    const buf = Buffer.from(await (await fetch(vurl)).arrayBuffer());
    const out = join(work, `c${clipes.length}.mp4`);
    writeFileSync(out, buf);
    return out;
  }

  for (const [i, c] of cenas.entries()) {
    const segundos = Number(c.segundos) || 5;
    const still = join(work, `s${i}.png`);
    // still on-brand (schnell pra iterar barato); --ref opcional
    const imgArgs = ["--prompt", c.visual, "--saida", still, "--modelo", "minimax", "--largura", String(LARGURA), "--altura", String(ALTURA)];
    if (ref) imgArgs.push("--ref", ref);
    execFileSync("node", [GERAR_IMG, ...imgArgs], { stdio: "inherit", env: { ...process.env, FAL_KEY, FAL_BASE_URL: process.env.FAL_BASE_URL } });
    clipes.push(await falVideo(still, segundos, c.visual + ", slow subtle cinematic camera motion, smooth, photographic, no distortion"));
    legendas.push(c.texto);
  }

  const fonte = process.env.REEL_FONTE || "C:/Windows/Fonts/arialbd.ttf"; // a skill passa a fonte da marca
  const cor = process.env.REEL_COR || "#d4af37";
  execFileSync("ffmpeg", argsFfmpeg({ clipes, legendas, trilha, saida, largura: LARGURA, altura: ALTURA, fonte, cor }), { stdio: "inherit" });
  console.log(JSON.stringify({ ok: true, saida, cenas: cenas.length, duracao_total: duracaoTotal }, null, 2));
}
