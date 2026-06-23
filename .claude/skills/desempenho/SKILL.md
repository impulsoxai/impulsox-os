---
name: desempenho
description: >
  Use quando é hora de medir o que foi publicado e aprender com isso — "/desempenho",
  "como foram os posts?", "como foi o vídeo?", "o que funcionou esse mês?", "mede a
  retenção", "fecha o ciclo", ou no fim de cada mês antes do próximo /calendario. PORTA
  ÚNICA pra YouTube E Instagram: detecta a plataforma, usa a régua certa de cada uma
  (YouTube = retenção/curva/CTR · Instagram = save/send/reach), diagnostica o que
  consertar APONTANDO a skill que resolve, destila padrões em nucleo/aprendizados.md e
  alimenta o próximo ciclo. É o elo que fecha o circuito: decide → produz → publica →
  mede → corrige.
---

# /desempenho — Medir, aprender, realimentar (YouTube + Instagram)

Conteúdo sem medição é circuito aberto. Esta skill pega o que `/publicar` levou ao ar,
busca os números reais, separa o que repetir do que abandonar, **diz qual skill conserta
cada problema**, e grava as conclusões onde o `/calendario` vai ler no próximo ciclo.

**YouTube e Instagram medem coisas DIFERENTES** — a skill usa a régua certa de cada um:
- **YouTube:** watch time + **curva de retenção** (onde o viewer abandona) + CTR. O sinal é
  a curva.
- **Instagram:** **sends/reach** (sinal nº1 da Meta) + **saves/reach**. Não tem curva; tem
  save/send. (Impressions morreu em 2026 — usa-se Views/Reach.)

Autoria: ImpulsoX AI.

## Passo 0 — Detectar a plataforma

Antes de tudo, saber se é YouTube ou Instagram: perguntar, OU inferir do dado colado/CSV —
se tem coluna `Average percentage viewed` / fala de retenção → **YouTube**; se tem
`Saves`/`Reach`/`Shares` → **Instagram**. A régua e o diagnóstico mudam conforme isso.

## Degrau mínimo (Escada de Contexto)

Dois modos, qualquer plataforma:

- **Colar / CSV (v1, sempre funciona):** o dono cola os números do app/Studio, ou aponta o
  CSV exportado — **YouTube Studio:** Analytics → Advanced → Export current view (CSV);
  **Instagram:** Business Suite → Insights → Content → Export Data. O parser
  (`scripts/lib-desempenho.mjs`, `parsearCsv`) normaliza as colunas (mapa de aliases;
  Impressions é ignorado de propósito).
- **API (v2, quando conectada):** YouTube Analytics API (`scripts/metricas-youtube.mjs`,
  OAuth `yt-analytics.readonly`) / Instagram Graph API (`instagram_manage_insights`). Avisar
  que existe; o setup de OAuth fica pra quando o dono quiser automatizar.

Nunca travar por falta de credencial — o colar resolve. Quando dados reais entram pela 1ª
vez, atualizar `nucleo/escada.md` (degrau 4 no eixo de conteúdo).

## O que ler antes

- `producao/publicacoes.md` — ids/datas do publicado · `producao/calendario/<mes>.md` —
  tema/intenção planejados · `nucleo/aprendizados.md` — o que já se sabe (confirmar, não redescobrir).

## Cálculo — sempre no script, nunca de cabeça

Todo número sai de `scripts/lib-desempenho.mjs` (funções puras, determinísticas — regra da
casa). O modelo interpreta, o script calcula:

- **Instagram:** `taxasInstagram` → save_rate (saved/reach), send_rate (shares/reach),
  reach_rate (reach/seguidores). `diagnosticarInstagram` → consertos.
- **YouTube:** `taxasYouTube` → AVD vs faixa de duração, CTR vs a **média do próprio canal**
  (benchmark fixo engana — CTR cai com impressões), retenção do 1º minuto, watch time.
  `detectarCurva` (quando há a série ponto-a-ponto, colada ou da API) → intro dip / cliffs /
  spikes. `diagnosticarYouTube` → consertos.

## Régua / benchmarks (pesquisa 2026)

- **Instagram:** save_rate <2% fraco · 3-6% sólido · 6%+ forte. reach_rate <10% fraco ·
  10-20% médio · 20-30%+ bom. **Régua por formato:** reel = views/retenção/sends; carrossel =
  saves/swipe-through (≥65%)/completion (≥55%). Vaidade (só medir): likes, seguidores.
- **Engagement médio caiu em 2026 — contextualizar antes de soar alarme:** a taxa média de
  engajamento do IG está em **~0,48% (-24% ano a ano)**. Benchmark **por formato** (pra não
  comparar laranja com maçã): **carrossel ~0,55% > reel ~0,50% > imagem ~0,35%**. Um número
  "baixo" no absoluto pode estar acima da média do formato — sempre ler a peça contra a
  régua do formato dela, não contra um ideal antigo. Falso alarme queima confiança do dono.
