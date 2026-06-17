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
- **Meta:** desagregar por **Anúncio** (e por **Criativo**), não parar no conjunto.
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
3. **Sinal fino.** Dado insuficiente (< ~100 cliques na campanha) = "sem veredito ainda",
   nunca conclusão forçada.
4. **Padrão do que converte.** O que as vencedoras têm em comum — tema, oferta, público,
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

## Regras

- Nunca recomendar pausa com dado insuficiente — dinheiro já gasto não volta, decisão
  precipitada queima aprendizado da conta.
- Sugestão de campanha nova sempre ancorada em padrão observado, nunca em achismo.
- Comparar plataformas só no que é comparável (CPA sim; CTR entre Google Search e Meta
  feed, não — são leilões diferentes).
- Análise recorrente: oferecer mensal, alimentando o `/calendario` e o ciclo seguinte.
