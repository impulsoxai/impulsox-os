---
name: post
description: >
  Use para criar peça visual de Instagram — "cria um carrossel", "faz um post",
  "/post", "conteúdo pro Instagram", "post educativo sobre X", ou ao executar uma linha
  do calendário marcada como IG. Produz carrossel, post único ou **reel (foto + vídeo)**
  com a identidade da marca: carrossel/post em PNG 1080x1350; reel em vídeo vertical
  1080x1920 (foto realista por IA, animada e legendada) + legenda pronta.
  (Reel aqui = foto/cena REAL por IA. Reel de MOTION GRAPHICS por código — texto animado +
  produto em mockup, vídeo institucional/de marca — é o `/reel-marca`.)
---

# /post — Peça visual de Instagram

Pega um tema (do calendário ou do pedido direto) e entrega: arquivos PNG prontos pra
postar + legenda na voz da marca. O visual sai da identidade em `marca/`; o texto passa
pelo `/escritor-br` antes de fechar.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda no degrau 0 com os defaults premium; calibra de verdade a partir do **degrau 2**
(com `marca/` definida). Sem marca, marca a peça como feita com defaults.

## O que ler antes

- `docs/gabarito-execucao-social.md` — **PRIMEIRO**: o checklist de execução com gates
  (ordem de leitura, 2 passes de copy, QA visual com defeitos nomeados). É o que garante
  a mesma qualidade em qualquer modelo — nenhum gate dele é opcional
- `marca/design-guide.md` + `marca/tokens.css` — obrigatório para qualquer pixel
- `nucleo/voz.md` e `nucleo/negocio.md` — pro texto; em `negocio.md`, o campo
  **Opinião contrária / Wedge** é o combustível dos ângulos polarizadores (post
  "todo mundo erra X", contrarian take) — usar quando o tema pede posição
- `nucleo/ofertas.md` — cada oferta rende ângulos de pauta: **educativo** (como funciona),
  **objeção** (a dúvida que trava a venda) e **prova** (caso ou número real)
- `nucleo/perfil.md` — o tipo de negócio molda formato e tom (criador fala em 1ª pessoa
  com opinião forte; PME local ensina o nicho com prova local)
- `nucleo/aprendizados.md` — o que a medição já provou que funciona aqui; pesa mais que
  qualquer padrão genérico (ex: se "carrossel de erro" salva mais, priorizar o ângulo)
- `docs/persuasao.md` — gatilhos, storytelling e loops; escolher os gatilhos da peça
  pela intenção do calendário (mapa no playbook) **antes** de escrever
- `docs/formulas.md` — moldes de estrutura testados; quando um serve ao tema, usar como
  esqueleto (priorizando os **validados aqui**) e registrar o nome da fórmula no
  `legenda.md` da peça — é o que permite ao `/desempenho` validar o molde depois
- `docs/frase-que-pega.md` — a craft do **hook que gruda** (Made to Stick, devices, Big
  Idea, autenticidade); usar na 1ª tela/linha e no fecho — no carrossel o hook é tudo
- `docs/hooks.md` — o **acervo de mecânicas de hook** (10 moldes com exemplo). Regra:
  toda peça nasce com **2-3 variações de capa/hook de mecânicas DIFERENTES** pro dono
  escolher (o slide 1 carrega ~80% do peso — não se decide de primeira). Registrar a
  mecânica escolhida no `legenda.md`; o `/desempenho` valida
- `references/molde-carrossel-arc.md` — o **gabarito do carrossel** (dissecado de perfil
  que performa + aprovado pela dona): arco de 5 atos com regra dura por ato (HOOK → DOR
  → SISTEMA → RESULTADO → CTA), anatomia do slide-cartaz (eyebrow mono, display gigante,
  accent único, paginação, seta), sistema de capas por formato, card-ticket de produto
  real e o slide final fixo SALVA/COMPARTILHA/SEGUE. O §8 é o **catálogo de estilos
  visuais aprovados** (Concept Poster, Spec Sheet, …) — escolher um por peça e NÃO
  repetir o estilo do carrossel anterior do mesmo perfil (rotação); registrar no campo
  `estilo:` do bloco META. Se o `marca/design-guide.md` do
  negócio tem seção de carrossel/social, ela calibra as cores/fontes; o molde dá a
  estrutura. Checar o rascunho ATO A ATO antes de renderizar — slide que não faz o
  trabalho do seu ato volta

