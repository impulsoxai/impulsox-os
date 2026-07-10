---
name: reativar
description: >
  Use pra reativar lead frio, lista parada ou ex-cliente — "/reativar", "reativar base",
  "lead parado", "cliente sumido", "win-back", "campanha pra quem não compra faz tempo",
  "reativa a base do meu cliente", "tem gente na minha lista que esfriou". Acha quem esfriou
  no CRM (lead inativo, cliente sem compra recente) e gera a sequência de reativação na voz da
  marca — SEMPRE com uma oferta/gancho concreto — por e-mail OU WhatsApp, que o CRM/agente
  dispara pelo follow-up que ele JÁ tem. Dinheiro que já existe na base, com o menor esforço.
---

# /reativar — Win-back da base parada

O lead mais barato é o que você já tem. O CRM já faz follow-up automático (lead parado,
cliente inativo, pós-atendimento, aniversário) por cron+e-mail — esta skill não recria isso.
Ela faz a parte do OS: **achar quem esfriou** e **escrever a sequência de reativação na voz
da marca**, que entra na régua de follow-up do CRM/agente.

Autoria: ImpulsoX AI. Conteúdo original.

## Ler antes

- `docs/gabarito-execucao-texto.md` — **PRIMEIRO**: gates de qualidade do texto + o gate específico desta skill no §6 (framework de 4 linhas, teste do template, toque 2 = valor puro, breakup final). Nenhum gate é opcional

## A REGRA DE OURO — reativação SEMPRE vem com oferta (não existe win-back sem gancho)

Reativação **nunca** é "oi, sumida, volta". É **sempre uma oferta com motivo**: aniversário do
negócio, vaga liberada, brinde, passe grátis, condição de retorno. O motivo dá licença pra
reabordar sem soar spam — sem oferta, a mensagem é spam e queima a base. (Mecânica do JP
Middleton, `docs/formula-ads-jp.md` §0.5.A.)

