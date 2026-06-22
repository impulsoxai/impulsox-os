# Design — B-roll com voz narrada (zero-filmagem)

> Spec da feature que adiciona VOZ narrada ao pipeline de B-roll do ImpulsoX-OS.
> ImpulsoX AI · 2026-06-22.

## O que é

O formato "B-roll com voz narrada": uma voz narra sobre clipes cinematográficos gerados por
IA. O dono não filma nada (zero-filmagem). Inspirado no formato B-Roll do CAM (simpletechskills):
voz narra sobre 5-6 clipes. Estende o `scripts/gerar-video.mjs`, que JÁ faz o B-roll mudo
(still on-brand → Fal Kling/Seedance → costura ffmpeg → legenda + trilha). Falta a camada de
VOZ — é o que esta feature adiciona.

**Agnóstica de nicho** — roda no clone de cada cliente, na marca/voz dele.

## Por que

É o gap que o CAM tem e a esteira de vídeo da ImpulsoX não tinha: vídeo publicável sem o dono
aparecer/gravar tela. Avatar lip-sync (a outra peça do CAM) fica pra depois — esta é a versão
viável e barata: voz (real ou TTS) sobre B-roll que já sabemos gerar.

## Arquitetura (estende gerar-video.mjs — não cria fluxo novo)

### Roteiro JSON — campo `narracao` por cena

```json
{ "slug": "venda-22h", "cenas": [
  { "narracao": "A venda das 22h você já perdeu.", "visual": "loja fechada à noite, neon azul, chuva", "texto": "A venda das 22h" }
]}
```
- `narracao` — o texto FALADO daquela cena (a locução).
- `visual` — prompt do clipe Fal (já existe).
- `texto` — legenda curta opcional; se ausente, o karaokê do Whisper cobre.
- `segundos` — NÃO é mais fixo quando há voz: a duração da fala manda (ver pipeline).

### Duas fontes de voz (dono escolhe; Escada de Contexto)

- **`--voz <pasta>`** — voz REAL: o dono entrega 1 áudio por cena (`cena-01.mp3`, `cena-02.mp3`…).
  Zero custo, voz autêntica. (Fatiar 1 áudio contínuo por silêncio = fase futura; v1 = 1 por cena.)
- **`--tts <provedor>`** — voz por IA: gera a locução de cada `narracao`. v1 = ElevenLabs (melhor
  PT-BR). Chave `ELEVENLABS_KEY` no `.env` (gitignored). Guarda de custo + `--confirmar`.
- **Nenhum dos dois** → modo atual (legenda + trilha, sem voz). Não quebra o que existe.

### Pipeline quando há voz (a FALA manda a duração)

1. **Obter as falas** — 1 áudio por cena (voz real: o dono entrega; TTS: gera via `gerar-tts.mjs`).
2. **Medir cada fala** — `ffprobe` → duração de cada áudio. Função pura `duracaoAudio(saidaFfprobe)`.
3. **Casar duração** — `casarDuracoes(cenas, duracoesAudio)` aplica a duração da fala (+folga) em
   cada cena, sobrescrevendo o `segundos` fixo. O clipe Fal nunca corta a voz.
4. **Gerar + costurar** — motor atual (still → Fal pela duração casada → concat ffmpeg).
5. **Mixar voz** — `mixVozTrilha`: voz no volume cheio; música (se `--trilha`) por baixo a ~-18dB.
6. **Karaokê** — Whisper transcreve a voz final (`transcrever-local.mjs`) → legenda palavra-a-
   palavra sincronizada (reusa `montarASS` do `/editar-video`). +38% retenção (pesquisa viral).
7. **Saída** — `reel.mp4` 1080x1920 com voz + karaokê + trilha opcional.

### Componentes

- **`scripts/gerar-video.mjs`** (estender) — novas flags `--voz`/`--tts`; quando há voz, roda o
  pipeline acima. Sem voz = comportamento atual intacto. Helpers puros novos: `duracaoAudio`,
  `casarDuracoes`, `mixVozTrilha`.
- **`scripts/gerar-tts.mjs`** (NOVO) — função `gerarTTS({texto, voz, saida})` (ElevenLabs) + CLI +
  `estimarCustoTTS(texto)` (função pura). Isolado: trocar de provedor depois não mexe no resto.

## Custo e segurança

- **Guarda de custo TTS:** `estimarCustoTTS` (~$0.30/1k chars ElevenLabs) + exige `--confirmar`
  antes de gastar (igual o gerar-video já faz com Fal).
- **Voz clonada = área cinza:** clonar a própria voz do dono = ok (é dele). Clonar voz de
  terceiro sem permissão → a skill RECUSA. Aviso explícito no fluxo.
- **Chave nunca commitada** — `ELEVENLABS_KEY` no `.env` (gitignored, já validado).
- **`--dry-run`** mostra plano (cenas, durações estimadas, custo total) sem gastar nada.
- **Peça vai ao ar → passa por `/revisar`** antes de publicar.

## Onde encaixa nas skills

`gerar-video.mjs` já é chamado pelo `/post` (reel) e pode ser pelo `/shorts`/`/reel-marca`. O
B-roll-com-voz vira um MODO do `/post` ("reel narrado") — documentado no SKILL.md do `/post`,
sem skill nova. O roteiro com `narracao` pode vir do `/roteiro-yt` (que agora calibra por funil).

## Testes (TDD nas funções puras)

`duracaoAudio` (parseia saída do ffprobe), `casarDuracoes` (aplica duração da fala nas cenas),
`mixVozTrilha` (monta args ffmpeg voz+música), `estimarCustoTTS` (cálculo de custo). Fal/
ElevenLabs/ffmpeg reais = I/O externo, não testados em unidade.

## Critério de sucesso

Dono dá um roteiro com `narracao` por cena + escolhe voz (real `--voz` OU IA `--tts`). O sistema
gera o reel onde cada clipe B-roll dura o tempo da fala que o narra, com a voz mixada e karaokê
sincronizado, 1080x1920. Sem voz, o gerar-video funciona como hoje (zero regressão). Custo TTS
com guarda. Funciona pra qualquer nicho.

## Fora de escopo (fase futura)

- Fatiar 1 áudio contínuo do dono por silêncio (v1 = 1 arquivo por cena).
- Avatar lip-sync (a outra peça do CAM — fase separada, já adiada pelo dono).
- Clonagem de voz gerenciada pela skill (v1: o dono usa uma voz pronta ou já clonada no provedor).
- Outros provedores de TTS além do ElevenLabs (a função `gerarTTS` é isolada pra trocar depois).
