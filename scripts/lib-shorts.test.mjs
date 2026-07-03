import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseTempo, acharCortesPorMarcador, limitarDuracao, limitar30s, recortarPalavras,
  filtroReenquadreCrop, filtroReenquadreSplit,
} from "./lib-shorts.mjs";

// --- Task 2 ---

test("parseTempo aceita m:ss e h:mm:ss", () => {
  assert.equal(parseTempo("0:15"), 15);
  assert.equal(parseTempo("4:12"), 252);
  assert.equal(parseTempo("1:02:03"), 3723);
});

test("acharCortesPorMarcador extrai inicio/fim/razao das linhas [CORTE-SHORT]", () => {
  const roteiro = `texto
[CORTE-SHORT: 04:12-04:48 — a frase mais forte]
mais texto
[CORTE-SHORT: 10:00-10:25 — o número que choca]`;
  assert.deepEqual(acharCortesPorMarcador(roteiro), [
    { inicio: 252, fim: 288, razao: "a frase mais forte" },
    { inicio: 600, fim: 625, razao: "o número que choca" },
  ]);
});

test("acharCortesPorMarcador devolve [] sem marcador", () => {
  assert.deepEqual(acharCortesPorMarcador("roteiro sem corte"), []);
});

// --- Task 3 ---

test("limitarDuracao mantém trecho dentro do teto (default 60s) sem truncar", () => {
  assert.deepEqual(limitarDuracao({ inicio: 252, fim: 288 }), { inicio: 252, fim: 288, truncado: false });
});

test("limitarDuracao trunca no teto e marca truncado (corte seco sem palavras)", () => {
  assert.deepEqual(limitarDuracao({ inicio: 10, fim: 90 }), { inicio: 10, fim: 70, truncado: true });
});

test("limitarDuracao recua o corte pro fim da FRASE mais próxima dentro do teto", () => {
  const palavras = [
    { inicio: 12, fim: 13, texto: "olha" },
    { inicio: 40, fim: 41.2, texto: "resultado." },   // fim de frase aos 41.2
    { inicio: 55, fim: 56, texto: "depois" },          // palavra inteira sem pontuação
    { inicio: 72, fim: 73, texto: "tarde." },          // fora do teto (10+60=70)
  ];
  assert.deepEqual(limitarDuracao({ inicio: 10, fim: 90 }, { palavras }), { inicio: 10, fim: 41.2, truncado: true });
});

test("limitarDuracao sem fim de frase no alcance recua pra última palavra inteira", () => {
  const palavras = [
    { inicio: 12, fim: 13, texto: "sem" },
    { inicio: 55, fim: 56.5, texto: "pontuacao" },
  ];
  assert.deepEqual(limitarDuracao({ inicio: 10, fim: 90 }, { palavras }), { inicio: 10, fim: 56.5, truncado: true });
});

test("limitarDuracao aceita teto custom", () => {
  assert.deepEqual(limitarDuracao({ inicio: 0, fim: 120 }, { teto: 90 }), { inicio: 0, fim: 90, truncado: true });
});

test("limitar30s (compat) corta em 30s e mantém os curtos", () => {
  assert.deepEqual(limitar30s({ inicio: 10, fim: 50 }), { inicio: 10, fim: 40, truncado: true });
  assert.deepEqual(limitar30s({ inicio: 10, fim: 25 }), { inicio: 10, fim: 25, truncado: false });
});

test("recortarPalavras filtra a janela e rebaseia o timestamp pra zero", () => {
  const palavras = [
    { inicio: 0, fim: 1, texto: "fora" },
    { inicio: 10.0, fim: 10.4, texto: "ola" },
    { inicio: 10.4, fim: 10.9, texto: "mundo" },
    { inicio: 40, fim: 41, texto: "depois" },
  ];
  assert.deepEqual(recortarPalavras(palavras, 10, 11), [
    { inicio: 0, fim: 0.4, texto: "ola" },
    { inicio: 0.4, fim: 0.9, texto: "mundo" },
  ]);
});

// --- Task 4 ---

test("filtroReenquadreCrop escala cobrindo a altura e corta o centro 9:16", () => {
  assert.equal(
    filtroReenquadreCrop({ alvoLargura: 1080, alvoAltura: 1920 }),
    "scale=-2:1920,crop=1080:1920"
  );
});

test("filtroReenquadreSplit põe o vídeo no topo sobre fundo da marca 9:16", () => {
  assert.equal(
    filtroReenquadreSplit({ alvoLargura: 1080, alvoAltura: 1920, fundoCor: "0x06060D" }),
    "scale=1080:-2[vid];color=c=0x06060D:s=1080x1920[bg];[bg][vid]overlay=0:0"
  );
});
