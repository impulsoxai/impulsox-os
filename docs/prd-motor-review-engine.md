# PRD — Motor de Review Engine (CRM + Hermes + Agente WhatsApp)

> **Pra quem:** o desenvolvedor do ImpulsoX CRM v3 (Node 20 + Express + Prisma + Postgres)
> e quem constrói o agente WhatsApp.
> **O que é:** o motor que dispara automaticamente uma sequência de pedido de Google Review
> por WhatsApp — a versão brasileira do "Review Engine" que o Adam roda no Go High Level nos
> EUA (dissecado em `docs/acervo-review-engine-ghl.md`).
> **Princípio:** o CRM é dono do contato e da automação; o agente WhatsApp é o canal e o
> cérebro que lê a resposta; o Hermes orquestra e o OS entrega a copy/oferta na voz da marca.
> **Depende de:** `docs/prd-integracao-crm.md` (service token 3.1, UTM 3.2, webhook 3.3).
> **Mercado:** Brasil (WhatsApp) agora; EUA (SMS) é fase futura — o motor é canal-agnóstico
> por design (seção 3.6), então vender pros EUA não exige reescrever o motor, só plugar o
> adapter SMS + a régua TCPA/10DLC.
> **Data:** 2026-07-10.

---

## 1. Contexto: o que estamos copiando (mecânica, não conteúdo)

O Adam vende UM serviço pra PME local (dentista, oficina, salão): gestão de Google Review,
$297/mês, tudo dentro do GHL. O sistema dele é **3 mensagens condicionais + reativação de
base antiga + resposta automática às reviews**. A genialidade não é a tecnologia — é a
ORDEM e o TIMING. Detalhe completo em `docs/acervo-review-engine-ghl.md`.

Nós temos os blocos pra fazer o mesmo, com 3 vantagens sobre o GHL:
1. **Canal certo pro Brasil:** WhatsApp, não SMS (SMS é morto aqui).
2. **Cérebro conversacional:** nosso agente LÊ a resposta do cliente (distingue "tá ótimo"
   de "o portão ainda range") — o GHL faz isso com automação cega, nós com agente.
3. **Compliance mais rígida já documentada:** `docs/formula-ads-jp.md §0.5.B` já proíbe
   gating e incentivo — mesma régua do "review gating not allowed" dele, só que nossa.

**Por que NÃO é a `/reativar`:** a `/reativar` é win-back SEMPRE-com-oferta (vender de novo
pra base fria). O Review Engine é o oposto — **sequência transacional pós-serviço, SEM
oferta**, pedindo só a review. Mecânica diferente, gate condicional diferente. É motor novo.

---

## 2. A anatomia do motor (o que construir)

Três camadas. Cada uma é uma capacidade do CRM+agente.

### Camada 1 — Sequência de 3 mensagens (o coração)

Um **workflow condicional** disparado quando **o serviço é ENTREGUE** (não quando a venda é
fechada — ver 3.0, é a peça mais importante do motor). Três passos:

| # | Mensagem | Trigger | Condição |
|---|---|---|---|
| M1 | Check-in (NÃO pede review) | serviço concluído | dispara sempre |
| M2 | Pedido de review (link Google) | reply do M1, OU X horas sem reply | dispara pra TODOS (sem gating) |
| M3 | Lembrete gentil | Y horas após M2 | **só se NÃO clicou no link do M2** |

O que cada trigger condicional exige do CRM/agente:
- **Detectar reply** ao M1 (agente WhatsApp já processa mensagem recebida).
- **Timer "X horas sem reply"** → dispara M2 mesmo sem resposta (a régua de follow-up do CRM
  já tem cron; é adicionar este tipo de espera).
- **Rastrear clique no link** do M2 (link encurtado/rastreado por contato → evento
  `review_link.clicked`). Sem isso, M3 não sabe quem pular.
- **Skip M3 se já clicou** (a condição que evita incomodar 2x).

### Camada 2 — Reativação de base histórica (o "goldmine")

