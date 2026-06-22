# /gravar-tela: cursor contínuo + fps + áudio do sistema — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capturar a trilha de movimento do cursor (quick-win urgente), documentar fps/codec, e adicionar captura opcional do áudio do sistema na skill /gravar-tela.

**Architecture:** Estende as funções puras (`lib-telemetria.mjs`, `lib-gravacao.mjs`) com TDD e integra no orquestrador `gravar-tela.mjs`. Reusa `normalizarClique` e `parseDispositivosDshow`. Sem voz/áudio-sistema = comportamento atual intacto.

**Tech Stack:** Node ESM, uiohook-napi (mousemove), ffmpeg gdigrab/dshow, `node --test`.

---

## File Structure

- `scripts/lib-telemetria.mjs` (MODIFICAR) — `amostrarMovimento` (throttle puro) + `montarTelemetria` ganha `movimentos`.
- `scripts/lib-telemetria.test.mjs` (MODIFICAR) — testes novos.
- `scripts/lib-gravacao.mjs` (MODIFICAR) — `FPS_TELA` constante + `acharLoopback` + `argsCapturaSistema`.
- `scripts/lib-gravacao.test.mjs` (MODIFICAR) — testes novos.
- `scripts/gravar-tela.mjs` (MODIFICAR) — `mousemove` no uiohook + `--audio-sistema` (integração, sem unit test).
- `.claude/skills/gravar-tela/SKILL.md` (MODIFICAR) — documentar cursor, fps, áudio do sistema.

---

### Task 1: `amostrarMovimento` — throttle puro do mousemove

**Files:**
- Modify: `scripts/lib-telemetria.mjs`
- Test: `scripts/lib-telemetria.test.mjs`

- [ ] **Step 1: Escrever o teste falhando** (append em `scripts/lib-telemetria.test.mjs`; adicionar `amostrarMovimento` ao import de "./lib-telemetria.mjs")

```javascript
test("amostrarMovimento registra quando passou o intervalo mínimo", () => {
  assert.equal(amostrarMovimento(0, 16, { minIntervalo: 16 }), true);
  assert.equal(amostrarMovimento(0, 20, { minIntervalo: 16 }), true);
});
test("amostrarMovimento pula quando ainda não passou o intervalo", () => {
  assert.equal(amostrarMovimento(100, 110, { minIntervalo: 16 }), false);
});
test("amostrarMovimento sempre registra o primeiro ponto (ultimo = null)", () => {
  assert.equal(amostrarMovimento(null, 0, { minIntervalo: 16 }), true);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-telemetria.test.mjs`
Expected: FAIL — `amostrarMovimento is not a function`.

- [ ] **Step 3: Implementar** (em `scripts/lib-telemetria.mjs`, após `normalizarClique`)

