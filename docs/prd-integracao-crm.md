# PRD — Integração ImpulsoX CRM v3 ↔ ImpulsoX-OS

> **Pra quem:** o desenvolvedor do ImpulsoX CRM v3 (Node 20 + Express + Prisma + Postgres).
> **O que é:** o que o CRM precisa ganhar pra o ImpulsoX-OS (sistema de marketing) plugar
> nele e entregar as 8 oportunidades da auditoria (`docs/auditoria-so-2026-06-23.md`).
> **Princípio:** o CRM é o DONO do dado de lead/venda/receita. O OS não duplica esse dado —
> ele ALIMENTA (lead novo da página/ads) e LÊ (pra ROI, relatório, reativação). O CRM já
> tem 80% do que precisa; este PRD é a ponte que falta.
> **Data:** 2026-06-23.

---

## 1. Contexto: por que isto existe

O CRM v3 foi desenhado pra falar com um **agente no WhatsApp**, não com o ImpulsoX-OS. O OS
é o sistema operacional de marketing da agência (50 skills: página, conteúdo, ads, SEO/GEO,
medição). A auditoria do OS achou que a alavanca de R$5k→R$10k+ por cliente está em **provar
dinheiro** (ROI lead→venda) e **operar a carteira** (hub multi-cliente) — e isso só existe se
o OS conversar com o CRM, que é onde o dinheiro e o lead moram.

Sem esta ponte, o `/relatorio` do OS diz "geramos N leads" (estimativa); com ela, diz
"geramos R$ X de receita influenciada" (fato do CRM). Essa é a diferença que sustenta o preço.

---

## 2. O que o CRM JÁ tem (não construir de novo)

Confirmado pelo dono (schema + rotas):

| Capacidade | No CRM | A oportunidade do OS que isso já cobre |
|---|---|---|
| Captura/gestão de lead | `Contact` (status funil, leadScore, channel, lastInteractionAt) | `/leads` (o OS alimenta e lê, não recria) |
| Pipeline de vendas | `Deal` (value, stage, closedAt, closeReason) | base do `/roi` |
| Receita real | `Invoice` (value, status open/paid, paidAt) | o "dinheiro que entrou" do `/roi` |
| Follow-up / reativação | cron + e-mail (lead parado, cliente inativo, pós-atendimento, aniversário) | **`/reativar` já existe no CRM** — o OS só dispara/parametriza |
| Agregados | `/dashboard`, `/reports` | fonte pronta pro `/roi` e `/relatorio` |
| Import em lote | `/csv` | entrada de lead em massa |
| Multi-tenant | `tenant_id` por coluna, do JWT | base do **hub multi-cliente** |
| API REST + envelope | `res.success(data)` / `res.fail(err, status)` | contrato consistente pro OS |

**Conclusão:** das 8 oportunidades, o CRM já resolve o miolo de 4 (`/leads`, `/roi`,
`/reativar`, hub). O OS vira a CAMADA DE MARKETING por cima; o CRM continua dono do dado.

---

## 3. O que o CRM PRECISA GANHAR (o trabalho deste PRD)

Três decisões técnicas + dois itens menores. Cada decisão traz a **recomendação (A)** e a
**alternativa (B)** documentada — o dono crava na revisão.

### 3.1. DECISÃO — Autenticação do OS no CRM 🔴 bloqueante

Hoje o CRM só tem JWT de **usuário humano + 2FA TOTP**. Automação (cron do OS, hub varrendo
clientes) não pode depender de 2FA nem de token que expira a cada sessão.

**▶ Recomendação A — Service token por tenant (novo no CRM).**
- Um tipo de credencial de MÁQUINA: API key longa, escopada a UM `tenant_id`, sem 2FA,
  revogável, com escopo de permissão (ex: `leads:write`, `reports:read`).
- Gerada na tela de Settings do tenant ("Integrações → gerar chave de API").
- O OS guarda essa chave no `.env` do clone daquele cliente (`CRM_TOKEN=...`,
  `CRM_TENANT=...`), nunca commitada.
- Implementação: tabela `ApiKey` (hash da chave, tenant_id, scopes, revoked_at,
  last_used_at); middleware aceita `Authorization: Bearer <api_key>` além do JWT humano,
  resolve o `tenant_id` da chave (mantém o isolamento intacto), e checa scope por rota.
- **Por que A:** é o padrão de máquina-fala-com-máquina. Mantém o isolamento por tenant
  (cada cliente = uma chave), é revogável sem mexer em senha humana, e o cron do OS nunca
  trava em 2FA.

**Alternativa B — reusar JWT de usuário.** OS loga como um usuário-robô e usa o JWT. Nada
novo no CRM, mas 2FA atrapalha, o token expira (refresh constante no cron) e revogar = trocar
senha. Frágil. **Não recomendado** pra automação.

### 3.2. DECISÃO — Atribuição: UTM granular no Contact 🟡 alto valor

