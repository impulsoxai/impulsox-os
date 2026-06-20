import { test } from "node:test";
import assert from "node:assert/strict";
import { validarBloco, validar } from "./validate-geo.mjs";

// Helper: bloco válido base (passa em tudo), pra mutar nos testes negativos.
const bom = () => ({
  tipo: "faq",
  texto: "A latência mediana da plataforma é de 8 milissegundos, segundo o relatório de desempenho de 2026. Isso coloca o sistema entre os mais rápidos do setor de dados em tempo real.",
  fonte: "Relatório de desempenho ImpulsoX 2026",
});

// === POSITIVOS (devem aprovar) ===

test("01 bloco completo aprova", () => {
  assert.equal(validarBloco(bom()).ok, true);
});

test("02 fonte via atribuição textual (sem campo fonte) aprova", () => {
  const b = { tipo: "resposta", texto: "O mercado cresceu 32% em 2025, conforme dados do Sebrae. O movimento veio das PMEs do Sul." };
  assert.equal(validarBloco(b).ok, true);
});

test("03 fonte via URL aprova", () => {
  const b = { tipo: "resposta", texto: "São 24 empreendimentos entregues no prazo. Os números estão em https://atrio.com.br/sobre e são auditados." };
  assert.equal(validarBloco(b).ok, true);
});

test("04 tipo article com texto longo válido aprova", () => {
  const b = {
    tipo: "article",
    texto: "A pesca artesanal responde por 60% do pescado consumido na ilha, segundo a Epagri. O número sustenta a cadeia local de pequenos produtores e mantém o preço acessível durante o ano todo, mesmo fora da safra da tainha.",
    fonte: "Epagri SC",
  };
  assert.equal(validarBloco(b).ok, true);
});

test("05 jsonld FAQPage válido aprova", () => {
  const b = { ...bom(), jsonld: { "@context": "https://schema.org", "@type": "FAQPage" } };
  assert.equal(validarBloco(b).ok, true);
});

test("06 validar() em lista toda boa retorna ok", () => {
  const r = validar([bom(), bom()]);
  assert.equal(r.ok, true);
  assert.equal(r.aprovados, 2);
});

test("07 número com 'x' e fonte aprova", () => {
  const b = { tipo: "resposta", texto: "Conteúdo atualizado aparece 4,3x mais nas respostas de IA, segundo a Seer Interactive. Vale manter a página fresca." };
  assert.equal(validarBloco(b).ok, true);
});

test("08 QAPage no jsonld é aceito", () => {
  const b = { ...bom(), jsonld: { "@context": "https://schema.org", "@type": "QAPage" } };
  assert.equal(validarBloco(b).ok, true);
});

// === NEGATIVOS (devem reprovar com o código certo) ===

const temErro = (res, code) => res.erros.some((e) => e.code === code);

test("09 bloco vazio reprova VAZIO", () => {
  const r = validarBloco({ tipo: "faq", texto: "  " });
  assert.equal(r.ok, false);
  assert.ok(temErro(r, "VAZIO"));
});

test("10 abertura fraca reprova FRONTLOAD", () => {
  const b = { ...bom(), texto: "No mundo atual, a latência é de 8ms, segundo o relatório de 2026. É rápido." };
  assert.ok(temErro(validarBloco(b), "FRONTLOAD"));
});

test("11 primeira sentença pergunta reprova FRONTLOAD", () => {
  const b = { ...bom(), texto: "Qual a latência da plataforma? É de 8ms, segundo o relatório de 2026 da casa." };
  assert.ok(temErro(validarBloco(b), "FRONTLOAD"));
});

test("12 sem número reprova SEM_ESTATISTICA", () => {
  const b = { tipo: "resposta", texto: "A plataforma é muito rápida e confiável, segundo o relatório oficial da empresa. Atende bem." };
  assert.ok(temErro(validarBloco(b), "SEM_ESTATISTICA"));
});

test("13 sem fonte reprova SEM_FONTE", () => {
  const b = { tipo: "resposta", texto: "A latência mediana é de 8 milissegundos e o uptime fica em 99,99% ao longo do ano inteiro." };
  assert.ok(temErro(validarBloco(b), "SEM_FONTE"));
});

test("14 número sem fonte reprova NUMERO_SEM_FONTE", () => {
  const b = { tipo: "resposta", texto: "São 24 empreendimentos entregues e 18 anos de mercado, com muito cuidado em cada detalhe." };
  assert.ok(temErro(validarBloco(b), "NUMERO_SEM_FONTE"));
});

test("15 bloco curto demais reprova CURTO", () => {
  const b = { tipo: "faq", texto: "8ms, segundo o relatório." };
  assert.ok(temErro(validarBloco(b), "CURTO"));
});

test("16 bloco longo demais reprova LONGO", () => {
  const b = { tipo: "faq", texto: "A latência é de 8ms, segundo o relatório de 2026. " + "Detalhe técnico relevante aqui. ".repeat(20) };
  assert.ok(temErro(validarBloco(b), "LONGO"));
});

test("17 hype reprova HYPE", () => {
  const b = { ...bom(), texto: "A solução revolucionária tem latência de 8ms, segundo o relatório de 2026. É a melhor do mundo." };
  assert.ok(temErro(validarBloco(b), "HYPE"));
});

test("18 keyword stuffing reprova STUFFING", () => {
  const b = { tipo: "resposta", texto: "Latência latência latência latência latência de 8ms, segundo o relatório de 2026 da casa." };
  assert.ok(temErro(validarBloco(b), "STUFFING"));
});

test("19 jsonld sem @context schema.org reprova SCHEMA_CONTEXT", () => {
  const b = { ...bom(), jsonld: { "@type": "FAQPage" } };
  assert.ok(temErro(validarBloco(b), "SCHEMA_CONTEXT"));
});

test("20 jsonld @type errado reprova SCHEMA_TIPO", () => {
  const b = { ...bom(), jsonld: { "@context": "https://schema.org", "@type": "WebPage" } };
  assert.ok(temErro(validarBloco(b), "SCHEMA_TIPO"));
});

test("21 validar() com 1 ruim retorna ok=false", () => {
  const r = validar([bom(), { tipo: "faq", texto: "" }]);
  assert.equal(r.ok, false);
  assert.equal(r.aprovados, 1);
});
