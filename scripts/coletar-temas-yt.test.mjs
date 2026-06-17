import { test } from "node:test";
import assert from "node:assert/strict";
import { rankearTemas } from "./coletar-temas-yt.mjs";

test("rankearTemas: extrai, agrupa, pontua e ordena por score desc", () => {
  const itensBrutos = [
    { titulo: "How to use Claude Code memory", criador: "Chase", dias: 2, views: 100000, pilar: "Ensinar" },
    { titulo: "Claude Code Memory explained", criador: "Sabrina", dias: 5, views: 50000, pilar: "Ensinar" },
    { titulo: "Receita de bolo", criador: "Outro", dias: 1, views: 1000, pilar: null },
  ];
  const r = rankearTemas(itensBrutos);
  // "claude code memory" tocado por 2 criadores -> score alto, vem primeiro
  assert.match(r[0].tema, /claude code/);
  assert.ok(r[0].score > r[r.length - 1].score);
  assert.equal(typeof r[0].score, "number");
});
