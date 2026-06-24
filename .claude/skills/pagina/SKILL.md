---
name: pagina
description: >
  Use para CRIAR uma landing page ou site de uma página com padrão premium (quando você
  ainda não tem site ou quer um novo) — "/pagina", "cria a landing page", "preciso de um
  site", "página de vendas", "página pro lançamento". Entrega HTML/CSS/JS completo com a
  identidade da marca, copy que converte, dados estruturados e verificação visual em
  múltiplos tamanhos de tela — o produto de R$ 5.000 do portfólio. (Para AJUSTAR uma
  página que já existe é o `/seo`; pra um diagnóstico geral da presença é o `/raio-x`.)
---

# /pagina — Landing page premium

A entrega mais valiosa do sistema. Página que não parece feita por IA, carrega rápido,
converte e responde bem tanto pra quem busca no Google quanto pra quem pergunta a uma
IA. Processo em etapas com aprovação visual — nunca um arquivão de uma vez.

Autoria: ImpulsoX AI. Conteúdo original.

## O que ler antes

- `marca/design-guide.md` + `marca/tokens.css` — sem marca, rodar `/identidade` antes
  (página premium sem identidade não existe; aqui a escada TEM degrau mínimo: 2)
- `marca/design-systems/` — a biblioteca de design systems extraídos/recombinados pela
  `/premium-design`; é de lá que sai o DS que rege a construção (ver Etapa 3)
- `nucleo/negocio.md`, `nucleo/voz.md` — oferta e voz
- `producao/raio-x/` — se houver diagnóstico, os vazamentos apontados viram requisitos

**Ferramentas opcionais (usar quando instaladas):**
- **Open Design** (plugin MCP `open-design`, daemon local em `127.0.0.1:7456`) — canvas de
  iteração visual ao vivo: criar projeto, gerar artefato, o usuário/cliente vê o design
  renderizar em tempo real e itera conversando. Ideal pra Etapa 2→3 e pra reunião de
  apresentação. Requer o daemon ativo (`pnpm tools-dev` na pasta do Open Design); se o
  MCP não responder, avisar como subir o daemon e seguir sem ele.
- **impeccable** — executor de qualidade de design anti-estética-de-IA. Instala por máquina
  (`claude plugin install impeccable@impeccable`); se `/impeccable` não existir, seguir sem
  ela. Comandos reais, cada um roda solto via `/impeccable <cmd>` (NÃO existe encadeamento
  fixo `init→shape→craft…`): `shape` (planejar UX antes de codar), `craft` (fluxo completo
  de construção), `critique` (hierarquia/clareza/ressonância), `audit` (a11y, performance,
  responsivo), `polish` (acabamento final), `typeset`/`layout`/`colorize` (tipografia, espaço,
  cor), `bolder`/`quieter`/`distill` (intensidade), `live` (variações no browser).
  Fluxo sugerido sobre o HTML gerado: `shape` → `craft` → `critique` + `audit` → `polish`.

**Regra firme:** quando usar Open Design ou impeccable, elas LEEM `marca/design-guide.md` +
`marca/tokens.css` e trabalham DENTRO da marca do negócio — nunca impõem paleta, fonte ou
identidade próprias. A marca é sempre a do cliente. (Num clone com a marca já preenchida,
`/impeccable init` pode capturar esse contexto de forma persistente; é opcional, porque a
regra de ler os arquivos da marca já garante a fidelidade.)

Sem nenhuma das duas, seguir o processo desta skill — as regras abaixo cobrem o essencial.

## Etapa 1 — Estrutura antes de pixel

Definir e aprovar com o usuário ANTES de codar (mensagem curta, não documento):
- **Promessa central** — a frase que segura a página inteira (na voz da marca)
- **Ordem das seções** — padrão que funciona: abertura com promessa + prova rápida →
  problema que o visitante reconhece → a oferta e como funciona → provas (depoimentos,
  números, portfólio REAIS) → quebra de objeções (FAQ) → chamada final
- **Uma conversão** — a página inteira empurra pra UMA ação (WhatsApp, formulário,
  compra). Duas chamadas = nenhuma.

## Etapa 2 — Copy

