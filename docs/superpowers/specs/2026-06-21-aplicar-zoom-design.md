# Spec — Fase 3c: aplicar o zoom no vídeo (ImpulsoX-YT-OS)

> Terceira sub-fatia da Fase 3 do PRD-mãe `2026-06-20-gravacao-movimento-design.md`.
> Lê `regioes-zoom.json` (3b) e aplica zoom **seco** no foco durante cada região, no render
> do `editar-video`. **Fecha o ciclo grava→zoom→edita.**

| | |
|---|---|
| **Status** | Rascunho para aprovação (gate: zero código até "vai") |
| **Fase** | 3c de 3 (3a captura ✓ → 3b cérebro ✓ → **3c aplicação**) |
| **Depende de** | 3a (telemetria), 3b (`lib-zoom.mjs`, `regioes-zoom.json`) — na main |
| **Plataforma** | Windows (render ffmpeg) |
| **Fecha** | o ciclo: gravar → telemetria → cérebro → **zoom no vídeo** |

---

## 1. Problema

A 3b decide as regiões de zoom (`regioes-zoom.json`). Falta **aplicar** no vídeo: dar o
close-up no foco durante cada região, no render. E dar ao dono **controle** (qual clique vira
zoom) e **proteção anti-tontura** (zoom demais enjoa o espectador).

---

## 2. Abordagem ffmpeg — provada

Zoom seco (corte direto, sem animação — decidido; o suave é refinamento futuro) via
**`zoompan`** com `z` (zoom) condicional ao tempo do frame. `crop` com `enable=` **não**
funciona (testado: "Error initializing filters"). `zoompan` é timeline-aware e foi validado:
frame dentro da janela mostra o close, fora mostra o frame cheio.

Forma (validada, 1920×1080 @ 30fps): para cada região `[inicio,fim]` com `foco{x,y}` e
`nivel`, o `z` vira `nivel` na janela de frames daquela região (`inicio*fps`..`fim*fps`),
senão `1`. `x`/`y` centram o foco: `x='iw*foco.x-(iw/zoom/2)'`, idem y. Várias regiões
encadeiam num `z='if(between(in,a,b),n1, if(between(in,c,d),n2, 1))'`.

---

## 3. Controle — só AUTOMÁTICO (decisão travada)

**Por que só auto:** o modo manual (toggle por double-click) exigiria que o dono VISSE o zoom
ao vivo enquanto grava — pra mirar o foco e saber se está ligado. Isso só existe com um
**preview ao vivo** (janela GPU/PixiJS em tempo real), que é justamente o que o PRD §4.2 cortou
por ser GUI/headless-incompatível. "Dar zoom no escuro" não funciona. Então o manual sai do
escopo: **se o dono precisar de controle manual ao vivo, usa o Recordly direto** (foi feito pra
isso) e joga o `.mp4` no `/editar-video`. Não vale reconstruir a GUI/GPU do Recordly aqui.

O **auto não tem esse problema:** o dono não mira nada — trabalha normal (clica nas coisas), e o
sistema decide os zooms pelos cliques naturais, DEPOIS. O dry-run + os limites protegem.

- **`--zoom auto`** (default) — cada cluster de clique vira zoom, **com limites anti-tontura
  conservadores**:
  - cluster precisa de **≥2 cliques** e durar **≥1.5s** (cluster curto/raso é ignorado)
  - **intervalo mínimo 4s** entre zooms (zooms muito juntos: descarta o segundo)
  - **nível 1.4x** (close discreto, não agressivo)
- **`--zoom nao`** — desliga o zoom (render sem auto-zoom).

O dono testa o auto; se não gostar do resultado, usa `--zoom nao` (sem zoom) ou o Recordly. Os
limites ficam no topo do `lib-zoom.mjs`, ajustáveis quando ver o resultado real.

---

## 4. Arquitetura

### 4.1 `scripts/lib-zoom.mjs` — funções PURAS novas

| Função | Faz |
|---|---|
| `aplicarLimitesAuto(regioes, { minDurS = 1.5, intervaloMinS = 4 })` | remove região mais curta que `minDurS`; força intervalo mínimo `intervaloMinS` entre zooms (descarta a região seguinte que viola). Anti-tontura |