Hoje o `Contact` tem só `channel` categórico (whatsapp/site/instagram/indicacao). Sem UTM, o
`/roi` atribui lead→**canal**, não lead→**campanha exata**. "Instagram deu 12 leads" é fraco;
"a campanha `reels-oferta-junho` deu 12 leads e R$ 8k" é o argumento de 10k.

**▶ Recomendação A — adicionar UTM ao Contact.**
- Campos novos no `Contact`: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
  `utm_content` (todos opcionais, string).
- O `/csv` passa a aceitar essas colunas no import.
- O endpoint de criar lead (ver 3.3) aceita esses campos no body.
- O formulário/landing do OS captura os UTMs da URL e manda junto.
- **Por que A:** sem isso, o `/roi` não fecha o circuito "qual ANÚNCIO deu qual venda" — que
  é exatamente a prova de ROI que justifica o ticket premium. É campo opcional: não quebra
  nada existente.

**Alternativa B — canal basta (UTM fica fase 2).** `/roi` atribui só por canal. Zero mudança
no CRM agora, mas atribuição grossa. Aceitável como MVP se o prazo apertar; perde o
diferencial de "campanha exata".

### 3.3. DECISÃO — Push de eventos (webhook) 🟡 destrava tempo-real

Hoje o CRM não dispara nada externo quando um lead entra ou um deal é ganho. Sem isso, o OS
só **puxa** (poll) quando uma skill roda.

**▶ Recomendação A — webhook de eventos-chave.**
- O CRM dispara `POST <url-do-OS>` em: **lead.created**, **deal.won**, **invoice.paid**
  (e opcional **contact.inactive** pra reativação).
- Config por tenant (Settings → webhook URL + secret pra assinar o payload HMAC).
- Payload mínimo: `{ event, tenant_id, entity_id, data, timestamp }`, assinado.
- **Por que A:** destrava reação em tempo real — ex.: `deal.won` dispara o `/depoimento`
  (pede prova social no momento do resultado, que é quando converte); o hub atualiza sem
  varrer tudo. É a diferença entre "sistema que lembra" e "sistema que reage".

**Alternativa B — OS só puxa (poll), sem webhook.** O OS consulta a API quando roda (`/roi`
sob demanda, hub varre no `/abrir`). Simples, nada novo no CRM, suficiente pra começar — mas
nada acontece "no momento". **Recomendação pragmática:** começar por **poll (B)** pra não
travar, e adicionar **webhook (A)** quando o `/depoimento` e o hub em tempo real entrarem. O
PRD pede A como meta; B destrava já.

### 3.4. Endpoints que o OS vai consumir (confirmar que existem/retornam o necessário)

O OS precisa, via API REST (prefixo a confirmar — provável `/api`), com envelope `success/fail`:

| OS precisa | Endpoint provável | Detalhe a confirmar |
|---|---|---|
| Criar lead (da página/ads) | `POST /api/contacts` | aceita `channel` + (se 3.2-A) `utm_*`? |
| Listar leads por período/canal | `GET /api/contacts?from&to&channel` | filtro por data e canal existe? |
| Deals do período | `GET /api/deals?from&to&stage&closeReason` | dá pra filtrar ganho/perdido por data? |
| Invoices pagas | `GET /api/invoices?status=paid&from&to` | `paidAt` no retorno? |
| Agregado pronto | `GET /api/reports` | que recortes já entrega? (por canal? por período?) |
| Import em lote | `POST /api/csv` | colunas aceitas; (se 3.2-A) inclui `utm_*`? |

**Ação do dev do CRM:** confirmar o prefixo real e se esses filtros (`from`/`to`/`channel`/
`status`) já existem nos controllers; onde faltar filtro, é ajuste pequeno (where do Prisma).

### 3.4-bis. Endpoint `POST /api/chat` — runtime do agente-IA da página 🟡 alto valor

A skill `/agente-ia` do OS coloca um agente conversacional (SDR que qualifica e captura
lead) na landing page. A página é HTML estático — o runtime tem que viver no CRM, que já tem
`@anthropic-ai/sdk` (Haiku). **O OS entrega o widget + a persona; o CRM implementa o
endpoint.**

```
POST /api/chat
Headers: x-tenant: <tenant_id ou chave pública do site daquele tenant>
Body: {
  messages: [{role:"user"|"assistant", content}],   // histórico da conversa
  system: "<persona gerada pelo /agente-ia>",        // ou referenciada por id no CRM
  page_context: { url, oferta_em_foco }
}
Resposta (envelope success/fail): {
  reply: "...",
  capture: null | { name, contact, channel:"site", necessidade, utm? }
}
```
- O CRM chama a Claude (Haiku) com o `system` recebido + `messages`, devolve `reply`.
- Quando o agente fecha o lead, devolve `capture` preenchido → o CRM cria o `Contact`
  (channel=site, + utm se 3.2-A).
