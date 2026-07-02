# Backlog — as 8 oportunidades da auditoria SO

> Rastreio vivo do que foi feito e do que espera o quê. Atualizado em 2026-07-01.
> Origem: `docs/auditoria-so-2026-06-23.md`. Ponte com o CRM: `docs/prd-integracao-crm.md`.

## 📍 Onde paramos (2026-07-01)

Feito nesta sessão:
- Leitura do CRM verificada e2e (smoke ao vivo passou — ver "GATE E2E FECHADO" abaixo).
- `lib-roi.mjs` **endurecido**: guardas de entrada (receita/gasto/clientesNovos NaN ou
  negativo → erro claro; `formatarBRL` rejeita não-número). Matemática inalterada. Testes:
  lib-roi 11/11, lib-crm 8/8. Commit `5e48f34`.
- Backup na nuvem: 2 commits empurrados pra `impulsoxai/impulsox-os` (branch
  `melhoria-pagina-cinematografico-kie`).

**🔴 BLOQUEIO ABERTO — servidor do CRM está DOWN.** `http://100.103.213.22:3001` respondeu
200 no smoke (2026-06-24) e depois caiu (ping = 000/timeout em 2026-07-01). **Ação: pedir ao
dev do CRM pra subir os servidores.** Enquanto down, nada de CRM ao vivo roda.

Espera o server voltar:
- [ ] Rodar `/roi` com dado real (leitura já provada; só precisa do server no ar + token `data:read` que já está no `.env`).
- [ ] **Gerar chave `leads:write`** — self-service na aba Integrações do CRM (precisa da interface web no ar). Não depende do dev além de subir o server.
- [ ] Validar o **write path** ao vivo (`POST /contacts` com contato-teste "TESTE OS") — hoje só testado em mock.

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

## ✅ GATE E2E FECHADO — CRM vivo verificado (2026-06-24)

Dev entregou a ligação completa (runbook `integracao-os-runbook.md`, sub 0+1+2+3+chat).
Smoke ao vivo na tailnet (`http://100.103.213.22:3001/api`, token read-only `ixk_live_`):
- `GET /reports` → 200, shape `{receitaTotal:{value,trend},ticketMedio,receitaPorMes,dealsPorMes,leadsPorCanal,topClientes}`; `receitaDeReports()` lê `.value` certo.
- `/contacts` `/deals` `/invoices` → todos `{items,total,page,pageSize}` (bate o runbook).
- Filtro `from/to/stage` ok; `from>to` → 422 com mensagem certa. Bearer ok, token não vaza.
- **Caminho de LEITURA (base de /roi + /carteira) = lib-crm casa com o CRM vivo.** ✓

## 🔧 Gaps reais do lado OS (triados — nenhum bloqueia /roi)

- [ ] **CSV em massa** — `importCsv` na lib aponta pro `POST /csv` antigo; real = fluxo 4
  passos `/csv/upload→/map→/preview→/import` (runbook §1). *Consertar junto com `/leads`
  import em massa, com token `leads:write` (read-only não testa write).*
- [x] **Webhook → POLL (decidido 2026-06-24).** Não construir receptor agora. `/depoimento`
  e `/carteira` leem por poll (`GET /deals?stage=ganho&from&to`) quando a skill roda — segue
  PRD §3.3 "começar por poll". Receptor HMAC 24/7 (Tailscale Funnel) só quando o hub estiver
  vivo + volume justificar servidor público. **Não é trabalho pra agora.**

## 🟡 Melhorias do CRM que afinam (não bloqueiam)

- [ ] **UTM no Contact** (PRD 3.2) — destrava `/roi` por campanha (hoje atribui só por canal).
  Dev marcou como sub 1; widget já manda utm no `page_context`.

## Lembrete pro dono

- `.env` do OS preenchido com `CRM_BASE_URL` + `CRM_TOKEN` (read-only `data:read`, gitignored).
  Quando ligar escrita (`/leads` criando Contact), trocar por token com `leads:write`.
- Pendência paralela (não-CRM): rodar **`/atualizar-motor`** nos clones pra propagar o motor.
