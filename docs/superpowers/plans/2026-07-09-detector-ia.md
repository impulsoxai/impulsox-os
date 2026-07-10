# Detector de cara-de-IA (/detectar-ia) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um script Node puro que dá um índice 0-100 "cara-de-IA" sobre um texto, aponta os trechos culpados por linha, e uma skill `/detectar-ia` que roda o script e encaminha os trechos pro `/escritor-br` afiar.

**Architecture:** `detectar-ia.mjs` calcula 3 sinais (burstiness 45% + repetição n-grama 30% + densidade de tells 25%), importando `varrerVicios`/`posicao` do `lib-humanizador.mjs` já existente (não duplica). Índice é relativo ao "chão" dos exemplares Fable. Termômetro: exit 0 sempre. Antes, `lib-humanizador.mjs` ganha os tells de substância (significance inflation, vague attribution) para o detector e o `/escritor-br` os herdarem.

**Tech Stack:** Node.js ESM (`.mjs`), `node:test`, `node:assert/strict`, zero deps novas.

---

## Estrutura de arquivos

- **Modificar** `scripts/lib-humanizador.mjs` — +2 tells de substância regexáveis na lista `VICIOS` (reaproveitados pelo detector e pelo escritor-br).
- **Modificar** `scripts/lib-humanizador.test.mjs` — +1 teste dos tells de substância.
- **Criar** `scripts/detectar-ia.mjs` — motor do índice (funções puras + CLI).
- **Criar** `scripts/detectar-ia.test.mjs` — calibração (exemplar baixo, texto-de-IA alto).
- **Criar** `.claude/skills/detectar-ia/SKILL.md` — a skill.
- **Modificar** `.claude/skills/escritor-br/SKILL.md` — +3 padrões de substância na tabela.
- **Modificar** `docs/gabarito-execucao-texto.md` — §5 aceite cita o passo `/detectar-ia`.
- **Modificar** `docs/mapa-de-skills.md` — registra `/detectar-ia`.

---

### Task 1: Tells de substância no lib-humanizador

**Files:**
- Modify: `scripts/lib-humanizador.mjs` (lista `VICIOS`, após a linha do `signposting`)
- Test: `scripts/lib-humanizador.test.mjs`

- [ ] **Step 1: Write the failing test**

Adicionar ao fim de `scripts/lib-humanizador.test.mjs` (antes da seção `// --- gate ---`):

```javascript
test("varrerVicios pega tells de substância (significance inflation, vague attribution)", () => {
  const t = "Isso marca um momento decisivo com implicações profundas. Especialistas apontam que estudos mostram o cenário cada vez mais complexo.";
  const tipos = varrerVicios(t).map((x) => x.tipo);
  assert.ok(tipos.includes("significance-inflation"));
  assert.ok(tipos.includes("vague-attribution"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-humanizador.test.mjs`
Expected: FAIL — o novo teste falha (tipos ainda não existem); os antigos passam.

- [ ] **Step 3: Write minimal implementation**

Em `scripts/lib-humanizador.mjs`, dentro do array `VICIOS`, adicionar após o item `signposting` (linha 88):

```javascript
  { tipo: "significance-inflation", re: rx("momento (?:decisivo|crucial|histórico)|implicações profundas|mudança de paradigma|cada vez mais|marco (?:importante|histórico)|ponto de inflexão") },
  { tipo: "vague-attribution", re: rx("especialistas (?:dizem|apontam|afirmam|recomendam)|estudos (?:mostram|apontam|indicam)|sabe-se que|é consenso que|pesquisas (?:mostram|indicam)|dados (?:mostram|apontam)") },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-humanizador.test.mjs`
Expected: PASS — todos os testes, incluindo o novo.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-humanizador.mjs scripts/lib-humanizador.test.mjs
git commit -m "Adiciona tells de substância (significance inflation, vague attribution) ao lib-humanizador

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Sinal de burstiness (uniformidade de frase)

**Files:**
- Create: `scripts/detectar-ia.mjs`
- Test: `scripts/detectar-ia.test.mjs`

- [ ] **Step 1: Write the failing test**

