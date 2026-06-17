# Métricas do YouTube — validação de fórmula (Fase 3.5) — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-17 · Autoria: ImpulsoX AI.
> Fase 3.5 do canal YouTube — fecha o ciclo de aprendizado (mede → valida fórmula → corrige).

## Problema

O canal já roteiriza (Fase 1, com fórmula da Sabrina/Chase/Jonathan), edita (2), corta shorts
(2.5) e sobe (3). Falta o último elo: medir o que performou e **provar qual fórmula funciona**.
Sem isso o sistema repete molde no escuro. Esta fase puxa as métricas reais do YouTube, compara
a retenção contra o benchmark do formato, e marca cada fórmula como validada ou não no
`formulas-video.md` — o Modo 3 do `/formulas`, agora com dado de vídeo.

## Escopo

- **No escopo:** puxar métricas por vídeo (auto via YouTube Analytics API ou manual colado do
  Studio); comparar retenção (`averageViewPercentage`) contra benchmark por faixa de duração;
  avaliar a fórmula usada (validada / a testar / não funciona); destilar em
  `nucleo/aprendizados.md` e `canal-youtube/formulas-video.md`; sugerir quando medir (data de
  publicação). Skill `/desempenho-yt`.
- **Fora (fases próprias):** medição agendada automática (sob demanda por ora); curva de
  retenção segundo-a-segundo (`audienceRetention` com `elapsedVideoTimeRatio` — v2 futura);
  comparação com concorrentes; dashboards. O Instagram continua no `/desempenho` existente.

## Pesquisa que embasa o critério (2026)

- **Retenção é o sinal #1 do algoritmo.** +10 pontos de retenção média ≈ +25% de impressões
  na recomendação. Views são vaidade; retenção prova a fórmula.
- **Benchmark "bom" de `averageViewPercentage` por faixa:** Short ~70% (e >80% nos 3 primeiros
  segundos); long <5min 65-75%; 5-10min 50-60%; 10-15min 40-50%; 15min+ 35-45%.
- **Benchmark é RELATIVO ao nicho/canal, não global** — quando houver histórico, comparar
  também com a média do próprio canal.
- Os **primeiros 30s** decidem: queda >50% ali = "low-retention", distribuição limitada. É
  onde o hook (a fórmula) atua.
- **Pegadinha da API:** `averageViewPercentage` NÃO pode ser usado com a dimensão
  `liveOrOnDemand` — não usar essa dimensão.

## Decisões (do brainstorming)

1. **Skill própria `/desempenho-yt`** (não estender o `/desempenho` do Instagram).
2. **Auto + manual** (padrão da casa): OAuth com escopo `yt-analytics.readonly` (somado ao
   `youtube.upload` da Fase 3) → `reports.query`; sem credencial, o dono cola do Studio.
3. **Critério: retenção vs benchmark por faixa.** Acima do benchmark (ou da média do canal) →
   **validada aqui**; abaixo do benchmark **duas medições seguidas** → **não funciona neste
   nicho**; entre os dois → continua **a testar**. `subscribersGained` é desempate (conversão),
   não o sinal principal.
4. **Sob demanda + sugestão de quando medir:** a skill lê a data em `publicacoes.md` e avisa
   quais vídeos já têm ≥7-14 dias (retenção estabilizada) — não mede sozinha.

## Arquitetura

### 1. `scripts/lib-youtube-analytics.mjs` (novo — funções puras, ZERO deps, testáveis sem rede)

- `benchmarkRetencao({ ehShort, duracaoSeg })` → número (% esperado). Short → 70; long por
  faixa: <300s → 70, 300-600 → 55, 600-900 → 45, ≥900 → 40.
- `avaliarFormula({ averageViewPercentage, benchmark, mediaCanal = null, reprovacoesAnteriores = 0 })`
  → `"validada" | "a testar" | "nao funciona"`. Régua: APV ≥ (mediaCanal ?? benchmark) →
  "validada"; APV < benchmark e `reprovacoesAnteriores >= 1` → "nao funciona"; senão "a testar".
- `montarQueryAnalytics({ videoId, dataInicio, dataFim })` → objeto de params do `reports.query`
  (`ids: "channel==MINE"`, `startDate`, `endDate`, `metrics:
  "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained"`,
  `filters: "video==<id>"`). **Sem** dimensão `liveOrOnDemand`.
- `diasDesdePublicacao(dataISO, agora = new Date())` → inteiro de dias.
- `parseMetricasManual(texto)` → extrai `{views, averageViewPercentage, averageViewDuration,
  subscribersGained}` de um bloco colado do Studio (rótulos PT/EN tolerados; campo ausente = null).

### 2. `scripts/metricas-youtube.mjs` (novo — orquestrador, SÓ LEITURA)

