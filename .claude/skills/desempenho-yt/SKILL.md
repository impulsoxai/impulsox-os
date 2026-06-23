---
name: desempenho-yt
description: >
  Redirect interno. A medição de YouTube vive na porta única `/desempenho` (detecta a
  plataforma e usa a régua certa). Esta entrada existe só pra quem digita "/desempenho-yt"
  por hábito — encaminha pra `/desempenho`. NÃO é a porta de "como foi o vídeo?" / "mede a
  retenção": essa é a `/desempenho`.
---

# /desempenho-yt — (redireciona pra /desempenho)

A análise de desempenho de YouTube **foi unificada na porta única `/desempenho`** — que
detecta a plataforma e usa a régua certa de cada uma (YouTube ≠ Instagram). Pro YouTube, a
régua é: **retenção (AVD por duração), curva (intro dip / cliff / spike), CTR vs a média do
próprio canal, retenção do 1º minuto, watch time** — com diagnóstico acionável que aponta a
skill que conserta:

- retenção despenca nos 30s → hook fraco → **`/roteiro-yt`** (hook + intro=thumbnail)
- CTR abaixo da média + quem assiste fica → capa/título → **`/roteiro-yt`** + **`/thumbnail`**
- queda abrupta no meio (cliff) → corte/tangente → **`/editar-video`**
- declínio gradual → pacing lento → **`/editar-video`**

## Como usar

Rodar **`/desempenho`** e informar que é do YouTube (ou colar o CSV do Studio: Analytics →
Advanced → Export current view). O cálculo está em `scripts/lib-desempenho.mjs` (régua YT:
`taxasYouTube`, `detectarCurva`, `diagnosticarYouTube`) + `scripts/metricas-youtube.mjs`
(OAuth/Analytics API, modo automático v2). O veredito de fórmula (validada / não funciona)
continua indo pro `canal-youtube/formulas-video.md`, e o aprendizado pro `nucleo/aprendizados.md`.

---

**✓ Pronto:** retenção/curva/CTR medidos, fórmula validada ou descartada, aprendizado gravado · **→ próximo passo:** `/tema-yt` — escolhe o tema do próximo vídeo já com o que a medição provou (fecha o ciclo do canal). Esteira de YouTube é opcional (em teste/beta) — só seguir quando o dono pedir, não é passo automático do fluxo principal. Se faltarem métricas/publicação, o sistema reorienta.
