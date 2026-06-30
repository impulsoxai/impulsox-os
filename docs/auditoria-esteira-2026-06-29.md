# Auditoria da Esteira de Crescimento — 2026-06-29

> Auditoria de olhos frios (subagente `revisor-marketing`, contexto limpo) + pesquisa profunda
> de mercado (best practices 2026) sobre a integração do playbook JP Middleton feita hoje.
> Veredito: **AJUSTAR** — tese e compliance sólidos; furos em execução leiga, LGPD do WhatsApp,
> fronteira de skills e na falta de produto vendável (preço/garantia/métrica).
>
> Este doc é o BACKLOG priorizado. Itens marcados ✅ FEITO foram corrigidos nesta sessão; os
> demais são backlog rastreável. Produto da ImpulsoX AI.

---

## Achados que a pesquisa de mercado CONFIRMOU (não é opinião — é dado)

| Tema | Dado verificado (fonte 2026) | Impacto |
|---|---|---|
| **LGPD ≠ e-mail** | ANPD (2024-2025): consentimento de e-mail **não cobre WhatsApp** — canais distintos, consentimentos separados. Multa até **R$ 50M/infração**. Opt-out em TODA mensagem, processado ≤24h. Registro auditável (timestamp, IP, texto). | Blocker 1/2 — reativação WhatsApp |
| **WhatsApp API** | Disparo proativo em escala exige **template HSM pré-aprovado** pela Meta, categoria marketing, número de qualidade. Número pessoal automatizado em volume = banimento. | Blocker 2 |
| **Speed-to-lead** | Contato em <5min: **21x** mais qualifica, **100x** mais conecta, **391%** mais converte (em <1min) vs. 30min+. 78% compra de quem responde primeiro. (Cira, Lead Response Mgmt) | Oportunidade 1 |
| **Missed call** | 62% das ligações de PME não atendidas; 85% desses ligam pro concorrente; chamada perdida vale ~US$1.200. Missed-call text-back recupera ~93%. | Pilar 3/4 — argumento de venda |
| **Atribuição de review** | Google **não entrega** tag de "qual atendente serviu" no review. "Premiar a equipe por review" precisa de atribuição via CRM (no fechamento), não via Google. | Major 9 |
| **Pricing agência IA 2026** | Outcome-based ($5k/workflow que poupa 10h/sem); Agent Licensing (setup + mensal); AI Audit Gateway ($5k antes do projeto grande); Hybrid Retainer (base + variável). Value capture = valor anual × 15-20%. | Oportunidade 2 |
| **Sales coaching IA** | Persona do ICP que rebate em tempo real → scoring por rubrica nomeada → debrief → certificação. "O job não é pontuar; é mudar o que o rep faz na próxima call real." | Pilar 5 (/treinar-vendas) |

---

## 🔴 BLOCKERS (corrigir antes de vender a esteira)

### B1 — LGPD do WhatsApp tratada como rodapé, não como gate ✅ FEITO
`formula-ads-jp §0.5.A` + `reativar`. "Opt-in/relacionamento prévio" não basta: reativação com
oferta = **marketing direto**, exige base legal própria + oposição fácil. Base de ex-clientes
parados é a de maior risco (consentimento velho/inexistente). Consentimento de e-mail **não vale**
pra WhatsApp (ANPD).
→ **Correção:** gate de LGPD na `/reativar` e `/depoimento` modo serviço — confirmar origem/idade
do consentimento da base antes de gerar a sequência; opt-out em toda mensagem; consentimento de
WhatsApp separado do de e-mail.

### B2 — Reativação em massa via WhatsApp viola Política do WhatsApp/Meta (não só LGPD) ✅ FEITO
Nenhum arquivo citava: disparo proativo em escala exige **template HSM aprovado** + WhatsApp
Business API + número de qualidade. "Mensagem que parece a recepcionista" do JP presume número
pessoal — que é o que **derruba o número** em volume.
→ **Correção:** declarar o canal como **WhatsApp Business API com template aprovado**; a sequência
gerada vira template submetido, não texto livre disparado em massa.

### B3 — Fase 1 inteira depende do agente (~jul/2026) mas é vendida como o diferencial ✅ FEITO
`blueprint §Fase 1`. Os 4 pilares marcados "🔧 ~jul/2026", mas o blueprint posiciona a Fase 1
como "o win fácil". Vender "reativo sua base e respondo <5min" sem o motor = prometer o que hoje
é manual (inviável em escala).
→ **Correção:** coluna "o que dá pra entregar HOJE sem o agente" por pilar no blueprint; a oferta
empacotada não inclui o que depende do agente até ele existir.

---

## 🟡 MAJOR

### M4 — Pilar 3 ("responder <5min") sem dono claro ✅ FEITO
`/leads` é ponte pro CRM, não responde. Nurture/qualificação é 100% do agente inexistente.
→ Declarar no blueprint que Pilar 3/4 são **inteiramente** do agente (sem fallback manual viável),
fora da promessa de venda atual; ou modo "alerta de lead novo" que o CRM já dispara.

### M5 — Régua de compliance de review DUPLICADA em 3 lugares ✅ FEITO
`formula-ads-jp §0.5.B` + `depoimento` + `local`. Se a política Google mudar, são 3 pontos pra
atualizar e vão dessincronizar.
→ Canônico em **`local/SKILL.md` Passo 3.5** (o mais completo); os outros só referenciam.

