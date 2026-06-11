# Catálogo de Ferramentas — APIs, CLIs e conectores

> Consultado pela `/automatizar` e por qualquer skill **antes de escrever código novo**.
> Irmão do `docs/skills-prontas.md`: aquele cataloga *skills*; este cataloga as *ferramentas*
> (APIs, CLIs, conectores) que as skills usam por dentro. Regra: tarefa que uma ferramenta
> desta lista resolve não vira código duplicado — usa-se a ferramenta documentada aqui.
> Autoria: ImpulsoX AI. Conteúdo original.

## Como usar este arquivo

1. Vai construir uma skill que precisa fazer algo "de fora" (renderizar imagem, publicar,
   ler dados, chamar API)? Procurar aqui primeiro.
2. Tem ferramenta → usar o padrão documentado (não reinventar).
3. Não tem → construir, e **registrar a ferramenta nova aqui** no fim (uma linha por
   descoberta), pra próxima skill já encontrar.

Regras gerais que valem pra toda ferramenta:
- **Credencial só em `.env`** (raiz ou pasta do cliente), nunca versionada. Token jamais
  aparece em log ou conversa. (Mesma disciplina do `/publicar` e do `/salvar`.)
- **Script em `scripts/*.mjs`** (Node, só `fetch` quando possível, sem dependência à toa).
  Se o script ainda não existe, criar na primeira execução **pedindo aprovação do código ao
  usuário** — é o padrão das skills do sistema.
- **Cálculo de dinheiro sai de script determinístico**, nunca de estimativa de IA (princípio
  do `/analisar-ads`).
- **Onde a API oficial permite, automatizar; onde violaria os termos, entregar pronto pra um
  clique.** Nunca arriscar a conta do cliente.

---

## Renderizar HTML em imagem (PNG)

### Playwright
- **Resolve:** transforma qualquer HTML em PNG — carrosséis, capas de destaque, slides de
  proposta, gráficos de relatório. É o motor visual do `/post`, `/perfil-ig`, `/identidade`,
  `/criar-ebook`, `/relatorio`.
- **Conta:** não, roda local.
- **Instalar:** `npx playwright install chromium`
- **Padrão de uso:** screenshot da viewport exata (1080x1350 pra feed, 1080x1920 pra story/
  destaque). Reutilizar `node_modules` de uma pasta anterior em vez de reinstalar a cada peça.
- **Quem usa:** `/post`, `/perfil-ig`, `/identidade` (specimen), `/pagina` (verificação visual
  em 390/768/1440), `/criar-ebook`, `/relatorio`, `/proposta`.

## Ler conteúdo de sites (scraping)

### Firecrawl (ou WebFetch/WebSearch nativos)
- **Resolve:** ler, buscar e extrair conteúdo de páginas públicas — base do `/plugar` (extração
  de site), `/raio-x`, `/identidade` (caminho EXTRAIR), `/geo` (auditoria), `/formulas` (modo
  pesquisa web aberta).
- **Conta:** Firecrawl pede chave; WebSearch/WebFetch são nativos do Claude Code (sem conta).
- **Limite ético:** só conteúdo **público**. Nunca raspar rede social atrás de login (viola
  termos, arrisca a conta) — regra dura do `/formulas`. Nunca acessar área logada (`/raio-x`).
- **Quem usa:** `/plugar`, `/raio-x`, `/identidade`, `/geo`, `/conteudo` (pesquisa de ângulo).

## Publicar em redes sociais

### Meta Graph API (Instagram + Facebook)
- **Resolve:** publicar carrossel, imagem e reel no Instagram Professional e na página do
  Facebook, de forma oficial.
- **Conta:** sim — conta IG Professional vinculada a página FB, app na Meta for Developers,
  token de longa duração da página.
- **`.env`:** `IG_USUARIO_ID`, `META_PAGINA_ID`, `META_TOKEN_PAGINA` (nomes do `/publicar`).
- **Scripts:** `scripts/publicar-instagram.mjs`, `scripts/publicar-facebook.mjs`.
- **Pegadinha:** a Meta busca a imagem por **URL pública** — a peça precisa estar acessível na
  web antes de publicar. Token de longa duração expira; renovar é a causa #1 de erro.
- **Quem usa:** `/publicar`, `/desempenho` (mesmas credenciais pra ler métricas via Graph API).

### LinkedIn — API de página de empresa
- **Resolve:** publicar na página de empresa (não no perfil pessoal).
- **Conta:** sim — app aprovado pela LinkedIn com permissão organizacional (aprovação demora).
- **`.env`:** `LINKEDIN_ORG_ID`, `LINKEDIN_TOKEN`.
- **Limite:** **perfil pessoal não tem automação** — automação de perfil viola os termos e
  arrisca a conta. Perfil pessoal é sempre publicação assistida (entrega pronta, usuário cola).
