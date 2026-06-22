# Design — /reel-marca: CTA local + save/send + cover

> Lote 4 do backlog de auditoria (enxuto). ImpulsoX AI · 2026-06-22. Multi-formato e cutdowns
> ADIADOS (exigem layout responsivo / peça dedicada — lote próprio futuro). Mudança no SKILL.md +
> 1 passo no fluxo (cover via `remotion still`, que já existe). Sem motor novo.

## O que é

Três melhorias na skill `/reel-marca`, da auditoria (Later/Buffer/agentr.ee):
1. **CTA de negócio local** (Book/Call/WhatsApp + prova de local) — DOC.
2. **Objetivo save/send** (frame-resumo salvável + gancho de envio) — DOC.
3. **Cover/capa** (still configurável) junto do mp4 — passo no fluxo.

## Por que

A auditoria: o reel é forte tecnicamente mas (a) não tem CTA de negócio local — onde o reel vira
venda pra PME (listing com booking converte 6.8% vs 4.1%); (b) otimiza watch-time mas ignora
send/save (send 3-5x like, fator nº1 de alcance 2026); (c) não entrega cover, que é peça paga de
agência e human-proof no Google Business Profile.

## As 3 mudanças

### 1. CTA de negócio local (SKILL.md — seção de CTA/storyboard)

O CTA do FIM, pra PME local, é **ação direta + prova de local**:
- **Ação:** "Agende", "Chame no WhatsApp", "Peça agora", "Reserve" — o verbo do negócio (vem da
  oferta ATIVA do `nucleo/ofertas`).
- **Prova de local:** quando faz sentido pro nicho, o reel mostra a fachada / o ponto / "atende em
  [bairro/cidade]" (do `nucleo/negocio.md`). É o que ancora o lead local e o GBP.
Continua valendo: CTA só no FIM, nunca no hook; marca/assinatura só no fim.

### 2. Objetivo save/send (SKILL.md — nota no storyboard, igual ao /post)

Declarar, no storyboard, se o reel é desenhado pra ser **salvo** (um frame-resumo guardável — o
"print que vale guardar": um checklist, o antes/depois, a tabela de preço) ou **enviado** (gancho
explícito no fim — "manda isso pro dono do [negócio]"). Send vale 3-5x like; é a maior alavanca de
alcance novo. Vira o 1º filtro do briefing do reel, antes do storyboard.

### 3. Cover/capa (passo novo no fluxo + comando)

Depois de renderizar `reel.mp4`, gerar uma **capa still**:
`npx remotion still <CompId> producao/reels/<slug>/capa.png --frame=<N>`.
- Default `N` = um frame do MONEY SHOT (a cena do produto/resultado real — melhor prova visual
  pro GBP). A skill sugere o frame; ajustável via `--frame` vendo o dry-run.
- Serve de thumbnail/post estático e de vídeo-capa no Google Business Profile.
- `remotion still` já existe no projeto — é instrução no SKILL.md + 1 passo no fluxo, sem código.

## O que NÃO muda

Todo o motor Remotion, a estrutura de retenção, a captura de produto, os gates — intactos. As 3
mudanças são camada de estratégia (CTA/save/send) + 1 passo de entregável (cover).

## Critério de sucesso

O SKILL.md passa a: exigir CTA de negócio local com prova de local, mirar save/send no briefing
do reel, e o fluxo passa a gerar uma `capa.png` configurável junto do `reel.mp4`. Coerente com o
resto da skill.

## Fora de escopo (lote futuro próprio)

- **Multi-formato 9:16 + 1:1 + 4:5** — exige layout responsivo (cenas hoje em px fixos calibrados
  pro 9:16; mockups/legendas reescalando). Trabalho grande, arrisca o visual aprovado.
- **Cutdowns 15s/5s** — cutdown bem-feito é peça dedicada (hook+payoff com ritmo próprio), não
  corte cego do mp4. Vira composição própria.
Ambos ficam registrados no backlog como itens de médio esforço pra quando houver demanda real.