### M6 — "IA responde TODOS os reviews em escala" é área cinza ✅ FEITO
Resposta automática em massa no perfil de terceiro dispara detecção de padrão do Google.
→ No modo serviço-cliente, toda resposta (positiva inclusive) passa por aprovação/lote, nunca full-auto.

### M7 — Falta métrica de sucesso por fase ✅ FEITO
`blueprint`. "Gera caixa e confiança" não é mensurável. Sem KPI por fase, o `/relatorio` não prova
valor nem decide quando avançar.
→ Coluna "métrica de saída" por fase (gatilho objetivo pra avançar), amarrada a `/desempenho`/`/roi`.

### M8 — Idade 27–65+ herdada cegamente como default BR ✅ FEITO
`formula-ads-jp §5/§8`. É o público do JP (dono de academia americana). No BR, a Fase 3 anuncia
pro **cliente final** do gym/clínica, não pro dono.
→ Condicionar: 27–65+ só quando o alvo é dono de negócio (venda da agência); cliente final = idade
vem do `nucleo/negocio.md` do cliente.

### M9 — "Premiar a EQUIPE" vendido como melhor opção, sem caminho técnico ✅ FEITO
Google não entrega atribuição de review por funcionário.
→ Rebaixar de "✅✅ melhor opção pronta" pra "ideia a validar"; atribuição teria que vir do CRM no
fechamento (qual atendente fechou), não do Google.

---

## 🟢 MENORES

- **m10** — Versão: confirmar bump v0.2.11 no CHANGELOG (commits estavam em v0.2.10). ⏳ backlog
- **m11** — "27% nunca dão follow-up", "98% leem review / 11% pedem" citados como fato — são
  alegações do JP. A régua cética do doc só cobria o CPL. ✅ FEITO (marcadas como alegação) — exceto
  onde a pesquisa achou fonte real (speed-to-lead = Cira, verificável).
- **m12** — `/depoimento` modo serviço também dispara WhatsApp → herda o gate LGPD do B1. ✅ FEITO

---

## 🚀 OPORTUNIDADES (não-defeitos — maior alavancagem; backlog)

1. **Speed-to-lead como métrica vendável.** ✅ FEITO — skill `/velocidade` + `lib-velocidade.mjs`
   (cálculo por script, 8 testes verdes) + integração no `/raio-x` ("vazamento que quase sempre
   cabe") e `/proposta` (abertura da estrutura persuasiva). Roda por estimativa (prospect novo)
   ou dado real do CRM. É a métrica de saída da Fase 1.
2. **A OFERTA empacotada com Equação de Valor + nome + preço.** ✅ FEITO — molde reutilizável em
   `.claude/skills/oferta/references/molde-esteira.md` (6 partes + Money Model + gates de
   compliance) que a `/oferta` lê pro perfil agência. Catálogo-exemplo modular em
   `docs/exemplo-oferta-impulsox.md`. **Filosofia (decisão do dono):** ofertas COEXISTEM — vende
   o que o cliente precisa agora (página / conteúdo / CRM+agente / auditoria), upsell do sistema
   completo depois. Regra "vender modular, upsell depois" no CLAUDE.md. Pricing 2026 ancorado
   (setup+mensal, value capture 15-20%). Preços ficam `(?)` até o dono cravar.
3. **Garantia / risco invertido.** ✅ FEITO — 3 tipos no `molde-esteira.md` + catálogo exemplo
   (SLA de entrega; serviço condicional "trabalho de graça até X" — favorita do Hormozi;
   anti-garantia pra ticket alto), com wording real de mercado. Régua: só o controlável, nunca
   faturamento; atrelar às ações do cliente; teste de estresse 10%.
4. **Onboarding/intake específico da esteira.** ✅ FEITO — `/intake` ganhou a 5ª frente condicional
   (acessos por fase) + o **gate de prova de consentimento da base** (resolve B1): coletar
   data+canal+texto do opt-in; e-mail não cobre WhatsApp; sem prova, base "bloqueada pra WhatsApp".
5. **Dashboard "saúde da casa" = gate objetivo antes de ads.** ✅ FEITO — gate no `/carteira`
   (6 checagens verificáveis: destino converte, responde rápido, prova social, tração orgânica,
   Pixel+CAPI, orçamento) + Passo 0.5 na `/ads-meta`. Checklist validado de mercado. Informa e
   recomenda a ordem, não trava (regra do guia).
6. **Pilar 5 — `/treinar-vendas`** ✅ FEITO — skill nova: script diagnóstico + role-play (IA banca
   o cliente que rebate) + nota da call por rubrica ponderada (Descoberta 30% / Valor 25% /
   Objeção 25% / Fechamento 20%, 0-10, comportamento observável). Calibra nas objeções reais do
   CRM. Persuasão honesta; nota é da call, não da pessoa.

---

## O que copiamos e NÃO deveríamos (corrigido nesta sessão)
- Estatística do JP como fato de venda → ✅ marcada como alegação (m11)
- Idade 27–65+ default universal → ✅ condicionada à camada (M8)
- "Premiar a equipe" como solução pronta → ✅ rebaixada a ideia a validar (M9)

---

*ImpulsoX-OS · auditoria pós-integração JP · auditor: revisor-marketing (olhos frios) + pesquisa de mercado 2026*
