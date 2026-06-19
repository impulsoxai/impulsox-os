#!/usr/bin/env node
/**
 * gerar-imagem.mjs — gera imagem por IA via Fal.ai (MiniMax/FLUX). ImpulsoX AI. Sem deps.
 *
 * Uso:
 *   FAL_KEY=... node scripts/gerar-imagem.mjs --prompt "<inglês>" --saida out.png \
 *     [--modelo nano|nano-pro|minimax|schnell|dev] [--ref caminho.png] \
 *     [--largura 1080 --altura 1350] [--resolucao 1K|2K|4K] [--dry-run]
 *
 * --modelo nano (Nano Banana 2 / Gemini 3.1 Flash Image): fotos premium, texto e luz
 *   corretos, ~8¢. É o PADRÃO para página premium (/pagina). --resolucao 2K recomendado.
 * --modelo nano-pro (Gemini 3 Pro Image): estúdio, ~15¢. Hero/capa que exige o máximo.
 * --modelo minimax: foto realista barata, ~1¢ — bom para post/redes (volume).
 * --modelo schnell/dev: FLUX (estilizado/abstrato, iterar barato).
 *
 * A chave NUNCA aparece em log nem em erro. Prompt em inglês rende melhor.
 * Regra de segurança: nunca gerar rosto identificável (pessoa real só com foto autorizada).
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { registrarCusto } from "./registrar-custo.mjs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

const prompt = flag("--prompt");
const saida = flag("--saida");
const modelo = flag("--modelo") || "minimax";
const ref = flag("--ref");
const largura = Number(flag("--largura") || 1080);
const altura = Number(flag("--altura") || 1350);
const resolucao = flag("--resolucao") || "2K"; // só Nano Banana usa; default premium 2K
const dryRun = has("--dry-run");

// --- preços REAIS por modelo × resolução (confirmados em fal.ai, jun/2026) --
// Fonte: páginas dos modelos na Fal. Reconferir antes de mudar — Fal ajusta preço.
// nano (Banana 2): base 1K=$0.08; 0.5K×0.75, 2K×1.5, 4K×2. nano-pro: 1K/2K=$0.15, 4K=$0.30.
// minimax fixo $0.01. FLUX schnell $0.003 / dev $0.025 (não usam --resolucao).
const PRECOS = {
  nano:        { "0.5K": 0.06, "1K": 0.08, "2K": 0.12, "4K": 0.16 },
  "nano-pro":  { "0.5K": 0.15, "1K": 0.15, "2K": 0.15, "4K": 0.30 },
  minimax:     { fixo: 0.01 },
  schnell:     { fixo: 0.003 },
  dev:         { fixo: 0.025 },
};
function precoImagem(mod, res) {
  const t = PRECOS[mod]; if (!t) return 0;
  if (t.fixo != null) return t.fixo;
  return t[res] ?? t["2K"] ?? 0;
}
// --precos: imprime a tabela de modelos × resolução × preço e sai (sem gerar)
if (has("--precos")) {
  const usd = (n) => "$" + n.toFixed(3).replace(/0$/, "");
  console.log("\nGerador de imagem — modelos e preços (Fal, jun/2026):\n");
  console.log("  MODELO     QUALIDADE / USO                 0.5K    1K     2K     4K");
  console.log("  ─────────────────────────────────────────────────────────────────");
  console.log("  nano-pro   estúdio (Gemini 3 Pro)          —      $.15   $.15   $.30   ← padrão premium");
  console.log("  nano       foto realista forte (Banana 2)  $.06   $.08   $.12   $.16   ← ótimo custo×qualidade");
  console.log("  minimax    foto realista barata (volume)   —      $.01   $.01   $.01   ← redes/post");
  console.log("  schnell    FLUX estilizado/abstrato        —      $.003 (iterar barato)");
  console.log("  dev        FLUX qualidade                  —      $.025");
  console.log("\n  Uso:  --modelo nano-pro --resolucao 2K   (4K dobra o preço)");
  console.log("  Estimar sem gerar:  adicione --dry-run\n");
  process.exit(0);
}

if (!prompt) falhar("informe o --prompt (em inglês rende melhor).");
if (!saida) falhar("informe o --saida (caminho do .png).");
const FAL_KEY = process.env.FAL_KEY;
if (!dryRun && !FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env). Sem chave, não dá pra gerar.");
if (ref && !existsSync(ref)) falhar(`imagem-referência não encontrada: ${ref}`);
if (!["nano", "nano-pro", "minimax", "schnell", "dev"].includes(modelo)) falhar(`--modelo inválido: ${modelo} (use nano, nano-pro, minimax, schnell ou dev).`);
if (!["0.5K", "1K", "2K", "4K"].includes(resolucao)) falhar(`--resolucao inválida: ${resolucao} (use 0.5K, 1K, 2K ou 4K).`);

// --- monta o payload e o endpoint -------------------------------------------
const BASE = process.env.FAL_BASE_URL || "https://fal.run";
// VERIFICAR no painel da Fal antes de subir: nomes de modelo podem mudar.

// MiniMax usa aspect_ratio (enum), não pixel — mapeia largura/altura pro mais próximo.
function aspectRatio(w, h) {
  const r = w / h;
  const opcoes = [["1:1", 1], ["16:9", 16 / 9], ["9:16", 9 / 16], ["4:3", 4 / 3], ["3:4", 3 / 4], ["2:3", 2 / 3], ["3:2", 3 / 2], ["21:9", 21 / 9]];
  return opcoes.reduce((a, b) => (Math.abs(b[1] - r) < Math.abs(a[1] - r) ? b : a))[0];
}
function refDataUri(p) {
  const b64 = readFileSync(p).toString("base64");
  const tipo = p.toLowerCase().endsWith(".jpg") || p.toLowerCase().endsWith(".jpeg") ? "jpeg" : "png";
  return `data:image/${tipo};base64,${b64}`;
}

const ehNano = modelo === "nano" || modelo === "nano-pro";
const ehMinimax = modelo === "minimax";
// Nano Banana (Gemini): edit endpoint quando há ref, geração pura quando não há.
const NANO_BASE = modelo === "nano-pro" ? "fal-ai/nano-banana-pro" : "fal-ai/nano-banana-2";
const ENDPOINT = ehNano
  ? `${BASE}/${NANO_BASE}${ref ? "/edit" : ""}`
  : ehMinimax
    ? `${BASE}/fal-ai/minimax/image-01`
    : ref
      ? `${BASE}/fal-ai/flux/dev/image-to-image`
      : `${BASE}/fal-ai/flux/${modelo === "dev" ? "dev" : "schnell"}`;

// Nano Banana: aspect_ratio (enum) + resolution (1K/2K/4K). Edit usa image_urls[] (lista).
// MiniMax: image_url é "subject reference" (mantém o mesmo sujeito), não transfer de
// estilo. FLUX: image_url + strength faz image-to-image (puxa o look). A paleta da marca
// vai SEMPRE pelo prompt (o /post injeta), independente do modelo.
const payload = ehNano
  ? { prompt, num_images: 1, aspect_ratio: aspectRatio(largura, altura), resolution: resolucao, output_format: "png", ...(ref ? { image_urls: [refDataUri(ref)] } : {}) }
  : ehMinimax
    ? { prompt, num_images: 1, aspect_ratio: aspectRatio(largura, altura), ...(ref ? { image_url: refDataUri(ref) } : {}) }
    : { prompt, num_images: 1, image_size: { width: largura, height: altura }, ...(ref ? { image_url: refDataUri(ref), strength: 0.85 } : {}) };

if (dryRun) {
  console.log(JSON.stringify({ dry_run: true, modelo, endpoint: ENDPOINT, largura, altura, resolucao: ehNano ? resolucao : undefined, aspect_ratio: aspectRatio(largura, altura), ref: !!ref, custo_estimado_usd: precoImagem(modelo, resolucao) }, null, 2));
  process.exit(0);
}

// --- chama a Fal e salva ----------------------------------------------------
async function baixar(urlOuData) {
  if (urlOuData.startsWith("data:")) return Buffer.from(urlOuData.split(",")[1], "base64");
  const resp = await fetch(urlOuData);
  if (!resp.ok) falhar(`falha ao baixar a imagem gerada (HTTP ${resp.status}).`);
  return Buffer.from(await resp.arrayBuffer());
}
try {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (resp.status === 401) falhar("FAL_KEY inválida ou sem permissão.");
  if (resp.status === 402) falhar("conta Fal sem crédito. Recarregue antes de gerar.");
  if (resp.status === 429) falhar("limite de uso da Fal atingido (rate limit). Tente em instantes.");
  if (!resp.ok) falhar(`Fal retornou HTTP ${resp.status}. ${(await resp.text()).slice(0, 200)}`);
  const data = await resp.json();
  const img = data?.images?.[0]?.url;
  if (!img) falhar("resposta da Fal sem imagem (prompt pode ter sido recusado).");
  writeFileSync(saida, await baixar(img));
  const custoReal = precoImagem(modelo, resolucao);
  registrarCusto({ script: "gerar-imagem", modelo, custo: custoReal });
  console.log(JSON.stringify({ ok: true, saida, modelo, resolucao: ehNano ? resolucao : undefined, custo_usd: custoReal }, null, 2));
} catch (e) {
  if (e?.code === "ENOTFOUND" || e?.cause) falhar("falha de rede ao chamar a Fal.");
  falhar(String(e?.message || e).replace(FAL_KEY || "", "***"));
}
