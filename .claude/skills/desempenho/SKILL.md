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

Dois modos, qualquer plataforma — **e no Instagram a API é o DEFAULT, não o "v2 pra
depois"** (o token que publica já lê insights; o CSV manual era a fricção que fazia o mês
fechar sem medição):

- **API (default quando o /publicar está configurado):**
  - **Instagram:** `node scripts/metricas-instagram.mjs --todas --dias 30` (ou `--slug
    <peça>`) — usa o MESMO `META_TOKEN_PAGINA` do /publicar (exige
    `instagram_manage_insights` no app, mesmo app), lê o registro canônico de
    `publicacoes.md` e devolve taxas + diagnóstico prontos por peça.
  - **YouTube:** `scripts/metricas-youtube.mjs` (OAuth `yt-analytics.readonly`).
- **Colar / CSV (fallback, sempre funciona):** o dono cola os números do app/Studio, ou
  aponta o CSV — **YouTube Studio:** Analytics → Advanced → Export; **Instagram:**
  Business Suite → Insights → Content → Export. O parser (`lib-desempenho.mjs`,
  `parsearCsv`) normaliza as colunas (Impressions ignorado de propósito). É o caminho de
  publicação antiga sem registro canônico (só permalink, sem media_id).

Nunca travar por falta de credencial — o colar resolve. Quando dados reais entram pela 1ª
vez, atualizar `nucleo/escada.md` (degrau 4 no eixo de conteúdo).

## As DUAS cadências (o mensal sozinho chega tarde)

1. **Check de 72h (2 min, 3 números)** — pra peça que não pode esperar o mês:
   - **Peça QUENTE do /pulso** (`origem: pulso-quente` no registro): newsjacking medido 3
     semanas depois não ensina nada — medir em 48-72h e gravar o aprendizado ainda quente.
   - **Trial Reel** (`status: em-trial`): a decisão "promover ao grid ou não" é de 24-72h
     — rodar `metricas-instagram.mjs --slug <peça>`, olhar retenção/sends: acima da média
     da conta → promover (e marcar `publicado`); abaixo → fica fora do grid, registrar o
     porquê. **Esta decisão agora tem dono: é deste check.**
2. **Mensal (o fechamento do ciclo)** — tudo da janela, com uma régua de honestidade:
   medir cada peça na **janela fixa de 7 dias pós-publicação** quando a API permitir
   (reach acumula com o tempo — peça do dia 2 vs dia 28 na mesma tabela crua engana;
   o campo `janelaDias` do script existe pra isso).

## Calibrar o JUIZ (nota do /revisar × resultado real)

O gate de 8/10 do `/revisar` é um PREDITOR — e preditor se valida. No mensal, com o
registro canônico (campo `nota-revisar`):
- Comparar: as peças nota ≥9 performaram acima das 7-8 (save/send/reach)?
- **Sim** → o scorecard prevê; nada a fazer.
- **Não (2+ meses seguidos)** → o peso de 50% no hook está errado PRA ESTA conta —
  registrar em `nucleo/aprendizados.md` a divergência e o ajuste sugerido de peso; o
  `/revisar` lê aprendizados e calibra. Juiz nunca validado é dogma.

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
  comparar laranja com maçã): **carrossel ~0,55% > reel ~0,50% > imagem ~0,35%** (agregados
  de benchmark 2026 — RivalIQ/Metricool; ordem de grandeza, reconferir anual). Um número
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
- **Validar mecânicas de hook:** as peças registram a mecânica usada (de `docs/hooks.md`);
  mecânica que rende acima da média da conta sobe pra seção "Validadas aqui" de lá, com o
  número. Mesma régua das fórmulas: padrão, não pico.
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

**✓ Pronto:** relatório do período + aprendizados destilados em `nucleo/aprendizados.md` · **→ próximo passo:** `/calendario` do próximo ciclo — ele lê o que funcionou aqui e monta o mês embasado. **Se o gargalo for a PÁGINA** (tráfego chega mas não converte, lead caro), o conserto não é mais conteúdo: voltar pra `/copy` (texto que vende) ou `/oferta` (a proposta em si). Pré-requisito: métricas (coladas ou da API); sem número real, a skill não fecha o ciclo.