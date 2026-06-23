# Incorporar inteligência do time Sabrina — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incorporar 4 ganhos do pack de marketing da Sabrina nas skills do ImpulsoX-OS: nota numérica no /revisar (só social orgânico), campo Wedge no núcleo, matriz CTA×plataforma + protocolo de hook, e a skill nova /repurpose.

**Architecture:** Tudo é edição de SKILL.md (markdown) e docs. Não há código executável nem teste automatizado. "Verificação" de cada task = grep/leitura confirmando que o conteúdo entrou e está internamente consistente. Trabalho no template (motor) — desce pros clones via /atualizar-motor depois.

**Tech Stack:** Markdown. Git. Grep para verificação.

> **Nota de verificação:** como não há suíte de testes, cada task termina com (a) um grep que confirma a presença do conteúdo novo e (b) uma leitura de olho confirmando que não contradiz o resto do arquivo. O "Expected" dos comandos é o que o grep deve retornar.

---

## Task 1: Campo Wedge no template `nucleo/negocio.md`

**Files:**
- Modify: `nucleo/negocio.md`

- [ ] **Step 1: Adicionar a seção de estrutura do Wedge ao template**

O arquivo hoje é um stub vazio (cabeçalho + "_(vazio — rode /plugar...)_"). Substituir o bloco de cabeçalho para documentar o campo Wedge como parte da estrutura que o /plugar vai preencher. Edit:

old_string:
```
# Negócio

> Preenchido pelo `/plugar`. Quem é a empresa, o que entrega, quem paga, o que a
> diferencia. O sistema lê isto antes de qualquer decisão.

_(vazio — rode `/plugar` para preencher)_
```

new_string:
```
# Negócio

> Preenchido pelo `/plugar`. Quem é a empresa, o que entrega, quem paga, o que a
> diferencia. O sistema lê isto antes de qualquer decisão.
>
> Campos: **O que é** · **O que entrega** · **Quem paga** · **Diferenciais** ·
> **Opinião contrária / Wedge**.
>
> **Opinião contrária / Wedge** — a crença forte do dono que a maioria do setor
> rebateria. NÃO é o diferencial ("o que faço melhor"); é a posição polêmica que
> divide a audiência ("a maioria das clínicas acha que preço é o que decide; é o
> contrário"). É o combustível dos ângulos polarizadores — lido por `/post`,
> `/formulas`, `/calendario` e `/repurpose`. Se o dono não tem uma clara, fica como
> pendência da Escada (não inventar).

_(vazio — rode `/plugar` para preencher)_
```

- [ ] **Step 2: Verificar**

Run: `grep -n "Wedge" nucleo/negocio.md`
Expected: 2+ linhas (o campo na lista + a explicação).

- [ ] **Step 3: Commit**

```bash
git add nucleo/negocio.md
git commit -m "feat(nucleo): campo Opinião contrária / Wedge no template negocio.md

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Capturar o Wedge no `/plugar`

**Files:**
- Modify: `.claude/skills/plugar/SKILL.md`

- [ ] **Step 1: Acrescentar a pergunta-wedge logo após a pergunta de diferencial (linha ~93)**

Edit. old_string:
```
4. "Por que escolhem você e não o concorrente? O que te diferencia de verdade?"
```

new_string:
```
4. "Por que escolhem você e não o concorrente? O que te diferencia de verdade?"
4b. "Qual opinião forte você tem sobre o seu setor — algo que a maioria dos seus
   concorrentes rebateria?" (o **Wedge**: a crença contrária que divide a audiência,
   não o diferencial). Se travar, empurrar: "que hábito comum do seu nicho você acha
   um erro? que conselho repetido você ignora?". Pegar algo específico, mesmo pequeno;
   se ainda não vier, marcar como pendência da Escada — nunca inventar.