Pega a lista de clientes ANTIGOS do negócio (import CSV → `POST /contacts`, fluxo que já
existe) e dispara a MESMA sequência de review — **em ritmo controlado**:
- **2-3 disparos a cada ~20min**, horário comercial. Nunca 1500 de uma vez (parece
  antinatural pro Google/Meta e converte pior).
- Taxa esperada (benchmark do Adam): **8-15% deixam review**. Base de 500 → 40-75 reviews
  em semanas. **Marcar como ordem de grandeza da prática de mercado** (número do criador,
  não fonte auditável — validar com o primeiro caso real).
- Esta camada REUSA a Camada 1; só muda a fonte (base histórica) e adiciona o **rate-limiter**.

⚠️ **Esta camada é marketing direto em escala** → cai nos 2 gates da `/reativar` (LGPD:
consentimento próprio de WhatsApp + opt-out; Meta: template HSM aprovado, número de
qualidade). A M2/M3 disparada em massa pra base velha são **templates a submeter à Meta**,
não texto livre. Detalhe em `docs/prd-integracao-crm.md`? Não — em `.claude/skills/reativar/SKILL.md`
seção "GATE LGPD + Política WhatsApp". O motor herda esse gate.

### Camada 3 — Resposta automática às reviews (IA)

Quando uma review nova entra no Google Business Profile do cliente, o Hermes/agente gera uma
resposta personalizada na voz da marca e responde (delay 10-15min, como o Adam sugere).
- **Depende de:** integração com a Google Business Profile API (ler reviews novas + postar
  resposta). Confirmar acesso à API e política de resposta automática do Google.
- Motivo duplo (por que vale): Google ranqueia melhor quem responde reviews ativamente; e
  prospect que vê o negócio respondendo TODAS as reviews confia mais.
- Reusa a infra de IA que já existe (o `POST /api/chat` do CRM já chama Haiku — mesma
  mecânica, prompt diferente: "responda esta review na voz da marca").

---

## 3. O que o CRM/agente PRECISA GANHAR (o trabalho deste PRD)

Assume que o service token (3.1), UTM (3.2) e webhook (3.3) do PRD-base já existem ou virão.

### 3.0 — DECISÃO: O GATILHO — "serviço ENTREGUE", não "venda fechada" 🔴 a peça mais importante

O motor inteiro depende de disparar o M1 **no momento certo: quando o cliente RECEBEU o
serviço**. Errar isto quebra tudo — pedir review antes da entrega gera review vazia ou
negativa.

**`deal.won` está ERRADO pra isto.** `deal.won` = venda fechada / contrato assinado — o
serviço ainda nem começou. O Adam é explícito: a mensagem "goes out **after the job is
done**", não depois da venda. `deal.won` serve pra OUTRA coisa (disparar onboarding /
`/depoimento` de boas-vindas), nunca pra pedir review.

**Não existe UM gatilho — existe o gatilho DAQUELE negócio.** A fonte de "serviço entregue"
muda com o modelo, e é **config por tenant** no provisionamento:

| Tipo de negócio | Quando o serviço acaba | Fonte de gatilho (prioridade) |
|---|---|---|
| **Serviço agendado** (dentista, salão, oficina, clínica, estética) | Fim do compromisso | **1. AGENDA** — evento concluído/compareceu |
| **Serviço por projeto** (roofer, reforma, advogado) | Etapa "entregue" no pipeline | **2. PIPELINE** — deal stage "entregue" (≠ `won`) |
| **Produto / loja** (e-commerce, varejo) | Entrega/retirada confirmada | **3. PEDIDO** — status "entregue" (integra e-commerce/ERP) |
| **Qualquer** (fallback universal) | O dono marca | **4. BOTÃO manual** "concluí o serviço" |

**▶ Recomendação: AGENDA como gatilho principal** (cobre a maioria do nosso alvo — PME local
agendada). Requisitos:
- **Integração Google Calendar API** (a mais comum) — webhook/push notification quando um
  evento muda pra concluído/compareceu → arma o M1 pro contato daquele evento. OAuth do
  calendário do cliente no provisionamento.
