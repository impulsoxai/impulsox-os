---
name: agente-ia
description: >
  Use pra colocar um agente de IA conversacional na landing page — "/agente-ia", "põe um
  chat na página", "assistente na minha página", "atendente IA 24/7", "chatbot que captura
  lead", "quero IA na landing". Gera o widget de chat na marca (injetável na página do
  /pagina) + a persona do agente (SDR que qualifica e captura lead) do núcleo do cliente.
  O runtime (chamar a Claude + capturar o lead) vive no CRM via POST /api/chat — o widget
  só "liga" quando esse endpoint existir. Add-on premium da /pagina, alimenta o /leads.
---

# /agente-ia — SDR conversacional na página

Em 2026, página "IA-Ready" premium é esperada com um assistente que qualifica o visitante
24/7 — não só estar citável por IA (isso o `/seo`/`/geo` já fazem). Esta skill entrega IA
NA página: um agente que responde, qualifica e captura o lead como um SDR. É o diferencial
que o cliente vê e toca, e um upsell natural sobre a página de R$5k.

Autoria: ImpulsoX AI. Conteúdo original.

## Fronteira OS × CRM (o que esta skill faz e o que NÃO faz)

A página é HTML estático; um chat com a Claude precisa de runtime pra chamar a API sem
expor a key. Decisão: **o runtime vive no CRM** (`@anthropic-ai/sdk`+Haiku que ele já tem).

- **Esta skill (OS) entrega — construível agora:**
  1. O **widget** na marca (injetável na página).
  2. A **persona** do agente (system prompt, do núcleo).
  3. O **contrato** de chamada ao `POST /api/chat`.
- **O CRM entrega — item do PRD (`docs/prd-integracao-crm.md`):** o endpoint `POST /api/chat`
  (runtime + key + captura do lead no Contact). **Sem ele o widget não conversa** — fica em
  estado desabilitado honesto até o endpoint existir.

## Degrau mínimo (Escada de Contexto)

Roda no degrau 2 (página + marca existem). Sem página, reorientar pra `/pagina`. O widget é
gerado mesmo sem o CRM no ar (estado desabilitado até o `/api/chat` responder).

## O que ler antes

- `nucleo/ofertas.md` — **só ofertas ATIVAS** entram na persona (nunca roadmap/futura).
- `nucleo/provas.md` — só prova autorizada; o agente nunca inventa número/caso.
- `nucleo/voz.md` — o agente fala na voz da marca, não como bot genérico.
- `nucleo/negocio.md` — o que o negócio entrega (o agente não afirma o que não está aqui).
- `marca/tokens.css` + `marca/design-guide.md` — o widget sai na identidade do cliente.
- `docs/persuasao.md` — persuasão honesta (não promete o que a oferta não sustenta).
- A página em `producao/paginas/<slug>/` — onde o widget vai ser injetado.

## A persona = SDR 24/7 (qualifica + captura)

Não é FAQ passivo. Comportamento, nesta ordem:
1. **Responde** a dúvida (oferta, preço se exposto, como funciona) — ganha confiança.
2. **Qualifica** — entende a necessidade/dor real com 1-2 perguntas naturais.
3. **Captura** — no interesse real, pede o contato e encaminha pro WhatsApp/form; o lead
   entra no CRM com `channel=site` (+ UTM quando a ponte existir).

Molde do system prompt em `references/persona-template.md`.

## O widget

Molde em `references/widget-base.md`. Regras:
- Na marca (`marca/tokens.css`) — cor, fonte, raio, sombra do cliente. Nunca default genérico.
- Bolha + janela de chat; abre/fecha suave; respeita `prefers-reduced-motion`.
- Acessível: foco visível, navegável por teclado, contraste mínimo 4.5:1, `aria-label`.
- Chama `POST /api/chat` (ver contrato) com a chave PÚBLICA do tenant (`data-site-key` →
  header `x-impulsox-site`). **Estado desabilitado honesto** quando falta endpoint/chave ou
  o endpoint não responde: mostra "fale no WhatsApp" em vez de fingir que conversa.
- Nenhum **segredo** no front — só a chave pública (`ixs_pub_`, sem poder de ler/escrever
  dado); o service token secreto e a persona ficam no CRM.

## Contrato `POST /api/chat` (o CRM implementa — está no PRD)

```
POST /api/chat
Headers:
  Content-Type: application/json
  x-impulsox-site: ixs_pub_<key>        // chave PÚBLICA do tenant (resolve o tenant no CRM)
Body: {
  messages: [{role, content}],          // histórico — SEM system (persona fica no CRM)
  page_context: { url, oferta_em_foco }
}
Resposta (envelope success/fail do CRM): {
  reply: "...",
  capture: null | { name, contact, channel:"site", necessidade, utm? }
}
```
- **Identidade do tenant:** a chave pública `ixs_pub_...` (do `data-site-key` do embed),
  nunca o `tenant_id` cru. Escopo `chat:public`. É pública por desenho; se vazar, o dano
  máximo é abusar do chat daquele tenant (contido por rate-limit). O service token secreto
  (`ixk_live_...`) NUNCA vai pro front.
- **Persona guardada no CRM por tenant** — não vai no body. O OS sobe a persona uma vez via
  o endpoint de gestão do CRM (JWT-only); a chave resolve o tenant → o CRM carrega a persona.
- `capture` preenchido → o CRM cria o `Contact` (channel=site) server-side; o widget não
  mexe em PII no front.

## Regras (duras, herdadas)

- **Só oferta ATIVA.** O agente nunca menciona roadmap/futura, nem "em breve".
- **Só prova autorizada.** Nunca inventa número, caso ou depoimento.
- **Não promete o que a página/oferta não sustenta** (persuasão honesta).
- **Voz da marca** sempre; não afirma fato do negócio que não está no núcleo — oferece falar
  com um humano.
- Key da Claude **nunca** no front — só no CRM. Rate-limit por tenant é item do PRD.
- É MOTOR: nasce no template, desce via `/atualizar-motor`.

## Fluxo

1. **Pré-requisito.** Página pronta + núcleo (ofertas ATIVAS, voz, provas). Se falta,
   reorientar. Avisar que o chat só "liga" quando o `/api/chat` do CRM existir.
2. **Gerar a persona** do núcleo (ofertas ATIVAS, voz, provas, regra de captura).
3. **Gerar o widget** na marca, acessível, com estado desabilitado honesto.
4. **Entregar** em `producao/paginas/<slug>/agente/` (widget + persona) + instrução de
   instalação + o contrato de `/api/chat`.
5. **Fechar** apontando o próximo passo.

## Teste de aceitação (comportamental)

1. Página + núcleo prontos → gera widget na marca + persona do núcleo + instrução.
2. Núcleo tem oferta FUTURA → a persona NÃO a menciona (só ATIVAS).
3. Sem prova autorizada → a persona não inventa número; oferece falar com humano.
4. `/api/chat` ainda não existe → widget instala em estado desabilitado honesto; não quebra
   a página nem finge responder.
5. Lead fechado → contrato manda `capture` pro CRM criar o Contact (channel=site).

---

**✓ Pronto:** widget de chat na marca + persona SDR (do núcleo) + contrato de instalação em `producao/paginas/<slug>/agente/` · **→ próximo passo:** publicar a página com o widget (`/publicar`); o chat liga quando o `POST /api/chat` do CRM existir (item do `docs/prd-integracao-crm.md`). O lead capturado alimenta o `/leads`. Pré-requisito: página pronta (`/pagina`) + núcleo; se faltar, o sistema reorienta.