O texto vem antes do layout (layout serve o texto, não o contrário). **Esta etapa roda
o `/copy`** — a engine de copy de conversão da casa (headline em sprint, estrutura
provada, gate de repetição, voz da marca dirigindo). O `/pagina` consome
`producao/copy/<pagina>.md` como fonte do texto; não reescrever copy à mão aqui.

O que o `/copy` já garante (e esta etapa exige antes de seguir pro layout):
- Resposta direta no primeiro bloco: o visitante entende em 5 segundos o que é, pra
  quem e por que confiar
- Específico > superlativo: "atendemos em até 2h" > "atendimento ágil"
- FAQ com 5-8 perguntas reais respondidas de forma direta
- Prova que não existe não entra: sem depoimento real, a seção sai (instrução explícita
  de coleta no lugar)

**Gate de entrega da copy:** todo o texto passa pelo `/escritor-br` (naturalidade pt-BR)
ANTES de virar layout. Copy não revisada pelo `/escritor-br` não entra na Etapa 3.

## Etapa 3 — Construção

Antes de codar, escolher um design system de `marca/design-systems/` (ou rodar
`/premium-design` pra criar um a partir de referências reais). O DS é **lei** de cor,
tipo, espaçamento, animação e interação — a página o obedece. As proibições de estética
genérica abaixo continuam valendo como rede de segurança, não como ponto de partida.

- HTML5 semântico, CSS moderno (custom properties consumindo `marca/tokens.css`, grid,
  `clamp()` pra tipografia fluida), JavaScript só onde tem função
- Mobile-first de verdade: projetar a 390px primeiro, expandir depois
- Performance como requisito: imagens otimizadas (WebP, `loading="lazy"` abaixo da
  dobra), zero framework por padrão, fontes com `font-display: swap`
- **Hero rápido por padrão (requisito de LCP, não opcional):** a imagem/elemento LCP do
  hero leva `fetchpriority="high"` e um `<link rel="preload">` no `<head>` (e a fonte do
  headline também pré-carregada). É o conserto de maior impacto no LCP — não basta "imagem
  otimizada"; o navegador precisa saber priorizar o hero antes de descobrir o resto.
- **Formulário mínimo na conversão:** pedir só nome + um contato (WhatsApp/e-mail). Todo
  campo extra derruba conversão — reduzir o form chega a +120% de conversão. O resto
  (empresa, orçamento, detalhe) coleta no pós (resposta automática, próxima etapa), nunca
  na primeira ação.
- **CTA sticky/repetido no mobile:** no celular o botão da conversão fica sempre alcançável
  (barra fixa no rodapé ou CTA repetido ao longo do scroll). Ninguém deve precisar rolar de
  volta pro topo pra agir.
- `prefers-reduced-motion` respeitado em qualquer animação
- Dados estruturados no `<head>`: `LocalBusiness`/`Organization` + `FAQPage` do FAQ.
  A camada de Schema/GEO completa e suas regras moram no `/seo` (autoridade única) —
  rodar `/seo` antes de publicar fecha a auditoria on-page + citabilidade por IA
- Acessibilidade: contraste AA, foco visível, alt em toda imagem com conteúdo

**Proibições de estética genérica de IA** (mesmo espírito do `/identidade`): sem
degradê roxo-azul de template, sem grade de cards como primeira impressão, sem ícone
em quadradinho sobre cada título, sem Inter/Roboto como escolha nova. A página tem que
ter UM elemento memorável — um detalhe tipográfico, uma cor usada com coragem, um
layout de abertura que não está em todo template.

## Etapa 3.5 — Camada premium (efeitos e animação) ⭐

