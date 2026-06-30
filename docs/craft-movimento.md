# Craft de movimento — a animação e os efeitos cinematográficos que dão WOW

> Lido pelo `/premium-design` (Uso 2 elevar e Uso 4 captura dirigida) e referenciado pela
> Etapa 3.5 do `/pagina`. É o catálogo do *que* existe de movimento premium, *quando* cada
> efeito dá WOW, *quando* mata performance, e de *qual site real* capturar. Base: garimpo de
> sites premiados (Awwwards/Apple/Lusion/OHZI/Codrops) + pesquisa de micro-interações 2026.
>
> Princípio-mãe: **o melhor WOW prova algo.** O número "0,71s" subindo de zero impressiona E
> prova velocidade ao mesmo tempo. Movimento sem propósito é poluição. A régua é capturar de
> FONTE REAL (o `/premium-design` puxa o código do site), nunca inventar o efeito.

A régua final mora em `marca/design-guide.md` (a marca é lei) e no CLAUDE.md (LCP ≤ 2,5s oficial /
alvo da casa ≤ 2,0s, `prefers-reduced-motion` sempre). Este doc nomeia e prioriza; a captura do código é o
`/premium-design`.

> Este doc é só MOVIMENTO. A direção criativa completa de um site "nível agência" — tipografia,
> cor, profundidade, composição editorial, 3D (Spline/Rive/Lottie) e o mapa das 8 técnicas
> premiadas com site real de onde capturar — mora em **`docs/dna-cinematografico.md`**, o andar
> de cima. Regra-mãe de lá: o hero estático com direção de arte impecável vence o hero animado
> genérico — movimento é o tempero, não o prato.

---

## O catálogo — 10 efeitos (do mais seguro ao mais pesado)

Cada efeito tem a ficha: **o que é · quando dá WOW · quando NÃO usar · custo · reduced-motion ·
de onde capturar**.

### 1. Text-split reveal (char/word/line)
- **O que é:** cada letra, palavra ou linha do título anima individualmente (sobe, fade, blur).
  O padrão premiado combina três coisas numa só entrada: split (char/line) + scramble que
  resolve as letras + clip-path wipe por cima.
- **Quando dá WOW:** hero e títulos de seção. É o "como fizeram isso?" mais barato. A página da
  ImpulsoX já usa a versão simples (`.ln` sobe linha a linha).
- **Quando NÃO usar:** em texto de corpo (cansa) ou em tudo (perde o impacto).
- **Custo:** baixo (CSS + IntersectionObserver; ou GSAP SplitText). Cuidar de não causar layout
  shift. **Acessibilidade:** split por letra quebra leitor de tela — o SplitText novo (2025) já
  resolve isso, mas conferir `aria`/`revert` sempre.
