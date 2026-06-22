# Skill /reel-marca — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o reel Remotion validado (hardcoded ImpulsoX) numa skill `/reel-marca` do template, com motor parametrizado pela marca do cliente, template de referência e fluxo guiado.

**Architecture:** Híbrido. O motor (`remotion/src/*.tsx`) vira biblioteca que lê cores/fontes de `marca/tokens.css` via um `tema.ts` gerado por script. O reel aprovado vira `templates/reel-referencia.tsx` que a IA copia e adapta. `SKILL.md` orquestra o fluxo guiado (10 passos, 2 gates). Captura de produto via Playwright.

**Tech Stack:** Remotion 4, React/TSX, Node ESM scripts, Playwright (captura), Node test runner (`node --test`).

---

## File Structure

- `remotion/src/tema.ts` (NOVO) — objeto `C` (cores) + fontes, gerado a partir da marca.
- `remotion/gerar-tema.mjs` (NOVO) — parseia `marca/tokens.css` → escreve `tema.ts`.
- `remotion/gerar-tema.test.mjs` (NOVO) — testa o parser (função pura).
- `remotion/src/premium.tsx` (MODIFICAR) — remove `export const C`, importa de `./tema`.
- `remotion/src/efeitos.tsx` (MODIFICAR) — importa `C` de `./tema` (era `./premium`).
- `remotion/src/produto.tsx` (MODIFICAR) — importa `C` de `./tema` (era `./premium`).
- `remotion/src/ReelTeste.tsx` (MODIFICAR) — importa `C` de `./tema`.
- `remotion/src/templates/reel-referencia.tsx` (NOVO) — cópia do reel aprovado, como molde.
- `remotion/captura-produto.mjs` (NOVO) — Playwright screenshot das páginas.
- `.claude/skills/reel-marca/SKILL.md` (NOVO) — a skill (fluxo guiado).
- `docs/mapa-de-skills.md` (MODIFICAR, se existir) — registra a skill no fluxo.

> **Nota sobre TDD aqui:** só `gerar-tema.mjs` (parser) é lógica pura testável com `node --test`.
> Os componentes `.tsx` são visuais (validados por render/still, não unit test) e já estão
> provados pelos 2 reels aprovados — o refactor é mecânico (trocar import), verificado por
> re-render. SKILL.md é documento. Portanto TDD real só na Task 2.

---

### Task 1: Criar `tema.ts` com as cores atuais (extrair de premium.tsx)

**Files:**
- Create: `remotion/src/tema.ts`
- Modify: `remotion/src/premium.tsx` (remover o bloco `export const C`)

- [ ] **Step 1: Criar `remotion/src/tema.ts`** com o objeto `C` atual (default ImpulsoX) + fontes.

```typescript
// tema.ts — cores e fontes do reel, derivadas da marca do cliente.
// Gerado/atualizado por gerar-tema.mjs a partir de marca/tokens.css.
// Defaults abaixo = marca ImpulsoX (fallback quando não há tokens.css).
export const C = {
  fundo: "#06060d",
  roxo: "#7c3aed",
  roxoProf: "#4c1d95",
  roxoSuave: "#a78bfa",
  dourado: "#d4af37",
  douradoClaro: "#e2c97e",
  texto: "#f0ebe0",
  textoSuave: "#8a8070",
  textoMudo: "#4a4540",
};

// nomes de fonte (carregadas via @remotion/google-fonts no .tsx)
export const FONTES = {
  display: "Space Grotesk",
  mono: "Space Mono",
};
```

- [ ] **Step 2: Remover `export const C` de `premium.tsx` e importar de `./tema`**

Em `remotion/src/premium.tsx`, deletar o bloco:
```typescript
export const C = {
  fundo: "#06060d",
  roxo: "#7c3aed",
  roxoProf: "#4c1d95",
  roxoSuave: "#a78bfa",
  dourado: "#d4af37",
  douradoClaro: "#e2c97e",
  texto: "#f0ebe0",
  textoSuave: "#8a8070",
  textoMudo: "#4a4540",
};
```
E adicionar no topo dos imports (depois do `import React`):
```typescript
import { C } from "./tema";
export { C }; // re-export pra não quebrar quem importa C de premium
```

- [ ] **Step 3: Atualizar imports de C em efeitos/produto/ReelTeste pra `./tema`**

Em `remotion/src/efeitos.tsx`, `remotion/src/produto.tsx`, `remotion/src/ReelTeste.tsx`:
trocar `import { C } from "./premium";` por `import { C } from "./tema";`.
(Em `premium.tsx` o re-export do Step 2 cobre qualquer import residual.)

