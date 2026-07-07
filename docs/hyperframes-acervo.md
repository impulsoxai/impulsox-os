# Acervo Hyperframes — moldes premium/cinematográficos pra reels

> Catálogo dos exemplos e blocks prontos do Hyperframes (HeyGen, Apache-2.0) que dão o
> visual "nível agência". Fonte: `github.com/heygen-com/hyperframes` + `npx hyperframes catalog`
> (v0.7.31, jul/2026). Uso: qualquer reel de marca/produto reaproveita estes moldes em vez de
> animar do zero. Mesma filosofia da casa — copiar a mecânica de quem já performa.
>
> Como o Hyperframes funciona: vídeo = HTML com timing em `data-*`, uma timeline GSAP pausada
> (seek-safe) em `window.__timelines["<id>"]`, render HTML→MP4 por headless Chrome. É o "Remotion
> turbinado" — mesmo princípio da `/reel-marca`, com Studio de preview no browser (`npm run dev`)
> e ~150 blocks prontos. Instala: `npx skills add heygen-com/hyperframes --all`.

---

## Como usar (fluxo)

1. **Projeto:** `npx hyperframes init <nome>` (cria projeto vazio) OU `--example <preset>` (clona exemplo completo).
2. **Blocks prontos:** `npx hyperframes add <block>` puxa o código pra `compositions/`.
3. **Editar ao vivo:** `npm run dev` → Studio no browser (clica no elemento, ajusta, hot-reload). É o jeito de afinar sem rerender.
4. **Conferir:** `npx hyperframes snapshot --at 2,6,10` → PNG + contact-sheet.
5. **Render:** `npx hyperframes render` → mp4.
6. Contrato completo: skill `/hyperframes-core`. Animação: `/hyperframes-animation`.

⚠️ **No Windows:** exemplos que puxam vídeo remoto (ex: kinetic-type com a-roll) falham no render
por symlink (EPERM). Os que são HTML+CSS+SVG puro rodam liso. Preferir esses pra reel de marca.

---

## A FÓRMULA premium (destilada do exemplo `product-promo` — código real lido)

O que faz um reel Hyperframes parecer nível-agência (todas as técnicas num só exemplo):

- **Entrada com overshoot:** `ease: "back.out(1.4)"` em TODA aparição (o "pop" satisfatório). Nunca linear.
- **Cascata:** `stagger: 0.08` — elementos entram em sequência, não juntos.
- **Cursores multiplayer** (tipo Figma): cursores nomeados (Engineer/Designer/PM) se movem com
  ease custom, clicam, comentam, arrastam — vira storytelling de colaboração.
- **Glassmorphism:** `backdrop-filter: blur(12px)` nos painéis.
- **Mockup de browser flutuando** com sombra e cantos arredondados (a tela do produto "no ar").
- **Timeline coreografada por segundo** — cada beat tem hora exata, tudo `paused` e seekável.
- **Selection handles / comment pins** animados — a UI "sendo usada" ao vivo.
- Régua: `gsap.set` no estado inicial, `tl.to`/`tl.from` com tempo absoluto (o 2º arg do `.to`).

Cursor ease usado: movimento natural (não linear) — guardar como `const cursorEase = "power2.inOut"` ou similar.

---

## ⭐ CONHECIMENTO TÉCNICO PROFUNDO (código real lido, jul/2026)

### Contrato que evita bug silencioso (de `/hyperframes-core`)
- Root **sized em px** (`width`/`height`), standalone = SEM `<template>` (wrapper esconde tudo).
- **1 timeline GSAP pausada** por composição, síncrona, em `window.__timelines["<data-composition-id>"]`.
  A chave = exatamente o `data-composition-id` do root (sem sufixo).
- **Duração do render = `data-duration` do root**, não o comprimento da timeline.
- Fill full-screen vai num **child absoluto** (`position:absolute; inset:0`), NUNCA no root
  (o compositor dropa o `background` do root → frame preto).
- **Só a allowlist visual anima:** `x/y/scale/rotation` (transforms), `opacity/color/backgroundColor/borderRadius`.
  NUNCA `width/height/top/left` pra layout, NUNCA `display/visibility`.
- Sem `Math.random`/`Date.now`/`performance.now`, sem `repeat:-1` (contagem finita),
  sem construir timeline em `async/setTimeout/Promise`.
