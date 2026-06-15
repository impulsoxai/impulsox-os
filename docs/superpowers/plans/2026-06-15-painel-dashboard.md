# Painel ImpulsoX-OS (status board vivo) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um painel web local, só-leitura, que lê os arquivos do negócio (núcleo, produção, publicações, custos) e mostra o ImpulsoX-OS rodando — on-brand, atualizando sozinho, aberto com um clique pelo cliente final.

**Architecture:** Pasta `dashboard/` auto-contida. `leitura.mjs` (funções puras que parseiam os `.md` e montam um JSON de estado) é importada por `servidor.mjs` (http nativo, `127.0.0.1`, só `GET`). O front-end vanilla (`index.html`+`estilo.css`+`painel.js`, visual feito no Open Design) busca `/api/estado` a cada ~5s e renderiza 4 blocos. Lançador `painel.cmd` + skill `/painel` sobem tudo.

**Tech Stack:** Node ≥18 (http, fs nativos — ZERO dependências), `node --test`, HTML/CSS/JS vanilla, `marca/tokens.css` pro on-brand.

---

## File Structure

- `dashboard/leitura.mjs` — CRIAR. Funções puras de parse + `lerEstado(raiz)` que monta o JSON.
- `dashboard/leitura.test.mjs` — CRIAR. Testes unitários das funções de parse (fixtures inline).
- `dashboard/servidor.mjs` — CRIAR. Servidor http: serve o front + `GET /api/estado`.
- `dashboard/servidor.test.mjs` — CRIAR. Smoke + segurança (nenhum segredo vaza).
- `dashboard/index.html` — CRIAR (Open Design). Estrutura dos 4 blocos.
- `dashboard/estilo.css` — CRIAR (Open Design). Importa `../marca/tokens.css`.
- `dashboard/painel.js` — CRIAR. Busca `/api/estado`, renderiza, re-busca a cada 5s.
- `painel.cmd` — CRIAR (raiz). Lançador de um clique (Windows).
- `.claude/skills/painel/SKILL.md` — CRIAR. Skill que sobe o servidor e abre o navegador.
- `scripts/registrar-custo.mjs` — CRIAR. Helper `registrarCusto()` (anexa em `dados/custos.jsonl`).
- `scripts/gerar-imagem.mjs`, `gerar-video.mjs`, `gerar-avatar.mjs` — MODIFICAR. Chamar `registrarCusto` no sucesso.
- `docs/ferramentas.md` — MODIFICAR. Documentar painel + lançador + ledger de custo.

**Contrato `/api/estado` (interface servidor↔front, fixada aqui):**

```js
{
  negocio: "ImpulsoX AI",
  atualizado_em: "2026-06-15T04:00:00.000Z",
  escada:  { degrau: 3, pendencias: ["...", "..."], proximo: ["..."] },
  foco:    { secoes: [ { titulo: "Prioridades", itens: ["...", "..."] } ] },
  ofertas: ["Landing Pages Premium", "Conteúdo para Instagram e LinkedIn"], // só ATIVAS
  aprendizados: { organico_preenchido: false, pago_preenchido: false, entradas: [] },
  provas:  { preenchido: false, n: 0 },
  producao: [ { tipo: "posts", slug: "5-erros-instagram-amador", data: "2026-06-13" } ],
  publicado: [ { data: "2026-06-11", canal: "instagram", link: "https://..." } ],
  custos:  { total: 0, por_modelo: { kling: 1.75 }, n: 3 },
  saude:   { nucleo: [ { arquivo: "negocio.md", preenchido: true } ], pendencias_total: 2 },
  ciclo:   { decide: 0, produz: 3, publica: 0, mede: 0 }
}
```

---

### Task 1: Scaffold `dashboard/` + `parseEscada`

**Files:**
- Create: `dashboard/leitura.mjs`
- Test: `dashboard/leitura.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// dashboard/leitura.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEscada } from "./leitura.mjs";

const ESCADA = `# Escada de Contexto — ImpulsoX AI

**Degrau atual:** 3 — entrevista de voz feita.

**Fatos confirmados:**
- Perfil: agencia.

**Suposições / a confirmar:**
- Variações do logo ainda a gerar quando precisar.
- Prova social: nenhuma ainda — depende dos primeiros pilotos.

**Próximo degrau:**
- Primeiros dados reais → degrau 4.
`;

test("parseEscada extrai degrau, pendências e próximo", () => {
  const r = parseEscada(ESCADA);
  assert.equal(r.degrau, 3);
  assert.equal(r.pendencias.length, 2);
  assert.match(r.pendencias[0], /Variações do logo/);
  assert.equal(r.proximo.length, 1);
  assert.match(r.proximo[0], /degrau 4/);
});

test("parseEscada tolera arquivo vazio", () => {
  const r = parseEscada("");
  assert.equal(r.degrau, null);
  assert.deepEqual(r.pendencias, []);
  assert.deepEqual(r.proximo, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dashboard/leitura.test.mjs`
Expected: FAIL — `parseEscada` não exportado / não definido.

- [ ] **Step 3: Write minimal implementation**