- [ ] **Step 4: Re-render pra verificar zero regressão visual**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && npx remotion still remotion/src/index.ts ReelTeste c:/tmp/tema-check.png --frame=50`
Expected: PASS, gera o PNG sem erro (mesma cor de antes — só mudou de onde C vem).

- [ ] **Step 5: Commit**

```bash
git add remotion/src/tema.ts remotion/src/premium.tsx remotion/src/efeitos.tsx remotion/src/produto.tsx remotion/src/ReelTeste.tsx
git commit -m "refactor(reel): extrai cores/fontes pra tema.ts (parametrizável por marca)"
```

---

### Task 2: Parser de tokens.css → tema.ts (`gerar-tema.mjs`) — TDD

**Files:**
- Create: `remotion/gerar-tema.mjs`
- Test: `remotion/gerar-tema.test.mjs`

- [ ] **Step 1: Escrever o teste falhando** em `remotion/gerar-tema.test.mjs`

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { parsearTokens, mapearCores } from "./gerar-tema.mjs";

test("parsearTokens extrai custom properties --cor-* e --fonte-*", () => {
  const css = `:root {
    --cor-fundo: #06060d;
    --cor-primaria: #7c3aed;
    --fonte-display: 'Space Grotesk', sans-serif;
  }`;
  const t = parsearTokens(css);
  assert.equal(t["--cor-fundo"], "#06060d");
  assert.equal(t["--cor-primaria"], "#7c3aed");
  assert.equal(t["--fonte-display"], "'Space Grotesk', sans-serif");
});

test("mapearCores traduz tokens da marca pro objeto C do reel", () => {
  const tokens = {
    "--cor-fundo": "#000010",
    "--cor-primaria": "#112233",
    "--cor-primaria-prof": "#0a1520",
    "--cor-primaria-suave": "#445566",
    "--cor-acento": "#ffcc00",
    "--cor-acento-claro": "#ffe680",
    "--cor-texto": "#eeeeee",
    "--cor-texto-suave": "#999999",
    "--cor-texto-mudo": "#555555",
  };
  const c = mapearCores(tokens);
  assert.equal(c.fundo, "#000010");
  assert.equal(c.roxo, "#112233");
  assert.equal(c.dourado, "#ffcc00");
  assert.equal(c.douradoClaro, "#ffe680");
  assert.equal(c.textoMudo, "#555555");
});

test("mapearCores usa default quando token falta", () => {
  const c = mapearCores({ "--cor-fundo": "#123456" });
  assert.equal(c.fundo, "#123456");
  assert.equal(c.dourado, "#d4af37"); // default ImpulsoX preservado
});

test("primeiraFonte extrai o nome da família da declaração CSS", () => {
  const { primeiraFonte } = parsearTokens.__test || {};
  // primeiraFonte é exportada à parte; ver Step 3
});
```

- [ ] **Step 2: Rodar o teste pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS/remotion" && node --test gerar-tema.test.mjs`
Expected: FAIL — "Cannot find module './gerar-tema.mjs'" ou export inexistente.

- [ ] **Step 3: Implementar `gerar-tema.mjs`**

```javascript
#!/usr/bin/env node
// gerar-tema.mjs — lê marca/tokens.css e escreve remotion/src/tema.ts com as cores/fontes
// do cliente. Sem tokens.css → mantém os defaults (marca ImpulsoX). Função pura testável.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// defaults (marca ImpulsoX) — usados quando o token não existe na marca do cliente
const DEFAULT_C = {
  fundo: "#06060d", roxo: "#7c3aed", roxoProf: "#4c1d95", roxoSuave: "#a78bfa",
  dourado: "#d4af37", douradoClaro: "#e2c97e", texto: "#f0ebe0",
  textoSuave: "#8a8070", textoMudo: "#4a4540",
};

// extrai { "--cor-x": "valor", ... } de uma string CSS
export function parsearTokens(css) {
  const out = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css))) out[m[1].trim()] = m[2].trim();
  return out;
}

// pega o nome da 1ª família de fonte de uma declaração ("'Space Grotesk', sans-serif" → "Space Grotesk")
export function primeiraFonte(decl, fallback) {
  if (!decl) return fallback;
  const primeiro = decl.split(",")[0].trim().replace(/['"]/g, "");
  return primeiro || fallback;
}

// traduz tokens da marca → objeto C do reel (cada campo cai no default se faltar)
export function mapearCores(tokens) {
  const g = (k, d) => tokens[k] || d;
  return {
    fundo: g("--cor-fundo", DEFAULT_C.fundo),
    roxo: g("--cor-primaria", DEFAULT_C.roxo),
    roxoProf: g("--cor-primaria-prof", DEFAULT_C.roxoProf),
    roxoSuave: g("--cor-primaria-suave", DEFAULT_C.roxoSuave),
    dourado: g("--cor-acento", DEFAULT_C.dourado),
    douradoClaro: g("--cor-acento-claro", DEFAULT_C.douradoClaro),
    texto: g("--cor-texto", DEFAULT_C.texto),
    textoSuave: g("--cor-texto-suave", DEFAULT_C.textoSuave),
    textoMudo: g("--cor-texto-mudo", DEFAULT_C.textoMudo),
  };
}

// monta o conteúdo do tema.ts
export function montarTema(c, fontes) {
  const cores = Object.entries(c).map(([k, v]) => `  ${k}: "${v}",`).join("\n");
  return `// tema.ts — GERADO por gerar-tema.mjs a partir de marca/tokens.css. Não editar à mão.
