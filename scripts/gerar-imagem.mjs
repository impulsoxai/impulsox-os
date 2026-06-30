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
import { submeterTarefaKie, aguardarResultadoKie, uploadParaKieAPI } from "./lib-provedor-kie.mjs";

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
const provedor = flag("--provedor") || "fal";

// preços REAIS por modelo × resolução. fal confirmado nas páginas de modelo
// (jun/2026); kie confirmado em kie.ai (home, jun/2026) — nano-pro kie sem
// preço público claro ainda, null até confirmar em kie.ai/pricing.
const PRECOS_FAL = {
  nano:        { "0.5K": 0.06, "1K": 0.08, "2K": 0.12, "4K": 0.16 },
  "nano-pro":  { "0.5K": 0.15, "1K": 0.15, "2K": 0.15, "4K": 0.30 },
  minimax:     { fixo: 0.01 },
  schnell:     { fixo: 0.003 },
  dev:         { fixo: 0.025 },
};
const PRECOS_KIE = {
  nano:        { "1K": 0.04, "2K": 0.06, "4K": 0.09 },
  "nano-pro":  null, // confirmar em kie.ai/pricing antes de usar em produção
};
const KIE_MODEL = { nano: "nano-banana-2", "nano-pro": "nano-banana-pro" };

function precoImagem(tabela, mod, res) {
  const t = tabela[mod]; if (!t) return null;
  if (t.fixo != null) return t.fixo;
  return t[res] ?? t["2K"] ?? null;
}
// --precos: imprime a tabela de modelos × resolução × preço e sai (sem gerar)
if (has("--precos")) {
  const usd = (n) => n == null ? "—" : "$" + n.toFixed(3).replace(/0$/, "");
  console.log("\nGerador de imagem — modelos e preços, fal vs kie (jun/2026):\n");
  console.log("  MODELO     PROVEDOR  0.5K    1K     2K     4K");
  console.log("  ──────────────────────────────────────────────");
  for (const mod of ["nano-pro", "nano", "minimax", "schnell", "dev"]) {
    console.log(`  ${mod.padEnd(10)} fal       ${["0.5K","1K","2K","4K"].map((r) => usd(precoImagem(PRECOS_FAL, mod, r)).padEnd(7)).join("")}`);
    if (PRECOS_KIE[mod] !== undefined) {
      console.log(`  ${mod.padEnd(10)} kie       ${["0.5K","1K","2K","4K"].map((r) => usd(precoImagem(PRECOS_KIE, mod, r)).padEnd(7)).join("")}`);
    }
  }
  console.log("\n  Uso:  --modelo nano-pro --resolucao 2K --provedor kie\n");
  process.exit(0);
}

if (!prompt) falhar("informe o --prompt (em inglês rende melhor).");
if (!saida) falhar("informe o --saida (caminho do .png).");
const FAL_KEY = process.env.FAL_KEY;
const KIE_KEY = process.env.KIE_KEY;
if (!dryRun && provedor === "fal" && !FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env). Sem chave, não dá pra gerar.");
if (!dryRun && provedor === "kie" && !KIE_KEY) falhar("KIE_KEY não definida no ambiente (.env). Sem chave, não dá pra gerar.");
if (ref && !existsSync(ref)) falhar(`imagem-referência não encontrada: ${ref}`);
if (!["nano", "nano-pro", "minimax", "schnell", "dev"].includes(modelo)) falhar(`--modelo inválido: ${modelo} (use nano, nano-pro, minimax, schnell ou dev).`);
if (!["0.5K", "1K", "2K", "4K"].includes(resolucao)) falhar(`--resolucao inválida: ${resolucao} (use 0.5K, 1K, 2K ou 4K).`);
if (!["fal", "kie"].includes(provedor)) falhar(`--provedor inválido: ${provedor} (use fal ou kie).`);
if (provedor === "kie" && !KIE_MODEL[modelo]) falhar(`kie.ai não suporta --modelo ${modelo} ainda (use nano ou nano-pro, ou troque --provedor fal).`);

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
  console.log(JSON.stringify({
    dry_run: true, modelo, provedor, largura, altura,
    resolucao: ehNano ? resolucao : undefined, ref: !!ref,
    custo_estimado_fal_usd: precoImagem(PRECOS_FAL, modelo, resolucao),
    custo_estimado_kie_usd: KIE_MODEL[modelo] ? precoImagem(PRECOS_KIE, modelo, resolucao) : null,
  }, null, 2));
  process.exit(0);
}

// --- chama o provedor escolhido e salva ----------------------------------
async function baixar(urlOuData) {
  if (urlOuData.startsWith("data:")) return Buffer.from(urlOuData.split(",")[1], "base64");
  const resp = await fetch(urlOuData);
  if (!resp.ok) falhar(`falha ao baixar a imagem gerada (HTTP ${resp.status}).`);
  return Buffer.from(await resp.arrayBuffer());
}

if (provedor === "kie") {
  try {
    const KIE_BASE = process.env.KIE_BASE_URL || "https://api.kie.ai";
    let imageInput;
    if (ref) {
      const url = await uploadParaKieAPI(ref, { kieKey: KIE_KEY, base: KIE_BASE });
      imageInput = [url];
    }
    const input = {
      prompt, aspect_ratio: aspectRatio(largura, altura),
      ...(ehNano ? { resolution: resolucao, output_format: "png" } : {}),
      ...(imageInput ? { image_input: imageInput } : {}),
    };
    const taskId = await submeterTarefaKie({ kieKey: KIE_KEY, base: KIE_BASE, model: KIE_MODEL[modelo], input });
    const { resultUrls } = await aguardarResultadoKie({ kieKey: KIE_KEY, base: KIE_BASE, taskId });
    if (!resultUrls?.[0]) falhar("kie.ai: resposta sem imagem.");
    writeFileSync(saida, await baixar(resultUrls[0]));
    const custoReal = precoImagem(PRECOS_KIE, modelo, resolucao);
    registrarCusto({ script: "gerar-imagem", modelo: `${modelo}(kie)`, custo: custoReal ?? 0 });
    console.log(JSON.stringify({ ok: true, saida, modelo, provedor, resolucao: ehNano ? resolucao : undefined, custo_usd: custoReal }, null, 2));
  } catch (e) {
    falhar(String(e?.message || e).replace(KIE_KEY || "", "***"));
  }
} else {
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
    const custoReal = precoImagem(PRECOS_FAL, modelo, resolucao);
    registrarCusto({ script: "gerar-imagem", modelo, custo: custoReal });
    console.log(JSON.stringify({ ok: true, saida, modelo, resolucao: ehNano ? resolucao : undefined, custo_usd: custoReal }, null, 2));
  } catch (e) {
    if (e?.code === "ENOTFOUND" || e?.cause) falhar("falha de rede ao chamar a Fal.");
    falhar(String(e?.message || e).replace(FAL_KEY || "", "***"));
  }
}
