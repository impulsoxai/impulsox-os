// lib-desempenho.mjs — núcleo de análise de desempenho de canal social. Funções puras
// (cálculo determinístico; nunca de cabeça). Benchmarks 2026 das pesquisas. ImpulsoX AI.

// Benchmarks de referência (pesquisa 2026). YT: CTR compara com a média do próprio canal.
export const BENCH = {
  ig: { saveRateForte: 0.06, saveRateSolido: 0.03, saveRateFraco: 0.02, reachBom: 0.2, reachFraco: 0.1,
        swipeBom: 0.65, completionBom: 0.55 },
  yt: { ctrFraco: 0.03, ctrBom: 0.05, primeiroMinAlvo: 0.65 },
};

const taxa = (num, den) => (den > 0 ? num / den : 0);

// taxasInstagram — calcula as taxas que importam no IG 2026 (save/send/reach por reach/seguidores).
// IMPRESSIONS está morto em 2026: usar reach. shares = "sends". saved = saves. Pura.
export function taxasInstagram({ reach = 0, saved = 0, shares = 0, seguidores = 0, formato = null } = {}) {
  return {
    formato,
    saveRate: taxa(saved, reach),
    sendRate: taxa(shares, reach),
    reachRate: taxa(reach, seguidores),
  };
}