Criar `scripts/detectar-ia.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { burstiness } from "./detectar-ia.mjs";

// burstiness devolve 0-100; ALTO = mais cara-de-IA (frases uniformes).
// Mede: 100 - coef. de variação (desvio/média do nº de palavras por frase), escalado.

test("burstiness ALTO quando toda frase tem o mesmo tamanho", () => {
  const uniforme = "Um dois tres quatro cinco. Seis sete oito nove dez. Onze doze treze catorze quinze. Um dois tres quatro cinco.";
  assert.ok(burstiness(uniforme) >= 70, `esperava >=70, veio ${burstiness(uniforme)}`);
});

test("burstiness BAIXO quando o tamanho de frase varia muito", () => {
  const variado = "Curto. Uma frase bem mais longa que leva o tempo dela pra chegar no ponto e ainda continua. Meio. Curtíssima.";
  assert.ok(burstiness(variado) <= 45, `esperava <=45, veio ${burstiness(variado)}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: FAIL — `Cannot find module` ou `burstiness is not a function`.

- [ ] **Step 3: Write minimal implementation**

Criar `scripts/detectar-ia.mjs`:

```javascript
#!/usr/bin/env node
/**
 * detectar-ia.mjs — TERMÔMETRO de "cara-de-IA" (não juiz). Índice 0-100 relativo,
 * calculável em Node puro, sem baixar modelo. Aponta os trechos que vão pesar num
 * detector, pra afiar ANTES de publicar. Exit 0 SEMPRE (termômetro, não gate).
 * NÃO reproduz o score do GPTZero — a fórmula deles é fechada. ZERO deps. ImpulsoX AI.
 *
 * 3 sinais: burstiness (45%) · repetição de n-grama (30%) · densidade de tells (25%).
 * O índice só significa algo comparado ao CHÃO dos exemplares Fable.
 *
 * Uso: node scripts/detectar-ia.mjs <arquivo.md>
 */
import { readFileSync } from "node:fs";
import { varrerVicios } from "./lib-humanizador.mjs";

// tira frontmatter YAML e blocos de código antes de medir prosa
export function limparTexto(texto) {
  return texto
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "");
}

function frases(texto) {
  return texto
    .split(/[.!?]+/)
    .map((f) => f.trim())
    .filter((f) => f.split(/\s+/).filter(Boolean).length >= 2);
}

// ALTO = uniforme = cara-de-IA. 100 - coef. variação escalado.
export function burstiness(texto) {
  const fs = frases(limparTexto(texto));
  if (fs.length < 2) return 50;
  const tam = fs.map((f) => f.split(/\s+/).filter(Boolean).length);
  const media = tam.reduce((a, b) => a + b, 0) / tam.length;
  if (media === 0) return 50;
  const varia = tam.reduce((a, b) => a + (b - media) ** 2, 0) / tam.length;
  const cv = Math.sqrt(varia) / media; // coef. de variação
  // humano ~0.5-0.9; IA ~0.2-0.4. cv 0.6+ = 0 (humano); cv 0.2 = ~73.
  const indice = Math.max(0, Math.min(100, 100 - cv * 165));
  return Math.round(indice);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: PASS — os 2 testes de burstiness.
Se um limiar não bater, ajustar o multiplicador `165` (sobe → mais sensível) e re-rodar. O teste é o juiz do peso.

- [ ] **Step 5: Commit**

```bash
git add scripts/detectar-ia.mjs scripts/detectar-ia.test.mjs
git commit -m "detectar-ia: sinal de burstiness (uniformidade de frase)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Sinal de repetição de n-grama (TTR)

**Files:**
- Modify: `scripts/detectar-ia.mjs`
- Test: `scripts/detectar-ia.test.mjs`

- [ ] **Step 1: Write the failing test**

Adicionar a `scripts/detectar-ia.test.mjs`:

