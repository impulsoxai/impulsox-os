# Gabarito de execução — TEXTO (nível Fable, executável em qualquer modelo)

> Irmão do `docs/gabarito-execucao-social.md` (que cuida do carrossel IG e LinkedIn) e do
> `docs/gabarito-execucao-visual.md` (peça visual/render). Este cobre toda peça de TEXTO:
> copy de página, proposta, e-mail, artigo, roteiro de vídeo, anúncio. Padrão "cartão antes
> da skill": decisões que produzem texto forte viram checklist com gates — nenhum passo é
> "se achar necessário". Lido PRIMEIRO pelas skills que apontam pra cá.

## 1. Por que existe

Texto "bom" vira "massa" em passos que modelo nenhum pula quando é obrigado: rascunho
estruturado → passe de afiação → proibições checadas por busca literal → aceite. A
inteligência do modelo decide o quão brilhante sai a PRIMEIRA versão; os gates garantem
o piso alto da versão FINAL em qualquer modelo.

## 1.5 Passo 0 — CARREGAR O CÉREBRO (anti-cold-start; roda ANTES de qualquer rascunho)

Pedido frio ("escreve um post", "faz um artigo") SEM contexto carregado produz escrita
genérica de IA — em qualquer modelo. É o padrão Brain do Matt Ganzak (Focus Pilot): ele
injeta Voice & Tone + Positioning + Standards no agente ANTES de pedir escrita (crédito
de metodologia; o acervo de cartões desse material é opcional e vive fora do motor). A
versão determinística da casa:

1. Ler `nucleo/negocio.md` + `nucleo/ofertas.md` (o que a empresa é e vende AGORA).
2. Ler `nucleo/voz.md` INTEIRA — inclusive a seção **AMOSTRA [NOME]** (a escrita crua
   do dono, que vence os exemplos aprovados em conflito). Se a seção ainda não existe,
   pedir 2-3 textos reais do dono antes de seguir (ver §2 "Gabarito em DUAS CAMADAS").
3. Ler o exemplar do tipo da peça (`docs/swipe-artigos.md` pra artigo; exemplos BOM
   da voz.md pra peça curta).
3b. Ler `nucleo/fatos.md` (banco de fatos) se a peça vai carregar número/dado de
   mercado — fato SATURADO não entra de novo; escolher outro da despensa ou buscar
   novo com fonte. Se `nucleo/fatos.md` ainda não existir neste negócio, criar a
   partir do molde vazio (ver seção "Formato do arquivo" no próprio molde) antes
   de seguir — não pular a checagem de saturação por falta do arquivo.
4. **Aceite do Passo 0 (bloqueia o rascunho):** antes de escrever a primeira frase,
   citar em 1 linha interna: 2 marcadores da voz que vão entrar + qual exemplar foi
   lido. Sem cérebro carregado, não se escreve — pedido frio vira primeiro leitura,
   depois rascunho.

## 2. Passe 1 — rascunho estruturado

- **Ler o exemplar ANTES de escrever** (`docs/swipe-artigos.md` pra artigo;
  exemplos "BOM" do `nucleo/voz.md` pra peça curta): regra transfere estrutura,
  exemplo transfere ESCRITA. Imitar o ritmo e os movimentos nomeados do exemplar,
  nunca o conteúdo. Na afiação, rodar o "teste de imitação" do swipe.
- **Gabarito em DUAS CAMADAS (artigo/reflexão):** o PENSAMENTO vem dos movimentos
  do exemplar (`docs/swipe-artigos.md`: tese que reposiciona, ressalva honesta,
  fecho que devolve a decisão); a VOZ vem da seção **"AMOSTRA [NOME DO DONO]"** do
  `nucleo/voz.md` — texto CRU escrito pelo dono do negócio (não peça aprovada por
  ele; a escrita dele mesmo), com o fingerprint extraído (1ª pessoa, humor,
  postura, aberturas/fechos característicos). Pensar fundo como o exemplar, soar
  como o dono. Em conflito de calibragem, a amostra dele vence os exemplos
  aprovados. Sem amostra ainda → pedir 2-3 textos reais do dono (WhatsApp
  profissional, e-mail, post) do registro que a peça vai imitar.
- Estrutura vem da skill dona (arco, fórmula, molde) — nunca texto corrido sem esqueleto.
- Abertura: **2-3 variações de mecânicas DIFERENTES** (`docs/hooks.md` pra social;
  `docs/frase-que-pega.md` pra headline/título; `docs/swipe-copy.md` pra página).
- Toda afirmação nasce com a etiqueta interna FATO (tem fonte/prova) ou SUPOSIÇÃO
  (vai pra lista "confirmar com o cliente"). Suposição nunca vira frase afirmativa.

