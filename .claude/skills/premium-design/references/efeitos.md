# Biblioteca de efeitos da casa — código executável dos 11 do catálogo

> A resposta ao problema real: o movimento dos premiados mora em bundle minificado — a
> captura NÃO rende código. Esta biblioteca é o código TESTADO e license-safe de cada
> efeito do `docs/craft-movimento.md`; a captura de premiado entra como DIREÇÃO (ritmo,
> quando, quanto). Regras que TODO snippet daqui já segue e o uso não pode quebrar:
> 1. **Motion tokens da marca:** duração/easing SEMPRE `var(--dur-*)`/`var(--ease-marca)`
>    do `marca/tokens.css` (fallback nos snippets só pra rodar isolado).
> 2. **`prefers-reduced-motion` embutido** — nunca remover o bloco.
> 3. **Nativo primeiro:** scroll-driven em CSS (`animation-timeline`) com `@supports`;
>    JS é o fallback, não o caminho.
> 4. Fontes de referência (grátis/licença ok): MDN scroll-driven animations, GSAP (grátis
>    desde 2025), Codrops (tutoriais), Lenis (MIT). Nada copiado de site premiado.

Base comum (uma vez por página):

```css
:root {
  --dur-rapida: 180ms; --dur-media: 380ms; --dur-lenta: 700ms;
  --ease-marca: cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}
```

```js
// Observer único de entrada-na-tela (reusado pelos efeitos 1, 2 e 5)
const noViewport = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); noViewport.unobserve(e.target); }
}), { threshold: 0.25 });
document.querySelectorAll("[data-anima]").forEach((el) => noViewport.observe(el));
```

---

## 1. Text-split reveal (linha a linha — a versão segura pra leitor de tela)

```html
<h1 class="split"><span class="ln"><span>Sua cozinha pronta,</span></span>
<span class="ln"><span>sem obra eterna.</span></span></h1>
```
```css
.split .ln { display: block; overflow: clip; }
.split .ln > span { display: inline-block; transform: translateY(110%); }
.split.in .ln > span { transform: none; transition: transform var(--dur-lenta) var(--ease-marca); }
.split.in .ln:nth-child(2) > span { transition-delay: 100ms; } /* stagger 80-120ms */
```
(Split por LETRA só com GSAP SplitText — o de 2025 já cuida do aria/revert.)

## 2. Count-up na viewport

```js
function countUp(el) { // <span data-count="147" data-sufixo="+">0</span>
  const alvo = +el.dataset.count, t0 = performance.now(), dur = 1200;
  (function tick(t) {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); // ease-out cúbico
    el.textContent = Math.round(alvo * e) + (el.dataset.sufixo || "");
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
// reduced-motion: pular a animação, cravar o valor direto
if (matchMedia("(prefers-reduced-motion: reduce)").matches)
  document.querySelectorAll("[data-count]").forEach((el) => el.textContent = el.dataset.count + (el.dataset.sufixo || ""));
```

## 3. Scroll cinematic (elemento preso que anima com a rolagem) — NATIVO

```css
@supports (animation-timeline: view()) {
  .cena { animation: cena-zoom linear both; animation-timeline: view(); animation-range: entry 0% cover 60%; }
  @keyframes cena-zoom { from { transform: scale(0.92); opacity: 0.4; } to { transform: none; opacity: 1; } }
}
/* Fallback JS só se precisar suportar engine velho: IntersectionObserver + classe .in */
```

## 4. Magnetic button / tilt card

