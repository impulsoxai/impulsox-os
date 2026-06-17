# Radar de tema de vídeo — /tema-yt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Escolher o TEMA do vídeo (passo 0, antes do roteiro) a partir de demanda real —
criadores monitorados + busca no YouTube por palavra-chave + WebSearch + Google Trends
(best-effort), pontuados e ranqueados, com a IA reordenando o topo.

**Architecture:** `lib-tema-yt.mjs` (funções puras: extrair tema, agrupar, pontuar, dedup,
parse do Trends) + `coletar-temas-yt.mjs` (orquestrador só-leitura: yt-dlp dos criadores +
ytsearch) + `trends-best-effort.mjs` (Trends, nunca crítico) + skill `/tema-yt`. Reusa
`lib-youtube.mjs` (lerCriadores, lerPilares, classificarRelevancia). yt-dlp já instalado.

**Tech Stack:** Node ≥18 ESM (ZERO deps), `node --test`. yt-dlp (`--flat-playlist --print`,
`ytsearchdate`). WebSearch (na skill). Google Trends endpoint público (best-effort).

---

## Task 1: `lib-tema-yt.mjs` — `extrairTema`

**Files:**
- Create: `scripts/lib-tema-yt.mjs`
- Test: `scripts/lib-tema-yt.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { extrairTema } from "./lib-tema-yt.mjs";

test("extrairTema remove embalagem (how to, números, the) e mantém o assunto", () => {
  assert.equal(extrairTema("How to use Claude Code in VSCode"), "use claude code in vscode");
  assert.equal(extrairTema("9 AI Skills You MUST Have to Become Rich"), "ai skills you must have to become rich");
  assert.equal(extrairTema("The Laziest Way to Make Money with Claude"), "laziest way to make money with claude");
});

test("extrairTema normaliza espaços e caixa", () => {
  assert.equal(extrairTema("  Claude   CODE  Memory  "), "claude code memory");
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-tema-yt.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
// lib-tema-yt.mjs — funções puras pro radar de tema de vídeo (/tema-yt). ZERO deps, sem
// rede: extração/agrupamento/pontuação de temas e parse do Trends. ImpulsoX AI.

// Stopwords de EMBALAGEM (não são o assunto) — removidas pra achar o tópico-núcleo.
const EMBALAGEM = new Set(["how", "to", "the", "a", "an", "your", "you", "my", "i", "this", "in", "of", "for", "with", "and"]);

// Título -> tópico-núcleo normalizado (minúsculas, sem embalagem, sem números soltos).
export function extrairTema(titulo) {
  return String(titulo)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")          // tira pontuação
    .split(/\s+/)
    .filter((w) => w && !EMBALAGEM.has(w) && !/^\d+$/.test(w)) // tira embalagem e números soltos
    .join(" ")
    .trim();
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-tema-yt.test.mjs` → 2 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-tema-yt.mjs scripts/lib-tema-yt.test.mjs
git commit -m "feat(tema-yt): extrairTema (título -> tópico-núcleo)"
```

---

## Task 2: `lib-tema-yt.mjs` — `agruparTemasRepetidos` + `dedup`

**Files:**
- Modify: `scripts/lib-tema-yt.mjs`
- Modify: `scripts/lib-tema-yt.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { agruparTemasRepetidos, dedup } from "./lib-tema-yt.mjs";

test("agruparTemasRepetidos junta tema igual e conta criadores distintos", () => {
  const itens = [
    { tema: "claude code memory", criador: "Chase", dias: 2, pilar: "Ensinar", views: 100000 },
    { tema: "claude code memory", criador: "Sabrina", dias: 5, pilar: "Ensinar", views: 50000 },
    { tema: "faceless video", criador: "Sabrina", dias: 1, pilar: null, views: 20000 },
  ];
  assert.deepEqual(agruparTemasRepetidos(itens), [
    { tema: "claude code memory", nCriadores: 2, diasMin: 2, pilar: "Ensinar", viewsMax: 100000 },
    { tema: "faceless video", nCriadores: 1, diasMin: 1, pilar: null, viewsMax: 20000 },
  ]);
});

