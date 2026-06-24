# Backlog — as 8 oportunidades da auditoria SO

> Rastreio vivo do que foi feito e do que espera o quê. Atualizado em 2026-06-23.
> Origem: `docs/auditoria-so-2026-06-23.md`. Ponte com o CRM: `docs/prd-integracao-crm.md`.

## ✅ Feitas — as 3 OS-puro (v0.2.6, no GitHub)

| # | Skill | Estado |
|---|---|---|
| O6 | `/concorrente` | ✅ feita (commit bfd63e5) |
| O4 | `/intake` | ✅ feita (commit 1152606) |
| O8 | `/agente-ia` | ✅ widget+persona feitos; contrato `/api/chat` travado com o dev (af59d8e). **Liga quando o CRM gerar a `ixs_pub_` e o OS subir a persona via PUT /api/settings/persona.** |

## ✅ CRM no ar — ponte + /roi FEITOS (v0.2.8)

CRM mergeou service token (`ixk_live_`) + chave pública (`ixs_pub_`).

| # | Item | Estado |
|---|---|---|
| — | **`lib-crm.mjs`** | ✅ feita, 7/7 testes (commit 85a8a06) |
| O2 | `/roi` ⭐ | ✅ feita + `lib-roi` 5/5 (commit 10f7a08). Atribuição por canal (UTM espera sub 1) |
| O8 | `/agente-ia` chat | ✅ ligado: persona via `PUT /api/settings/persona`, widget com `ixs_pub_` |

### 🔶 GATE: dono valida a ponte antes do resto
Antes de construir as 4 restantes sobre a `lib-crm`: o dono gera o `CRM_TOKEN` (aba
Integrações, scope `data:read`), põe no `.env`, roda `/roi` de verdade contra o CRM e
confirma que a ponte funciona. Validado → seguir.

## ⛔ Restantes do eixo-lead (depois da validação)

| # | Skill | O que faz | Espera |
|---|---|---|---|
| O7 | hub multi-cliente | `/painel`/`/abrir` leem o CRM por tenant → visão de carteira | validação + token por clone |
| O1 | `/leads` | manda lead da página/ads pro Contact; lê status | validação (POST /contacts já existe) |
| O5 | `/depoimento` | reage a deal.won → pede prova → abastece /provas | webhook (3.3) ou começa por poll |
| O3 | `/reativar` | parametriza o follow-up que o CRM JÁ faz (quase não é skill) | validação |

## 🔓 O que destrava (pré-condições do lado CRM — PRD)

- [ ] **Service token por tenant** (PRD 3.1) — 🔴 bloqueia TODAS as 5. *Status: dev
  entregou o sub 0 (service token) — confirmar que cobre o por-tenant pro OS.*
- [ ] **`ixs_pub_` (scope chat:public)** + **`PUT /api/settings/persona`** (PRD 3.4-bis) —
  liga o `/agente-ia`. *Status: contrato travado; dev vai implementar com o /api/chat.*
- [ ] **UTM no Contact** (PRD 3.2) — `/roi` por campanha (sem isso, ROI só por canal).
- [ ] **Filtros `from/to/channel/status` nos GETs** (PRD 3.4).
- [ ] **Webhook** lead.created/deal.won/invoice.paid (PRD 3.3) — `/depoimento` em tempo
  real e hub vivo (senão começa por poll).

## ▶ Ordem quando o token sair

1. `lib-crm.mjs` + teste (TDD) — a fundação.
2. `/roi` (⭐ maior alavanca — prova a lib).
3. hub multi-cliente.
4. `/leads` + `/depoimento`.
5. `/reativar`.

## Lembrete pro dono

- Quando o **service token por-tenant** estiver acessível pro OS, avisar → começo pela
  `lib-crm.mjs`.
- Quando a **`ixs_pub_` + settings/persona** existirem, fecho o último passo do
  `/agente-ia` (subir a persona + setar a chave no embed) — aí o chat liga de verdade.
- Pendência paralela (não relacionada ao CRM): rodar **`/atualizar-motor`** nos clones pra
  propagar v0.2.4 → v0.2.6.