## 3. Passe 2 — afiação (o que separa "boa" de "massa")

1. **Corte dos 20%:** ler frase a frase perguntando "corta ou fica?". Frase que repete a
   anterior com outras palavras, corta. Advérbio que não muda o sentido, corta.
2. **Resultado > descrição:** todo título/subtítulo nomeia o RESULTADO na voz do dono
   ("Relatório de caixa" → "Quanto sobra no fim do mês"). Descrição de ferramenta perde.
3. **1 detalhe concreto por bloco:** número, cena, nome de arquivo, horário. Abstração
   não gruda; "às 22h no WhatsApp" gruda.
4. **Voz do cliente:** as palavras da dor vêm de como o cliente FALA (WhatsApp, reviews,
   entrevista), não do vocabulário interno da agência.
5. **Honestidade embutida:** promessa com pré-condição técnica ou limite → o limite entra
   NO texto em 1 linha. Peça que promete o que o leitor não reproduz queima a marca.
6. **Fecho:** guarda o melhor pro fim (dado, virada, resumo) + UMA chamada só.
7. **Ritmo hard-cut (Matt, Focus Pilot Brain):** se a frase precisa de vírgula,
   provavelmente são duas frases. Duas curtas batem mais que uma composta. Uma
   ideia por linha em peça de conversão.
