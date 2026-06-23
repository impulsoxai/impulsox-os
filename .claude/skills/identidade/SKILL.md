---
name: identidade
description: >
  Use quando o negócio precisa de identidade visual para o sistema produzir peças
  consistentes — quando o usuário disser "/identidade", "criar a marca", "identidade
  visual", "definir cores e fontes", "fazer um logo", ou logo após o `/plugar`. Funciona
  com marca existente (extrai e documenta) ou sem marca nenhuma (cria do zero, inclusive
  o logo). Já tem marca → extrai + propõe evolução no Open Design (mantém ou moderniza). Não
  tem → entrevista + referência ou mood board de escolha → cria do zero. Ambos terminam
  destilando em design-guide.md + tokens.css, que toda skill lê pra produzir na marca.
---

# /identidade — Marca da empresa para o sistema inteiro

Define cores, tipografia, logo e regras visuais. Tudo que o ImpulsoX-OS gera depois —
posts, anúncios, páginas — lê o resultado desta skill. É a base; vale fazer bem.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda do **degrau 0** — é a skill que CRIA o contexto visual (leva a marca ao degrau 2).
Não espera nada pronto; quanto mais referência o usuário der, melhor calibra.

## Árvore de decisão (a skill guia — o usuário só responde)

Primeira pergunta sempre: **"O negócio já tem logo ou site, ou vamos criar do zero?"**

```
JÁ TEM logo/site  ───→ Caminho EXTRAIR + EVOLUÇÃO
                       1. firecrawl no site → documenta a marca ATUAL (cor, fonte, logo)
                       2. Open Design propõe uma EVOLUÇÃO (versão premium da MESMA marca)
                       3. mostra atual × evolução lado a lado → cliente escolhe
                          (mantém a atual documentada, ou adota a evoluída)

NÃO TEM nada      ───→ Caminho CRIAR
                       1. lê núcleo (negocio/voz/perfil) + mini-entrevista de gosto
                       2. tem site/marca que admira?
                            SIM → usa de REFERÊNCIA (Caminho A do passo 1)
                            NÃO → MOOD BOARD de escolha (Caminho B — mostra, ele escolhe 3)
                       3. cria do zero (Open Design quando ligado; specimen quando não)

AMBOS os caminhos terminam igual:
   → DESTILAR pros 2 arquivos: design-guide.md + tokens.css (a fonte de verdade)
   → atualizar a escada
```

**O premium-design NÃO entra aqui** — ele refina depois, dentro do `/pagina`, só quando a
marca vai virar página/site. A `/identidade` fecha na marca documentada (guia + tokens).

O resultado mora em `marca/design-guide.md`, `marca/tokens.css` e `marca/logo/`. Para
clientes (modo agência), em `clientes/<nome>/marca/`.

---

## Caminho EXTRAIR (a marca já existe)

### 1. Coletar
Se a `/plugar` já trouxe achados visuais do site, partir deles. Senão, usar a skill de
scraping (firecrawl) na URL para capturar: cores predominantes, fontes, logo, estilo de
imagem, clima geral. Se possível, capturar também um print da home para referência.

### 2. Documentar (sem inventar)
Escrever `marca/design-guide.md` com o que o site realmente usa:
- Paleta com hex de cada cor e onde ela aparece
- Fontes de display e de corpo (nome real; se não der pra identificar, a aproximação mais
  próxima do Google Fonts, marcada como "_aproximação a confirmar_")
- Logo: salvar o arquivo em `marca/logo/`; anotar variações que existem
- Tom visual observado e o que manter por consistência

### 3. Propor a EVOLUÇÃO (atual × evoluída, lado a lado)
Documentar o que existe não basta — site simples pede um upgrade. Com o **Open Design**
ligado, gerar uma **versão evoluída da MESMA marca**: mantém a essência (cor base, nome,
espírito) e eleva o acabamento — tipografia melhor, hierarquia, espaço, um sistema coeso.
Não é marca nova; é a marca dele em alta resolução. Renderizar **atual × evoluída lado a
lado** (specimen comparativo) e perguntar:
> "Esta é a sua marca hoje, e esta é uma versão mais premium dela — mesma cara, mais
> acabamento. Quer **manter** a sua como está, ou **adotar** a evoluída?"