- **reduced-motion:** trocar por fade simples (ou nada).
- **De onde capturar:** GSAP SplitText (gsap.com/docs/v3/Plugins/SplitText) é a referência
  canônica; estudo de caso real em Codrops (tympanus.net/codrops, "clip-path wipes / shader
  uniforms"). GSAP virou grátis em 2025 (Webflow), inclusive SplitText.

### 2. Count-up na viewport
- **O que é:** um número anima de 0 até o valor quando entra na tela.
- **Quando dá WOW:** quando o número É a prova (0,71s de carregamento, "44%", "+20%"). WOW +
  argumento juntos — é o efeito mais alinhado ao princípio-mãe.
- **Quando NÃO usar:** número decorativo sem significado; vira firula.
- **Custo:** baixo (requestAnimationFrame + IntersectionObserver).
- **reduced-motion:** mostrar o número final direto, sem contagem.
- **De onde capturar:** padrão de micro-interação consolidado (2026: "counter que anima ao
  passar pela seção de stats"). Sem site-assinatura único — capturar o easing de qualquer
  landing premium do nicho; a mecânica é trivial e a régua é o easing, não o site.

### 3. Scroll cinematic (Apple-style)
- **O que é:** elementos revelam com timing coreografado conforme a rolagem; cada frame
  sincronizado à posição do scroll (produto/seção entra no momento certo, specs em sequência).
- **Quando dá WOW:** seção-herói de produto, demonstração. Altíssimo impacto.
- **Quando NÃO usar:** página institucional simples; sequestra o scroll se exagerado.
- **Custo:** médio (scroll-trigger; cuidar INP). Smooth scroll (efeito 9) ajuda a sincronizar.
- **reduced-motion:** revelar tudo sem coreografia de scroll.
- **De onde capturar:** Apple AirPods Pro product page (o "shifting light" por frame de scroll);
  tutorial canônico em CSS-Tricks ("fancy scrolling animations used on Apple product pages");
  Codrops pra a versão GSAP + Lenis.

### 4. Magnetic button / tilt card
- **O que é:** o botão "puxa" levemente o cursor; o card inclina no hover (3D leve).
- **Quando dá WOW:** CTA principal, cards de oferta. Premium tátil, sensação de produto caro.
- **Quando NÃO usar:** em todo botão (cansa); em mobile (não há cursor).
- **Custo:** baixo (JS de mousemove). Desligar em touch.
- **reduced-motion:** hover estático (só cor/sombra).
- **De onde capturar:** padrão de micro-interação comum nos sites GSAP da Awwwards
  (awwwards.com/websites/gsap). Sem site-assinatura único — buscar uma referência premiada do
  nicho na hora de aplicar e capturar o easing/raio do "ímã"; nunca inventar o número de cabeça.

### 5. Clip-path shape reveal
- **O que é:** elemento aparece por uma máscara geométrica que se abre (diagonal, círculo, wipe).
- **Quando dá WOW:** transição entre seções, reveal de imagem. Cinematográfico.
- **Quando NÃO usar:** quando compete com outro reveal na mesma tela.
- **Custo:** baixo-médio (CSS clip-path animado).
- **reduced-motion:** fade simples.
- **De onde capturar:** Codrops (tympanus.net/codrops, "clip-path wipes") é a fonte canônica do
  padrão; aparece junto do text-split nos sites premiados.

### 6. Parallax em camadas
- **O que é:** fundo e frente movem em velocidades diferentes, criando profundidade.
- **Quando dá WOW:** hero com profundidade. Médio.
- **Quando NÃO usar:** ⚠️ **mobile** (trava e desorienta) e quando o "zero conversion benefit"
  pesar mais que o charme. A pesquisa de 2026 avisa: parallax raramente converte e atrapalha em
  telas pequenas. Usar com parcimônia.
- **Custo:** alto em mobile.
- **reduced-motion:** desligar (camadas estáticas).
- **De onde capturar:** coleções de parallax premiadas (awwwards.com/inspiration/scroll-
  animations); preferir a versão leve (transform por scroll), nunca biblioteca pesada.

### 7. Spotlight / cursor-reactive
- **O que é:** uma luz/glow segue o mouse; elementos reagem à posição do cursor.
- **Quando dá WOW:** dark premium (a página da ImpulsoX já usa). Dá vida sem pesar.
- **Quando NÃO usar:** mobile (sem cursor); fundo claro (o glow some).
- **Custo:** baixo (CSS var atualizada por mousemove).
- **reduced-motion:** sem o glow móvel.
- **De onde capturar:** padrão dark-premium consolidado; o spotlight da própria landing da
  ImpulsoX já é uma implementação de referência da casa.

### 8. WebGL / mouse distortion
- **O que é:** distorção/morph em tempo real do conteúdo via WebGL (Three.js + shaders GLSL);
  a luz e o glow reagem à proximidade do cursor.
- **Quando dá WOW:** **máximo** — é o que ganha Site of the Day / Site of the Month.
- **Quando NÃO usar:** 🔴 quando a performance importa (quase sempre). Ameaça o LCP e o número
  de que a marca tem orgulho (0,71s). Só quando o projeto é vitrine e o cliente aceita o peso.
  Mesmo os mestres miram 60fps desktop / 45-50fps mobile — não é de graça.
- **Custo:** pesado (bundle WebGL, GPU). Tem alternativa CSS pra ~80% do efeito percebido.
- **reduced-motion:** fallback estático obrigatório.
- **De onde capturar:** Lusion (lusion.co — Site of the Month) e OHZI Interactive
  (awwwards.com/ohzinteractive.studio — Site of the Day + Developer Award pela execução WebGL);
  coleção awwwards.com/websites/webgl. Capturar o conceito, entregar o peso só se o cliente topa.

### 9. Smooth scroll (Lenis) — a base
- **O que é:** suaviza a rolagem (física, não "pulo" nativo); sincroniza com as animações de
  scroll.
- **Quando dá WOW:** sozinho não é WOW, mas faz TODO o resto parecer caro. A cola dos efeitos de
  scroll (cinematic, parallax) — roda no próprio requestAnimationFrame, em sync com o GSAP.
- **Quando NÃO usar:** quando o scroll nativo já basta e o JS extra não se paga.
- **Custo:** baixo-médio (lib leve, ~code-split). Cuidar acessibilidade do scroll.
- **reduced-motion:** desligar, voltar ao scroll nativo.
- **De onde capturar:** Lenis (lenis.dev · github.com/darkroomengineering/lenis) — open-source,
  usado pelas top agências; exemplos cinematográficos em FreeFrontend e Codrops.

### 10. Scroll-driven video (vídeo amarrado ao scroll)
- **O que é:** um vídeo curto (ex.: transição before/after — antes sujo → depois limpo, produto
  montando, cena transformando) cujo **tempo é controlado pela posição do scroll**: o usuário
  rola e o vídeo avança quadro a quadro, em vez de tocar sozinho. A rolagem "conduz" a transformação.
- **Quando dá WOW:** prova de transformação (antes/depois de serviço — limpeza, reforma, estética),
  produto que se monta, processo que se revela. WOW + argumento juntos (mostra o resultado).
- **Quando NÃO usar:** sem narrativa de transformação clara (vira firula); vídeo longo (sequestra
  o scroll). Manter ≤5s de conteúdo.
- **Custo:** médio. Técnica leve = sincronizar `video.currentTime` à fração de scroll da seção
  (IntersectionObserver + scroll). Vídeo precisa ser otimizado/curto pra o seek ser fluido;
  alternativa moderna = CSS `animation-timeline: scroll()` onde suportado.
- **reduced-motion:** mostrar só o estado final (foto "depois") ou um before/after estático lado a lado.
- **De onde capturar:** padrão consolidado em landings de serviço premium (Jack Roberts demonstra
  na transição before/after de driveway); a mecânica `currentTime`↔scroll é canônica (CSS-Tricks
  "scroll-controlled video"). Capturar o easing/sincronia, o conteúdo é sempre do cliente.

---

## Regras inegociáveis (valem mais que qualquer efeito acima)

1. **Movimento serve a mensagem.** O melhor WOW prova algo (o count-up de "0,71s"). Efeito sem
   propósito é poluição — corta.
2. **Capturar de fonte real, nunca inventar.** Este doc nomeia o efeito e aponta o site; a
   captura do código real (keyframe, easing, JS) é o `/premium-design`. Do site vem o "como",
   nunca a identidade (cor/fonte são sempre da marca do cliente).
3. **Performance é lei.** LCP ≤ 2,5s (oficial; alvo da casa ≤ 2,0s), zero layout shift, lazy-load. WebGL pesado ameaça o número de
   que a marca tem orgulho — usar só quando o ganho justifica, com a versão CSS como alternativa.
4. **`prefers-reduced-motion` sempre.** Todo efeito tem o fallback descrito na ficha.
5. **Máximo 2-3 efeitos fortes por página.** Excesso mata o WOW; quando tudo se mexe, nada
   impressiona. Escolher os que provam algo.

---

*Fontes: Awwwards (collections animation/scroll/gsap/webgl) · Apple product pages (scroll
cinematic) · Lusion (lusion.co) e OHZI Interactive (WebGL, Site of the Day/Month) · GSAP
SplitText + Codrops/tympanus (text-split, clip-path) · Lenis / darkroomengineering (smooth
scroll) · pesquisa de micro-interações de landing 2026 (count-up, magnetic). Síntese e
curadoria PT-BR: ImpulsoX AI.*
