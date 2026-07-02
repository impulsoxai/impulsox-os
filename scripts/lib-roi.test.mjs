import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularRoi, formatarBRL } from "./lib-roi.mjs";

test("calcularRoi: receita 30k, gasto 10k, 5 clientes novos", () => {
  const r = calcularRoi({ receita: 30000, gasto: 10000, clientesNovos: 5 });
  assert.equal(r.lucro, 20000);
  assert.equal(r.roi, 2);            // (30000-10000)/10000 = 2 (200%)
  assert.equal(r.roas, 3);           // 30000/10000
  assert.equal(r.cac, 2000);         // 10000/5
});

test("calcularRoi: gasto 0 → roi/roas/cac null (não divide por zero)", () => {
  const r = calcularRoi({ receita: 5000, gasto: 0, clientesNovos: 2 });
  assert.equal(r.lucro, 5000);
  assert.equal(r.roi, null);
  assert.equal(r.roas, null);
  assert.equal(r.cac, null);
});

test("calcularRoi: clientesNovos 0 → cac null", () => {
  const r = calcularRoi({ receita: 5000, gasto: 1000, clientesNovos: 0 });
  assert.equal(r.cac, null);
});

test("calcularRoi: gasto pendente (null) → marca pendente, sem inventar", () => {
  const r = calcularRoi({ receita: 8000, gasto: null, clientesNovos: 3 });
  assert.equal(r.receita, 8000);
  assert.equal(r.roi, null);
  assert.equal(r.gastoPendente, true);
});

// --- guardas de entrada suja: valor inválido GRITA, não vira null/0 silencioso ---

test("calcularRoi: gasto negativo → erro (não vira null silencioso)", () => {
  assert.throws(() => calcularRoi({ receita: 5000, gasto: -500 }), /gasto/i);
});

test("calcularRoi: clientesNovos negativo → erro", () => {
  assert.throws(() => calcularRoi({ receita: 5000, gasto: 1000, clientesNovos: -3 }), /clientes/i);
});

test("calcularRoi: receita não-numérica (NaN) → erro, não R$0 fingido", () => {
  assert.throws(() => calcularRoi({ receita: "abc", gasto: 1000 }), /receita/i);
});

test("calcularRoi: gasto não-numérico (NaN) → erro", () => {
  assert.throws(() => calcularRoi({ receita: 5000, gasto: "xyz" }), /gasto/i);
});

test("calcularRoi: gasto null segue pendente (não é erro — é ausência)", () => {
  const r = calcularRoi({ receita: 8000, gasto: null });
  assert.equal(r.gastoPendente, true);
  assert.equal(r.roi, null);
});

test("formatarBRL formata em real", () => {
  assert.equal(formatarBRL(2000), "R$ 2.000,00");
  assert.equal(formatarBRL(30000.5), "R$ 30.000,50");
});

test("formatarBRL: valor não-numérico → erro (não 'R$ NaN' no relatório)", () => {
  assert.throws(() => formatarBRL("abc"), /número|numero/i);
  assert.throws(() => formatarBRL(NaN), /número|numero/i);
});
