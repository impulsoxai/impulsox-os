# Upload pro YouTube (Fase 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Subir `final.mp4` (short ou longo) pro YouTube como privado, com metadados do
roteiro confirmados — automático com OAuth, assistido (pacote pro Studio) sem credencial.

**Architecture:** Conector próprio no padrão do repo: `lib-youtube-upload.mjs` (funções
puras testáveis) + `publicar-youtube.mjs` (orquestrador dry-run/`--confirmar`, OAuth via
refresh_token, upload resumável da Data API v3). Integra no `/publicar`. Privado por padrão;
publicação final é decisão do dono no Studio.

**Tech Stack:** Node ≥18 ESM (ZERO deps), `node --test`. YouTube Data API v3 (`videos.insert`
resumável + `thumbnails.set`). OAuth2 refresh_token → access_token. ffprobe pra detectar
short. Espelha `publicar-linkedin.mjs` (funções puras exportadas, dry-run, token redigido).

---

## Task 1: `lib-youtube-upload.mjs` — `detectarShort`

**Files:**
- Create: `scripts/lib-youtube-upload.mjs`
- Test: `scripts/lib-youtube-upload.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { detectarShort } from "./lib-youtube-upload.mjs";

test("detectarShort: vertical e <=180s é short", () => {
  assert.equal(detectarShort({ largura: 720, altura: 1280, duracaoSeg: 17 }), true);
});

test("detectarShort: vertical mas >180s não é short", () => {
  assert.equal(detectarShort({ largura: 720, altura: 1280, duracaoSeg: 200 }), false);
});

test("detectarShort: horizontal (16:9) não é short", () => {
  assert.equal(detectarShort({ largura: 1920, altura: 1080, duracaoSeg: 30 }), false);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube-upload.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
// lib-youtube-upload.mjs — funções puras pro upload no YouTube (Fase 3). ZERO deps, sem
// rede: montam corpo de request, validam e detectam short. ImpulsoX AI.

// Short do YouTube = vídeo vertical (altura > largura) com duração até 180s.
export function detectarShort({ largura, altura, duracaoSeg }) {
  return Number(altura) > Number(largura) && Number(duracaoSeg) <= 180;
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube-upload.test.mjs` → 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube-upload.mjs scripts/lib-youtube-upload.test.mjs
git commit -m "feat(youtube-upload): detectarShort (vertical + <=180s)"
```

---

## Task 2: `lib-youtube-upload.mjs` — `montarMetadados`

**Files:**
- Modify: `scripts/lib-youtube-upload.mjs`
- Modify: `scripts/lib-youtube-upload.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { montarMetadados } from "./lib-youtube-upload.mjs";

test("montarMetadados monta snippet+status com defaults (private, Education)", () => {
  const m = montarMetadados({ titulo: "Oi", descricao: "Desc", tags: ["a", "b"] });
  assert.deepEqual(m, {
    snippet: { title: "Oi", description: "Desc", tags: ["a", "b"], categoryId: "27" },
    status: { privacyStatus: "private", selfDeclaredMadeForKids: false },
  });
});

