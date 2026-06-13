---
name: premium-design
description: >
  Use quando a identidade visual precisa nascer de DNA real em vez da imaginação da IA —
  "/premium-design", "extrai o design system desse site", "quero um site nível agência",
  "referências premium pra marca", "recombina essas identidades", ou chamada pelo
  /identidade (caminho CRIAR) e pelo /pagina (antes da construção). Captura o código-fonte
  de sites de referência premiados, extrai design systems completos (cores, tipografia,
  animações, layouts) e recombina numa identidade nova pro negócio. Alimenta a biblioteca
  em marca/design-systems/.
---

# /premium-design — Motor de identidade visual por código-fonte

A técnica: em vez de prompt ou screenshot, a IA recebe o **código-fonte de sites de
referência como fonte da verdade** — destilado em design systems. Modelos de linguagem
entendem texto melhor que imagem; no código está descrito com precisão total cada cor,
keyframe, easing e regra de interação. É o que separa o resultado genérico do resultado
de agência.

Autoria: ImpulsoX AI. Conteúdo original.

## Papel dentro do sistema (roteamento)

Esta skill é **motor, não entrega final**:

- `/identidade` (caminho CRIAR) chama esta skill pra gerar as direções a partir de
  referências reais, em vez de propor da imaginação. O output preenche
  `marca/design-guide.md` + `marca/tokens.css`.
- `/pagina` consome um design system de `marca/design-systems/` na Etapa 3 (construção).
  O processo, a copy e a conversão continuam sendo donos do `/pagina`.
- A biblioteca da agência vive em `marca/design-systems/` (no clone do cliente) e os
  design systems genéricos reutilizáveis no template, em `marca/design-systems/` do
  ImpulsoX-OS — cada projeto enriquece o acervo.

## Degrau mínimo (Escada de Contexto)

Roda a partir do **degrau 1** (extração pura não precisa de nada do cliente). A
**recombinação** pede degrau 2+ (briefing de marca: segmento, público, personalidade,
cores existentes). Abaixo disso, recombinar com defaults e marcar as suposições na
lista "confirmar com o cliente".

## Fluxo (3 fases)

```
FASE 1: CAPTURA      → baixar código-fonte de 1-3 referências (automático via Playwright)
FASE 2: EXTRAÇÃO     → design-system.md por referência + RECOMBINAÇÃO em identidade nova
FASE 3: CONSUMO      → /identidade grava a marca · /pagina constrói com o DS como lei
```

Nunca pular a Fase 2: código bruto direto na construção funciona pior que o design
system destilado (ruído de analytics e markup irrelevante polui o contexto).

### Fase 1 — Captura

O usuário traz 1-3 URLs de referência (Awwwards, Godly.website, Landbook — critério:
o *estilo* serve ao cliente, não o conteúdo). A skill captura sozinha com o script
Playwright de `references/captura.md` (DOM renderizado + CSS computado, com scroll
completo pra disparar lazy-load e animações). Pré-requisito uma vez por projeto:
`npm i -D playwright && npx playwright install chromium` (instruções no topo do
reference). Limpar ruído antes de extrair (instruções lá).

**Fallback nunca é silencioso.** Se a captura automática falhar (Playwright ausente —
script sai com código 2 — ou bloqueio de rede/Cloudflare), a skill **anuncia em voz
alta** antes de seguir: "⚠️ Playwright indisponível, usando captura manual" + o comando
de install. Só então cai pros métodos manuais (Ctrl+S / wget / `rendered.html` do
usuário). Degradar calado é proibido: o usuário tem que saber que entrou no caminho manual.

### Fase 2 — Extração e recombinação

1. Rodar `prompts/design-system-extractor.md` sobre cada captura → um
   `design-system.md` por referência, salvo em `marca/design-systems/`.
2. **Pra trabalho de cliente, recombinação é obrigatória**: rodar
   `prompts/design-system-recombiner.md` com os DS extraídos + o briefing da marca
   (núcleo + entrevista do `/identidade`). O resultado é uma identidade NOVA — nunca
   entregar a identidade de um único site copiada 1:1.
3. **Checkpoint:** apresentar o DS recombinado ao usuário (decisões de herança +
   amostra visual de 1 tela renderizada). Aprovação antes de gravar na marca.

### Fase 3 — Consumo

- Handoff pro `/identidade`: o DS aprovado vira `marca/design-guide.md` + as variáveis
  entram em `marca/tokens.css` (formato do `/identidade` é a autoridade).
- Handoff pro `/pagina`: anexar o DS via `prompts/site-builder.md` — o DS é lei
  absoluta de cor, tipo, espaçamento, animação e interação.

## Gates de qualidade

1. **Fidelidade:** valores exatos (hex, ms, cubic-bezier) — `[não especificado]` quando
   o código não diz; nunca inventar.
2. **Anti-genérico:** resultado com cards 3-em-linha óbvios, degradê roxo padrão ou
   tipografia default → voltar com correção explícita (mesma régua do `/identidade`).
3. **Originalidade:** ninguém que conheça os sites de origem pode reconhecê-los no
   produto final.
4. **Verificação visual** (quando gera tela): mesmo padrão do `/pagina` — Playwright,
   390/768/1440px, aprovação vendo.

## Regras

- Extrair *padrões* é prática normal de design; clonar identidade completa de site
  identificável pra uso comercial é risco de propriedade intelectual — por isso a
  recombinação é obrigatória em entrega de cliente.
- Design systems aprovados sempre ficam na biblioteca (`marca/design-systems/`) com
  nome descritivo e origem documentada — é ativo da agência.
- Ferramentas externas de design (impeccable, Open Design) seguem a regra da
  constituição: leem a marca do negócio, nunca impõem a própria.
- Peça visual derivada continua passando pelos fluxos donos (`/pagina`, `/post`) —
  esta skill não publica nada.
