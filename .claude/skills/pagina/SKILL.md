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

- `docs/gabarito-execucao-visual.md` — **PRIMEIRO**: QA visual com defeitos nomeados nos 3 tamanhos (390/768/1440) + gate antes do passo caro (copy fechada antes de 1 linha de HTML). Nenhum gate é opcional
- `marca/design-guide.md` + `marca/tokens.css` — sem marca, rodar `/identidade` antes
  (página premium sem identidade não existe; aqui a escada TEM degrau mínimo: 2)
- `marca/design-systems/` — a biblioteca de design systems extraídos/recombinados pela
  `/premium-design`; é de lá que sai o DS que rege a construção (ver Etapa 3)
- `nucleo/negocio.md`, `nucleo/voz.md` — oferta e voz
- `producao/raio-x/` — se houver diagnóstico, os vazamentos apontados viram requisitos
- `docs/acervo-landing-matt.md` — sistema de landing do Matt Ganzak destilado (regras de
  processo: um destino de funil por página decidido pela temperatura do tráfego, fact-check
  antes de entregar, mobile antes de "pronto", gate de aprovação nomeado no fecho; e a
  régua de regime: página de CONVERSÃO direta = copy manda e design sai da frente; página
  de POSICIONAMENTO WOW = eixo cinematográfico. Perguntar o job da página antes de escolher)

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

## Etapa 0 — O que já converte no nicho (substância antes de estilo)

Antes da promessa, saber o que **já funciona** no nicho — não inventar do zero. Os melhores
sites do nicho já pagaram o custo de descobrir que estrutura, que seções e que CTA convertem
ali (mesma regra de "copiar a fórmula de quem já faz sucesso" do CLAUDE.md). Com **Firecrawl**
(MCP/skill já instalada), pesquisar os **5 top-performers do nicho** (avaliados por reviews
Google/Trustpilot, ranking de busca) e extrair, em resposta curta:

1. **Pra quem é** — o VISITANTE, não o negócio (ex.: "dono de casa na zona sul com piso manchado")
2. **A UMA ação** que a página empurra (orçamento, WhatsApp, agendar)
3. **Objeções** que o visitante tem (preço, confiança, prazo)
4. **O vibe** do nicho (sóbrio/premium, popular/direto, técnico)
5. **Seções recorrentes** nos top-5 (qual ordem aparece em quem converte)
6. **Voice of Customer (VoC) — a fala LITERAL do comprador.** Minerar as REVIEWS dos top-5 (e do
   próprio negócio, se houver) pra extrair as palavras exatas que o cliente usa pra descrever a dor
   e o resultado. É o insumo de maior alavancagem que existe — copy que usa a fala do cliente bate
   headline genérica com folga. A copy (Etapa 2 / `/copy`) usa isso direto; não inventar a dor,
   colher a dor dita.
7. **Faixa de conversão-alvo do nicho** — registrar o benchmark pra calibrar expectativa honesta
   (mediana de landing 2026 ~4%; serviços profissionais ~5,5-7,8%; topo >11%). Vira a meta contra
   a qual a página é medida no pós (Etapa 5), não promessa.

O resultado vira **requisito** da copy (Etapa 2) e do wireframe (Etapa 1) — não enfeite. A pesquisa
olha o concorrente (estrutura) E a fala do comprador (VoC) — as duas coisas, não só a primeira.
Degrau da Escada: roda mesmo sem Firecrawl (defaults marcados "confirmar"), mas com a
pesquisa a página nasce no padrão de quem já vende no nicho. Quando há `/raio-x` ou
`/concorrente` no `producao/`, reaproveitar esses achados em vez de refazer.

## Etapa 1 — Estrutura antes de pixel

Definir e aprovar com o usuário ANTES de codar (mensagem curta, não documento):
- **Promessa central** — a frase que segura a página inteira (na voz da marca)
- **Ordem das seções** — padrão que funciona: abertura com promessa + prova rápida →
  problema que o visitante reconhece → a oferta e como funciona → provas (depoimentos,
  números, portfólio REAIS) → quebra de objeções (FAQ) → chamada final
- **Uma conversão** — a página inteira empurra pra UMA ação (WhatsApp, formulário,
  compra). Duas chamadas = nenhuma.

**Landing de conversão ou site institucional? São produtos DIFERENTES — não confundir.** Multi-página
NÃO é "mais premium": é mais páginas, e mais páginas brigam com conversão. Tirar a navegação de uma
landing chega a **dobrar a conversão** (VWO/Yuppiechef: 3%→6%) — menu = caminhos de fuga. Escolher
pelo JOB, não pelo preço:
- **Landing de conversão** (default pra tráfego pago, lançamento, captura de lead) — **SEM menu de
  navegação**, sticky CTA, **UMA ação**. KPI = taxa de conversão. É o fluxo padrão das Etapas 2-5.
  Nunca adicionar páginas "pra parecer mais completo": cada saída derruba a conversão.
