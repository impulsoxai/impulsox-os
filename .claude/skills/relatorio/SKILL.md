---
name: relatorio
description: >
  Use quando o trabalho do mês precisa virar relatório apresentável — "/relatorio",
  "monta o relatório do cliente", "fecha o mês", "preciso mostrar resultado pro
  cliente", ou no fim de cada mês no modo agência. Junta o que o /desempenho e o
  /analisar-ads já mediram num relatório mensal com a marca da agência, em linguagem
  de dono de negócio: o que fizemos, o que aconteceu, o que vem agora. É a skill de
  retenção — cliente renova quando enxerga o valor.
---

# /relatorio — O mês visível pro cliente

Agência perde cliente quando o trabalho fica invisível. Os números já existem no
sistema (`/desempenho`, `/analisar-ads`); esta skill transforma eles na peça que o
cliente lê em 5 minutos e entende por que continua pagando.

Autoria: ImpulsoX AI. Conteúdo original.

## O que ler antes

- `producao/relatorios/desempenho-<mes>.md` — orgânico (se não existe, **rodar
  `/desempenho` primeiro** — relatório sem medição é ficção)
- `producao/ads/analise-*.md` — pago, se o cliente roda ads
- `producao/calendario/<mes>.md` + `producao/publicacoes.md` — o que foi entregue
- `nucleo/aprendizados.md` — o que o mês ensinou
- Marca de **quem assina**: no modo agência, o relatório pro cliente sai com a marca
  da agência (raiz); peça interna do próprio negócio sai com a marca da empresa

## Topo: escaneável em 30s, defensável em 3

O decisor não loga em dashboard nem lê planilha — ele bate o olho no topo e decide se
confia. O topo do relatório fala **OUTCOME** (leads, vendas, ROI, faturamento influenciado),
nunca atividade (alcance, curtida, posts publicados). Atividade entra mais embaixo, como
prova do trabalho; o titular é sempre o resultado de negócio.

## Dois níveis num relatório só

Todo relatório carrega duas leituras:

- **Executiva** (primeira página) — ROI, receita, leads, custo por resultado. É o que o
  dono lê em 30s pra saber se vale o que paga.
- **Operacional** (páginas seguintes) — métrica por canal, criativo que puxou, ajustes
  feitos. É o que defende a leitura executiva pra quem quiser cavar.

Um documento, dois níveis: o ocupado para no topo, o curioso desce.

## Estrutura (nesta ordem — decisor lê de cima e para quando confia)

1. **O mês em uma frase** — a conclusão honesta antes de qualquer número
2. **O que foi entregue** — peças publicadas, campanhas ativas, páginas no ar (volume
   conferível, com links)
3. **Os números que importam** — 4-6 métricas no máximo, sempre com comparação
   (mês anterior ou meta) e uma linha de leitura em português de gente: "alcance subiu
   18% — puxado pelos dois carrosséis de [tema]". Nada de despejo de planilha
4. **O que aprendemos** — padrões do `nucleo/aprendizados.md` em linguagem simples;
   é o que mostra que existe método, não sorte
5. **Prova social do mês** — o depoimento, caso ou número novo capturado no período;
   puxar do banco (`/provas`) o que entrou desde o último relatório (só prova autorizada).
   Cliente ver a própria reputação crescendo é argumento de retenção
6. **Plano do próximo mês** — 3-5 ações concretas saídas dos aprendizados
7. **Recado final** — onde precisamos do cliente (material, aprovação, acesso, prova)

## Narrativa por seção — toda métrica fecha com recomendação

