# Fal.ai — geração de imagem e vídeo (Fases 1+2) — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-14 · Autoria: ImpulsoX AI.

## Problema

O sistema gera imagem por IA com **OpenAI gpt-image** (~$0,04 a $0,17/imagem), e **não
gera vídeo**. Reel hoje é só **roteiro** (texto cena a cena), nunca vira vídeo. A Fal.ai
faz imagem de 13-50x mais barata (FLUX schnell $0,003) e vídeo a centavos/segundo (Wan
$0,05/s), além de destravar uma capacidade nova (vídeo de verdade).

## Escopo

- **Fase 1 — Imagem:** Fal.ai **substitui** o OpenAI no `gerar-imagem.mjs`.
- **Fase 2 — Vídeo + legenda:** pipeline novo de reel (still on-brand → anima → costura →
  legenda → trilha → vertical 1080x1920).
- **Fora de escopo (roadmap):** conector de publicação no TikTok (depende de auditoria
  externa do app, 5-10 dias úteis) e locução de IA / TTS (sincronia voz↔legenda fica pra
  uma fase 2.5).

## Decisões (do brainstorming)

1. **Fal substitui o OpenAI de vez** na imagem (mais enxuto; sem caminho OpenAI).
2. **Trava de marca = prompt + imagem-referência.** Paleta/mood do `marca/design-guide.md`
   injetados no prompt **e** uma imagem-referência da marca condicionando o FLUX.
3. **Áudio do reel = legenda + trilha (música).** Legenda queimada do roteiro + trilha
   royalty-free fornecida. Sem TTS/locução agora.
4. **Modelos default (ajustáveis):** imagem FLUX **schnell** (iterar) → **dev** (final);
   vídeo **Wan 2.5** (default) / **Kling** (premium).

## Arquitetura — 2 scripts + wiring

Princípio: seguir o padrão que já existe (`scripts/*.mjs` com `fetch`, credencial em
`.env`, erros em PT, código aprovado pelo usuário na 1ª execução). Dois scripts com
fronteira clara.

### 1. `scripts/gerar-imagem.mjs` (reescrito — Fal)
- **O que faz:** recebe prompt + caminho de saída + opções, gera PNG via Fal.ai.
- **Entrada:** `prompt` (gerado em inglês — rende melhor), `saida` (caminho do PNG),
  `--modelo` (schnell|dev, default schnell), `--ref` (caminho de imagem-referência da
  marca, opcional), `--mp`/dimensão (default vertical/feed conforme uso).
- **Trava de marca:** o chamador injeta paleta + mood + estilo do `design-guide.md` no
  prompt; quando há `--ref`, usa o endpoint de image-conditioning do FLUX (image-to-image
  / redux / IP-adapter) pra casar o visual.
- **Modelos:** FLUX schnell ($0,003/MP) pra rascunho/iteração; FLUX dev ($0,025) pro final.
- **`.env`:** `FAL_KEY`.
- **Erros (PT, chave nunca em log):** sem chave · chave inválida/sem crédito · rate limit ·
  prompt recusado · falha de rede. A API pode devolver URL ou base64 — tratar os dois.
- **Regra de segurança mantida:** nunca gerar rosto identificável; pessoa reconhecível só
  com foto real autorizada (Modo 2 do `/post`). Aprovação visual obrigatória.
- **Interface estável:** mesma assinatura de uso de hoje, pra `/post`, `/identidade`,
  `/criar-ebook`, `/relatorio`, `/perfil-ig` seguirem chamando sem mudança.

### 2. `scripts/gerar-video.mjs` (novo — pipeline do reel)
- **O que faz:** transforma um roteiro cena a cena num reel vertical legendado.
- **Pipeline:**
  1. Lê o roteiro (do `/post`): lista de cenas, cada uma com `texto` (legenda) e
     `descricao_visual` (prompt da still).
  2. Por cena: gera a **still on-brand** (chama `gerar-imagem.mjs` com paleta + `--ref`).
  3. **Anima** cada still via Fal img2video (Wan 2.5 default / Kling premium), ~5-10s/clipe.
  4. **Costura** os clipes (`ffmpeg concat`).
  5. **Queima a legenda** de cada cena (texto do roteiro; fonte/cor da marca lidas do
     `marca/tokens.css`; posição segura pra 9:16).
  6. **Mixa a trilha** (arquivo de `dados/audio/` do clone; volume ducking simples).
  7. **Exporta** vertical **1080x1920**, H.264, no caminho de saída da peça.
