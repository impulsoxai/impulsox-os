# Recorte de webcam sem fundo (Fase 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a bolha redonda com sombra do `/editar-video --webcam` por um recorte de silhueta sem fundo (estilo Matt Ganzak) usando o pacote Python `backgroundremover`, mantendo a mesma posição/tamanho de hoje (`--canto`/`--bolha-tamanho`/`--margem`).

**Architecture:** Um script novo `lib-recorte.mjs` isola tudo relacionado ao `backgroundremover` (detecção de instalação, instalação, montagem do comando CLI) como funções puras testáveis + uma função de efeito colateral (roda o `pip install`). `lib-edicao.mjs` ganha `filtroRecorteWebcam` (substitui `filtroBolhaWebcam`) — mais simples que a atual porque não gera máscara circular nem sombra, só escala e sobrepõe um vídeo que já chega com alpha. `editar-video.mjs` ganha um passo prévio (fora do ffmpeg) que roda o recorte antes de montar o filtergraph de composição.

**Tech Stack:** Node.js (ESM), ffmpeg (via `execFileSync`), Python 3.7-3.11 + pacote `backgroundremover` (CLI), `node:test` + `node:assert/strict` pros testes.

---

## Mapa de arquivos

- **Criar:** `scripts/lib-recorte.mjs` — funções puras + 1 função de instalação (efeito colateral)
- **Criar:** `scripts/lib-recorte.test.mjs` — testes das funções puras
- **Modificar:** `scripts/lib-edicao.mjs` — remove `filtroBolhaWebcam`, adiciona `filtroRecorteWebcam`
- **Modificar:** `scripts/lib-edicao.test.mjs` — remove os 2 testes de `filtroBolhaWebcam`, adiciona testes de `filtroRecorteWebcam`
- **Modificar:** `scripts/editar-video.mjs` — troca a chamada de `filtroBolhaWebcam` pelo passo de recorte + `filtroRecorteWebcam`
- **Modificar:** `.claude/skills/editar-video/SKILL.md` — atualiza a seção "Bolha de webcam" pra "Recorte de webcam"

---

### Task 1: `lib-recorte.mjs` — detecção e comando do backgroundremover (funções puras)

**Files:**
- Create: `scripts/lib-recorte.mjs`
- Test: `scripts/lib-recorte.test.mjs`

- [ ] **Step 1: Write the failing test — comandoRecorte monta os args certos**

```javascript
// scripts/lib-recorte.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { comandoRecorte } from "./lib-recorte.mjs";

test("comandoRecorte: monta comando python -m backgroundremover.cmd.cli com -mk", () => {
  const { bin, args } = comandoRecorte("canal-youtube/gravacoes/aula1/webcam.mp4", "canal-youtube/gravacoes/aula1/webcam-recorte.mov");
  assert.equal(bin, "python");
  assert.deepEqual(args, [
    "-m", "backgroundremover.cmd.cli",
    "-i", "canal-youtube/gravacoes/aula1/webcam.mp4",
    "-mk",
    "-o", "canal-youtube/gravacoes/aula1/webcam-recorte.mov",
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-recorte.test.mjs`
Expected: FAIL — `lib-recorte.mjs` não existe ainda (Cannot find module)

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/lib-recorte.mjs — funções do recorte de webcam sem fundo (Fase 5). ImpulsoX AI.
// Usa o pacote Python `backgroundremover` (CLI) como pré-processo, fora do ffmpeg.

