# Blueprint — A Esteira de Crescimento ImpulsoX (Sistema completo)

> O mapa-mestre de como o ImpulsoX-OS leva um negócio local de "tem leads parados e ninguém
> atende o telefone" até "tráfego pago que converte". Junta o playbook do JP Middleton (ordem
> dos pilares, `docs/formula-ads-jp.md`) com a camada que o JP NÃO tem — o conteúdo orgânico do
> OS — e os três ativos próprios da ImpulsoX: **CRM v3 + agente WhatsApp + as skills**.
>
> Produto da ImpulsoX AI. Este é o blueprint de PRODUTO e de ENTREGA, não uma skill. As skills
> executam cada caixa; este doc diz a ORDEM e o PORQUÊ.
>
> **Perfil-alvo:** `pme-local` (brick-and-mortar: academia, clínica, estética, dentista,
> oficina, salão, pet, advocacia local). É o nicho onde o playbook do JP prova. Outros perfis
> (criador, agência) usam partes, não a esteira inteira.

---

## A tese (por que a ORDEM é o produto)

A maioria das agências vende **uma coisa** (rodar ads, um chatbot) e o cliente cancela em 1 mês
porque o resultado vaza. O JP Middleton mostrou que o ganho está em vender um **sistema fechado
na ordem certa** — e que **tráfego pago é o ÚLTIMO passo, nunca o primeiro**. Lead pago vaza num
negócio que não responde lead em <5min, não tem review bom e não converte o orgânico.

A ImpulsoX vai **além** do JP: ele para na automação de lead (reativação, review, atendimento).
Nós encaixamos a **fábrica de demanda orgânica** (conteúdo) na mesma esteira, antes do ads. E o
motor é **próprio** (CRM + agente WhatsApp), não "plugar no sistema do cliente".

Regra-mãe, agora na Conduta do `CLAUDE.md`: **arrumar a casa antes de ligar o tráfego pago.**

---

## A esteira em 4 fases

```
┌────────────────────────────────────────────────────────────────────────┐
│ FASE 0 — A CASA (a base de tudo, antes de qualquer lead novo)           │
│   /identidade → /pagina (+ /agente-ia)                                   │
│   marca premium + página que converte + SDR conversacional               │
│   Pré-req de tudo: sem marca + destino que funcione, nada converte.      │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 1 — DINHEIRO QUE JÁ EXISTE (custo de mídia = ZERO)                  │
│   Pilar 1 → /reativar      reabordar base parada (SEMPRE com oferta)     │
│   Pilar 2 → /local+/depoimento  review + referral COMPLIANT             │
│   Pilar 3 → agente WhatsApp  responder lead/form em <5min                │
│   Pilar 4 → agente WhatsApp  atender quem o humano não pegou             │
│   O "win fácil": gera caixa sem gastar em mídia → cliente confia.        │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 2 — DEMANDA ORGÂNICA (o que o JP NÃO faz — vantagem ImpulsoX)       │
│   /radar → /calendario → /post · /linkedin · /reel-marca                │
│   → /revisar → /publicar → /desempenho                                   │
│   constrói audiência, marca e lead orgânico — e gera prova pra Fase 3.   │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 3 — TRÁFEGO PAGO (o ÚLTIMO, com a casa cheia)                       │
│   /ads-meta · /ads-google → /analisar-ads → /roi → /relatorio           │
│   agora o lead pago converte porque tudo acima está pronto.              │
└────────────────────────────────────────────────────────────────────────┘
   CRM v3 + agente WhatsApp = o motor que atravessa as 4 fases
   /carteira (modo agência) = o cockpit pra rodar N clientes nessa esteira
```

---

## Fase 0 — A Casa

| Caixa | Skill | Entrega | Estado |
|---|---|---|---|
| Marca | `/identidade` | design-guide + tokens (Open Design + premium) | ✅ pronto |
| Página | `/pagina` | landing premium na marca + copy + SEO/GEO | ✅ pronto |
| SDR na página | `/agente-ia` | widget de chat + persona; runtime no CRM (`/api/chat`) | ✅ skill pronta; runtime é item do PRD CRM |

**Por que primeiro:** todo lead (orgânico ou pago) precisa de um lugar pra cair e alguém pra
responder. Sem isso, Fase 1-3 enchem um balde furado. Pré-requisito das fases seguintes.