```js
// dashboard/leitura.mjs

// Extrai os itens (linhas "- ...") de uma seção marcada por "**Título:**" até o próximo
// "**" de início de linha ou o fim do texto. Tolerante: seção ausente → [].
function itensDaSecao(md, tituloRegex) {
  const linhas = md.split(/\r?\n/);
  const out = [];
  let dentro = false;
  for (const l of linhas) {
    if (/^\*\*/.test(l)) {                     // começo de uma seção "**...**"
      dentro = tituloRegex.test(l);
      continue;
    }
    if (dentro) {
      const m = l.match(/^\s*-\s+(.*\S)\s*$/);
      if (m) out.push(m[1]);
    }
  }
  return out;
}

export function parseEscada(md = "") {
  const mDeg = md.match(/\*\*Degrau atual:\*\*\s*(\d+)/);
  return {
    degrau: mDeg ? Number(mDeg[1]) : null,
    pendencias: itensDaSecao(md, /Suposições|a confirmar/i),
    proximo: itensDaSecao(md, /Próximo degrau/i),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dashboard/leitura.test.mjs`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
git add dashboard/leitura.mjs dashboard/leitura.test.mjs
git commit -m "feat(painel): parseEscada — degrau, pendências e próximo do escada.md"
```

---

### Task 2: `parseFoco` + `parseOfertas` (filtra ATIVAS, ignora FUTURAS)

**Files:**
- Modify: `dashboard/leitura.mjs`
- Test: `dashboard/leitura.test.mjs`

- [ ] **Step 1: Write the failing test** (anexar ao arquivo de teste)

```js
import { parseFoco, parseOfertas } from "./leitura.mjs";

const FOCO = `# Foco — ImpulsoX AI

## Momento
Operação solo. Ambição grande.

## Prioridades
- Crescer o negócio; vender pros Estados Unidos.
- Fechar os primeiros pilotos.
`;

test("parseFoco devolve seções com seus itens/linhas", () => {
  const r = parseFoco(FOCO);
  const prior = r.secoes.find((s) => s.titulo === "Prioridades");
  assert.ok(prior);
  assert.equal(prior.itens.length, 2);
  assert.match(prior.itens[0], /Crescer/);
});

const OFERTAS = `## Ofertas ATIVAS (sistema pode gerar conteúdo)

## Oferta: Landing Pages Premium
- **O que é:** site premium.

## Oferta: Conteúdo para Instagram e LinkedIn
- **O que é:** reels.

## Ofertas FUTURAS — NÃO gerar conteúdo ainda

- **KnowledgeX** — assistente. (?)
`;