8. **A linha nunca manda no claim:** frase de efeito que exige uma afirmação que
   não se defende → reescreve-se a LINHA, nunca se estica o claim ("provocative
   AND true is the standard" — Focus Pilot, Process Rules).
9. **Densidade de voz do dono (o redutor honesto de cara-de-IA):** peça de
   blog/opinião carrega ≥3 marcadores da seção "AMOSTRA [NOME]" (`nucleo/voz.md`):
   1ª pessoa assumida ("Acredito", "eu"), convite em vez de venda, fecho com calor,
   humor leve (máx. 1). Guia/pillar: ≥2 (o registro de guia tem teto menor).
   **Evidência medida num caso real (ImpulsoX AI, 10/07/2026, GPTZero):** pillar
   só-modelo 72% → com 3 injeções de voz 64% → peça majoritariamente do dono 45%.
   Voz genuína é o ÚNICO redutor de score externo que MELHORA o texto — truque de
   vocabulário piora e é proibido. Quanto mais dono no texto, menos máquina no número.

## 4. Proibições absolutas (checar por BUSCA LITERAL no texto final, não de memória)

- Travessão "—" na copy visível (linguagem de IA; decisão da casa)
- "pra"/"pro" em texto publicado — sempre "para"/"para o"/"para a", inclusive em
  citação de exemplo (voz.md, decisão da dona 09/07/2026). Atenção na troca: "pra"
  muitas vezes é "para A" — conferir o artigo ("pedido para A IA", não "para IA")
- "marketing" em peça pública (posicionamento; ok interno)
- Caixa-alta emocional · exclamação dupla · clichês da lista do `nucleo/voz.md`
  ("disruptivo", "revolucionar", "outro patamar", "solução inovadora"…)
- Número/benchmark sem fonte nomeada `(fonte, mês/ano)` — sem fonte, rebaixar pra ordem
  de grandeza ou cortar
- Urgência/escassez que não é FATO verificável
- Prova social sem status AUTORIZADA no `nucleo/provas.md`
- **CTA vago** ("Saiba mais", "Comece agora", "Clique aqui", "Enviar") — CTA é
  sempre plano e específico ("Chama no WhatsApp", "Agenda os 20 minutos",
  "Começa por R$ X") (Matt, Focus Pilot Copy Standards)
- **Anti-requentado (peça derivada):** frase de 6+ palavras do exemplar/peça-mãe
  reaparecendo LITERAL na derivada — conferir por busca dos trechos marcantes do
  exemplar na peça nova. Imitar ritmo é a regra; repetir frase é plágio de si
  mesmo (leitor que lê as duas vê requentado; página duplicada dilui no Google)
- **Fato requentado (anti-repetição de dado):** antes de cravar um número/fato de
  mercado, BUSCA LITERAL dele em `producao/` (`grep -rl "<número>" producao/`).
  Já aparece em 2+ peças do mesmo canal → o fato está saturado: usar OUTRO do
  `nucleo/fatos.md` ou buscar novo com fonte. O seguidor que vê o mesmo "15%" em
  3 carrosséis aprende que o perfil se repete — e para de ler (incidente real:
  o 15% do Sebrae apareceu em 16 arquivos antes deste freio, 10/07/2026). Ao usar
  um fato, atualizar a coluna "usado em" do fatos.md
- **Claim de experiência é prova social:** "atendemos", "nossos clientes", "o
  padrão que vemos nos clientes" só com base em `nucleo/provas.md`. Sem carteira
  comprovada, a experiência citável é a REAL: sistemas próprios construídos e
  operados + projetos-piloto em andamento (fórmula do pillar aprovado)
- **Biografia/prova própria virando previsão do leitor** — "construímos X" como
  fato nosso é ok; "você vai conseguir X" é proibido. Capability framing: o que
  é possível FAZER, nunca o que o leitor vai GANHAR (Matt, Legal floor — e casa
  com a conduta ImpulsoX de nunca prometer resultado)

## 5. Aceite (o texto só está pronto se)

1. 2 passes rodaram (afiação não é opcional). 2. Busca literal das proibições voltou
limpa. 3. Toda afirmação é FATO com base ou está na lista "confirmar". 4. UMA chamada
por peça. 5. Passou pelo `/escritor-br` (humanização) DEPOIS da afiação, nunca antes.
6. O gate específico da skill (tabela abaixo) fechou. 7. Para ARTIGO/PÁGINA: passou pelo
`/detectar-ia` (termômetro) e o índice está perto do chão dos exemplares (~9), OU o que
sobra pesando é só especificidade humana (número, nome, cena) que não se deve diluir.
Termômetro, não gate: índice alto manda afiar, não trava.

## 6. Gate específico por skill (além dos globais acima)

| Skill | Gate próprio (bloqueia a entrega) |
|---|---|
| `/copy` | As 3 passadas da própria skill + camada MIRA fechada antes de escrever; headline final testada contra `docs/frase-que-pega.md` (device nomeado) |
| `/proposta` | Cada claim de resultado tem prova em `nucleo/provas.md` ou vira demonstração de capacidade; preço/escopo sem ambiguidade; ler o Stage 2 (`nucleo/foco.md` manda) antes de qualquer decisão de preço |
| `/email` | Checklist de `docs/entregabilidade-email.md` rodado como GATE (não como leitura): remetente, assunto sem spam-trigger, texto/HTML, descadastro. E-mail que reprova não sai. **Outbound/cold**: framework de 4 linhas do Matt (gancho específico → dor na língua dele SEM as palavras "IA"/"automação" → resultado em 1 frase → 1 pedido leve, sem link), <80 palavras, e o TESTE DO TEMPLATE: trocando o nome por outro prospect do mesmo setor, a mensagem ainda serve? → não está específica, volta (`material-matt/sprint-s2-video7-cold-outreach.md`) |
| `/reativar` | Mesmo framework de 4 linhas + teste do template do v7; sequência com conteúdo DIFERENTE por toque no timing da casa (3 toques): toque 2 = VALOR PURO sem pedido (nunca "subindo na sua caixa"), toque final = breakup que libera ("se não é a hora, entendido"). Sempre com oferta/gancho (regra de ouro da própria skill) |
| `/conteudo` | **Só pro ARTIGO do site/blog** (o carrossel e o LinkedIn do mesmo tema seguem o gabarito social via /post e /linkedin). **Modelo de 3 camadas do Matt** (`material-matt/focus-pilot-blog-writing-brain.md`): (1) declarar se o artigo é PILLAR (2.500-4.000 palavras, sumário + FAQ 3-5) ou CLUSTER (1.200-2.000, nunca <800, linka pillar pai + 2-3 irmãos) — nunca órfão; (2) answer-first: as primeiras ~60 palavras respondem a pergunta central por completo, sem aquecimento; H2/H3 = pergunta REAL como o leitor digitaria no ChatGPT, e cada seção abre com a resposta e fica de pé sozinha; (3) fact-density: número específico + fonte NOMEADA + data ("segundo [fonte], 2026" > "muita gente diz") — sem o número, tag grep-ável `[DATA NEEDED: descreve]` no rascunho (nunca inventar; artigo não publica com tag pendente); ~1 link interno por 200-300 palavras com âncora descritiva. Fechar com o self-check de 8 perguntas do cartão |
| `/roteiro-yt` | Hook ≤ 15s com a promessa; a cada ~60s de roteiro um re-hook nomeado (pergunta aberta, virada, "daqui a pouco"); CTA casa com o estágio de funil do Passo 0 |
| `/ads-google` `/ads-meta` | **Compliance por busca literal**: sem claim de resultado garantido, sem "você" + atributo pessoal sensível (política Meta), sem promessa que a landing não sustenta; cada headline dentro do limite de caracteres DA PLATAFORMA (contado, não estimado) |
| `/oferta` `/raio-x` | Só o bloco de aceite (§5): afirmação com base, número com fonte, suposição marcada |

---
*Origem: metodologia Fable→Opus de 2026-07-08 (par do gabarito social). Atualizar quando
o /desempenho ou um contrato fechado/perdido validar ou derrubar regra daqui.*
