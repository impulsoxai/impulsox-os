// lib-zoom.mjs — cérebro do zoom (Fase 3b), clean-room. Funções puras: cliques -> regiões
// de zoom. ZERO deps, sem vídeo, sem disco. Algoritmo nosso (ideias do Recordly
// reimplementadas, nenhum código copiado). ImpulsoX AI.

export const GAP_MS = 2500;
export const PAD_INICIO_S = 0.5;
export const PAD_FIM_S = 0.8;
export const TABELA_FORCA = { double: 2.0, right: 1.8, left: 1.5 };

// Agrupa cliques (ordenados por t) em clusters: gap <= gapMs fica junto; pausa maior abre
// um novo cluster. Cada cluster é um array de cliques.
export function agruparClusters(cliques, { gapMs = GAP_MS } = {}) {
  if (!cliques || cliques.length === 0) return [];
  const ordenados = [...cliques].sort((a, b) => a.t - b.t);
  const clusters = [[ordenados[0]]];
  for (let i = 1; i < ordenados.length; i++) {
    const anterior = ordenados[i - 1];
    const atual = ordenados[i];
    if (atual.t - anterior.t <= gapMs) clusters[clusters.length - 1].push(atual);
    else clusters.push([atual]);
  }
  return clusters;
}
