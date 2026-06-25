# Craft de pitch narrado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o doc de craft `docs/pitch-narrado.md` (que ENSINA como escrever um pitch narrado que converte) e consertar o passo 5 da `/slides` pra ler o doc e rodar um loop ativo de escrita, em vez do checklist passivo atual.

**Architecture:** Doc de craft no padrão de `persuasao.md`/`frase-que-pega.md` (referência lida por skills), com 4 pilares (Sparkline/Duarte, Big Shift/Raskin, Equação de Valor/Hormozi, demo Tell-Show-Tell), adaptados PT-BR + voz da casa + regras duras. A `/slides` passo 5 passa a LER o doc e rodar loop mapa→rascunho→auto-crítica→reescrita (mecânica do `escritor-br`), removendo o bloco de regras inline duplicado. Encaixes de motor: CLAUDE.md, mapa-de-skills, CHANGELOG, versão.

**Tech Stack:** Markdown puro. Sem código, sem testes unitários — "validação" = checagem de conteúdo contra o spec. Git pra commits.

**Spec:** `docs/superpowers/specs/2026-06-24-pitch-narrado-design.md`

---

### Task 1: Criar `docs/pitch-narrado.md` (os 4 pilares)

**Files:**
- Create: `docs/pitch-narrado.md`

- [ ] **Step 1: Escrever o doc completo**

Criar `docs/pitch-narrado.md` com esta estrutura. Seguir o padrão de cabeçalho de `docs/frase-que-pega.md` (blockquote de quem lê + princípio-mãe). Conteúdo exato:

````markdown
# Pitch narrado — a craft do arco de slides que converte

> Lido por `/slides` (passo 5, a copy do deck), e disponível pra `/proposta` (pitch ao vivo)
> e `/roteiro-yt` (vídeo). É o craft do ARCO de uma sequência falada — o nível acima da
> peça (`docs/persuasao.md`) e da frase (`docs/frase-que-pega.md`). Base: Nancy Duarte
> (Resonate, Sparkline), Andy Raskin (strategic narrative), Alex Hormozi (Equação de Valor,
> $100M Offers) e frameworks de demo que convertem. Persuasão aqui é tornar a decisão clara
> ao vivo, nunca empurrar — as regras inegociáveis do fim valem mais que qualquer técnica.
>
> Princípio-mãe: **um pitch não descreve a empresa que fala — convence o dono que ouve.**
> Tudo que descreve produto em vez de vender ganho está fraco. A régua de voz mora em
> `nucleo/voz.md`; a oferta vem do `/oferta`; a prova, do `nucleo/provas.md`. Este doc só
> ensina a ENCADEAR isso num arco que prende.

A diferença entre os três docs de craft:

| Doc | Cobre |
|---|---|
| `persuasao.md` | gatilhos + storytelling de UMA peça |
| `frase-que-pega.md` | a FRASE isolada (hook, device) |
| **`pitch-narrado.md`** (este) | o ARCO de uma sequência de slides falada |

---

## Pilar 1 — O arco oscilante (Nancy Duarte, Sparkline)

O erro mais comum é o arco linear: dor → solução → fim. Sobe uma vez e morre. O pitch que
prende **oscila** entre dois estados, várias vezes:

- **"o que é"** — a realidade de hoje, a dor concreta (o vale)
- **"o que poderia ser"** — o futuro desejável (o pico)

Cada ida-e-volta entre os dois gera energia por **contraste**. O ouvinte sente a distância
entre onde está e onde poderia estar, e essa tensão é o que move. Duarte mostrou que todo
grande discurso faz isso: navega entre o que é e o que poderia ser até o ouvinte querer a
mudança.

**Como aplicar (antes de escrever slide):** mapear a oscilação. Não "slide 1, slide 2" — e
sim: onde abro no vale (dor)? onde subo pro pico (futuro)? quantas vezes oscilo antes do
fecho? Um pitch de 6-8 slides oscila 2-3 vezes. O mapa do arco vem antes da copy.