export const C = {
${cores}
};

export const FONTES = {
  display: "${fontes.display}",
  mono: "${fontes.mono}",
};
`;
}

// CLI: lê a marca, escreve o tema. Roda da raiz do projeto.
if (import.meta.url === `file://${process.argv[1]}` || import.meta.main) {
  const raiz = process.cwd();
  const tokensPath = join(raiz, "marca", "tokens.css");
  let c = { ...DEFAULT_C };
  let fontes = { display: "Space Grotesk", mono: "Space Mono" };
  if (existsSync(tokensPath)) {
    const tokens = parsearTokens(readFileSync(tokensPath, "utf8"));
    c = mapearCores(tokens);
    fontes = {
      display: primeiraFonte(tokens["--fonte-display"], "Space Grotesk"),
      mono: primeiraFonte(tokens["--fonte-corpo"] || tokens["--fonte-mono"], "Space Mono"),
    };
    console.log("tema gerado da marca: " + tokensPath);
  } else {
    console.log("AVISO: marca/tokens.css não encontrado — usando defaults premium (ImpulsoX). (confirmar com a marca)");
  }
  const destino = join(dirname(fileURLToPath(import.meta.url)), "src", "tema.ts");
  writeFileSync(destino, montarTema(c, fontes));
  console.log("escrito: " + destino);
}
```

- [ ] **Step 4: Remover o 4º teste placeholder e ajustar pra função exportada**

Em `gerar-tema.test.mjs`, substituir o último `test("primeiraFonte...")` por:
```javascript
import { primeiraFonte } from "./gerar-tema.mjs";

test("primeiraFonte extrai o nome da família e cai no fallback", () => {
  assert.equal(primeiraFonte("'Space Grotesk', sans-serif", "X"), "Space Grotesk");
  assert.equal(primeiraFonte("", "Fallback"), "Fallback");
  assert.equal(primeiraFonte(undefined, "Fallback"), "Fallback");
});
```
E juntar com o `import` do topo (remover o stub `parsearTokens.__test`).

- [ ] **Step 5: Rodar os testes pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS/remotion" && node --test gerar-tema.test.mjs`
Expected: PASS (4 testes verdes).

- [ ] **Step 6: Rodar o gerador de verdade (sem marca local → defaults) e re-render**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node remotion/gerar-tema.mjs && npx remotion still remotion/src/index.ts ReelTeste c:/tmp/tema-gen.png --frame=50`
Expected: imprime "AVISO: ... defaults", reescreve `tema.ts` igual, PNG renderiza igual.

- [ ] **Step 7: Commit**

```bash
git add remotion/gerar-tema.mjs remotion/gerar-tema.test.mjs remotion/src/tema.ts
git commit -m "feat(reel): gerar-tema.mjs — parseia marca/tokens.css pro tema do reel"
```

---

### Task 3: Template de referência (a partir do reel aprovado)

**Files:**
- Create: `remotion/src/templates/reel-referencia.tsx`

- [ ] **Step 1: Copiar o reel aprovado pra template**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && mkdir -p remotion/src/templates && cp remotion/src/ReelTeste.tsx remotion/src/templates/reel-referencia.tsx`

- [ ] **Step 2: Ajustar imports relativos no template (subiu um nível)**

