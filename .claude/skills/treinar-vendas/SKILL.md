---
name: treinar-vendas
description: >
  Use pra treinar o time de vendas (do negócio ou do cliente) com IA — "/treinar-vendas",
  "treina meu time de vendas", "cria um script de vendas", "simula uma call de vendas",
  "avalia essa ligação de venda", "meu time perde venda no telefone", "role-play de vendas",
  "por que não fecho no telefone". Gera o script de vendas do nicho, faz role-play (a IA
  banca o cliente que rebate), e pontua calls reais por rubrica nomeada (0-10) com feedback
  acionável. É o Pilar 5 da Esteira de Crescimento.
---

# /treinar-vendas — Sales coaching com IA (Pilar 5)

Gerar lead é a parte fácil; **fechar** é onde o dinheiro vaza. A maioria dos negócios locais
não tem treino de vendas formal — o dono aprendeu vendendo e o time aprende olhando. Esta
skill é o treinador que o dono não tem tempo de ser: cria o script, simula a call, e pontua as
calls reais com nota por rubrica — pra o time melhorar sem o dono ter que ouvir cada ligação.

Autoria: ImpulsoX AI. Conteúdo original. A tese "sales coaching com IA é alavanca da esteira"
vem de `docs/auditoria-esteira-2026-06-29.md` (linha Sales coaching IA).

## Onde entra na esteira

- **Pilar 5** do `docs/blueprint-esteira-crescimento.md`: depois de a casa gerar lead
  (reativação, review, orgânico), o time precisa SABER fechar — senão o lead vaza no telefone.
- Roda como serviço pro cliente final (modo agência) ou pro próprio time do negócio.

## Degrau mínimo (Escada de Contexto) — roda em qualquer degrau

1. **Sem CRM (degrau 1):** gera o script e faz role-play a partir da oferta (`nucleo/ofertas.md`)
   e das objeções comuns dela. O dono cola a transcrição de uma call → a skill pontua.
2. **Com CRM (degrau 4):** lê deals perdidos/ganhos (`lib-crm` `listDeals`) pra calibrar o
   script nas objeções REAIS que derrubaram venda, e cruza a nota da call com o resultado do deal.

## O que ler antes

- `nucleo/ofertas.md` — a oferta ATIVA (o que o time vende) + as objeções dela.
- `nucleo/voz.md` — o script sai na voz do negócio, não num tom genérico de telemarketing.
- `nucleo/provas.md` — prova autorizada que o vendedor pode citar (nunca inventar caso/número).
- `docs/persuasao.md` — persuasão honesta; o script vende diagnosticando, não empurrando.
- `.env` (`CRM_TOKEN`) — só no modo CRM; sem ele, roda pela oferta.

## As 3 funções

### 1. Script de vendas (gerar)
Monta o roteiro do nicho, na estrutura que fecha — **diagnosticar antes de prescrever** (como
médico, não vendedor): abertura → perguntas de descoberta (a dor real) → reformular a dor →
apresentar a solução como ponte → tratar objeção → fechar com próximo passo único. Sai na voz
do negócio, com a oferta ATIVA e prova autorizada. Calibrado nas objeções reais (CRM) quando há.

### 2. Role-play (simular) — com engenharia ANTI-TEATRO
O modo de falha nº 1 de role-play com IA é o teatro: comprador que vê o script do vendedor,
aceita qualquer resposta e devolve elogio genérico (LLM condescende por padrão —
SmartWinnr/Hyperbound, 2026). Aqui o comprador é DE VERDADE:

1. **Comprador = SUBAGENTE de contexto limpo** (mesmo padrão do `/revisar`): ele NÃO vê o
   script, a oferta detalhada nem a intenção do treino — recebe só a persona card.
2. **Persona card OCULTA do vendedor**, montada das objeções reais (CRM/negócio): quem é,
   a dor, o orçamento real, as 2-3 objeções que VAI levantar, e — a peça-chave — a **regra
   de cessão**: "só aceita avançar se o vendedor [descobrir a dor X / tratar a objeção Y
   sem brigar / propor próximo passo único]". Sem a condição cumprida, o comprador NÃO
   cede — educadamente enrola, como gente de verdade.
