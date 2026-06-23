# /agente-ia — SDR conversacional na landing page (design)

> Data: 2026-06-23 · ImpulsoX-OS · Oportunidade O8 da auditoria. Parcialmente bloqueada
> pelo CRM (o runtime vive lá — ver `docs/prd-integracao-crm.md`).

## Problema

Em 2026 uma página "IA-Ready" premium é esperada com um **assistente conversacional** que
qualifica o visitante 24/7 — não só estar citável por IA (que `/seo`/`/geo` já cobrem). O
sistema otimiza pra IA LER a página, mas não entrega IA NA página. É um diferencial que o
cliente vê e toca, e um upsell natural sobre a página de 5k.

## Tensão central e a fronteira OS × CRM

A `/pagina` entrega HTML/CSS/JS **estático** (Vercel/Netlify). Um chat com a Claude precisa
de **runtime** pra chamar a API sem expor a key no front. Decisão: o runtime vive no **CRM**
(Node+Express, já tem `@anthropic-ai/sdk`+Haiku, já é multi-tenant, é onde o lead cai).

- **OS entrega (construível agora, sem o CRM no ar):**
  1. **Widget** — HTML/CSS/JS na marca (`marca/tokens.css`), injetável na página do
     `/pagina`. Bolha + janela; respeita `prefers-reduced-motion`; acessível (foco, teclado,
     contraste). Funciona "morto" até o endpoint existir (mostra estado desabilitado honesto).
  2. **Persona** (system prompt do agente) — o que ele sabe (ofertas ATIVAS, voz, prova
     autorizada), como qualifica, quando captura o lead. Gerada do núcleo do cliente.
  3. **Contrato de chamada** — request/response de `POST /api/chat` (definido aqui; o CRM
     implementa).
- **CRM entrega (vai pro PRD):** o endpoint `POST /api/chat` — runtime + key (via
  `@anthropic-ai/sdk`/Haiku) + system prompt recebido + captura do lead no `Contact` quando
  o agente fecha. **Sem esse endpoint, o widget não conversa** (fica bloqueado, como o
  eixo-lead).

## Persona = SDR 24/7 (qualifica + captura)

O agente não é FAQ passivo: é um SDR. Comportamento:
1. **Responde** a dúvida do visitante (oferta, preço se exposto, como funciona) — ganha
   confiança.
2. **Qualifica** — entende a necessidade/dor real com 1-2 perguntas naturais.
3. **Captura** — no momento de interesse real, pede o contato e encaminha pro WhatsApp/form;
   o lead entra no CRM com `channel` (+ UTM quando a ponte existir).

## Regras duras (herdadas do sistema)

- **Só oferta ATIVA** (`nucleo/ofertas.md`) — o agente NUNCA menciona roadmap/futura, nem
  "em breve". Expõe o cliente.
- **Só prova autorizada** (`nucleo/provas.md`) — nunca inventa número, caso ou depoimento.
- **Persuasão honesta** (`docs/persuasao.md`) — não promete o que a página/oferta não
  sustenta; escassez só real.
- **Voz da marca** (`nucleo/voz.md`) — o agente fala como o negócio, não como bot genérico.
- **Não inventa fato do negócio** — o que não está no núcleo, ele não afirma; oferece falar
  com um humano.

## Contrato de `POST /api/chat` (o que o CRM implementa)

```
POST /api/chat
Headers: x-tenant: <tenant_id ou chave pública do site>
Body: {
  messages: [{role:"user"|"assistant", content:"..."}],   // histórico da conversa
  system: "<persona gerada pelo /agente-ia>",              // OU referenciada por id no CRM
  page_context: { url, oferta_em_foco }                    // contexto da página
}
Resposta (envelope success/fail do CRM): {
  reply: "...",                 // a fala do agente
  capture: null | {             // preenchido quando o agente fecha o lead
    name, contact, channel:"site", necessidade, utm?:{...}
  }
}
```
Quando `capture` vem preenchido, o CRM cria o `Contact` (channel=site). O system prompt pode
ir no body OU ficar guardado no CRM por tenant (decisão do PRD; o body é o MVP).

## Segurança

- Key da Claude **nunca** no front — só no CRM (`/api/chat`).
- Rate-limit por tenant no endpoint (PRD) — chat público é alvo de abuso/custo.
- O widget manda só a conversa; nenhum segredo trafega pro browser.
- PII do lead capturado segue a cifragem do CRM (AES-256-GCM) — o widget só coleta e envia.

## Custo

Haiku no `/api/chat` (barato por conversa). O PRD define o rate-limit e um teto por tenant
pra não estourar. O custo é do runtime (CRM), não do OS.

## O que a skill `/agente-ia` produz

1. `producao/paginas/<slug>/agente/widget.html` (+ css/js) — o widget na marca, pronto pra
   injetar na página.
2. `producao/paginas/<slug>/agente/persona.md` — o system prompt do agente (das fontes do
   núcleo), revisável pelo dono.
3. Instrução de instalação: como injetar o widget na página e apontar pro `/api/chat`.

## Fluxo

1. **Pré-requisito.** Página pronta (`/pagina`) + núcleo (ofertas ATIVAS, voz, provas). Se
   falta, reorientar. Avisar que o chat só "liga" quando o `/api/chat` do CRM existir.
2. **Gerar a persona** do núcleo: ofertas ATIVAS, voz, provas autorizadas, regra de captura.
3. **Gerar o widget** na marca (`tokens.css`), acessível, com estado desabilitado honesto
   pra quando o endpoint não responder.
4. **Entregar** widget + persona + instrução de instalação + contrato de `/api/chat`.
5. **Fechar** apontando o próximo passo.

## Degrau mínimo

Roda no degrau 2 (página + marca existem). Sem página, reorienta pra `/pagina`. O widget é
gerado mesmo sem o CRM no ar (fica em estado desabilitado até o `/api/chat` existir).

## Teste de aceitação

1. Página + núcleo prontos → gera widget na marca + persona do núcleo + instrução.
2. Núcleo tem oferta FUTURA → a persona NÃO a menciona (só ATIVAS).
3. Sem prova autorizada → a persona não inventa número; oferece falar com humano.
4. `/api/chat` ainda não existe → widget instala em estado desabilitado honesto, não quebra
   a página nem finge responder.
5. Lead fechado pelo agente → contrato manda `capture` pro CRM criar o Contact (channel=site).

## Posição no fluxo

Add-on da `/pagina` (depois de pronta). Opcional/upsell — oferecido quando o dono quer o
diferencial IA-Ready; não empurrado. Alimenta o `/leads` (o lead do agente entra no CRM).

## Dependência registrada

Adicionar ao `docs/prd-integracao-crm.md` o item **`POST /api/chat`** (runtime + key + system
prompt + captura de lead), com o contrato acima.

## Arquivos

- Criar: `.claude/skills/agente-ia/SKILL.md` + `references/persona-template.md` +
  `references/widget-base.md` (molde do widget).
- Tocar: `pagina/SKILL.md` (fecho menciona o add-on `/agente-ia`), `docs/mapa-de-skills.md`,
  `docs/prd-integracao-crm.md` (item `/api/chat`), `CHANGELOG.md`.
