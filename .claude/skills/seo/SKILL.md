---
name: seo
description: >
  Use quando uma página que JÁ EXISTE precisa ser achada no Google E estruturada pra ser
  citável por IA — "/seo", "otimiza essa página", "deixa o site achável", "Schema da
  página", "SEO da landing", ou logo depois do /pagina antes de publicar. Faz auditoria
  on-page + os blocos GEO da página (Schema JSON-LD, answer-first, FAQ, robots pra
  GPTBot/ClaudeBot/CCBot, llms.txt) e entrega o relatório com nota mais os blocos prontos
  pra colar. Serve pra página do /pagina, site externo por URL, ou artigo do /conteudo.
  (Use esta pra AJUSTAR uma página existente. Diagnóstico geral da presença — "por que não
  apareço no Google?" — é o `/raio-x`; medir se as IAs CITAM a empresa e o monitoramento
  mensal é o `/geo`.)
---

# /seo — Achável no Google, citável pela IA

Em 2026 uma página precisa vencer dois jogos. O antigo: rankear na busca do Google. O
novo: ser a fonte que o ChatGPT, o Gemini e o Google AI Overview citam quando alguém
pergunta. Os dois se ganham com a mesma base — conteúdo claro, estruturado e marcado pra
máquina ler — mas o segundo exige coisas que o SEO clássico ignora. Esta skill cobre os
dois e entrega o conserto pronto, não só o diagnóstico.

Autoria: ImpulsoX AI. Conteúdo original.

## Princípio que rege esta skill

Aplica a **Escada de Contexto** (ver CLAUDE.md). Roda em qualquer degrau:
- **Página local** (arquivo HTML do `/pagina`): audita o código direto, conserta no arquivo.
- **URL externa**: usa a skill de scraping (firecrawl) pra ler a página, audita o que dá
  ver de fora e entrega os blocos pro dono colar.

Lê `nucleo/negocio.md` (o que a empresa faz, pra quem) e `nucleo/foco.md` (prioridade)
pra ancorar palavra-chave e ângulo na realidade do negócio — nunca otimizar pra termo que
não tem a ver com o que ela vende.

## Regra inegociável — SEO honesto

- **Nada de encher de palavra-chave.** Texto é pra pessoa ler; a otimização é estrutural,
  não repetição mecânica. Keyword stuffing derruba no Google e queima a marca na IA.
- **Conteúdo real.** Não inventar dado, FAQ falsa nem número pra preencher Schema. Campo
  sem material vira instrução de substituição, nunca texto fabricado.
- **Schema só do que existe na página.** Marcação estruturada descreve o conteúdo real —
  marcar review/preço/evento que a página não mostra é violação de diretriz do Google.

## Fase 1 — Definir o alvo e a intenção

1. Qual página? (arquivo do `/pagina`, URL externa, ou artigo)
2. Qual a **pergunta** que essa página responde? Em GEO, a página existe pra ser a melhor
   resposta a uma dúvida real do cliente. Se o dono não sabe, derivar do `nucleo/` e
   confirmar.
3. Palavra-chave principal + 2-3 variações de cauda longa, ancoradas no que o negócio
   vende e na região (se for negócio local — cruzar com a `/local`).

## Fase 2 — Auditoria on-page (o jogo do Google)

Conferir e anotar nota por item (✅ ok / ⚠️ ajustar / ❌ ausente):

**Cabeça da página**
- `<title>` único, 50-60 caracteres, com a palavra-chave no começo
- `meta description` 140-160 caracteres, escrita como resposta direta (não slogan) — é a
  primeira chance de aparecer como citação
- Um único `<h1>`, batendo com a intenção da página
- Hierarquia de headings (`h2`/`h3`) lógica, sem pular nível

**Corpo e mídia**
- Conteúdo responde a pergunta nos primeiros parágrafos (answer-first)
- Imagens com `alt` descritivo e real; arquivos com nome semântico
- Links internos pra páginas relacionadas; links externos pra fonte quando cita dado
- URL curta, com a palavra-chave, sem parâmetro lixo

**Técnico**
- `<html lang="pt-BR">`, charset, viewport mobile
- Canonical correto; sem `noindex` acidental
- Open Graph + Twitter Card pra compartilhamento
- Sinais de Core Web Vitals (imagem dimensionada, sem layout shift óbvio, CSS/JS enxuto)
  — alinhar com o padrão do `marca/design-guide.md`. Régua de 2026: **LCP ≤ 2,0s · INP ≤
  200ms · CLS ≤ 0,1** (LCP "good" caiu de 2,5s pra 2,0s no core update de mar/2026 — era 2,5s
  até então; INP substituiu o FID em 2024)

## Fase 3 — Blocos GEO da página (o jogo da IA, on-page)

O que faz a página ser **citada** por motor generativo, além de rankeada — a parte que
mora no código da página. (Medir se a empresa É citada hoje, mapear as fontes que a IA usa
no nicho e o loop mensal é o `/geo`; aqui é a execução estrutural numa página.)

- **Answer-first em cada seção.** A resposta vem antes da história. IA extrai parágrafos
  auto-suficientes — cada bloco precisa fazer sentido fora de contexto.
