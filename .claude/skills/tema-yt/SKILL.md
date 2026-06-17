---
name: tema-yt
description: >
  Use pra ESCOLHER o tema do próximo vídeo do canal antes de roteirizar — "/tema-yt", "que
  vídeo eu faço?", "tema em alta de IA/Claude Code", "o que os criadores estão falando", "tô
  sem pauta de vídeo". Pesquisa demanda real (criadores monitorados, busca no YouTube,
  WebSearch, Google Trends), ranqueia e entrega temas com ângulo e fórmula sugerida.
---

# /tema-yt — Escolher o tema (passo 0 do vídeo)

Tema bom não se inventa — vem de demanda real. Esta skill é o passo antes do roteiro: acha o
que está em alta no nicho (IA/Claude Code) e o que os criadores de sucesso estão falando,
ranqueia, e entrega o melhor pro `/roteiro-yt`. Princípio do CLAUDE.md: copiar a fórmula de
quem performa — inclui o que eles escolhem falar.

Autoria: ImpulsoX AI. Conteúdo original.

## Fontes (nunca raspa nada atrás de login)

- **Criadores monitorados** (`canal-youtube/criadores-monitorados.md`) — vídeos recentes via yt-dlp.
- **Busca no YouTube** por palavra-chave do nicho (yt-dlp `ytsearch`) — nicho inteiro, não só os monitorados.
- **WebSearch** — tendências de IA/Claude Code, lançamentos, features novas.
- **Google Trends** (best-effort) — sinal extra de demanda; se bloquear, ignora.

## Fluxo

1. Rodar `node scripts/coletar-temas-yt.mjs` → temas dos criadores + busca, pontuados
   (grava `canal-youtube/temas/<mês>.md`). Rodar `node scripts/trends-best-effort.mjs "<termos>"`
   pra somar o sinal de Trends quando vier.
2. **WebSearch** de tendências recentes (lançamentos de IA/Claude Code).
3. Cruzar tudo, detectar **lacunas** (tema com demanda que ninguém cobriu bem), **reordenar o
   topo** com julgamento (relevância pro canal, fadiga do tema, potencial de hook).
4. Entregar 5-10 temas ranqueados — cada um: **tema · por que (fonte + sinal) · ângulo pro
   canal · fórmula sugerida** (cruza `canal-youtube/formulas-video.md`).
5. O dono escolhe um → vira o input do `/roteiro-yt`.

## Regras

- Demanda real acima de palpite — todo tema carrega a fonte que o sustenta.
- Google Trends é best-effort; sua ausência nunca trava o radar.
- Sem criadores preenchidos → cai pra busca + WebSearch e avisa pra preencher (`resolver-canal-yt.mjs`).
- Nunca raspar rede atrás de login.
- Tema escolhido carrega a fórmula sugerida pro `/roteiro-yt`.
