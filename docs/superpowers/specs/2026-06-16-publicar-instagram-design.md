# Conector de publicação no Instagram — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-16 · Autoria: ImpulsoX AI.

## Problema

O ImpulsoX-OS **decide** (`/calendario`) e **produz** (`/post`) sozinho, mas não
**publica** sozinho. A skill `/publicar` referencia `scripts/publicar-instagram.mjs`, mas
o script não existe — então levar a peça ao ar é manual. Este conector fecha o ciclo no
Instagram: a peça aprovada vira post de verdade, na conta do negócio, com aprovação humana.

## Escopo

- **No escopo:** `scripts/publicar-instagram.mjs` — publica **carrossel, post único e reel**
  via Instagram Graph API, a partir de uma peça do `/post`. Hospedagem da mídia no Fal CDN.
  Trava dry-run + `--confirmar`. Registro em `producao/publicacoes.md` e no feed do painel.
- **Fora (v2/roadmap):** refresh automático de token (a skill guia a renovação manual por
  ora); Stories; publicação no Facebook e LinkedIn (conectores irmãos, mesmo padrão, depois);
  agendamento headless (já desenhado em `docs/headless.md`).

## Decisões (do brainstorming)

1. **Mídia hospedada no Fal CDN** (reaproveita `FAL_KEY` + o fluxo de upload já existente no
   `gerar-avatar.mjs`). URL pública temporária — só precisa estar viva no momento da
   publicação. Zero conta/credencial nova.
2. **Todos os formatos no v1:** carrossel, post único e reel.
3. **Trava dupla:** dry-run por padrão + `--confirmar` pra publicar de verdade (mesmo padrão
   do `gerar-avatar.mjs`); e o `/publicar` exige aprovação humana antes de chamar o script.

## Arquitetura

### 1. `scripts/lib-fal-upload.mjs` (novo — helper compartilhado)
- **O que faz:** `uploadParaFalCDN(caminho) -> URL pública`. Extraído do `uploadArquivo` que
  hoje vive dentro do `gerar-avatar.mjs` (token temporário via `rest.alpha.fal.ai` → upload →
  `access_url`). Mata a duplicação: `gerar-avatar.mjs` passa a importar daqui também.
- **Erros (PT):** sem `FAL_KEY` · auth falhou · upload falhou · sem `access_url`.
- **`FAL_KEY` nunca em log.**

### 2. `scripts/publicar-instagram.mjs` (novo)
- **Entrada:** `--peca <dir> --tipo carrossel|post|reel [--confirmar]`.
  - Detecta a mídia na pasta da peça: `slide-*.png` ordenados (carrossel, 2-10) · 1 `.png`
    (post) · 1 `.mp4` (reel).
  - Legenda = conteúdo de `legenda.md` na pasta.
- **`.env`:** `IG_USUARIO_ID` (conta Professional), `META_TOKEN_PAGINA` (token de página
  longo). A conta IG tem que estar vinculada a uma página do FB, com a permissão
  `instagram_business_content_publish` aprovada no app Meta.
- **Base configurável (testes):** `GRAPH_BASE_URL` (default `https://graph.facebook.com/v21.0`)
  e `FAL_BASE_URL` — pra os testes baterem num mock, nunca na API real.

**Fluxo com `--confirmar`:**
1. Valida env, mídia presente, contagem (carrossel 2-10), legenda não-vazia.
2. Sobe cada mídia pro Fal CDN (`lib-fal-upload`) → URLs públicas.
3. Publica por tipo (Graph API, 2 passos: criar container → `media_publish`):
   - **post:** `POST /{ig}/media` (`image_url`, `caption`) → `media_publish`.
   - **carrossel:** cada filho `POST /{ig}/media` (`image_url`, `is_carousel_item=true`) →
     `POST /{ig}/media` (`media_type=CAROUSEL`, `children`, `caption`) → `media_publish`.
   - **reel:** `POST /{ig}/media` (`media_type=REELS`, `video_url`, `caption`) → pollar
     `GET /{container}?fields=status_code` até `FINISHED` → `media_publish`.
4. Captura `id` publicado + `permalink` (`GET /{id}?fields=permalink`).
5. Registra em `producao/publicacoes.md` (linha de tabela: data · instagram · permalink) e
   emite marcos no feed (`registrar-passo`: "publicando no Instagram" → "publicado: <permalink>").
6. Saída JSON: `{ ok: true, id, permalink, tipo }`.

**Fluxo sem `--confirmar` (default):** valida tudo e imprime o plano (tipo, nº de mídias,
preview da legenda, conta) — **não publica**.

### 3. Wiring
- **`/publicar`:** ajustar a seção de Instagram pra refletir o script real (entrada,
  dry-run/`--confirmar`, registro). A regra de aprovação humana já está lá.
- **`docs/ferramentas.md`:** bloco do conector de publicação Instagram (Graph API + Fal CDN +
  limites + as `.env`).
- **`.env.example`:** já tem `IG_USUARIO_ID`, `META_PAGINA_ID`, `META_TOKEN_PAGINA`.

## Tratamento de erro (PT-BR, token jamais em log)

Casos: sem env · token inválido/expirado (orientar renovação) · mídia ausente · carrossel
fora de 2-10 · legenda vazia · upload Fal falhou · criação de container falhou (corpo da
Graph API no erro, sem o token) · publish falhou · **rate limit 25 posts/24h** · timeout do
reel (não ficou `FINISHED`). Toda falha em PT, acionável.

## Limites da plataforma (documentar)

- 25 posts publicados por API / 24h (reels e stories contam no mesmo balde).
- ~200 chamadas/usuário/hora.
- Só conta Professional/Business vinculada a página FB + app aprovado.
- Mídia tem que estar em URL pública no momento do publish (por isso o Fal CDN).

## Testes

- **Funções puras (sem rede):** detecção da mídia na pasta por tipo (ordena `slide-*`, conta
  2-10); builder do payload de container por tipo (o JSON exato de cada chamada); validação
  (carrossel 2-10, legenda não-vazia).
- **Dry-run:** valida e imprime o plano sem tocar a rede.
- **Mock de rede:** Graph API e Fal CDN mockados via `GRAPH_BASE_URL`/`FAL_BASE_URL` (mesmo
  padrão do `gerar-imagem.test.mjs`). Testa o fluxo dos 3 tipos contra o mock — **nunca
  publica de verdade**. Assertiva de segurança: o token não aparece na saída/erro.

## Critério de pronto

- `publicar-instagram.mjs` publica carrossel, post e reel a partir de uma peça do `/post`,
  com mídia no Fal CDN, dry-run por padrão e `--confirmar` pra valer.
- `lib-fal-upload.mjs` extraído e reusado pelo `gerar-avatar.mjs` (sem duplicação).
- Registra em `producao/publicacoes.md` (permalink) e no feed do painel.
- Erros em PT, `META_TOKEN_PAGINA`/`FAL_KEY` nunca vazam — testado.
- `/publicar` e `docs/ferramentas.md` atualizados.
- Testes verdes sem nunca publicar de verdade.

## Fora de escopo (YAGNI)

- Refresh automático de token (v2).
- Stories, Facebook, LinkedIn (conectores irmãos depois).
- Agendamento headless (já desenhado em `docs/headless.md`).
- Retry/fila de publicação (uma peça por chamada agora).
