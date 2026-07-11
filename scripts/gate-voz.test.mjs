import { test } from "node:test";
import assert from "node:assert/strict";
import { gate, classificarDoisPontos, varrerCaixaAlta, extrairTextoHtml, extrairLegendaPublicada } from "./gate-voz.mjs";

// cada teste é o REGISTRO EXECUTÁVEL de uma correção real do dono

test("dois-pontos retórico acima do budget FALHA (incidente das 11 ocorrências, 10/07)", () => {
  const t = "Não é ferramenta: é sistema. A chance está aí: quase ninguém usa.";
  const r = gate(t);
  assert.equal(r.doisPontosRetoricos, 2);
  assert.ok(!r.pass, "2 retóricos > budget 1 tinha que falhar");
});

test("1 dois-pontos retórico dentro do budget PASSA", () => {
  const t = "O modelo é outro: a gente opera o primeiro mês. Depois o sistema é seu.";
  const r = gate(t);
  assert.equal(r.doisPontosRetoricos, 1);
  assert.ok(r.pass, r.resumo);
});

test("dois-pontos de enumeração NA MESMA FRASE agora CONTA no budget (endurecido — o dono achou vários numa peça real)", () => {
  const t = "Ela trabalha nos arquivos do negócio: monta o relatório, organiza a planilha, escreve o documento.";
  assert.equal(classificarDoisPontos(t).length, 1);
});

test("2 enumerações com ':' na mesma peça estouram o budget e FALHAM", () => {
  const t = "Trabalha nos arquivos: monta o relatório, organiza a planilha, escreve o documento. O acerto vem do contexto: preço, regra, jeito de atender.";
  assert.ok(!gate(t).pass);
});

test("rótulo de layout, URL, horário e frontmatter NÃO contam", () => {
  const t = "slug: minha-peca\nFonte: Sebrae, mar/2026.\nVeja https://site.com: legal.\nReunião 9:30 no escritório.";
  // "com: legal" após URL: o ':' de https:// é ignorado; o segundo ':' desta frase é retórico de teste
  const r = classificarDoisPontos(t);
  assert.ok(r.length <= 1, `esperava no máx 1 (o do 'site.com: legal'), veio ${r.length}`);
});

test("pra/pro isolados FALHAM sem parâmetro nenhum (hardcoded — decisão 09/07)", () => {
  const r = gate("Feito pra você e pro seu negócio.");
  assert.ok(!r.pass);
  assert.ok(r.falhas.some((f) => f.tipo === "banida:pra"));
  assert.ok(r.falhas.some((f) => f.tipo === "banida:pro"));
});

test("prato, proposta, primeiro NÃO disparam pra/pro", () => {
  const r = gate("O prato principal da proposta chega primeiro.");
  assert.ok(r.pass, r.resumo);
});

test("'marketing' só falha com --publico", () => {
  const t = "Nosso marketing interno segue.";
  assert.ok(gate(t).pass);
  assert.ok(!gate(t, { publico: true }).pass);
});

test("CTA impossível no formato FALHA (incidente 'Chama no WhatsApp' em slide, 10/07)", () => {
  const t = "Quer ver rodando? Chama no WhatsApp agora.";
  assert.ok(!gate(t, { formato: "ig-carrossel" }).pass);
  assert.ok(gate(t).pass, "sem formato declarado, não há regra de CTA");
});

test("CTA executável no app PASSA no formato", () => {
  const r = gate("Salva este post e chama no direct.", { formato: "ig-carrossel" });
  assert.ok(r.pass, r.resumo);
});

test("caixa-alta emocional FALHA; sigla e linha-label toda em caps passam", () => {
  assert.ok(!gate("Isso é URGENTE demais.").pass);
  assert.ok(gate("A PME usa IA no CRM.").pass);
  assert.ok(gate("FONTE: SEBRAE/FGV/GOOGLE · 4.967 EMPRESAS · MAR/2026").pass, "linha-label de design");
});

test("fecho-muleta FALHA ('E isso diz muito', pego em peça real)", () => {
  assert.ok(!gate("O lançamento saiu. E isso diz muito.").pass);
});

test("exclamação dupla FALHA", () => {
  assert.ok(!gate("Chegou!! Aproveita.").pass);
});

test("preferências lexicais geram AVISO sem travar (mecanismo — molde genérico do template)", () => {
  // No template o bloco preferencias_lexicais é DADO do negócio (molde vazio com 1 exemplo).
  // Este teste prova o MECANISMO: a forma preterida do molde vira aviso, não trava.
  const r = gate("Isto contém <forma que o dono não usa> no meio do texto.");
  assert.ok(r.pass, "aviso não trava");
  assert.ok(r.avisos.length >= 1, "a forma-molde do JSON dispara aviso");
});