- Suportar também o **sistema de booking próprio do cliente** (muitos usam Trinks, Belle,
  agenda do próprio ERP) — via webhook do sistema dele quando existir, ou fallback botão.
- **Casar evento da agenda → contato do CRM** (por telefone/e-mail) pra saber pra quem
  mandar o M1. Se o agendamento não tem contato no CRM, criar `Contact` a partir do evento.

**Stage de pipeline "serviço entregue"** (fonte 2): um stage NOVO no funil, DEPOIS de `won`
— "vendido" e "entregue" são momentos distintos. O evento é a TRANSIÇÃO pra esse stage, não
o `won`.

**Botão manual** (fonte 4): sempre disponível como MVP e fallback. Tira o "automático"
só do primeiro passo (M2/M3 seguem automáticos). É o que destrava enquanto agenda/pipeline
não estão integrados — o Adam mesmo diz "the strategy works with or without the software".

**Config por tenant:** cada cliente declara sua fonte de gatilho no provisionamento
(`trigger_source: calendar | pipeline_stage | order_status | manual`) + as credenciais
(OAuth do calendário, webhook do e-commerce, etc.). O CRM roteia o disparo do M1 pela fonte
configurada. **Sem gatilho ligado, o motor não é automático** — é a peça #1 a resolver por
cliente.

### 3.1 — DECISÃO: Tipo de campanha "sequência de review" no CRM 🔴 bloqueante

Hoje o CRM tem follow-up (cron+e-mail) mas não um workflow condicional de N passos com espera
por reply + rastreio de clique. Isso é o coração da Camada 1.

**▶ Recomendação A — workflow condicional nativo no CRM.**
- Um tipo de campanha `review_sequence` com os 3 passos, cada um com: template de mensagem,
  gatilho (evento / timer), e condição (clicou? respondeu?).
- Estado por contato: `pending_m1 → sent_m1 → sent_m2 → clicked | sent_m3 → done`.
- Config por tenant: janelas de espera (X, Y horas), horário comercial, rate-limit da Camada 2.
- **Por que A:** é a peça que não dá pra fingir com o follow-up de e-mail atual. É reusável
  pra qualquer sequência condicional futura (não só review).

**Alternativa B — o agente WhatsApp toca a sequência, CRM só guarda estado.** O agente roda a
lógica condicional em código; o CRM expõe endpoints de "marcar estado" e "listar quem está no
passo N". Menos genérico, mas mais rápido se o agente já for stateful. **Decisão do dev** —
onde vive a máquina de estado (CRM vs agente). O dono crava.

### 3.2 — Rastreio de clique no link de review 🔴 bloqueante pro M3

O M3 só dispara pra quem NÃO clicou. Precisa de link rastreado por contato.
- Link único por contato (`/r/<token>`) que redireciona pro Google Review do tenant e
  registra evento `review_link.clicked` (contact_id, timestamp).
- Sem isso, ou o M3 não existe, ou incomoda quem já avaliou (queima a relação).

### 3.3 — Detecção de sentimento no reply do M1 🟡 alto valor (o pulo do gato vs GHL)

Quando o cliente responde o M1 ("tá ótimo" vs "o portão ainda range"), o agente WhatsApp
classifica: **satisfeito** → segue pro M2 normal; **problema** → NÃO manda M2 ainda, avisa o
dono do negócio pra resolver primeiro. O Adam faz isso implícito (cliente reclama no check-in,
dono vê e resolve); nós fazemos **explícito com o agente** — quem teve problema resolvido rápido
deixa a MELHOR review.
- Reusa o Haiku que o CRM já chama. Prompt: classifica reply em `{satisfeito, problema, neutro}`.
- **Regra de compliance:** isto NÃO é gating. Todos recebem o M2 com o mesmo link
  eventualmente. A detecção só ATRASA o M2 pra quem tem problema (pra resolver antes), não
  DESVIA ninguém pra canal privado nem filtra quem pode avaliar. Documentar essa fronteira
  no código pra não virar gating por acidente.

