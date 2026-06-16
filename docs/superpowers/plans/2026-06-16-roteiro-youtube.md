# Canal YouTube — roteiro, voz e radar de criadores (Fase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao ImpulsoX-OS a capacidade de escrever roteiro de vídeo (long-form + short)
pro canal YouTube do dono, com voz própria de narração, moldes extraídos de vídeos de
sucesso (`/formulas` estendido) e um radar que monitora 7 criadores de referência via RSS
público, classifica relevância pelos 3 pilares do canal e dissecta automaticamente o que
bate, sem nunca acessar nada atrás de login.

**Architecture:** `canal-youtube/` é uma entidade isolada (própria pasta na raiz, fora de
`producao/`) com `voz-canal.md`, `pilares.md`, `criadores-monitorados.md` e a fila de
pesquisa. Um módulo novo `scripts/lib-youtube.mjs` concentra toda a lógica pura e de rede
(parse de RSS, parse de transcript, classificação de relevância) — testável sem chamar o
YouTube de verdade. `scripts/checar-criadores-yt.mjs` orquestra o radar; `scripts/
transcript-youtube.mjs` é o utilitário de linha de comando standalone. As skills
(`/voz`, `/formulas`, `/roteiro-yt`) são markdown — orquestram humano+IA, não código.

**Tech Stack:** Node ≥18 ESM (`fetch` nativo — ZERO deps novas), `node --test`. RSS Atom
público do YouTube, página pública do vídeo (captionTracks) e endpoint `timedtext`
público — nenhum exige API key nem login.

---

## Task 1: Scaffolding de `canal-youtube/`

**Files:**
- Create: `canal-youtube/escada.md`
- Create: `canal-youtube/pilares.md`
- Create: `canal-youtube/criadores-monitorados.md`
- Create: `canal-youtube/pesquisa/.gitkeep`
- Create: `canal-youtube/roteiros/longa/.gitkeep`
- Create: `canal-youtube/roteiros/shorts/.gitkeep`

- [ ] **Step 1: Criar `canal-youtube/escada.md`**

```markdown
# Escada de Contexto — Canal YouTube

> Registra o degrau de contexto do canal. Ver o princípio "Escada de Contexto" no CLAUDE.md.

**Degrau atual:** 2 — formato e pilares decididos, voz de narração ainda não capturada

**Fatos confirmados:**
- Formato: screen recording narrado, voz real do dono (sem TTS/clone de voz).
- Duração long-form: 8-15min. Shorts: cortados do longo (`[CORTE-SHORT: ...]` no roteiro)
  + standalone quando não houver vídeo longo pra cortar.
- 3 pilares definidos em `pilares.md`. Mix decidido por dado real (`/desempenho` do canal,
  Fase 3) quando houver histórico — por ora o dono escolhe o pilar por vídeo.
- Entidade separada do resto do ImpulsoX-OS — isolamento total pra extrair como produto
  vendável (`ImpulsoX-YT-OS`) só depois de validar com vídeos reais.

**Suposições a confirmar:**
- Voz de narração ainda não capturada por entrevista — rodar `/voz --canal` antes do
  primeiro roteiro real.

**Próximo degrau:** rode `/voz --canal` pra subir ao degrau 3 (voz capturada).
```

- [ ] **Step 2: Criar `canal-youtube/pilares.md`**

```markdown
# Pilares de conteúdo — canal

> Mix decidido por dado real (`/desempenho` do canal, Fase 3) quando houver histórico. Até
> lá, o dono escolhe o pilar por vídeo. Cada pilar carrega palavras-chave usadas pelo
> `checar-criadores-yt.mjs` pra classificar relevância de vídeo de criador monitorado —
> formato: linha `Palavras-chave:` com termos separados por vírgula, em qualquer caixa.

## Ensinar Claude Code do zero
Quem nunca usou Claude Code aprendendo na prática — comandos, skills, fluxo de trabalho,
"o que dá pra fazer aqui dentro" que ninguém explica em lugar nenhum.

Palavras-chave: claude code, anthropic, ai coding, vibe coding, agente de codigo, terminal ai, coding agent

## Mostrar produtos e funcionalidades construídos
Prova em ação — o que já foi construído com o sistema (landing pages, automações,
conectores) e como.

Palavras-chave: landing page, automação, build in public, case real, projeto, mvp, ship

## Mostrar o ImpulsoX-OS rodando
O próprio sistema operacional de marketing em uso — bastidores de como ele decide,
produz e mede.

Palavras-chave: impulsox, sistema operacional de marketing, agencia de ia, marketing automatizado, agente de marketing
```

- [ ] **Step 3: Criar `canal-youtube/criadores-monitorados.md`**

```markdown
# Criadores monitorados — radar de formato

> Lido pelo `checar-criadores-yt.mjs`. RSS público, sem API key, sem login:
> `https://www.youtube.com/feeds/videos.xml?channel_id=<Channel ID>`. Linha sem Channel ID
> válido (`UC` + 22 caracteres) é ignorada pelo monitoramento até ser resolvida — ver
> `scripts/resolver-canal-yt.mjs`.

| Criador | Handle | Channel ID |
|---|---|---|
| Sabrina Ramonov | — | UCiGWNa6QK6CiKPvv5-YPv8g |
| Luuk Alleman | — | UCJ2PJj3yRgUvzHb4XCCCLEw |
| Jonathan Acuña "Doctor AI" | @jonathanacuna | UCOJp1lsu9vCF-TllwMzcCLg |
| Duncan Rogoff | — | UC37JpWP5PxLSma2lh79HU9A |
| Chase AI | @Chase-H-AI | (resolver) |
| Matt Ganzak | @mattganzak | (resolver) |
| Yury AI | @Yury_AI | (resolver) |
```

- [ ] **Step 4: Criar os diretórios vazios com `.gitkeep`**

```bash
mkdir -p canal-youtube/pesquisa canal-youtube/roteiros/longa canal-youtube/roteiros/shorts
touch canal-youtube/pesquisa/.gitkeep canal-youtube/roteiros/longa/.gitkeep canal-youtube/roteiros/shorts/.gitkeep
```

- [ ] **Step 5: Commit**

```bash
git add canal-youtube/
git commit -m "feat(canal-youtube): scaffolding da entidade do canal (escada, pilares, criadores monitorados)"
```

---

## Task 2: `lib-youtube.mjs` — `parseFeedRSS`

**Files:**
- Create: `scripts/lib-youtube.mjs`
- Test: `scripts/lib-youtube.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeedRSS } from "./lib-youtube.mjs";

