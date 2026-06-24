# Craft de movimento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `docs/craft-movimento.md` (catálogo de efeitos cinematográficos com WOW + curadoria de sites reais) e plugar no motor: `/premium-design` ganha o Uso 4 (captura dirigida pelo dono via URL) e lê o doc no Uso 2; `/pagina` Etapa 3.5 referencia.

**Architecture:** Doc de craft no padrão de `pitch-narrado.md`/`frase-que-pega.md` (referência lida por skills). Catálogo de 9 efeitos, ficha por efeito. O `/premium-design` continua dono da execução (captura de fonte real); o doc dá o vocabulário. Uso 4 reaproveita a Fase 1 (Captura) existente. Encaixes: CLAUDE.md, mapa, CHANGELOG, versão.

**Tech Stack:** Markdown puro. Sem código, sem testes unitários — "validação" = checagem de conteúdo + greps. Uma pesquisa web (Task 1) pra cravar os sites premiados reais por efeito. Git pra commits.

**Spec:** `docs/superpowers/specs/2026-06-24-craft-movimento-design.md`

---

### Task 1: Pesquisar os sites premiados reais por efeito

**Files:** nenhum (pesquisa; resultado alimenta a Task 2).

- [ ] **Step 1: Rodar as buscas**

Rodar WebSearch (ou a skill `firecrawl-search`) com estas queries e ANOTAR, por efeito, 2-3 sites premiados reais (com URL) que o usam de forma exemplar:

1. `Awwwards site of the day text reveal split animation GSAP examples 2026`
2. `Apple style scroll cinematic product reveal websites best examples`
3. `Lusion OHZI webgl mouse distortion award winning sites Awwwards`
4. `magnetic button tilt card hover micro-interaction premium sites examples`
5. `count-up number animation on scroll landing page examples`
6. `Lenis smooth scroll showcase sites Awwwards 2026`

Expected: uma lista por efeito com nome do site + URL + 1 linha do que ele faz bem. Se uma busca não der site nomeado, marcar "buscar na construção" — NÃO inventar URL.

- [ ] **Step 2: Consolidar**

Montar uma tabela mental/rascunho: `efeito → [site1 (url), site2 (url)] → o que capturar`. É o insumo da ficha "sites de onde capturar" de cada efeito na Task 2. Sem commit (é pesquisa).

---

### Task 2: Criar `docs/craft-movimento.md` (o catálogo)

**Files:**
- Create: `docs/craft-movimento.md`

- [ ] **Step 1: Escrever o doc**

Criar `docs/craft-movimento.md` seguindo o cabeçalho-padrão de `docs/frase-que-pega.md` (blockquote de quem lê + princípio-mãe). Estrutura EXATA:

````markdown
# Craft de movimento — a animação e os efeitos cinematográficos que dão WOW

> Lido pelo `/premium-design` (Uso 2 elevar e Uso 4 captura dirigida) e referenciado pela
> Etapa 3.5 do `/pagina`. É o catálogo do *que* existe de movimento premium, *quando* cada
> efeito dá WOW, *quando* mata performance, e de *qual site real* capturar. Base: garimpo de
> sites premiados (Awwwards/Godly/Apple/Lusion/OHZI) + pesquisa de micro-interações 2026.
>
> Princípio-mãe: **o melhor WOW prova algo.** O número "0,71s" subindo de zero impressiona E
> prova velocidade ao mesmo tempo. Movimento sem propósito é poluição. A régua é capturar de
> FONTE REAL (o `/premium-design` puxa o código do site), nunca inventar o efeito.

A régua final mora em `marca/design-guide.md` (a marca é lei) e no CLAUDE.md (LCP < 2s,
`prefers-reduced-motion` sempre). O doc nomeia e prioriza; a captura do código é o
`/premium-design`.

---

## O catálogo — 9 efeitos (do mais seguro ao mais pesado)

Cada efeito tem a ficha: **o que é · quando dá WOW · quando NÃO usar · custo · reduced-motion ·
de onde capturar**.