test("parseOfertas pega só as ATIVAS e ignora as FUTURAS", () => {
  const r = parseOfertas(OFERTAS);
  assert.deepEqual(r, ["Landing Pages Premium", "Conteúdo para Instagram e LinkedIn"]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dashboard/leitura.test.mjs`
Expected: FAIL — `parseFoco`/`parseOfertas` não definidos.

- [ ] **Step 3: Write minimal implementation** (anexar ao `leitura.mjs`)

```js
export function parseFoco(md = "") {
  const secoes = [];
  let atual = null;
  for (const l of md.split(/\r?\n/)) {
    const h = l.match(/^##\s+(.*\S)\s*$/);
    if (h) { atual = { titulo: h[1], itens: [] }; secoes.push(atual); continue; }
    if (!atual) continue;
    const item = l.match(/^\s*-\s+(.*\S)\s*$/);
    if (item) { atual.itens.push(item[1]); continue; }
    const txt = l.trim();
    if (txt && !txt.startsWith(">")) atual.itens.push(txt);
  }
  return { secoes };
}

export function parseOfertas(md = "") {
  // só o trecho entre "Ofertas ATIVAS" e "Ofertas FUTURAS"
  const ini = md.search(/##\s*Ofertas ATIVAS/i);
  const fim = md.search(/##\s*Ofertas FUTURAS/i);
  const trecho = ini === -1 ? md : md.slice(ini, fim === -1 ? undefined : fim);
  const nomes = [];
  for (const l of trecho.split(/\r?\n/)) {
    const m = l.match(/^##\s*Oferta:\s*(.*\S)\s*$/i);
    if (m) nomes.push(m[1]);
  }
  return nomes;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dashboard/leitura.test.mjs`
Expected: PASS (todos).

- [ ] **Step 5: Commit**

```bash
git add dashboard/leitura.mjs dashboard/leitura.test.mjs
git commit -m "feat(painel): parseFoco + parseOfertas (só ATIVAS, ignora FUTURAS)"
```

---

### Task 3: `parseAprendizados` + `parseProvas` (detecta vazio)

**Files:**
- Modify: `dashboard/leitura.mjs`
- Test: `dashboard/leitura.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import { parseAprendizados, parseProvas } from "./leitura.mjs";

const APREND_VAZIO = `# Aprendizados

## Conteúdo orgânico
_(vazio — preenchido pelo /desempenho após o primeiro ciclo)_

## Tráfego pago
_(vazio — preenchido pela /analisar-ads)_
`;

const APREND_CHEIO = `# Aprendizados

## Conteúdo orgânico
- **[2026-06-20]** Carrossel de erro salva mais — _evidência: /desempenho_

## Tráfego pago
_(vazio)_
`;

test("parseAprendizados detecta vazio vs preenchido", () => {
  const v = parseAprendizados(APREND_VAZIO);
  assert.equal(v.organico_preenchido, false);
  assert.equal(v.pago_preenchido, false);
  assert.equal(v.entradas.length, 0);

  const c = parseAprendizados(APREND_CHEIO);
  assert.equal(c.organico_preenchido, true);
  assert.equal(c.entradas.length, 1);
  assert.match(c.entradas[0], /Carrossel de erro/);
});

test("parseProvas detecta banco vazio", () => {
  const r = parseProvas("# Banco de Provas\n\n_(vazio — rode /provas)_\n");
  assert.equal(r.preenchido, false);
  assert.equal(r.n, 0);
});

test("parseProvas conta entradas ###", () => {
  const r = parseProvas("# Banco\n\n### caso-acme\n- Tipo: caso\n\n### dep-joao\n- Tipo: depoimento\n");
  assert.equal(r.preenchido, true);
  assert.equal(r.n, 2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dashboard/leitura.test.mjs`
Expected: FAIL — funções não definidas.

- [ ] **Step 3: Write minimal implementation**

```js
// uma linha que começa com "- **[" é uma entrada de aprendizado (formato do arquivo)
export function parseAprendizados(md = "") {
  const entradas = [];
  let secao = "";
  for (const l of md.split(/\r?\n/)) {
    const h = l.match(/^##\s+(.*\S)\s*$/);
    if (h) { secao = h[1].toLowerCase(); continue; }
    if (/^\s*-\s+\*\*\[/.test(l)) entradas.push(l.replace(/^\s*-\s+/, "").trim());
  }
  const temNaSecao = (nome) =>
    entradas.some(() => true) && new RegExp(nome, "i").test(md) &&
    // preenchido = existe ao menos uma entrada "- **[" depois do cabeçalho da seção
    secaoTemEntrada(md, nome);
  return {
    organico_preenchido: secaoTemEntrada(md, "Conteúdo orgânico"),
    pago_preenchido: secaoTemEntrada(md, "Tráfego pago"),
    entradas,
  };
}

function secaoTemEntrada(md, tituloRegex) {
  const linhas = md.split(/\r?\n/);
  let dentro = false;
  for (const l of linhas) {
    const h = l.match(/^##\s+(.*\S)\s*$/);
    if (h) { dentro = new RegExp(tituloRegex, "i").test(h[1]); continue; }
    if (dentro && /^\s*-\s+\*\*\[/.test(l)) return true;
  }
  return false;
}

export function parseProvas(md = "") {
  const n = (md.match(/^###\s+/gm) || []).length;
  return { preenchido: n > 0, n };
}
```

> Nota ao executor: a função `temNaSecao` acima ficou redundante — REMOVA ela e a var
> `temNaSecao` de dentro de `parseAprendizados`; o que vale é `secaoTemEntrada`. (Mantido
> aqui só pra deixar explícito; o corpo final de `parseAprendizados` retorna usando
> `secaoTemEntrada` direto.)

Corpo final limpo de `parseAprendizados`:

```js
export function parseAprendizados(md = "") {
  const entradas = [];
  for (const l of md.split(/\r?\n/)) {
    if (/^\s*-\s+\*\*\[/.test(l)) entradas.push(l.replace(/^\s*-\s+/, "").trim());
  }
  return {
    organico_preenchido: secaoTemEntrada(md, "Conteúdo orgânico"),
    pago_preenchido: secaoTemEntrada(md, "Tráfego pago"),
    entradas,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dashboard/leitura.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/leitura.mjs dashboard/leitura.test.mjs
git commit -m "feat(painel): parseAprendizados + parseProvas (detecta vazio)"
```

---

### Task 4: `listarProducao` + `parsePublicacoes`

**Files:**
- Modify: `dashboard/leitura.mjs`
- Test: `dashboard/leitura.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import { listarProducao, parsePublicacoes } from "./leitura.mjs";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("listarProducao lê data+slug das pastas de cada tipo", () => {
  const raiz = mkdtempSync(join(tmpdir(), "prod-"));
  mkdirSync(join(raiz, "producao", "posts", "2026-06-13-5-erros-instagram-amador"), { recursive: true });
  mkdirSync(join(raiz, "producao", "linkedin", "2026-06-12-ia-funcionario"), { recursive: true });
  const r = listarProducao(raiz);
  const post = r.find((p) => p.tipo === "posts");
  assert.equal(post.data, "2026-06-13");
  assert.equal(post.slug, "5-erros-instagram-amador");
  assert.ok(r.find((p) => p.tipo === "linkedin"));
});

test("listarProducao tolera producao/ ausente", () => {
  const raiz = mkdtempSync(join(tmpdir(), "prod-"));
  assert.deepEqual(listarProducao(raiz), []);
});

test("parsePublicacoes tolera arquivo ausente", () => {
  assert.deepEqual(parsePublicacoes(null), []);
});

test("parsePublicacoes lê linhas de tabela", () => {
  const md = `# Publicações

| Data | Canal | Link |
|---|---|---|
| 2026-06-11 | instagram | https://instagram.com/p/abc |
`;
  const r = parsePublicacoes(md);
  assert.equal(r.length, 1);
  assert.equal(r[0].canal, "instagram");
  assert.match(r[0].link, /instagram\.com/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dashboard/leitura.test.mjs`
Expected: FAIL — funções não definidas.

- [ ] **Step 3: Write minimal implementation**

```js
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const TIPOS_PRODUCAO = ["posts", "linkedin", "paginas", "copy"];

export function listarProducao(raiz) {
  const out = [];
  for (const tipo of TIPOS_PRODUCAO) {
    const dir = join(raiz, "producao", tipo);
    if (!existsSync(dir)) continue;
    for (const nome of readdirSync(dir)) {
      if (!statSync(join(dir, nome)).isDirectory()) continue;
      const m = nome.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
      out.push({ tipo, data: m ? m[1] : "", slug: m ? m[2] : nome });
    }
  }
  return out;
}

// md pode ser null (arquivo ausente). Lê linhas de tabela "| data | canal | link |".
export function parsePublicacoes(md) {
  if (!md) return [];
  const out = [];
  for (const l of md.split(/\r?\n/)) {
    const cols = l.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 3 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0])) {
      out.push({ data: cols[0], canal: cols[1], link: cols[2] });
    }
  }
  return out;
}
```

> Nota: `import` no topo do arquivo. Se já houver um bloco de imports em `leitura.mjs`,
> juntar os símbolos (`readdirSync, statSync, existsSync`) ao import de `node:fs` existente
> em vez de duplicar a linha.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dashboard/leitura.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/leitura.mjs dashboard/leitura.test.mjs
git commit -m "feat(painel): listarProducao + parsePublicacoes (tolera ausência)"
```

---

### Task 5: `parseCustos` + `saudeNucleo`

**Files:**
- Modify: `dashboard/leitura.mjs`
- Test: `dashboard/leitura.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import { parseCustos, saudeNucleo } from "./leitura.mjs";

test("parseCustos soma o jsonl por modelo", () => {
  const jsonl =
    '{"data":"2026-06-15","script":"gerar-avatar","modelo":"kling","custo":1.75}\n' +
    '{"data":"2026-06-15","script":"gerar-avatar","modelo":"heygen","custo":1.5}\n' +
    'linha quebrada que deve ser ignorada\n' +
    '{"data":"2026-06-15","script":"gerar-avatar","modelo":"kling","custo":0.25}\n';
  const r = parseCustos(jsonl);
  assert.equal(r.n, 3);
  assert.equal(Number(r.total.toFixed(2)), 3.5);
  assert.equal(Number(r.por_modelo.kling.toFixed(2)), 2.0);
});

test("parseCustos tolera null", () => {
  assert.deepEqual(parseCustos(null), { total: 0, por_modelo: {}, n: 0 });
});

test("saudeNucleo marca vazio quando o arquivo tem marcador _(vazio", () => {
  const raiz = mkdtempSync(join(tmpdir(), "nuc-"));
  mkdirSync(join(raiz, "nucleo"), { recursive: true });
  writeFileSync(join(raiz, "nucleo", "negocio.md"), "# Negócio\nConteúdo real aqui, bastante.");
  writeFileSync(join(raiz, "nucleo", "provas.md"), "# Provas\n_(vazio — rode /provas)_");
  const r = saudeNucleo(raiz);
  const neg = r.find((a) => a.arquivo === "negocio.md");
  const prov = r.find((a) => a.arquivo === "provas.md");
  assert.equal(neg.preenchido, true);
  assert.equal(prov.preenchido, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dashboard/leitura.test.mjs`
Expected: FAIL — funções não definidas.

- [ ] **Step 3: Write minimal implementation**

```js
export function parseCustos(jsonl) {
  const r = { total: 0, por_modelo: {}, n: 0 };
  if (!jsonl) return r;
  for (const l of jsonl.split(/\r?\n/)) {
    const t = l.trim();
    if (!t) continue;
    let o; try { o = JSON.parse(t); } catch { continue; }
    const c = Number(o.custo);
    if (!Number.isFinite(c)) continue;
    r.total += c;
    r.n += 1;
    const m = o.modelo || "?";
    r.por_modelo[m] = (r.por_modelo[m] || 0) + c;
  }
  return r;
}

const NUCLEO_ARQUIVOS = ["negocio.md", "voz.md", "foco.md", "perfil.md",
  "escada.md", "aprendizados.md", "provas.md"];

export function saudeNucleo(raiz) {
  const out = [];
  for (const arquivo of NUCLEO_ARQUIVOS) {
    const caminho = join(raiz, "nucleo", arquivo);
    let preenchido = false;
    if (existsSync(caminho)) {
      const txt = readFileSync(caminho, "utf8");
      // "preenchido" = tem conteúdo real e não é só o marcador _(vazio ...)_
      const semVazio = txt.replace(/_\(vazio[^)]*\)_/gi, "").replace(/^#.*$/gm, "").trim();
      preenchido = semVazio.length > 40;
    }
    out.push({ arquivo, preenchido });
  }
  return out;
}
```

> Nota: adicionar `readFileSync` ao import de `node:fs` no topo do `leitura.mjs`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dashboard/leitura.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/leitura.mjs dashboard/leitura.test.mjs
git commit -m "feat(painel): parseCustos (soma jsonl) + saudeNucleo (vazio vs preenchido)"
```

---

### Task 6: `lerEstado(raiz)` — monta o JSON completo + deriva o ciclo

**Files:**
- Modify: `dashboard/leitura.mjs`
- Test: `dashboard/leitura.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import { lerEstado } from "./leitura.mjs";

test("lerEstado monta o estado e deriva o ciclo de um repo-fixture", () => {
  const raiz = mkdtempSync(join(tmpdir(), "est-"));
  mkdirSync(join(raiz, "nucleo"), { recursive: true });
  mkdirSync(join(raiz, "producao", "posts", "2026-06-13-erro-comum"), { recursive: true });
  writeFileSync(join(raiz, "nucleo", "escada.md"), "**Degrau atual:** 3 — feito.\n");
  writeFileSync(join(raiz, "nucleo", "negocio.md"), "# Negócio\n" + "x".repeat(60));

  const e = lerEstado(raiz);
  assert.equal(e.escada.degrau, 3);
  assert.equal(e.ciclo.produz, 1);          // 1 peça em producao/
  assert.equal(e.ciclo.publica, 0);         // sem publicacoes.md
  assert.ok(typeof e.atualizado_em === "string");
  assert.ok(Array.isArray(e.ofertas));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dashboard/leitura.test.mjs`
Expected: FAIL — `lerEstado` não definido.

- [ ] **Step 3: Write minimal implementation**

```js
import { basename } from "node:path";

function lerArquivo(caminho) {
  try { return readFileSync(caminho, "utf8"); } catch { return null; }
}
function lerDir(caminho) {
  try { return readdirSync(caminho); } catch { return []; }
}

export function lerEstado(raiz) {
  const escadaMd = lerArquivo(join(raiz, "nucleo", "escada.md")) || "";
  const focoMd = lerArquivo(join(raiz, "nucleo", "foco.md")) || "";
  const ofertasDir = join(raiz, "nucleo", "ofertas");
  let ofertasMd = "";
  for (const f of lerDir(ofertasDir)) if (f.endsWith(".md")) ofertasMd += "\n" + lerArquivo(join(ofertasDir, f));
  const aprendMd = lerArquivo(join(raiz, "nucleo", "aprendizados.md")) || "";
  const provasMd = lerArquivo(join(raiz, "nucleo", "provas.md")) || "";
  const pubMd = lerArquivo(join(raiz, "producao", "publicacoes.md"));
  const custosJsonl = lerArquivo(join(raiz, "dados", "custos.jsonl"));

  const escada = parseEscada(escadaMd);
  const producao = listarProducao(raiz);
  const publicado = parsePublicacoes(pubMd);
  const aprendizados = parseAprendizados(aprendMd);
  const saude = saudeNucleo(raiz);

  // decide = nº de meses de calendário; mede = nº de entradas de aprendizado
  const calendarioN = lerDir(join(raiz, "producao", "calendario")).filter((f) => f.endsWith(".md")).length;

  return {
    negocio: basename(raiz) || "negócio",
    atualizado_em: new Date().toISOString(),
    escada,
    foco: parseFoco(focoMd),
    ofertas: parseOfertas(ofertasMd),
    aprendizados,
    provas: parseProvas(provasMd),
    producao,
    publicado,
    custos: parseCustos(custosJsonl),
    saude: { nucleo: saude, pendencias_total: escada.pendencias.length },
    ciclo: {
      decide: calendarioN,
      produz: producao.length,
      publica: publicado.length,
      mede: aprendizados.entradas.length,
    },
  };
}
```

> Nota: `basename` adicionar ao import de `node:path`. O nome do negócio vem da pasta do
> clone; a Task 7 pode sobrescrever lendo `negocio.md` se quiser, mas não é necessário agora.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dashboard/leitura.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dashboard/leitura.mjs dashboard/leitura.test.mjs
git commit -m "feat(painel): lerEstado monta o JSON de estado + deriva o ciclo"
```

---

### Task 7: `servidor.mjs` — http local, `/api/estado`, estáticos, localhost, whitelist

**Files:**
- Create: `dashboard/servidor.mjs`
- Test: `dashboard/servidor.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// dashboard/servidor.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { criarServidor } from "./servidor.mjs";

function repoFixture() {
  const raiz = mkdtempSync(join(tmpdir(), "srv-"));
  mkdirSync(join(raiz, "nucleo"), { recursive: true });
  writeFileSync(join(raiz, "nucleo", "escada.md"), "**Degrau atual:** 2 — x\n");
  writeFileSync(join(raiz, ".env"), "FAL_KEY=segredo-que-nao-pode-vazar-123\n");
  return raiz;
}

test("GET /api/estado devolve o JSON do estado", async () => {
  const raiz = repoFixture();
  const srv = criarServidor(raiz);
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const porta = srv.address().port;
  const resp = await fetch(`http://127.0.0.1:${porta}/api/estado`);
  const j = await resp.json();
  assert.equal(resp.status, 200);
  assert.equal(j.escada.degrau, 2);
  srv.close();
});

test("nenhum segredo do .env aparece no /api/estado", async () => {
  const raiz = repoFixture();
  const srv = criarServidor(raiz);
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const porta = srv.address().port;
  const txt = await (await fetch(`http://127.0.0.1:${porta}/api/estado`)).text();
  assert.doesNotMatch(txt, /segredo-que-nao-pode-vazar/);
  assert.doesNotMatch(txt, /FAL_KEY/);
  srv.close();
});

test("path traversal é negado", async () => {
  const raiz = repoFixture();
  const srv = criarServidor(raiz);
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const porta = srv.address().port;
  const resp = await fetch(`http://127.0.0.1:${porta}/../.env`);
  assert.notEqual(resp.status, 200);
  srv.close();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dashboard/servidor.test.mjs`
Expected: FAIL — `criarServidor` não definido.

- [ ] **Step 3: Write minimal implementation**

```js
// dashboard/servidor.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname, normalize, extname } from "node:path";
import { lerEstado } from "./leitura.mjs";

const ESTE_DIR = dirname(fileURLToPath(import.meta.url)); // pasta dashboard/
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };

// só estes arquivos do front-end podem ser servidos (whitelist explícita)
const ESTATICOS = new Set(["index.html", "estilo.css", "painel.js"]);

export function criarServidor(raiz) {
  return createServer((req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      if (req.method !== "GET") { res.writeHead(405).end("método não permitido"); return; }

      if (url.pathname === "/api/estado") {
        const estado = lerEstado(raiz);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(estado));
        return;
      }

      // front-end estático — só nomes da whitelist, nunca caminho arbitrário
      let nome = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "");
      nome = normalize(nome).replace(/^(\.\.[/\\])+/, "");
      if (!ESTATICOS.has(nome)) { res.writeHead(404).end("não encontrado"); return; }
      const caminho = join(ESTE_DIR, nome);
      if (!caminho.startsWith(ESTE_DIR) || !existsSync(caminho)) { res.writeHead(404).end("não encontrado"); return; }
      res.writeHead(200, { "Content-Type": MIME[extname(nome)] || "application/octet-stream" });
      res.end(readFileSync(caminho));
    } catch (e) {
      res.writeHead(500).end("erro interno");
    }
  });
}

// CLI: sobe o servidor lendo o repo a partir do diretório-pai da pasta dashboard/
if (import.meta.main) {
  const raiz = process.env.DASHBOARD_RAIZ || join(ESTE_DIR, "..");
  const porta = Number(process.env.DASHBOARD_PORT) || 5173;
  criarServidor(raiz).listen(porta, "127.0.0.1", () => {
    console.log(`Painel ImpulsoX-OS em http://127.0.0.1:${porta}`);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dashboard/servidor.test.mjs`
Expected: PASS (3 testes — inclui os de segurança).

- [ ] **Step 5: Commit**

```bash
git add dashboard/servidor.mjs dashboard/servidor.test.mjs
git commit -m "feat(painel): servidor http local — /api/estado, estáticos whitelist, localhost, sem vazar segredo"
```

---

### Task 8: Front-end (visual no Open Design) — `index.html` + `estilo.css` + `painel.js`

**Files:**
- Create: `dashboard/index.html`, `dashboard/estilo.css`, `dashboard/painel.js`

> Visual feito no **Open Design** (decisão do brainstorming). Antes de usar, o executor
> confirma que o daemon do Open Design está preso ao `localhost` e que o tema sai de
> `marca/tokens.css` (a marca é a do negócio — a ferramenta ajusta dentro dela, nunca troca
> paleta/fonte). Se o Open Design não estiver disponível, cair pro frontend-design (codar à
> mão) — o contrato e o `painel.js` abaixo não mudam.

- [ ] **Step 1: `estilo.css` importa os tokens da marca**

```css
/* dashboard/estilo.css */
@import url("../marca/tokens.css");
/* O resto do estilo (layout dos 4 blocos, cards, grid) é produzido no Open Design,
   usando SOMENTE as variáveis de marca/tokens.css. Sem cor/fonte fora da marca. */
```

- [ ] **Step 2: `index.html` com os 4 blocos (estrutura semântica, IDs estáveis)**

Estrutura mínima que o `painel.js` preenche (o Open Design refina o visual, mantendo estes IDs):

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Painel ImpulsoX-OS</title>
  <link rel="stylesheet" href="estilo.css" />
</head>
<body>
  <header><h1 id="negocio">ImpulsoX-OS</h1><span id="atualizado"></span></header>
  <main>
    <section id="bloco-ciclo"><h2>O ciclo</h2><div id="ciclo"></div></section>
    <section id="bloco-producao"><h2>Produção &amp; publicado</h2><div id="producao"></div></section>
    <section id="bloco-contexto"><h2>Contexto</h2><div id="contexto"></div></section>
    <section id="bloco-saude"><h2>Custos &amp; saúde</h2><div id="saude"></div></section>
  </main>
  <script src="painel.js"></script>
</body>
</html>
```

- [ ] **Step 3: `painel.js` — busca, renderiza, re-busca a cada 5s**

```js
// dashboard/painel.js
const $ = (id) => document.getElementById(id);

async function atualizar() {
  let e;
  try { e = await (await fetch("/api/estado")).json(); }
  catch { $("atualizado").textContent = "sem conexão com o servidor"; return; }

  $("negocio").textContent = e.negocio;
  $("atualizado").textContent = "atualizado " + new Date(e.atualizado_em).toLocaleTimeString("pt-BR");

  $("ciclo").innerHTML = ["decide", "produz", "publica", "mede"]
    .map((k) => `<div class="etapa"><b>${e.ciclo[k]}</b><span>${k}</span></div>`).join("");

  $("producao").innerHTML =
    `<p>${e.producao.length} peças produzidas · ${e.publicado.length} publicadas</p>` +
    e.producao.map((p) => `<div class="peca">${p.data} · ${p.tipo} · ${p.slug}</div>`).join("");

  const ofertas = e.ofertas.map((o) => `<li>${o}</li>`).join("");
  $("contexto").innerHTML =
    `<p>Degrau ${e.escada.degrau ?? "?"} · ${e.foco.secoes.length} blocos de foco</p>` +
    `<ul>${ofertas}</ul>`;

  const nucleoVazio = e.saude.nucleo.filter((a) => !a.preenchido).map((a) => a.arquivo);
  $("saude").innerHTML =
    `<p>Custo de API: US$ ${e.custos.total.toFixed(2)} (${e.custos.n} gerações)</p>` +
    `<p>${e.saude.pendencias_total} pendências a confirmar</p>` +
    (nucleoVazio.length ? `<p>Núcleo a preencher: ${nucleoVazio.join(", ")}</p>` : `<p>Núcleo completo.</p>`);
}

atualizar();
setInterval(atualizar, 5000);
```

- [ ] **Step 4: Verificação manual**

Run: `node dashboard/servidor.mjs` (a partir da raiz do clone) e abrir `http://127.0.0.1:5173`.
Expected: 4 blocos renderizam com dados reais; "atualizado HH:MM:SS" muda a cada 5s; parar o
servidor → o painel mostra "sem conexão" sem quebrar.

- [ ] **Step 5: Commit**

```bash
git add dashboard/index.html dashboard/estilo.css dashboard/painel.js
git commit -m "feat(painel): front-end on-brand (Open Design) — 4 blocos, live a cada 5s"
```

---

### Task 9: Lançador de um clique `painel.cmd`

**Files:**
- Create: `painel.cmd` (raiz do repo)

- [ ] **Step 1: Escrever o lançador**

```bat
@echo off
REM Painel ImpulsoX-OS — dois cliques: sobe o servidor local e abre o navegador.
cd /d "%~dp0"
start "" http://127.0.0.1:5173
node dashboard\servidor.mjs
```

- [ ] **Step 2: Verificação manual**

Dois cliques no `painel.cmd` (ou `cmd //c painel.cmd` no Git Bash). Expected: abre o
navegador em `http://127.0.0.1:5173` e o painel carrega. Fechar a janela do `cmd` encerra
o servidor.

- [ ] **Step 3: Commit**

```bash
git add painel.cmd
git commit -m "feat(painel): lançador painel.cmd — abre o painel com dois cliques (cliente final)"
```

---

### Task 10: Skill `/painel`

**Files:**
- Create: `.claude/skills/painel/SKILL.md`

- [ ] **Step 1: Escrever a skill**

```markdown
---
name: painel
description: >
  Use pra abrir o painel do ImpulsoX-OS — "/painel", "abre o dashboard", "mostra o
  sistema rodando", "ver o painel". Sobe o servidor local (só-leitura) e abre o navegador
  no status board: ciclo, produção, contexto e custos do negócio. É o mesmo painel que o
  cliente abre com o painel.cmd.
---

# /painel — Abrir o status board do ImpulsoX-OS

Sobe o servidor local de `dashboard/servidor.mjs` e abre o navegador no painel. Só-leitura:
lê núcleo, produção, publicações e custos; não escreve nada.

Autoria: ImpulsoX AI. Conteúdo original.

## Fluxo

1. Conferir Node presente (`node --version`). Ausente → avisar e parar.
2. Subir o servidor em background: `node dashboard/servidor.mjs` na raiz do clone.
   Porta default 5173 (`DASHBOARD_PORT` pra trocar). Porta ocupada → avisar e sugerir
   outra porta.
3. Abrir `http://127.0.0.1:5173` no navegador (`start` no Windows).
4. Dizer ao usuário que o painel está no ar e que fechar o processo encerra o servidor.

## Regras

- Só-leitura. A skill nunca usa o painel pra escrever em núcleo/produção.
- Localhost sempre. Nunca expor em `0.0.0.0`.
- Cliente final usa o `painel.cmd` (dois cliques); esta skill é o atalho de quem está no
  Claude Code.
```

- [ ] **Step 2: Verificação**

Invocar `/painel` numa sessão do clone. Expected: servidor sobe, navegador abre no painel.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/painel/SKILL.md
git commit -m "feat(painel): skill /painel — sobe o servidor e abre o navegador"
```

---

### Task 11: Ledger de custo — `scripts/registrar-custo.mjs` + wiring nos `gerar-*`

**Files:**
- Create: `scripts/registrar-custo.mjs`
- Modify: `scripts/gerar-imagem.mjs`, `scripts/gerar-video.mjs`, `scripts/gerar-avatar.mjs`
- Test: `scripts/registrar-custo.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// scripts/registrar-custo.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registrarCusto } from "./registrar-custo.mjs";

test("registrarCusto anexa uma linha JSONL com os campos certos", () => {
  const raiz = mkdtempSync(join(tmpdir(), "cst-"));
  registrarCusto({ script: "gerar-avatar", modelo: "kling", custo: 1.75 }, raiz);
  registrarCusto({ script: "gerar-avatar", modelo: "heygen", custo: 1.5 }, raiz);
  const linhas = readFileSync(join(raiz, "dados", "custos.jsonl"), "utf8").trim().split("\n");
  assert.equal(linhas.length, 2);
  const o = JSON.parse(linhas[0]);
  assert.equal(o.modelo, "kling");
  assert.equal(o.custo, 1.75);
  assert.match(o.data, /^\d{4}-\d{2}-\d{2}$/);
});

test("registrarCusto nunca lança erro (não pode quebrar a geração)", () => {
  assert.doesNotThrow(() => registrarCusto({ script: "x", modelo: "y", custo: NaN }, "/caminho/invalido/\0"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/registrar-custo.test.mjs`
Expected: FAIL — `registrarCusto` não definido.

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/registrar-custo.mjs
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Anexa uma linha em dados/custos.jsonl. NUNCA lança — registrar custo não pode derrubar
// uma geração que já foi paga. custo inválido (NaN) é ignorado silenciosamente.
export function registrarCusto({ script, modelo, custo }, raiz = process.cwd()) {
  try {
    const c = Number(custo);
    if (!Number.isFinite(c)) return;
    const dir = join(raiz, "dados");
    mkdirSync(dir, { recursive: true });
    const linha = JSON.stringify({
      data: new Date().toISOString().slice(0, 10),
      script, modelo, custo: c,
    });
    appendFileSync(join(dir, "custos.jsonl"), linha + "\n");
  } catch { /* silencioso por design */ }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/registrar-custo.test.mjs`
Expected: PASS.

- [ ] **Step 5: Wire em `gerar-avatar.mjs`**

No fim do fluxo de sucesso (logo antes do `console.log` final que imprime `ok: true`),
adicionar o import no topo e a chamada:

```js
// topo do arquivo, junto dos outros imports:
import { registrarCusto } from "./registrar-custo.mjs";

// logo após escrever o vídeo em disco, antes do console.log final:
registrarCusto({ script: "gerar-avatar", modelo, custo: Number.isFinite(custoEst) ? custoEst : Number((durSeg * PRECO_SEG).toFixed(2)) });
```

- [ ] **Step 6: Wire em `gerar-video.mjs` e `gerar-imagem.mjs`**

Mesma ideia. Em `gerar-video.mjs`, após o `ffmpeg` final, antes do `console.log` de
sucesso — usar o custo já calculado pelo script (ou 0 se o script ainda não calcula
custo; registrar o que houver). Em `gerar-imagem.mjs`, após salvar o PNG:

```js
import { registrarCusto } from "./registrar-custo.mjs";
// gerar-imagem (após salvar): minimax ~0.01; flux schnell ~0.003; dev ~0.025
const CUSTO_IMG = { minimax: 0.01, schnell: 0.003, dev: 0.025 };
registrarCusto({ script: "gerar-imagem", modelo, custo: CUSTO_IMG[modelo] ?? 0 });
```

> Se algum `gerar-*` não tiver a var de custo no escopo do ponto de inserção, registrar
> `custo: 0` é aceitável (o ledger mostra a geração, custo a refinar) — nunca inventar valor.

- [ ] **Step 7: Run the test suite + commit**

Run: `node --test scripts/registrar-custo.test.mjs`
Expected: PASS.

```bash
git add scripts/registrar-custo.mjs scripts/registrar-custo.test.mjs scripts/gerar-imagem.mjs scripts/gerar-video.mjs scripts/gerar-avatar.mjs
git commit -m "feat(painel): ledger de custo — gerar-* registram cobrança em dados/custos.jsonl"
```

---

### Task 12: Docs + propagação pro clone

**Files:**
- Modify: `docs/ferramentas.md`

- [ ] **Step 1: Documentar o painel no `docs/ferramentas.md`**

Adicionar uma seção (ler o arquivo e seguir o estilo das seções existentes):

```markdown
## Painel (status board local)

`dashboard/servidor.mjs` sobe um painel web local (só-leitura, `127.0.0.1:5173`) que lê
núcleo, produção, publicações e `dados/custos.jsonl` e mostra o sistema rodando — on-brand
(usa `marca/tokens.css`). Atualiza sozinho a cada ~5s.

- **Cliente final:** dois cliques no `painel.cmd` (raiz). Sem terminal.
- **Na operação (Claude Code):** `/painel`.
- **Porta:** `DASHBOARD_PORT` (default 5173).
- **Custo de API:** os scripts `gerar-imagem/video/avatar` anexam cada cobrança em
  `dados/custos.jsonl` (gitignored); o painel soma e mostra no bloco "Custos & saúde".
- **Segurança:** só `GET`, só localhost, whitelist de leitura. `.env` e chaves nunca são
  servidos. Não expor em rede.
```

- [ ] **Step 2: Rodar a suíte inteira**

Run: `node --test dashboard/*.test.mjs scripts/registrar-custo.test.mjs`
Expected: todos PASS.

- [ ] **Step 3: Commit + push (template)**

```bash
git add docs/ferramentas.md
git commit -m "docs(painel): documenta o status board, lançador, porta e ledger de custo"
git push
```

- [ ] **Step 4: Propagar pro clone (ImpulsoX-AI)**

O painel é motor — vai pros clones via `/atualizar-motor`. Para o clone de teste agora:
copiar `dashboard/`, `painel.cmd`, `scripts/registrar-custo.mjs`, os 3 `gerar-*` alterados,
`.claude/skills/painel/` e `docs/ferramentas.md` pro clone, commitar e push. Confirmar que
`node dashboard/servidor.mjs` no clone mostra os dados reais (degrau 3, 3 posts, etc.).

---

## Self-Review (feito)

- **Cobertura do spec:** os 4 blocos (ciclo, produção/publicado, contexto, custos/saúde) →
  Tasks 1-6 (dados) + 8 (render). Servidor localhost/whitelist/sem-vazar-segredo → Task 7.
  Lançador um-clique → Task 9. Skill → Task 10. Ledger de custo → Task 11. Docs → Task 12.
  On-brand via tokens → Task 8. Tudo coberto.
- **Placeholders:** nenhum — todo passo tem código real. As duas "Notas ao executor"
  (limpeza do `parseAprendizados` na Task 3; custo 0 aceitável na Task 11) são instruções
  explícitas, não TODOs.
- **Consistência de tipos:** `lerEstado` (Task 6) consome exatamente as funções e formatos
  das Tasks 1-5; o contrato `/api/estado` no topo bate com o que `painel.js` (Task 8) lê
  (`e.ciclo.produz`, `e.escada.degrau`, `e.custos.total`, `e.saude.nucleo`).
- **Segurança:** Task 7 tem teste explícito de que `FAL_KEY`/segredo não vazam e de path
  traversal negado.