- **Entrada:** `--video <id>` ou `--slug <nome>` (resolve o id em `producao/publicacoes.md`);
  `[--periodo 28]` (dias de janela, default 28); `[--manual "<texto colado>"]`.
- **`.env`:** reusa `YT_CLIENT_ID/SECRET/REFRESH_TOKEN` (Fase 3). Carrega via `process.loadEnvFile()`.
- **Auto:** troca refresh_token → access_token → GET `https://youtubeanalytics.googleapis.com/v2/reports`
  com `montarQueryAnalytics`. Parseia a linha de resultado.
- **Manual:** sem credencial (ou `--manual`), usa `parseMetricasManual`.
- **Sugestão de timing:** se `diasDesdePublicacao < 7`, avisa "retenção ainda instável, ideal
  esperar ~14 dias" e segue (não bloqueia).
- **Saída:** JSON `{ videoId, ehShort, duracaoSeg, metricas, benchmark, veredito }` (veredito de
  `avaliarFormula`). Não grava nada sozinho — quem grava é a skill após o dono confirmar.
- Token nunca aparece em log/erro (redigido).

### 3. Skill `/desempenho-yt` (nova)

- Lê `producao/publicacoes.md` → lista os vídeos do YouTube e sugere quais já dá pra medir
  (≥7-14 dias via `diasDesdePublicacao`).
- Roda `metricas-youtube.mjs` (auto/manual) por vídeo escolhido.
- **Cruza com `canal-youtube/formulas-video.md`**: identifica a fórmula que o vídeo usou
  (registrada no roteiro/pacote) e aplica o veredito — marca **validada aqui** /
  **não funciona neste nicho** / mantém **a testar**. Mostra ao dono antes de gravar.
- Destila o aprendizado em `nucleo/aprendizados.md` (padrão que se provou) e atualiza o status
  no `formulas-video.md`.
- Sobe o degrau da Escada de Contexto: degrau 4 no eixo vídeo (há dados reais).
- Princípio CLAUDE.md: aprendizado consolidado pesa mais que padrão genérico — fórmula validada
  aqui passa a ter prioridade no `/roteiro-yt`.

### 4. `.env.example` + guia

- Não cria variável nova (reusa as da Fase 3). Acrescentar nota no guia OAuth: o refresh_token
  precisa incluir o escopo `https://www.googleapis.com/auth/yt-analytics.readonly` além do
  `youtube.upload`. Documentar em `producao/guia-youtube-oauth.md`.

## Dados / fluxo

`publicacoes.md` (id + data) → `metricas-youtube.mjs` (auto/manual) → retenção vs
`benchmarkRetencao` → `avaliarFormula` → veredito → (dono confirma) skill grava status no
`formulas-video.md` + padrão em `nucleo/aprendizados.md` → `/roteiro-yt` prioriza fórmula
validada no próximo vídeo. Ciclo fechado.

## Tratamento de erro (PT-BR, acionável)

sem credencial → modo manual (cola do Studio) · id não está em `publicacoes.md` → orientar ·
vídeo < 7 dias → avisar retenção instável (não bloqueia) · OAuth sem escopo analytics → orientar
reautorizar com `yt-analytics.readonly` · resposta da API vazia (vídeo muito novo/privado sem
dados) → avisar e cair pro manual · cota da API estourada → avisar.

## Testes

- **Funções puras (sem rede, fixtures):** `benchmarkRetencao` (short=70; cada faixa de long);
  `avaliarFormula` (acima do benchmark → validada; abaixo + 1 reprovação → nao funciona; meio →
  a testar; mediaCanal sobrepõe benchmark); `montarQueryAnalytics` (metrics certas, filtro
  video==id, SEM liveOrOnDemand); `diasDesdePublicacao` (datas fixas); `parseMetricasManual`
  (extrai os 4 campos de um bloco colado; campo ausente = null).
- **Orquestrador:** só-leitura, mockar credencial/resposta; nenhum teste chama a API real.

## Critério de pronto

- `metricas-youtube.mjs` devolve métricas + veredito por vídeo (auto via Analytics API ou
  manual), comparando retenção ao benchmark da faixa. Só-leitura, token nunca vaza.
- `lib-youtube-analytics.mjs` coberto por testes de função pura.
- Skill `/desempenho-yt` sugere quando medir, cruza com `formulas-video.md`, grava veredito
  (após confirmação) e destila em `nucleo/aprendizados.md`.
- Guia OAuth documenta o escopo `yt-analytics.readonly`.
- Erros em PT; testes verdes sem tocar a API real.

## Fora de escopo (YAGNI)

- Medição agendada automática (sob demanda por ora).
- Curva de retenção segundo-a-segundo (`audienceRetention`).
- Comparação com concorrentes / benchmark externo automático.
- Dashboard visual (o painel já existe; integração futura).
- Métricas de Instagram (continuam no `/desempenho`).
