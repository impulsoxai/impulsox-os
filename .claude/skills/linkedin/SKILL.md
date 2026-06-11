---
name: linkedin
description: >
  Use para criar conteúdo de LinkedIn — "/linkedin", "post pro LinkedIn", "escreve algo
  pro meu LinkedIn", ou ao executar linha do calendário marcada como LinkedIn. Produz
  post de texto, post com imagem ou documento PDF (carrossel de LinkedIn), calibrado
  pro algoritmo de 2026: profundidade, voz pessoal, sem link no corpo, sem isca de
  engajamento.
---

# /linkedin — Conteúdo que funciona no LinkedIn

LinkedIn não é Instagram com gravata. O algoritmo de 2026 derruba post com link externo
no corpo e pune isca de engajamento ("comenta EU QUERO"); premia profundidade, opinião
com assinatura pessoal e conversa real nos comentários. Esta skill escreve pra esse jogo.

Autoria: ImpulsoX AI. Conteúdo original.

## O que ler antes

- `nucleo/voz.md` e `nucleo/negocio.md`
- `producao/calendario/<mes>.md` — tema e intenção, se veio do calendário
- Perguntar uma vez e registrar em `nucleo/voz.md`: o post sai no **perfil pessoal**
  (do dono/sócio) ou na **página da empresa**? Perfil pessoal alcança mais; página
  constrói presença institucional. Recomendar pessoal como motor principal.

## Formatos

1. **Post de texto (padrão)** — 900-1.800 caracteres. O formato com melhor custo-benefício.
2. **Post com imagem** — quando um dado ou visual sustenta o argumento (pedir a imagem ao
   `/post` se precisar de peça da marca).
3. **Documento PDF** — o "carrossel" do LinkedIn: conteúdo educativo denso, 6-12 páginas
   verticais, geradas como no `/post` (HTML → PNG → PDF) com a identidade da marca.

## Anatomia do post de texto

**Linhas 1-2 — o corte.** Só elas aparecem antes do "ver mais". Têm que criar a pergunta
na cabeça do leitor sem caça-clique. Afirmação contraintuitiva, número concreto ou cena
real funcionam; "Você sabia que..." não.

**Corpo — uma ideia, com lastro.** Parágrafos de 1-3 linhas com respiro entre eles
(leitura mobile). Argumento → exemplo concreto vivido → consequência prática. O leitor
tem que sair com algo que consegue aplicar ou repetir na reunião de segunda.

**Fecho — abre conversa.** Pergunta genuína que um par responderia, ou posição firme que
convida discordância civilizada. Nunca "concorda? 👇".

**Link?** No corpo, não. Se precisa apontar pra algo: "link no primeiro comentário" — e
entregar o comentário pronto junto.

**Hashtags:** 0 a 3, específicas. No LinkedIn elas pesam pouco; relevância do texto pesa
muito.

## Voz

Primeira pessoa. O leitor segue gente, não logomarca. A skill escreve como o dono/autor
falaria (calibrado pelo `nucleo/voz.md`), com opinião — texto morno que não afirma nada
não existe pro algoritmo nem pra memória de ninguém.

**Passo obrigatório:** todo texto passa pelo `/escritor-br` antes de entregar. Os vícios
de IA em português matam um post de LinkedIn mais rápido que em qualquer outra rede —
o público de lá lê texto o dia inteiro e fareja template.

## Saída

Salvar em `producao/linkedin/<YYYY-MM-DD>-<slug>.md`:
- O post pronto (e o comentário com link, se houver)
- Variação alternativa do corte (linhas 1-2) pra escolha
- Se documento PDF: arquivos em subpasta + o texto de apresentação do post
- Sugestão de melhor janela de publicação (terça a quinta, manhã, como padrão — ajustar
  quando houver dados reais da conta)

Publicação: perfil pessoal é **publicação assistida** (o sistema entrega pronto, o
usuário cola e publica — automação de perfil viola os termos do LinkedIn). Página de
empresa pode ser automatizada via `/publicar` quando configurada.

## Regras

- Nunca prometer alcance ("isso vai bombar").
- Nunca inventar caso, cliente ou número. História precisa ter acontecido; dado precisa
  ter fonte.
- Sem tagging de gente aleatória pra forçar alcance; sem pod de engajamento.
- Um post por ideia. Sobrou ideia boa → vira a próxima linha do calendário.
- Atualizar o Status no calendário quando aprovado.
