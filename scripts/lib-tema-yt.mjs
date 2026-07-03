// lib-tema-yt.mjs — funções puras pro radar de tema de vídeo (/tema-yt). ZERO deps, sem
// rede: extração/agrupamento/pontuação de temas e parse do Trends. ImpulsoX AI.

// Stopwords de EMBALAGEM (não são o assunto) — removidas pra achar o tópico-núcleo.
const EMBALAGEM = new Set(["how", "to", "the", "a", "an", "your", "you", "my", "i", "this", "in", "of", "for", "with", "and"]);

// Título -> tópico-núcleo normalizado (minúsculas, sem embalagem, sem números soltos).
export function extrairTema(titulo) {
  return String(titulo)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")          // tira pontuação
    .split(/\s+/)
    .filter((w) => w && !EMBALAGEM.has(w) && !/^\d+$/.test(w)) // tira embalagem e números soltos
    .join(" ")
    .trim();
}

// "YYYYMMDD" (upload_date do yt-dlp) -> dias desde a publicação. Sem data ("NA"/vazio)
// -> null: rec­ência DESCONHECIDA vale 0 no score, nunca um valor fictício.
export function diasDesdeUploadDate(uploadDate, hoje = new Date()) {
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(String(uploadDate || "").trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.round((hoje.getTime() - d.getTime()) / 86400000));
}

// Mediana de uma lista de números (baseline pro outlier). Vazia -> 0.
export function medianaViews(nums) {
  const v = nums.filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (!v.length) return 0;
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
}

// Junta itens com o mesmo tema: conta criadores distintos, pega o mais recente, o maior
// view e o maior outlier (views ÷ mediana do canal — demanda de TEMA, não tamanho de canal).
export function agruparTemasRepetidos(itens) {
  const mapa = new Map();
  for (const it of itens) {
    const g = mapa.get(it.tema) || { tema: it.tema, criadores: new Set(), diasMin: Infinity, pilar: null, viewsMax: 0, outlierMax: null };
    g.criadores.add(it.criador);
    if (it.dias != null) g.diasMin = Math.min(g.diasMin, it.dias);
    g.viewsMax = Math.max(g.viewsMax, it.views || 0);
    if (it.outlier != null) g.outlierMax = Math.max(g.outlierMax ?? 0, it.outlier);
    if (it.pilar) g.pilar = it.pilar;
    mapa.set(it.tema, g);
  }
  return [...mapa.values()].map((g) => ({
    tema: g.tema, nCriadores: g.criadores.size,
    diasMin: g.diasMin === Infinity ? null : g.diasMin,
    pilar: g.pilar, viewsMax: g.viewsMax, outlierMax: g.outlierMax,
  }));
}

// Remove tema duplicado pela chave de texto (já normalizada por extrairTema).
export function dedup(temas) {
  const visto = new Set();
  return temas.filter((t) => (visto.has(t.tema) ? false : visto.add(t.tema)));
}

// Score transparente do tema. Recorrência pesa mais (demanda comprovada entre criadores).
// Recência: dias REAIS desde o upload; desconhecida (null) vale 0 — nunca inventar frescor.
// Demanda: OUTLIER (views ÷ mediana do canal — vídeo 4x acima da mediana = demanda de tema,
// padrão Galloway/1of10) quando disponível; views absoluto é só fallback (mede tamanho de
// canal, sinal fraco).
export function pontuarTema({ nCriadores, diasDesde, alinhaPilar, views = 0, outlier = null, trendsInteresse = 0 }) {
  const recorrencia = nCriadores * 3;
  const recencia = diasDesde == null ? 0 : Math.max(0, 14 - diasDesde);
  const pilar = alinhaPilar ? 5 : 0;
  const vw = outlier != null ? Math.min(5, outlier * 1.25) : Math.min(5, views / 50000);
  const tr = Math.min(5, trendsInteresse / 20);
  return recorrencia + recencia + pilar + vw + tr;
}

// Parse best-effort da resposta do Google Trends (related queries). A resposta vem com um
// prefixo lixo ")]}'" antes do JSON. Qualquer erro -> [] (a fonte nunca é crítica).
export function parseTrends(bruto) {
  try {
    const limpo = String(bruto).replace(/^\)\]\}'?\s*/, "");
    const j = JSON.parse(limpo);
    const lista = j?.default?.rankedList?.[0]?.rankedKeyword || [];
    return lista.map((k) => ({ termo: k.query, interesse: k.value })).filter((x) => x.termo);
  } catch {
    return [];
  }
}
