// lib-roi.mjs — cálculo de ROI (dinheiro só por script, nunca de cabeça — regra da casa).
// Recebe receita (do CRM) + gasto (do /analisar-ads) + clientes novos; devolve as métricas.
// Divisão por zero → null (marca pendente), nunca inventa.

// { receita, gasto, clientesNovos } → { receita, gasto, lucro, roi, roas, cac, gastoPendente }
export function calcularRoi({ receita = 0, gasto, clientesNovos = 0 }) {
  const gastoPendente = gasto === null || gasto === undefined;
  const g = gastoPendente ? 0 : Number(gasto);
  const rec = Number(receita) || 0;
  const lucro = gastoPendente ? rec : rec - g;
  const podeDiv = !gastoPendente && g > 0;
  return {
    receita: rec,
    gasto: gastoPendente ? null : g,
    lucro,
    roi: podeDiv ? (rec - g) / g : null,          // (receita - gasto) / gasto
    roas: podeDiv ? rec / g : null,                // receita / gasto
    cac: podeDiv && clientesNovos > 0 ? g / clientesNovos : null,
    gastoPendente,
  };
}

// formata número em BRL (pra exibir no relatório)
export function formatarBRL(v) {
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
