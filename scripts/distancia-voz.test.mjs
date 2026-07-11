import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extrairFeatures,
  vetorDeFeatures,
  distanciaZ,
  banda,
  extrairAmostraLimpa,
} from "./distancia-voz.mjs";

// A camada de FEATURES é determinística e testável sem o modelo de embedding.
// (O embedding semântico é opcional — só liga se @huggingface/transformers existir.)

test("extrairFeatures conta tamanho médio de frase", () => {
  const f = extrairFeatures("Uma frase. Outra frase aqui.");
  assert.ok(f.palavrasPorFrase > 0);
  assert.equal(f.numFrases, 2);
});

test("texto com frases longas tem palavrasPorFrase maior que texto de frases curtas", () => {
  const curto = extrairFeatures("Ela fez. Ele foi. Nada mais.");
  const longo = extrairFeatures(
    "Ela fez tudo o que precisava fazer naquele dia inteiro sem parar um minuto sequer para descansar."
  );
  assert.ok(longo.palavrasPorFrase > curto.palavrasPorFrase);
});

test("taxa de vírgula por frase reflete o ritmo encadeado do dono", () => {
  const encadeado = extrairFeatures(
    "Achei que fosse um carro, foi chegando perto, só que a luz estava alta, eu parei."
  );
  const seco = extrairFeatures("Achei que fosse um carro. A luz estava alta. Eu parei.");
  assert.ok(encadeado.virgulasPorFrase > seco.virgulasPorFrase);
});

test("vetorDeFeatures devolve array numérico de tamanho fixo", () => {
  const v = vetorDeFeatures("Uma frase de teste, com vírgula e tudo.");
  assert.ok(Array.isArray(v));
  assert.ok(v.length >= 5);
  assert.ok(v.every((n) => typeof n === "number" && Number.isFinite(n)));
});

test("distanciaZ é 0 quando a peça é idêntica à média das amostras", () => {
  const amostra = "Uma frase. Outra frase. Mais uma frase aqui.";
  const d = distanciaZ(amostra, [amostra, amostra, amostra]);
  assert.ok(d < 0.01, `esperava ~0, veio ${d}`);
});

test("distanciaZ cresce quando a peça foge do padrão das amostras", () => {
  const amostras = [
    "Ela fez. Ele foi. Nada mais.",
    "Curto assim. Sempre curto. Frase seca.",
    "Direto. Rápido. Sem rodeio.",
  ];
  const perto = distanciaZ("Ela foi. Ele fez. Tudo certo.", amostras);
  const longe = distanciaZ(
    "Este é um período extremamente longo e cheio de subordinadas, com muitas vírgulas, que se estende por uma quantidade considerável de palavras sem qualquer pausa forte, contrariando totalmente o ritmo seco e curto das amostras de referência apresentadas.",
    amostras
  );
  assert.ok(longe > perto, `longe(${longe}) deveria > perto(${perto})`);
});

test("banda classifica a distância em perto/médio/longe (calibrada pelos controles reais)", () => {
  assert.equal(banda(0.7), "perto");  // amostra do próprio dono
  assert.equal(banda(1.2), "médio");  // peça aprovada
  assert.equal(banda(1.72), "longe"); // texto robótico de IA
});

test("extrairAmostraLimpa tira frontmatter e a seção 'o que NÃO é voz'", () => {
  const md = `# Amostra\n> nota de uso\n\nTexto real dela aqui.\n\n---\n**O que NÃO é voz:** typo.`;
  const limpo = extrairAmostraLimpa(md);
  assert.ok(limpo.includes("Texto real dela"));
  assert.ok(!limpo.includes("O que NÃO é voz"));
  assert.ok(!limpo.includes("nota de uso"));
});
