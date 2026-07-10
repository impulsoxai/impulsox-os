# Enxerto das 5 ideias do /humanizar na nossa detecção — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enxertar 5 detecções que a skill `/humanizar` (de outra IA) tem e a nossa não, na nossa base mais robusta, sem trair a voz (nada de "pra/tá"), mantendo tudo que já funciona.

**Architecture:** A nossa base (`lib-humanizador.mjs` + `detectar-ia.mjs`) ganha: (1) JSON externo de tells simples, (2) tell "não é X, é Y", (3) trio geral de substantivos, no `lib-humanizador.mjs`; (4) sinal de abertura de parágrafo uniforme como 4º sinal do índice em `detectar-ia.mjs`. O 5º item (score com aprovação) já existe como nosso índice relativo — não se importa o 85 arbitrário. Índice vira 4 sinais → re-calibrar chão + teste-guarda.

**Tech Stack:** Node.js ESM (`.mjs`), `node:test`, zero deps novas. JSON de dados lido com `readFileSync`.

---

## Estrutura de arquivos

- **Criar** `scripts/tells-ptbr.json` — lista editável de tells simples (dados, não código).
- **Modificar** `scripts/lib-humanizador.mjs` — ler o JSON e montar regex com fronteiras B0/B1 (acento-safe); +tell "nao-e-x-e-y"; +trio geral.
- **Modificar** `scripts/lib-humanizador.test.mjs` — testes dos novos tells + do carregamento do JSON.
- **Modificar** `scripts/detectar-ia.mjs` — +sinal `aberturaUniforme`; índice vira 4 sinais; re-calibrar chão.
- **Modificar** `scripts/detectar-ia.test.mjs` — teste do novo sinal + ajuste do teste-guarda.

---

### Task 1: JSON externo de tells (migração acento-safe)

**Files:**
- Create: `scripts/tells-ptbr.json`
- Modify: `scripts/lib-humanizador.mjs`
- Test: `scripts/lib-humanizador.test.mjs`

- [ ] **Step 1: Criar o JSON de dados**

Criar `scripts/tells-ptbr.json`. Ele carrega SÓ os tells "simples" (lista de alternativas que viram um `rx(a|b|c)`). Os tells compostos (gerúndio encadeado, hedging enfileirado, trio, artefato-chat) ficam no código porque precisam de lógica além de alternância.

```json
{
  "_comentario": "Tells simples de IA em PT-BR (lista editável, sem tocar código). Cada item vira um regex acento-safe. Tells compostos (gerúndio encadeado, hedging, trio, nao-e-x-e-y) ficam no lib-humanizador.mjs porque precisam de lógica. peso/limite: ver limites.",
  "tells_simples": {
    "e-importante-ressaltar": "é importante (?:ressaltar|destacar|frisar|notar)|vale (?:ressaltar|destacar|lembrar|notar)",
    "vale-destacar-2025": "nesse sentido|sendo assim|é válido (?:destacar|ressaltar)",
    "mundo-atual": "no mundo (?:atual|de hoje)|nos dias de hoje|na era digital|no cenário atual",
    "nao-apenas-mas": "não (?:é|são|se trata de?) apenas [^.!?\\n]{1,60}, mas",
    "papel-fundamental": "desempenham? um papel (?:fundamental|crucial|essencial|importante)",
    "em-suma": "em suma|em resumo",
    "corporates": "potencializar|alavancar|robust[oa]s?",
    "de-forma-adverbial": "de forma (?:eficaz|eficiente|simples|prática|rápida|assertiva)",
    "imagine-explore": "imagine que|vamos explorar|mergulhe",
    "copula-evitada": "serve como|se destaca como|se configura como|atua como uma?",
    "signposting": "a seguir,? veremos|neste artigo (?:você|vamos)|nesta seção",
    "significance-inflation": "momento (?:decisivo|crucial|histórico)|implicações profundas|mudança de paradigma|cada vez mais|marco (?:importante|histórico)|ponto de inflexão",
    "vague-attribution": "especialistas (?:dizem|apontam|afirmam|recomendam)|estudos (?:mostram|apontam|indicam)|sabe-se que|é consenso que|pesquisas (?:mostram|indicam)|dados (?:mostram|apontam)"
  },
  "limites": {
    "max_trio_por_300_palavras": 1,
    "max_pct_paragrafos_com_conector": 25
  }
}
```

