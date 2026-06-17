import { test } from "node:test";
import assert from "node:assert/strict";
import { detectarShort, montarMetadados, validarUpload, montarPacoteAssistido } from "./lib-youtube-upload.mjs";

// --- Task 1: detectarShort ---

test("detectarShort: vertical e <=180s é short", () => {
  assert.equal(detectarShort({ largura: 720, altura: 1280, duracaoSeg: 17 }), true);
});

test("detectarShort: vertical mas >180s não é short", () => {
  assert.equal(detectarShort({ largura: 720, altura: 1280, duracaoSeg: 200 }), false);
});

test("detectarShort: horizontal (16:9) não é short", () => {
  assert.equal(detectarShort({ largura: 1920, altura: 1080, duracaoSeg: 30 }), false);
});

// --- Task 2: montarMetadados ---

test("montarMetadados monta snippet+status com defaults (private, Education)", () => {
  const m = montarMetadados({ titulo: "Oi", descricao: "Desc", tags: ["a", "b"] });
  assert.deepEqual(m, {
    snippet: { title: "Oi", description: "Desc", tags: ["a", "b"], categoryId: "27" },
    status: { privacyStatus: "private", selfDeclaredMadeForKids: false },
  });
});

test("montarMetadados acrescenta #Shorts na descrição quando ehShort e não duplica", () => {
  const m1 = montarMetadados({ titulo: "T", descricao: "Desc", ehShort: true });
  assert.match(m1.snippet.description, /Desc\n\n#Shorts$/);
  const m2 = montarMetadados({ titulo: "T", descricao: "Já tem #Shorts", ehShort: true });
  assert.equal((m2.snippet.description.match(/#Shorts/g) || []).length, 1);
});

test("montarMetadados respeita privacidade explícita", () => {
  const m = montarMetadados({ titulo: "T", descricao: "D", privacidade: "public" });
  assert.equal(m.status.privacyStatus, "public");
});

// --- Task 3: validarUpload ---

test("validarUpload sem erros quando título e descrição ok", () => {
  assert.deepEqual(validarUpload({ arquivo: "x.mp4", titulo: "Tudo certo", descricao: "ok" }), []);
});

test("validarUpload acusa título ausente, título longo e descrição longa", () => {
  assert.deepEqual(validarUpload({ arquivo: "x.mp4", titulo: "", descricao: "d" }), ["título ausente."]);
  const longo = "a".repeat(101);
  assert.deepEqual(validarUpload({ arquivo: "x.mp4", titulo: longo, descricao: "d" }), ["título passa de 100 caracteres (tem 101)."]);
  const desc = "a".repeat(5001);
  assert.deepEqual(validarUpload({ arquivo: "x.mp4", titulo: "T", descricao: desc }), ["descrição passa de 5000 caracteres (tem 5001)."]);
});

test("validarUpload acusa arquivo ausente", () => {
  assert.deepEqual(validarUpload({ arquivo: "", titulo: "T", descricao: "d" }), ["arquivo de vídeo não informado."]);
});

// --- Task 4: montarPacoteAssistido ---

test("montarPacoteAssistido gera texto com título, tags, privacidade e passo do Studio", () => {
  const txt = montarPacoteAssistido({
    slug: "vivian", final: "canal-youtube/edicao/vivian/final.mp4",
    metadados: { snippet: { title: "Reel em 15s", description: "Desc", tags: ["ia", "reel"] }, status: { privacyStatus: "private" } },
    thumb: null,
  });
  assert.match(txt, /Reel em 15s/);
  assert.match(txt, /ia, reel/);
  assert.match(txt, /private/);
  assert.match(txt, /studio\.youtube\.com/);
  assert.match(txt, /final\.mp4/);
});