> Exemplo na voz da ImpulsoX (oscilação): vale → "São 22h, o cliente manda mensagem e
> ninguém responde." pico → "Imagina esse mesmo cliente sendo atendido na hora, sozinho."
> vale → "Hoje, a maioria das empresas só usa o ChatGPT pra perguntar coisa solta." pico →
> "A virada é a IA virar funcionário do negócio." Cada par puxa o ouvinte pra frente.

---

## Pilar 2 — A espinha estratégica (Andy Raskin, 5 passos)

O Sparkline dá o ritmo; a espinha de Raskin dá o sentido. Os 5 passos que amarram o arco
numa narrativa que vende:

1. **Abrir com a mudança grande e inegável.** Não o concorrente, não o produto: o **status
   quo que já mudou** e cria stakes. É o que faz o ouvinte sentir que ficar parado custa.
   Da ImpulsoX: a adoção de IA já virou — a maioria das PMEs já testou, mas quase ninguém
   usa de verdade. (O número exato vem do banco de provas `mercado-ia-pme-brasil`, citando a
   fonte — nunca de cabeça.)
2. **Nomear o inimigo.** O vilão é o **jeito velho**, não uma marca. Da ImpulsoX: "usar IA é
   abrir o ChatGPT e fazer uma pergunta" — o jeito velho que trava na primeira pergunta fora
   do roteiro. Nomear o inimigo une você e o ouvinte do mesmo lado.
3. **A terra prometida.** O futuro concreto e desejável que você se compromete a tornar real.
   Não é o produto — é o que a vida do dono vira. "A empresa aparece bem online e tem IA
   trabalhando dentro dela, enquanto você atende cliente."
4. **O produto como o caminho.** Só agora entra o que você faz — apresentado como o MEIO de
   chegar na terra prometida (o "presente mágico"), nunca como lista de feature. Página +
   conteúdo + IA são como o ouvinte cruza do vale pro pico.
5. **A prova de quem chegou.** Evidência real do banco (`nucleo/provas.md`). Sem caso real,
   usar prova de capacidade (portfólio) ou dado de mercado — nunca inventar número.

> A espinha conversa com o nível de consciência (`docs/persuasao.md`): a "mudança inegável"
> abre forte pra quem é consciente do problema; pra quem é mais consciente, encurtar o topo e
> ir pra terra prometida + prova.

---

## Pilar 3 — O slide de oferta (Alex Hormozi, Equação de Valor)

O slide de oferta não lista serviço. Ele mexe nos 4 fatores da **Equação de Valor**:

```
        Resultado dos Sonhos  ×  Probabilidade Percebida
Valor = ────────────────────────────────────────────────
              Tempo até o resultado  ×  Esforço
```

- **↑ Resultado dos sonhos** — pinta o que o dono realmente quer (não "uma página", e sim
  "uma empresa que o cliente confia no primeiro segundo").
- **↑ Probabilidade percebida** — vem de **prova real ou garantia de processo**, nunca de
  afirmação. É aqui que o pitch fraco quebra: promete resultado sem prova. Garantia de
  entrega (SLA) e portfólio sobem essa alavanca honestamente.
- **↓ Tempo** — o quão rápido o dono vê o primeiro ganho.
- **↓ Esforço** — done-for-you mata o esforço. "Você aprova, a IA trabalha" é alavanca de
  esforço, dita de propósito.

**A oferta vem do `/oferta` — este pilar não recalcula a equação, só ensina a APRESENTAR ela
no slide.** Um Grand Slam empilha valor até o preço parecer óbvio; no pitch ao vivo, o slide
de oferta mostra o conjunto (página + conteúdo + IA juntos), não três serviços soltos.

---

## Pilar 4 — A demo que converte (Tell-Show-Tell)

Pros slides-ponte de demo ao vivo (onde o dono alterna pro produto real rodando):

- **Abrir pelo "depois".** Antes de mostrar um clique, mostrar o resultado: "olha a página
  no ar" / "olha o post saindo pronto". O ouvinte se vê no futuro antes de ver a mecânica.
- **Tell-Show-Tell.** Dizer o valor → mostrar acontecendo → reforçar o ganho. Não narrar a
  ferramenta, narrar o que ela muda.
- **Valor, não feature.** O dono vê o GANHO, nunca o nome interno da ferramenta. "A página
  entrando no ar agora", jamais "o Claude Code rodando" (jargão que o dono de PME não
  processa).

