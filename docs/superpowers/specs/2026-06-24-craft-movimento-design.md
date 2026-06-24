# Design — `docs/craft-movimento.md` + Uso 4 do `/premium-design`

> Spec do craft de animação e efeitos cinematográficos (o WOW que para o dedo) para páginas
> premium. Origem: o dono pediu mais animação na landing; ao analisar, o sistema já cobre
> movimento (`/premium-design` Uso 2 captura DNA de movimento de sites premiados e aplica via
> Etapa 3.5 do `/pagina`), MAS sem um catálogo nomeado de efeitos. "Capturar DNA de movimento"
> é vago sem vocabulário. Falta também o caminho "dono viu uma animação num site e quer igual".
> Data: 2026-06-24.

## Problema

Dois buracos, ambos na camada de movimento:

1. **Sem catálogo nomeado.** O `/premium-design` Uso 2 sabe capturar movimento de sites reais,
   mas não tem um vocabulário concreto de efeitos (count-up, text-split, magnetic hover,
   parallax em camadas, WebGL distortion, etc.) com "quando dá WOW / quando mata performance /
   de qual site capturar". Igual o `frase-que-pega.md` tem os 9 padrões de hook nomeados, o
   movimento precisa do seu catálogo.
2. **Sem o caminho "dono traz a referência".** Hoje a referência de movimento é escolhida pelo
   sistema. Falta o input do dono: "vi essa animação nesse site, faz igual" (cola a URL).

## Solução

Dois pedaços que se completam, zero duplicação:

- **`docs/craft-movimento.md`** — o catálogo nomeado de efeitos cinematográficos + curadoria de
  sites de referência reais de onde capturar cada um. Doc de craft no padrão de
  `pitch-narrado.md`/`frase-que-pega.md` (referência lida por skills).
- **`/premium-design` Uso 4** — captura dirigida pelo dono: ele cola a URL de um site, a skill
  usa a Fase 1 (Captura) que JÁ existe pra puxar o código-fonte, isola o efeito e adapta com a
  marca do cliente.

### Fronteira (não duplica o que existe)

| Peça | Papel |
|---|---|
| `/premium-design` (Usos 1-3) | MOTOR: captura DNA de movimento de sites reais e aplica. Continua dono da execução. |
| **`craft-movimento.md`** (novo) | CATÁLOGO: quais efeitos existem, quando cada um dá WOW, quando mata performance, de qual site capturar. O vocabulário que faltava. |
| **`/premium-design` Uso 4** (novo) | INPUT DO DONO: ele traz a URL; a skill captura aquela animação específica e adapta. Reaproveita a Fase 1. |
| `/pagina` Etapa 3.5 | já delega a camada de movimento pro `/premium-design`; passa a referenciar o doc. |

É a mesma relação que `frase-que-pega.md` (catálogo de hooks) tem com `/post` (executa).

## O conteúdo de `docs/craft-movimento.md`

Catálogo de efeitos cinematográficos com WOW. Cada efeito tem a mesma ficha (estilo dos 9
hooks): **o que é · quando dá WOW (propósito) · quando NÃO usar · custo de performance ·
reduced-motion · 2-3 sites premiados de onde capturar**.

Os efeitos (de fonte real, pesquisa 2026 — Awwwards/Godly/Apple/Lusion/OHZI):

| Efeito | WOW | Custo |
|---|---|---|
| **Text-split reveal** (char/word/line sobe, anima individual) | alto ("como fizeram?") | baixo (CSS) |
| **Count-up na viewport** | médio-alto, e PROVA (ex: "0,71s" subindo) | baixo |
| **Scroll cinematic** (Apple-style: revela com timing perfeito ao rolar) | altíssimo | médio |
| **Magnetic button / tilt card** (puxa o cursor, inclina no hover) | médio, premium tátil | baixo |
| **Clip-path shape reveal** (transição geométrica) | alto | baixo-médio |
| **Parallax em camadas** (profundidade por velocidade) | médio | ⚠️ alto em mobile, "zero conversion benefit" |
| **Spotlight / cursor-reactive** (luz segue o mouse) | médio | baixo |
| **WebGL / mouse distortion** (Lusion, OHZI — Site of the Day) | máximo | 🔴 pesado, ameaça LCP/o 0,71s |
| **Smooth scroll** (Lenis/Locomotive) — base | dá o ar "caro" em tudo | baixo |

### Regras inegociáveis (fecho do doc)

1. **Movimento serve a mensagem.** O melhor WOW PROVA algo (o count-up de "0,71s" impressiona e
   prova velocidade ao mesmo tempo). Efeito sem propósito é poluição.
2. **Capturar de fonte real, nunca inventar.** O doc NOMEIA o efeito e aponta o site; a captura
   do código real é o `/premium-design`. Do site vem o "como" (movimento), nunca a identidade.
3. **Performance é lei.** LCP < 2s, zero layout shift, lazy-load. WebGL pesado ameaça o número
   de que a marca tem orgulho — usar só quando o ganho justifica, com a versão CSS como
   alternativa.
4. **`prefers-reduced-motion` sempre.** Acessibilidade, regra do CLAUDE.md.
5. **Máximo 2-3 efeitos fortes por página.** Excesso mata o WOW — o efeito perde o impacto
   quando tudo se mexe.

## O Uso 4 do `/premium-design` (captura dirigida pelo dono)

- **Gatilho:** "quero essa animação", "copia o efeito desse site", dono cola uma URL.
- **Fluxo:** usa a Fase 1 (Captura) existente → puxa o código-fonte do site → isola o efeito
  (keyframe, easing, JS da animação) → adapta com a marca do cliente (cor/fonte da marca,
  mecânica do site) → pluga na página.
- **Régua (mesma do Uso 3):** do site vem só o "como" (o movimento); a identidade é sempre a do
  cliente. Nunca copiar cor/fonte/conteúdo do site de origem.
- **Cuidado:** se o site usa WebGL pesado, avisar o trade-off de performance e oferecer a versão
  CSS equivalente do catálogo (`craft-movimento.md`).

## Encaixe no motor (template; propaga via /atualizar-motor)

1. `docs/craft-movimento.md` — o catálogo novo.
2. `/premium-design` — ganha o Uso 4 + passa a LER o `craft-movimento.md` no Uso 2 (o
   vocabulário que faltava).
3. `/pagina` Etapa 3.5 — referencia o doc.
4. `CLAUDE.md` — 1 linha na lista de docs de craft lidos (junto de persuasao/frase-que-pega/
   pitch-narrado/swipe-copy).
5. `docs/mapa-de-skills.md` + `CHANGELOG.md` + bump v0.2.10 no rodapé do `CLAUDE.md`.

## Fora de escopo (registro, não neste spec)

Aplicar os efeitos na landing atual da ImpulsoX-AI — isso é rodar o `/premium-design` Uso 2
depois, trabalho de cliente, não do motor. Este spec é só motor.

## Critério de pronto

- `docs/craft-movimento.md` existe: catálogo de efeitos nomeados, cada um com a ficha completa
  (o que é / quando WOW / quando não / custo / reduced-motion / sites de referência), regras
  inegociáveis no fecho, fontes citadas.
- `/premium-design` tem o Uso 4 documentado (gatilho, fluxo via Fase 1, régua, cuidado WebGL) e
  lê o `craft-movimento.md` no Uso 2.
- `/pagina` Etapa 3.5 referencia o doc.
- CLAUDE.md, mapa-de-skills, CHANGELOG e versão atualizados.
- Nenhuma duplicação com a captura que o `/premium-design` já faz.
