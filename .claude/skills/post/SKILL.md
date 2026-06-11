---
name: post
description: >
  Use para criar peça visual de Instagram — "cria um carrossel", "faz um post",
  "/post", "conteúdo pro Instagram", "post educativo sobre X", ou ao executar uma linha
  do calendário marcada como IG. Produz carrossel, post único ou roteiro de reel com a
  identidade da marca: HTML estilizado renderizado em PNG 1080x1350 + legenda pronta.
---

# /post — Peça visual de Instagram

Pega um tema (do calendário ou do pedido direto) e entrega: arquivos PNG prontos pra
postar + legenda na voz da marca. O visual sai da identidade em `marca/`; o texto passa
pelo `/escritor-br` antes de fechar.

Autoria: ImpulsoX AI. Conteúdo original.

## O que ler antes

- `marca/design-guide.md` + `marca/tokens.css` — obrigatório para qualquer pixel
- `nucleo/voz.md` e `nucleo/negocio.md` — pro texto
- `producao/calendario/<mes>.md` — se a peça veio do calendário, tema e intenção já
  estão definidos lá

Marca ainda não existe? Não travar: usar os defaults da seção "Quando não há marca" e
avisar que o resultado melhora depois do `/identidade`.

## Formatos

1. **Carrossel (5-9 telas)** — padrão para ensinar, provar e posicionar. Formato
   1080x1350 (4:5), o de maior alcance orgânico.
2. **Post único** — um dado forte, uma frase de posição, um bastidor.
3. **Roteiro de reel** — quando o tema pede movimento: roteiro cena a cena (gancho nos
   primeiros 2s, desenvolvimento, fecho), texto de tela e instrução de gravação. O
   usuário grava; o sistema não gera vídeo.

Formato não especificado → escolher pelo tema e intenção, dizendo o porquê em uma linha.

## Anatomia do carrossel

**Tela 1 — o gancho.** Decide se o dedo para. Promessa específica ou tensão real, sem
caça-clique vazio. Título curto, hierarquia óbvia, um elemento dominante.

**Telas internas — uma ideia por tela.** Quem lê uma tela isolada entende ela sozinha.
Variar a composição entre os módulos abaixo pra criar ritmo; alternar fundos (claro ↔
escuro ↔ cor da marca) — nunca duas telas seguidas iguais.

Módulos de composição (vocabulário próprio do ImpulsoX-OS):
- **TESE** — afirmação central grande + uma linha de apoio
- **DADO** — número dominante (estatística, preço, prazo) + contexto curto
- **PASSOS** — sequência numerada enxuta (máx 4 itens por tela)
- **CONTRASTE** — errado vs certo, antes vs depois, mito vs fato em duas colunas
- **FALA** — citação ou depoimento real com atribuição
- **FECHO** — última tela: chamada única (seguir, salvar, chamar no WhatsApp, link na
  bio) sobre fundo na cor de destaque

**Texto por tela:** título até ~8 palavras; apoio até ~25. Carrossel não é slide de
palestra — quem quer texto longo vai pra legenda.

## Produção técnica

1. Gerar um HTML por tela (1080x1350) usando **exclusivamente** as variáveis de
   `marca/tokens.css` — nada de cor ou fonte fora da marca.
2. Renderizar cada HTML em PNG via Playwright (screenshot da viewport exata).
3. Salvar em `producao/posts/<YYYY-MM-DD>-<slug-do-tema>/` (HTMLs + PNGs + `legenda.md`).
4. Mostrar as imagens ao usuário pra aprovação antes de dar por pronto.

## Legenda

Estrutura: primeira linha que segura (continua o gancho, não o repete) → desenvolvimento
curto com substância → chamada única → hashtags (3-6 específicas do nicho; zero hashtag
genérica tipo #marketing #sucesso).

**Passo obrigatório:** passar a legenda pelo `/escritor-br` antes de entregar. Nenhum
texto sai com cara de IA.

## Quando não há marca

Defaults premium até o `/identidade` rodar: fundo escuro neutro (#101418) ou claro quente
(#FAF7F2), uma única cor de destaque sóbria, par tipográfico do Google Fonts que não seja
Inter/Roboto/Arial/Space Grotesk, muito espaço em branco. Marcar a peça como "feita com
defaults — rodar /identidade pra calibrar".

## Regras

- Nunca inventar dado, depoimento ou resultado. Sem material real pra "Provar", trocar a
  intenção da peça ou pedir o material.
- Sem emoji como decoração de design (na legenda, só se a voz da marca usa).
- Acessibilidade: contraste legível; descrição alt sugerida junto da legenda.
- Uma chamada por peça. Peça que pede três coisas não consegue nenhuma.
- Atualizar o Status no calendário quando a peça for aprovada.
