# Camada de Funil na /roteiro-yt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar à /roteiro-yt a capacidade de classificar o vídeo em topo/meio/fundo de funil e calibrar pacote+roteiro por estágio, sem reescrever o que já faz.

**Architecture:** Mudança 100% em `.claude/skills/roteiro-yt/SKILL.md` (skill é texto/processo, sem código). Adiciona um passo novo (inferir+confirmar estágio) e enxerta a régua de funil nos passos existentes (pacote, hook, CTA, prova). A memória `funil-conteudo-video` é a fonte de dados que o SKILL.md resume.

**Tech Stack:** Markdown (SKILL.md). Sem código, sem teste de unidade — verificação por leitura/grep do arquivo.

---

## File Structure

- Modify: `.claude/skills/roteiro-yt/SKILL.md` — único arquivo. Recebe: (1) novo "Passo 0 —
  Estágio de funil" após a Pré-checagem; (2) régua de calibração por estágio enxertada nos passos
  de pacote (Passo 2) e corpo/hook (Passos 4-5); (3) salvaguarda fundo→meio nas Regras; (4) nota
  do mix 60-30-10 nas Regras.

> **Por que sem teste:** SKILL.md é um prompt/processo lido pela IA, não uma função pura. A
> verificação é: o texto está presente, coerente, e não contradiz o resto. Cada task termina com
> um grep/leitura que confirma o conteúdo inserido. Render/execução real da skill é validada pelo
> dono usando-a depois (fora do plano).

---

### Task 1: Passo 0 — inferir e confirmar o estágio de funil

**Files:**
- Modify: `.claude/skills/roteiro-yt/SKILL.md` (inserir após a Pré-checagem, linha ~37, antes de "## Passo 1")

- [ ] **Step 1: Inserir o passo novo**

Localizar o fim da Pré-checagem (o item "3. **Long-form ou short?** … (ver abaixo)." na linha ~36-37)
e inserir DEPOIS dele, antes de "## Passo 1 — Ler os moldes", este bloco:

```markdown

## Passo 0 — Estágio de funil (inferir e confirmar)

Antes de escrever, definir em que momento da jornada o vídeo entra — topo, meio ou fundo de
funil. Roteiro de topo e de fundo são DIFERENTES; sem isso, todo vídeo sai com o mesmo molde e
ou só atrai sem vender, ou vende cedo e espanta. (Base de dados: pesquisa de funil de vídeo
2026 — resumida abaixo.)

**Inferir do tema, depois confirmar com o dono** (ele pode não conhecer o conceito — explicar
em 1 linha):

- **TOPO (descoberta)** — tema é dor ampla / curiosidade / "os erros que…", sem oferta nem
  prova. Job: atrair quem nem sabe do problema. Ex.: "3 erros que travam seu resultado".
- **MEIO (consideração)** — tema é "como funciona", "passo a passo", "X ou Y?", comparação,
  bastidores. Job: construir confiança. Ex.: "Como funciona o atendimento, passo a passo".
- **FUNDO (conversão)** — tema é prova / oferta / "antes e depois" / case com número /
  depoimento. Job: converter. Ex.: "Cliente saiu de X e chegou em Y — veja como".

Apresentar assim (exemplo): *"Esse tema parece **TOPO** — atrai quem nem sabe do problema,
sem chamar pra comprar. Confirma, ou é meio/fundo?"*. O dono confirma ou corrige.

> Escada de Contexto: se um dia o tema vier do `/tema-yt` já com o estágio marcado, usar a
> marca. Por ora o `/tema-yt` não marca — então sempre inferir e confirmar aqui.
```

- [ ] **Step 2: Verificar a inserção**

Run: `grep -n "Passo 0 — Estágio de funil" .claude/skills/roteiro-yt/SKILL.md`
Expected: 1 linha (o cabeçalho do passo), posicionada ANTES de "## Passo 1".

Run: `grep -n "^## Passo" .claude/skills/roteiro-yt/SKILL.md | head -3`
Expected: "Passo 0" aparece antes de "Passo 1" e "Passo 2" (ordem correta).

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/roteiro-yt/SKILL.md
git commit -m "feat(roteiro-yt): Passo 0 — inferir e confirmar estágio de funil"
```

---

### Task 2: Régua de calibração por estágio (pacote + roteiro)

**Files:**
- Modify: `.claude/skills/roteiro-yt/SKILL.md` (inserir uma subseção logo após o Passo 0 criado na Task 1)

- [ ] **Step 1: Inserir a tabela de calibração**

Imediatamente APÓS o bloco do Passo 0 (depois da linha "...sempre inferir e confirmar aqui.") e
ANTES de "## Passo 1", inserir:

```markdown

