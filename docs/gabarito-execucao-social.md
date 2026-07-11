# Gabarito de execução — carrossel IG e post LinkedIn (nível Fable, executável no Opus)

> Padrão "cartão antes da skill": este doc destila as DECISÕES que produziram a peça
> aprovada de 2026-07-08 (carrossel spec-sheet "5 pedidos prontos") num checklist que
> qualquer modelo executa igual. Inteligência não transfere; decisão transfere. Lido
> pelo `/post` e pelo `/linkedin` antes de produzir. Regra de ouro: nenhum passo é
> "se achar necessário" — ou é gate (bloqueia), ou não está aqui.

## 0. Por que existe

Peça boa não nasce de talento do modelo; nasce de: (1) ordem de leitura certa,
(2) gates que bloqueiam texto/visual fraco ANTES do passo caro, (3) loop de
auto-verificação visual com defeitos NOMEADOS. Modelo mais fraco pula esses passos
quando não é obrigado. Este gabarito obriga.

## 1. Ordem de leitura (fixa, antes de qualquer rascunho)

1. `.claude/skills/post/references/molde-carrossel-arc.md` — arco 5 atos + §8 catálogo
   de estilos (carrossel) · pro LinkedIn, as regras da própria SKILL.md do /linkedin
2. `marca/tokens.css` + `marca/design-guide.md` — cores/fontes; NUNCA inventar token
3. `nucleo/voz.md` — INTEIRA: a lista de palavras banidas, os exemplos "BOM", a seção
   **AMOSTRA DO DONO** (a escrita crua dele — em conflito de calibragem, ela vence) e a
   seção **NÃO FAÇA** (lista viva das correções dela — cada item é um erro que JÁ
   aconteceu em peça real e não pode voltar)
4. `nucleo/foco.md` — prioridade do mês + regras de produção registradas lá
   (ex.: design system aprovado de carrossel: Anton + DM Mono, dark, ouro/roxo)
5. `nucleo/aprendizados.md` + `nucleo/ofertas.md` (ângulos) + banco de ideias
   (`producao/ideias/`) se o tema ainda não veio do calendário
5a. **Carrossel:** `nucleo/aprendizados-carrossel.md` — banco de padrões nomeados
   específico do formato (padrão "Brain" do Focus Pilot/Matt Ganzak, 2026-07-10:
   aprendizado por FORMATO, não só geral). Se vazio, seguir; se tem entrada, ela
   pesa mais que qualquer regra genérica deste gabarito.
5b. `nucleo/fatos.md` se a peça leva número/dado de mercado — **fato SATURADO não
   entra** (regra anti-repetição: busca literal do número em `producao/`; 2+ peças
   do mesmo canal = escolher outro fato da despensa ou buscar novo com fonte; ao
   usar, atualizar a coluna "usado em"). Incidente que criou a regra: o 15% do
   Sebrae em 16 arquivos, 10/07/2026 — seguidor que vê o mesmo dado 3× para de ler
6. **A última peça aprovada do mesmo formato em `producao/posts/`** — abrir o HTML dela
   e HERDAR: variáveis CSS, moldura, rodapé, script de render. Nunca recriar do zero o
   que já foi aprovado; estilo novo muda a PELE, a base técnica continua.

**Aceite da ordem de leitura (anti-cold-start + few-shot verbatim — auditoria 10/07/2026):**
antes do primeiro slide/rascunho, **COLAR no contexto de escrita as amostras cruas do
dono (`nucleo/voz/amostras/*.md`), verbatim, como o ÚLTIMO conteúdo antes da primeira
frase da peça** — amostra no prompt rende até 23,5× mais acerto de voz que instrução
(arXiv:2509.24930); "ler a voz.md" NÃO substitui a colagem. O aceite deixa de ser
auto-atestado: o bloco de amostras tem que estar visivelmente no contexto. Pedido frio
("faz um carrossel") sem isso produz escrita genérica de IA em QUALQUER modelo.

