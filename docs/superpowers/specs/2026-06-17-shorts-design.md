# Vídeo longo → Shorts (Fase 2.5) — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-17 · Autoria: ImpulsoX AI.
> Fase 2.5 do canal YouTube (Fase 2 = edição, Fase 3 = upload). É o repurpose tipo Blotato.

## Problema

A Sabrina (maior referência) faz 1 vídeo longo/semana e repurposa em vários shorts diários.
O ImpulsoX-OS edita o longo (Fase 2) mas não corta os shorts. Esta fase pega o `final.mp4`
longo (16:9) e gera vários shorts verticais (9:16, ≤30s) com legenda karaokê — o motor de
repurpose que falta pra fechar o ciclo do vídeo e bater o que o Blotato vende.

## Escopo

- **No escopo:** a partir do `final.mp4` longo + a transcrição da Fase 2, achar os trechos
  (marcador `[CORTE-SHORT]` do roteiro OU análise da IA aprovada pelo dono), cortar cada
  um (≤30s), reenquadrar pra 9:16 (`--crop` ou `--split`), recortar as palavras do trecho e
  queimar a legenda karaokê. Saída: `shorts/short-N.mp4` prontos pro `/publicar`.
- **Fora (fases próprias):** transcrever de novo (reusa a do longo); upload (Fase 3 já
  detecta short); legenda automática de momentos virais por ML; tracking de rosto/objeto
  pra crop dinâmico (crop é central fixo por ora).

## Decisões (do brainstorming)

1. **Seleção dos trechos: os dois caminhos.** Marcador `[CORTE-SHORT: mm:ss-mm:ss — razão]`
   do roteiro quando o vídeo veio de roteiro nosso; sem marcador, a IA lê a transcrição e
   propõe os cortes (aplicando a fórmula da Sabrina), o dono aprova, e os cortes aprovados
   entram via `--cortes "mm:ss-mm:ss,..."`.
2. **Reenquadre escolhido por vídeo:** `--crop` (faixa central vertical — talking-head/tela
   centralizada) ou `--split` (vídeo 16:9 no topo, faixa da marca embaixo, legenda grande —
   screen-recording onde tudo importa). Default `--crop`.
3. **Todos os trechos viram short, cada um ≤30s** (padrão Sabrina: curto força clareza).
   Trecho marcado > 30s é cortado em 30s com aviso.
4. **Legenda reusa a transcrição do longo** — recorta as palavras do trecho e rebaseia o
   timestamp pra zero; mesmo motor `montarASS`/glossário da Fase 2. Não transcreve de novo.
5. **Reuso máximo de `lib-edicao.mjs`** (montarASS, filtroLegendaAss, glossário, escape).
   Script orquestrador novo; não inflar `editar-video.mjs`.

## Pré-requisito (ajuste mínimo na Fase 2)

O `editar-video.mjs` hoje salva `legenda.srt` e `_karaoke.ass`, mas **não** salva as
palavras com timestamp em formato limpo. A Fase 2.5 precisa delas. Ajuste: o
`editar-video.mjs` passa a gravar também **`palavras.json`** (`[{inicio, fim, texto}]`, já
com glossário aplicado) ao lado do `final.mp4`. Uma linha de `writeFileSync`. A Fase 2.5 lê
esse arquivo; sem ele (vídeo antigo), cai pro modo que re-transcreve com aviso.

## Arquitetura

### 1. `scripts/lib-shorts.mjs` (novo — funções puras, ZERO deps, testáveis sem ffmpeg)

- `parseTempo("mm:ss")` → segundos (aceita `m:ss` e `h:mm:ss`).
- `acharCortesPorMarcador(roteiroTexto)` → lista `{inicio, fim, razao}` das linhas
  `[CORTE-SHORT: mm:ss-mm:ss — razão]`. Lista vazia se não houver marcador.
- `limitar30s({inicio, fim})` → `{inicio, fim}` com `fim` no máximo `inicio+30`.
- `recortarPalavras(palavras, inicio, fim)` → palavras cujo tempo cai em [inicio, fim],
  com `inicio`/`fim` **rebaseados** (subtrai `inicio` do trecho, pra a legenda começar em 0).
- `filtroReenquadreCrop({ largura, altura, alvoLargura = 1080, alvoAltura = 1920 })` →
  filtro ffmpeg: escala pra cobrir a altura e crop central na largura 9:16.
- `filtroReenquadreSplit({ largura, altura, alvoLargura = 1080, alvoAltura = 1920, fundoCor = "0x06060D" })`
  → filtro: vídeo 16:9 escalado pra largura alvo, colado no topo sobre fundo da marca 9:16
  (sobra embaixo pra legenda).

### 2. `scripts/gerar-shorts.mjs` (novo — orquestrador, dry-run/`--confirmar`)

