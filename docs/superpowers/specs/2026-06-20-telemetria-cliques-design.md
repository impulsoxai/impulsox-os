# Spec — Fase 3a: captura de telemetria de cliques (ImpulsoX-YT-OS)

> Primeira sub-fatia da Fase 3 do PRD-mãe `2026-06-20-gravacao-movimento-design.md`.
> Durante a gravação, registra cada clique do mouse (tipo + posição + tempo) num
> `telemetria.json` sincronizado com o vídeo — matéria-prima do cérebro do zoom (3b).

| | |
|---|---|
| **Status** | Rascunho para aprovação (gate: zero código até "vai") |
| **Fase** | 3a de 3 (3a captura → 3b cérebro clean-room → 3c aplicação zoompan) |
| **Depende de** | Fase 2 (`gravar-tela.mjs` foreground) — já na main |
| **Plataforma** | Windows-only (MVP) |
| **Saída alimenta** | Fase 3b (`lib-zoom.mjs` lê o telemetria.json) |

---

## 1. Problema

A Fase 2 grava tela + voz + webcam, mas **não captura os cliques do mouse**. O cérebro do
auto-zoom (3b) precisa saber **onde e quando** o dono clicou pra decidir as regiões de zoom.
Esta sub-fase adiciona essa captura, sincronizada com o vídeo.

---

## 2. O que a 3a entrega

Durante a gravação, registrar cada clique e gravar `telemetria.json` ao parar. Decisões do
brainstorm (travadas):
1. **Captura via `uiohook-napi`** — binário pré-compilado (prebuild), provado que carrega no
   PC do dono (Node v24, sem precisar de MSVC/cmake/build C++).
2. **Embutida no `gravar-tela.mjs`** — o mesmo comando foreground liga o uiohook junto dos
   ffmpeg e desliga no ENTER. Mesmo t-zero → timestamps batem com o vídeo.
3. **Esta sub-fase é SÓ captura.** O algoritmo de zoom (clean-room) é a 3b; aplicar no vídeo
   é a 3c.

---

## 3. Arquitetura

### 3.1 `scripts/lib-telemetria.mjs` — funções PURAS (testáveis sem uiohook/hardware)

| Função | Faz |
|---|---|
| `normalizarClique({ x, y, tela })` | pixel absoluto → `{ x, y }` normalizado 0–1 pela resolução (`tela.largura`/`tela.altura`); clampa em [0,1] |
| `classificarTipo({ button, clicks })` | evento uiohook → `"left" \| "right" \| "double"` (clicks≥2 → double; button 2/3 → right; senão left) |
| `montarTelemetria({ t0, tela, eventos })` | lista de eventos crus `{ tMs, x, y, button, clicks }` → o JSON canônico (normaliza + classifica cada um) |

### 3.2 `scripts/gravar-tela.mjs` — modificar (liga/desliga uiohook)

- No início de `iniciar` (junto do spawn dos ffmpeg): marca `t0 = Date.now()`, lê a resolução
  da tela, liga o `uIOhook`, registra cada `EVENT_MOUSE_CLICKED` num array de eventos crus
  (`{ tMs: Date.now()-t0, x, y, button, clicks }`).
- No ENTER (junto do `q` nos ffmpeg): desliga o `uIOhook` (`stop()`), chama `montarTelemetria`,
  grava `telemetria.json` no mesmo `<slug>/`.

### 3.3 Resolução da tela

Via PowerShell, sem dep nova: `[System.Windows.Forms.SystemInformation]::VirtualScreen` →
`<largura>x<altura>`. Se falhar, usar um fallback razoável (1920×1080) e marcar no JSON
(`tela.fonte: "fallback"`) — nunca travar a gravação por causa disso.

### 3.4 Dependência

`uiohook-napi` entra no `package.json` (prebuild). É a **primeira dep nativa** do projeto;
documentar no SKILL que, se o prebuild não existir pra alguma combinação Node/SO futura, é a
única que pode exigir build tools.

---

## 4. Saída — `canal-youtube/gravacoes/<slug>/telemetria.json`

```json
{
  "t0": "2026-06-20T23:00:00.000Z",
  "tela": { "largura": 1536, "altura": 864, "fonte": "powershell" },
  "cliques": [
    { "t": 2300, "x": 0.45, "y": 0.30, "tipo": "left" },
    { "t": 5800, "x": 0.80, "y": 0.65, "tipo": "double" }
  ]
}
```

- `t` em ms desde o início da gravação. `x`/`y` normalizados 0–1. `tipo` ∈ left|right|double.
- Sem cliques → `cliques: []` (válido; a 3b lida com vazio).

---

## 5. Casos de aceite

1. **Normaliza:** `normalizarClique({x:768, y:432, tela:{largura:1536, altura:864}})` → `{x:0.5, y:0.5}`.
2. **Clampa:** clique fora da tela (x negativo ou > largura) → x ∈ [0,1].
3. **Classifica:** `clicks:2` → "double"; `button:2` → "right"; `button:1, clicks:1` → "left".
4. **Monta:** lista de eventos crus → JSON com `cliques` normalizados+classificados, na ordem.
5. **Vazio:** sem eventos → `cliques: []`, JSON ainda válido.
6. **Smoke real (PC do dono):** gravar ~8s clicando em 3 lugares → `telemetria.json` tem 3
   cliques com `t` crescente e `x/y` plausíveis; vídeo e telemetria no mesmo `<slug>/`.

---

## 6. Testes (TestPilot)

- Unit puro: `normalizarClique` (centro, canto, fora→clamp), `classificarTipo` (left/right/double),
  `montarTelemetria` (ordem, vazio, normalização aplicada).
- Smoke real: a gravação liga/desliga o uiohook sem travar, e o `telemetria.json` sai coerente.
  (Roda na máquina do dono — uiohook precisa de mouse real.)
- Regressão: a gravação da Fase 2 (tela/webcam/parada limpa) continua funcionando.

---

## 7. Fora desta sub-fase

- **O algoritmo de zoom** (agrupar cliques → regiões `{inicio,fim,foco}`) → 3b (clean-room).
- **Aplicar o zoom no vídeo** (ffmpeg zoompan) → 3c.
- Captura de **movimento** do cursor (dwell, trajetória) — só cliques nesta fase (YAGNI; o
  cérebro 3b começa com cliques, que é o sinal mais forte).
- macOS/Linux.

---

## 8. Próximo passo

Aprovação → `writing-plans` → código da 3a. Depois: **3b — cérebro do zoom (clean-room)**,
onde o algoritmo de decisão é escrito do zero (sem copiar o Recordly), lendo só o comportamento.