```js
document.querySelectorAll(".magnetico").forEach((b) => {
  b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.x - r.width / 2) * 0.25}px, ${(e.clientY - r.y - r.height / 2) * 0.25}px)`;
  });
  b.addEventListener("pointerleave", () => { b.style.transform = ""; });
});
```
```css
.magnetico { transition: transform var(--dur-rapida) var(--ease-marca); }
@media (prefers-reduced-motion: reduce), (pointer: coarse) { .magnetico { transform: none !important; } }
```

## 5. Clip-path shape reveal

```css
.reveal { clip-path: inset(0 100% 0 0); }
.reveal.in { clip-path: inset(0 0 0 0); transition: clip-path var(--dur-lenta) var(--ease-marca); }
```

## 6. Parallax em camadas — NATIVO

```css
@supports (animation-timeline: scroll()) {
  .paralaxe-fundo { animation: sobe linear both; animation-timeline: scroll(root); }
  @keyframes sobe { to { transform: translateY(-12%); } } /* fundo anda MENOS que o conteúdo */
}
```
(Deslocamento ≤15% e só em 1-2 camadas — mais que isso treme em 768px; o QA de vídeo pega.)

## 7. Spotlight / cursor-reactive

```css
.spot { background: radial-gradient(360px at var(--mx, 50%) var(--my, 50%), rgb(255 255 255 / 6%), transparent 70%); }
```
```js
document.querySelector(".spot")?.addEventListener("pointermove", (e) => {
  e.currentTarget.style.setProperty("--mx", e.offsetX + "px");
  e.currentTarget.style.setProperty("--my", e.offsetY + "px");
});
```

## 8. WebGL / mouse distortion
Sem snippet embutível honesto — é Three.js + shader por projeto (pesado; só com orçamento
e depois do gate de CWV). Partir dos exemplos oficiais three.js e dos tutoriais Codrops de
"image distortion"; NUNCA como primeiro efeito da página. O resto da página continua
funcionando com WebGL desligado (progressive enhancement).

## 9. Smooth scroll (Lenis, MIT) — a base quando há timeline JS

```js
import Lenis from "lenis"; // ou o build UMD local
const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) });
function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
if (matchMedia("(prefers-reduced-motion: reduce)").matches) lenis.destroy();
```
(Se a página só usa efeitos nativos 1-7, NÃO instalar Lenis — scroll nativo é mais leve.)

## 10. Scroll-driven video (currentTime ↔ scroll)

```js
const vid = document.querySelector(".video-scroll video"); // muted, playsinline, preload="auto", ≤5s
const sec = document.querySelector(".video-scroll");
addEventListener("scroll", () => {
  const r = sec.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  if (vid.duration) vid.currentTime = vid.duration * p;
}, { passive: true });
// reduced-motion OU seek travado em mobile (testar no QA): trocar por before/after estático
```

## 11. Preloader narrativo + coreografia da primeira dobra

```html
<div class="preloader" aria-hidden="true"><span class="pl-logo">[logo/palavra]</span></div>
```
```css
.preloader { position: fixed; inset: 0; display: grid; place-items: center; background: var(--cor-fundo); z-index: 99; transition: opacity var(--dur-media) var(--ease-marca), visibility 0s var(--dur-media); }
html.pronto .preloader { opacity: 0; visibility: hidden; }
/* a primeira dobra entra ESCALONADA depois do pronto (stagger 80-120ms) */
.hero [data-entra] { opacity: 0; transform: translateY(24px); }
html.pronto .hero [data-entra] { opacity: 1; transform: none; transition: opacity var(--dur-lenta) var(--ease-marca), transform var(--dur-lenta) var(--ease-marca); }
html.pronto .hero [data-entra]:nth-child(2) { transition-delay: 100ms; }
html.pronto .hero [data-entra]:nth-child(3) { transition-delay: 200ms; }
```
```js
// REGRA DE CUSTO: só existe se há carga real (>1s de assets). Nunca segurar LCP de página leve.
const pronto = () => document.documentElement.classList.add("pronto");
if (matchMedia("(prefers-reduced-motion: reduce)").matches) pronto();
else Promise.race([
  Promise.all([document.fonts.ready, new Promise((r) => addEventListener("load", r, { once: true }))]),
  new Promise((r) => setTimeout(r, 2500)), // teto duro: preloader nunca passa de 2,5s
]).then(pronto);
```

---

## Como a /pagina e a /premium-design usam

1. Escolher os efeitos pelo catálogo (`docs/craft-movimento.md` — quando dá WOW / quando
   não) e pela DIREÇÃO capturada do nicho (ritmo, quanto, onde).
2. Colar daqui o snippet e trocar os fallbacks pelos tokens da marca.
3. Rodar o QA de movimento (vídeo do scroll, Etapa 4a do /pagina) + gate de CWV.
4. Efeito novo comprovado em projeto → entra AQUI como efeito #12+, com a mesma ficha
   (o acervo cresce com trabalho real, não com promessa).