---

## Fase 1 — Dinheiro que já existe (os 4 pilares de lead do JP)

Custo de mídia zero. É o que se entrega/vende **antes** de pedir 1 real de tráfego. Gera caixa e
confiança. Tudo roda no **CRM + agente WhatsApp**.

| Pilar | Skill | O que faz | O que dá pra entregar HOJE (sem o agente) |
|---|---|---|---|
| 1. Reativação de base | `/reativar` | reaborda lead/cliente parado, SEMPRE com gancho-oferta, agenda, embute referral | **E-mail sim** (régua do CRM). **WhatsApp em massa NÃO** sem o agente + template HSM + gate LGPD. Sequência gerada fica pronta, disparo pendente |
| 2. Review + referral | `/local` + `/depoimento` | pede review COMPLIANT (a todos, timing, sem gating/incentivo ao cliente), responde, pede indicação | **QR/link no recibo + responder reviews (lote aprovado) sim** via `/local`. **Disparo proativo em massa** espera agente + gates |
| 3. Lead nurture <5min | **agente WhatsApp** (sem fallback manual viável) | responde form/lead na hora, qualifica, agenda, reagenda no-show | **Só "alerta de lead novo"** que o CRM dispara pro dono responder na mão. O nurture automático <5min **é 100% do agente** |
| 4. Atendimento (receptionist) | **agente WhatsApp** | responde quem o humano não pegou; no BR = WhatsApp, não ligação | **Nada automático** sem o agente. É 100% dele |

> **Honestidade de venda (Blocker da auditoria):** Pilares 3 e 4 são **inteiramente** do agente
> WhatsApp (~jul/2026) — **não entram na promessa de venda atual**. Pilares 1 e 2 entregam HOJE
> só na coluna da direita (e-mail, QR, responder review). Vender "reativo sua base e respondo em
> <5min" antes do agente = prometer o que hoje é manual. Não fazer.

**Compliance dura (regra do CLAUDE.md + `docs/formula-ads-jp.md` §0.5.B):** review nunca por
gating (filtrar nota) nem incentivo ao cliente. Incentivo só na EQUIPE do negócio (a validar — ver
buracos), canal próprio, pesquisa desacoplada ou referral. A mecânica original do JP (filtro 1-5 +
sorteio) é ilegal — não copiar. **WhatsApp:** gate LGPD (consentimento próprio, não o de e-mail;
opt-out; multa ANPD até R$50M) + template HSM aprovado (Meta) — ver `/reativar`.

### Métrica de saída por fase (o gatilho objetivo pra avançar)

Nenhuma fase "termina por sensação" — cada uma tem um número que diz se funcionou e libera a
próxima. Medido por `/desempenho`/`/roi`:

| Fase | Métrica de saída (gatilho pra avançar) |
|---|---|
| 0 — Casa | página no ar + SDR respondendo + destino que converte (teste de 1 lead real) |
| 1 — Lead que já existe | X% da base reativada agendou · tempo médio de 1ª resposta < N min · reviews subiram de A pra B |
| 2 — Orgânico | conteúdo ativo há ≥30d · save/reach acima da linha de base · ≥1 peça que virou candidata a criativo de ads |
| 3 — Pago | CPL e CPA dentro da meta · ROI positivo no `/roi` (gasto × receita real do CRM) |

---

## Fase 2 — Demanda orgânica (a camada que o JP não tem)

O JP só monetiza quem **já está na base** ou quem **clica no ad**. Não cria demanda nova orgânica.
A ImpulsoX preenche esse furo com a esteira de conteúdo — que também **gera a prova social** que
a Fase 3 (ads) precisa pra converter.

```
/radar → /calendario → /post · /linkedin · /reel-marca → /revisar → /publicar → /desempenho
ideias    decide quê/    produzem na marca+voz             crivo      ao ar       mede → aprende
embasadas quando                                            sênior                      ↑
   ↑                                                                                     │
   └──────────────── nucleo/aprendizados.md ←── o que funcionou volta pro ciclo ────────┘
```

| Caixa | Skill | Papel na esteira |
|---|---|---|
| Pauta | `/radar` → `/calendario` | decide o quê e quando (lê núcleo + concorrente) |
| Peças | `/post`, `/linkedin`, `/reel-marca`, `/conteudo` | carrossel, post, reel, LinkedIn — na marca e voz |
| Crivo | `/revisar` | olhos frios antes do ar |
| No ar | `/publicar` | publica + registra |
| Mede | `/desempenho` | save/send/reach/retenção → destila aprendizado |