A página construída está na marca, bonita, mas pode estar **estática** — especialmente se a
base veio do Open Design (ótimo em compor, fraco em movimento). Aqui o `/premium-design`
entra no **Uso 2 (elevar)**: pega a página pronta e aplica a camada de movimento nível
agência — animações de entrada no scroll, hover/micro-interações, easing de **referência
premiada real** (não o `ease` default), reveal/profundidade onde o layout pede.
O vocabulário de efeitos (o que existe, quando dá WOW, quando mata performance, de onde
capturar) mora em `docs/craft-movimento.md` — o catálogo que o `/premium-design` lê pra
escolher o movimento certo, em vez de improvisar. Se o dono trouxer uma URL ("quero essa
animação"), é o **Uso 4** do `/premium-design`.

- **Padrão premium → `/premium-design` Uso 3:** mostrar ao cliente os **3 melhores sites do
  NICHO dele** (acervo `referencias-por-nicho.md`) → ele escolhe o estilo → re-estilizar a
  página naquele nível, com a marca CRAVADA (a marca vence sempre; do premiado vem só o
  "como", nunca a cor/fonte dele). O Uso 3 já traz a animação junto. É o que justifica o
  preço de posicionamento (10k+), não de "site bonito".
- O Uso 2 (só animar, sem reformar) é detalhe técnico interno pra página simples — não é
  opção de venda. Movimento de **referência real**, nunca inventado; a marca é lei.
- Movimento serve a marca e tem propósito (guia o olho, dá vida); nunca atropela a
  identidade nem afoga a página em efeito. `prefers-reduced-motion` sempre respeitado.
- Pular esta etapa quando a página é simples/institucional e o cliente não quer movimento —
  é refino, não obrigação. Mas pro produto de R$ 5.000, é o que justifica o preço.

## Etapa 4 — Verificação visual + performance (obrigatória)

**4a. Visual.** Abrir a página real (Playwright) e capturar screenshot em **390px, 768px e
1440px**. Olhar as imagens de verdade: texto vazando? hierarquia funciona no celular? botão da
conversão visível sem rolar no mobile? Corrigir e re-capturar até as três larguras estarem
certas. Mostrar as capturas ao usuário pra aprovação — ele aprova vendo.

**4b. Core Web Vitals (medir, não prometer).** Performance é requisito do produto R$ 5.000 —
não declarar "carrega rápido" sem medir. Rodar Lighthouse (ou medição equivalente via
Playwright) na página e conferir os limiares de 2026:
- **LCP ≤ 2,0s** · **INP ≤ 200ms** · **CLS ≤ 0,1** (LCP "good" caiu de 2,5s pra 2,0s no core
  update de mar/2026 — era 2,5s até então; INP substituiu o FID em 2024 — FID é métrica morta,
  não usar)
- Reprovou algum → consertar a causa antes de declarar pronto: LCP alto = imagem/hero pesado
  ou fonte bloqueando; INP alto = JS de animação (Etapa 3.5) travando a thread; CLS alto =
  imagem/fonte sem dimensão reservada. A camada de movimento (3.5) é o suspeito nº1 de INP —
  medir DEPOIS de aplicá-la, não antes.
- **Medir 2-3 vezes e usar a mediana, descartando o 1º run.** A primeira navegação de um
  processo de browser carrega o engine (cold start) e infla o LCP — um run isolado pode dar
  3s "falso" numa página que entrega 0,6s. Não condenar a página por uma medição só: rodar de
  novo, olhar a mediana. Se TODOS os runs (fora o 1º) reprovam, aí é problema real.
- Registrar os três números (a mediana) no `publicacao.md`. Página não é declarada pronta com
  CWV reprovado, do mesmo jeito que não é declarada pronta com texto vazando.

## Etapa 5 — Entrega

`producao/paginas/<slug>/` com `index.html`, assets e `publicacao.md` (como subir:
Vercel/Netlify/hospedagem própria, apontamento de domínio em passos simples). Variações
pra reunião comercial (cenário "site antigo, reunião amanhã"): gerar 2 direções da
Etapa 1 + abertura de cada uma renderizada — decisão visual na reunião, página completa
depois da escolha.

## Regras

- Conteúdo real sempre; placeholder explícito (`[SUBSTITUIR: foto da equipe]`) quando
  o material não existe — nunca texto fake que parece final.
- Página com formulário → mencionar política de privacidade (LGPD).
- Nunca declarar pronto sem a Etapa 4 executada com as três capturas conferidas.

---

**✓ Pronto:** landing page premium em `producao/paginas/<slug>/` (HTML/CSS/JS na marca, CWV medido) · **→ próximo passo:** `/seo` (Schema/GEO) e depois `/publicar` — página bonita que ninguém acha não vale. Pré-requisito que mais trava: **`marca/` precisa existir** — sem identidade não há página premium; se faltar, rodar `/identidade` antes (o sistema reorienta). _(Add-on opcional: `/agente-ia` põe um assistente que qualifica e captura lead 24/7 na página — o diferencial IA-Ready; é só pedir.)_
