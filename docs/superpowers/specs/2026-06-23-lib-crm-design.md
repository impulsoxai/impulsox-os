# lib-crm.mjs — a ponte ImpulsoX-OS → CRM v3 (design)

> Data: 2026-06-23 · ImpulsoX-OS · A fundação das 5 oportunidades do eixo-lead.
> **BLOQUEADA** até o CRM entregar o service token por tenant (PRD 3.1). Spec pronto
> contra o contrato travado; quando o token sair, é só implementar (TDD) e plugar.

## Por que existe

As skills do eixo-lead (`/roi`, hub, `/leads`, `/depoimento`, `/reativar`) todas falam com
o mesmo CRM (Node+Express, API REST, envelope `success/fail`, auth por service token por
tenant). Sem uma lib comum, cada skill duplica auth/erro/envelope → dívida imediata. A
`lib-crm.mjs` é o único lugar que conhece o protocolo do CRM. Segue o padrão da casa
(`scripts/lib-graph.mjs`: funções puras, token redigido, throw em erro, `.test.mjs` ao lado).

## Contrato do CRM (já travado — PRD)

- Base URL + prefixo `/api` (confirmar no CRM). Auth: `Authorization: Bearer <ixk_live_...>`
  (service token por tenant, scopes). Multi-tenant: o token resolve o `tenant_id` — uma
  chave por cliente, no `.env` do clone.
- Envelope: `{ success:true, data }` ou `{ success:false, error }`.
- Endpoints que o OS consome: `GET /contacts`, `POST /contacts`, `GET /deals`,
  `GET /invoices`, `GET /reports`, `POST /csv` (+ os filtros `from/to/channel/status`).
- Erros: 401 (token inválido/revogado), 403 (sem scope), 422 (validação), 429 (rate-limit),
  5xx (CRM/dependência).

## Onde o token mora

`.env` do clone de cada cliente: `CRM_BASE_URL=...` e `CRM_TOKEN=ixk_live_...` (gitignored,
nunca commitado). Um token = um tenant. O hub multi-cliente lê o token do clone aberto; não
existe "varrer todos os tenants" por um login (isolamento — regra do CRM).

## API da lib (funções puras + um cliente fino)

```js
// scripts/lib-crm.mjs

// redige o token de qualquer texto (defesa: nunca vazar credencial em log/erro)
export function semToken(txt, token) { ... }   // igual ao padrão do lib-graph

// monta o cliente a partir do ambiente; erro claro se falta config
export function crmFromEnv(env = process.env) {
  // exige CRM_BASE_URL + CRM_TOKEN; retorna { base, token } ou throw "config faltando"
}

// núcleo: 1 request, trata envelope success/fail, redige token, mapeia status → erro legível
export async function crmFetch(base, token, method, path, { query, body } = {}) {
  // monta Authorization: Bearer, faz fetch, parseia JSON
  // success:true → retorna data; success:false ou !ok → throw CrmError(status, msg-redigida)
}

// classe de erro com o status (deixa a skill decidir: 429 = espera, 401 = avisa o dono)
export class CrmError extends Error { constructor(status, message){...} }

// helpers finos por recurso (cada um chama crmFetch; sem lógica de negócio aqui):
export const listContacts = (c, q)  => crmFetch(c.base, c.token, "GET",  "/contacts", { query:q });
export const createContact = (c, b) => crmFetch(c.base, c.token, "POST", "/contacts", { body:b });
export const listDeals    = (c, q)  => crmFetch(c.base, c.token, "GET",  "/deals",    { query:q });
export const listInvoices = (c, q)  => crmFetch(c.base, c.token, "GET",  "/invoices", { query:q });
export const getReports   = (c, q)  => crmFetch(c.base, c.token, "GET",  "/reports",  { query:q });
export const importCsv    = (c, b)  => crmFetch(c.base, c.token, "POST", "/csv",      { body:b });
```

A lib é **só transporte** — não calcula ROI nem decide nada (isso é da skill `/roi`). Mantém
a fronteira: lib fala com o CRM; skill faz o marketing.

## Regras de segurança (duras)

- **Token nunca em log/erro** — `semToken()` redige antes de qualquer `throw`/print (padrão
  do `lib-graph`).
- **Nunca ler o Postgres direto** — sempre pela API (o `tenant_id` vem do token via
  middleware; ler o banco fura o isolamento multi-tenant). A lib só faz HTTP.
- **Um token por tenant** no `.env` do clone; jamais hardcoded, jamais commitado.
- **Respeitar 429** — a skill que chama decide o backoff; a lib só expõe o status no
  `CrmError` (não faz retry sozinha por padrão, pra não mascarar abuso).

## Testes (`scripts/lib-crm.test.mjs`, TDD na implementação)

Mock-only (não bate no CRM real). Casos:
1. `semToken` redige o token em qualquer texto.
2. `crmFromEnv` sem `CRM_TOKEN` → erro claro de config.
3. `crmFetch` com `success:true` → retorna `data`.
4. `crmFetch` com `success:false` → `CrmError` com a mensagem do CRM, **sem o token**.
5. status 401/403/422/429/5xx → `CrmError` com o status certo.
6. token jamais aparece na mensagem de erro (fetch mockado devolvendo o token no corpo).

## Quem consome (as 5 skills do eixo-lead)

- `/roi` — `getReports` + `listDeals` + `listInvoices`, cruza com gasto de ads (do
  `/analisar-ads`); calcula faturamento influenciado/CAC/ROI (a lib só traz o dado).
- `/leads` — `createContact` (lead da página/ads) + `listContacts` (status).
- hub multi-cliente — `getReports`/`listContacts` por tenant (token do clone).
- `/depoimento` — reage a `deal.won` (webhook, PRD 3.3) ou poll de `listDeals`.
- `/reativar` — lê inativos; o CRM já faz o follow-up, a skill parametriza.

## Ordem de construção (quando o token sair)

1. `lib-crm.mjs` + `lib-crm.test.mjs` (TDD) — esta fundação.
2. `/roi` (⭐ maior alavanca) — prova a lib com a skill de maior valor.
3. hub multi-cliente. 4. `/leads` + `/depoimento`. 5. `/reativar`.

## Pré-condições pra desbloquear (do lado CRM — PRD)

- [ ] Service token por tenant no ar (PRD 3.1) — **bloqueia tudo**.
- [ ] Prefixo `/api` confirmado + filtros `from/to/channel/status` nos GETs (PRD 3.4).
- [ ] (pro /roi por campanha) UTM no Contact (PRD 3.2).
- [ ] (pro /depoimento em tempo real) webhook (PRD 3.3) — senão começa por poll.

## Arquivos (quando implementar)

- Criar: `scripts/lib-crm.mjs` + `scripts/lib-crm.test.mjs`.
- `.env.example`: `CRM_BASE_URL`, `CRM_TOKEN`.
- Depois, as 5 skills consomem a lib (cada uma seu spec).
