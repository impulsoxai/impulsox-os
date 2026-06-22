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

// detectarCurva — analisa a série de retenção (% por momento) e acha: intro dip (perda >40% nos
// primeiros 30s = hook fraco), cliffs (queda >15% entre dois pontos = corte/tangente), spikes
// (subida = re-watch). Série = [{tSeg, retencao}] ordenada. null quando não há série (modo colar
// sem curva). Pura. Thresholds da pesquisa 2026.
export function detectarCurva(serie, { duracaoSeg = 0 } = {}) {
  if (!serie || serie.length < 2) return null;
  const s = [...serie].sort((a, b) => a.tSeg - b.tSeg);
  const ini = s[0].retencao;
  const aos30 = (s.find((p) => p.tSeg >= 30) || s[s.length - 1]).retencao;
  const introDip = ini > 0 && (ini - aos30) / ini > 0.40;
  // cliffs/spikes a partir do 2º intervalo: a queda inicial (0→30s) é o intro dip, não um cliff
  // do meio. Cliff = queda abrupta DEPOIS da abertura.
  const cliffs = [];
  const spikes = [];
  for (let i = 2; i < s.length; i++) {
    const delta = s[i].retencao - s[i - 1].retencao;
    if (delta < -0.15) cliffs.push({ tSeg: s[i].tSeg, queda: Math.round(-delta * 100) / 100 });
    if (delta > 0.02) spikes.push({ tSeg: s[i].tSeg, subida: Math.round(delta * 100) / 100 });
  }
  return { introDip, cliffs, spikes };
}

// diagnosticarYouTube — cruza taxas + curva e devolve a lista de consertos, cada um apontando a
// SKILL que resolve. Pura. (regras da pesquisa: AVD+intro dip=hook; CTR abaixo+AVD bom=thumb; cliff=edição.)
export function diagnosticarYouTube({ taxas = {}, curva = null } = {}) {
  const out = [];
  const introDip = curva?.introDip;
  if (taxas.avdBom === false && introDip) out.push({ skill: "/roteiro-yt", motivo: "hook fraco: retenção despenca nos primeiros 30s — reescrever a abertura (hook + intro=thumbnail)." });
  else if (taxas.avdBom === false) out.push({ skill: "/editar-video", motivo: "retenção média baixa sem queda única: pacing lento — apertar a edição (cortar trechos chatos)." });
  if (taxas.ctrVsCanal === "abaixo" && taxas.avdBom === true) out.push({ skill: "/thumbnail", motivo: "CTR abaixo da média do canal, mas quem assiste fica: o problema é a capa/título — testar 15-20 títulos e nova thumbnail." });
  if (curva?.cliffs?.length) out.push({ skill: "/editar-video", motivo: `queda abrupta em ${curva.cliffs.map((c) => c.tSeg + "s").join(", ")}: corte/tangente — apertar ou cortar esse trecho.` });
  return out;
}

// diagnosticarInstagram — régua IG 2026 (save/send/reach) → consertos apontando a skill. Pura.
export function diagnosticarInstagram({ saveRate = 0, sendRate = 0, reachRate = 0 } = {}) {
  const out = [];
  if (saveRate < BENCH.ig.saveRateFraco) out.push({ skill: "/post", motivo: "save rate baixo: a peça não deu nada pra guardar — incluir um slide-resumo guardável (\"salva isto\")." });
  if (sendRate < 0.005) out.push({ skill: "/post", motivo: "quase ninguém enviou: o conteúdo não ficou relatável — adicionar um gancho de envio (\"manda pra quem precisa ver\")." });
  if (reachRate < BENCH.ig.reachFraco) out.push({ skill: "/reel-marca", motivo: "alcance baixo: testar reel (mais alcance que carrossel) e refazer o hook dos 3s." });
  return out;
}
