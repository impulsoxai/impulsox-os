---
name: carteira
description: >
  Use no modo agência pra ver TODOS os clientes de uma vez — "/carteira", "visão da
  carteira", "como estão meus clientes", "quem está no vermelho", "qual contrato vence",
  "painel da agência". Lê o CRM de cada cliente (por tenant) e mostra a carteira: receita,
  leads, deals e saúde de cada um, mais o que está parado/atrasado. É o cockpit que deixa
  escalar de 1 pra N clientes sem afogar. Lê via lib-crm (1 token por cliente). Modo agência.
---

# /carteira — O cockpit da agência (visão de N clientes)

O `/painel` é o dashboard de UM negócio; o `/abrir` carrega um contexto por vez. Quando a
agência atende vários clientes, falta a **visão de carteira**: quem está no verde/vermelho,
quem está sem entrega há dias, qual contrato vence, qual relatório atrasou. Esta skill é o
cockpit que permite escalar sem perder cliente de vista.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Modo agência (vários `clientes/<nome>/`). Degrau 4 pros dados de CRM (cada cliente com seu
`CRM_TOKEN`). Sem token de um cliente, ele aparece na carteira com os dados locais (escada,
produção) e o CRM marcado como "não conectado" — não trava, degrada.

## A pegada crítica do multi-tenant (ler com atenção)

O CRM isola por `tenant_id`, que vem **do token**. **Não existe "varrer todos os tenants"
por um único login** — isolamento inegociável. Logo: a carteira lê **um token por cliente**,
guardado no `.env` de cada `clientes/<nome>/`. O hub itera os clientes, e pra cada um usa o
token DELE. Nunca tentar um token "mestre" que veja todos — isso fura o isolamento e o CRM
não permite.

## O que lê

Por cliente em `clientes/<nome>/`:
- `.env` do cliente → `CRM_BASE_URL` + `CRM_TOKEN` (o tenant daquele cliente).
- Do CRM (via `lib-crm`, com o token do cliente): `getReports(c)` → receita
  (`receitaDeReports`), leads por canal, deals/mês, top clientes.
- Local (sem CRM): `clientes/<nome>/nucleo/escada.md` (degrau, pendências),
  `clientes/<nome>/nucleo/intake.md` (KPI do contrato, escopo — do `/intake`),
  `clientes/<nome>/producao/` (última entrega, o que está parado).

## Como roda

1. **Listar os clientes** em `clientes/`.
2. **Pra cada cliente:** montar o cliente-CRM com o `.env` dele (`crmFromEnv` lendo o `.env`
   do cliente, não o global) → `getReports`. Sem token → marcar "CRM não conectado" e seguir
   com o local.
3. **Montar a linha da carteira:** nome · degrau · receita (CRM) · leads no mês · última
   entrega (producao) · KPI do contrato (intake) · **renovação** (bloco Contrato do
   intake) · sinal de saúde.
4. **Sinal de saúde** (semáforo honesto, regra simples e explicável):
   - 🔴 vermelho: sem entrega há >14 dias, OU KPI do contrato vencendo sem resultado, OU
     **renovação em ≤30 dias com KPI no amarelo** (o anti-churn mais barato da carteira:
     a conversa de renovação começa AGORA, com plano — não no dia do vencimento), OU CRM
     não conectado num cliente que deveria ter.
   - 🟡 amarelo: entrega atrasando (7-14 dias), pendência aberta na escada, ou renovação
     em ≤60 dias sem conversa marcada.
   - 🟢 verde: entrega em dia + KPI no caminho + renovação longe ou encaminhada.
   (Sem o bloco Contrato no intake.md → coluna renovação sai "?" e vira pendência — nunca
   fingir que o dado existe.)
5. **Entregar a tabela** ordenada por saúde (vermelho primeiro — o que precisa de atenção).
   No fim, "o que fazer hoje": os 1-3 clientes que pedem ação.

## Gate "saúde da casa" — pronto pra ads? (semáforo objetivo, antes de liberar tráfego pago)