### 3.4 — Google Business Profile API (Camada 3) 🟢 pode vir depois

Ler reviews novas + postar resposta automática. Confirmar: acesso à API, OAuth do perfil do
cliente, e se a política do Google permite resposta gerada por IA (postar como o dono).
Começar manual (o agente redige, o dono aprova/posta) se a API travar.

### 3.5 — Rate-limiter da Camada 2 🟡

2-3 disparos / 20min / horário comercial, por tenant. Fila com throttle. Reusa a régua de
horário que a `/reativar` já assume.

### 3.6 — Multi-mercado: o motor é CANAL-AGNÓSTICO (Brasil hoje, EUA depois) 🟡 arquitetura

**Contexto pro dev — leia isto antes de amarrar o motor no WhatsApp.** O plano de negócio é
vender este serviço **primeiro no Brasil (WhatsApp), depois nos EUA (SMS)**. Se o motor for
escrito acoplado ao WhatsApp, vender pros EUA depois vira reescrita. A decisão aqui evita
isso: **o motor não conhece o canal — ele fala com um adapter.**

**A separação-chave (não confundir estes dois "webhooks"):**

- **Gatilho = ENTRADA.** A agenda/pipeline avisa "serviço entregue" → arma o M1 (seção 3.0).
  Isto é webhook de entrada e é **idêntico nos dois mercados**.
- **Canal = SAÍDA.** Quem MANDA a mensagem M1/M2/M3. No Brasil é a WhatsApp Business API
  (Meta). Nos EUA é **SMS via provedor (Twilio / MessageBird / Telnyx)** — não é "webhook de
  SMS", é um **provedor de envio via API**. SMS é o canal dominante pra este tipo de
  mensagem nos EUA (o Adam usa SMS no GHL; WhatsApp lá é minoritário).

**O que é IGUAL nos dois mercados (o motor):** o gatilho, a sequência de 3 passos, a máquina
de estado por contato, o rastreio de clique, a lógica condicional (M2 pra todos, M3 só quem
não clicou), a classificação de sentimento. **Nada disso muda com o canal.**

**O que TROCA por mercado:** o canal de saída + a régua de compliance. Só isso.

**▶ Recomendação: camada de canal abstrata (adapter por mercado).**

```
        MOTOR (gatilho → sequência → estado → rastreio → sentimento)   ← idêntico BR/EUA
                              │
              "envie a mensagem X pro contato Y"
                              │
        ┌─────────────────────┴─────────────────────┐
   adapter WhatsApp (Meta Business API)       adapter SMS (Twilio/MessageBird)
        Brasil                                       EUA
```

- O motor chama uma interface fina: `enviarMensagem(contato, texto, {tipo})`. O adapter
  configurado pro tenant resolve o transporte real (WhatsApp HSM ou SMS).
- **Config por tenant:** `canal: whatsapp | sms` + credenciais do provedor daquele canal
  (token Meta OU chave Twilio + número). Trocar mercado = trocar adapter + régua, **motor
  intacto**.
- O rastreio de clique (3.2) e a máquina de estado (3.1) ficam no motor, acima do adapter —
  funcionam igual pros dois canais (link encurtado serve SMS e WhatsApp).

**Compliance é POR MERCADO — não dá pra reusar a régua BR nos EUA** (o dev precisa saber que
cada adapter carrega sua régua legal, senão a mensagem é bloqueada ou vira multa):

| | Brasil (WhatsApp) | EUA (SMS) |
|---|---|---|
| Lei de privacidade | **LGPD** (ANPD, multa até R$50M) | **TCPA** (multa por mensagem, ação judicial) |
| Consentimento | opt-in próprio de WhatsApp + opt-out | opt-in prévio expresso + **"reply STOP"** obrigatório |
| Registro de campanha | **template HSM** aprovado pela Meta | **10DLC** — registro A2P nas operadoras (sem isso = bloqueado) |
| Janela/horário | janela 24h da Meta | horário local por fuso (quiet hours) |

