---
name: post
description: >
  Use para criar peça visual de Instagram — "cria um carrossel", "faz um post",
  "/post", "conteúdo pro Instagram", "post educativo sobre X", ou ao executar uma linha
  do calendário marcada como IG. Produz carrossel, post único ou **reel (foto + vídeo)**
  com a identidade da marca: carrossel/post em PNG 1080x1350; reel em vídeo vertical
  1080x1920 (foto realista por IA, animada e legendada) + legenda pronta.
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

- `marca/design-guide.md` + `marca/tokens.css` — obrigatório para qualquer pixel
- `nucleo/voz.md` e `nucleo/negocio.md` — pro texto
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
- `nucleo/provas.md` — pros módulos FALA e HISTÓRIA: só prova com status autorizada;
  banco vazio → a `/provas` entra na fila como próximo passo
- `producao/calendario/<mes>.md` — se a peça veio do calendário, tema e intenção já
  estão definidos lá

Marca ainda não existe? Não travar: usar os defaults da seção "Quando não há marca" e
avisar que o resultado melhora depois do `/identidade`.

## Formatos

1. **Carrossel (5-9 telas)** — padrão para ensinar, provar e posicionar. Formato
   1080x1350 (4:5), o de maior alcance orgânico.
2. **Post único** — um dado forte, uma frase de posição, um bastidor.
3. **Reel** — quando o tema pede movimento. Dois tipos, escolhidos pelo tema (não se
   misturam num mesmo arquivo):

   **3a. Reel b-roll (foto + vídeo) — pronto, é o reel padrão.** Roteiro cena a cena
   (gancho nos primeiros 2s, desenvolvimento, fecho) + texto de tela. Aprovado o roteiro,
   a skill **gera o reel** via `scripts/gerar-video.mjs`: still on-brand por cena → anima
   (Kling/Seedance) → corte rápido por cena → legenda → trilha → 1080x1920. Cada cena pode
   gerar a still por IA **ou** animar uma foto pronta (campo `"imagem"` no roteiro). É o
   reel de cenas/produto/ilustrativo — ninguém aparece falando.

   **3b. Reel avatar (você falando) — capacidade à parte.** Pessoa real falando com
   lip-sync, via `scripts/gerar-avatar.mjs` (foto + áudio → vídeo). É outro produto:
   precisa de foto do rosto + áudio de voz real, tem guarda de custo (`--confirmar`) e
   cobra por segundo. **Status: em validação** — avatar a partir de foto parada ainda sai
   artificial; o caminho de qualidade é vídeo seu + lip-sync (LatentSync/HeyGen v3). Não
   usar em peça pública até validar. Não é o reel b-roll do 3a — é o talking-head.

   Vídeo é a parte cara: só gera depois do roteiro/áudio aprovado; o final passa por
   `/revisar` antes de publicar. (Alternativa sempre válida: o usuário grava ele mesmo.)

Formato não especificado → escolher pelo tema e intenção, dizendo o porquê em uma linha.

## Três modos de imagem (texto é o padrão)

Ortogonal ao formato: decide se a peça é só tipografia ou leva foto. Perguntar (ou inferir
do pedido). **Texto é o default — só sai dele se o usuário pedir foto.**

**Modo 1 — Texto (padrão).** Carrossel só com tipografia, os módulos (TESE, DADO, PASSOS,
CONTRASTE, FALA, HISTÓRIA, FECHO) e a régua tipográfica abaixo. Nada muda. Regra de marca:
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

## Anatomia do carrossel

**Tela 1 — o gancho.** Decide se o dedo para. Promessa específica ou tensão real, sem
caça-clique vazio. Título curto, hierarquia óbvia, um elemento dominante. Tecnicamente,
a tela 1 **abre um loop**: planta a pergunta que o resto do carrossel responde — e a
lei da lacuna honesta vale (gancho de "segredo" que entrega obviedade mata a conta aos
poucos; entrega modesta pede gancho menor, não texto inflado).