### 4.2 `scripts/lib-edicao.mjs` — função PURA nova

| Função | Faz |
|---|---|
| `filtroZoompan(regioes, { fps, largura, altura })` | regiões → string do filtro `zoompan` (z condicional por janela de frames + x/y do foco). Sem regiões → retorna `null` (sem filtro) |

### 4.3 `scripts/zoom-regioes.mjs` — modificar

Gera as regiões pelo cérebro existente (`montarRegioesZoom`) + `aplicarLimitesAuto` + nível 1.4.
Grava `regioes-zoom.json`. (Sem modo manual — ver §3.)

### 4.4 `scripts/editar-video.mjs` — passo novo de zoom

- Flag `--zoom auto|nao` (default `auto`).
- Se `= auto` e existe `regioes-zoom.json` no slug: aplica o `filtroZoompan` **por último**
  no render (sobre os tempos do vídeo já cortado/acelerado — ver §6), antes do concat intro/outro.
- **Dry-run lista os zooms**: "vou dar N zooms: 1:30 (1.4x), 3:00 (2.0x)…" — o dono vê e poda
  (editando o `regioes-zoom.json` ou pedindo pra tirar) antes de `--confirmar`.

---

## 5. Saída

`final.mp4` com os zooms secos aplicados nos focos/tempos das regiões. O dry-run mostra a
lista antes; nada é renderizado sem o dono ver os zooms.

---

## 6. Conflito zoom × corte/velocidade (decisão)

O corte de silêncio e a velocidade **mudam os tempos** do vídeo. As regiões de zoom estão em
tempos do **cru** (a telemetria foi gravada no cru). Decisão do MVP: **o zoom assume que o
vídeo NÃO foi cortado/acelerado** (ou que `regioes-zoom.json` foi gerado pra o vídeo final).
Na prática: pra usar auto-zoom, rodar a edição **sem** `--plano`/corte, OU aceitar que os
tempos podem deslocar. O remapeamento de tempos pós-corte fica como melhoria futura (mesma
limitação honesta da Fase 1 §6). O dry-run mostra os tempos pro dono conferir.

---

## 7. Casos de aceite

1. **Limite duração:** região de 0.8s com `minDurS=1.5` → removida por `aplicarLimitesAuto`.
2. **Intervalo mínimo:** duas regiões a 2s de distância com `intervaloMinS=4` → a segunda descartada.
5. **Filtro zoompan:** 1 região [2,4] nivel 1.5 foco 0.45/0.30 @ 30fps → string com `between(in,60,120)` e `1.5` e o x/y do foco.
6. **Sem regiões:** `filtroZoompan([], ...)` → `null`.
7. **Smoke real (PC do dono):** vídeo 1080p + `regioes-zoom.json` de 1 região → render mostra o close na janela certa (frame dentro ≠ frame fora).
8. **Dry-run lista:** editar-video com zoom mostra a lista de zooms (tempo + nível) antes de renderizar.

---

## 8. Testes (TestPilot)

- Unit puro: `aplicarLimitesAuto` (duração, intervalo), `filtroZoompan`
  (janela de frames, x/y, várias regiões, vazio→null).
- Smoke real: gravar clicando → `zoom-regioes` → `editar-video --zoom auto` → conferir o close no vídeo. (Hardware do dono.)
- Regressão: edição sem zoom (`--zoom nao` e default em vídeo sem regioes-zoom.json) continua igual.

---

## 9. Fora desta sub-fase

- **Zoom suave** (ease in/out, deslize) — refinamento futuro (o seco prova o ciclo). É o risco que o PRD §4.2 já marcou.
- **Remapeamento de tempos** pós-corte/velocidade (§6) — melhoria futura.
- Webcam/bolha, moldura, fundo → Fase 4.

---

## 10. Próximo passo

Aprovação → `writing-plans` → código da 3c. **Isto fecha o ciclo grava→zoom→edita.** Depois:
o **guia de uso pro dono** (pedido dele — passo a passo simples do dia a dia), e a Fase 4
(moldura/bolha) se valer.
