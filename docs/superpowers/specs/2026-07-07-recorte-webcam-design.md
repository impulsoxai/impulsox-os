# Fase 5 — Recorte de webcam sem fundo (substitui a bolha)

> PRD-mãe: gravação-movimento (Recordly). Fases 1-4 feitas (velocidade, /gravar-tela,
> auto-zoom clean-room, bolha redonda+sombra). Esta é a Fase 5.

## Contexto e motivação

A dona viu a bolha redonda (Fase 4) e não gostou. Quer o formato que o Matt Ganzak usa
nos treinamentos: tela cheia de fundo + **rosto recortado (fundo REMOVIDO, sem moldura,
sem sombra)** no canto inferior direito. Sem OBS — tudo dentro do pipeline headless
ffmpeg que já existe (`/gravar-tela` → `/editar-video`).

## Decisão de escopo (confirmada com a dona)

- Roda como **pós-processo dentro do `/editar-video`**, não muda `/gravar-tela`.
- **Aceita o tempo de processamento** (é CPU, sem GPU) — sem otimização de velocidade
  nesta fase; só um aviso claro de progresso.
- A **bolha redonda é REMOVIDA do sistema** — `--webcam` passa a SER o recorte sem
  fundo. Não fica como opção paralela. Simplifica a superfície da skill.
- **Setup automático**: primeira vez que `--webcam` for usado, o sistema verifica se
  `backgroundremover` está instalado; se não, instala sozinho (pip).
- **Mesma posição/tamanho da bolha antiga** — reaproveita `posicaoOverlay` e os
  parâmetros `--canto`/`--bolha-tamanho`/`--margem` que já existem. Só troca COMO o
  recorte é feito (silhueta real via IA, não círculo geométrico).
- **Sem fallback automático.** Se o recorte sair ruim (cabelo, borda), a dona vê no
  resultado e decide (regravar/ajustar). Sem detecção de qualidade nem retorno pra bolha
  (a bolha nem existe mais).

## Arquitetura

Dois estágios, mantendo a separação "função pura testável" vs "orquestração":

**Estágio 1 — Recorte (novo, fora do ffmpeg, script Python via CLI)**
`backgroundremover` (pacote Python, `pip install backgroundremover`) processa
`webcam.mp4` inteiro e gera um `.mov` com canal alpha (fundo transparente):
```
python -m backgroundremover.cmd.cli -i webcam.mp4 -mk -o webcam-recorte.mov
```
Isso roda ANTES do ffmpeg de composição — é um passo prévio, não um filtro ffmpeg.

**Estágio 2 — Composição (adaptação do filtro existente)**
`filtroBolhaWebcam` é substituído por `filtroRecorteWebcam`: em vez de gerar a máscara
circular via `geq`, o recorte já vem com alpha pronto do Estágio 1 — o filtro só
escala/posiciona e faz overlay (mais simples que o atual, perde a geração de máscara
E a sombra). `posicaoOverlay` é reaproveitado sem mudança.

```
lib-edicao.mjs:
  filtroBolhaWebcam(...)         → REMOVIDA
  filtroRecorteWebcam(...)       → NOVA: escala o recorte (com alpha) + overlay na
                                    posição (sem geq de máscara, sem sombra)
  posicaoOverlay(...)            → reaproveitada sem mudança

lib-recorte.mjs (NOVO):
  comandoRecorte(webcamPath, saidaPath)  → pura: monta o comando CLI do backgroundremover
  backgroundremoverInstalado()           → verifica se o comando existe no PATH
  instalarBackgroundremover()            → roda pip install (efeito colateral, não-pura)

editar-video.mjs:
  --webcam <arq> agora:
    1. verifica/instala backgroundremover (1ª vez)
    2. roda o recorte (Estágio 1) → webcam-recorte.mov temporário, com aviso de
       progresso ("recortando fundo, pode levar alguns minutos...")
    3. compõe com filtroRecorteWebcam (Estágio 2), como hoje faz com filtroBolhaWebcam
  --canto / --bolha-tamanho / --margem seguem existindo, mesmo comportamento de posição
```

## Fluxo de erro

- `backgroundremover` não instala (sem pip/rede) → aviso claro, aborta ANTES de gastar
  tempo com o ffmpeg; a dona resolve o ambiente e roda de novo.
- Recorte roda mas o vídeo final sai com problema visual → não é erro de sistema (o
  comando terminou com sucesso); a dona vê no resultado e decide. Sem retry automático.
- `webcam-recorte.mov` intermediário: mantido em `canal-youtube/gravacoes/<slug>/`
  junto dos outros arquivos crus (não é temp descartável) — permite reeditar sem
  re-rodar o recorte pesado (aproveita o cache "de graça", já que o arquivo já existe
  na pasta do job; não precisa de lógica de cache explícita, é só não deletar).

## Testes

- Puras: `comandoRecorte` (monta comando certo), `filtroRecorteWebcam` (filtergraph
  correto, overlay na posição certa, sem geq/sombra).
- Integração/smoke real (como as Fases 2-4): rodar num vídeo curto de teste no
  hardware da dona, conferir que o MP4 final tem o recorte visível no canto, sem fundo,
  sem círculo, sem sombra.

## Fora de escopo (fica pra depois se virar dor)

- Otimização de velocidade do recorte (GPU/modelo leve).
- Ajuste de proporção do recorte (segue o quadrado da bolha antiga por ora).
- Qualquer lógica de fallback/qualidade automática.
