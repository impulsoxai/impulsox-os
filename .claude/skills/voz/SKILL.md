---
name: voz
description: >
  Use quando o sistema precisa aprender a VOZ de verdade do dono do negócio — "/voz",
  "criar minha voz", "o sistema não escreve como eu", "minha voz tá genérica", "fazer a
  entrevista de voz", ou logo depois do /plugar quando o voz.md saiu raso. Conduz uma
  entrevista longa (30+ min) com o dono, recebe a transcrição e extrai a voz completa
  pra nucleo/voz.md (ou clientes/<nome>/voz.md). É o que faz o sistema escrever como a
  pessoa fala, não como uma IA genérica.
---

# /voz — Aprender a voz do dono

Voz não sai de perguntar "como você fala?" — dono de negócio responde isso genérico
("profissional, mas próximo"). A voz aparece **em como ele fala do próprio negócio**:
quando explica o que faz, conta por que começou, defende no que acredita e crava a
mensagem que quer passar, ele entrega ritmo, vocabulário e convicção sem perceber. O
roteiro desta skill é todo sobre o **negócio** — a voz é o que se extrai da fala.

Por isso a entrevista faz trabalho duplo: a mesma transcrição vira o `voz.md` rico **e**
enriquece o núcleo (`negocio.md`, `foco.md`) com os fatos que aparecerem. Cliente que já
tem negócio adora falar dele — e é exatamente disso que o sistema precisa.

Autoria: ImpulsoX AI. Conteúdo original.

## Princípio que rege esta skill

Aplica a **Escada de Contexto** (ver CLAUDE.md). A entrevista de voz leva o contexto ao
**degrau 3**. Roda mesmo com transcrição parcial: o que a fala cobriu vira **fato**, o
que ficou de fora entra como **suposição a confirmar** e fica marcado pra completar
depois. Nunca trava exigindo a entrevista inteira de uma vez.

## Fase 0 — Pré-checagem

1. **De quem é a voz?** Negócio próprio → escreve em `nucleo/voz.md`. Cliente (modo
   agência) → confirmar o nome e escrever em `clientes/<nome>/voz.md`. Canal do YouTube
   (`/voz --canal` ou pedido "voz do canal/de narração") → escreve em
   `canal-youtube/voz-canal.md` — é voz de **fala/narração**, distinta da voz de copy
   escrita em `nucleo/voz.md`; não confundir as duas nem misturar arquivo.
2. **Já existe voz?** Se o arquivo tem conteúdo real, perguntar se é pra refinar em cima
   do que existe ou refazer do zero a partir da nova entrevista. **"Refazer do zero" vale
   pro `voz.md`, nunca pra `nucleo/aula-do-dono.md`** — a aula espontânea do `/plugar` é a
   melhor amostra não-ensaiada que o sistema jamais terá; ela se soma à entrevista nova,
   não é substituída por ela.