A tese da esteira ("ads é o último passo") vira CHECAGEM objetiva, não sugestão verbal. Antes de
o cliente ir pra Fase 3 (`/ads-meta`), o gate confere a casa — checklist validado de mercado
(ver `docs/auditoria-esteira-2026-06-29.md`). Cada item é fato verificável, não achismo:

| Checagem (a casa está pronta?) | Verde quando | Fonte |
|---|---|---|
| **Destino converte** | página/landing no ar, clara, com next step | `producao/paginas/`, `/raio-x` |
| **Responde lead rápido** | tempo médio de 1ª resposta < ~5-15min | `/velocidade` (CRM ou estimativa) |
| **Prova social** | tem reviews 4★+ / depoimento autorizado | `/local`, `nucleo/provas.md` |
| **Tração orgânica** | conteúdo ativo há ≥30d com engajamento estável | `/desempenho`, `producao/posts/` |
| **Medição ligada** | Pixel + CAPI instalados (destino site) | `/intake`, `/ads-meta` |
| **Orçamento realista** | verba pra ≥60-90d + meta clara | `nucleo/intake.md` |

**Como o gate age (não trava, alerta):**
- 🟢 tudo verde → "casa pronta, pode liberar ads".
- 🟡 1-2 vermelhos → "ads vai vazar em [item]; consertar antes rende mais. Quer que eu aponte a
  skill que resolve?" (ex: sem prova → `/local`; sem velocidade → o agente/Pilar 3).
- 🔴 3+ vermelhos → "ainda não é hora de ads — o dinheiro vaza. Caminho: Fase 0-2 primeiro."

O gate **informa e recomenda a ordem**, nunca bloqueia à força (regra do CLAUDE.md: guiar é
oferecer o caminho, não forçar o trilho). Mostra o gate por cliente que tem ads no escopo, ou
sob demanda ("esse cliente está pronto pra ads?").

## Regras

- **Um token por cliente** — nunca um token mestre (fura o isolamento do CRM).
- **Nunca ler o Postgres direto** — só pela API, com o token do tenant.
- **Token nunca em log/saída** — a `lib-crm` redige; a carteira nunca imprime token.
- **Dado de um cliente jamais vaza pro outro** — cada linha usa só o token e os arquivos
  daquele cliente (regra do `/cliente`).
- **Sinal de saúde é regra nomeada, não achismo** — o semáforo segue os limiares acima.
- **Gate de ads informa, não trava** — recomenda a ordem (casa antes do tráfego), mas o dono
  decide. Cada checagem é fato verificável de um arquivo/skill, nunca opinião.
- **Só dado real** — cliente sem CRM aparece com o local + "não conectado", não com número
  inventado.
- É MOTOR: nasce no template, desce via `/atualizar-motor`.

## Anti-duplicação

- Não é o `/painel` (dashboard ao vivo de UM negócio, servidor local). A carteira é a visão
  cruzada de TODOS, sob demanda.
- Não é o `/abrir` (abre UM contexto). A carteira não entra em nenhum cliente — sobrevoa.
- Não é o `/roi` (o retorno de UM cliente, fundo). A carteira mostra o topo de todos.

## Teste de aceitação (comportamental)

1. 3 clientes, 2 com `CRM_TOKEN` → tabela com receita/leads dos 2; o 3º com local + "CRM não
   conectado". Nada inventado.
2. Cliente sem entrega há 20 dias → 🔴 e aparece no topo + no "o que fazer hoje".
3. Token de um cliente nunca aparece na saída; dado de um nunca aparece na linha do outro.
4. Rodado fora do modo agência (sem `clientes/`) → avisa que é skill de agência e aponta
   `/painel` pro negócio único.

---

**✓ Pronto:** carteira de todos os clientes (receita, leads, saúde, o que fazer hoje), ordenada por quem precisa de atenção · **→ próximo passo:** entrar no cliente que pede ação (`/abrir` dentro da pasta dele) ou `/relatorio` pra fechar o mês de um. Pré-requisito: modo agência (`clientes/`) + `CRM_TOKEN` por cliente; sem token, mostra o local e marca "não conectado".
