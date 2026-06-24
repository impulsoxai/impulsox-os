---
name: depoimento
description: >
  Use pra pegar depoimento/prova no momento certo — "/depoimento", "quem fechou esse mês?",
  "pedir depoimento pros clientes novos", "transformar resultado em prova", "fechou negócio,
  hora de pedir review". Olha os deals GANHOS no CRM (cliente que acabou de ter resultado) e
  dispara o pedido de prova no timing que mais converte — o pós-resultado. O pedido em si e o
  banco são do /provas; esta skill é o GATILHO (quando pedir), lendo o CRM via lib-crm.
---

# /depoimento — Pega a prova no momento do resultado

Prova social é o ativo que mais converte e o mais escasso. O segredo não é só pedir — é
pedir **na hora certa**: logo depois do cliente ter o resultado, quando a satisfação está no
pico. O CRM sabe quem acabou de fechar (deal ganho); esta skill usa isso pra disparar o
pedido no timing que converte, fechando o loop "resultado → prova → mais vendas".

Autoria: ImpulsoX AI. Conteúdo original.

## Fronteira (o que esta skill é e o que NÃO é)

- `/provas` = **como** pedir (roteiro), **como** formatar o material bruto, e o **banco**
  (`nucleo/provas.md`) com status de autorização. Não duplicar.
- `/depoimento` = **quando** pedir — o gatilho. Lê o CRM, acha quem teve resultado, e aciona
  o pedido do `/provas` pra aquele cliente. Depois encaminha o material que voltar pro
  `/provas` formatar e guardar.

## Degrau mínimo (Escada de Contexto)

Degrau 4 (CRM no ar): precisa de `CRM_TOKEN` pra achar os deals ganhos. Sem token, roda em
modo "o dono diz quem fechou" e segue pro roteiro do `/provas`.

## Push vs poll (estado atual)

O ideal é o CRM **empurrar** `deal.won` por webhook (PRD 3.3) — aí a prova é pedida no
instante do fechamento. **O webhook ainda não existe**, então esta skill funciona por
**poll**: roda sob demanda ("quem fechou esse mês?") e olha os deals ganhos recentes. Quando
o webhook existir, vira automático. Não bloqueia — o poll já entrega o valor.

## O que ler antes

- `.env`: `CRM_BASE_URL` + `CRM_TOKEN`.
- `nucleo/provas.md` — não pedir de novo a quem já deu prova (o banco diz).
- `nucleo/voz.md` — o pedido sai na voz da marca (via `/provas`).

## Como roda

1. **Config.** `crmFromEnv()` da `lib-crm`. Sem token → pedir ao dono quem fechou.
2. **Achar quem teve resultado** via `lib-crm`: `listDeals(c, query)` filtrando
   `closeReason`=ganho / `stage`=fechado, recentes. (Filtro fino por data espera o sub 2;
   usar o que vier e marcar a janela.)
3. **Cruzar com o banco** (`nucleo/provas.md`): tirar quem já deu prova — não pedir 2x.
4. **Acionar o pedido** pra cada cliente novo de resultado: chamar o **roteiro do `/provas`**
   (o pedido na voz da marca, no canal certo). Esta skill não reescreve o pedido — usa o do
   `/provas`.
5. **Quando o material voltar:** encaminhar pro `/provas` formatar e registrar no banco com
   status de autorização. (Sem autorização → não vira peça pública — regra do `/provas`.)
6. **Fechar** apontando o próximo passo.

## Regras

- **Não duplicar o `/provas`** — o pedido, a formatação e o banco são dele; aqui é só o
  gatilho de timing.
- **Só prova autorizada vira peça pública** — regra dura herdada do `/provas`.
- **Timing, não spam** — pedir uma vez, no pós-resultado; não perseguir.
- **Token nunca em log** (lib-crm redige). **Nunca Postgres direto.** **PII fica no CRM.**
- **Só dado real** — não inventar que um cliente "ficou satisfeito"; o deal ganho diz que
  fechou, não que está feliz — o pedido confirma.
- É MOTOR: nasce no template, desce via `/atualizar-motor`.

## Teste de aceitação (comportamental)

1. CRM com 2 deals ganhos no mês → aciona o pedido de prova (via /provas) pros 2.
2. Um deles já está no banco → não pede de novo.
3. Sem `CRM_TOKEN` → pergunta ao dono quem fechou; segue pro roteiro do /provas.
4. Material volta sem autorização → /provas registra, mas não libera pra peça pública.
5. Webhook ainda não existe → roda por poll sob demanda, sem fingir tempo real.

---

**✓ Pronto:** pedido de prova acionado pra quem fechou (no timing do pós-resultado), via /provas · **→ próximo passo:** `/provas` formata e guarda o que voltar; depois a prova abastece copy/página/proposta. Pré-requisito: `CRM_TOKEN` pra achar os ganhos; sem ele, o dono informa quem fechou.
