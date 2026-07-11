#!/usr/bin/env node
/**
 * distancia-voz.mjs — TERMÔMETRO de distância de voz (não gate).
 *
 * Mede quão perto uma peça está do jeito do dono escrever, contra o banco
 * `nucleo/voz/amostras/`. Sai como BANDA relativa (perto/médio/longe), nunca
 * como score absoluto — a ciência é clara: estilo só estabiliza em ~25 amostras
 * (arXiv:2606.09854); com 5, o número é orientação, não veredito. NUNCA trava
 * publicação — quem trava é o gate-voz; quem julga o fino é o revisor-voz.
 *
 * Arquitetura HÍBRIDA (Rota A, decisão 11/07/2026 após pesquisa profunda):
 *  - SEMPRE: features stylométricas determinísticas (tamanho de frase, vírgula,
 *    conectivos, exclamação, caixa) — robustas em PT-BR com poucas amostras
 *    (Comparing Sentence-Level Features for Authorship Analysis in Portuguese,
 *    Springer 2010). Distância = z-score contra a média das amostras.
 *  - OPCIONAL: se `@huggingface/transformers` estiver instalado, soma a camada
 *    semântica de estilo (paraphrase-multilingual-MiniLM-L12-v2, ONNX, PT-BR
 *    nativo, roda em Node sem Python). Sem o pacote, roda só nas features —
 *    zero dependência obrigatória, nada trava.
 *
 * Uso:
 *   node scripts/distancia-voz.mjs <arquivo|-> [--html|--legenda] [--json]
 *   node scripts/distancia-voz.mjs --amostra "texto solto"
 *
 * ImpulsoX AI. Conteúdo original.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { extrairTextoHtml, extrairLegendaPublicada } from "./gate-voz.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const DIR_AMOSTRAS = join(__dir, "..", "nucleo", "voz", "amostras");

// --- features stylométricas (determinísticas, PT-BR) ----------------------------
export function extrairFeatures(texto) {
  const limpo = texto.replace(/\s+/g, " ").trim();
  const frases = limpo.split(/[.!?…]+/).map((s) => s.trim()).filter(Boolean);
  const numFrases = frases.length || 1;
  const palavras = limpo.split(/\s+/).filter(Boolean);
  const numPalavras = palavras.length || 1;

  const virgulas = (limpo.match(/,/g) || []).length;
  const exclamacoes = (limpo.match(/!/g) || []).length;
  const interrogacoes = (limpo.match(/\?/g) || []).length;
  // conectivo "e" no meio (o encadeamento característico dela)
  const conectivoE = (limpo.match(/(?:^|[^\wà-úÀ-Ú])e(?![\wà-úÀ-Ú])/gi) || []).length;
  // frases que abrem com conector (vício de IA quando alto)
  const abreConector = frases.filter((f) =>
    /^(além disso|portanto|dessa forma|assim|contudo|entretanto|ademais|por fim|em suma)/i.test(f)
  ).length;
  // variância de tamanho de frase (ritmo — IA tende a uniforme)
  const tamanhos = frases.map((f) => f.split(/\s+/).filter(Boolean).length);
  const media = tamanhos.reduce((a, b) => a + b, 0) / numFrases;
  const variancia = tamanhos.reduce((a, b) => a + (b - media) ** 2, 0) / numFrases;

  return {
    numFrases,
    numPalavras,
    palavrasPorFrase: numPalavras / numFrases,
    virgulasPorFrase: virgulas / numFrases,
    exclamacoesPorFrase: exclamacoes / numFrases,
    interrogacoesPorFrase: interrogacoes / numFrases,
    conectivoEporFrase: conectivoE / numFrases,
    abreConectorRatio: abreConector / numFrases,
    desvioTamanhoFrase: Math.sqrt(variancia),
  };
}

// ordem fixa das features no vetor (pra z-score coordenada a coordenada)
const CHAVES = [
  "palavrasPorFrase",
  "virgulasPorFrase",
  "exclamacoesPorFrase",
  "interrogacoesPorFrase",
  "conectivoEporFrase",
  "abreConectorRatio",
  "desvioTamanhoFrase",
];

export function vetorDeFeatures(texto) {
  const f = extrairFeatures(texto);
  return CHAVES.map((k) => f[k]);
}

// distância z-score: por coordenada, (peça - média) / desvio das amostras; euclidiana no fim.
// z-score em vez de euclidiana crua porque as features têm escalas muito diferentes
// (palavrasPorFrase ~15 vs exclamacoesPorFrase ~0.1) — sem normalizar, uma domina.
export function distanciaZ(textoPeca, textosAmostras) {
  const vPeca = vetorDeFeatures(textoPeca);
  const vAmostras = textosAmostras.map(vetorDeFeatures);
  const n = vAmostras.length;
  let soma = 0;
  for (let i = 0; i < CHAVES.length; i++) {
    const col = vAmostras.map((v) => v[i]);
    const media = col.reduce((a, b) => a + b, 0) / n;
    const varc = col.reduce((a, b) => a + (b - media) ** 2, 0) / n;
    const desvio = Math.sqrt(varc);
    // amostras idênticas nesta coordenada (desvio 0): sem variância pra normalizar.
    // z = 0 se a peça bate a média; senão penaliza pela diferença crua (fallback estável).
    const z = desvio < 1e-9 ? Math.abs(vPeca[i] - media) : (vPeca[i] - media) / desvio;
    soma += z * z;
  }
  return Math.sqrt(soma / CHAVES.length); // média das coordenadas → escala estável
}

// bandas calibradas pelos controles reais (11/07/2026): amostra do dono ~0.70,
// texto robótico de IA ~1.72, peças aprovadas 0.64–1.22. Ancorado, não chutado.
export function banda(d) {
  if (d < 0.9) return "perto";
  if (d < 1.6) return "médio";
  return "longe";
}

// --- carregar o banco de amostras ------------------------------------------------
export function extrairAmostraLimpa(md) {
  let t = md;
  t = t.replace(/^#.*$/gm, "");        // títulos
  t = t.replace(/^>.*$/gm, "");        // blockquotes (notas de uso)
  const corte = t.search(/\n---\n/);   // seção "o que NÃO é voz" e afins
  if (corte !== -1) t = t.slice(0, corte);
  t = t.replace(/\*\*[^*]+\*\*/g, ""); // rótulos em negrito
  return t.replace(/\n{2,}/g, "\n").trim();
}

