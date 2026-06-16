import { test } from "node:test";
import assert from "node:assert/strict";
import { argsExtrairFrame, planoFal } from "./gerar-thumbnail.mjs";

test("argsExtrairFrame pega 1 frame no tempo dado", () => {
  assert.deepEqual(argsExtrairFrame("v.mp4", 3, "frame.png"), [
    "-y", "-ss", "3", "-i", "v.mp4", "-frames:v", "1", "frame.png",
  ]);
});

test("planoFal monta o preview sem chamar a Fal (só com --confirmar gera)", () => {
  const p = planoFal({ conceito: "terminal com brilho neon", slug: "demo" });
  assert.equal(p.dry_run, true);
  assert.match(p.prompt, /terminal com brilho neon/);
  assert.equal(p.saida, "canal-youtube/edicao/demo/thumb-fal.png");
});
