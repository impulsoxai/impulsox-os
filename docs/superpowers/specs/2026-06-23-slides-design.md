# Spec — Skill `/slides` (deck de apresentação premium pra gravação)

> Produto da ImpulsoX AI · ImpulsoX-OS · 2026-06-23
> Status: design aprovado pelo dono. Próximo passo: plano de implementação.

---

## Problema

O dono grava vídeos (demo/pitch) onde alterna entre **slides** e a **tela do Claude Code**
mostrando o produto real sendo feito (gerar landing page, carrossel, etc). Hoje não há
ferramenta pra montar esses slides com a marca e o nível premium do sistema. Slide genérico
(PowerPoint, template default) briga com o posicionamento nível-agência da ImpulsoX.

A skill resolve: gera um **deck navegável em tela cheia**, com a marca do negócio cravada,
que roda no navegador durante a gravação e ajuda o apresentador a alternar pro Claude Code.

## O que a skill NÃO é

- Não é vídeo que toca sozinho — isso é o `/reel-marca` (Remotion). Aqui o dono navega ao vivo.
- Não é overlay/composição de OBS — é deck de tela cheia que o dono passa no clique.
- Não substitui o `/roteiro-yt` — pode receber o roteiro dele, mas o foco é o visual da apresentação.

---

## Decisões de design (aprovadas)

| Tema | Decisão |
|---|---|
| Formato de saída | Deck HTML único, tela cheia, navegação por seta (não PowerPoint, não Reveal.js) |
| Por que HTML próprio | Controle total do visual = premium real; CLAUDE.md proíbe estética de framework default. Engine de navegação é simples (~150 linhas JS). |
| Conteúdo | Motor reutilizável (qualquer tema) **+** modo institucional (pitch ImpulsoX fixo) |
| Entrada do roteiro | Escada de Contexto — aceita os 3: tema em 1 frase / roteiro colado / vindo de `/roteiro-yt`·`/tema-yt` |
| Produto real | Aparece **nos slides** (screenshot de `producao/` em mockup premium) **e** ao vivo no Claude Code (dono alterna) |
| Apoio à demo | Slides-ponte ("▶ demo ao vivo") + notas do apresentador escondidas (presenter view) |
| Nome | `/slides` |

Descartado: Reveal.js (estética presa, "cara de Reveal" briga com premium); Remotion/vídeo (é o `/reel-marca`).

---

## Arquitetura

### Saída

Deck gerado em `producao/slides/<tema>/` (na pasta do negócio/clone — NUNCA no template):

- `deck.html` — arquivo único auto-contido. Abre no navegador, funciona offline.
- assets reais copiados de `producao/` (carrosséis, screenshots de página), embutidos via mockup premium (phone/browser).
- `notas.md` — notas do apresentador exportadas, pra ter no segundo monitor.

### Controles de navegação (no `deck.html`)

| Tecla | Ação |
|---|---|
| `→` / `←` (ou espaço) | próximo / anterior slide |
| `F` | tela cheia |
| `S` | presenter view (notas do slide atual + miniatura do próximo, em janela/monitor à parte) |
| `B` | blackout (tela preta — pra pausar e ir pro Claude Code sem o deck na cena) |
| `Home` / `End` | primeiro / último slide |

### Tipos de slide (blocos prontos, marca cravada)

Cada tipo é um template de bloco. Regra herdada do `/reel-marca`: **1 herói por slide, muito
espaço negativo, answer-first**.

1. **capa** — título do vídeo + assinatura da marca.
2. **conteúdo** — headline answer-first + 1 ideia. Sem parede de texto.
3. **produto-real** — screenshot de `producao/` dentro de mockup (phone pra carrossel, browser pra página).
4. **ponte-demo** — slide-marcador "▶ demo ao vivo: [ação]". É o sinal visual pro dono fazer Alt+Tab pro Claude Code. A nota do apresentador descreve o que fazer na demo.
5. **assinatura** — fecho institucional (logo + URL), sem CTA gritado (voz da marca: entrega calma).

### Marca

Cores e fontes vêm de `marca/tokens.css` e `marca/design-guide.md`. Toda peça respeita isso.
Sem `marca/` → Escada de Contexto: reorienta pro `/identidade` OU segue com defaults premium
marcados "a confirmar".

