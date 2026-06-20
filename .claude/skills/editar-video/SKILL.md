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
   separados). Sem arquivo, não há o que editar.
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
