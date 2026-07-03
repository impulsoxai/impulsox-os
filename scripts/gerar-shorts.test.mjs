import { test } from "node:test";
import assert from "node:assert/strict";
import { montarPlanoShorts } from "./gerar-shorts.mjs";

test("montarPlanoShorts mantém trechos dentro do teto (60s default) sem truncar", () => {
  const cortes = [
    { inicio: 252, fim: 288, razao: "frase forte" },  // 36s — válido, passa inteiro
    { inicio: 600, fim: 650, razao: "número" },        // 50s — válido
  ];
  const p = montarPlanoShorts({ slug: "demo", cortes, reenquadre: "crop" });
  assert.equal(p.dry_run, true);
  assert.equal(p.reenquadre, "crop");
  assert.equal(p.teto, 60);
  assert.equal(p.shorts.length, 2);
  assert.deepEqual(p.shorts[0], { n: 1, inicio: 252, fim: 288, duracao: 36, razao: "frase forte", saida: "canal-youtube/edicao/demo/shorts/short-1.mp4" });
  assert.equal(p.shorts[1].duracao, 50);
});

test("montarPlanoShorts trunca acima do teto COM AVISO (nunca em silêncio)", () => {
  const cortes = [{ inicio: 100, fim: 200, razao: "longo demais" }]; // 100s > 60s
  const p = montarPlanoShorts({ slug: "demo", cortes, reenquadre: "crop" });
  assert.equal(p.shorts[0].fim, 160);
  assert.equal(p.shorts[0].duracao, 60);
  assert.match(p.shorts[0].aviso, /truncado no teto de 60s/);
});

test("montarPlanoShorts com palavras recua o corte truncado pro fim da frase", () => {
  const cortes = [{ inicio: 100, fim: 200, razao: "longo" }];
  const palavras = [
    { inicio: 110, fim: 111, texto: "meio" },
    { inicio: 150, fim: 151.5, texto: "ponto." },  // fim de frase antes do teto (160)
    { inicio: 158, fim: 159, texto: "solta" },
  ];
  const p = montarPlanoShorts({ slug: "demo", cortes, reenquadre: "crop", palavras });
  assert.equal(p.shorts[0].fim, 151.5);
  assert.match(p.shorts[0].aviso, /fim da frase/);
});

test("montarPlanoShorts aceita teto custom", () => {
  const cortes = [{ inicio: 0, fim: 100, razao: "x" }];
  const p = montarPlanoShorts({ slug: "demo", cortes, reenquadre: "crop", teto: 90 });
  assert.equal(p.teto, 90);
  assert.equal(p.shorts[0].duracao, 90);
});
