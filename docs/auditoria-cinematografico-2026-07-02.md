# Auditoria externa — Eixo CINEMATOGRÁFICO/DESIGN (prioridade nº2)

> Auditor externo (agente com contexto limpo + pesquisa web) · 2026-07-02
> Escopo: pagina, premium-design, identidade, revisar-pagina, reel-marca, slides,
> gravar-tela, editar-video + craft-movimento.md, dna-cinematografico.md.
> Não repete achados de 2026-06-22 (vídeo/conteúdo), 2026-06-23 (sistema), 2026-06-29
> (esteira) nem 2026-07-02 (copy). Etapa 2 de 6 da auditoria total.

---

## 1. Diagnóstico do eixo em 5 linhas

A doutrina é excelente — craft-movimento e dna-cinematografico estão entre os melhores docs do OS, honestos e priorizados. Mas o eixo é **doutrina-pesado e execução-leve**: promete "capturar easing exato de site premiado" quando o JS dos premiados é bundle minificado (a captura de movimento raramente funciona de verdade), e não tem UMA linha de código de efeito testado da casa pronta pra usar. Pior: **o movimento — a coisa vendida como diferencial de R$ 10k — nunca passa por QA**: a Etapa 4 do /pagina e o /revisar-pagina julgam screenshots ESTÁTICOS; o produto cinematográfico morre invisível nos dois gates. A marca não tem identidade de movimento (tokens.css só tem cor/fonte/raio/espaço — zero duração/easing), então cada peça inventa o próprio ritmo. E o catálogo já envelheceu: CSS scroll-driven nativo (universal em 2026, compositor thread = resolve a briga cinema×INP) e View Transitions API não existem no doutrinário. Distância real pra "nível estúdio": média — a cabeça está certa, faltam as mãos e os olhos.

## 2. Por skill

### /pagina (`.claude/skills/pagina/SKILL.md`)
- 🔴 **Etapa 4a verifica movimento com foto parada** (`SKILL.md:245-248`). Três screenshots estáticos não veem entrada no scroll, easing, parallax, vídeo hero rodando — a camada 3.5 inteira escapa da verificação obrigatória. Playwright grava vídeo nativamente (`recordVideo`) — capturar um scroll-through de ~15s por largura custa quase nada.
- 🟡 **Etapa 3.5 depende de acervo que não existe no template** (`SKILL.md:127-130`): "escolher um DS de `marca/design-systems/`" — a pasta no template é `.gitkeep`. Todo clone novo começa a camada premium do zero, com captura ao vivo (lenta, frágil). Falta o seed: 2-3 DS genéricos prontos no template.
- 🟢 Inconsistência de largura de teste: /pagina crava **390px** (`SKILL.md:245`), o site-builder do premium-design manda testar **375** (`prompts/site-builder.md:32`). Unificar (390 é o iPhone moderno).

### /premium-design (FOCO — ver §3)
- 🔴 **A promessa central ("easing/keyframe exato do código real") quebra na prática** — ver §3.
- 🟡 **Acervo por nicho: 3 de 7 nichos preenchidos** (`references/referencias-por-nicho.md:41-79`): wellness, jurídico, e-commerce e saúde estão vazios ("pesquisar e gravar"). O Uso 3 — o produto de 10k+ — depende desse acervo pra reunião de venda; hoje só restaurante, imobiliário e SaaS têm munição pronta.
- 🟢 Tabela de preços Nano Banana datada "jun/2026 — reconferir" (`SKILL.md:220-227`) sem rotina de reconferência definida (quem, quando).

### /identidade (`.claude/skills/identidade/SKILL.md`)
- 🟡 **A marca nasce sem personalidade de movimento.** A estrutura do design-guide (`SKILL.md:207-226`) tem conceito/cores/tipografia/logo/tom/entidade — nenhuma seção "Movimento"; tokens.css (`SKILL.md:228-231`) define `--cor-* --fonte-* --raio-* --espaco-*` — zero `--dur-*`/`--ease-*`. Resultado: /pagina, /reel-marca e /slides inventam cada um seu ritmo; a "assinatura de movimento" (que o dna-cinematografico chama de easing autoral, técnica nº5, "quase de graça, alto retorno") não tem onde morar.
- 🟢 O mood board de escolha (Caminho B) mostra aberturas **estáticas** de sites premiados — sendo o eixo cinematográfico, um GIF/clip de 3s de cada referência comunicaria o clima de movimento que o print mata.

