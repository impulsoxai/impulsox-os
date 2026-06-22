# /desempenho unificado (YouTube + Instagram) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o `scripts/lib-desempenho.mjs` (núcleo comum + régua YouTube + régua Instagram + diagnóstico acionável) e transformar `/desempenho` na porta única que detecta a plataforma e recomenda a skill que conserta.

**Architecture:** Funções puras testáveis em `scripts/lib-desempenho.mjs` (cálculo determinístico — regra da casa). `/desempenho` (SKILL.md) é a porta: detecta plataforma, chama o cálculo, traduz o veredito + recomendações, grava em `aprendizados.md`. `/desempenho-yt` vira redirect. v1 = colar/CSV; API é v2.

**Tech Stack:** Node ESM, `node --test`. Benchmarks de `.firecrawl/youtube-desempenho-pesquisa-2026.md` e `.firecrawl/instagram-desempenho-2026.md`.

---

## File Structure

- `scripts/lib-desempenho.mjs` (NOVO) — funções puras: aliases/parse, taxas YT, taxas IG,
  detectarCurva, diagnósticos. Cálculo só; sem I/O.
- `scripts/lib-desempenho.test.mjs` (NOVO) — testes de todas as funções.
- `.claude/skills/desempenho/SKILL.md` (REESCREVER) — porta única.
- `.claude/skills/desempenho-yt/SKILL.md` (VIRA REDIRECT).

> Cada função pura é uma Task com TDD. As 2 SKILLs (doc) são as últimas Tasks.

---

### Task 1: `BENCH` + `taxasInstagram` — calcula save/send/reach rate

**Files:**
- Create: `scripts/lib-desempenho.mjs`
- Test: `scripts/lib-desempenho.test.mjs`

- [ ] **Step 1: Escrever o teste falhando** (`scripts/lib-desempenho.test.mjs`)

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { taxasInstagram } from "./lib-desempenho.mjs";

