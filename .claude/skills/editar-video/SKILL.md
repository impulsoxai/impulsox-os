---
name: editar-video
description: >
  Use pra editar a gravação crua do vídeo do canal YouTube — "/editar-video", "edita esse
  vídeo", "corta o silêncio e põe legenda", "monta o vídeo pra subir", ou depois de gravar
  a tela seguindo um roteiro do /roteiro-yt. Corta silêncio, normaliza o áudio (-14 LUFS),
  gera legenda karaokê queimada + .srt, cola intro/outro da marca, renderiza o long-form
  16:9 e monta a thumbnail.
---

# /editar-video — Edição automática do long-form

Transforma a gravação crua em vídeo publicável sem horas de edição. Automatiza o que é
regra (corte de silêncio, normalização de áudio, legenda, intro/outro, render, thumbnail);
o que é direção criativa fica com o dono. Trabalha sobre a gravação real, não sobre os
timestamps do roteiro (o corte muda os tempos).

Autoria: ImpulsoX AI. Conteúdo original.

## Princípio — copiar a fórmula de quem já faz sucesso

Não inventar estilo de edição/legenda do zero. Canais que já bombam no nicho **já têm a
fórmula testada** — copiar o MOLDE (tamanho/posição/cor de legenda, ritmo de corte, padrão
de capa), nunca o conteúdo. As referências vivem em `canal-youtube/criadores-monitorados.md`;
puxe um short recente de um deles e replique a mecânica. Ex.: a legenda karaokê com palavra
ativa em cor (dourado da marca) saiu direto do padrão de Chase/Matt/Yury (eles usam vermelho/
branco). Molde transfere; tema e identidade são sempre da marca do dono.

## Pré-checagem

1. **A gravação existe?** Pedir o caminho do arquivo (um .mp4 com tela+voz, ou tela + voz
   separados). Sem arquivo, não há o que editar. **Gravação feita com `/gravar-tela`:**
   `tela.mp4` NÃO tem áudio (a voz fica só no `webcam.mp4`) — sempre passar `--voz
   <webcam.mp4>` junto, senão o vídeo final sai mudo (legenda funciona sem isso, mas o som não).
2. **ffmpeg e whisper instalados?** Na primeira falha, guiar a instalação (ffmpeg pro
   render; whisper local pra legenda). Sem whisper, o vídeo sai sem legenda queimada — avisar.
   `WHISPER_BIN` no `.env` aponta o exe quando o `whisper` não está no PATH.
3. **Slug do vídeo?** Nome curto pra pasta de saída (`canal-youtube/edicao/<slug>/`).

## Fluxo

1. **Dry-run primeiro.** Rodar `node scripts/editar-video.mjs --video <arq> --slug <slug>`
   (sem `--confirmar`) — mostra o plano: duração depois do corte, nº de cortes, % removido.
   Traduzir pro dono em linguagem simples ("vou tirar 1min30 de pausas, sobra 8min").
   - Gravação com **ruído de fundo** (ar-condicionado, rua) e o corte não pegou nada?
     Subir o limiar com `--limiar-db -25` (menos negativo = mais sensível). Default `-30`.
   - Ajustar o tamanho mínimo da pausa cortada com `--min-silencio 1.2` (default `0.8`s).
2. **Com OK, renderizar.** Rodar de novo com `--confirmar`. Gera `final.mp4` (silêncio
   cortado, **áudio normalizado a -14 LUFS** — padrão do YouTube, tira o som amador —
   **legenda karaokê queimada** palavra-a-palavra) + `legenda.srt` (pro YouTube CC), em
   `canal-youtube/edicao/<slug>/`.
3. **Capa — depende do FORMATO (não confundir):**
   - **Short / reel (vertical 9:16):** NÃO tem capa separada. A "thumbnail" é o próprio
     frame do vídeo com a legenda karaokê queimada (o que o passo 2 já entrega). É o que
     Chase/Matt/Yury e os shorts que retêm fazem. Só ajudar o dono a escolher um bom frame
     (rosto enquadrado, olhar na câmera) — não gerar capa composta nenhuma.
   - **Vídeo longo (horizontal 16:9):** aí sim tem capa 16:9 separada — **chamar a
     `/thumbnail`** (consultor de CTR: 3 conceitos capa+título, Four C's, crivo de nota,
     gera on-brand ou por IA). É ela que orquestra o `gerar-thumbnail.mjs` e pontua a capa.
     A capa decide o clique; não tratar como rabicho da edição.