- **Site institucional multi-página** (quando o job é descoberta/SEO por página — serviço local que
  ranqueia por "X em [cidade]", autoridade, catálogo) — home + serviços + sobre + contato. KPI =
  presença/SEO, não conversão de tráfego pago. Antes do pixel, montar e aprovar um **sitemap +
  wireframe** (mapa de páginas + ordem das seções em caixas cinza, sem estilo): "substância antes
  de estilo". Cada página repete Etapas 2-4, uma conversão por página, Schema por página, entrega
  em `producao/paginas/<slug>/` com rota por página. (Open Design ajuda a montar o wireframe ao vivo.)

  Regra de ouro: tráfego pago → SEMPRE landing de conversão (sem menu). Multi-página só quando o
  objetivo declarado é ser ACHADO (SEO/descoberta), não converter clique pago. Na dúvida, landing.

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
escolher o movimento certo, em vez de improvisar. A direção criativa que faz a página parecer
cara MESMO PARADA (tipografia em escala, cor com coragem, profundidade/textura, composição, 3D
via Spline/Rive) e o mapa das 8 técnicas premiadas mora em `docs/dna-cinematografico.md` — ler
quando o cliente quer "nível agência / WOW"; a regra de lá é hero estático impecável > hero
animado genérico. Se o dono trouxer uma URL ("quero essa
animação"), é o **Uso 4** do `/premium-design`.

**Regra GEO-safe (não-negociável — resolve a briga cinematográfico × IA-Ready):** nenhum crawler
de IA renderiza JavaScript em 2026 (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot). Conteúdo que
precisa ser CITADO pela IA — headline, parágrafo de resposta (answer-first), FAQ, Schema JSON-LD —
**nasce em HTML estático no source**, visível sem rolar e sem JS. O movimento desta etapa é
**progressive enhancement SOBRE texto que já está lá**: o text-split anima um `<h1>` que já existe
no HTML; o reveal no scroll mostra um parágrafo que já está no DOM; o Schema está no `<head>`, não
injetado por JS. Nunca prender conteúdo citável atrás de IntersectionObserver, scroll ou render de
JS — isso o torna invisível pra quem cita (e tráfego de IA converte ~5x mais que orgânico). O `/seo`
audita isso; aqui é onde se evita o furo. Mesma lógica pro vídeo: o texto do hero é HTML, o vídeo é
fundo decorativo por cima — nunca o texto dentro do vídeo.

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

**Vídeo hero cinematográfico (OPCIONAL — não é o default, e cuidado com "AI slop").** O default
premium é **hero estático com direção de arte impecável** — `docs/dna-cinematografico.md` é claro:
hero estático bem-dirigido vence hero animado genérico. Vídeo de produto por IA em loop só entra
quando passa em DOIS testes, senão vira o "AI slop" que o público de 2026 aprendeu a farejar (só
26% preferem conteúdo de IA hoje, era 60% em 2023; marcas estão banindo IA em campanha por
backlash):
1. **Cena REAL e específica do cliente** — produto/ambiente/pessoa que existem, não um genérico de
   banco de prompt. Vídeo de IA de "bag de café qualquer" grita IA; o produto real do cliente, não.
2. **Prova ou emoção, não enfeite** — o vídeo mostra o resultado/transformação que importa, não
   movimento por movimento.

Não passou nos dois → hero estático. Quando passa, a receita (validada nos canais de referência):
1. **Imagem-base com logo** — gerar o produto/cena com o logo da marca embutido (Nano Banana 2
   ou equivalente), 16:9, 2K. (Pra peça de motion-graphics em vez de produto real, é o `/reel-marca`.)
2. **Loop perfeito** — usar **start frame = end frame** (modelo que aceita os dois, ex.: Kling)
   pra o vídeo fechar no ponto onde começou; sem corte visível. ~7s é o sweet spot.
3. **Hero com contraste** — vídeo como `<video autoplay muted loop playsinline>` de fundo, com
   overlay/escurecimento garantindo contraste AA do texto na frente. Truque: escurecer as bordas
   pra o vídeo fundir no fundo da seção.
4. **Custo de performance é real** — vídeo pesa o LCP. Pôster (`poster=`) leve como LCP, vídeo
   carrega depois; `preload="none"` se abaixo da dobra. Medir CWV na Etapa 4 DEPOIS de pôr o
   vídeo. `prefers-reduced-motion` → trocar o vídeo pelo pôster estático.

**Como o sistema GERA o vídeo (executável, não manual).** A geração do MP4 é automatizada pelo
`scripts/gerar-video.mjs --provedor kie` — **KIE.AI é o provedor padrão** (mais barato; modelos
`kling`, `seedance`, `veo`), com `--provedor fal` como alternativa. Precisa de `KIE_KEY` no `.env`
(ver `.env.example`). O script faz o pipeline: still on-brand (via `gerar-imagem.mjs`, que também usa
KIE) → anima image-to-video → devolve o MP4. Passos:
1. **Imagem-base com logo** — `gerar-imagem.mjs` cria o produto/cena com o logo da marca, 16:9, 2K.
   (Motion-graphics em vez de produto real = `/reel-marca`.)
2. **Animar** — `gerar-video.mjs --provedor kie --modelo seedance` (movimento controlado) ou `kling`.
   Loop: hoje o melhor caminho é movimento sutil que volta ao início (ex.: giro lento no eixo); para
   loop perfeito frame-a-frame, fechar no corte/ffmpeg na pós (start=end ainda não é flag do script).
   `--dry-run` mostra o custo KIE antes de gastar crédito.
3-4. **Integrar e otimizar** (já feito pelo sistema): montar o hero `<video autoplay muted loop
   playsinline poster="...">` com overlay de contraste medido (gate 4c), pôster leve como LCP,
   `preload` correto, fallback `prefers-reduced-motion`, e validar CWV na Etapa 4.

Honestidade comercial: o sistema gera o vídeo, mas a QUALIDADE depende do modelo/prompt — passar
pelo `/revisar` antes de cravar no hero, e se sair genérico (AI slop), cair pro hero estático.
O scroll-driven video (efeito #10 do `craft-movimento.md`) é integrável por código (sincronizar
`video.currentTime` ao scroll); cuidar do seek travado em mobile — testar no 4a, cair pro
before/after estático onde travar.

## Etapa 4 — Verificação visual + performance (obrigatória)

**4a. Visual — estático E movimento.** Abrir a página real (Playwright) e capturar
screenshot em **390px, 768px e 1440px**. Olhar as imagens de verdade: texto vazando?
hierarquia funciona no celular? botão da conversão visível sem rolar no mobile? Corrigir e
re-capturar até as três larguras estarem certas.

**E quando a página tem camada de movimento (Etapa 3.5), gravar o SCROLL EM VÍDEO** —
screenshot parado não vê easing errado, reveal engasgado, parallax tremendo; o diferencial
premium não pode ser o único pedaço sem QA:
```js
// Playwright: contexto com gravação + scroll roteirizado (~15s topo→fim, pausas por seção)
const context = await browser.newContext({ recordVideo: { dir: 'verificacao/' },
  viewport: { width: 390, height: 844 } });
// rolar por etapas (mouse.wheel ou scrollTo suave), esperar as entradas, fechar o context
// → verificacao/scroll-390.webm ; repetir em 1440
```
Assistir os 2 vídeos (390 + 1440) como quem assiste: entrada dispara na hora certa? o
ritmo é o da marca (motion tokens)? nada treme/engasga? Os vídeos entram na aprovação do
dono junto com os screenshots — e no despacho do `/revisar-pagina`. Sem camada 3.5, só os
estáticos bastam. Mostrar as capturas ao usuário pra aprovação — ele aprova vendo.

**4b. Core Web Vitals (medir, não prometer).** Performance é requisito do produto R$ 5.000 —
não declarar "carrega rápido" sem medir. Rodar Lighthouse (ou medição equivalente via
Playwright) na página e conferir os limiares de 2026:
- **LCP ≤ 2,5s** (limiar oficial de REPROVA) · **INP ≤ 200ms** · **CLS ≤ 0,1**. O Google e o
  web.dev definem "good LCP = 2,5s ou menos" (web.dev/articles/lcp · developers.google.com/search/
  docs/appearance/core-web-vitals) — esse é o número que vale com o cliente. **Alvo agressivo da
  casa: ≤ 2,0s** — meta interna pra sobrar folga, NÃO motivo de reprova: página entre 2,0s e 2,5s
  passa (o Google aprova), só não bateu a meta da casa. (INP substituiu o FID em 2024 — FID é
  métrica morta, não usar.) Se algum dia o Google baixar o teto oficial, confirmar na fonte
  primária antes de mudar este número — não citar limiar de blog de SEO como fato.
- Reprovou (acima de 2,5s) → consertar a causa antes de declarar pronto: LCP alto = imagem/hero pesado
  ou fonte bloqueando; INP alto = JS de animação (Etapa 3.5) travando a thread; CLS alto =
  imagem/fonte sem dimensão reservada. A camada de movimento (3.5) é o suspeito nº1 de INP —
  medir DEPOIS de aplicá-la, não antes.
- **Medir 2-3 vezes e usar a mediana, descartando o 1º run.** A primeira navegação de um
  processo de browser carrega o engine (cold start) e infla o LCP — um run isolado pode dar
  3s "falso" numa página que entrega 0,6s. Não condenar a página por uma medição só: rodar de
  novo, olhar a mediana. Se TODOS os runs (fora o 1º) reprovam, aí é problema real.
- Registrar os três números (a mediana) no `publicacao.md`. Página não é declarada pronta com
  CWV reprovado, do mesmo jeito que não é declarada pronta com texto vazando.

**4c. Acessibilidade — gate, não opinião (e o vídeo é o pior infrator).** 94% dos sites reprovam
WCAG AA; o item nº1 é contraste de texto. Sobre VÍDEO/imagem de fundo o risco dobra porque o
contraste muda quadro a quadro. Conferir:
- **Contraste AA do texto do hero MEDIDO sobre o frame mais claro do vídeo** — não no olho. Garantir
  com overlay sólido/gradiente entre vídeo e texto (ex.: camada escura a ≥45% sobre vídeo claro), e
  re-medir. Texto que some num frame reprova.
- **Vídeo autoplay:** `muted` obrigatório (senão o browser bloqueia e é hostil), controle de
  pausa acessível se durar >5s, `prefers-reduced-motion` → pôster estático (já na Etapa 3.5).
- **Foco visível, navegação por teclado, alt em imagem com conteúdo, ordem de leitura correta no
  source** (liga com a regra GEO-safe: o que a IA lê é o que o leitor de tela lê).

**4d. Segurança do build (quando a página tem form/JS que fala com servidor).** Rodar os
5 checks de `docs/qa-entrega-build.md`: nenhuma key no fonte (só `.env`/config), `.env` no
`.gitignore` (já commitou → rotacionar a key), zero dado sensível em console.log, endpoint
de form não exposto sem validação, zero TODO no código entregue. Página estática pura →
só conferir que não vazou credencial em comentário/JS.

## Etapa 5 — Entrega + plano de medição

`producao/paginas/<slug>/` com `index.html`, assets e `publicacao.md` (como subir:
Vercel/Netlify/hospedagem própria, apontamento de domínio em passos simples). Variações
pra reunião comercial (cenário "site antigo, reunião amanhã"): gerar 2 direções da
Etapa 1 + abertura de cada uma renderizada — decisão visual na reunião, página completa
depois da escolha.

**Plano de medição + iteração (a entrega não é o fim — conversão é ciclo, não evento).** Página
premium sem medição é chute caro. No `publicacao.md`, deixar registrado:
- **O que medir** — taxa de conversão (a UMA ação), origem do tráfego, e onde o visitante abandona.
  Instrumentar: analytics + um heatmap/gravação de sessão (ex.: Clarity grátis) pra ver o scroll e o
  clique reais. A meta é a faixa do nicho fixada na Etapa 0, não um número inventado.
- **Hipótese de teste A/B** — deixar UMA aposta pronta pra testar quando houver tráfego (geralmente o
  headline ou o CTA — o que mais move a agulha). Não testar antes de ter volume; registrar a hipótese.
- **Cadência** — CRO real é ciclo de ~4-6 semanas (medir → 1 mudança → re-medir), não entrega única.
  O `/desempenho` fecha esse loop; o aprendizado validado sobe pra `nucleo/aprendizados.md` e calibra
  a próxima página. Vender a página como "viva" (medida e melhorada), não como quadro pendurado.

## Regras

- Conteúdo real sempre; placeholder explícito (`[SUBSTITUIR: foto da equipe]`) quando
  o material não existe — nunca texto fake que parece final.
- Página com formulário → mencionar política de privacidade (LGPD).
- Nunca declarar pronto sem a Etapa 4 executada com as três capturas conferidas.

---

**✓ Pronto:** landing page premium em `producao/paginas/<slug>/` (HTML/CSS/JS na marca, CWV medido) · **→ próximo passo:** `/seo` (Schema/GEO) e depois `/publicar` — página bonita que ninguém acha não vale. Pré-requisito que mais trava: **`marca/` precisa existir** — sem identidade não há página premium; se faltar, rodar `/identidade` antes (o sistema reorienta). _(Add-on opcional: `/agente-ia` põe um assistente que qualifica e captura lead 24/7 na página — o diferencial IA-Ready; é só pedir.)_