```

- [ ] **Step 2: Registrar o destino do Wedge na Fase 3 (linha ~138)**

Edit. old_string:
```
- `nucleo/negocio.md` — respostas 1-4 (+ extração): o que é, o que entrega, quem paga, diferencial
```

new_string:
```
- `nucleo/negocio.md` — respostas 1-4b (+ extração): o que é, o que entrega, quem paga,
  diferencial e a **Opinião contrária / Wedge** (resposta 4b)
```

- [ ] **Step 3: Verificar**

Run: `grep -n "Wedge" .claude/skills/plugar/SKILL.md`
Expected: 2+ linhas (a pergunta 4b + a linha da Fase 3).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/plugar/SKILL.md
git commit -m "feat(plugar): captura a Opinião contrária / Wedge na entrevista

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Capturar o Wedge no `/voz`

**Files:**
- Modify: `.claude/skills/voz/SKILL.md`

- [ ] **Step 1: Ler a seção do roteiro da entrevista para achar o ponto de inserção**

Run: `grep -n "O roteiro da entrevista" .claude/skills/voz/SKILL.md`
Expected: a linha do título da subseção (~61). Ler as ~25 linhas seguintes (as 6 perguntas) para inserir uma nota sem quebrar a contagem "Seis perguntas".

- [ ] **Step 2: Adicionar nota sobre captura do Wedge ao fim do roteiro**

Após o bloco das 6 perguntas (antes da subseção seguinte, "Quando a voz é do canal"), inserir um parágrafo. A entrevista de voz é sobre o negócio, então o Wedge sai naturalmente das respostas — a nota orienta a extraí-lo, não adiciona uma 7ª pergunta forçada.

Insert (antes de "### Quando a voz é do canal"):
```
**Extrair o Wedge da transcrição.** A opinião contrária do dono (o **Wedge** —
ver `nucleo/negocio.md`) costuma aparecer sozinha quando ele fala do setor nas
perguntas 1 e 3. Se aparecer, capturar a frase literal e gravar em
`nucleo/negocio.md` (campo Opinião contrária / Wedge), não no `voz.md` — é munição
de conteúdo, não tom de escrita. Se a entrevista não revelar nenhuma, deixar como
pendência da Escada; o `/plugar` (pergunta 4b) é o ponto principal de captura.
```

- [ ] **Step 3: Verificar**

Run: `grep -n "Wedge" .claude/skills/voz/SKILL.md`
Expected: 1+ linha (a nota de extração).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/voz/SKILL.md
git commit -m "feat(voz): extrair o Wedge da transcrição para negocio.md

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Consumir o Wedge no `/post`, `/formulas`, `/calendario`

**Files:**
- Modify: `.claude/skills/post/SKILL.md`
- Modify: `.claude/skills/formulas/SKILL.md`
- Modify: `.claude/skills/calendario/SKILL.md`

- [ ] **Step 1: /post — ler o Wedge na seção "O que ler antes"**

Em `.claude/skills/post/SKILL.md`, a lista "O que ler antes" cita `nucleo/voz.md` e `nucleo/negocio.md`. Edit. old_string:
```
- `nucleo/voz.md` e `nucleo/negocio.md` — pro texto
```
new_string:
```
- `nucleo/voz.md` e `nucleo/negocio.md` — pro texto; em `negocio.md`, o campo
  **Opinião contrária / Wedge** é o combustível dos ângulos polarizadores (post
  "todo mundo erra X", contrarian take) — usar quando o tema pede posição
```

- [ ] **Step 2: /formulas — citar o Wedge como fonte de ângulo contrarian**

Em `.claude/skills/formulas/SKILL.md`, no Modo 1 passo 3 (gatilhos) ou na seção "Quem consome", a taxonomia já tem "Unpopular Opinion ~38%". Ligar ao Wedge. Edit. old_string:
```
   - **Unpopular Opinion ~38%** — opinião contraintuitiva/posição firme