4. **Revisar antes de declarar pronto.** Rodar `/revisar` no vídeo (crivo do revisor
   sênior) — é peça que vai pro ar. Só depois apontar os arquivos finais como prontos pro
   upload (Fase 3).

## Edição por trechos — acelerar, cortar, manter (call longa → highlight)

Além do corte de silêncio, o vídeo pode ser editado **por trechos**: cada pedaço ganha
**uma ação** — *acelerar* (1,5x/2x/4x), *cortar fora* (remove de vez), ou *manter 1x*. É o
que transforma uma call de 1h num conteúdo postável de ~11min: corta a intro, acelera a
enrolação, mantém em 1x só o que importa.

**Como o dono informa os trechos** — dois jeitos, os dois valem:
- **Linguagem natural** ("corta os 2 primeiros minutos, acelera de 8 a 35 em 2x, deixa o
  resto normal"). O assistente traduz pro plano e mostra no dry-run pra confirmar.
- **Tabela de tempos** (cada linha `<início>-<fim> <ação>`):
  ```
  00:00-02:00 cortar
  02:00-08:00 manter
  08:00-35:00 2x mudo
  35:00-40:00 1.5x voz
  ```
  Separador `-`, `–` ou `a`; tempo `mm:ss` ou `hh:mm:ss`; áudio `voz` (preserva o tom, sem
  voz de esquilo) ou `mudo` (trecho acelerado sem som — bom pra espera/digitação). Sem
  áudio especificado = `voz`.

O plano vira um `plano-edicao.json` (`{ "trechos": [...] }`) passado com `--plano <arquivo>`.

**Fluxo:** o dono fala → **dry-run** mostra o plano em número (`velocidade.duracaoFinal`,
quanto reduziu, avisos) → o dono aprova ou ajusta → render com `--confirmar`. O dry-run
**avisa** quando um trecho acelera acima de 2x **com voz** ("pode ficar difícil de
entender"), mas obedece — a decisão é do dono.

**Velocidade sem trava.** Qualquer fator. Acima de 2x com voz, só o aviso.

**Gravação ≠ edição.** O render **sempre gera um `final.mp4` novo** — o arquivo cru NUNCA é
sobrescrito. Errou o plano? Roda de novo com outro; o original está sempre lá. Reeditável
quantas vezes quiser.

**Corte de silêncio é opcional.** Pra **live de ensino** (onde a pausa do professor é
proposital), usar `--sem-corte-silencio` — o silêncio fica intacto e só a velocidade/cortes
do `--plano` rodam. (Default segue cortando silêncio, caso comum.)

> Ordem do pipeline: corte de silêncio **primeiro**, velocidade **depois**. Detalhe técnico
> conhecido: os tempos dos trechos batem com o vídeo cru quando o silêncio NÃO é cortado
> (`--sem-corte-silencio`); com o corte ligado, a linha do tempo encurta antes da
> velocidade. Pra precisão cirúrgica de tempo numa call, usar `--sem-corte-silencio`.

> **Limite conhecido — gravação do `/gravar-tela` (tela + voz separados):** o corte de
> silêncio analisa o `--video` (a tela, sem áudio), não o `--voz` — nesse fluxo ele nunca
> encontra silêncio pra cortar (`cortos: 0` sempre). Pra esse caso, usar
> `--sem-corte-silencio` (o áudio externo ainda entra certo no final, só não corta pausas).
> Corrigir isso de vez (detectar+cortar pela trilha de voz, sincronizado) é melhoria futura.

## Auto-zoom (zoom automático nos cliques)

Se a gravação foi feita com o `/gravar-tela` (que registra os cliques no `telemetria.json`),
o vídeo pode ganhar **zoom automático** nos pontos onde você clicou — sem você marcar nada.

**Como:** depois de gravar, rode `node scripts/zoom-regioes.mjs --slug <nome>` (gera o
`regioes-zoom.json` — o cérebro decide onde dar zoom). Depois o `/editar-video` aplica:
- `--zoom auto` (default) — aplica o zoom seco nos cliques, com **limites anti-tontura**
  (zoom só em cluster de cliques que dura ≥1.5s, espaçados ≥4s, nível discreto 1.4x).
- `--zoom nao` — desliga o auto-zoom.

**O dry-run lista os zooms** ("zoom em 1:30, 3:00…") ANTES de renderizar — você confere e
**poda** os que não quer (editando o `regioes-zoom.json` à mão, ou pedindo pra tirar).

**Controle manual ao vivo (mirar o zoom enquanto grava) não existe aqui** — isso precisa de
preview em tempo real, fora do pipeline headless. Pra zoom manual ao vivo, use o **Recordly**
direto e jogue o `.mp4` no `/editar-video`. O auto cobre o caso comum sem você precisar ver
nada durante a gravação.

> Limite conhecido: o auto-zoom usa os tempos da telemetria (do vídeo cru). Se você também
> cortar silêncio/acelerar trechos, os tempos podem deslocar — pra auto-zoom preciso, edite
> sem `--plano`/corte, ou confira os tempos no dry-run.

## Bolha de webcam (rosto + tela)

Se você gravou com o `/gravar-tela` (que salva `tela.mp4` e `webcam.mp4` separados), dá pra
sobrepor a webcam como **bolha redonda no canto**, com sombra suave — o formato "rosto + tela".

**Como:** passe `--webcam <caminho do webcam.mp4>` no `/editar-video`. Sem essa flag, nenhuma
bolha (vídeo normal).

**Ajustes (todos opcionais, com bom default):**
- `--canto ir` (default) — onde fica: `ir` inferior-direito · `il` inferior-esquerdo ·
  `sr` superior-direito · `sl` superior-esquerdo.
- `--bolha-tamanho 0.2` — fração da largura (0.2 = 20% da tela). Maior = bolha maior.
- `--margem 40` — distância da borda, em pixels.

**O áudio é o da TELA (sua narração), não o da webcam** — evita áudio duplicado/eco. A bolha
fica fixa no canto o vídeo todo (não dá zoom junto com o auto-zoom — é uma camada por cima).

## Retenção: vícios de fala, vertical, punch-in, intro morta

Quatro automações que separam edição amadora de profissional (pesquisa OpusClip, 13.5M clips):

- **Vícios de fala removidos** — "é", "tipo", "né", "então" ditos ISOLADOS (entre pausas) são
  cortados junto com o silêncio. Conservador: nunca corta um "tipo" no meio de frase. O dry-run
  mostra quantos saíram.
- **Vertical (`--vertical`)** — gera o short em 9:16 (1080x1920) com crop central (pega a faixa
  do meio). Sem a flag, sai 16:9 como antes. (Reframe com rosto/webcam = refinamento futuro.)
- **Punch-in automático** — em trechos longos sem clique (>12s parado), entra um zoom suave
  (1.15x, ~2.5s) pra resetar a atenção. Só preenche os buracos; onde já há zoom de clique, mantém.
- **Intro morta cortada sempre** — se o vídeo começa com silêncio antes da 1ª fala, esse pedaço
  é removido mesmo com `--sem-corte-silencio` (a pausa do meio pode ser proposital; a intro morta
  nunca). Hook colado no começo retém mais.

## Templates de marca

`canal-youtube/edicao/templates/intro.mp4` e `outro.mp4` (opcionais) entram em todo vídeo.
Sem eles, o vídeo sai sem bumper — avisar uma vez e seguir.

## Regras

- Dry-run antes de renderizar — o dono vê quanto vai cortar antes de gastar tempo de CPU.
- Corte só de silêncio (determinístico) — nunca decide o que é "erro" de fala. Sensibilidade
  ajustável (`--limiar-db`, `--min-silencio`); o pipeline já põe folga nas bordas pra não
  cortar respiração/ataque de palavra.
- Áudio sempre normalizado a -14 LUFS (padrão YouTube) — não é opcional, é o que separa som
  amador de profissional.
- Legenda queimada é **karaokê** (destaque palavra-a-palavra, mais retenção), usando os
  timestamps que o whisper já entrega; o `.srt` sai junto pro CC do YouTube.
- Custo Fal (thumbnail por IA) só com confirmação explícita; a versão frame+texto é grátis.
- Legenda local (whisper) tem custo zero. Falhou a transcrição → vídeo sai sem legenda
  queimada, com aviso — não trava o render.
- Peça vai pro ar → passa por `/revisar` antes de ser declarada pronta. Esta skill entrega
  o arquivo revisável, não publica.