3. **Dificuldade calibrável** (fácil = 1 objeção, cede rápido · média = 2-3 · difícil =
   cético com trauma de fornecedor anterior). Começar na média.
4. **Debrief com CITAÇÃO LITERAL:** cada ponto do feedback cita o trecho exato da
   transcrição do role-play ("quando ele disse X, você respondeu Y — o que faltou foi Z").
   Feedback sem citação é achismo; a rubrica do modo 3 já exige observável — aqui é igual.
5. **O loop treino→material:** 3+ role-plays (ou calls reais) perdendo na MESMA objeção →
   o script do modo 1 ganha um bloco novo pra ela; anotar em `nucleo/aprendizados.md`.
   O debrief individual morre na pessoa; o padrão vira material.

### 3. Pontuar call real (avaliar) — rubrica nomeada, não achismo
Recebe a transcrição de uma call real e pontua por **rubrica ponderada** (0-10 por dimensão),
focada em **comportamento observável** (a IA é confiável em fato do transcript, fraca em
julgamento subjetivo — então a rubrica mede o que dá pra ver):

| Dimensão | Peso | Nota 8-10 exige |
|---|---|---|
| **Descoberta** | 30% | 3+ dores reais levantadas, entendeu o contexto/processo, achou o critério de decisão |
| **Proposta de valor** | 25% | benefício sob medida pra dor levantada (não pitch genérico), ligou ao resultado/ROI |
| **Tratamento de objeção** | 25% | reconheceu + perguntou de volta (não brigou), trouxe evidência, confirmou |
| **Fechamento** | 20% | próximo passo claro e único, compromisso mútuo, sem "depois te aviso" solto |

Benchmarks de apoio (sinais, não nota; ordem de grandeza da prática de conversation
intelligence — estilo Gong/Chorus, sem estudo único que os crave): **falar 40-45% do tempo**
(ouvir mais que falar), **15-20 perguntas de descoberta**, tom positivo. Nota final ponderada
+ os 2-3 ajustes de maior impacto pra próxima call (não uma lista de 10 — o que muda o jogo).

## Honestidade dura (o que NÃO fazer)

- **Persuasão honesta** (régua da casa) — o script diagnostica e ajuda a decidir, nunca manipula
  nem empurra o que o cliente não precisa. Sem falsa escassez, sem pressão tóxica.
- **Só prova autorizada** no script — o vendedor nunca cita caso/número inventado.
- **Só oferta ATIVA** — não treina o time a vender roadmap/futura.
- **A nota é da CALL, não da pessoa** — feedback é sobre o comportamento observável pra melhorar,
  não rótulo ("vendedor ruim"). O objetivo é mudar a próxima call, não julgar.
- **Não inventar o que foi dito** — pontua só o que está na transcrição; sem transcrição, não
  pontua (faz role-play ou pede a call).
- **LGPD/gravação:** gravar call exige aviso/consentimento das partes. A skill orienta isso; não
  estimula gravar escondido.

## Teste de aceitação (comportamental)

1. "Cria um script pra vender plano de academia" → roteiro diagnóstico na voz, com a oferta ATIVA
   e objeções dela; sem prova inventada.
2. "Simula uma call" → a IA banca o cliente que rebate (não entrega o sim fácil); debrief no fim.
3. Cola transcrição de call → nota ponderada por dimensão + os 2-3 ajustes de maior impacto.
4. Sem transcrição → não inventa nota; oferece role-play ou pede a call.
5. CRM com deals perdidos → script calibra nas objeções reais que derrubaram venda.
6. Pedido pra incluir tática manipuladora (falsa escassez, pressão) → recusa; persuasão honesta.

---

**✓ Pronto:** script de vendas na voz + role-play com a persona do cliente + nota da call por rubrica nomeada com os ajustes de maior impacto · **→ próximo passo:** o time treina e aplica; medir a melhora no fechamento (CRM: taxa de deal ganho) ao longo do tempo. É o Pilar 5 da esteira. Pré-requisito: a oferta ATIVA (`nucleo/ofertas.md`); CRM eleva (calibra nas objeções reais), mas não trava.