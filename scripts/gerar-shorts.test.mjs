import { test } from "node:test";
import assert from "node:assert/strict";
import { montarPlanoShorts } from "./gerar-shorts.mjs";

test("montarPlanoShorts lista os trechos com duração limitada a 30s", () => {
  const cortes = [
    { inicio: 252, fim: 288, razao: "frase forte" },
    { inicio: 600, fim: 650, razao: "número" },
  ];
  const p = montarPlanoShorts({ slug: "demo", cortes, reenquadre: "crop" });
  assert.equal(p.dry_run, true);
  assert.equal(p.reenquadre, "crop");
  assert.equal(p.shorts.length, 2);
  // 288-252=36 -> limitado a 30: fim vira 282, duracao 30
  assert.deepEqual(p.shorts[0], { n: 1, inicio: 252, fim: 282, duracao: 30, razao: "frase forte", saida: "canal-youtube/edicao/demo/shorts/short-1.mp4" });
  assert.equal(p.shorts[1].duracao, 30); // 650-600=50 -> limitado a 30
});
