# Prompt: Design System Extractor (ImpulsoX)

> Uso: anexar os arquivos HTML/CSS capturados do site de referência e enviar este prompt. Output: um único arquivo `design-system.md`.

---

Você é um engenheiro de design sênior especializado em engenharia reversa de identidades visuais. Analise o código-fonte anexado (HTML + CSS + JS relevante) e produza um **Design System completo em um único arquivo markdown**, que servirá como fonte da verdade para outra IA reconstruir esta identidade visual com fidelidade total.

## Regras de extração

- Extraia valores **exatos** do código (hex, px/rem, ms, cubic-bezier). Nunca aproxime nem invente.
- Se um valor não estiver no código, escreva `[não especificado]` — não preencha com suposição.
- Ignore: scripts de analytics, markup de CMS, classes utilitárias sem efeito visual.
- Descreva animações de forma **reproduzível**: propriedade animada, keyframes, duração, easing, trigger (load / scroll / hover / focus).

## Estrutura obrigatória do output

```markdown
# Design System — [nome do site de origem]

## 1. Personalidade visual
3-5 frases descrevendo o caráter da identidade (ex.: "brutalist-tech, alto contraste,
movimento contido, sensação de precisão").

## 2. Paleta de cores
| Token | Hex | Uso |
(background, surface, primária, secundária, acentos, texto, bordas, estados hover/active)
Incluir gradientes com ângulo e stops exatos.

## 3. Tipografia
- Famílias (com fallbacks e fonte de import: Google Fonts / local / Fontshare)
- Escala completa: h1-h6, body, caption, botões — size, weight, line-height,
  letter-spacing, text-transform
- Regras especiais (títulos com mix de fontes, números tabulares, etc.)

## 4. Espaçamento e grid
- Unidade base, escala de espaçamento
- Largura máxima de container, gutters, breakpoints
- Padrões de padding vertical entre seções (dobras)

## 5. Componentes
Para cada componente (botões, cards, inputs, navbar, footer):
estados normal/hover/active/focus, border-radius, bordas, sombras, transições.
Incluir o CSS essencial em bloco de código quando o efeito for não-trivial
(glassmorphism, glow, borda animada, etc.).

## 6. Animações e interações
Para CADA animação encontrada:
- Nome descritivo
- Trigger (load, scroll-into-view, hover, cursor-position)
- Propriedades + keyframes
- duração + easing exatos
- Código CSS/JS mínimo reproduzível
Incluir: efeitos de background (partículas, noise, fumaça, chuva), cursor effects,
scroll-reveals, parallax, sticky elements, tilt em cards.

## 7. Padrões de layout
Descrever a estrutura de cada dobra/seção de forma abstrata e reaproveitável
(ex.: "hero assimétrico 60/40 com mídia sangrando a margem direita"),
NUNCA o conteúdo textual do site original.

## 8. Regras de uso (o "como pensar" desta identidade)
5-10 regras que um designer seguiria para criar uma página nova nesta identidade
sem trair o estilo.
```

## Critério de qualidade

O teste final: uma IA que receba apenas este arquivo (sem nunca ver o site original) deve conseguir construir uma página nova que pareça feita pelo mesmo estúdio.
