---
name: desempenho-yt
description: >
  Use pra medir os vídeos do YouTube e validar qual fórmula funciona — "/desempenho-yt",
  "como foi o vídeo?", "qual fórmula performou?", "mede a retenção", "fecha o ciclo do
  canal". A análise agora vive na porta única /desempenho (régua de YouTube: retenção,
  curva, CTR vs a média do canal) com diagnóstico que aponta a skill que conserta.
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