Cada adapter valida a régua do seu mercado antes de enviar. A régua BR já está documentada
no gate da `/reativar`; a régua EUA (TCPA + 10DLC) entra quando o adapter SMS for construído.

**Escopo agora:** **construir só o adapter WhatsApp (Brasil)** — é o mercado atual. Mas
**desenhar o motor já com a interface de canal abstrata** (não `whatsapp.send()` espalhado no
código, e sim `canal.send()`). O adapter SMS + a régua TCPA/10DLC são **fase futura EUA** —
não construir agora, só não fechar a porta. Os moldes M1/M2/M3 em inglês já existem (são os
originais do Adam, seção 4) — viram os templates do adapter SMS quando a hora chegar.

**Por que isto importa pro dev:** a diferença entre "abstrair canal agora" (custo: uma
interface fina) e "acoplar no WhatsApp agora" (custo futuro: reescrever o motor pra vender
EUA) é enorme. É decisão de arquitetura barata hoje, cara depois.

---

## 4. As mensagens — adaptadas do Adam pro Brasil (WhatsApp, voz da marca)

O Adam usa SMS em inglês, tom americano. Aqui: WhatsApp, português, tom brasileiro natural
(a voz FINAL sai do `nucleo/voz.md` de cada cliente via `/escritor-br` — estes são os
MOLDES). Placeholders: `{cliente}`, `{atendente}`, `{negocio}`, `{link}`.

### M1 — Check-in (sem pedir nada)

**Adam (EUA):**
> "Hey Sarah, this is Mike from ABC Roofing. Just checking in to make sure everything looks
> good with the work we did today."

**Nosso molde (BR):**
> Oi {cliente}, aqui é o {atendente} da {negocio}. Passando só pra saber se ficou tudo certo
> com o serviço de hoje. Deu tudo certo por aí?

Função idêntica: abre conversa real, captura reclamação cedo, NÃO pede review. A pergunta
final ("deu tudo certo?") puxa reply — que é o que aciona o M2.

### M2 — Pedido de review (vai pra TODOS, mesmo link)

**Adam (EUA):**
> "Hi Sara, Mike here from ABC Roofing. Just wanted to say thanks again for the opportunity
> to work with you. If you have 30 seconds, would you mind sharing your experience in a quick
> Google review? It helps other customers know they can trust us."

**Nosso molde (BR):**
> {cliente}, obrigado de novo pela confiança! 🙏 Se puder me ajudar com 30 segundos: deixaria
> uma avaliação rápida da sua experiência aqui no Google? Ajuda muito outras pessoas a
> confiarem na gente. É só clicar: {link}

Regra travada: **mesmo texto, mesmo link, pra todo mundo** — feliz ou não. Personalização só
de nome ({cliente}, {atendente}). Filtrar por sentimento aqui = gating = proibido.

### M3 — Lembrete gentil (só pra quem não clicou)

**Adam (EUA):**
> "Just a quick follow-up. If you haven't had a chance yet, we'd really appreciate a quick
> Google review. It helps others know they can trust us."

**Nosso molde (BR):**
> Oi {cliente}, só um lembrete rápido 😊 Se ainda não teve tempo, a gente ia adorar sua
> avaliação no Google — leva menos de um minuto e ajuda demais. {link}

O Adam diz que é o disparo mais PULADO e o que mais gera review. Não cortar o M3.

### (Camada 2) — Reativação de base histórica

