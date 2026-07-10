# Acervo: "Review Engine" (Go High Level) — dissecado

> Fonte: vídeo YouTube (id rgwR8qjbxRM), criador "Adam", agência de 1 pessoa,
> 3 agências 7-dígitos construídas, 1500+ pequenos negócios atendidos.
> Transcrito via `/watch` (captions, sem frames — vídeo talking-head, sem demo visual).
> Capturado 2026-07-10. MECÂNICA extraída pra reuso — nunca o conteúdo/oferta dele.

---

## 1. A oferta dele (o que ele vende)

**Um serviço, um preço, um problema.** Não site, não ads, não social media.
Gestão de **Google Reviews** pra negócio local (dentista, roofer, med spa, auto
shop, chiropractor). Preço: **$200–300/mês** (ele cobra $297).

Tese de posicionamento: negócio local não tem problema de QUALIDADE, tem
problema de **VISIBILIDADE por esquecimento** — ninguém lembra de pedir review.
"Not a quality problem. That is a visibility problem pretending to be a
quality problem." Isso vira a única frase de venda.

Regra de ouro dele (2 avisos no fim do vídeo):
1. **Nunca ser a opção barata.** $200–300/mês mínimo, nunca $50 "de favor".
2. **Nunca empurrar pacote com 5 serviços no dia 1.** Um problema, uma solução,
   resultado provado → upsell depois vem fácil. (Isto é literalmente a mesma
   regra que já está no nosso CLAUDE.md: "vender modular, upsell depois".)

Matemática de justificativa de preço pro cliente: 1 cliente extra/mês por causa
do sistema já paga o ano inteiro de mensalidade (ex.: roofer, ticket médio
$5.000 vs $297/mês).

---

## 2. O sistema — "Review Engine" (3 mensagens, 1 campanha)

Roda dentro do **Go High Level (GHL)**, que ele descreve como "a única software
que uso pra rodar minha agência inteira" (o CRM/automação dele há 6+ anos).

### Mensagem 1 — Check-in (não é pedido de review)
Disparada logo após o serviço concluído.
> "Hey Sarah, this is Mike from ABC Roofing. Just checking in to make sure
> everything looks good with the work we did today."

Sem link, sem pedido. Função: abrir conversa real + capturar reclamação cedo
(cliente insatisfeito responde aqui, ANTES de qualquer pedido de review —
vira oportunidade de resolver o problema antes que vire review ruim).

### Mensagem 2 — Pedido de review (vai pra TODOS, sem exceção)
Disparada após resposta do check-in, ou X horas depois se não responder.
> "Hi Sara, Mike here from ABC Roofing. Just wanted to say thanks again for
> the opportunity to work with you. If you have 30 seconds, would you mind
> sharing your experience in a quick Google review? It helps other customers
> know they can trust us."

**Regra de compliance inegociável dele:** essa mensagem 2 vai pra TODO MUNDO,
mesmo link, mesmo processo, independente do que disseram no check-in.
Segmentar quem recebe o link (feliz→Google, infeliz→canal privado) é
**"review gating"** — proibido pelas regras do Google. Personalização é só
nome (cliente + dono), nunca filtro de sentimento.

### Mensagem 3 — Lembrete (a mais pulada, a que mais gera review)
Sistema checa se a pessoa já clicou no link. Se sim, para (não incomoda 2x).
Se não, manda um lembrete gentil:
> "Just a quick follow-up. If you haven't had a chance yet, we'd really
> appreciate a quick Google review. It helps others know they can trust us."

Ele afirma: "a huge share of the reviews actually come in" nesse terceiro
disparo — as pessoas não ignoram, só esquecem.

### Camada 2 — Reativação de base (primeira campanha em todo cliente novo)
Pega lista de clientes ANTIGOS (booking software, QuickBooks, planilha) e
dispara a MESMA campanha de review pra esse histórico — **em ritmo controlado
(2-3 a cada ~20min, horário comercial)**, nunca tudo de uma vez (parece
antinatural pro Google e converte pior). Taxa dele: 8–15% de conversão em
review. Ex.: negócio com 500 clientes antigos → 40–75 reviews novas em
semanas. Isso vira o case study que gera boca-a-boca pro agenciador.

### Camada 3 — Resposta automática às reviews (IA)
Dentro do GHL: liga "AI auto responses" na aba de reputação, define delay
(ele sugere 10–15min) — toda review recebe resposta personalizada sem o dono
tocar em nada. Motivo duplo: (1) Google ranqueia melhor negócio que responde
reviews ativamente; (2) prospect que rola o Google vê resposta a TODAS as
reviews = confiança, converte mais que concorrente com reviews "mortas" sem
resposta.

