---
name: roi
description: >
  Use pra provar o dinheiro que o marketing trouxe — "/roi", "qual o retorno?", "quanto
  faturamos com isso?", "ROI da campanha", "vale o que gasto em ads?", "qual canal dá mais
  dinheiro?". Cruza o gasto de mídia (do /analisar-ads) com a receita real do CRM (deals
  ganhos + invoices pagas) e devolve faturamento influenciado, CAC e ROI por período. É o
  argumento que sustenta o ticket de agência: relatório fala em DINHEIRO, não em alcance.
  Lê o CRM via lib-crm (service token); cálculo só por script (dinheiro não se estima).
---

# /roi — O retorno em dinheiro, não em vaidade

`/desempenho` mede alcance/save/send; `/analisar-ads` mede CPL/conversão de plataforma.
Nenhum amarra ao **dinheiro que entrou**. Esta skill fecha o circuito: gasto de mídia ×
receita real do CRM → faturamento influenciado, CAC, ROI. É o que faz o `/relatorio` dizer
"geramos R$X de receita" em vez de "tivemos N leads" — a diferença entre gerador de conteúdo
e parceiro de crescimento.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda no degrau 4 (dados reais): precisa do CRM no ar (token) + gasto de ads. Sem o gasto,
entrega só a receita do CRM e marca o ROI como pendente. Sem o CRM, reorienta (não inventa
número).

## O que ler antes

- `.env` do clone: `CRM_BASE_URL` + `CRM_TOKEN` (service token `ixk_live_` do tenant, scope
  `data:read`). Sem isso, a skill para e pede a config (não chama o CRM sem token).
- `producao/ads/analise-<data>.md` — o gasto de mídia do período (do `/analisar-ads`). Sem
  ele, rodar `/analisar-ads` antes ou informar o gasto manualmente.
- `nucleo/foco.md` — a meta/KPI do contrato (pro ROI ser lido contra o objetivo).

## Como roda

1. **Config.** Montar o cliente do CRM com `crmFromEnv()` da `scripts/lib-crm.mjs`. Sem
   token → parar e instruir o dono a gerar a chave (aba Integrações do CRM, scope
   `data:read`) e pôr no `.env`.
2. **Puxar a receita do CRM** via `lib-crm`:
   - `getReports(c)` → receita 6m + trend, ticket médio, receita/mês, deals/mês, leads por
     canal, top 5 clientes (é o agregado pronto — fonte principal).
   - quando precisar de detalhe: `listDeals(c)` (ganhos/valor) e `listInvoices(c)` (pagas =
     dinheiro que entrou de verdade).
3. **Puxar o gasto** de `producao/ads/analise-<data>.md` (ou o que o dono informar).
4. **Calcular por script** (`scripts/lib-roi.mjs`, determinístico — dinheiro nunca de
   cabeça): faturamento influenciado, CAC (gasto ÷ clientes novos), ROI ((receita − gasto) ÷
   gasto), ROAS quando aplicável.
5. **Entregar** o relatório: receita real, gasto, ROI/CAC, e a leitura contra a meta do
   `foco.md`. Marcar o que é fato (CRM) vs o que foi estimado (gasto informado à mão).

## Limites honestos (estado atual da ponte com o CRM)

- **Atribuição só por CANAL, não por campanha.** O CRM hoje tem `channel` categórico
  (whatsapp/site/instagram/indicacao), sem UTM granular (sub 1 da F-OS ainda não feito). O
  ROI sai por canal; "qual ANÚNCIO/campanha exata deu a venda" espera o UTM no Contact
  (PRD 3.2). Declarar isso no relatório — não fingir precisão de campanha.
- **Sem filtro de período nos GETs ainda** (sub 2). O `getReports` traz a janela que ele
  entrega (6m); recorte fino por data espera o filtro. Usar o que vier e marcar a janela.
- **Atribuição ≠ incremental.** ROAS de plataforma infla 2-5x (regra do `/analisar-ads`); o
  ROI do CRM (receita real ÷ gasto) é mais honesto, mas ainda é correlação, não prova causal.
  Dizer isso ao dono.

## Regras

- **Dinheiro só por script.** Nenhum cálculo financeiro de cabeça — sempre `lib-roi.mjs`.
- **Só dado real.** Receita vem do CRM; gasto vem do `/analisar-ads` ou informado. Faltou
  um lado → marcar pendente, nunca inventar.
- **Token nunca no relatório/log** — a `lib-crm` já redige; não colar o token em lugar nenhum.
- **Nunca ler o Postgres do CRM direto** — só pela API (isolamento por tenant).
- É MOTOR: nasce no template, desce via `/atualizar-motor`.

## Teste de aceitação (comportamental)

1. CRM no ar + gasto do mês → relatório com receita real, ROI/CAC por script, lido contra a
   meta; atribuição marcada como "por canal".
2. Sem `CRM_TOKEN` no `.env` → para e instrui a gerar a chave; não chama o CRM.
3. Sem gasto de ads → entrega a receita do CRM e marca ROI como pendente (não inventa gasto).
4. Relatório sempre declara os limites (canal, não campanha; correlação, não causa).

---

**✓ Pronto:** ROI em dinheiro (receita real do CRM × gasto), CAC e leitura contra a meta — atribuição por canal, limites declarados · **→ próximo passo:** `/relatorio` — leva o ROI pro relatório executivo do cliente (o topo OUTCOME). Pré-requisito: `CRM_TOKEN` no `.env` + gasto do `/analisar-ads`; se faltar, o sistema reorienta.
