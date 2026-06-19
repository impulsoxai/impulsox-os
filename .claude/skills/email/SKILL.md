---
name: email
description: >
  Use para escrever e-mail que vende sem soar spam — "/email", "sequência de boas-vindas",
  "newsletter", "e-mail pro lead", "follow-up da proposta", "nutrir minha lista", ou quando
  o `/criar-ebook` entrega a isca (boas-vindas) e o `/proposta` precisa de follow-up. Produz
  os três tipos de e-mail da casa — sequência de boas-vindas, newsletter mensal e follow-up
  de proposta — na voz da marca, com prova só autorizada e LGPD respeitada.
---

# /email — Sequências, newsletter e follow-up

E-mail é o único canal que o negócio realmente possui — não depende de algoritmo. Mas lista
queima rápido quando o e-mail é só venda. Esta skill escreve para a régua da casa: entregar
valor primeiro, vender com objeção respondida, nunca tom de cobrança. Todo texto sai na voz
do dono e passa pelo `/escritor-br` antes de ir.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Precisa do **degrau 2** (voz definida) — e-mail genérico na caixa de entrada é deletado na
primeira linha. Sem `nucleo/voz.md` rico, avisar que o resultado melhora muito depois do
`/voz` e seguir com o tom provisório.

## O que ler antes

- `nucleo/voz.md` — a voz manda em assunto, abertura e fecho de cada e-mail
- `nucleo/ofertas.md` — a oferta que a sequência empurra, com benefício e objeções
- `nucleo/provas.md` — só prova com status **autorizada** entra no corpo
- `docs/persuasao.md` — gatilhos honestos; o contrato do assunto (entrega o que promete)
- `docs/entregabilidade-email.md` — a régua de palavras/formatação que tiram o e-mail da
  caixa de entrada; é o **gate** antes de fechar qualquer assunto, preview ou corpo

## Três modos

Decidir cedo qual se aplica (o pedido ou o handoff já indica).

### 1. Boas-vindas pós-isca (handoff do `/criar-ebook`)
Quem baixou a isca levantou a mão — é o lead mais quente que existe. Sequência de **4-5
e-mails**:
1. **Entrega da isca** — o link/arquivo, sem enrolação, e o próximo passo de leitura.
2. **Melhor conteúdo** — o material mais forte do negócio sobre o tema da isca (constrói
   autoridade antes de vender).
3. **Prova autorizada** — caso ou depoimento real (de `nucleo/provas.md`) que mostra o
   resultado possível.
4. **Oferta com objeção respondida** — a oferta ligada à isca, com a principal objeção de
   `nucleo/ofertas.md` desarmada no corpo.
5. **Convite direto** — chamada única e clara para a ação (falar, agendar, comprar).
Sugerir intervalos entre os e-mails (ex.: dia 0, 2, 4, 6, 9) — ajustar ao ciclo do negócio.

### 2. Newsletter mensal
Reaproveita o que o mês já produziu: ler `producao/` (o que `/conteudo` e `/post` geraram).
Estrutura: **1 ideia central** (o tema do mês, com a opinião do dono) + **2-3 notas curtas**
(novidades, links, bastidor) + **1 CTA** única. Newsletter é relação, não folheto — a venda
entra leve, no rodapé.

### 3. Follow-up de proposta (handoff do `/proposta`)
Proposta enviada e silêncio não é "não" — é falta de follow-up. **3 toques**, nunca tom de
cobrança:
1. **Resumo do valor** — relembra o resultado prometido, não o preço.
2. **Prova / caso** — um caso parecido que fechou e deu certo (prova autorizada).
3. **Pergunta de fechamento** — uma pergunta aberta que convida à resposta ("faz sentido
   seguir, ou o momento não é agora?"), nunca "e aí, decidiu?".
Sugerir intervalos (ex.: dia 2, 5, 9 após o envio da proposta).

## Gate de entregabilidade (antes de fechar cada e-mail)

Depois de escrever assunto + preview + corpo, e **antes** do `/escritor-br`, varrer cada peça
contra `docs/entregabilidade-email.md`: palavra de promessa/pressão/phishing, CAIXA ALTA,
`!!!`, excesso de link, urgência falsa. Sinalizou → reescrever a linha (padrões seguros do
doc) e revarrer. O assunto é o campo mais sensível — varrer com mais rigor. E-mail bem escrito
que cai no spam não vende; este gate é tão obrigatório quanto o `/escritor-br`.

## Saída

`producao/emails/<tipo>-<slug>/` (ex.: `boas-vindas-ebook-trafego/`):
- um `.md` por e-mail, cada um com **assunto** + **preview** (a linha de prévia) + **corpo**
- `sequencia.md` — a ordem dos e-mails e os intervalos sugeridos entre eles

## Regras

- **Todo texto passa pelo `/escritor-br`** — nenhum e-mail sai com cara de IA.
- Prova só **autorizada** (`nucleo/provas.md`); sem prova real, a peça troca de ângulo ou
  espera — nunca inventa caso ou número.
- **LGPD inegociável:** só escrever para quem deu contato **voluntariamente** (baixou isca,
  pediu proposta, assinou a lista). Todo e-mail de sequência menciona o **descadastro** de
  forma clara. Não construir lista comprada nem fazer disparo a frio.
- Assunto cumpre o que promete (contrato do hook) — clickbait queima a lista e a reputação
  de envio.
- **Gate de entregabilidade obrigatório** (`docs/entregabilidade-email.md`): varrer assunto e
  corpo por palavra/formatação de spam antes de fechar. Reescrever hype em linguagem plana.
- **Métrica de e-mail** (abertura, clique) só entra em relatório se vier de **export real**
  da ferramenta de envio; nunca estimar taxa de e-mail de cabeça.
- Uma CTA por e-mail. E-mail que pede três coisas não consegue nenhuma.

## Teste de aceitação (comportamental)

1. Handoff do `/criar-ebook` → sequência de 4-5 e-mails com intervalos, prova só autorizada,
   descadastro presente.
2. Newsletter → puxa material real de `producao/`, 1 ideia central + notas + 1 CTA.
3. Follow-up de proposta → 3 toques sem tom de cobrança; o último é pergunta aberta.
4. Lista sem origem voluntária declarada → a skill recusa o disparo a frio e explica a LGPD.
5. Assunto com palavra de spam ("oferta imperdível", CAIXA ALTA, "!!!") → o gate sinaliza e
   reescreve em linguagem plana antes de fechar; revarre limpo.