### Como o estágio calibra o pacote e o roteiro

Depois de definido o estágio, ele é a lente que ajusta os próximos passos (hook do Passo 5, CTA
do Passo 4, prova, duração). A régua (pesquisa 2026):

| | TOPO | MEIO | FUNDO |
|---|---|---|---|
| **Hook** | trend / dor relatável / opinião forte | promessa de aprender ("passo a passo", "como eu faço") | prova / oferta ("antes e depois", "ela usou e…") |
| **CTA** | NENHUM ou só "salva/segue" — não pede compra | leve ("quer o guia?", link, e-mail) | DIRETO (agende, compre, link na bio, urgência real) |
| **Tom** | não-promocional, entreter/educar | útil, sem empurrar | promocional assumido + reasseguramento |
| **Duração** | curtíssimo (short 15-60s, foco nos 3 primeiros segundos) | mais longo (tutorial 3-15min) | médio (demo/case 30s-2min, ou walkthrough 10-15min) |
| **Prova** | quase nenhuma | social proof leve, bastidores | PESADA (depoimento, antes/depois com número) |
| **De onde vem o conteúdo** | dor do cliente: `nucleo/perfil.md`, `nucleo/voz.md`, dor em `nucleo/negocio.md` | expertise: diferenciais em `nucleo/negocio.md`, objeções em `nucleo/ofertas.md` | oferta ATIVA em `nucleo/ofertas.md` + prova em `nucleo/provas.md` |

Regra-mãe: **topo = dor do cliente · meio = expertise do negócio · fundo = oferta + prova.**
Aplicar essa lente quando montar o pacote (Passo 2), o hook (Passo 5) e o CTA (Passo 4).
```

- [ ] **Step 2: Verificar**

Run: `grep -n "topo = dor do cliente" .claude/skills/roteiro-yt/SKILL.md`
Expected: 1 linha (a regra-mãe).

Run: `grep -c "TOPO\|MEIO\|FUNDO" .claude/skills/roteiro-yt/SKILL.md`
Expected: ≥4 (cabeçalho do Passo 0 + linhas da tabela).

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/roteiro-yt/SKILL.md
git commit -m "feat(roteiro-yt): régua de calibração de pacote/roteiro por estágio de funil"
```

---

### Task 3: Amarrar a lente de funil nos passos de pacote e hook

**Files:**
- Modify: `.claude/skills/roteiro-yt/SKILL.md` (Passo 2 ~linha 52, Passo 5 ~linha 110)

- [ ] **Step 1: Enxertar referência ao funil no Passo 2 (pacote)**

No "## Passo 2 — Pacote primeiro-rascunho", localizar a primeira frase do corpo (a que começa
"O clique vem antes de tudo:") e inserir, como NOVA frase no fim desse primeiro parágrafo, antes
da lista numerada:

```markdown

> Calibrar pela lente do Passo 0: no **topo**, o pacote promete descoberta/curiosidade (sem
> oferta); no **meio**, promete aprendizado concreto; no **fundo**, promete prova/resultado e
> pode nomear a oferta.
```

- [ ] **Step 2: Enxertar referência ao funil no Passo 5 (hook)**

No "## Passo 5 — Escrever a abertura", localizar o início do corpo e inserir, logo após o
primeiro parágrafo/linha de abertura do passo, esta nota:

```markdown

> O TIPO de hook vem do estágio (Passo 0): topo = dor relatável / curiosidade / opinião forte;
> meio = promessa de aprender; fundo = prova ou oferta. Não usar hook de venda em vídeo de topo.
```

- [ ] **Step 3: Verificar**

