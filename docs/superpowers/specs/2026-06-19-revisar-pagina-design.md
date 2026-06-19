# /revisar-pagina — Revisor de página (design + copy, olhos frios)

> Spec de design. Produto da ImpulsoX AI. Nasce no template ImpulsoX-OS; desce pros clones
> via `/atualizar-motor`. Data: 2026-06-19.

## Problema

O dono do negócio não domina design nem copy de página. Precisa saber **o que melhorar**
numa página pronta, mas as ferramentas de review por IA são pouco confiáveis: estudo do
Baymard Institute (citado por Jakob Nielsen) achou que IA julgando UI por screenshot dá
**só 19% de sugestões boas, 9% ativamente prejudiciais e 72% de ruído** — e identifica
apenas 24% dos problemas reais. Uma skill ingênua que "manda o screenshot pra IA criticar"
produz conselho convincente e errado.

A lacuna no sistema: ninguém olha **uma página pronta como um todo** (design + copy)
renderizada, com régua de especialista, e devolve "conserta isto, nesta ordem". O que existe
é fragmentado e não cobre design visual:
- `/copy` + `/escritor-br` — só texto.
- `/revisar` — olhos frios de **marketing/venda** (a peça vende? está ar-ready?), não olha
  design visual nem renderiza.
- `/raio-x` — diagnóstico de **presença digital** de empresa externa pela URL (SEO, redes,
  local), não review de uma página específica.
- `/pagina` Etapa 4 — verificação visual, mas do próprio criador (olhos viciados).

## O que a skill faz

Revisor único que recebe uma página pronta (HTML local ou URL), renderiza em 3 telas, julga
**design visual e copy** com olhos frios contra régua nomeada, e devolve um **relatório
priorizado** do que melhorar. **Não conserta** — diagnostica e encaminha.

## A blindagem central (o que a torna confiável)

> **Regra de ouro: nenhum achado sem regra nomeada.** A skill só reporta um problema se ele
> violar uma regra objetiva citada — uma heurística de Nielsen, uma regra do `/copy`, um
> princípio do DNA premiado (`marca/design-systems/`), ou a `voz.md`. Opinião sem regra por
> trás ("acho que ficaria melhor") é cortada. É isso que mata os 72% de ruído que a pesquisa
> apontou: o agente não inventa, ancora.

## Escopo (YAGNI cravado)

- **Cobre:** design visual (hierarquia, espaçamento, tipografia, cor, contraste, ritmo,
  consistência, cognitive load) + copy (headline, vende-ou-descreve, cara-de-IA, CTA claro).
- **NÃO cobre:** conversão/UX-flow e técnico/SEO/performance (já tem `/raio-x` e a verificação
  responsiva da `/pagina`). Não vira auditoria genérica.
- **NÃO conserta:** encaminha cada achado pra skill que resolve (`/copy`, `/escritor-br`,
  `/pagina`, `/premium-design`).

## Fluxo

1. **Entrada** — caminho de HTML local OU URL no ar.
2. **Renderiza** — Playwright em 390 / 768 / 1440px (mesma toolchain da `/pagina` e
   `/premium-design`). Screenshots full-page das 3 larguras.
3. **Lê a régua** — `marca/design-systems/` (DNA premiado do nicho), `docs/persuasao.md`,
   `docs/frase-que-pega.md`, `nucleo/voz.md`, e `marca/design-guide.md` + `tokens.css` (a
   identidade que a página deveria respeitar).
4. **Camada DESIGN** — orquestra o **impeccable** (ferramenta de terceiros já instalada:
   heurísticas Nielsen + cognitive load + flag de "AI slop") e soma a camada da casa
   (aderência ao DNA premiado e à marca). Ver "Ferramenta de terceiros" abaixo.
5. **Camada COPY** — aplica as réguas de `/copy` (Desejo − (Esforço + Confusão); vende ou
   descreve?) e `/escritor-br` (travessão, cara-de-IA, vícios) sobre o texto extraído. **Só
   aponta, não reescreve.**
