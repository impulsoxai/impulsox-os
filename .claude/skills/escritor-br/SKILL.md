---
name: escritor-br
description: >
  Use quando qualquer texto em português precisa soar humano, natural e com a voz da
  marca — antes de publicar post, legenda, anúncio, artigo, e-mail ou página. Também
  quando o usuário disser que algo "tá com cara de IA", "robótico", "genérico", "sem
  personalidade", ou pedir "deixa mais humano", "reescreve natural", "tira o jeitão de
  ChatGPT". É passo obrigatório dentro das skills de conteúdo do ImpulsoX-OS.
---

# /escritor-br — Escrita humana em português

Transforma texto que cheira a IA em texto que soa como uma pessoa real, com a voz da
marca. Não é faxina de "delve" — é reconstruir o ritmo e injetar personalidade.

> **Princípio.** Texto de IA não soa artificial por usar a palavra errada — soa por usar
> a palavra certa no ritmo errado, sem variação, explicando demais. **E limpo não basta:
> texto sem voz é tão denunciável quanto texto com clichê.** Os dois lados são trabalho
> desta skill: tirar o tique E pôr a alma.

Quando vem da `/copy`, recebe copy já **forte** (afiada pra vender). Aqui ela vira forte
**E humana**. A pergunta deste audit é só uma: *"isso ainda parece IA?"* — não *"isso
vende?"* (esse já passou na Camada 3 da `/copy`).

Autoria: ImpulsoX AI. Conteúdo original. Rigor de detecção inspirado no guia público
"Signs of AI writing" (Wikipedia / WikiProject AI Cleanup), reescrito pra PT-BR — não é
cópia: os padrões abaixo são os que têm valor em português e não duplicam os daqui.

## Antes de começar

Ler `nucleo/voz.md` (ou o do cliente). É o mapa de voz: tom, exemplos, palavras a evitar.
Se não existir, perguntar uma coisa só:
> "Me dá um exemplo de texto — seu ou de outra marca — que soa do jeito certo pra você.
> Concreto vale mais que adjetivo."

Se o usuário trouxer uma amostra de escrita, ler **antes** de reescrever e anotar:
tamanho de frase (curta? longa? misturado?), nível de vocabulário, como abre parágrafo,
tiques de pontuação, jeito de fazer transição. Reescrever casando com esses padrões — não
só tirar IA, mas substituir pelo jeito da amostra.

## Como roda — loop draft → audit → final

Substitui os "3 modos avulsos" por uma sequência com auto-crítica no meio. Não é passada
única: é escrever, parar e perguntar o que ainda denuncia IA, e só então fechar.

### 1. Rascunho
Reescrever o texto tirando os vícios da tabela e consertando o ritmo. Cobrir tudo o que
o original cobria — se tinha cinco parágrafos, o rascunho tem cinco. Trocar genérico por
concreto (número, nome, exemplo real). Ler em voz alta na cabeça: varia o tamanho da
frase? Prefere o simples (é/tem/faz) ao rebuscado?

### 2. Audit — "o que aqui ainda denuncia IA?"
Parar e responder essa pergunta em bullets curtos. Listar os tells que sobraram (ritmo
ainda tidy demais, contraste limpo demais, fecho meio slogan, etc.). É auto-crítica
explícita, não opcional.

### 3. Final
Reescrever resolvendo os bullets do audit **e** respeitando as restrições duras abaixo.

Entregar: o rascunho, os bullets do "ainda-IA", e o texto final. (Em uso embutido por
outra skill, entregar só o final, mas rodar o loop internamente mesmo assim.)

## Restrições duras (régua de "zero", não de "evite")

No texto **final**, zero de:
- **Travessão `—` e meia-risca `–`.** É o tell nº 1 de IA. Trocar, nesta ordem de
  preferência: ponto (frase nova), vírgula (aparte curto), dois-pontos (explicação),
  parênteses (aparte de verdade), ou reestruturar. Pegar também ` — ` espaçado e ` -- `.
  **Varredura final:** achou `—`/`–`/`--`, não está pronto.