**O BLOCO META do `legenda.md` (contrato canônico — todo registro da peça mora AQUI, num
formato só):** o topo do `legenda.md` abre com um bloco entre `---`, e a legenda publicável
vem depois (o `/publicar` remove o bloco antes de postar e o copia pro `publicacoes.md` —
o slug é a CHAVE que liga peça → publicação → medição, sem join manual):

```markdown
---
slug: <o-slug-da-pasta>
formato: carrossel|post|reel
objetivo: enviar|salvar|converter
mecanica: <a mecânica de hook escolhida, nome do docs/hooks.md>
formula: <a fórmula usada, nome do docs/formulas.md>
capa: <tipo de capa/1º slide>
estilo: <estilo visual do catálogo §8 do molde-carrossel-arc (ex.: concept-poster, spec-sheet); só carrossel/post>
nota-revisar: <preenchida pelo /revisar antes de publicar>
origem: radar|pulso-quente|calendario|avulsa
status: normal|em-trial
---
[a legenda de verdade começa aqui]
```

Campo sem valor entra `-`, nunca inventado. `origem: pulso-quente` separa a régua de
newsjacking da de evergreen na medição; `status: em-trial` marca Trial Reel (o check de
72h do `/desempenho` decide promover ao grid).
- `nucleo/provas.md` — pros módulos FALA e HISTÓRIA: só prova com status autorizada;
  banco vazio → a `/provas` entra na fila como próximo passo
- `producao/calendario/<mes>.md` — se a peça veio do calendário, tema e intenção já
  estão definidos lá

Marca ainda não existe? Não travar: usar os defaults da seção "Quando não há marca" e
avisar que o resultado melhora depois do `/identidade`.

## Formatos

1. **Carrossel (7-10 telas)** — padrão para ensinar, provar e posicionar. Formato
   1080x1350 (4:5), o de maior alcance orgânico. **Sweet-spot 2026: 7-10 slides** (10
   maximiza o dwell-time SE a completion passar de 60% — só vale a pena ser longo se prende
   até o fim; ver swipe-retention na Anatomia, em `references/carrossel-craft.md`).