```javascript
import { repeticaoNgrama } from "./detectar-ia.mjs";

// ALTO = muita repetição de estrutura = cara-de-IA. Mede proporção de bi/trigramas repetidos.
test("repeticaoNgrama ALTO quando a mesma estrutura se repete", () => {
  const repetido = "a ia faz isso a ia faz aquilo a ia faz aquilo outro a ia faz mais uma coisa";
  assert.ok(repeticaoNgrama(repetido) >= 55, `esperava >=55, veio ${repeticaoNgrama(repetido)}`);
});

test("repeticaoNgrama BAIXO em texto com vocabulário variado", () => {
  const variado = "Cliente manda mensagem tarde. Ninguém responde rápido. Concorrente fecha venda. Prejuízo silencioso todo mês.";
  assert.ok(repeticaoNgrama(variado) <= 40, `esperava <=40, veio ${repeticaoNgrama(variado)}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: FAIL — `repeticaoNgrama is not a function`.

- [ ] **Step 3: Write minimal implementation**

Adicionar a `scripts/detectar-ia.mjs`:

```javascript
// normaliza pra palavras minúsculas sem pontuação
function palavras(texto) {
  return limparTexto(texto)
    .toLowerCase()
    .replace(/[^\wà-ú\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function ngramas(ps, n) {
  const out = [];
  for (let i = 0; i + n <= ps.length; i++) out.push(ps.slice(i, i + n).join(" "));
  return out;
}

// ALTO = muitos n-gramas repetidos. Média da taxa de repetição de bi e trigrama.
export function repeticaoNgrama(texto) {
  const ps = palavras(texto);
  if (ps.length < 6) return 30;
  const taxa = (n) => {
    const g = ngramas(ps, n);
    if (g.length === 0) return 0;
    const unicos = new Set(g).size;
    return 1 - unicos / g.length; // proporção de repetidos
  };
  const media = (taxa(2) + taxa(3)) / 2;
  return Math.round(Math.max(0, Math.min(100, media * 220)));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: PASS — os testes de repetição. Se não bater, ajustar o `220` e re-rodar.

- [ ] **Step 5: Commit**

```bash
git add scripts/detectar-ia.mjs scripts/detectar-ia.test.mjs
git commit -m "detectar-ia: sinal de repetição de n-grama (TTR)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Sinal de densidade de tells + índice composto

**Files:**
- Modify: `scripts/detectar-ia.mjs`
- Test: `scripts/detectar-ia.test.mjs`

- [ ] **Step 1: Write the failing test**

Adicionar a `scripts/detectar-ia.test.mjs`:

```javascript
import { densidadeTells, indice } from "./detectar-ia.mjs";

test("densidadeTells sobe com tells por palavra (usa a tabela do lib-humanizador)", () => {
  const cheio = "É importante ressaltar que no mundo atual a solução desempenha um papel fundamental. Especialistas apontam isso.";
  const limpo = "Cliente manda mensagem tarde. Ninguém responde. Concorrente fecha a venda antes.";
  assert.ok(densidadeTells(cheio) > densidadeTells(limpo));
});

test("indice combina os 3 sinais 0-100 e devolve a quebra", () => {
  const r = indice("Um dois tres quatro cinco. Seis sete oito nove dez. Onze doze treze catorze quinze.");
  assert.ok(r.total >= 0 && r.total <= 100);
  assert.ok("burstiness" in r.sinais && "ngrama" in r.sinais && "tells" in r.sinais);
});

test("indice: texto claramente de-IA pontua ALTO; humano varia pontua BAIXO", () => {
  const ia = "É importante ressaltar que a solução potencializa resultados. A ferramenta desempenha um papel fundamental. Especialistas apontam que a solução transforma processos. A solução otimiza a eficiência de forma prática.";
  const humano = "Cliente não espera. Manda no WhatsApp 22h, e se ninguém responde, amanhã comprou de outro. O agente responde na hora, no tom da sua loja. Você descobre de manhã que vendeu dormindo.";
  assert.ok(indice(ia).total > indice(humano).total, `IA ${indice(ia).total} deveria > humano ${indice(humano).total}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: FAIL — `densidadeTells is not a function`.

- [ ] **Step 3: Write minimal implementation**

Adicionar a `scripts/detectar-ia.mjs`:

