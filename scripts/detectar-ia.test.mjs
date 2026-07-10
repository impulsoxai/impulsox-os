import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { burstiness } from "./detectar-ia.mjs";
import { repeticaoNgrama } from "./detectar-ia.mjs";
import { densidadeTells, indice } from "./detectar-ia.mjs";
import { trechosCulpados } from "./detectar-ia.mjs";
import { aberturaUniforme } from "./detectar-ia.mjs";

// burstiness devolve 0-100; ALTO = mais cara-de-IA (frases uniformes).
// Mede: 100 - coef. de variação (desvio/média do nº de palavras por frase), escalado.

test("burstiness ALTO quando toda frase tem o mesmo tamanho", () => {
  const uniforme = "Um dois tres quatro cinco. Seis sete oito nove dez. Onze doze treze catorze quinze. Um dois tres quatro cinco.";
  assert.ok(burstiness(uniforme) >= 70, `esperava >=70, veio ${burstiness(uniforme)}`);
});

test("burstiness BAIXO quando o tamanho de frase varia muito", () => {
  const variado = "Curto. Uma frase bem mais longa que leva o tempo dela pra chegar no ponto e ainda continua. Meio. Curtíssima.";
  assert.ok(burstiness(variado) <= 45, `esperava <=45, veio ${burstiness(variado)}`);
});

// ALTO = muita repetição de estrutura = cara-de-IA. Mede proporção de bi/trigramas repetidos.
test("repeticaoNgrama ALTO quando a mesma estrutura se repete", () => {
  const repetido = "a ia faz isso a ia faz aquilo a ia faz aquilo outro a ia faz mais uma coisa";
  assert.ok(repeticaoNgrama(repetido) >= 55, `esperava >=55, veio ${repeticaoNgrama(repetido)}`);
});

test("repeticaoNgrama BAIXO em texto com vocabulário variado", () => {
  const variado = "Cliente manda mensagem tarde. Ninguém responde rápido. Concorrente fecha venda. Prejuízo silencioso todo mês.";
  assert.ok(repeticaoNgrama(variado) <= 40, `esperava <=40, veio ${repeticaoNgrama(variado)}`);
});

test("densidadeTells sobe com tells por palavra (usa a tabela do lib-humanizador)", () => {
  const cheio = "É importante ressaltar que no mundo atual a solução desempenha um papel fundamental. Especialistas apontam isso.";
  const limpo = "Cliente manda mensagem tarde. Ninguém responde. Concorrente fecha a venda antes.";
  assert.ok(densidadeTells(cheio) > densidadeTells(limpo));
});

test("indice combina os 4 sinais 0-100 e devolve a quebra", () => {
  const r = indice("Um dois tres quatro cinco. Seis sete oito nove dez. Onze doze treze catorze quinze.");
  assert.ok(r.total >= 0 && r.total <= 100);
  assert.ok("burstiness" in r.sinais && "ngrama" in r.sinais && "tells" in r.sinais && "abertura" in r.sinais);
});

test("indice: texto claramente de-IA pontua ALTO; humano varia pontua BAIXO", () => {
  const ia = "É importante ressaltar que a solução potencializa resultados. A ferramenta desempenha um papel fundamental. Especialistas apontam que a solução transforma processos. A solução otimiza a eficiência de forma prática.";
  const humano = "Cliente não espera. Manda no WhatsApp 22h, e se ninguém responde, amanhã comprou de outro. O agente responde na hora, no tom da sua loja. Você descobre de manhã que vendeu dormindo.";
  assert.ok(indice(ia).total > indice(humano).total, `IA ${indice(ia).total} deveria > humano ${indice(humano).total}`);
});

test("trechosCulpados aponta tells com linha", () => {
  const t = "Frase normal aqui.\nÉ importante ressaltar que funciona.\nOutra frase.";
  const tr = trechosCulpados(t);
  assert.ok(tr.some((x) => x.linha === 2 && /ressaltar/.test(x.motivo)));
});

// GUARDA DE CALIBRAÇÃO: o "chão" impresso no CLI é a média do índice dos exemplares de
// fixture (texto humano de referência — não peça real, fica em scripts/__fixtures__/
// pra o teste rodar em qualquer clone sem depender de producao/artigos/ do negócio).
// Se varrerVicios, os pesos ou as fixtures mudarem, este teste trava e avisa que o
// número hardcoded no CLI precisa ser atualizado (não pode mentir em silêncio).
test("chão hardcoded no CLI bate com a média real das fixtures (±3)", () => {
  const exemplares = [
    new URL("./__fixtures__/exemplar-1.md", import.meta.url),
    new URL("./__fixtures__/exemplar-2.md", import.meta.url),
    new URL("./__fixtures__/exemplar-3.md", import.meta.url),
  ];
  const indices = exemplares.map((f) => indice(readFileSync(f, "utf8")).total);
  const media = indices.reduce((a, b) => a + b, 0) / indices.length;

  const fonte = readFileSync(new URL("./detectar-ia.mjs", import.meta.url), "utf8");
  const m = fonte.match(/chao dos exemplares Fable: ~(\d+)/);
  assert.ok(m, "o CLI precisa ter a linha 'chao dos exemplares Fable: ~N'");
  const chaoHardcoded = Number(m[1]);

  assert.ok(
    Math.abs(chaoHardcoded - media) <= 3,
    `chão hardcoded ~${chaoHardcoded} desviou da média real ${media.toFixed(1)} das fixtures — atualize o número no CLI de detectar-ia.mjs`
  );
});

test("densidadeTells trata nao-e-x-e-y como tell DE EXCESSO (2 grátis)", () => {
  // 2 ocorrências de "não é X, é Y" = dentro da franquia, densidade ZERO desse tell.
  const dois = "Isso não é uma ferramenta, é um hábito. Aquilo não é um custo, é um investimento. O texto segue limpo e direto por aqui.";
  // 4 ocorrências = 2 excedentes contam.
  const quatro = dois + " Ela não é uma aba, é um sistema. Ele não é um chat, é um agente.";
  assert.ok(densidadeTells(quatro) > densidadeTells(dois), "além da franquia de 2, o excesso conta");
});

test("aberturaUniforme ALTO quando parágrafos abrem com conector/mesma palavra", () => {
  const t = "Além disso, a IA ajuda muito no trabalho diário.\n\nAlém disso, ela organiza os arquivos da empresa.\n\nAlém disso, o sistema cobra os clientes que atrasam.";
  assert.ok(aberturaUniforme(t) >= 50, `esperava >=50, veio ${aberturaUniforme(t)}`);
});

test("aberturaUniforme BAIXO quando cada parágrafo abre diferente", () => {
  const t = "Cliente manda mensagem tarde da noite.\n\nNinguém responde antes das oito.\n\nO concorrente fecha a venda primeiro.\n\nTres mil reais escapam sem ninguém ver.";
  assert.ok(aberturaUniforme(t) <= 30, `esperava <=30, veio ${aberturaUniforme(t)}`);
});
