import { test } from "node:test";
import assert from "node:assert/strict";
import { extrairTema, agruparTemasRepetidos, dedup, pontuarTema, parseTrends } from "./lib-tema-yt.mjs";

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

test("agruparTemasRepetidos junta tema igual e conta criadores distintos", () => {
  const itens = [
    { tema: "claude code memory", criador: "Chase", dias: 2, pilar: "Ensinar", views: 100000 },
    { tema: "claude code memory", criador: "Sabrina", dias: 5, pilar: "Ensinar", views: 50000 },
    { tema: "faceless video", criador: "Sabrina", dias: 1, pilar: null, views: 20000 },
  ];
  assert.deepEqual(agruparTemasRepetidos(itens), [
    { tema: "claude code memory", nCriadores: 2, diasMin: 2, pilar: "Ensinar", viewsMax: 100000 },
    { tema: "faceless video", nCriadores: 1, diasMin: 1, pilar: null, viewsMax: 20000 },
  ]);
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

test("pontuarTema sem trends nem pilar nem views", () => {
  // nCriadores 1 ->3; diasDesde 14 ->0; pilar false ->0; views 0 ->0; trends 0 ->0. Total 3.
  assert.equal(pontuarTema({ nCriadores: 1, diasDesde: 14, alinhaPilar: false, views: 0 }), 3);
});

test("pontuarTema satura views e trends no teto 5", () => {
  // nCriadores 0 ->0; dias 14 ->0; pilar false ->0; views 999999 ->5; trends 999 ->5. Total 10.
  assert.equal(pontuarTema({ nCriadores: 0, diasDesde: 14, alinhaPilar: false, views: 999999, trendsInteresse: 999 }), 10);
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
