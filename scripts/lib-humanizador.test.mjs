import { test } from "node:test";
import assert from "node:assert/strict";
import { varrerDuros, varrerBanidas, varrerVicios, auditar } from "./lib-humanizador.mjs";

// --- DUROS ---

test("varrerDuros pega travessão, aspa curva e duplo hífen com linha/coluna", () => {
  const t = 'Primeira linha ok.\nIsso — denuncia.\nEla disse “oi” e -- seguiu.';
  const d = varrerDuros(t);
  const tipos = d.map((x) => x.tipo);
  assert.ok(tipos.includes("travessao"));
  assert.ok(tipos.includes("aspa-curva"));
  assert.ok(tipos.includes("duplo-hifen"));
  const trav = d.find((x) => x.tipo === "travessao");
  assert.equal(trav.linha, 2);
});

test("varrerDuros: meia-risca de INTERVALO colado passa; solta falha", () => {
  const ok = varrerDuros("Funciona seg–sex, das 9h–18h, no período 2024–2026.");
  assert.equal(ok.length, 0);
  const ruim = varrerDuros("A ideia – que era boa – morreu.");
  assert.equal(ruim.filter((x) => x.tipo === "meia-risca").length, 2);
});

test("varrerDuros: texto limpo devolve []", () => {
  assert.deepEqual(varrerDuros('Texto normal, com "aspas retas" e hífen-comum.'), []);
});

// --- BANIDAS ---

test("varrerBanidas acha palavra da voz.md como palavra inteira, case-insensitive", () => {
  const t = "Nossa Solução é imbatível. As soluções chegaram. Solucionar não conta.";
  const b = varrerBanidas(t, ["solução", "imbatível"]);
  assert.equal(b.filter((x) => x.tipo === "banida:solução").length, 1); // "soluções" e "Solucionar" não casam
  assert.equal(b.filter((x) => x.tipo === "banida:imbatível").length, 1);
});

test("varrerBanidas com lista vazia devolve []", () => {
  assert.deepEqual(varrerBanidas("qualquer texto", []), []);
});

// --- VÍCIOS ---

test("varrerVicios pega os clássicos da tabela", () => {
  const t = "É importante ressaltar que no mundo atual a ferramenta desempenha um papel fundamental. Em suma, vamos explorar.";
  const tipos = varrerVicios(t).map((x) => x.tipo);
  assert.ok(tipos.includes("e-importante-ressaltar"));
  assert.ok(tipos.includes("mundo-atual"));
  assert.ok(tipos.includes("papel-fundamental"));
  assert.ok(tipos.includes("em-suma"));
  assert.ok(tipos.includes("imagine-explore"));
});

test("varrerVicios pega a onda 2025 (nesse sentido, hedging enfileirado, trio adjetival)", () => {
  const t = "Nesse sentido, o método pode ajudar e geralmente funciona. O plano é rápido, prático e eficiente.";
  const tipos = varrerVicios(t).map((x) => x.tipo);
  assert.ok(tipos.includes("vale-destacar-2025"));
  assert.ok(tipos.includes("hedging-enfileirado"));
  assert.ok(tipos.includes("trio-adjetival"));
});

test("varrerVicios pega gerúndio encadeado na mesma frase", () => {
  const t = "Trabalhamos buscando resultados e proporcionando ganhos reais.";
  assert.ok(varrerVicios(t).some((x) => x.tipo === "gerundio-encadeado"));
});

test("varrerVicios NÃO dispara em texto humano normal", () => {
  const t = 'Cliente não espera. Manda no WhatsApp 22h, e se ninguém responde, amanhã ele já comprou de outro. O Agente responde na hora, no tom da sua loja.';
  assert.deepEqual(varrerVicios(t), []);
});

// --- gate ---

test("auditar: pass=false com duro ou banida; vícios não bloqueiam sozinhos", () => {
  const comDuro = auditar("Isso — falha.");
  assert.equal(comDuro.pass, false);
  const comBanida = auditar("Nossa solução completa.", { banidas: ["solução"] });
  assert.equal(comBanida.pass, false);
  const soVicio = auditar("É importante ressaltar que funciona.");
  assert.equal(soVicio.pass, true);
  assert.equal(soVicio.vicios.length, 1);
});

test("auditar: texto limpo passa com resumo zerado", () => {
  const r = auditar('Texto direto, com "aspas retas". Frase curta. E uma mais longa que leva o tempo dela.');
  assert.equal(r.pass, true);
  assert.equal(r.duros.length + r.banidas.length + r.vicios.length, 0);
});