2. **Post único** — um dado forte, uma frase de posição, um bastidor.
3. **Reel** — quando o tema pede movimento. Dois tipos, escolhidos pelo tema (não se
   misturam num mesmo arquivo):

   **3a. Reel b-roll (foto + vídeo) — pronto, é o reel padrão.** Roteiro cena a cena
   (gancho nos primeiros 2s, desenvolvimento, fecho) + texto de tela. Aprovado o roteiro,
   a skill **gera o reel** via `scripts/gerar-video.mjs`: still on-brand por cena → anima
   (Kling/Seedance) → corte rápido por cena → legenda → trilha → 1080x1920. Cada cena pode
   gerar a still por IA **ou** animar uma foto pronta (campo `"imagem"` no roteiro). É o
   reel de cenas/produto/ilustrativo — ninguém aparece falando.

   > **Régua técnica do reel (não negociável — fonte canônica: `docs/craft-video.md`):**
   > 50% saem nos 3 primeiros segundos, então
   > pensar **muted-first** (sem som). Hook VISUAL no frame 1 (texto na tela + movimento);
   > **2-3 cortes nos primeiros 3s** (reseta a atenção); legenda **42-60pt animada** que muda
   > de cor na palavra ativa (karaokê) — é o que segura quem assiste sem som. A marca/logo
   > NÃO abre o reel (logo no começo = cara de anúncio, derruba alcance) — vai no fim.

   > **Arco de VENDA do reel (estrutura UGC de 6 batidas, ScaleUP fev/2026)** — quando o
   > reel é de oferta/produto (não puro educativo), o roteiro segue as batidas com tempo:
   > **Hook 0-3s** (pattern-interrupt) → **Problema 3-8s** (a dor que o público reconhece) →
   > **Descoberta 8-15s** (o produto como achado, não como pitch) → **Experiência 15-35s**
   > (o resultado vivido) → **Prova 35-45s** (antes/depois, número real autorizado) →
   > **CTA 45-60s**. Mapa roteiro→cena pro gerar-video: problema=frustração em close ·
   > descoberta=primeiro contato/unboxing · uso=demo nas mãos · prova=antes/depois ·
   > CTA=hero shot do produto. **Régua de corte de hook:** entre as 2-3 variações, a que
   > tiver 3-second view <40% no teste morre; dobra na vencedora (o /desempenho mede).
   > **Limite ético (não negociável):** avatar/rosto por IA NUNCA finge ser consumidor ou
   > criador real ("UGC fake" viola a persuasão honesta e a regra do rosto). Avatar só como
   > personagem DECLARADO da marca; depoimento é sempre de pessoa real autorizada.

   **3a-voz. Reel b-roll NARRADO (voz por cima do b-roll, zero-filmagem).** O mesmo reel do
   3a, mas com uma VOZ narrando as cenas — o dono não filma nada. Cada cena ganha um campo
   `"narracao"` (o que a voz fala). A voz vem de dois jeitos (Escada de Contexto):
   - **Voz real:** o dono grava cada fala (`cena-01.mp3`, `cena-02.mp3`…) numa pasta e passa
     `--voz <pasta>`. Grátis, autêntico.
   - **Voz por IA (TTS):** `--tts <voiceId>` gera a locução (ElevenLabs). Guarda de custo
     (`--confirmar`), `ELEVENLABS_KEY` no `.env`. Clonar a própria voz = ok; voz de terceiro
     sem permissão = não.

   A fala manda a duração: cada clipe dura o tempo da narração da cena (nunca corta a voz). A
   legenda vira karaokê sincronizado (Whisper transcreve a voz). Música opcional entra abaixada
   por baixo da voz (`--trilha`). Comando: `node scripts/gerar-video.mjs <roteiro.json> --voz
   <pasta>` (real) ou `--tts <voiceId> --confirmar` (IA). Cena sem campo `narracao` cai pro
   `texto` da cena. Sempre `--dry-run` antes; peça vai ao ar → `/revisar`.

   **3b. Reel avatar (você falando) — capacidade à parte.** Pessoa real falando com
   lip-sync, via `scripts/gerar-avatar.mjs` (foto + áudio → vídeo). É outro produto:
   precisa de foto do rosto + áudio de voz real, tem guarda de custo (`--confirmar`) e
   cobra por segundo. **Status: em validação** — avatar a partir de foto parada ainda sai
   artificial; o caminho de qualidade é vídeo seu + lip-sync (LatentSync/HeyGen v3). Não
   usar em peça pública até validar. Não é o reel b-roll do 3a — é o talking-head.

   Vídeo é a parte cara: só gera depois do roteiro/áudio aprovado; o final passa por
   `/revisar` antes de publicar. (Alternativa sempre válida: o usuário grava ele mesmo.)

Formato não especificado → escolher pelo **objetivo**, não pelo gosto, dizendo o porquê em uma
linha. Roteia assim:

| Objetivo | Formato | Por quê |
|---|---|---|
| **Alcance / novos seguidores** | **Reel** | Entrega ~1.36x mais alcance que carrossel (benchmark 2026 — consolidação em `docs/backlog-auditoria-skills-2026-06-22.md`); é a peça de descoberta (chega a quem não te segue) |
| **Save / engajamento do público atual** | **Carrossel** | É o formato que mais salva (referência guardável); aprofunda e posiciona com quem já te acompanha |
| **Recado pontual / um dado forte** | **Post único** | Uma frase de posição, um bastidor, um anúncio — sem precisar de jornada de slides |

## Três modos de imagem (texto é o padrão)

Ortogonal ao formato: decide se a peça é só tipografia ou leva foto. Perguntar (ou inferir
do pedido). **Texto é o default — só sai dele se o usuário pedir foto.**

