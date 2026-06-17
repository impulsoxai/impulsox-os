# Upload pro YouTube (Fase 3) — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-17 · Autoria: ImpulsoX AI.
> Fase 3 do canal YouTube (Fase 1 = roteiro, Fase 2 = edição). Métricas ficam pra Fase 3.5.

## Problema

A Fase 2 entrega `final.mp4` + `legenda.srt` + (long) thumbnail. Falta o último elo: levar
o vídeo ao ar no YouTube sem o dono fazer upload manual toda vez. Esta fase publica o vídeo
(auto onde a API oficial permite; assistido onde não há credencial), fechando o ciclo
decide→produz→publica.

## Escopo

- **No escopo:** upload de vídeo (short E longo) pro YouTube via Data API v3; modo auto
  (OAuth configurado) e modo assistido (sem credencial); metadados vindos do roteiro com
  **confirmação obrigatória** antes de subir; privacidade **privada por padrão**; registro
  da publicação; integração no `/publicar` existente.
- **Fora (fases próprias):** métricas/Analytics (views, retenção) pra validar fórmula —
  Fase 3.5; agendamento nativo na API (sobe privado, dono publica/agenda no Studio);
  upload de shorts em lote (Fase 2.5 gera os shorts; o upload deles usa esta mesma fase).

## Decisões (do brainstorming)

1. **Conector próprio `publicar-youtube.mjs`** espelhando `publicar-instagram/linkedin.mjs`
   (isolado, testável), integrado no mapa do `/publicar`. Não inflar um arquivo único.
2. **Auto + assistido** (padrão `/publicar`): com credencial OAuth sobe sozinho; sem
   credencial, monta pacote pronto pra arrastar no YouTube Studio.
3. **Metadados do roteiro** (`/roteiro-yt` cospe 3 títulos + descrição SEO + tags), SEMPRE
   com confirmação/edição antes de publicar — título errado no YouTube custa view.
4. **Privacidade `private` por padrão** — o dono revisa no Studio (player real, thumbnail,
   legenda) e publica ele mesmo. `--privacidade unlisted|public` sobrescreve.
5. **Short e longo, mesma API** (`videos.insert`). Short = vertical + ≤180s; o sistema
   detecta e acrescenta `#Shorts` na descrição.
6. **Dry-run por padrão**: valida + mostra o que vai subir; `--confirmar` sobe de verdade.
7. **yt-dlp NÃO serve aqui** — é só download. Upload é Data API v3 (OAuth).

## Arquitetura

### 1. `scripts/lib-youtube-upload.mjs` (novo — funções puras, ZERO deps, testáveis sem rede)

- `detectarShort({ largura, altura, duracaoSeg })` → bool. Vertical (altura > largura) E
  `duracaoSeg <= 180`. Curto e determinístico.
- `montarMetadados({ titulo, descricao, tags = [], privacidade = "private", categoria = "27", ehShort = false })`
  → objeto no formato do `videos.insert` (`{ snippet: { title, description, tags,
  categoryId }, status: { privacyStatus, selfDeclaredMadeForKids: false } }`). Quando
  `ehShort`, garante `#Shorts` no fim da `description` (sem duplicar se já houver). Categoria
  default `27` (Education).
- `validarUpload({ arquivo, titulo, descricao })` → lista de erros acionáveis (PT): arquivo
  vazio, `titulo` ausente ou > 100 chars, `descricao` > 5000 chars. Lista vazia = ok.
- `montarPacoteAssistido({ slug, final, metadados, thumb })` → string do `metadados.txt`
  legível (título, descrição, tags, privacidade, passo a passo do Studio) pro modo assistido.

### 2. `scripts/publicar-youtube.mjs` (novo — orquestrador, dry-run/`--confirmar`)

- **Entrada:** `--video <final.mp4>` (ou `--slug <nome>` → `canal-youtube/edicao/<slug>/final.mp4`),
  `--titulo`, `--descricao`, `--tags "a,b,c"`, `[--privacidade private|unlisted|public]`,
  `[--thumb <png>]`, `[--confirmar]`. Sem título/descrição e havendo roteiro do slug, ler de
  `canal-youtube/roteiros/.../<slug>.md` (bloco Pacote/Descrição/Tags) — sempre exibir pra confirmar.