---

## Regras inegociáveis (valem mais que qualquer técnica acima)

1. **Só oferta ATIVA.** O pitch só vende o que existe à venda hoje. Roadmap/futura/"em breve"
   fica fora — vender o que não existe expõe o cliente quando ele cobra a entrega.
2. **Prova só real, do banco.** Número, caso ou dado sai de `nucleo/provas.md` com a fonte.
   Sem prova → usar capacidade (portfólio) ou baixar a afirmação. Nunca inventar.
3. **Calma, nunca grito.** A mudança inegável e a aversão à perda entram como **constatação
   fria** ("custa caro esperar"), jamais como terror ("a IA vai te destruir"). A régua da voz
   da casa: ambição grande, entrega calma.
4. **O arco serve o ouvinte, não a empresa.** Todo slide que descreve o que a empresa FAZ em
   vez do que o ouvinte GANHA está errado — reescrever, não ajustar.
5. **O teste final:** se o dono que ouviu o pitch fechasse negócio e depois descobrisse como
   ele foi construído, continuaria confiando? Não → refazer.

---

*Fontes: Nancy Duarte, "Resonate" / Sparkline · Andy Raskin, "The Greatest Sales Deck" /
strategic narrative · Alex Hormozi, "$100M Offers" (Equação de Valor, Grand Slam) ·
frameworks de demo que convertem (Tell-Show-Tell, "show the after"). Síntese e adaptação
PT-BR à voz da ImpulsoX: ImpulsoX AI.*
````

- [ ] **Step 2: Validar conteúdo contra o spec**

Conferir (leitura, não comando):
- Os 4 pilares estão presentes e nomeados (Sparkline, Raskin 5 passos, Equação de Valor, Tell-Show-Tell)? ✓
- Cada pilar tem exemplo na voz da ImpulsoX? ✓
- Pilar 2 REFERENCIA o banco de provas pro número, não crava número cru? ✓
- Pilar 3 referencia `/oferta`, não recalcula? ✓
- Regras inegociáveis no fecho (só ativa, prova real, calma, ouvinte)? ✓
- Fontes citadas (Duarte, Raskin, Hormozi, demo)? ✓
- Tabela de fronteira (não duplica persuasao/frase-que-pega)? ✓

Expected: todos os itens presentes.

- [ ] **Step 3: Commit**