```javascript
// ALTO = muitos tells por palavra. Usa a tabela regexável do lib-humanizador.
export function densidadeTells(texto) {
  const limpo = limparTexto(texto);
  const nPalavras = palavras(texto).length || 1;
  const nTells = varrerVicios(limpo).length;
  // ~1 tell a cada 25 palavras já é denso; escala pra 100.
  const porCem = (nTells / nPalavras) * 100;
  return Math.round(Math.max(0, Math.min(100, porCem * 25)));
}

const PESOS = { burstiness: 0.45, ngrama: 0.30, tells: 0.25 };

export function indice(texto) {
  const sinais = {
    burstiness: burstiness(texto),
    ngrama: repeticaoNgrama(texto),
    tells: densidadeTells(texto),
  };
  const total = Math.round(
    sinais.burstiness * PESOS.burstiness +
    sinais.ngrama * PESOS.ngrama +
    sinais.tells * PESOS.tells
  );
  return { total, sinais };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: PASS — todos. Se o teste IA>humano não bater, ajustar pesos/multiplicadores e re-rodar (o teste calibra).

- [ ] **Step 5: Commit**

```bash
git add scripts/detectar-ia.mjs scripts/detectar-ia.test.mjs
git commit -m "detectar-ia: densidade de tells + índice composto dos 3 sinais

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Trechos culpados por linha + CLI com output formatado

**Files:**
- Modify: `scripts/detectar-ia.mjs`
- Test: `scripts/detectar-ia.test.mjs`

- [ ] **Step 1: Write the failing test**

Adicionar a `scripts/detectar-ia.test.mjs`:

```javascript
import { trechosCulpados } from "./detectar-ia.mjs";

test("trechosCulpados aponta tells com linha", () => {
  const t = "Frase normal aqui.\nÉ importante ressaltar que funciona.\nOutra frase.";
  const tr = trechosCulpados(t);
  assert.ok(tr.some((x) => x.linha === 2 && /ressaltar/.test(x.motivo)));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: FAIL — `trechosCulpados is not a function`.

- [ ] **Step 3: Write minimal implementation**

Adicionar a `scripts/detectar-ia.mjs` (a função usa `varrerVicios`, que já devolve `{tipo, trecho, linha, coluna}`):

```javascript
// lista os trechos que mais pesam, por linha, pra afiar
export function trechosCulpados(texto) {
  const limpo = limparTexto(texto);
  return varrerVicios(limpo).map((v) => ({
    linha: v.linha,
    motivo: `${v.tipo}: "${v.trecho}"`,
  }));
}
```

E o bloco CLI ao fim do arquivo:

```javascript
if (import.meta.main) {
  const arquivo = process.argv[2];
  if (!arquivo) { console.error("Uso: node scripts/detectar-ia.mjs <arquivo.md>"); process.exit(1); }
  const texto = readFileSync(arquivo, "utf8");
  const r = indice(texto);
  const barra = (n) => "#".repeat(Math.round(n / 5)).padEnd(20, ".");
  const alerta = (n) => (n >= 60 ? "  <-- pesa" : "");
  console.log(`\nINDICE CARA-DE-IA: ${r.total}/100  (chao dos exemplares Fable: ~32)\n`);
  console.log(`  Burstiness .......... ${String(r.sinais.burstiness).padStart(3)}  ${barra(r.sinais.burstiness)}${alerta(r.sinais.burstiness)}`);
  console.log(`  Repeticao n-grama ... ${String(r.sinais.ngrama).padStart(3)}  ${barra(r.sinais.ngrama)}${alerta(r.sinais.ngrama)}`);
  console.log(`  Densidade de tells .. ${String(r.sinais.tells).padStart(3)}  ${barra(r.sinais.tells)}${alerta(r.sinais.tells)}`);
  const tr = trechosCulpados(texto);
  if (tr.length) {
    console.log(`\nTRECHOS QUE MAIS PESAM (afiar aqui):`);
    for (const x of tr.slice(0, 15)) console.log(`  L${String(x.linha).padStart(3)}  ${x.motivo}`);
  }
  console.log("");
  process.exit(0); // termometro: nunca trava
}
```

- [ ] **Step 4: Run test to verify it passes + smoke test no artigo real**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: PASS — todos.

Smoke test (o índice do exemplar Fable deve vir na faixa do chão, ~30-40):
Run: `node scripts/detectar-ia.mjs producao/artigos/ia-para-pequenas-empresas-o-que-faz.md`
Expected: imprime o índice + quebra + trechos, exit 0. Anotar o número real do exemplar — é o chão verdadeiro.

- [ ] **Step 5: Calibrar o "chão" real e commitar**

Se o exemplar Fable vier muito longe de ~32, ajustar o texto do CLI (`~32`) pro número real medido nos 3 exemplares (média), e conferir que texto-de-IA fica claramente acima. Rodar nos 3:
```bash
for f in ia-para-pequenas-empresas-o-que-faz ia-quanto-sobra-fim-do-mes claude-para-pequenas-empresas-o-que-significa; do node scripts/detectar-ia.mjs "producao/artigos/$f.md" | grep INDICE; done
```

```bash
git add scripts/detectar-ia.mjs scripts/detectar-ia.test.mjs
git commit -m "detectar-ia: trechos culpados por linha + CLI formatado (chão calibrado nos exemplares)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Skill /detectar-ia