### Notas do apresentador

Cada slide carrega uma nota escondida no `deck.html` (não aparece na projeção). O presenter
view (`S`) e o `notas.md` exportado expõem essas notas — viram um teleprompter leve da gravação.

---

## Fluxo da skill (com gates)

Lê o núcleo antes de produzir: `nucleo/negocio.md`, `nucleo/voz.md`, `nucleo/ofertas.md`,
`nucleo/provas.md`, `marca/`. Depois:

1. **Detecta a entrada** (Escada de Contexto):
   - tema em 1 frase → puxa núcleo e escreve o roteiro dos slides
   - roteiro colado → vira slides direto
   - vindo de `/roteiro-yt` ou `/tema-yt` → transforma o roteiro em slides
   - nada informado → **modo institucional** (pitch ImpulsoX pronto/versionado)

2. **Escolhe o produto real** — varre `producao/` (carrosséis, páginas), casa com o tema,
   marca quais entram em mockup. Sem produto disponível → slide de texto.

3. **GATE 1 — storyboard.** Mostra o esqueleto: lista de slides (tipo + headline + onde
   entra cada ponte-demo + qual produto real em cada um). Espera "sim".

4. **Escreve a copy** — headlines answer-first na voz do dono → passa pelo `/escritor-br`
   (humaniza). **Só oferta ATIVA** (CLAUDE.md — peça pública não vende oferta futura). Escreve
   as notas do apresentador aqui.

5. **GATE 2 — copy completa.** Mostra TODO o texto de tela + as notas, slide a slide.
   Espera "sim". (Regra do dono no `/reel-marca`: alinhar o texto antes de construir.)

6. **Constrói** o `deck.html` na marca + copia os assets reais + gera `notas.md`.

7. **Abre no navegador** pra conferência ao vivo.

**Modo institucional** = deck-base salvo e versionado; rodar de novo atualiza esse deck único.
**Modo tema** = pasta nova por vídeo em `producao/slides/<tema>/`.

---

## Encaixe no sistema

**Classificação:** OPCIONAL (o guia não empurra), eixo vídeo/apresentação.

**Pré-requisito mínimo:** `marca/`. Se falta, reorienta pro `/identidade` (Escada de Contexto).

**Esteira:**

```
(precisa antes) /identidade        → marca cravada
/roteiro-yt ou /tema-yt (opcional)  → roteiro
            │
            ▼
       /slides ──→ /gravar-tela ──→ /editar-video
       (deck premium)  (grava passando o deck)
```

Próximo passo no fecho: `/gravar-tela`.

**Reusa (não reinventa):**
- mockups phone/browser do `/reel-marca`
- humanização do `/escritor-br`
- prova real do `/provas`
- regra "1 herói por slide / answer-first" do reel e da `/pagina`

---

## Arquivos

| Arquivo | Papel |
|---|---|
| `.claude/skills/slides/SKILL.md` | fluxo guiado, 2 gates |
| `.claude/skills/slides/references/blocos.md` | templates dos 5 tipos de slide |
| `.claude/skills/slides/references/engine.html` | base HTML/CSS/JS de navegação (deck shell) |
| `producao/slides/<tema>/` | saída (no clone, nunca no template) |
| `docs/mapa-de-skills.md` | registrar na esteira YouTube/vídeo + tabela de fluxo |

Regra de ouro: skill nova nasce no **template**; desce pros clones via `/atualizar-motor`.
A saída (`producao/slides/`) é trabalho de marketing — fica no clone.

---

## Critérios de sucesso

- Deck abre no navegador, passa no clique, roda em tela cheia offline.
- Visual indistinguível do nível `/pagina` (premium, marca cravada — não tem cara de template).
- Produto real de `producao/` aparece em mockup dentro dos slides.
- Slides-ponte sinalizam a hora de ir pro Claude Code; notas do apresentador disponíveis no presenter view.
- Os 2 gates (storyboard, copy) acontecem antes de construir.
- Só oferta ATIVA citada.
- Modo institucional gera o pitch ImpulsoX sem o dono ditar o roteiro.