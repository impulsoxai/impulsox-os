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

Autoria: ImpulsoX AI. Conteúdo original.

## Antes de começar

Ler `nucleo/voz.md` (ou o do cliente). É o mapa de voz: tom, exemplos, palavras a evitar.
Se não existir, perguntar uma coisa só:
> "Me dá um exemplo de texto — seu ou de outra marca — que soa do jeito certo pra você.
> Concreto vale mais que adjetivo."

## Como roda

Três modos, em sequência para transformação completa, ou avulsos quando só um é preciso.

### Modo 1 — Detectar
Apontar os vícios de IA no texto antes de mexer. Diagnóstico, não edição. Marcar cada
trecho com o vício correspondente da tabela abaixo. Serve pra você (e pro cliente) ver
o que estava errado.

### Modo 2 — Desentortar o ritmo
Tirar os padrões de IA e consertar a cadência. IA escreve frases todas do mesmo tamanho,
listas perfeitas de três, conectivos previsíveis. Humano varia: frase curta. Depois uma
mais longa que respira e muda o compasso. Trocar genérico por concreto (número, nome,
exemplo real). Quebrar o tricolon automático.

### Modo 3 — Injetar a voz
Com o genérico removido, colocar a personalidade da marca (do `nucleo/voz.md`): gírias ou
formalidade que a marca usa, opinião, ponto de vista, o jeito específico de começar e
fechar. Aqui "humano" vira *desta marca*.

## Vícios de IA em português — a tabela

Clichês e tiques que denunciam texto de IA em PT-BR. Caçar e cortar:

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
| Travessão usado a cada duas frases | Reservar pra ênfase real; usar ponto |
| Toda frase com o mesmo comprimento | Alternar curta e longa de propósito |
| "transformar" / "revolucionar" / "elevar ao próximo nível" | Dizer a mudança concreta que acontece |

## Critério de pronto

- Lido em voz alta, soa como alguém falando, não como relatório.
- Nenhum item da tabela sobrou sem motivo.
- A voz é reconhecível como a da marca (bate com `nucleo/voz.md`).
- Toda afirmação concreta é verdadeira — humanizar **nunca** inventa fato, número ou
  depoimento. Dado que não existe vira instrução de substituição, não invenção.
- **O gancho entrega o que promete.** Se a primeira linha abre uma pergunta, o texto
  fecha ela na intensidade prometida (lei da lacuna honesta do `docs/persuasao.md`).
  Gancho inflado demais pro conteúdo → baixar o gancho, não inflar o texto.
- A reescrita **preserva os gatilhos da peça**: humanizar não pode diluir a
  especificidade (número exato, nome, prazo) nem desmontar a estrutura de história
  (tensão → "mas" → desfecho) que a skill de origem construiu.

## Uso embutido

As skills de conteúdo do ImpulsoX-OS (post, legenda, anúncio, artigo, e-mail) chamam este
passo antes de entregar. O usuário não precisa pedir: todo texto sai daqui já humano. Não
rodar em conteúdo puramente técnico onde voz não se aplica (ex: especificação, JSON).