```
new_string:
```
   - **Unpopular Opinion ~38%** — opinião contraintuitiva/posição firme (puxar do
     campo **Opinião contrária / Wedge** de `nucleo/negocio.md` quando existir — é
     a opinião que divide a audiência do próprio negócio)
```

- [ ] **Step 3: /calendario — ler o Wedge ao planejar ângulos**

Run: `grep -n "negocio.md\|ofertas.md\|O que ler\|núcleo" .claude/skills/calendario/SKILL.md`
Expected: localizar a seção onde o /calendario lista o que lê do núcleo. Adicionar uma menção ao Wedge nessa lista (uma linha): que ângulos polarizadores do mês saem do campo Opinião contrária / Wedge de `nucleo/negocio.md`. Usar Edit com a linha real encontrada pelo grep como old_string (incluir o contexto suficiente para ser único).

- [ ] **Step 4: Verificar os três**

Run: `grep -rn "Wedge" .claude/skills/post/SKILL.md .claude/skills/formulas/SKILL.md .claude/skills/calendario/SKILL.md`
Expected: 1+ linha em cada um dos três arquivos.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/post/SKILL.md .claude/skills/formulas/SKILL.md .claude/skills/calendario/SKILL.md
git commit -m "feat(skills): post/formulas/calendario leem o Wedge para ângulos polarizadores

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Nota numérica + scorecard no `/revisar` (só social orgânico)

**Files:**
- Modify: `.claude/skills/revisar/SKILL.md`

- [ ] **Step 1: Inserir a seção do scorecard após "Como roda" (antes de "Checklist de copy de página")**

Em `.claude/skills/revisar/SKILL.md`, inserir uma nova seção logo antes da linha `## Checklist de copy de página`. Insert:
```
## Nota numérica (só peça de social orgânico: post, carrossel, reel, legenda)

Para peça de **social orgânico**, o revisor devolve **nota X/10 ponderada + o veredito**
(os dois somam): a nota é o motor do loop, o veredito é o rótulo legível pro dono.

**Anúncio pago e copy de página NÃO recebem nota** — ficam com o veredito categórico
(prioridades diferentes: política de plataforma, clareza da oferta, prova não cabem na
ponderação Hook=50%).

### Scorecard (7 dimensões ponderadas)

| Dimensão | Peso | O que checa |
|---|---|---|
| **Hook strength** | **50%** | As 3-5 primeiras palavras param o scroll? Específico/surpreendente/polarizador? Passa como tweet sozinho? Sem throat-clearing ("em um mundo cada vez mais…") |
| Curiosidade + especificidade | 10% | Número/nome/momento real vs genérico; abre questão e resolve |
| Carga emocional | 10% | Provoca sentimento forte (surpresa, indignação, reconhecimento)? Sem emoção não viaja |
| Shareability | 10% | O leitor marcaria/salvaria/mandaria? Motivo específico. "Informativo" não conta |
| Voice match | 10% | Soa como a `nucleo/voz.md`? Tem ponto de vista ou poderia ser qualquer IA? |
| Polaridade | 5% | Diz algo discutível? Dá pra concordar OU rebater? Puxa do Wedge de `negocio.md` |
| Fit de plataforma | 5% | Tamanho/hook/hashtag certos; convida a métrica que a plataforma premia |

**Implicação do Hook=50%:** hook 4/10 com resto perfeito teto ~7; hook 10/10 com resto
mediano ~7,5. Post abaixo de 8 quase sempre = reescrever o hook.

### Auditoria de voz (pass/fail, penaliza a nota)

Cada falha subtrai 0,5 da nota final (teto −3): travessão `—`, contração ausente onde a
voz pede fala, número por extenso, voz passiva, filler ("realmente/muito/só/basicamente/
literalmente"), abertura-filler, contagem de hashtag fora do limite da plataforma.

### Régua da nota

**"10 não existe. 8 é forte. 9 quase nada a consertar. Harsh but fair."** Nota falsa alta
custa mais que crítica honesta. O loop existente (AJUSTAR → re-revisar, máx 2 rodadas) usa
a nota como gatilho: **nota < 8 → AJUSTAR** pela skill de origem, re-graduar; na 3ª
divergência o dono decide.

```
- [ ] **Step 2: Atualizar o veredito da seção "Como roda" para incluir a nota**