**Pesquisa de posts similares (padrão Brain do Matt, confirmado no vídeo de 2026-07-10:
"it reads the social media post and engagement... we'll also look at other similar
posts online and learn from that as well"):** antes de escrever o hook, buscar 2-3
posts/carrosséis REAIS do nicho (PME + IA/marketing) que estão performando agora
(WebSearch). Não pra copiar tema/conteúdo — pra calibrar o que já está funcionando
no formato AGORA, além do banco interno estático. Registrar no META da peça
(`pesquisa-externa:` sim/não) — pular só se a peça for urgente/reativa (newsjacking
do dia).

## 2. Gate de tema

- Se veio do calendário: usar. Se não: propor **3 temas com 1 recomendado**, cada um com
  o porquê em 1 linha (fit com foco + fit com o estilo visual da vez). Esperar escolha.
- **Escolher o ARCO antes de tudo** (molde-carrossel-arc §1 vs §1b): `objetivo:
  converter` → arco de venda (raro — CTA de venda 1-2×/semana, régua do §5.5);
  `objetivo: salvar/enviar/posicionar` → **Arco ENSINA** (HOOK dor/curiosidade →
  ESPELHO → CAMINHO acionável → RESUMO → FECHO de algoritmo). Nunca "adaptar" o arco
  de venda pra peça educativa. Registrar o arco no META (`formula:`).
- Carrossel: escolher o ESTILO no catálogo §8 **antes** da copy (o estilo muda o que a
  copy precisa — spec-sheet pede conteúdo copiável; concept-poster pede frase de cartaz).
  Regra de rotação: nunca o mesmo estilo do carrossel anterior do perfil.

## 3. Gate de copy (2 passes — obrigatórios, nesta ordem)

**Passe 1 — rascunho estruturado:** arco de 5 atos (carrossel) ou estrutura da SKILL.md
(LinkedIn). 2-3 variações de capa/primeira-linha, de mecânicas DIFERENTES do
`docs/hooks.md` (nunca 3 variações da mesma mecânica).

**Passe 2 — afiação (é o que separa "boa" de "massa"):**
- Ler cada frase e perguntar: "corta ou fica?" — cortar os ~20% mais fracos. Frase que
  só repete o slide anterior com outras palavras: corta.
- Cada título interno: trocar descrição por RESULTADO na voz do dono ("Relatório de
  caixa" → "Quanto sobra no fim do mês"). Título que descreve a ferramenta perde pro
  título que nomeia o desejo.
- 1 detalhe concreto por slide (número, nome de arquivo, cena) — abstração não gruda.
- Peça no Arco ENSINA: rodar o gate por tela do CAMINHO ("se o leitor printar SÓ esta
  tela, leva algo utilizável?") + busca literal pelo nome da marca nas telas internas
  (marca no meio = reprovada, molde §1b).
- Aplicar `docs/frase-que-pega.md` na capa e no fecho (device nomeado, não intuição).
- **Fecho-muleta proibido (busca literal):** "E isso diz muito", "E isso muda tudo",
  "Pense nisso", "Fica a reflexão" e variações — frase de fecho que não afirma nada
  concreto, corta. O fecho de um apoio termina em informação, não em eco.
- **UM termo por peça:** escolhido o termo (PME ou MPE, cliente ou lead, agente ou
  assistente), ele vale do slide 1 à legenda — conferir por busca literal. Termo
  oscilando lê como erro de digitação.
- **Negrito marca IDEIA completa, não fragmento:** o bold cobre a unidade de sentido
  inteira ("conciliar o caixa", nunca "**Conciliar o** caixa"). Checar cada bold
  renderizado: se o trecho destacado não faz sentido lido sozinho, a marcação volta.
- **Honestidade embutida:** se a promessa tem pré-condição técnica, ela entra NA PEÇA
  em 1 linha (ex.: "funciona em IA que acessa seus arquivos"). Peça que promete o que
  o leitor não vai conseguir reproduzir queima a marca.

**Proibições absolutas (checar por busca literal no texto final):** travessão "—" na
copy visível E na legenda · a palavra "marketing" em peça pública · caixa-alta emocional ·
exclamação dupla · dado numérico sem fonte nomeada · clichês da lista do voz.md ·
**cada item da lista NÃO FAÇA do voz.md** (rodar item a item na peça pronta — inclui o
teste de voz: frase nova que a dona não falaria = reescrever com a palavra simples; e o
teste de CTA: a ação do slide dá para executar dentro do app?).

**Gate mecânico de voz (bloqueia — roda ANTES do HTML e DE NOVO no arquivo final):**
`node scripts/gate-voz.mjs <arquivo> --formato ig-carrossel --publico` (no HTML final:
`--html`; na legenda: `--legenda`). Ele carrega `scripts/voz-regras.json` (fonte única):
pra/pro, dois-pontos retórico acima do budget, CTA impossível no formato, caixa-alta
emocional, fecho-muleta, banidas, travessão. Exit 1 = a peça NÃO segue. Substitui a
chamada manual ao lib-humanizador com `--banidas` (que dependia de o modelo montar a
lista — auditoria 10/07/2026).

**Gate de caracteres:** contar `.length` por campo contra o orçamento da SKILL.md do
/post (capa 14-32, título interno 24-48, apoio 40-120…). Campo fora → reescrever.
NUNCA encolher fonte pra caber. Só depois disso começa o HTML.

## 4. Build (carrossel)

- Um HTML único, todos os slides, só variáveis herdadas do HTML anterior + tokens.
- Componentes do estilo escolhido conforme o §8 (spec-sheet: grid técnico, cruzes de
  registro, cota, etiqueta de estado, FIG., card terminal, FOLHA N/N, ghost numeral).
- A moldura de metadados é IDÊNTICA em todos os slides — é ela que dá unidade.
- Render: copiar o `render.js` da peça anterior (playwright-core + findChromium),
  ajustar só o mapa de nomes. deviceScaleFactor 2.

## 5. QA visual (o passo que o modelo fraco pula — aqui é gate)

Depois de renderizar, **abrir os PNGs como imagem** (Read) — **TODOS os slides** em
peça de até 10 telas (não amostrar: o vazio morto costuma morar no miolo, não na capa).
Checar contra esta lista NOMEADA (não "olhar se ficou bom"):

| # | Defeito | Teste |
|---|---|---|
| 1 | Sobreposição | algum elemento cobre texto? (badge sobre apoio, ghost sobre título) |
| 2 | Vazio morto | terço inferior >40% vazio sem elemento de anotação? → adicionar (ghost numeral, nota mono), nunca esticar fonte |
| 3 | Viúva/órfã | palavra sozinha na última linha de título/apoio? → reescrever quebra |
| 4 | Reflow | linha quebrou onde não devia (palavra longa PT)? |
| 5 | Unidade | moldura/rodapé/paginação idênticos e corretos em todo slide? |
| 6 | Contraste | texto sobre cor/tarja legível (4.5:1)? |

Defeito achado → corrigir no HTML → re-renderizar → conferir DE NOVO. O loop só fecha
com a lista limpa. (Na peça de referência, este loop pegou badge cobrindo texto e
rodapé vazio — os dois invisíveis no código, óbvios na imagem.)

## 5.5 Regras Matt Ganzak — post orgânico que atrai cliente (S2v5, 2026-07-08)

Réguas destiladas de `material-matt/sprint-s2-video5-conteudo-organico.md` (mecânica
dele, voz ImpulsoX). Valem pra todo post de IG/LinkedIn com intenção de posicionar:

- **Declarar o TIPO do post antes de escrever** (registrar no META, campo `formula` ou
  nota): PROVA (resultado real com número + visual do build; build interno real conta;
  mostra O QUE resolveu, nunca COMO) · PROBLEMA (nomeia UMA frustração na língua do
  comprador, sintoma, SEM solução e SEM pitch) · PROCESSO (mostra a DECISÃO, nunca o
  passo-a-passo — "a janela da cozinha, não a receita") · OPINIÃO (posição discutível
  com a própria experiência como evidência, sem hedge).
- **Escrever pro COMPRADOR, não pro par:** linguagem técnica atrai builder curioso;
  o dono de PME quer a segunda-feira dele de volta. Gate: o post fala do problema do
  nicho, não de IA em geral.
- **Hook = o dado mais específico/surpreendente do post inteiro** na primeira linha.
- **CTA suave só em post de PROVA (1-2×/semana);** os demais posicionam sem pedir.
- **Mix semanal de referência: 2 prova + 1 problema + 1 processo + 1 opinião** — o
  `/calendario` equilibra; a peça avulsa checa o que saiu nos últimos dias antes de
  repetir tipo.
- Sem número real → descrever a mudança observável; nunca inventar (regra da casa).

## 6. Entrega

- `legenda.md` com o bloco META completo (slug, formato, objetivo, mecanica, formula,
  capa, **estilo**, origem, status) + legenda + alt sugerido + nota de produção
  (o que rodou e o que não rodou — honesto).
- Apresentar: resumo da peça, as variações de capa com recomendação, e a pergunta
  única de decisão. Fechar apontando `/revisar`.

## 7. Aceite (a peça só está pronta se)

1. Estilo registrado e ≠ do carrossel anterior. 2. Copy passou nos 2 passes + busca
literal das proibições. 3. Orçamento de caracteres conferido antes do HTML. 4. QA
visual rodou com a tabela e fechou limpo. 5. META completo. 6. Nenhum dado sem fonte;
nenhuma promessa sem a pré-condição dita na peça.

---
*Origem: sessão Fable 5 de 2026-07-08 (carrossel spec-sheet "5 pedidos prontos").
Atualizar quando o /desempenho validar ou derrubar alguma dessas regras.*
