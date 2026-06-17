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

// Junta itens com o mesmo tema: conta criadores distintos, pega o mais recente e o maior view.
export function agruparTemasRepetidos(itens) {
  const mapa = new Map();
  for (const it of itens) {
    const g = mapa.get(it.tema) || { tema: it.tema, criadores: new Set(), diasMin: Infinity, pilar: null, viewsMax: 0 };
    g.criadores.add(it.criador);
    g.diasMin = Math.min(g.diasMin, it.dias);
    g.viewsMax = Math.max(g.viewsMax, it.views || 0);
    if (it.pilar) g.pilar = it.pilar;
    mapa.set(it.tema, g);
  }
  return [...mapa.values()].map((g) => ({
    tema: g.tema, nCriadores: g.criadores.size, diasMin: g.diasMin, pilar: g.pilar, viewsMax: g.viewsMax,
  }));
}

// Remove tema duplicado pela chave de texto (já normalizada por extrairTema).
export function dedup(temas) {
  const visto = new Set();
  return temas.filter((t) => (visto.has(t.tema) ? false : visto.add(t.tema)));
}

// Score transparente do tema. Recorrência pesa mais (demanda comprovada entre criadores).
export function pontuarTema({ nCriadores, diasDesde, alinhaPilar, views = 0, trendsInteresse = 0 }) {
  const recorrencia = nCriadores * 3;
  const recencia = Math.max(0, 14 - diasDesde);
  const pilar = alinhaPilar ? 5 : 0;
  const vw = Math.min(5, views / 50000);
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