// Monta o comando CLI do backgroundremover pra um arquivo de vídeo.
// -mk (matte key) gera saída com canal alpha (fundo transparente), formato .mov.
export function comandoRecorte(entrada, saida) {
  return {
    bin: "python",
    args: ["-m", "backgroundremover.cmd.cli", "-i", entrada, "-mk", "-o", saida],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-recorte.test.mjs`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-recorte.mjs scripts/lib-recorte.test.mjs
git commit -m "feat(recorte): comandoRecorte monta args do backgroundremover CLI"
```

---

### Task 2: `lib-recorte.mjs` — verificação de instalação (função pura sobre resultado de comando)

**Files:**
- Modify: `scripts/lib-recorte.mjs`
- Test: `scripts/lib-recorte.test.mjs`

- [ ] **Step 1: Write the failing test — backgroundremoverInstalado interpreta o resultado do spawnSync**

```javascript
// adicionar em scripts/lib-recorte.test.mjs
import { backgroundremoverInstalado } from "./lib-recorte.mjs";

test("backgroundremoverInstalado: status 0 = instalado", () => {
  assert.equal(backgroundremoverInstalado({ status: 0, error: null }), true);
});

test("backgroundremoverInstalado: status != 0 = não instalado", () => {
  assert.equal(backgroundremoverInstalado({ status: 1, error: null }), false);
});

test("backgroundremoverInstalado: erro de spawn (comando não existe) = não instalado", () => {
  assert.equal(backgroundremoverInstalado({ status: null, error: new Error("ENOENT") }), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-recorte.test.mjs`
Expected: FAIL — `backgroundremoverInstalado` não exportado

- [ ] **Step 3: Write minimal implementation**

Adicionar ao final de `scripts/lib-recorte.mjs`:

```javascript
// Interpreta o resultado de rodar `python -m backgroundremover.cmd.cli --help` (ou similar)
// via spawnSync. Pura: recebe o objeto de resultado, não roda nada.
export function backgroundremoverInstalado(resultadoSpawnSync) {
  if (resultadoSpawnSync.error) return false;
  return resultadoSpawnSync.status === 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-recorte.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-recorte.mjs scripts/lib-recorte.test.mjs
git commit -m "feat(recorte): backgroundremoverInstalado interpreta resultado do spawnSync"
```

---

### Task 3: `lib-recorte.mjs` — instalação automática (efeito colateral, sem teste unitário)

**Files:**
- Modify: `scripts/lib-recorte.mjs`

Esta função roda `pip install` de verdade — não é testável por `node:test` sem mockar rede/processo (fora de escopo da spec, que pede só "instala sozinho"). Implementação direta, sem TDD nesta etapa (efeito colateral puro, mesmo padrão de outras funções não-puras do projeto como `instalarBackgroundremover` de `lib-gravacao.mjs`'s device resolution).

- [ ] **Step 1: Write the implementation**

Adicionar ao final de `scripts/lib-recorte.mjs`:

```javascript
import { spawnSync } from "node:child_process";

// Verifica se o backgroundremover está instalado; se não, instala via pip. Efeito colateral —
// não-pura de propósito (chama processo externo). Lança erro claro se a instalação falhar.
export function garantirBackgroundremover() {
  const check = spawnSync("python", ["-m", "backgroundremover.cmd.cli", "--help"], { stdio: "ignore" });
  if (backgroundremoverInstalado(check)) return;
  console.error("• backgroundremover não encontrado — instalando (pip install backgroundremover)...");
  const install = spawnSync("pip", ["install", "backgroundremover"], { stdio: "inherit" });
  if (install.status !== 0) {
    throw new Error(
      "Não foi possível instalar o backgroundremover automaticamente. " +
      "Instale manualmente: pip install backgroundremover (requer Python 3.7-3.11 no PATH)."
    );
  }
}
```

- [ ] **Step 2: Verify manually**

Run: `node -e "import('./scripts/lib-recorte.mjs').then(m => m.garantirBackgroundremover())"`
Expected: se já instalado, não imprime nada e não lança erro. Se não instalado, imprime aviso e tenta instalar (requer pip disponível no PATH da máquina de teste).

- [ ] **Step 3: Commit**

```bash
git add scripts/lib-recorte.mjs
git commit -m "feat(recorte): garantirBackgroundremover instala automaticamente se ausente"
```

---

### Task 4: `lib-recorte.mjs` — rodar o recorte (efeito colateral, orquestra Task 1+3)

**Files:**
- Modify: `scripts/lib-recorte.mjs`

- [ ] **Step 1: Write the implementation**

Adicionar ao final de `scripts/lib-recorte.mjs`:

```javascript
// Roda o recorte de fundo sobre um vídeo de webcam. Efeito colateral: chama o backgroundremover
// via CLI, pode levar minutos (processa o vídeo inteiro, CPU-only). Lança erro se o comando falhar.
export function rodarRecorte(entrada, saida) {
  garantirBackgroundremover();
  console.error("• recortando fundo da webcam (pode levar alguns minutos)...");
  const { bin, args } = comandoRecorte(entrada, saida);
  const r = spawnSync(bin, args, { stdio: "inherit" });
  if (r.status !== 0) {
    throw new Error(`backgroundremover falhou (status ${r.status}) processando ${entrada}.`);
  }
  console.error("• recorte concluído.");
}
```

- [ ] **Step 2: Verify manually**

Este passo depende de um `webcam.mp4` real e do `backgroundremover` instalado — validação fica pro smoke test da Task 7. Por ora, confirmar que o arquivo importa sem erro de sintaxe:

Run: `node -e "import('./scripts/lib-recorte.mjs').then(() => console.log('OK'))"`
Expected: imprime `OK`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib-recorte.mjs
git commit -m "feat(recorte): rodarRecorte orquestra instalação + execução do backgroundremover"
```

---

### Task 5: `lib-edicao.mjs` — trocar `filtroBolhaWebcam` por `filtroRecorteWebcam`

**Files:**
- Modify: `scripts/lib-edicao.mjs:458-487` (remove `filtroBolhaWebcam`, mantém `posicaoOverlay` intocado)
- Modify: `scripts/lib-edicao.test.mjs:420-440` (remove os 2 testes de `filtroBolhaWebcam`)

- [ ] **Step 1: Write the failing test — filtroRecorteWebcam monta overlay simples (sem geq/sombra)**

Substituir os 2 testes de `filtroBolhaWebcam` (linhas 420-440 de `scripts/lib-edicao.test.mjs`) por:

```javascript
test("filtroRecorteWebcam: escala o recorte e sobrepõe sem máscara nem sombra", () => {
  const { filtro, mapV } = filtroRecorteWebcam({
    corpoFiltros: "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1",
    ladoRecorte: 384, canto: "ir", margem: 40,
  });
  assert.equal(mapV, "[vrecorte]");
  assert.match(filtro, /\[0:v\]scale=1920:1080.*\[vcorpo\]/);
  assert.match(filtro, /\[1:v\]scale=384:-1:force_original_aspect_ratio=increase\[cam\]/);
  assert.doesNotMatch(filtro, /geq=/);
  assert.doesNotMatch(filtro, /gblur=/);
  assert.match(filtro, /overlay=W-w-\d+:H-h-\d+:shortest=1\[vrecorte\]/);
  assert.match(filtro, /\[vrecorte\]$/);
});

test("filtroRecorteWebcam: canto esquerdo usa a posição correta", () => {
  const { filtro } = filtroRecorteWebcam({
    corpoFiltros: "scale=1920:1080", ladoRecorte: 384, canto: "il", margem: 40,
  });
  assert.match(filtro, /overlay=40:H-h-40:shortest=1/);
});
```

E atualizar o import no topo do arquivo (linha 9): trocar `filtroBolhaWebcam` por `filtroRecorteWebcam`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `filtroRecorteWebcam` não exportado ainda (os testes antigos de `filtroBolhaWebcam` já foram removidos nesta mesma edição, então não há conflito de nome)

- [ ] **Step 3: Write minimal implementation**

Em `scripts/lib-edicao.mjs`, substituir o bloco `filtroBolhaWebcam` (linhas 458-487, incluindo o comentário acima dele) por:

```javascript
// Filtergraph completo (-filter_complex) pro recorte de webcam SEM fundo, sobreposto no canto.
// [1:v] já vem com canal alpha (gerado pelo backgroundremover fora do ffmpeg, ver lib-recorte.mjs)
// — aqui só escala mantendo proporção (largura fixa, altura livre) e sobrepõe. Sem máscara
// circular, sem sombra: a silhueta recortada é o próprio contorno do vídeo com alpha.
export function filtroRecorteWebcam({ corpoFiltros, ladoRecorte, canto = "ir", margem = 40 }) {
  const pos = posicaoOverlay(canto, margem);
  const partes = [];
  partes.push(`[0:v]${corpoFiltros}[vcorpo]`);
  partes.push(`[1:v]scale=${ladoRecorte}:-1:force_original_aspect_ratio=increase[cam]`);
  // shortest=1: a saída termina quando o input mais curto (vídeo do corpo) acaba.
  partes.push(`[vcorpo][cam]overlay=${pos}:shortest=1[vrecorte]`);
  return { filtro: partes.join(";"), mapV: "[vrecorte]" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib-edicao.test.mjs`
Expected: PASS (todos os testes, incluindo os 2 novos de `filtroRecorteWebcam` e os existentes de `posicaoOverlay` intocados)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(edicao): filtroRecorteWebcam substitui filtroBolhaWebcam — sem mascara circular nem sombra"
```

---

### Task 6: `editar-video.mjs` — integrar o passo de recorte antes da composição

**Files:**
- Modify: `scripts/editar-video.mjs:14` (import)
- Modify: `scripts/editar-video.mjs:203-216` (bloco de composição com webcam)

- [ ] **Step 1: Atualizar o import**

Em `scripts/editar-video.mjs` linha 14, trocar `filtroBolhaWebcam` por `filtroRecorteWebcam` na lista de imports de `./lib-edicao.mjs`, e adicionar um novo import logo abaixo:

```javascript
import { rodarRecorte } from "./lib-recorte.mjs";
```

- [ ] **Step 2: Substituir o bloco de composição com webcam**

Em `scripts/editar-video.mjs`, o bloco atual (linhas 203-216):

```javascript
      if (webcamArq && existsSync(webcamArq)) {
        // bolha de webcam: -filter_complex já usa 2 inputs (corpo + webcam); áudio externo
        // entra como 3º input quando houver, senão cai pro 0:a? (compatibilidade antiga).
        const ladoBolha = Math.round(1920 * bolhaTamanho);
        const { filtro, mapV } = filtroBolhaWebcam({
          corpoFiltros, ladoBolha, canto: cantoBolha, margem: margemBolha, sombra: true,
        });
        const inputs = audioExterno
          ? ["-i", baseVideo, "-i", webcamArq, "-i", audioExterno]
          : ["-i", baseVideo, "-i", webcamArq];
        const mapA = audioExterno ? "2:a" : "0:a?";
        execFileSync(FFMPEG, ["-y", ...inputs,
          "-filter_complex", filtro, "-map", mapV, "-map", mapA,
          "-c:a", "aac", "-shortest", corpo], { stdio: "inherit" });
      } else if (audioExterno) {
```

vira:

```javascript
      if (webcamArq && existsSync(webcamArq)) {
        // recorte de webcam sem fundo: passo prévio (fora do ffmpeg) gera um .mov com alpha,
        // depois -filter_complex compõe 2 inputs (corpo + recorte); áudio externo entra como
        // 3º input quando houver, senão cai pro 0:a? (compatibilidade antiga).
        const recorteArq = join(base, "_webcam-recorte.mov");
        if (!existsSync(recorteArq)) rodarRecorte(webcamArq, recorteArq);
        const ladoRecorte = Math.round(1920 * bolhaTamanho);
        const { filtro, mapV } = filtroRecorteWebcam({
          corpoFiltros, ladoRecorte, canto: cantoBolha, margem: margemBolha,
        });
        const inputs = audioExterno
          ? ["-i", baseVideo, "-i", recorteArq, "-i", audioExterno]
          : ["-i", baseVideo, "-i", recorteArq];
        const mapA = audioExterno ? "2:a" : "0:a?";
        execFileSync(FFMPEG, ["-y", ...inputs,
          "-filter_complex", filtro, "-map", mapV, "-map", mapA,
          "-c:a", "aac", "-shortest", corpo], { stdio: "inherit" });
      } else if (audioExterno) {
```

Nota: `recorteArq` fica em `canal-youtube/edicao/<slug>/_webcam-recorte.mov` (pasta de edição, não a de gravação crua) — o `!existsSync(recorteArq)` evita reprocessar o recorte pesado se o mesmo `slug` for reeditado (reaproveitamento natural, sem lógica de cache extra, conforme a spec).

- [ ] **Step 3: Verify manually — smoke test com o webcam.mp4 mais recente já gravado**

Usar uma gravação real já existente (ex.: `canal-youtube/gravacoes/teste1/webcam.mp4`, citada na memória do projeto como já testada na Fase 4):

```bash
node scripts/editar-video.mjs --slug teste-recorte --video canal-youtube/gravacoes/teste1/tela.mp4 --voz canal-youtube/gravacoes/teste1/webcam.mp4 --webcam canal-youtube/gravacoes/teste1/webcam.mp4 --sem-corte-silencio --confirmar
```

Expected:
- Console mostra "recortando fundo da webcam (pode levar alguns minutos)..." seguido de "recorte concluído."
- `canal-youtube/edicao/teste-recorte/final.mp4` existe, tem áudio, e mostra o rosto recortado (sem fundo, sem círculo, sem sombra) no canto inferior direito sobre a tela
- Rodar de novo com o mesmo `--slug`: o passo de recorte é pulado (arquivo `_webcam-recorte.mov` já existe), só a composição roda de novo

Se o resultado visual não estiver bom (conforme a spec: sem fallback automático), reportar pra dona decidir — não é falha do script.

- [ ] **Step 4: Commit**

```bash
git add scripts/editar-video.mjs
git commit -m "feat(editar-video): integra rodarRecorte + filtroRecorteWebcam, substitui a bolha"
```

---

### Task 7: Rodar a suíte completa de testes e confirmar zero regressão

**Files:** nenhum (validação)

- [ ] **Step 1: Rodar todos os testes do projeto**

Run: `node --test scripts/*.test.mjs`
Expected: todos os testes passam, incluindo os novos de `lib-recorte.test.mjs` e `lib-edicao.test.mjs`, sem nenhuma referência restante a `filtroBolhaWebcam`

- [ ] **Step 2: Confirmar que `filtroBolhaWebcam` não aparece mais em nenhum arquivo**

Run: `grep -rn "filtroBolhaWebcam" scripts/ .claude/`
Expected: nenhum resultado

- [ ] **Step 3: Commit (se algo precisou de ajuste)**

```bash
git add -A
git commit -m "chore: confirma suite verde apos Fase 5 (recorte de webcam)"
```

---

### Task 8: Atualizar `SKILL.md` do `/editar-video`

**Files:**
- Modify: `.claude/skills/editar-video/SKILL.md:140-165`

- [ ] **Step 1: Substituir a seção "Bolha de webcam (rosto + tela)"**

Trocar o conteúdo da seção (linhas 140-165, identificada na exploração do código) por:

```markdown
## Recorte de webcam (rosto + tela, sem fundo)

Se você gravou com o `/gravar-tela` (que salva `tela.mp4` e `webcam.mp4` separados), dá pra
sobrepor a webcam com o FUNDO REMOVIDO (silhueta real, sem moldura, sem sombra) no canto —
o formato "rosto recortado + tela", como o Matt Ganzak grava seus treinamentos.

**Como:** passe `--webcam <caminho do webcam.mp4>` no `/editar-video`. Sem essa flag, nenhum
recorte (vídeo normal). Na primeira vez, o sistema instala sozinho o `backgroundremover`
(pacote Python) se ele não estiver no ambiente.

- `--canto ir` (default) — onde fica: `ir` inferior-direito · `il` inferior-esquerdo ·
  `sr` superior-direito · `sl` superior-esquerdo.
- `--bolha-tamanho 0.2` — fração da largura (0.2 = 20% da tela). Maior = recorte maior.
- `--margem 40` — distância da borda em pixels.

**O áudio é o da TELA (sua narração), não o da webcam** — evita áudio duplicado/eco. O
recorte fica fixo no canto o vídeo todo (não dá zoom junto com o auto-zoom — é uma camada
por cima).

**Tempo de processamento:** o recorte roda em CPU (sem GPU) e processa o vídeo inteiro —
pode levar alguns minutos num vídeo longo. Reeditar o mesmo `--slug` reaproveita o recorte
já feito (só a composição final roda de novo).

**Sem fallback automático:** se o recorte sair com borda ruim (cabelo, contorno), confira o
resultado e decida — regravar com melhor iluminação/fundo costuma resolver.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/editar-video/SKILL.md
git commit -m "docs(skill): editar-video documenta o recorte de webcam sem fundo (substitui a bolha)"
```

---

## Self-Review (executado antes de entregar o plano)

**Cobertura da spec:**
- Pós-processo dentro do `/editar-video`, não muda `/gravar-tela` → Task 6 ✓
- Aceita tempo de processamento com aviso claro → Task 4 (`console.error` de progresso) ✓
- Bolha removida de vez, `--webcam` vira o recorte → Task 5+6 removem `filtroBolhaWebcam` e todo uso ✓
- Setup automático do `backgroundremover` → Task 3 (`garantirBackgroundremover`) ✓
- Mesma posição/tamanho (`--canto`/`--bolha-tamanho`/`--margem`) → Task 5 reaproveita `posicaoOverlay` sem alterar sua assinatura; flags de CLI mantidas em `editar-video.mjs` ✓
- Sem fallback automático → Task 6 Step 3 documenta explicitamente que resultado ruim não é tratado como erro de sistema ✓
- Reaproveitamento do recorte ao reeditar (sem lógica de cache explícita) → Task 6 Step 2, `!existsSync(recorteArq)` ✓

**Placeholder scan:** nenhum "TBD"/"TODO" nos passos; todo código é completo e copiável.

**Consistência de tipos:** `filtroRecorteWebcam({ corpoFiltros, ladoRecorte, canto, margem })` — mesma assinatura de parâmetros nomeados em Task 5 (definição) e Task 6 (uso). `rodarRecorte(entrada, saida)` — mesma ordem de argumentos em Task 4 (definição) e Task 6 (uso: `rodarRecorte(webcamArq, recorteArq)`).

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-07-recorte-webcam.md`. Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