- **Coordenadas pré-calculadas:** nunca `getBoundingClientRect()` no tween (render amostra em
  paralelo e dessincroniza). Computar posições 1x no setup e reusar.
- **SUB-COMPOSIÇÃO = filho DIRETO do `#root`**, com `data-start` em tempo GLOBAL (não relativo).
  Aninhar o host `data-composition-src` DENTRO de outra clip → a sub-comp NÃO renderiza (cena vazia,
  lint/validate passam sem erro — bug silencioso). Confirmado dissecando o product-promo (jul/2026):
  os hosts scene-1/2/3 são filhos diretos do root. Arquivo da sub-comp: `<!doctype><head><body><template>`,
  root da sub estilizado por `#id` (não `.class` — o CSS é scoped por composition-id no render),
  fontes via `@import` DENTRO do `<template>` (o `<head>` do arquivo é descartado no transporte).

### Molde do NÚMERO HERÓI (`apple-money-count` — dissecado)
Contador de dinheiro/resultado com flash + explosão de partículas:
```js
// 1. conta animando um OBJETO JS (não o DOM direto):
const countState = { value: 0 };
tl.to(countState, { value: 10000, duration: 3.16, ease: "none",
  onUpdate: () => el.textContent = formatMoney(countState.value) }, 0);
// 2. no CSS: font-variant-numeric: tabular-nums (largura não pula) + text-shadow 3 camadas
// 3. CLÍMAX (fim da contagem): tudo junto —
tl.to(numero, { color: "#30d158", duration: 0.18 }, 3.16);      // vira verde
tl.to(numero, { scale: 1.06, ease: "back.out(2.2)" }, 3.16);     // pop
tl.to(numero, { scale: 1, ease: "power2.out" }, 3.33);
tl.to(greenFlash, { opacity: 0.34, duration: 0.08 }, 3.16);      // flash de tela (overlay inset:0)
// 4. 62 partículas em loop, ângulo ÁUREO (2.399963) em anéis, delay/rotação/scale variados = explosão.
```
Copiável: `npx hyperframes add apple-money-count` → adaptar valor/moeda/cor.

### Molde de TRANSIÇÃO shader (`cinematic-zoom` — dissecado)
Transição zoom-blur com aberração cromática (WebGL): cada cena vira textura (`captureScene` desenha
o DOM num canvas → `gl.texImage2D`); fragment shader faz zoom-blur radial POR CANAL (R/G/B com offset
= aberração); timeline dirige `progress` 0→1 com `easeInOut`. É pesado — pra 2 telas, `add cinematic-zoom`
já vem pronto. Alternativa leve: catálogo `transitions-*` (CSS, sem WebGL).

### Os 15 BLUEPRINTS de cena (`/hyperframes-animation`, reverse-eng de 50 clips de launch)
Cada um é um SHOT time-coded com "signature move". Escolher por ROLE do beat:
| Blueprint | Role | Signature move |
|---|---|---|
| `kinetic-type-beats` | Hook/Problem/CTA/Brand | palavra troca no lugar, statement full-screen → spring-pop |
| `typewriter-reveal` | Hook/Brand | caret digita e edita como humano → pop da marca |
| `spatial-pan-stations` | Hook/Problem | câmera única panorâmica por estações num canvas gigante |
| `constellation-hub` | Hook/Social_Proof | nós saltam em anel → push-IN no centro (DOF colapsa) |
| `grid-card-assemble` | Feature/Benefits | N cards auto-montam em cascata → zoom-OUT revela o todo |
| `logo-assemble-lockup` | Product/CTA/Brand | marca se monta de partes → lockup centrado (+URL) |
| `cursor-ui-demo` | Product/Feature | cursor custom dirige UI (clica/arrasta), câmera persegue |
| `device-surface-showcase` | Key_Feature | mockup/janela flutuando herói, telas ciclam (push 3D) |
| `dataviz-countup` | Problem/Product | count-up/chart herói, câmera empurra ATRAVÉS → 1 métrica |
| `titlecard-reveal` | Benefits/Social_Proof | UM título limpo, UM movimento contido (breather) |
| `comparison-split` | Key_Feature | 2 itens entram das alas com tilt 3D "livro abrindo" |
| `overwhelm-surround` | Problem | superfícies acumulam, fecham dos lados (soterrado) |
| `ticker-takeover` | Hook/Brand | palavra cicla → herói COLIDE de fora e empurra o texto |

