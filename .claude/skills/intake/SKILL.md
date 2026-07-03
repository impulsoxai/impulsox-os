---
name: intake
description: >
  Use no começo de um contrato novo, pra coletar o OPERACIONAL do cliente — "/intake",
  "onboarding do cliente", "fazer o intake", "coletar os acessos", "o que preciso pedir
  pro cliente começar", "kit de boas-vindas do cliente". Coleta acessos (pelo método
  seguro, nunca senha), KPI do contrato, calendário de aprovação e escopo; gera um
  formulário pro cliente e grava em nucleo/intake.md. Roda depois do /cliente, antes do
  /identidade. Não repete o briefing de negócio (isso é o /plugar).
---

# /intake — Onboarding operacional do cliente

Onboarding profissional é a primeira impressão que justifica o ticket de agência. Esta
skill cuida do lado operacional do contrato novo: o que precisamos pra OPERAR — acessos,
KPI, quem aprova, o que está no escopo. É o "kit de boas-vindas" que mostra ao cliente que
ele contratou uma operação, não um freela.

Autoria: ImpulsoX AI. Conteúdo original.

## Fronteira (o que esta skill é e o que NÃO é)

- **`/plugar`** = quem é o negócio (negócio, oferta, voz). Não repetir aqui.
- **`/cliente`** = cria a estrutura técnica (pasta, CLAUDE.md, núcleo) no modo agência.
- **`/intake`** = **como vamos operar juntos** — o operacional do contrato.

Roda **depois do `/cliente`** (estrutura criada), **antes do `/identidade`** (produção começa).

## Degrau mínimo (Escada de Contexto)

Roda no degrau 1 (cliente já plugado pelo `/cliente`). Sem a estrutura do cliente,
reorientar pra `/cliente` primeiro. Acesso que ainda não chegou vira pendência — não trava
a produção.

## O que coleta (5 frentes — só o operacional)

1. **Acessos** — contas de rede, domínio, pixels/analytics. **NUNCA pede senha** (ver
   Segurança). Registra o método e o status de cada um.
2. **KPI do contrato** — a métrica de sucesso e o prazo (o que vamos bater, até quando, como
   medimos). **+ a "vitória da semana 1":** qual resultado controlável o cliente VÊ nos
   primeiros 7 dias e quem o entrega (operacionaliza o primeiro-ganho da doutrina de
   oferta — molde-esteira; é também o gatilho de serviço do `/depoimento`).
3. **Calendário de aprovação** — quem aprova as peças, em quanto tempo, por qual canal.
4. **Escopo/limites** — o que está dentro e o que está fora do contrato.
5. **O CONTRATO em si** — início, vigência, valor/mês, **data de renovação**. Sem isso a
   `/carteira` não cumpre a própria promessa ("qual contrato vence") e ninguém dispara a
   conversa de renovação a tempo — renovação é onde agência perde receita em silêncio.

## 5ª frente (condicional) — acessos extras por fase da Esteira de Crescimento

Quando o contrato inclui a Esteira (`docs/blueprint-esteira-crescimento.md`), coletar também o
que cada fase precisa pra não travar no dia 1. Só pedir o da(s) fase(s) contratada(s):

| Fase contratada | Acesso / dado extra a coletar | Por quê |
|---|---|---|
| Fase 1 — Reativação | **Base de leads/clientes + PROVA de consentimento** (origem, data, texto, canal) | Sem prova, não dá pra disparar (gate LGPD do `/reativar`) |
| Fase 1/2 — Review/local | Acesso ao **Perfil de Empresa no Google** (convite de gestor) | A `/local` opera o review/resposta por lá |
| Fase 1/3 — Atendimento/WhatsApp | **WhatsApp Business API** + número dedicado + opt-in coletado fora do thread | Disparo exige API + template + consentimento (não número pessoal) |
| Fase 3 — Ads | Meta Business (ad account + page + **pixel** + catalog) e/ou Google Ads, por convite | A `/ads-*` precisa do pixel/CAPI e da conta |

**⚠️ A prova de consentimento da base é o gate que mais trava (e o que resolve o Blocker LGPD).**
Consentimento de e-mail **não cobre** WhatsApp (ANPD). Coletar, por contato: **quando** o opt-in
foi dado, **por qual canal** (form/landing/QR/loja — nunca dentro do WhatsApp), e o **texto exato**
mostrado. Sem isso, a base entra como "bloqueada pra WhatsApp" — pode usar e-mail, não WhatsApp.
Se o cliente não tem a prova, o caminho é **recoletar opt-in** (campanha de opt-in antes de
qualquer disparo), não disparar e torcer. Registrar o status da prova no `intake.md`.

## Segurança (regra dura — inegociável)

