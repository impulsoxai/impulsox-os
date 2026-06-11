---
name: publicar
description: >
  Use quando uma peça aprovada deve ir ao ar — "/publicar", "posta isso", "publica o
  post de hoje", "sobe no Instagram". Publica automaticamente onde a API oficial
  permite (Instagram e página de empresa do LinkedIn) e entrega publicação assistida
  de um clique onde automação violaria os termos (perfil pessoal do LinkedIn). Nunca
  publica nada sem aprovação explícita do usuário.
---

# /publicar — Levar a peça aprovada ao ar

Ponte entre o conteúdo aprovado e o feed. Automatiza o que a plataforma permite
oficialmente; o resto sai pronto pra um clique. **Regra de ouro: nunca arriscar a conta
de ninguém com automação fora dos termos.**

Autoria: ImpulsoX AI. Conteúdo original.

## Quando NÃO usar

- A peça ainda não existe → `/post`, `/linkedin` ou `/conteudo` primeiro.
- O usuário ainda está revisando → esperar o "aprovado" explícito. Sem aprovação, não
  existe publicação.

## Mapa de automação (não negociável)

| Destino | Modo | Por quê |
|---|---|---|
| Instagram (conta Professional) | **Automático** — Graph API | API oficial suporta carrossel, imagem única e reel |
| Facebook (página) | **Automático** — Graph API | API oficial de páginas |
| LinkedIn — página de empresa | **Automático** — API oficial (exige app aprovado pela LinkedIn) | Permissões organizacionais oficiais |
| LinkedIn — perfil pessoal | **Assistido** — texto final + imagem prontos, usuário cola e publica | Automação de perfil viola os termos; risco de restrição da conta |
| Site/blog | **Automático** — commit + push (deploy do site cuida do resto) | Repositório é do usuário |

## Configuração (uma vez por conta)

Credenciais vivem no `.env` da raiz (ou da pasta do cliente) — **nunca em arquivo
versionado**:

```
IG_USUARIO_ID=          # ID da conta Instagram Professional
META_PAGINA_ID=         # ID da página do Facebook vinculada
META_TOKEN_PAGINA=      # token de longa duração da página
LINKEDIN_ORG_ID=        # opcional — página de empresa
LINKEDIN_TOKEN=         # opcional — token com permissão organizacional
SITE_REPO_DIR=          # opcional — pasta local do repositório do site
```

Faltando credencial na primeira execução: guiar o usuário pela configuração (conta
Professional vinculada a página FB → app na Meta for Developers → token de longa
duração), criando `producao/guia-configuracao-meta.md` com o passo a passo se não
existir. Não travar o resto: o que não tem credencial sai em modo assistido.

## Fluxo

1. **Identificar a peça.** Pelo argumento (`/publicar <slug>`) ou oferecendo as peças
   aprovadas pendentes no calendário.
2. **Conferir aprovação.** Status aprovado no calendário ou confirmação na conversa.
   Em dúvida, perguntar — publicar errado custa caro.
3. **Pré-voo.** Imagens no tamanho certo (1080x1350), legenda final pós-`/escritor-br`,
   link funcionando, alt text disponível. Peça de intenção "vender": passou pelo
   `/revisar` (crivo do revisor sênior)? Se não, rodar antes — pra anúncio pago é
   obrigatório, pra orgânico de venda é o padrão.
4. **Publicar por destino:**
   - **Instagram carrossel:** subir cada imagem como container filho → criar container
     `CAROUSEL` com a legenda → publicar. Imagem única e reel seguem o fluxo equivalente
     da Graph API.
   - **Facebook:** publicar na página com a legenda adaptada.
   - **LinkedIn empresa:** publicar via API oficial.
   - **LinkedIn pessoal:** entregar bloco final formatado (texto + arquivo de imagem +
     comentário com link) e instrução de um clique.
   - **Site:** mudar `rascunho: false`, commit, push.
   Esperar a confirmação de cada API (id da publicação) antes de declarar publicado —
   nunca assumir sucesso.
5. **Registrar.** Atualizar Status no calendário para `publicado` com data, hora e link
   da publicação. Salvar os ids retornados em `producao/publicacoes.md` (vira insumo da
   análise de desempenho).

## Scripts

As chamadas de API vivem em `scripts/publicar-instagram.mjs`, `scripts/publicar-facebook.mjs`
e `scripts/publicar-linkedin-org.mjs` (Node, sem dependência além de `fetch`). Se ainda
não existem, criar na primeira configuração — pedindo aprovação do código ao usuário.
Erro de API: reportar a resposta exata, não mascarar; token expirado é a causa mais
comum (renovar pelo guia).

## Regras

- Aprovação explícita antes de qualquer publicação. Sempre.
- Credencial só em `.env`. Jamais ecoar token em log ou conversa.
- Falhou um destino → publicar os demais e reportar o que falhou com o erro literal.
- Nunca deletar publicação sem pedido explícito.
- Horário: publicar na janela do calendário; pedido fora de janela, confirmar "agora
  mesmo?".
