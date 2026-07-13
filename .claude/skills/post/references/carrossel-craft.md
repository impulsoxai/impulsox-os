# Craft de carrossel — acervo do formato (lido pelo /post)

> Extraído do corpo do SKILL.md em jul/2026 (progressive disclosure: rodada de REEL não
> precisa carregar isto). Conteúdo intacto — mesmas regras, mesmo peso. Peça de CARROSSEL
> ou POST ÚNICO → leitura obrigatória ANTES de montar qualquer tela. Par do
> `references/molde-carrossel-arc.md` (o arco ENSINA); a lei de reel é `docs/craft-video.md`.

## Anatomia do carrossel

**Tela 1 — o gancho.** Decide se o dedo para. Promessa específica ou tensão real, sem
caça-clique vazio. Título curto, hierarquia óbvia, um elemento dominante. Tecnicamente,
a tela 1 **abre um loop**: planta a pergunta que o resto do carrossel responde — e a
lei da lacuna honesta vale (gancho de "segredo" que entrega obviedade mata a conta aos
poucos; entrega modesta pede gancho menor, não texto inflado).

**Telas internas — uma ideia por tela, com swipe-retention.** Quem lê uma tela isolada entende
ela sozinha. Variar a composição entre os módulos abaixo pra criar ritmo; alternar fundos (claro
↔ escuro ↔ cor da marca) — nunca duas telas seguidas iguais. **Cada slide interno abre um
micro-loop pro próximo** — termina deixando uma pergunta/gancho que o slide seguinte responde
("e o 3º erro é o pior →"). O algoritmo lê a **completion** (quem chega ao fim) como o sinal de
qualidade do carrossel; o swipe contínuo é o que segura. Não basta o loop capa→fecho: cada
passagem de slide tem que puxar o dedo. Reforço barato de swipe: um lembrete discreto
("desliza →") no slide 2 e um pré-CTA ("falta 1 — não pula") — só ~5% dos carrosséis usam
e mede-se ganho real de engajamento; discreto, nunca berrando mais que o conteúdo.

Módulos de composição (vocabulário próprio do ImpulsoX-OS):
- **TESE** — afirmação central grande + uma linha de apoio
- **DADO** — número dominante (estatística, preço, prazo) + contexto curto
- **PASSOS** — sequência numerada enxuta (máx 4 itens por tela)
- **CONTRASTE** — errado vs certo, antes vs depois, mito vs fato em duas colunas
- **FALA** — citação ou depoimento real com atribuição
- **HISTÓRIA** — mini-narrativa em 2-3 telas na espinha do playbook: personagem que o
  público reconhece → tensão real → a virada (o "mas") → desfecho com prova. Pede
  material real; sem caso, trocar de módulo
- **PONTE** — o slide que conecta o valor entregue à oferta: depois de ensinar, dizer
  explicitamente "se fazer isso na mão toma seu tempo, é exatamente o que a [marca] faz
  por você". É o slide que quase todo criador pula — e a razão de carrossel bom não
  converter. Uma frase, específica, sem pressão. **Obrigatório em peça CONVERTER**
  (penúltimo slide, antes do FECHO); opcional e bem-vindo em peça educativa quando a
  oferta ativa cobre o tema
- **FECHO** — última tela: **guarda o dado/punchline mais valioso pro fim** (a melhor virada,
  o número que mais surpreende, o resumo salvável) — NÃO entregue antes. É o que puxa a
  completion >60% (quem chega ao fim) → mais Explore. A chamada única (seguir, salvar, chamar
  no WhatsApp, link na bio) acompanha, mas o herói do último slide é a recompensa guardada, não
  o CTA seco. É aqui que o loop da tela 1 **fecha** — conferir que a pergunta aberta foi
  respondida de verdade.

**Texto por tela:** título até ~8 palavras; apoio até ~18-20 (o limite preciso é por
caractere — ver "Orçamento de caracteres por slide"). Carrossel não é slide de
palestra — quem quer texto longo vai pra legenda. Limite preciso na seção abaixo.

## Orçamento de caracteres por slide (trava antes do render)