- **Quem usa:** `/publicar`, `/linkedin`.

### Google Business Profile API (Perfil de Empresa)
- **Resolve:** atualizar informações, criar posts e responder avaliações no Google Maps via API.
- **Conta:** sim — projeto no Google Cloud + Business Profile APIs ativadas + solicitação de
  acesso aprovada pelo Google (voltada a agências; pode levar dias/semanas) + OAuth do dono.
- **`.env`:** `GBP_CLIENT_ID`, `GBP_CLIENT_SECRET`, `GBP_REFRESH_TOKEN`, `GBP_LOCATION_ID`.
- **Script:** `scripts/gbp.mjs`.
- **Limite:** resposta a avaliação negativa **nunca** sai automática — usuário lê antes. Modo
  assistido funciona desde o dia 1; o conector é upgrade, não pré-requisito.
- **Quem usa:** `/local`.

## Ler métricas (medição)

### Instagram Graph API (insights)
- **Resolve:** puxar alcance, salvamentos, compartilhamentos, etc. por publicação, pra fechar
  o circuito de aprendizado.
- **Conta:** mesmas credenciais do `/publicar` (Meta).
- **Script:** `scripts/desempenho-instagram.mjs`. Cálculo de taxa no script, interpretação no
  modelo — nunca aritmética "de cabeça".
- **Quem usa:** `/desempenho`.

## Calcular performance de ads

### Script determinístico de ads
- **Resolve:** ler exports CSV de Google Ads e Meta Ads Manager e calcular CTR, CPC, CPA, ROAS
  e ranking — sem API, só os CSVs que qualquer conta baixa.
- **Conta:** não — o usuário exporta os CSVs.
- **Script:** `scripts/analisar-ads.mjs` (já existe no sistema). Mapear as colunas antes de
  rodar (nomes variam por idioma/versão do export). **LLM não faz aritmética de dinheiro.**
- **Quem usa:** `/analisar-ads`, e indiretamente `/ads-google` e `/ads-meta` (partem da análise).

## Publicar páginas/sites

### Repositório do site + deploy automático (Vercel/Netlify)
- **Resolve:** subir landing page e artigos de blog — commit + push no `main`, o deploy do site
  cuida do resto.
- **Conta:** a do usuário (repositório dele; deploy já configurado).
- **`.env`:** `SITE_REPO_DIR` (opcional).
- **Quem usa:** `/pagina`, `/conteudo` (artigo vira `draft: false` + push), `/publicar`.

## Backup e versionamento

### Git + GitHub CLI (`gh`)
- **Resolve:** backup de todo o trabalho do sistema, sem o usuário saber git.
- **Conta:** GitHub do usuário. Repositório sempre **privado** por padrão (carrega o núcleo do
  negócio). `gh` opcional (automatiza a criação do repo).
- **Quem usa:** `/salvar`.

## Gerar imagem por IA

### OpenAI — API de geração de imagem (`gpt-image`)
- **Resolve:** gerar foto pro carrossel do `/post` (Modo 3) quando a tipografia não basta —
  a Anthropic não gera imagem, então a rota é externa.
- **Conta:** sim — conta OpenAI com billing pré-pago (cobra por imagem gerada).
- **`.env`:** `OPENAI_API_KEY` (raiz ou pasta do cliente).
- **Script:** `scripts/gerar-imagem.mjs` — recebe prompt (inglês) + caminho de saída, salva o
  PNG. Erros tratados em português (sem chave, chave inválida/sem crédito, rate limit, prompt
  recusado). **A chave nunca aparece em log nem em mensagem de erro.**
- **Pegadinha:** prompt em **inglês** rende melhor. Custo é por imagem — gerar só quando
  aprovado. A API pode devolver URL ou base64 conforme a versão; o script trata os dois.
- **Regra de segurança:** **nunca gerar rosto identificável.** Pessoa reconhecível só com foto
  real autorizada (Modo 2). Aprovação visual obrigatória antes de usar a imagem.
- **Quem usa:** `/post` (Modo 3). O Modo 2 (usuário traz a foto) não usa API — custo zero.

---

## Registrar ferramenta nova

Testou uma API/CLI/conector que funcionou? Adicionar um bloco curto na seção certa com:
**o que resolve · precisa de conta? · variáveis de `.env` · script que a usa · qual skill
consome · qualquer pegadinha**. Manter o arquivo enxuto — catálogo é mapa, não inventário.
Ferramenta que parou de ser usada sai ou vira nota de rodapé.