---

## 3. O que isso é, na estrutura (mecânica, sem o conteúdo dele)

| Peça GHL | Papel |
|---|---|
| CRM/lista de contatos | Fonte da base ativa + histórica |
| Automação de disparo (workflow com espera condicional) | As 3 mensagens sequenciais |
| Canal SMS/WhatsApp-like | Onde as 3 mensagens saem |
| "Reputation" module + IA de resposta | Camada 3 (resposta automática) |
| Trigger por reply / by no-reply after X horas | Condicional mensagem 2 |
| Trigger por "já clicou no link" | Condicional mensagem 3 (skip se já resolveu) |

É **1 workflow condicional de 3 passos + 1 campanha de reativação de base +
1 automação de resposta**. Nada aqui é complexo — a genialidade é a ORDEM e o
TIMING (check-in antes de pedir, ritmo de disparo, terceiro lembrete que
ninguém manda).

---

## 4. Mapeamento pra nós — Brasil (CRM + Hermes + agente WhatsApp)

O que ele faz com GHL, nós já temos os blocos pra fazer com **CRM próprio +
Hermes (agente) + agente WhatsApp** — e com vantagem: WhatsApp é o canal
dominante de contato no Brasil (SMS não pega tração aqui), e nosso agente já é
conversacional (não só disparo de template).

| Peça dele (EUA/GHL) | Equivalente nosso (Brasil) |
|---|---|
| GHL workflow 3 mensagens | Hermes/agente WhatsApp dispara sequência condicional via CRM |
| SMS | WhatsApp (canal certo pro Brasil) |
| Lista de clientes antigos (QuickBooks etc) | Import CSV no CRM (já existe o fluxo, 4 passos) |
| "AI auto responses" pra review | Agente WhatsApp responde e também pode auto-responder Google Review via integração (checar API do Google Business Profile) |
| Disparo em ritmo (2-3/20min) | Rate-limit no script de disparo do CRM — já é o tipo de regra que a `/local` e `docs/formula-ads-jp.md §0.5.B` já cobrem (coleta de review compliant, sem gating) |

**Já temos a régua de compliance mais rígida que a dele** — `docs/formula-ads-jp.md
§0.5.B` já proíbe gating e incentivo ao cliente por review, alinhado 1:1 com o
"review gating is not allowed" que ele descreve. Não precisa importar essa
regra, ela já existe no núcleo.

### Onde isso pluga no ImpulsoX-OS hoje
- `/reativar` — já é a skill de reativação de base; a "campanha de reativação
  de reviews" dele é um CASO ESPECÍFICO de reativação (oferta = pedir review,
  não vender de novo). Dá pra virar um modo/preset dentro de `/reativar`.
- `/depoimento` + `/local` — já cobrem captação de prova social compliant.
  Falta a MECÂNICA das 3 mensagens sequenciais com timing (check-in →
  pedido → lembrete condicional) — isso é novo, vale documentar como preset
  de sequência dentro de `/depoimento` ou `/local`.
- **CRM v3 + Hermes** — o workflow condicional (esperar reply, checar se já
  clicou, disparar por rate-limit) é trabalho de automação/backend, não de
  skill de conteúdo. Isso é candidato a feature do CRM: "sequência de review"
  como tipo de campanha nativa, com as 3 mensagens como template editável.
- Agente WhatsApp — é o canal de disparo + quem processa reply (detecta
  reclamação vs "ok, obrigado" pra decidir se aciona o dono do negócio antes
  de mandar mensagem 2).

### Diferença de mercado a marcar
- **EUA dele:** SMS é canal nativo, Google Review é a métrica que domina
  local SEO (map pack). GHL é a plataforma tudo-em-um dele.
- **Brasil nosso:** WhatsApp é o canal (não SMS), Google Review no Brasil
  também domina map pack local — a lógica de negócio bate igual, só troca
  o canal e a régua de compliance que já temos documentada é equivalente
  (não existe "review gating" como termo formal no Brasil, mas Google aplica
  a mesma penalidade globalmente).

### Oportunidade concreta (se quiser avançar)
Virar isso um **preset de oferta** tipo a dele: um serviço só (gestão de
Google Review via WhatsApp), preço-âncora tipo R$ 300-500/mês, vendido
ISOLADO pra PME local antes de qualquer upsell — bate direto com a regra
"vender modular, upsell depois" que já está no nosso CLAUDE.md. Isso é
decisão de oferta (`/oferta` ou `nucleo/ofertas.md`), não decisão técnica.
