# Design — /desempenho unificado (YouTube + Instagram) com diagnóstico acionável

> Frente macro do backlog de auditoria. ImpulsoX AI · 2026-06-22. Pesquisa real 2026 em
> `.firecrawl/youtube-desempenho-pesquisa-2026.md` e `.firecrawl/instagram-desempenho-2026.md`.

## O que é

`/desempenho` vira a **porta única** de análise de desempenho de canal social: detecta a
plataforma (YouTube ou Instagram), calcula as métricas certas DAQUELA plataforma, diagnostica
o que consertar e **aponta a skill que conserta**, e realimenta `nucleo/aprendizados.md` →
`/calendario`. Agnóstica de nicho.

**v1 = modo COLAR/CSV** (você cola os números do Studio / Business Suite, ou aponta o CSV
exportado). API oficial (OAuth YouTube/Meta) = v2 (setup pesado; colar já entrega valor).

## Por que (a pesquisa mudou o desenho)

As plataformas medem coisas DIFERENTES — não dá pra uma régua só:
- **YouTube:** watch time + curva de retenção + CTR. O sinal é a CURVA (onde abandona).
- **Instagram:** sends/reach (sinal nº1 da Meta) + saves/reach. Não tem curva; tem save/send.

Por isso: **núcleo comum** (ingestão, ranking, relatório, loop) + **2 módulos de régua**
(YT/IG) + 1 porta. Padrão do mercado (Metricool: unificado na superfície, separado no motor).

## Arquitetura

```
/desempenho (porta única — SKILL.md)
  ├─ detecta a plataforma (pergunta YT/IG, ou pelo cabeçalho do CSV colado)
  ├─ NÚCLEO COMUM (scripts/lib-desempenho.mjs — funções puras):
  │    parsear colado/CSV → normalizar (mapa de aliases) → calcular taxas →
  │    rankear peças → montar veredito → linhas pro aprendizados.md
  └─ MÓDULO DE RÉGUA por plataforma:
       ├─ YouTube  (régua + diagnóstico de curva)
       └─ Instagram (régua save/send + por formato)
```

`/desempenho-yt` continua existindo como atalho que cai na mesma skill (redireciona).

## Os números reais (da pesquisa) — viram constantes/benchmarks

### YouTube (`lib-desempenho.mjs`, régua YT)

> **Upgrade explícito:** o `metricas-youtube.mjs` atual só lê AVD (retenção média) e dá veredito
> por 1 número — fraco. A régua nova SOBE pra: **CTR + retenção do 1º minuto + watch time + curva
> (dip/cliff/spike) + diagnóstico CRUZADO** (CTR×AVD). É o conjunto que a pesquisa provou ser o
> que separa diagnóstico genérico de acionável. O script atual vira matéria-prima (reusar o OAuth
> e o `buscarMetricas`, ampliando as métricas puxadas/coladas).

- **CTR:** comparar com a média rolling-28d do PRÓPRIO canal (cai com impressões — benchmark fixo
  engana). Faixa de referência: <3% fraco · 4-6% bom · >7% excepcional. Search > Browse.
- **AVD (averageViewPercentage) por duração:** <5min 50-70% · 5-15min 40-55% · 15-30min 30-45% ·
  Shorts 70%+. Educacional/PME ~42% é normal.
- **Retenção 1º minuto:** alvo ≥65-70%.
- **Vaidade:** views, inscritos (e Shorts views infláveis — usar Engaged Views). **Sinal real:**
  watch time (`estimatedMinutesWatched`), AVD, CTR vs própria média, retenção do 1º minuto.
- **Curva (só quando há a série — API ou colada):** detecção programática sobre %-por-momento:
  - **intro dip:** perda > 35-40% entre 0 e 30s → hook fraco.
  - **cliff:** delta negativo > 10-15% num único segmento (~3s) → corte/tangente naquele ponto.
  - **spike:** derivada positiva (re-watch) → produzir mais daquilo.
  - **declínio gradual sem cliff** → pacing lento.

