---
name: premium-design
description: >
  Use quando a identidade visual precisa nascer de DNA real em vez da imaginação da IA —
  "/premium-design", "extrai o design system desse site", "quero um site nível agência",
  "referências premium pra marca", "recombina essas identidades", ou chamada pelo
  /identidade (caminho CRIAR) e pelo /pagina (antes da construção). Captura o código-fonte
  de sites de referência premiados, extrai design systems completos (cores, tipografia,
  animações, layouts) e recombina numa identidade nova. Também ELEVA um design já pronto
  (ex: o que o Open Design criou) aplicando a camada premium — animações, efeitos e micro-
  interações capturados de sites premiados reais. E RE-ESTILIZA o design do cliente no jeito
  de um site premiado específico (estrutura, ritmo, animação) com a identidade do cliente
  cravada — nível do premiado, cara do cliente. Alimenta a biblioteca em marca/design-systems/.
---

# /premium-design — Motor de identidade visual por código-fonte

A técnica: em vez de prompt ou screenshot, a IA recebe o **código-fonte de sites de
referência como fonte da verdade** — destilado em design systems. Modelos de linguagem
entendem texto melhor que imagem; no código está descrito com precisão total cada cor,
keyframe, easing e regra de interação. É o que separa o resultado genérico do resultado
de agência.

Autoria: ImpulsoX AI. Conteúdo original.

## Papel dentro do sistema (roteamento)

Esta skill é **motor, não entrega final**. Tem dois usos:

**Uso 1 — EXTRAIR DNA de referências (extrair + recombinar identidade nova).**
- `/identidade` (caminho CRIAR) chama pra gerar direções a partir de referências reais
  (incluindo as 3 que o cliente escolheu no **mood board de escolha** da `/identidade`),
  em vez de propor da imaginação. Output → `marca/design-guide.md` + `marca/tokens.css`.

**Uso 2 — ELEVAR um design já pronto (a camada premium por cima do Open Design).** ⭐
- O **Open Design** cria a base — identidade e estrutura bonitas, mas estáticas (sem
  animação, sem micro-interação). Esta skill **pega esse design pronto e o eleva ao nível
  agência**: captura efeitos, animações, easing e micro-interações de **sites premiados
  reais** (Awwwards/Godly) e os APLICA sobre o design do Open Design. O design base ganha
  vida — é o que separa "bonito e normal" de "site de agência".
- Esse upgrade entra no **`/pagina`** (onde animação faz diferença; post/e-mail não animam).
  Sequência: Open Design faz a base → `/pagina` constrói a página → `/premium-design` põe a
  camada de efeitos por cima, com DNA de movimento de referências reais.

**Comum aos dois usos:**
- `/pagina` consome um design system de `marca/design-systems/` na Etapa 3 (construção).
  O processo, a copy e a conversão continuam sendo donos do `/pagina`.
- A biblioteca da agência vive em `marca/design-systems/` (no clone) e os DS genéricos
  reutilizáveis no template — cada projeto enriquece o acervo.

## Degrau mínimo (Escada de Contexto)

Roda a partir do **degrau 1** (extração pura não precisa de nada do cliente). A
**recombinação** pede degrau 2+ (briefing de marca: segmento, público, personalidade,
cores existentes). Abaixo disso, recombinar com defaults e marcar as suposições na
lista "confirmar com o cliente".

## Fluxo (3 fases)

```
FASE 1: CAPTURA      → baixar código-fonte de 1-3 referências (automático via Playwright)
FASE 2: EXTRAÇÃO     → design-system.md por referência + RECOMBINAÇÃO em identidade nova
FASE 3: CONSUMO      → /identidade grava a marca · /pagina constrói com o DS como lei
```

Nunca pular a Fase 2: código bruto direto na construção funciona pior que o design
system destilado (ruído de analytics e markup irrelevante polui o contexto).

### Fase 1 — Captura