test("extrairTextoHtml remove style/tags/comentários e preserva a copy", () => {
  const html = `<style>.x{color:red}</style><!-- nota --><section><h1>Vire dono<br>da sua presença.</h1><p>Texto pra teste.</p></section>`;
  const t = extrairTextoHtml(html);
  assert.ok(!t.includes("color"));
  assert.ok(t.includes("Vire dono"));
  const r = gate(html, { html: true });
  assert.ok(r.falhas.some((f) => f.tipo === "banida:pra"), "acha o 'pra' dentro do HTML");
});

test("enumeração 'A, B e C' na mesma frase também CONTA (isenção removida 11/07); lista VERTICAL segue isenta", () => {
  const mesmaFrase = "Lê esses extratos e me diz: quanto entrou, quanto saiu e quanto sobra no fim do mês.";
  assert.equal(classificarDoisPontos(mesmaFrase).length, 1);
  const listaVertical = "Três frentes:\n- caixa\n- cobrança\n- contatos";
  assert.equal(classificarDoisPontos(listaVertical).length, 0);
});

test("label curto todo em caps ('DADO ▲', eyebrow) NÃO é caixa-alta emocional — calibragem do shakedown 10/07", () => {
  assert.equal(varrerCaixaAlta("DADO ▲\n// 03 · A JANELA\nO texto normal segue aqui.").length, 0);
});

test("modo legenda: frontmatter e notas internas ficam FORA da varredura", () => {
  const md = `---\nslug: x\nmecanica: contraintuitivo (pra medição)\n---\n\nTexto publicado limpo, sem vício.\n\n#tag\n\n---\n**Nota interna:** isso aqui tem pra e — travessão de propósito.\n`;
  const r = gate(md, { legenda: true });
  assert.ok(r.pass, r.resumo);
  assert.equal(extrairLegendaPublicada(md).includes("Nota interna"), false);
});

test("':' abrindo lista numerada na linha seguinte é enumeração, não retórico", () => {
  const t = "Três coisas antes de colocar IA na operação:\n\n1. IA que executa vale mais.\n2. Contexto decide.\n3. Escopo com aprovação.";
  assert.equal(classificarDoisPontos(t).length, 0);
});

test("caixa-alta de 3 letras ('SEU') FALHA — vazou com limite de 4 (incidente 11/07)", () => {
  assert.ok(!gate("O acerto vem do que ela sabe do SEU negócio.").pass);
  assert.ok(gate("A PME roda IA em PT-BR no OS.").pass, "siglas de 2-3 letras seguem passando");
  assert.equal(varrerCaixaAlta("DOR ▲\nO texto normal segue aqui.").length, 0, "selo de 3 letras em linha própria é label de design");
});

test("':' retórico no meio de frase CONTA (não é rótulo de layout nem frontmatter)", () => {
  const t = "A verdade é essa: ninguém tem tempo. O caminho é claro: começar hoje.";
  assert.equal(classificarDoisPontos(t).length, 2);
});

test("ponto e vírgula em prosa FALHA (a casa não usa esse sinal)", () => {
  assert.ok(!gate("Pergunta solta ajuda; processo delegado muda a semana.").pass);
  assert.ok(gate("Pergunta solta ajuda. Processo delegado muda a semana.").pass);
});

test("3 fragmentos 'Sem + substantivo.' estouram o budget de 2 e FALHAM", () => {
  const tres = "Sem promessa mágica. O resto segue. Sem mensalidade eterna. E mais. Sem contrato preso.";
  assert.ok(!gate(tres).pass);
  const dois = "Sem promessa mágica. O resto segue. Sem mensalidade eterna. E o sistema roda com você.";
  assert.ok(gate(dois).pass, "até 2 fragmentos passam");
});

test("maiúscula mística no meio da frase FALHA ('esse Sistema'); início de frase e minúscula passam", () => {
  assert.ok(!gate("Montar esse Sistema tomaria o tempo que você não tem.").pass);
  assert.ok(gate("O Sistema roda. Montar esse sistema é rápido.").pass, "início de frase e minúscula ok");
  // exceções de nome próprio da casa são DADO do negócio (bloco 'excecoes' vazio no template).
});

test("'gringo' FALHA sempre; nacionalidade se fala pelo nome (regra universal: nacionalidade se fala pelo nome)", () => {
  assert.ok(!gate("A cobrança sai nos sistemas gringos.").pass);
  assert.ok(gate("A cobrança sai nos sistemas americanos.").pass);
});

test("peça limpa de verdade PASSA inteira", () => {
  const t = "Cliente manda mensagem às 22h. Ninguém responde. O concorrente fecha a venda antes. Salva este post para decidir com calma.";
  const r = gate(t, { formato: "ig-carrossel", publico: true });
  assert.ok(r.pass, r.resumo);
});