A escolha do cliente é a marca final. Mantém → documenta a atual. Adota → a evoluída vira a
marca. Ajustes pontuais entram aqui (muita gente aproveita pra corrigir o que nunca gostou).
Sem Open Design, propor a evolução em specimen estático (HTML→imagem) — mesmo princípio.

---

## Caminho CRIAR (a marca não existe ainda)

**Canvas de criação — Open Design (quando disponível).** Sem marca pronta, o Open Design
(plugin MCP `open-design`, daemon local em `127.0.0.1:7456`, roda na subscription Claude Pro
do usuário) é o canvas preferido pra criar e iterar a identidade ao vivo: paleta, tipografia
e composição renderizam em tempo real e o usuário ajusta conversando — bem acima do specimen
estático. Esta é a **exceção criadora** à regra "nunca impor marca": aqui não existe marca
ainda, então o Open Design ajuda a CRIAR junto com o usuário. O resultado é sempre destilado
pra `marca/design-guide.md` + `marca/tokens.css` + `marca/logo/` — a fonte de verdade é o
núcleo da marca, não o projeto do Open Design.

**Garantir o daemon antes de usar (a skill cuida, o usuário não pensa nisso):** antes do
primeiro comando ao Open Design, testar se ele responde (`list_projects`). Se cair com
"cannot reach the daemon at :7456", subir o daemon e esperar ~20s:
```
cd C:/Users/ACER/tools/open-design && pnpm tools-dev restart --daemon-port 7456 --web-port 5174
```
(Gotcha do Windows: `tools-dev` sozinho usa porta dinâmica; SEMPRE forçar `--daemon-port 7456`,
que é onde o MCP procura. O caminho do install pode variar por máquina — confirmar com `list_projects`
de novo após subir.) Daemon não subiu ou indisponível → seguir com as 3 direções + specimen
estático abaixo, sem travar. O Open Design é o canvas ideal, não um pré-requisito.

### 1. Coletar contexto e referências
Ler `nucleo/negocio.md`, `nucleo/voz.md` e `nucleo/perfil.md` (quem é, como fala, que tipo
de negócio). O perfil orienta o clima visual: criador pede personalidade e cara própria;
profissional liberal pede sobriedade que passa confiança; PME local pede clareza e calor.
Depois, conseguir direção visual — **é o que mais eleva a qualidade**. Dois caminhos, nesta
ordem (o cliente quase nunca sabe verbalizar "que cor/fonte" — a pesquisa de branding é
clara: escolha de imagem dá direção muito mais acionável que descrição abstrata):

**Caminho A — o cliente JÁ tem referência:**
> "Me manda prints de **2 ou 3 sites/marcas que você admira**. Pra cada um, uma frase do que
> te agrada — a cor? a tipografia? o clima? Tem logo? manda também."

**Caminho B — o cliente NÃO sabe / não tem referência (o caso mais comum) → MOOD BOARD DE ESCOLHA:**
Não pedir que ele traga nada. **O sistema mostra, ele escolhe.** A `/premium-design` captura
6-9 aberturas de sites premiados relevantes ao nicho/perfil (Awwwards, Godly, Landbook);
montar uma **grade visual** (HTML→imagem, ou os prints lado a lado) e pedir:
> "Não precisa saber de design. Olha estas referências e me diz: **quais 3 parecem a SUA
> marca?** E tem alguma que é a cara do que você NÃO quer? É só apontar — eu cuido do resto."

A escolha (e a rejeição) é a direção: as 3 escolhidas viram o briefing visual que a
`/premium-design` recombina nas 3 direções. Anotar o porquê de cada escolha quando o cliente
disser — mas a escolha sozinha já dirige. Ler as imagens enviadas/escolhidas diretamente;
extrair paletas, contraste, peso tipográfico, densidade, clima. Direciona, não copia.

### 2. Propor 3 direções
**As direções nascem de DNA real, não da imaginação da IA.** Se o usuário topar trazer
2-3 URLs de referência (ou aceitar as que a `/premium-design` sugere onde buscar —
Awwwards, Godly, Landbook), chamar a `/premium-design`: ela captura o código-fonte,
extrai um design system por referência e **recombina** com o briefing da marca (núcleo +
o que o usuário disse gostar em cada referência). As **três direções** viram três
recombinações distintas do mesmo acervo — cada uma herda peso diferente das referências.
O passo a passo é dela; aqui só se consome o resultado, que já chega pronto pra virar guia.