O usuário traz 1-3 URLs de referência (Awwwards, Godly.website, Landbook — critério:
o *estilo* serve ao cliente, não o conteúdo). A skill captura sozinha com o script
Playwright de `references/captura.md` (DOM renderizado + CSS computado, com scroll
completo pra disparar lazy-load e animações). Pré-requisito uma vez por projeto:
`npm i -D playwright && npx playwright install chromium` (instruções no topo do
reference). Limpar ruído antes de extrair (instruções lá).

**Fallback nunca é silencioso.** Se a captura automática falhar (Playwright ausente —
script sai com código 2 — ou bloqueio de rede/Cloudflare), a skill **anuncia em voz
alta** antes de seguir: "⚠️ Playwright indisponível, usando captura manual" + o comando
de install. Só então cai pros métodos manuais (Ctrl+S / wget / `rendered.html` do
usuário). Degradar calado é proibido: o usuário tem que saber que entrou no caminho manual.

### Fase 2 — Extração e recombinação

1. Rodar `prompts/design-system-extractor.md` sobre cada captura → um
   `design-system.md` por referência, salvo em `marca/design-systems/`.
2. **Pra trabalho de cliente, recombinação é obrigatória**: rodar
   `prompts/design-system-recombiner.md` com os DS extraídos + o briefing da marca
   (núcleo + entrevista do `/identidade`). O resultado é uma identidade NOVA — nunca
   entregar a identidade de um único site copiada 1:1.
3. **Checkpoint:** apresentar o DS recombinado ao usuário (decisões de herança +
   amostra visual de 1 tela renderizada). Aprovação antes de gravar na marca.

### Fase 3 — Consumo

- Handoff pro `/identidade`: o DS aprovado vira `marca/design-guide.md` + as variáveis
  entram em `marca/tokens.css` (formato do `/identidade` é a autoridade).
- Handoff pro `/pagina`: anexar o DS via `prompts/site-builder.md` — o DS é lei
  absoluta de cor, tipo, espaçamento, animação e interação.

## Uso 2 — Elevar o design do Open Design (camada premium) ⭐

Quando o Open Design já entregou o design base (estático), esta skill aplica a camada de
movimento por cima. Fluxo:

1. **Receber o design base** — o HTML/specimen que o Open Design gerou (ou a página que o
   `/pagina` construiu na marca). Esse design é a estrutura a respeitar: cor, tipo, layout e
   hierarquia já estão certos e **não mudam** — a marca é lei.
2. **Capturar o DNA de MOVIMENTO de referências premiadas** (Awwwards/Godly) — Fase 1+2 acima,
   mas extraindo o que importa aqui: **animações de entrada, scroll-triggered, hover/micro-
   interações, easing (cubic-bezier), parallax, reveal, transições de estado.** O acervo de
   movimento entra em `marca/design-systems/` como qualquer DS.
3. **Aplicar sobre o design base** — adicionar as animações/efeitos SEM alterar a identidade:
   - entrada suave dos elementos no scroll (IntersectionObserver)
   - hover states e micro-interações nos botões/cards
   - easing de referência real (não o `ease` default)
   - efeitos de profundidade/reveal onde o design pede
   - **respeitar `prefers-reduced-motion`** sempre (acessibilidade, regra do CLAUDE.md)
4. **Verificação visual** (Playwright 390/768/1440px) + aprovação do usuário vendo o antes
   (Open Design estático) × depois (elevado). O movimento serve a marca; nunca a atropela.

Régua: o efeito vem de **referência real testada**, nunca inventado — é o que separa
animação premium de animação genérica. Movimento com propósito (guia o olho, dá vida), não
enfeite. Página carregada de efeito sem função cansa e derruba performance (Core Web Vitals).

## Uso 3 — Re-estilizar no estilo de um premiado, com a marca do cliente CRAVADA ⭐⭐

