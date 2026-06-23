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
- `nucleo/ofertas.md` — **cada oferta de prioridade alta é um grupo de anúncio candidato**
  (palavras-chave e copy saem do benefício e das objeções da oferta)
- `producao/ads/analise-*.md` — se `/analisar-ads` já rodou, as campanhas sugeridas lá
  são o ponto de partida (dados > opinião)

## Pré-requisito de medição (sem isso, o lance automático é cego)

Em 2026 o Smart Bidding aprende num mundo sem cookie de terceiro. O que faz ele funcionar é
**sinal próprio (first-party)**, não a tag genérica de conversão de anos atrás. Tratar como
pré-requisito do lançamento, não como ajuste posterior:

- **Enhanced Conversions for Leads** ligado + **import do GA4** como fonte de conversão.
  Manda dado hasheado (e-mail/telefone do lead, com consentimento) de volta pro Google — recupera
  conversão que o cookie perdeu (fontes 2026 reportam **+5-17% de conversões reportadas**) e é o
  que mantém o Smart Bidding preciso no cenário cookieless. Sem isso, a conta otimiza no escuro.
- **Pra gasto < R$ 25k/mês, Enhanced Conversions + Consent Mode v2 basta** — NÃO precisa de
  tracking server-side (GTM server). Server-side só compensa em volume alto; empurrar isso numa
  PME é custo e complexidade sem retorno.
- O guia visual entrega o passo a passo de ligar Enhanced Conversions for Leads e o import do GA4
  (com link do tutorial oficial), e o bloco de Consent Mode v2 (abaixo).

## Passo 1 — Fundamentos (perguntar só o que falta)

1. **Objetivo:** o que é uma conversão aqui? (ligação, WhatsApp, formulário, compra)
2. **Orçamento mensal:** valor confortável pra 90 dias de teste. Piso BR 2026 pra volume
   real de lead na Pesquisa: **R$ 2.000-3.000/mês** (CPC subiu ~13% em 2026). Abaixo disso,
   avisar que o dado vai demorar a dar sinal e que o Smart Bidding pode nem sair da fase de
   aprendizado — não recusar, calibrar expectativa e considerar concentrar em menos grupos.
3. **Região:** onde o negócio atende (cidade, raio, estado).
4. **Página de destino:** existe e sustenta a oferta? Sem página decente, parar e
   recomendar resolver isso antes de pagar clique (a skill de página resolve).

## Passo 2 — Estrutura

Padrão para serviço local / PME (ajustar ao caso):
- **1 campanha de Pesquisa** por linha de oferta (não misturar serviços distintos)
- **2-4 grupos de anúncio** por campanha, um por intenção de busca (ex: "preço/orçamento",
  "urgência", "comparação", "marca")
- **Palavras-chave e lance — em duas fases (honesto pra conta nova):**
  - **Fase 1 (sem histórico de conversão):** frase como base + exata nos termos de maior
    intenção. Lance: Maximizar cliques com teto de CPC. Sem ampla solta ainda — o Smart
    Bidding precisa de dados pra funcionar, e conta nova não tem.
  - **Fase 2 (após ~15-30 conversões rastreadas):** migrar pra **ampla (broad match) +
    Smart Bidding** (Maximizar conversões / Target CPA). Pesquisa 2026: ampla + Smart
    Bidding é hoje o setup mais escalável da Pesquisa (+~10% vs frase), porque captura
    intenção que não casa literal com a palavra. Exige conversão rastreada de qualidade.
  - Deixar isso explícito no plano: a conta começa controlada e migra pro automático
    quando tem dado — não jogar broad+Smart Bidding numa conta cega.
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
- **Performance Max — camada COMPLEMENTAR, nunca a base:** PMax entra depois que a Pesquisa
  prova intenção, não no lugar dela. Regras pra não queimar dinheiro:
  - **Só após 30+ conversões/mês** rastreadas na conta — abaixo disso a PMax não tem sinal pra
    otimizar e vira gasto cego.
  - **No máximo 20-30% do orçamento**, com a Pesquisa segurando a base.
  - **Brand exclusions + search themes são obrigatórios** — sem brand exclusions a PMax canibaliza
    o tráfego de marca (paga por quem já ia te achar de graça) e sem search themes ela traz lead
    lixo. Não montar PMax sem os dois.

