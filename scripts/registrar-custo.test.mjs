import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registrarCusto } from "./registrar-custo.mjs";

test("registrarCusto anexa uma linha JSONL com os campos certos", () => {
  const raiz = mkdtempSync(join(tmpdir(), "cst-"));
  registrarCusto({ script: "gerar-avatar", modelo: "kling", custo: 1.75 }, raiz);
  registrarCusto({ script: "gerar-avatar", modelo: "heygen", custo: 1.5 }, raiz);
  const linhas = readFileSync(join(raiz, "dados", "custos.jsonl"), "utf8").trim().split("\n");
  assert.equal(linhas.length, 2);
  const o = JSON.parse(linhas[0]);
  assert.equal(o.modelo, "kling");
  assert.equal(o.custo, 1.75);
  assert.match(o.data, /^\d{4}-\d{2}-\d{2}$/);
});

test("registrarCusto ignora custo inválido (NaN) e nunca lança", () => {
  const raiz = mkdtempSync(join(tmpdir(), "cst-"));
  assert.doesNotThrow(() => registrarCusto({ script: "x", modelo: "y", custo: NaN }, raiz));
  assert.doesNotThrow(() => registrarCusto({ script: "x", modelo: "y", custo: 1 }, "/caminho/invalido/\0"));
});