### 1. Text-split reveal (char/word/line)
- **O que é:** cada letra, palavra ou linha do título anima individualmente (sobe, fade, blur).
- **Quando dá WOW:** hero e títulos de seção. É o "como fizeram isso?" mais barato. A página
  já usa no hero (`.ln` sobe linha a linha).
- **Quando NÃO usar:** em texto de corpo (cansa) ou em tudo (perde o impacto).
- **Custo:** baixo (CSS + um IntersectionObserver). Cuidar de não causar layout shift.
- **reduced-motion:** trocar por fade simples (ou nada).
- **De onde capturar:** [preencher na Task 1 com 2-3 sites reais].

### 2. Count-up na viewport
- **O que é:** um número anima de 0 até o valor quando entra na tela.
- **Quando dá WOW:** quando o número É a prova (0,71s de carregamento, "44%", "+20%"). WOW +
  argumento juntos.
- **Quando NÃO usar:** número decorativo sem significado; vira firula.
- **Custo:** baixo (requestAnimationFrame + IntersectionObserver).
- **reduced-motion:** mostrar o número final direto, sem contagem.
- **De onde capturar:** [Task 1].

### 3. Scroll cinematic (Apple-style)
- **O que é:** elementos revelam com timing coreografado conforme a rolagem (produto/seção
  entra no momento certo, specs aparecem em sequência).
- **Quando dá WOW:** seção-herói de produto, demonstração. Altíssimo impacto.
- **Quando NÃO usar:** página institucional simples; sequestra o scroll se exagerado.
- **Custo:** médio (scroll-trigger; cuidar INP). Smooth scroll ajuda.
- **reduced-motion:** revelar tudo sem coreografia de scroll.
- **De onde capturar:** [Task 1].

### 4. Magnetic button / tilt card
- **O que é:** o botão "puxa" levemente o cursor; o card inclina no hover (3D leve).
- **Quando dá WOW:** CTA principal, cards de oferta. Premium tátil, sensação de produto caro.
- **Quando NÃO usar:** em todo botão (cansa); em mobile (não há cursor).
- **Custo:** baixo (JS de mousemove). Desligar em touch.
- **reduced-motion:** hover estático (só cor/sombra).
- **De onde capturar:** [Task 1].

### 5. Clip-path shape reveal
- **O que é:** elemento aparece por uma máscara geométrica que se abre (diagonal, círculo).
- **Quando dá WOW:** transição entre seções, reveal de imagem. Cinematográfico.
- **Quando NÃO usar:** quando compete com outro reveal na mesma tela.
- **Custo:** baixo-médio (CSS clip-path animado).
- **reduced-motion:** fade simples.
- **De onde capturar:** [Task 1].

### 6. Parallax em camadas
- **O que é:** fundo e frente movem em velocidades diferentes, criando profundidade.
- **Quando dá WOW:** hero com profundidade. Médio.
- **Quando NÃO usar:** ⚠️ **mobile** (trava e desorienta) e quando "zero conversion benefit"
  pesar mais que o charme. Usar com parcimônia — a pesquisa avisa que parallax raramente
  converte.
- **Custo:** alto em mobile.
- **reduced-motion:** desligar (camadas estáticas).
- **De onde capturar:** [Task 1].

### 7. Spotlight / cursor-reactive
- **O que é:** uma luz/glow segue o mouse; elementos reagem à posição do cursor.
- **Quando dá WOW:** dark premium (a página já usa). Dá vida sem pesar.
- **Quando NÃO usar:** mobile (sem cursor); fundo claro (some).
- **Custo:** baixo (CSS var atualizada por mousemove).
- **reduced-motion:** sem o glow móvel.
- **De onde capturar:** [Task 1].

### 8. WebGL / mouse distortion
- **O que é:** distorção/morph em tempo real do conteúdo via WebGL (Three.js/shaders).
- **Quando dá WOW:** **máximo** — é o que ganha Site of the Day (Lusion, OHZI).
- **Quando NÃO usar:** 🔴 quando a performance importa (quase sempre). Ameaça o LCP e o número
  de que a marca tem orgulho (0,71s). Só quando o projeto é vitrine e o cliente aceita o peso.
