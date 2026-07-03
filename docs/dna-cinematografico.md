# DNA cinematográfico — como criar sites bonitos, criativos e com visual incrível

> Lido pelo `/premium-design` (todos os Usos), pela Etapa 3.5 do `/pagina` e pela `/identidade`
> quando o cliente quer "nível agência / WOW". É o andar de cima do `craft-movimento.md`: aquele
> cataloga MOVIMENTO (10 efeitos); este cobre a DIREÇÃO CRIATIVA inteira — o que faz um site
> parecer caro, imersivo e memorável, não só animado.
>
> Base: garimpo de Awwwards (WebGL/animation/scroll/GSAP), Codrops, e pesquisa real de 2026
> (Figma Web Design Trends, School of Motion, "8 técnicas premiadas" do Bootcamp/Medium).
> Princípio-mãe (igual ao craft-movimento): **o melhor WOW prova algo e nasce de FONTE REAL.**
> Capturar a mecânica de um site premiado (o `/premium-design` puxa o código), nunca inventar —
> e a marca do cliente é sempre lei (cor/fonte/voz vêm da marca, do premiado vem só o "como").

---

## A régua: 3 camadas que separam "site de IA" de "site de R$ 10k"

Um site cai em "AI slop" (front-end bonito que ninguém compra, "Ferrari sem motor") quando tem
estilo sem substância. O premiado empilha três camadas, nesta ordem:

1. **Estrutura** (substância) — pesquisa de nicho + wireframe + uma conversão. Já é a Etapa 0/1
   do `/pagina`. Sem isto, nenhum efeito salva.
2. **Direção de arte** (o que faz parecer caro mesmo PARADO) — tipografia, cor, composição,
   textura, profundidade. É a maior parte do "visual incrível" e quase ninguém cuida. ↓ seção 1.
3. **Movimento e imersão** (o WOW que prova) — animação com propósito, 3D, scroll cinematográfico.
   É o `craft-movimento.md`. ↓ seção 2 resume e aponta pra lá.

A maioria erra pulando direto pro 3 sem o 2. Um hero **estático** com direção de arte de nível
agência já vence 90% dos sites; o movimento é o tempero, não o prato.

---

## Seção 1 — Direção de arte: o "caro" que existe sem animação nenhuma

As 13 tendências de 2026 (Figma) destiladas no que serve a um negócio que precisa CONVERTER —
não arte por arte. Cada uma com *quando usa* e *quando NÃO* (algumas são armadilha de WOW que
afunda conversão).

### Tipografia em escala (bold typography) — o ganho nº 1, custo zero
Headline grande de verdade (display pesada, `clamp()` fluido, tracking apertado) é o que mais
faz um hero parecer caro sem nenhum asset. Tipografia VIRA o layout — texto como elemento gráfico,
não legenda. **Quando NÃO:** corpo de texto (cansa); fonte de sistema (Inter/Roboto matam o WOW —
escolher uma display com personalidade). É o "UM elemento memorável" que o `/pagina` já exige.

### Cor com coragem (vibrant palettes / dark mode)
Paleta que aposta — uma cor de destaque usada com volume, ou dark premium com um acento neon. O
medo de cor é o que deixa o site genérico. **Dark mode** continua forte pra premium/tech (faz o
glow e o vídeo brilharem). **Quando NÃO:** nicho que pede confiança sóbria (saúde, jurídico) usa
cor com mais parcimônia. A paleta sai SEMPRE da marca do cliente (`marca/tokens.css`), nunca do
gosto da referência.

### Profundidade e textura (grain, glass, layered, neumorphism leve)
O que tira o "flat de template": grão/noise sutil sobre fundo sólido, vidro (`backdrop-filter`),
camadas com sombra real, gradiente com banding tratado. Dá riqueza tátil. **Quando NÃO:**
neumorfismo puro tem problema de contraste/acessibilidade — usar só como acento, nunca em botão
de conversão. Textura é o detalhe que o olho não nomeia mas sente.

### Composição editorial (collage, maximalism, broken grid)
Layout que foge da grade de cards — sobreposição, assimetria, espaço negativo usado com intenção,
"revista" em vez de "dashboard". É alto risco/alta recompensa. **Quando NÃO:** página de
conversão direta (o broken grid pode atrapalhar o caminho até o CTA) — usar nas seções de marca
(hero, sobre, manifesto), manter as de ação limpas.

### Estética com ponto de vista (retrofuturism, neo-brutalism/anti-design)
Direções fortes que dão identidade imediata a quem combina com a marca (criador, estúdio,
produto cult). **Quando NÃO:** PME local que precisa de confiança — anti-design lê como "quebrado".
Casar a estética com o `nucleo/perfil.md`, nunca aplicar por estar na moda.

> Regra de ouro da seção 1: estas são opções de PALETA DE DIREÇÃO, não checklist. Um site
> premiado escolhe 1-2 com convicção e executa impecável — não empilha as 13. Maximalismo de
> tendência é o novo template genérico.

---

## Seção 2 — Imersão: 8 técnicas premiadas (Awwwards) + a ferramenta certa

Estas movem o site de "bonito" pra "experiência". Resumo da pesquisa, com o site premiado real de
onde capturar e a ferramenta exata. **Fronteira firme (sem duplicar o craft-movimento):** esta
tabela é o MAPA — qual técnica, de qual site real capturar, com qual ferramenta. As FICHAS de
execução (quando dá WOW / quando mata performance / reduced-motion / de onde capturar o código) são
o `craft-movimento.md`, fonte única — não repetir aqui. Ex.: scroll-driven é a técnica #1 deste mapa,
mas sua ficha de execução é o **efeito #1/#10 do craft-movimento** (o vídeo amarrado ao scroll é o
#10 de lá). Ao aplicar, ler a ficha no craft; este doc só diz QUE técnica usar e ONDE aprender.