**Modo 1 — Texto (padrão).** Carrossel só com tipografia, os módulos (TESE, DADO, PASSOS,
CONTRASTE, FALA, HISTÓRIA, FECHO) e a régua tipográfica de `references/carrossel-craft.md`. Nada muda. Regra de marca:
se a tipografia já resolve com credibilidade, não forçar foto — pra cliente premium, texto
limpo costuma passar mais credibilidade que foto "com cara de IA".

**Modo 2 — Você traz a foto (sem API, custo zero).** O usuário gera a imagem onde quiser
(ChatGPT, Gemini, banco, foto real própria) e salva em `dados/imagens/`. A skill **encaixa**
a foto no carrossel respeitando a marca — não gera nada, só faz o design. Foto no carrossel
desde o dia 1, sem chave, sem custo.
1. Usuário aponta o arquivo em `dados/imagens/`.
2. Conferir a imagem: resolução mínima pro slide; avisar se vier pequena/esticada.
3. Perguntar **o layout deste post** (ver "Layouts de foto") — escolha por post, não fixa.
4. Encaixar a foto, aplicar overlay/tokens da marca, renderizar o PNG (Playwright, como sempre).

**Modo 3 — Geração via Fal.ai (ativa, opcional por post).** A skill gera a foto via API quando
o usuário pede ("gera uma foto de…"). Usa `scripts/gerar-imagem.mjs` com `FAL_KEY` no
`.env` (ver `docs/ferramentas.md`). **Se o script ainda não existe ou não há chave**, avisar em
uma linha e cair no Modo 2 (o usuário gera a foto onde quiser e solta em `dados/imagens/`) —
nunca travar a peça por causa disso.
1. Usuário descreve a imagem desejada.
2. Montar o prompt **em inglês** (a API rende melhor) a partir da descrição + a paleta/mood do
   `marca/design-guide.md` — é o que mantém a imagem dentro da marca (a paleta vai pelo prompt
   em qualquer modelo). Quando houver imagem-referência da marca, passá-la via `--ref`.
   - **Escolha do modelo (`--modelo`):** `minimax` (default) pra **foto realista** (~1¢);
     `schnell`/`dev` (FLUX) pra **estilizado/abstrato** ou pra iterar barato. Trocar é só a flag
     — sem lock-in. No `minimax`, `--ref` mantém o mesmo sujeito/produto; no FLUX, puxa o look.
3. Mostrar o prompt e gerar via script.
4. **Mostrar a imagem e pedir aprovação ANTES de usar.** Não aprovou → ajustar prompt e regerar.
5. Aprovada → mesmo fluxo de encaixe do Modo 2.

## Layouts de foto (o usuário escolhe a cada post)

Com foto (Modo 2 ou 3), oferecer e deixar o usuário decidir na hora:

- **Capa com foto** — foto de fundo na capa (slide 1) com overlay escuro pra legibilidade
  (`linear-gradient` sobre a imagem) + título grande por cima. Slides internos seguem texto.
- **Split foto+texto** — slide dividido: foto de um lado (~50%), texto do outro (kicker +
  título + apoio). Bom pra "mostrar e explicar".
- Pode ser foto só na capa, ou em um slide interno específico — perguntar onde.

Regra: a foto **não** vira papel de parede de todos os slides. Entra onde agrega (capa, um
slide de prova/contexto); o miolo educativo continua na tipografia forte que já funciona.

**Marca e segurança (vale pros 3 modos):**
- **Nunca rosto identificável gerado por IA.** Pessoa reconhecível, só foto real com autorização.
- Foto sempre sob os tokens da marca: overlay, cor de destaque, tipografia — a foto serve o
  design, não atropela. Imagem que briga com a paleta da marca não entra.
- Contraste do texto sobre a foto: mínimo 4.5:1 (medir, não estimar). O overlay existe pra isso.
- Modo 3 sempre pede aprovação visual antes de usar a imagem gerada.

## Objetivo da peça: ENVIAR, salvar ou CONVERTER (decidir ANTES de desenhar)