Fallback (raro — só se o cliente não trouxer referência E não escolher nada do mood board):
propor as três direções da imaginação, como abaixo — e **marcar no resultado** que a marca
saiu "sem DNA real", sugerindo o mood board de escolha ou `/premium-design` depois pra elevar
a partir de referência de verdade. Esse é o pior caminho (genérico mora aqui) — usar o mood
board de escolha primeiro evita cair nele.

Apresentar **três** direções de marca distintas, cada uma com:
- Um conceito em uma frase (o sentimento que ela passa)
- Paleta (primária + secundária + neutros + destaque, com hex)
- Par tipográfico (display + corpo, do Google Fonts por padrão, evitando as fontes
  batidas de "cara de IA" — ver Regras)
- Uma linha de quando essa direção brilha e pra quem

Pedir ao usuário que escolha uma (ou misture pontos de duas). Se possível, renderizar um
mini-specimen de cada (ver Validação) para a escolha ser visual, não abstrata.

### 3. Logo (só se a empresa não tem)
Se já existe logo, usar o existente e pular esta etapa. Se não existe, gerar em **SVG**.

**Logo por IA quebra o galho — mas faça o que a IA faz BEM (pesquisa de logo 2026):**
> Logo profissional = conceito + estética + execução técnica. A IA acerta estética e
> conceito, mas FALHA na execução técnica (grid, espessura, kerning, ancoragem). Então jogar
> pros pontos fortes dela e ser honesto sobre o limite.

1. **Priorizar WORDMARK** (o nome em tipografia forte) sobre símbolo elaborado. É o conselho
   nº1 de 2026 ("wordmarks get louder: bold type + confident spacing wins on mobile") E é o
   que a IA executa melhor. Símbolo desenhado por IA quase sempre sai "quase certo" —
   wordmark bem espaçado sai limpo. Default: wordmark + um acento gráfico simples (um ponto,
   um corte, uma forma única), não um ícone ilustrativo complexo.
2. **Construir por GRID geométrico** — ataca onde a IA falha. Formas em proporção declarada
   (círculo/quadrado/proporção áurea), **espessura de traço única** em todo o logo, alinhamento
   ao baseline da tipografia. Sem espessura variando, sem curva torta. Simplicidade extrema
   esconde a falha técnica da IA; detalhe elaborado expõe.
3. As variações (sempre): principal (wordmark + acento) · horizontal · só o acento/ícone
   (avatar, favicon) · monocromática (fundos difíceis). Salvar em `marca/logo/`. Funciona a
   16px e a 1000px. Sem 3D, degradê arco-íris, clipart, nem o "too-perfect AI look".

**Honestidade obrigatória:** marcar o logo gerado como **"ponto de partida funcional"** no
guia — bom pra começar e usar já, mas pra marca que é o ativo central do negócio, vale um
designer refinar (a execução técnica é onde o humano ainda ganha da IA). Não vender o logo
gerado como "logo premium definitivo".

### 4. DESTILAR — o passo final de TODOS os caminhos (a parte que faz o sistema funcionar)
O specimen do Open Design (ou o resultado do mood board) é bonito mas **solto** — as outras
skills não sabem lê-lo. Destilar = transformar a marca escolhida nos **2 arquivos que TODA
skill de produção lê** antes de criar qualquer peça:
- `marca/design-guide.md` — a marca em texto (conceito, cores com regra de uso, tipografia,
  logo, tom). Estrutura na seção abaixo.
- `marca/tokens.css` — a marca em código: variáveis CSS (`--cor-*`, `--fonte-*`, `--raio-*`,
  `--espaco-*`) extraídas do specimen. É o **contrato** que `/pagina`, `/post`, `/anuncio`,
  `/email` consomem pra sair na marca sozinhas.

Pegar os valores REAIS do specimen (os hex exatos, os nomes de fonte, os espaçamentos), não
aproximar. Sem destilar, a marca fica num canto e nenhuma skill a usa — destilar é o que
liga a identidade ao resto do sistema. **A fonte de verdade são estes 2 arquivos, não o
projeto do Open Design** (se o daemon sumir, a marca continua viva aqui).