test("taxasInstagram calcula save/send/reach rate", () => {
  const t = taxasInstagram({ reach: 1000, saved: 50, shares: 30, seguidores: 5000, formato: "carrossel" });
  assert.equal(t.saveRate, 0.05);   // 50/1000
  assert.equal(t.sendRate, 0.03);   // 30/1000
  assert.equal(t.reachRate, 0.2);   // 1000/5000
});
test("taxasInstagram ignora reach 0 (não divide por zero)", () => {
  const t = taxasInstagram({ reach: 0, saved: 5, shares: 1, seguidores: 100 });
  assert.equal(t.saveRate, 0);
  assert.equal(t.sendRate, 0);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: FAIL — módulo/função não existe.

- [ ] **Step 3: Implementar** (`scripts/lib-desempenho.mjs`)

```javascript
// lib-desempenho.mjs — núcleo de análise de desempenho de canal social. Funções puras
// (cálculo determinístico; nunca de cabeça). Benchmarks 2026 das pesquisas. ImpulsoX AI.

// Benchmarks de referência (pesquisa 2026). YT: CTR compara com a média do próprio canal.
export const BENCH = {
  ig: { saveRateForte: 0.06, saveRateSolido: 0.03, saveRateFraco: 0.02, reachBom: 0.2, reachFraco: 0.1,
        swipeBom: 0.65, completionBom: 0.55 },
  yt: { ctrFraco: 0.03, ctrBom: 0.05, primeiroMinAlvo: 0.65 },
};

const taxa = (num, den) => (den > 0 ? num / den : 0);

// taxasInstagram — calcula as taxas que importam no IG 2026 (save/send/reach por reach/seguidores).
// IMPRESSIONS está morto em 2026: usar reach. shares = "sends". saved = saves. Pura.
export function taxasInstagram({ reach = 0, saved = 0, shares = 0, seguidores = 0, formato = null } = {}) {
  return {
    formato,
    saveRate: taxa(saved, reach),
    sendRate: taxa(shares, reach),
    reachRate: taxa(reach, seguidores),
  };
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-desempenho.mjs scripts/lib-desempenho.test.mjs
git commit -m "feat(desempenho): taxasInstagram (save/send/reach rate) + benchmarks"
```

---

### Task 2: `taxasYouTube` — AVD% por duração, CTR, retenção 1º min, watch time

**Files:**
- Modify: `scripts/lib-desempenho.mjs`
- Test: `scripts/lib-desempenho.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
import { taxasYouTube } from "./lib-desempenho.mjs";

test("taxasYouTube classifica AVD por duração (educacional ~42% é ok em 5-15min)", () => {
  const t = taxasYouTube({ avdPercent: 0.42, duracaoSeg: 600, ctr: 0.05, retencao1min: 0.66, mediaCanalCtr: 0.045 });
  assert.equal(t.avdBom, true);       // 42% em 5-15min (faixa 40-55%) = bom
  assert.equal(t.ctrVsCanal, "acima"); // 0.05 > média 0.045
  assert.equal(t.primeiroMinBom, true); // 0.66 >= 0.65
});
test("taxasYouTube marca AVD fraco fora da faixa", () => {
  const t = taxasYouTube({ avdPercent: 0.25, duracaoSeg: 600 });
  assert.equal(t.avdBom, false);
});
test("taxasYouTube usa faixa de Shorts (>=70%) quando ehShort", () => {
  const ok = taxasYouTube({ avdPercent: 0.72, duracaoSeg: 45, ehShort: true });
  const ruim = taxasYouTube({ avdPercent: 0.5, duracaoSeg: 45, ehShort: true });
  assert.equal(ok.avdBom, true);
  assert.equal(ruim.avdBom, false);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementar** (em `scripts/lib-desempenho.mjs`)

```javascript
// faixaAVD — % de retenção considerado "bom" pela duração (pesquisa 2026). Devolve o piso da faixa.
function pisoAVD({ duracaoSeg, ehShort }) {
  if (ehShort) return 0.70;            // Shorts: 70%+
  if (duracaoSeg < 300) return 0.50;   // <5min: 50-70%
  if (duracaoSeg < 900) return 0.40;   // 5-15min: 40-55%
  if (duracaoSeg < 1800) return 0.30;  // 15-30min: 30-45%
  return 0.25;                          // >30min
}

// taxasYouTube — classifica as métricas YT 2026: AVD vs faixa de duração, CTR vs a MÉDIA do próprio
// canal (benchmark fixo engana — CTR cai com impressões), retenção do 1º minuto, watch time. Pura.
export function taxasYouTube({ avdPercent = 0, duracaoSeg = 0, ehShort = false, ctr = null, mediaCanalCtr = null, retencao1min = null, watchTimeMin = null } = {}) {
  const piso = pisoAVD({ duracaoSeg, ehShort });
  return {
    ehShort,
    avdPercent,
    avdBom: avdPercent >= piso,
    pisoAVD: piso,
    ctr,
    ctrVsCanal: (ctr != null && mediaCanalCtr != null) ? (ctr >= mediaCanalCtr ? "acima" : "abaixo") : null,
    primeiroMinBom: retencao1min != null ? retencao1min >= BENCH.yt.primeiroMinAlvo : null,
    retencao1min,
    watchTimeMin,
  };
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-desempenho.mjs scripts/lib-desempenho.test.mjs
git commit -m "feat(desempenho): taxasYouTube (AVD por duração + CTR vs canal + 1º min)"
```

---

### Task 3: `detectarCurva` — dip/cliff/spike da série de retenção

**Files:**
- Modify: `scripts/lib-desempenho.mjs`
- Test: `scripts/lib-desempenho.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
import { detectarCurva } from "./lib-desempenho.mjs";

test("detectarCurva acha intro dip (perda >40% nos primeiros 30s)", () => {
  // série: [{tSeg, retencao}] — cai de 1.0 pra 0.5 em 30s (perda 50%)
  const serie = [{ tSeg: 0, retencao: 1.0 }, { tSeg: 30, retencao: 0.5 }, { tSeg: 60, retencao: 0.45 }];
  const d = detectarCurva(serie, { duracaoSeg: 600 });
  assert.equal(d.introDip, true);
});
test("detectarCurva acha cliff (queda >15% num único segmento)", () => {
  const serie = [{ tSeg: 0, retencao: 1.0 }, { tSeg: 30, retencao: 0.9 }, { tSeg: 60, retencao: 0.7 }, { tSeg: 90, retencao: 0.5 }];
  const d = detectarCurva(serie, { duracaoSeg: 600 });
  assert.ok(d.cliffs.length >= 1); // 0.7->0.5 = queda de ~0.2 (>0.15)
});
test("detectarCurva curva saudável (queda gradual) não marca cliff", () => {
  const serie = [{ tSeg: 0, retencao: 1.0 }, { tSeg: 30, retencao: 0.7 }, { tSeg: 60, retencao: 0.65 }, { tSeg: 90, retencao: 0.6 }];
  const d = detectarCurva(serie, { duracaoSeg: 600 });
  assert.equal(d.cliffs.length, 0);
});
test("detectarCurva sem série devolve null (modo colar sem curva)", () => {
  assert.equal(detectarCurva(null), null);
  assert.equal(detectarCurva([]), null);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```javascript
// detectarCurva — analisa a série de retenção (% por momento) e acha: intro dip (perda >40% nos
// primeiros 30s = hook fraco), cliffs (queda >15% entre dois pontos = corte/tangente), spikes
// (subida = re-watch). Série = [{tSeg, retencao}] ordenada. null quando não há série (modo colar
// sem curva). Pura. Thresholds da pesquisa 2026.
export function detectarCurva(serie, { duracaoSeg = 0 } = {}) {
  if (!serie || serie.length < 2) return null;
  const s = [...serie].sort((a, b) => a.tSeg - b.tSeg);
  // intro dip: retenção aos ~30s vs início
  const ini = s[0].retencao;
  const aos30 = (s.find((p) => p.tSeg >= 30) || s[s.length - 1]).retencao;
  const introDip = ini > 0 && (ini - aos30) / ini > 0.40;
  // cliffs e spikes entre pontos consecutivos
  const cliffs = [];
  const spikes = [];
  for (let i = 1; i < s.length; i++) {
    const delta = s[i].retencao - s[i - 1].retencao;
    if (delta < -0.15) cliffs.push({ tSeg: s[i].tSeg, queda: Math.round(-delta * 100) / 100 });
    if (delta > 0.02) spikes.push({ tSeg: s[i].tSeg, subida: Math.round(delta * 100) / 100 });
  }
  return { introDip, cliffs, spikes };
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-desempenho.mjs scripts/lib-desempenho.test.mjs
git commit -m "feat(desempenho): detectarCurva — dip/cliff/spike da retenção"
```

---

### Task 4: `diagnosticarYouTube` — sintoma → skill que conserta

**Files:**
- Modify: `scripts/lib-desempenho.mjs`
- Test: `scripts/lib-desempenho.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
import { diagnosticarYouTube } from "./lib-desempenho.mjs";

test("diagnosticarYouTube: AVD baixo + intro dip -> hook fraco -> /roteiro-yt", () => {
  const d = diagnosticarYouTube({ taxas: { avdBom: false, ctrVsCanal: "acima" }, curva: { introDip: true, cliffs: [] } });
  const hookFraco = d.find((x) => x.skill === "/roteiro-yt" && /hook/i.test(x.motivo));
  assert.ok(hookFraco);
});
test("diagnosticarYouTube: CTR abaixo + AVD bom -> thumbnail -> /thumbnail", () => {
  const d = diagnosticarYouTube({ taxas: { avdBom: true, ctrVsCanal: "abaixo" }, curva: null });
  assert.ok(d.find((x) => x.skill === "/thumbnail"));
});
test("diagnosticarYouTube: cliff -> /editar-video", () => {
  const d = diagnosticarYouTube({ taxas: { avdBom: true }, curva: { introDip: false, cliffs: [{ tSeg: 90, queda: 0.2 }] } });
  assert.ok(d.find((x) => x.skill === "/editar-video"));
});
test("diagnosticarYouTube tudo bom -> sem conserto (lista vazia ou só elogio)", () => {
  const d = diagnosticarYouTube({ taxas: { avdBom: true, ctrVsCanal: "acima" }, curva: { introDip: false, cliffs: [] } });
  assert.equal(d.filter((x) => x.skill).length, 0);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```javascript
// diagnosticarYouTube — cruza taxas + curva e devolve a lista de consertos, cada um apontando a
// SKILL que resolve. Pura. (regras da pesquisa: AVD+intro dip=hook; CTR abaixo+AVD bom=thumb; cliff=edição.)
export function diagnosticarYouTube({ taxas = {}, curva = null } = {}) {
  const out = [];
  const introDip = curva?.introDip;
  if (taxas.avdBom === false && introDip) out.push({ skill: "/roteiro-yt", motivo: "hook fraco: retenção despenca nos primeiros 30s — reescrever a abertura (hook + intro=thumbnail)." });
  else if (taxas.avdBom === false) out.push({ skill: "/editar-video", motivo: "retenção média baixa sem queda única: pacing lento — apertar a edição (cortar trechos chatos)." });
  if (taxas.ctrVsCanal === "abaixo" && taxas.avdBom === true) out.push({ skill: "/thumbnail", motivo: "CTR abaixo da média do canal, mas quem assiste fica: o problema é a capa/título — testar 15-20 títulos e nova thumbnail." });
  if (curva?.cliffs?.length) out.push({ skill: "/editar-video", motivo: `queda abrupta em ${curva.cliffs.map((c) => c.tSeg + "s").join(", ")}: corte/tangente — apertar ou cortar esse trecho.` });
  return out;
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-desempenho.mjs scripts/lib-desempenho.test.mjs
git commit -m "feat(desempenho): diagnosticarYouTube — sintoma → skill que conserta"
```

---

### Task 5: `diagnosticarInstagram` — sintoma → skill

**Files:**
- Modify: `scripts/lib-desempenho.mjs`
- Test: `scripts/lib-desempenho.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
import { diagnosticarInstagram } from "./lib-desempenho.mjs";

test("diagnosticarInstagram: save baixo -> /post slide-resumo", () => {
  const d = diagnosticarInstagram({ saveRate: 0.01, sendRate: 0.02, reachRate: 0.2 });
  assert.ok(d.find((x) => x.skill === "/post" && /salv|guard/i.test(x.motivo)));
});
test("diagnosticarInstagram: send ~0 -> gancho de envio (/post ou /reel-marca)", () => {
  const d = diagnosticarInstagram({ saveRate: 0.05, sendRate: 0.0, reachRate: 0.2 });
  assert.ok(d.find((x) => /envi/i.test(x.motivo)));
});
test("diagnosticarInstagram: reach baixo -> testar reel + hook", () => {
  const d = diagnosticarInstagram({ saveRate: 0.05, sendRate: 0.03, reachRate: 0.05 });
  assert.ok(d.find((x) => /reach|alcance|reel/i.test(x.motivo)));
});
test("diagnosticarInstagram tudo bom -> sem conserto", () => {
  const d = diagnosticarInstagram({ saveRate: 0.07, sendRate: 0.04, reachRate: 0.25 });
  assert.equal(d.length, 0);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```javascript
// diagnosticarInstagram — régua IG 2026 (save/send/reach) → consertos apontando a skill. Pura.
export function diagnosticarInstagram({ saveRate = 0, sendRate = 0, reachRate = 0 } = {}) {
  const out = [];
  if (saveRate < BENCH.ig.saveRateFraco) out.push({ skill: "/post", motivo: "save rate baixo: a peça não deu nada pra guardar — incluir um slide-resumo guardável (\"salva isto\")." });
  if (sendRate < 0.005) out.push({ skill: "/post", motivo: "quase ninguém enviou: o conteúdo não ficou relatável — adicionar um gancho de envio (\"manda pra quem precisa ver\")." });
  if (reachRate < BENCH.ig.reachFraco) out.push({ skill: "/reel-marca", motivo: "alcance baixo: testar reel (mais alcance que carrossel) e refazer o hook dos 3s." });
  return out;
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-desempenho.mjs scripts/lib-desempenho.test.mjs
git commit -m "feat(desempenho): diagnosticarInstagram — sintoma → skill que conserta"
```

---

### Task 6: `parsearCsv` — lê CSV do Studio/Business Suite com mapa de aliases

**Files:**
- Modify: `scripts/lib-desempenho.mjs`
- Test: `scripts/lib-desempenho.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
import { parsearCsv } from "./lib-desempenho.mjs";

test("parsearCsv (Instagram Business Suite) mapeia Saves/Shares/Reach e ignora Impressions", () => {
  const csv = "Post Date,Reach,Impressions,Likes,Shares,Saves\n2026-06-01,1000,1300,80,30,50";
  const linhas = parsearCsv(csv);
  assert.equal(linhas[0].reach, 1000);
  assert.equal(linhas[0].saved, 50);   // alias: Saves -> saved
  assert.equal(linhas[0].shares, 30);
  assert.equal(linhas[0].impressions, undefined); // impressions ignorado (morto em 2026)
});
test("parsearCsv (YouTube Studio) mapeia Average percentage viewed e CTR", () => {
  const csv = "Views,Average percentage viewed (%),Impressions click-through rate (%)\n1200,42,5.0";
  const linhas = parsearCsv(csv);
  assert.equal(linhas[0].avdPercent, 0.42); // 42% -> 0.42
  assert.equal(linhas[0].ctr, 0.05);        // 5.0% -> 0.05
});
test("parsearCsv vazio devolve []", () => {
  assert.deepEqual(parsearCsv(""), []);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```javascript
// Mapa de aliases: nome de coluna (CSV do Studio/Business Suite, minúsculo) -> campo canônico.
// Impressions NÃO está no mapa de propósito (morto em 2026 — usar reach/views).
const ALIAS = {
  "reach": "reach", "accounts reached": "reach",
  "saves": "saved", "saved": "saved",
  "shares": "shares", "sends": "shares",
  "likes": "likes", "likes & reactions": "likes", "likes and reactions": "likes",
  "comments": "comments",
  "views": "views", "plays": "views",
  "average percentage viewed (%)": "avdPercent", "average percentage viewed": "avdPercent",
  "impressions click-through rate (%)": "ctr", "ctr (%)": "ctr",
  "watch time (hours)": "watchTimeHoras",
  "subscribers": "subscribersGained",
};
// campos que vêm em % e viram fração 0-1:
const PERCENTUAIS = new Set(["avdPercent", "ctr"]);

// parsearCsv — lê um CSV (cabeçalho + linhas) do Studio ou Business Suite e devolve linhas
// normalizadas pelos aliases. Impressions é ignorado. % vira fração. Pura.
export function parsearCsv(texto) {
  const linhas = String(texto).trim().split(/\r?\n/).filter(Boolean);
  if (linhas.length < 2) return [];
  const cab = linhas[0].split(",").map((h) => h.trim().toLowerCase());
  return linhas.slice(1).map((l) => {
    const cels = l.split(",");
    const obj = {};
    cab.forEach((h, i) => {
      const campo = ALIAS[h];
      if (!campo) return;
      let v = Number(cels[i]);
      if (Number.isNaN(v)) { obj[campo] = cels[i]?.trim(); return; }
      if (PERCENTUAIS.has(campo)) v = v / 100;
      obj[campo] = v;
    });
    return obj;
  });
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-desempenho.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-desempenho.mjs scripts/lib-desempenho.test.mjs
git commit -m "feat(desempenho): parsearCsv — Studio/Business Suite com aliases (impressions ignorado)"
```

---

### Task 7: `/desempenho` SKILL.md vira a porta única

**Files:**
- Modify: `.claude/skills/desempenho/SKILL.md`

> Doc — sem teste. As funções que ela orquestra têm teste (Tasks 1-6).

- [ ] **Step 1: Reescrever o SKILL.md** como porta única.

Substituir o conteúdo de `.claude/skills/desempenho/SKILL.md` (manter o frontmatter `name`/
`description`, atualizar a description pra mencionar YouTube + Instagram) por uma versão que:
- Detecta a plataforma: pergunta "é do YouTube ou do Instagram?" OU infere do CSV colado (se tem
  coluna `Average percentage viewed` → YT; se tem `Saves`/`Reach` → IG).
- Pega os dados (Escada de Contexto): v1 = colar os números do app/Studio ou apontar o CSV
  exportado (Business Suite / Studio Advanced→Export). API oficial = v2 (avisar que existe).
- Roda o cálculo via `scripts/lib-desempenho.mjs` (parsearCsv → taxasYouTube/taxasInstagram →
  detectarCurva [se houver a série] → diagnosticarYouTube/diagnosticarInstagram).
- Traduz pro dono em linguagem simples: o veredito (foi bem/médio/fraco vs benchmark) + a lista
  de consertos APONTANDO a skill ("a retenção caiu nos 30s → o hook está fraco, rode /roteiro-yt").
- Grava o aprendizado em `nucleo/aprendizados.md` (o que funcionou ganha prioridade no próximo
  `/calendario`); o que deu spike/forte vira padrão a repetir.

O texto deve deixar claro: **YouTube e Instagram medem coisas diferentes** (YT = retenção/curva/CTR;
IG = save/send/reach) — a skill usa a régua certa de cada um. Benchmarks: citar os da pesquisa
(IG save <2% fraco / 6%+ forte; YT AVD educacional ~42%; retenção 1º min ≥65-70%; CTR vs a média
do próprio canal). **Cálculo é sempre do script, nunca de cabeça.**

- [ ] **Step 2: Verificar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && grep -n "Instagram\|YouTube\|lib-desempenho\|aprendizados" .claude/skills/desempenho/SKILL.md | head`
Expected: menciona as duas plataformas, o script e o aprendizados.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/desempenho/SKILL.md
git commit -m "feat(desempenho): porta única YouTube+Instagram com diagnóstico acionável"
```

---

### Task 8: `/desempenho-yt` vira redirect

**Files:**
- Modify: `.claude/skills/desempenho-yt/SKILL.md`

- [ ] **Step 1: Encurtar o SKILL.md pra um redirect** que mantém o gatilho (quem chama
`/desempenho-yt` ou "mede a retenção do vídeo") mas aponta pra `/desempenho`:

Manter o frontmatter (name `desempenho-yt`, description com os gatilhos de YouTube), e o corpo
vira: "Esta análise agora vive na porta única **`/desempenho`** — que detecta a plataforma e usa
a régua de YouTube (retenção, curva, CTR vs a média do canal) com diagnóstico que aponta a skill
que conserta (hook fraco → /roteiro-yt; queda no meio → /editar-video; CTR → /thumbnail). Rodar
`/desempenho` e informar que é do YouTube (ou colar o CSV do Studio). O cálculo está em
`scripts/lib-desempenho.mjs` (régua YT) + `scripts/metricas-youtube.mjs` (OAuth/API, v2)."

- [ ] **Step 2: Verificar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && grep -n "/desempenho" .claude/skills/desempenho-yt/SKILL.md`
Expected: aponta pra `/desempenho`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/desempenho-yt/SKILL.md
git commit -m "refactor(desempenho-yt): vira redirect pra porta única /desempenho"
```

---

## Self-Review (preenchido)

**Spec coverage:**
- Núcleo comum + cálculo determinístico → `lib-desempenho.mjs` (Tasks 1-6). ✓
- Régua Instagram (save/send/reach, por formato, impressions morto) → Tasks 1, 5, 6. ✓
- Régua YouTube completa (AVD por duração, CTR vs canal, 1º min, watch time, curva) → Tasks 2, 3. ✓
- Diagnóstico acionável (sintoma→skill) YT e IG → Tasks 4, 5. ✓
- parsearCsv com aliases CSV↔API, impressions ignorado → Task 6. ✓
- Porta única detecta plataforma + traduz + grava aprendizados → Task 7. ✓
- /desempenho-yt redirect → Task 8. ✓
- v1 colar/CSV; API v2 → Task 7 (texto) + reuso do metricas-youtube.mjs citado. ✓

**Placeholder scan:** sem TBD/TODO. Tasks 7-8 são doc (texto descritivo do que o SKILL.md deve
conter, não código) — apropriado pra skill de processo; o que inserir está especificado.

**Type consistency:** `BENCH` (ig/yt), `taxasInstagram({reach,saved,shares,seguidores,formato})→
{saveRate,sendRate,reachRate}`, `taxasYouTube({avdPercent,duracaoSeg,ehShort,ctr,mediaCanalCtr,
retencao1min,watchTimeMin})→{avdBom,ctrVsCanal,primeiroMinBom,...}`, `detectarCurva(serie,{duracaoSeg})
→{introDip,cliffs,spikes}|null`, `diagnosticarYouTube({taxas,curva})→[{skill,motivo}]`,
`diagnosticarInstagram({saveRate,sendRate,reachRate})→[{skill,motivo}]`, `parsearCsv(texto)→[obj]`.
Campos canônicos do parser (`saved`,`shares`,`reach`,`avdPercent`,`ctr`,`views`) batem com o que
as funções de taxa consomem. Consistente.
