# Edição automática do vídeo long-form (Fase 2) — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-16 · Autoria: ImpulsoX AI.
> Fase 2 do canal YouTube (Fase 1 = roteiro, ver `2026-06-16-roteiro-youtube-design.md`).

## Problema

O gargalo real do dono não é roteiro — é **edição** (ele disse: "a edição demora muito").
A Fase 1 entrega roteiro + pacote; falta transformar a gravação crua em vídeo publicável
sem horas de edição manual. Esta fase automatiza o que é regra (corte de silêncio,
legenda, intro/outro, render, thumbnail) e deixa pro humano só o que é direção criativa.

## Escopo

- **No escopo:** edição do **long-form 16:9** a partir da gravação de tela narrada:
  ingestão (1 arquivo, ou 2 + sincronização), corte de silêncio longo, transcrição local
  (whisper), legenda queimada + `.srt`, intro/outro com a marca, render final, e thumbnail
  (frame+texto sempre + alternativa Fal sob preview/confirmação).
- **Fora (fases próprias):** shorts verticais (Fase 2.5 — usa os marcadores `[CORTE-SHORT]`
  buscando a frase na transcrição); upload + métricas (Fase 3); corte de gaguejo/hesitação
  (decisão: só silêncio agora); marca d'água permanente (só intro/outro agora).

## Decisões (do brainstorming)

1. **Pipeline de scripts pequenos + orquestrador** (padrão do repo: `lib-*` com funções
   puras + orquestrador, igual `publicar-*` e `gerar-video.mjs`). Não monolito, não
   ferramenta externa.
2. **Trabalha sobre a gravação real, não sobre os timestamps do roteiro.** O corte de
   silêncio muda os tempos — marcador do roteiro não sobrevive. O roteiro é o plano; a
   gravação é a verdade. Fase 2 transcreve o áudio de fato e corta o silêncio de fato,
   desacoplada dos marcadores. (Shorts, na Fase 2.5, acham a frase marcada buscando na
   transcrição.)
3. **Ingestão flexível:** aceita 1 arquivo (tela+voz juntos, padrão) ou 2 (tela .mp4 +
   voz .wav/.mp3, sincroniza pelo início). Default = arquivo único.
4. **Corte só de silêncio longo** — ffmpeg `silencedetect`, determinístico. Não decide o
   que é "erro" (zero risco de cortar algo proposital).
5. **Legenda nos dois formatos:** queimada no vídeo (impacto/retenção) **e** `.srt`
   separado (acessibilidade/SEO do YouTube).
6. **Transcrição local (whisper)** — grátis, offline, sem custo por vídeo. `WHISPER_BIN` e
   `WHISPER_MODEL` configuráveis no `.env`, com defaults. Erro guiado se ausente (igual
   tratamento do ffmpeg).
7. **Intro + outro curtos** com a identidade (`marca/`). Resto é a tela crua editada.
8. **Thumbnail: duas saídas.** Frame+texto (ffmpeg, determinístico, on-brand) **sempre**;
   alternativa gerada por IA (Fal, via `gerar-imagem.mjs`) atrás de `--fal`, com **preview
   do plano + confirmação antes de gastar** (mesma trava dry-run/`--confirmar` dos
   conectores de publicação).
9. **Dry-run por padrão** no orquestrador: mostra o plano (duração estimada, nº de cortes,
   trechos removidos, arquivos de saída) sem renderizar; `--confirmar` renderiza de verdade.

## Arquitetura

### 1. `scripts/lib-edicao.mjs` (novo — funções puras, ZERO deps, testáveis sem ffmpeg/whisper)

- `segmentosManter(saidaSilencedetect, { minSilencio, duracaoTotal })` → lista de
  `{ inicio, fim }` a **manter** (inverte os intervalos de silêncio detectados; descarta
  silêncio acima de `minSilencio`, default 0.8s; mantém uma folga de ~0.15s nas bordas pra
  não cortar respiração natural/ataque de palavra).
- `filtroCorteConcat(segmentos)` → string do filtro ffmpeg (`trim`/`atrim` + `concat`) que
  costura só os trechos mantidos, vídeo e áudio juntos.
