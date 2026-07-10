# /detectar-ia — Termômetro de "cara-de-IA" (pré-publicação)

> Spec de design. Produto da ImpulsoX AI. Nasce no template ImpulsoX-OS; desce pros clones
> via `/atualizar-motor`. Data: 2026-07-09.

## Problema

A dona colou um artigo num detector de IA e recebeu **72%**. O impulso natural é perseguir
"0% no detector" — mas isso é perseguir uma métrica quebrada.

**Verdade técnica que ancora o design** (pesquisa 2026):
- Detectores comerciais têm **falso-positivo alto**: a Declaração de Independência e a Bíblia
  são flagradas como "IA"; um estudo de Stanford (2023) achou até 61% de falso-positivo em
  texto de autores não-nativos de inglês. A OpenAI **desligou o próprio detector** em jul/2023
  por baixa acurácia.
- O que eles medem são dois proxies estatísticos: **perplexidade** (quão previsível é cada
  palavra — humano ~80-100, GPT-4 ~20-30) e **burstiness** (variância do tamanho de frase —
  humano espalha 0.6-1.2, IA cola em 0.2-0.4). Fontes: [GPTZero methodology](https://aifreetextpro.com/blog/how-ai-detectors-work),
  [WriteHumanly deep-dive](https://www.write-humanly.com/blog/burstiness-perplexity-deep-dive).
- **72% "IA" não quer dizer texto ruim.** Escrita boa e clara pontua parecido com IA porque
  ambas usam palavras previsíveis. O próprio texto-exemplar do Fable que aprovamos daria alto.

**Implicação estratégica:** o alvo certo não é enganar o detector. É o texto ser **bom,
específico e com a voz da marca** — que é o que o `/escritor-br` já mira. Mas o número alto
ainda é um **sinal útil**: quando bate alto, quase sempre há tells reais para cortar (frase
uniforme, contraste limpo demais, fecho-slogan). O detector é termômetro grosseiro, não juiz.

**A lacuna no sistema:** hoje o `/escritor-br` corrige por olho do modelo + gate regex
(`lib-humanizador.mjs`), mas ninguém dá um **número relativo pré-publicação** que aponte
QUAIS trechos vão pesar num detector, para afiar antes de publicar. Sem isso, a dona
descobre o problema só depois de colar no GPTZero — tarde demais.

## O que a skill faz

Roda um script que calcula um **índice 0-100 "cara-de-IA"** sobre um arquivo de texto,
mostra a quebra por sinal e **aponta os trechos culpados por linha**, e encaminha esses
trechos pro `/escritor-br` afiar. Fecha o loop: **detecta → afia → re-roda**.

## A blindagem central (o que a torna honesta)

> **Não promete reproduzir o número do GPTZero.** A fórmula deles é fechada e usa o próprio
> modelo; reproduzir exige rodar um LLM local (Python/transformers, ~500MB) que quebra o
> padrão Node da casa e AINDA assim não bate o número exato. A skill entrega um **índice
> relativo** — só significa algo comparado ao **chão dos exemplares Fable** (o que já
> aprovamos como humano). "Este parágrafo vai pesar, afia aqui" — não "vai dar X% no GPTZero".

## Escopo (YAGNI cravado)

**Faz:** índice 0-100 por 3 sinais calculáveis em Node puro; quebra por sinal; trechos
culpados por linha; chão de referência dos exemplares. Termômetro (exit 0 sempre), não gate.

**Não faz:** perplexidade real por LLM local (Caminho B, descartado por custo/precisão);
não reescreve (isso é do `/escritor-br`); não trava build (isso é do `lib-humanizador.mjs`);
não promete score de detector externo.

## Arquitetura

### `scripts/detectar-ia.mjs` — o motor

Recebe caminho de arquivo (`.md` ou `.txt`), remove frontmatter/code-block, e calcula o
índice como soma ponderada de 3 sinais. Cada sinal é normalizado 0-100 (100 = mais cara-de-IA).

| Sinal | Peso | Como mede | Fonte |
|---|---|---|---|
| **Burstiness** (uniformidade de frase) | 45% | 100 − normalizado(desvio-padrão do nº de palavras/frase ÷ média). Frases todas do mesmo tamanho → alto | maior peso no detector real; tell nº1 do `/escritor-br` |
| **Repetição de n-grama** (TTR) | 30% | proporção de bigramas+trigramas que se repetem ÷ total; TTR baixo → alto | [DetectRL](https://arxiv.org/pdf/2410.23746) |
| **Densidade de tells** | 25% | nº de tells (superfície + substância) ÷ palavras, escalado | reaproveita `lib-humanizador.mjs` |

**Densidade de tells cobre superfície E substância:**
- Superfície (já em `lib-humanizador.mjs`): travessão, "de forma X", "solução", vocabulário-tell.
- Substância (novo, do blader/humanizer): **significance inflation** ("momento decisivo",
  "implicações profundas", "mudança de paradigma", "cada vez mais"), **vague attribution**
  ("especialistas dizem/apontam", "estudos mostram", "sabe-se que", "é consenso" sem fonte).

**Chão de referência:** o script roda uma vez sobre os 3 artigos-exemplar do Fable
(`producao/artigos/*.md`) e grava a média num comentário de calibração. O output sempre
mostra "(chão dos exemplares Fable: ~NN)" ao lado do índice, para o número ter sentido.

### Output (formato)

```
ÍNDICE CARA-DE-IA: 58/100  (chão dos exemplares Fable: ~32)
  Burstiness .......... 71  ⚠  frases uniformes (média 18 palavras, desvio baixo)
  Repetição n-grama ... 44
  Densidade de tells .. 61  ⚠  8 tells em 1.472 palavras

TRECHOS QUE MAIS PESAM (afiar aqui):
  L23  4 frases seguidas de 18-20 palavras → quebrar o ritmo
  L41  "de forma prática" · "solução"  (tells de superfície)
  L55  "especialistas apontam" sem fonte  (vague attribution)
```

Três partes: índice + chão, quebra por sinal com ⚠ no que estourou, lista de trechos
culpados por linha. Exit 0 sempre.

### `scripts/detectar-ia.test.mjs` — calibração

Padrão da casa (todo script tem `.test.mjs`). Casos:
1. Exemplar Fable → índice **baixo** (< ~40).
2. Texto propositalmente de-IA (frases uniformes + tells + n-grama repetido) → índice **alto** (> ~65).
3. Burstiness: texto de frases idênticas em tamanho → sinal alto; texto com variação → baixo.
4. Densidade de tells: pega "momento decisivo" e "especialistas dizem" (substância nova).
5. Frontmatter e code-block são removidos antes de medir.

### Skill `/detectar-ia`

- **Quando roda:** antes de publicar qualquer artigo/página/post longo; ou quando a dona
  disser "isso tá com cara de IA?", "roda o detector", "quanto dá de IA nesse texto?".
- **Fluxo:** roda o script → lê o índice e os trechos → se acima do chão, encaminha os trechos
  pro `/escritor-br` afiar → re-roda pra confirmar que caiu.
- **Régua de leitura (anti-perseguição de zero):** o índice é relativo. Acima do chão +15
  vale afiar; perto do chão, está bom — NÃO diluir texto específico só pra baixar número
  (respeita o freio de falso-positivo do `/escritor-br`: número exato, nome, cena são humanos,
  não tell).

## Integrações (o que muda em arquivos existentes)

1. **`.claude/skills/escritor-br/SKILL.md`** — +3 padrões de substância na tabela de vícios
   (significance inflation, vague attribution, superficial analysis); o audit passa a citá-los.
2. **`scripts/lib-humanizador.mjs`** — +regex dos tells de substância regexáveis (significance
   inflation, vague attribution), pra `/escritor-br` pegar por script além do olho.
3. **`docs/gabarito-execucao-texto.md`** §5 aceite — artigo/página passa pelo `/detectar-ia`
   antes de publicar (termômetro, não gate: número alto manda afiar, não trava).
4. **`docs/mapa-de-skills.md`** — registra `/detectar-ia` como apoio, pré-requisito degrau 0.
5. **Memória de replicação** — registrar no template ImpulsoX-OS via `/atualizar-motor`.

## Riscos e limites (honestos)

- **Heurística é frágil contra paráfrase adversária** ([DetectRL](https://arxiv.org/pdf/2410.23746)):
  o índice mede sintoma, não autoria. Serve pra afiar, não pra "provar" que algo é humano.
- **Vocabulário-tell envelhece:** os tells de substância entram na mesma rotina de refresh
  mensal do `/formulas` que já atualiza a tabela do `/escritor-br` e o `lib-humanizador.mjs`.
- **Não substitui o `/revisar`** (julgamento estratégico) nem o `/escritor-br` (reescrita).
  É uma terceira camada: termômetro numérico que aponta o dedo.

## Critério de pronto

- `detectar-ia.mjs` roda em Node puro (sem dependência nova, sem modelo baixado).
- `detectar-ia.test.mjs` verde: exemplar Fable baixo, texto de-IA alto, tells de substância pegos.
- Output mostra índice + chão + quebra por sinal + trechos por linha.
- `/escritor-br` tem os 3 padrões novos; `lib-humanizador.mjs` pega os 2 regexáveis.
- Gabarito de texto §5 cita o passo; mapa de skills registra; memória de replicação gravada.