A sequência segue o molde testado:
1. **Gancho com motivo + oferta concreta** na 1ª linha ("Pra comemorar nosso aniversário,
   liberamos passes grátis — quer um?").
2. **Pergunta de sim/não fácil** — micro-compromisso baixa a barreira.
3. **No "sim", agendar JÁ** — propor 2 horários (A ou B), não "quando você pode?".
4. **Embutir o referral** ("quer trazer um +1?") — lead grátis quando traz alguém.
5. **Cadência de lembrete** (dia anterior + 1h antes) — reduz no-show.

A oferta sai do `nucleo/ofertas.md` (só **ATIVA**). Sem oferta ativa que sirva de gancho, a
skill avisa e pede uma — não inventa promoção, não dispara win-back oco.

## Dois modos de uso (mesmo motor, base diferente)

1. **Base PRÓPRIA** (modo padrão): reativa a base de leads/clientes da própria empresa.
2. **Serviço pro CLIENTE FINAL** (modo agência — `docs/formula-ads-jp.md`, Pilar 1): reativa a
   base de leads parada do **cliente do cliente** (ex: a base de ex-membros de uma academia
   atendida). É o produto "reativação" que se vende ANTES de rodar ads — custo de mídia zero,
   dinheiro que já existe no cadastro do negócio. Mesma mecânica; a base é do tenant/cliente.

## Fronteira (o que esta skill é e o que NÃO é)

- O **CRM já tem** o motor de follow-up (cron+e-mail, régua de inativo). O **agente WhatsApp**
  (em construção, ~jul/2026) é o motor de disparo do canal WhatsApp. Não duplicar o disparo
  nem o agendamento — esta skill segmenta e escreve.
- `/reativar` é o lado de marketing: **segmenta** (quem reativar) + **escreve** a sequência
  (a copy na voz da marca, com a oferta ATIVA certa) pra alimentar a régua do CRM/agente.
- Não é o `/email` (boas-vindas/newsletter/follow-up de proposta — lead novo/quente).
  `/reativar` é win-back de base fria. Herda a infra de entregabilidade/voz do `/email`.

## Canal: e-mail (agora) + WhatsApp (quando o agente existir)

- **E-mail** — disponível agora, via régua do CRM. É o default se o agente WhatsApp não está no ar.
- **WhatsApp** — canal mais forte pra reativação no BR (SMS é morto aqui). Depende do **agente
  WhatsApp + CRM** (em construção, ~jul/2026). Até existir: gerar a sequência de WhatsApp pronta
  e marcar como **pendente de disparo** (o dono cola/dispara manual, ou espera o agente). Estado
  honesto, igual o `/agente-ia` faz com o `/api/chat` — não fingir que dispara sozinho ainda.

### ⚠️ GATE LGPD + Política WhatsApp (obrigatório antes de gerar sequência de WhatsApp)

Reativação com oferta é **marketing direto** — não é mensagem transacional. No BR isso tem dois
gates duros (multa ANPD até **R$ 50M/infração**; banimento do número pela Meta):

1. **LGPD — consentimento próprio de WhatsApp.** Consentimento de e-mail **NÃO cobre** WhatsApp
   (ANPD, 2024-2025: canais distintos, consentimentos separados). Base de "ex-cliente parado há
   anos" é a de MAIOR risco (consentimento velho/inexistente). Antes de gerar a sequência,
   **confirmar com o dono a origem e a validade do consentimento da base** — sem isso, não gerar
   pra disparo (só rascunho marcado "bloqueado por consentimento"). Toda mensagem leva **opt-out**
   (sair fácil), processado em ≤24h. Consentimento auditável (data, texto exato).
2. **Política WhatsApp/Meta — template aprovado.** Disparo proativo em escala exige **WhatsApp
   Business API + template (HSM) pré-aprovado pela Meta**, categoria marketing, número de
   qualidade. **Número pessoal automatizado em volume = número derrubado.** A sequência que esta
   skill gera vira **texto de template a submeter** — não texto livre disparado em massa. O
   agente WhatsApp opera por essa API; o disparo respeita a janela de 24h e a qualidade do número.

Sem os dois gates atendidos, a skill entrega o rascunho mas **não libera pra disparo** — marca a
pendência. Isto protege a conta do cliente (perfil + número), que é o ativo dele.

**O risco deixou de ser teórico:** em out/2025 a ANPD virou agência reguladora com autonomia
(MP 1.317 convertida em lei) e a fiscalização de WhatsApp marketing acelerou em 2026
(SocialHub/Confidata). Isso é também **argumento de venda** do jeito compliant da casa: o
concorrente que dispara sem base legal está acumulando passivo; o cliente daqui não.

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
2. **Segmentar via `lib-crm` — POR RECÊNCIA, não num balde só:** `listContacts(c, query)`
   pra achar inativos (status `inativo`, `lastInteractionAt` antigo), e separar em 3
   faixas — a mensagem e a expectativa mudam com o tempo de sumiço:
   - **30-90 dias** (a janela de ouro — quanto mais espera, mais frio): tom "continua daqui",
     oferta direta;
   - **90 dias-1 ano:** re-apresentação curta + oferta com motivo;
   - **1 ano+:** o mais frio e o de maior risco de consentimento — só com base legal
     confirmada; tom de reconquista, expectativa mínima.
   (Filtro fino por data espera o sub 2 do PRD; usar o `lastInteractionAt` que vier.)

   **Expectativa honesta pro dono (benchmarks de mercado, dar ANTES de disparar):**
   win-back automatizado reativa **12-18% da base** (Klaviyo 2025: ~15% vs ~3% do manual);
   sequência de **4 toques rende ~14,7% cumulativo vs ~6,2% de toque único** (+137% —
   ustechautomations/Validity, 2026). Ou seja: 8% numa base fria não é fracasso, e 2-3
   toques deixam dinheiro na mesa — por isso a sequência default sobe pra **3-4 toques**
   espaçados (não 2-3), cada um com gancho diferente da MESMA oferta.
3. **Escolher o gancho-com-oferta** por segmento (a regra de ouro): qual oferta ATIVA + qual
   motivo (aniversário, vaga, brinde, condição de retorno). Nunca "sentimos sua falta" oco,
   nunca falsa escassez. Sem oferta ativa que sirva → avisar e pedir, não inventar.
4. **Escolher o canal:** e-mail (agora) ou WhatsApp (quando o agente existir). WhatsApp segue o
   molde de 5 passos (gancho→sim/não→agenda→referral→lembrete); e-mail, a sequência de 2-3.
5. **Escrever a sequência** na voz da marca → passar pelo `/escritor-br`.
6. **Entregar** pro CRM/agente: a copy entra na régua que o motor dispara (ou o dono cola, se a
   integração ainda não existir / agente não está no ar — marcar como pendência honesta).
7. **Medir COM MÉTRICA PRÓPRIA** — a taxa de reativação é a métrica de saída da Fase 1
   do blueprint e é DESTA skill: registrar (quando o CRM devolver) **"X% da base
   contatada respondeu/agendou"** e comparar com a faixa honesta (12-18% automatizado).
   É esse número que o `/relatorio` mostra na Fase 1 — não um "ROI genérico".
8. **Fechar** apontando o próximo passo.

## Regras

- **Reativação SEMPRE com oferta** — sem gancho-com-motivo, é spam. A regra de ouro acima.
- **Não duplicar o motor de follow-up** — o disparo/agendamento é do CRM/agente; a skill
  segmenta e escreve.
- **Só oferta ATIVA** na reativação.
- **Sem falsa urgência/escassez** — win-back honesto; base fria desconfia de pressão fake.
- **WhatsApp só com os 2 gates** (ver seção acima): consentimento próprio de WhatsApp (não o de
  e-mail), opt-out em toda mensagem; e template HSM aprovado via WhatsApp Business API (nunca
  número pessoal em massa). Sem os gates → rascunho só, disparo bloqueado.
- **Só prova autorizada.** **Token nunca em log** (lib-crm redige). **Nunca Postgres direto.**
- **Respeitar descadastro** — quem saiu, saiu; reativação não é spam.
- É MOTOR: nasce no template, desce via `/atualizar-motor`.

## Teste de aceitação (comportamental)

1. CRM com inativos → segmenta por status, escreve a sequência na voz, **sempre com oferta ATIVA**.
2. Sem `CRM_TOKEN` → pede o segmento manual; não inventa lista.
3. Oferta futura citada → fica fora (só ATIVA).
4. Sem oferta ativa que sirva de gancho → avisa e pede; **não dispara win-back oco**.
5. Canal WhatsApp pedido mas agente não está no ar → gera a sequência e marca pendente de
   disparo; não finge que dispara sozinho.
6. Sequência sem falsa escassez; passa pelo `/escritor-br`.

---

**✓ Pronto:** sequência de win-back na voz da marca (gancho-com-oferta ATIVA), no canal escolhido (e-mail agora; WhatsApp quando o agente existir), pronta pra régua do CRM/agente · **→ próximo passo:** o CRM/agente dispara pela régua dele; medir o retorno depois no `/roi`/`/desempenho`. Pré-requisito: `CRM_TOKEN` pra segmentar + oferta ATIVA pro gancho; sem token, o dono informa o segmento; WhatsApp espera o agente (~jul/2026).
