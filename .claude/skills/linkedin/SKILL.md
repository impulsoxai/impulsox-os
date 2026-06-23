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
- `nucleo/foco.md` — o **cluster de nicho** do momento (ver "Topic Authority" abaixo): o
  post se amarra ao tema central da conta, não dispara em qualquer direção
- `nucleo/aprendizados.md` — o que já se provou que funciona nesta conta; pesa mais que
  padrão genérico
- `docs/persuasao.md` — gatilhos e storytelling; no LinkedIn os que mais rendem são
  **autoridade demonstrada** (ensinar o que só quem faz sabe), **prova social
  específica** (caso com número) e **reciprocidade** (entregar valor completo, não
  teaser). Escassez quase nunca cabe — o público de lá fareja pressão de venda
- `docs/formulas.md` — moldes testados; quando um serve ao tema, usar como esqueleto
  (priorizando os **validados aqui**) e registrar o nome da fórmula no arquivo da peça
- `docs/frase-que-pega.md` — a craft da **primeira linha que segura** (Made to Stick,
  devices, Big Idea, autenticidade); no LinkedIn voz genérica morre na 1ª linha
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

**Roteamento de formato por objetivo (escolher pelo alvo, não pelo gosto):**

| Objetivo | Formato | Por quê |
|---|---|---|
| **Alcance / distribuição** | **Texto nativo** | Post de texto puro distribui ~28% mais no B2B que post com link ou mídia pesada — o algoritmo prioriza quem fica na plataforma |
| **Profundidade salvável / autoridade** | **Documento PDF** | O doc é o formato mais salvável (engaja ~6,6%); vira referência guardada e prova de expertise |
| **Sustentar um dado/visual** | **Post com imagem** | Quando um número ou gráfico carrega o argumento melhor que o texto sozinho |

## Anatomia do post de texto

**Linhas 1-2 — o corte.** Só elas aparecem antes do "ver mais". Têm que criar a pergunta
na cabeça do leitor sem caça-clique. Afirmação contraintuitiva, número concreto ou cena
real funcionam; "Você sabia que..." não. O corte abre um loop — e a lei da lacuna
honesta do playbook vale dobrado aqui: prometer "o erro que custou R$ 40 mil" e entregar
obviedade queima o autor com o público mais cético das redes.

**Corpo — uma ideia, com lastro.** Parágrafos de 1-3 linhas com respiro entre eles
(leitura mobile). Argumento → exemplo concreto vivido → consequência prática. O leitor
tem que sair com algo que consegue aplicar ou repetir na reunião de segunda.

**Dwell time é o sinal nº1.** O algoritmo de 2026 mede acima de tudo **quanto tempo a
pessoa fica parada no seu post** (o "ver mais" expandido, a leitura até o fim). Vale mais
que like e até que comentário. Por isso o corpo é desenhado pra **prender 30s+ de leitura**:
densidade real (cada parágrafo entrega uma coisa nova, sem encheção), um micro-loop por
bloco que puxa pro próximo, e o texto longo o suficiente pra justificar o "ver mais" — mas
nunca inflado. Post raso que se lê em 5s não distribui, por mais curtido que seja.

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

## Topic Authority (o jogo de 60 dias)

O algoritmo de 2026 recompensa quem é **consistente num assunto**: manter **70-80% dos posts
dentro de um mesmo cluster de nicho** ao longo de 60+ dias dá +78% de distribuição (o LinkedIn
te reconhece como autoridade naquele tema e entrega pra quem busca aquilo). Por isso:

- Ler o cluster atual em `nucleo/foco.md` (e o histórico em `producao/linkedin/`) e **amarrar
  este post ao cluster** — o ângulo do dia é uma faceta do tema central, não um tema solto.
- Se o pedido foge do cluster, dizer em uma linha: "isto sai do seu cluster de [tema] — tudo
  bem 1 post fora a cada 4-5, mas se virar regra, sua autoridade dilui". O dono decide; o
  sistema só não deixa o perfil virar colcha de retalhos sem avisar.
- Os ~20-30% restantes (bastidor, opinião, prova) dão respiro humano — não são o motor de
  distribuição, são o que evita o perfil soar robô de um assunto só.

## Saves no LinkedIn (desenhar pra ser guardado)

Save virou sinal forte de distribuição no LinkedIn (referência guardada = "vou voltar nisso").
O formato mais salvável é o **documento PDF**: quando o tema é guia/checklist/framework, desenhar
como doc salvável — uma página = uma ideia que vale guardar, capa com a promessa, última página
com o resumo guardável e o convite a salvar ("salva pra usar na próxima reunião"). Post de texto
também pode mirar save quando entrega um framework completo, mas o doc é o cavalo de batalha do
conteúdo guardável.

## Saída

Salvar em `producao/linkedin/<YYYY-MM-DD>-<slug>.md`:
- O post pronto (e o comentário com link, se houver)
- Variação alternativa do corte (linhas 1-2) pra escolha
- Se documento PDF: arquivos em subpasta + o texto de apresentação do post
- **Kit de Golden Hour** (ver abaixo): 1-2 comentários de resposta prontos + a instrução
  de responder na 1ª hora
- Sugestão de melhor janela de publicação (terça a quinta, manhã, como padrão — ajustar
  quando houver dados reais da conta)

**Golden Hour — a 1ª hora decide a distribuição.** O LinkedIn testa o post num público
pequeno na primeira hora; cada **resposta do autor a um comentário reinicia o ciclo** de
distribuição (e puxa dwell time de volta). Por isso a entrega inclui um **kit de Golden Hour**:
- **1-2 comentários de resposta prontos** — não respostas genéricas ("obrigado!"), mas
  continuações que agregam (um dado a mais, um contraponto, uma pergunta que puxa o próximo
  comentário). São o que o autor cola assim que alguém comenta.
- **Instrução clara:** publicar e **ficar disponível na 1ª hora** pra responder cada comentário
  rápido (não deixar pra responder à noite). Responder é parte da peça, não pós-venda.

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

---

**✓ Pronto:** post de LinkedIn (texto, imagem ou PDF) na voz do autor · **→ próximo passo:** `/revisar` — crivo sênior de olhos frios antes de publicar. Pré-requisito: `marca/`, voz e provas; se faltar, o sistema reorienta.