Em 2026 o sinal que mais distribui não é o like — é **send/DM** (vale ~3-5x o like e é o
fator **nº1** de alcance pra quem não te segue — Mosseri), seguido de **save** (~2-3x).
**Send é o default**: toda peça mira ser enviada, salvo quando o tema é guardável (referência)
e aí o alvo vira save. Quando a intenção do calendário é VENDA, existe um terceiro alvo:
**converter** — e aí a peça muda de arquitetura (ver abaixo). A peça declara, antes de
qualquer slide, **pra qual dos três ela é desenhada**:

- **Pra ENVIAR (default)** — a peça precisa de um gancho explícito de compartilhamento: algo
  que a pessoa manda pra alguém específico ("manda isso pro sócio que cuida do financeiro",
  "marca quem vive atrasado"). O conteúdo tem que ser relatável o bastante pra virar **"isso é
  a sua cara"** — o gatilho do envio é o reconhecimento ("essa pessoa precisa ver isso"). É o
  primeiro alvo de desenho de qualquer peça.
- **Pra SALVAR** — quando o tema é referência guardável: a peça precisa de um slide-referência
  (um checklist, um resumo, uma tabela, o "print que vale guardar pra usar depois"). Se a pessoa
  não pensa "isso eu salvo", a peça não foi desenhada pra salvar. Costuma cair bem no
  penúltimo/último slide (o resumo).
- **Pra CONVERTER** — quando a linha do calendário é de VENDA (oferta ativa). Carrossel de
  engajamento e carrossel de conversão são bichos diferentes: o de conversão cria desejo
  específico + credibilidade + próximo passo (fórmula: valor + especificidade + confiança +
  CTA único — tirou um, a peça trava). Arquitetura obrigatória: arco de venda (fórmula
  **Carousel Arc** em `docs/formulas.md`) com módulo **PONTE** + 1 slide de **prova
  embutida** (número específico real — "R$ 47k em 3 meses" > "resultado significativo";
  sem prova autorizada, trocar a intenção da peça). CTA por conversão (ranking 2026, dados
  de DM-automation — pack Sabrina/ManyChat, consolidado em
  `docs/backlog-auditoria-skills-2026-06-22.md`): keyword de comentário→DM (12-18% de
  conversão vs 2-3% do link na bio) > link na bio > save. Keyword de comentário só quando há automação de DM configurada (ou o dono responde
  manualmente na 1ª hora) — CTA que ninguém atende queima confiança.

Não é decoração: é o 1º filtro do briefing. A peça que não mira send, save NEM conversão
fica bonita e some.

### Matriz CTA × plataforma (o CTA mira a métrica que a plataforma premia)

Send/save é o alvo de desenho (acima). Na hora do CTA, casar o pedido com a métrica que
cada plataforma mais distribui:

| Plataforma | Premia mais | CTA que dispara |
|---|---|---|
| Instagram (feed) | Save, depois send | "Salva isto pra…", "Manda pra alguém que…" |
| Instagram (Reels) | Completion, depois save | Texto na tela + "salva pra depois" |
| TikTok / Reel | Watch-time / completion | Hook nos primeiros 1,7s; "espera o final" na tela |
| LinkedIn | Comentário (~2x peso vs like) | Pergunta polarizadora, "o que você adicionaria?" |
| Facebook | Share | "Marca alguém que precisa ver isto" |
| X / Threads | Reply | Take polarizador, "me diz que tô errado" |

Regra: um CTA por peça (já vale na seção Regras). A matriz só escolhe QUAL, conforme onde
a peça vai. Peça multi-plataforma adapta o CTA por destino, não repete o mesmo cru.

**Texto-na-tela como sinal de categorização.** O Instagram lê o texto escrito no slide 1 (e na
capa do reel) pra entender do que a peça trata e a quem entregar. A **keyword do nicho no slide
1** (a mesma das 2 primeiras linhas da legenda) é o que categoriza a peça pro Explore — não é só
hierarquia visual, é sinal de máquina. Slide 1 com keyword clara > slide 1 só com frase de efeito.

## Craft de carrossel — ler `references/carrossel-craft.md` ANTES de montar tela