- **Custo:** pesado (bundle WebGL, GPU). Tem alternativa CSS pra 80% do efeito.
- **reduced-motion:** fallback estático obrigatório.
- **De onde capturar:** [Task 1].

### 9. Smooth scroll (Lenis/Locomotive) — a base
- **O que é:** suaviza a rolagem; sincroniza com as animações de scroll.
- **Quando dá WOW:** sozinho não é WOW, mas faz TODO o resto parecer caro. A cola dos efeitos
  de scroll.
- **Quando NÃO usar:** quando o scroll nativo já basta e o JS extra não se paga.
- **Custo:** baixo-médio (lib leve). Cuidar acessibilidade do scroll.
- **reduced-motion:** desligar, voltar ao scroll nativo.
- **De onde capturar:** [Task 1].

---

## Regras inegociáveis (valem mais que qualquer efeito acima)

1. **Movimento serve a mensagem.** O melhor WOW prova algo (o count-up de "0,71s"). Efeito sem
   propósito é poluição — corta.
2. **Capturar de fonte real, nunca inventar.** O doc nomeia o efeito e aponta o site; a captura
   do código real (keyframe, easing, JS) é o `/premium-design`. Do site vem o "como", nunca a
   identidade (cor/fonte são sempre da marca do cliente).
3. **Performance é lei.** LCP < 2s, zero layout shift, lazy-load. WebGL pesado ameaça o número
   de que a marca tem orgulho — usar só quando o ganho justifica, com a versão CSS como
   alternativa.
4. **`prefers-reduced-motion` sempre.** Todo efeito tem o fallback descrito na ficha.
5. **Máximo 2-3 efeitos fortes por página.** Excesso mata o WOW; quando tudo se mexe, nada
   impressiona. Escolher os que provam algo.

---

*Fontes: Awwwards (animation/scroll/gsap collections) · Apple product pages (scroll cinematic)
· Lusion / OHZI Interactive (WebGL, Site of the Day) · Lenis/Locomotive (smooth scroll) ·
pesquisa de micro-interações de landing 2026. Síntese e curadoria PT-BR: ImpulsoX AI.*
````

> Na Task 1, substituir cada `[Task 1]` / `[preencher na Task 1 ...]` pelos sites reais
> encontrados. Se um efeito ficou sem site nomeado na pesquisa, escrever "buscar referência
> premiada no nicho na hora de aplicar" — NUNCA inventar URL.

- [ ] **Step 2: Plugar os sites reais da Task 1**

Substituir todos os marcadores `[Task 1]` / `[preencher na Task 1 ...]` pelos sites encontrados
na Task 1. Varredura: `grep -n "Task 1\]" docs/craft-movimento.md` deve voltar VAZIO.

- [ ] **Step 3: Validar contra o spec**

Conferir (leitura): 9 efeitos com ficha completa (o que é/quando WOW/quando não/custo/
reduced-motion/de onde capturar)? regras inegociáveis no fecho (5)? princípio-mãe "WOW prova
algo"? fontes citadas? nenhum `[Task 1]` sobrando? nenhum travessão `—` de ênfase em prosa
(fora de tabela/fonte)?

- [ ] **Step 4: Commit**