- [ ] **Step 2: Write the failing test**

Adicionar a `scripts/lib-humanizador.test.mjs` (antes de `// --- gate ---`):

```javascript
test("VICIOS simples são carregados do tells-ptbr.json (não hardcoded)", () => {
  // se o JSON alimenta os tells, os clássicos continuam pegando
  const t = "É importante ressaltar que no mundo atual isso importa. Em resumo, funciona.";
  const tipos = varrerVicios(t).map((x) => x.tipo);
  assert.ok(tipos.includes("e-importante-ressaltar"));
  assert.ok(tipos.includes("mundo-atual"));
  assert.ok(tipos.includes("em-suma"));
});
```

Este teste JÁ passa hoje (hardcoded), mas serve de rede: depois da migração ele DEVE continuar verde. Rodar `node --test scripts/lib-humanizador.test.mjs` e confirmar verde ANTES de mexer.

- [ ] **Step 3: Migrar o código pra ler o JSON**

Em `scripts/lib-humanizador.mjs`, no topo adicionar os imports:

```javascript
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
```

(nota: `readFileSync` já está importado no arquivo — não duplicar; conferir a linha 18 original e reusar.)

Depois da definição de `rx` (linha ~71), adicionar o carregamento:

```javascript
const __dirname_lib = dirname(fileURLToPath(import.meta.url));
const TELLS_JSON = JSON.parse(readFileSync(join(__dirname_lib, "tells-ptbr.json"), "utf8"));
export const LIMITES = TELLS_JSON.limites;

// tells simples vêm do JSON, montados com as fronteiras acento-safe da casa
const VICIOS_SIMPLES = Object.entries(TELLS_JSON.tells_simples).map(([tipo, corpo]) => ({
  tipo,
  re: rx(corpo),
}));
```

Depois, no array `VICIOS`, REMOVER os 13 itens simples (de `e-importante-ressaltar` até `vague-attribution`, linhas 78-90) e substituir por um spread do `VICIOS_SIMPLES`, mantendo os compostos:

```javascript
const VICIOS = [
  ...VICIOS_SIMPLES,
  { tipo: "artefato-chat", re: new RegExp(`(?:^|\\n)\\s*claro[!,]|${B0}(?:ótima pergunta|espero que (?:ajude|tenha ajudado)|quer que eu)${B1}`, "gi") },
  { tipo: "gerundio-encadeado", re: new RegExp(`${B0}(?:${GERUNDIOS})${B1}[^.!?\\n]{1,120}${B0}(?:${GERUNDIOS})${B1}`, "gi") },
  { tipo: "hedging-enfileirado", re: new RegExp(`${B0}(?:${HEDGES})${B1}[^.!?\\n]{1,100}${B0}(?:${HEDGES})${B1}`, "gi") },
  { tipo: "trio-adjetival", re: new RegExp(`${B0}${ADJ}${B1},\\s*${ADJ}${B1}\\s+e\\s+${ADJ}${B1}`, "gi") },
];
```

- [ ] **Step 4: Run tests**

Run: `node --test scripts/lib-humanizador.test.mjs`
Expected: PASS — TODOS os testes antigos + o novo. A migração é transparente (mesmos tipos, mesmos regex, só a origem mudou).

- [ ] **Step 5: Commit**

```bash
git add scripts/tells-ptbr.json scripts/lib-humanizador.mjs scripts/lib-humanizador.test.mjs
git commit -m "lib-humanizador: tells simples migram pra tells-ptbr.json (editável sem tocar código, acento-safe mantido)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Tell "não é X, é Y" (padrão que o Fable adora)

**Files:**
- Modify: `scripts/lib-humanizador.mjs`
- Test: `scripts/lib-humanizador.test.mjs`

- [ ] **Step 1: Write the failing test**

Adicionar a `scripts/lib-humanizador.test.mjs`:

```javascript
test("varrerVicios pega 'não é X, é Y' (padrão retórico do Fable/Opus)", () => {
  const t = "Isso não é uma ferramenta, é uma mudança de hábito. O resto é detalhe.";
  const tipos = varrerVicios(t).map((x) => x.tipo);
  assert.ok(tipos.includes("nao-e-x-e-y"));
});