O caso mais forte: pegar o **jeito** de um site premiado específico (estrutura, ritmo,
sofisticação, técnica de animação) e **refazer o design do cliente naquele nível — mas com a
identidade dele cravada e inegociável.** Resultado: um site tão bom quanto o premiado, que é
**inconfundivelmente o cliente**. Ninguém reconhece o site de origem.

> **O Uso 3 já inclui o Uso 2.** Re-estilizar traz a camada de animação/efeitos junto — é o
> pacote premium completo (forma nova + movimento). Por isso o **Uso 3 é o padrão** quando o
> cliente quer "nível agência". O **Uso 2 sozinho** é o atalho do caso mais raro: o design do
> Open Design já ficou ótimo na estrutura e só falta vida — aí anima sem reformar. Na dúvida,
> e quando o cliente aponta um premiado que admira, é Uso 3.

Três ingredientes, com hierarquia clara de quem manda:

1. **Identidade do cliente (LEI — vence sempre)** — cor, fonte, logo, clima do
   `marca/design-guide.md` + `tokens.css` (já destilados, ex: do Open Design). É a âncora
   inegociável. Nada do site premiado sobrepõe isso.
2. **Estilo do site premiado (o "jeito" — empresta, não impõe)** — capturar e extrair só o
   que NÃO é identidade: estrutura de layout, ritmo/hierarquia, técnica de animação, easing,
   densidade, sofisticação de composição. NUNCA a cor, a fonte nem a marca do premiado.
3. **O design base do cliente** (Open Design) — o ponto de partida que será re-estilizado.

**Regra do conflito (decidida, não negociável):** quando o estilo do premiado brigar com a
marca do cliente (premiado é preto agressivo, cliente é bege calmo), **a marca vence e o
estilo se adapta**. Traduzir a TÉCNICA do premiado pro clima do cliente — o ritmo de
animação do site agressivo aplicado com a suavidade do bege, não o preto. Pegar o *como*, não
o *quê*. (Bate com o CLAUDE.md: a marca é sempre a do cliente; a referência ajusta dentro
dela, nunca troca paleta/fonte/identidade.)

Fluxo: capturar o premiado (Fase 1+2) → extrair só o estilo/movimento (não a identidade dele)
→ aplicar sobre o design do cliente mantendo `tokens.css` como lei → verificação visual
(antes × depois) → aprovação. Gate de originalidade vale dobrado aqui: o produto final não
pode deixar reconhecer o site de origem — se reconhece, copiou demais, recombina mais.

## Gates de qualidade

1. **Fidelidade:** valores exatos (hex, ms, cubic-bezier) — `[não especificado]` quando
   o código não diz; nunca inventar.
2. **Anti-genérico:** resultado com cards 3-em-linha óbvios, degradê roxo padrão ou
   tipografia default → voltar com correção explícita (mesma régua do `/identidade`).
3. **Originalidade:** ninguém que conheça os sites de origem pode reconhecê-los no
   produto final. **No Uso 3 isso é crítico:** do premiado vem só o *jeito* (estrutura,
   ritmo, técnica de animação), nunca a cor/fonte/marca dele — a identidade é 100% do
   cliente. Reconheceu o site de origem? Copiou o "quê" em vez do "como"; recombinar mais.
4. **Verificação visual** (quando gera tela): mesmo padrão do `/pagina` — Playwright,
   390/768/1440px, aprovação vendo.

## Regras

- Extrair *padrões* é prática normal de design; clonar identidade completa de site
  identificável pra uso comercial é risco de propriedade intelectual — por isso a
  recombinação é obrigatória em entrega de cliente.
- Design systems aprovados sempre ficam na biblioteca (`marca/design-systems/`) com
  nome descritivo e origem documentada — é ativo da agência.
- Ferramentas externas de design (impeccable, Open Design) seguem a regra da
  constituição: leem a marca do negócio, nunca impõem a própria.
- Peça visual derivada continua passando pelos fluxos donos (`/pagina`, `/post`) —
  esta skill não publica nada.
