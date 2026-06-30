---
name: velocidade
description: >
  Use pra mostrar quanto o negócio perde por responder lead devagar — "/velocidade",
  "tempo de resposta", "quanto perco demorando pra responder", "speed to lead", "respondo
  meus leads rápido?", "vale a pena responder na hora?". Calcula (por script, nunca de
  cabeça) quantos leads e quanto dinheiro o negócio deixa na mesa por demorar — e o ganho
  de responder em <5min. É o argumento de venda nº 1 da esteira e a métrica de saída da Fase 1.
---

# /velocidade — Speed-to-lead: o dinheiro que vaza pela demora

O argumento de venda mais forte e mais provável de fechar: **"você demora X pra responder um
lead; cada hora de atraso custa Y leads e R$ Z."** É concreto, é do negócio do cliente, e o
mecanismo é dado de mercado verificável — não promessa.

Por que pega: contato em **<5min qualifica ~21x mais** (e conecta ~100x mais) que em 30min+;
**<1min converte 391% mais**; **78% compra de quem responde primeiro**. A maioria das PMEs
demora **42h** em média. O delta entre 42h e 5min é dinheiro na mesa — esta skill põe número nele.

Autoria: ImpulsoX AI. Conteúdo original. Cálculo por `scripts/lib-velocidade.mjs` (dinheiro só
por script — regra da casa). Fontes do mecanismo em `docs/auditoria-esteira-2026-06-29.md`.

## Onde entra na esteira

- **Métrica de saída da Fase 1** (`docs/blueprint-esteira-crescimento.md`): "tempo médio de 1ª
  resposta < N min" é como se prova que a casa está arrumada antes do ads.
- **Argumento de abertura** do `/raio-x` (diagnóstico de venda) e do `/proposta` — elas chamam
  esta skill pra cravar o número da perda no início da conversa comercial.

## Degrau mínimo (Escada de Contexto) — roda em qualquer degrau

Esta skill NÃO trava esperando o CRM. Duas fontes pro tempo de resposta atual:

1. **Prospect novo / sem CRM (degrau 1):** estimativa. O dono diz (ou confirma) o tempo médio
   que ele leva pra responder um lead hoje. Se não sabe, usar a média de mercado (**42h**) como
   rascunho marcado "confirmar com o cliente". Leads/mês e ticket médio vêm do `negocio.md` ou
   da pergunta.
2. **Cliente plugado no CRM (degrau 4):** dado real. Lê `lib-crm` `listContacts` (lead criado →
   1ª interação) → `tempoMedioResposta()` calcula o tempo real. Aí mede a melhora ao longo do
   tempo (antes/depois), não só estima.

Sempre marcar **fato** (CRM / confirmado pelo dono) vs **suposição** (default de mercado).

## O que ler antes

- `nucleo/negocio.md` — ticket médio / valor por cliente, volume de leads, o que o negócio vende.
- `nucleo/voz.md` — o argumento sai na voz da marca.
- `.env` (`CRM_BASE_URL` + `CRM_TOKEN`) — só no modo dado-real; sem token, roda por estimativa.

## Como roda

1. **Coletar as 3 entradas** (perguntar só o que falta; usar default marcado se o dono não sabe):
   - **leadsMes** — quantos leads/mês o negócio recebe.
   - **tempoAtualMin** — quanto leva pra dar a 1ª resposta hoje (do CRM, ou estimativa do dono,
     ou 42h de default marcado).
   - **valorPorCliente** + **taxaFechamentoBase** — pro ganho em R$ (do `negocio.md`/CRM; sem
     eles, mostra só o ganho em LEADS, marca o R$ como pendente).
2. **Calcular por script:** `calcularPerda({ leadsMes, tempoAtualMin, tempoMetaMin: 5,
   valorPorCliente, taxaFechamentoBase })` da `lib-velocidade`. NUNCA calcular de cabeça.
   - Modo CRM: `tempoMedioResposta(pares)` primeiro, pra achar o `tempoAtualMin` real.
3. **Montar o argumento** (na voz da marca): hoje você qualifica ~X leads/mês; respondendo em
   <5min seriam ~Y; são **Z leads extras** (multiplicador "≈Nx mais") ≈ **R$ W/mês** na mesa.
   Toda métrica vinda do script; pendência marcada explicitamente ("confirmar ticket pra fechar
   o R$").
4. **Entregar** o bloco pronto pra colar no `/raio-x`/`/proposta`, ou como peça avulsa. No modo
   CRM, registrar o tempo atual como linha de base pra medir a melhora depois.
5. **Fechar** apontando o próximo passo.

## Honestidade dura (o que NÃO fazer)

- **Não prometer resultado.** O índice é um modelo conservador do mecanismo de mercado, não
  garantia de conversão. Dizer "potencial estimado", nunca "você VAI faturar X".
- **Não inventar entrada.** Sem leadsMes/ticket → o script devolve pendência; mostrar o que dá
  (ganho em leads) e marcar o R$ como "a confirmar". Nunca preencher com chute.
- **Default de mercado é rascunho, não fato.** 42h e os multiplicadores são da pesquisa; marcar
  como suposição até o dado do cliente confirmar.
- A solução que fecha o gap (responder em <5min no automático) é o **agente WhatsApp** (Pilar 3,
  ~jul/2026) — esta skill PROVA a perda; o agente é quem executa o conserto. Não prometer o
  conserto automático antes do agente existir.

## Teste de aceitação (comportamental)

1. "Respondo meus leads em 1 dia, recebo 100/mês, ticket R$800, fecho 20%" → calcula por script:
   ~82 leads extras/mês, ~R$13k de potencial; tudo do `lib-velocidade`, nada de cabeça.
2. Dono não sabe o tempo → usa 42h de default MARCADO "confirmar"; não finge precisão.
3. Sem ticket/taxa → mostra ganho em LEADS, marca o R$ como pendente; não inventa valor.
4. Cliente no CRM → lê timestamps reais, calcula o tempo médio, registra linha de base.
5. Pedido pra "garantir" o resultado → recusa; fala em potencial estimado, cita o mecanismo.

---

**✓ Pronto:** o número da perda por demora (leads + R$/mês, por script) + o argumento na voz da marca · **→ próximo passo:** colar no `/raio-x`/`/proposta` como abertura; o conserto (responder <5min no automático) é o agente WhatsApp (Pilar 3) quando existir. No modo CRM, vira a métrica de saída da Fase 1 medida no tempo. Pré-requisito: leads/mês + tempo de resposta (CRM ou estimativa do dono); sem ticket, mostra só o ganho em leads.