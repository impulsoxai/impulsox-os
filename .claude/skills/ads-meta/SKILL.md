---
name: ads-meta
description: >
  Use para criar campanha de Meta Ads (Instagram + Facebook) do zero — "/ads-meta",
  "quero anunciar no Instagram", "campanha no Facebook", "impulsionar de verdade".
  Monta a campanha completa (objetivo, públicos, criativos com a identidade da marca,
  orçamento) como plano de configuração passo a passo para o Gerenciador de Anúncios,
  com os criativos prontos gerados pelo /post.
---

# /ads-meta — Campanha de Meta Ads com criativo da marca

Meta Ads vive e morre pelo criativo. Esta skill monta a estrutura E produz os criativos
(via `/post`, com a identidade de `marca/`) — a parte que o dono do negócio não
conseguiria fazer sozinho no Gerenciador.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Precisa do **degrau 1** pra estrutura; os criativos pedem **degrau 2** (marca). Sem
marca, gera o plano e marca os criativos como defaults até a `/identidade` rodar.

## O que ler antes

- `nucleo/negocio.md`, `nucleo/foco.md`, `marca/design-guide.md`
- `nucleo/provas.md` — o criativo de prova só usa material com status autorizada
- `producao/ads/analise-*.md` — se existe análise, partir das sugestões dela
- `producao/posts/` — criativos orgânicos que performaram são candidatos a anúncio

## Passo 1 — Fundamentos (perguntar só o que falta)

1. **Objetivo real:** mensagem no WhatsApp? lead? venda no site? visita ao perfil?
   (Traduzir para o objetivo de campanha certo — quem não sabe marketing escolhe
   "engajamento" e queima dinheiro.)
2. **Orçamento mensal** confortável pra 60-90 dias.
3. **Região e público base:** quem compra, idade aproximada, onde mora.
4. **Destino:** WhatsApp, formulário, site? Conferir que existe e funciona.

## Passo 2 — Estrutura

Padrão enxuto (PME aprende mais rápido com menos campanhas):
- **1 campanha** pelo objetivo definido (vendas/leads/tráfego — CBO ligado)
- **2-3 conjuntos de anúncio:**
  - Público amplo na região (a entrega da Meta otimiza sozinha — confiar no algoritmo
    com criativo segmentando por mensagem)
  - Interesse direto do nicho (1-3 interesses, não 15)
  - Remarketing (envolvidos com perfil/site, 30-60 dias) — quando a base existir
- **3-4 criativos por conjunto**, formatos misturados:
  - Estático 1080x1350 (gerado pelo `/post` com a marca)
  - Carrossel quando a oferta tem etapas ou portfólio
  - Roteiro de vídeo curto (o usuário grava; vídeo nativo costuma ganhar)

## Passo 3 — Criativos e textos

Acionar o **`/post`** para cada peça estática/carrossel, com a diretriz de anúncio:
gancho mais direto que o orgânico, oferta explícita, uma chamada só. Textos (primário
125 chars visíveis, título 40, descrição 30) passam pelo **`/escritor-br`**.

**Persuasão por criativo** (ver `docs/persuasao.md`): cada criativo do conjunto carrega
**um ângulo de gatilho diferente** — é isso que "variação real" significa:
- um de **prova/transformação** (caso real, antes/depois com material verdadeiro)
- um de **aversão à perda** (o custo de continuar como está, nomeado sem terrorismo)
- um de **curiosidade** (loop aberto no gancho que o próprio criativo fecha)
- a oferta com **escassez só quando real** (turma com data, agenda com limite)

Texto primário em PAS quando é anúncio frio: a dor como o público descreve →
o custo de conviver com ela → a saída com chamada única. As 125 chars visíveis têm que
segurar sozinhas — o "ver mais" é o corte. Remarketing inverte: já conhecem a marca,
abrir direto na oferta com prova.

Regras de criativo que evitam reprovação e fadiga:
- Sem promessa de resultado garantido, sem "você" acusatório em tema sensível (políticas
  da Meta), sem antes/depois enganoso
- Escassez inventada além de antiética é risco de conta: a Meta pune urgência falsa
  como prática enganosa
- Variação real entre criativos (ângulos diferentes, não a mesma arte em 4 cores)

## Passo 4 — Plano de configuração

Meta Ads não tem importação tipo Editor pra PME — entregar
`producao/ads/meta-<slug>-<YYYY-MM-DD>.md` com:
- Tabela campanha → conjuntos → anúncios (nomes padronizados: `[objetivo]-[publico]-[data]`)
- Passo a passo no Gerenciador (em ordem de tela, sem jargão)
- Pixel/API de conversões como pré-requisito quando o destino é site
- Arquivos dos criativos prontos na pasta
- Janela de aprendizado: não mexer por 7 dias ou ~50 conversões por conjunto; primeira
  leitura séria em 30 dias com `/analisar-ads`

## Regras

- Criativo orgânico vencedor vira anúncio antes de arte nova — dado > estreia.
- Nunca prometer CPM/CPA/resultado. Leilão muda todo dia.
- Orçamento mínimo honesto: abaixo de ~R$ 20/dia por conjunto, consolidar conjuntos.
- Conta de anúncio, página e pixel são do cliente — o sistema orienta, nunca pede senha.
- Remarketing respeita a LGPD: avisar sobre política de privacidade na página quando
  houver pixel.
