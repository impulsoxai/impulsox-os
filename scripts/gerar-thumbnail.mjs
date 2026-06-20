#!/usr/bin/env node
/**
 * gerar-thumbnail.mjs — capa do vídeo. SEMPRE gera a versão frame+texto (ffmpeg,
 * determinística, on-brand). Com --fal, mostra o preview do plano e só gera por IA
 * (gerar-imagem.mjs) com --confirmar (não gasta sem confirmar). ImpulsoX AI.
 *
 * Uso: node scripts/gerar-thumbnail.mjs --slug demo --texto "POSTA SOZINHO" \
 *        [--frame 3 | --frame capa.png] [--video bruto.mp4] [--fonte caminho.ttf]
 *        [--fal --conceito "..." [--modelo nano|nano-pro|minimax|schnell|dev] \
 *         [--resolucao 1K|2K|4K] [--ref foto.png] [--confirmar]]
 *
 * Modelo da geração por IA (--modelo, default nano): nano=Banana 2 (texto+luz certos,
 * ~8-12¢) · nano-pro=estúdio (~15¢) · minimax=barato (~1¢) · schnell/dev=FLUX. --resolucao
 * só pesa em nano/nano-pro. --ref = foto-referência (mantém o sujeito; só foto autorizada).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { argsThumbnailFrameTexto, argsThumbnailComposta } from "./lib-edicao.mjs";

const FFMPEG = process.env.FFMPEG_BIN || "ffmpeg";

// Args do ffmpeg pra extrair 1 frame de um vídeo no tempo `seg` (segundos).
export function argsExtrairFrame(video, seg, saida) {
  return ["-y", "-ss", String(seg), "-i", video, "-frames:v", "1", saida];
}

// Preview do plano da thumbnail por IA — NÃO chama a Fal (isso é só com --confirmar).
export function planoFal({ conceito, slug, modelo = "nano" }) {
  return {
    dry_run: true,
    prompt: `YouTube thumbnail, 16:9, high contrast, one dominant subject, dramatic lighting, clear facial emotion if the subject is a person (surprise/focus/relief): ${conceito}. No text in the image.`,
    saida: `canal-youtube/edicao/${slug}/thumb-fal.png`,
    modelo,
    nota: `rode com --confirmar pra gerar via Fal (modelo ${modelo}, 16:9). Modelos: nano (Banana 2, texto+luz certos, ~8-12¢) · nano-pro (estúdio, ~15¢) · minimax (barato ~1¢) · schnell/dev (FLUX). Sem texto na imagem — o texto entra on-brand no layout composto.`,
  };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const slug = flag("--slug");
  const texto = flag("--texto");
  // fonte display da marca (Space Grotesk). Default procura no clone; --fonte sobrescreve.
  // Sem ela, cai pro Bahnschrift (geométrica, fallback Windows mais próximo).
  const fonteMarca = "marca/fontes/SpaceGrotesk.ttf";
  const fonte = flag("--fonte") || (existsSync(fonteMarca) ? fonteMarca : "C:/Windows/Fonts/bahnschrift.ttf");
  // cores da marca (sobrescrevíveis); defaults vivem na própria argsThumbnailComposta.
  const fundoCor = flag("--fundo-cor");
  const destaqueCor = flag("--destaque-cor");
  const simples = has("--simples"); // layout antigo (texto sobre frame inteiro)
  if (!slug) falhar("informe --slug <nome>.");

  const base = join("canal-youtube", "edicao", slug);
  mkdirSync(base, { recursive: true });

  // 1) versão frame+texto (sempre), se houver texto e um frame/vídeo de origem.
  // Default: layout COMPOSTO 16:9 (faixa de cor + texto à esquerda, frame à direita) —
  // resolve vídeo vertical 9:16 que não vira capa horizontal por crop cego. `--simples`
  // usa o layout antigo (texto sobre o frame inteiro).
  const frameArg = flag("--frame");
  const video = flag("--video");
  if (texto && (frameArg || video)) {
    let frame = frameArg && frameArg.endsWith(".png") ? frameArg : join(base, "_frame.png");
    if (!(frameArg && frameArg.endsWith(".png"))) {
      const seg = Number(frameArg) || 1;
      if (!video) falhar("pra extrair frame por tempo, passe --video.");
      execFileSync(FFMPEG, argsExtrairFrame(video, seg, frame), { stdio: "ignore" });
    }
    const saidaFrame = join(base, "thumb-frame.png");
    const opcoesComposta = { frame, texto, fonte, saida: saidaFrame };
    if (fundoCor) opcoesComposta.fundoCor = fundoCor;
    if (destaqueCor) opcoesComposta.destaqueCor = destaqueCor;
    const argsThumb = simples
      ? argsThumbnailFrameTexto({ frame, texto, fonte, saida: saidaFrame })
      : argsThumbnailComposta(opcoesComposta);
    execFileSync(FFMPEG, argsThumb, { stdio: "ignore" });
    console.log(`thumb gerada: ${saidaFrame}`);
  }

  // 2) alternativa Fal (preview por padrão; gera só com --confirmar)
  // Modelo escolhível (--modelo, default nano/Banana 2 — texto+luz certos pra capa).
  // --resolucao só pesa em nano/nano-pro. --ref mantém o sujeito (foto real autorizada).
  if (has("--fal")) {
    const conceito = flag("--conceito") || texto || "";
    const modelo = flag("--modelo") || "nano";
    const resolucao = flag("--resolucao") || "1K";
    const refImg = flag("--ref");
    const plano = planoFal({ conceito, slug, modelo });
    if (!has("--confirmar")) { console.log(JSON.stringify(plano, null, 2)); process.exit(0); }
    const saidaFal = join(base, "thumb-fal.png");
    const argsImg = [join("scripts", "gerar-imagem.mjs"), "--prompt", plano.prompt,
      "--saida", saidaFal, "--modelo", modelo, "--largura", "1280", "--altura", "720", "--resolucao", resolucao];
    if (refImg) argsImg.push("--ref", refImg);
    try {
      execFileSync("node", argsImg, { stdio: "inherit" });
      console.log(`thumb Fal: ${saidaFal}`);
    } catch (e) { falhar("geração Fal falhou: " + e.message); }
  }
}
