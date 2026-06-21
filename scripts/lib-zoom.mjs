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

// Foco do zoom = centroide (média x,y) dos cliques do cluster.
export function focoCentroide(cluster) {
  const n = cluster.length || 1;
  const somaX = cluster.reduce((s, c) => s + c.x, 0);
  const somaY = cluster.reduce((s, c) => s + c.y, 0);
  return { x: somaX / n, y: somaY / n };
}

// Nível de zoom = força do clique mais forte do cluster (double > right > left).
// Tipo desconhecido cai no nível de left (mínimo).
export function nivelPorForca(cluster, { tabela = TABELA_FORCA } = {}) {
  let nivel = tabela.left;
  for (const c of cluster) {
    const n = tabela[c.tipo];
    if (typeof n === "number" && n > nivel) nivel = n;
  }
  return nivel;
}

// Funde regiões cujos intervalos se sobrepõem ou se tocam. A fundida vai do menor início ao
// maior fim; foco e nível vêm da região de MAIOR nível (clique mais forte manda).
function fundirSobreposicao(regioes) {
  if (regioes.length === 0) return [];
  const ord = [...regioes].sort((a, b) => a.inicio - b.inicio);
  const out = [ord[0]];
  for (let i = 1; i < ord.length; i++) {
    const ult = out[out.length - 1];
    const r = ord[i];
    if (r.inicio <= ult.fim) {
      const forte = r.nivel > ult.nivel ? r : ult;
      out[out.length - 1] = {
        inicio: ult.inicio,
        fim: Math.max(ult.fim, r.fim),
        foco: forte.foco,
        nivel: forte.nivel,
      };
    } else {
      out.push(r);
    }
  }
  return out;
}

// Telemetria -> regiões de zoom. Cada cluster vira uma região: foco=centroide, nível=força,
// [inicio,fim] em SEGUNDOS com padding (início clampado em 0). Sobreposições são fundidas.
export function montarRegioesZoom(telemetria, {
  gapMs = GAP_MS, padInicioS = PAD_INICIO_S, padFimS = PAD_FIM_S, tabela = TABELA_FORCA,
} = {}) {
  const cliques = telemetria?.cliques || [];
  const clusters = agruparClusters(cliques, { gapMs });
  const regioes = clusters.map((cluster) => {
    const primeiro = cluster[0].t / 1000;
    const ultimo = cluster[cluster.length - 1].t / 1000;
    return {
      inicio: Math.max(0, primeiro - padInicioS),
      fim: ultimo + padFimS,
      foco: focoCentroide(cluster),
      nivel: nivelPorForca(cluster, { tabela }),
    };
  });
  return { regioes: fundirSobreposicao(regioes) };
}