**Files:**
- Create: `.claude/skills/detectar-ia/SKILL.md`

- [ ] **Step 1: Escrever a skill**

Criar `.claude/skills/detectar-ia/SKILL.md`:

```markdown
---
name: detectar-ia
description: >
  Use antes de publicar um artigo, página ou post longo pra medir quanto o texto vai
  soar de IA num detector, e ANTES de colar num GPTZero/Originality da vida. Também
  quando o usuário disser "roda o detector", "quanto dá de IA nesse texto?", "isso tá
  com cara de IA?", ou trouxer um score de detector externo preocupado. Skill de apoio.
---

# /detectar-ia — Termômetro de cara-de-IA (pré-publicação)

Roda um índice 0-100 sobre o texto e aponta os trechos que vão pesar num detector, pra
afiar ANTES de publicar. **É termômetro, não juiz** — não trava nada, informa.

> **A verdade que ancora a skill.** Detector de IA é estatisticamente não-confiável:
> falso-positivo alto (a Bíblia e a Declaração de Independência são flagradas como IA),
> a OpenAI desligou o próprio detector. Escrita BOA e clara pontua parecido com IA. Então
> o alvo NUNCA é "zerar o detector" — é o texto ser bom, específico e com a voz da marca.
> O índice é um **termômetro relativo**: só significa algo comparado ao chão dos
> exemplares Fable (~32). Perto do chão = bom. Perseguir zero é diluir texto bom.

## Como roda

1. Salvar o texto num arquivo (se só existe no chat, jogar no scratchpad).
2. Rodar: `node scripts/detectar-ia.mjs <arquivo>`
3. Ler o índice + a quebra por sinal + os trechos culpados por linha.
4. **Se o índice está acima do chão +15** (ex.: > ~47): pegar os trechos apontados e
   mandar pro `/escritor-br` afiar SÓ esses trechos (não reescrever o texto todo).
5. Re-rodar pra confirmar que caiu. Repetir até chegar perto do chão OU até sobrar só
   especificidade humana (número, nome, cena) que não se deve diluir.

## A régua (anti-perseguição de zero)

- **Não diluir o específico pra baixar número.** Número exato, nome próprio, cena
  concreta são HUMANOS, não tell — o `/escritor-br` chama isso de freio de falso-positivo.
  Se o que sobra pesando é especificidade, o texto está pronto mesmo com índice médio.
- **Burstiness alto** → o `/escritor-br` quebra o ritmo (frase curta depois de longa).
- **Densidade de tells alta** → cortar os tells apontados (a tabela do escritor-br cobre).
- **Repetição de n-grama alta** → variar a construção que se repete.

## O que NÃO é

- Não reescreve (isso é o `/escritor-br`).
- Não trava publicação (o gate duro que trava é o `lib-humanizador.mjs`, dentro do escritor-br).
- Não reproduz o número do GPTZero (fórmula fechada; isto é um proxy relativo honesto).

---

**✓ Pronto:** índice de cara-de-IA medido + trechos apontados · **↩ esta é uma skill de apoio:** o próximo passo é o `/escritor-br` afiar os trechos que pesam; depois re-rodar aqui pra confirmar. O gate frio final continua sendo o `/revisar`.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/detectar-ia/SKILL.md
git commit -m "Skill /detectar-ia: termômetro de cara-de-IA que encaminha trechos pro /escritor-br

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Fiar nos docs (escritor-br, gabarito, mapa)

**Files:**
- Modify: `.claude/skills/escritor-br/SKILL.md` (tabela de vícios)
- Modify: `docs/gabarito-execucao-texto.md` (§5 aceite)
- Modify: `docs/mapa-de-skills.md`

- [ ] **Step 1: +3 padrões de substância na tabela do escritor-br**

Em `.claude/skills/escritor-br/SKILL.md`, ao fim da tabela de vícios (após a linha do "Trio adjetival", antes do parêntese que fecha), adicionar 3 linhas:

```markdown
| ★ Significance inflation: "momento decisivo", "implicações profundas", "cada vez mais" (inflar importância vazia) | Cortar; se importa, o fato já mostra. Dizer o que muda de concreto |
| ★ Vague attribution: "especialistas dizem", "estudos mostram" sem fonte nomeada | Nomear a fonte com data, ou cortar a frase (regra de FATO-com-fonte do gabarito) |
| ★ Superficial analysis: parágrafo que parece analisar mas só reafirma o óbvio | Cortar ou trocar por 1 detalhe concreto que o leitor não sabia |
```

- [ ] **Step 2: §5 aceite do gabarito-texto cita o /detectar-ia**

Em `docs/gabarito-execucao-texto.md`, na seção `## 5. Aceite`, adicionar um item 7 ao fim da lista:

