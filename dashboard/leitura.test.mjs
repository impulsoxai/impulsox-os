import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEscada, parseFoco, parseOfertas, parseAprendizados, parseProvas } from "./leitura.mjs";
import { listarProducao, parsePublicacoes } from "./leitura.mjs";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

test("parseEscada lê a forma inline (template, degrau 0) e ignora marcadores _(...)_", () => {
  const md = `# Escada de Contexto

**Degrau atual:** 0 — só o nome do negócio

**Fatos confirmados:**
_(nenhum ainda)_

**Suposições a confirmar:**
_(nenhuma ainda)_

**Próximo degrau:** rode \`/plugar\` para subir ao degrau 3 (entrevista completa), ou passe
uma URL de site para subir ao degrau 1 (extração automática).
`;
  const r = parseEscada(md);
  assert.equal(r.degrau, 0);
  assert.deepEqual(r.pendencias, []);
  assert.equal(r.proximo.length, 1);
  assert.match(r.proximo[0], /rode .*plugar/);
  assert.match(r.proximo[0], /extração automática/); // juntou a linha de continuação
});

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

test("parseOfertas nunca vaza FUTURAS mesmo sem o cabeçalho ATIVAS", () => {
  const md = `## Oferta: Solta Sem Header

## Ofertas FUTURAS — NÃO gerar conteúdo ainda
## Oferta: Futura Vazada
`;
  assert.deepEqual(parseOfertas(md), ["Solta Sem Header"]);
});

const APREND_VAZIO = `# Aprendizados

## Conteúdo orgânico
_(vazio — preenchido pelo /desempenho após o primeiro ciclo)_

## Tráfego pago
_(vazio — preenchido pela /analisar-ads)_

## Formato de cada entrada
- **[AAAA-MM-DD]** [padrão observado em uma frase] — _evidência: [de onde veio]_
`;

const APREND_CHEIO = `# Aprendizados

## Conteúdo orgânico
- **[2026-06-20]** Carrossel de erro salva mais — _evidência: /desempenho_

## Tráfego pago
_(vazio)_
`;

test("parseAprendizados detecta vazio vs preenchido e ignora o exemplo [AAAA-MM-DD]", () => {
  const v = parseAprendizados(APREND_VAZIO);
  assert.equal(v.organico_preenchido, false);
  assert.equal(v.pago_preenchido, false);
  assert.equal(v.entradas.length, 0);

  const c = parseAprendizados(APREND_CHEIO);
  assert.equal(c.organico_preenchido, true);
  assert.equal(c.entradas.length, 1);
  assert.match(c.entradas[0], /Carrossel de erro/);
});

test("parseProvas detecta banco vazio e ignora o exemplo dentro de ## Formato / code fence", () => {
  const md = `# Banco de Provas

_(vazio — rode /provas)_

## Formato de cada prova

\`\`\`markdown
### [identificador curto]
- Tipo: caso
\`\`\`
`;
  const r = parseProvas(md);
  assert.equal(r.preenchido, false);
  assert.equal(r.n, 0);
});

test("parseProvas conta entradas ### reais", () => {
  const r = parseProvas("# Banco\n\n### caso-acme\n- Tipo: caso\n\n### dep-joao\n- Tipo: depoimento\n");
  assert.equal(r.preenchido, true);
  assert.equal(r.n, 2);
});

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

test("listarProducao pega tanto pastas datadas quanto arquivos .md (linkedin/copy)", () => {
  const raiz = mkdtempSync(join(tmpdir(), "prod2-"));
  mkdirSync(join(raiz, "producao", "posts", "2026-06-13-erro-comum"), { recursive: true });
  mkdirSync(join(raiz, "producao", "linkedin"), { recursive: true });
  writeFileSync(join(raiz, "producao", "linkedin", "2026-06-12-ia-funcionario.md"), "x");
  mkdirSync(join(raiz, "producao", "copy"), { recursive: true });
  writeFileSync(join(raiz, "producao", "copy", "landing-v2.md"), "x");
  const r = listarProducao(raiz);
  assert.ok(r.find((p) => p.tipo === "linkedin" && p.slug === "ia-funcionario" && p.data === "2026-06-12"));
  assert.ok(r.find((p) => p.tipo === "copy" && p.slug === "landing-v2" && p.data === ""));
  assert.ok(r.find((p) => p.tipo === "posts" && p.slug === "erro-comum"));
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
