---
name: geo
description: >
  Use quando o negócio precisa aparecer nas respostas das IAs (ChatGPT, Gemini, Perplexity,
  Claude) — "/geo", "as ias me citam?", "por que o concorrente aparece na IA e eu não",
  "audita minha presença em IA", "generative engine optimization". Audita se a empresa é
  citada hoje, mapeia quais fontes as IAs usam no nicho, entrega o plano pra passar a ser
  citada, e instala um ciclo de monitoramento mensal. (Conserto on-page de uma página —
  Schema, FAQ, robots — é o `/seo`; esta skill mede e estrategiza, o `/seo` executa.)
---

# /geo — Aparecer nas respostas das IAs

Cada vez mais o cliente não busca no Google: pergunta pra uma IA "qual o melhor [serviço] em
[cidade]?". Quem é citado ganha lead qualificado sem pagar clique. Esta skill cuida disso de
ponta a ponta — audita, estrategiza e monitora. É a recuperação da raiz GEO da ImpulsoX, agora
dentro do circuito fechado do sistema.

Autoria: ImpulsoX AI. Conteúdo original.

> Esta skill é instrução: usa WebSearch/WebFetch (nativos) e escreve relatórios em `.md`.
> Não gera nem roda código próprio. Valida-se lendo e testando as buscas uma vez.

## Onde o /geo termina e o /seo começa

O `/geo` é a camada de **medição e estratégia**: descobre se a empresa é citada por IA, por
quê, e o que fazer. O **conserto on-page de uma página** — Schema JSON-LD, FAQ estruturado,
answer-first, `robots.txt` pra crawler de IA — é trabalho do `/seo`, a autoridade única
desses blocos. O plano do `/geo` aponta as ações; o `/seo` e o `/conteudo` executam. Sem essa
divisão, dois donos brigam pelo mesmo bloco de Schema.

## Degrau mínimo (Escada de Contexto)

Roda a partir do degrau 1 (sabe o que a empresa vende e a região). Quanto mais alto o degrau,
mais afiada a lista de perguntas que o público faria a uma IA. Abaixo de 1, pedir o mínimo:
"o que você vende e pra quem/onde?".

## O que ler antes

- `nucleo/negocio.md` — o que vende, região, diferencial (vira as perguntas que o público faz)
- `nucleo/perfil.md` — pra **criador** o alvo é ser citado por tema/autoridade, não por região;
  pra **PME local** é "[serviço] em [cidade]"; ajustar a auditoria ao perfil
- `nucleo/provas.md` — números e fatos verificáveis são o que as IAs citam; sem eles a peça
  fica genérica e a IA descarta
- `producao/raio-x/` — se houver diagnóstico, a seção de presença digital alimenta aqui
- `referencias/citabilidade.md` — **o grounding da skill**: por que GEO importa, como a IA
  escolhe o que citar (RAG, query fan-out), as regras de citabilidade do estudo de Princeton
  (KDD 2024), o decaimento que justifica o retainer, e o Share of Model. Cada número marcado
  FATO / FATO-CONFIRMADO / VOZ. Ler antes de afirmar qualquer dado em material de cliente.
- `nucleo/aprendizados.md` — o que ciclos anteriores de GEO já mostraram (não redescobrir)

## Princípio honesto do GEO

GEO **não é truque**. Não existe "hackear a IA". A IA cita quem tem conteúdo claro, específico
e verificável, e quem é mencionado em fontes confiáveis. Então GEO bem feito é, no fundo,
conteúdo honesto bem estruturado + presença real — exatamente o que o resto do sistema já faz.
Esta skill organiza isso pro alvo específico de ser citado por IA. Nada de inventar menção,
fabricar fonte ou simular avaliação.

## Passo 1 — Auditoria: a empresa aparece hoje?

1. Montar 8-15 perguntas que o público real faria a uma IA sobre o nicho (não termos de busca —
   perguntas de gente: "qual o melhor [serviço] em [cidade]?", "como escolher [produto]?",
   "[problema do cliente], o que fazer?").
2. Rodar essas perguntas via WebSearch e, quando der, conferir o que aparece nas respostas e
   fontes citadas. Registrar, por pergunta: a empresa aparece? o concorrente aparece? **quais
   fontes a IA cita** (site próprio, diretório, avaliação, matéria, blog do nicho)?
3. O ouro está nas fontes citadas: é o mapa de onde a empresa precisa estar pra ser puxada.

> Limite honesto: respostas de IA variam por sessão e não são 100% reproduzíveis. Tratar o
> resultado como amostra, não como verdade fixa — registrar a data e repetir no monitoramento.

## Passo 2 — Diagnóstico: por que aparece ou não

Cruzar o que a auditoria mostrou com o estado do conteúdo da empresa:

- **Resposta direta:** o site/conteúdo responde a pergunta de forma completa nas primeiras
  linhas? (IA cita quem responde direto, não quem enrola.)
- **Especificidade:** tem número, endereço, fato verificável? (Genérico a IA ignora.)
- **Estrutura Q&A:** o conteúdo usa perguntas reais como títulos (H2/H3)?
- **Dados estruturados:** tem FAQPage/LocalBusiness em JSON-LD no site?
- **Menções externas:** a empresa aparece em diretórios, avaliações, matérias que a IA confia?

A parte técnica desse diagnóstico (estrutura, JSON-LD, answer-first numa página específica) é
auditada a fundo pelo `/seo` — aqui é só o suficiente pra explicar o "por quê" e gerar o plano.

## Passo 3 — O plano (ligado às outras skills)

Entregar ações concretas, cada uma apontando a skill que a executa:

