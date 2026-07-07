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

## O motor de modelo — o plano ChatGPT $20 (Codex OAuth) FUNCIONA ✅

Confirmado na doc oficial do Hermes (`/docs/integrations/providers`): a tabela de providers
lista **"OpenAI Codex — `hermes model` (ChatGPT OAuth, uses Codex models)"**. Ou seja:

- `hermes auth add openai-codex` → OAuth da conta ChatGPT (device code, login no browser) →
  usa GPT-5.4/5.5 **sem API key por token**, pelo plano de assinatura.
- É o mesmo padrão que o Claude Code usa com a assinatura Claude Max — OAuth de assinatura, não
  fatura de token. **O plano $20 cobre.**
- O Hermes também suporta outros providers OAuth de assinatura (Nous Portal, GitHub Copilot,
  Anthropic/Claude Max, xAI SuperGrok) e API keys (OpenRouter, etc.) — flexível.

> **Ressalva honesta:** integração via OAuth de assinatura é área que o provedor (OpenAI) pode
> apertar a qualquer momento — já aconteceu com outras ferramentas. Funciona hoje; tratar como
> "vale enquanto vale". Plano B sempre disponível: OpenRouter (modelo barato, por uso).

**Correção:** uma versão anterior deste doc dizia que o plano $20 não servia — estava ERRADO
(peguei a regra genérica de "assinatura ≠ API key" sem ver a integração OAuth específica do
Hermes). O dono corrigiu; verificado na doc oficial.

## O que o Hermes-gerente faria (escopo da ideia)

1. **Monitor de Google review (diário):** lê os reviews novos do Perfil do cliente, responde —
   positivo em lote aprovado, negativo só com leitura humana (protocolo do `/local`). Google
   Business Profile API via `gbp.mjs`.
2. **Gerente de CRM (leve):** checa o funil, dispara o follow-up que já existe, sinaliza o que
   precisa de atenção (deal parado, lead sem resposta) — o que a `/carteira` mostra sob demanda,
   o Hermes vigia contínuo.
3. **WhatsApp (o Hermes PODE ser o agente WhatsApp que faltava):** a doc oficial do Hermes tem
   **WhatsApp Business Cloud API** (a API OFICIAL da Meta — `/docs/user-guide/messaging/whatsapp-cloud`).
   Requer: app com `whatsapp_business_messaging` + `whatsapp_business_management`,
   `WHATSAPP_CLOUD_ACCESS_TOKEN` (System User permanente), webhook HTTPS público, allowlist de
   números. Com isso, o Hermes faz reativação, pedir review, nurture e atendimento via WhatsApp
   oficial — **com os gates LGPD + template HSM que a `/reativar` já exige**. Pode ser o motor que
   o blueprint esperava pra ~jul/2026.

   ### 🔴 REGRA DURA — Cloud API oficial obrigatória; Baileys PROIBIDO pra cliente

   O Hermes oferece **dois adaptadores** de WhatsApp. A diferença é risco de CONTA — não é detalhe:

   | Adaptador | O que é | Risco de ban | Uso |
   |---|---|---|---|
   | **Cloud API (oficial Meta)** | API que a Meta suporta | **"no account ban risk"** (doc oficial) | ✅ ÚNICO permitido pra cliente |
   | **Baileys (bridge)** | emula WhatsApp Web (QR code) | **ban real** | ❌ proibido pra cliente; só teste pessoal |

   Dado de mercado: em API não-oficial, **1 em cada 5 contas é banida em até 1 ano** ("não é SE,
   é QUANDO"). O número do cliente é o ativo nº1 dele — arriscá-lo viola a régua da casa ("nunca
   arriscar a conta de um cliente"). **Só Cloud API oficial.** O Baileys (jeito fácil, sem Meta
   Business) está fora de questão pra qualquer coisa de cliente.

   Cuidados extras mesmo na via oficial (da pesquisa):
   - **Nunca número VoIP/Twilio** pra registrar — dispara bloqueio. Número real dedicado.
   - **Número dedicado ao bot**, nunca o pessoal do dono (se a Meta restringir, não leva junto o
     WhatsApp pessoal).
   - Volume conversacional + template HSM aprovado + opt-in (já é a régua da `/reativar`).

> **Isto muda o blueprint:** o "agente WhatsApp ~jul/2026" pode ser **o próprio Hermes** rodando
> a Cloud API oficial, com o plano $20 de motor. Não é mais uma peça a construir do zero — é
> configurar o Hermes. (Verificar com o dono qual é o plano dele pro agente WhatsApp antes de
> assumir que o Hermes substitui — pode já haver outra construção em andamento.)

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

## A spec de operação madura — os 3 ritmos do agente-COO (Operator's Playbook, Sprint jul/2026)