**Telas internas — uma ideia por tela.** Quem lê uma tela isolada entende ela sozinha.
Variar a composição entre os módulos abaixo pra criar ritmo; alternar fundos (claro ↔
escuro ↔ cor da marca) — nunca duas telas seguidas iguais.

Módulos de composição (vocabulário próprio do ImpulsoX-OS):
- **TESE** — afirmação central grande + uma linha de apoio
- **DADO** — número dominante (estatística, preço, prazo) + contexto curto
- **PASSOS** — sequência numerada enxuta (máx 4 itens por tela)
- **CONTRASTE** — errado vs certo, antes vs depois, mito vs fato em duas colunas
- **FALA** — citação ou depoimento real com atribuição
- **HISTÓRIA** — mini-narrativa em 2-3 telas na espinha do playbook: personagem que o
  público reconhece → tensão real → a virada (o "mas") → desfecho com prova. Pede
  material real; sem caso, trocar de módulo
- **FECHO** — última tela: chamada única (seguir, salvar, chamar no WhatsApp, link na
  bio) sobre fundo na cor de destaque. É aqui que o loop da tela 1 **fecha** — conferir
  que a pergunta aberta foi respondida de verdade

**Texto por tela:** título até ~8 palavras; apoio até ~18-20 (o limite preciso é por
caractere — ver "Orçamento de caracteres por slide"). Carrossel não é slide de
palestra — quem quer texto longo vai pra legenda. Limite preciso na seção abaixo.

## Orçamento de caracteres por slide (trava antes do render)

As caixas de cada layout são dimensionadas pra um comprimento. Texto que estoura **reflui**:
a linha quebra, o slide para de bater com a régua tipográfica e o carrossel **perde a unidade
visual** — é o que separa um deck premium de um amador. Por isso o comprimento é checado por
**caractere** (não por palavra, que varia muito) e a checagem acontece **no rascunho do
texto, ANTES de montar o HTML e gerar qualquer PNG**. Texto fora do orçamento nunca chega ao
render.

| Elemento | Mín–máx (caracteres) | Observação |
|---|---|---|
| Título da capa | 14–32 | line-height 1.0; cabe em até 3 linhas no tamanho 88–110px |
| Título de tela interna | 24–48 | uma linha forte; máx 2 linhas |
| Texto de apoio | 40–120 | line-height 1.4; o que passa disso vira legenda (≈18–20 palavras) |
| Etiqueta/kicker (CAIXA ALTA) | 6–22 | uma ou duas palavras |
| Linha do FECHO (chamada) | 18–48 | uma chamada só, verbo + objeto |
| Numeral do módulo DADO | 1–6 | é elemento gráfico (ex: "31%", "R$5k", "x7") |

Régua: quando `marca/design-guide.md` define caixas próprias, os limites **dele** mandam — e
o orçamento se recalcula a partir do tamanho real das caixas da marca. Estes valores são o
default quando a marca não especifica.

**Aviso do português:** a contagem é por caractere, mas o reflow real é **largura em pixels**.
Em PT, palavra longa ("desenvolvimento", "automatização") em peso 700–800 ocupa muito espaço e
pode refluir **antes** de estourar a contagem. Por isso o teto interno é conservador (48, não
52): com palavra larga, conferir a largura renderizada, não só o número de caracteres.

**Como aplicar (gate):**
1. Depois do rascunho do texto de cada slide (e depois do `/escritor-br`), **contar os
   caracteres por campo** — a contagem é determinística (`.length` da string, não estimativa
   no olho) e comparar com o orçamento.
2. Campo fora da faixa → **reescrever antes de montar o HTML**, nunca encolher fonte pra caber
   (encolher quebra a régua tipográfica). Abaixo do mínimo soa raso; acima reflui.
3. **Conferência final no HTML:** depois de montar o slide, olhar se alguma linha refluiu (o
   pior caso de PT só aparece renderizado) e se sobrou **viúva/órfã** (uma palavra sozinha na
   última linha) — as duas quebram o acabamento premium mesmo dentro da contagem.
