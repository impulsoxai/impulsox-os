import { test } from "node:test";
import assert from "node:assert/strict";
import { estimarCustoTTS } from "./gerar-tts.mjs";

test("estimarCustoTTS calcula ~$0.30 por 1000 chars", () => {
  assert.equal(estimarCustoTTS("a".repeat(1000)), 0.30);
  assert.equal(estimarCustoTTS("a".repeat(500)), 0.15);
});
test("estimarCustoTTS soma várias falas (array)", () => {
  assert.equal(estimarCustoTTS(["a".repeat(1000), "b".repeat(1000)]), 0.60);
});
test("estimarCustoTTS de texto vazio é 0", () => {
  assert.equal(estimarCustoTTS(""), 0);
  assert.equal(estimarCustoTTS([]), 0);
});