Quando o Hermes sair do escopo mínimo (monitor de review) e virar o COO da operação, o
formato validado é **3 ritmos recorrentes, 3 altitudes** — "daily for execution, weekly
for tactics, monthly for strategy":

- **Brief DIÁRIO (7h, WhatsApp/Telegram):** receita de ontem (CRM), gasto de ads,
  sinais de churn no inbox, clientes sem valor registrado há 14+ dias → 5 bullets +
  cópia no vault (`05-Strategy/Daily-Briefs/`).
- **Brief SEMANAL (domingo):** receita vs semana/mês/ano anterior · novos clientes por
  canal de origem · churn com motivo declarado · pipeline por estágio com R$ ·
  capacidade da semana · itens flagados "revisar" durante a semana.
- **Review MENSAL (dia 1):** P&L · retenção por coorte de aquisição · ROI por canal ·
  SOPs atualizados no mês · as 3 maiores apostas do próximo mês baseadas no dado.

E o org chart AI-native que o Hermes ancora (7 papéis de IA antes de contratar humano):
chief of staff (os briefs acima) · research/concorrência · SDR outbound · CS/churn watch
· pós-produção de conteúdo · conciliação financeira · ferramentas internas (Claude Code).
Regra de contratação do playbook: humano só pra papel que exige julgamento/confiança/
relação que a IA ainda não cobre — nunca VA generalista pra fazer o que o agente já faz.
Além disso, todo agente autônomo herda os 4 requisitos do Nível 2 da
`/automacao-cliente` (guardas de decisão, teto de custo, memória de estado, log de decisão).

## Arquitetura de operação — projetos, tarefas e roteamento de modelo (OpenClaw guide, Sprint jul/2026)

O guia de treinamento do OpenClaw (o stack autônomo do Matt; no nosso contexto = Hermes)
define COMO o agente se organiza por dentro. Cartão bruto com os prompts exatos:
`ImpulsoX-AI/material-matt/openclaw-training-guide.md`. As mecânicas:

- **3 camadas:** Project Folder (negócio/cliente) → Task Folder (workflow repetido) →
  modelo atribuído por tarefa. Equivalência: Project = `clientes/<nome>/` (clone com
  núcleo), Task = skill do OS. **A arquitetura do ImpulsoX-OS já é essa** — o Hermes é a
  camada de execução autônoma por cima, não uma estrutura nova.
- **Anatomia do prompt de task folder:** papel com recusa de escopo + contexto em 1 frase
  + regras de output (formato/tom/comprimento/must-avoid) + **exemplos de bom E de ruim
  output** ("a seção mais poderosa; gaste mais tempo aqui").
- **Roteamento por custo (a regra dos 97%):** Haiku pra repetitivo/template (60-70% das
  tarefas), Sonnet pra execução criativa (25-30%), Opus só pra estratégia (5-10%).
  Começar SEMPRE no barato e subir só se a qualidade não bastar; auditoria mensal
  perguntando "algum folder pode descer de modelo?". Vale pro HERMES (operação autônoma
  24/7 em volume) — não muda a regra da casa de rodar o trabalho interativo em Opus.
- **Router-mestre:** agente cujo único trabalho é rotear (nunca executar) — task folder +
  modelo + razão em 1 linha; sem match → sugere folder novo. Testar com 5-10 requests
  antes de valer.
- **QC agent como gate:** revisa todo output antes de publicar (voz 1-10, acurácia de
  claims, CTA, tom, comprimento → PASS/NEEDS REVISION). É o nosso `/revisar` — validação
  externa de que o gate frio é peça obrigatória de agente autônomo.
- **Chaining:** output de um folder vira input do próximo (blog → 5 posts standalone →
  hashtags) — o nosso `/conteudo` → `/repurpose`, automatizado.

Decisão de registro (dona, 2026-07-07): isto NÃO vira skill agora — o Hermes não existe;
é spec de construção. Quando nascer, os prompts do cartão viram a configuração dos task
folders dele.

## Caminho sugerido (quando for construir)

1. Adicionar `--acao listar` ao `gbp.mjs` (buscar reviews recentes de um location).
2. Testar o `gbp.mjs` em produção (credencial Google aprovada) — resolve o gap do `/local`.
3. Subir o Hermes num VPS barato, motor via Codex OAuth (plano ChatGPT $20) — `hermes auth add
   openai-codex`. Plano B: OpenRouter por uso.
4. Dar a ele uma skill que: (a) lista reviews novos via `gbp.mjs`, (b) responde pelo protocolo do
   `/local`, (c) lê o CRM via `lib-crm`. Começar só com o monitor de review (escopo mínimo).
5. Medir o custo real de um mês antes de escalar pra N clientes.

---

*ImpulsoX-OS · ideia documentada (não construída) · Hermes = Nous Research, open-source · 2026-06-30*