import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registrarPasso } from "./registrar-passo.mjs";

test("registrarPasso anexa uma linha JSONL com ts/skill/etapa/status", () => {
  const raiz = mkdtempSync(join(tmpdir(), "passo-"));
  registrarPasso({ skill: "/post", etapa: "roteiro pronto", status: "ok" }, raiz);
  registrarPasso({ skill: "/post", etapa: "slide 3/7 renderizado" }, raiz); // status default ok
  const linhas = readFileSync(join(raiz, "dados", "atividade.jsonl"), "utf8").trim().split("\n");
  assert.equal(linhas.length, 2);
  const o = JSON.parse(linhas[0]);
  assert.equal(o.skill, "/post");
  assert.equal(o.etapa, "roteiro pronto");
  assert.equal(o.status, "ok");
  assert.match(o.ts, /^\d{4}-\d{2}-\d{2}T/);
});

test("registrarPasso normaliza status inválido pra ok e ignora etapa vazia", () => {
  const raiz = mkdtempSync(join(tmpdir(), "passo-"));
  registrarPasso({ skill: "x", etapa: "", status: "ok" }, raiz);       // etapa vazia -> nada
  registrarPasso({ skill: "x", etapa: "passo", status: "xpto" }, raiz); // status inválido -> ok
  const linhas = readFileSync(join(raiz, "dados", "atividade.jsonl"), "utf8").trim().split("\n");
  assert.equal(linhas.length, 1);
  assert.equal(JSON.parse(linhas[0]).status, "ok");
});

test("registrarPasso nunca lança", () => {
  assert.doesNotThrow(() => registrarPasso({ skill: "x", etapa: "y" }, "/caminho/invalido/\0"));
});
