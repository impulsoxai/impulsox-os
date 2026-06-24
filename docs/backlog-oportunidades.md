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

### ✅ GATE PASSADO — ponte validada com dado real (2026-06-23)
Dono rodou `GET /reports` com `ixk_live_` → 200, `data.receitaTotal.value` etc. Autenticação,
scope e payload corretos. As 4 restantes foram construídas.

## ✅ Restantes do eixo-lead — FEITAS (v0.2.8)

| # | Skill | Estado |
|---|---|---|
| O1 | `/leads` | ✅ ponte do lead pro Contact + lê status |
| O7 | `/carteira` | ✅ hub multi-cliente (1 token/tenant, semáforo de saúde) |
| O3 | `/reativar` | ✅ segmenta inativos + win-back na voz; CRM dispara |
| O5 | `/depoimento` | ✅ gatilho por poll (deal ganho → pedido do /provas); webhook=fase 2 |

**AS 8 OPORTUNIDADES ESTÃO FEITAS.** Pendências do CRM que melhoram (não bloqueiam):
UTM no Contact (atribuição por campanha no /roi) e webhook (depoimento em tempo real).

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
