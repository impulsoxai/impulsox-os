# Spec — Fase 3b: cérebro do zoom (clean-room) (ImpulsoX-YT-OS)

> Segunda sub-fatia da Fase 3 do PRD-mãe `2026-06-20-gravacao-movimento-design.md`.
> Lê o `telemetria.json` (3a) e decide as regiões de zoom → `regioes-zoom.json`.
> SÓ decide; aplicar o zoom no vídeo é a 3c. Funções puras, testáveis sem vídeo.

| | |
|---|---|
| **Status** | Rascunho para aprovação (gate: zero código até "vai") |
| **Fase** | 3b de 3 (3a captura ✓ → **3b cérebro** → 3c aplicação zoompan) |
| **Depende de** | Fase 3a (`telemetria.json`) — já na main |
| **Plataforma** | independe de SO (lógica pura) |
| **Saída alimenta** | Fase 3c (`editar-video` aplica zoompan nas regiões) |

---

## 1. Problema

A 3a capturou os cliques (`telemetria.json`). Falta **decidir, a partir deles, onde e
quando dar zoom** — sem gerar zoom nervoso (zoom a cada clique cansa) nem perder a ação.
Esta sub-fase é o cérebro: cliques → regiões de zoom `{inicio, fim, foco, nivel}`.

---

## 2. Licença — clean-room (decisão travada)

O algoritmo é **escrito do zero**, desenhado pela lógica do problema. As IDEIAS gerais do
Recordly (cluster temporal de cliques, padding, força por tipo de clique) são reimplementadas
— **nenhuma linha do código AGPL do Recordly é copiada**. Funcionalidade transfere; código
não (mesma regra do CLAUDE.md: copiar a mecânica, nunca o conteúdo). O ImpulsoX-OS fica livre.

O nosso é deliberadamente mais enxuto que o do Recordly: **só cliques** (sem dwell, sem
trajetória de cursor — YAGNI, decidido na 3a), **centroide simples** (não a heurística de
força/tipo-de-interação dele), parâmetros nossos.

---

## 3. Algoritmo (4 passos)

1. **Cluster temporal:** cliques com gap ≤ `gapMs` (default 2500ms) entram no mesmo cluster.
   Pausa maior → novo cluster. Cada cluster vira uma região de zoom.
2. **Foco = centroide:** média dos `x` e média dos `y` dos cliques do cluster (0–1).
3. **Força → nível de zoom:** o clique MAIS FORTE do cluster define o nível.
   Tabela (nossa, ajustável): `double → 2.0` · `right → 1.8` · `left → 1.5`.
4. **Padding:** região = `[primeiroClique − padInicio, últimoClique + padFim]`
   (defaults: `padInicio` 0.5s, `padFim` 0.8s). O zoom entra antes e solta depois — respira.

**Sobreposição:** se duas regiões se sobrepõem depois do padding, **fundir** numa só (início
da primeira, fim da segunda; foco/nível da de maior força). Evita dois zooms brigando.

---

## 4. Arquitetura — `scripts/lib-zoom.mjs` (funções PURAS)

| Função | Faz |
|---|---|
| `agruparClusters(cliques, { gapMs = 2500 })` | lista de cliques `{t,x,y,tipo}` → lista de clusters (cada um = array de cliques) |
| `focoCentroide(cluster)` | cluster → `{ x, y }` (média) |
| `nivelPorForca(cluster, { tabela })` | cluster → número (o nível do clique mais forte; default tabela double/right/left) |
| `montarRegioesZoom(telemetria, opts)` | telemetria completa → `{ regioes: [{inicio,fim,foco,nivel}] }` (orquestra os 3 acima + padding + fusão de sobreposição) |

Parâmetros (gap, padInicio, padFim, tabela, nível) com defaults no topo do arquivo — fáceis
de calibrar quando o dono vir o resultado real.

---

## 5. Saída — `canal-youtube/gravacoes/<slug>/regioes-zoom.json`

```json
{
  "regioes": [
    { "inicio": 1.8, "fim": 6.3, "foco": { "x": 0.45, "y": 0.30 }, "nivel": 2.0 }
  ]
}
```
- `inicio`/`fim` em **segundos** (o `t` da telemetria é ms; converter na montagem). Pro zoompan da 3c.
- `foco` 0–1 (independe de resolução). `nivel` = fator de zoom (1.5/1.8/2.0…).
- Tempos clampados em `[0, +∞)` (padInicio não pode levar a início negativo).

---

## 6. Casos de aceite

1. **Cluster:** 3 cliques em t=2.0/2.4/3.0s (gaps <2.5s) → 1 cluster → 1 região.
2. **Dois clusters:** cliques em t=2s e t=20s (gap >2.5s) → 2 regiões separadas.
3. **Centroide:** cliques em (0.2,0.4) e (0.6,0.6) → foco (0.4,0.5).
4. **Força:** cluster com um double-click → nível 2.0; cluster só de left → 1.5.
5. **Padding:** cluster de t=2.0 a t=3.0 com padInicio 0.5/padFim 0.8 → região [1.5, 3.8].
6. **Início negativo clampado:** clique em t=0.2 com padInicio 0.5 → inicio = 0 (não −0.3).
7. **Sobreposição funde:** dois clusters cujas regiões (após padding) se tocam → 1 região fundida.
8. **Vazio:** `cliques: []` → `regioes: []`.

---

## 7. Testes (TestPilot)

- Unit puro (sem vídeo): `agruparClusters` (1 cluster, 2 clusters, vazio), `focoCentroide`,
  `nivelPorForca` (cada tipo + cluster misto pega o mais forte), `montarRegioesZoom`
  (padding, clamp em 0, fusão de sobreposição, vazio, conversão ms→s).
- Sem smoke de hardware: é lógica pura. A validação visual real (o zoom no lugar certo) é a 3c.

---

## 8. Fora desta sub-fase

- **Aplicar o zoom no vídeo** (ffmpeg zoompan, animação) → 3c.
- **Dwell / trajetória de cursor** (cursor parado = atenção) — só cliques (YAGNI). Refinamento futuro.
- **Centroide ponderado** por força — começamos com média simples; ponderar é refinamento se precisar.
- Curva de animação do zoom (ease) — é da 3c.

---

## 9. Próximo passo

Aprovação → `writing-plans` → código da 3b. Depois: **3c — aplicar o zoom** (zoompan no
`editar-video`, lendo `regioes-zoom.json`), que fecha o ciclo grava→zoom→edita. Aí então o
**guia de uso pro dono** (pedido dele: passo a passo simples, sem decorar comandos).