Em `remotion/src/templates/reel-referencia.tsx`, trocar os imports `from "./premium"`,
`from "./efeitos"`, `from "./produto"`, `from "./tema"` por `from "../premium"`,
`from "../efeitos"`, `from "../produto"`, `from "../tema"`.

- [ ] **Step 3: Adicionar cabeçalho explicando o papel do arquivo**

No topo de `remotion/src/templates/reel-referencia.tsx`, antes dos imports:
```tsx
// reel-referencia.tsx — MOLDE validado (reel aprovado pelo dono em 2026-06-21).
// A skill /reel-marca COPIA este arquivo pra remotion/src/<slug>.tsx e adapta:
// cenas, copy (legendas), produto real (carrosséis/páginas), trilha. NÃO editar este molde —
// é a referência da fórmula 5-beats. Cores/fontes vêm de ../tema (marca do cliente).
```

- [ ] **Step 4: Verificar que o template compila (still num comp temporário)**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && npx tsc --noEmit -p remotion/tsconfig.json 2>&1 | grep -i "reel-referencia" || echo "sem erro de tipo no template"`
Expected: "sem erro de tipo no template" (ou nenhuma linha citando o arquivo).

- [ ] **Step 5: Commit**

```bash
git add remotion/src/templates/reel-referencia.tsx
git commit -m "feat(reel): template de referência (reel aprovado vira molde da skill)"
```

---

### Task 4: `captura-produto.mjs` (Playwright screenshot das páginas)

**Files:**
- Create: `remotion/captura-produto.mjs`

- [ ] **Step 1: Escrever o script de captura**

```javascript
#!/usr/bin/env node
// captura-produto.mjs — tira screenshot (top + full) das landing pages de producao/paginas/
// pro reel mostrar a página real no Browser-mockup. Salva em public/paginas/<slug>-{top,full}.png.
// Uso: node remotion/captura-produto.mjs <slug>=<caminho-html> [<slug2>=<caminho2> ...]
// Ex:  node remotion/captura-produto.mjs restaurante=producao/paginas/demos/restaurante/index.html
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
if (!args.length) {
  console.error("uso: node remotion/captura-produto.mjs <slug>=<caminho-html> [...]");
  process.exit(1);
}
const out = resolve(process.cwd(), "public", "paginas");
mkdirSync(out, { recursive: true });

const alvos = args.map((a) => {
  const i = a.indexOf("=");
  return { slug: a.slice(0, i), path: resolve(process.cwd(), a.slice(i + 1)) };
});