Edit. old_string:
```
3. **Receber o veredito:** APROVADA / AJUSTAR / REPROVADA + achados (um por linha,
   cada um com correção proposta).
```
new_string:
```
3. **Receber o veredito:** APROVADA / AJUSTAR / REPROVADA + achados (um por linha,
   cada um com correção proposta). **Para peça de social orgânico, junto vem a nota
   X/10 do scorecard** (ver "Nota numérica" abaixo); anúncio pago e página ficam só
   com o veredito categórico.
```

- [ ] **Step 3: Verificar**

Run: `grep -n "Hook strength\|10 não existe\|Nota numérica" .claude/skills/revisar/SKILL.md`
Expected: 3 linhas (uma por marcador).

- [ ] **Step 4: Ler de olho** que o fecho "→ próximo passo" e a seção "Regras" continuam coerentes (a nota não contradiz "o revisor não reescreve — julga"; ela é parte do julgamento). Sem edição se coerente.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/revisar/SKILL.md
git commit -m "feat(revisar): nota X/10 + scorecard 7 dimensões para social orgânico

Hook=50%, auditoria de voz penaliza, '10 não existe'. Anúncio pago e página
ficam com veredito categórico. Nota vira motor do loop AJUSTAR<8.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Régua das 7 dimensões no agente `revisor-marketing`

**Files:**
- Modify: arquivo de definição do agente `revisor-marketing` (localizar primeiro)

- [ ] **Step 1: Localizar a definição do agente**

Run: `find .claude -iname "*revisor-marketing*"; grep -rln "revisor-marketing" .claude/agents 2>/dev/null`
Expected: o caminho do arquivo de definição (provável `.claude/agents/revisor-marketing.md`). Ler o arquivo.

- [ ] **Step 2: Adicionar a régua de nota ao agente**

No corpo da definição do agente, após a seção que descreve o veredito, inserir um bloco que instrui o agente a, **quando a peça for social orgânico**, pontuar as 7 dimensões (Hook 50% / curiosidade 10% / emoção 10% / shareability 10% / voice match 10% / polaridade 5% / fit 5%), aplicar a auditoria de voz (−0,5 por falha, teto −3) e devolver a nota final X/10 junto do veredito, seguindo a régua "10 não existe; 8 é forte; harsh but fair". Para anúncio pago e página, NÃO pontuar — só o veredito. Usar como old_string a frase real do agente que menciona o veredito (achada no Step 1), preservando o tom do arquivo.

- [ ] **Step 3: Verificar**

Run: `grep -in "hook\|7 dimens\|10 não existe" <caminho-do-agente>`
Expected: 1+ linha confirmando a régua inserida.

- [ ] **Step 4: Commit**