test("'não é X, é Y' NÃO dispara em negação comum", () => {
  const t = "Não é caro. O preço cabe no bolso.";
  const tipos = varrerVicios(t).map((x) => x.tipo);
  assert.ok(!tipos.includes("nao-e-x-e-y"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-humanizador.test.mjs`
Expected: FAIL — o primeiro novo falha (tipo não existe).

- [ ] **Step 3: Implementar o tell composto**

Em `scripts/lib-humanizador.mjs`, adicionar ao array `VICIOS` (depois de `trio-adjetival`):

```javascript
  // "não é X, é Y" / "não é X, mas Y" — padrão retórico que Fable/Opus adora.
  // Exige o segundo verbo pra não pegar negação comum ("não é caro.").
  { tipo: "nao-e-x-e-y", re: new RegExp(`${B0}não (?:é|são|se trata de)${B1}[^.!?\\n]{2,50},\\s*(?:é|são|mas)${B1}`, "gi") },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-humanizador.test.mjs`
Expected: PASS — ambos os novos (pega o padrão; não pega negação comum).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-humanizador.mjs scripts/lib-humanizador.test.mjs
git commit -m "lib-humanizador: tell 'não é X, é Y' (padrão retórico do Fable/Opus)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Trio geral de substantivos (amplia o trio-adjetival)

**Files:**
- Modify: `scripts/lib-humanizador.mjs`
- Test: `scripts/lib-humanizador.test.mjs`

- [ ] **Step 1: Write the failing test**

Adicionar a `scripts/lib-humanizador.test.mjs`:

```javascript
test("varrerVicios pega trio geral de substantivos 'X, Y e Z'", () => {
  const t = "A ferramenta cobra fatura, organiza contato e resume contrato numa tarde.";
  const tipos = varrerVicios(t).map((x) => x.tipo);
  assert.ok(tipos.includes("trio-geral"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-humanizador.test.mjs`
Expected: FAIL — tipo `trio-geral` não existe.

- [ ] **Step 3: Implementar**

Em `scripts/lib-humanizador.mjs`, adicionar ao `VICIOS` (depois de `nao-e-x-e-y`):

```javascript
  // trio geral "A, B e C" (item de 1-3 palavras cada). Primo do trio-adjetival, mais amplo.
  // Cuidado: só conta ocorrência; a régua de excesso (por 300 palavras) é da skill /detectar-ia.
  { tipo: "trio-geral", re: new RegExp(`${B0}[\\wà-úÀ-Ú]+(?:\\s+[\\wà-úÀ-Ú]+){0,2},\\s*[\\wà-úÀ-Ú]+(?:\\s+[\\wà-úÀ-Ú]+){0,2}\\s+e\\s+[\\wà-úÀ-Ú]+`, "gi") },
```

- [ ] **Step 4: Run test to verify it passes + não quebra o texto humano**

Run: `node --test scripts/lib-humanizador.test.mjs`
Expected: PASS todos. IMPORTANTE: rodar também o teste "varrerVicios NÃO dispara em texto humano normal" (já existe) — se ele quebrar porque o trio-geral é agressivo demais, apertar o regex (reduzir `{0,2}` pra `{0,1}`). O trio é comum; melhor pegar menos e certo.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-humanizador.mjs scripts/lib-humanizador.test.mjs
git commit -m "lib-humanizador: trio geral de substantivos (amplia o trio-adjetival)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Sinal de abertura de parágrafo uniforme (4º sinal do índice)

**Files:**
- Modify: `scripts/detectar-ia.mjs`
- Test: `scripts/detectar-ia.test.mjs`

- [ ] **Step 1: Write the failing test**

Adicionar a `scripts/detectar-ia.test.mjs` (import no topo + testes no fim):

```javascript
import { aberturaUniforme } from "./detectar-ia.mjs";

test("aberturaUniforme ALTO quando parágrafos abrem com conector/mesma palavra", () => {
  const t = "Além disso, a IA ajuda muito no trabalho diário.\n\nAlém disso, ela organiza os arquivos da empresa.\n\nAlém disso, o sistema cobra os clientes que atrasam.";
  assert.ok(aberturaUniforme(t) >= 50, `esperava >=50, veio ${aberturaUniforme(t)}`);
});

test("aberturaUniforme BAIXO quando cada parágrafo abre diferente", () => {
  const t = "Cliente manda mensagem tarde da noite.\n\nNinguém responde antes das oito.\n\nO concorrente fecha a venda primeiro.\n\nR$ 3 mil escapam sem ninguém ver.";
  assert.ok(aberturaUniforme(t) <= 30, `esperava <=30, veio ${aberturaUniforme(t)}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: FAIL — `aberturaUniforme is not a function`.

- [ ] **Step 3: Implementar**

Em `scripts/detectar-ia.mjs`, importar os limites do lib e adicionar a função (antes de `indice`):

```javascript
import { varrerVicios, LIMITES } from "./lib-humanizador.mjs";
```
(ajustar o import existente de `varrerVicios` pra incluir `LIMITES`.)

```javascript
const CONECTORES = ["além disso","adicionalmente","por outro lado","no entanto","entretanto","portanto","dessa forma","desse modo","assim","por fim","finalmente","primeiramente","em primeiro lugar","por sua vez","ademais"];

// parágrafos = blocos separados por linha em branco
function paragrafos(texto) {
  return limparTexto(texto).split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.split(/\s+/).length >= 4);
}

// ALTO = muitos parágrafos abrindo igual (conector, ou mesma 1ª palavra) = cara-de-IA.
export function aberturaUniforme(texto) {
  const ps = paragrafos(texto);
  if (ps.length < 3) return 20;
  const comConector = ps.filter((p) => CONECTORES.some((c) => p.toLowerCase().startsWith(c))).length;
  const pctConector = (comConector / ps.length) * 100;
  // 1ª palavra repetida em 3+ parágrafos
  const primeiras = {};
  for (const p of ps) {
    const w = p.split(/\s+/)[0].toLowerCase().replace(/[^\wà-ú]/g, "");
    if (w.length >= 2) primeiras[w] = (primeiras[w] || 0) + 1;
  }
  const maxRepetida = Math.max(0, ...Object.values(primeiras));
  const penalRepeticao = maxRepetida >= 3 ? 40 : 0;
  const penalConector = Math.min(60, Math.max(0, pctConector - LIMITES.max_pct_paragrafos_com_conector) * 2);
  return Math.round(Math.min(100, penalConector + penalRepeticao));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: PASS os 2 novos. Se um limiar não bater, ajustar os multiplicadores (`2`, o `40`) e re-rodar.

- [ ] **Step 5: Commit**

```bash
git add scripts/detectar-ia.mjs scripts/detectar-ia.test.mjs
git commit -m "detectar-ia: sinal de abertura de parágrafo uniforme (% conector + 1ª palavra repetida)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Índice vira 4 sinais + re-calibrar chão

**Files:**
- Modify: `scripts/detectar-ia.mjs`
- Test: `scripts/detectar-ia.test.mjs`

- [ ] **Step 1: Write the failing test**

Atualizar em `scripts/detectar-ia.test.mjs` o teste "indice combina os 3 sinais" pra 4 sinais:

```javascript
test("indice combina os 4 sinais 0-100 e devolve a quebra", () => {
  const r = indice("Um dois tres quatro cinco. Seis sete oito nove dez. Onze doze treze catorze quinze.");
  assert.ok(r.total >= 0 && r.total <= 100);
  assert.ok("burstiness" in r.sinais && "ngrama" in r.sinais && "tells" in r.sinais && "abertura" in r.sinais);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: FAIL — `"abertura" in r.sinais` é falso.

- [ ] **Step 3: Ajustar os pesos e o índice**

Em `scripts/detectar-ia.mjs`, atualizar `PESOS` e `indice` pra incluir abertura. Novos pesos (burstiness continua dominante; abertura entra leve, tira dos outros proporcionalmente):

```javascript
const PESOS = { burstiness: 0.40, ngrama: 0.25, tells: 0.20, abertura: 0.15 };

export function indice(texto) {
  const sinais = {
    burstiness: burstiness(texto),
    ngrama: repeticaoNgrama(texto),
    tells: densidadeTells(texto),
    abertura: aberturaUniforme(texto),
  };
  const total = Math.round(
    sinais.burstiness * PESOS.burstiness +
    sinais.ngrama * PESOS.ngrama +
    sinais.tells * PESOS.tells +
    sinais.abertura * PESOS.abertura
  );
  return { total, sinais };
}
```

Atualizar o CLI (bloco `import.meta.main`) pra imprimir a 4ª linha:

```javascript
  console.log(`  Abertura uniforme ... ${String(r.sinais.abertura).padStart(3)}  ${barra(r.sinais.abertura)}${alerta(r.sinais.abertura)}`);
```
(inserir depois da linha de "Densidade de tells".)

- [ ] **Step 4: Run test + re-calibrar o chão**

Run: `node --test scripts/detectar-ia.test.mjs`
Expected: os testes de índice passam; o teste-guarda do chão PODE falhar agora (4 sinais mudam a média dos exemplares). Se falhar, medir o novo chão:
```bash
for f in ia-para-pequenas-empresas-o-que-faz ia-quanto-sobra-fim-do-mes claude-para-pequenas-empresas-o-que-significa; do node scripts/detectar-ia.mjs "producao/artigos/$f.md" | grep INDICE; done
```
Calcular a nova média, e atualizar o literal `~9` na linha do CLI pro novo valor `Math.round(media)`. Re-rodar até o teste-guarda passar. Reportar o novo chão.

Confirmar também que o texto de-IA continua ALTO e o exemplar BAIXO (o teste "IA>humano" deve seguir verde).

- [ ] **Step 5: Commit**

```bash
git add scripts/detectar-ia.mjs scripts/detectar-ia.test.mjs
git commit -m "detectar-ia: índice passa a 4 sinais (abertura uniforme entra com 15%), chão re-calibrado

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Atualizar skill, gabarito e memória

**Files:**
- Modify: `.claude/skills/detectar-ia/SKILL.md`
- Modify: `.claude/skills/escritor-br/SKILL.md`
- Modify: memória

- [ ] **Step 1: Skill /detectar-ia — documentar o 4º sinal e o novo chão**

Em `.claude/skills/detectar-ia/SKILL.md`, na seção "O que os 3 sinais querem dizer", trocar pra 4 sinais, adicionando:

```markdown
- **Abertura uniforme alta** (parágrafos abrindo com conector ou a mesma palavra) → o
  `/escritor-br` reabre cada parágrafo com fato, número, nome ou afirmação seca, nunca conector.
```

E atualizar o número do chão (~9) pro valor re-calibrado da Task 5 em todas as menções.

- [ ] **Step 2: /escritor-br — +tell "não é X, é Y" e abertura na tabela**

Em `.claude/skills/escritor-br/SKILL.md`, adicionar 2 linhas à tabela de vícios (depois dos 3 de substância):

```markdown
| ✦ "Não é X, é Y" / "não é X, mas Y" (padrão retórico do Fable/Opus) | Afirmar direto o Y; usar 1x no máximo por peça, nunca em série |
| ✦ Abertura de parágrafo em série (vários abrindo com conector ou a mesma palavra) | Reabrir com fato, número, nome ou afirmação seca; conteúdo conecta, conector não |
```

- [ ] **Step 3: Memória**

Atualizar `C:\Users\ACER\.claude\projects\c--Users-ACER-Desktop-ImpulsoX-AI\memory\detector-ia-skill.md`: registrar o enxerto das 5 ideias do /humanizar (JSON externo, não-é-X-é-Y, trio geral, abertura uniforme como 4º sinal, novo chão re-calibrado). Nota: o índice agora é 4 sinais.

- [ ] **Step 4: Rodar a suíte inteira como aceite final**

Run: `node --test scripts/detectar-ia.test.mjs scripts/lib-humanizador.test.mjs`
Expected: tudo verde.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/detectar-ia/SKILL.md .claude/skills/escritor-br/SKILL.md
git commit -m "Documenta o enxerto: 4º sinal (abertura) na skill, tells 'não é X é Y' e abertura no escritor-br

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Ordem e dependências

Task 1 (JSON) primeiro — base pros tells. Task 2 e 3 adicionam tells (independentes entre si, mas sequenciais no mesmo arquivo). Task 4 cria o sinal de abertura. Task 5 costura os 4 sinais e re-calibra (depende de 4). Task 6 documenta. Cada task commita e roda testes.

## Riscos

- **Trio geral pode dar falso-positivo** (lista legítima "A, B e C" é comum) — por isso só conta pro índice via densidade, nunca trava; e o teste do texto humano é a rede.
- **Re-calibração do chão**: 4 sinais mudam a média dos exemplares. O teste-guarda pega; a Task 5 obriga a medir e atualizar o literal.
- **"pra/tá" NÃO entra** — a técnica de contração falada do /humanizar original é vetada pela voz.md; este enxerto pega só o que respeita a voz.