```bash
git add docs/craft-movimento.md
git commit -m "feat(docs): craft-movimento.md — catalogo de efeitos cinematograficos com WOW

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `/premium-design` — Uso 4 + ler o doc no Uso 2

**Files:**
- Modify: `.claude/skills/premium-design/SKILL.md`

- [ ] **Step 1: Adicionar o Uso 4 (captura dirigida pelo dono)**

Em `.claude/skills/premium-design/SKILL.md`, achar o fim da seção "## Uso 3 — Re-estilizar..."
(antes de "## Gates de qualidade", ~linha 219) e inserir antes de "## Gates de qualidade":

````markdown
## Uso 4 — Captura dirigida pelo dono ("vi essa animação, faz igual") ⭐

O dono viu uma animação massa num site e quer igual. Em vez de o sistema escolher a referência,
o **dono traz a URL**. Reaproveita a **Fase 1 (Captura)** desta skill — não é fluxo novo.

- **Gatilho:** "quero essa animação", "copia o efeito desse site", "faz igual a esse site",
  dono cola uma URL.
- **Fluxo:**
  1. Fase 1 (Captura) puxa o código-fonte da URL.
  2. Isolar o efeito que o dono quer (o keyframe/easing/JS daquela animação específica) — usar
     o `docs/craft-movimento.md` pra nomear qual efeito é e entender seu custo.
  3. Adaptar com a marca do cliente: a MECÂNICA do movimento vem do site; a cor/fonte/conteúdo
     são sempre da marca (mesma régua do Uso 3 — do site vem só o "como").
  4. Plugar na página, com `prefers-reduced-motion` e a verificação de performance.
- **Cuidado (WebGL):** se o site de origem usa WebGL pesado, avisar o dono do trade-off de
  performance (ameaça o LCP) e oferecer a versão CSS equivalente do catálogo
  (`docs/craft-movimento.md`, efeito 8).
- **Régua:** nunca copiar a identidade do site de origem (cor/fonte/texto). Só o movimento.
````

- [ ] **Step 2: Fazer o Uso 2 ler o `craft-movimento.md`**

Ler a seção "## Uso 2 — Elevar..." (~linha 115-138). Na parte que fala em "Capturar o DNA de
MOVIMENTO de referências premiadas" (passo 2 do fluxo do Uso 2), acrescentar a frase de que o
catálogo guia a escolha. Achar a linha que começa com `2. **Capturar o DNA de MOVIMENTO` e
adicionar ao fim do item:

```markdown
   O catálogo `docs/craft-movimento.md` nomeia os efeitos disponíveis (text-split, count-up,
   scroll cinematic, magnetic, clip-path, parallax, spotlight, WebGL, smooth scroll), diz
   quando cada um dá WOW e quando mata performance, e aponta de qual site premiado capturar.
   Ler antes de escolher o que aplicar.
```

- [ ] **Step 3: Verificar**

Run:
```bash
cd "c:/Users/ACER/Desktop/ImpulsoX-OS" && grep -c "Uso 4" .claude/skills/premium-design/SKILL.md && grep -c "craft-movimento" .claude/skills/premium-design/SKILL.md
```
Expected: ambos ≥ 1 (Uso 4 presente; doc citado).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/premium-design/SKILL.md
git commit -m "feat(premium-design): Uso 4 (captura dirigida pelo dono) + le craft-movimento.md no Uso 2

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: `/pagina` Etapa 3.5 referencia o doc

**Files:**
- Modify: `.claude/skills/pagina/SKILL.md` (Etapa 3.5, ~linha 115-133)

- [ ] **Step 1: Adicionar a referência ao doc**

Ler a "## Etapa 3.5 — Camada premium (efeitos e animação)" do `.claude/skills/pagina/SKILL.md`.
Achar a primeira frase da etapa (a que descreve o `/premium-design` Uso 2 aplicando movimento) e
acrescentar, ao fim do primeiro parágrafo, a frase:

```markdown
O vocabulário de efeitos (o que existe, quando dá WOW, quando mata performance, de onde
capturar) mora em `docs/craft-movimento.md` — é o catálogo que o `/premium-design` lê pra
escolher o movimento certo, em vez de improvisar.
```

- [ ] **Step 2: Verificar**

Run:
```bash
cd "c:/Users/ACER/Desktop/ImpulsoX-OS" && grep -c "craft-movimento" .claude/skills/pagina/SKILL.md
```
Expected: ≥ 1.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/pagina/SKILL.md
git commit -m "docs(pagina): Etapa 3.5 referencia o catalogo craft-movimento.md

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Encaixe de motor — CLAUDE.md + mapa + versão

**Files:**
- Modify: `CLAUDE.md` (lista de docs de craft + versão rodapé)
- Modify: `docs/mapa-de-skills.md`

- [ ] **Step 1: Adicionar o doc na lista de craft do CLAUDE.md**

Em `CLAUDE.md`, achar a frase do `docs/pitch-narrado.md` (a que termina em "...demo
Tell-Show-Tell)." perto da linha 76-78) e adicionar logo depois:

```markdown
Para qualquer PÁGINA premium que precisa de MOVIMENTO (animação, efeitos cinematográficos),
ler `docs/craft-movimento.md` — o catálogo do que dá WOW (Sparkline de efeitos), quando usar,
e de qual site real capturar; lido pelo `/premium-design` e pela Etapa 3.5 do `/pagina`.
```

- [ ] **Step 2: Bump da versão (v0.2.9 → v0.2.10)**

Em `CLAUDE.md`, achar `· v0.2.9*` no rodapé e trocar por `· v0.2.10*`.

- [ ] **Step 3: Registrar no mapa**

Em `docs/mapa-de-skills.md`, achar a linha de pré-requisito do `/premium-design` (ou, se não
houver, a do `/pagina`) e acrescentar `docs/craft-movimento.md` como dependência da camada de
movimento. Se o `/premium-design` não estiver na tabela de fluxo, adicionar uma nota curta na
seção de design citando o doc. (Edição de 1 linha; manter o resto.)

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/mapa-de-skills.md
git commit -m "docs(motor): registra craft-movimento.md no CLAUDE.md + mapa, bump v0.2.10

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: CHANGELOG + push

**Files:**
- Modify: `CHANGELOG.md` (nova entrada 0.2.10 no topo)

- [ ] **Step 1: Adicionar a entrada 0.2.10**

Ler o topo do `CHANGELOG.md` e inserir, logo acima da linha `## [0.2.9] — 2026-06-24`:

