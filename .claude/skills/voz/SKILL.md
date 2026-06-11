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

Voz não sai de duas perguntas rápidas. Sai de ouvir o dono falar solto por meia hora —
contando história, defendendo o que acredita, reclamando do que odeia no mercado. É na
fala corrida que aparece o ritmo, o vocabulário, a convicção e os tiques que fazem a
marca soar como uma pessoa específica, e não como qualquer empresa do nicho.

Esta skill entrega um roteiro, recebe a transcrição da entrevista e destila tudo num
`voz.md` rico — o mesmo nível de profundidade que separa um texto que soa como o dono de
um texto com cara de modelo de IA.

Autoria: ImpulsoX AI. Conteúdo original.

## Princípio que rege esta skill

Aplica a **Escada de Contexto** (ver CLAUDE.md). A entrevista de voz leva o contexto ao
**degrau 3**. Roda mesmo com transcrição parcial: o que a fala cobriu vira **fato**, o
que ficou de fora entra como **suposição a confirmar** e fica marcado pra completar
depois. Nunca trava exigindo a entrevista inteira de uma vez.

## Fase 0 — Pré-checagem

1. **De quem é a voz?** Negócio próprio → escreve em `nucleo/voz.md`. Cliente (modo
   agência) → confirmar o nome e escrever em `clientes/<nome>/voz.md`.
2. **Já existe voz?** Se o arquivo tem conteúdo real, perguntar se é pra refinar em cima
   do que existe ou refazer do zero a partir da nova entrevista.
3. **Já tem transcrição na mão?** Se o usuário já chega com a entrevista pronta — caso
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

### O roteiro da entrevista de voz

**Bloco 1 — Origem e convicção**
1. Explica, como se a gente estivesse num bar e eu fosse um amigo dono de negócio que não
   entende nada de IA: o que a sua empresa faz e por que ela existe?
2. O que te fez começar isso? Teve um momento, um problema seu ou de um cliente, que
   acendeu a luz?
3. No que você acredita sobre o seu mercado que a maioria dos seus concorrentes não
   acredita — ou não tem coragem de falar em voz alta?

**Bloco 2 — O cliente e a virada**
4. Pensa no cliente que você mais gostou de atender. Quem era, como chegou até você, e o
   que mudou pra ele depois?
5. Quando alguém fecha com você, o que essa pessoa tava com medo que acontecesse? E o que
   ela esperava ganhar?

**Bloco 3 — Diferencial e prova**
6. Por que escolhem você, e não o concorrente mais barato? Responde como se eu fosse um
   cliente desconfiado, de braço cruzado.
7. Conta um resultado concreto que você já entregou — com número, prazo, o que aconteceu
   de verdade. Nada de "ajudei muita gente"; um caso real.

**Bloco 4 — A voz (sobre como você fala)**
8. Tem alguma marca, criador ou pessoa cujo jeito de comunicar você admira? Quem, e o que
   exatamente você curte no jeito dela falar?
9. O oposto: que tipo de comunicação no seu mercado te dá nojo? Você nunca quer soar assim
   como?
10. Tem palavra, expressão ou promessa que você não suporta ver no marketing? Fala todas
    que vierem na cabeça.
11. Você usa inglês no dia a dia? Que termos saem naturais na sua boca, e quais você acha
    forçado?

**Bloco 5 — Ambição e tom**
12. Você acha que o que você faz é uma virada grande pro cliente? Conta o tamanho disso —
    do seu jeito, sem ensaiar discurso.
13. Quando você quer convencer alguém de algo importante, você é mais de afirmar com calma
    ou de cutucar com urgência? Dá um exemplo de como você falaria.
14. Se a sua empresa fosse uma pessoa sentada na mesa com o cliente, ela seria mais
    professor, vendedor, consultor ou parceiro? Por quê?

## Fase 2 — Receber a transcrição

Quando o dono colar a transcrição, ler inteira antes de escrever qualquer coisa. Não
resumir por cima: caçar as **palavras exatas** que ele repete, as expressões próprias, o
jeito de abrir e fechar uma ideia, onde ele acelera e onde ele afirma com calma. A voz
está nas escolhas dele, não nas minhas.

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
- **Vocabulário** — usa / inglês ok / evita. As palavras banidas saem direto da pergunta 10.
- **Mecânica de escrita** — emoji, tamanho de frase, pontuação, caixa-alta, hashtags.
- **Pilares de conteúdo** — as convicções (perguntas 1-3) que todo post defende.
- **Calibragem por referência** — quem admira (pergunta 8) e a anti-referência (pergunta 9).

Regras de escrita do arquivo:
- Não inventar voz. Se a fala não deu material pra uma seção, marcar `_a confirmar_`.
- Preferir a palavra do dono à palavra "bonita". Se ele diz "atende", não trocar por
  "atendimento omnichannel".
- Não deixar aviso de placeholder no arquivo final.

## Fase 4 — Validar com o dono

Antes de fechar, provar a voz. Escrever **2 frases curtas** na voz recém-extraída — um
gancho de post e uma chamada pra ação — e mostrar:

> "Peguei sua voz. Antes de gravar, me diz se isso soa como você:
> [gancho] · [CTA]
> Bateu, ou tá com cara de outra pessoa?"

Se não bateu, ajustar o `voz.md` com o que o dono apontar — e só então fechar. Voz errada
contamina toda peça futura; vale o minuto a mais.

## Fase 5 — Registrar a escada

Atualizar `nucleo/escada.md` (ou o do cliente): degrau 3 alcançado na dimensão voz, blocos
do roteiro confirmados vs faltantes, e o que falta pra completar (ex: "dono pulou o bloco
5 — refazer quando tiver tempo").

## Regras

- A entrevista é por **áudio falado**, não por digitação. Se o dono insistir em digitar,
  aceitar, mas avisar que a voz sai mais formal e menos natural do que no áudio.
- Nunca inventar convicção, referência ou resultado que o dono não disse. Voz é como ele
  fala — não é personagem que eu crio.
- Transcrição crua é boa. Não pedir pra ele "limpar" antes de mandar.
- Esta skill substitui a extração rasa de voz do `/plugar`. O `/plugar` faz o setup do
  negócio em minutos; a voz de verdade nasce aqui.