test("dedup remove tema repetido (mesma chave normalizada)", () => {
  const temas = [{ tema: "claude code" }, { tema: "claude code" }, { tema: "ai agents" }];
  assert.deepEqual(dedup(temas).map((t) => t.tema), ["claude code", "ai agents"]);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-tema-yt.test.mjs` → FAIL (funções não exportadas).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Junta itens com o mesmo tema: conta criadores distintos, pega o mais recente e o maior view.
export function agruparTemasRepetidos(itens) {
  const mapa = new Map();
  for (const it of itens) {
    const g = mapa.get(it.tema) || { tema: it.tema, criadores: new Set(), diasMin: Infinity, pilar: null, viewsMax: 0 };
    g.criadores.add(it.criador);
    g.diasMin = Math.min(g.diasMin, it.dias);
    g.viewsMax = Math.max(g.viewsMax, it.views || 0);
    if (it.pilar) g.pilar = it.pilar;
    mapa.set(it.tema, g);
  }
  return [...mapa.values()].map((g) => ({
    tema: g.tema, nCriadores: g.criadores.size, diasMin: g.diasMin, pilar: g.pilar, viewsMax: g.viewsMax,
  }));
}

// Remove tema duplicado pela chave de texto (já normalizada por extrairTema).
export function dedup(temas) {
  const visto = new Set();
  return temas.filter((t) => (visto.has(t.tema) ? false : visto.add(t.tema)));
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-tema-yt.test.mjs` → 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-tema-yt.mjs scripts/lib-tema-yt.test.mjs
git commit -m "feat(tema-yt): agruparTemasRepetidos + dedup"
```

---

## Task 3: `lib-tema-yt.mjs` — `pontuarTema`

**Files:**
- Modify: `scripts/lib-tema-yt.mjs`
- Modify: `scripts/lib-tema-yt.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { pontuarTema } from "./lib-tema-yt.mjs";

test("pontuarTema soma recorrência, recência, pilar, views e trends", () => {
  // nCriadores 2 ->6; diasDesde 4 -> max(0,14-4)=10; alinhaPilar true ->5;
  // views 100000 -> min(5,100000/50000)=2; trends 40 -> min(5,40/20)=2. Total 25.
  assert.equal(pontuarTema({ nCriadores: 2, diasDesde: 4, alinhaPilar: true, views: 100000, trendsInteresse: 40 }), 25);
});

test("pontuarTema sem trends nem pilar nem views", () => {
  // nCriadores 1 ->3; diasDesde 14 ->0; pilar false ->0; views 0 ->0; trends 0 ->0. Total 3.
  assert.equal(pontuarTema({ nCriadores: 1, diasDesde: 14, alinhaPilar: false, views: 0 }), 3);
});

test("pontuarTema satura views e trends no teto 5", () => {
  // nCriadores 0 ->0; dias 14 ->0; pilar false ->0; views 999999 ->5; trends 999 ->5. Total 10.
  assert.equal(pontuarTema({ nCriadores: 0, diasDesde: 14, alinhaPilar: false, views: 999999, trendsInteresse: 999 }), 10);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-tema-yt.test.mjs` → FAIL (`pontuarTema` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Score transparente do tema. Recorrência pesa mais (demanda comprovada entre criadores).
export function pontuarTema({ nCriadores, diasDesde, alinhaPilar, views = 0, trendsInteresse = 0 }) {
  const recorrencia = nCriadores * 3;
  const recencia = Math.max(0, 14 - diasDesde);
  const pilar = alinhaPilar ? 5 : 0;
  const vw = Math.min(5, views / 50000);
  const tr = Math.min(5, trendsInteresse / 20);
  return recorrencia + recencia + pilar + vw + tr;
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-tema-yt.test.mjs` → 7 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-tema-yt.mjs scripts/lib-tema-yt.test.mjs
git commit -m "feat(tema-yt): pontuarTema (recorrência+recência+pilar+views+trends)"
```

---

## Task 4: `lib-tema-yt.mjs` — `parseTrends`

**Files:**
- Modify: `scripts/lib-tema-yt.mjs`
- Modify: `scripts/lib-tema-yt.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { parseTrends } from "./lib-tema-yt.mjs";

test("parseTrends remove o prefixo )]}' e extrai termos+interesse", () => {
  // Formato simplificado do related queries do Trends (com lixo de prefixo).
  const bruto = `)]}'\n{"default":{"rankedList":[{"rankedKeyword":[{"query":"claude code","value":80},{"query":"ai agents","value":40}]}]}}`;
  assert.deepEqual(parseTrends(bruto), [
    { termo: "claude code", interesse: 80 },
    { termo: "ai agents", interesse: 40 },
  ]);
});

test("parseTrends devolve [] pra resposta inválida (best-effort)", () => {
  assert.deepEqual(parseTrends("bloqueado pelo google"), []);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-tema-yt.test.mjs` → FAIL (`parseTrends` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Parse best-effort da resposta do Google Trends (related queries). A resposta vem com um
// prefixo lixo ")]}'" antes do JSON. Qualquer erro -> [] (a fonte nunca é crítica).
export function parseTrends(bruto) {
  try {
    const limpo = String(bruto).replace(/^\)\]\}'?\s*/, "");
    const j = JSON.parse(limpo);
    const lista = j?.default?.rankedList?.[0]?.rankedKeyword || [];
    return lista.map((k) => ({ termo: k.query, interesse: k.value })).filter((x) => x.termo);
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-tema-yt.test.mjs` → 9 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-tema-yt.mjs scripts/lib-tema-yt.test.mjs
git commit -m "feat(tema-yt): parseTrends (best-effort, remove prefixo lixo)"
```

---

## Task 5: `trends-best-effort.mjs` — consulta best-effort

**Files:**
- Create: `scripts/trends-best-effort.mjs`
- Test: `scripts/trends-best-effort.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { urlTrends } from "./trends-best-effort.mjs";

test("urlTrends monta a URL do related queries pro termo", () => {
  const u = urlTrends("claude code");
  assert.match(u, /trends\.google\.com/);
  assert.match(u, /claude(\+|%20)code|claude%20code|claude\+code/);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/trends-best-effort.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
#!/usr/bin/env node
/**
 * trends-best-effort.mjs — sinal de demanda do Google Trends (related queries). BEST-EFFORT:
 * se bloquear/quebrar, devolve [] com aviso — NUNCA derruba a coleta de temas. ImpulsoX AI.
 *
 * Uso: node scripts/trends-best-effort.mjs "claude code" "ai automation"
 */
import { parseTrends } from "./lib-tema-yt.mjs";

// URL pública do related queries do Trends (endpoint não-oficial; pode mudar/bloquear).
export function urlTrends(termo) {
  const q = encodeURIComponent(termo);
  return `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en-US&tz=180&req=%7B%22restriction%22:%7B%22geo%22:%7B%7D,%22time%22:%22today+3-m%22%7D,%22keywordType%22:%22ENTITY%22,%22term%22:%22${q}%22%7D`;
}

// Best-effort: tenta buscar; qualquer falha -> [] com aviso. Nunca lança.
export async function buscarTrends(termo, { fetchImpl = fetch } = {}) {
  try {
    const r = await fetchImpl(urlTrends(termo), { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) { console.error(`AVISO: Trends indisponível pra "${termo}" (HTTP ${r.status}).`); return []; }
    return parseTrends(await r.text());
  } catch (e) {
    console.error(`AVISO: Trends falhou pra "${termo}" — ${e.message}. Seguindo sem essa fonte.`);
    return [];
  }
}

if (import.meta.main) {
  const termos = process.argv.slice(2);
  if (!termos.length) { console.error("ERRO: informe ao menos um termo."); process.exit(1); }
  Promise.all(termos.map((t) => buscarTrends(t).then((r) => ({ termo: t, relacionados: r }))))
    .then((tudo) => console.log(JSON.stringify(tudo, null, 2)));
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/trends-best-effort.test.mjs` → 1 PASS. Depois `node --check scripts/trends-best-effort.mjs` → sem erro.

- [ ] **Step 5: Commit**

```bash
git add scripts/trends-best-effort.mjs scripts/trends-best-effort.test.mjs
git commit -m "feat(tema-yt): trends-best-effort (sinal de demanda, nunca crítico)"
```

---

## Task 6: `coletar-temas-yt.mjs` — pipeline de coleta (pura) + dry orquestrador

**Files:**
- Create: `scripts/coletar-temas-yt.mjs`
- Test: `scripts/coletar-temas-yt.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { rankearTemas } from "./coletar-temas-yt.mjs";

test("rankearTemas: extrai, agrupa, pontua e ordena por score desc", () => {
  const itensBrutos = [
    { titulo: "How to use Claude Code memory", criador: "Chase", dias: 2, views: 100000, pilar: "Ensinar" },
    { titulo: "Claude Code Memory explained", criador: "Sabrina", dias: 5, views: 50000, pilar: "Ensinar" },
    { titulo: "Receita de bolo", criador: "Outro", dias: 1, views: 1000, pilar: null },
  ];
  const r = rankearTemas(itensBrutos);
  // "claude code memory" tocado por 2 criadores -> score alto, vem primeiro
  assert.match(r[0].tema, /claude code/);
  assert.ok(r[0].score > r[r.length - 1].score);
  assert.equal(typeof r[0].score, "number");
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/coletar-temas-yt.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
#!/usr/bin/env node
/**
 * coletar-temas-yt.mjs — coleta temas dos criadores monitorados + busca no YouTube por
 * palavra-chave (yt-dlp), pontua e ranqueia. SÓ LEITURA. ImpulsoX AI. yt-dlp já instalado.
 *
 * Uso: node scripts/coletar-temas-yt.mjs [--termos "claude code,ai automation"]
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { lerCriadores, lerPilares, classificarRelevancia } from "./lib-youtube.mjs";
import { extrairTema, agruparTemasRepetidos, pontuarTema, dedup } from "./lib-tema-yt.mjs";

const YTDLP = process.env.YTDLP_BIN || "yt-dlp";

// Pipeline puro: itens brutos {titulo, criador, dias, views, pilar} -> temas ranqueados.
export function rankearTemas(itensBrutos, pilares = []) {
  const itens = itensBrutos.map((it) => {
    const tema = extrairTema(it.titulo);
    const pilar = it.pilar ?? (pilares.length ? (classificarRelevancia(it.titulo, pilares).pilar) : null);
    return { tema, criador: it.criador, dias: it.dias, pilar, views: it.views || 0 };
  }).filter((it) => it.tema);
  const agrupados = agruparTemasRepetidos(itens);
  const pontuados = agrupados.map((g) => ({
    ...g,
    score: pontuarTema({ nCriadores: g.nCriadores, diasDesde: g.diasMin, alinhaPilar: !!g.pilar, views: g.viewsMax }),
  }));
  return dedup(pontuados).sort((a, b) => b.score - a.score);
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/coletar-temas-yt.test.mjs` → 1 PASS. Depois `node --check scripts/coletar-temas-yt.mjs` → sem erro.

- [ ] **Step 5: Commit**

```bash
git add scripts/coletar-temas-yt.mjs scripts/coletar-temas-yt.test.mjs
git commit -m "feat(tema-yt): coletar-temas rankearTemas (pipeline puro)"
```

---

## Task 7: `coletar-temas-yt.mjs` — CLI (yt-dlp criadores + ytsearch)

**Files:**
- Modify: `scripts/coletar-temas-yt.mjs`

- [ ] **Step 1: Acrescentar a coleta via yt-dlp e o bloco `import.meta.main`**

Acrescentar ao fim de `scripts/coletar-temas-yt.mjs` (depois de `falhar`):

```javascript
// Vídeos recentes de um canal (id|titulo|views). Best-effort: erro -> [].
function videosDoCanal(channelId, limite = 8) {
  try {
    const out = execFileSync(YTDLP, ["--flat-playlist", "--no-warnings", "-I", `1:${limite}`,
      "--print", "%(id)s|%(title)s|%(view_count)s", `https://www.youtube.com/channel/${channelId}/videos`],
      { encoding: "utf8" });
    return out.trim().split("\n").filter(Boolean).map((l) => {
      const [id, titulo, views] = l.split("|");
      return { id, titulo, views: Number(views) || 0 };
    });
  } catch { console.error(`AVISO: não consegui os vídeos do canal ${channelId}.`); return []; }
}

// Busca no YouTube por termo: N vídeos recentes de qualquer canal (ytsearchdate).
function buscarPorTermo(termo, limite = 8) {
  try {
    const out = execFileSync(YTDLP, ["--flat-playlist", "--no-warnings",
      "--print", "%(id)s|%(title)s|%(view_count)s", `ytsearchdate${limite}:${termo}`], { encoding: "utf8" });
    return out.trim().split("\n").filter(Boolean).map((l) => {
      const [id, titulo, views] = l.split("|");
      return { id, titulo, views: Number(views) || 0 };
    });
  } catch { console.error(`AVISO: busca no YouTube falhou pra "${termo}".`); return []; }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

  const criadoresPath = join("canal-youtube", "criadores-monitorados.md");
  const pilaresPath = join("canal-youtube", "pilares.md");
  const criadores = existsSync(criadoresPath) ? lerCriadores(readFileSync(criadoresPath, "utf8")) : [];
  const pilares = existsSync(pilaresPath) ? lerPilares(readFileSync(pilaresPath, "utf8")) : [];

  const itens = [];
  // fonte (a): criadores monitorados
  for (const c of criadores) {
    for (const v of videosDoCanal(c.channelId)) {
      itens.push({ titulo: v.titulo, criador: c.nome, dias: 7, views: v.views, pilar: null });
    }
  }
  // fonte (b): busca por palavra-chave do nicho
  const termosFlag = flag("--termos");
  const termos = termosFlag ? termosFlag.split(",").map((t) => t.trim())
    : pilares.flatMap((p) => p.palavrasChave).slice(0, 4);
  if (termos.length === 0) termos.push("claude code", "ai automation");
  for (const termo of termos) {
    for (const v of buscarPorTermo(termo)) {
      itens.push({ titulo: v.titulo, criador: `busca:${termo}`, dias: 7, views: v.views, pilar: null });
    }
  }

  if (itens.length === 0) falhar("não coletei nenhum vídeo (YouTube bloqueou ou sem criadores/termos). Tente de novo ou rode a skill, que soma a WebSearch.");

  const ranqueados = rankearTemas(itens, pilares);
  const mes = new Date().toISOString().slice(0, 7);
  const dir = join("canal-youtube", "temas");
  mkdirSync(dir, { recursive: true });
  const md = ["# Temas coletados — " + mes, "", ...ranqueados.slice(0, 20).map((t, i) =>
    `${i + 1}. **${t.tema}** — score ${t.score.toFixed(1)} · ${t.nCriadores} criador(es) · pilar: ${t.pilar || "—"} · views máx: ${t.viewsMax}`)].join("\n");
  writeFileSync(join(dir, `${mes}.md`), md + "\n");
  console.log(JSON.stringify({ ok: true, total: ranqueados.length, top: ranqueados.slice(0, 10) }, null, 2));
}
```

- [ ] **Step 2: Verify syntax** — `node --check scripts/coletar-temas-yt.mjs` → sem saída.

- [ ] **Step 3: Run the existing tests** — `node --test scripts/coletar-temas-yt.test.mjs scripts/lib-tema-yt.test.mjs` → todos PASS.

- [ ] **Step 4: Smoke test real (coleta dos criadores reais, no clone AI)**

```bash
cd "C:/Users/ACER/Desktop/ImpulsoX-AI"
node "C:/Users/ACER/Desktop/ImpulsoX-OS/scripts/coletar-temas-yt.mjs" --termos "claude code" 2>&1 | head -20
```
Esperado: JSON com `ok:true` e top temas, OU avisos de bloqueio + erro claro se o YouTube
travar tudo. Gera `canal-youtube/temas/<mês>.md`. (Best-effort: avisos não são falha.)

- [ ] **Step 5: Commit**

```bash
git add scripts/coletar-temas-yt.mjs
git commit -m "feat(tema-yt): CLI coletar-temas — yt-dlp criadores + ytsearch por palavra-chave"
```

---

## Task 8: Skill `/tema-yt` + Passo 0 no `/roteiro-yt`

**Files:**
- Create: `.claude/skills/tema-yt/SKILL.md`
- Modify: `.claude/skills/roteiro-yt/SKILL.md`

- [ ] **Step 1: Criar `.claude/skills/tema-yt/SKILL.md`**

```markdown
---
name: tema-yt
description: >
  Use pra ESCOLHER o tema do próximo vídeo do canal antes de roteirizar — "/tema-yt", "que
  vídeo eu faço?", "tema em alta de IA/Claude Code", "o que os criadores estão falando", "tô
  sem pauta de vídeo". Pesquisa demanda real (criadores monitorados, busca no YouTube,
  WebSearch, Google Trends), ranqueia e entrega temas com ângulo e fórmula sugerida.
---

# /tema-yt — Escolher o tema (passo 0 do vídeo)

Tema bom não se inventa — vem de demanda real. Esta skill é o passo antes do roteiro: acha o
que está em alta no nicho (IA/Claude Code) e o que os criadores de sucesso estão falando,
ranqueia, e entrega o melhor pro `/roteiro-yt`. Princípio do CLAUDE.md: copiar a fórmula de
quem performa — inclui o que eles escolhem falar.

Autoria: ImpulsoX AI. Conteúdo original.

## Fontes (nunca raspa nada atrás de login)

- **Criadores monitorados** (`canal-youtube/criadores-monitorados.md`) — vídeos recentes via yt-dlp.
- **Busca no YouTube** por palavra-chave do nicho (yt-dlp `ytsearch`) — nicho inteiro, não só os monitorados.
- **WebSearch** — tendências de IA/Claude Code, lançamentos, features novas.
- **Google Trends** (best-effort) — sinal extra de demanda; se bloquear, ignora.

## Fluxo

1. Rodar `node scripts/coletar-temas-yt.mjs` → temas dos criadores + busca, pontuados
   (grava `canal-youtube/temas/<mês>.md`). Rodar `node scripts/trends-best-effort.mjs "<termos>"`
   pra somar o sinal de Trends quando vier.
2. **WebSearch** de tendências recentes (lançamentos de IA/Claude Code).
3. Cruzar tudo, detectar **lacunas** (tema com demanda que ninguém cobriu bem), **reordenar o
   topo** com julgamento (relevância pro canal, fadiga do tema, potencial de hook).
4. Entregar 5-10 temas ranqueados — cada um: **tema · por que (fonte + sinal) · ângulo pro
   canal · fórmula sugerida** (cruza `canal-youtube/formulas-video.md`).
5. O dono escolhe um → vira o input do `/roteiro-yt`.

## Regras

- Demanda real acima de palpite — todo tema carrega a fonte que o sustenta.
- Google Trends é best-effort; sua ausência nunca trava o radar.
- Sem criadores preenchidos → cai pra busca + WebSearch e avisa pra preencher (`resolver-canal-yt.mjs`).
- Nunca raspar rede atrás de login.
- Tema escolhido carrega a fórmula sugerida pro `/roteiro-yt`.
```

- [ ] **Step 2: Acrescentar o Passo 0 no `.claude/skills/roteiro-yt/SKILL.md`**

Na seção "Pré-checagem" do `roteiro-yt/SKILL.md`, o item 2 hoje é:
```markdown
2. **Tema e pilar definidos?** Vem do pedido direto do dono, ou de um item de
   `canal-youtube/pesquisa/fila.md` que ele aprovou pra adaptar. Sem os dois, perguntar.
```
Substituir por:
```markdown
2. **Tema e pilar definidos?** Vem do pedido direto do dono, de um tema escolhido em
   `canal-youtube/temas/<mês>.md` (radar do `/tema-yt`), ou de um item de
   `canal-youtube/pesquisa/fila.md`. **Sem tema, rodar `/tema-yt` primeiro** — tema bom vem
   de demanda real, não se inventa. O tema do radar já vem com a fórmula sugerida pro Passo 1.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/tema-yt/SKILL.md .claude/skills/roteiro-yt/SKILL.md
git commit -m "feat(tema-yt): skill /tema-yt + Passo 0 (escolher tema) no /roteiro-yt"
```

---

## Task 9: Verificação final

**Files:** nenhum novo — só validação.

- [ ] **Step 1: Sintaxe de todos os scripts novos**

```bash
node --check scripts/lib-tema-yt.mjs && node --check scripts/trends-best-effort.mjs && node --check scripts/coletar-temas-yt.mjs
```
Esperado: sem saída (sucesso).

- [ ] **Step 2: Suíte completa do /tema-yt**

```bash
node --test scripts/lib-tema-yt.test.mjs scripts/trends-best-effort.test.mjs scripts/coletar-temas-yt.test.mjs
```
Esperado: todos `pass`, `0 fail`.

- [ ] **Step 3: Confirmar que nenhum teste roda yt-dlp/rede**

```bash
grep -rn "execFileSync\|fetch(\|yt-dlp\|trends.google" scripts/lib-tema-yt.test.mjs scripts/trends-best-effort.test.mjs scripts/coletar-temas-yt.test.mjs
```
Esperado: nenhuma ocorrência (testes batem só nas funções puras).
