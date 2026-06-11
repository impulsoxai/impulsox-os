---
name: seo
description: >
  Use quando uma página precisa ser achada no Google E citada pelas IAs — "/seo",
  "otimiza essa página", "por que não apareço no Google?", "deixa o site achável",
  "quero aparecer no ChatGPT", "SEO da landing", ou logo depois do /pagina antes de
  publicar. Faz auditoria on-page + camada GEO (Schema JSON-LD, answer-first, FAQ,
  robots pra GPTBot/CCBot) e entrega o relatório com nota mais os blocos prontos pra
  colar. Serve pra página do /pagina, site externo por URL, ou artigo do /conteudo.
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
  — alinhar com o padrão do `marca/design-guide.md` e o alvo do CLAUDE.md global
  (LCP < 2.5s, CLS < 0.1)

## Fase 3 — Camada GEO (o jogo da IA)

O que faz a página ser **citada** por motor generativo, além de rankeada:

- **Answer-first em cada seção.** A resposta vem antes da história. IA extrai parágrafos
  auto-suficientes — cada bloco precisa fazer sentido fora de contexto.
- **FAQ real e estruturado.** Mínimo 8 perguntas que o cliente de fato faz, com resposta
  direta. Vira `FAQPage` em JSON-LD.
- **Schema JSON-LD** do que a página é: `Organization`/`LocalBusiness`, `WebSite`,
  `BreadcrumbList`, `FAQPage`, e `Service`/`Product`/`Article` conforme o caso. Tudo
  refletindo o conteúdo real.
- **Dado citável.** Número, prazo e fato específico (com fonte) são o que a IA prefere
  citar — vago não vira citação. Puxar do `nucleo/provas.md` quando houver prova autorizada.
- **Acesso pra crawler de IA.** `robots.txt` liberando `GPTBot`, `CCBot`, `Google-Extended`,
  `PerplexityBot`. Opcional: `llms.txt` na raiz resumindo o que o site oferece pra LLM.
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

## Encaixe com o resto do sistema

- Depois do **`/pagina`**: rodar `/seo` antes de publicar é o passo que fecha a entrega
  de R$ 5.000 — página bonita que ninguém acha não vale.
- Dentro do **`/raio-x`**: a auditoria on-page/GEO alimenta a nota de presença digital.
- Para negócio local: cruzar com **`/local`** (o jogo do Maps é o complemento do orgânico).
- Todo texto novo (FAQ, meta) passa pelo **`/escritor-br`** antes de fechar.

## Regras

- Nunca prometer posição no Google ("primeiro lugar garantido"). SEO é probabilidade, não
  contrato — dizer o que melhora e por quê, sem garantia que ninguém pode dar.
- Otimização nunca piora a leitura pra pessoa. Se um ajuste de SEO deixa o texto pior pro
  humano, o humano ganha.
- Schema e FAQ saem de conteúdo real da página. Sem material → instrução de substituição.
