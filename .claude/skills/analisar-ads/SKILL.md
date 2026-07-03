---
name: analisar-ads
description: >
  Use quando a empresa JÁ roda anúncios e quer saber o que está funcionando —
  "/analisar-ads", "analisa minhas campanhas", "qual campanha performou melhor?",
  "onde meu dinheiro está indo no Google/Meta Ads", "relatório de ads". Lê exports CSV
  do Google Ads e do Meta Ads Manager, calcula métricas com script determinístico
  (nunca de cabeça) e devolve ranking de campanhas + sugestões de novas campanhas
  baseadas no que converteu.
---

# /analisar-ads — O que os anúncios estão dizendo

A empresa exporta os CSVs das plataformas; o sistema calcula, classifica e traduz em
decisão: o que escalar, o que pausar, o que testar em seguida. Sem API, sem token —
só os exports que qualquer conta consegue baixar.

Autoria: ImpulsoX AI. Conteúdo original.

## Princípio inegociável

**LLM não faz aritmética de dinheiro.** Toda soma, divisão e ranking sai do script
`scripts/analisar-ads.mjs`. O modelo interpreta o resultado e decide — nunca calcula
métrica de cabeça. Se o script não roda, a análise não existe.

## ⭐ Atribuição inflada — o aviso que muda toda decisão de orçamento

O **ROAS que a plataforma reporta NÃO é incremental** — ele credita à campanha vendas que
teriam acontecido de qualquer jeito, e infla o número em **2-5x** sobre o ganho real. Pior:
Google e Meta usam modelos e janelas de atribuição **diferentes**, então o ROAS de uma não
é comparável com o da outra. Regra da casa, sempre no relatório:

- Rotular todo ROAS/CPA vindo do export como **"ROAS atribuído pela plataforma — não usar
  pra decidir orçamento entre Google e Meta"**. Serve pra ranquear DENTRO de uma mesma
  plataforma e período; não serve pra dizer "Meta rende mais que Google".
- Decisão de quanto investir em cada plataforma só com sinal **incremental** (teste de
  geo-lift, holdout, ou — no mínimo — o dado de faturamento real do negócio batido contra o
  gasto total). Sem isso, a recomendação de realocar verba entre plataformas fica marcada
  como **hipótese a testar**, nunca como veredito.
- **Janela de atribuição — conferir antes de comparar:** ao comparar períodos ou plataformas,
  conferir que a janela de atribuição é a MESMA nos dois exports (7d-click é o padrão do Meta
  desde 2021) — janela diferente = "queda" fantasma. Vale também Google vs Meta: cada um conta
  conversão do seu jeito; nunca somar os dois como se fosse a mesma régua.

## Sem ads ainda?

Esta skill não se aplica — dizer isso com clareza e apontar o caminho: `/ads-google`,
`/ads-meta` ou a skill de ChatGPT Ads para criar a primeira campanha.

## Passo 1 — Receber os exports

Pedir os arquivos em `dados/ads/`:
> "Me passa os exports: no **Google Ads**, relatório com custo, cliques, impressões e
> conversões no período (CSV). No **Meta Ads Manager**, 'Desempenho' do mesmo período (CSV).
> Salva em `dados/ads/` que eu cuido do resto. Tem só uma das plataformas? Manda a que tiver."

**Pedir no nível mais GRANULAR que a conta exporta** — é o que responde "qual ANÚNCIO/palavra
converteu", não só "qual campanha":
- **Google Ads:** relatório por **Anúncio** (e por **Termo de pesquisa**/palavra-chave quando
  der) — não só por campanha. Cada nível vira uma aba de análise.
- **Meta:** desagregar por **Anúncio** (e por **Criativo**), não parar no conjunto. **E incluir
  as colunas de VÍDEO** quando a conta roda vídeo: reproduções de 3s, ThruPlay e reproduções
  a 25/50/75% — são elas que alimentam a régua Hook Rate/Hold Rate que o `/ads-meta` manda
  trazer pra cá (sem essas colunas, o diagnóstico "qual parte do criativo corrigir" não roda).
  No `--mapa`, os campos são `videoviews3s` e `thruplay`.
- Se o dono só conseguir o nível de campanha, analisar nesse nível e avisar que o "qual
  anúncio especificamente" fica pendente até o export granular.

Período recomendado: 90 dias (estabiliza sinal sem misturar época demais).

## Passo 2 — Inspecionar e mapear colunas

Os nomes de coluna variam por idioma e versão do export. Abrir o cabeçalho de cada CSV
e montar o mapeamento para o script (`--mapa`): qual coluna é campanha, custo, cliques,
impressões, conversões, valor de conversão (se houver). Mostrar o mapeamento ao usuário
antes de rodar — coluna errada = análise inteira errada.

## Passo 3 — Rodar o cálculo

```
node scripts/analisar-ads.mjs dados/ads/<arquivo>.csv --mapa '<json do mapeamento>' --plataforma google|meta
```