test("montarMetadados acrescenta #Shorts na descrição quando ehShort e não duplica", () => {
  const m1 = montarMetadados({ titulo: "T", descricao: "Desc", ehShort: true });
  assert.match(m1.snippet.description, /Desc\n\n#Shorts$/);
  const m2 = montarMetadados({ titulo: "T", descricao: "Já tem #Shorts", ehShort: true });
  assert.equal((m2.snippet.description.match(/#Shorts/g) || []).length, 1);
});

test("montarMetadados respeita privacidade explícita", () => {
  const m = montarMetadados({ titulo: "T", descricao: "D", privacidade: "public" });
  assert.equal(m.status.privacyStatus, "public");
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube-upload.test.mjs` → FAIL (`montarMetadados` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Monta o corpo do videos.insert (snippet + status). categoryId 27 = Education.
// ehShort: garante "#Shorts" no fim da descrição (sem duplicar).
export function montarMetadados({ titulo, descricao, tags = [], privacidade = "private", categoria = "27", ehShort = false }) {
  let description = descricao || "";
  if (ehShort && !/#Shorts\b/i.test(description)) description = `${description}\n\n#Shorts`;
  return {
    snippet: { title: titulo, description, tags, categoryId: categoria },
    status: { privacyStatus: privacidade, selfDeclaredMadeForKids: false },
  };
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube-upload.test.mjs` → 6 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube-upload.mjs scripts/lib-youtube-upload.test.mjs
git commit -m "feat(youtube-upload): montarMetadados (snippet/status + #Shorts)"
```

---

## Task 3: `lib-youtube-upload.mjs` — `validarUpload`

**Files:**
- Modify: `scripts/lib-youtube-upload.mjs`
- Modify: `scripts/lib-youtube-upload.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { validarUpload } from "./lib-youtube-upload.mjs";

test("validarUpload sem erros quando título e descrição ok", () => {
  assert.deepEqual(validarUpload({ arquivo: "x.mp4", titulo: "Tudo certo", descricao: "ok" }), []);
});

test("validarUpload acusa título ausente, título longo e descrição longa", () => {
  assert.deepEqual(validarUpload({ arquivo: "x.mp4", titulo: "", descricao: "d" }), ["título ausente."]);
  const longo = "a".repeat(101);
  assert.deepEqual(validarUpload({ arquivo: "x.mp4", titulo: longo, descricao: "d" }), ["título passa de 100 caracteres (tem 101)."]);
  const desc = "a".repeat(5001);
  assert.deepEqual(validarUpload({ arquivo: "x.mp4", titulo: "T", descricao: desc }), ["descrição passa de 5000 caracteres (tem 5001)."]);
});

test("validarUpload acusa arquivo ausente", () => {
  assert.deepEqual(validarUpload({ arquivo: "", titulo: "T", descricao: "d" }), ["arquivo de vídeo não informado."]);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube-upload.test.mjs` → FAIL (`validarUpload` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Valida os campos do upload e devolve lista de erros acionáveis (PT). Vazia = ok.
export function validarUpload({ arquivo, titulo, descricao = "" }) {
  const erros = [];
  if (!arquivo) erros.push("arquivo de vídeo não informado.");
  if (!titulo) erros.push("título ausente.");
  else if (titulo.length > 100) erros.push(`título passa de 100 caracteres (tem ${titulo.length}).`);
  if (descricao.length > 5000) erros.push(`descrição passa de 5000 caracteres (tem ${descricao.length}).`);
  return erros;
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube-upload.test.mjs` → 10 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube-upload.mjs scripts/lib-youtube-upload.test.mjs
git commit -m "feat(youtube-upload): validarUpload (erros acionáveis em PT)"
```

---

## Task 4: `lib-youtube-upload.mjs` — `montarPacoteAssistido`

**Files:**
- Modify: `scripts/lib-youtube-upload.mjs`
- Modify: `scripts/lib-youtube-upload.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { montarPacoteAssistido } from "./lib-youtube-upload.mjs";

test("montarPacoteAssistido gera texto com título, tags, privacidade e passo do Studio", () => {
  const txt = montarPacoteAssistido({
    slug: "vivian", final: "canal-youtube/edicao/vivian/final.mp4",
    metadados: { snippet: { title: "Reel em 15s", description: "Desc", tags: ["ia", "reel"] }, status: { privacyStatus: "private" } },
    thumb: null,
  });
  assert.match(txt, /Reel em 15s/);
  assert.match(txt, /ia, reel/);
  assert.match(txt, /private/);
  assert.match(txt, /studio\.youtube\.com/);
  assert.match(txt, /final\.mp4/);
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/lib-youtube-upload.test.mjs` → FAIL (`montarPacoteAssistido` não exportada).

- [ ] **Step 3: Write minimal implementation**

```javascript
// Texto legível pro modo assistido (sem credencial): o dono arrasta o vídeo no Studio e
// cola estes metadados. Não publica nada — só prepara.
export function montarPacoteAssistido({ slug, final, metadados, thumb }) {
  const s = metadados.snippet, st = metadados.status;
  return [
    `# Upload assistido — ${slug}`,
    ``,
    `Vídeo: ${final}`,
    thumb ? `Thumbnail: ${thumb}` : `Thumbnail: (nenhuma — short usa o próprio frame)`,
    ``,
    `Título: ${s.title}`,
    `Tags: ${(s.tags || []).join(", ")}`,
    `Privacidade: ${st.privacyStatus}`,
    ``,
    `Descrição:`,
    s.description,
    ``,
    `--- Passo a passo ---`,
    `1. Abra https://studio.youtube.com → Criar → Enviar vídeos.`,
    `2. Selecione o arquivo acima.`,
    `3. Cole título, descrição e tags. Deixe a privacidade em ${st.privacyStatus}.`,
    `4. Revise no player e publique você mesmo.`,
    ``,
  ].join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/lib-youtube-upload.test.mjs` → 11 PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-youtube-upload.mjs scripts/lib-youtube-upload.test.mjs
git commit -m "feat(youtube-upload): montarPacoteAssistido (pacote pro Studio sem OAuth)"
```

---

## Task 5: `publicar-youtube.mjs` — dry-run + plano (sem subir)

**Files:**
- Create: `scripts/publicar-youtube.mjs`
- Test: `scripts/publicar-youtube.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { montarPlano } from "./publicar-youtube.mjs";

test("montarPlano resume o que vai subir (auto quando há credencial)", () => {
  const p = montarPlano({
    slug: "vivian", final: "canal-youtube/edicao/vivian/final.mp4",
    titulo: "Reel em 15s", descricao: "Desc", tags: ["ia"],
    privacidade: "private", ehShort: true, temCredencial: true,
  });
  assert.equal(p.dry_run, true);
  assert.equal(p.modo, "automático");
  assert.equal(p.ehShort, true);
  assert.equal(p.privacidade, "private");
  assert.equal(p.titulo, "Reel em 15s");
});

test("montarPlano marca modo assistido sem credencial", () => {
  const p = montarPlano({ slug: "v", final: "f.mp4", titulo: "T", descricao: "D", tags: [], privacidade: "private", ehShort: false, temCredencial: false });
  assert.equal(p.modo, "assistido");
});
```

- [ ] **Step 2: Run test to verify it fails** — `node --test scripts/publicar-youtube.test.mjs` → FAIL (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```javascript
#!/usr/bin/env node
/**
 * publicar-youtube.mjs — sobe final.mp4 (short ou longo) pro YouTube como PRIVADO, com
 * metadados confirmados. Auto via OAuth (refresh_token); assistido (pacote pro Studio) sem
 * credencial. Dry-run por padrão; --confirmar sobe. ImpulsoX AI. Data API v3.
 * YT_REFRESH_TOKEN/secret NUNCA em log ou erro.
 *
 * Uso: node scripts/publicar-youtube.mjs --slug vivian --titulo "..." --descricao "..." \
 *        --tags "a,b" [--privacidade private|unlisted|public] [--thumb capa.png] [--confirmar]
 */
import { readFileSync, existsSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { registrarPasso } from "./registrar-passo.mjs";
import { detectarShort, montarMetadados, validarUpload, montarPacoteAssistido } from "./lib-youtube-upload.mjs";

const FFPROBE = process.env.FFPROBE_BIN || "ffprobe";

// Resumo do dry-run — função pura, testável.
export function montarPlano({ slug, final, titulo, descricao, tags, privacidade, ehShort, temCredencial }) {
  return {
    dry_run: true, slug, final, titulo, privacidade, ehShort,
    modo: temCredencial ? "automático" : "assistido",
    tags, descricaoPreview: (descricao || "").slice(0, 80),
    nota: "rode de novo com --confirmar pra subir de verdade.",
  };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
```

- [ ] **Step 4: Run test to verify it passes** — `node --test scripts/publicar-youtube.test.mjs` → 2 PASS. Depois `node --check scripts/publicar-youtube.mjs` → sem erro.

- [ ] **Step 5: Commit**

```bash
git add scripts/publicar-youtube.mjs scripts/publicar-youtube.test.mjs
git commit -m "feat(youtube-upload): publicar-youtube montarPlano (dry-run)"
```

---

## Task 6: `publicar-youtube.mjs` — CLI completo (OAuth, upload, assistido)

**Files:**
- Modify: `scripts/publicar-youtube.mjs`

- [ ] **Step 1: Acrescentar as funções de rede e o bloco `import.meta.main`**

Acrescentar ao fim de `scripts/publicar-youtube.mjs` (depois de `falhar`):

```javascript
// ffprobe → {largura, altura, duracaoSeg}. Isola a leitura de mídia.
function sondarVideo(arquivo) {
  const r = spawnSync(FFPROBE, ["-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", arquivo], { encoding: "utf8" });
  const linhas = (r.stdout || "").trim().split("\n");
  return { largura: Number(linhas[0]) || 0, altura: Number(linhas[1]) || 0, duracaoSeg: Number(linhas[2]) || 0 };
}

// Troca refresh_token por access_token (OAuth2). Token nunca volta em erro legível.
async function obterAccessToken({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!r.ok) throw new Error(`OAuth falhou (HTTP ${r.status}) — refresh_token pode ter expirado; reautorize pelo guia.`);
  const j = await r.json();
  if (!j.access_token) throw new Error("OAuth não devolveu access_token — reautorize pelo guia.");
  return j.access_token;
}

// Upload resumável: inicia (metadados) → PUT do binário → devolve o id do vídeo.
async function subirVideo({ accessToken, arquivo, metadados }) {
  const inicio = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(metadados) });
  if (!inicio.ok) throw new Error(`início do upload falhou (HTTP ${inicio.status}).`);
  const urlUpload = inicio.headers.get("location");
  if (!urlUpload) throw new Error("YouTube não devolveu a URL de upload resumável.");
  const bin = readFileSync(arquivo);
  const put = await fetch(urlUpload, { method: "PUT", headers: { "Content-Type": "video/*" }, body: bin });
  if (!put.ok) throw new Error(`envio do vídeo falhou (HTTP ${put.status}).`);
  const j = await put.json();
  if (!j.id) throw new Error("upload concluiu mas o YouTube não devolveu o id do vídeo.");
  return j.id;
}

// Seta a thumbnail (vídeo longo). Falha aqui não derruba o upload já feito.
async function setarThumb({ accessToken, videoId, thumb }) {
  const bin = readFileSync(thumb);
  const r = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`,
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "image/png" }, body: bin });
  if (!r.ok) console.error(`AVISO: thumbnail não aplicada (HTTP ${r.status}).`);
}

function registrarPublicacao({ slug, videoId, privacidade }) {
  const caminho = join("producao", "publicacoes.md");
  mkdirSync("producao", { recursive: true });
  if (!existsSync(caminho)) writeFileSync(caminho, "# Publicações\n\n");
  appendFileSync(caminho, `- [${new Date().toISOString()}] YouTube ${slug}: https://youtu.be/${videoId} (${privacidade})\n`);
}

if (import.meta.main) {
  try { process.loadEnvFile(); } catch { /* sem .env: modo assistido */ }
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const slug = flag("--slug");
  const final = flag("--video") || (slug ? join("canal-youtube", "edicao", slug, "final.mp4") : undefined);
  const titulo = flag("--titulo");
  const descricao = flag("--descricao") || "";
  const tags = (flag("--tags") || "").split(",").map((t) => t.trim()).filter(Boolean);
  const privacidade = flag("--privacidade") || "private";
  const thumb = flag("--thumb");
  const confirmar = has("--confirmar");

  if (!slug && !final) falhar("informe --slug <nome> ou --video <arquivo>.");
  if (!final || !existsSync(final)) falhar(`vídeo não encontrado: ${final}`);

  const erros = validarUpload({ arquivo: final, titulo, descricao });
  if (erros.length) falhar(erros.join(" "));

  let dims = { largura: 0, altura: 0, duracaoSeg: 0 };
  try { dims = sondarVideo(final); } catch { console.error("AVISO: ffprobe falhou — assumindo vídeo longo."); }
  const ehShort = detectarShort(dims);

  const clientId = process.env.YT_CLIENT_ID, clientSecret = process.env.YT_CLIENT_SECRET, refreshToken = process.env.YT_REFRESH_TOKEN;
  const temCredencial = Boolean(clientId && clientSecret && refreshToken);
  const metadados = montarMetadados({ titulo, descricao, tags, privacidade, ehShort });

  if (!confirmar) {
    console.log(JSON.stringify(montarPlano({ slug, final, titulo, descricao, tags, privacidade, ehShort, temCredencial }), null, 2));
    process.exit(0);
  }

  if (!temCredencial) {
    const txt = montarPacoteAssistido({ slug, final, metadados, thumb });
    const saida = join(dirname(final), "metadados.txt");
    writeFileSync(saida, txt);
    console.log(JSON.stringify({ ok: true, modo: "assistido", pacote: saida }, null, 2));
    process.exit(0);
  }

  (async () => {
    try {
      registrarPasso({ skill: "/publicar", etapa: "subindo vídeo pro YouTube", status: "inicio" });
      const accessToken = await obterAccessToken({ clientId, clientSecret, refreshToken });
      const videoId = await subirVideo({ accessToken, arquivo: final, metadados });
      if (thumb && existsSync(thumb)) await setarThumb({ accessToken, videoId, thumb });
      registrarPublicacao({ slug, videoId, privacidade });
      registrarPasso({ skill: "/publicar", etapa: `vídeo no YouTube: ${videoId}`, status: "ok" });
      console.log(JSON.stringify({ ok: true, modo: "automático", videoId, link: `https://youtu.be/${videoId}`, privacidade }, null, 2));
    } catch (e) {
      registrarPasso({ skill: "/publicar", etapa: "falha no upload do YouTube", status: "erro" });
      falhar(e.message);
    }
  })();
}
```

- [ ] **Step 2: Verify syntax** — `node --check scripts/publicar-youtube.mjs` → sem saída (sucesso).

- [ ] **Step 3: Run the existing tests** — `node --test scripts/publicar-youtube.test.mjs scripts/lib-youtube-upload.test.mjs` → todos PASS (o bloco `import.meta.main` não roda em teste).

- [ ] **Step 4: Dry-run smoke test (sem credencial, sem subir)**

Gerar um .mp4 vertical curto de teste com ffmpeg e rodar o dry-run:
```bash
ffmpeg -y -f lavfi -i "color=c=navy:s=720x1280:d=5" -f lavfi -i "sine=frequency=440:d=5" /tmp/yt-teste.mp4 2>/dev/null
node scripts/publicar-youtube.mjs --video /tmp/yt-teste.mp4 --slug teste --titulo "Teste" --descricao "Desc" 2>&1 | head -12
```
Esperado: JSON do plano com `"dry_run": true`, `"ehShort": true` (720x1280, 5s), `"modo": "assistido"` (sem credencial). Não sobe nada. Limpar: `rm -f /tmp/yt-teste.mp4`.

- [ ] **Step 5: Commit**

```bash
git add scripts/publicar-youtube.mjs
git commit -m "feat(youtube-upload): CLI publicar-youtube — OAuth, upload resumável, modo assistido"
```

---

## Task 7: Integrar no `/publicar` + guia OAuth

**Files:**
- Modify: `.claude/skills/publicar/SKILL.md`

- [ ] **Step 1: Acrescentar YouTube ao Mapa de automação**

No `.claude/skills/publicar/SKILL.md`, na tabela "Mapa de automação", acrescentar as linhas:

```markdown
| YouTube — short e longo | **Automático** — Data API v3 (exige OAuth do canal) | API oficial de upload |
| YouTube — sem credencial | **Assistido** — vídeo + metadados.txt prontos pro Studio | OAuth não configurado |
```

- [ ] **Step 2: Acrescentar a seção de script + guia OAuth**

Na seção "Scripts" do mesmo arquivo, acrescentar:

```markdown
`scripts/publicar-youtube.mjs` sobe `final.mp4` (short ou longo) pro YouTube como **privado**
(Data API v3): `node scripts/publicar-youtube.mjs --slug <nome> --titulo "..." --descricao
"..." --tags "a,b" [--thumb capa.png]`. Dry-run por padrão; `--confirmar` sobe. Short é
detectado (vertical + ≤180s) e ganha `#Shorts`. Metadados vêm do roteiro — **sempre confirmar
antes**. Com OAuth (`YT_CLIENT_ID`/`YT_CLIENT_SECRET`/`YT_REFRESH_TOKEN` no `.env`) sobe
sozinho; sem credencial, gera `metadados.txt` pro Studio (assistido). Sobe **privado** — a
publicação final é decisão do dono no Studio. Tokens nunca aparecem em log.

**Guia OAuth (1ª vez):** criar `producao/guia-youtube-oauth.md` com: projeto no Google Cloud
→ ativar *YouTube Data API v3* → tela de consentimento (modo Testing serve) → criar credencial
*OAuth client ID* tipo Desktop → autorizar o escopo `https://www.googleapis.com/auth/youtube.upload`
→ trocar o code pelo refresh_token → preencher o `.env`.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/publicar/SKILL.md
git commit -m "feat(publicar): YouTube no mapa de automação + guia OAuth (Fase 3)"
```

---

## Task 8: `.env.example` + verificação final

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Acrescentar as variáveis ao `.env.example`**

Acrescentar ao fim do `.env.example`:

```
# --- Upload pro YouTube (/publicar, Fase 3) — OAuth; todas opcionais (sem elas = assistido) ---
YT_CLIENT_ID=
YT_CLIENT_SECRET=
YT_REFRESH_TOKEN=
```

- [ ] **Step 2: Sintaxe de todos os scripts novos**

```bash
node --check scripts/lib-youtube-upload.mjs && node --check scripts/publicar-youtube.mjs
```
Esperado: sem saída (sucesso).

- [ ] **Step 3: Suíte completa da Fase 3**

```bash
node --test scripts/lib-youtube-upload.test.mjs scripts/publicar-youtube.test.mjs
```
Esperado: todos `pass`, `0 fail`.

- [ ] **Step 4: Confirmar que nenhum teste chama a API real**

```bash
grep -rn "fetch(\|googleapis\|oauth2" scripts/lib-youtube-upload.test.mjs scripts/publicar-youtube.test.mjs
```
Esperado: nenhuma ocorrência (testes batem só nas funções puras).

- [ ] **Step 5: Commit**

```bash
git add .env.example
git commit -m "docs(youtube-upload): .env.example com credenciais OAuth do YouTube"
```
