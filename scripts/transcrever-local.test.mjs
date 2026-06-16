import { test } from "node:test";
import assert from "node:assert/strict";
import { parseWhisperJson } from "./transcrever-local.mjs";

test("parseWhisperJson extrai palavras com timestamp dos segments", () => {
  const obj = { segments: [
    { start: 0, end: 1, text: " oi pessoal", words: [
      { word: " oi", start: 0.0, end: 0.4 },
      { word: " pessoal", start: 0.4, end: 0.9 },
    ] },
  ] };
  assert.deepEqual(parseWhisperJson(obj), [
    { inicio: 0.0, fim: 0.4, texto: "oi" },
    { inicio: 0.4, fim: 0.9, texto: "pessoal" },
  ]);
});

test("parseWhisperJson cai pra blocos de segment quando não há words", () => {
  const obj = { segments: [{ start: 0, end: 2, text: " bloco unico " }] };
  assert.deepEqual(parseWhisperJson(obj), [{ inicio: 0, fim: 2, texto: "bloco unico" }]);
});

test("parseWhisperJson devolve [] sem segments", () => {
  assert.deepEqual(parseWhisperJson({}), []);
});
