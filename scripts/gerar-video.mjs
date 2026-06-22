#!/usr/bin/env node
/**
 * gerar-video.mjs — monta um reel vertical legendado a partir de um roteiro.
 * ImpulsoX AI. Sem deps Node; usa ffmpeg (binário) e gerar-imagem.mjs + Fal vídeo.
 *
 * Uso:
 *   FAL_KEY=... node scripts/gerar-video.mjs roteiro.json --saida reel.mp4 \
 *     [--modelo kling|seedance|ltx|wan] [--ref marca.png] [--trilha musica.mp3] [--dry-run]
 *
 * --modelo: kling (default, cinematográfico) · seedance (movimento controlado, camera_fixed,
 *   2-12s nativo — bom pra corte rápido) · ltx (rascunho baratíssimo) · wan (budget).
 *   Troca por flag, zero lock-in. Todos respondem em video.url.
 * Roteiro: cada cena tem "texto" (legenda) + "visual" (prompt da still) OU "imagem"
 *   (caminho de uma foto PRONTA, pra animar ela direto, sem gerar). Vídeo de IA fica bom
 *   com SUJEITO REAL; gráfico abstrato deforma.
 *
 * Pipeline: still on-brand por cena -> anima (Fal) -> costura (ffmpeg) -> legenda
 *   -> trilha -> 1080x1920. NADA gera antes do roteiro aprovado; final passa por /revisar.
 */