Receita reel de produto: Hook (kinetic-type) → Problem (dataviz/overwhelm) → Product (cursor-ui/device)
→ Benefit (grid-card) → CTA/Brand (logo-assemble). Ler `blueprints/<id>.md` SÓ ao instanciar.

### Runtimes: GSAP é 95% (timeline/transform/easing/stagger). Lottie (After Effects), Three.js (3D/shader),
Anime.js (leve), CSS (shimmer), TypeGPU (partícula/liquid glass). Coexistem; seek passa em todos.

### Fluxo que funciona (aprendido na prática)
1. Screenshot hi-res: `clip` pelo **bounding box do container de conteúdo** via `pg.evaluate`
   (Playwright) — nasce SEM menu lateral, centrado no herói.
2. Push-in = `gsap.fromTo(img,{scale:1},{scale:1.4,ease:"power3.out"})`, img num `.stage overflow:hidden`.
   Alvo central (x=0) evita corte; deslocar só se herói é lateral.
3. `snapshot --at <tempos>` → contact-sheet ANTES de render. `render` só no fim.
4. **Windows:** exemplos com vídeo remoto falham (symlink EPERM); HTML/CSS/SVG puro roda.
5. Narração/trilha DEPOIS via ffmpeg (voz -16 LUFS, trilha 0.12 sob voz) — régua da /reel-marca.

---

## Exemplos completos clonáveis (`init --example <nome>`)

Projetos inteiros com cenas + assets + timeline. Melhores pra estudar/remixar:

| Exemplo | O que é | Usar pra |
|---|---|---|
| **product-promo** | promo SaaS: logo-intro → canvas com cursores multiplayer + mockup browser → logo-outro | reel de produto/app — O MOLDE do nosso caso |
| **warm-grain** | base com film grain + tom quente/analógico | estética aconchegante, storytelling |
| **swiss-grid** | tipografia grid suíça, minimalista | marca sóbria/premium, editorial |
| **vignelli** | design system Vignelli (modernista) | marca clássica/autoridade |
| **kinetic-type** | tipografia animada (⚠️ puxa vídeo — falha no Win) | headline animada |
| **nyt-graph** | gráfico estilo New York Times | dado/estatística com credibilidade |
| **decision-tree / flowchart** | árvore de decisão animada | explicar processo/fluxo |
| **play-mode** | sandbox de teste | experimentar |

---

## Blocks prontos por categoria (`add <nome>`)

### 🎬 Transições cinematográficas (o "WOW" entre cenas)
`cinematic-zoom` · `whip-pan` · `light-leak` · `glitch` · `chromatic-radial-split` ·
`swirl-vortex` · `gravitational-lens` · `sdf-iris` · `ripple-waves` · `flash-through-white` ·
`domain-warp-dissolve` · `ridged-burn` · `thermal-distortion` · `cross-warp-morph` ·
`parallax-zoom` / `parallax-unzoom`
+ 15 famílias: `transitions-{3d,blur,cover,destruction,dissolve,distortion,grid,light,mechanical,push,radial,scale,other}`

### 📱 VFX premium (efeitos de produto)
`vfx-iphone-device` (mockup iPhone) · `vfx-liquid-background` · `vfx-portal` · `vfx-magnetic` ·
`vfx-shatter` · `vfx-text-cursor` · `ui-3d-reveal` (reveal 3D de UI em perspectiva) ·
`app-showcase` (3 telas de smartphone flutuando 3D)

### 🧊 Liquid glass (iOS 26 / macOS Tahoe — tendência 2026)
`ios26-liquid-glass` · `macos-tahoe-liquid-glass` · `liquid-glass-notification` ·
`liquid-glass-context-menu` · `liquid-glass-media-controls` · `liquid-glass-widgets` · `vfx-liquid-glass`

### 💰 Números / finance / dados (PERFEITO pro CRM/resultado)
`apple-money-count` (conta $0→valor, flash verde, explosão de ícones + som) ·
`data-chart` (barra+linha, reveal em cascata, tipografia NYT) · `nyt-graph`

