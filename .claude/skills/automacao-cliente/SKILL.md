---
name: automacao-cliente
description: >
  Use para CRIAR uma automação VENDIDA a cliente — script que roda sozinho no servidor
  dele em agenda (relatório automático por e-mail/WhatsApp, pipeline de planilha, monitor
  de leads com alerta, publicador de fila) — "/automacao-cliente", "automatiza esse
  relatório pro cliente", "o cliente faz isso na mão todo dia", "monitor de leads".
  Produto de assinatura: setup + mensalidade de manutenção. (Pra transformar rotina
  INTERNA do dono em skill do próprio OS, é a `/automatizar` — outra coisa.)
---

# /automacao-cliente — Automação como produto de assinatura

Script que roda sozinho, em agenda, no ambiente do cliente — e resolve uma tarefa que
um humano fazia na mão todo dia. O modelo de negócio embutido: **página é projeto,
dashboard é projeto, automação é ASSINATURA** — setup pago uma vez + mensalidade de
manutenção pra manter rodando, atualizada e conectada.

Método destilado do Sprint vídeo 6 (Matt Ganzak) — fonte bruta em
`ImpulsoX-AI/material-matt/sprint-video6-automacoes.md`; mecânica transferida, nunca o
conteúdo. Autoria da skill: ImpulsoX AI.

## O que ler antes

- `nucleo/negocio.md` + `nucleo/ofertas.md` — automação é oferta modular da esteira;
  peça pública sobre ela só se ATIVA
- `.claude/skills/automatizar/SKILL.md` → **a triagem de viabilidade de lá vale aqui
  também** (gatilho determinístico? entrada/saída conhecidas? precisa julgamento? ROI
  fecha?) — rodar ANTES de prometer a automação ao cliente
- `docs/ferramentas.md` — a ferramenta externa que a automação usa pode já estar
  catalogada (API, script, .env)
- Se envolve enviar mensagem/e-mail: `docs/entregabilidade-email.md` e a regra da casa
  — **nunca arriscar a conta de um cliente por automação fora dos termos da plataforma**

## A anatomia (todo brief nasce nestas 4 partes)

| Parte | Pergunta ao cliente | Exemplos |
|---|---|---|
| **Gatilho** | quando dispara? | agenda (cron), webhook, arquivo novo numa pasta, linha nova na planilha, manual |
| **Busca** | de onde vem o dado? | API do sistema dele, planilha, banco, CRM, arquivo |
| **Processo** | o que fazer com o dado? | filtrar, calcular, formatar, deduplicar, pontuar lead |
| **Saída** | onde entrega o resultado? | e-mail, WhatsApp, planilha, alerta pro time, post |

Brief estruturado nas 4 partes → PRD completo e construível de primeira. A linguagem
(Python pra dados/arquivos/cron; Node pra API/webhook/envio) é decisão técnica do
build, não do cliente — escolher pelo trabalho e dizer o porquê em uma linha.

## As 5 etapas do build (com o loop entre elas)

1. **Setup** — estrutura do projeto, dependências, config de credenciais (`.env`,
   nunca hardcoded), **logger desde a primeira linha**. Rodar sem erro antes da etapa 2.
2. **Gatilho/entrada** — cron, listener de webhook ou CLI limpa; loga todo disparo
   com timestamp.
3. **Busca** — auth via config, **retry 3x com backoff** em falha transitória,
   validar o shape da resposta ANTES de processar, logar o que veio e quantos registros.
   API nova: entender a doc primeiro (endpoint/auth/shape, sem código), depois
   implementar; resposta com shape inesperado → normalizador na camada de busca,
   nunca remendo no processo. Erros HTTP: 401 = key/header, 403 = escopo da key,
   404 = endpoint/ID errado, 429 = retry com backoff, 5xx = lado deles (retry com
   delay maior, checar status page).
4. **Processo** — a transformação com os edge cases tratados (dado vazio, campo
   faltando, valor inesperado); retorna objeto validado; loga resumo.
5. **Saída + blindagem** — a entrega, try/catch geral, notificação de sucesso, README
   (como configurar, como mudar a agenda) e config de deploy.

Nunca construir a etapa N+1 sem verificar a N (o loop de sempre: rodou limpo →
confere contra o plano; erro → colar o erro exato, nunca chutar).

## Blindagem — os 4 requisitos que entram em TODO PRD (inegociáveis)

**Automação que falha em silêncio é pior que nenhuma automação** — quando quebra sem
avisar, morre a mensalidade e a relação.

1. **Log em toda execução** — timestamp, o que buscou/processou/entregou, status.
2. **Try/catch em toda chamada externa** — falhou: loga detalhe completo, alerta, para limpo.
3. **Notificação de falha na hora** — alerta (e-mail/WhatsApp/Slack) com timestamp,
   erro e última ação — nós descobrimos ANTES do cliente notar que o relatório não chegou.
4. **Retry em falha transitória** — timeout e rate-limit são temporários: 3 tentativas
   com intervalo antes de desistir e alertar.

## Onde roda (decidir com o que o cliente JÁ tem)

