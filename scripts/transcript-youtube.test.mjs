import { test } from "node:test";
import assert from "node:assert/strict";
import { extrairVideoId } from "./transcript-youtube.mjs";

test("extrairVideoId reconhece URL completa, youtu.be, shorts e videoId puro", () => {
  assert.equal(extrairVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extrairVideoId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extrairVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extrairVideoId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});

test("extrairVideoId devolve null pra entrada não reconhecida", () => {
  assert.equal(extrairVideoId("https://exemplo.com/pagina"), null);
});
