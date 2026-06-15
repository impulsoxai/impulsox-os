import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEscada } from "./leitura.mjs";

const ESCADA = `# Escada de Contexto — ImpulsoX AI

**Degrau atual:** 3 — entrevista de voz feita.

**Fatos confirmados:**
- Perfil: agencia.

**Suposições / a confirmar:**
- Variações do logo ainda a gerar quando precisar.
- Prova social: nenhuma ainda — depende dos primeiros pilotos.

**Próximo degrau:**
- Primeiros dados reais → degrau 4.
`;

test("parseEscada extrai degrau, pendências e próximo", () => {
  const r = parseEscada(ESCADA);
  assert.equal(r.degrau, 3);
  assert.equal(r.pendencias.length, 2);
  assert.match(r.pendencias[0], /Variações do logo/);
  assert.equal(r.proximo.length, 1);
  assert.match(r.proximo[0], /degrau 4/);
});

test("parseEscada tolera arquivo vazio", () => {
  const r = parseEscada("");
  assert.equal(r.degrau, null);
  assert.deepEqual(r.pendencias, []);
  assert.deepEqual(r.proximo, []);
});

test("parseEscada lê a forma inline (template, degrau 0) e ignora marcadores _(...)_", () => {
  const md = `# Escada de Contexto

**Degrau atual:** 0 — só o nome do negócio

**Fatos confirmados:**
_(nenhum ainda)_

**Suposições a confirmar:**
_(nenhuma ainda)_

**Próximo degrau:** rode \`/plugar\` para subir ao degrau 3 (entrevista completa), ou passe
uma URL de site para subir ao degrau 1 (extração automática).
`;
  const r = parseEscada(md);
  assert.equal(r.degrau, 0);
  assert.deepEqual(r.pendencias, []);
  assert.equal(r.proximo.length, 1);
  assert.match(r.proximo[0], /rode .*plugar/);
  assert.match(r.proximo[0], /extração automática/); // juntou a linha de continuação
});