**Conexão com a Fase 3:** conteúdo que performou organicamente é o melhor candidato a criativo de
ads (a `/ads-meta` já lê `producao/posts/`). Orgânico testa de graça o que o pago vai escalar.

---

## Fase 3 — Tráfego pago (o último passo)

Só agora, com a casa cheia: base reativada, review subindo, atendimento ligado, orgânico gerando
prova. Aí o lead pago **converte** em vez de vazar.

```
/ads-meta · /ads-google → (humano sobe, guia visual) → /analisar-ads → /roi → /relatorio
cria campanha + criativo    anúncio nunca sobe sozinho   mede o que       cruza com receita real
(4 Elementos, swipe)        (viola termos)               converteu        do CRM
```

| Caixa | Skill | Detalhe |
|---|---|---|
| Campanha + criativo | `/ads-meta`, `/ads-google` | "4 Elementos" (`docs/formula-ads-jp.md`) + swipe da Ad Library + Pixel/CAPI |
| Sobe | humano | guia visual de leigo; automação de conta viola termos |
| Mede | `/analisar-ads` | CSV, cálculo por script, atribuição |
| Dinheiro | `/roi` → `/relatorio` | gasto × receita real do CRM = ROI/CAC; relatório executivo |

**Régua que NÃO regride:** targeting em 2 fases da `/ads-meta` (manual→Advantage+), não o "abre
tudo dia 1" do JP. E criativo segue os "4 Elementos" com prova só autorizada.

---

## O motor que atravessa tudo — CRM v3 + agente WhatsApp

| Ativo | Papel na esteira | Estado |
|---|---|---|
| **CRM v3** (multi-tenant, API REST, `lib-crm`) | dono do lead/venda/receita; alimenta Fase 1 (segmentar inativos, deals ganhos), Fase 3 (`/roi`) | ✅ vivo (ver memória CRM integração viva) |
| **Agente WhatsApp** | motor de disparo dos Pilares 1-4 (reativação, review, nurture, atendimento) | 🔧 ~jul/2026 |
| **`/carteira`** | cockpit modo agência: roda a esteira pra N clientes, vê saúde de cada um | ✅ pronto |

Fronteira: as **skills do OS segmentam e escrevem** (na voz da marca); o **CRM/agente dispara**.
Nunca duplicar o motor de envio.

---

## Buracos abertos (o que falta pra esteira ficar 100%)

> Backlog completo e priorizado (com a pesquisa de mercado que sustenta cada um) em
> `docs/auditoria-esteira-2026-06-29.md`. Resumo dos de maior alavancagem:

1. **Pilar 5 — Sales trainer** (treino de vendas IA: script + role-play + nota de call). É o
   único pilar do JP sem skill. Candidato: `/treinar-vendas` (lê CRM, grava nota por call).
2. **Agente WhatsApp** (~jul/2026) — destrava o disparo automático da Fase 1.
3. **A OFERTA empacotada** — "Sistema de Crescimento ImpulsoX" (nome a definir): o pacote
   vendável (assinatura mensal) que entrega Fase 1+2 e depois Fase 3, ancorado na Equação de
   Valor (`/oferta` escreve em `nucleo/ofertas.md`). Hoje as peças existem soltas; falta o
   produto que as vende na ordem.
4. **Pilar 2 como serviço** — `/depoimento`+`/local` já têm o modo serviço documentado; falta o
   disparo (depende do agente) e validar a política Google BR vigente na instalação.

---

## Como o guia conduz por isto (regra de esteira)

O dono não decora a ordem — o sistema guia (regra 1-3 do `CLAUDE.md`). Ao terminar uma fase,
aponta a próxima e **espera o sim**. Se o dono pede ads cedo (pula pra Fase 3), o sistema
reorienta: "ads converte melhor com a casa arrumada — quer que eu reative sua base e ligue o
atendimento primeiro, ou seguir com ads já?". Guiar é oferecer o caminho, não forçar o trilho.

---

*ImpulsoX-OS · blueprint da Esteira de Crescimento · v0.2.11 · base: docs/formula-ads-jp.md*
