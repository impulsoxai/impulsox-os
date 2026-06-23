# Backlog — as 8 oportunidades da auditoria SO

> Rastreio vivo do que foi feito e do que espera o quê. Atualizado em 2026-06-23.
> Origem: `docs/auditoria-so-2026-06-23.md`. Ponte com o CRM: `docs/prd-integracao-crm.md`.

## ✅ Feitas — as 3 OS-puro (v0.2.6, no GitHub)

| # | Skill | Estado |
|---|---|---|
| O6 | `/concorrente` | ✅ feita (commit bfd63e5) |
| O4 | `/intake` | ✅ feita (commit 1152606) |
| O8 | `/agente-ia` | ✅ widget+persona feitos; contrato `/api/chat` travado com o dev (af59d8e). **Liga quando o CRM gerar a `ixs_pub_` e o OS subir a persona via PUT /api/settings/persona.** |

## ⛔ Bloqueadas pelo CRM — as 5 do eixo-lead

Todas dependem da `lib-crm.mjs` (spec pronto:
`docs/superpowers/specs/2026-06-23-lib-crm-design.md`), que depende do **service token por
tenant** (PRD 3.1).

| # | Skill | O que faz | Espera |
|---|---|---|---|
| — | **`lib-crm.mjs`** | a ponte (auth+REST+envelope) — fundação das 5 | service token (PRD 3.1) |
| O2 | `/roi` ⭐ | cruza channel/utm × Deal.value × Invoice.paid → faturamento influenciado | lib-crm + (UTM 3.2 pra campanha exata) |
| O7 | hub multi-cliente | `/painel`/`/abrir` leem o CRM por tenant → visão de carteira | lib-crm (token por clone) |
| O1 | `/leads` | manda lead da página/ads pro Contact; lê status | lib-crm |
| O5 | `/depoimento` | reage a deal.won → pede prova → abastece /provas | lib-crm + webhook (3.3) ou poll |
| O3 | `/reativar` | parametriza o follow-up que o CRM JÁ faz (quase não é skill) | lib-crm |

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
