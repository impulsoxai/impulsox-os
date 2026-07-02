# Estado do Sistema — ImpulsoX-OS (resumo de 1 página)

> Foto do que o sistema é hoje, depois da integração do playbook JP Middleton + a Esteira de
> Crescimento + auditoria. Atualizado 2026-06-30 (v0.2.11). Pra consulta rápida do dono.

---

## A tese que organiza tudo

**Tráfego pago é o ÚLTIMO passo.** Antes de gastar 1 real em ads, arruma a casa: reativa a base,
junta review, responde lead rápido, liga o orgânico. Lead pago vaza em negócio que não responde.
Essa ordem virou regra de conduta (CLAUDE.md) e gate verificável (`/carteira`, `/ads-meta`).

## A Esteira de Crescimento (4 fases) — o produto

| Fase | O que entrega | Skills | Custo mídia | Métrica de saída |
|---|---|---|---|---|
| **0 — A Casa** | marca + página + agente na página | `/identidade` `/pagina` `/agente-ia` | — | destino converte (1 lead real) |
| **1 — Dinheiro que já existe** | reativação, review, atendimento <5min | `/reativar` `/local` `/depoimento` `/velocidade` + agente WhatsApp | **zero** | tempo de 1ª resposta < N min; reviews subiram |
| **2 — Demanda orgânica** | carrossel, reels, LinkedIn | `/radar` `/calendario` `/post` `/linkedin` `/reel-marca` `/desempenho` | orgânico | conteúdo ativo ≥30d; ≥1 peça vira criativo |
| **3 — Tráfego pago** | ads com a casa cheia | `/ads-meta` `/ads-google` `/analisar-ads` `/roi` | pago | CPL/CPA na meta; ROI+ no CRM |
| **+5 — Treino de vendas** | time fecha melhor | `/treinar-vendas` | — | taxa de deal ganho sobe |

Motor que atravessa tudo: **CRM v3 + agente WhatsApp + `/carteira`** (cockpit de N clientes).

## Como se vende (filosofia modular)

Ofertas **coexistem** — vende o que o cliente precisa AGORA (página, ou só conteúdo, ou só
CRM+agente, ou auditoria paga), upsell do sistema completo depois. No começo o que importa é
VENDER ALGO; cliente satisfeito compra mais. Molde: `oferta/references/molde-esteira.md`.
Money Model: auditoria paga (porta) → core → upsell → continuidade (recorrente) → sistema completo.

## Compliance (o que protege a conta do cliente)

- **Review:** nunca gating (filtrar nota) nem incentivo ao cliente pelo review do Google
  (proibido — Google abr/2026 + FTC; Fashion Nova US$4,2M). Incentivo só na EQUIPE, canal
  próprio, pesquisa desacoplada ou referral.
- **WhatsApp:** disparo em massa exige consentimento próprio (e-mail não vale — ANPD, multa até
  R$50M) + template HSM aprovado. Gate no `/reativar`, `/depoimento`, `/intake`.
- **Garantia:** só o controlável (entrega, prazo, volume de review), NUNCA faturamento.

## O que está PRONTO vs PENDENTE

**Pronto e no ar:** toda a Fase 0, 2 e 3; `/velocidade` (com código testado); `/treinar-vendas`;
oferta modular; garantia; gate de saúde da casa; onboarding com prova de consentimento.

**Pendente — 1 buraco estrutural:** o **agente WhatsApp** (~jul/2026). Sem ele, a Fase 1
automática (reativação/atendimento em massa, PEDIR review em massa) não roda. As skills já o
referenciam como dependência em estado honesto — quando ligar, é só ativar o disparo. Pilares 3/4
ficam fora da promessa de venda até lá.

**Dois motores de review (não confundir):** RESPONDER Google review é **independente do WhatsApp**
— usa a Google Business Profile API (`scripts/gbp.mjs`), dá pra um agente DIÁRIO (cron) que
monitora e responde já (só falta testar a credencial Google em produção). PEDIR review em massa é
que espera o WhatsApp. Canais e dependências separados.

## Documentos-mestre (onde está cada coisa)

- `docs/blueprint-esteira-crescimento.md` — a esteira completa, fase a fase
- `docs/formula-ads-jp.md` — a fórmula de ads + reativação/review (o que copiar e o que NÃO)
- `docs/auditoria-esteira-2026-06-29.md` — a auditoria + backlog (quase tudo fechado)
- `docs/exemplo-oferta-impulsox.md` — catálogo de ofertas modular (preços a confirmar)
- `docs/mapa-de-skills.md` — quem chama quem (a fonte do fluxo guiado)

## Skills criadas/alteradas nesta rodada (todas conectadas, zero ref quebrada)

Novas: `/velocidade`, `/treinar-vendas`. Alteradas: `/ads-meta`, `/reativar`, `/depoimento`,
`/local`, `/intake`, `/carteira`, `/oferta`, `/raio-x`, `/proposta`, `CLAUDE.md`.

---

*ImpulsoX-OS v0.2.11 · produto da ImpulsoX AI · impulsoxai.com.br*
