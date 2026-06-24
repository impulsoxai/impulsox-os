---
name: reativar
description: >
  Use pra reativar lead frio, lista parada ou ex-cliente — "/reativar", "reativar base",
  "lead parado", "cliente sumido", "win-back", "campanha pra quem não compra faz tempo",
  "tem gente na minha lista que esfriou". Acha quem esfriou no CRM (lead inativo, cliente
  sem compra recente) e gera a sequência de reativação na voz da marca — que o CRM dispara
  pelo follow-up que ele JÁ tem. Dinheiro que já existe na base, com o menor esforço.
---

# /reativar — Win-back da base parada

O lead mais barato é o que você já tem. O CRM já faz follow-up automático (lead parado,
cliente inativo, pós-atendimento, aniversário) por cron+e-mail — esta skill não recria isso.
Ela faz a parte do OS: **achar quem esfriou** e **escrever a sequência de reativação na voz
da marca**, que entra na régua de follow-up do CRM.

Autoria: ImpulsoX AI. Conteúdo original.

## Fronteira (o que esta skill é e o que NÃO é)

- O **CRM já tem** o motor de follow-up (cron+e-mail, régua de inativo). Não duplicar o
  disparo nem o agendamento.
- `/reativar` é o lado de marketing: **segmenta** (quem reativar) + **escreve** a sequência
  (a copy na voz da marca, com a oferta ATIVA certa) pra alimentar a régua do CRM.
- Não é o `/email` (boas-vindas/newsletter/follow-up de proposta — lead novo/quente).
  `/reativar` é win-back de base fria. Herda a infra de entregabilidade/voz do `/email`.

## Degrau mínimo (Escada de Contexto)

Degrau 4 (CRM no ar): precisa de `CRM_TOKEN` pra achar os inativos. Sem token, roda em modo
"o dono informa o segmento" (cola a lista) e marca a integração como pendente.

## O que ler antes

- `.env`: `CRM_BASE_URL` + `CRM_TOKEN`.
- `nucleo/ofertas.md` — **só oferta ATIVA** entra na reativação (nunca roadmap/futura).
- `nucleo/voz.md` — a sequência sai na voz da marca.
- `nucleo/provas.md` — prova autorizada reaquece (caso/resultado real).
- `docs/persuasao.md` — win-back é persuasão honesta (sem falsa urgência).

## Como roda

1. **Config.** `crmFromEnv()` da `lib-crm`. Sem token → pedir o segmento manual.
2. **Segmentar** via `lib-crm`: `listContacts(c, query)` pra achar inativos (status
   `inativo`, `lastInteractionAt` antigo). O CRM define "inativo"; usar o que ele marca.
   (Filtro fino por data espera o sub 2 do PRD; usar o status que vier.)
3. **Escolher o gancho de reativação** por segmento: novidade real, oferta ATIVA, "sentimos
   sua falta" com prova, conteúdo de valor. Nunca falsa escassez.
4. **Escrever a sequência** (2-3 e-mails) na voz da marca → passar pelo `/escritor-br`.
5. **Entregar** pro CRM: a copy entra na régua de follow-up que o CRM já dispara (ou o dono
   cola, se a integração de escrita-na-régua ainda não existir — marcar como pendência).
6. **Fechar** apontando o próximo passo.

## Regras

- **Não duplicar o motor de follow-up** — o disparo/agendamento é do CRM; a skill segmenta e
  escreve.
- **Só oferta ATIVA** na reativação.
- **Sem falsa urgência/escassez** — win-back honesto; base fria desconfia de pressão fake.
- **Só prova autorizada.** **Token nunca em log** (lib-crm redige). **Nunca Postgres direto.**
- **Respeitar descadastro** — quem saiu, saiu; reativação não é spam.
- É MOTOR: nasce no template, desce via `/atualizar-motor`.

## Teste de aceitação (comportamental)

1. CRM com inativos → segmenta por status, escreve 2-3 e-mails na voz, só oferta ATIVA.
2. Sem `CRM_TOKEN` → pede o segmento manual; não inventa lista.
3. Oferta futura citada → fica fora (só ATIVA).
4. Sequência sem falsa escassez; passa pelo `/escritor-br`.

---

**✓ Pronto:** sequência de win-back na voz da marca (só oferta ATIVA) pronta pra régua de follow-up do CRM · **→ próximo passo:** o CRM dispara pela régua dele; medir o retorno depois no `/roi`/`/desempenho`. Pré-requisito: `CRM_TOKEN` pra segmentar; sem ele, o dono informa o segmento.