## Passo 3 — Gerar o arquivo de importação

Salvar em `producao/ads/google-<slug>-<YYYY-MM-DD>.csv` no formato de colunas do Google
Ads Editor (Campaign, Ad Group, Keyword, Match Type, Headline 1-15, Description 1-4,
Final URL, etc.). Junto, gerar o **guia visual de leigo** (`producao/ads/google-<slug>-guia.html`
+ PDF, na marca de quem assina) — pra quem nunca abriu o Ads Editor:
- **Passo a passo de importação no Editor (5 passos, sem jargão)**, cada passo com:
  - **Diagrama/mockup desenhado** do que a tela mostra e onde clicar (HTML/CSS — NÃO
    screenshot real; o sistema não tem a ferramenta e não inventa print). Rotular como
    ilustração do fluxo, não captura de tela.
  - **Link do tutorial OFICIAL do Google** pra aquele passo (eles têm vídeo de tudo e nunca
    desatualiza) — ex.: baixar o Editor, importar CSV, configurar conversão.
- Configurações que o CSV não carrega (região, orçamento diário = mensal/30,4, lance
  inicial: CPC manual ou Maximizar cliques com teto no primeiro mês).
- **Consent Mode v2 + LGPD:** o guia inclui o bloco de banner de consentimento (aceitar/recusar
  cookie) ligado ao Consent Mode v2 — exigência pra Enhanced Conversions rodar e pra ficar dentro
  da LGPD. O **conversion modeling** do Google recupera ~69% das conversões de quem nega cookie
  (modela a partir de quem aceitou), então banner correto não significa perder o dado — só sem
  Consent Mode v2 é que a conversão de quem recusa some de vez.
- O que esperar (benchmark BR 2026 por setor, não só "100 cliques"): **CPC entre R$ 4 e R$ 25**
  conforme o nicho (serviço local mais barato, advogado/saúde/financeiro no topo) e **CPL entre
  R$ 15 e R$ 350**. Primeiras 2 semanas são aprendizado; julgamento sério só com volume real de
  conversão (≥30), não com cliques soltos. Dar a faixa do setor do cliente, nunca um número como
  promessa.
- **Quem executa:** deixar explícito no topo — ou o dono faz os 5 passos com este guia, ou
  a agência faz pelo cliente (com acesso à conta de ads dele). O sistema entrega pronto; o
  clique final é humano (automação de conta de ads viola termos e arrisca suspensão).

> Cabeçalho do CSV avisa: "confira as colunas contra o template atual do Google Ads
> Editor antes de importar" — o formato muda de versão pra versão.

## Passo 4 — Acompanhamento

Agendar com o usuário a primeira análise (`/analisar-ads`) para 30 dias após o início.
A campanha não termina no lançamento — começa nele.

## Regras

- Nunca prometer posição, clique ou resultado. Anúncio é leilão, não contrato.
- Palavra-chave de marca de concorrente: não usar no texto do anúncio (risco jurídico);
  como palavra-chave, só com o usuário ciente da prática e dos limites.
- Conversão sem rastreamento = campanha cega: o pré-requisito de medição (Enhanced Conversions
  for Leads + import GA4 + Consent Mode v2) é condição de lançamento, não opcional.
- Orçamento do cliente é do cliente: recomendar teto, nunca empurrar aumento sem dado.

---

**✓ Pronto:** campanha de Google Ads pronta pra importar + guia visual de leigo · **→ próximo passo:** o **humano sobe a campanha** no Ads Editor (guia visual; anúncio nunca sobe sozinho — viola termos), depois `/analisar-ads` em ~30 dias pra medir o que converteu. Ads é esteira opcional. Pré-requisito que costuma faltar: `marca/` e uma página de destino que sustente a oferta — se faltar, o sistema reorienta (rodar `/identidade`/`/pagina` antes de pagar clique).