function carregarAmostras() {
  return readdirSync(DIR_AMOSTRAS)
    .filter((f) => f.endsWith(".md"))
    .map((f) => extrairAmostraLimpa(readFileSync(join(DIR_AMOSTRAS, f), "utf8")))
    .filter((t) => t.length > 40);
}

// --- camada semântica OPCIONAL (só se o pacote existir) --------------------------
async function distanciaSemantica(textoPeca, textosAmostras) {
  let pipeline;
  try {
    ({ pipeline } = await import("@huggingface/transformers"));
  } catch {
    return null; // pacote não instalado → só features
  }
  const embed = await pipeline("feature-extraction", "Xenova/paraphrase-multilingual-MiniLM-L12-v2");
  const vec = async (t) => Array.from((await embed(t, { pooling: "mean", normalize: true })).data);
  const vPeca = await vec(textoPeca);
  const vAmostras = await Promise.all(textosAmostras.map(vec));
  const centroide = vPeca.map((_, i) => vAmostras.reduce((s, v) => s + v[i], 0) / vAmostras.length);
  // distância de cosseno ao centróide (0 = idêntico, 2 = oposto)
  const dot = vPeca.reduce((s, x, i) => s + x * centroide[i], 0);
  const normP = Math.hypot(...vPeca);
  const normC = Math.hypot(...centroide);
  return 1 - dot / (normP * normC);
}

// --- API principal ---------------------------------------------------------------
export async function distanciaVoz(textoPeca) {
  const amostras = carregarAmostras();
  const dFeat = distanciaZ(textoPeca, amostras);
  const dSem = await distanciaSemantica(textoPeca, amostras);
  return {
    distanciaFeatures: Number(dFeat.toFixed(3)),
    distanciaSemantica: dSem === null ? null : Number(dSem.toFixed(3)),
    banda: banda(dFeat),
    numAmostras: amostras.length,
    calibracao: amostras.length >= 25 ? "boa" : `fraca (${amostras.length}/25 amostras — número é orientação, não veredito)`,
    modoSemantico: dSem !== null,
  };
}

// --- CLI -------------------------------------------------------------------------
if (import.meta.main) {
  const args = process.argv.slice(2);
  const iAmostra = args.indexOf("--amostra");
  let texto;
  if (iAmostra !== -1) {
    texto = args[iAmostra + 1];
  } else {
    const arquivo = args.find((a) => !a.startsWith("--"));
    if (!arquivo) { console.error("ERRO: informe o arquivo (ou '-' pra stdin, ou --amostra \"texto\")."); process.exit(1); }
    const bruto = arquivo === "-" ? readFileSync(0, "utf8") : readFileSync(arquivo, "utf8");
    texto = args.includes("--html") || /\.html?$/i.test(arquivo) ? extrairTextoHtml(bruto)
      : args.includes("--legenda") || /legenda\.md$/i.test(arquivo) ? extrairLegendaPublicada(bruto)
      : bruto;
  }
  const r = await distanciaVoz(texto);
  if (args.includes("--json")) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log(`Distância de voz: ${r.banda.toUpperCase()} (features: ${r.distanciaFeatures})`);
    if (r.modoSemantico) console.log(`Camada semântica: ${r.distanciaSemantica}`);
    else console.log(`(só features — instale @huggingface/transformers pra ligar a camada semântica)`);
    console.log(`Calibração: ${r.calibracao}`);
  }
}