As caixas de cada layout são dimensionadas pra um comprimento. Texto que estoura **reflui**:
a linha quebra, o slide para de bater com a régua tipográfica e o carrossel **perde a unidade
visual** — é o que separa um deck premium de um amador. Por isso o comprimento é checado por
**caractere** (não por palavra, que varia muito) e a checagem acontece **no rascunho do
texto, ANTES de montar o HTML e gerar qualquer PNG**. Texto fora do orçamento nunca chega ao
render.

| Elemento | Mín–máx (caracteres) | Observação |
|---|---|---|
| Título da capa | 14–32 | line-height 1.0; cabe em até 3 linhas no tamanho 88–110px |
| Título de tela interna | 24–48 | uma linha forte; máx 2 linhas |
| Texto de apoio | 40–120 | line-height 1.4; o que passa disso vira legenda (≈18–20 palavras) |
| Etiqueta/kicker (CAIXA ALTA) | 6–22 | uma ou duas palavras |
| Linha do FECHO (chamada) | 18–48 | uma chamada só, verbo + objeto |
| Numeral do módulo DADO | 1–6 | é elemento gráfico (ex: "31%", "R$5k", "x7") |

Régua: quando `marca/design-guide.md` define caixas próprias, os limites **dele** mandam — e
o orçamento se recalcula a partir do tamanho real das caixas da marca. Estes valores são o
default quando a marca não especifica.

**Aviso do português:** a contagem é por caractere, mas o reflow real é **largura em pixels**.
Em PT, palavra longa ("desenvolvimento", "automatização") em peso 700–800 ocupa muito espaço e
pode refluir **antes** de estourar a contagem. Por isso o teto interno é conservador (48, não
52): com palavra larga, conferir a largura renderizada, não só o número de caracteres.

**Como aplicar (gate):**
1. Depois do rascunho do texto de cada slide (e depois do `/escritor-br`), **contar os
   caracteres por campo** — a contagem é determinística (`.length` da string, não estimativa
   no olho) e comparar com o orçamento.
2. Campo fora da faixa → **reescrever antes de montar o HTML**, nunca encolher fonte pra caber
   (encolher quebra a régua tipográfica). Abaixo do mínimo soa raso; acima reflui.
3. **Conferência final no HTML:** depois de montar o slide, olhar se alguma linha refluiu (o
   pior caso de PT só aparece renderizado) e se sobrou **viúva/órfã** (uma palavra sozinha na
   última linha) — as duas quebram o acabamento premium mesmo dentro da contagem.
4. Só depois que tudo passa, a produção técnica segue (render). Render é o passo caro; não se
   gasta nele com texto que vai ser refeito.
5. Registrar no `legenda.md` da peça que o orçamento foi conferido (uma linha).

## Layouts nomeados (como a tela aparece)

Módulo é **o que a tela diz** (TESE, DADO, PASSOS…); layout é **como ela aparece**. Um
módulo cabe em vários layouts — escolher o que dá mais força ao módulo daquela tela:

- **CAPA** — eyebrow (kicker em CAIXA ALTA) + título grande + `@handle` discreto. Abertura.
- **SOLO** — split 50/50: foto ou elemento gráfico de um lado, texto do outro ("mostrar e
  explicar").
- **DUO** — texto no topo + dois blocos embaixo (duas fotos, dois cards). Par de exemplos,
  antes/depois lado a lado.
- **NÚMERO** — numeral de 200–320px, peso 800, na cor de destaque, como elemento gráfico,
  com h2 + apoio. É o layout natural do módulo **DADO**.
- **CITAÇÃO** — aspas grandes em marca d'água + a frase + atribuição. Layout do módulo **FALA**.
- **CTA FINAL** — fundo na cor de destaque + logo + a chamada única. Layout do módulo **FECHO**.

**Ritmo dos layouts:** alternar o fundo escuro ↔ claro ↔ destaque ao longo do carrossel
(nunca dois slides seguidos com o mesmo fundo) e usar **no mínimo 2 layouts diferentes** por
peça — carrossel inteiro no mesmo layout cansa e tem cara de template.

Exemplo (layout + módulo juntos): tela 1 em **CAPA**; tela 2 leva o módulo **DADO** no
layout **NÚMERO** (numeral gigante na cor de destaque); tela 3, um **CONTRASTE** em **DUO**;
fecho com o módulo **FECHO** no layout **CTA FINAL**, fundo de destaque.

## Régua tipográfica (números, não adjetivos)

Telas de 1080x1350 vistas num celular de ~400px de largura: o que parece grande no
monitor chega pequeno no feed. Esta régua vale sempre que `marca/design-guide.md` não
definir valores próprios — e quando definir, os dele mandam.

| Elemento | Tamanho | Peso | Tracking | Observação |
|---|---|---|---|---|
| Título da capa | 88–110px | 800–900 | -0.03em | line-height 1.0–1.05; máx 3 linhas |
| Título de tela interna | 58–72px | 700–800 | -0.02em | um por tela |
| Texto de apoio | 30–36px | 400–500 | normal | line-height 1.4; máx ~18-20 palavras (≤120 car.) |
| Etiqueta/categoria | 22–26px | 700 | +0.2em | CAIXA ALTA; uma palavra ou duas |
| Numerador de tela (02/07) | 22–24px | 500–600 | +0.1em | canto superior, todas as telas |
| Numeral do módulo DADO | 220–320px | 800 | -0.02em | é o elemento gráfico da tela |

**Princípio de contraste tipográfico:** o que é grande fecha o tracking, o que é pequeno
abre — é esse contraste, não cor extra, que dá cara editorial à peça. Regra concreta:
títulos grandes com kerning apertado (`letter-spacing ≈ -0.035em`) contra eyebrows/kickers
pequenos em CAIXA ALTA com kerning aberto (`≥ 0.22em`). Aplicar pelos tokens da marca
quando existirem; estes valores são o default quando não.

**Grade fixa:** margem lateral de 88px (~8% da largura); área de respiro generosa —
tela confortável tem no máximo 60% da altura ocupada por conteúdo. Logo discreto +
numerador presentes em **todas** as telas. Contraste texto/fundo mínimo 4.5:1 (medir,
não estimar no olho).

## Sequência de capas no feed

O perfil é visto como grade de 3 colunas — capa nova nunca é decidida no vácuo:

- Alternar o fundo da capa entre os três registros da marca: claro → escuro → cor de
  destaque (ordem livre, repetição em sequência proibida).
- Antes de fechar a capa, conferir as últimas capas em `producao/posts/` (ou no
  calendário). Sem registro local e usuário não lembra? Pedir um print do perfil.
- Registrar o tipo de capa usado tanto na linha do calendário quanto no `legenda.md` da
  peça (ex: "capa: escuro / layout: NÚMERO") — rastreio que solta a próxima peça da
  memória de sessão.

## Crivo de design (impeccable)

Antes de virar PNG, todo carrossel passa por um polimento de design com a impeccable —
entre o HTML montado de cada tela e a renderização via Playwright. É o que tira a peça do
"bom" e leva ao acabamento premium, sem fugir da marca.

impeccable instala **por máquina** (`claude plugin install impeccable@impeccable`). Se
`/impeccable` não existir nesta máquina, avisar em uma linha e seguir sem o crivo — nunca
travar a peça por falta da ferramenta.

**Só os comandos que fazem sentido em peça estática 1080x1350** — carrossel é imagem, não
web (sem hover, foco, responsividade ou animação):
- `/impeccable critique` — hierarquia, clareza, ressonância
- `/impeccable typeset` — tipografia
- `/impeccable layout` — espaço e ritmo
- `/impeccable colorize` — cor estratégica (dentro da paleta da marca)
- `/impeccable bolder` / `quieter` — intensidade
- `/impeccable distill` — tirar excesso

**Nunca rodar os comandos de web** (não se aplicam a imagem estática): `audit` (a11y),
`harden`, `animate`, `onboard`, `optimize`, `adapt` e qualquer coisa de responsividade.

**Limites do crivo:**
- LÊ `marca/tokens.css` + `marca/design-guide.md` + a régua tipográfica acima. AJUSTA
  dentro da marca; **nunca** troca paleta, fonte ou identidade por defaults da ferramenta.
- Cuida **só do visual** (tipografia, espaço, cor, hierarquia). NÃO mexe no texto/copy
  (isso é do `/escritor-br`) nem nos gatilhos (`docs/persuasao.md`).

**Válvula de escape (pra não pesar no dia a dia):**
- Por padrão o crivo roda sempre. Se o usuário disser "pula o polimento", "rápido" ou
  "sem crivo" neste post, gerar direto sem a etapa.
- Quando pular, avisar em uma linha: "gerado sem o crivo de design, a pedido".