- **Segurança:** key da Claude só no CRM (nunca no front); **rate-limit por tenant
  obrigatório** (chat público é alvo de abuso/custo); validar/limitar tamanho do `system` e
  do histórico.
- **Por que vale:** é o diferencial "IA-Ready" que o cliente vê e toca, e um canal de lead
  novo (site→Contact) direto no CRM. Reusa o SDK que o CRM já tem.

### 3.5. Itens menores

- **PII cifrada (AES-256-GCM):** email/phone/documento vêm cifrados/HMAC, não em claro. O OS
  **não precisa** do PII em claro pra ROI/relatório (trabalha com agregado + id). Confirmar
  que os endpoints de listagem/relatório retornam o que o OS precisa SEM exigir decifrar PII
  (nome/empresa em claro pra exibir no hub é ok; email/telefone não são necessários pro OS).
- **Rate limit:** definir um limite sensato pro service token (o hub pode varrer N tenants;
  o cron do OS roda periódico). Documentar o limite pro OS respeitar.

---

## 4. Escopo das 8 oportunidades à luz do CRM

Reclassificadas agora que sabemos o que o CRM faz:

| # | Oportunidade | Veredito | O que é, de fato |
|---|---|---|---|
| O1 | `/leads` | **integração** | OS manda lead novo (página/ads, com UTM) pro `POST /contacts`; lê status. NÃO recria captura. |
| O2 | `/roi` | **integração** ⭐ | OS cruza gasto-de-ads (do `/analisar-ads`) com `channel`/`utm` + `Deal.value` + `Invoice.paid`. O dado de receita é do CRM. |
| O3 | `/reativar` | **já existe no CRM** | O CRM já faz follow-up de inativo. OS só PARAMETRIZA a régua e gera o conteúdo do e-mail na voz da marca. Quase nada de skill nova. |
| O4 | `/intake` | **OS puro** | Onboarding comercial pós-fechamento (acessos, pixels, KPI). Não toca no CRM. Pode FECHAR criando o tenant/contato no CRM via API. |
| O5 | `/depoimento` | **integração leve** | Dispara quando `deal.won` (webhook 3.3-A) ou por poll; gera o pedido de prova + vira peça pro `/provas`. |
| O6 | `/concorrente` | **OS puro** | Vigia competitiva (Ad Library, preço, cadência). Não toca no CRM. |
| O7 | Hub multi-cliente | **integração** | `/painel` + `/abrir` leem o CRM por tenant (1 chave por cliente) → visão de carteira. Depende de 3.1 (auth por tenant). |
| O8 | Agente-IA na página | **OS puro (+ alimenta CRM)** | Assistente que qualifica visitante 24/7; o lead que ele gera entra via `POST /contacts` (O1). |

**Ordem de construção (lado OS), depois que o CRM ganhar 3.1:**
1. **Ponte `lib-crm.mjs`** (auth service-token + chamadas REST + envelope) — fundação de tudo.
2. **`/roi`** (⭐ maior alavanca) — prova a ponte com a skill de maior valor.
3. **Hub multi-cliente** (`/painel`/`/abrir` por tenant) — depende da mesma ponte.
4. **`/leads`** (alimenta o CRM) + **`/depoimento`** (reage a deal.won).
5. **`/reativar`** (parametriza o que o CRM já faz).
6. **`/intake`, `/concorrente`, agente-IA** (OS puro, não bloqueados pelo CRM — podem rodar em paralelo).

---

## 5. Resumo executivo pro dev do CRM (o que fazer, em ordem)

1. **🔴 Service token por tenant** (3.1-A) — tabela `ApiKey` + middleware Bearer + scopes +
   tela de gerar/revogar em Settings. **Bloqueia tudo do lado OS.** Faça primeiro.
2. **🟡 Campos UTM no `Contact`** (3.2-A) — migration + aceitar no `POST /contacts` e no
   `/csv`. Destrava ROI por campanha.
3. **🟡 Filtros de período/status nos GETs** (3.4) — `from`/`to`/`channel`/`status` onde
   faltar. Ajuste de `where` no Prisma.
4. **🟡 Endpoint `POST /api/chat`** (3.4-bis) — runtime do agente-IA da página (chama Haiku
   com o system+messages, devolve reply + capture→Contact). Rate-limit por tenant
   obrigatório. O widget e a persona já vêm prontos do OS (skill `/agente-ia`).
5. **🟢 Webhook de eventos** (3.3-A) — `lead.created`/`deal.won`/`invoice.paid` por tenant.
   Pode vir depois (OS começa por poll); necessário pro `/depoimento` em tempo real e hub vivo.
6. **🟢 Confirmar:** prefixo real (`/api`?), o que `/reports` já agrega, e que os GETs de
   listagem não exigem decifrar PII pro OS.

Quando 1-3 estiverem no ar, o OS começa pela `lib-crm.mjs` + `/roi`. O dono crava as
escolhas A/B na revisão deste PRD.