| Situação | Onde | Por quê |
|---|---|---|
| Cliente (ou nós) tem VPS | **Cron no servidor** | grátis, confiável, zero dependência — nosso padrão |
| Sem servidor | **GitHub Actions** | free tier cobre a maioria; push → roda |
| Precisa ficar sempre no ar (webhook) | **Railway/Render** | processo persistente |
| Cliente já usa Zapier/Make | **Webhook plugado no stack dele** | não brigar com o que funciona |

Confiabilidade é o produto: se não roda TODA vez, o cliente para de confiar e a
assinatura morre.

## Os 5 tipos vendáveis (começar pelo 1 — build mais rápido, venda mais fácil)

| Tipo | O que resolve | Referência de preço (mercado EUA, Sprint jul/2026 — calibrar pro nicho BR) |
|---|---|---|
| 1. **Relatório automático** | métricas → resumo diário/semanal por e-mail/WhatsApp | setup US$ 500-1.500 + US$ 200/mês |
| 2. **Pipeline de dados** | planilha/CSV bruto → limpo, deduplicado, calculado | setup US$ 1.000-3.000 + US$ 300/mês |
| 3. **Publicador de fila** | fila de conteúdo aprovado → posta em agenda | setup US$ 1.000-2.500 + US$ 400/mês |
| 4. **Monitor de leads** | vigia CRM/formulário → pontua → alerta o time na hora | setup US$ 1.500-4.000 + US$ 500/mês |
| 5. **Pipeline completo** | busca de várias fontes + relatório + alerta num run só | setup US$ 3.000-8.000 + US$ 800/mês |

Todo negócio manda relatório manual — automatizar UM e oferecer a mensalidade é a
porta de entrada. E cliente de `/dashboard` é candidato natural: a relação já existe,
a conversa seguinte se escreve sozinha (upsell da esteira).

O tipo 4 (monitor de leads) com cliente do CRM ImpulsoX usa a integração que já
existe (`lib-crm`/webhook) — não construir vigia do zero.

## Nível 2 — agente autônomo (o degrau acima do script)

O mesmo esqueleto (gatilho + scheduler + blindagem) sustenta um **agente autônomo**
(ex.: Hermes no VPS): a diferença é que o Processo deixa de ser regra fixa e vira
**Claude com julgamento** — lê contexto (o vault/núcleo), decide, usa ferramentas.
Isso ADICIONA quatro requisitos ao PRD, além da blindagem normal:

1. **Guardas de decisão** — lista explícita do que o agente decide sozinho vs o que
   espera aprovação humana (gate nomeado, não aprovação silenciosa).
2. **Teto de custo por execução** — orçamento de tokens/chamadas com alerta de estouro;
   script custa centavos, agente queima tokens.
3. **Memória de estado** — o agente acorda sabendo onde parou (vault/núcleo como
   contexto persistente — "never cold starting").
4. **Log de decisão** — não só "rodou, sucesso": registrar "decidiu X porque Y",
   senão o julgamento não se audita.

Script agendado é o produto de entrada; agente autônomo é o upsell topo da esteira
(o Sistema de Crescimento completo). Mesma skill, barra mais alta.

## Gate de QA antes de ativar

Rodar `docs/qa-entrega-build.md` antes de ligar a agenda no ambiente do cliente:
self-review contra o PRD, os 5 checks de segurança (credencial só em config,
.gitignore, sem TODO) e — específico de automação — **forçar uma falha em teste e
confirmar que o alerta chega** com timestamp, erro e última ação. Blindagem não
testada é blindagem que não existe.

## Regras

- **Triagem de viabilidade antes de prometer** (herdada da `/automatizar`): gatilho
  claro, entrada/saída conhecidas, julgamento humano fora do miolo (ou IA com guardas
  + aprovação), ROI que fecha. Reprovou → dizer o porquê em uma linha, não construir.
- **Automação que toca conta de cliente, publica ou gasta dinheiro** mantém humano no
  clique final onde a plataforma exige (regra da casa: nunca arriscar a conta; API
  oficial permite → automatiza; área cinza → entrega pronto pra um clique).
- **Credencial só em config** (`.env`/secrets do scheduler), nunca no código, nunca
  no repo.
- **Preço da oferta**: registrar setup + mensalidade em `nucleo/ofertas.md` quando
  definidos; os números acima são referência de mercado com fonte, não tabela nossa.
- Entrega inclui **README** (o que faz, como mudar a agenda, o que fazer se alertar) —
  é parte do produto, não cortesia.

## Teste de aceitação (comportamental)

- "o cliente monta esse relatório na mão toda segunda" → brief nas 4 partes → tipo 1,
  proposta com setup + mensalidade
- automação construída → forçar uma falha de API em teste → alerta chega com
  timestamp, erro e última ação (blindagem provada antes da entrega)
- "quero que poste sozinho no Instagram do cliente" → checar termos da plataforma
  ANTES; área cinza → fila pronta pra um clique, não disparo automático
- cliente sem servidor → GitHub Actions configurado, agenda documentada no README

---

**✓ Pronto:** automação entregue rodando em agenda (log + alerta de falha + README) ·
**→ próximo passo:** registrar a mensalidade de manutenção em `nucleo/ofertas.md` e no
CRM; primeira semana: conferir os logs 1x pra validar a estabilidade. Skill opcional
da esteira — entra quando há tarefa manual repetida no cliente, nunca empurrada.