- **Nunca coletar senha de cliente em texto.** Só o método seguro de cada plataforma:
  - Meta Business / Google Ads / GA4 → **convite de membro** (o cliente adiciona a agência
    com o papel certo; ninguém troca senha).
  - Conta que ainda não existe → "o cliente cria e te convida".
  - Token/chave de API que precise existir → vai pro **`.env` do clone** (gitignored), nunca
    pro `intake.md`.
- O `intake.md` registra só o **status** do acesso (`pedido` / `recebido` / `testado`),
  jamais a credencial. Senha de cliente vazada queima a confiança e a conta — risco que não
  se corre por comodidade.

## Fluxo

1. **Pré-requisito.** Estrutura do cliente criada (`/cliente`). Se falta, reorientar pra ela.
2. **Gerar o formulário** pro cliente a partir de `assets/formulario-intake.md`, na voz e
   marca do cliente, em PT simples (sem jargão). Entregar pronto pra mandar.
3. **Receber as respostas** (o dono cola o que o cliente devolveu).
4. **Registrar acessos** pelo método seguro — status, nunca senha.
5. **Gravar `nucleo/intake.md`** (negócio próprio) ou `clientes/<nome>/nucleo/intake.md`
   (modo agência) com as 4 frentes; marcar acesso não recebido como pendência.
6. **Fechar** apontando o próximo passo.

## O arquivo `nucleo/intake.md`

```markdown
# Intake operacional — [cliente] · [data]

## Acessos (status, nunca a senha)
| Plataforma | Método | Status | Observação |
|---|---|---|---|
| Instagram/Meta Business | convite de membro | pedido/recebido/testado | |
| Google Ads / GA4 | convite | … | |
| Domínio / hospedagem | … | … | |
| Pixel/Analytics | id no .env | … | |

## KPI do contrato
- Meta: [o que bater] · Prazo: [até quando] · Como medimos: [fonte]
- Vitória da semana 1: [o resultado controlável que o cliente VÊ em 7 dias] · Entrega: [quem]

## Contrato
- Início: [data] · Vigência: [n meses] · Valor: [R$/mês] · **Renovação: [data]**

## Aprovação
- Quem aprova: [nome] · Prazo de resposta: [ex: 48h] · Canal: [WhatsApp/e-mail]

## Escopo
- Dentro: [...]
- Fora: [...]

## Rotinas mapeadas (vem do Passo 5 do /cliente; a /proposta precifica o retainer por aqui)
| Rotina | Ganho estimado (tempo/semana) | Status |
|---|---|---|

## Esteira (só se contratada) — acessos extras + gate de consentimento
| Item | Status | Observação |
|---|---|---|
| Base de leads + prova de consentimento (WhatsApp) | pedido/recebido/bloqueado | data+canal+texto do opt-in; sem isso, só e-mail |
| Perfil Google (gestor) | … | Fase 1/2 |
| WhatsApp Business API + opt-in | … | Fase 1/3; agente ~jul/2026 |
| Meta Business (pixel/CAPI) / Google Ads | … | Fase 3 |
```

## Quem consome o `intake.md`

- `/proposta` — escopo e KPI ancoram o que foi vendido.
- `/relatorio` — o KPI do contrato vira a régua do relatório (bateu a meta?).
- Hub multi-cliente (futuro) — lê status de acesso e KPI por cliente.

## Regras

- Nunca senha em texto; só método de acesso + status.
- Só o operacional — não repetir o briefing de negócio (isso é o `/plugar`).
- Acesso pendente = pendência marcada, não trava a produção.
- É MOTOR: nasce no template, desce via `/atualizar-motor`. OS puro (não toca no CRM por
  ora; quando a ponte do PRD existir, pode fechar criando o contato no CRM).

## Teste de aceitação (comportamental)

1. Cliente recém-criado pelo `/cliente` → gera o formulário PT na marca + cria `intake.md`
   com as 4 frentes.
2. Dono tenta informar uma senha de cliente → a skill recusa e instrui o método seguro
   (convite de membro / token no `.env`).
3. Acesso ainda não recebido → status `pedido`, marcado como pendência; não trava.
4. `intake.md` pronto → `/proposta` e `/relatorio` leem KPI/escopo de lá.
5. Rodada sem `/cliente` antes → reorienta pra criar a estrutura primeiro.

---

**✓ Pronto:** formulário de onboarding enviado + `intake.md` com acessos (status), KPI, aprovação e escopo · **→ próximo passo:** `/identidade` — com o operacional resolvido, a produção começa pela marca. Esperar o "sim". Pré-requisito: cliente já criado pelo `/cliente`; se faltar, o sistema reorienta pra lá antes.
