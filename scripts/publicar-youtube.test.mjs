import { test } from "node:test";
import assert from "node:assert/strict";
import { montarPlano } from "./publicar-youtube.mjs";

test("montarPlano resume o que vai subir (auto quando há credencial)", () => {
  const p = montarPlano({
    slug: "vivian", final: "canal-youtube/edicao/vivian/final.mp4",
    titulo: "Reel em 15s", descricao: "Desc", tags: ["ia"],
    privacidade: "private", ehShort: true, temCredencial: true,
  });
  assert.equal(p.dry_run, true);
  assert.equal(p.modo, "automático");
  assert.equal(p.ehShort, true);
  assert.equal(p.privacidade, "private");
  assert.equal(p.titulo, "Reel em 15s");
});

test("montarPlano marca modo assistido sem credencial", () => {
  const p = montarPlano({ slug: "v", final: "f.mp4", titulo: "T", descricao: "D", tags: [], privacidade: "private", ehShort: false, temCredencial: false });
  assert.equal(p.modo, "assistido");
});
