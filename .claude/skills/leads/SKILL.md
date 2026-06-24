---
name: leads
description: >
  Use pra registrar e acompanhar o lead que o marketing gerou — "/leads", "cadastra esse
  lead", "entrou um lead", "lista meus leads", "como estão os leads do mês", "manda esses
  contatos pro CRM". Manda o lead da página/ads/agente-IA pro CRM (Contact, channel=site/
  ads/etc.) e lê o status do funil de lá. NÃO é captura nova — o lead é DONO do CRM; esta
  skill é a ponte do OS pra ele. Lê o CRM via lib-crm (service token). Não duplica o CRM.
---

# /leads — A ponte do OS pro lead no CRM

O lead que a `/pagina`, o `/ads-*` ou o `/agente-ia` geram precisa virar registro no CRM —
onde o funil, o follow-up e a receita já vivem. Esta skill é essa ponte: manda o lead pro
`Contact` e lê o status de lá. Não recria captura nem guarda lead paralelo — o CRM é o dono.

Autoria: ImpulsoX AI. Conteúdo original.

## Fronteira (o que esta skill é e o que NÃO é)

- O **CRM** é dono do lead (Contact, leadScore, status funil, follow-up). Não duplicar.
- O **`/agente-ia`** captura o lead na página e o CRM cria o Contact direto (via `/api/chat`
  → tool `capturar_lead`). Pra esse caminho, `/leads` só LÊ o status depois.
- `/leads` serve pra: (a) mandar lead que veio por fora (lista, export de ads, formulário
  avulso) pro CRM; (b) consultar o status/volume dos leads pro dono.

## Degrau mínimo (Escada de Contexto)

Degrau 4 (CRM no ar): precisa de `CRM_TOKEN` no `.env`. Sem token, para e instrui a gerar a
chave (não inventa lead nem guarda paralelo).

## O que ler antes

- `.env` do clone: `CRM_BASE_URL` + `CRM_TOKEN` (service token `ixk_live_`, scope que
  permita escrever Contact). Sem isso, parar.
- `producao/ads/analise-<data>.md` — se for importar leads de uma campanha, o contexto do canal.

## Como roda

1. **Config.** `crmFromEnv()` da `scripts/lib-crm.mjs`. Sem token → instruir o dono.
2. **Modo registrar** ("entrou um lead", "cadastra"): montar o Contact e `createContact(c,
   {name, contact, channel, necessidade?})`. `channel` categórico (site/ads/whatsapp/
   indicacao). Dedupe é do CRM (por telefone/email) — não checar duplicado à mão.
   - **UTM:** pode mandar no payload, mas o CRM só grava UTM depois do sub 1 da F-OS (PRD
     3.2); até lá fica em `channel`. Não bloquear.
3. **Modo importar em lote** (lista/CSV de campanha): `importCsv(c, ...)` via `/csv` do CRM.
4. **Modo consultar** ("lista meus leads", "como estão"): `listContacts(c, query)` →
   mostrar volume por canal e status do funil. (Filtro por período espera o sub 2 do PRD;
   usar o que o CRM entregar e marcar a janela.)
5. **Entregar** o resultado: o que entrou / o status atual. Marcar fato (CRM) vs pendência.

## Regras

- **CRM é a fonte.** Nunca guardar lead em arquivo do OS paralelo ao CRM.
- **Nunca ler o Postgres direto** — só pela API (isolamento por tenant).
- **Token nunca em log** — a `lib-crm` já redige.
- **Só dado real** — não inventar lead nem status. Sem CRM, marca pendente.
- **PII:** o OS manda o lead pro CRM; o CRM cifra (AES-256-GCM). O OS não guarda PII em claro.
- É MOTOR: nasce no template, desce via `/atualizar-motor`.

## Quem alimenta / quem consome

- Alimentam: `/agente-ia` (via /api/chat, direto no CRM), `/pagina` (formulário), `/ads-*`
  (export). `/leads` cobre o caminho manual/lote e a consulta.
- Consome: `/roi` (lê os leads por canal pra cruzar com gasto), hub (volume por tenant).

## Teste de aceitação (comportamental)

1. "Entrou um lead João, WhatsApp X" → `createContact` com channel; CRM dedupe; confirma.
2. Sem `CRM_TOKEN` → para e instrui gerar a chave; não cria lead paralelo.
3. "Como estão meus leads" → `listContacts` → volume por canal/status, janela marcada.
4. Lead com UTM → manda no payload; grava em channel até o sub 1 (declarar isso).

---

**✓ Pronto:** lead no CRM (Contact, channel certo) ou status do funil lido · **→ próximo passo:** `/roi` (cruza os leads com o gasto) ou `/relatorio` (leva pro cliente). Pré-requisito: `CRM_TOKEN` no `.env`; se faltar, o sistema reorienta.