import { readFileSync, existsSync, writeFileSync, mkdtempSync, mkdirSync, renameSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { registrarCusto } from "./registrar-custo.mjs";
import { registrarPasso } from "./registrar-passo.mjs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

// monta os argumentos do ffmpeg: concatena clipes, escala 9:16, queima legenda por
// cena, mixa trilha. Função pura (testável sem rodar ffmpeg).
export function argsFfmpeg({ clipes, legendas, duracoes = [], trilha, saida, largura, altura, fonte, cor }) {
  const inputs = clipes.flatMap((c) => ["-i", c]);
  if (trilha) inputs.push("-i", trilha);
  // escape do caminho da fonte pro filtro do ffmpeg: no Windows, "\" quebra o filtro
  // e o ":" do drive precisa virar "\:". Trocar "\" por "/" é o jeito mais robusto.
  const fonteEsc = fonte.replace(/\\/g, "/").replace(/:/g, "\\:");
  // escala+pad cada clipe pra 9:16 e queima a legenda da cena
  const filtros = clipes.map((_, i) => {
    const txt = (legendas[i] || "").replace(/:/g, "\\:").replace(/'/g, "\\'");
    // corte rápido: trima o clipe pra duração da cena (ex. 2-3s) antes de montar
    const dur = Number(duracoes[i]) || 0;
    const trim = dur > 0 ? `trim=duration=${dur},setpts=PTS-STARTPTS,` : "";
    return `[${i}:v]${trim}scale=${largura}:${altura}:force_original_aspect_ratio=increase,` +
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

// custo estimado de UM clipe, por modelo, derivado dos preços publicados da Fal (jun/2026):
// kling 2.5 turbo pro $0.35/5s +$0.07/s · seedance v1 pro ~$0.148/s @1080p · ltx flat
// $0.04/clipe · wan-i2v 720p $0.40 (×1.25 acima de 81 frames). Função pura (testável).
export function custoClipe(modelo, seg) {
  const s = Number(seg) || 5;
  if (modelo === "seedance") return Math.min(12, Math.max(2, s)) * 0.148;
  if (modelo === "ltx") return 0.04;
  if (modelo === "wan") {
    const frames = Math.min(100, Math.max(81, Math.round(s * 16)));
    return frames > 81 ? 0.40 * 1.25 : 0.40;
  }
  // kling (default): payload usa duration "5" (≤5s) ou "10" (>5s)
  return s <= 5 ? 0.35 : 0.70;
}

// duracaoAudio — lê a duração (s) da saída de `ffprobe -show_entries format=duration`.
// Função pura: recebe a STRING de saída, não roda ffprobe. Devolve 0 se não achar.
export function duracaoAudio(saidaFfprobe) {
  const m = String(saidaFfprobe).match(/duration=([\d.]+)/);
  return m ? Number(m[1]) : 0;
}

// casarDuracoes — sobrescreve cada cena.segundos com a duração da fala (+folga), pra o clipe
// B-roll nunca cortar a voz. Duração 0 (sem áudio) mantém o segundos existente. Pura.
export function casarDuracoes(cenas, duracoesAudio, { folga = 0.4 } = {}) {
  return cenas.map((c, i) => {
    const d = Number(duracoesAudio[i]) || 0;
    return d > 0 ? { ...c, segundos: Math.round((d + folga) * 100) / 100 } : { ...c };
  });
}

// mixVozTrilha — monta os args do ffmpeg pra juntar o vídeo (mudo) com a VOZ no volume cheio e,
// se houver, a TRILHA abaixada (duckDb dB) por baixo. Pura (só monta args, não roda ffmpeg).
export function mixVozTrilha({ video, voz, trilha, saida, duckDb = 18 }) {
  const inputs = ["-i", video, "-i", voz];
  if (trilha) inputs.push("-i", trilha);
  const args = ["-y", ...inputs];
  if (trilha) {
    args.push(
      "-filter_complex",
      `[2:a]volume=-${duckDb}dB[m];[1:a][m]amix=inputs=2:duration=first:dropout_transition=0[aout]`,
      "-map", "0:v", "-map", "[aout]",
    );
  } else {
    args.push("-map", "0:v", "-map", "1:a");
  }
  args.push("-c:v", "copy", "-c:a", "aac", "-shortest", saida);
  return args;
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
  if (!["kling", "wan", "seedance", "ltx"].includes(modeloVideo)) falhar(`--modelo inválido: ${modeloVideo} (use kling, seedance, ltx ou wan).`);
  for (const [i, c] of cenas.entries()) {
    if (!c.texto) falhar(`cena ${i + 1} sem "texto" (a legenda).`);
    if (!c.visual && !c.imagem) falhar(`cena ${i + 1} precisa de "visual" (prompt da still) OU "imagem" (caminho de uma foto pronta).`);
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

  // --- VOZ (opcional): cada clipe dura o tempo da fala que o narra -------------
  const vozDir = flag("--voz");   // pasta com cena-01.mp3, cena-02.mp3... (voz real)
  const ttsVoz = flag("--tts");   // voiceId do ElevenLabs (voz por IA)
  const temVoz = Boolean(vozDir || ttsVoz);
  let falasAudio = []; // caminho do mp3 de cada cena, na ordem
  if (temVoz) {
    const baseFalas = join("canal-youtube", "broll", roteiro.slug || "reel", "falas");
    mkdirSync(baseFalas, { recursive: true });
    if (ttsVoz) {
      const { gerarTTS, estimarCustoTTS } = await import("./gerar-tts.mjs");
      const textos = cenas.map((c) => c.narracao || "");
      const custo = estimarCustoTTS(textos);
      console.log(`TTS: ${textos.length} falas, custo estimado $${custo.toFixed(2)}.`);
      if (!has("--confirmar")) { console.log("rode com --confirmar pra gerar o TTS (gasta crédito)."); process.exit(0); }
      for (let i = 0; i < cenas.length; i++) {
        const saidaFala = join(baseFalas, `cena-${String(i + 1).padStart(2, "0")}.mp3`);
        await gerarTTS({ texto: cenas[i].narracao || "", voz: ttsVoz, saida: saidaFala });
        falasAudio.push(saidaFala);
      }
    } else {
      for (let i = 0; i < cenas.length; i++) {
        const arq = join(vozDir, `cena-${String(i + 1).padStart(2, "0")}.mp3`);
        if (!existsSync(arq)) falhar(`falta o áudio da cena ${i + 1}: ${arq}`);
        falasAudio.push(arq);
      }
    }
    // mede cada fala e casa a duração nas cenas (a fala manda)
    const dur = falasAudio.map((a) => {
      const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1", a], { encoding: "utf8" });
      return duracaoAudio(r.stdout || "");
    });
    const casadas = casarDuracoes(cenas, dur);
    for (let i = 0; i < cenas.length; i++) cenas[i].segundos = casadas[i].segundos;
    console.log("durações casadas com a voz: " + cenas.map((c) => c.segundos + "s").join(", "));
  }
  const GERAR_IMG = fileURLToPath(new URL("./gerar-imagem.mjs", import.meta.url));

  // ffmpeg presente?
  try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); }
  catch { falhar("ffmpeg não encontrado. Instale (ex.: choco install ffmpeg / brew install ffmpeg)."); }

  const work = mkdtempSync(join(tmpdir(), "reel-"));
  const clipes = [], legendas = [], duracoes = [];
  let custoVideo = 0; // soma do custo dos clipes (stills são contadas pelo gerar-imagem)
  registrarPasso({ skill: "/post", etapa: `gerando reel · ${cenas.length} cena(s) · ${modeloVideo}`, status: "inicio" });
  // VERIFICAR no painel da Fal os nomes de modelo de vídeo antes de subir.
  const EP_VIDEO = {
    kling: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
    wan: "fal-ai/wan-i2v",
    seedance: "fal-ai/bytedance/seedance/v1/pro/image-to-video",
    ltx: "fal-ai/ltx-video-13b-distilled/image-to-video",
  };
  const MODELO_EP = EP_VIDEO[modeloVideo] || EP_VIDEO.kling;

  async function falVideo(stillPath, segundos, prompt) {
    const imageUrl = `data:image/png;base64,${readFileSync(stillPath).toString("base64")}`;
    // payload por modelo (cada um tem campos diferentes; todos respondem em video.url):
    // wan: num_frames @ fps (sem "duration"). kling: duration "5"|"10". seedance: duration
    // 2-12s nativo + camera_fixed (movimento limpo). ltx: só resolution. 9:16 = vertical.
    const seg = Number(segundos) || 5;
    const payload =
      modeloVideo === "wan" ? { prompt, image_url: imageUrl, num_frames: Math.min(100, Math.max(81, Math.round(seg * 16))), frames_per_second: 16, resolution: "720p", aspect_ratio: "9:16" }
      : modeloVideo === "seedance" ? { prompt, image_url: imageUrl, duration: String(Math.min(12, Math.max(2, seg))), resolution: "1080p", aspect_ratio: "9:16", camera_fixed: true }
      : modeloVideo === "ltx" ? { prompt, image_url: imageUrl, resolution: "720p", aspect_ratio: "9:16" }
      : { prompt, image_url: imageUrl, duration: seg <= 5 ? "5" : "10", negative_prompt: "blur, distortion, warping, morphing, deformed, artifacts, jitter" };
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
    let still;
    if (c.imagem) {
      // anima uma imagem PRONTA (pula a geração)
      if (!existsSync(c.imagem)) falhar(`cena ${i + 1}: imagem não encontrada: ${c.imagem}`);
      still = c.imagem;
    } else {
      // gera a still on-brand (minimax, foto realista); --ref opcional
      still = join(work, `s${i}.png`);
      const imgArgs = ["--prompt", c.visual, "--saida", still, "--modelo", "minimax", "--largura", String(LARGURA), "--altura", String(ALTURA)];
      if (ref) imgArgs.push("--ref", ref);
      execFileSync("node", [GERAR_IMG, ...imgArgs], { stdio: "inherit", env: { ...process.env, FAL_KEY, FAL_BASE_URL: process.env.FAL_BASE_URL } });
    }
    const motion = (c.visual || "the scene") + ", slow subtle cinematic camera motion, smooth, photographic, no distortion";
    clipes.push(await falVideo(still, segundos, motion));
    custoVideo += custoClipe(modeloVideo, segundos);
    legendas.push(c.texto);
    duracoes.push(segundos);
  }

  const fonte = process.env.REEL_FONTE || "C:/Windows/Fonts/arialbd.ttf"; // a skill passa a fonte da marca
  const cor = process.env.REEL_COR || "#d4af37";
  execFileSync("ffmpeg", argsFfmpeg({ clipes, legendas, duracoes, trilha, saida, largura: LARGURA, altura: ALTURA, fonte, cor }), { stdio: "inherit" });
  if (temVoz) {
    const baseOut = join("canal-youtube", "broll", roteiro.slug || "reel");
    mkdirSync(baseOut, { recursive: true });
    // 1) junta as falas numa trilha de voz contínua
    const vozUnica = join(baseOut, "_voz.mp3");
    const listaVoz = join(baseOut, "_voz.txt");
    writeFileSync(listaVoz, falasAudio.map((a) => `file '${a.replace(/\\/g, "/")}'`).join("\n"));
    execFileSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listaVoz, "-c", "copy", vozUnica], { stdio: "inherit" });
    // 2) mixa voz (+trilha opcional abaixada) sobre o vídeo mudo
    const comVoz = join(baseOut, "_comvoz.mp4");
    execFileSync("ffmpeg", mixVozTrilha({ video: saida, voz: vozUnica, trilha, saida: comVoz }), { stdio: "inherit" });
    // 3) karaokê: transcreve a voz e queima a legenda palavra-a-palavra (reusa o motor existente)
    try {
      const { transcrever } = await import("./transcrever-local.mjs");
      const { montarASS, filtroLegendaAss } = await import("./lib-edicao.mjs");
      const palavras = transcrever(vozUnica);
      if (palavras.length) {
        const ass = join(baseOut, "_karaoke.ass");
        writeFileSync(ass, montarASS(palavras));
        execFileSync("ffmpeg", ["-y", "-i", comVoz, "-vf", filtroLegendaAss({ assCaminho: ass }), "-c:a", "copy", saida], { stdio: "inherit" });
      } else {
        renameSync(comVoz, saida);
      }
    } catch (e) {
      console.error("AVISO: karaokê pulado — " + e.message);
      renameSync(comVoz, saida);
    }
  }
  registrarCusto({ script: "gerar-video", modelo: modeloVideo, custo: Number(custoVideo.toFixed(2)) });
  console.log(JSON.stringify({ ok: true, saida, cenas: cenas.length, duracao_total: duracaoTotal }, null, 2));
}
