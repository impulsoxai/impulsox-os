---
name: gravar-tela
description: >
  Use pra gravar a tela do computador com a câmera e a voz — "/gravar-tela", "grava
  minha tela", "grava a apresentação", "captura de tela com webcam", "vou gravar um
  tutorial/aula/call". Captura tela + voz do microfone + webcam em arquivos crus
  separados, com o dono controlando início e fim. A saída entra direto no /editar-video
  (corta silêncio, acelera, legenda).
---

# /gravar-tela — Captura de tela + voz + webcam

Tampa o passo zero do canal: gravar. Antes desta skill, o pipeline assumia que a gravação
já existia (feita por ferramenta de fora). Agora o sistema grava — tela, voz do microfone e
webcam — em **arquivos crus e separados**, prontos pra edição.

Autoria: ImpulsoX AI. Conteúdo original. Windows.

## Quem controla a gravação

**O dono.** O sistema não fica segurando a gravação por 40 minutos enquanto você apresenta —
você dispara o início e o fim por comando. O script faz o resto (ffmpeg + dispositivos).

## Como usar

**É um comando só, que fica aberto enquanto você grava:**
```
node scripts/gravar-tela.mjs iniciar --slug minha-aula
```
- **Primeira vez:** lista as webcams e os microfones conectados; você escolhe pelo número.
  A escolha fica salva no `.env` — nas próximas vezes ele grava direto, sem perguntar.
- Aparece `🔴 gravando em 'minha-aula'. Aperte ENTER pra parar.` Agora é só apresentar/falar/
  mostrar a tela.
- **Pra parar:** volte nesse terminal e **aperte ENTER**. Ele finaliza os arquivos
  (fecha o vídeo direitinho) e sai:
  `canal-youtube/gravacoes/minha-aula/tela.mp4` + `webcam.mp4`.

> Por que ENTER no mesmo terminal, e não um comando "parar" separado? No Windows, só dá pra
> fechar um vídeo do ffmpeg sem corromper o arquivo mandando o sinal de parada pelo mesmo
> processo que está gravando. Por isso o comando fica aberto: quem grava é quem para. Não
> feche o terminal no X (isso trunca o arquivo) — use o ENTER.

## O microfone (interno OU separado)

A escolha do mic é sempre da **lista** — pega o microfone interno do notebook **ou** um
microfone USB separado, o que você escolher. Se você plugou um mic separado, ele aparece na
lista; escolha ele.

- **Trocou de mic** (plugou outro, mudou de porta USB)? Rode com `--reconfigurar` pra
  escolher de novo: `node scripts/gravar-tela.mjs iniciar --slug x --reconfigurar`.
- Se o mic salvo **não estiver conectado** na hora (desplugado, porta trocada), o script
  **avisa e mostra a lista de novo** — não trava com erro.

## Por que tela e webcam saem separados

`tela.mp4` e `webcam.mp4` vêm crus e separados de propósito: a **bolha** da webcam (canto,
tamanho, redondo, sombra) é montada depois, na edição, onde você pode mudar de ideia sem
regravar. Grava cru → decide na revisão. (A composição da bolha é a Fase 4.)

## Próximo passo

Gravou? → **`/editar-video`** pega o `tela.mp4` (e o `webcam.mp4`) e faz o resto: corta
silêncio, acelera os trechos chatos, legenda. A gravação é só a matéria-prima.

## Regras

- **Windows.** Usa captura nativa do Windows (`gdigrab` pra tela, `dshow` pra webcam/mic).
  macOS/Linux ficam pra depois.
- **Nada é decidido na gravação** além de qual dispositivo. Velocidade, corte, bolha — tudo
  na edição. A gravação só captura o cru, intacto.
- **Áudio do sistema** (o som que sai do PC — vídeo tocando, a outra pessoa numa call pelo
  computador) ainda **não** entra; é a Fase 2.1. Por ora, grava tela + sua voz + sua webcam.
- **Telemetria do cursor** (pro auto-zoom automático nos cliques) entra na Fase 3. As
  gravações de agora não têm esse dado; quando o auto-zoom existir, grava-se de novo com ele.
- Os arquivos de gravação **não sobem pro GitHub** (são grandes — ficam só na máquina).