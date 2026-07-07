# PRD — Aba "Agente" no hub do CRM v3 (Mission Control do Hermes)

> **Pra quem:** dev do CRM v3. **Solicitante:** ImpulsoX AI (dona). **Data:** 2026-07-07.
> **Contexto:** o ImpulsoX vai operar um agente autônomo ("Hermes") no mesmo VPS do CRM.
> O hub do CRM ganha a camada de VISIBILIDADE dessa operação — onde a dona vê o que o
> agente fez, está fazendo e vai fazer, sem abrir terminal. Spec de origem:
> `docs/ideia-hermes-gerente-crm.md` (seção "Camada de visibilidade").
> **Importante:** este PRD NÃO depende do agente existir. A aba nasce pronta (schema +
> API + UI); o Hermes, quando entrar, só passa a escrever nos endpoints.

---

## 1. Objetivo

Uma aba "Agente" no hub que mostre, por tenant: execuções (runs) com status e logs,
jobs agendados com próxima execução, tarefas bloqueadas em destaque, artefatos por run,
resumo de atividade — e o kill switch. Controlada por feature flag por tenant.

## 2. Fora de escopo (não construir agora)

- O agente em si (Hermes) — outro projeto.
- Notificações push/WhatsApp de eventos do agente (fase futura; o agente mesmo alerta).
- Qualquer teaser/upsell da aba pra tenant sem a flag (regra da casa: oferta não ativa
  não aparece nem como "em breve").

## 3. Feature flag

- Campo novo no tenant: `agente_ativo` (boolean, default `false`).
- `false` → a aba NÃO renderiza (nem menu, nem rota; 404/403 no acesso direto).
- Editável só pelo papel admin/owner do hub.

## 4. Modelo de dados (sugestão — dev adapta ao padrão do CRM)

**`agent_runs`** — uma linha por execução do agente:
`id · tenant_id · job_id (nullable, se veio do scheduler) · task_type (ex.: brief-diario,
monitor-review, outreach) · status (queued | running | done | failed | blocked) ·
started_at · ended_at · summary (texto curto, SEM conteúdo sensível) · log (texto ou
ref a arquivo; ver §7) · artifacts (JSON: [{nome, path/url}]) · created_at`

**`agent_jobs`** — jobs recorrentes do scheduler:
`id · tenant_id · nome · cron_expr · enabled (bool) · last_run_at · next_run_at ·
lock_até (timestamp — trava anti-sobreposição; ver §6) · created_at`

**`agent_killswitch`** — estado global por tenant (ou global do sistema):
`tenant_id (nullable = global) · ativo (bool) · ativado_por · ativado_em · motivo`

## 5. API (REST, mesmo padrão da API v3 — service token `ixk_live_`, escopo próprio ex.: `agent:write`/`agent:read`)

| Método | Rota | Quem usa | Faz |
|---|---|---|---|
| POST | `/api/agent/runs` | Hermes | registra run nova (status queued/running) |
| PATCH | `/api/agent/runs/:id` | Hermes | atualiza status/summary/log/artifacts ao terminar |
| GET | `/api/agent/runs?tenant=&status=&period=` | hub | lista runs (paginado) |
| GET | `/api/agent/runs/:id` | hub | detalhe com log |
| POST/PATCH | `/api/agent/jobs` | Hermes/admin | cria/edita job agendado |
| GET | `/api/agent/jobs?tenant=` | hub | lista jobs com next_run |
| POST | `/api/agent/jobs/:id/lock` | Hermes | adquire trava antes de rodar (ver §6) |
| GET | `/api/agent/summary?tenant=&period=` | hub | contadores agregados (runs por status/tipo, ações executadas) |
| POST | `/api/agent/killswitch` | admin (owner only + confirmação) | liga/desliga; Hermes CONSULTA antes de cada run |
| GET | `/api/agent/killswitch?tenant=` | Hermes | estado atual |

Regra: o **CRM é o dono do dado** (mesmo princípio do lead). O Hermes escreve só pela
API, nunca no Postgres direto.

## 6. Scheduler — trava anti-sobreposição (requisito duro)

Job que ainda está rodando NÃO dispara de novo. Implementação sugerida: `POST
/jobs/:id/lock` adquire a trava (grava `lock_até = now + timeout do job`); se já há
trava vigente, responde 409 e o Hermes pula a execução registrando um run `status:
skipped` (ou similar). A trava expira sozinha por timestamp — processo morto não deixa
o job travado pra sempre.

## 7. Logs — o que pode e o que NÃO pode (requisito de segurança)

- Log de run guarda EVENTOS e metadados: o que rodou, quando, resultado, erro.
- **NUNCA no log:** conteúdo de prompt/conversa, PII de cliente final em claro, senha,
  token inteiro (se precisar referenciar credencial: últimos 4 caracteres).
- Retenção: logs de run 90 dias; sumários/contadores ficam (são o histórico de valor).
- Fonte dessas regras: seção "Segurança do Hermes" do doc de spec (logging sem conteúdo).

## 8. UI — duas visões

**8a. Visão ADMIN (dona) — fase 1, é o produto deste PRD:**
- Dashboard da aba: runs ativas · próximos agendamentos · conclusões recentes ·
  **card de BLOQUEADAS em destaque** (nada morre em silêncio) · falhas do período.
- Lista de runs com filtro (tenant, status, tipo, período) → detalhe com log e artefatos.
- Lista de jobs com cron legível ("todo dia 7h"), next_run, toggle enable/disable,
  botão "rodar agora".
- **Kill switch visível no topo** — botão com confirmação (digitar "DESLIGAR" ou
  equivalente), estado atual sempre visível, registro de quem/quando/motivo.

**8b. Visão CLIENTE — fase 2 (só especificar, não construir agora):**
- Card único de resumo de valor no painel do tenant: "seu agente respondeu N mensagens,
  agendou N, escalou N pra você este mês". Contadores do `/summary`, nunca logs.

## 9. Critérios de aceite

1. Tenant com `agente_ativo=false` não vê a aba e recebe 403/404 na rota direta.
2. `POST /runs` + `PATCH /runs/:id` com token de escopo `agent:write` funcionam; token
   de outro escopo recebe 403.
3. Dois `POST /jobs/:id/lock` simultâneos: o segundo recebe 409 (anti-sobreposição
   comprovada).
4. Run com status `blocked` aparece no card de destaque do dashboard da aba.
5. Kill switch ligado → `GET /killswitch` reflete na hora; registro de auditoria criado.
6. Log de run não contém PII nem credencial (revisão manual de amostra no aceite).
7. Nada disso quebra tenant existente sem a flag (regressão zero no hub atual).

## 10. Faseamento sugerido

- **F1 (este PRD):** flag + schema + API + aba admin + kill switch.
- **F2 (quando o agente lançar como produto):** card de valor na visão do cliente.
- Estimativa fica com o dev; do nosso lado não há dependência bloqueante — o Hermes
  consome quando existir.

---

*ImpulsoX-OS · PRD da camada de visibilidade do Hermes no CRM v3 · origem:
Mission Control (OpenClaw/Sprint) adaptado · 2026-07-07*
