import { test } from "node:test";
import assert from "node:assert/strict";
import { parsearTokens, mapearCores, primeiraFonte } from "./gerar-tema.mjs";

test("parsearTokens extrai custom properties --cor-* e --fonte-*", () => {
  const css = `:root {
    --cor-fundo: #06060d;
    --cor-primaria: #7c3aed;
    --fonte-display: 'Space Grotesk', sans-serif;
  }`;
  const t = parsearTokens(css);
  assert.equal(t["--cor-fundo"], "#06060d");
  assert.equal(t["--cor-primaria"], "#7c3aed");
  assert.equal(t["--fonte-display"], "'Space Grotesk', sans-serif");
});

test("mapearCores traduz tokens da marca pro objeto C do reel", () => {
  const tokens = {
    "--cor-fundo": "#000010",
    "--cor-primaria": "#112233",
    "--cor-primaria-prof": "#0a1520",
    "--cor-primaria-suave": "#445566",
    "--cor-acento": "#ffcc00",
    "--cor-acento-claro": "#ffe680",
    "--cor-texto": "#eeeeee",
    "--cor-texto-suave": "#999999",
    "--cor-texto-mudo": "#555555",
  };
  const c = mapearCores(tokens);
  assert.equal(c.fundo, "#000010");
  assert.equal(c.roxo, "#112233");
  assert.equal(c.dourado, "#ffcc00");
  assert.equal(c.douradoClaro, "#ffe680");
  assert.equal(c.textoMudo, "#555555");
});

test("mapearCores usa default quando token falta", () => {
  const c = mapearCores({ "--cor-fundo": "#123456" });
  assert.equal(c.fundo, "#123456");
  assert.equal(c.dourado, "#d4af37"); // default ImpulsoX preservado
});

test("primeiraFonte extrai o nome da família e cai no fallback", () => {
  assert.equal(primeiraFonte("'Space Grotesk', sans-serif", "X"), "Space Grotesk");
  assert.equal(primeiraFonte("", "Fallback"), "Fallback");
  assert.equal(primeiraFonte(undefined, "Fallback"), "Fallback");
});