Mesma M2/M3, disparadas pra clientes antigos. Aqui vira **template HSM a submeter à Meta**
(marketing, não transacional) e cai no gate LGPD/WhatsApp da `/reativar`. Ajuste de tom pro
molde de reativação: abrir reconhecendo que faz tempo ("faz um tempo que você esteve com a
gente...") antes do pedido.

### (Camada 3) — Resposta automática à review

Não é mensagem WhatsApp — é resposta pública no Google. Gerada pelo Haiku na voz da marca,
personalizada ao texto da review. Molde de prompt, não molde de mensagem fixa.

---

## 5. Onde isso pluga no OS (lado marketing)

O motor é backend (CRM+agente). O OS entrega a camada de marketing por cima:

| Peça OS | Papel no Review Engine |
|---|---|
| `/oferta` + `nucleo/ofertas.md` | Define "Gestão de Google Review via WhatsApp" como oferta ATIVA modular (preço-âncora ~R$300-500/mês, vendida ISOLADA — regra "vender modular, upsell depois") |
| `/local` | Casa nativa: já cuida do Google Business Profile, já escreve resposta a avaliação na voz da marca (é a origem natural da Camada 3) |
| `/depoimento` | Gera o pedido de prova social; o Review Engine é o motor que dispara em escala |
| `/escritor-br` | Passa os moldes M1/M2/M3 pra voz de cada cliente |
| `/reativar` | Dona do gate LGPD/WhatsApp que a Camada 2 herda |
| `/roi` + `/relatorio` | Mede: reviews geradas/mês, taxa de conversão da base, ranking no map pack antes/depois |

**Decisão de onde a sequência de review MORA como skill:** candidata a um **preset dentro da
`/local`** (já é a dona do Google local) chamando o motor do CRM — ou skill própria
`/review-engine` se ganhar corpo. Decisão de produto, não deste PRD.

---

## 6. Resumo executivo (o que fazer, em ordem)

**Lado CRM/agente:**
1. **🔴 O GATILHO "serviço entregue"** (3.0) — a peça mais importante. AGENDA como fonte
   principal (Google Calendar API + booking próprio), stage "entregue" no pipeline, status
   de pedido, ou botão manual — **config por tenant**. `deal.won` NÃO serve. Sem gatilho,
   nada é automático.
2. **🔴 Tipo de campanha `review_sequence`** (3.1) — workflow condicional 3 passos + máquina
   de estado por contato. Decidir CRM-nativo (A) vs agente-stateful (B).
3. **🔴 Link de review rastreado por contato** (3.2) — `/r/<token>` + evento `clicked`.
   Sem isso não há M3 correto.
4. **🟡 Classificação de sentimento no reply do M1** (3.3) — Haiku, `{satisfeito/problema/
   neutro}`, atrasa M2 pra problema (NÃO é gating — documentar a fronteira).
5. **🟡 Rate-limiter Camada 2** (3.5) — 2-3/20min/comercial por tenant.
6. **🟡 Motor canal-agnóstico** (3.6) — desenhar o envio como adapter (`canal.send()`), não
   acoplado ao WhatsApp. Construir SÓ o adapter WhatsApp agora; adapter SMS (Twilio) + régua
   TCPA/10DLC é fase futura EUA. Decisão de arquitetura barata hoje, cara depois.
7. **🟢 Google Business Profile API** (3.4) — Camada 3; começar manual se travar.

**Lado OS (não bloqueado pelo CRM):**
8. Moldes M1/M2/M3 (seção 4) prontos → viram preset da `/local` (ou skill própria).
9. Oferta modular "Gestão de Google Review" no `nucleo/ofertas.md` via `/oferta`.

**Gates que valem SEMPRE (Camada 2 em escala):** consentimento próprio de WhatsApp + opt-out
(LGPD) e template HSM aprovado (Meta) — herdados do gate da `/reativar`. Camada 1 (pós-serviço,
1-a-1, transacional) tem risco menor que Camada 2 (marketing em massa pra base velha), mas
**a M2/M3 pedem review = já são marketing** — confirmar enquadramento de template com a Meta.

O dono crava as escolhas A/B na revisão. Ordem sugerida: 1→2→3 destravam a Camada 1 (o MVP
vendável — gatilho + sequência + link rastreado); 4 é o diferencial vs GHL; Camadas 2 e 3
vêm depois. **O gatilho (1) é o que separa "automático" de "o dono aperta um botão"** — sem
integração de agenda/pipeline, o MVP roda com botão manual e evolui pra automático quando a
agenda de cada cliente é conectada no provisionamento.