- **Duração:** 15s sai num clipe (Kling 3.0 faz até 15s); 20s = 2 clipes costurados.
- **`.env`:** `FAL_KEY` (mesma chave).
- **Saída:** `producao/posts/<slug>/reel.mp4` (+ os clipes e stills intermediários pra
  reaproveito/depuração).

### 3. Wiring (skills e docs)
- **`/post`:** Modo 3 (imagem) passa a usar a Fal. O **modo reel** deixa de entregar só
  roteiro e passa a **produzir o vídeo** via `gerar-video.mjs` (mantendo o roteiro como
  entrada aprovada antes de gerar).
- **`docs/ferramentas.md`:** trocar o bloco "OpenAI gpt-image" por **Fal.ai (imagem)**;
  adicionar **Fal.ai (vídeo)** e **ffmpeg**.
- **`.env.example`:** trocar `OPENAI_API_KEY` por `FAL_KEY`.
- **Demais skills que usam `gerar-imagem`:** nenhuma mudança (interface estável).

## Guarda de custo + aprovação (regra da casa)

Vídeo é a parte cara. Ordem obrigatória:
1. **Roteiro aprovado primeiro** (humano) — nada de gerar clipe antes do roteiro fechado.
2. Só então **gera os clipes**.
3. **Vídeo final passa por `/revisar`** antes de publicar (regra existente: nada vai ao ar
   sem aprovação humana).
Iteração de imagem usa **schnell** (centavos). Nada caro gera no escuro. Custo de um reel
de 20s ≈ $1,00-1,50 (clipes + stills).

## Dependência nova

- **ffmpeg** — stitch, legenda (drawtext/subtitles), mix de trilha, export vertical.
  Documentar instalação no `ferramentas.md`. Se ausente na execução → erro claro em PT com
  instrução de instalar.
- **Trilha:** arquivo royalty-free fornecido pelo usuário em `dados/audio/` (o `.gitignore`
  já protege `dados/`). O doc lista fontes grátis. Sem API de música (YAGNI).

## Tratamento de erro

- Toda falha em PT-BR, acionável. `FAL_KEY` jamais em log ou mensagem.
- Casos: sem chave · sem crédito · rate limit · prompt recusado · rede · **ffmpeg ausente**
  · referência de marca não encontrada · roteiro mal-formado.
- Vídeo que sai estranho (IA é imprevisível) → o gate `/revisar` pega; regenerar cena é
  barato (só a still + o clipe daquela cena).

## Testes

- **Smoke (sem gastar crédito):** dry-run que valida montagem de payload, parsing do
  roteiro e a chamada do ffmpeg com clipes-stub (cor sólida), sem chamar a Fal.
- **Validação real (1x, barata):** gera 1 imagem (schnell) e 1 clipe curto (~3s), confere
  que os arquivos existem e têm as dimensões certas (PNG e 1080x1920 mp4).
- Cálculo de custo/dinheiro, se exibido, sai de código — nunca estimativa de IA.

## Critério de pronto

- `gerar-imagem.mjs` gera via Fal (schnell/dev), com paleta + `--ref`, erros em PT, sem
  vazar chave.
- `gerar-video.mjs` entrega um `reel.mp4` 1080x1920 legendado e com trilha, a partir de um
  roteiro.
- `/post` Modo 3 usa Fal; modo reel entrega vídeo (após roteiro aprovado).
- `ferramentas.md` e `.env.example` atualizados (Fal + ffmpeg; FAL_KEY).
- Guarda de custo respeitada: roteiro aprovado → gera → `/revisar` → publica.
- Nada de `nucleo/marca/producao` tocado pelo motor; só `.claude/`, `docs/`, `scripts/`,
  `.env.example`.

## Fora de escopo (YAGNI / roadmap)

- Conector de publicação TikTok (Content Posting API + auditoria do app).
- Locução de IA / TTS com sincronia de legenda (fase 2.5).
- LoRA treinado por marca (a referência de estilo já resolve o suficiente agora).
- API de biblioteca de música.