O acervo completo do formato carrossel/post único mora em `references/carrossel-craft.md`
(par do `references/molde-carrossel-arc.md`): **Anatomia** (tela 1 abre loop, swipe-retention,
módulos TESE/DADO/PASSOS/CONTRASTE/FALA/HISTÓRIA/PONTE/FECHO), **Orçamento de caracteres por
slide** (o gate antes do HTML), **Layouts nomeados** (CAPA/SOLO/DUO/NÚMERO/CITAÇÃO/CTA FINAL),
**Régua tipográfica** (números, não adjetivos), **Sequência de capas no feed** e **Crivo de
design** (impeccable). Peça de CARROSSEL ou POST ÚNICO → leitura obrigatória; peça de REEL →
pular (a lei do reel é `docs/craft-video.md` + a régua técnica da seção Formatos).

Os 3 gates do reference que NUNCA se pulam:
1. **Orçamento de caracteres** conferido por campo (`.length`, determinístico) ANTES do
   HTML — campo fora da faixa volta pra reescrita, nunca encolhe fonte.
2. **Crivo de design** (impeccable, só visual, dentro da marca) entre HTML e render — com
   válvula de escape ("pula o polimento" → sai direto, avisando em 1 linha; ferramenta
   ausente → segue sem crivo, nunca trava).
3. **Capa conferida contra o feed** (alternância claro/escuro/destaque; registrar capa e
   layout no `legenda.md`).

## Produção técnica

Ordem: rascunho do texto → `/escritor-br` → **orçamento de caracteres (gate)** → montar
HTML das telas → **crivo de design** (impeccable, no visual) → render Playwright → aprovação.

1. **Conferir o orçamento de caracteres** (`references/carrossel-craft.md`) em cada campo de cada slide. Campo
   fora da faixa volta pra reescrita — não passa pro HTML. Render só começa com tudo no
   orçamento (é o passo caro).
2. Gerar um HTML por tela (1080x1350) usando **exclusivamente** as variáveis de
   `marca/tokens.css` — nada de cor ou fonte fora da marca.
3. **Crivo de design** (`references/carrossel-craft.md`): passar cada tela pela impeccable, salvo se o usuário
   pediu pra pular. Visual só — texto e gatilhos ficam intocados.
4. Renderizar cada HTML em PNG via Playwright (screenshot da viewport exata).
5. Salvar em `producao/posts/<YYYY-MM-DD>-<slug-do-tema>/` (HTMLs + PNGs + `legenda.md`).
   **Toda peça nasce com ASSET ID** no topo do `legenda.md`:
   `ID: IG-<AAAA>-S<semana>-<seq>` (ex.: `IG-2026-S28-03`; reel usa `IGR-`).
   O ID acompanha a peça até o `/desempenho` — é o que permite casar performance com
   hook/mecânica/objetivo POR PEÇA e aprender de verdade ("no IDs, no learning" —
   Marketing Ops/Ganzak, jul/2026). Junto do ID, registrar: mecânica de hook usada
   (de `docs/hooks.md`), objetivo (enviar|salvar|converter) e fórmula aplicada.
6. Mostrar as imagens ao usuário pra aprovação antes de dar por pronto.

## Trial Reel antes de publicar (reel)

Pro reel, oferecer publicar primeiro como **Trial Reel** (recurso nativo do IG): o reel sai
**só pra não-seguidores** por ~24-72h, sem aparecer no grid nem pro público atual. É um A/B
de graça com o público que mais importa pra alcance (quem ainda não te segue). Se segurar
retenção e gerar send/save, **promover ao grid** (vira reel normal, fica no perfil); se
flopar, fica fora do grid e não suja o perfil. Regra: reel de descoberta (alcance/novos
seguidores) nasce como Trial; reel pro público atual pode ir direto. É publicação assistida —
o sistema entrega o reel pronto + a instrução de marcar "Trial" na hora de postar.

## Áudio em carrossel e foto (trending audio)

O IG liberou **áudio fora do reel** — carrossel e post de foto agora carregam trilha. Trending
audio em carrossel dá um empurrão de alcance (o áudio em alta tem distribuição própria). Quando
fizer sentido pro tema, sugerir anexar um áudio em alta na hora de postar (o sistema não escolhe
a faixa — é curadoria do usuário no app, como nas fórmulas: copiar a mecânica de quem performa,
não a faixa). Instrução vai junto da legenda; nunca forçar áudio onde não cabe.