1. **Conteúdo que responde** — as perguntas órfãs (que ninguém responde bem) viram pauta no
   `/conteudo` → artigo com resposta direta no primeiro parágrafo + FAQ. É o coração do GEO e o
   sistema já faz isso; aqui ele ganha alvo.
2. **FAQ + dados estruturados no site** — especificar as 5-10 perguntas; o **`/seo`** gera o
   JSON-LD e os blocos pra colar (ou aplica direto se a página é arquivo do `/pagina`). O `/geo`
   diz *o que* marcar; o `/seo` é quem *marca*.
3. **Presença nas fontes que a IA cita** — lista priorizada: Perfil no Google completo (`/local`),
   diretórios do nicho, avaliações reais (`/provas` + `/local`), menções. Sem comprar nada,
   sem fabricar.
4. **Prova verificável** — o que falta de número/fato no `nucleo/provas.md` pra o conteúdo
   parar de ser genérico.

### Gate de citabilidade (validador determinístico)

Todo bloco de conteúdo citável que o plano gera (resposta de FAQ, parágrafo answer-first,
trecho pra Schema) passa pelo **`scripts/validate-geo.mjs`** antes de virar entrega. É o piso
objetivo, ancorado no estudo de Princeton (mesma régua de ouro da `/revisar-pagina`: nada
sem regra). O validador checa, sem LLM e falha-fecha:

- **front-load** (a resposta na primeira sentença, porque RAG cita o trecho, não a página),
- **estatística com fonte** (Princeton: +32%), **citação autoritativa** (+30 a +41%),
- **limites de caractere** por tipo (trecho auto-contido e remontável),
- **anti-hype** e **anti-keyword-stuffing** (stuffing REDUZ visibilidade no estudo),
- **número sem fonte = reprovado**, **Schema JSON-LD** válido (FAQPage/Article/QAPage).

Uso: `node scripts/validate-geo.mjs bloco.json` ou `--texto "..." --tipo faq --fonte "X"`.
Bloco reprovado volta pra `/conteudo`/`/seo` com o código do erro, não vai pro cliente. O
"teste do assistente" (o bloco lê natural dentro de uma resposta de IA) é gate manual, em
cima do automático.

## Passo 4 — Saída

Salvar em `producao/geo/auditoria-<YYYY-MM-DD>.md`:

```markdown
# GEO — [empresa] · [data]

## A leitura em uma frase
[aparece ou não nas IAs, e o motivo principal]

## Onde a empresa aparece hoje
| Pergunta do público | Empresa aparece? | Concorrente que aparece | Fontes que a IA citou |
|---|:---:|---|---|
...

## Por que (diagnóstico)
[os 2-3 motivos que mais pesam]

## Plano — o que fazer e qual skill executa
1. [ação — skill — o que destrava]
...

## Monitoramento (próxima rodada: [data +30d])
[as 5 perguntas-chave a re-testar todo mês]

## Limites
[variabilidade das respostas de IA; o que esta auditoria não garante]
```

## Passo 5 — Monitoramento (o loop que fecha o circuito)

GEO sem acompanhamento é foto, não filme. A cada ~30 dias, re-rodar as 5 perguntas-chave e
registrar: a empresa passou a aparecer? quem aparece agora? a fonte citada mudou? O padrão
duradouro (não o resultado cru de uma sessão) vai pra `nucleo/aprendizados.md` com data e
evidência — é o que o `/conteudo` e o `/calendario` leem pra priorizar pauta que rende citação.
Primeira auditoria real → atualizar `nucleo/escada.md` (presença em IA passa a ser um eixo
medido).

**A métrica do loop é o Share of Model (SoM):** o % de respostas, num conjunto fixo de
perguntas, em que a marca aparece, comparado aos concorrentes. É o número que o relatório
mensal acompanha (subiu? caiu? quem ganhou espaço?). Por que mensal e não uma vez: o
`citabilidade.md` documenta que ~50% do conteúdo citado tem menos de 13 semanas e 40-60% das
fontes mudam de um mês pro outro — a base é volátil por natureza, então GEO é disciplina
recorrente, não conserto único. É o que sustenta o retainer com honestidade, sem a promessa
falsa de "conserte uma vez e domine por anos".

**Hedge obrigatório no relatório (régua da casa):** o SoM é uma amostra de um conjunto de
prompts, em motores que personalizam resposta. Não é "a verdade absoluta sobre o que a IA diz
da marca". O relatório declara isso explícito. Honestidade no diagnóstico é inegociável.

Oferecer agendar o monitoramento junto com o ciclo mensal de `/desempenho`.

## Regras

- Nunca fabricar menção, fonte, avaliação ou número pra "parecer" que a empresa aparece.
- Resposta de IA é amostra com data, não verdade fixa — sempre registrar quando foi testada.
- Conteúdo pra IA é conteúdo honesto bem estruturado; sem prova real, a peça fica genérica e
  a recomendação é conseguir a prova (`/provas`), não inflar.
- Não prometer "vai aparecer no ChatGPT" — GEO aumenta a chance, não garante; dizer isso.
- Toda pauta gerada aqui passa pelo fluxo normal (`/conteudo` → `/escritor-br`), não vira
  texto socado de palavra-chave (as IAs descartam genérico tanto quanto o Google).

## Teste de aceitação (validar lendo + rodando as buscas uma vez)

1. Degrau 1 → roda a auditoria com perguntas coerentes ao nicho e região.
2. Perfil **criador** → auditoria mira citação por tema/autoridade, não por cidade.
3. Saída traz a tabela "onde aparece hoje" com as fontes citadas preenchidas de busca real.
4. Plano aponta skills concretas (`/conteudo`, `/seo`, `/local`, `/provas`), não ações soltas.
5. Monitoramento agenda re-teste e grava só padrão duradouro em `aprendizados.md`.