### 5. Onde a marca é REFINADA depois (não aqui)
A `/identidade` fecha na marca documentada (guia + tokens). O **refino premium acontece no
`/pagina`**: quando a marca vai virar landing/site, o `/pagina` chama o `/premium-design` pra
elevar o visual da PÁGINA dentro dessa marca. Aqui a skill não roda o premium-design — ela
entrega a base (a marca), e a base já basta pra `/post`, `/anuncio`, `/email` saírem certos.
Página é o único caso que pede o passo extra de refino, e é o `/pagina` que o dispara.

---

## Estrutura do `design-guide.md` (ambos os caminhos)

- **Conceito** — o que a marca quer fazer a pessoa sentir
- **Cores** — cada cor com hex, papel e regra de uso; nunca quatro cores brigando
- **Tipografia** — display + corpo, pesos, escala, regra de hierarquia
- **Logo** — variações em `marca/logo/`, área de respiro, usos proibidos
- **Tom visual** — clima e lista do que evitar
- **Tokens** — referência ao `marca/tokens.css`
- **Entidade** (semente pro Schema, preencher o que já se sabe) — o que o `/seo` e o `/geo`
  vão transformar em `Organization`/`Person` JSON-LD depois. Documentar agora evita
  redescobrir na hora da página:
  - **nome canônico** — a grafia oficial única da marca (sempre a mesma em todo lugar; é o
    `name` da entidade);
  - **`sameAs`** — as URLs dos perfis oficiais (site, Instagram, LinkedIn, Google Business,
    YouTube) que confirmam que é a mesma entidade;
  - **`knowsAbout`** — os 3-5 temas/áreas em que a marca é autoridade (o que ela domina e
    quer ser citada por IA).
  Preencher só com fato confirmado; o que faltar vira pendência na escada — mas semear aqui
  poupa retrabalho no `/seo` (Schema de entidade) e no `/geo` (autoridade/citação).

## `tokens.css` — formato

Variáveis CSS sob `:root` (cores `--cor-*`, fontes `--fonte-*`, raios `--raio-*`,
espaçamentos `--espaco-*`). É o contrato que a skill de landing page lê. Manter os nomes
estáveis.

## Validação visual

Antes de fechar, renderizar um **specimen** — um HTML simples mostrando logo, paleta em
blocos, a tipografia em título/corpo e um botão de exemplo — e gerar uma imagem (Playwright
screenshot). O usuário aprova vendo, não imaginando. Ajustar e re-renderizar até aprovar.
Com o Open Design ativo (Caminho CRIAR), a validação já acontece no próprio canvas ao vivo;
o specimen renderizado cobre o caso sem o daemon.

## Atualizar a escada

Ao concluir, atualizar `nucleo/escada.md` (ou o do cliente): marca como **fato
confirmado**, subir o degrau se aplicável, e registrar arquivos gerados.

## Regras

- **Nunca** as fontes batidas de "cara de IA" como escolha automática: Inter, Roboto,
  Arial, Space Grotesk. Se a marca existente usa uma delas, manter por consistência, mas
  nunca propô-las como criação nova.
- Sem degradê roxo→azul padrão de template, sem card dentro de card, sem ícone em
  quadradinho arredondado acima de cada título.
- Uma cor de destaque, não quatro. Contraste acessível (texto legível sobre fundo).
- No caminho EXTRAIR, documentar o que **é**, não o que você acha que deveria ser —
  sugestões de melhoria vêm depois, separadas, e só se o usuário quiser.
- Logo gerado é sempre vetor (SVG), nunca rasterizado.
- Logo por IA: priorizar wordmark, construir por grid (espessura única), e marcar como
  "ponto de partida funcional" — execução técnica é onde o designer humano ainda ganha.

---

**✓ Pronto:** marca documentada em `marca/design-guide.md` + `marca/tokens.css` · **→ próximo passo:** `/voz` se a voz saiu rasa, depois `/calendario` (conteúdo) ou `/pagina` (site) — toda peça visual lê a marca que esta skill acabou de fechar. Pré-requisito do próximo: núcleo lido; se faltar, o sistema reorienta.
