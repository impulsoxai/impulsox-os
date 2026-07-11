---
name: review-engine
description: >
  Use pra montar a automação de Google Review de um negócio local — "/review-engine",
  "automação de review", "motor de avaliações", "pedir review automático", "sistema de
  review no WhatsApp", "quero mais avaliação no Google automático". Monta a sequência de 3
  mensagens (check-in → pedido → lembrete) na voz da marca, o roteiro de provisionamento por
  cliente e o plano de resposta às reviews — tudo pronto pra plugar no CRM + agente WhatsApp
  quando existirem. Vende modular em 3 tiers (básico sem Hermes → resposta IA → Hermes
  gerente). Distinta da /reativar (win-back com oferta) e da /local (perfil do Google): esta é
  o MOTOR de pedir+responder review em esteira.
---

# /review-engine — Motor de Google Review (pedir + responder, automático)

Negócio local que faz ótimo trabalho mas tem 20 avaliações quando devia ter 300 não tem
problema de qualidade — tem **problema de lembrança**. O dono esquece de pedir, o cliente
esquece de deixar. Esta skill monta o sistema que pede review sozinho no timing certo e
mantém o perfil respondido — o "Review Engine" (mecânica destilada do Adam/GHL em
`docs/acervo-review-engine-ghl.md`, adaptada pro Brasil: WhatsApp, não SMS).

Autoria: ImpulsoX AI. Conteúdo original. Mecânica copiada de quem já performa (regra da casa),
frase e identidade sempre do cliente.

## O que esta skill É e o que NÃO é

- **É** o motor de **pedir review em esteira** (3 mensagens condicionais) + **reativar a base
  histórica** pra review + o **plano de responder** as reviews. Monta os moldes na voz da
  marca e o roteiro de provisionamento pra plugar no CRM+WhatsApp.
- **NÃO é** a `/reativar` (win-back SEMPRE-com-oferta, vender de novo — o Review Engine é
  transacional, SEM oferta, pede só a review).
- **NÃO é** a `/local` (otimiza o Perfil de Empresa no Google — categorias, fotos, NAP). A
  `/local` cuida do PERFIL; esta cuida do FLUXO de review. Elas se completam: a `/local` é a
  dona da operação de responder review (protocolo do Passo 4 dela); esta skill orquestra o
  motor que gera o volume.
- **NÃO dispara nada sozinha** — monta e entrega pro CRM+agente. Estado honesto (padrão
  `/agente-ia`): o que ainda não existe fica marcado como pendência, não finge que roda.

## A regra que destrava a primeira venda: o motor roda SEM Hermes

O motor (pedir + reativar) vive no **CRM + agente WhatsApp** e roda sozinho. O **Hermes é
opcional** — camada de upsell, nunca pré-requisito. Cliente que "só quer a automação de
review" compra o Tier 1 e nunca toca no Hermes. (Arquitetura completa em
`docs/prd-motor-review-engine.md`.)

### Os 3 tiers (vender modular, upsell depois)

| Tier | O que entrega | Precisa | Pra quem |
|---|---|---|---|
| **1 — Básico** | pedir review (3 msgs) + reativar base, automáticos; dono responde as reviews (a skill rascunha) | CRM + WhatsApp + `gbp.mjs` | "só quero mais review, eu respondo" |
| **2 — + resposta IA** | tudo do T1 + resposta automática (positiva em lote aprovado, negativa espera humano) | + cron de resposta | "não quero nem responder" |
| **3 — Hermes gerente** | tudo do T2 + gestão de CRM + briefs + monitor 24/7 | + Hermes | "quero o funcionário IA" (upsell) |

Descobrir a necessidade primeiro e vender o tier que resolve a dor AGORA. Entrega bem → sobe.

## As 3 camadas do motor

### Camada 1 — Sequência de 3 mensagens (SEMPRE automática)

Disparada quando **o serviço é ENTREGUE** (não quando a venda fecha — ver "Gatilho" abaixo).

| # | Mensagem | Quando | Condição |
|---|---|---|---|
| M1 | Check-in (NÃO pede review) | serviço entregue | dispara sempre |
| M2 | Pedido de review (link Google) | reply do M1, ou X horas sem reply | vai pra TODOS, mesmo link |
| M3 | Lembrete gentil | Y horas após M2 | só se NÃO clicou no link |

### Camada 2 — Reativação da base histórica (SEMPRE automática)

Pega a lista de clientes antigos (import CSV no CRM) e dispara a MESMA sequência — em ritmo
controlado (2-3 a cada ~20min, horário comercial; nunca tudo de uma vez). Taxa de mercado:
8-15% deixam review (ordem de grandeza, validar no 1º caso). É marketing em escala → cai nos
gates LGPD+HSM (ver Regras).

### Camada 3 — Responder as reviews (3 níveis, cliente escolhe)