const browser = await chromium.launch();
for (const p of alvos) {
  if (!existsSync(p.path)) { console.log("FALTA " + p.path); continue; }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(p.path).href, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${p.slug}-top.png` });
  await page.screenshot({ path: `${out}/${p.slug}-full.png`, fullPage: true });
  console.log("ok " + p.slug);
  await ctx.close();
}
await browser.close();
console.log("FIM");
```

- [ ] **Step 2: Testar a captura numa página real (demo restaurante)**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node remotion/captura-produto.mjs teste-cap="C:/Users/ACER/Desktop/ImpulsoX-AI/producao/paginas/demos/restaurante/index.html"`
Expected: "ok teste-cap" + "FIM"; arquivos `public/paginas/teste-cap-top.png` e `-full.png` criados.

- [ ] **Step 3: Limpar o screenshot de teste**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && rm -f public/paginas/teste-cap-top.png public/paginas/teste-cap-full.png`

- [ ] **Step 4: Commit**

```bash
git add remotion/captura-produto.mjs
git commit -m "feat(reel): captura-produto.mjs — screenshot das landing pages pro mockup"
```

---

### Task 5: `SKILL.md` da `/reel-marca` (fluxo guiado)

**Files:**
- Create: `.claude/skills/reel-marca/SKILL.md`

- [ ] **Step 1: Escrever o SKILL.md** com frontmatter + fluxo de 10 passos + 2 gates + regras técnicas.

Criar `.claude/skills/reel-marca/SKILL.md`:

````markdown
---
name: reel-marca
description: >
  Use pra criar reel de vídeo de MARCA por código (motion graphics) — "/reel-marca",
  "faz um reel da marca", "vídeo institucional", "reel mostrando minhas landing pages",
  "reel dos meus posts". Produz reel vertical 9:16 com a identidade da marca, mostrando o
  PRODUTO REAL do cliente (posts/páginas que já produziu) em mockup, narrativa com a voz da
  marca e copy auditada. Distinta do /post (que faz reel com rosto/cena por IA) — esta é
  motion graphics por código (Remotion): texto animado, produto em mockup, sem rosto/IA.
---

# /reel-marca — Reel de motion graphics de marca (Remotion)

Gera um reel institucional 9:16 onde o HERÓI é o produto real do cliente (carrosséis,
landing pages) mostrado em mockup de celular/navegador, com a identidade visual da marca,
narrativa na voz da marca e copy auditada. É motion graphics por código — não usa IA pra
rosto/cena (isso é o `/post`).

Autoria: ImpulsoX AI.

## Princípio — o que dá o "wow": PRODUTO REAL

A lição que validamos: reel abstrato (texto/efeito flutuando) impressiona pouco; ver o
TRABALHO REAL da marca numa tela de celular/navegador impressiona muito. Efeito é tempero,
**produto real é o prato**. Sempre puxar peças reais de `producao/` (posts PNG, páginas via
screenshot) em vez de inventar mockup genérico.

## Pré-requisitos (Escada de Contexto)

- **Marca** (`marca/tokens.css`) — pro reel sair na identidade do cliente. Sem ela, o reel usa
  defaults premium marcados "confirmar com a marca" (degrau mais baixo, não trava).
- **Produto real** em `producao/` — posts (`producao/posts/<post>/slide-*.png`) ou páginas
  (`producao/paginas/<demo>/index.html`). Sem produto: avisar o degrau e oferecer rodar
  `/post` ou `/pagina` antes ("produto real é o que dá o impacto; quer produzir 1 peça
  primeiro, ou seguir com mockup genérico marcado pra trocar?").
- **ffmpeg + Node + Remotion** instalados (o motor em `remotion/`).

## Fluxo (guiado — 2 gates de aprovação)

1. **Lê o contexto** (em silêncio): `nucleo/voz.md`, `nucleo/ofertas/*` (só ATIVAS),
   `marca/tokens.css`, `nucleo/provas.md` (peça pública só usa prova autorizada).
2. **Gera o tema da marca:** `node remotion/gerar-tema.mjs` (parseia `tokens.css` → `tema.ts`).
3. **Escolhe a oferta:** perguntar qual oferta ATIVA o reel vende. **Só ATIVAS** — oferta
   FUTURA / "não gerar conteúdo" fica de fora (regra da casa: peça pública só vende oferta à
   venda agora).
4. **Checa produto real** da oferta em `producao/`. Não achou → Escada de Contexto (avisar +
   oferecer `/post` ou `/pagina`).
5. **Storyboard 5-beats:** hook (situação real do dono, não o nome da marca) → problema (sem
   culpar) → **MONEY SHOT** (produto real no mockup — a cena mais longa) → variedade/diferencial
   → assinatura suave. Apresentar em tabela. **GATE 1 — esperar o "sim" do dono.**
6. **Copy na voz:** escrever as legendas (curtas, queimadas) chamando `/copy` ou `/escritor-br`
   na voz da marca. Sem grito, sem caixa-alta pra ênfase, sem FOMO/urgência falsa (régua da
   `voz.md`). **GATE 2 — esperar o "sim" do dono.**
7. **Auditoria da copy:** rodar `/revisar` (auditor de marketing frio). Reprovou → ajustar e
   repassar. Só segue com a copy aprovada.
8. **Captura o produto:** páginas → `node remotion/captura-produto.mjs <slug>=<caminho>`;
   posts → copiar `producao/posts/<post>/slide-*.png` pra `public/carrosseis/<post>/`.
9. **Coda o reel:** copiar `remotion/src/templates/reel-referencia.tsx` pra
   `remotion/src/<slug>.tsx`, adaptar cenas/copy/produto pra oferta, registrar a Composition em
   `remotion/src/Root.tsx`. Trilha: se há `public/trilhas/*.mp3`, listar pro dono escolher e
   aplicar via `<Audio src={staticFile("trilhas/<arq>")} />` com fade-in 1s / fade-out 2s / ~40%
   volume. Sem trilha → reel mudo (avisar uma vez, legenda queimada cobre).
10. **Audita 1 frame por cena** (`npx remotion still remotion/src/index.ts <CompId> c:/tmp/a.png
    --frame=N`) — pega layout quebrado / imagem 404 ANTES do full render.
11. **Renderiza:** `npx remotion render remotion/src/index.ts <CompId>
    producao/reels/<slug>/reel.mp4` (com `--gl=angle` se usar logo 3D). Guarda o `.tsx`
    (reeditável).

Fechar com: "✓ reel pronto: `producao/reels/<slug>/reel.mp4` · → próximo passo: `/revisar`
(crivo final antes de publicar) ou `/publicar`."

## Regras técnicas (todas já custaram render perdido — não repetir)

- **`public/` fica na RAIZ do projeto** (cwd onde roda o comando). staticFile() resolve daí —
  fora da raiz dá 404 silencioso.
- **Fundo SÓLIDO escuro + glow LINEAR do topo.** NUNCA orb/gradiente radial (vira "bola" feia).
  Grade técnica fina com máscara linear; vinheta leve só nas pontas; sem grão pesado.
- **Logo 3D (Three.js) NÃO coexiste com CameraMotionBlur global** — o blur clona os filhos e
  quebra o WebGL. Com 3D: blur LOCAL só nas cenas 2D, a cena 3D fica sem blur. Render com `--gl=angle`.
- **Auditar frames antes do full render** (still por cena).
- **Duração da Composition = soma das Sequences − soma das Transitions** (TransitionSeries).
- **Página dark no money shot** (fundo preto) rola pra vazio preto — preferir página com imagem
  cheia, ou ajustar `maxScroll` do ScrollPagina pra parar antes do rodapé.

## Saída

`producao/reels/<slug>/reel.mp4` (9:16, 1080x1920, legenda queimada) + a composição `.tsx`
(reeditável). A produção fica no clone; o motor (`remotion/src/` componentes + template) desce
do template via `/atualizar-motor` e nunca é sobrescrito pela produção.

## Formato

v1: só 9:16 vertical (Reels/TikTok/Shorts). Multi-formato (1:1, 16:9) é melhoria futura.
````

- [ ] **Step 2: Verificar o frontmatter (name/description presentes)**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && head -15 .claude/skills/reel-marca/SKILL.md`
Expected: mostra o frontmatter com `name: reel-marca` e `description:`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/reel-marca/SKILL.md
git commit -m "feat(reel): skill /reel-marca — fluxo guiado de reel de marca (Remotion)"
```

---

### Task 6: Registrar a skill no mapa de skills (se existir)

**Files:**
- Modify: `docs/mapa-de-skills.md` (se existir)

- [ ] **Step 1: Conferir se o mapa existe e onde encaixar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && ls docs/mapa-de-skills.md 2>/dev/null && grep -n "post\|reel\|video" docs/mapa-de-skills.md | head || echo "sem mapa — pular task"`
Expected: ou mostra linhas do mapa, ou "sem mapa — pular task".

- [ ] **Step 2: Se existir, adicionar `/reel-marca` perto de `/post`** como OPCIONAL

No `docs/mapa-de-skills.md`, na seção de conteúdo/opcionais, adicionar uma linha descrevendo
`/reel-marca` como reel de motion graphics por código (distinto do reel-IA do `/post`), opcional,
oferecido quando o dono quer vídeo institucional de marca. (Seguir o formato das linhas vizinhas
do arquivo — manter o estilo existente.)

- [ ] **Step 3: Commit (só se o arquivo foi modificado)**

```bash
git add docs/mapa-de-skills.md
git commit -m "docs(mapa): registra /reel-marca como opcional de conteúdo"
```

---

## Self-Review (preenchido)

**Spec coverage:**
- Motor parametrizado pela marca → Task 1 (tema.ts) + Task 2 (gerar-tema.mjs). ✓
- Template de referência (reel aprovado) → Task 3. ✓
- Captura de produto (Playwright) → Task 4. ✓
- SKILL.md fluxo guiado 10 passos + 2 gates → Task 5. ✓
- Regras técnicas (public na raiz, fundo sólido, 3D+blur, audit, duração) → Task 5 (SKILL.md). ✓
- Áudio royalty-free da pasta → Task 5, passo 9 do fluxo. ✓
- Escada de Contexto (sem produto) → Task 5, pré-requisitos + passo 4. ✓
- Registro no fluxo de skills → Task 6. ✓

**Placeholder scan:** o 4º teste inicial da Task 2 era stub; corrigido no Step 4 da própria
task (substituído por teste real de `primeiraFonte`). Sem outros placeholders.

**Type consistency:** `C` (objeto cores) e `FONTES` consistentes entre tema.ts (Task 1),
gerar-tema.mjs (Task 2, `montarTema`/`mapearCores`) e imports (Task 1 Step 3). `parsearTokens`,
`mapearCores`, `primeiraFonte`, `montarTema` — nomes batem entre teste e implementação.

**Nota de escopo:** v1 não inclui multi-formato nem busca de música (YAGNI, no spec).