```bash
git add docs/pitch-narrado.md
git commit -m "feat(docs): pitch-narrado.md — craft do arco de pitch que converte (4 pilares)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Consertar o passo 5 da `/slides` (loop ativo + ler o doc)

**Files:**
- Modify: `.claude/skills/slides/SKILL.md:55-75` (o passo 5 inteiro)

- [ ] **Step 1: Substituir o passo 5**

Trocar o bloco atual (linhas 55-75, do "5. **Escreve a copy**" até antes de "6. **Humaniza**")
por este. O novo passo 5 LÊ o doc e roda o loop ativo; o checklist inline duplicado some (a
régua mora no doc agora).

Substituir EXATAMENTE o trecho que começa em `5. **Escreve a copy — como PITCH NARRADO` e
termina em `que fazer no Claude Code.` (linha 75) por:

````markdown
5. **Escreve a copy — loop ativo de pitch narrado (não checklist).** A régua completa do
   craft mora em `docs/pitch-narrado.md` (Sparkline, espinha de Raskin, Equação de Valor,
   demo Tell-Show-Tell) — **ler antes de escrever**. O passo não é preencher slides: é rodar
   o loop que o `/escritor-br` usa, adaptado pra pitch:

   - **a. Mapa do arco** — antes de qualquer slide, desenhar a oscilação do Sparkline (onde
     abro no vale/dor, onde subo pro pico/futuro, quantas vezes oscilo) e a espinha de Raskin
     (mudança inegável → inimigo/jeito velho → terra prometida → produto como caminho →
     prova). É o esqueleto emocional, não a tabela de slides.
   - **b. Rascunho** — escrever o pitch inteiro lido em sequência, do primeiro ao último
     slide de seguida, em voz alta na cabeça, em ~90s. NUNCA slide isolado (cada slide
     pensado só pra si gera repetição e perda de fio).
   - **c. Auto-crítica explícita** (bullets, obrigatório — não pular) — responder:
     - qual slide DESCREVE produto em vez de vender o ganho do ouvinte?
     - onde o arco fica linear (sobe e não oscila)?
     - a prova é real, tirada de `nucleo/provas.md` com fonte — ou inventada?
     - o slide de oferta mexe nos 4 fatores da Equação de Valor (sonho/probabilidade/tempo/
       esforço), ou só lista serviço?
     - algum slide vende oferta INATIVA (roadmap/futura/"em breve")? (regra dura do CLAUDE.md)
     - a aversão à perda está calma (constatação), ou virou grito?
   - **d. Reescrita** — resolver cada bullet da auto-crítica. Voltar ao mapa se o arco estiver
     quebrado.

   O fecho é sempre UM CTA de baixo atrito (o verbo do negócio: "Chama no WhatsApp"), nunca
   logo + URL. Escreve as notas do apresentador (`data-notes`) aqui: nas pontes-demo, o passo
   a passo do que fazer ao vivo (o ouvinte vê o ganho, não a ferramenta — ver Pilar 4 do doc).
````

- [ ] **Step 2: Verificar que o checklist inline some e o doc é citado**

Run:
```bash
cd "c:/Users/ACER/Desktop/ImpulsoX-OS" && grep -n "pitch-narrado" .claude/skills/slides/SKILL.md && grep -c "Headline vende o RESULTADO" .claude/skills/slides/SKILL.md
```
Expected: a 1ª linha acha `pitch-narrado.md` citado no passo 5; o `grep -c` retorna `0` (o checklist inline antigo foi removido).

- [ ] **Step 3: Atualizar a seção "Conecta sozinha" pra citar o doc**

Ler `.claude/skills/slides/SKILL.md` na seção "## Encaixe no sistema" (perto da linha 160-167)
e, na frase que lista o que a skill orquestra por baixo, acrescentar a leitura do doc. Achar a
linha que começa com `**Conecta sozinha` e acrescentar, na enumeração de apoios, a menção:
`o craft de pitch vem de `docs/pitch-narrado.md``. (Edição de uma frase — manter o resto.)

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/slides/SKILL.md
git commit -m "fix(slides): passo 5 vira loop ativo de pitch (lê pitch-narrado.md), tira checklist inline

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Encaixe de motor — CLAUDE.md + mapa-de-skills

**Files:**
- Modify: `CLAUDE.md:76-77` (lista de docs lidos) e `CLAUDE.md:211` (versão)
- Modify: `docs/mapa-de-skills.md:281` (pré-requisito da /slides)

- [ ] **Step 1: Adicionar o doc na lista de docs lidos do CLAUDE.md**

Em `CLAUDE.md`, achar a frase que termina em "...acervo de copy real que converte (molde
transfere, frase não)." (linha 77) e adicionar logo depois, antes da frase de
`modelos-mentais.md`:

```markdown
Para qualquer PITCH NARRADO (deck de `/slides`, proposta ao vivo, vídeo), ler
`docs/pitch-narrado.md` — o craft do arco que converte (Sparkline/Duarte, espinha de Raskin,
Equação de Valor/Hormozi, demo Tell-Show-Tell).
```

- [ ] **Step 2: Bump da versão no rodapé do CLAUDE.md**

Em `CLAUDE.md` linha 211, trocar:
```
*ImpulsoX-OS · produto da ImpulsoX AI · impulsoxai.com.br · v0.2.8*
```
por:
```
*ImpulsoX-OS · produto da ImpulsoX AI · impulsoxai.com.br · v0.2.9*
```

- [ ] **Step 3: Atualizar o pré-requisito da /slides no mapa**

Em `docs/mapa-de-skills.md` linha 281, trocar:
```
| /slides | /gravar-tela | **marca/ (senão: rodar /identidade antes)** |
```
por:
```
| /slides | /gravar-tela | **marca/ (senão: /identidade antes) · docs/pitch-narrado.md** |
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/mapa-de-skills.md
git commit -m "docs(motor): registra pitch-narrado.md no CLAUDE.md + mapa, bump v0.2.9

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: CHANGELOG