- **Entrada:** `--slug <longo>` (acha `canal-youtube/edicao/<slug>/final.mp4` + `palavras.json`
  + o roteiro pra marcadores) OU `--video <mp4> --palavras <json>`. `[--cortes "mm:ss-mm:ss,..."]`
  (cortes propostos pela IA quando não há marcador), `[--reenquadre crop|split]` (default crop),
  `[--confirmar]`.
- **Seleção dos trechos:**
  1. Se o roteiro do slug tem `[CORTE-SHORT]` → `acharCortesPorMarcador`.
  2. Senão, se veio `--cortes` → usa esses (os que a IA propôs e o dono aprovou).
  3. Senão (dry-run) → imprime a transcrição/aviso pra a IA propor; não corta.
- **Por trecho (com `--confirmar`):** `limitar30s` → corta o clipe (ffmpeg `-ss`/`-to`) →
  reenquadra (`filtroReenquadreCrop`/`Split`) → `recortarPalavras` → `montarASS` (estilo
  short, fonte/cores da marca) → queima karaokê (`filtroLegendaAss`) → salva
  `canal-youtube/edicao/<slug>/shorts/short-<N>.mp4`. Áudio do trecho copiado (já normalizado
  no longo).
- **Dry-run (default):** lista os trechos (N, tempos, razão, duração após limitar30s, reenquadre)
  sem renderizar.
- `registrar-passo` por short gerado; resultado em JSON `{ ok, slug, shorts: [...] }`.

### 3. Skill `/shorts` (nova)

- Orquestra em linguagem de leigo. Fluxo:
  1. Confere `final.mp4` + `palavras.json` do slug (senão, orienta rodar `/editar-video`).
  2. Tem `[CORTE-SHORT]` no roteiro? → dry-run lista os cortes.
  3. Sem marcador? → a IA lê `palavras.json`/transcrição, **propõe os trechos fortes**
     (hook/punch/número, fórmula da Sabrina em `canal-youtube/formulas-video.md`), mostra
     pro dono aprovar; com OK, monta o `--cortes`.
  4. Pergunta reenquadre (crop/split) conforme o conteúdo.
  5. `--confirmar` → gera os shorts. Aponta os arquivos e sugere `/publicar` (já detecta short).
- Princípio do CLAUDE.md: copiar a fórmula de quem já faz sucesso (cada corte segue o molde
  de short que retém).

## Dados / fluxo

`final.mp4` (longo) + `palavras.json` (Fase 2) → cortes (marcador OU IA aprovada) → por
trecho: corte + reenquadre + recorte de palavras + karaokê → `shorts/short-N.mp4` →
`/publicar` (detecta short, sobe privado).

## Tratamento de erro (PT-BR, acionável)

`final.mp4` não existe → orientar `/editar-video` · `palavras.json` ausente → avisar e
sugerir re-rodar a Fase 2 (ou modo re-transcreve) · sem marcador e sem `--cortes` → modo
análise (não corta, pede proposta da IA) · trecho > 30s → corta em 30s com aviso · trecho
fora da duração do vídeo → pula com aviso · ffmpeg ausente → guia. Falha de um short não
derruba os outros (gera os que der, reporta o que falhou).

## Testes

- **Funções puras (sem ffmpeg, fixtures):** `parseTempo` (m:ss, h:mm:ss); `acharCortesPorMarcador`
  (extrai N marcadores; vazio sem marcador); `limitar30s` (corta > 30s, mantém ≤30s);
  `recortarPalavras` (filtra a janela + rebaseia timestamp pra zero); `filtroReenquadreCrop`
  e `filtroReenquadreSplit` (string de filtro esperada).
- **Orquestrador dry-run:** lista os trechos sem renderizar (mockar ffmpeg). Nenhum teste
  renderiza vídeo.
- **Ajuste Fase 2:** teste de que `editar-video` grava `palavras.json` (pode ser via a
  função pura que monta o conteúdo, sem rodar whisper).

## Critério de pronto

- `gerar-shorts.mjs` transforma `final.mp4` longo em vários `short-N.mp4` (9:16, ≤30s,
  karaokê), por marcador OU por cortes aprovados pela IA. Dry-run lista; `--confirmar` gera.
- Reenquadre `--crop` e `--split` funcionam.
- Legenda reusa `palavras.json` (recorte + rebase), sem re-transcrever.
- `editar-video.mjs` passa a salvar `palavras.json`.
- `lib-shorts.mjs` coberto por testes de função pura.
- Skill `/shorts` no fluxo; erros em PT.
- Testes verdes sem renderizar vídeo.

## Fora de escopo (YAGNI)

- Tracking de rosto/objeto pra crop dinâmico (crop central fixo).
- Detecção de momento viral por ML (a IA propõe lendo a transcrição).
- Re-transcrição como caminho principal (só fallback se faltar `palavras.json`).
- Capa/thumbnail de short (short usa o próprio frame — já decidido).
- Upload dos shorts (Fase 3 cobre).