Run: `grep -n "lente do Passo 0\|TIPO de hook vem do estágio" .claude/skills/roteiro-yt/SKILL.md`
Expected: 2 linhas (uma no Passo 2, uma no Passo 5).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/roteiro-yt/SKILL.md
git commit -m "feat(roteiro-yt): amarra a lente de funil no pacote (P2) e no hook (P5)"
```

---

### Task 4: Salvaguarda fundo→meio + nota do mix 60-30-10 (nas Regras)

**Files:**
- Modify: `.claude/skills/roteiro-yt/SKILL.md` (seção "## Regras", ~linha 248)

- [ ] **Step 1: Adicionar as 2 regras**

Na seção "## Regras" (perto do fim do arquivo), adicionar estes dois itens à lista de regras
(no mesmo formato de bullet `- **...**` dos itens existentes):

```markdown
- **Fundo sem prova autorizada vira meio.** Vídeo de FUNDO precisa de prova real e AUTORIZADA
  (`nucleo/provas.md`) e de oferta ATIVA (`nucleo/ofertas.md`). Sem prova autorizada, NÃO
  inventar depoimento/número — avisar o dono e roteirizar como MEIO ("não há prova autorizada
  pra sustentar um vídeo de fundo; vou como meio, que constrói confiança sem prometer caso que
  não posso provar"). Peça pública só usa prova autorizada e só vende oferta ATIVA (CLAUDE.md).
- **Mix de funil (orientação, não trava):** a régua de partida é **60% topo / 30% meio / 10%
  fundo** (piso 40% topo, ao menos 1 fundo por ciclo). O erro comum do mercado é falta de fundo
  (só ~14% dos criadores fazem fundo) — não excesso de venda. Lembrar isso ao dono quando ele
  só pedir vídeos de topo. (O `/calendario` ainda não distribui o mix — por ora é só nota; é
  suposição a calibrar com performance real.)
```

- [ ] **Step 2: Verificar**

Run: `grep -n "Fundo sem prova autorizada vira meio\|Mix de funil" .claude/skills/roteiro-yt/SKILL.md`
Expected: 2 linhas.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/roteiro-yt/SKILL.md
git commit -m "feat(roteiro-yt): salvaguarda fundo→meio sem prova + nota do mix 60-30-10"
```

---

### Task 5: Atualizar a descrição da skill e o mapa de skills

**Files:**
- Modify: `.claude/skills/roteiro-yt/SKILL.md` (frontmatter `description`, linhas 3-8)
- Modify: `docs/mapa-de-skills.md` (linha da esteira YouTube, ~linha 84-88)

- [ ] **Step 1: Mencionar funil na description da skill**

No frontmatter (a `description:` multilinha no topo do SKILL.md), acrescentar ao fim da
descrição, antes do fecho: ` Classifica o vídeo por estágio de funil (topo/meio/fundo) e
calibra hook, CTA e prova por estágio.`

(Inserir como continuação natural da frase existente, sem quebrar o YAML — manter dentro do
bloco `>` da description.)

- [ ] **Step 2: Anotar o funil na esteira YouTube do mapa**

Em `docs/mapa-de-skills.md`, na seção "## A esteira de YOUTUBE", localizar a linha que descreve
a `/roteiro-yt` (a que diz "copia fórmula de quem performa") e acrescentar ao fim dela:
` + classifica o vídeo por funil (topo/meio/fundo) e ajusta hook/CTA/prova`.

- [ ] **Step 3: Verificar**

Run: `grep -n "estágio de funil\|por funil" .claude/skills/roteiro-yt/SKILL.md docs/mapa-de-skills.md`
Expected: pelo menos 2 linhas (uma em cada arquivo).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/roteiro-yt/SKILL.md docs/mapa-de-skills.md
git commit -m "docs(roteiro-yt): menciona funil na description da skill e no mapa"
```

---

## Self-Review (preenchido)

**Spec coverage:**
- Passo "Estágio de funil" (inferir+confirmar) → Task 1. ✓
- Calibra pacote+roteiro por estágio (tabela hook/CTA/tom/duração/prova/fonte) → Task 2 + Task 3
  (amarração nos passos reais). ✓
- Salvaguarda fundo→meio sem prova autorizada → Task 4. ✓
- Nota do mix 60-30-10 → Task 4. ✓
- "O que NÃO muda" (retenção/pacote/voz intactos) → garantido: as tasks só INSEREM, não removem
  nada dos passos existentes. ✓
- Description + mapa → Task 5. ✓

**Placeholder scan:** nenhum "TBD/TODO". Todos os blocos a inserir estão escritos por extenso.

**Type consistency:** termos consistentes em todas as tasks — "Passo 0", "TOPO/MEIO/FUNDO",
"topo = dor do cliente · meio = expertise · fundo = oferta + prova", caminhos de núcleo
(`nucleo/perfil.md`, `nucleo/voz.md`, `nucleo/negocio.md`, `nucleo/ofertas.md`, `nucleo/provas.md`).

**Resolvido:** typo "bia"→"bio" (link na bio) corrigido na tabela da Task 2.
