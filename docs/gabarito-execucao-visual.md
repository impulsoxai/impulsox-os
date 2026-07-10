# Gabarito de execução — VISUAL (nível Fable, executável em qualquer modelo)

> Irmão do `docs/gabarito-execucao-social.md` (carrossel IG/LinkedIn) e do
> `docs/gabarito-execucao-texto.md` (texto). Este cobre toda peça VISUAL renderizada:
> página, slides, dashboard, reel por código, e-book diagramado, identidade. Dois
> princípios inegociáveis: (1) gate ANTES do passo caro; (2) QA visual com defeitos
> NOMEADOS — nunca "olhar se ficou bom".

## 1. Regra do passo caro

Todo fluxo visual tem um passo caro (render de vídeo, deploy, geração de N PNGs,
diagramação completa). **Nada entra no passo caro sem os gates anteriores fechados:**
texto no orçamento de caracteres, tokens da marca conferidos, estrutura aprovada.
Render é onde se paga — não se paga por material que volta.

Custo real = dinheiro (API de vídeo/imagem) ou tempo (re-render, re-deploy). Vídeo:
sempre `--dry-run`/storyboard aprovado antes de gerar. Página: copy fechada pelo
`/copy` antes de 1 linha de HTML.

## 2. Herança técnica

Antes de construir, abrir a última peça aprovada do MESMO tipo em `producao/` (ou o
template da skill): herdar variáveis CSS, moldura, scripts de render. Nunca recriar do
zero base que já foi aprovada — estilo novo muda a pele, a base técnica continua.
Tokens SEMPRE de `marca/tokens.css`; cor/fonte fora da marca não existe.

## 3. QA visual — o gate que separa os modelos (aqui é obrigatório)

Depois de renderizar, **abrir o resultado como IMAGEM** (Read do PNG / screenshot da
página nos 3 tamanhos 390/768/1440 / frames do vídeo) — no mínimo: abertura, um miolo,
o fecho. Checar contra a tabela NOMEADA:

| # | Defeito | Teste |
|---|---|---|
| 1 | Sobreposição | algum elemento cobre texto? (badge sobre apoio, imagem sobre título) |
| 2 | Vazio morto | >40% de área sem conteúdo nem elemento de anotação? → preencher com elemento do estilo, nunca esticar fonte |
| 3 | Viúva/órfã | palavra sozinha na última linha? → reescrever a quebra |
| 4 | Reflow | linha quebrou onde não devia (palavra longa PT em peso 700+)? |
| 5 | Unidade | moldura/rodapé/navegação idênticos em toda tela? paginação correta? |
| 6 | Contraste | texto sobre cor/foto/tarja ≥ 4.5:1 (medir, não estimar)? |
| 7 | Mobile primeiro | em 390px: nada cortado, tap-targets ≥ 44px, hero legível sem zoom? (só peça web) |
| 8 | Movimento | animação respeita `prefers-reduced-motion`? nada anima sem propósito? (só peça com motion) |

Defeito achado → corrigir na fonte → re-renderizar → conferir DE NOVO. O loop só fecha
com a tabela limpa. (Referência: no carrossel de 2026-07-08 este loop pegou badge
cobrindo texto e rodapé vazio — invisíveis no código, óbvios na imagem.)

## 4. Por tipo de peça (o que muda)

- **/pagina** — QA nos 3 tamanhos (390/768/1440) com a tabela acima; depois o
  `/revisar-pagina` entra como olhos frios (o QA daqui não substitui — é o filtro
  anterior, pra não gastar o revisor com defeito mecânico).
- **/slides** — cada slide é um render 16:9: rodar a tabela como no carrossel; conferir
  também presenter view e slide-ponte de demo.
- **/reel-marca** — storyboard + stills aprovados ANTES do render de vídeo; depois do
  render, extrair 3-5 frames (abertura/meio/fecho) e rodar a tabela + legibilidade da
  legenda em 390px (muted-first).
- **/dashboard** — tabela acima + dados: número exibido bate com o script gerador
  (conferir 2-3 valores na fonte, nunca aceitar o HTML como prova).
- **/criar-ebook** — amostra de 3 páginas diagramadas (capa, miolo, fim) passa a tabela
  antes de diagramar o resto.
- **/identidade · /premium-design** — o lado-a-lado mostrado ao dono é renderizado e
  conferido (tabela 1, 5, 6); o design-guide destilado bate com o que foi aprovado
  (conferir 3 tokens no arquivo final contra a proposta aceita).

## 5. Aceite (a peça só está pronta se)

1. Nenhum passo caro rodou com gate anterior aberto. 2. Base herdada, tokens da marca.
3. QA visual rodou com a tabela e fechou limpo (com re-render de conferência).
4. Texto embutido na peça passou pelo gabarito de TEXTO antes. 5. O que não rodou
(ferramenta ausente, crivo pulado a pedido) está declarado na nota de produção — honesto.

---
*Origem: metodologia Fable→Opus de 2026-07-08. A tabela de defeitos é a mesma do
`gabarito-execucao-social.md` §5, estendida (7-8) pra peça web/vídeo. Atualizar quando
o /desempenho ou o /revisar-pagina derrubar/validar regra daqui.*