**Files:**
- Modify: `CHANGELOG.md` (nova entrada 0.2.9 no topo, acima de 0.2.8)

- [ ] **Step 1: Adicionar a entrada 0.2.9**

Ler `CHANGELOG.md` (as primeiras ~10 linhas até o `## [0.2.8]`) e inserir, logo acima da
linha `## [0.2.8] — 2026-06-23`, este bloco:

```markdown
## [0.2.9] — 2026-06-24

> Craft de pitch narrado: a `/slides` passou a gerar pitch fraco (auditoria do
> `revisor-marketing` reprovou — headline descrevia produto, arco vazio, prova inventada).
> Causa raiz: o passo 5 era um checklist passivo. Conserto: doc de craft novo + loop ativo.

### Adicionado
- `docs/pitch-narrado.md` — craft do ARCO de pitch que converte (o nível acima de
  `persuasao.md`/`frase-que-pega.md`). 4 pilares: Sparkline (Duarte, arco oscilante), espinha
  estratégica (Raskin, 5 passos: mudança inegável → inimigo → terra prometida → produto-caminho
  → prova), Equação de Valor (Hormozi, o slide de oferta), demo Tell-Show-Tell. Na voz da casa,
  com as regras duras (só oferta ATIVA, prova só real do banco, calma nunca grito). Lido por
  `/slides`; disponível pra `/proposta` e `/roteiro-yt`.

### Mudado
- `/slides` passo 5 — de checklist passivo pra **loop ativo** (mapa do arco → rascunho →
  auto-crítica explícita → reescrita), lendo `docs/pitch-narrado.md`. Os 4 achados que
  reprovaram o pitch viram as perguntas da auto-crítica, pegas antes do GATE 2. O bloco de
  regras inline duplicado saiu (a régua mora no doc, fonte única).
- `CLAUDE.md` — pitch-narrado.md entra na lista de docs de craft lidos.

```

- [ ] **Step 2: Verificar a ordem**

Run:
```bash
cd "c:/Users/ACER/Desktop/ImpulsoX-OS" && grep -n "^## \[0\.2\." CHANGELOG.md | head -3
```
Expected: `0.2.9` aparece ANTES de `0.2.8` (linha menor).

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): 0.2.9 — pitch-narrado.md + conserto do passo 5 da /slides

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Verificação final (o pitch reprovado passaria agora?)

**Files:** nenhum (revisão de coerência).

- [ ] **Step 1: Checar coerência ponta-a-ponta**

Ler `docs/pitch-narrado.md` e o passo 5 de `.claude/skills/slides/SKILL.md` lado a lado e
confirmar:
- As 6 perguntas da auto-crítica do passo 5 batem com os 4 pilares + regras do doc? ✓
- Os 4 achados do auditor original (descreve produto / arco linear / prova inventada / oferta
  inativa) estão TODOS cobertos por uma pergunta da auto-crítica? ✓
- Nenhuma régua do doc contradiz o `nucleo/voz.md` (calma, nunca grito)? ✓

- [ ] **Step 2: Confirmar que não sobrou referência ao checklist antigo**

Run:
```bash
cd "c:/Users/ACER/Desktop/ImpulsoX-OS" && grep -rn "Headline vende o RESULTADO\|wedge.*espinha\|Régua de pitch" .claude/skills/slides/SKILL.md
```
Expected: nenhuma saída (o checklist antigo foi 100% removido).

- [ ] **Step 3: Push**

```bash
cd "c:/Users/ACER/Desktop/ImpulsoX-OS" && git push
```
Expected: push OK pra main.

---

## Notas pro executor

- **É tudo markdown.** Não há teste unitário; "validação" = leitura do conteúdo contra o spec
  e os greps de confirmação. Não inventar testes de código.
- **Não tocar no núcleo do cliente.** As 4 pendências de ImpulsoX-AI (CRM→ativas, tirar Trial,
  prazo WhatsApp, atualizar prova de mercado) são FORA deste plano — trabalho de cliente,
  tratado depois via `/atualizar`. Este plano é só motor.
- **Voz da casa em tudo que for exemplo:** ambição grande, entrega calma. Zero grito, zero
  travessão de IA (`—`), acento correto (UTF-8).
