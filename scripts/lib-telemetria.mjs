// lib-telemetria.mjs — funções puras pra telemetria de cliques (Fase 3a). ZERO deps, sem
// rede, sem disco, sem uiohook: só transformam os eventos crus em JSON. ImpulsoX AI.

const clamp01 = (n) => Math.min(1, Math.max(0, n));

// Pixel absoluto -> fração 0–1 pela resolução da tela. Independe de resolução: um clique no
// centro é 0.5 seja a tela 1536x864 ou 4K. Tela inválida (0) -> 0 em vez de NaN.
export function normalizarClique({ x, y, tela }) {
  const largura = tela?.largura > 0 ? tela.largura : 0;
  const altura = tela?.altura > 0 ? tela.altura : 0;
  return {
    x: largura ? clamp01(x / largura) : 0,
    y: altura ? clamp01(y / altura) : 0,
  };
}
