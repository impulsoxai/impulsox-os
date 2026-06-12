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

## Degrau mínimo (Escada de Contexto)

Roda no degrau 0; a partir do **degrau 3** (voz real do `/voz`) o texto sai na voz do
autor, não genérico — e no LinkedIn voz genérica é morte na primeira linha.

## O que ler antes

- `nucleo/voz.md` e `nucleo/negocio.md`
- `nucleo/ofertas.md` — cada oferta rende ângulos: **educativo**, **objeção** e **prova**
  (no LinkedIn, puxar mais o educativo/autoridade que a venda direta)
- `nucleo/perfil.md` — o tipo de negócio molda o tom (criador e profissional liberal vivem
  de voz pessoal e autoridade; agência fala pelo cliente, na voz DELE)
- `nucleo/aprendizados.md` — o que já se provou que funciona nesta conta; pesa mais que
  padrão genérico
- `docs/persuasao.md` — gatilhos e storytelling; no LinkedIn os que mais rendem são
  **autoridade demonstrada** (ensinar o que só quem faz sabe), **prova social
  específica** (caso com número) e **reciprocidade** (entregar valor completo, não
  teaser). Escassez quase nunca cabe — o público de lá fareja pressão de venda
- `docs/formulas.md` — moldes testados; quando um serve ao tema, usar como esqueleto
  (priorizando os **validados aqui**) e registrar o nome da fórmula no arquivo da peça
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
real funcionam; "Você sabia que..." não. O corte abre um loop — e a lei da lacuna
honesta do playbook vale dobrado aqui: prometer "o erro que custou R$ 40 mil" e entregar
obviedade queima o autor com o público mais cético das redes.

**Corpo — uma ideia, com lastro.** Parágrafos de 1-3 linhas com respiro entre eles
(leitura mobile). Argumento → exemplo concreto vivido → consequência prática. O leitor
tem que sair com algo que consegue aplicar ou repetir na reunião de segunda.

**Quando o tema permite, contar como história.** O formato que mais segura leitura no
LinkedIn é a cena vivida na espinha do playbook: cena concreta (reunião, ligação, erro)
→ tensão → a virada (o "mas") → lição aplicável. Primeira pessoa, detalhe que só quem
viveu teria. O leitor é o herói em potencial; o autor é quem já passou por ali — nunca
o gênio que acerta sempre. História de sucesso sem tropeço no meio não convence ninguém
nessa rede.

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
- Regras inegociáveis do `docs/persuasao.md` valem inteiras: o teto de gatilhos por
  post, e todo loop aberto no corte fecha no corpo.
- Sem tagging de gente aleatória pra forçar alcance; sem pod de engajamento.
- Um post por ideia. Sobrou ideia boa → vira a próxima linha do calendário.
- Atualizar o Status no calendário quando aprovado.