Cada seção de número segue o arco: **Observação → Hipótese → O que fizemos → Resultado →
Próxima ação**. Não basta "alcance subiu 18%" — fecha com o que fazer a respeito ("logo,
dobramos carrossel de [tema] em julho"). **Seção sem takeaway acionável é problema de
narrativa, não de dado**: se um número não leva a uma decisão, ou ele vira recomendação
ou sai do relatório.

## Produção

1. Montar o conteúdo e mostrar pro usuário **antes** de diagramar (número errado
   diagramado bonito é constrangimento bonito).
2. Diagramar em HTML com a identidade (tokens da marca de quem assina) → PDF, mesmo
   pipeline do `/criar-ebook`. Capa, 4-8 páginas, gráficos simples (barras de
   comparação em HTML/CSS — sem biblioteca).
3. Salvar em `clientes/<nome>/producao/relatorios/<YYYY-MM>.pdf` (modo agência) ou
   `producao/relatorios/mensal-<YYYY-MM>.pdf` (negócio próprio).

## Entrega por inbox — não esperar o cliente logar

Cliente não abre dashboard nem caça PDF em pasta. **Padrão é levar o relatório até ele**:
e-mail/mensagem com **resumo de 5 linhas no corpo** (o mês em uma frase + os 2-3 números de
outcome + a próxima ação) e o **PDF anexo** pra quem quiser cavar. Quem auto-envia o resumo
retém mais — o valor precisa chegar sem esforço do cliente. Gerar junto com o relatório o
texto desse e-mail, na voz de quem assina, pronto pra enviar.

## Cadência — o alerta proativo agora TEM DONO (check quinzenal)

Relatório mensal é o ritmo base, não o único toque — e "alguém avisa se cair" só funciona
se alguém OLHA. O dono é o **check quinzenal** desta skill (10 min, 3 números):

1. **Quando:** dia ~15 de cada mês (entre relatórios). Oferecer agendar pela
   `/automatizar` na primeira rodada — é tarefa com cara de rotina (regra do CLAUDE.md).
2. **O que olhar (só o que já existe, sem montar nada):** CPL/gasto da quinzena
   (`/analisar-ads` rápido ou o painel da plataforma) · alcance/engajamento
   (`metricas-instagram.mjs --todas --dias 14`) · leads no CRM (`/leads` modo consulta).
3. **Gatilho de alerta:** qualquer um dos 3 fora da faixa do mês anterior (±30%) →
   mensagem curta ao cliente HOJE — má notícia com plano ("caiu X, já estamos fazendo Y")
   ou boa notícia com gancho (pico → `/provas` pede depoimento no momento quente).
   Nada fora da faixa → ninguém é incomodado; o check morre em 10 min.

48% dos churns de agência são "insatisfação com a entrega" (Swydo, 2026) — e o cliente
decide isso ENTRE relatórios, não lendo o PDF. O check quinzenal é o seguro de retenção
mais barato que existe.

## Modo `--trimestral` — o QBR que renova contrato

A cada 3 meses (e sempre a ~60-30 dias de uma renovação — a `/carteira` avisa), o
relatório sobe de formato: **revisão trimestral AO VIVO**, não e-mail:
1. Agregar os 3 relatórios mensais: a história do trimestre em números (o que subiu, o
   que travou, o que aprendemos), o cenário competitivo em 2-3 linhas (`/concorrente`) e
   o **plano do próximo trimestre** (3 apostas, com o porquê).
2. Gerar o **deck via `/slides`** (produto real em mockup, números grandes, notas do
   apresentador) — QBR é apresentação, não anexo.
3. O fecho do QBR é a ponte de renovação/upsell: "pro próximo tri, o plano é X — faz
   sentido seguirmos?" Contrato 10k+ se renova NO QBR, não no boleto.

## Honestidade — a parte que segura contrato de verdade

- Mês fraco: dizer fraco, explicar o porquê e mostrar a correção em andamento. Cliente
  aceita mês ruim com plano; não aceita descobrir que foi enrolado.
- Métrica de vaidade não maquia resultado: se o objetivo era lead e veio curtida, o
  relatório diz isso.
- Nunca atribuir ao marketing o que não é dele (venda que veio de indicação, pico
  sazonal) — credibilidade vale mais que um gráfico bonito.

## Regras

- Todo número vem dos relatórios das skills de medição — nunca recalculado de cabeça,
  nunca estimado pra preencher lacuna. Sem dado de um canal → o relatório marca
  "sem medição neste canal" e sugere configurar.
- Linguagem de dono de negócio; jargão só com tradução na mesma frase.
- Texto passa pelo `/escritor-br`.
- Mensal por padrão; oferecer agendar a rotina (fim do mês: `/desempenho` →
  `/relatorio` → `/calendario` do mês seguinte — o ciclo completo).

---

**✓ Pronto:** relatório do período em linguagem de dono · **→ próximo passo:** `/calendario` do mês seguinte, fechando o ciclo `/desempenho` → `/relatorio` → `/calendario`. É entrega de leitura — não publica nada.
