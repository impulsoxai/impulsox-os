# Métricas do YouTube — validação de fórmula (Fase 3.5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Puxar métricas reais por vídeo do YouTube (auto via Analytics API ou manual do
Studio), comparar retenção contra o benchmark da faixa, e dar o veredito da fórmula
(validada / a testar / não funciona) pra alimentar o `formulas-video.md`.

**Architecture:** `lib-youtube-analytics.mjs` (funções puras: benchmark de retenção,
avaliação de fórmula, montar query, parse manual) + `metricas-youtube.mjs` (orquestrador
só-leitura, OAuth da Fase 3 + escopo analytics) + skill `/desempenho-yt`. Critério da
pesquisa 2026: retenção (`averageViewPercentage`) é o sinal #1, com benchmark por faixa.

**Tech Stack:** Node ≥18 ESM (ZERO deps), `node --test`. YouTube Analytics API v2
(`reports.query`). Reusa OAuth (`YT_*`) da Fase 3 + escopo `yt-analytics.readonly`. Espelha
`publicar-youtube.mjs` (funções puras exportadas, token redigido).

---

## Task 1: `lib-youtube-analytics.mjs` — `benchmarkRetencao`

**Files:**
- Create: `scripts/lib-youtube-analytics.mjs`
- Test: `scripts/lib-youtube-analytics.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { benchmarkRetencao } from "./lib-youtube-analytics.mjs";

test("benchmarkRetencao: short sempre 70", () => {
  assert.equal(benchmarkRetencao({ ehShort: true, duracaoSeg: 20 }), 70);
});

test("benchmarkRetencao: long por faixa de duração", () => {
  assert.equal(benchmarkRetencao({ ehShort: false, duracaoSeg: 200 }), 70);  // <5min
  assert.equal(benchmarkRetencao({ ehShort: false, duracaoSeg: 500 }), 55);  // 5-10min
  assert.equal(benchmarkRetencao({ ehShort: false, duracaoSeg: 800 }), 45);  // 10-15min
  assert.equal(benchmarkRetencao({ ehShort: false, duracaoSeg: 1200 }), 40); // 15min+
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube-analytics.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
// lib-youtube-analytics.mjs — funções puras pra Fase 3.5 (métricas/validação de fórmula).
// ZERO deps, sem rede. Critério da pesquisa 2026: retenção é o sinal #1 do algoritmo. ImpulsoX AI.

// Benchmark "bom" de averageViewPercentage por formato/faixa (pesquisa 2026).
export function benchmarkRetencao({ ehShort, duracaoSeg }) {
  if (ehShort) return 70;
  if (duracaoSeg < 300) return 70;   // <5min
  if (duracaoSeg < 600) return 55;   // 5-10min
  if (duracaoSeg < 900) return 45;   // 10-15min
  return 40;                          // 15min+
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube-analytics.test.mjs` → 2 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube-analytics.mjs scripts/lib-youtube-analytics.test.mjs
git commit -m "feat(metricas-yt): benchmarkRetencao por faixa de duração"
```

---

## Task 2: `lib-youtube-analytics.mjs` — `avaliarFormula`

**Files:**
- Modify: `scripts/lib-youtube-analytics.mjs`
- Modify: `scripts/lib-youtube-analytics.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { avaliarFormula } from "./lib-youtube-analytics.mjs";

test("avaliarFormula: acima do benchmark -> validada", () => {
  assert.equal(avaliarFormula({ averageViewPercentage: 60, benchmark: 55 }), "validada");
});

test("avaliarFormula: abaixo do benchmark com 1 reprovação anterior -> nao funciona", () => {
  assert.equal(avaliarFormula({ averageViewPercentage: 40, benchmark: 55, reprovacoesAnteriores: 1 }), "nao funciona");
});

test("avaliarFormula: abaixo do benchmark sem reprovação anterior -> a testar", () => {
  assert.equal(avaliarFormula({ averageViewPercentage: 40, benchmark: 55, reprovacoesAnteriores: 0 }), "a testar");
});