3. **Tem aula do `/plugar`?** Se `nucleo/aula-do-dono.md` existe, ler ANTES de entregar o
   roteiro: marcar quais das 6 perguntas a aula já respondeu e avisar o dono ("sua aula do
   setup já cobriu as perguntas X e Y — no áudio, foca nas outras; se quiser repetir
   alguma, melhor ainda"). Ponto coberto não se repergunta — mesma regra do `/plugar`.
4. **Já tem transcrição na mão?** Se o usuário já chega com a entrevista pronta — caso
   comum no modo agência, em que ele só cola a transcrição do dono-cliente — **pular o
   roteiro (Fase 1) e ir direto pra Fase 2.** O roteiro só serve a quem ainda vai gravar.

## Fase 1 — Entregar o roteiro e explicar a gravação

Apresentar o roteiro abaixo e as instruções de gravação. Deixar claro o combinado:
**falar, não escrever.** A pessoa responde no áudio, sem ensaiar, como se estivesse
conversando com um amigo dono de negócio. É a fala solta que carrega a voz.

### Como gravar (passar ao dono, sem termo técnico à toa)

> Grava no celular, no gravador de voz mesmo. Responde uma pergunta de cada vez, sem
> pressa e sem corrigir — se enrolar, deixa enrolado, é assim que você fala. Mira em uns
> 30 minutos no total. Pra virar texto: manda o áudio pra você mesmo no WhatsApp e usa o
> "transcrever áudio", ou usa um app de transcrição (o ditado do iPhone, Otter, Whisper).
> Depois cola a transcrição aqui — pode ser bruta, com "é", "tipo", "sei lá". Quanto mais
> crua, melhor pra mim.

### O roteiro da entrevista

Seis perguntas, todas sobre o negócio — nada de pedir o dono pra se autoanalisar. A voz
sai do **jeito** que ele responde; o núcleo sai do **conteúdo**.

1. Me conta tudo sobre a sua empresa: como você começou, pra onde quer ir.
2. Qual o perfil do seu cliente? Quem compra de você?
3. Por que comprar da sua empresa?
4. Prova social: tem cliente satisfeito, caso ou resultado real pra contar?
5. Tem alguma palavra que você não usa de jeito nenhum?
6. Tem alguma empresa ou pessoa que você admira (no jeito de comunicar)?

São abertas de propósito: a pergunta 1 sozinha já puxa origem, visão e a mensagem da
marca. Se o dono engrenar e falar muito além delas, ótimo — deixar correr. Quanto mais
fala solta, mais voz.

**Extrair o Wedge da transcrição.** A opinião contrária do dono (o **Wedge** — ver
`nucleo/negocio.md`) costuma aparecer sozinha quando ele fala do setor nas perguntas 1 e
3. Se aparecer, capturar a frase literal e gravar em `nucleo/negocio.md` (campo Opinião
contrária / Wedge), não no `voz.md` — é munição de conteúdo, não tom de escrita. Se a
entrevista não revelar nenhuma, deixar como pendência da Escada; o `/plugar` (pergunta 4b)
é o ponto principal de captura.

### Quando a voz é do canal (`--canal`)

As mesmas seis perguntas valem — a voz ainda sai de como a pessoa fala do negócio, não de
autoanálise. Atenção extra na escuta: ritmo de fala (pausas, frase curta vs longa),
gírias/expressões que usa falando e não escrevendo, como abre e fecha uma ideia ao vivo.
Essa voz pode ser igual à de `nucleo/voz.md` ou diferente — a entrevista descobre, nunca
assume a partir da voz escrita já existente.

## Fase 2 — Receber a transcrição

Quando o dono colar a transcrição, ler inteira antes de escrever qualquer coisa. Ler com
**dois ouvidos**: um pro JEITO (a voz — palavras exatas que ele repete, expressões
próprias, jeito de abrir e fechar uma ideia, onde acelera e onde afirma com calma) e um
pro CONTEÚDO (fatos do negócio: o que vende, pra quem, diferencial, casos, prioridade —
matéria pro núcleo). A voz está nas escolhas dele, não nas minhas.

Se a transcrição veio curta ou pulou blocos, seguir com o que há e marcar os blocos
faltantes como suposição — sem travar.

## Fase 3 — Extrair a voz → escrever o voz.md

Destilar a transcrição na estrutura abaixo. Cada seção sai **da fala do dono**, citando as
palavras dele quando possível. Onde a entrevista não cobriu, escrever o melhor padrão e
marcar `_a confirmar_`.

Seções do `voz.md`:
- **A voz em uma frase** — a síntese do que a marca é, no espírito da fala dele.
- **Quem fala (persona)** — em nome de quem o texto sai (a marca? o dono em 1ª pessoa?) e
  qual a imagem mental (ex: especialista do outro lado da mesa).
- **Os três traços + as tensões** — os 2-4 traços que definem a voz e a tensão entre eles
  (ex: técnica mas acessível; ambiciosa mas calma). A tensão é o que dá personalidade.
- **Regra de ouro** — o eixo que rege o tom (ex: ambição grande, entrega calma), com
  tabela de ✅ certo / ❌ errado tirada de exemplos reais.
- **Gatilhos e hooks** — como a marca usa curiosidade, escassez e ganho na versão honesta
  (cruzar com `docs/persuasao.md`). Escassez só real; contrato do hook (entrega o que
  promete).
- **Tom: faz / não faz** — listas concretas, do jeito dele.
- **Vocabulário** — usa / inglês ok / evita. As banidas saem da pergunta 5; o inglês
  natural e as expressões próprias saem do corpo da fala (o que ele de fato usou).
- **Mecânica de escrita** — emoji, tamanho de frase, pontuação, caixa-alta, hashtags.
- **Pilares de conteúdo** — as convicções que todo post defende, das perguntas 1 e 3
  (origem, visão e por que comprar).
- **Calibragem por referência** — quem o dono admira (pergunta 6); a anti-referência sai
  por contraste — o que ele evita (pergunta 5) e o oposto do que admira.

Regras de escrita do arquivo:
- Não inventar voz. Se a fala não deu material pra uma seção, marcar `_a confirmar_`.
- Preferir a palavra do dono à palavra "bonita". Se ele diz "atende", não trocar por
  "atendimento omnichannel".
- Não deixar aviso de placeholder no arquivo final.

## Fase 3B — Aproveitar o que o negócio entregou

A mesma fala que deu a voz deu fatos. Não desperdiçar: separar o que apareceu sobre o
negócio e **propor** (nunca sobrescrever no escuro) a atualização do núcleo:
- fatos de oferta, cliente, diferencial, casos → `nucleo/negocio.md`
- prioridade, meta, sazonalidade que surgiram → `nucleo/foco.md`
- prova/caso real mencionado → sinalizar pra `/provas` formalizar e autorizar
- ofertas que apareceram (preço, benefício, objeção, diferencial) → `nucleo/ofertas.md`

Se `nucleo/ofertas.md` ainda estiver vazio (só o template) ao fim da entrevista,
**oferecer completá-lo agora** — a fala já fez o dono descrever o que vende, pra quem e
por quê; é o melhor momento pra montar o catálogo sem nova pergunta. Preencher um bloco
por oferta com o que a transcrição deu; campo sem base entra `(?)`.

Se o `/plugar` já preencheu esses arquivos, comparar: o que a entrevista confirma vira
fato; o que contradiz, perguntar antes de trocar. Mostrar ao dono a lista do que entrou
no núcleo — cirúrgico, uma linha por mudança.

## Fase 4 — Validar com o dono

Antes de fechar, provar a voz. Escrever **2 frases curtas** na voz recém-extraída — um
gancho de post e uma chamada pra ação — e mostrar:

> "Peguei sua voz. Antes de gravar, me diz se isso soa como você:
> [gancho] · [CTA]
> Bateu, ou tá com cara de outra pessoa?"

Se não bateu, ajustar o `voz.md` com o que o dono apontar — e só então fechar. Voz errada
contamina toda peça futura; vale o minuto a mais.

## Fase 5 — Registrar a escada

Atualizar `nucleo/escada.md` (ou o do cliente, ou `canal-youtube/escada.md` quando for
`--canal`): degrau 3 alcançado (voz + núcleo enriquecido pela entrevista), blocos do
roteiro confirmados vs faltantes, e o que falta pra completar (ex: "dono pulou o bloco 3 —
refazer quando tiver tempo"). Voz de canal não enriquece núcleo de negócio (Fase 3B não
se aplica) — fala de narração não é fala de venda.

## Regras

- A entrevista é por **áudio falado**, não por digitação. Se o dono insistir em digitar,
  aceitar, mas avisar que a voz sai mais formal e menos natural do que no áudio.
- Nunca inventar convicção, referência ou resultado que o dono não disse. Voz é como ele
  fala — não é personagem que eu crio.
- Transcrição crua é boa. Não pedir pra ele "limpar" antes de mandar.
- Esta skill substitui a extração rasa de voz do `/plugar`. O `/plugar` faz o setup do
  negócio em minutos; a voz de verdade nasce aqui.

---

**✓ Pronto:** voz extraída e gravada em `nucleo/voz.md` (tom, estilo, palavras e clichês a evitar) · **→ próximo passo:** `/calendario` pra decidir o conteúdo do mês, ou direto pra produção (`/post`, `/linkedin`) agora que o sistema escreve na voz do dono.
