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
O papel de **SDR outbound tem spec pronta** no Cold Outreach Playbook (cartão
`ImpulsoX-AI/material-matt/openclaw-cold-outreach-playbook.md`): signal detection por ICP
(8 tipos de sinal de compra, urgency_score) + pipeline multi-agente de enriquecimento
("never fabricate; null se não achou") + **Inbox Management Agent** — lê respostas a cada
15 min, categoriza em 7 tipos (INTERESTED alerta a dona na hora; UNSUBSCRIBE/ANGRY
removem de tudo; MAYBE LATER agenda nurture 30/60/90d) e fecha o dia com relatório 18h.
⚠️ Adaptação BR obrigatória: canal WhatsApp/DM compliant, LGPD, nunca volume US cru.
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
- **Roteamento por custo (a regra dos 97%) — SUBSTITUÍDO no nosso caso:** o Matt roteia
  Haiku/Sonnet/Opus porque paga por token na API. **Decisão da dona (2026-07-07): o Hermes
  roda na SUBSCRIPTION do Codex (plano ChatGPT $20, OAuth — ver seção "O motor de modelo"
  acima), custo FIXO** — rodar direto na API por token ficaria caro demais. Com custo fixo,
  o roteamento multi-modelo perde a razão de ser; o que SOBREVIVE da mecânica é o
  princípio "tarefa certa pro contexto certo" (task folder com escopo apertado) e a
  auditoria mensal — só que auditando LIMITES DE USO da subscription (rate/janela do
  plano), não preço por chamada. Não muda a regra da casa de rodar o trabalho interativo
  da agência em Opus.
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

## Segurança do Hermes — hardening adaptado (OpenClaw Security Guide, Sprint jul/2026)

O guia de hardening do OpenClaw (cartão com comparação item a item e os agent prompts
copy-paste: `ImpulsoX-AI/material-matt/openclaw-security-hardening.md`) assume serviço
web multi-usuário exposto na internet. O nosso perímetro é outro — VPS atrás de
Tailscale, 1 operador, subscription Codex — então JWT/RBAC/CORS/rate-limit público se
dissolvem numa regra só: **nada escuta em porta pública; tudo atrás do tailnet; /docs e
/debug não existem em produção**. O que TRANSFERE vira requisito de construção:

**Regra de supply chain (Skills Security Guide, fev/2026 — ClawHavoc: 341 skills
maliciosas num registro público de skills de agente):** o Hermes **NÃO instala skill de
registro público. Nunca.** Só skills escritas pela casa — operação sensível (credencial,
CRM, dado de cliente) é sempre código próprio. Protocolo geral de vetting de terceiros:
`docs/seguranca-ferramentas-terceiros.md`.

**Inegociáveis de dia 1 (antes do Hermes agir sozinho):**
1. **Defesa de prompt injection (§6)** — o Hermes lê input NÃO-CONFIÁVEL (review de
   cliente, e-mail, webhook) e age; injection vira ação real no mundo. Validação de
   input antes do modelo (padrões "ignore instructions" etc.), filtro de OUTPUT (key
   vazada, PII), **canary token no system prompt** (aparece na saída = injection
   detectada), quarentena progressiva da fonte.
2. **Kill switch + logging sem conteúdo (§7)** — agente sem operador olhando: log
   estruturado de EVENTO (nunca prompt inteiro, senha, key inteira; sufixos só),
   alertas em 3 níveis (crítico imediato / alto 15min / digest diário), kill switch
   manual com confirmação do owner, severidades P0-P3 com tempo de resposta.
3. **Secrets (§2)** — .env fora do git (já é regra), rotação 90d com lembrete, scan de
   histórico git (key deletada continua no history), pre-commit hook de padrões.
4. **Circuit breaker de USO (§5.2 adaptado)** — sem custo por token (subscription), o
   breaker vigia USO e AÇÕES: tarefas/hora vs janela do plano Codex, e tetos de ação
   no mundo (nº de e-mails/posts/respostas por dia). Escala de 4 degraus do guia:
   WARNING (alerta) → SOFT (degrada: só tarefas de leitura) → HARD (pausa ações
   externas) → EMERGENCY (tudo off, reset manual). Complementa os 4 requisitos do
   Nível 2 da /automacao-cliente. **Quem abastece o breaker é o pre-flight de peso**
   (Token Calibration Guide, cartão `material-matt/openclaw-token-calibration.md`):
   o agente ESTIMA o peso da tarefa antes de rodar (chamadas/tempo/janela) e calibra
   por loop de correção — estima → mede → devolve o delta → ajusta, por TIPO de
   tarefa, 3-4 rodadas até <10-15% de erro. Tarefa pesada com cota da janela no fim
   não entra: agenda pro próximo ciclo.

