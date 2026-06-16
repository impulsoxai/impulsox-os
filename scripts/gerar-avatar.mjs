#!/usr/bin/env node
/**
 * gerar-avatar.mjs — transforma foto + áudio num vídeo da pessoa falando (lip-sync).
 * ImpulsoX AI. Modelo: OmniHuman v1.5 (ByteDance) via Fal.ai.
 *
 * Uso:
 *   FAL_KEY=... node scripts/gerar-avatar.mjs \
 *     --foto dados/imagens/eu.jpg \
 *     --audio dados/audio/voz.mp3 \
 *     --saida dados/imagens/avatar.mp4 \
 *     [--resolucao 1080p|720p] [--dry-run]
 *
 * GUARDA DE CUSTO: o vídeo dura o tempo do áudio e cobra POR SEGUNDO. Sem --confirmar,
 * o script só ESTIMA o custo e para. Cobra de verdade só com --confirmar. A Fal cobra
 * quando a geração completa, mesmo que o download falhe — por isso a estimativa vem antes.
 *
 * Regras:
 *   - Foto: rosto visível, boa iluminação, fundo neutro ajuda
 *   - Áudio: voz real gravada (mp3/wav/m4a/ogg); TTS soa artificial
 *   - Limite: até 30s em 1080p, até 60s em 720p
 *   - FAL_KEY nunca aparece em log ou erro
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { registrarCusto } from "./registrar-custo.mjs";
import { registrarPasso } from "./registrar-passo.mjs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

const foto = flag("--foto");
const audio = flag("--audio");
const saida = flag("--saida") || "avatar.mp4";
const resolucao = flag("--resolucao") || "1080p";
const modelo = flag("--modelo") || "omnihuman";
const dryRun = has("--dry-run");
const confirmar = has("--confirmar");

// catálogo de modelos de avatar (foto + áudio -> pessoa falando). Troca por flag.
// preço REAL/seg conferido no painel da Fal (jun/2026) — NÃO chutar, é dinheiro de verdade.
// kling-avatar: lip sync mais preciso (benchmark 2026). omnihuman: full-body, film-grade.
const MODELOS = {
  "omnihuman": { ep: "fal-ai/bytedance/omnihuman/v1.5", preco: resolucao === "1080p" ? 0.16 : 0.10 },
  "kling-avatar": { ep: "fal-ai/kling-video/ai-avatar/v2/pro", preco: 0.115 },
  "heygen": { ep: "fal-ai/heygen/avatar4/image-to-video", preco: 0.10 },
};

if (!foto) falhar("informe --foto (ex.: dados/imagens/eu.jpg).");
if (!audio) falhar("informe --audio (ex.: dados/audio/voz.mp3).");
if (!existsSync(foto)) falhar(`foto não encontrada: ${foto}`);
if (!existsSync(audio)) falhar(`áudio não encontrado: ${audio}`);
if (!["1080p", "720p"].includes(resolucao)) falhar(`--resolucao inválida: ${resolucao} (use 1080p ou 720p).`);
if (!MODELOS[modelo]) falhar(`--modelo inválido: ${modelo} (use omnihuman, kling-avatar ou heygen).`);

const MODELO = MODELOS[modelo].ep;
const PRECO_SEG = MODELOS[modelo].preco;

// mede a duração do áudio (ffprobe) — o vídeo dura isso, e é isso que define o custo.
function duracaoAudio(caminho) {
  try {
    const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", caminho], { encoding: "utf8" });
    return Number(out.trim());
  } catch { return NaN; }
}
const durSeg = duracaoAudio(audio);
const custoEst = Number.isFinite(durSeg) ? durSeg * PRECO_SEG : NaN;
const custoStr = Number.isFinite(custoEst) ? `$${custoEst.toFixed(2)}` : `~? (ffprobe ausente — ${PRECO_SEG}/seg)`;

if (dryRun) {
  console.log(JSON.stringify({
    dry_run: true, foto, audio, saida, resolucao, modelo, endpoint: MODELO,
    duracao_audio_seg: Number.isFinite(durSeg) ? Number(durSeg.toFixed(1)) : "?",
    preco_seg: PRECO_SEG, custo_estimado: custoStr,
  }, null, 2));
  process.exit(0);
}

// GUARDA DE CUSTO: sem --confirmar, mostra a conta e para. Cobra só com o ok explícito.
if (!confirmar) {
  console.log("");
  console.log(`  Modelo:   ${modelo} (${MODELO})`);
  console.log(`  Áudio:    ${Number.isFinite(durSeg) ? durSeg.toFixed(1) + "s" : "duração desconhecida"}`);
  console.log(`  Preço:    $${PRECO_SEG}/seg`);
  console.log(`  CUSTO ESTIMADO: ${custoStr}`);
  console.log("");
  console.log("  A Fal cobra quando a geração completa (mesmo se o download falhar).");
  console.log("  Para gerar de verdade, rode de novo com --confirmar no fim do comando.");
  console.log("");
  process.exit(0);
}

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env).");
const BASE = process.env.FAL_BASE_URL || "https://queue.fal.run";
registrarPasso({ skill: "/post", etapa: `gerando avatar (${modelo}) · ${resolucao}`, status: "inicio" });

// Imagem: base64 data URI (OmniHuman aceita pra image_url)
function imagemParaDataUri(caminho) {
  const ext = caminho.split(".").pop().toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${readFileSync(caminho).toString("base64")}`;
}

// Upload de arquivo para Fal CDN (modelos exigem URL real, não base64, no audio_url).
// Fluxo: obter token temporário via rest.alpha.fal.ai → upload via base_url retornado.
async function uploadArquivo(caminho) {
  const ext = caminho.split(".").pop().toLowerCase();
  const mimeMap = { mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", mp4: "audio/mp4", ogg: "audio/ogg", aac: "audio/aac",
                    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  const mime = mimeMap[ext] || "application/octet-stream";
  const nome = caminho.split(/[\\/]/).pop();
  // passo 1: token temporário de upload
  const tr = await fetch("https://rest.alpha.fal.ai/storage/auth/token?storage_type=fal-cdn-v3", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: "{}",
  });
  const tTxt = await tr.text();
  if (!tr.ok) falhar(`Fal auth HTTP ${tr.status}: ${tTxt.slice(0, 200)}`);
  let tj; try { tj = JSON.parse(tTxt); } catch { falhar(`Fal auth: resposta inválida. ${tTxt.slice(0, 200)}`); }
  // passo 2: upload do arquivo
  const form = new FormData();
  form.append("file", new Blob([readFileSync(caminho)], { type: mime }), nome);
  const ur = await fetch(`${tj.base_url}/files/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tj.token}` },
    body: form,
  });
  const uTxt = await ur.text();
  if (!ur.ok) falhar(`Fal upload HTTP ${ur.status}: ${uTxt.slice(0, 200)}`);
  let uj; try { uj = JSON.parse(uTxt); } catch { falhar(`Fal upload: resposta inválida. ${uTxt.slice(0, 200)}`); }
  if (!uj.access_url) falhar(`Fal upload: URL não retornada. ${JSON.stringify(uj).slice(0, 200)}`);
  return uj.access_url;
}

// Polling de status (igual ao gerar-video.mjs — padrão da casa)
async function aguardarPronto(statusUrl, responseUrl) {
  const auth = { headers: { Authorization: `Key ${FAL_KEY}` } };
  for (let t = 0; t < 200; t++) {
    await new Promise((r) => setTimeout(r, 3000));
    let sj; try { sj = JSON.parse(await (await fetch(statusUrl, auth)).text()); } catch { continue; }
    if (sj.status === "COMPLETED") break;
    if (sj.status === "FAILED" || sj.status === "ERROR") falhar(`Fal: geração falhou (${sj.status}).`);
    if (t === 199) falhar("Fal: avatar não ficou pronto em 10 minutos (timeout).");
  }
  const rj = await (await fetch(responseUrl, auth)).json();
  const vurl = rj?.video?.url || rj?.output?.video?.url || rj?.video_url;
  if (!vurl) falhar(`Fal: resposta sem vídeo. ${JSON.stringify(rj).slice(0, 300)}`);
  const duracao = rj?.video?.duration ?? rj?.duration ?? "?";
  return { vurl, duracao };
}

console.log("Enviando arquivos para Fal...");
// imagem em base64 (upload CDN salva como .bin e quebra o detector de formato).
// áudio: omnihuman aceita URL .bin do CDN; kling/heygen exigem extensão real -> base64.
const imageUrl = imagemParaDataUri(foto);
const audioExt = audio.split(".").pop().toLowerCase();
const audioMime = audioExt === "wav" ? "audio/wav" : "audio/mpeg";
const audioUrl = modelo === "omnihuman"
  ? await uploadArquivo(audio)
  : `data:${audioMime};base64,${readFileSync(audio).toString("base64")}`;

// payload por modelo: omnihuman tem resolution; kling usa prompt placeholder; heygen aceita só image+audio.
const payload =
  modelo === "kling-avatar" ? { image_url: imageUrl, audio_url: audioUrl, prompt: "." }
  : modelo === "heygen" ? { image_url: imageUrl, audio_url: audioUrl, scale_type: "contain" }
  : { image_url: imageUrl, audio_url: audioUrl, resolution: resolucao };

console.log(`Gerando avatar (${modelo})...`);
const sub = await fetch(`${BASE}/${MODELO}`, {
  method: "POST",
  headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const subTxt = await sub.text();
if (!sub.ok) falhar(`Fal avatar HTTP ${sub.status}: ${subTxt.slice(0, 200)}`);
let subJson; try { subJson = JSON.parse(subTxt); } catch { falhar(`Fal: submit inválido. ${subTxt.slice(0, 200)}`); }

const statusUrl = subJson.status_url || `${BASE}/${MODELO}/requests/${subJson.request_id}/status`;
const responseUrl = subJson.response_url || `${BASE}/${MODELO}/requests/${subJson.request_id}`;

console.log("Aguardando geração...");
const { vurl, duracao } = await aguardarPronto(statusUrl, responseUrl);

const pasta = dirname(saida);
if (pasta && pasta !== ".") mkdirSync(pasta, { recursive: true });

console.log("Baixando vídeo...");
const vid = await fetch(vurl);
if (!vid.ok) falhar(`Download falhou HTTP ${vid.status}`);
writeFileSync(saida, Buffer.from(await vid.arrayBuffer()));

registrarCusto({ script: "gerar-avatar", modelo, custo: Number.isFinite(custoEst) ? Number(custoEst.toFixed(2)) : Number((durSeg * PRECO_SEG).toFixed(2)) });

const custo = typeof duracao === "number" ? `$${(duracao * PRECO_SEG).toFixed(2)}` : "(calcular: duracao × $" + PRECO_SEG + ")";
console.log(JSON.stringify({ ok: true, saida, duracao_seg: duracao, custo, resolucao }, null, 2));
