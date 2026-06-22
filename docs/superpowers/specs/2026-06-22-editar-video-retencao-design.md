# Design — /editar-video: filler words, vertical, punch-in, intro morta

> Lote 2 do backlog de auditoria (`docs/backlog-auditoria-skills-2026-06-22.md`). ImpulsoX AI · 2026-06-22.

## O que é

Quatro melhorias de retenção na skill `/editar-video`, da auditoria (OpusClip 13.5M clips):
1. **Remover filler words** ("é/tipo/né/então") — maior gap vs Descript/OpusClip.
2. **`--vertical`** — auto-reframe 9:16 (hoje força 16:9).
3. **Punch-in automático** — zoom suave nos buracos sem clique (reseta atenção).
4. **Intro morta** — corta o silêncio inicial sempre (mesmo com `--sem-corte-silencio`).

Agnóstica de nicho, ffmpeg + Whisper local. Estende `lib-edicao.mjs` com funções puras.

## Por que

A auditoria: filler words = "som amador→profissional" (#18-19); vertical destrava o short que a
skill diz priorizar mas força 16:9 (#46); punch-in reseta atenção em fala estática (#20); intro
branded/morta = "watch-time poison" (#1-7). Tudo viável em ffmpeg/Whisper local, sem SaaS.

## Arquitetura (funções puras em lib-edicao.mjs + flags no editar-video)

Formatos existentes reusados: `palavras` do `transcrever` = `[{texto, inicio, fim}]`;
`segmentosManter` → `keeps: [{inicio, fim}]`; `filtroZoompan(regioes)`; `filtroEscala1080p`.

### 1. Filler words (conservador: só vício ISOLADO)

- **`LISTA_FILLER`** (const) — PT-BR curta e segura: `["é", "éé", "ééé", "tipo", "né", "então",
  "ãã", "ããã", "hum", "ahn", "eh", "tá"]` (hesitações; nada que seja palavra de conteúdo comum).
- **`spansFiller(palavras, { lista = LISTA_FILLER, gapMin = 0.3 })`** — acha as palavras-vício
  que estão ISOLADAS: cercadas por gap (silêncio) ≥ `gapMin` antes E depois (ou borda do vídeo).
  Só essas viram corte — nunca um "tipo" no meio de frase. Retorna `[{inicio, fim}]`. PURA.
- **`mesclarCortes(keeps, spansRemover)`** — recebe os segmentos a MANTER (`keeps`) e os spans a
  REMOVER (filler); subtrai os spans dos keeps, devolvendo novos keeps menores. PURA.
- No `editar-video.mjs`: depois de transcrever (já roda), chama `spansFiller(palavras)` e
  `mesclarCortes`. Liga por padrão (conservador). Aparece no dry-run ("N vícios removidos").

### 2. `--vertical` (auto-reframe 9:16, crop central, sem bolha)

- **`filtroEscala9x16({ largura = 1080, altura = 1920 })`** — `scale` com
  `force_original_aspect_ratio=increase` (cobre) + `crop` central pro 9:16 + `setsar=1`. Pega a
  faixa central (conteúdo de tela/talking-head costuma estar no meio). PURA.
- No `editar-video.mjs`: flag `--vertical` troca `filtroEscala1080p()` por `filtroEscala9x16()`
  no render do corpo. Sem a flag = 16:9 atual (zero regressão). Sem bolha de webcam neste reframe
  (o dono vai testar vídeo só de tela primeiro; bolha-como-rosto = refinamento futuro).

### 3. Punch-in automático (preenche os buracos sem clique)

- **`punchInRegioes(duracaoTotal, regioesExistentes, { gapMax = 12, dur = 2.5, nivel = 1.15 })`**
  — varre a timeline; onde há um buraco > `gapMax` segundos SEM nenhuma região de zoom, insere
  uma região de punch-in suave (`nivel` 1.15x, `dur` 2.5s) no meio do buraco. Não sobrepõe as
  regiões de clique (auto-zoom) — só preenche o vazio. Retorna a lista combinada
  `[{inicio, fim, foco, nivel}]` (foco central x:0.5,y:0.5). PURA.
- No `editar-video.mjs`: quando o auto-zoom está ligado (`--zoom auto`), após carregar as
  regiões de clique, passa por `punchInRegioes` pra preencher os silêncios visuais. Reusa o
  `filtroZoompan` que já aplica.

### 4. Intro morta (corta silêncio inicial SEMPRE)

- **`cortarIntroMorta(keeps, primeiraFalaSeg, { margem = 0.3 })`** — se o 1º keep começa antes de
  `primeiraFalaSeg - margem` (silêncio antes da 1ª palavra), avança o início do 1º keep pra
  `primeiraFalaSeg - margem` (deixa um respiro). Se não há fala, não mexe. PURA.
- No `editar-video.mjs`: roda SEMPRE — inclusive com `--sem-corte-silencio` (a pausa do meio é
  proposital numa live, mas a intro morta no começo nunca deve ficar). `primeiraFalaSeg` vem da
  1ª palavra de `palavras` (já transcrito).

## Testes (TDD nas funções puras)

- `spansFiller` — acha vício isolado; ignora vício no meio de frase; lista vazia/sem vício = [].
- `mesclarCortes` — subtrai spans dos keeps; span fora dos keeps = sem efeito; corta no meio de
  um keep = divide em dois.
- `filtroEscala9x16` — string de filtro correta (scale+crop+setsar).
- `punchInRegioes` — insere no buraco > gapMax; não insere onde já há zoom; vídeo curto = [].
- `cortarIntroMorta` — avança o 1º keep quando há silêncio inicial; não mexe sem silêncio inicial.
- ffmpeg/Whisper reais = I/O, validado por smoke.

## Compatibilidade / zero regressão

- Sem `--vertical` = 16:9 como hoje.
- Filler removal conservador (só isolado) — se não achar vício, keeps inalterados.
- Punch-in só com `--zoom auto` (já é o default) e só preenche buracos — não altera os zooms de clique.
- Intro morta só avança o início quando há silêncio antes da fala; vídeo que já começa falando = sem efeito.

## Critério de sucesso

`/editar-video` remove vícios isolados (dry-run mostra quantos), gera vertical 9:16 com
`--vertical`, insere punch-in nos trechos longos sem clique, e nunca deixa intro morta. Sem as
flags/sem vício, comporta-se como antes. Testes das funções puras verdes.

## Fora de escopo (futuro)

- Reframe 9:16 com bolha de webcam como rosto (quando o dono usar webcam).
- Reframe dinâmico seguindo cursor/clique.
- B-roll por palavra-âncora (item médio do backlog, lote próprio).
- Filler removal agressivo (no meio de frase) — v1 é conservador (só isolado).