| Nível | Quem responde | Precisa Hermes? |
|---|---|---|
| 1 — Manual | `gbp.mjs --acao listar` lista; a `/local` redige; dono confirma | ❌ |
| 2 — Cron | script agendado responde positiva (lote aprovado), negativa espera humano | ❌ |
| 3 — Hermes | worker 24/7 faz tudo | ✅ |

**Regra dura (todos os níveis):** positiva → lote aprovado, nunca full-auto sem revisão;
**negativa → SÓ com leitura humana, nunca automática, nunca gradua.** (Protocolo do `/local`
Passo 4.)

## O Gatilho — "serviço ENTREGUE", não "venda fechada"

O M1 dispara **quando o cliente RECEBEU o serviço**, nunca quando a venda fechou (pedir review
antes de entregar = review vazia/negativa). A fonte muda por negócio — é config por cliente:

| Tipo de negócio | Fonte de gatilho |
|---|---|
| Serviço agendado (dentista, salão, oficina, clínica) | **AGENDA** — evento concluído (Google Calendar/booking) |
| Serviço por projeto (reforma, advogado) | stage "entregue" no pipeline (≠ venda ganha) |
| Produto/loja | status do pedido "entregue" |
| Fallback universal | botão manual "concluí o serviço" |

Sem gatilho ligado, o motor não é automático. É a peça #1 a definir no provisionamento.

## Os moldes das mensagens (na voz da marca)

O detalhe que faz funcionar (do Adam): cada mensagem usa **o nome do cliente E o nome do
DONO/atendente real** — parece que a pessoa que atendeu mandou no WhatsApp dela, não um
disparo de robô. `{dono}` = nome real de quem atendeu (Mike, Dr. Paulo, Ju), nunca o nome da
empresa nem "equipe". Placeholders: `{cliente}`, `{dono}`, `{negocio}`, `{link}`. A voz final
sai de `nucleo/voz.md` via `/escritor-br` — estes são os MOLDES de partida.

**M1 — Check-in (sem pedir nada):**
> Oi {cliente}, aqui é o {dono} da {negocio}. Passando só pra saber se ficou tudo certo com o
> serviço de hoje. Deu tudo certo por aí?

**M2 — Pedido de review (vai pra TODOS, mesmo link):**
> {cliente}, aqui é o {dono} de novo! 🙏 Obrigado pela confiança. Se puder me ajudar com 30
> segundos: deixaria uma avaliação rápida da sua experiência no Google? Ajuda muito outras
> pessoas a confiarem na gente. É só clicar: {link}

**M3 — Lembrete (só pra quem não clicou):**
> Oi {cliente}, só um lembrete rápido 😊 Se ainda não teve tempo, a gente ia adorar sua
> avaliação no Google — leva menos de um minuto e ajuda demais. {link}

