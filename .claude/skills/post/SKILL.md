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
- `docs/persuasao.md` — gatilhos, storytelling e loops; escolher os gatilhos da peça
  pela intenção do calendário (mapa no playbook) **antes** de escrever
- `docs/formulas.md` — moldes de estrutura testados; quando um serve ao tema, usar como
  esqueleto (priorizando os **validados aqui**) e registrar o nome da fórmula no
  `legenda.md` da peça — é o que permite ao `/desempenho` validar o molde depois
- `nucleo/provas.md` — pros módulos FALA e HISTÓRIA: só prova com status autorizada;
  banco vazio → a `/provas` entra na fila como próximo passo
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
caça-clique vazio. Título curto, hierarquia óbvia, um elemento dominante. Tecnicamente,
a tela 1 **abre um loop**: planta a pergunta que o resto do carrossel responde — e a
lei da lacuna honesta vale (gancho de "segredo" que entrega obviedade mata a conta aos
poucos; entrega modesta pede gancho menor, não texto inflado).

**Telas internas — uma ideia por tela.** Quem lê uma tela isolada entende ela sozinha.
Variar a composição entre os módulos abaixo pra criar ritmo; alternar fundos (claro ↔
escuro ↔ cor da marca) — nunca duas telas seguidas iguais.

Módulos de composição (vocabulário próprio do ImpulsoX-OS):
- **TESE** — afirmação central grande + uma linha de apoio
- **DADO** — número dominante (estatística, preço, prazo) + contexto curto
- **PASSOS** — sequência numerada enxuta (máx 4 itens por tela)
- **CONTRASTE** — errado vs certo, antes vs depois, mito vs fato em duas colunas
- **FALA** — citação ou depoimento real com atribuição
- **HISTÓRIA** — mini-narrativa em 2-3 telas na espinha do playbook: personagem que o
  público reconhece → tensão real → a virada (o "mas") → desfecho com prova. Pede
  material real; sem caso, trocar de módulo
- **FECHO** — última tela: chamada única (seguir, salvar, chamar no WhatsApp, link na
  bio) sobre fundo na cor de destaque. É aqui que o loop da tela 1 **fecha** — conferir
  que a pergunta aberta foi respondida de verdade

**Texto por tela:** título até ~8 palavras; apoio até ~25. Carrossel não é slide de
palestra — quem quer texto longo vai pra legenda.

## Régua tipográfica (números, não adjetivos)

Telas de 1080x1350 vistas num celular de ~400px de largura: o que parece grande no
monitor chega pequeno no feed. Esta régua vale sempre que `marca/design-guide.md` não
definir valores próprios — e quando definir, os dele mandam.

| Elemento | Tamanho | Peso | Tracking | Observação |
|---|---|---|---|---|
| Título da capa | 88–110px | 800–900 | -0.03em | line-height 1.0–1.05; máx 3 linhas |
| Título de tela interna | 58–72px | 700–800 | -0.02em | um por tela |
| Texto de apoio | 30–36px | 400–500 | normal | line-height 1.4; máx ~25 palavras |
| Etiqueta/categoria | 22–26px | 700 | +0.2em | CAIXA ALTA; uma palavra ou duas |
| Numerador de tela (02/07) | 22–24px | 500–600 | +0.1em | canto superior, todas as telas |
| Numeral do módulo DADO | 220–320px | 800 | -0.02em | é o elemento gráfico da tela |

**Princípio de contraste tipográfico:** o que é grande fecha o tracking (negativo);
o que é pequeno abre (positivo, caixa alta). É esse contraste — não cor extra — que dá
cara editorial à peça.

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
- Registrar o registro usado na linha do calendário (ex: "capa: escuro") pra próxima
  peça não depender de memória de sessão.

## Produção técnica

1. Gerar um HTML por tela (1080x1350) usando **exclusivamente** as variáveis de
   `marca/tokens.css` — nada de cor ou fonte fora da marca.
2. Renderizar cada HTML em PNG via Playwright (screenshot da viewport exata).
3. Salvar em `producao/posts/<YYYY-MM-DD>-<slug-do-tema>/` (HTMLs + PNGs + `legenda.md`).
4. Mostrar as imagens ao usuário pra aprovação antes de dar por pronto.

## Legenda

Estrutura: primeira linha que segura (continua o gancho, não o repete) → desenvolvimento
curto com substância → chamada única → hashtags (3-6 específicas do nicho; zero hashtag
genérica tipo #marketing #sucesso). No desenvolvimento, usar micro-loops do playbook:
o "mas" como pivô, anunciar antes de mostrar, pergunta seguida de resposta — pequenos
fechamentos que mantêm a leitura até a chamada.

**Passo obrigatório:** passar a legenda pelo `/escritor-br` antes de entregar. Nenhum
texto sai com cara de IA.

## Quando não há marca

Defaults premium até o `/identidade` rodar: fundo escuro neutro (#101418) ou claro quente
(#FAF7F2), uma única cor de destaque sóbria, par tipográfico do Google Fonts que não seja
Inter/Roboto/Arial/Space Grotesk, muito espaço em branco, e a régua tipográfica acima
aplicada à risca. Marcar a peça como "feita com defaults — rodar /identidade pra calibrar".

## Regras

- Nunca inventar dado, depoimento ou resultado. Sem material real pra "Provar", trocar a
  intenção da peça ou pedir o material.
- Máximo 2 gatilhos dominantes por peça; escassez/urgência só com fato verificável
  (regras inegociáveis do `docs/persuasao.md` valem inteiras aqui).
- Sem emoji como decoração de design (na legenda, só se a voz da marca usa).
- Acessibilidade: contraste legível; descrição alt sugerida junto da legenda.
- Uma chamada por peça. Peça que pede três coisas não consegue nenhuma.
- Atualizar o Status no calendário quando a peça for aprovada.