```bash
git add <caminho-do-agente>
git commit -m "feat(agente): revisor-marketing pontua 7 dimensões em social orgânico

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Matriz CTA×plataforma no `/post`

**Files:**
- Modify: `.claude/skills/post/SKILL.md`

- [ ] **Step 1: Inserir a matriz após a seção "Objetivo da peça: ENVIAR ou salvar"**

A seção send/save termina na linha "A peça que não mira send NEM save fica bonita e some."
Inserir logo após ela uma subseção com a matriz. A matriz COMPLEMENTA send-default (não
substitui): send/save é o alvo de desenho; a matriz diz qual CTA dispara a métrica por
plataforma. Insert:
```
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
```

- [ ] **Step 2: Verificar**

Run: `grep -n "Matriz CTA" .claude/skills/post/SKILL.md`
Expected: 1 linha (o título da subseção).

- [ ] **Step 3: Ler de olho** que a matriz não contradiz "Uma chamada por peça" (Regras) nem a seção send/save. Confirmar que a linha IG-feed (save) e a regra send-default convivem (send é default global; save quando o tema é guardável — a matriz reflete o que cada rede premia). Sem edição se coerente.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/post/SKILL.md
git commit -m "feat(post): matriz CTA × plataforma (mira a métrica que cada rede premia)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Protocolo de iteração de hook no `/formulas`

**Files:**
- Modify: `.claude/skills/formulas/SKILL.md`

- [ ] **Step 1: Inserir o protocolo após o Modo 1 passo 1 (o gancho)**

Em `.claude/skills/formulas/SKILL.md`, o Modo 1 passo 1 classifica o gancho pela taxonomia.
Inserir, após a lista de tipos de hook do passo 1 (logo antes do passo "2. A estrutura"),
um bloco com o protocolo de iteração de hook. Insert:
```
   **Protocolo de iteração do hook (vale pra QUALQUER hook que o /post e o /linkedin
   escrevem, não só na dissecação).** O hook é ~50% do desempenho — escrever o hook
   PRIMEIRO e reescrever 3-5x antes do corpo:
   1. 3 variações do hook, de categorias diferentes da taxonomia acima.
   2. **first-3-words test:** as 3 primeiras palavras sozinhas criam curiosidade/
      surpresa? ("Aqui está o que eu" → falha; "Testei 47" → passa; "A maioria acha"
      → passa).
   3. Primeira palavra = a mais forte (número/nome/surpresa na frente; cortar "então/
      hoje/bom").
   4. Passa como tweet sozinho? Se só faz sentido com o corpo, está fraco.
   5. Não soa IA, sem abertura genérica. Só depois de o hook passar, escrever o corpo.
```

- [ ] **Step 2: Adicionar a ordenação por teto de viralização à taxonomia**

A taxonomia do passo 1 já lista os tipos em ordem de retenção. Adicionar uma linha curta
reforçando que, ao escolher o ângulo de uma peça nova, os tipos do topo (Specific Outcome,
POV, Unpopular Opinion) têm o maior teto e batem com a regra "copiar a fórmula de quem
performa". Edit. old_string (a linha do Generic Reveal, fim da lista):
```
   - **Generic Reveal ~12% ("Oi pessoal")** — o pior; anotar como antipadrão
```
new_string:
```
   - **Generic Reveal ~12% ("Oi pessoal")** — o pior; anotar como antipadrão

   Ao escolher o ângulo de uma peça NOVA, preferir os tipos do topo (Specific Outcome,
   POV, Unpopular Opinion) — maior teto de viralização e alinhados à regra "copiar a
   fórmula de quem performa". Adaptar sempre ao nosso tom (professor, não vendedor): o
   molde transfere, a estética de vendedor americano não.
```

- [ ] **Step 3: Verificar**

Run: `grep -n "first-3-words\|maior teto" .claude/skills/formulas/SKILL.md`
Expected: 2 linhas.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/formulas/SKILL.md
git commit -m "feat(formulas): protocolo de iteração de hook + taxonomia ordenada por teto

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: first-3-words test no `docs/frase-que-pega.md`

**Files:**
- Modify: `docs/frase-que-pega.md`

- [ ] **Step 1: Localizar onde o doc fala de teste/craft do hook**

Run: `grep -n "^##\|teste\|hook\|headline" docs/frase-que-pega.md`
Expected: o mapa de seções. Escolher a seção que trata de avaliar/afiar o hook (ou o fim do doc se não houver seção dedicada).

- [ ] **Step 2: Adicionar os testes operacionais**

Inserir na seção achada (ou criar uma subseção "Testes rápidos do hook" no fim) um bloco
com os testes operacionais que faltavam explícitos:
```
## Testes rápidos do hook (operacionais)

Antes de aprovar qualquer hook:
- **first-3-words test** — as 3 primeiras palavras sozinhas criam curiosidade, surpresa
  ou pull emocional? "Aqui está o que eu" → falha; "Testei 47" → passa.
- **Primeira palavra é a mais forte** — número, nome ou surpresa na frente; cortar
  "então", "hoje", "bom", "olha".
- **Passa como tweet sozinho?** Se o hook só faz sentido com o corpo, está fraco.
- **Sem abertura genérica de IA** — nunca "em um mundo cada vez mais", "deixa eu te
  contar", "imagina só".
```

- [ ] **Step 3: Verificar**

Run: `grep -n "first-3-words" docs/frase-que-pega.md`
Expected: 1+ linha.

- [ ] **Step 4: Commit**

```bash
git add docs/frase-que-pega.md
git commit -m "docs(frase-que-pega): testes operacionais do hook (first-3-words)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Criar a skill `/repurpose`

**Files:**
- Create: `.claude/skills/repurpose/SKILL.md`

- [ ] **Step 1: Escrever o SKILL.md**

Criar `.claude/skills/repurpose/SKILL.md` com o conteúdo completo:
```
---
name: repurpose
description: >
  Use quando uma peça longa (artigo, transcrição de YouTube, newsletter, script) deve
  virar uma semana de conteúdo — "/repurpose", "transforma esse vídeo em posts", "quebra
  isso em conteúdo", "uma semana de posts a partir disso". Extrai os temas de 1 fonte
  longa e os distribui no mix do negócio (Instagram, LinkedIn, Reel/Short, TikTok),
  gerando cada peça pela skill dona, graduando via /revisar e jogando no /calendario.
  Mata o "o que eu posto hoje". Não inventa: só usa o que está na fonte.
---

# /repurpose — 1 peça longa vira uma semana de conteúdo

Criador não faz peça nova todo dia: ele pega uma fonte densa (um vídeo, um artigo, uma
entrevista) e a destila em muitas peças nativas de cada rede. Esta skill faz isso — o
trabalho pesado de distribuição, sem reescrever a mesma coisa em fontes diferentes.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda no degrau 0 com defaults; calibra de verdade a partir do degrau 3 (núcleo com voz,
ofertas ATIVAS e Wedge). Sem núcleo, roda em degrau baixo e marca o que falta — nunca trava.

## O que ler antes

- `nucleo/voz.md` — toda peça sai na voz da marca
- `nucleo/negocio.md` — em especial o campo **Opinião contrária / Wedge** (alimenta os
  ângulos polarizadores do batch)
- `nucleo/ofertas.md` — **só oferta ATIVA** entra em peça pública; roadmap/futuras ficam fora
- `marca/design-guide.md` + `marca/tokens.css` — pras peças visuais
- `docs/formulas.md` + `docs/frase-que-pega.md` — o hook de cada peça sai daqui

## Quando NÃO é esta skill

Entrada curta (uma ideia, menos de um parágrafo) → não é repurpose: manda pro `/post`.
Esta skill precisa de material denso pra destilar.

## Fluxo

1. **Entrada.** Receber a fonte longa: artigo, transcrição de YouTube, newsletter ou
   script. Transcrição/script vêm com vício de fala — planejar cortar ("né", "tipo", "ã").

2. **Extrair os temas.** Ler a fonte inteira e puxar:
   - **1 tese central** — a maior ideia.
   - **3-7 pontos de apoio** — cada um forte o bastante pra virar peça sozinho.
   - **Todo ativo concreto** — números, nomes, histórias, citações, resultados, takes
     contrários. É a matéria-prima dos hooks e da prova.
   Devolver os temas em 2-3 linhas pro dono redirecionar se errou o ponto — **sem obrigar
   a aprovar um outline longo.**

3. **Mapear no mix do negócio.** Distribuir os temas pelos formatos que o negócio usa:
   **Instagram (carrossel/post) · LinkedIn · Reel/Short · TikTok**. O roteiro de short
   serve TikTok e Reels juntos (mesmo formato vertical). Sem X (quase não usamos). Reusar
   um tema entre formatos **só quando o ângulo muda** — nunca publicar a mesma peça em
   fontes diferentes. O número de peças sai da força da fonte (ver anti-enchimento), não
   de uma cota fixa; ajustar ao `nucleo/perfil.md` (o mix do perfil manda).

4. **Gerar cada peça pela skill dona** (esta skill ORQUESTRA, não reimplementa):
   - Instagram → `/post`
   - LinkedIn → `/linkedin`
   - Reel/Short/TikTok → `/shorts` (ou o roteiro de reel do `/post`)
   Cada peça abre com hook do `/formulas` (protocolo first-3-words), **variando a
   categoria de hook no batch** — feed inteiro com o mesmo hook tem cara de template.

5. **Graduar.** Cada peça de social orgânico passa pelo `/revisar` (nota X/10). Não
   entregar peça abaixo de 8/10 — loop no hook.

6. **Destino: o calendário.** Jogar as peças aprovadas no `/calendario` (não publicar
   direto). O dono aprova e publica pelo `/publicar`.

## Regras

- **Anti-enchimento.** Fonte magra demais pra N ângulos distintos → fazer MENOS peças
  fortes, nunca encher com peça fraca. Dizer ao dono quando a fonte não dá pra mais.
- **Peça pública só vende oferta ATIVA** (CLAUDE.md). Roadmap/piloto/futuras fora — nem
  como "em breve".
- **Só conteúdo real.** Nada inventado a partir do que não está na fonte. Dado ausente →
  instrução de substituição, nunca fato fabricado.
- **Anti-formulaico.** Variar categoria de hook e formato no batch.
- É MOTOR: nasce no template ImpulsoX-OS e desce pros clones via `/atualizar-motor`. Nunca
  instalar direto num clone.

## Posição no fluxo

Entra entre `/radar` e `/calendario`: uma fonte longa alimenta o mês inteiro de uma vez.

## Teste de aceitação (comportamental)

1. Transcrição de YouTube de 20 min → tese + 3-7 pontos + ativos concretos extraídos;
   temas resumidos em 2-3 linhas; peças geradas pelas skills donas e graduadas.
2. Fonte magra (meio parágrafo) → a skill avisa que não é caso de repurpose e manda pro `/post`.
3. Fonte rica mas que só sustenta 4 ângulos fortes → 4 peças fortes, não 10 fracas (a skill
   diz o porquê).
4. Núcleo com Wedge → ao menos uma peça do batch usa o ângulo polarizador.
5. Oferta futura citada na fonte → fica fora das peças públicas.

---

**✓ Pronto:** uma fonte longa destilada em várias peças nativas (IG, LinkedIn, Reel/Short, TikTok), cada uma graduada e jogada no calendário · **→ próximo passo:** `/calendario` — encaixar as peças no mês e seguir pra produção/publicação. Esperar o "sim" do dono antes de seguir.
```

- [ ] **Step 2: Verificar**

Run: `grep -n "name: repurpose\|anti-enchimento\|/calendario" .claude/skills/repurpose/SKILL.md`
Expected: 3+ linhas. E: `ls .claude/skills/repurpose/SKILL.md` → existe.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/repurpose/SKILL.md
git commit -m "feat(repurpose): skill nova — 1 fonte longa vira semana de conteúdo

Extrai temas, distribui no mix IG+LinkedIn+Reel/Short+TikTok via skills donas,
gradua via /revisar, joga no /calendario. Anti-enchimento, só oferta ATIVA.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Posicionar `/repurpose` no mapa de skills e no fecho do `/radar`

**Files:**
- Modify: `docs/mapa-de-skills.md`
- Modify: `.claude/skills/radar/SKILL.md`

- [ ] **Step 1: Adicionar /repurpose ao mapa de skills**

Run: `grep -n "radar\|calendario\|FLUXO\|Principal\|Opcion" docs/mapa-de-skills.md`
Expected: localizar onde o fluxo de conteúdo é descrito (radar → calendário → post…).
Inserir `/repurpose` como passo opcional entre `/radar` e `/calendario` (alimenta o mês a
partir de 1 fonte longa). Usar Edit com a linha real do fluxo como old_string.

- [ ] **Step 2: Mencionar /repurpose no fecho do /radar**

Run: `grep -n "próximo passo\|✓ Pronto\|✓ pronto" .claude/skills/radar/SKILL.md`
Expected: a linha de fecho do radar. Editar o fecho para mencionar `/repurpose` como
alternativa opcional ("se você tem uma fonte longa — vídeo, artigo — `/repurpose` vira o
mês inteiro de uma vez"), sem empurrar (regra de guiar pela esteira: oferecer, não forçar).
Usar Edit com a linha de fecho real como old_string.

- [ ] **Step 3: Verificar**

Run: `grep -n "repurpose" docs/mapa-de-skills.md .claude/skills/radar/SKILL.md`
Expected: 1+ linha em cada arquivo.

- [ ] **Step 4: Commit**

```bash
git add docs/mapa-de-skills.md .claude/skills/radar/SKILL.md
git commit -m "docs(mapa): posiciona /repurpose entre /radar e /calendario

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: Verificação final e push

- [ ] **Step 1: Conferir que todos os ganhos entraram**

Run:
```bash
grep -rln "Wedge" nucleo/negocio.md .claude/skills/plugar/SKILL.md .claude/skills/voz/SKILL.md .claude/skills/post/SKILL.md .claude/skills/formulas/SKILL.md .claude/skills/calendario/SKILL.md
grep -ln "Hook strength" .claude/skills/revisar/SKILL.md
grep -ln "Matriz CTA" .claude/skills/post/SKILL.md
grep -ln "first-3-words" .claude/skills/formulas/SKILL.md docs/frase-que-pega.md
ls .claude/skills/repurpose/SKILL.md
grep -ln "repurpose" docs/mapa-de-skills.md
```
Expected: cada comando retorna os arquivos esperados, sem vazio.

- [ ] **Step 2: Revisar o log**

Run: `git log --oneline -13`
Expected: os commits das tasks 1-11 + o spec, em ordem.

- [ ] **Step 3: Push**

```bash
git push
```
Expected: push para origin/main sem erro. (Se a rede dropar api.github.com, ligar Cloudflare WARP antes — ver memória.)

- [ ] **Step 4: Apontar o próximo passo ao dono**

Avisar: motor atualizado no template. Próximo passo natural = `/atualizar-motor` em cada
clone de cliente pra distribuir os 4 ganhos. Esperar o "sim" (não encadear sozinho).

---

## Self-Review (preenchido na escrita do plano)

**Cobertura do spec:**
- Ganho 1 (nota /revisar) → Tasks 5, 6 ✓
- Ganho 2 (Wedge) → Tasks 1, 2, 3, 4 ✓
- Ganho 3 (matriz CTA + protocolo hook) → Tasks 7, 8, 9 ✓
- Ganho 4 (/repurpose) → Tasks 10, 11 ✓
- "Tudo no motor, pronto pra /atualizar-motor" → Task 12 ✓
- Não-adotados (Blotato, 100 templates, nota na página) → nenhuma task os implementa ✓

**Placeholders:** Tasks 3, 4(step3), 6, 9, 11 usam grep-para-localizar antes do Edit porque
o ponto exato de inserção depende do conteúdo atual do arquivo (não relido por inteiro aqui).
Isso é localização guiada, não placeholder de conteúdo — o conteúdo a inserir está escrito por
extenso em cada uma. Aceitável.

**Consistência de nomes:** "Opinião contrária / Wedge" (campo), "Hook strength" / "Hook=50%",
"first-3-words test", "/repurpose", "social orgânico" usados igual em todas as tasks. ✓