4. Só depois que tudo passa, a produção técnica segue (render). Render é o passo caro; não se
   gasta nele com texto que vai ser refeito.
5. Registrar no `legenda.md` da peça que o orçamento foi conferido (uma linha).

## Layouts nomeados (como a tela aparece)

Módulo é **o que a tela diz** (TESE, DADO, PASSOS…); layout é **como ela aparece**. Um
módulo cabe em vários layouts — escolher o que dá mais força ao módulo daquela tela:

- **CAPA** — eyebrow (kicker em CAIXA ALTA) + título grande + `@handle` discreto. Abertura.
- **SOLO** — split 50/50: foto ou elemento gráfico de um lado, texto do outro ("mostrar e
  explicar").
- **DUO** — texto no topo + dois blocos embaixo (duas fotos, dois cards). Par de exemplos,
  antes/depois lado a lado.
- **NÚMERO** — numeral de 200–320px, peso 800, na cor de destaque, como elemento gráfico,
  com h2 + apoio. É o layout natural do módulo **DADO**.
- **CITAÇÃO** — aspas grandes em marca d'água + a frase + atribuição. Layout do módulo **FALA**.
- **CTA FINAL** — fundo na cor de destaque + logo + a chamada única. Layout do módulo **FECHO**.

**Ritmo dos layouts:** alternar o fundo escuro ↔ claro ↔ destaque ao longo do carrossel
(nunca dois slides seguidos com o mesmo fundo) e usar **no mínimo 2 layouts diferentes** por
peça — carrossel inteiro no mesmo layout cansa e tem cara de template.

Exemplo (layout + módulo juntos): tela 1 em **CAPA**; tela 2 leva o módulo **DADO** no
layout **NÚMERO** (numeral gigante na cor de destaque); tela 3, um **CONTRASTE** em **DUO**;
fecho com o módulo **FECHO** no layout **CTA FINAL**, fundo de destaque.

## Régua tipográfica (números, não adjetivos)

Telas de 1080x1350 vistas num celular de ~400px de largura: o que parece grande no
monitor chega pequeno no feed. Esta régua vale sempre que `marca/design-guide.md` não
definir valores próprios — e quando definir, os dele mandam.

| Elemento | Tamanho | Peso | Tracking | Observação |
|---|---|---|---|---|
| Título da capa | 88–110px | 800–900 | -0.03em | line-height 1.0–1.05; máx 3 linhas |
| Título de tela interna | 58–72px | 700–800 | -0.02em | um por tela |
| Texto de apoio | 30–36px | 400–500 | normal | line-height 1.4; máx ~18-20 palavras (≤120 car.) |
| Etiqueta/categoria | 22–26px | 700 | +0.2em | CAIXA ALTA; uma palavra ou duas |
| Numerador de tela (02/07) | 22–24px | 500–600 | +0.1em | canto superior, todas as telas |
| Numeral do módulo DADO | 220–320px | 800 | -0.02em | é o elemento gráfico da tela |

**Princípio de contraste tipográfico:** o que é grande fecha o tracking, o que é pequeno
abre — é esse contraste, não cor extra, que dá cara editorial à peça. Regra concreta:
títulos grandes com kerning apertado (`letter-spacing ≈ -0.035em`) contra eyebrows/kickers
pequenos em CAIXA ALTA com kerning aberto (`≥ 0.22em`). Aplicar pelos tokens da marca
quando existirem; estes valores são o default quando não.

**Grade fixa:** margem lateral de 88px (~8% da largura); área de respiro generosa —
tela confortável tem no máximo 60% da altura ocupada por conteúdo. Logo discreto +
numerador presentes em **todas** as telas. Contraste texto/fundo mínimo 4.5:1 (medir,
não estimar no olho).

## Sequência de capas no feed

O perfil é visto como grade de 3 colunas — capa nova nunca é decidida no vácuo:

- Alternar o fundo da capa entre os três registros da marca: claro → escuro → cor de
  destaque (ordem livre, repetição em sequência proibida).
- Antes de fechar a capa, conferir as últimas capas em `producao/posts/` (ou no
  calendário). Sem registro local e usuário não lembra? Pedir um print do perfil.
- Registrar o tipo de capa usado tanto na linha do calendário quanto no `legenda.md` da
  peça (ex: "capa: escuro / layout: NÚMERO") — rastreio que solta a próxima peça da
  memória de sessão.

## Crivo de design (impeccable)

Antes de virar PNG, todo carrossel passa por um polimento de design com a impeccable —
entre o HTML montado de cada tela e a renderização via Playwright. É o que tira a peça do
"bom" e leva ao acabamento premium, sem fugir da marca.

impeccable instala **por máquina** (`claude plugin install impeccable@impeccable`). Se
`/impeccable` não existir nesta máquina, avisar em uma linha e seguir sem o crivo — nunca
travar a peça por falta da ferramenta.

**Só os comandos que fazem sentido em peça estática 1080x1350** — carrossel é imagem, não
web (sem hover, foco, responsividade ou animação):
- `/impeccable critique` — hierarquia, clareza, ressonância
- `/impeccable typeset` — tipografia
- `/impeccable layout` — espaço e ritmo
- `/impeccable colorize` — cor estratégica (dentro da paleta da marca)
- `/impeccable bolder` / `quieter` — intensidade
- `/impeccable distill` — tirar excesso

**Nunca rodar os comandos de web** (não se aplicam a imagem estática): `audit` (a11y),
`harden`, `animate`, `onboard`, `optimize`, `adapt` e qualquer coisa de responsividade.

**Limites do crivo:**
- LÊ `marca/tokens.css` + `marca/design-guide.md` + a régua tipográfica acima. AJUSTA
  dentro da marca; **nunca** troca paleta, fonte ou identidade por defaults da ferramenta.
- Cuida **só do visual** (tipografia, espaço, cor, hierarquia). NÃO mexe no texto/copy
  (isso é do `/escritor-br`) nem nos gatilhos (`docs/persuasao.md`).

**Válvula de escape (pra não pesar no dia a dia):**
- Por padrão o crivo roda sempre. Se o usuário disser "pula o polimento", "rápido" ou
  "sem crivo" neste post, gerar direto sem a etapa.
- Quando pular, avisar em uma linha: "gerado sem o crivo de design, a pedido".

## Produção técnica

Ordem: rascunho do texto → `/escritor-br` → **orçamento de caracteres (gate)** → montar
HTML das telas → **crivo de design** (impeccable, no visual) → render Playwright → aprovação.

1. **Conferir o orçamento de caracteres** (seção acima) em cada campo de cada slide. Campo
   fora da faixa volta pra reescrita — não passa pro HTML. Render só começa com tudo no
   orçamento (é o passo caro).
2. Gerar um HTML por tela (1080x1350) usando **exclusivamente** as variáveis de
   `marca/tokens.css` — nada de cor ou fonte fora da marca.
3. **Crivo de design** (seção acima): passar cada tela pela impeccable, salvo se o usuário
   pediu pra pular. Visual só — texto e gatilhos ficam intocados.
4. Renderizar cada HTML em PNG via Playwright (screenshot da viewport exata).
5. Salvar em `producao/posts/<YYYY-MM-DD>-<slug-do-tema>/` (HTMLs + PNGs + `legenda.md`).
6. Mostrar as imagens ao usuário pra aprovação antes de dar por pronto.

## Legenda

Estrutura: primeira linha que segura (continua o gancho, não o repete) → desenvolvimento
curto com substância → chamada única → hashtags (3-6 específicas do nicho; zero hashtag
genérica tipo #marketing #sucesso). No desenvolvimento, usar micro-loops do playbook:
o "mas" como pivô, anunciar antes de mostrar, pergunta seguida de resposta — pequenos
fechamentos que mantêm a leitura até a chamada.

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
