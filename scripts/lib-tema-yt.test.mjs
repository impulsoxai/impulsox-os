import { test } from "node:test";
import assert from "node:assert/strict";
import { extrairTema, agruparTemasRepetidos, dedup, pontuarTema, parseTrends, diasDesdeUploadDate, medianaViews } from "./lib-tema-yt.mjs";

// --- Task 1: extrairTema ---

test("extrairTema remove embalagem (how to, números, the) e mantém o assunto", () => {
  assert.equal(extrairTema("How to use Claude Code in VSCode"), "use claude code vscode");
  assert.equal(extrairTema("9 AI Skills You MUST Have to Become Rich"), "ai skills must have become rich");
  assert.equal(extrairTema("The Laziest Way to Make Money with Claude"), "laziest way make money claude");
});

test("extrairTema normaliza espaços e caixa", () => {
  assert.equal(extrairTema("  Claude   CODE  Memory  "), "claude code memory");
});

// --- Task 2: agruparTemasRepetidos + dedup ---

test("agruparTemasRepetidos junta tema igual, conta criadores e agrega outlier", () => {
  const itens = [
    { tema: "claude code memory", criador: "Chase", dias: 2, pilar: "Ensinar", views: 100000, outlier: 4.2 },
    { tema: "claude code memory", criador: "Sabrina", dias: 5, pilar: "Ensinar", views: 50000, outlier: 1.1 },
    { tema: "faceless video", criador: "Sabrina", dias: 1, pilar: null, views: 20000 },
  ];
  assert.deepEqual(agruparTemasRepetidos(itens), [
    { tema: "claude code memory", nCriadores: 2, diasMin: 2, pilar: "Ensinar", viewsMax: 100000, outlierMax: 4.2 },
    { tema: "faceless video", nCriadores: 1, diasMin: 1, pilar: null, viewsMax: 20000, outlierMax: null },
  ]);
});

test("agruparTemasRepetidos: dias desconhecido (null) não vira número — diasMin sai null", () => {
  const itens = [{ tema: "x", criador: "A", dias: null, pilar: null, views: 10 }];
  assert.equal(agruparTemasRepetidos(itens)[0].diasMin, null);
});

test("dedup remove tema repetido (mesma chave normalizada)", () => {
  const temas = [{ tema: "claude code" }, { tema: "claude code" }, { tema: "ai agents" }];
  assert.deepEqual(dedup(temas).map((t) => t.tema), ["claude code", "ai agents"]);
});

// --- Task 3: pontuarTema ---

test("pontuarTema soma recorrência, recência, pilar, views e trends", () => {
  // nCriadores 2 ->6; diasDesde 4 -> max(0,14-4)=10; alinhaPilar true ->5;
  // views 100000 -> min(5,100000/50000)=2; trends 40 -> min(5,40/20)=2. Total 25.
  assert.equal(pontuarTema({ nCriadores: 2, diasDesde: 4, alinhaPilar: true, views: 100000, trendsInteresse: 40 }), 25);
});

test("pontuarTema: outlier substitui views quando presente (demanda de tema)", () => {
  // nCriadores 1 ->3; dias 4 ->10; pilar false ->0; outlier 2 -> min(5, 2*1.25)=2.5. Total 15.5.
  assert.equal(pontuarTema({ nCriadores: 1, diasDesde: 4, alinhaPilar: false, views: 999999, outlier: 2 }), 15.5);
  // outlier 10x satura no teto 5
  assert.equal(pontuarTema({ nCriadores: 0, diasDesde: 14, alinhaPilar: false, outlier: 10 }), 5);
});

test("pontuarTema: recência desconhecida (null) vale 0 — nunca frescor fictício", () => {
  // nCriadores 1 ->3; diasDesde null ->0; resto 0. Total 3.
  assert.equal(pontuarTema({ nCriadores: 1, diasDesde: null, alinhaPilar: false }), 3);
});

test("pontuarTema sem trends nem pilar nem views", () => {
  // nCriadores 1 ->3; diasDesde 14 ->0; pilar false ->0; views 0 ->0; trends 0 ->0. Total 3.
  assert.equal(pontuarTema({ nCriadores: 1, diasDesde: 14, alinhaPilar: false, views: 0 }), 3);
});

test("pontuarTema satura views e trends no teto 5", () => {
  // nCriadores 0 ->0; dias 14 ->0; pilar false ->0; views 999999 ->5; trends 999 ->5. Total 10.
  assert.equal(pontuarTema({ nCriadores: 0, diasDesde: 14, alinhaPilar: false, views: 999999, trendsInteresse: 999 }), 10);
});

// --- diasDesdeUploadDate + medianaViews ---

test("diasDesdeUploadDate converte YYYYMMDD em dias reais", () => {
  const hoje = new Date(Date.UTC(2026, 6, 3)); // 2026-07-03
  assert.equal(diasDesdeUploadDate("20260701", hoje), 2);
  assert.equal(diasDesdeUploadDate("20260103", hoje), 181);
});

test("diasDesdeUploadDate devolve null pra NA/vazio/inválido", () => {
  assert.equal(diasDesdeUploadDate("NA"), null);
  assert.equal(diasDesdeUploadDate(""), null);
  assert.equal(diasDesdeUploadDate(undefined), null);
});

test("medianaViews calcula mediana ignorando zeros/inválidos", () => {
  assert.equal(medianaViews([100, 300, 200]), 200);
  assert.equal(medianaViews([100, 200, 300, 400]), 250);
  assert.equal(medianaViews([0, 100]), 100);
  assert.equal(medianaViews([]), 0);
});

// --- Task 4: parseTrends ---

test("parseTrends remove o prefixo )]}' e extrai termos+interesse", () => {
  const bruto = `)]}'\n{"default":{"rankedList":[{"rankedKeyword":[{"query":"claude code","value":80},{"query":"ai agents","value":40}]}]}}`;
  assert.deepEqual(parseTrends(bruto), [
    { termo: "claude code", interesse: 80 },
    { termo: "ai agents", interesse: 40 },
  ]);
});

test("parseTrends devolve [] pra resposta inválida (best-effort)", () => {
  assert.deepEqual(parseTrends("bloqueado pelo google"), []);
});