### /revisar-pagina (`.claude/skills/revisar-pagina/SKILL.md`)
- 🔴 **Os olhos frios são cegos pra movimento.** A captura gera 3 PNGs + texto (`SKILL.md:60-65`) e o escopo declara "design visual + copy… não cobre conversão/UX-flow, nem técnico/performance" (`SKILL.md:142-144`). Ninguém no sistema julga com olhos frios se a animação está boa, brega, lenta ou quebrada. O diferencial premium não tem revisor.
- 🟢 A régua cita `marca/design-systems/` como "DNA premiado do nicho" (`SKILL.md:45`) — vazio no template (mesmo problema do /pagina); o fallback avisa, ok, mas na prática o modo "genérico" será o padrão nos clones novos.

### /reel-marca (FOCO — ver §3)
- 🟡 **Som é afterthought** — ver §3.
- 🟡 **Molde único = fingerprint de agência** — ver §3.

### /slides (`.claude/skills/slides/SKILL.md`)
- 🟡 **Deck "premium pra gravar vídeo" sem nenhuma doutrina de transição/entrada** (passo 9, `SKILL.md:113-151`): o OD entrega scroll-snap e a skill pluga teclado — o corte entre slides é seco. Num vídeo gravado, a transição de slide É o motion design; um crossfade/slide-reveal de 300ms com o easing da marca já separa de PowerPoint. (Os decks de referência citados — Linear/Vercel/Stripe — vivem de micro-transições.)
- 🟢 O reel roda dentro do mockup (ótimo), mas não há regra de *quando* ele começa (autoplay desde o load = o dono chega no slide com o loop no meio). Reiniciar `currentTime=0` ao entrar no slide é 3 linhas.

### /gravar-tela + /editar-video
Já cobertos em profundidade pela auditoria de 2026-06-22. Achados novos apenas:
- 🟢 **editar-video:** legenda karaokê copia o molde de Chase/Matt/Yury (`SKILL.md:22-28`) — correto — mas não há parâmetro de posição/tamanho/cor exposto como token da marca; a cor ativa "dourado da marca" está hardcoded na prática. Quando o clone for de um cliente, a legenda precisa sair nos tokens DELE.
- 🟢 **editar-video:** não existe opção de música de fundo no long-form (só intro/outro templates, `SKILL.md:169-172`) — o reel-marca tem doutrina de trilha (volume 0.22, fades), o long-form não herda nada disso.

### Docs de apoio (craft-movimento.md, dna-cinematografico.md)
- 🟡 **Catálogo desatualizado pro estado 2026 da plataforma**: CSS scroll-driven nativo (`animation-timeline: scroll()/view()`) só aparece de raspão dentro do efeito #10 (`craft-movimento.md:139`), quando em 2026 é suporte universal e roda no compositor (resolve o próprio problema de INP que o doc teme); scroll-triggered nativo chega no Chrome 145; **View Transitions API não existe em nenhum doc** — e a tabela do dna sugere Barba.js (`dna-cinematografico.md:90`), que virou legado pra multi-página.
- 🟡 **Faltam 2 assinaturas de estúdio no catálogo**: preloader narrativo/coreografado (a primeira impressão dos premiados, ausente dos 10 efeitos) e som sutil na web (Obys usa sound cues; nem uma linha de doutrina "quando cabe / muted-by-default / toggle").
- 🟢 A tabela do dna cita sites por nome sem URL (`dna-cinematografico.md:85-94`: C2MTL, Sundae Creative, Motto, Toyfight…) — sites premiados saem do ar rápido; sem URL nem data de validação, o operador googla e pode capturar o site errado.

## 3. Dobro de profundidade: o pipeline entrega WOW consistente?

**Veredito honesto: entrega WOW *possível*, não WOW *consistente*.** O que garante consistência num estúdio são três coisas que o pipeline não tem: biblioteca de assets executáveis, identidade de movimento da marca, e QA que enxerga movimento.

### /pagina + /premium-design (o produto principal)

**O furo estrutural — a captura de movimento é uma promessa frágil.** Toda a arquitetura repousa em "capturar o código real do premiado" (`premium-design/SKILL.md:123-130`, `captura.md`). Isso funciona pra **CSS** (cores, tipografia, keyframes declarativos) — e os 3 DS já extraídos provam (easings expo do ballenacabo/borealis vieram). Mas o movimento dos premiados de verdade mora em **GSAP/Three.js dentro de bundle minificado de Next/Nuxt** — o script de captura pega `document.styleSheets`, não timelines JS. O próprio captura.md admite (`captura.md:41`: "se tudo for minificado, capturar pelo menos os keyframes CSS e **descrever o comportamento observado**") — ou seja, no caso comum, o sistema volta a *inventar* o movimento a partir de uma descrição, exatamente o que a doutrina proíbe. **A saída de estúdio:** parar de fingir que captura JS e construir a **biblioteca de efeitos da casa** — `references/efeitos/` com implementações auditadas e license-safe dos 10 efeitos do catálogo (fonte: tutoriais Codrops, docs GSAP — grátis desde 2025, demos open-source, Lenis), cada uma já com `prefers-reduced-motion`, `@supports` e teste de INP. Captura de site premiado vira o que ela realmente é: referência de *direção* (ritmo, quando, quanto), não de código.