```markdown
7. Para ARTIGO/PÁGINA: passou pelo `/detectar-ia` (termômetro) e o índice está perto do
   chão dos exemplares, OU o que sobra pesando é só especificidade humana (número, nome,
   cena) que não se deve diluir. Termômetro, não gate: índice alto manda afiar, não trava.
```

- [ ] **Step 3: Registrar no mapa de skills**

Em `docs/mapa-de-skills.md`, na tabela de fluxo, adicionar `/detectar-ia` como skill de apoio (pré-requisito degrau 0, chamada pelo fluxo de conteúdo antes de publicar). Seguir o formato exato das linhas vizinhas de skills de apoio (checar como `/escritor-br` e `/revisar` estão listadas e imitar coluna a coluna).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/escritor-br/SKILL.md docs/gabarito-execucao-texto.md docs/mapa-de-skills.md
git commit -m "Fia o /detectar-ia: 3 padrões de substância no escritor-br, passo no aceite do gabarito, registro no mapa

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Memória de replicação no template

**Files:**
- Create: `C:\Users\ACER\.claude\projects\c--Users-ACER-Desktop-ImpulsoX-AI\memory\detector-ia-skill.md`
- Modify: `C:\Users\ACER\.claude\projects\c--Users-ACER-Desktop-ImpulsoX-AI\memory\MEMORY.md`

- [ ] **Step 1: Escrever a memória**

Criar o arquivo de memória com frontmatter (type: project), registrando: a skill `/detectar-ia` + `scripts/detectar-ia.mjs`/`.test.mjs` + os 2 tells de substância no `lib-humanizador.mjs` + os 3 padrões no `/escritor-br` nasceram no clone e precisam subir pro template via `/atualizar-motor`. Nota-chave: é termômetro relativo, NÃO reproduz score de detector externo (decisão de design ancorada em pesquisa).

- [ ] **Step 2: Ponteiro no MEMORY.md**

Adicionar 1 linha ao `MEMORY.md`:
```markdown
- [Skill /detectar-ia](detector-ia-skill.md) — termômetro de cara-de-IA (índice relativo, não score de detector); replicar no template
```

- [ ] **Step 3: Rodar a suíte inteira de detecção como aceite final**

Run: `node --test scripts/detectar-ia.test.mjs scripts/lib-humanizador.test.mjs`
Expected: PASS — tudo verde. Confirma que o detector e o humanizador (com os tells novos) estão íntegros juntos.

(Memória não vai pro git — é do usuário. Sem commit neste passo.)

---

## Ordem e dependências

Task 1 (tells no lib-humanizador) vem primeiro — o detector importa `varrerVicios` já com os tells novos. Tasks 2→3→4→5 constroem o script em TDD (um sinal por vez, índice, CLI). Task 6 é a skill. Task 7 fia nos docs. Task 8 memória + aceite final. Cada task commita sozinha.
