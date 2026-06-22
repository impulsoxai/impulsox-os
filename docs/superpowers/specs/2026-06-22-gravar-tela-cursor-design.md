# Design — /gravar-tela: cursor contínuo + fps documentado + áudio do sistema

> Lote 1 do backlog de auditoria (`docs/backlog-auditoria-skills-2026-06-22.md`). ImpulsoX AI · 2026-06-22.

## O que é

Três melhorias na skill `/gravar-tela`, da auditoria de estado-da-arte (Screen Studio):
1. **Capturar movimento contínuo do cursor** (não só cliques) — QUICK-WIN URGENTE.
2. **Fixar e documentar fps/codec** do gdigrab.
3. **Áudio do sistema** opcional (`--audio-sistema`).

Agnóstica de nicho, Windows, ffmpeg (gdigrab/dshow), headless.

## Por que

A auditoria (Screen Studio) apontou: a trilha de **movimento do cursor** é a peça que mais
separa "ffmpeg cru" de gravação profissional — destrava cursor HD/smoothing no `/editar-video`.
É a ÚNICA melhoria que obriga mudar a GRAVAÇÃO: sem capturar o movimento na hora, a edição não
recupera depois. Por isso é urgente — toda gravação feita sem isso perde o dado pra sempre.

## Arquitetura (estende o fluxo existente — sem módulo novo)

### 1. Cursor contínuo (telemetria de movimento)

- **`scripts/gravar-tela.mjs`** — adicionar `uIOhook.on("mousemove", ...)` ao lado do
  `on("click")` já existente (mesmo hook carregado). Throttle 60Hz: só registra um ponto se
  passou ≥16ms desde o último (a `mousemove` dispara centenas de vezes/s). Push em um array
  `movimentos` no mesmo t-zero dos cliques. No ENTER/SIGINT, passa o array pra `montarTelemetria`.
- **`scripts/lib-telemetria.mjs`** — `montarTelemetria({ t0, tela, eventos, movimentos = [] })`
  ganha o param `movimentos` e adiciona ao JSON o campo `movimentos: [{t, x, y}]` (x,y
  normalizados 0-1 via `normalizarClique`, igual aos cliques). Preserva a ordem. Função pura.
- **Throttle puro testável** — nova função `amostrarMovimento(ultimoTMs, tMs, { minIntervalo = 16 })`
  → `true` se deve registrar (passou o intervalo), `false` senão. Pura, sem estado interno.
- Resultado: `telemetria.json` passa a ter `{ t0, tela, cliques: [...], movimentos: [...] }`.
  ~60 pontos/s. O `/editar-video` (que já lê esse arquivo pro auto-zoom) ganha a matéria-prima
  pra cursor smoothing/HD numa melhoria futura (lote 2 / cursor HD).

### 2. fps/codec documentado

- **`scripts/lib-gravacao.mjs`** — extrair o fps default pra constante nomeada no topo:
  `const FPS_TELA = 30;` com comentário explicando por quê (gdigrab a 60 pesa demais na CPU
  durante a captura; 30 é o equilíbrio fluidez×carga). `argsCapturaTela` usa a constante.
  `preset fast` + `crf 18` já existem (qualidade de texto/UI). Documentar no SKILL.md a escolha
  de fps/qualidade e por quê (hoje o fps era "default cego").

### 3. Áudio do sistema (opcional, `--audio-sistema`)

- **`scripts/lib-gravacao.mjs`** — `acharLoopback(disponiveis)` (função pura): recebe a lista de
  dispositivos dshow (já parseada por `parseDispositivosDshow`) e procura um device de loopback
  do Windows ("Stereo Mix", "Mixagem estéreo", "What U Hear", "virtual-audio-capturer"). Devolve
  o nome do device ou `null`. + `argsCapturaSistema({ device, saida })` (pura) monta os args do
  ffmpeg pra capturar esse loopback num arquivo de áudio separado (`sistema.m4a`).
- **`scripts/gravar-tela.mjs`** — com a flag `--audio-sistema`: chama `acharLoopback`; achou →
  spawna a captura do loopback em paralelo (mais um ffmpeg, parado no ENTER com 'q' como os
  outros); não achou → avisa claro ("seu PC não tem Stereo Mix/loopback habilitado — gravando
  só o microfone; pra habilitar, ative 'Mixagem estéreo' no painel de som do Windows") e segue
  sem travar. Sem a flag → comportamento atual (só mic), zero mudança.
- Saída: `sistema.m4a` separado em `canal-youtube/gravacoes/<slug>/`. O `/editar-video` mixa
  depois (não acopla ao webcam.mp4). v1: arquivo separado, mix é problema da edição.

## Testes (TDD nas funções puras)

- `amostrarMovimento(ultimoTMs, tMs, opts)` — throttle (registra/pula pelo intervalo).
- `montarTelemetria` com `movimentos` — campo presente, normalizado, ordem preservada; sem
  movimentos = `movimentos: []` (compatível com quem só passa cliques).
- `acharLoopback(disponiveis)` — acha device de loopback por nome; null quando não há.
- `argsCapturaSistema({device, saida})` — monta os args dshow corretos.
- Captura real (uiohook/ffmpeg) = I/O, validada por smoke do dono, não unit.

## Compatibilidade / zero regressão

- `montarTelemetria` sem `movimentos` → `movimentos: []` (default), não quebra os testes/uso atuais.
- Sem `--audio-sistema` → captura idêntica à de hoje.
- O `telemetria.json` ganha um campo novo; quem lê só `cliques` (auto-zoom atual) ignora o resto.

## Critério de sucesso

Após uma gravação: `telemetria.json` tem `movimentos` com ~60 pontos/s (trilha do cursor),
`cliques` como antes; fps/qualidade documentados e constantes nomeadas; com `--audio-sistema` e
loopback disponível, sai um `sistema.m4a`; sem loopback, avisa e segue só com mic. Sem a flag e
sem ler `movimentos`, tudo funciona como antes (zero regressão). 59→mais testes verdes.

## Fora de escopo (lotes futuros)

- **Cursor HD/smoothing no render** — consome a trilha `movimentos` no `/editar-video` (lote do
  editar-video / cursor HD). Este lote só CAPTURA o dado; o uso visual é depois.
- Mix do áudio do sistema com a voz — é o `/editar-video` que mixa.
- Loopback em macOS/Linux (este é Windows-only, como o resto da skill).
