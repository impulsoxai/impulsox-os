---
name: editar-video
description: >
  Use pra editar a gravação crua do vídeo do canal YouTube — "/editar-video", "edita esse
  vídeo", "corta o silêncio e põe legenda", "monta o vídeo pra subir", ou depois de gravar
  a tela seguindo um roteiro do /roteiro-yt. Corta silêncio, gera legenda (queimada +
  .srt), cola intro/outro da marca, renderiza o long-form 16:9 e monta a thumbnail.
---

# /editar-video — Edição automática do long-form

Transforma a gravação crua em vídeo publicável sem horas de edição. Automatiza o que é
regra (corte de silêncio, legenda, intro/outro, render, thumbnail); o que é direção
criativa fica com o dono. Trabalha sobre a gravação real, não sobre os timestamps do
roteiro (o corte muda os tempos).

Autoria: ImpulsoX AI. Conteúdo original.

## Pré-checagem

1. **A gravação existe?** Pedir o caminho do arquivo (um .mp4 com tela+voz, ou tela + voz
   separados). Sem arquivo, não há o que editar.
2. **ffmpeg e whisper instalados?** Na primeira falha, guiar a instalação (ffmpeg pro
   render; whisper local pra legenda). Sem whisper, o vídeo sai sem legenda queimada — avisar.
3. **Slug do vídeo?** Nome curto pra pasta de saída (`canal-youtube/edicao/<slug>/`).

## Fluxo

1. **Dry-run primeiro.** Rodar `node scripts/editar-video.mjs --video <arq> --slug <slug>`
   (sem `--confirmar`) — mostra o plano: duração depois do corte, nº de cortes, % removido.
   Traduzir pro dono em linguagem simples ("vou tirar 1min30 de pausas, sobra 8min").
2. **Com OK, renderizar.** Rodar de novo com `--confirmar`. Gera `final.mp4` +
   `legenda.srt` em `canal-youtube/edicao/<slug>/`.
3. **Thumbnail.** Rodar `node scripts/gerar-thumbnail.mjs --slug <slug> --texto "<=5
   palavras>" --video <arq> --frame <tempo>` → `thumb-frame.png`. Oferecer a alternativa
   por IA (`--fal --conceito "<conceito do /roteiro-yt>"`) — **avisar do custo** e só rodar
   `--confirmar` com o aval do dono.
4. **Apontar os arquivos** e sugerir `/revisar` antes do upload (Fase 3).

## Templates de marca

`canal-youtube/edicao/templates/intro.mp4` e `outro.mp4` (opcionais) entram em todo vídeo.
Sem eles, o vídeo sai sem bumper — avisar uma vez e seguir.

## Regras

- Dry-run antes de renderizar — o dono vê quanto vai cortar antes de gastar tempo de CPU.
- Corte só de silêncio (determinístico) — nunca decide o que é "erro" de fala.
- Custo Fal (thumbnail por IA) só com confirmação explícita; a versão frame+texto é grátis.
- Legenda local (whisper) tem custo zero. Falhou a transcrição → vídeo sai sem legenda
  queimada, com aviso — não trava o render.
- Vídeo é pra ser revisado pelo dono antes do upload — esta skill entrega o arquivo, não publica.