### ✍️ Texto premium
`morph-text` (morph gooey entre palavras) · `texture-mask-text` (66 texturas PBR cortando letras) ·
`shimmer-sweep` (varredura de luz — acento AI/premium) · `kinetic-type`

### 🎞️ Polish / overlays (aplicar por cima de qualquer cena)
`grain-overlay` (film grain) · `vignette` (escurece bordas, foco no centro) ·
`motion-blur` (blur por velocidade real) · `grid-pixelate-wipe` (dissolve em grade)

### 💬 Captions premium (28 estilos — pro reel narrado/legendado)
Kinéticos: `caption-kinetic-slam` (palavra full-screen) · `caption-gradient-fill` (elastic bounce) ·
`caption-highlight` (fundo vermelho TikTok) · `caption-particle-burst` (explosão de partículas) ·
`caption-matrix-decode` (scramble) · `caption-glitch-rgb` · `caption-neon-glow` ·
`caption-texture` (6 texturas) · `caption-clip-wipe` · `caption-emoji-pop` · `caption-parallax-layers` (3D) ·
`caption-pill-karaoke` · `caption-editorial-emphasis` · `caption-weight-shift` · `caption-blend-difference`

### 📺 Lower-thirds / social (pra vídeo com rosto ou overlay)
Lower-thirds (13): `lt-{accent-underline,bold-block,clean-bar,color-block,dark-card,kicker-name,mask-reveal,side-rule,soft-pill,stack-bars}` · `lower-third-bild` · `news-ticker` · `yt-lower-third`
Social overlays: `x-post` · `reddit-post` · `spotify-card` · `macos-notification` ·
`instagram-follow` · `tiktok-follow`

### 🖥️ Code snippets (pra conteúdo dev / "Claude Code no negócio")
~30 temas: `code-snippet-apple-terminal-*` (12 temas de terminal), `code-snippet-{dark,light}-*`,
`code-morph`, `code-typing`, `code-diff`, `code-highlight`, `code-scroll`, `code-3d-extrude`,
`code-shader-dissolve`, `code-particle-assemble`

### 🌍 Mapas animados (pra dado geográfico / local)
`world-map` (globo D3 girando) · `us-map` + variações (bubble/hex/flow) · `spain-map` ·
`nyc-paris-flight` (avião Apple-style) · `north-korea-locked-down`

### 🏷️ Branding
`logo-outro` (reveal cinematográfico peça-a-peça, glow bloom, tagline, pill de URL) — CTA final

---

## Receita pro reel de marca ImpulsoX (o que combinar)

Pra um reel de produto (CRM, página, agente) na marca ImpulsoX:
1. **Abertura:** hook em texto com `back.out` + `stagger` (fórmula do product-promo).
2. **Produto real:** screenshot hi-res (área útil, sem menu — clip pelo bounding box do container)
   com push-in GSAP `scale` seek-safe mirando o herói. OU `ui-3d-reveal` pra tela entrar com profundidade.
3. **Número herói:** `apple-money-count` pra receita/resultado (conta + flash + partículas).
4. **Transição entre cenas:** `cinematic-zoom` ou `whip-pan` (não corte seco).
5. **Polish:** `grain-overlay` + `vignette` por cima de tudo (dá o acabamento de cinema).
6. **Legenda/narração:** um dos `caption-*` sincronizado.
7. **Fecho:** `logo-outro` com a marca + CTA.
8. Marca ImpulsoX: dourado #d4af37, roxo #7c3aed, fundo #06060d — trocar nos tokens do exemplo.

Anti-fingerprint: variar transição + caption-style + easing entre reels (2 clientes nunca iguais).

---

## Pendências / notas
- Blocks isolados (cinematic-zoom, apple-money-count) instalam por `add` num projeto, não `init --example`.
- Render no Windows: evitar exemplos com vídeo remoto (symlink EPERM); HTML/CSS/SVG puro roda liso.
- Studio (`npm run dev`) é o diferencial pra afinar — o dono pode ajustar sem reland no ffmpeg.
- Projetos-exemplo clonados vivem em `ImpulsoX-AI/hf-exemplos/` (não sobem pro template).

---
*Gerado 2026-07-04 · pesquisa real (código lido do product-promo + catálogo completo) · v0.7.31*
