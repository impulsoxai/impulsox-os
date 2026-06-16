import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectarMidia, lerLegenda } from "./publicar-instagram.mjs";

function peca(arquivos, legenda = "Legenda real do post.") {
  const dir = mkdtempSync(join(tmpdir(), "peca-"));
  for (const a of arquivos) writeFileSync(join(dir, a), "DATA");
  if (legenda !== null) writeFileSync(join(dir, "legenda.md"), legenda);
  return dir;
}

test("detectarMidia: carrossel ordena os slide-*.png", () => {
  const dir = peca(["slide-02.png", "slide-01.png", "slide-03.png", "legenda.md"]);
  const m = detectarMidia(dir, "carrossel");
  assert.equal(m.length, 3);
  assert.match(m[0], /slide-01\.png$/);
  assert.match(m[2], /slide-03\.png$/);
});

test("detectarMidia: carrossel com 1 slide lança (precisa 2-10)", () => {
  const dir = peca(["slide-01.png"]);
  assert.throws(() => detectarMidia(dir, "carrossel"), /2 a 10/);
});

test("detectarMidia: post pega o único png; reel pega o mp4", () => {
  const dp = peca(["imagem.png"]);
  assert.match(detectarMidia(dp, "post")[0], /imagem\.png$/);
  const dr = peca(["reel.mp4"]);
  assert.match(detectarMidia(dr, "reel")[0], /reel\.mp4$/);
});

test("detectarMidia: sem mídia lança", () => {
  const dir = peca([]);
  assert.throws(() => detectarMidia(dir, "post"), /nenhuma imagem/i);
});

test("lerLegenda lê legenda.md; vazia lança", () => {
  const dir = peca(["imagem.png"], "Minha legenda.");
  assert.equal(lerLegenda(dir), "Minha legenda.");
  const vazio = peca(["imagem.png"], "   ");
  assert.throws(() => lerLegenda(vazio), /legenda/i);
});