test("avaliarFormula: mediaCanal sobrepõe o benchmark quando informada", () => {
  // benchmark 55, mas a média do canal é 45 -> APV 50 supera a média -> validada
  assert.equal(avaliarFormula({ averageViewPercentage: 50, benchmark: 55, mediaCanal: 45 }), "validada");
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube-analytics.test.mjs` → FAIL (`avaliarFormula` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Veredito da fórmula pela retenção. Régua relativa: a média do canal (quando há histórico)
// sobrepõe o benchmark global. Acima -> validada; abaixo + já reprovou antes -> nao funciona.
export function avaliarFormula({ averageViewPercentage, benchmark, mediaCanal = null, reprovacoesAnteriores = 0 }) {
  const alvo = mediaCanal != null ? mediaCanal : benchmark;
  if (averageViewPercentage >= alvo) return "validada";
  if (averageViewPercentage < benchmark && reprovacoesAnteriores >= 1) return "nao funciona";
  return "a testar";
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube-analytics.test.mjs` → 6 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube-analytics.mjs scripts/lib-youtube-analytics.test.mjs
git commit -m "feat(metricas-yt): avaliarFormula (retenção vs benchmark/média do canal)"
```

---

## Task 3: `lib-youtube-analytics.mjs` — `montarQueryAnalytics` + `diasDesdePublicacao`

**Files:**
- Modify: `scripts/lib-youtube-analytics.mjs`
- Modify: `scripts/lib-youtube-analytics.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { montarQueryAnalytics, diasDesdePublicacao } from "./lib-youtube-analytics.mjs";

test("montarQueryAnalytics monta os params certos, sem liveOrOnDemand", () => {
  const q = montarQueryAnalytics({ videoId: "abc123", dataInicio: "2026-05-01", dataFim: "2026-05-28" });
  assert.equal(q.ids, "channel==MINE");
  assert.equal(q.startDate, "2026-05-01");
  assert.equal(q.endDate, "2026-05-28");
  assert.equal(q.metrics, "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained");
  assert.equal(q.filters, "video==abc123");
  assert.equal("dimensions" in q, false); // sem liveOrOnDemand (incompatível com averageViewPercentage)
});

test("diasDesdePublicacao conta os dias corretos", () => {
  const agora = new Date("2026-05-20T00:00:00Z");
  assert.equal(diasDesdePublicacao("2026-05-10T00:00:00Z", agora), 10);
  assert.equal(diasDesdePublicacao("2026-05-19T00:00:00Z", agora), 1);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube-analytics.test.mjs` → FAIL (funções não exportadas).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Params do reports.query da Analytics API. SEM dimensão liveOrOnDemand (incompatível com
// averageViewPercentage, conforme a doc). channel==MINE = o canal do dono autenticado.
export function montarQueryAnalytics({ videoId, dataInicio, dataFim }) {
  return {
    ids: "channel==MINE",
    startDate: dataInicio,
    endDate: dataFim,
    metrics: "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained",
    filters: `video==${videoId}`,
  };
}

// Dias inteiros entre a publicação e agora.
export function diasDesdePublicacao(dataISO, agora = new Date()) {
  const ms = agora.getTime() - new Date(dataISO).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube-analytics.test.mjs` → 8 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube-analytics.mjs scripts/lib-youtube-analytics.test.mjs
git commit -m "feat(metricas-yt): montarQueryAnalytics (sem liveOrOnDemand) + diasDesdePublicacao"
```

---

## Task 4: `lib-youtube-analytics.mjs` — `parseMetricasManual`

**Files:**
- Modify: `scripts/lib-youtube-analytics.mjs`
- Modify: `scripts/lib-youtube-analytics.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { parseMetricasManual } from "./lib-youtube-analytics.mjs";

test("parseMetricasManual extrai os 4 campos de um bloco colado do Studio", () => {
  const texto = `
    Visualizações: 12.500
    Porcentagem média assistida: 58%
    Duração média da visualização: 4:12
    Inscritos ganhos: 37
  `;
  assert.deepEqual(parseMetricasManual(texto), {
    views: 12500,
    averageViewPercentage: 58,
    averageViewDuration: 252,
    subscribersGained: 37,
  });
});

test("parseMetricasManual deixa null o que não achar", () => {
  const r = parseMetricasManual("Porcentagem média assistida: 70%");
  assert.equal(r.averageViewPercentage, 70);
  assert.equal(r.views, null);
  assert.equal(r.subscribersGained, null);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube-analytics.test.mjs` → FAIL (`parseMetricasManual` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Converte "m:ss" / "h:mm:ss" / "123" (segundos) em segundos.
function paraSegundos(txt) {
  if (/:/.test(txt)) return txt.split(":").map(Number).reduce((a, n) => a * 60 + n, 0);
  return Number(txt);
}

// Extrai métricas de um bloco colado do YouTube Studio (rótulos PT/EN tolerados). Campo
// ausente = null. Aceita números com ponto/vírgula de milhar e % na retenção.
export function parseMetricasManual(texto) {
  const t = String(texto);
  const num = (re) => { const m = t.match(re); return m ? Number(m[1].replace(/[.,](?=\d{3}\b)/g, "")) : null; };
  const dur = (re) => { const m = t.match(re); return m ? paraSegundos(m[1]) : null; };
  return {
    views: num(/(?:Visualiza[çc][õo]es|views)[:\s]+([\d.,]+)/i),
    averageViewPercentage: num(/(?:Porcentagem m[ée]dia assistida|average view percentage|retention)[:\s]+([\d.,]+)\s*%/i),
    averageViewDuration: dur(/(?:Dura[çc][ãa]o m[ée]dia[^:]*|average view duration)[:\s]+([\d:]+)/i),
    subscribersGained: num(/(?:Inscritos ganhos|subscribers gained)[:\s]+([\d.,]+)/i),
  };
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube-analytics.test.mjs` → 10 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube-analytics.mjs scripts/lib-youtube-analytics.test.mjs
git commit -m "feat(metricas-yt): parseMetricasManual (cola do Studio -> números)"
```

---

## Task 5: `metricas-youtube.mjs` — avaliação (função pura) + dry orquestrador

**Files:**
- Create: `scripts/metricas-youtube.mjs`
- Test: `scripts/metricas-youtube.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { montarResultado } from "./metricas-youtube.mjs";

test("montarResultado junta métricas + benchmark + veredito", () => {
  const r = montarResultado({
    videoId: "abc", ehShort: false, duracaoSeg: 500,
    metricas: { views: 1000, averageViewPercentage: 60, averageViewDuration: 300, subscribersGained: 10 },
  });
  assert.equal(r.videoId, "abc");
  assert.equal(r.benchmark, 55);       // 5-10min
  assert.equal(r.veredito, "validada"); // 60 >= 55
  assert.equal(r.metricas.views, 1000);
});

test("montarResultado: retenção abaixo do benchmark -> a testar (sem reprovação anterior)", () => {
  const r = montarResultado({
    videoId: "x", ehShort: true, duracaoSeg: 20,
    metricas: { averageViewPercentage: 50 },
  });
  assert.equal(r.benchmark, 70);
  assert.equal(r.veredito, "a testar");
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/metricas-youtube.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
#!/usr/bin/env node
/**
 * metricas-youtube.mjs — puxa métricas por vídeo (YouTube Analytics API ou manual do Studio)
 * e dá o veredito da fórmula pela retenção. SÓ LEITURA. ImpulsoX AI. Reusa OAuth da Fase 3
 * (+ escopo yt-analytics.readonly). YT_REFRESH_TOKEN/secret NUNCA em log ou erro.
 *
 * Uso: node scripts/metricas-youtube.mjs --video <id> [--periodo 28] [--manual "<texto>"]
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { benchmarkRetencao, avaliarFormula, montarQueryAnalytics, diasDesdePublicacao, parseMetricasManual } from "./lib-youtube-analytics.mjs";

// Junta métricas + benchmark + veredito — função pura, testável.
export function montarResultado({ videoId, ehShort, duracaoSeg, metricas, mediaCanal = null, reprovacoesAnteriores = 0 }) {
  const benchmark = benchmarkRetencao({ ehShort, duracaoSeg });
  const veredito = avaliarFormula({ averageViewPercentage: metricas.averageViewPercentage, benchmark, mediaCanal, reprovacoesAnteriores });
  return { videoId, ehShort, duracaoSeg, benchmark, veredito, metricas };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/metricas-youtube.test.mjs` → 2 PASS. Depois `node --check scripts/metricas-youtube.mjs` → sem erro.

- [ ] **Step 5: Commit**

```bash
git add scripts/metricas-youtube.mjs scripts/metricas-youtube.test.mjs
git commit -m "feat(metricas-yt): metricas-youtube montarResultado (benchmark + veredito)"
```

---

## Task 6: `metricas-youtube.mjs` — CLI completo (API + manual)

**Files:**
- Modify: `scripts/metricas-youtube.mjs`

- [ ] **Step 1: Acrescentar as funções de leitura/rede e o bloco `import.meta.main`**

Acrescentar ao fim de `scripts/metricas-youtube.mjs` (depois de `falhar`):

```javascript
// Resolve o videoId e a data de publicação a partir de producao/publicacoes.md pelo slug.
function acharPublicacao(slug) {
  const p = join("producao", "publicacoes.md");
  if (!existsSync(p)) return null;
  const linha = readFileSync(p, "utf8").split("\n").find((l) => l.includes(`YouTube ${slug}:`));
  if (!linha) return null;
  const id = (linha.match(/youtu\.be\/([\w-]{11})/) || [])[1];
  const data = (linha.match(/\[([^\]]+)\]/) || [])[1];
  return id ? { videoId: id, data } : null;
}

// Troca refresh_token por access_token (OAuth2). Token nunca volta em erro legível.
async function obterAccessToken({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!r.ok) throw new Error(`OAuth falhou (HTTP ${r.status}) — reautorize com o escopo yt-analytics.readonly.`);
  const j = await r.json();
  if (!j.access_token) throw new Error("OAuth não devolveu access_token — reautorize pelo guia.");
  return j.access_token;
}

// reports.query da Analytics API. Devolve as métricas como objeto nomeado.
async function buscarMetricas({ accessToken, query }) {
  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`Analytics API falhou (HTTP ${r.status}).`);
  const j = await r.json();
  const cols = (j.columnHeaders || []).map((c) => c.name);
  const linha = (j.rows || [])[0];
  if (!linha) return null;
  const m = {};
  cols.forEach((c, i) => { m[c] = linha[i]; });
  return {
    views: m.views ?? null,
    averageViewPercentage: m.averageViewPercentage ?? null,
    averageViewDuration: m.averageViewDuration ?? null,
    subscribersGained: m.subscribersGained ?? null,
  };
}

function janelaDatas(periodoDias) {
  const fim = new Date();
  const inicio = new Date(fim.getTime() - periodoDias * 86400000);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { dataInicio: iso(inicio), dataFim: iso(fim) };
}

if (import.meta.main) {
  try { process.loadEnvFile(); } catch { /* sem .env: modo manual */ }
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };

  const slug = flag("--slug");
  let videoId = flag("--video");
  let dataPub = null;
  if (!videoId && slug) {
    const pub = acharPublicacao(slug);
    if (!pub) falhar(`não achei "${slug}" em producao/publicacoes.md — confira o nome ou publique antes.`);
    videoId = pub.videoId; dataPub = pub.data;
  }
  if (!videoId) falhar("informe --video <id> ou --slug <nome> (registrado em publicacoes.md).");

  if (dataPub && diasDesdePublicacao(dataPub) < 7) {
    console.error("AVISO: vídeo com menos de 7 dias — a retenção ainda está instável; o ideal é medir por volta de 14 dias.");
  }

  // ehShort/duração: o dono informa (ou assume long se não vier). A API não devolve isso aqui.
  const ehShort = args.includes("--short");
  const duracaoSeg = Number(flag("--duracao")) || 600;

  const manual = flag("--manual");
  const clientId = process.env.YT_CLIENT_ID, clientSecret = process.env.YT_CLIENT_SECRET, refreshToken = process.env.YT_REFRESH_TOKEN;

  (async () => {
    let metricas;
    if (manual || !(clientId && clientSecret && refreshToken)) {
      if (!manual) falhar("sem credencial OAuth — cole os números do Studio com --manual \"<texto>\".");
      metricas = parseMetricasManual(manual);
    } else {
      try {
        const accessToken = await obterAccessToken({ clientId, clientSecret, refreshToken });
        const periodo = Number(flag("--periodo")) || 28;
        const query = montarQueryAnalytics({ videoId, ...janelaDatas(periodo) });
        metricas = await buscarMetricas({ accessToken, query });
        if (!metricas) falhar("a Analytics API não devolveu dados (vídeo muito novo/privado?) — tente --manual.");
      } catch (e) { falhar(e.message); }
    }
    const r = montarResultado({ videoId, ehShort, duracaoSeg, metricas });
    console.log(JSON.stringify(r, null, 2));
  })();
}
```

- [ ] **Step 2: Verify syntax** — `node --check scripts/metricas-youtube.mjs` → sem saída.

- [ ] **Step 3: Run the existing tests** — `node --test scripts/metricas-youtube.test.mjs scripts/lib-youtube-analytics.test.mjs` → todos PASS.

- [ ] **Step 4: Smoke test (manual, sem API)**

```bash
node scripts/metricas-youtube.mjs --video abc12345678 --short --duracao 20 --manual "Porcentagem média assistida: 75%" 2>&1 | head -12
```
Esperado: JSON com `"benchmark": 70`, `"veredito": "validada"` (75 ≥ 70), `"metricas": {"averageViewPercentage": 75, ...}`. Não chama a API.

- [ ] **Step 5: Commit**

```bash
git add scripts/metricas-youtube.mjs
git commit -m "feat(metricas-yt): CLI metricas-youtube — Analytics API + manual do Studio"
```

---

## Task 7: Skill `/desempenho-yt`

**Files:**
- Create: `.claude/skills/desempenho-yt/SKILL.md`

- [ ] **Step 1: Criar o arquivo da skill**

```markdown
---
name: desempenho-yt
description: >
  Use pra medir os vídeos do YouTube e validar qual fórmula funciona — "/desempenho-yt",
  "como foi o vídeo?", "qual fórmula performou?", "mede a retenção", "fecha o ciclo do
  canal". Puxa métricas reais (Analytics API ou coladas do Studio), compara a retenção ao
  benchmark do formato e marca a fórmula como validada / não funciona no formulas-video.md.
---

# /desempenho-yt — Medir o vídeo, validar a fórmula

Conteúdo sem medição é circuito aberto. Esta skill pega o que `/publicar` levou ao ar no
YouTube, busca os números reais, e prova qual fórmula funciona — pela RETENÇÃO, o sinal #1
do algoritmo (pesquisa 2026: +10pts de retenção ≈ +25% de impressões). Views são vaidade.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo

- **Automático:** `.env` com `YT_CLIENT_ID/SECRET/REFRESH_TOKEN` (Fase 3) e o refresh_token
  com o escopo `yt-analytics.readonly` → puxa sozinho.
- **Manual:** o dono cola retenção/views/inscritos do YouTube Studio → o sistema interpreta.
  Nunca travar por falta de credencial.

## Fluxo

1. **Sugerir o que medir.** Ler `producao/publicacoes.md`; pelos dias desde a publicação,
   apontar quais vídeos já dá pra medir (≥7-14 dias — antes disso a retenção é instável).
2. **Puxar as métricas.** Rodar `node scripts/metricas-youtube.mjs --slug <nome> [--short
   --duracao <seg>]` (auto) ou com `--manual "<texto colado do Studio>"`.
3. **Ler o veredito** (validada / a testar / não funciona) — vem da retenção vs benchmark
   da faixa (short ~70%, long 5-10min ~55% etc).
4. **Cruzar com a fórmula.** Identificar a fórmula que o vídeo usou (no roteiro/pacote) em
   `canal-youtube/formulas-video.md` e aplicar o veredito. **Mostrar ao dono antes de gravar.**
5. **Gravar o aprendizado.** Atualizar o status da fórmula no `formulas-video.md` e destilar
   o padrão duradouro em `nucleo/aprendizados.md`. Subir o degrau da Escada (degrau 4, vídeo).

## Regras

- Retenção é o sinal principal; views/inscritos são contexto/desempate.
- Benchmark é relativo ao nicho/canal — com histórico, comparar à média do próprio canal.
- Vídeo com <7 dias: avisar que a retenção ainda muda; medir mesmo assim só como prévia.
- Nunca gravar veredito sem o dono confirmar.
- Fórmula validada aqui passa a ter prioridade no `/roteiro-yt` (aprendizado > padrão genérico).
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/desempenho-yt/SKILL.md
git commit -m "feat(desempenho-yt): skill — mede retenção e valida fórmula no formulas-video.md"
```

---

## Task 8: Guia OAuth (escopo analytics) + verificação final

**Files:**
- Modify: `.claude/skills/publicar/SKILL.md`

- [ ] **Step 1: Acrescentar o escopo analytics ao guia OAuth**

No `.claude/skills/publicar/SKILL.md`, na linha do **Guia OAuth (1ª vez)**, ajustar o trecho
do escopo pra incluir os dois:

```markdown
→ autorizar os escopos `https://www.googleapis.com/auth/youtube.upload` (subir vídeo, Fase 3)
e `https://www.googleapis.com/auth/yt-analytics.readonly` (ler métricas, Fase 3.5)
```

- [ ] **Step 2: Sintaxe de todos os scripts novos**

```bash
node --check scripts/lib-youtube-analytics.mjs && node --check scripts/metricas-youtube.mjs
```
Esperado: sem saída (sucesso).

- [ ] **Step 3: Suíte completa da Fase 3.5**

```bash
node --test scripts/lib-youtube-analytics.test.mjs scripts/metricas-youtube.test.mjs
```
Esperado: todos `pass`, `0 fail`.

- [ ] **Step 4: Confirmar que nenhum teste chama a API real**

```bash
grep -rn "fetch(\|googleapis\|oauth2" scripts/lib-youtube-analytics.test.mjs scripts/metricas-youtube.test.mjs
```
Esperado: nenhuma ocorrência (testes batem só nas funções puras).

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/publicar/SKILL.md
git commit -m "docs(metricas-yt): guia OAuth ganha o escopo yt-analytics.readonly (Fase 3.5)"
```