**O segundo furo — ninguém vê o movimento antes do cliente.** Gate 4 do premium-design (`SKILL.md:253-262`) mede CWV do movimento (ótimo), Gate de verificação visual usa os 3 stills. A Etapa 4a do /pagina idem. O /revisar-pagina idem. Um easing errado, um reveal que engasga, um parallax que treme em 768px — nada disso aparece em screenshot. É o equivalente a auditar a copy lendo só os headlines. Fix barato: `context.newPage({ recordVideo })` + scroll roteirizado → um `scroll-390.webm`/`scroll-1440.webm` que entram na aprovação do dono E no despacho do revisor-pagina.

**O terceiro — consistência entre páginas do mesmo cliente.** Sem motion tokens na marca, a página 1 pode sair com expo 0.6s e a página 2 com cubic 0.3s; o site institucional multi-página (fluxo novo do /pagina Etapa 1) vai expor isso. O dna-cinematografico já nomeia "easing autoral" como a técnica mais barata de maior retorno — mas não há ONDE gravá-la de forma que as skills consumam.

**O que está genuinamente forte:** a regra GEO-safe da Etapa 3.5 (`pagina/SKILL.md:176-185`) é melhor que o que a maioria das agências premiadas pratica; o gate anti-kinetic-typography em página (`premium-design/SKILL.md:263-270`) é maduro; a receita de vídeo hero com teste duplo anti-AI-slop e pôster-como-LCP (`pagina/SKILL.md:199-241`) está alinhada com web.dev; a hierarquia de esforço do dna ("80% do caro mora em easing+text-split+micro-interação") é exatamente o que a pesquisa confirma.

### /reel-marca

**Forte:** estrutura de retenção com dados, gates de texto, regras técnicas pagas com sangue (judder, public/, fundo sólido), capa do money shot, CTA local. Isso já é acima da média de agência pequena.

**Onde não é estúdio ainda:**
1. **Sound design é o maior gap.** A pesquisa 2026 é unânime: sound design custom é O separador de reel amador vs estúdio — e no fluxo a trilha é um mux opcional no passo 12b (`SKILL.md:111-125`) com régua de volume. Não existe: SFX sincronizado (whoosh na transição, tick no count-up, pop no reveal), corte no beat da música (escolher a trilha ANTES do storyboard e cortar cenas nos tempos dela, não muxar depois), nem doutrina de biblioteca de SFX license-safe. O Remotion suporta áudio por sequência nativamente — é código, não edição manual.
2. **Molde único = todos os clientes com a mesma cara.** `templates/reel-referencia.tsx` é O template (`SKILL.md:103-104,177`); tema.ts troca cor/fonte, mas composição, transições e ritmo são idênticos. Dois clientes do mesmo bairro terão reels gêmeos de paleta trocada — o oposto de "identidade cravada". Precisa de 2-3 direções de template (calmo-editorial / enérgico-comercial / técnico-dark) mapeadas ao clima do design-guide, ou variação paramétrica via motion tokens.
3. **Primeiros 3s sem doutrina de MOTION** (só de copy/estrutura). A pesquisa aponta: é nos 3 primeiros segundos e no beat final que template denuncia template — defaults empilham movimento demais na abertura. O hook empilhado cobre o *o quê*; falta o *como se move* (1 movimento dominante, entrada em ≤400ms, hold antes do resultado).
4. Kinetic typography — proibida em página (certo), é **bem-vinda em reel** e nenhum doc dá o craft dela pra 9:16 (escala, tracking animado, sincronia palavra-voz). O conhecimento de motion do reel vive na memória do dono e no .tsx de referência, não num reference file versionado que desce pros clones.

## 4. Top 8 melhorias do eixo (impacto ÷ esforço)

