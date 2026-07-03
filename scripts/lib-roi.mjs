// lib-roi.mjs — cálculo de ROI (dinheiro só por script, nunca de cabeça — regra da casa).
// Recebe receita (do CRM) + gasto (do /analisar-ads) + clientes novos; devolve as métricas.
// Divisão por zero → null (marca pendente), nunca inventa.

// número finito e >= 0, senão grita (entrada suja não vira null/0 silencioso — regra da casa).
// gasto/clientes null/undefined é AUSÊNCIA (tratada como pendente antes), não passa aqui.
function exigirNaoNegativo(v, nome) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${nome} inválido: ${JSON.stringify(v)} (precisa ser número >= 0)`);
  }
  return n;
}

// { receita, gasto, clientesNovos } → { receita, gasto, lucro, roi, roas, cac, gastoPendente }
export function calcularRoi({ receita = 0, gasto, clientesNovos = 0 }) {
  const gastoPendente = gasto === null || gasto === undefined;
  const rec = exigirNaoNegativo(receita, "receita");        // NaN/negativo → erro, não R$0 fingido
  const g = gastoPendente ? 0 : exigirNaoNegativo(gasto, "gasto");
  const cli = exigirNaoNegativo(clientesNovos, "clientesNovos");
  const lucro = gastoPendente ? rec : rec - g;
  const podeDiv = !gastoPendente && g > 0;
  return {
    receita: rec,
    gasto: gastoPendente ? null : g,
    lucro,
    roi: podeDiv ? (rec - g) / g : null,          // (receita - gasto) / gasto
    roas: podeDiv ? rec / g : null,                // receita / gasto
    cac: podeDiv && cli > 0 ? g / cli : null,
    gastoPendente,
  };
}

// recortarJanela — casa a JANELA da receita com a do gasto (ROI de janelas descasadas é
// número errado com nota de rodapé). receitaPorMes/dealsPorMes = objetos {"2026-05": n}
// como o CRM devolve; mesesDoGasto = ["2026-05","2026-06"]. Devolve as somas SÓ desses
// meses + o que faltou (mês do gasto sem dado de receita vira pendência declarada).
export function recortarJanela({ receitaPorMes = {}, dealsPorMes = {}, mesesDoGasto = [] }) {
  if (!Array.isArray(mesesDoGasto) || mesesDoGasto.length === 0) {
    throw new Error("recortarJanela: mesesDoGasto vazio — sem janela não há recorte.");
  }
  let receita = 0, clientesNovos = 0;
  const mesesSemDado = [];
  for (const mes of mesesDoGasto) {
    if (receitaPorMes[mes] === undefined && dealsPorMes[mes] === undefined) { mesesSemDado.push(mes); continue; }
    receita += exigirNaoNegativo(receitaPorMes[mes] ?? 0, `receitaPorMes[${mes}]`);
    clientesNovos += exigirNaoNegativo(dealsPorMes[mes] ?? 0, `dealsPorMes[${mes}]`);
  }
  return { receita, clientesNovos, meses: mesesDoGasto, mesesSemDado };
}

// formata número em BRL (pra exibir no relatório). Valor inválido grita — nunca "R$ NaN" pro cliente.
export function formatarBRL(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`formatarBRL: valor não é número: ${JSON.stringify(v)}`);
  return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