**Vale pro VPS JÁ, antes do Hermes (§10):** backup criptografado do CRM v3 com
**restore TESTADO** ("backup nunca testado não é backup, é esperança") — full diário +
verificação automática; runbook de recovery. Auto-purge de logs com conteúdo (7d) e
redação de PII em log (LGPD — o VPS guarda dado de cliente).

**Método de implantação:** o guia é todo em agent-prompts (auditoria primeiro, "do NOT
modify yet", depois cada controle) — na hora de construir, rodar os prompts do cartão
no próprio Claude Code contra o VPS, na ordem, com o checklist de 28 itens como gate.

## Gestão de contexto em messenger — o agente WhatsApp não vira vampiro de contexto (Token Guide, Sprint fev/2026)

Agente plugado em messenger reenvia a thread INTEIRA a cada mensagem — a conversa longa
estoura janela de contexto (qualidade degrada) e consome a cota do plano, mesmo com
subscription de custo fixo. O guia de token do OpenClaw (cartão com prompts prontos:
`ImpulsoX-AI/material-matt/openclaw-token-messenger.md`) resolve com 7 estratégias; 6
transferem pro nosso agente WhatsApp (~jul/2026) e pro Hermes:

- **Session clear com memória preservada** — triggers (`/clear` + `SESSION_CLEARED`
  programático), auto-clear com aviso aos 30 msgs e clear aos 50 (ou por contador de
  tokens). Descarta a THREAD, nunca a memória.
- **Memória em arquivos, thread descartável** — a tese central. Valida a arquitetura
  ImpulsoX-OS 1:1 (identity/context/tasks dele = nucleo/ + CLAUDE.md + escada nossos). O
  que adotamos de NOVO: `log.md` de decisões em 1 linha (`[DATA] [AÇÃO] resumo`, nunca
  transcrição) e o **protocolo de retomada pós-clear**: lê identidade → contexto → tarefas
  → últimas 5 entradas do log → retoma como se nada tivesse acontecido. Teste de aceite:
  limpar a sessão e ver se o agente retoma; se não retoma, a memória está incompleta.
- **Limites duros por arquivo de contexto** (500-800 tokens cada) com gatilhos de poda
  (arquivar/resumir/podar/mesclar ao estourar) — estilo telegráfico só em arquivo interno,
  nunca em texto pro cliente.
- **Limitador de resposta** — no WhatsApp é UX: confirmação em 1-2 frases, resposta padrão
  em 3-5, sim/não quando sim/não resolve. Cliente não quer parágrafo.
- **Handoff de 5 campos (<100 tokens)** — ao escalar pra dona: quem · problema em 1 frase ·
  o que já foi tentado (máx 3) · status · próximo passo recomendado. Nunca encaminhar a
  thread inteira. É o formato do alerta de escalação no celular.
- **Dedup + poda agendada** — antes de consultar CRM/API: "já tenho isso no contexto?";
  manutenção a cada 24h/50 interações (audita tamanhos, arquiva resolvido, re-comprime) —
  a curadoria semanal do CLAUDE.md, automatizada dentro do agente.

(Roteamento 85% Haiku não se aplica — subscription única, regra já fixada acima. Idem
prompt caching da API Anthropic: o guia de caching do OpenClaw confirma que auth por
subscription não expõe cache config — nada a configurar no nosso caso. O que fica dele é
o princípio de montagem: contexto ESTÁVEL primeiro no prompt (identidade, regras),
volátil no fim — favorece qualquer cache automático do provedor; e a nota operacional de
que credencial é POR agente, não herda. Cartão: `material-matt/openclaw-prompt-caching.md`.)

## Camada de visibilidade — o "Mission Control" do Hermes (doc do OpenClaw, jul/2026)

O agente autônomo precisa de um lugar onde a dona VÊ a operação sem abrir terminal
(cartão: `ImpulsoX-AI/material-matt/openclaw-mission-control.md`). Metade do Mission
Control já é nossa arquitetura (projects isolados = clones/`clientes/<nome>/`; chat com
contexto de projeto = sessão do Claude Code na pasta). O que entra como requisito NOVO:

- **Painel de visibilidade:** tasks ativas · execuções rodando · próximos agendamentos ·
  conclusões recentes · **tasks bloqueadas** (nada morre em silêncio) · histórico de runs
  com logs · artefatos indexados por run. Candidato natural: aba no hub do CRM v3 (painel
  multi-tenant já existe) — não construir dashboard do zero.
- **Scheduler anti-sobreposição:** cron do Hermes (brief diário, monitor de review) nunca
  dispara um job que ainda está rodando; run-now manual + histórico por job.
- **Executor allowlisted:** o Hermes só executa comandos de uma lista aprovada, com
  validação de path antes — nunca comando arbitrário (fecha com o kill switch e o Exec-
  com-aprovação do hardening).
- **Disciplina de task:** toda task declara o deliverable esperado antes de rodar; status
  Blocked é visível no painel, não engolido.

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