| # | Técnica | O que entrega | Capturar de (real)* | Ferramenta |
|---|---------|---------------|--------------------|------------|
| 1 | **Scroll-driven + smooth scroll** | animação sincronizada à rolagem; storytelling | C2MTL, Sundae Creative | **CSS `animation-timeline: scroll()/view()` nativo primeiro** (2026: suporte universal, roda no compositor = INP-safe); Lenis/GSAP ScrollTrigger só onde o nativo não chega |
| 2 | **Text-splitting** | título que revela letra/palavra (hero) | Motto, Sundae Creative | GSAP SplitText / SplitType (GSAP grátis desde 2025) |
| 3 | **Micro-animações** | feedback tátil (botão, loader, ícone vivo) | NEWPEACE, Calm Craft | Rive (state machine) / Lottie |
| 4 | **Transições & reveals** | troca de página/seção sem corte seco | Metalab, Alex Tkachev | **View Transitions API** (nativa, multi-página em 2026 — Barba.js virou legado) / Framer Motion em React |
| 5 | **Easing autoral** | personalidade do movimento (não o `ease` default) | Toyfight | `--ease-marca` + `--dur-*` do `marca/tokens.css` (a /identidade grava a seção Movimento; toda peça consome) |
| 6 | **SVG & mask animations** | revelar vídeo/imagem por máscara que se abre | Lightship, Accordion | CSS mask + GSAP |
| 7 | **3D na página** | produto girando, profundidade, vitrine | Brew District 24, Mana Yerba Maté | **Spline** (fácil) / Blender→Three.js (avançado) |
| 8 | **WebGL / Three.js** | distorção/shader reativo ao cursor — máximo WOW | Hatom, Lusion, OHZI | Three.js + GLSL (pesado, só com orçamento) |

*Sites premiados saem do ar rápido: antes de capturar, validar o site no registro premiado
(awwwards.com / godly.website têm o print) — não googlar o nome e capturar o que vier. E o
código executável NÃO depende da captura: mora na biblioteca da casa
(`.claude/skills/premium-design/references/efeitos.md`) — a captura de premiado dá a
DIREÇÃO (ritmo, quando, quanto), nunca o código (bundle minificado não rende).

**Som sutil na web (assinatura de estúdio — cardápio, não default):** premiados topo (Obys)
usam sound cues em interação. Regra da casa: SEMPRE muted-by-default + toggle visível; nunca
autoplay de áudio; só em página-experiência (portfólio/campanha), nunca em página de
conversão de PME local (distrai do WhatsApp).

**Hierarquia de esforço (do que mais paga ao mais caro):**
- **Quase de graça, alto retorno:** easing autoral (5), text-split no hero (2), micro-animações no
  CTA (3). Comece aqui — 80% do "parece caro" mora nestes três.
- **Médio, vale pro produto de R$ 5k+:** scroll-driven (1), reveals (4), mask reveal de vídeo (6).
- **Caro, só vitrine/posicionamento 10k+:** 3D (7) e WebGL (8). Tem alternativa CSS pra ~80% do
  efeito percebido — usar o peso real só quando o cliente aceita o custo de performance.

**As ferramentas novas que valem entrar no radar (2026):**
- **Spline** (spline.design) — 3D interativo pra web sem Blender; produto rotacionável no hero com
  fração do custo de Three.js puro. O caminho mais rápido pro efeito 3D.
- **Rive** (rive.app) — micro-interação com *state machine* (idle/hover/click), exporta leve. Mata
  o Lottie em interatividade. Ideal pra botão de CTA vivo, menu, mascote animado.
- **Lottie** (lottiefiles.com) — animação After Effects → JSON leve. Loader, ícone, ilustração.

---

## Seção 3 — Como aplicar nas skills (o protocolo)

1. **Antes de qualquer pixel:** estrutura (Etapa 0/1 do `/pagina`). Sem substância, efeito é maquiagem.
2. **Direção de arte primeiro** (seção 1): escolher 1-2 direções com convicção, dentro da marca.
   Um hero estático impecável > um hero animado genérico.
3. **Depois o movimento** (seção 2 → fichas no `craft-movimento.md`): começar pelo barato de alto
   retorno (easing, text-split, micro-interação). 3D/WebGL só com orçamento e `prefers-reduced-motion`.
4. **Capturar de fonte real:** o `/premium-design` puxa o código do site premiado citado; a régua
   é a mecânica/easing, nunca a cor ou a fonte (essas são da marca do cliente).
5. **Medir:** todo efeito passa pela Etapa 4 do `/pagina` (CWV). LCP ≤ 2,5s é o limiar oficial
   (alvo da casa ≤ 2,0s) — WebGL e vídeo de fundo são os suspeitos nº 1; medir DEPOIS de aplicar,
   não antes.

## Onde estudar (fontes vivas, reconferir antes de citar como atual)
- **Awwwards** — coleções por técnica: `/websites/webgl/`, `/websites/animation/`, `/websites/scrolling/`, `/websites/gsap/`
- **Codrops** (tympanus.net/codrops) — tutoriais de clip-path, shader, scroll; a fonte canônica de "como fizeram"
- **GSAP docs** (gsap.com) — ScrollTrigger, SplitText, ScrollSmoother (grátis desde 2025)
- **Lenis** (lenis.dev) · **Spline** (spline.design) · **Rive** (rive.app) — as libs/tools citadas acima
- **Figma Web Design Trends** — refresh anual das tendências estéticas
- Sites premiados de referência (seção 2): Lusion, OHZI, Metalab, Toyfight, Motto, Hatom

---

*ImpulsoX-OS · doc de motor · complementa `craft-movimento.md` (movimento) com direção de arte e imersão.*
