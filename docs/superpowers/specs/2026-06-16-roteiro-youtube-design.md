# Canal YouTube — roteiro, voz e radar de criadores (Fase 1) — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-16 · Autoria: ImpulsoX AI.

## Problema

O dono quer abrir um canal de YouTube (screen recording narrado, 8-15min long-form +
shorts) cobrindo 3 pilares — ensinar Claude Code do zero, mostrar produtos/funcionalidades
construídos, mostrar o próprio ImpulsoX-OS rodando. Hoje o sistema não escreve roteiro de
vídeo, não tem voz calibrada pra narração (distinta da voz de copy escrita) e não tem
mecanismo de pesquisa de formato que funciona no nicho.

Decisão estratégica (confirmada no brainstorming): construir isso **dentro do
ImpulsoX-OS atual**, só pro canal do dono, validar com vídeos reais e métrica real — só
depois extrair pra um produto vendável (`ImpulsoX-YT-OS`). Não desenhar nada genérico
agora; YAGNI até provar que funciona.

Esta fase cobre **só roteiro** (pesquisa de formato + escrita). Edição automática de vídeo
e conector de upload/métricas ficam pra specs separados (Fase 2 e Fase 3 — ver "Fora de
escopo").

## Escopo

- **No escopo:**
  - Pasta `canal-youtube/` (entidade própria, mesmo padrão de `clientes/<nome>/`).
  - `/voz` ganha flag `--canal` pra capturar `canal-youtube/voz-canal.md` (voz de
    narração, distinta de `nucleo/voz.md`).
  - `/formulas` ganha modo vídeo: dissecar vídeo do YouTube (transcript público, sem
    login) com campos extras de roteiro/fala; pesquisa amplia pra canais americanos do
    nicho.
  - Skill nova `/roteiro-yt`: escreve roteiro long-form e short a partir de tema, lendo os
    moldes de `docs/formulas.md`.
  - `canal-youtube/criadores-monitorados.md` + `scripts/checar-criadores-yt.mjs`: RSS dos
    7 criadores informados, gate por relevância temática, dissecção automática do que
    bater, push notification com resumo do vídeo.
- **Fora (Fase 2/3, specs próprios):** edição automática (ffmpeg+whisper), conector de
  upload (YouTube Data API), métricas/Analytics no `/desempenho`.

## Decisões (do brainstorming)

1. **Formato:** screen recording narrado, sua voz real lendo o roteiro (sem TTS/clone).
2. **Duração long-form:** 8-15min. Shorts: cortados do longo quando há trecho forte
   (`[CORTE-SHORT: ...]` marcado no roteiro) **e** roteiro próprio standalone quando não
   houver vídeo longo pra cortar.
3. **Mix dos 3 pilares:** sem ordem fixa de abertura — intercalado, decidido por dado real
   (`/desempenho`, Fase 3). Por ora (sem dado ainda), o dono escolhe o pilar por vídeo.
4. **Entidade separada:** `canal-youtube/` na raiz, não dentro de `producao/` — isolamento
   total facilita extrair pro `ImpulsoX-YT-OS` no dia de virar produto.
5. **Voz própria do canal:** `voz-canal.md` distinto de `nucleo/voz.md` — fala ao vivo
   narrando ≠ escrita de copy.
6. **Estrutura de roteiro (validada por pesquisa, não suposição):**
   - Hook → Setup → Pontos principais → Payoff → CTA.
   - Hook: frase de abertura ≤10 palavras, nunca "e aí galera/bem-vindo de volta",
     precisa validar o clique + levantar a aposta + abrir um loop de curiosidade nos
     primeiros ~20s.
   - **Hook se escreve por último**, depois do corpo do roteiro pronto (inverte a ordem
     ingênua de escrever do início ao fim).
   - Toda frase do roteiro serve um propósito: valor, curiosidade ou avançar a história —
     frase de puro preenchimento não entra.
   - Roteiro "escreve pro corte": cada bloco carrega cue de tela/B-roll/overlay, não só o
     texto falado (ex: `[TELA: terminal rodando claude code, zoom no diff]`).
   - Shorts: estrutura invertida — começa pelo payoff/lição no segundo 0-1, uma promessa
     só, sem "hey galera", sem slow build.
7. **Pesquisa prioriza canais americanos confirmados do nicho** (sementes iniciais, não
   lista fechada): Sabrina Ramonov, Luuk Alleman, Matt Ganzak, Jonathan Acuña "Doctor AI",
   Duncan Rogoff, Chase AI, Yury AI.
8. **Transcript público via biblioteca tipo `youtube-transcript-api`** — lê o mesmo dado
   que o painel "Mostrar transcrição" do player exibe, sem API key, sem login. Mesma régua
   do `/formulas` atual (nunca atrás de login).
9. **Monitoramento por RSS** (`youtube.com/feeds/videos.xml?channel_id=...`), público, sem
   API key. Gate de notificação é **relevância temática** (bate com um dos 3 pilares),
   não desempenho — desempenho do canal de origem vira só contexto informativo junto do
   aviso, nunca filtro. Vídeo relevante → dissecção automática (Modo 1 do `/formulas`) +
   push notification com resumo do que é o vídeo. Vídeo irrelevante → fica só no log, sem
   aviso.
10. **`/formulas` reaproveitado, não duplicado.** O `/roteiro-yt` não pesquisa de novo —
    lê os moldes que o `/formulas` já mantém em `docs/formulas.md`.

## Arquitetura

### 1. `canal-youtube/` (nova pasta, entidade própria)

```
canal-youtube/
  escada.md                    — degrau de contexto do canal
  voz-canal.md                 — voz de narração (via /voz --canal)
  pilares.md                   — os 3 pilares + regra de mix orientado a dados
  criadores-monitorados.md     — lista dos 7 criadores: nome, @handle, channel_id, RSS url
  pesquisa/
    fila.md                    — vídeos relevantes detectados, aguardando revisão
  roteiros/
    longa/<slug>.md
    shorts/<slug>.md
```

`escada.md` e `pilares.md` nascem com o conteúdo já decidido nesta sessão (3 pilares,
mix orientado a dado, degrau atual = 3 porque já existe voz/formato definidos, falta só
a voz capturada por entrevista).

### 2. `/voz` — flag `--canal`

- **O que muda:** `/voz --canal` roda a mesma entrevista (pergunta aberta, longa,
  recebe transcrição), mas grava em `canal-youtube/voz-canal.md` em vez de
  `nucleo/voz.md`. Sem flag, comportamento atual intacto.
- **Foco da entrevista pro canal:** ritmo de fala (pausas, frases curtas vs longas),
  gírias/expressões que usa falando e não escrevendo, como abre e fecha um vídeo na
  prática, energia (professor calmo, like confirmado em `nucleo/voz.md` da agência, ou
  diferente — a entrevista descobre, não assume).

### 3. `/formulas` — modo vídeo (extensão)

- **Modo 1 (Dissecar) ganha terceira forma de entrada:** link de vídeo do YouTube. Além
  do texto/print/link já suportado:
  1. `scripts/transcript-youtube.mjs <url>` — puxa transcript público (legenda
     automática ou manual, o que existir) via biblioteca sem API key/login, no padrão
     `youtube-transcript-api`. Erro claro se o vídeo não tiver legenda disponível.
  2. Disseca gancho/estrutura/gatilhos como já faz hoje, **mais** campos exclusivos de
     vídeo (só quando Rede=YouTube):
     - **Hook (tipo + texto literal dos 3-15s):** transcrito da fala real, não resumo.
     - **Ritmo de corte:** estimativa de frequência de jump-cut/troca de tela (rápido,
       médio, lento) — heurística a partir de timestamps de mudança de assunto na
       transcrição; sem visão computacional nesta fase.
     - **Estrutura de retenção:** que tipo de loop de curiosidade abre e quando fecha.
     - **Composição da fala:** frase curta vs longa, repetição proposital, pergunta
       retórica, jargão vs linguagem simples.
  3. Grava em `docs/formulas.md`, mesmo arquivo, mesmo formato de bloco — só com os
     campos extras quando aplicável.
- **Modo 2 (Pesquisar) ganha lista semente de canais americanos** (os 7 confirmados) —
  usados quando o dono pedir "atualiza fórmulas de vídeo" sem trazer peça específica.
  Pesquisa continua só em web aberta/dados públicos, nunca login.
- **Modo 3 (Validar)** segue igual — quando `/desempenho` (Fase 3) tiver dado do canal
  próprio, cruza e promove/rebaixa.

### 4. `canal-youtube/criadores-monitorados.md` + monitoramento

```markdown
| Criador | Handle | Channel ID | RSS |
|---|---|---|---|
| Sabrina Ramonov | — | UCiGWNa6QK6CiKPvv5-YPv8g | youtube.com/feeds/videos.xml?channel_id=UCiGWNa6QK6CiKPvv5-YPv8g |
| Luuk Alleman | — | UCJ2PJj3yRgUvzHb4XCCCLEw | ... |
| Jonathan Acuña "Doctor AI" | @jonathanacuna | UCOJp1lsu9vCF-TllwMzcCLg | ... |
| Duncan Rogoff | — | UC37JpWP5PxLSma2lh79HU9A | ... |
| Chase AI | @Chase-H-AI | (resolver channel_id no setup) | ... |
| Matt Ganzak | @mattganzak | (resolver channel_id no setup) | ... |
| Yury AI | @Yury_AI | (resolver channel_id no setup) | ... |
```

`scripts/checar-criadores-yt.mjs`:
1. Lê a lista, busca o RSS de cada criador (XML público, sem auth).
2. Compara com `canal-youtube/pesquisa/.ultimo-visto.json` (estado local, por
   `channel_id` → último `videoId` processado) — só processa vídeo novo.
3. Por vídeo novo: lê título + descrição do próprio RSS (já vêm no feed, sem chamada
   extra) e classifica relevância temática contra os 3 pilares (heurística por
   palavra-chave/tema, sem ligar pra view count nesta etapa).
4. **Relevante:** chama o Modo 1 do `/formulas` (transcript + dissecar) automaticamente,
   grava molde com status **a testar**, registra entrada em
   `canal-youtube/pesquisa/fila.md` com resumo do vídeo (de que trata, link, canal de
   origem) e dispara push notification.
   Desempenho do vídeo de origem (visualizações, se o feed/página pública expuser) entra
   só como linha de contexto na notificação — nunca decide se notifica ou não.
5. **Irrelevante:** atualiza `.ultimo-visto.json`, não notifica, não dissecta.
6. Agendado via `CronCreate` (diário). Falha de rede num criador não trava os demais —
   reporta o que falhou e segue.

### 5. Skill nova `/roteiro-yt`

**Fluxo:**
1. Recebe tema + pilar (do dono, ou da `fila.md` quando ele aprova um item pra adaptar).
2. Lê `docs/formulas.md` filtrando Rede=YouTube — prioriza **validada aqui**, depois
   **a testar**. Não pesquisa de novo.
3. **Grounding técnico** — só quando pilar = "ensinar Claude Code do zero": antes de
   afirmar qualquer comportamento/feature, valida contra documentação oficial atual
   (a skill não assume conhecimento de treino como atual sem checar — Claude Code muda
   rápido). Reaproveita o mesmo cuidado do `claude-code-guide`.
4. Escreve o **corpo** do roteiro primeiro (Setup → Pontos principais → Payoff → CTA),
   com cue de tela em cada bloco e timestamp sugerido.
5. Escreve o **hook por último**, calibrado pelo corpo já pronto (regra #6 das decisões).
6. Passa pelo `/escritor-br` usando `canal-youtube/voz-canal.md` (nunca `nucleo/voz.md`).
7. Marca trechos com potencial de corte pra short: `[CORTE-SHORT: mm:ss-mm:ss — razão]`.
8. Se for short standalone (sem long-form correspondente): estrutura invertida
   (payoff no segundo 0-1), uma promessa só, 30-60s, sem blocos.
9. **Saída** em `canal-youtube/roteiros/longa/<slug>.md` ou `.../shorts/<slug>.md`:
   título (3 opções), thumbnail-hint, roteiro com timestamp+cue, descrição SEO do
   YouTube, tags sugeridas.

## Regras

- Conteúdo real, nunca placeholder — mesma regra do `CLAUDE.md`. Claim técnico sobre
  Claude Code sem checar a doc atual não entra no roteiro.
- Transcript e pesquisa de criador **nunca atrás de login** — só dado público (RSS,
  transcript do player, página pública). Mesmo limite do `/formulas` hoje.
- Molde extraído de vídeo de criador é **esqueleto, nunca cópia** — frase, tema ou
  thumbnail do vídeo original jamais entram no roteiro novo.
- Token/credencial (se algum endpoint exigir no futuro) nunca em log — mesma régua dos
  outros conectores.
- Falha em um criador monitorado não trava os outros — reporta e segue.

## Testes

- **Funções puras:** parser do RSS (extrai videoId/título/descrição), classificador de
  relevância temática (heurística por palavra-chave), comparação com
  `.ultimo-visto.json`.
- **Mock de rede:** RSS e busca de transcript mockados (URL base configurável) — testes
  nunca chamam YouTube de verdade.
- **`/roteiro-yt`:** teste de que hook é escrito depois do corpo (ordem do fluxo), que
  saída tem todos os campos exigidos (título, thumbnail-hint, roteiro, descrição, tags).

## Critério de pronto

- `canal-youtube/` criada com `escada.md` e `pilares.md` preenchidos.
- `/voz --canal` grava em `canal-youtube/voz-canal.md` sem tocar `nucleo/voz.md`.
- `/formulas` dissecta vídeo do YouTube (transcript público) com os campos extras, grava
  em `docs/formulas.md`.
- `/roteiro-yt` escreve roteiro long-form e short, hook escrito por último, voz do canal
  aplicada, saída completa (título/thumbnail/roteiro/descrição/tags).
- `checar-criadores-yt.mjs` roda contra mock, classifica relevância, dissecta automático
  o que bate, grava em `fila.md`, notifica — sem nunca chamar API/rede real nos testes.
- Testes verdes.

## Fora de escopo (YAGNI)

- Edição automática de vídeo (ffmpeg/whisper, corte de silêncio, legenda queimada,
  intro/outro) — Fase 2, spec próprio.
- Conector de upload (YouTube Data API v3) e Analytics no `/desempenho` — Fase 3, spec
  próprio.
- Voz sintetizada/TTS — decidido contra nesta fase (voz real do dono).
- View count como critério de notificação do monitoramento — decidido contra; só tema.
- Generalização pra `ImpulsoX-YT-OS` vendável — só depois de validar no canal próprio.
