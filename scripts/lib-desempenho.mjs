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

// pisoAVD — % de retenção considerado "bom" pela duração (pesquisa 2026). Devolve o piso da faixa.
function pisoAVD({ duracaoSeg, ehShort }) {
  if (ehShort) return 0.70;            // Shorts: 70%+
  if (duracaoSeg < 300) return 0.50;   // <5min: 50-70%
  if (duracaoSeg < 900) return 0.40;   // 5-15min: 40-55%
  if (duracaoSeg < 1800) return 0.30;  // 15-30min: 30-45%
  return 0.25;                          // >30min
}

// taxasYouTube — classifica as métricas YT 2026: AVD vs faixa de duração, CTR vs a MÉDIA do próprio
// canal (benchmark fixo engana — CTR cai com impressões), retenção do 1º minuto, watch time. Pura.
export function taxasYouTube({ avdPercent = 0, duracaoSeg = 0, ehShort = false, ctr = null, mediaCanalCtr = null, retencao1min = null, watchTimeMin = null } = {}) {
  const piso = pisoAVD({ duracaoSeg, ehShort });
  return {
    ehShort,
    avdPercent,
    avdBom: avdPercent >= piso,
    pisoAVD: piso,
    ctr,
    ctrVsCanal: (ctr != null && mediaCanalCtr != null) ? (ctr >= mediaCanalCtr ? "acima" : "abaixo") : null,
    primeiroMinBom: retencao1min != null ? retencao1min >= BENCH.yt.primeiroMinAlvo : null,
    retencao1min,
    watchTimeMin,
  };
}