## Legenda

Estrutura: primeira linha que segura (continua o gancho, não o repete) → desenvolvimento
curto com substância → chamada única → **fecho que provoca resposta rápida** → hashtags
(3-6 específicas do nicho; zero hashtag genérica tipo #marketing #sucesso). No
desenvolvimento, usar micro-loops do playbook: o "mas" como pivô, anunciar antes de
mostrar, pergunta seguida de resposta — pequenos fechamentos que mantêm a leitura até a
chamada.

**Legenda é SEO de keyword (hashtag-follow morreu).** Em 2026 a busca do Instagram (e o
Google que indexa o post) é por **keyword**, não por hashtag — seguir hashtag acabou e o
peso delas caiu pra quase nada. O que indexa pro Explore e pra busca é a **keyword do
nicho escrita nas 2 primeiras linhas da legenda** + o **texto-na-tela do slide 1** (ver
abaixo). Por isso: identificar a 1-2 keywords reais que o cliente do negócio digitaria
(ex: "marketing para clínica", "automação de cobrança") e plantá-las cedo, de forma
natural — sem socar. As hashtags continuam (3-6 de nicho), mas como reforço, não como
motor de alcance.

**Comment-velocity no fecho (sinal da 1ª hora).** Resposta rápida nos primeiros 60
minutos é sinal forte de qualidade pro algoritmo. O fecho da legenda fecha com uma
**pergunta concreta e fácil de responder na hora** — escolha binária ("time A ou time
B?"), pedido de exemplo ("qual desses você já viveu?") ou opinião curta. Não é a isca
proibida ("comenta EU QUERO"): é uma pergunta genuína que pede um clique de resposta.

**Passo obrigatório:** passar a legenda pelo `/escritor-br` antes de entregar. Nenhum
texto sai com cara de IA.

## Quando não há marca

Defaults premium até o `/identidade` rodar: fundo escuro neutro (#101418) ou claro quente
(#FAF7F2), uma única cor de destaque sóbria, par tipográfico do Google Fonts que não seja
Inter/Roboto/Arial/Space Grotesk, muito espaço em branco, e a régua tipográfica acima
aplicada à risca. Marcar a peça como "feita com defaults — rodar /identidade pra calibrar".

## Regras

- Nunca inventar dado, depoimento ou resultado. Sem material real pra "Provar", trocar a
  intenção da peça ou pedir o material.
- Respeitar o teto de gatilhos dominantes por peça e a escassez/urgência só com fato
  verificável — as regras inegociáveis do `docs/persuasao.md` valem inteiras aqui.
- Sem emoji como decoração de design (na legenda, só se a voz da marca usa).
- Acessibilidade: contraste legível; descrição alt sugerida junto da legenda.
- Uma chamada por peça. Peça que pede três coisas não consegue nenhuma.
- Atualizar o Status no calendário quando a peça for aprovada.

## Teste de aceitação (comportamental)

1. Carrossel padrão → passa pelo crivo de design (impeccable) antes do render; o visual
   melhora sem trocar paleta, fonte ou tokens.
2. Usuário diz "pula o polimento" → a peça sai direto, sem o crivo, com aviso em uma linha.
3. impeccable não instalada nesta máquina → avisa e gera sem o crivo; nunca trava.
4. Em todos os casos: o crivo nunca mexeu no texto (é do `/escritor-br`) nem na marca.
5. Texto de um slide estoura o orçamento de caracteres → é reescrito ANTES do HTML/render;
   nenhum PNG é gerado com texto que vai refluir. Marca define caixa própria → o orçamento
   se recalcula pelas caixas dela.

---

**✓ Pronto:** peça de Instagram (PNGs + legenda) na marca · **→ próximo passo:** `/revisar` — crivo sênior de olhos frios antes de ir ao ar. Pré-requisito: `marca/`, voz e provas; se faltar a marca, o sistema avisa que a peça saiu com defaults e reorienta pro `/identidade`.