const RSS_EXEMPLO = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
<entry>
<id>yt:video:abc12345678</id>
<yt:videoId>abc12345678</yt:videoId>
<yt:channelId>UCiGWNa6QK6CiKPvv5-YPv8g</yt:channelId>
<title>Como usar Claude Code do zero</title>
<published>2026-06-10T12:00:00+00:00</published>
<author><name>Canal Teste</name></author>
<media:group><media:description>Tutorial completo de claude code para iniciantes</media:description></media:group>
</entry>
<entry>
<id>yt:video:zzz98765432</id>
<yt:videoId>zzz98765432</yt:videoId>
<yt:channelId>UCiGWNa6QK6CiKPvv5-YPv8g</yt:channelId>
<title>Receita de bolo de cenoura</title>
<published>2026-06-09T12:00:00+00:00</published>
<author><name>Canal Teste</name></author>
<media:group><media:description>Bolo fofinho em 20 minutos</media:description></media:group>
</entry>
</feed>`;

test("parseFeedRSS extrai videoId, titulo, descricao, publicado e canal de cada entry", () => {
  const entradas = parseFeedRSS(RSS_EXEMPLO);
  assert.equal(entradas.length, 2);
  assert.deepEqual(entradas[0], {
    videoId: "abc12345678",
    titulo: "Como usar Claude Code do zero",
    descricao: "Tutorial completo de claude code para iniciantes",
    publicado: "2026-06-10T12:00:00+00:00",
    canal: "Canal Teste",
  });
  assert.equal(entradas[1].videoId, "zzz98765432");
});

test("parseFeedRSS devolve lista vazia pra feed sem entry", () => {
  assert.deepEqual(parseFeedRSS("<feed></feed>"), []);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube.test.mjs` → FAIL (módulo `./lib-youtube.mjs` não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
// lib-youtube.mjs — helpers puros e de rede pro radar de criadores e transcript do
// YouTube. Tudo aqui acessa só dado PÚBLICO (RSS do canal, página do vídeo, endpoint de
// legenda) — nunca atrás de login, mesma régua do /formulas. ImpulsoX AI. ZERO deps.

// Extrai videoId/título/descrição/data/canal de cada <entry> do feed Atom público do
// YouTube (https://www.youtube.com/feeds/videos.xml?channel_id=...).
export function parseFeedRSS(xml) {
  const entradas = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  return entradas
    .map((bloco) => ({
      videoId: bloco.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || "",
      titulo: bloco.match(/<title>([^<]*)<\/title>/)?.[1] || "",
      descricao: bloco.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1]?.trim() || "",
      publicado: bloco.match(/<published>([^<]+)<\/published>/)?.[1] || "",
      canal: bloco.match(/<author>\s*<name>([^<]*)<\/name>\s*<\/author>/)?.[1] || "",
    }))
    .filter((e) => e.videoId);
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube.test.mjs` → 2 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube.mjs scripts/lib-youtube.test.mjs
git commit -m "feat(youtube): parseFeedRSS — extrai entradas do feed Atom público do YouTube"
```

---

## Task 3: `lib-youtube.mjs` — `parseTimedText`

**Files:**
- Modify: `scripts/lib-youtube.mjs`
- Modify: `scripts/lib-youtube.test.mjs`

- [ ] **Step 1: Write the failing test** (acrescentar ao arquivo de teste existente)

```javascript
import { parseTimedText } from "./lib-youtube.mjs";

const TIMEDTEXT_EXEMPLO = `<?xml version="1.0" encoding="utf-8" ?><transcript><text start="0.5" dur="2.3">Hello there</text><text start="2.8" dur="3.1">Welcome &amp; thanks</text></transcript>`;

test("parseTimedText extrai inicio e texto decodificado de cada bloco", () => {
  const blocos = parseTimedText(TIMEDTEXT_EXEMPLO);
  assert.deepEqual(blocos, [
    { inicio: 0.5, texto: "Hello there" },
    { inicio: 2.8, texto: "Welcome & thanks" },
  ]);
});

test("parseTimedText devolve lista vazia sem blocos <text>", () => {
  assert.deepEqual(parseTimedText("<transcript></transcript>"), []);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube.test.mjs` → FAIL (`parseTimedText` não exportada).

- [ ] **Step 3: Write minimal implementation** (acrescentar a `lib-youtube.mjs`)

```javascript
function decodificarEntidades(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Extrai {inicio, texto} de cada <text start="..."> do endpoint público timedtext.
export function parseTimedText(xml) {
  const blocos = [...xml.matchAll(/<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g)];
  return blocos.map(([, inicio, textoBruto]) => ({
    inicio: Number(inicio),
    texto: decodificarEntidades(textoBruto),
  }));
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube.test.mjs` → 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube.mjs scripts/lib-youtube.test.mjs
git commit -m "feat(youtube): parseTimedText — decodifica a transcrição pública do player"
```

---

## Task 4: `lib-youtube.mjs` — `extrairTrilhasLegenda` + `escolherTrilha`

**Files:**
- Modify: `scripts/lib-youtube.mjs`
- Modify: `scripts/lib-youtube.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { extrairTrilhasLegenda, escolherTrilha } from "./lib-youtube.mjs";

const HTML_EXEMPLO = `<html><script>var ytInitialPlayerResponse = {"captions":{"playerCaptionsTracklistRenderer":{"captionTracks":[{"baseUrl":"https://www.youtube.com/api/timedtext?v=abc\\u0026lang=en","languageCode":"en","kind":"asr"},{"baseUrl":"https://www.youtube.com/api/timedtext?v=abc\\u0026lang=pt","languageCode":"pt"}]}}};</script></html>`;

test("extrairTrilhasLegenda lê as trilhas do captionTracks e decodifica a baseUrl", () => {
  const trilhas = extrairTrilhasLegenda(HTML_EXEMPLO);
  assert.equal(trilhas.length, 2);
  assert.equal(trilhas[0].idioma, "en");
  assert.equal(trilhas[0].gerada, true);
  assert.equal(trilhas[1].idioma, "pt");
  assert.equal(trilhas[1].gerada, false);
  assert.equal(trilhas[1].url, "https://www.youtube.com/api/timedtext?v=abc&lang=pt");
});

test("extrairTrilhasLegenda devolve [] quando a página não tem captionTracks", () => {
  assert.deepEqual(extrairTrilhasLegenda("<html></html>"), []);
});

test("escolherTrilha prioriza pt, depois en, depois a primeira disponível", () => {
  const trilhas = [{ idioma: "en", url: "u-en" }, { idioma: "pt", url: "u-pt" }];
  assert.equal(escolherTrilha(trilhas).url, "u-pt");
  assert.equal(escolherTrilha([{ idioma: "es", url: "u-es" }]).url, "u-es");
});

test("escolherTrilha lança erro claro quando não há nenhuma trilha", () => {
  assert.throws(() => escolherTrilha([]), /sem legenda/);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube.test.mjs` → FAIL (funções não exportadas).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Extrai as trilhas de legenda (captionTracks) embutidas na página pública do vídeo.
export function extrairTrilhasLegenda(html) {
  const m = html.match(/"captionTracks":(\[[^\]]*\])/);
  if (!m) return [];
  let arr;
  try { arr = JSON.parse(m[1]); } catch { return []; }
  return arr.map((t) => ({
    url: (t.baseUrl || "").replace(/\\u0026/g, "&"),
    idioma: t.languageCode || "",
    gerada: t.kind === "asr",
  }));
}

// Escolhe a melhor trilha por preferência de idioma; cai pra primeira disponível.
export function escolherTrilha(trilhas, preferencias = ["pt", "pt-BR", "en"]) {
  if (trilhas.length === 0) throw new Error("vídeo sem legenda disponível (nem automática).");
  for (const pref of preferencias) {
    const achada = trilhas.find((t) => t.idioma === pref || t.idioma.startsWith(pref));
    if (achada) return achada;
  }
  return trilhas[0];
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube.test.mjs` → 8 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube.mjs scripts/lib-youtube.test.mjs
git commit -m "feat(youtube): extrairTrilhasLegenda e escolherTrilha — lê captionTracks da página pública"
```

---

## Task 5: `lib-youtube.mjs` — `lerCriadores` + `lerPilares` + `classificarRelevancia`

**Files:**
- Modify: `scripts/lib-youtube.mjs`
- Modify: `scripts/lib-youtube.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { lerCriadores, lerPilares, classificarRelevancia } from "./lib-youtube.mjs";

const CRIADORES_MD = `| Criador | Handle | Channel ID |
|---|---|---|
| Sabrina Ramonov | — | UCiGWNa6QK6CiKPvv5-YPv8g |
| Chase AI | @Chase-H-AI | (resolver) |
`;

test("lerCriadores devolve só linhas com Channel ID válido (UC + 22)", () => {
  const criadores = lerCriadores(CRIADORES_MD);
  assert.equal(criadores.length, 1);
  assert.deepEqual(criadores[0], { nome: "Sabrina Ramonov", handle: "—", channelId: "UCiGWNa6QK6CiKPvv5-YPv8g" });
});

const PILARES_MD = `# Pilares de conteúdo — canal

## Ensinar Claude Code do zero
Texto de contexto aqui.

Palavras-chave: claude code, anthropic, vibe coding

## Mostrar o ImpulsoX-OS rodando
Outro texto.

Palavras-chave: impulsox, sistema operacional de marketing
`;

test("lerPilares extrai nome e palavras-chave (minúsculas, sem espaço) de cada pilar", () => {
  const pilares = lerPilares(PILARES_MD);
  assert.equal(pilares.length, 2);
  assert.equal(pilares[0].nome, "Ensinar Claude Code do zero");
  assert.deepEqual(pilares[0].palavrasChave, ["claude code", "anthropic", "vibe coding"]);
  assert.equal(pilares[1].nome, "Mostrar o ImpulsoX-OS rodando");
});

test("classificarRelevancia acerta o pilar pela palavra-chave encontrada", () => {
  const pilares = lerPilares(PILARES_MD);
  const r = classificarRelevancia("Tutorial completo de Claude Code para iniciantes", pilares);
  assert.equal(r.relevante, true);
  assert.equal(r.pilar, "Ensinar Claude Code do zero");
  assert.equal(r.palavra, "claude code");
});

test("classificarRelevancia devolve relevante:false quando nenhuma palavra-chave bate", () => {
  const pilares = lerPilares(PILARES_MD);
  const r = classificarRelevancia("Receita de bolo de cenoura fofinho", pilares);
  assert.deepEqual(r, { relevante: false, pilar: null, palavra: null });
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube.test.mjs` → FAIL (funções não exportadas).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Lê a tabela markdown de criadores monitorados. Linha sem Channel ID válido (UC + 22
// caracteres) é ignorada — fica fora do monitoramento até alguém resolver e preencher.
export function lerCriadores(md) {
  const linhas = md.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|"));
  const semSeparador = linhas.filter((l) => !/^\|[\s-:|]+\|$/.test(l));
  const linhasDados = semSeparador.slice(1); // a primeira que resta é o cabeçalho
  return linhasDados
    .map((l) => {
      const [nome, handle, channelId] = l.split("|").slice(1, -1).map((c) => c.trim());
      return { nome, handle, channelId };
    })
    .filter((c) => /^UC[\w-]{22}$/.test(c.channelId || ""));
}

// Lê os pilares (## título + linha "Palavras-chave: a, b, c") de canal-youtube/pilares.md.
export function lerPilares(md) {
  const blocos = md.split(/\n##\s+/).slice(1);
  return blocos.map((bloco) => {
    const linhas = bloco.split("\n");
    const nome = linhas[0].trim();
    const linhaChave = linhas.find((l) => /^Palavras-chave:/i.test(l.trim()));
    const palavrasChave = linhaChave
      ? linhaChave.replace(/^Palavras-chave:/i, "").split(",").map((p) => p.trim().toLowerCase()).filter(Boolean)
      : [];
    return { nome, palavrasChave };
  });
}

// Classifica um texto (título+descrição de vídeo) contra os pilares — primeira palavra-
// chave encontrada decide o pilar. Substring simples, sem peso nem score.
export function classificarRelevancia(texto, pilares) {
  const t = texto.toLowerCase();
  for (const pilar of pilares) {
    const achada = pilar.palavrasChave.find((p) => t.includes(p));
    if (achada) return { relevante: true, pilar: pilar.nome, palavra: achada };
  }
  return { relevante: false, pilar: null, palavra: null };
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube.test.mjs` → 12 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube.mjs scripts/lib-youtube.test.mjs
git commit -m "feat(youtube): lerCriadores, lerPilares e classificarRelevancia — parsing dos arquivos do canal"
```

---

## Task 6: `lib-youtube.mjs` — `resolverChannelId` + `scripts/resolver-canal-yt.mjs`

**Files:**
- Modify: `scripts/lib-youtube.mjs`
- Modify: `scripts/lib-youtube.test.mjs`
- Create: `scripts/resolver-canal-yt.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { createServer } from "node:http";
import { resolverChannelId } from "./lib-youtube.mjs";

function mockCanalHtml(channelId) {
  return createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<html><script>var x = {"channelId":"${channelId}"};</script></html>`);
  });
}

test("resolverChannelId acha o channelId na página pública do handle", async () => {
  const srv = mockCanalHtml("UCAAAAAAAAAAAAAAAAAAAAAA");
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const id = await resolverChannelId("@TesteAI", { baseUrl: base });
  assert.equal(id, "UCAAAAAAAAAAAAAAAAAAAAAA");
  srv.close();
});

test("resolverChannelId lança erro claro quando não acha channelId na página", async () => {
  const srv = createServer((req, res) => { res.writeHead(200).end("<html>sem nada aqui</html>"); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  await assert.rejects(() => resolverChannelId("@semcanal", { baseUrl: base }), /não achei o channelId/);
  srv.close();
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube.test.mjs` → FAIL (`resolverChannelId` não exportada).

- [ ] **Step 3: Write minimal implementation** (acrescentar a `lib-youtube.mjs`)

```javascript
// Resolve o Channel ID (UC...) a partir do @handle público — abre a página do canal
// (sem login, sem API key) e lê o channelId embutido no HTML.
export async function resolverChannelId(handle, { baseUrl = "https://www.youtube.com" } = {}) {
  const h = handle.startsWith("@") ? handle : `@${handle}`;
  const r = await fetch(`${baseUrl}/${h}`);
  if (!r.ok) throw new Error(`não consegui abrir a página do canal ${h} (HTTP ${r.status}).`);
  const html = await r.text();
  const m = html.match(/"channelId":"(UC[\w-]{22})"/);
  if (!m) throw new Error(`não achei o channelId na página de ${h} — confirma o handle.`);
  return m[1];
}
```

E o CLI standalone (novo arquivo):

```javascript
#!/usr/bin/env node
/**
 * resolver-canal-yt.mjs — descobre o Channel ID público a partir de um @handle do
 * YouTube, pra preencher canal-youtube/criadores-monitorados.md. ImpulsoX AI.
 * Uso: node scripts/resolver-canal-yt.mjs @Chase-H-AI
 */
import { resolverChannelId } from "./lib-youtube.mjs";

if (import.meta.main) {
  const handle = process.argv[2];
  if (!handle) { console.error("ERRO: informe o @handle do canal."); process.exit(1); }
  resolverChannelId(handle)
    .then((id) => console.log(id))
    .catch((e) => { console.error("ERRO: " + e.message); process.exit(1); });
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube.test.mjs` → 14 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube.mjs scripts/lib-youtube.test.mjs scripts/resolver-canal-yt.mjs
git commit -m "feat(youtube): resolverChannelId + CLI resolver-canal-yt — acha Channel ID por @handle"
```

---

## Task 7: `lib-youtube.mjs` — `buscarFeedRSS`

**Files:**
- Modify: `scripts/lib-youtube.mjs`
- Modify: `scripts/lib-youtube.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { buscarFeedRSS } from "./lib-youtube.mjs";

test("buscarFeedRSS busca o RSS público do canal e devolve as entradas parseadas", async () => {
  const srv = createServer((req, res) => {
    if (req.url.includes("/feeds/videos.xml")) {
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end(RSS_EXEMPLO);
    } else { res.writeHead(404).end(); }
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const entradas = await buscarFeedRSS("UCiGWNa6QK6CiKPvv5-YPv8g", { baseUrl: base });
  assert.equal(entradas.length, 2);
  srv.close();
});

test("buscarFeedRSS lança erro claro em HTTP de erro", async () => {
  const srv = createServer((req, res) => { res.writeHead(404).end(); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  await assert.rejects(() => buscarFeedRSS("UCxxx", { baseUrl: base }), /RSS do canal/);
  srv.close();
});
```

(`RSS_EXEMPLO` já existe no topo do arquivo de teste, da Task 2 — reaproveitar.)

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube.test.mjs` → FAIL (`buscarFeedRSS` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Monta a URL do RSS público (sem API key) do canal.
export function feedUrlPara(channelId, baseUrl = "https://www.youtube.com") {
  return `${baseUrl}/feeds/videos.xml?channel_id=${channelId}`;
}

// Busca e parseia o RSS público do canal.
export async function buscarFeedRSS(channelId, { baseUrl = "https://www.youtube.com" } = {}) {
  const r = await fetch(feedUrlPara(channelId, baseUrl));
  if (!r.ok) throw new Error(`RSS do canal ${channelId} falhou (HTTP ${r.status}).`);
  return parseFeedRSS(await r.text());
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube.test.mjs` → 16 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube.mjs scripts/lib-youtube.test.mjs
git commit -m "feat(youtube): feedUrlPara e buscarFeedRSS — RSS público do canal, sem API key"
```

---

## Task 8: `lib-youtube.mjs` — `buscarTranscript`

**Files:**
- Modify: `scripts/lib-youtube.mjs`
- Modify: `scripts/lib-youtube.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { buscarTranscript } from "./lib-youtube.mjs";

test("buscarTranscript abre a página do vídeo, acha a trilha e baixa o timedtext", async () => {
  const srv = createServer(async (req, res) => {
    if (req.url.startsWith("/watch")) {
      const porta = req.socket.localPort;
      const trackUrl = `http://127.0.0.1:${porta}/timedtext?lang=pt`;
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<html><script>var x = {"captionTracks":[{"baseUrl":"${trackUrl}","languageCode":"pt"}]};</script></html>`);
    } else if (req.url.startsWith("/timedtext")) {
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end(TIMEDTEXT_EXEMPLO);
    } else { res.writeHead(404).end(); }
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const blocos = await buscarTranscript("abc12345678", { baseUrl: base });
  assert.equal(blocos.length, 2);
  assert.equal(blocos[0].texto, "Hello there");
  srv.close();
});

test("buscarTranscript lança erro claro quando o vídeo não tem legenda", async () => {
  const srv = createServer((req, res) => { res.writeHead(200).end("<html>sem captionTracks</html>"); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  await assert.rejects(() => buscarTranscript("zzz", { baseUrl: base }), /sem legenda/);
  srv.close();
});
```

(`TIMEDTEXT_EXEMPLO` já existe no arquivo de teste, da Task 3 — reaproveitar.)

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube.test.mjs` → FAIL (`buscarTranscript` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Busca a transcrição pública de um vídeo: abre a página, acha a melhor trilha de
// legenda disponível e baixa o timedtext. Sem API key, sem login.
export async function buscarTranscript(videoId, { baseUrl = "https://www.youtube.com" } = {}) {
  const r = await fetch(`${baseUrl}/watch?v=${videoId}`);
  if (!r.ok) throw new Error(`não consegui abrir o vídeo ${videoId} (HTTP ${r.status}).`);
  const html = await r.text();
  const trilha = escolherTrilha(extrairTrilhasLegenda(html));
  const rt = await fetch(trilha.url);
  if (!rt.ok) throw new Error(`download da legenda de ${videoId} falhou (HTTP ${rt.status}).`);
  return parseTimedText(await rt.text());
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube.test.mjs` → 18 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube.mjs scripts/lib-youtube.test.mjs
git commit -m "feat(youtube): buscarTranscript — transcrição pública completa, sem API key"
```

---

## Task 9: `scripts/transcript-youtube.mjs` (CLI)

**Files:**
- Create: `scripts/transcript-youtube.mjs`
- Test: `scripts/transcript-youtube.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { extrairVideoId } from "./transcript-youtube.mjs";

test("extrairVideoId reconhece URL completa, youtu.be, shorts e videoId puro", () => {
  assert.equal(extrairVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extrairVideoId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extrairVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extrairVideoId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});

test("extrairVideoId devolve null pra entrada não reconhecida", () => {
  assert.equal(extrairVideoId("https://exemplo.com/pagina"), null);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/transcript-youtube.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
#!/usr/bin/env node
/**
 * transcript-youtube.mjs — puxa a transcrição pública de um vídeo do YouTube (legenda
 * manual ou automática), sem API key e sem login — mesmo dado que o painel "Mostrar
 * transcrição" do player exibe. ImpulsoX AI.
 *
 * Uso: node scripts/transcript-youtube.mjs <url-ou-videoId> [--texto]
 *   sem --texto: imprime JSON [{inicio, texto}, ...]
 *   com --texto: imprime só o texto corrido, sem timestamp
 */
import { buscarTranscript } from "./lib-youtube.mjs";

// Reconhece o videoId (11 caracteres) em URL completa, youtu.be, /shorts/ ou já puro.
export function extrairVideoId(entrada) {
  const m = entrada.match(/(?:v=|youtu\.be\/|\/shorts\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(entrada) ? entrada : null;
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const [entrada, ...flags] = process.argv.slice(2);
  if (!entrada) falhar("informe a URL ou o videoId do vídeo.");
  const videoId = extrairVideoId(entrada);
  if (!videoId) falhar("não reconheci um videoId nessa entrada.");
  const soTexto = flags.includes("--texto");

  buscarTranscript(videoId)
    .then((blocos) => {
      if (soTexto) console.log(blocos.map((b) => b.texto).join(" "));
      else console.log(JSON.stringify(blocos, null, 2));
    })
    .catch((e) => falhar(e.message));
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/transcript-youtube.test.mjs` → 2 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/transcript-youtube.mjs scripts/transcript-youtube.test.mjs
git commit -m "feat(youtube): transcript-youtube.mjs — CLI de transcrição pública standalone"
```

---

## Task 10: `scripts/checar-criadores-yt.mjs` — orquestrador do radar

**Files:**
- Create: `scripts/checar-criadores-yt.mjs`
- Test: `scripts/checar-criadores-yt.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checarCriadores } from "./checar-criadores-yt.mjs";

const RSS_DUAS_ENTRADAS = (channelId) => `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
<entry>
<yt:videoId>relevante01</yt:videoId>
<title>Como usar Claude Code do zero</title>
<published>2026-06-10T12:00:00+00:00</published>
<author><name>Canal Teste</name></author>
<media:group><media:description>Tutorial completo de claude code</media:description></media:group>
</entry>
<entry>
<yt:videoId>irrelevante1</yt:videoId>
<title>Receita de bolo de cenoura</title>
<published>2026-06-09T12:00:00+00:00</published>
<author><name>Canal Teste</name></author>
<media:group><media:description>Bolo fofinho em 20 minutos</media:description></media:group>
</entry>
</feed>`;

function montarFixture() {
  const raiz = mkdtempSync(join(tmpdir(), "canal-yt-"));
  mkdirSync(join(raiz, "canal-youtube", "pesquisa"), { recursive: true });
  writeFileSync(join(raiz, "canal-youtube", "criadores-monitorados.md"),
    `| Criador | Handle | Channel ID |\n|---|---|---|\n| Canal Teste | — | UCAAAAAAAAAAAAAAAAAAAAAA |\n`);
  writeFileSync(join(raiz, "canal-youtube", "pilares.md"),
    `## Ensinar Claude Code do zero\nPalavras-chave: claude code\n`);
  return raiz;
}

function mockYoutube({ comTranscript = true } = {}) {
  return createServer((req, res) => {
    if (req.url.includes("/feeds/videos.xml")) {
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end(RSS_DUAS_ENTRADAS("UCAAAAAAAAAAAAAAAAAAAAAA"));
    } else if (req.url.startsWith("/watch") && comTranscript) {
      const porta = req.socket.localPort;
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<html><script>var x = {"captionTracks":[{"baseUrl":"http://127.0.0.1:${porta}/timedtext","languageCode":"pt"}]};</script></html>`);
    } else if (req.url.startsWith("/timedtext")) {
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end(`<transcript><text start="0.0">Falando sobre claude code</text></transcript>`);
    } else { res.writeHead(404).end(); }
  });
}

test("checarCriadores grava na fila só o vídeo relevante e ignora o irrelevante", async () => {
  const raiz = montarFixture();
  const srv = mockYoutube();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;

  const r1 = await checarCriadores({ raiz, baseUrl });
  assert.equal(r1.relevantes.length, 1);
  assert.equal(r1.relevantes[0].videoId, "relevante01");

  const fila = readFileSync(join(raiz, "canal-youtube", "pesquisa", "fila.md"), "utf8");
  assert.match(fila, /Como usar Claude Code do zero/);
  assert.doesNotMatch(fila, /Receita de bolo de cenoura/);

  srv.close();
});

test("checarCriadores não reprocessa vídeo já visto numa segunda chamada", async () => {
  const raiz = montarFixture();
  const srv = mockYoutube();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;

  await checarCriadores({ raiz, baseUrl });
  const r2 = await checarCriadores({ raiz, baseUrl });
  assert.equal(r2.relevantes.length, 0);

  srv.close();
});

test("checarCriadores segue mesmo se um criador falhar (RSS indisponível)", async () => {
  const raiz = mkdtempSync(join(tmpdir(), "canal-yt-"));
  mkdirSync(join(raiz, "canal-youtube", "pesquisa"), { recursive: true });
  writeFileSync(join(raiz, "canal-youtube", "criadores-monitorados.md"),
    `| Criador | Handle | Channel ID |\n|---|---|---|\n| Canal Quebrado | — | UCBBBBBBBBBBBBBBBBBBBBBB |\n`);
  writeFileSync(join(raiz, "canal-youtube", "pilares.md"), `## Pilar\nPalavras-chave: x\n`);
  const srv = createServer((req, res) => res.writeHead(500).end());
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;

  const r = await checarCriadores({ raiz, baseUrl });
  assert.equal(r.relevantes.length, 0);
  assert.equal(r.totalCriadores, 1);

  srv.close();
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/checar-criadores-yt.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
#!/usr/bin/env node
/**
 * checar-criadores-yt.mjs — varre o RSS dos criadores monitorados, detecta vídeo novo,
 * classifica relevância contra os 3 pilares do canal e, quando relevante, busca a
 * transcrição pública e grava na fila pra dissecção (Modo 4 do /formulas). Nunca acessa
 * nada atrás de login — só RSS público e a página pública do vídeo. ImpulsoX AI.
 *
 * Nota: na primeira execução (sem `.ultimo-visto.json`), TODOS os vídeos atuais do feed
 * de cada criador entram como "novos" — é a carga inicial. Execuções seguintes só pegam
 * o que entrou depois do último visto.
 *
 * Uso: node scripts/checar-criadores-yt.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { lerCriadores, lerPilares, buscarFeedRSS, classificarRelevancia, buscarTranscript } from "./lib-youtube.mjs";

const REL_CRIADORES = ["canal-youtube", "criadores-monitorados.md"];
const REL_PILARES = ["canal-youtube", "pilares.md"];
const REL_ULTIMO_VISTO = ["canal-youtube", "pesquisa", ".ultimo-visto.json"];
const REL_FILA = ["canal-youtube", "pesquisa", "fila.md"];

function lerUltimoVisto(raiz) {
  const caminho = join(raiz, ...REL_ULTIMO_VISTO);
  if (!existsSync(caminho)) return {};
  return JSON.parse(readFileSync(caminho, "utf8"));
}

function gravarUltimoVisto(raiz, estado) {
  const caminho = join(raiz, ...REL_ULTIMO_VISTO);
  mkdirSync(join(raiz, "canal-youtube", "pesquisa"), { recursive: true });
  writeFileSync(caminho, JSON.stringify(estado, null, 2));
}

function gravarNaFila(raiz, entrada) {
  const caminho = join(raiz, ...REL_FILA);
  mkdirSync(join(raiz, "canal-youtube", "pesquisa"), { recursive: true });
  if (!existsSync(caminho)) writeFileSync(caminho, "# Fila de pesquisa — vídeos relevantes detectados\n\n");
  const linhaTranscript = entrada.transcriptErro
    ? `- **Transcrição:** indisponível (${entrada.transcriptErro})`
    : `- **Transcrição:** capturada (${entrada.transcript.length} trechos)`;
  const bloco = [
    `## ${entrada.titulo}`,
    `- **Canal:** ${entrada.canal}`,
    `- **Pilar:** ${entrada.pilar}`,
    `- **Link:** https://www.youtube.com/watch?v=${entrada.videoId}`,
    `- **Publicado:** ${entrada.publicado}`,
    `- **Status:** a dissecar`,
    linhaTranscript,
    "",
  ].join("\n");
  appendFileSync(caminho, bloco + "\n");
}

export async function checarCriadores({ raiz = process.cwd(), baseUrl } = {}) {
  const criadores = lerCriadores(readFileSync(join(raiz, ...REL_CRIADORES), "utf8"));
  const pilares = lerPilares(readFileSync(join(raiz, ...REL_PILARES), "utf8"));
  const ultimoVisto = lerUltimoVisto(raiz);
  const relevantes = [];

  for (const criador of criadores) {
    let videos;
    try {
      videos = await buscarFeedRSS(criador.channelId, { baseUrl });
    } catch (e) {
      console.error(`AVISO: RSS de ${criador.nome} falhou — ${e.message}`);
      continue;
    }

    const ultimoId = ultimoVisto[criador.channelId];
    const novos = [];
    for (const v of videos) {
      if (v.videoId === ultimoId) break;
      novos.push(v);
    }
    if (videos.length > 0) ultimoVisto[criador.channelId] = videos[0].videoId;

    for (const v of novos) {
      const classe = classificarRelevancia(`${v.titulo} ${v.descricao}`, pilares);
      if (!classe.relevante) continue;
      let transcript, transcriptErro;
      try {
        transcript = await buscarTranscript(v.videoId, { baseUrl });
      } catch (e) {
        transcriptErro = e.message;
      }
      const entrada = { ...v, canal: criador.nome, pilar: classe.pilar, transcript, transcriptErro };
      gravarNaFila(raiz, entrada);
      relevantes.push(entrada);
    }
  }

  gravarUltimoVisto(raiz, ultimoVisto);
  return { totalCriadores: criadores.length, relevantes };
}

if (import.meta.main) {
  checarCriadores()
    .then((r) => console.log(JSON.stringify({ ok: true, totalCriadores: r.totalCriadores, relevantes: r.relevantes.map((v) => v.titulo) }, null, 2)))
    .catch((e) => { console.error("ERRO: " + e.message); process.exit(1); });
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/checar-criadores-yt.test.mjs` → 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/checar-criadores-yt.mjs scripts/checar-criadores-yt.test.mjs
git commit -m "feat(youtube): checar-criadores-yt.mjs — radar com classificação por pilar e dissecção automática"
```

---

## Task 11: Resolver os Channel IDs reais e fechar `criadores-monitorados.md`

**Files:**
- Modify: `canal-youtube/criadores-monitorados.md`

- [ ] **Step 1: Rodar o resolvedor pros 3 criadores pendentes**

```bash
node scripts/resolver-canal-yt.mjs @Chase-H-AI
node scripts/resolver-canal-yt.mjs @mattganzak
node scripts/resolver-canal-yt.mjs @Yury_AI
```

Cada chamada imprime o `Channel ID` (`UC...`) daquele handle.

- [ ] **Step 2: Substituir os "(resolver)" pelo Channel ID retornado**

Editar `canal-youtube/criadores-monitorados.md`, trocando cada `(resolver)` pelo valor
impresso no passo anterior, nas linhas de Chase AI, Matt Ganzak e Yury AI.

- [ ] **Step 3: Confirmar que `lerCriadores` agora pega os 7**

```bash
node -e "import('./scripts/lib-youtube.mjs').then(({lerCriadores}) => console.log(lerCriadores(require('fs').readFileSync('canal-youtube/criadores-monitorados.md','utf8')).length))"
```

Esperado: `7`.

- [ ] **Step 4: Commit**

```bash
git add canal-youtube/criadores-monitorados.md
git commit -m "chore(canal-youtube): resolve Channel ID de Chase AI, Matt Ganzak e Yury AI"
```

---

## Task 12: `/voz` — flag `--canal`

**Files:**
- Modify: `.claude/skills/voz/SKILL.md`

- [ ] **Step 1: Ajustar a Fase 0 (Pré-checagem) pra reconhecer o destino "canal"**

Em `.claude/skills/voz/SKILL.md`, na seção `## Fase 0 — Pré-checagem`, alterar o item 1
de:

```markdown
1. **De quem é a voz?** Negócio próprio → escreve em `nucleo/voz.md`. Cliente (modo
   agência) → confirmar o nome e escrever em `clientes/<nome>/voz.md`.
```

para:

```markdown
1. **De quem é a voz?** Negócio próprio → escreve em `nucleo/voz.md`. Cliente (modo
   agência) → confirmar o nome e escrever em `clientes/<nome>/voz.md`. Canal do YouTube
   (`/voz --canal` ou pedido "voz do canal/de narração") → escreve em
   `canal-youtube/voz-canal.md` — é voz de **fala/narração**, distinta da voz de copy
   escrita em `nucleo/voz.md`; não confundir as duas nem misturar arquivo.
```

- [ ] **Step 2: Adicionar nota de foco da entrevista pro canal, ao final da Fase 1**

Ao final da seção `## Fase 1 — Entregar o roteiro e explicar a gravação`, depois do
roteiro das seis perguntas, acrescentar:

```markdown
### Quando a voz é do canal (`--canal`)

As mesmas seis perguntas valem — a voz ainda sai de como a pessoa fala do negócio, não de
autoanálise. Atenção extra na escuta: ritmo de fala (pausas, frase curta vs longa),
gírias/expressões que usa falando e não escrevendo, como abre e fecha uma ideia ao vivo.
Essa voz pode ser igual à de `nucleo/voz.md` ou diferente — a entrevista descobre, nunca
assume a partir da voz escrita já existente.
```

- [ ] **Step 3: Ajustar a Fase 5 (Registrar a escada) pra apontar pro arquivo certo**

Trocar:

```markdown
## Fase 5 — Registrar a escada

Atualizar `nucleo/escada.md` (ou o do cliente): degrau 3 alcançado (voz + núcleo
enriquecido pela entrevista), blocos do roteiro confirmados vs faltantes, e o que falta
pra completar (ex: "dono pulou o bloco 3 — refazer quando tiver tempo").
```

por:

```markdown
## Fase 5 — Registrar a escada

Atualizar `nucleo/escada.md` (ou o do cliente, ou `canal-youtube/escada.md` quando for
`--canal`): degrau 3 alcançado (voz + núcleo enriquecido pela entrevista), blocos do
roteiro confirmados vs faltantes, e o que falta pra completar (ex: "dono pulou o bloco 3 —
refazer quando tiver tempo"). Voz de canal não enriquece núcleo de negócio (Fase 3B não
se aplica) — fala de narração não é fala de venda.
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/voz/SKILL.md
git commit -m "feat(voz): flag --canal escreve em canal-youtube/voz-canal.md"
```

---

## Task 13: `/formulas` — modo vídeo + Modo 4 (monitorar)

**Files:**
- Modify: `.claude/skills/formulas/SKILL.md`

- [ ] **Step 1: Estender o Modo 1 (Dissecar) com a terceira forma de entrada**

No `.claude/skills/formulas/SKILL.md`, na seção `## Modo 1 — Dissecar (o coração da
skill)`, depois do parágrafo de abertura ("Usuário traz uma peça: texto colado, print ou
link público."), acrescentar:

```markdown
**Vídeo do YouTube** entra como quarta forma de peça (link). Antes de dissecar:
1. `node scripts/transcript-youtube.mjs <link>` — puxa a transcrição pública (legenda
   manual ou automática, o que existir). Sem legenda disponível: avisar e dissecar só por
   título/descrição/visual, sem inventar fala que não foi dita.
2. Disseca gancho/estrutura/gatilhos pelos 5 passos já descritos, **mais** estes campos
   exclusivos de vídeo (só quando Rede=YouTube):
   - **Hook (tipo + texto literal dos 3-15s):** transcrito da fala real, não resumo.
   - **Ritmo de corte:** rápido/médio/lento — pela frequência de troca de assunto na
     transcrição.
   - **Estrutura de retenção:** que loop de curiosidade abre e quando fecha.
   - **Composição da fala:** frase curta vs longa, repetição proposital, pergunta
     retórica, jargão vs linguagem simples.
```

- [ ] **Step 2: Acrescentar a lista semente de canais no Modo 2 (Pesquisar)**

Na seção `## Modo 2 — Pesquisar (web aberta)`, depois do item 1 ("Buscar... análises
públicas recentes"), acrescentar:

```markdown
   Pro nicho de IA/Claude Code, canais americanos de referência (sementes, não lista
   fechada — `canal-youtube/criadores-monitorados.md` tem a lista viva): Sabrina Ramonov,
   Luuk Alleman, Matt Ganzak, Jonathan Acuña "Doctor AI", Duncan Rogoff, Chase AI, Yury AI.
```

- [ ] **Step 3: Adicionar o Modo 4 — Monitorar canais (cron)**

Depois da seção `## Modo 3 — Validar (os dados da casa)` e antes de `## O arquivo
docs/formulas.md`, inserir:

```markdown
## Modo 4 — Monitorar canais (cron)

Acionado pelo agendamento automático (ver `CronCreate` no setup do canal) ou por pedido
("checa os criadores", "tem vídeo novo relevante?"):

1. Rodar `node scripts/checar-criadores-yt.mjs` — devolve a lista de vídeos relevantes
   (já filtrados pelos 3 pilares do canal, transcript já anexado quando disponível) e já
   grava a entrada em `canal-youtube/pesquisa/fila.md` com status **a dissecar**.
2. Pra cada vídeo relevante retornado: aplicar o Modo 1 (Dissecar) usando o transcript já
   capturado — não buscar de novo. Gravar o molde em `docs/formulas.md` com origem
   `mercado (<canal>, <data>)` e status **a testar**.
3. Atualizar a entrada correspondente em `fila.md` de **a dissecar** pra **dissecado —
   ver docs/formulas.md**.
4. Notificar (push notification) **só** os vídeos que passaram pelo filtro de
   relevância — resumo de uma linha do que é o vídeo, canal de origem e o pilar batido.
   Desempenho do vídeo de origem (visualizações, se disponível) entra como contexto na
   notificação, nunca como filtro — tema bom com desempenho fraco ainda notifica.
5. Vídeo que `checar-criadores-yt.mjs` não classificou como relevante não aparece em
   `fila.md` nem gera notificação — fica só no `.ultimo-visto.json`, sem ruído.
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/formulas/SKILL.md
git commit -m "feat(formulas): modo vídeo (YouTube) + Modo 4 monitorar canais via radar"
```

---

## Task 14: Skill nova `/roteiro-yt`

**Files:**
- Create: `.claude/skills/roteiro-yt/SKILL.md`

- [ ] **Step 1: Criar o arquivo da skill**

```markdown
---
name: roteiro-yt
description: >
  Use para escrever roteiro de vídeo do canal YouTube — "/roteiro-yt", "escreve o
  roteiro desse vídeo", "roteiriza esse tema pro YouTube", "transforma isso num short",
  ou ao processar um item aprovado da fila em canal-youtube/pesquisa/fila.md. Escreve
  roteiro long-form (8-15min) e short (30-60s), na voz própria do canal, a partir dos
  moldes que o /formulas já mantém — não pesquisa de novo.
---

# /roteiro-yt — Escrever o roteiro do vídeo

Roteiro de vídeo não nasce do nada — nasce do molde que já provou funcionar (`/formulas`)
e da voz de quem vai narrar (`canal-youtube/voz-canal.md`). Esta skill só escreve; quem
pesquisa formato é o `/formulas` (Modo 1/2/4), quem decide tema é o dono ou a fila de
pesquisa.

Autoria: ImpulsoX AI. Conteúdo original.

## Pré-checagem

1. **`canal-youtube/voz-canal.md` existe e está preenchido?** Se não, parar e orientar
   `/voz --canal` primeiro — roteiro sem voz capturada sai genérico, igual copy sem
   `nucleo/voz.md`.
2. **Tema e pilar definidos?** Vem do pedido direto do dono, ou de um item de
   `canal-youtube/pesquisa/fila.md` que ele aprovou pra adaptar. Sem os dois, perguntar.
3. **Long-form ou short?** Se não foi dito, perguntar — muda a estrutura inteira (ver
   abaixo).

## Passo 1 — Ler os moldes

Ler `docs/formulas.md` filtrando entradas com Rede=YouTube. Priorizar **validada aqui**;
sem nenhuma validada, usar **a testar**. Não pesquisar de novo — se não houver molde
nenhum de YouTube, avisar e sugerir rodar `/formulas` (Modo 2) antes.

## Passo 2 — Grounding técnico (só pilar "ensinar Claude Code do zero")

Antes de afirmar qualquer comportamento, comando ou feature do Claude Code no roteiro,
validar contra a documentação oficial atual (Claude Code muda rápido; conhecimento de
treino sem checar pode estar desatualizado). Mesmo cuidado do `claude-code-guide`. Claim
que não dá pra confirmar agora: ou tira do roteiro, ou marca pra confirmar antes de
gravar — nunca entra como fato sem checar.

## Passo 3 — Escrever o corpo (long-form)

Nesta ordem — **o corpo vem antes do hook**:

1. **Setup:** contexto mínimo pra entender o que vem (sem "hey galera/bem-vindo de
   volta").
2. **Pontos principais:** um bloco por ideia/demo, cada um com cue de tela:
   `[TELA: o que aparece — ex: terminal rodando claude code, zoom no diff]`. Toda frase
   serve um propósito (valor, curiosidade ou avançar a história) — frase de
   preenchimento não entra.
3. **Payoff:** a entrega da promessa do vídeo.
4. **CTA:** um pedido só (inscrever, comentar, ou próximo vídeo da série) — nunca
   acumular CTA.

Timestamp sugerido em cada bloco (ex: `[02:30]`), calculado pelo tamanho do texto a ~150
palavras/minuto de fala.

## Passo 4 — Escrever o hook (por último)

Com o corpo pronto, escrever a abertura: frase ≤10 palavras, sem credencial, sem "e aí
galera". Em ~20s precisa: validar o clique (confirmar que é sobre o que a pessoa
clicou), levantar a aposta (por que importa) e abrir um loop de curiosidade que só o
Payoff fecha.

## Passo 5 — Marcar cortes pra short

Releer o roteiro e marcar o(s) trecho(s) com a frase mais forte ou a demonstração mais
visual: `[CORTE-SHORT: mm:ss-mm:ss — razão do corte]`. Zero ou vários — sem mínimo
obrigatório.

## Passo 6 — Short standalone (quando não há long-form pra cortar)

Estrutura invertida: começa pelo **payoff/lição** no segundo 0-1 (não pela configuração).
Uma promessa só. 30-60s. Sem "hey galera", sem slow build. Termina com a mesma lição
reforçada ou um gancho pro canal.

## Passo 7 — Passar pela voz do canal

Aplicar `/escritor-br` usando **`canal-youtube/voz-canal.md`** — nunca `nucleo/voz.md` (é
voz de fala, não de copy escrita). Sem `voz-canal.md` preenchido, parar (ver
Pré-checagem).

## Saída

Salvar em `canal-youtube/roteiros/longa/<slug>.md` (ou `.../shorts/<slug>.md`):

```markdown
# <Título 1> | <Título 2> | <Título 3>

**Thumbnail-hint:** <frase curta pra capa>
**Pilar:** <pilar batido>
**Molde usado:** <nome da fórmula em docs/formulas.md, ou "nenhum — primeiro do canal">

## Roteiro

[hook]
...
[CORTE-SHORT: 04:12-04:48 — a frase mais forte]
...

## Descrição (SEO YouTube)
<descrição otimizada, primeiras 2 linhas valem mais — aparecem antes do "mostrar mais">

## Tags
tag1, tag2, tag3...
```

## Regras

- Corpo antes do hook, sempre — hook calibrado no que já foi escrito, nunca no vácuo.
- Conteúdo real, nunca placeholder. Claim técnico não confirmado não entra (ver Passo 2).
- Molde é esqueleto, nunca cópia — frase, tema ou thumbnail do vídeo de referência jamais
  entram no roteiro novo.
- Voz do canal (`voz-canal.md`), nunca a voz de copy (`nucleo/voz.md`) — são fala e
  escrita, registros diferentes.
- Sem long-form pra cortar, short standalone segue a estrutura invertida (Passo 6) — não
  é "long-form encurtado".
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/roteiro-yt/SKILL.md
git commit -m "feat(roteiro-yt): skill nova — escreve roteiro long-form e short do canal"
```

---

## Task 15: Agendar o radar — ADIADO (decisão do dono, 2026-06-16)

**Decisão:** deixar o radar **manual** por enquanto. `CronCreate` é só-sessão (morre quando
o Claude fecha, expira em 7 dias) — não serve pra produção. Agendamento cloud de verdade
(`/schedule`) começa a rodar/faturar já, e o canal ainda não existe. Quando o canal entrar
no ar, montar a rotina cloud recorrente via `/schedule` apontando pro Modo 4 do `/formulas`.

Até lá, o radar dispara sob demanda:

```bash
node scripts/checar-criadores-yt.mjs
```

ou por pedido ("checa os criadores") → Modo 4 do `/formulas`.

---

## Task 16: Verificação final

**Files:** nenhum novo — só validação.

- [ ] **Step 1: Sintaxe de todos os arquivos novos**

```bash
node --check scripts/lib-youtube.mjs && \
node --check scripts/transcript-youtube.mjs && \
node --check scripts/checar-criadores-yt.mjs && \
node --check scripts/resolver-canal-yt.mjs
```

Esperado: sem saída (sucesso silencioso).

- [ ] **Step 2: Suíte completa**

```bash
node --test scripts/lib-youtube.test.mjs scripts/transcript-youtube.test.mjs scripts/checar-criadores-yt.test.mjs
```

Esperado: todos os testes `pass`, `0 fail`.

- [ ] **Step 3: Smoke test manual de ponta a ponta (rede real, opcional)**

```bash
node scripts/transcript-youtube.mjs https://www.youtube.com/watch?v=<video_real_com_legenda> --texto
```

Esperado: texto corrido da transcrição real impresso no terminal — confirma que o parsing
de `captionTracks`/`timedtext` ainda bate com o HTML real do YouTube hoje (pode mudar sem
aviso; se quebrar, é o primeiro lugar a checar).

- [ ] **Step 4: Confirmar nenhum teste chama o YouTube de verdade**

```bash
grep -rn "youtube.com" scripts/*.test.mjs
```

Esperado: nenhuma ocorrência (todos os testes usam `baseUrl` apontando pro mock local).
