# Ideia — Hermes como gerente de CRM + monitor de reviews (background worker)

> Ideia/PRD de uma peça de INFRA nova: um agente autônomo que roda contínuo em background pra
> tarefas leves e repetitivas (monitorar Google review, gerenciar o CRM), separado do
> ImpulsoX-OS (Claude Code) que faz o trabalho criativo sob demanda. Pesquisado 2026-06-30.
> Status: **IDEIA documentada — não construído.** Produto da ImpulsoX AI.

---

## A divisão de trabalho (por que dois agentes, não um)

| | ImpulsoX-OS (Claude Code) | Hermes (background worker) |
|---|---|---|
| Quando roda | sob demanda, sessão de trabalho | contínuo, 24/7, sozinho |
| O que faz | PRODUZ: página, post, campanha, reel (pesado, criativo) | OPERA: monitora review, gerencia CRM, follow-up (leve, repetitivo) |
| Onde vive | seu computador / esta sessão | VPS de $5 ou serverless (hiberna ocioso) |
| Modelo | Claude (Opus) | modelo barato (ver "motor" abaixo) |

**Não competem — complementam.** O Hermes é o "funcionário" que cuida da rotina enquanto o
ImpulsoX-OS é o "estúdio" que cria. O Hermes plugaria no CRM e no `gbp.mjs` por MCP.

## O que é o Hermes Agent (pesquisado — fato)

- Agente autônomo **open-source da Nous Research** (o lab dos modelos Hermes). MIT.
- **Roda contínuo e fica mais capaz com o tempo** (learning loop: cria/melhora skills sozinho,
  memória persistente entre sessões).
- **Vive onde você puser** — VPS $5, GPU, ou serverless (Daytona/Modal: hiberna quando ocioso,
  custo quase zero parado). Não preso ao laptop. Fala por 20+ canais (Telegram, WhatsApp, e-mail…).
- **60+ ferramentas + MCP** — conecta a qualquer servidor MCP, então dá pra plugar no CRM e no
  `gbp.mjs`. Skills no padrão agentskills.io (portáveis).
- **Funciona com qualquer modelo** — Nous Portal, OpenRouter, OpenAI, ou qualquer endpoint.
- Doc: hermes-agent.nousresearch.com/docs

## ⚠️ O motor de modelo — o plano Codex $20 NÃO serve (pegadinha)

A ideia inicial era usar o **plano ChatGPT/Codex de $20** como motor. **Não dá** (pesquisa
confirmou — Morphllm, OpenAI community):

- O plano $20 dá acesso ao Codex/ChatGPT **dentro da ferramenta da OpenAI** (app, CLI do Codex).
- Um agente externo como o Hermes precisa de **API key** (cobrada por token, fatura separada).
- **"Não existe assinatura Codex pra API — uso por API key é cobrado nos preços de token padrão."**

**Os motores que funcionam de verdade:**
1. **OpenRouter** — o Hermes já é feito pra isso; escolhe modelo barato, paga por uso.
2. **Nous Portal** — o portal da própria Nous (um OAuth cobre modelo + ferramentas).
3. **API key OpenAI** com modelo mini/barato — paga por token.

**Custo real estimado (a confirmar com medição):** pra "monitorar review 1x/dia + CRM leve" o
volume é baixíssimo (poucas chamadas/dia). Em modelo barato via OpenRouter, **provavelmente
custa MENOS que $20/mês** — mas é por uso, não assinatura fixa. Medir antes de cravar.

## O que o Hermes-gerente faria (escopo da ideia)

1. **Monitor de Google review (diário):** lê os reviews novos do Perfil do cliente, responde —
   positivo em lote aprovado, negativo só com leitura humana (protocolo do `/local`). **Não
   depende do WhatsApp** — é Google Business Profile API.
2. **Gerente de CRM (leve):** checa o funil, dispara o follow-up que já existe, sinaliza o que
   precisa de atenção (deal parado, lead sem resposta) — o que a `/carteira` mostra sob demanda,
   o Hermes vigia contínuo.
3. **(Futuro, quando o agente WhatsApp existir):** pedir review / reativar base via WhatsApp.

## Gaps reais pra construir (honesto — não está pronto)

1. **`gbp.mjs` não LISTA reviews novos.** Hoje tem `--acao responder` (responde 1 review por
   nome) e `post`. Falta `--acao listar` (buscar os reviews recentes pra o monitor agir). É a
   peça que falta no conector Google. + a credencial Google (OAuth) precisa estar aprovada/testada
   em produção (hoje não testada).
2. **CRM não expõe MCP.** A integração hoje é REST via `scripts/lib-crm.mjs` (service token por
   tenant). Pro Hermes consumir, ou (a) se expõe um MCP do CRM, ou (b) o Hermes chama a API REST
   direto via uma skill/tool dele. (b) é mais simples pra começar.
3. **Isolamento multi-tenant.** O CRM isola por token (1 por cliente). O Hermes-gerente precisaria
   de um token por cliente que monitora — mesma régua da `/carteira` (nunca token mestre).
4. **Compliance herdada.** Tudo que o Hermes responde/dispara segue as regras da casa: review sem
   gating/incentivo, resposta negativa com leitura humana, LGPD no que tocar WhatsApp.

## Caminho sugerido (quando for construir)

1. Adicionar `--acao listar` ao `gbp.mjs` (buscar reviews recentes de um location).
2. Testar o `gbp.mjs` em produção (credencial Google aprovada) — resolve o gap do `/local`.
3. Subir o Hermes num VPS barato, modelo via OpenRouter/Portal (não o plano $20).
4. Dar a ele uma skill que: (a) lista reviews novos via `gbp.mjs`, (b) responde pelo protocolo do
   `/local`, (c) lê o CRM via `lib-crm`. Começar só com o monitor de review (escopo mínimo).
5. Medir o custo real de um mês antes de escalar pra N clientes.

---

*ImpulsoX-OS · ideia documentada (não construída) · Hermes = Nous Research, open-source · 2026-06-30*