- `montarSRT(palavras)` → string `.srt` a partir de palavras com timestamp
  (`[{ inicio, fim, texto }]`), agrupando em legendas de ~7 palavras / até ~3s.
- `filtroLegenda({ srtCaminho, fonte, cor, tamanho, contorno })` → filtro `subtitles=`
  (queima a legenda). Reusa o escape de caminho de fonte do `gerar-video.mjs` (no Windows
  `\` quebra o filtro e `:` do drive vira `\:`).
- `argsThumbnailFrameTexto({ frame, texto, fonte, cor, contorno, largura, altura })` →
  args do ffmpeg pra queimar ≤5 palavras sobre o frame (1280x720), com contorno pra
  legibilidade no mobile.
- **Sem efeito colateral, sem rede, sem disco** — só montam strings/listas.

### 2. `scripts/transcrever-local.mjs` (novo)

- **O que faz:** chama o whisper local via `execFileSync` e devolve
  `{ palavras: [{ inicio, fim, texto }], texto }`.
- **Config:** `WHISPER_BIN` (default tenta `whisper` no PATH), `WHISPER_MODEL` (default
  `small`), `WHISPER_IDIOMA` (default `pt`). Saída JSON com timestamp por palavra
  (whisper.cpp `--output-json` / openai-whisper `--word_timestamps True`).
- **Erro guiado:** se o binário não existe, mensagem em PT com como instalar (e cria
  `canal-youtube/edicao/guia-whisper.md` com o passo a passo na primeira falha, se não
  existir). Não trava o resto: sem transcrição, o orquestrador pula legenda e avisa.
- **Base configurável (testes):** aceita injeção do comando/saída pra testar o parsing sem
  rodar whisper de verdade.

### 3. `scripts/editar-video.mjs` (novo — orquestrador)

- **Entrada:** `--video <arquivo>` (ou `--tela <mp4> --voz <audio>`), `--slug <nome>`,
  `[--min-silencio 0.8]`, `[--sem-intro]`, `[--confirmar]`.
- **`.env`:** `WHISPER_BIN`, `WHISPER_MODEL`, `WHISPER_IDIOMA` (todos opcionais).
- **Fluxo com `--confirmar`:**
  1. Valida ffmpeg presente, arquivo(s) existem, duração mínima (>~10s).
  2. (2 arquivos) sincroniza tela+voz pelo início (`-i tela -i voz`, mapeia áudio da voz).
  3. Roda `silencedetect` → `segmentosManter` → `filtroCorteConcat` → render do corte
     intermediário.
  4. `transcrever-local` no áudio cortado → `montarSRT` → grava `legenda.srt`.
  5. Queima a legenda (`filtroLegenda`) sobre o vídeo cortado.
  6. Cola intro/outro (se existirem em `canal-youtube/edicao/templates/`; senão, avisa e
     segue sem) → render final `final.mp4` (16:9, 1920x1080).
  7. Registra marcos no feed (`registrar-passo`) e custo 0 (transcrição local).
  8. Saída JSON: `{ ok, slug, final, srt, duracaoAntes, duracaoDepois, cortes }`.
- **Fluxo sem `--confirmar` (default):** valida tudo, roda só o `silencedetect` (barato),
  imprime o plano (duração estimada depois do corte, nº de cortes, % removido, arquivos
  que seriam gerados) — **não renderiza**.
- **Saídas em `canal-youtube/edicao/<slug>/`:** `final.mp4`, `legenda.srt`.

### 4. `scripts/gerar-thumbnail.mjs` (novo)

- **Entrada:** `--slug <nome>`, `--texto "<=5 palavras>"`, `[--frame <png|tempo>]`,
  `[--fal]`, `[--confirmar]`.
- **Sempre:** extrai um frame da gravação (ou usa o `--frame` apontado) e queima o texto
  com a fonte/cor da marca (`argsThumbnailFrameTexto`) → `thumb-frame.png` (1280x720).
- **Com `--fal`:** monta o prompt a partir do conceito de thumbnail do `/roteiro-yt` e
  **mostra o preview do plano** (prompt, estilo, custo estimado); só com `--confirmar`
  chama `gerar-imagem.mjs` (Fal) → `thumb-fal.png`. Sem `--confirmar`, não gasta.
- **Saídas em `canal-youtube/edicao/<slug>/`:** `thumb-frame.png`, opcional `thumb-fal.png`.

### 5. Skill nova `/editar-video`

- Orquestra os scripts acima em linguagem de leigo (o dono não sabe ffmpeg).
- Fluxo da skill: confirma gravação na mão → roda `editar-video.mjs` em dry-run → mostra o
  plano (quanto vai cortar) → com OK, `--confirmar` → gera thumbnail (frame+texto; oferece
  a alternativa Fal com aviso de custo) → aponta os arquivos finais e sugere `/revisar`
  antes do upload (Fase 3).
- Declara dependências (ffmpeg, whisper) e guia instalação na primeira vez que faltarem.
- Entra no fluxo do canal: `/roteiro-yt` → (gravar) → **`/editar-video`** → (Fase 3: upload).

## Reuso e consistência

- Padrão `argsFfmpeg`/escape de fonte: espelhar o `gerar-video.mjs` (não reescrever do
  zero; mesma convenção de filtro e de Windows-path).
- Trava dry-run/`--confirmar`: mesma do `publicar-instagram.mjs`/`gerar-avatar.mjs`.
- `registrar-passo` (feed do painel) e `registrar-custo` (custo 0 na transcrição local;
  custo Fal só se a thumbnail Fal for confirmada).
- Geração de imagem Fal: reusa `gerar-imagem.mjs`, não cria fluxo novo.

## Tratamento de erro (PT-BR, acionável)

ffmpeg ausente · whisper ausente (guia de instalação) · arquivo de vídeo não existe ·
gravação curta demais (<~10s) · 2 arquivos com durações muito diferentes (aviso de
sincronização) · silencedetect não achou silêncio (segue sem cortar, só normaliza) ·
transcrição vazia (pula legenda, avisa) · intro/outro ausente (segue sem, avisa) ·
frame da thumbnail inválido. Falha de uma etapa não-essencial não derruba o render.

## Testes

- **Funções puras (sem ffmpeg/whisper, com fixtures):** `segmentosManter` (parse de saída
  real do `silencedetect`, inversão de intervalos, folga de borda, descarte abaixo do
  mínimo); `filtroCorteConcat` (JSON exato do filtro pra N segmentos); `montarSRT`
  (agrupamento, formato de timestamp `HH:MM:SS,mmm`); `argsThumbnailFrameTexto` (args
  esperados); `filtroLegenda` (escape de fonte no Windows).
- **`transcrever-local`:** parsing da saída JSON do whisper mockada (não roda whisper).
- **Orquestrador dry-run:** valida e imprime o plano sem renderizar (sem tocar ffmpeg de
  render — só o `silencedetect` pode ser mockado/saltado em teste).
- Nenhum teste renderiza vídeo de verdade nem chama Fal.

## Critério de pronto

- `editar-video.mjs` transforma uma gravação crua em `final.mp4` (16:9, silêncio cortado,
  legenda queimada, intro/outro) + `legenda.srt`, com dry-run por padrão e `--confirmar`
  pra valer.
- `gerar-thumbnail.mjs` entrega `thumb-frame.png` sempre; `thumb-fal.png` só sob
  `--fal --confirmar`, com preview antes de gastar.
- `lib-edicao.mjs` e `transcrever-local.mjs` cobertos por testes de função pura/parsing.
- Erros em PT, dependências (ffmpeg/whisper) guiadas; custo Fal só quando confirmado.
- Skill `/editar-video` no fluxo, em linguagem de leigo.
- Testes verdes sem renderizar vídeo nem chamar Fal.

## Fora de escopo (YAGNI)

- Shorts verticais (Fase 2.5).
- Upload + métricas (Fase 3).
- Corte de gaguejo/hesitação (só silêncio agora).
- Marca d'água permanente (só intro/outro agora).
- Pattern interrupts/zoom automáticos guiados pelo roteiro (o `[INTERRUPT]` é dica de
  gravação/edição manual nesta fase; automação de zoom fica pra depois).
- B-roll automático, transições autorais, multi-câmera.
