#!/usr/bin/env node
/**
 * gerar-imagem.mjs — gera imagem por IA via Fal.ai (FLUX). ImpulsoX AI. Sem deps.
 *
 * Uso:
 *   FAL_KEY=... node scripts/gerar-imagem.mjs --prompt "<inglês>" --saida out.png \
 *     [--modelo schnell|dev] [--ref caminho.png] [--largura 1080 --altura 1350] [--dry-run]
 *
 * A chave NUNCA aparece em log nem em erro. Prompt em inglês rende melhor.
 * Regra de segurança: nunca gerar rosto identificável (pessoa real só com foto autorizada).
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

const prompt = flag("--prompt");
const saida = flag("--saida");
const modelo = flag("--modelo") || "schnell";
const ref = flag("--ref");
const largura = Number(flag("--largura") || 1080);
const altura = Number(flag("--altura") || 1350);
const dryRun = has("--dry-run");

if (!prompt) falhar("informe o --prompt (em inglês rende melhor).");
if (!saida) falhar("informe o --saida (caminho do .png).");
const FAL_KEY = process.env.FAL_KEY;
if (!dryRun && !FAL_KEY) falhar("FAL_KEY não definida no ambiente (.env). Sem chave, não dá pra gerar.");
if (ref && !existsSync(ref)) falhar(`imagem-referência não encontrada: ${ref}`);
if (!["schnell", "dev"].includes(modelo)) falhar(`--modelo inválido: ${modelo} (use schnell ou dev).`);

// --- monta o payload e o endpoint -------------------------------------------
const BASE = process.env.FAL_BASE_URL || "https://fal.run";
// VERIFICAR no painel da Fal antes de subir: nomes de modelo podem mudar.
const ENDPOINT = ref
  ? `${BASE}/fal-ai/flux/dev/image-to-image`
  : `${BASE}/fal-ai/flux/${modelo === "dev" ? "dev" : "schnell"}`;

function refDataUri(p) {
  const b64 = readFileSync(p).toString("base64");
  const tipo = p.toLowerCase().endsWith(".jpg") || p.toLowerCase().endsWith(".jpeg") ? "jpeg" : "png";
  return `data:image/${tipo};base64,${b64}`;
}
const payload = {
  prompt,
  num_images: 1,
  image_size: { width: largura, height: altura },
  ...(ref ? { image_url: refDataUri(ref), strength: 0.85 } : {}),
};

if (dryRun) {
  console.log(JSON.stringify({ dry_run: true, modelo, endpoint: ENDPOINT, largura, altura, ref: !!ref }, null, 2));
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
  console.log(JSON.stringify({ ok: true, saida, modelo }, null, 2));
} catch (e) {
  if (e?.code === "ENOTFOUND" || e?.cause) falhar("falha de rede ao chamar a Fal.");
  falhar(String(e?.message || e).replace(FAL_KEY || "", "***"));
}