- **FAQ real e estruturado — agora por citabilidade IA, não por rich result.** Mínimo 8
  perguntas que o cliente de fato faz, com resposta direta e **standalone** (cada resposta
  faz sentido sozinha, fora da página). Vira `FAQPage` em JSON-LD. **O `FAQPage` deixou de
  gerar a sanfona de rich result na SERP do Google** (rich result aposentado em mai/2026) —
  então não se mantém o FAQ "pra ganhar espaço no Google"; mantém-se porque **ChatGPT,
  Perplexity e AI Overviews leem essas respostas standalone e citam**. Mudou o porquê, não o
  bloco: continua valendo, agora pela IA.
- **Schema JSON-LD — entidade primeiro.** Do que a página é: `Organization`/`LocalBusiness`,
  `WebSite`, `BreadcrumbList`, `FAQPage`, e `Service`/`Product`/`Article` conforme o caso, tudo
  refletindo o conteúdo real. **Priorizar o Schema de ENTIDADE:** a `Organization` (ou `Person`,
  pra criador) com `name` canônico, **`sameAs`** (URLs dos perfis oficiais — Instagram, LinkedIn,
  Google Business, YouTube) e **`knowsAbout`** (os temas em que a marca é autoridade), e
  identificadores externos quando existirem. É o que liga a página a uma entidade reconhecível —
  o que a IA usa pra saber QUEM é e decidir citar. Puxar essa semente do `marca/design-guide.md`
  (seção Entidade, preenchida no `/identidade`); o que faltar lá, completar aqui e devolver.
- **Schema em HTML ESTÁTICO, não injetado por JS.** O bloco `<script type="application/ld+json">`
  tem que estar no HTML cru entregue pelo servidor — **não** adicionado depois por JavaScript
  (GTM, framework client-side). Motivo: Perplexity e ChatGPT leem o HTML como vem, **não executam
  JS** — Schema injetado por JS simplesmente some pra eles. (O Google até renderiza JS, mas a IA
  não — e o jogo aqui é a IA.) Auditar: o Schema aparece no "ver código-fonte" da página, não só
  no DOM depois de carregar? Se só no DOM, está invisível pra quem mais importa.
- **Dado citável.** Número, prazo e fato específico (com fonte) são o que a IA prefere
  citar — vago não vira citação. Puxar do `nucleo/provas.md` quando houver prova autorizada.
- **Acesso pra crawler de IA.** `robots.txt` liberando `GPTBot` (OpenAI), `ClaudeBot`
  (Anthropic), `CCBot` (Common Crawl), `Google-Extended` (Gemini) e `PerplexityBot`.
  Recomendado: `llms.txt` na raiz — índice curado do conteúdo mais importante pra LLM
  (prática crescente 2026; LLM em RAG puxa daí pra citar).
- **Meta description como resposta.** Reforço da Fase 2: escrita pra ser lida em voz alta
  como a resposta à pergunta da página.

## Fase 4 — Entregar conserto + relatório

Dois produtos:

1. **Os blocos prontos.** Gerar pra colar (ou aplicar direto se a página é arquivo local):
   - `<title>`, `meta description`, OG/Twitter tags reescritos
   - bloco `<script type="application/ld+json">` com o Schema completo
   - o HTML da seção FAQ (8+ Q&A reais)
   - linhas de `robots.txt` (e `llms.txt` se fizer sentido)
   Página local do `/pagina` → aplicar no arquivo e re-verificar visualmente se nada quebrou.

2. **Relatório com nota.** Tabela item a item (✅/⚠️/❌), nota geral 0-10 separada em
   **Google (on-page)** e **GEO (citabilidade)**, e a lista priorizada do que consertar
   primeiro — o que dá mais resultado no topo. Linguagem de dono de negócio, não de técnico.
   Quando o Schema estiver completo e estático, **dimensionar o ganho de citação** pra justificar
   o esforço: página com Schema completo é citada ~2,7x mais no Perplexity e ~3,1x mais nas AI
   Overviews do Google que a mesma página sem Schema. É o argumento de por que vale o trabalho —
   número de referência, não promessa por página.

## Encaixe com o resto do sistema

- Depois do **`/pagina`**: rodar `/seo` antes de publicar é o passo que fecha a entrega
  de R$ 5.000 — página bonita que ninguém acha não vale.
- Dentro do **`/raio-x`**: a auditoria on-page/GEO alimenta a nota de presença digital.
- O **`/geo`** mede se as IAs citam a empresa e mapeia as fontes do nicho; quando o plano
  dele pede Schema/FAQ numa página, é o `/seo` que gera os blocos. /geo decide, /seo marca.
- Para negócio local: cruzar com **`/local`** (o jogo do Maps é o complemento do orgânico).
- Todo texto novo (FAQ, meta) passa pelo **`/escritor-br`** antes de fechar.

## Regras

- Nunca prometer posição no Google ("primeiro lugar garantido"). SEO é probabilidade, não
  contrato — dizer o que melhora e por quê, sem garantia que ninguém pode dar.
- Otimização nunca piora a leitura pra pessoa. Se um ajuste de SEO deixa o texto pior pro
  humano, o humano ganha.
- Schema e FAQ saem de conteúdo real da página. Sem material → instrução de substituição.

---

**✓ Pronto:** auditoria on-page + GEO com nota e blocos prontos pra colar (Schema, FAQ, robots/llms.txt) · **→ próximo passo:** `/publicar` — sobe a página já achável no Google e citável por IA. Pré-requisito: a página pronta; se faltar, voltar pro `/pagina` antes.
