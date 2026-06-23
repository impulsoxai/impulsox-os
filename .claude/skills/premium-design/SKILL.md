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
  interações capturados de sites premiados reais. E RE-ESTILIZA o design do cliente no nível
  dos 3 melhores sites do NICHO dele (cliente escolhe o estilo), com a identidade cravada —
  nível dos melhores do mercado, cara do cliente. É o produto de posicionamento (10k+).
  Acervo curado por nicho em references/referencias-por-nicho.md; biblioteca em marca/design-systems/.
  (Skill de APOIO/motor de design — normalmente chamada pelo `/identidade` e pelo `/pagina`,
  não é porta de entrada do dono leigo. Quem quer "um site" pede `/pagina`; quem quer "a
  marca" pede `/identidade` — elas acionam esta por baixo.)
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

**Vocabulário de estilo de 2026 (pra nomear o que se extrai, não pra impor).** As correntes
vivas do ano dão linguagem pra descrever a direção de um DS e pra alinhar com o cliente sem
jargão vazio: **Tactile Brutalism** (brutalismo com textura/grão/sombra — cru, mas com tato,
não o brutalismo plano), **bento grid** (a grade modular de blocos de tamanhos variados, tipo
caixa de bento — organiza muita informação com hierarquia), **anti-grid** (composição
deliberadamente fora do alinhamento previsível, sobreposição e quebra de coluna). Servem como
rótulo da técnica capturada da referência — a marca do cliente continua lei (cor/fonte/clima),
o estilo só dá o "jeito" da composição.

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

## Uso 3 — Re-estilizar no nível dos melhores do nicho, com a marca CRAVADA ⭐⭐ (O PADRÃO PREMIUM)

**Este é o caminho premium padrão — o produto de posicionamento que justifica R$ 10k+, não
de "site bonito" (5k).** A diferença que o cliente vê e paga: você não faz "um site"; você o
coloca **no nível dos 3 melhores sites do mercado DELE**, com a marca dele cravada.

O fluxo que vira diferencial:
1. **3 referências premiadas DO NICHO do cliente.** Da biblioteca curada em
   `references/referencias-por-nicho.md` — os 3 melhores sites do mundo daquele mercado
   (restaurante, wellness, jurídico...). Nicho não está lá → pesquisar (Awwwards/Godly/
   Landbook por nicho) e GRAVAR no acervo (cada cliente enriquece o ativo da agência).
2. **O cliente escolhe o ESTILO, vendo** (simetria com o mood board de cor da `/identidade`):
   > "Estes são os 3 melhores sites de [nicho] do mundo. Qual desse estilo você quer pro seu?
   > Eu faço no mesmo nível — mas com a SUA cara, não a deles."
   O cliente leigo escolhe entre os melhores do mercado dele, sem saber nada de design.
3. **Re-estilizar o design do cliente no jeito escolhido**, com a identidade CRAVADA (abaixo).
   Resultado: tão bom quanto o premiado, **inconfundivelmente o cliente**. Ninguém reconhece
   o site de origem.

> **O Uso 3 já inclui o Uso 2** (re-estilizar traz a animação/efeitos junto) — é o pacote
> completo. Por isso é o padrão de premium e o que o cliente escolhe. O **Uso 2 sozinho** não
> é opção de venda; é só um detalhe técnico interno pra quando uma página simples já ficou
> boa e só falta animar, sem reformar. Cliente que paga premium quer o nível dos melhores do
> nicho dele — isso é sempre Uso 3.

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

## Imagem da página premium — Nano Banana (obrigatório) ⭐

Página premium não usa foto genérica nem placeholder na entrega final. As imagens (hero,
pratos/produtos, ambiente, retratos sem rosto identificável) são geradas com **Nano Banana**
(Gemini Image, via Fal) — o gerador que acerta luz, textura e composição de foto real. É o que
separa "site bonito com banco de imagem" de "site que parece fotografado pro cliente".

- Script: `scripts/gerar-imagem.mjs`. **Antes de uma sessão de geração, rodar `--precos`** para
  ver a tabela atual e escolher modelo × resolução (a Fal cobra por resolução; 4K dobra). Tabela
  (Fal, jun/2026 — reconferir):

  | Modelo | 0.5K | 1K | 2K | 4K | Uso |
  |---|---|---|---|---|---|
  | `nano-pro` | — | $0.15 | **$0.15** | $0.30 | **padrão página premium** (Gemini 3 Pro, estúdio) |
  | `nano` | $0.06 | $0.08 | $0.12 | $0.16 | ótimo custo×qualidade (Banana 2) |
  | `minimax` | — | $0.01 | $0.01 | $0.01 | post/redes (volume), **não** página premium |
  | `schnell`/`dev` | — | $0.003 / $0.025 | | | FLUX estilizado/iterar barato |

  Padrão premium: `--modelo nano-pro --resolucao 2K` ($0.15/img). `4K` **dobra** pra $0.30 — só
  no hero quando vale. Refação custa de novo: ajustar o prompt antes vale mais que regerar.
  `--dry-run` mostra o `custo_estimado_usd` antes de gastar. Cada geração registra o custo REAL
  (por resolução) em `dados/custos.jsonl` → painel.
- Prompt em inglês, com a paleta e o clima do design system injetados (mesma lógica do `/post`).
- **Regra de segurança (CLAUDE.md):** nunca gerar rosto identificável — retrato vira mão, nuca,
  silhueta ou pessoa de costas. Pessoa real só com foto autorizada.
- Fluxo: construir a página com blocos de foto marcados → gerar as imagens com `nano-pro` no
  clima do DS → trocar os placeholders → verificação visual. Imagem ruim derruba página premium
  inteira; é onde o "nível agência" se ganha ou se perde.

> **Nota de motor:** Nano Banana foi adicionado ao `gerar-imagem.mjs` (modelos `nano`,
> `nano-pro`) — melhoria de motor a propagar ao template via `/atualizar-motor`.

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
5. **Performance (Core Web Vitals) — medir, não confiar no olho:** a camada de movimento
   (Uso 2/3) é o maior suspeito de estourar **INP** (JS de scroll/parallax/reveal travando a
   thread) e **CLS** (reveal sem dimensão reservada). Depois de aplicar o movimento, medir:
   **LCP ≤ 2,0s · INP ≤ 200ms · CLS ≤ 0,1** (LCP "good" caiu de 2,5s pra 2,0s no core update de
   mar/2026 — era 2,5s até então; INP substituiu o FID em 2024; medir 2-3x e usar a mediana,
   descartando o 1º run — cold start do browser infla o LCP). Reprovou → enxugar
   o efeito (menos observers, animar `transform`/`opacity` em vez de layout, respeitar
   `prefers-reduced-motion`). Efeito premiado que derruba CWV não é premium — é peso. Quando
   eleva uma página do `/pagina`, esse gate é o mesmo da Etapa 4b de lá.
6. **Kinetic typography quase nunca passa em produção.** Texto que se desmonta/anima letra a
   letra é demo de reel de Awwwards, não entrega: briga com acessibilidade (leitor de tela
   perde a ordem), com crawler/IA (o texto que importa fica preso em JS e some pra quem cita)
   e com CWV (o LCP é justamente o bloco de texto do hero — animá-lo o atrasa). Capturar a
   técnica como referência de movimento tudo bem; **aplicar no texto vivo da página do cliente,
   não.** O efeito de tipografia que entra é o discreto (reveal suave do headline já montado),
   não o coreografado. Se a referência premiada é "só" kinetic type, ela é inspiração de portfólio,
   não molde de produção.

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

---

**✓ Pronto:** DNA visual extraído/recombinado e nível agência aplicado (design system em `marca/design-systems/`) · **↩ esta é uma skill de apoio:** é chamada por `/identidade` (caminho CRIAR) e por `/pagina` (antes da construção e na camada premium) — não tem próximo passo próprio nem publica nada; o fluxo volta pra skill dona da entrega.