```javascript
// amostrarMovimento — throttle puro do mousemove (dispara centenas de vezes/s). Devolve true se
// deve registrar este ponto (passou >= minIntervalo ms desde o último, ou é o primeiro). 60Hz = 16ms.
export function amostrarMovimento(ultimoTMs, tMs, { minIntervalo = 16 } = {}) {
  if (ultimoTMs === null || ultimoTMs === undefined) return true;
  return (tMs - ultimoTMs) >= minIntervalo;
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-telemetria.test.mjs`
Expected: PASS (3 novos + os existentes).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-telemetria.mjs scripts/lib-telemetria.test.mjs
git commit -m "feat(gravar-tela): amostrarMovimento — throttle 60Hz do cursor"
```

---

### Task 2: `montarTelemetria` ganha o campo `movimentos`

**Files:**
- Modify: `scripts/lib-telemetria.mjs`
- Test: `scripts/lib-telemetria.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
test("montarTelemetria inclui movimentos normalizados em ordem", () => {
  const t = montarTelemetria({
    t0: "x", tela: { largura: 100, altura: 200 },
    eventos: [], movimentos: [{ tMs: 16, x: 50, y: 100 }, { tMs: 32, x: 100, y: 200 }],
  });
  assert.equal(t.movimentos.length, 2);
  assert.deepEqual(t.movimentos[0], { t: 16, x: 0.5, y: 0.5 });
  assert.deepEqual(t.movimentos[1], { t: 32, x: 1, y: 1 });
});
test("montarTelemetria sem movimentos -> movimentos vazio", () => {
  const t = montarTelemetria({ t0: "x", tela: { largura: 100, altura: 100 }, eventos: [] });
  assert.deepEqual(t.movimentos, []);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-telemetria.test.mjs`
Expected: FAIL — `t.movimentos` undefined.

- [ ] **Step 3: Implementar** — substituir a função `montarTelemetria` em `scripts/lib-telemetria.mjs` por:

```javascript
// Monta o telemetria.json canônico: cliques (normalizados + classificados) e movimentos do
// cursor (normalizados). t0/tela passam direto. movimentos default [] = compatível com quem só
// passa cliques (auto-zoom atual ignora o resto).
export function montarTelemetria({ t0, tela, eventos = [], movimentos = [] }) {
  return {
    t0,
    tela,
    cliques: eventos.map((e) => {
      const pos = normalizarClique({ x: e.x, y: e.y, tela });
      return { t: e.tMs, x: pos.x, y: pos.y, tipo: classificarTipo(e) };
    }),
    movimentos: movimentos.map((m) => {
      const pos = normalizarClique({ x: m.x, y: m.y, tela });
      return { t: m.tMs, x: pos.x, y: pos.y };
    }),
  };
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-telemetria.test.mjs`
Expected: PASS (todos, inclusive os antigos de cliques — `movimentos: []` não os quebra).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-telemetria.mjs scripts/lib-telemetria.test.mjs
git commit -m "feat(gravar-tela): telemetria ganha trilha de movimentos do cursor"
```

---

### Task 3: `FPS_TELA` nomeado + documentar (lib-gravacao)

**Files:**
- Modify: `scripts/lib-gravacao.mjs`

> Sem teste novo: é só extrair uma constante e comentar (o teste de `argsCapturaTela` já cobre os args). Verificação = rodar os testes existentes.

- [ ] **Step 1: Adicionar a constante e usar em `argsCapturaTela`**

No topo de `scripts/lib-gravacao.mjs` (após o comentário de cabeçalho), adicionar:

```javascript
// fps da captura de tela. 30 é o equilíbrio: gdigrab a 60 pesa demais na CPU durante a captura
// (perde frames / esquenta), 30 dá movimento fluido o bastante pro cursor smoothing posterior.
export const FPS_TELA = 30;
```

E em `argsCapturaTela`, trocar o default `fps = 30` por `fps = FPS_TELA`:

```javascript
export function argsCapturaTela({ fps = FPS_TELA, saida }) {
```

- [ ] **Step 2: Rodar os testes existentes (zero regressão)**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-gravacao.test.mjs`
Expected: PASS (os testes de `argsCapturaTela` seguem verdes — fps 30 não mudou).

- [ ] **Step 3: Commit**

```bash
git add scripts/lib-gravacao.mjs
git commit -m "refactor(gravar-tela): FPS_TELA nomeado e documentado"
```

---

### Task 4: `acharLoopback` + `argsCapturaSistema` (áudio do sistema)

**Files:**
- Modify: `scripts/lib-gravacao.mjs`
- Test: `scripts/lib-gravacao.test.mjs`

- [ ] **Step 1: Escrever os testes falhando** (append em `scripts/lib-gravacao.test.mjs`; adicionar `acharLoopback, argsCapturaSistema` ao import)

```javascript
test("acharLoopback acha o device de loopback do Windows por nome", () => {
  const disp = { video: [], audio: [{ nome: "Microfone (Realtek)" }, { nome: "Mixagem estéreo (Realtek)" }] };
  assert.equal(acharLoopback(disp), "Mixagem estéreo (Realtek)");
});
test("acharLoopback acha 'Stereo Mix' em inglês", () => {
  const disp = { video: [], audio: [{ nome: "Stereo Mix (Realtek)" }] };
  assert.equal(acharLoopback(disp), "Stereo Mix (Realtek)");
});
test("acharLoopback devolve null quando não há loopback", () => {
  const disp = { video: [], audio: [{ nome: "Microfone (Realtek)" }] };
  assert.equal(acharLoopback(disp), null);
});
test("argsCapturaSistema monta dshow do loopback -> arquivo de áudio", () => {
  const a = argsCapturaSistema({ device: "Stereo Mix (Realtek)", saida: "out/sistema.m4a" });
  assert.deepEqual(a, [
    "-y", "-f", "dshow", "-i", "audio=Stereo Mix (Realtek)",
    "-c:a", "aac", "-movflags", "+faststart", "out/sistema.m4a",
  ]);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-gravacao.test.mjs`
Expected: FAIL — funções não existem.

- [ ] **Step 3: Implementar** (em `scripts/lib-gravacao.mjs`)

```javascript
// acharLoopback — procura, na lista de devices de áudio dshow, um de loopback do sistema
// (capta o som que SAI do PC). Nomes comuns em PT/EN. Devolve o nome ou null (PC sem loopback).
export function acharLoopback(disponiveis) {
  const padroes = ["mixagem estéreo", "mixagem estereo", "stereo mix", "what u hear", "virtual-audio-capturer", "loopback"];
  const achado = (disponiveis?.audio || []).find((d) =>
    padroes.some((p) => d.nome.toLowerCase().includes(p)),
  );
  return achado ? achado.nome : null;
}

// argsCapturaSistema — args do ffmpeg pra gravar o áudio do sistema (loopback) num arquivo
// separado (sistema.m4a). O /editar-video mixa depois. Pura.
export function argsCapturaSistema({ device, saida }) {
  return [
    "-y", "-f", "dshow", "-i", `audio=${device}`,
    "-c:a", "aac", "-movflags", "+faststart", saida,
  ];
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-gravacao.test.mjs`
Expected: PASS (4 novos + existentes).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-gravacao.mjs scripts/lib-gravacao.test.mjs
git commit -m "feat(gravar-tela): acharLoopback + argsCapturaSistema (áudio do sistema)"
```

---

### Task 5: Integrar no gravar-tela.mjs (mousemove + --audio-sistema)

**Files:**
- Modify: `scripts/gravar-tela.mjs`

> Integração de I/O (uiohook/ffmpeg) — sem unit test; verificada por syntax-load + os testes das funções puras. As funções que orquestra já têm teste (Tasks 1-4).

- [ ] **Step 1: Importar as funções novas e capturar o mousemove**

No import de `./lib-telemetria.mjs` adicionar `amostrarMovimento`; no de `./lib-gravacao.mjs`
adicionar `acharLoopback, argsCapturaSistema`.

Logo após o bloco `const eventos = [];` e o `uIOhook.on("click", ...)` (perto da linha 106-109),
adicionar:

```javascript
  const movimentos = [];
  let ultimoMovTMs = null;
  uIOhook.on("mousemove", (e) => {
    const tMs = Date.now() - t0;
    if (amostrarMovimento(ultimoMovTMs, tMs, { minIntervalo: 16 })) {
      movimentos.push({ tMs, x: e.x, y: e.y });
      ultimoMovTMs = tMs;
    }
  });
```

- [ ] **Step 2: Passar `movimentos` nas duas chamadas de `montarTelemetria`**

Há duas chamadas `montarTelemetria({ t0: t0Iso, tela, eventos })` (uma no handler SIGINT, outra
no fluxo do ENTER). Em AMBAS, trocar por `montarTelemetria({ t0: t0Iso, tela, eventos, movimentos })`.

- [ ] **Step 3: Adicionar `--audio-sistema` (captura opcional do loopback)**

Onde as flags são lidas (perto do topo do `iniciar`/CLI), adicionar a leitura:
```javascript
  const audioSistema = process.argv.includes("--audio-sistema");
```
(usar o mesmo mecanismo de flag já presente no arquivo; se houver um helper `has`, use-o.)

Logo ANTES dos `spawn` dos ffmpeg de tela/webcam, adicionar:
```javascript
  let pSistema = null;
  if (audioSistema) {
    const loop = acharLoopback(disponiveis); // 'disponiveis' = lista dshow já parseada nesta função
    if (loop) {
      const sistemaArq = join(base, "sistema.m4a");
      pSistema = spawn(FFMPEG, argsCapturaSistema({ device: loop, saida: sistemaArq }), { stdio: ["pipe", "ignore", "ignore"] });
      console.log(`• áudio do sistema: gravando de "${loop}"`);
    } else {
      console.log("• aviso: seu PC não tem Stereo Mix/loopback habilitado — gravando só o microfone. (Pra habilitar: painel de Som do Windows → Gravação → habilitar 'Mixagem estéreo'.)");
    }
  }
```

> IMPORTANTE: confirmar como a lista de dispositivos dshow está disponível nesta função (a
> variável pode ter outro nome). Se a função não tem a lista parseada em escopo, parsear com
> `parseDispositivosDshow` a partir do `ffmpeg -list_devices` (o arquivo já faz isso na resolução
> de dispositivos — reusar essa lista). NÃO inventar uma variável que não existe; ler o arquivo e
> usar o nome correto.

Incluir `pSistema` no fechamento limpo: nos pontos que mandam 'q' / esperam fechar (SIGINT e
ENTER), incluir `pSistema` junto de `pTela`/`pWeb` quando não for null. Ex. trocar
`for (const p of [pTela, pWeb])` por `for (const p of [pTela, pWeb, pSistema].filter(Boolean))`.

- [ ] **Step 4: Verificar carga + testes puros**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --check scripts/gravar-tela.mjs && node --test scripts/lib-telemetria.test.mjs scripts/lib-gravacao.test.mjs 2>&1 | grep -iE "pass|fail"`
Expected: sem erro de sintaxe; todos os testes das funções puras verdes.

- [ ] **Step 5: Commit**

```bash
git add scripts/gravar-tela.mjs
git commit -m "feat(gravar-tela): captura mousemove (cursor) + --audio-sistema"
```

---

### Task 6: Documentar no SKILL.md

**Files:**
- Modify: `.claude/skills/gravar-tela/SKILL.md`

- [ ] **Step 1: Adicionar a documentação**

Em `.claude/skills/gravar-tela/SKILL.md`, adicionar uma seção (perto de onde descreve a saída /
telemetria):

```markdown
## Trilha do cursor, qualidade e áudio do sistema

- **Movimento do cursor:** a gravação registra a trilha contínua do mouse (~60 pontos/s) no
  `telemetria.json` (campo `movimentos`, além de `cliques`). É a matéria-prima pro cursor suave /
  de alta resolução na edição — por isso é capturado SEMPRE: sem o dado gravado na hora, a edição
  não recupera depois.
- **Qualidade fixa:** a tela é capturada a 30fps, libx264 `preset fast` + `crf 18` (texto/UI
  nítidos). 30fps é o equilíbrio — 60 pesa demais no gdigrab e perde frames.
- **Áudio do sistema (opcional):** `--audio-sistema` grava também o som que SAI do PC (vídeo,
  call, notificação) num `sistema.m4a` separado, se a máquina tiver loopback ("Mixagem estéreo" /
  "Stereo Mix"). Sem loopback, avisa e segue só com o microfone. O `/editar-video` mixa depois.
```

- [ ] **Step 2: Verificar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && grep -n "Trilha do cursor\|audio-sistema\|movimentos" .claude/skills/gravar-tela/SKILL.md`
Expected: as linhas inseridas aparecem.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/gravar-tela/SKILL.md
git commit -m "docs(gravar-tela): documenta cursor, fps e áudio do sistema"
```

---

## Self-Review (preenchido)

**Spec coverage:**
- Cursor contínuo (throttle + telemetria) → Tasks 1, 2, 5. ✓
- fps/codec documentado → Task 3 + Task 6. ✓
- Áudio do sistema (`--audio-sistema`, detecção, aviso) → Tasks 4, 5, 6. ✓
- Zero regressão (movimentos default [], sem flag = atual) → Tasks 2 e 5 garantem. ✓
- Testes nas funções puras → Tasks 1, 2, 4. ✓

**Placeholder scan:** nenhum TBD/TODO. Único ponto de julgamento sinalizado explicitamente: na
Task 5 Step 3, confirmar o nome real da variável da lista de dispositivos dshow em escopo (com
instrução de NÃO inventar — reusar a lista já parseada). É instrução de cuidado, não placeholder.

**Type consistency:** `amostrarMovimento(ultimoTMs, tMs, {minIntervalo})`, `montarTelemetria({...,
movimentos})`, `acharLoopback(disponiveis)→string|null`, `argsCapturaSistema({device, saida})`,
`FPS_TELA` — consistentes entre teste, implementação e uso na Task 5. Campos do JSON: `cliques`
(t,x,y,tipo), `movimentos` (t,x,y). Eventos crus: `{tMs,x,y}` (movimento), `{tMs,x,y,button,clicks}`
(clique) — batem com o que o gravar-tela.mjs já produz.
