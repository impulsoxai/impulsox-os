#!/usr/bin/env node
/**
 * gerar-thumbnail.mjs — capa do vídeo. SEMPRE gera a versão frame+texto (ffmpeg,
 * determinística, on-brand). Com --fal, mostra o preview do plano e só gera por IA
 * (gerar-imagem.mjs) com --confirmar (não gasta sem confirmar). ImpulsoX AI.
 *
 * Uso: node scripts/gerar-thumbnail.mjs --slug demo --texto "POSTA SOZINHO" \
 *        [--frame 3 | --frame capa.png] [--video bruto.mp4] [--fonte caminho.ttf]
 *        [--fal --conceito "..." [--confirmar]]
 */
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { argsThumbnailFrameTexto, argsThumbnailComposta } from "./lib-edicao.mjs";

const FFMPEG = process.env.FFMPEG_BIN || "ffmpeg";

// Args do ffmpeg pra extrair 1 frame de um vídeo no tempo `seg` (segundos).
export function argsExtrairFrame(video, seg, saida) {
  return ["-y", "-ss", String(seg), "-i", video, "-frames:v", "1", saida];
}

// Preview do plano da thumbnail por IA — NÃO chama a Fal (isso é só com --confirmar).
export function planoFal({ conceito, slug }) {
  return {
    dry_run: true,
    prompt: `Thumbnail de YouTube, alto contraste, 1 sujeito dominante: ${conceito}. Sem texto na imagem.`,
    saida: `canal-youtube/edicao/${slug}/thumb-fal.png`,
    nota: "rode com --confirmar pra gerar via Fal (tem custo).",
  };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const slug = flag("--slug");
  const texto = flag("--texto");
  // impact.ttf é a fonte clássica de thumbnail (alto impacto). Marca pode sobrescrever.
  const fonte = flag("--fonte") || "C:/Windows/Fonts/impact.ttf";
  const faixaCor = flag("--faixa-cor") || "0xE10600";
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
    const argsThumb = simples
      ? argsThumbnailFrameTexto({ frame, texto, fonte, saida: saidaFrame })
      : argsThumbnailComposta({ frame, texto, fonte, faixaCor, saida: saidaFrame });
    execFileSync(FFMPEG, argsThumb, { stdio: "ignore" });
    console.log(`thumb gerada: ${saidaFrame}`);
  }

  // 2) alternativa Fal (preview por padrão; gera só com --confirmar)
  if (has("--fal")) {
    const conceito = flag("--conceito") || texto || "";
    const plano = planoFal({ conceito, slug });
    if (!has("--confirmar")) { console.log(JSON.stringify(plano, null, 2)); process.exit(0); }
    const saidaFal = join(base, "thumb-fal.png");
    try {
      execFileSync("node", [join("scripts", "gerar-imagem.mjs"), plano.prompt, "--saida", saidaFal], { stdio: "inherit" });
      console.log(`thumb Fal: ${saidaFal}`);
    } catch (e) { falhar("geração Fal falhou: " + e.message); }
  }
}