- **`.env`:** `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN` (todos opcionais; sem
  eles = modo assistido). Carrega via `process.loadEnvFile()` quando rodado direto.
- **Detecção de short:** `ffprobe` no vídeo (largura, altura, duração) → `detectarShort`.
- **Fluxo com `--confirmar` E credencial:**
  1. `validarUpload` → se erro, falha com a lista.
  2. Troca `YT_REFRESH_TOKEN` por `access_token` (POST `https://oauth2.googleapis.com/token`).
  3. Upload resumável: POST `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`
     com o JSON de `montarMetadados` → recebe URL de upload → PUT do binário do vídeo.
  4. Se `--thumb`: POST `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=<id>`.
  5. Espera o `id` do vídeo (confirmação real); monta o link `https://youtu.be/<id>`.
  6. Registra em `producao/publicacoes.md` + `registrar-passo` (feed do painel).
- **Fluxo sem credencial (assistido):** grava `metadados.txt` ao lado do vídeo via
  `montarPacoteAssistido`, imprime o passo a passo do Studio. Não falha — é o caminho válido.
- **Fluxo sem `--confirmar` (dry-run, default):** valida + imprime o plano (título,
  privacidade, é short?, modo auto/assistido, arquivos) — não sobe.
- **Token nunca aparece em log/erro** (redigido), igual `META_TOKEN_PAGINA`.

### 3. Skill `/publicar` estendida

- Acrescentar YouTube ao **Mapa de automação**: short/longo → **Automático** (Data API v3,
  exige OAuth) | sem credencial → **Assistido** (pacote pro Studio).
- Guia de OAuth na 1ª vez: criar `producao/guia-youtube-oauth.md` com o passo a passo
  (projeto no Google Cloud → ativar YouTube Data API v3 → tela de consentimento → criar
  credencial OAuth Desktop → autorizar o escopo `youtube.upload` → obter refresh_token).
- Regra reforçada: vídeo sobe **privado**; publicação final é decisão do dono no Studio.

### 4. `.env.example`

Acrescentar bloco: `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN` (opcionais).

## Dados / fluxo

`final.mp4` + roteiro (título/descrição/tags) → confirmação do dono → (auto) Data API v3
sobe privado / (assistido) pacote pro Studio → `producao/publicacoes.md` (id, link, data) +
feed do painel.

## Tratamento de erro (PT-BR, acionável)

arquivo não existe · título > 100 chars · descrição > 5000 · sem credencial → cai pro
assistido com aviso (não é erro) · refresh_token inválido/expirado → orientar reautorizar
pelo guia · cota da API estourada (upload custa ~1600 unidades; free tier ~6 uploads/dia) →
avisar e sugerir assistido · ffprobe ausente → não detecta short, assume longo com aviso ·
falha no PUT do binário → reportar status HTTP (sem token). Falha não deixa lixo: remove
upload parcial quando der.

## Testes

- **Funções puras (sem rede, com fixtures):** `detectarShort` (vertical+≤180 = true; 16:9 =
  false; vertical 200s = false); `montarMetadados` (estrutura snippet/status; `#Shorts`
  adicionado quando ehShort e não duplicado; privacidade default private); `validarUpload`
  (título > 100, descrição > 5000, arquivo vazio → erros; caso ok → []); `montarPacoteAssistido`
  (contém título, tags, passo do Studio).
- **Orquestrador dry-run:** monta o plano sem subir (mockar ffprobe/credencial). Nenhum
  teste chama a API do YouTube nem faz upload real.

## Critério de pronto

- `publicar-youtube.mjs` sobe `final.mp4` (short ou longo) como **privado** com metadados
  confirmados, em modo auto (OAuth) — e cai pro assistido sem credencial. Dry-run por
  padrão; `--confirmar` sobe.
- Thumbnail setada quando fornecida (vídeo longo).
- `lib-youtube-upload.mjs` coberto por testes de função pura.
- Erros em PT; token nunca vaza; registro em `producao/publicacoes.md` + painel.
- `/publicar` documenta o YouTube e guia o OAuth na 1ª vez.
- Testes verdes sem tocar a API real.

## Fora de escopo (YAGNI)

- Métricas/Analytics (Fase 3.5).
- Agendamento nativo via API (sobe privado; dono agenda no Studio).
- Playlists, cards, end screens, legendas .srt como faixa CC na API (subir manual por ora).
- Upload simultâneo multi-conta.