6. **Despacho frio** — um agente com contexto limpo (não viu a criação da página) recebe os
   screenshots + a régua + a regra de ouro, e produz os achados. Mesma lógica de olhos frios
   do `/revisar`, aplicada a design+copy.
7. **Relatório priorizado** — ver formato abaixo.

## Formato do relatório (a entrega)

Achados por severidade (escala de heurística do Nielsen):
- 🔴 **Blocker** — quebra a página (texto ilegível, CTA invisível, layout estourado no mobile).
- 🟡 **Major** — atrapalha de verdade (hierarquia confusa, headline fraco, copy que descreve).
- 🟢 **Cosmetic** — polish (espaçamento irregular, micro-inconsistência).

Cada achado tem 4 campos, sempre:
1. **O quê** — o problema, concreto, com onde (qual seção/tela).
2. **Regra violada** — nomeada (ex: "Nielsen #8 — estético e minimalista", "regra /copy —
   vende ou descreve", "DNA premiado — ritmo de respiro"). Sem isso, o achado não entra.
3. **Como consertar** — ação concreta.
4. **Quem resolve** — a skill de destino (`/copy`, `/pagina`, etc).

Abre com 1 linha de veredito honesto ("design sólido, copy precisa de 2 ajustes críticos") e
fecha com a ordem de ataque (o que consertar primeiro pelo impacto).

## Ferramenta de terceiros (impeccable) — regra do CLAUDE.md

O impeccable é externo (não é skill da ImpulsoX). Antes de usar com pasta de **cliente**:
revisar confiança do plugin, credenciais e permissões de MCP. Ele **lê** `marca/design-guide.md`
+ `tokens.css` do negócio e ajusta dentro dessa marca — **nunca impõe a identidade dele**. A
skill orquestra o impeccable pra design; a camada de copy e a régua de DNA premiado são da casa.
Se o impeccable estiver indisponível, a skill degrada com aviso explícito (não cala) e roda só
a camada da casa (heurísticas + DNA + copy), sem inventar o que o impeccable faria.

## Gatilho

- **Automática antes de publicar:** a `/publicar` (ou o passo de deploy) chama `/revisar-pagina`,
  mostra o relatório, e **espera o OK do dono** pra seguir. Automática pra disparar, mas o dono
  decide publicar mesmo com achados (regra do CLAUDE.md: sempre perguntar antes de seguir; o
  dono está no controle). Não trava o deploy no escuro.
- **Sob demanda:** `/revisar-pagina <arquivo|URL>` quando o dono quiser.

## Anti-duplicação (por que não pisa em skill existente)

| Skill | Faz | Esta NÃO faz |
|---|---|---|
| `/revisar` | julga marketing/venda da peça, olhos frios | design visual renderizado |
| `/raio-x` | diagnostica presença digital de empresa pela URL | review de UMA página tua |
| `/copy` + `/escritor-br` | escrevem/reescrevem texto | reescrever (esta só aponta) |
| `/pagina` Etapa 4 | verificação visual do criador | crítica de olhos frios contra DNA |

Esta orquestra réguas e ferramentas que já existem; não reimplementa nenhuma.

## Degrau mínimo (Escada de Contexto)

Roda no degrau 1 (precisa só da página). A régua melhora com o contexto: sem
`marca/design-systems/` nem `voz.md`, cai pra heurísticas universais (Nielsen) + regras do
`/copy`, e marca "sem DNA do nicho pra comparar — review mais genérico".

## Onde registrar

Motor. Criada no template ImpulsoX-OS, propagada via `/atualizar-motor`. Registrar na lista de
automações (README/CLAUDE.md, fluxo principal) e plugar na `/publicar` como gate pré-deploy.

## Fora de escopo (não fazer agora)

- Conserto automático (encaminha, não aplica).
- Conversão/UX-flow, técnico, SEO, performance (outras skills).
- A/B test, analytics, heatmap.
- Review de fluxo multi-página (esta é por página).