```markdown
## [0.2.10] — 2026-06-24

> Craft de movimento: o sistema já elevava páginas com animação (`/premium-design` Uso 2), mas
> sem catálogo nomeado de efeitos. E faltava o caminho "dono viu uma animação e quer igual".

### Adicionado
- `docs/craft-movimento.md` — catálogo de 9 efeitos cinematográficos com WOW (text-split,
  count-up, scroll cinematic, magnetic, clip-path, parallax, spotlight, WebGL, smooth scroll),
  cada um com ficha (quando dá WOW / quando não / custo / reduced-motion / de qual site real
  capturar). Regras: movimento serve a mensagem, capturar de fonte real, performance é lei,
  reduced-motion sempre, máx 2-3 por página. Lido por `/premium-design` e `/pagina`.
- `/premium-design` **Uso 4** — captura dirigida pelo dono: ele cola a URL de um site, a skill
  usa a Fase 1 (Captura) pra isolar o efeito e adapta com a marca. Do site vem só o "como".

### Mudado
- `/premium-design` Uso 2 lê o `craft-movimento.md` (ganha o vocabulário que faltava).
- `/pagina` Etapa 3.5 referencia o catálogo.
- `CLAUDE.md` — craft-movimento.md entra na lista de docs de craft lidos.
```

- [ ] **Step 2: Verificar a ordem**

Run:
```bash
cd "c:/Users/ACER/Desktop/ImpulsoX-OS" && grep -n "^## \[0\.2\.1\?" CHANGELOG.md | head -3
```
Expected: `0.2.10` aparece ANTES de `0.2.9`.

- [ ] **Step 3: Commit + push**

```bash
cd "c:/Users/ACER/Desktop/ImpulsoX-OS" && git add CHANGELOG.md && git commit -m "docs(changelog): 0.2.10 — craft-movimento.md + Uso 4 do /premium-design

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>" && git push
```
Expected: push OK pra main.

---

## Notas pro executor

- **É tudo markdown.** Sem teste unitário; "validação" = leitura + greps. Não inventar testes.
- **Não inventar URL de site.** Na Task 1, se a pesquisa não der site nomeado pra um efeito,
  escrever "buscar referência premiada no nicho na hora de aplicar" — nunca fabricar link.
- **Não tocar trabalho de cliente.** Aplicar os efeitos na landing da ImpulsoX-AI é FORA deste
  plano (é rodar `/premium-design` Uso 2 depois). Este plano é só motor.
- **Voz da casa nos exemplos:** ambição calma, sem travessão `—` de ênfase em prosa, acento
  correto (UTF-8).
