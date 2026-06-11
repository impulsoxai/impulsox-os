---
name: ads-google
description: >
  Use para criar campanha de Google Ads do zero — "/ads-google", "monta minha campanha
  do Google", "quero anunciar no Google", "campanha de pesquisa". Monta a campanha
  completa (estrutura, palavras-chave, anúncios, extensões, negativação) em arquivo
  pronto para importar no Google Ads Editor, com orçamento e expectativa honesta.
---

# /ads-google — Campanha de Google Ads pronta pra importar

Do contexto do negócio até o arquivo de importação. O usuário não precisa saber o que é
correspondência de frase — o sistema decide e explica em uma linha o porquê de cada
decisão.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Precisa do **degrau 1** (oferta, região e diferencial do `nucleo/negocio.md`). Abaixo
disso, perguntar o mínimo antes de montar — campanha sem oferta clara queima dinheiro.

## O que ler antes

- `nucleo/negocio.md` (oferta, região, diferencial) e `nucleo/foco.md` (prioridade)
- `producao/ads/analise-*.md` — se `/analisar-ads` já rodou, as campanhas sugeridas lá
  são o ponto de partida (dados > opinião)

## Passo 1 — Fundamentos (perguntar só o que falta)

1. **Objetivo:** o que é uma conversão aqui? (ligação, WhatsApp, formulário, compra)
2. **Orçamento mensal:** valor confortável pra 90 dias de teste. Abaixo de ~R$ 600/mês
   em pesquisa, avisar que o dado vai demorar a dar sinal — não recusar, calibrar
   expectativa.
3. **Região:** onde o negócio atende (cidade, raio, estado).
4. **Página de destino:** existe e sustenta a oferta? Sem página decente, parar e
   recomendar resolver isso antes de pagar clique (a skill de página resolve).

## Passo 2 — Estrutura

Padrão para serviço local / PME (ajustar ao caso):
- **1 campanha de Pesquisa** por linha de oferta (não misturar serviços distintos)
- **2-4 grupos de anúncio** por campanha, um por intenção de busca (ex: "preço/orçamento",
  "urgência", "comparação", "marca")
- **Palavras-chave:** 8-20 por grupo, correspondência de frase como base; exata para os
  termos de maior intenção. Sem ampla solta no início.
- **Negativas desde o dia 1:** lista por padrão (grátis, vaga, emprego, curso, "como
  fazer sozinho", concorrentes que não interessam) + as do nicho.
- **Anúncios:** 2 por grupo, responsivos — 10+ títulos (30 chars) e 4 descrições
  (90 chars) por anúncio, todos colados na intenção do grupo. Texto passa pelo
  `/escritor-br` — anúncio com cara de IA não clica.
- **Gatilhos nos títulos** (ver `docs/persuasao.md`): em 30 caracteres ganha quem é
  específico — número real ("desde 2011", "atendemos em 24h", "nota 4,9 ★"), prova
  social conferível e urgência **só quando verdadeira** (promoção com data real).
  Distribuir os títulos do responsivo entre 3 ângulos: especificidade/prova,
  benefício direto e chamada de ação — o leilão testa as combinações sozinho. PAS
  cabe nas descrições: a dor na primeira, a saída na segunda.
- **Extensões:** sitelinks, frase de destaque, chamada (telefone) e local quando houver.

## Passo 3 — Gerar o arquivo de importação

Salvar em `producao/ads/google-<slug>-<YYYY-MM-DD>.csv` no formato de colunas do Google
Ads Editor (Campaign, Ad Group, Keyword, Match Type, Headline 1-15, Description 1-4,
Final URL, etc.). Junto, gerar `producao/ads/google-<slug>-guia.md`:
- Passo a passo de importação no Editor (5 passos, sem jargão)
- Configurações que o CSV não carrega (região, orçamento diário = mensal/30,4, lance
  inicial: CPC manual ou Maximizar cliques com teto no primeiro mês)
- O que esperar: primeiras 2 semanas são aprendizado; julgamento sério só com ~100
  cliques por grupo

> Cabeçalho do CSV avisa: "confira as colunas contra o template atual do Google Ads
> Editor antes de importar" — o formato muda de versão pra versão.

## Passo 4 — Acompanhamento

Agendar com o usuário a primeira análise (`/analisar-ads`) para 30 dias após o início.
A campanha não termina no lançamento — começa nele.

## Regras

- Nunca prometer posição, clique ou resultado. Anúncio é leilão, não contrato.
- Palavra-chave de marca de concorrente: não usar no texto do anúncio (risco jurídico);
  como palavra-chave, só com o usuário ciente da prática e dos limites.
- Conversão sem rastreamento = campanha cega: incluir no guia a configuração da tag de
  conversão (ou importação do GA4) como pré-requisito do lançamento.
- Orçamento do cliente é do cliente: recomendar teto, nunca empurrar aumento sem dado.
