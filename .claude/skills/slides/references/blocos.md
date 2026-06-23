# Blocos de slide — `/slides`

Cada bloco é um `<section class="slide" data-notes="…">` pra colar no `<!-- SLIDES -->` do
`engine.html`. `data-notes` = nota do apresentador (escondida na projeção; aparece no presenter
view com `S` e no `notas.md`). Regra de ouro herdada do `/reel-marca`: **1 herói por slide,
muito espaço negativo, answer-first**. Sem parede de texto.

## 1. capa
```html
<section class="slide" data-notes="Abertura. Falar o gancho do vídeo em 1 frase.">
  <p class="kicker">[NOME DA MARCA]</p>
  <h1>[Título do vídeo]<br><span class="accent">[ênfase]</span></h1>
</section>
```

## 2. conteúdo (1 ideia, answer-first)
```html
<section class="slide" data-notes="[o que falar aqui]">
  <p class="kicker">[seção]</p>
  <h2>[Headline que já é a resposta]</h2>
  <p>[1 frase de apoio — no máximo. Não encher.]</p>
</section>
```

## 3. produto-real (screenshot em mockup)
Phone (carrossel) ou Browser (página). `src` aponta pro asset copiado de `producao/`.
```html
<section class="slide" data-notes="[contar o que esse produto resolve]">
  <h2>[O que isso mostra]</h2>
  <div class="mockup mockup--phone">
    <img src="assets/[arquivo].png" alt="[descrição real]">
  </div>
</section>
```
CSS dos mockups (a skill garante que está no `<style>` do deck — adicionar ao engine ao montar):
```css
.mockup--phone{width:min(34vh,300px);aspect-ratio:9/19.5;border:10px solid #1a1430;border-radius:36px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.5);align-self:center}
.mockup--browser{width:min(70vw,900px);aspect-ratio:16/10;border:1px solid #2a2342;border-radius:12px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.5);align-self:center;background:#0c0a16}
.mockup img{width:100%;height:100%;object-fit:cover;object-position:top}
```

## 4. ponte-demo (sinal de Alt+Tab pro Claude Code)
```html
<section class="slide" data-notes="DEMO AO VIVO: [passo a passo do que fazer no Claude Code]. Voltar pro deck quando terminar.">
  <p class="kicker">▶ demo ao vivo</p>
  <h2><span class="accent">[ação]</span> ao vivo no Claude Code</h2>
  <p>[1 linha do que o espectador vai ver]</p>
</section>
```

## 5. assinatura (fecho institucional)
```html
<section class="slide" data-notes="Fecho. Sem CTA gritado — entrega calma.">
  <h2>[Marca]</h2>
  <p class="kicker">[kicker institucional — ex: Agência de IA pra PME]</p>
  <p>[url]</p>
</section>
```