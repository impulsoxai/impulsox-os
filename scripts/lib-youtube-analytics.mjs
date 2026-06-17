// lib-youtube-analytics.mjs — funções puras pra Fase 3.5 (métricas/validação de fórmula).
// ZERO deps, sem rede. Critério da pesquisa 2026: retenção é o sinal #1 do algoritmo. ImpulsoX AI.

// Benchmark "bom" de averageViewPercentage por formato/faixa (pesquisa 2026).
export function benchmarkRetencao({ ehShort, duracaoSeg }) {
  if (ehShort) return 70;
  if (duracaoSeg < 300) return 70;   // <5min
  if (duracaoSeg < 600) return 55;   // 5-10min
  if (duracaoSeg < 900) return 45;   // 10-15min
  return 40;                          // 15min+
}

// Veredito da fórmula pela retenção. Régua relativa: a média do canal (quando há histórico)
// sobrepõe o benchmark global. Acima -> validada; abaixo + já reprovou antes -> nao funciona.
export function avaliarFormula({ averageViewPercentage, benchmark, mediaCanal = null, reprovacoesAnteriores = 0 }) {
  const alvo = mediaCanal != null ? mediaCanal : benchmark;
  if (averageViewPercentage >= alvo) return "validada";
  if (averageViewPercentage < benchmark && reprovacoesAnteriores >= 1) return "nao funciona";
  return "a testar";
}

// Params do reports.query da Analytics API. SEM dimensão liveOrOnDemand (incompatível com
// averageViewPercentage, conforme a doc). channel==MINE = o canal do dono autenticado.
export function montarQueryAnalytics({ videoId, dataInicio, dataFim }) {
  return {
    ids: "channel==MINE",
    startDate: dataInicio,
    endDate: dataFim,
    metrics: "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained",
    filters: `video==${videoId}`,
  };
}

// Dias inteiros entre a publicação e agora.
export function diasDesdePublicacao(dataISO, agora = new Date()) {
  const ms = agora.getTime() - new Date(dataISO).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// Converte "m:ss" / "h:mm:ss" / "123" (segundos) em segundos.
function paraSegundos(txt) {
  if (/:/.test(txt)) return txt.split(":").map(Number).reduce((a, n) => a * 60 + n, 0);
  return Number(txt);
}

// Extrai métricas de um bloco colado do YouTube Studio (rótulos PT/EN tolerados). Campo
// ausente = null. Aceita números com ponto/vírgula de milhar e % na retenção.
export function parseMetricasManual(texto) {
  const t = String(texto);
  const num = (re) => { const m = t.match(re); return m ? Number(m[1].replace(/[.,](?=\d{3}\b)/g, "")) : null; };
  const dur = (re) => { const m = t.match(re); return m ? paraSegundos(m[1]) : null; };
  return {
    views: num(/(?:Visualiza[çc][õo]es|views)[:\s]+([\d.,]+)/i),
    averageViewPercentage: num(/(?:Porcentagem m[ée]dia assistida|average view percentage|retention)[:\s]+([\d.,]+)\s*%/i),
    averageViewDuration: dur(/(?:Dura[çc][ãa]o m[ée]dia[^:]*|average view duration)[:\s]+([\d:]+)/i),
    subscribersGained: num(/(?:Inscritos ganhos|subscribers gained)[:\s]+([\d.,]+)/i),
  };
}
