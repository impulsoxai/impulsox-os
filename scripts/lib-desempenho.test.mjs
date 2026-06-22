import { test } from "node:test";
import assert from "node:assert/strict";
import { taxasInstagram } from "./lib-desempenho.mjs";

test("taxasInstagram calcula save/send/reach rate", () => {
  const t = taxasInstagram({ reach: 1000, saved: 50, shares: 30, seguidores: 5000, formato: "carrossel" });
  assert.equal(t.saveRate, 0.05);   // 50/1000
  assert.equal(t.sendRate, 0.03);   // 30/1000
  assert.equal(t.reachRate, 0.2);   // 1000/5000
});
test("taxasInstagram ignora reach 0 (não divide por zero)", () => {
  const t = taxasInstagram({ reach: 0, saved: 5, shares: 1, seguidores: 100 });
  assert.equal(t.saveRate, 0);
  assert.equal(t.sendRate, 0);
});