O script entrega por campanha: gasto, cliques, CTR, CPC, conversões, CPA, valor de
conversão e ROAS (quando há valor), e o agregado da conta. Rodar para cada plataforma e
consolidar.

## Passo 4 — Interpretar (aqui entra o julgamento)

Com os números do script na mão:

1. **Ranking por eficiência, no nível exportado.** Se veio por anúncio/palavra, ranquear
   ANÚNCIO a anúncio (qual criativo/título converteu mais barato) — não só campanha.
   Ordenar por CPA (ou ROAS, se há valor). Nomear vencedoras e sangrias em cada nível.
2. **Onde o dinheiro vaza.** Campanhas com gasto relevante (>10% do total) e zero
   conversão — candidatas a pausa ou reforma.
3. **Significância por CONVERSÕES, não por cliques.** O que decide a confiança no veredito é
   o volume de **conversões**, não de cliques — uma campanha com 2.000 cliques e 4 conversões
   ainda não diz nada. Limiar: **≥30-50 conversões** na campanha pra cravar CPA/ROAS;
   abaixo disso = "sem veredito ainda", nunca conclusão forçada (cliques altos com poucas
   conversões enganam). Pausa/escala só passa desse limiar.
4. **Comparar contra benchmark de nicho 2026.** Número solto não diz se é bom — ancorar:
   **ROAS de referência Google ~3,5x · Meta ~1,9x** (medianas de agregados 2026 —
   WordStream/Varos; ordem de grandeza, varia por setor). CPA/ROAS
   muito abaixo do benchmark do nicho = sinal de problema (tracking, oferta ou público), não
   só "campanha fraca". Usar como régua de leitura, não como meta cravada — cada negócio tem
   sua margem.
5. **Padrão do que converte.** O que as vencedoras têm em comum — tema, oferta, público,
   plataforma? Esse padrão é a matéria-prima das sugestões.

## Passo 5 — Entregar

Salvar em `producao/ads/analise-<YYYY-MM-DD>.md`:

```markdown
# Análise de Ads — [período]
## Resumo em uma frase
[a conclusão que o dono precisa ouvir]

## Ranking de campanhas
[tabela do script + leitura de cada linha em linguagem simples]

## Ações recomendadas
1. [pausar/ajustar X — economiza R$ Y/mês]
2. [escalar Z — melhor CPA da conta]
...

## Próximas campanhas sugeridas (baseadas no que converteu)
[2-3 propostas concretas: oferta, público, plataforma, por que os dados apontam pra ela]
→ aprovou alguma? /ads-google ou /ads-meta monta.

## Limites desta análise
[o que os dados NÃO mostram — atribuição, janela, sazonalidade]
```

Explicar em linguagem de dono de negócio, não de gestor de tráfego. Cada recomendação
com o número que a sustenta.

## Passo 6 — Gravar o que fica

Padrão consolidado (não número cru) vai pra seção **Tráfego pago** de
`nucleo/aprendizados.md`, com data e evidência em uma linha — é o que `/ads-google`,
`/ads-meta` e `/calendario` leem antes de propor o próximo ciclo. Primeira vez que
exports reais entram no sistema → atualizar `nucleo/escada.md` (degrau 4 no eixo de
dados de campanha).

**Campanha que converteu bem = gatilho de prova.** Resultado de tráfego acima da meta é
evidência fresca e momento de pico do cliente — sugerir rodar `/provas` pra capturar o
depoimento/caso agora ("essa campanha trouxe X leads/vendas — bom momento pra registrar
isso como prova"). O número da campanha vira caso com objeção que ele mata no banco.

## Regras

- Nunca recomendar pausa com dado insuficiente — dinheiro já gasto não volta, decisão
  precipitada queima aprendizado da conta.
- Sugestão de campanha nova sempre ancorada em padrão observado, nunca em achismo.
- Comparar plataformas só no que é comparável (CPA sim; CTR entre Google Search e Meta
  feed, não — são leilões diferentes).
- Análise recorrente: oferecer mensal, alimentando o `/calendario` e o ciclo seguinte.

---

**✓ Pronto:** ranking de campanhas por eficiência + ações + próximas campanhas sugeridas (cálculo só por script) · **→ próximo passo:** aprovou uma sugestão? `/ads-google` ou `/ads-meta` monta a nova campanha a partir do que converteu (humano sobe → mede de novo em ~30 dias). **Se o anúncio leva mas a PÁGINA de destino não converte** (clique caro vira pouca conversão), o gargalo é a landing, não a campanha: voltar pra `/copy` ou `/oferta` antes de gastar mais em mídia. Ads é esteira opcional. Pré-requisito que costuma faltar: os exports CSV no nível granular (anúncio/palavra) — se faltar, o sistema reorienta (analisa no nível disponível e marca o que ficou pendente).