- **Aspas curvas `“ ” ‘ ’`.** Usar retas `" "`.
- **Title-case em título** ("Negociações Estratégicas E Parcerias" → "Negociações
  estratégicas e parcerias"). Só a 1ª letra e nomes próprios.
- **Boldface mecânico** (negritar frase a frase pra dar ênfase artificial).
- **Emoji decorativo** abrindo tópico ou bullet (a não ser que a `voz.md` peça).

> Ressalva: em conteúdo técnico/de referência (JSON, schema, spec, doc de código), o
> neutro **é** o humano correto — não aplicar SOUL nem injetar 1ª pessoa/opinião lá. As
> restrições de pontuação valem; as de voz, não.

## Vícios de IA em português — a tabela (16 originais + fusão dos que faltavam)

Caçar e cortar. Os marcados (✦) entraram da fusão com o guia de detecção:

| Vício | Em vez disso |
|---|---|
| "Além disso," abrindo parágrafo toda hora | Variar conectivo ou emendar a ideia direto |
| "É importante ressaltar que" / "Vale ressaltar" | Diga a coisa. Se importa, já está no texto |
| "No mundo atual" / "Nos dias de hoje" / "Na era digital" | Cortar. Quase sempre enche linguiça |
| "Não é apenas X, mas sim Y" (repetido) | Usar uma vez no máximo; reescrever direto |
| "desempenha um papel fundamental/crucial" | Dizer o que a coisa faz, em verbo concreto |
| "Em suma" / "Em resumo" / "Por fim" enfileirados | Fechar sem anunciar que está fechando |
| Cadeia de gerúndios: "buscando", "visando", "proporcionando" | Verbo no presente, frase direta |
| "potencializar", "alavancar", "otimizar", "robusto", "poderoso" | Palavra simples que diz o mesmo |
| "de forma [eficaz/simples/prática]" | Cortar o advérbio ou mostrar como |
| "Imagine que..." / "Vamos explorar" / "Mergulhe" | Começar pelo fato ou pela tensão real |
| "solução" para tudo | Nomear o que é (o serviço, o produto, a ferramenta) |
| Tricolon perfeito em toda lista (sempre 3 itens simétricos) | Quebrar a simetria; 2 ou 4 itens, tamanhos diferentes |
| Travessão a cada duas frases | (Ver restrição dura: zero no final) |
| Toda frase com o mesmo comprimento | Alternar curta e longa de propósito |
| "transformar" / "revolucionar" / "elevar ao próximo nível" | Dizer a mudança concreta que acontece |
| ✦ Cópula evitada: "serve como", "se destaca como", "se configura como" | "é", "tem", "faz" — o simples |
| ✦ Falso intervalo: "de [X] a [Y]" com X e Y fora de uma escala real | Listar as coisas direto, sem o "de…a" |
| ✦ Variação elegante: trocar de sinônimo a cada frase ("a IA"→"a ferramenta"→"o sistema") | Repetir o termo certo; não cicla sinônimo por medo de repetir |
| ✦ Signposting: "vamos explorar", "a seguir veremos", "neste artigo você vai" | Entrar no assunto direto |
| ✦ Negação em cauda: "sem achismo", "sem esforço" grudado no fim da frase | Virar oração de verdade ("sem que você precise adivinhar") |
| ✦ Punchline fabricada / staccato dramático (vários fragmentos curtos seguidos inflando o tom) | Um fragmento pontual vale; fileira deles, não |
| ✦ Aforismo "X é o Y de Z" ("é o Uber da marcenaria") | Dizer o que é de fato |
| ✦ Abertura retórica falso-sincera: "Olha,", "Sinceramente?", "Vou ser honesto:" | Cortar o teatro; começar pela frase |
| ✦ Artefato de chat: "Claro!", "Ótima pergunta!", "Espero que ajude", "Quer que eu…?" | Não é conteúdo; cortar |
| ✦ Disclaimer de cutoff / preenchimento especulativo: "até onde sei", "não há muita informação disponível" | Dizer o que se sabe, ou cortar a frase; nunca inventar |

(Os PT-BR-específicos que o guia de fora não tem ficam: cadeia de gerúndios, "além disso",
tricolon à brasileira. Não perder esses.)

## Freio de falso-positivo — "o que NÃO matar"

Humanizar não pode achatar prosa boa nem diluir o que a `/copy` construiu. Escritor humano
acerta vários "padrões" sem ser IA. **Não** reescrever só por causa de:
- **Detalhe específico, raro, difícil de inventar** — número exato, nome próprio, endereço,
  uma cena concreta. IA arredonda o específico; humano acumula. **Preservar sempre.**
- **Sentimento misto / tensão não resolvida** — "acho bom, mas me incomoda e não sei
  explicar". IA tende ao take limpo; isso é sinal de gente.
- **Gíria ou referência datada** — marca um ano/subcultura. Modelo atrasa; humano não.
- **Variação de ritmo deliberada** — curta e longa de propósito é exatamente o alvo.
- **Frase que pega (vinda da Camada 4 da `/copy`)** — antítese, paralelismo, reframe ou
  específico vívido ("some da internet, some da cabeça do cliente") é **craft**, não tique
  de IA. Não desmontar pra "deixar natural" — humanizar aqui é preservar a sacada e só
  tirar o que a denuncia (travessão, aspa curva). Achatar a frase que pega mata o sangue.
- **Aparte, parêntese, autocorreção** genuínos — "(quase escrevi 'sempre' aqui)".
- **Pontuação/registro misto** de quem é da área técnica — não é robô, é pessoa real.

Regra: tell isolado não condena. Procurar **aglomerado** de tells, não um só. E o mais
importante pra cá: **não diluir a especificidade (número, nome, prazo) nem desmontar a
estrutura de história (tensão → "mas" → desfecho) que a skill de origem montou.** O "mas"
é pivô de intriga, não vício — preservar.

## SOUL — limpo não basta

Tirar IA é metade do trabalho. Texto estéril, sem voz, denuncia tanto quanto clichê.
**Aplicar só onde cabe** (post, legenda, anúncio, página, e-mail, artigo de opinião). Em
texto técnico/de referência, neutro é o certo — pular esta seção lá.

Sinais de texto sem alma (mesmo "limpo"): toda frase do mesmo tamanho; só reporta, nunca
reage; nenhuma opinião nem ponto de vista; nenhuma 1ª pessoa quando caberia; zero humor,
zero aresta; lê como release.

Como pôr pulso:
- **Tenha opinião.** Não só reportar o fato, reagir a ele.
- **Varie o ritmo de propósito.** Curta. E aí uma que leva o tempo dela pra chegar.
- **Deixe entrar um pouco de bagunça.** Aparte, tangente, pensamento meio formado. Estrutura
  perfeita demais soa de algoritmo.
- **Injete a voz da marca** do `nucleo/voz.md`: o jeito de abrir e fechar, as palavras que
  usa, a postura.

> **Humanizar não é relaxar o registro.** Se a `voz.md` pede português escrito por
> extenso ("está/para/você", não "tá/pra/cê"), o final respeita isso — soar humano não
> autoriza contração falada nem gíria de transcrição. E não diluir o concreto: o canal é
> "WhatsApp", não "por mensagem"; o produto tem nome, não é "a solução".

### Antes (limpo, mas sem alma) → depois (com pulso)
- ❌ "O atendimento automatizado melhora a eficiência. Reduz o tempo de resposta e aumenta
  a satisfação. Os resultados costumam ser positivos."
- ✅ "Cliente não espera. Manda no WhatsApp 22h, e se ninguém responde, amanhã ele já
  comprou de outro. O Agente responde na hora, no tom da sua loja. Você descobre de manhã
  que vendeu enquanto dormia."

## Critério de pronto

- Lido em voz alta, soa como alguém falando, não como relatório.
- Passou a **varredura de restrição dura**: nenhum `—`/`–`/`--`, nenhuma aspa curva,
  nenhum título em title-case, sem negrito mecânico, sem emoji decorativo.
- Nenhum item da tabela sobrou sem motivo; o audit "ainda-IA" foi respondido e resolvido.
- A voz é reconhecível como a da marca (bate com `nucleo/voz.md`) — e o texto tem alma,
  não só ausência de tique (ver SOUL).
- O freio de falso-positivo foi respeitado: especificidade, sentimento misto e estrutura
  de história continuam de pé.
- Toda afirmação concreta é verdadeira — humanizar **nunca** inventa fato, número ou
  depoimento. Dado que não existe vira instrução de substituição, não invenção.
- **O gancho entrega o que promete.** Se a primeira linha abre uma pergunta, o texto
  fecha ela na intensidade prometida (lei da lacuna honesta do `docs/persuasao.md`).
  Gancho inflado demais pro conteúdo → baixar o gancho, não inflar o texto.
- A reescrita **preserva os gatilhos da peça**: não diluir a especificidade (número
  exato, nome, prazo) nem desmontar a história (tensão → "mas" → desfecho) que a skill
  de origem construiu.

## Uso embutido

As skills de conteúdo do ImpulsoX-OS (`/post`, `/linkedin`, `/email`, `/ads-*`, `/copy`)
chamam este passo antes de entregar. O usuário não precisa pedir: todo texto sai daqui já
humano. Rodar o loop draft→audit→final internamente mesmo no uso embutido. Não rodar em
conteúdo puramente técnico onde voz não se aplica (ex: especificação, JSON) — lá só valem
as restrições de pontuação, não as de voz.

O gate frio final é o **`/revisar`** (olhos frios, agente separado), não esta skill — são
camadas diferentes: aqui é voz/humanização, lá é julgamento estratégico em contexto limpo.

---

**✓ Pronto:** texto humanizado na voz da marca (loop rascunho → audit → final, restrições duras passadas) · **↩ esta é uma skill de apoio:** é chamada por `/post`, `/linkedin`, `/email`, `/copy`, `/conteudo` e `/ads-*` — não tem próximo passo próprio; o fluxo volta pra skill que a chamou (e o gate frio final é o `/revisar`).
