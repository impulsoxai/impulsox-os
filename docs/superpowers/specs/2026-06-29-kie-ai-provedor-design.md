# kie.ai como provedor alternativo — design

> ImpulsoX AI · 2026-06-29

## Contexto

Hoje `gerar-imagem.mjs`, `gerar-video.mjs` e `gerar-avatar.mjs` chamam fal.ai
direto. kie.ai é uma camada multimodelo concorrente com preço melhor em vários
modelos (Veo 3.1 ~61% mais barato, Kling empata, Nano Banana/GPT Image
competitivo) e cobre os mesmos modelos usados hoje (Kling, Seedance, Nano
Banana, OmniHuman, Kling AI Avatar). Não cobre 3D (Meshy) — não confirmado no
catálogo kie.ai.

Objetivo: ter os dois provedores disponíveis, escolha manual por chamada,
decidida pelo preço do momento — sem trocar fal por kie, sem automatizar a
escolha.

## Escopo

Entram: `gerar-imagem.mjs`, `gerar-video.mjs`, `gerar-avatar.mjs`.
Fora: `gerar-3d.mjs`, `riggar-3d.mjs` (sem modelo 3D confirmado no kie.ai),
`lib-fal-upload.mjs`/`publicar-instagram.mjs`/`publicar-facebook.mjs` (usam
fal só como CDN de hospedagem, não geração — fora do que kie.ai resolve melhor).

## Decisões

- **Flag manual `--provedor fal|kie`**, default `fal`. Sem flag global, sem
  escolha automática por preço — usuário decide olhando a tabela.
- **`--dry-run` e `--precos` sempre mostram fal vs kie lado a lado**, mesmo
  quando `--provedor` foi passado — é a forma de decidir.
- **Sem fallback automático.** Se `--provedor kie` falhar (chave ausente, erro
  de API), o script erra e para. Nunca cai pro fal silenciosamente — evita
  cobrança no provedor errado sem o usuário saber.
- **Chave nova `KIE_KEY`** no `.env` (ao lado de `FAL_KEY`), nunca aparece em
  log/erro (mesma regra do FAL_KEY hoje).

## Arquitetura

### lib-provedor-midia.mjs (nova)

Isola tudo que difere entre fal e kie, pra cada script não duplicar polling/auth:

```
submeterTarefa({ provedor, kieModel, kieInput, falEndpoint, falPayload, kieEndpointBase })
  → { taskId, statusUrl, resultUrl, provedor }

aguardarResultado(handle, { timeoutMs })
  → { resultUrls: [...] }  // normalizado, independe do provedor

uploadReferencia(caminhoLocal, provedor)
  → url pública (reusa uploadParaFalCDN se fal; nova uploadParaKieAPI se kie)
```

Cada script monta o payload específico do modelo (como já faz hoje pro fal) e
passa pra lib só a parte que muda por provedor: endpoint, body, e como extrair
o resultado.

### Diferenças fal vs kie (confirmadas via docs.kie.ai)

| | fal.ai | kie.ai |
|---|---|---|
| Header auth | `Authorization: Key <FAL_KEY>` | `Authorization: Bearer <KIE_KEY>` |
| Submit (modelos gerais) | `POST {base}/{model-path}` | `POST https://api.kie.ai/api/v1/jobs/createTask`<br>body `{model, input, callBackUrl?}` |
| Submit (Veo, caso especial) | `POST {base}/fal-ai/veo3/...` | `POST https://api.kie.ai/api/v1/veo/generate`<br>body `{prompt, model, imageUrls?, aspect_ratio, resolution, duration}` |
| Poll (geral) | `GET {statusUrl}` → campo `status` (COMPLETED/FAILED) | `GET /api/v1/jobs/recordInfo?taskId=` → campo `state` (waiting/queuing/generating/success/fail) |
| Poll (Veo) | — | `GET /api/v1/veo/record-info?taskId=` → campo `successFlag` (0/1/2/3) |
| Resultado | `video.url` / `images[0].url` (varia por modelo) | `resultJson` (string JSON) → parse → `{resultUrls: [...]}` |
| Referência/imagem de entrada | data URI (base64) direto no payload | **só URL pública** — precisa upload prévio |
| Upload de arquivo local | `lib-fal-upload.mjs` (CDN próprio fal) | File Upload API kie.ai (base64/stream/URL; arquivo expira 3 dias) |

### Mapeamento de modelo por script

**gerar-imagem.mjs** — `PRECOS` ganha dimensão de provedor:

| --modelo | fal (atual) | kie (`model` no createTask) | preço kie |
|---|---|---|---|
| nano | `fal-ai/nano-banana-2` | `nano-banana-2` | $0.04–0.09 (1K–4K) |
| nano-pro | `fal-ai/nano-banana-pro` | `nano-banana-pro` | preço a confirmar no dry-run |
| (novo) gpt-image | — | `gpt-image-2` | $0.03–0.08 |
| minimax | `fal-ai/minimax/image-01` | sem equivalente confirmado — kie indisponível pra este modelo | — |

Se `--modelo minimax --provedor kie`: erro claro ("kie.ai não tem minimax — use nano, nano-pro, gpt-image ou troque --provedor fal").

**gerar-video.mjs** — `EP_VIDEO` ganha entrada kie por modelo:

| --modelo | fal (atual) | kie | preço kie |
|---|---|---|---|
| kling | `fal-ai/kling-video/v2.5-turbo/pro/image-to-video` | `kling/v3-turbo-image-to-video` (createTask) | $0.07/s |
| seedance | `fal-ai/bytedance/seedance/v1/pro/image-to-video` | `bytedance/seedance-2` (createTask) | $0.057/s |
| (novo) veo | — | endpoint Veo dedicado (`/api/v1/veo/generate`) | $1.28/vídeo 1080p, $1.85 4K |
| wan, ltx | fal só | sem confirmação no kie — fica fal-only | — |

**gerar-avatar.mjs** — `MODELOS` ganha endpoint kie:

| --modelo | fal (atual) | kie | preço kie |
|---|---|---|---|
| omnihuman | `fal-ai/bytedance/omnihuman/v1.5` | `omnihuman-1.5` (createTask) | a confirmar no dry-run |
| kling-avatar | `fal-ai/kling-video/ai-avatar/v2/pro` | `kling/ai-avatar-pro` (createTask) | a confirmar |
| heygen | `fal-ai/heygen/avatar4/image-to-video` | sem confirmação — fica fal-only | — |

Preços exatos do kie pra omnihuman/kling-avatar/nano-pro não vieram na home
(só os 25 modelos "destaque"); confirmar na página de pricing
(`kie.ai/pricing`) antes de codificar a tabela — não chutar valor.

## Testes

- Unitário: `lib-provedor-midia.mjs` testa montagem de payload e parse de
  resposta para os dois provedores, sem rede (mocka fetch).
- Cada script ganha teste de `--dry-run --provedor kie` confirmando que
  mostra preço dos dois provedores e não chama rede.
- Teste de erro: `--provedor kie` sem `KIE_KEY` falha com mensagem clara, sem
  cair pro fal.

## Fora de escopo (não fazer agora)

- gerar-3d.mjs / riggar-3d.mjs (sem 3D confirmado no kie.ai)
- Qualquer seleção automática de provedor por preço
- Fallback automático fal↔kie em caso de erro
- Migrar lib-fal-upload.mjs (CDN de hospedagem pro publicar-instagram/facebook)