- **YouTube:** AVD bom por duração — <5min 50-70% · 5-15min 40-55% · 15-30min 30-45% · Shorts
  70%+ (educacional/PME ~42% é normal). Retenção 1º minuto alvo ≥65-70%. Vaidade: views,
  inscritos (Shorts views infláveis — usar Engaged Views).
- **YouTube — fonte de tráfego no diagnóstico:** ler de ONDE veio a view (relatório
  Traffic source do Studio). **Browse / Suggested** alto = o algoritmo está empurrando (sinal
  de saúde — capa/título e retenção convencendo o sistema a recomendar). **Search** alto =
  o vídeo é evergreen achável (bom pra cauda longa). Vídeo que só vive de tráfego externo/
  inscritos e não pega Browse não foi "abraçado" pelo algoritmo — diagnóstico diferente de
  um que pega Browse e cai na retenção.
- **YouTube — satisfaction signals:** além de retenção, o YT mede satisfação direta —
  **likes e shares por view** e as **surveys** ("o quanto você gostou deste vídeo", no
  Studio). Vídeo com retenção mediana mas satisfação alta tende a ser empurrado mais; o
  inverso (retém mas ninguém curte/compartilha) é sinal de clickbait que o sistema corrige.

## Diagnóstico acionável — cada problema aponta a SKILL que conserta

É o coração da skill: não basta dizer "caiu", tem que dizer **o que rodar pra consertar**.
`diagnosticar*` devolve a lista; traduzir pro dono em linguagem simples:

| Sintoma | Conserto → skill |
|---|---|
| YT: AVD baixo + retenção despenca nos 30s | hook fraco → **`/roteiro-yt`** (hook + intro=thumbnail) |
| YT: CTR abaixo da média + quem assiste fica | capa/título → **`/roteiro-yt`** (15-20 títulos) + **`/thumbnail`** |
| YT: queda abrupta no meio (cliff) | corte/tangente → **`/editar-video`** (filler/punch-in) |
| YT: declínio gradual | pacing lento → **`/editar-video`** (apertar a edição) |
| IG: save_rate baixo | sem valor guardável → **`/post`** (slide-resumo "salva isto") |
| IG: send ~0 | não relatável → **`/post`** / **`/reel-marca`** (gancho de envio) |
| IG: reach baixo | testar reel + refazer hook 3s → **`/reel-marca`** |
| O que deu spike/forte | repetir → vai pro `aprendizados.md` com prioridade |

## Análise — separar sinal de ruído

- Comparar **dentro do mesmo formato** antes de comparar formatos.
- Procurar **padrão, não pico** — um viral isolado é anedota; três peças de "ensinar"
  batendo as de "vender" é padrão.
- **Validar fórmulas:** cruzar molde × resultado e atualizar o status em `docs/formulas.md` /
  `canal-youtube/formulas-video.md` (validada / não funciona neste nicho).
- <~8 peças (IG) ou vídeo com <7-14 dias (YT) → conclusões marcadas como **tendência fraca
  (amostra pequena)**, não aprendizado consolidado.

## Saídas

1. **Relatório do período** em `producao/relatorios/desempenho-<YYYY-MM>.md`: tabela por peça,
   top/bottom 3 com hipótese, e **as recomendações apontando a skill** pro próximo ciclo.
2. **Aprendizados duradouros** em `nucleo/aprendizados.md` — só o que sobrevive ao mês
   (padrões confirmados, com data e evidência). Contradição → revisar o antigo, não acumular.
3. **Status no calendário** — marcar as peças medidas.

## Fechar o ciclo

> "Esses aprendizados já ficam valendo: o próximo `/calendario` monta o mês lendo o que
> funcionou aqui. Quer que eu já monte?"

**Resultado bom = gatilho de prova social.** Quando a medição revela um pico real — post que
bombou, campanha que converteu acima da meta, cliente com salto de venda no período — é o
melhor momento documentado pra pedir depoimento (o cliente está no pico de satisfação). Ao
detectar um spike/forte, sugerir: *"este foi um resultado forte — bom momento pra rodar
`/provas` e capturar um depoimento agora, no pico."* Fecha o loop decide→produz→mede→**prova**:
a medição alimenta o banco de prova, que volta pra alimentar a próxima peça de venda.

## Regras

- Número só de fonte real (API ou colado). Estimativa inventada nunca entra.
- Cálculo no script (`lib-desempenho.mjs`), interpretação no modelo. Nada de aritmética de cabeça.
- `nucleo/aprendizados.md` é destilado (máx ~15 entradas vivas); superado é removido/revisado.
- Sem auto-elogio: mês fraco, o relatório diz que foi fraco e por quê.
- Token/credencial jamais em log, relatório ou conversa.

---

**✓ Pronto:** relatório do período + aprendizados destilados em `nucleo/aprendizados.md` · **→ próximo passo:** `/calendario` do próximo ciclo — ele lê o que funcionou aqui e monta o mês embasado. Pré-requisito: métricas (coladas ou da API); sem número real, a skill não fecha o ciclo.