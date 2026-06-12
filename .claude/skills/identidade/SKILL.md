---
name: identidade
description: >
  Use quando o negócio precisa de identidade visual para o sistema produzir peças
  consistentes — quando o usuário disser "/identidade", "criar a marca", "identidade
  visual", "definir cores e fontes", "fazer um logo", ou logo após o `/plugar`. Funciona
  com marca existente (extrai e documenta) ou sem marca nenhuma (cria do zero, inclusive
  o logo). Aceita prints de sites de referência quando a empresa só tem o logo ou nada.
---

# /identidade — Marca da empresa para o sistema inteiro

Define cores, tipografia, logo e regras visuais. Tudo que o ImpulsoX-OS gera depois —
posts, anúncios, páginas — lê o resultado desta skill. É a base; vale fazer bem.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda do **degrau 0** — é a skill que CRIA o contexto visual (leva a marca ao degrau 2).
Não espera nada pronto; quanto mais referência o usuário der, melhor calibra.

## Dois caminhos

Decidir cedo qual se aplica (a `/plugar` já pode ter indicado):

- **A marca já existe** (site no ar, identidade definida) → **Caminho EXTRAIR**.
- **Não existe, ou só existe o logo / um começo** → **Caminho CRIAR**.

Em qualquer caso, o resultado mora em `marca/design-guide.md`, `marca/tokens.css` e
`marca/logo/`. Para clientes (modo agência), em `clientes/<nome>/marca/`.

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

### 3. Confirmar
Mostrar o guia ao usuário. Perguntar se algo deve mudar agora que está documentado
(muita gente aproveita pra corrigir o que nunca gostou). Ajustes pontuais entram aqui.

---

## Caminho CRIAR (a marca não existe ainda)

**Canvas de criação — Open Design (quando disponível).** Sem marca pronta, o Open Design
(plugin MCP `open-design`, daemon local em `127.0.0.1:7456`, roda na subscription Claude Pro
do usuário) é o canvas preferido pra criar e iterar a identidade ao vivo: paleta, tipografia
e composição renderizam em tempo real e o usuário ajusta conversando — bem acima do specimen
estático. Esta é a **exceção criadora** à regra "nunca impor marca": aqui não existe marca
ainda, então o Open Design ajuda a CRIAR junto com o usuário. O resultado é sempre destilado
pra `marca/design-guide.md` + `marca/tokens.css` + `marca/logo/` — a fonte de verdade é o
núcleo da marca, não o projeto do Open Design. Daemon desligado ou indisponível → seguir com
as 3 direções + specimen abaixo, sem travar.

### 1. Coletar contexto e referências
Ler `nucleo/negocio.md`, `nucleo/voz.md` e `nucleo/perfil.md` (quem é, como fala, que tipo
de negócio). O perfil orienta o clima visual: criador pede personalidade e cara própria;
profissional liberal pede sobriedade que passa confiança; PME local pede clareza e calor.
Depois pedir referências — **é o que mais eleva a qualidade**:

> "Pra eu criar algo com a sua cara e não genérico: me manda prints de **2 ou 3 sites ou
> marcas que você admira**. Pra cada um, me diz em uma frase o que te agrada — é a cor? a
> tipografia? o clima? Se você já tem um logo, manda ele também."

Ler as imagens enviadas (prints e logo são lidos diretamente). Extrair padrões: paletas
recorrentes, contraste, peso tipográfico, densidade, clima. Anotar o que o usuário disse
gostar em cada referência — isso direciona, não copiar as referências.

### 2. Propor 3 direções
**As direções nascem de DNA real, não da imaginação da IA.** Se o usuário topar trazer
2-3 URLs de referência (ou aceitar as que a `/premium-design` sugere onde buscar —
Awwwards, Godly, Landbook), chamar a `/premium-design`: ela captura o código-fonte,
extrai um design system por referência e **recombina** com o briefing da marca (núcleo +
o que o usuário disse gostar em cada referência). As **três direções** viram três
recombinações distintas do mesmo acervo — cada uma herda peso diferente das referências.
O passo a passo é dela; aqui só se consome o resultado, que já chega pronto pra virar guia.

Fallback (só se o usuário não quiser trazer referência): propor as três direções da
imaginação, como abaixo — e **marcar no resultado** que a marca saiu "sem DNA real",
sugerindo rodar a `/premium-design` depois pra elevar a partir de referências de verdade.

Apresentar **três** direções de marca distintas, cada uma com:
- Um conceito em uma frase (o sentimento que ela passa)
- Paleta (primária + secundária + neutros + destaque, com hex)
- Par tipográfico (display + corpo, do Google Fonts por padrão, evitando as fontes
  batidas de "cara de IA" — ver Regras)
- Uma linha de quando essa direção brilha e pra quem

Pedir ao usuário que escolha uma (ou misture pontos de duas). Se possível, renderizar um
mini-specimen de cada (ver Validação) para a escolha ser visual, não abstrata.

### 3. Logo (só se a empresa não tem)
Se já existe logo, usar o existente e pular esta etapa. Se não existe, gerar o logo em
**SVG** na direção escolhida:
- Versão principal (símbolo + nome)
- Versão horizontal
- Só o símbolo / ícone (para avatar, favicon)
- Versão monocromática (uma cor) para fundos difíceis
Salvar todas em `marca/logo/`. Manter o logo simples e escalável — funciona a 16px e a
1000px. Sem efeito 3D, sem degradê arco-íris, sem clipart.

### 4. Escrever o guia e os tokens
Gerar `marca/design-guide.md` completo (estrutura na seção abaixo) e `marca/tokens.css`
com as variáveis CSS (cores, fontes, raios, espaçamentos) que as skills de página vão
consumir.

---

## Estrutura do `design-guide.md` (ambos os caminhos)

- **Conceito** — o que a marca quer fazer a pessoa sentir
- **Cores** — cada cor com hex, papel e regra de uso; nunca quatro cores brigando
- **Tipografia** — display + corpo, pesos, escala, regra de hierarquia
- **Logo** — variações em `marca/logo/`, área de respiro, usos proibidos
- **Tom visual** — clima e lista do que evitar
- **Tokens** — referência ao `marca/tokens.css`

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