### Instagram (`lib-desempenho.mjs`, régua IG)
- **IMPRESSIONS MORTO em 2026** — usar **Views**. Não calcular nada sobre impressions.
- **send_rate = shares/reach** (sinal nº1). **save_rate = saved/reach** (nº2). reach_rate =
  reach/seguidores.
- **save_rate:** <2% sem valor guardável · 3-6% sólido · 6-10%+ forte (educação/marca 8-12%).
- **reach_rate:** <10% fraco · 10-20% médio · 20-30%+ bom.
- **engagement_rate por tamanho:** <10k → 5-6% médio/8%+ ótimo; 10k-100k → 3-5%; >100k → 2%+.
- **Régua POR FORMATO:** reel = views + watch/retenção + sends; carrossel = saves +
  swipe-through (≥65%) + completion (≥55%).
- **Vaidade:** likes, followers. **Aliases CSV↔API:** CSV Business Suite usa `Saves`/`Shares`/
  `Reach`; API usa `saved`/`shares`/`reach`/`views` — o parser tem um mapa de aliases.

## Diagnóstico acionável (o real ganho — aponta a SKILL que conserta)

| Sintoma | Conserto → skill |
|---|---|
| YT: AVD baixo + queda >40% nos 30s | hook fraco → `/roteiro-yt` (hook + intro=thumbnail) |
| YT: CTR <3% mas AVD bom | thumbnail/título → `/roteiro-yt` (15-20 títulos) + `/thumbnail` |
| YT: CTR alto + queda nos 30s | clickbait/mismatch → `/roteiro-yt` (Quality-CTR) |
| YT: cliff no meio | corte/tangente → `/editar-video` (filler/punch-in) + `/roteiro-yt` (foreshadow) |
| YT: declínio gradual | pacing lento → `/editar-video` (apertar a edição) |
| IG: save_rate <2% | sem valor guardável → `/post` (slide-resumo "salva isto") |
| IG: send ~0 | não relatável → `/post`/`/reel-marca` (gancho de envio) |
| IG: reach <10% | testar reel + refazer hook 3s → `/post`/`/reel-marca` |
| IG: carrossel completion <55% | cliffhanger por slide → `/post` (swipe-retention) |
| O que deu spike/forte | repetir → vai pro `nucleo/aprendizados.md` com prioridade |

## Componentes

- **`scripts/lib-desempenho.mjs`** (NOVO) — funções puras testáveis: `parsearColado`/`parsearCsv`
  (com mapa de aliases), `taxasYouTube`, `taxasInstagram`, `diagnosticarYouTube`,
  `diagnosticarInstagram`, `detectarCurva` (dip/cliff/spike de uma série). Cálculo determinístico
  (dinheiro/número em código, nunca de cabeça — regra da casa).
- **`.claude/skills/desempenho/SKILL.md`** (REESCREVER) — porta única: detecta plataforma,
  chama o script, traduz o veredito + recomendações em linguagem do dono, grava no aprendizados.
- **`.claude/skills/desempenho-yt/SKILL.md`** (VIRA REDIRECT) — atalho que aponta pra `/desempenho`.

## Testes (TDD nas funções puras)

`taxasYouTube`/`taxasInstagram` (cálculo de AVD%, save/send/reach rate), `parsearCsv` (aliases
CSV↔API, impressions ignorado), `diagnosticar*` (sintoma→conserto certo por threshold),
`detectarCurva` (dip/cliff/spike de séries de teste). Cálculo é puro; API/colar é I/O.

## Fora de escopo (v2)

- **API oficial** (OAuth YouTube Analytics + Meta Graph) — automatiza o que hoje é colar. Os
  endpoints/scopes já estão pesquisados (`reports.query`+`elapsedVideoTimeRatio` / `insights`
  edge + `instagram_manage_insights`) — entram quando o dono quiser o setup.
- TikTok/LinkedIn — outras plataformas, módulos futuros.

## Critério de sucesso

O dono cola os números (ou o CSV) de um vídeo/post; `/desempenho` calcula as taxas certas da
plataforma, dá o veredito vs benchmark, lista o que consertar APONTANDO a skill, e grava o
aprendizado. Funciona pra YT e IG, cada um com sua régua. Cálculo testado.