| # | Melhoria | Arquivo | Por quê | Fonte |
|---|---|---|---|---|
| 1 | **QA de movimento: gravar scroll-through em vídeo** na Etapa 4a e no /revisar-pagina (Playwright `recordVideo`, 390+1440, entra na aprovação e no despacho frio) | `pagina/SKILL.md:245-248` · `revisar-pagina/references/captura-screens.md` | O diferencial vendido nunca passa por QA; hoje só o estático é verificado | playwright.dev/docs/videos |
| 2 | **Biblioteca de efeitos executáveis da casa** (`premium-design/references/efeitos/` — os 10 do catálogo em código auditado, license-safe, com reduced-motion e @supports) | novo + `craft-movimento.md` | Captura de JS minificado de premiado raramente rende; snippet testado = WOW consistente e rápido em todo clone | tympanus.net/codrops · gsap.com (grátis desde 2025) |
| 3 | **CSS scroll-driven nativo como default 2026** (`animation-timeline: scroll()/view()` — compositor thread, INP-safe; JS só onde o nativo não chega) + **View Transitions API** no lugar de Barba.js pra multi-página | `craft-movimento.md:139` · `dna-cinematografico.md:90` · `site-builder.md:30` | Suporte universal em 2026; resolve por arquitetura a briga cinema×INP que os gates hoje só medem depois | MDN scroll-driven · Chrome scroll-triggered · Josh Comeau |
| 4 | **Motion tokens na marca**: seção "Movimento" no design-guide + `--dur-rapida/-media/-lenta` e `--ease-marca` no tokens.css; /pagina, /reel-marca (tema.ts) e /slides consomem | `identidade/SKILL.md:207-231` · `reel-marca` gerar-tema | Easing autoral é a técnica nº1 barata do próprio dna-cinematografico — sem lugar pra morar, cada peça inventa o ritmo | muz.li/blog/web-design-trends-2026 |
| 5 | **Sound design no /reel-marca**: trilha escolhida ANTES do storyboard, cortes no beat, SFX sincronizado por código (whoosh/tick/pop via `<Audio>` do Remotion), biblioteca SFX license-safe em `public/sfx/` | `reel-marca/SKILL.md:106,111-125` | Pesquisa 2026: sound design custom é o separador nº1 amador→estúdio; hoje é mux opcional no fim | envato motion trends 2026 · remotion skill oficial |
| 6 | **Preloader narrativo + coreografia de primeira dobra** como efeito #11 do catálogo (com regra de custo: só quando carrega >1s de assets; nunca atrasar LCP artificialmente) | `craft-movimento.md` (novo efeito) | A entrada é a assinatura de estúdio mais visível dos premiados e está ausente do catálogo | awwwards.com/websites/transitions |
| 7 | **Completar o acervo por nicho** (wellness, jurídico, e-commerce, saúde) + URLs e data de validação na tabela do dna + 2-3 DS genéricos seed em `marca/design-systems/` do template | `referencias-por-nicho.md:41-79` · `dna-cinematografico.md:85-94` | O produto 10k+ (Uso 3) depende do acervo na reunião; clone novo hoje começa com biblioteca vazia | godly.website · awwwards.com |
| 8 | **2-3 direções de template no /reel-marca** (calmo-editorial / enérgico / técnico) mapeadas ao clima do design-guide + doutrina de motion dos 3 primeiros segundos num reference file versionado | `reel-marca/SKILL.md:103-104,177` + novo `references/` | Molde único = reels gêmeos entre clientes; e o craft de motion do reel hoje vive só na memória do dono, não desce pros clones | envato motion trends 2026 |

**Menores (não entram no top):** unificar 375→390px (`site-builder.md:32`); transições de slide no /slides + reiniciar vídeo do mockup ao entrar no slide; GIF/clip no mood board da /identidade; tokens de legenda karaokê no /editar-video; doutrina de som-na-web (muted-by-default) de 5 linhas no dna.

---

## Fontes principais

MDN — Scroll-driven animations · Chrome Developers — scroll-triggered animations · Josh Comeau — Scroll-Driven Animations · web.dev — Optimize LCP · Etavrian — lazy-loading LCP penalty (só 17% usam fetchpriority) · Awwwards — GSAP / Transitions · Envato — 11 Motion Design Trends 2026 · Remotion official skill/best practices (github.com/remotion-dev/skills) · Muzli — Web Design Trends 2026 · Groto — agency pricing 2026 · tympanus.net/codrops · playwright.dev/docs/videos

---

**Resumo pro dono em uma frase:** a cabeça cinematográfica do sistema está certa e à frente do mercado em honestidade (GEO-safe, CWV, anti-slop); o que falta pra "nível estúdio" é dar mãos (biblioteca de efeitos e SFX executáveis), assinatura (motion tokens da marca) e olhos (QA que grava o movimento) — quase tudo de esforço baixo-médio, nenhum bloqueio estrutural.