**Camada 2 (base histórica):** mesma M2/M3, abrindo com reconhecimento do tempo ("faz um tempo
que você esteve com a gente...") antes do pedido. Vira template HSM a submeter à Meta.

## Degrau mínimo (Escada de Contexto)

Degrau 1 (nome + serviços do `nucleo/negocio.md`) pra escrever os moldes. Motor automático
espera o CRM (`CRM_TOKEN`) + agente WhatsApp (~jul/2026) + credencial Google do `gbp.mjs`. Sem
esses, a skill entrega os moldes + o roteiro de provisionamento e marca o disparo como
pendente — o dono usa manual até o motor existir (o Adam mesmo diz: "a estratégia funciona com
ou sem o software; o software só faz acontecer toda vez").

## O que ler antes

- `nucleo/negocio.md` (nome do dono, serviços, região) e `nucleo/voz.md` (voz das mensagens).
- `nucleo/perfil.md` — só faz sentido em negócio com presença local (`pme-local`,
  `profissional-liberal`). Perfil `criador` não tem review de Google — não rodar.
- `.claude/skills/local/SKILL.md` — Passo 3.5 (coleta compliant) e Passo 4 (responder review).
- `.claude/skills/reativar/SKILL.md` — o gate LGPD+HSM que a Camada 2 herda.
- `docs/prd-motor-review-engine.md` — a arquitetura completa (o que o CRM/agente ganha).
- `docs/acervo-review-engine-ghl.md` — a mecânica original dissecada.

## Como roda

1. **Ler o núcleo** — nome do dono/atendente, serviços, voz. Sem `nucleo/negocio.md`,
   reorientar pra preencher o mínimo (nome do dono é obrigatório pro molde funcionar).
2. **Escolher o tier** com o dono — descobrir a necessidade (só review? não quer responder?
   quer o gerente?) e vender o que resolve a dor agora.
3. **Definir o gatilho** — qual fonte de "serviço entregue" o negócio usa (agenda / pipeline /
   pedido / botão). Registrar no roteiro de provisionamento.
4. **Escrever os moldes** M1/M2/M3 na voz da marca → passar pelo `/escritor-br`. Camada 2:
   variação com reconhecimento do tempo.
5. **Montar o roteiro de provisionamento** (ver abaixo) — o checklist do que ligar por cliente.
6. **Plano de resposta** — definir o nível de C3 (manual/cron/Hermes) e deixar o protocolo do
   `/local` Passo 4 à mão pras respostas.
7. **Entregar** em `producao/review-engine/<negocio>.md`: moldes + gatilho + tier + roteiro de
   provisionamento + pendências honestas. O que já dá pra fazer manual, marcar como "pode já";
   o que espera o motor, marcar "pendente de CRM/WhatsApp".
8. **Fechar** apontando o próximo passo.

## Roteiro de provisionamento (o que ligar por cliente — "deixar pronto pra plugar")

Cada cliente novo precisa disso ligado UMA vez; depois roda sozinho:

- [ ] **CRM:** 1 service token do tenant no `.env` (`CRM_TOKEN`, `CRM_TENANT`).
- [ ] **Canal WhatsApp:** número Business API oficial (Meta) dedicado ao negócio — **nunca**
      número pessoal, **nunca** Baileys/não-oficial (risco de ban; regra do `ideia-hermes`).
- [ ] **Gatilho:** fonte de "serviço entregue" (agenda/pipeline/pedido/botão) + credencial
      (OAuth do calendário, webhook do sistema dele).
- [ ] **Link de review:** URL do Google Review do perfil + link rastreado por contato
      (`/r/<token>`) pra Camada 1 saber quem clicou (pro M3).
- [ ] **Base histórica (Camada 2):** CSV dos clientes antigos importado no CRM.
- [ ] **Gate LGPD/HSM:** consentimento de WhatsApp confirmado + template HSM submetido à Meta.
- [ ] **Google Business (Camada 3):** credencial do `gbp.mjs` aprovada + nível de resposta
      escolhido (manual/cron/Hermes).
- [ ] **Voz:** moldes M1/M2/M3 revisados pelo `/escritor-br` na voz do cliente.

## Regras

- **Motor nunca depende do Hermes** — Tier 1 roda com CRM+WhatsApp+`gbp.mjs`. Hermes é upsell.
- **Gatilho é entrega, não venda** — M1 só depois do serviço recebido. `deal.won` não serve.
- **Sem gating, nunca** — M2 vai pra TODOS, mesmo link, feliz ou não. Filtrar por sentimento
  (feliz→Google, insatisfeito→privado) é review gating, proibido pelo Google (multa real).
- **Sem incentivo ao cliente pelo review do Google** — nada de desconto/brinde/sorteio em
  troca. Incentivo só na equipe / canal próprio / pesquisa / referral (régua do `/local`).
- **Negativa só com leitura humana** — em nenhum nível a resposta a review negativa sai
  automática. Rascunha, humano libera.
- **WhatsApp só Cloud API oficial** — Baileys/não-oficial proibido pra cliente (o número é o
  ativo nº1 dele). Camada 2 em escala exige template HSM + consentimento próprio de WhatsApp +
  opt-out (gate da `/reativar`).
- **Só afirma o que é verdade** — a resposta e a mensagem nunca inventam fato; prova só
  autorizada (`nucleo/provas.md`).
- **Estado honesto** — o que ainda não tem motor fica marcado pendente, nunca "finge que
  dispara". **Token nunca em log** (lib-crm redige). **Nunca Postgres direto.**
- É MOTOR: nasce no template, desce via `/atualizar-motor`.

## Teste de aceitação (comportamental)

1. Negócio local com nome do dono no núcleo → escreve M1/M2/M3 na voz, com `{dono}` = nome
   real de quem atende (não a empresa).
2. Dono pede "só a automação de review" → oferece Tier 1 (sem Hermes), não empurra o pacote.
3. Perguntam pra disparar no `deal.won` → reorienta pro gatilho de ENTREGA (agenda/pipeline).
4. Sem CRM/WhatsApp no ar → entrega moldes + provisionamento e marca disparo pendente; não
   finge automático.
5. Alguém sugere mandar só pros clientes felizes → recusa (é gating) e explica.
6. Review negativa → plano manda pra leitura humana, nunca resposta automática.
7. Perfil `criador` (sem review de Google) → não roda, reorienta.

---

**✓ Pronto:** motor de Google Review montado — moldes M1/M2/M3 na voz da marca (com nome do
dono), gatilho de entrega definido, tier escolhido, roteiro de provisionamento e plano de
resposta, tudo pronto pra plugar no CRM+WhatsApp · **→ próximo passo:** `/local` mantém o
perfil e responde as reviews que chegam; quando o CRM+agente estiverem no ar, o provisionamento
liga o disparo automático. Pré-requisito: `nucleo/negocio.md` (nome do dono/serviços) pros
moldes; motor automático espera CRM+WhatsApp+credencial Google — sem eles, roda manual e marca
o pendente.
