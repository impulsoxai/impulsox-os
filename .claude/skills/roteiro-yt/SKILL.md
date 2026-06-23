---
name: roteiro-yt
description: >
  Use para escrever roteiro de vídeo do canal YouTube — "/roteiro-yt", "escreve o
  roteiro desse vídeo", "roteiriza esse tema pro YouTube", "transforma isso num short",
  ou ao processar um item aprovado da fila em canal-youtube/pesquisa/fila.md. Escreve
  roteiro long-form (8-15min) e short (30-60s), com o pacote (título+thumbnail) que faz
  clicar, na voz própria do canal, a partir dos moldes que o /formulas já mantém. Classifica
  o vídeo por estágio de funil (topo/meio/fundo) e calibra hook, CTA e prova por estágio.
---

# /roteiro-yt — Escrever o roteiro e o pacote do vídeo

Vídeo no YouTube vende em duas etapas: primeiro o **pacote** (título + thumbnail) ganha o
clique, depois o **roteiro** segura quem clicou. As duas são uma coisa só — em 2026 o
algoritmo demove vídeo com clique alto e retenção baixa nos primeiros 30s ("Quality
CTR"). Por isso esta skill projeta o pacote e o roteiro amarrados: a promessa que faz
clicar é a mesma que o hook entrega.

Roteiro não nasce do nada — nasce do molde que já provou funcionar (`/formulas`) e da voz
de quem vai narrar (`canal-youtube/voz-canal.md`). Esta skill só escreve; quem pesquisa
formato é o `/formulas` (Modo 1/2/4), quem decide tema é o dono ou a fila de pesquisa.

Autoria: ImpulsoX AI. Conteúdo original.

## Pré-checagem

1. **`canal-youtube/voz-canal.md` existe e está preenchido?** Se não, parar e orientar
   `/voz --canal` primeiro — roteiro sem voz capturada sai genérico, igual copy sem
   `nucleo/voz.md`.
2. **Tema e pilar definidos?** Vem do pedido direto do dono, de um tema escolhido em
   `canal-youtube/temas/<mês>.md` (radar do `/tema-yt`), ou de um item de
   `canal-youtube/pesquisa/fila.md`. **Sem tema, rodar `/tema-yt` primeiro** — tema bom vem
   de demanda real, não se inventa. O tema do radar já vem com a fórmula sugerida E o **ângulo
   escolhido** (contraste A→B + método de prova + padrão de hook) — se veio do `/tema-yt`, usar
   esse ângulo como espinha do Passo 2 e do hook (Passo 5). Sem ângulo definido, seguir normal.
3. **Long-form ou short?** Se não foi dito, perguntar — muda a estrutura inteira (ver
   abaixo).

## Passo 0 — Estágio de funil (inferir e confirmar)

Antes de escrever, definir em que momento da jornada o vídeo entra — topo, meio ou fundo de
funil. Roteiro de topo e de fundo são DIFERENTES; sem isso, todo vídeo sai com o mesmo molde e
ou só atrai sem vender, ou vende cedo e espanta. (Base de dados: pesquisa de funil de vídeo
2026 — resumida abaixo.)

**Inferir do tema, depois confirmar com o dono** (ele pode não conhecer o conceito — explicar
em 1 linha):

- **TOPO (descoberta)** — tema é dor ampla / curiosidade / "os erros que…", sem oferta nem
  prova. Job: atrair quem nem sabe do problema. Ex.: "3 erros que travam seu resultado".
- **MEIO (consideração)** — tema é "como funciona", "passo a passo", "X ou Y?", comparação,
  bastidores. Job: construir confiança. Ex.: "Como funciona o atendimento, passo a passo".
- **FUNDO (conversão)** — tema é prova / oferta / "antes e depois" / case com número /
  depoimento. Job: converter. Ex.: "Cliente saiu de X e chegou em Y — veja como".

Apresentar assim (exemplo): *"Esse tema parece **TOPO** — atrai quem nem sabe do problema,
sem chamar pra comprar. Confirma, ou é meio/fundo?"*. O dono confirma ou corrige.

> Escada de Contexto: se um dia o tema vier do `/tema-yt` já com o estágio marcado, usar a
> marca. Por ora o `/tema-yt` não marca — então sempre inferir e confirmar aqui.

### Como o estágio calibra o pacote e o roteiro

Depois de definido o estágio, ele é a lente que ajusta os próximos passos (hook do Passo 5, CTA
do Passo 4, prova, duração). A régua (pesquisa 2026):

| | TOPO | MEIO | FUNDO |
|---|---|---|---|
| **Hook** | trend / dor relatável / opinião forte | promessa de aprender ("passo a passo", "como eu faço") | prova / oferta ("antes e depois", "ela usou e…") |
| **CTA** | NENHUM ou só "salva/segue" — não pede compra | leve ("quer o guia?", link, e-mail) | DIRETO (agende, compre, link na bio, urgência real) |
| **Tom** | não-promocional, entreter/educar | útil, sem empurrar | promocional assumido + reasseguramento |
| **Duração** | curtíssimo (short 15-60s, foco nos 3 primeiros segundos) | mais longo (tutorial 3-15min) | médio (demo/case 30s-2min, ou walkthrough 10-15min) |
| **Prova** | quase nenhuma | social proof leve, bastidores | PESADA (depoimento, antes/depois com número) |
| **De onde vem o conteúdo** | dor do cliente: `nucleo/perfil.md`, `nucleo/voz.md`, dor em `nucleo/negocio.md` | expertise: diferenciais em `nucleo/negocio.md`, objeções em `nucleo/ofertas.md` | oferta ATIVA em `nucleo/ofertas.md` + prova em `nucleo/provas.md` |

Regra-mãe: **topo = dor do cliente · meio = expertise do negócio · fundo = oferta + prova.**
Aplicar essa lente quando montar o pacote (Passo 2), o hook (Passo 5) e o CTA (Passo 4).

## Passo 1 — Ler os moldes (fórmula de quem já faz sucesso vem primeiro)

Ordem de leitura:
1. **`canal-youtube/formulas-video.md`** (se existir no clone) — fórmulas dissecadas de
   vídeos REAIS de maior view no nicho (ex.: Sabrina Ramonov, 1.4M seguidores). É a régua:
   copiar o MOLDE (hook, estrutura, título), nunca o conteúdo. A própria Sabrina ensina:
   "replique os primeiros 15s de um vídeo do nicho com +1M views — esse é seu hook."
2. `docs/formulas.md` filtrando Rede=YouTube — moldes gerais. Priorizar **validada aqui**;
   sem validada, usar **a testar**.

Não inventar estilo do zero (conduta do CLAUDE.md). Sem nenhum molde de vídeo, avisar e
sugerir rodar `/formulas` (Modo 2) ou dissecar um canal de sucesso antes.

## Passo 2 — Pacote primeiro-rascunho (a PROMESSA antes do roteiro)

O clique vem antes de tudo: se ninguém clica, retenção, watch time e lead não existem.
Antes de escrever uma linha do corpo, definir a **promessa do vídeo** — o que título e
thumbnail prometem juntos. Essa promessa é o contrato que o hook (Passo 5) vai honrar.

> Calibrar pela lente do Passo 0: no **topo**, o pacote promete descoberta/curiosidade (sem
> oferta); no **meio**, promete aprendizado concreto; no **fundo**, promete prova/resultado e
> pode nomear a oferta.

1. **Ângulo do título (rascunho):** a transformação ou descoberta que o vídeo entrega.
   Não é o tema ("Claude Code skills") — é a promessa ("Construí um sistema que posta
   sozinho — em uma tarde").
2. **Conceito de thumbnail (rascunho):** a imagem que para o dedo. Regras duras (Passo 8).
3. **A lacuna:** título + thumbnail juntos criam uma pergunta que só o vídeo responde —
   sem entregar a resposta na própria capa. O texto da thumbnail **não repete** o título;
   complementa.

Guardar esse rascunho — vai ser refinado no Passo 8 com o corpo já pronto, mas a promessa
trava aqui pra o roteiro não fugir dela.

## Passo 3 — Grounding técnico (só pilar "ensinar Claude Code do zero")

Antes de afirmar qualquer comportamento, comando ou feature do Claude Code no roteiro,
validar contra a documentação oficial atual (Claude Code muda rápido; conhecimento de
treino sem checar pode estar desatualizado). Mesmo cuidado do `claude-code-guide`. Claim
que não dá pra confirmar agora: ou tira do roteiro, ou marca pra confirmar antes de
gravar — nunca entra como fato sem checar.

## Passo 4 — Escrever o corpo (long-form)

**Antes de escrever, montar o esqueleto (skeleton) + plantar o foreshadowing.** O método do
Paddy Galloway: um "one-pager skeleton" — os beats do vídeo, um por linha (setup → ponto 1 →
ponto 2 → … → payoff), pra ver o arco inteiro antes de escrever. Nesse esqueleto, **plantar
foreshadowing** nos 2 primeiros minutos: insinuar/prometer o que vem mais pra frente ("daqui a
pouco mostro o erro que custou X", "guarda esse número, ele volta no final"). Foreshadowing cria
expectativa EXATA e é o que mais segura a curva — é o que separa roteirista top de genérico.
Marcar no roteiro: `[FORESHADOW: o que é plantado aqui e onde paga]`.

Com o esqueleto pronto, escrever o corpo nesta ordem — **o corpo vem antes do hook**:

1. **Setup:** contexto mínimo pra entender o que vem (sem "e aí galera/bem-vindo de
   volta"). Curto — o drop mais íngreme da retenção é entre o segundo 10 e o 20.
2. **Pontos principais:** um bloco por ideia/demo, cada um com cue de tela:
   `[TELA: o que aparece — ex: terminal rodando claude code, zoom no diff]`. Toda frase
   serve um propósito (valor, curiosidade ou avançar a história) — frase de
   preenchimento não entra.
   - **Pattern interrupt a cada 20-40s:** marcar uma quebra de padrão pra reerguer a
     curva de retenção — zoom, corte de tela, exemplo novo, lista rápida na tela, mudança
     de ritmo da fala. Anotar como `[INTERRUPT: o que muda]`. Tutorial sem variação
     visual sangra audiência mesmo com bom conteúdo.
   - **Open loops no meio (não só no hook):** abrir um loop ("daqui a pouco mostro o erro
     que quase derrubou tudo") e fechá-lo blocos depois. Tease um passo, entrega adiante —
     o efeito Zeigarnik segura quem ia sair. Marcar `[LOOP-ABRE: ...]` e `[LOOP-FECHA: ...]`.
   - **Reforço no ponto médio (~50%):** o SEGUNDO maior drop de audiência é no meio do
     vídeo, não só nos 30s. No ~50% marcar uma virada deliberada — mudar de narração pra
     demonstração, entrar um exemplo/caso, ou uma pergunta direta ao espectador. Anotar
     `[MEIO-50%: o que muda]`. É onde o vídeo perde quem estava "quase saindo".
   - **CTA de engajamento no meio (não só no fim):** um pedido leve ou retention-hook no
     miolo ("daqui a pouco o número que muda tudo" / "comenta aí qual você usaria"). Marcar
     `[CTA-MEIO: ...]`. Mantém o engajamento sem soar forçado.
3. **Payoff:** a entrega da promessa do pacote (Passo 2). O que o título prometeu, aqui
   se cumpre — explicitamente.
4. **CTA final + end screen:** um pedido principal só (inscrever / próximo vídeo da série) —
   nunca acumular. Nos **últimos ~20s**, marcar `[END-SCREEN: próximo vídeo + inscrever]` —
   é onde o YouTube encaixa os cards de fim que puxam pra mais um vídeo (segura a sessão).

Timestamp sugerido em cada bloco (ex: `[02:30]`), calculado pelo tamanho do texto a ~150
palavras/minuto de fala. Esses timestamps viram os **Chapters** da descrição (ver Saída).

## Passo 5 — Escrever a abertura (por último): hook + commitment hook

Com o corpo pronto, escrever os primeiros 30s — o trecho mais decisivo do vídeo. Dois
movimentos:

> O TIPO de hook vem do estágio (Passo 0): topo = dor relatável / curiosidade / opinião forte;
> meio = promessa de aprender; fundo = prova ou oferta. Não usar hook de venda em vídeo de topo.

1. **Hook (0-15s):** frase de abertura ≤10 palavras, sem credencial, sem "e aí galera".
   Confirma que o vídeo é sobre o que a pessoa clicou (honra o pacote do Passo 2) e abre
   a tensão. Hooks que prendem em 15s retêm ~65% até os 3min; sem isso, cai pra ~45%.
   **Intro = continuação literal do thumbnail:** o 1º frame/cena continua VISUALMENTE o que a
   capa prometeu (o mesmo objeto, cena, resultado ou pergunta que está na thumbnail). Quem clicou
   pela capa vê ela "ganhar vida" — fecha o gap clique→hook (é como o MrBeast mantém ~70% de
   retenção). Nunca abrir com logo/intro animada (o algoritmo lê como anúncio e derruba).
   Partir do **padrão de hook** que veio no ângulo do `/tema-yt` (um dos 9 de
   `docs/frase-que-pega.md` §2.5: Contradição, Especificidade, Tensão de tempo, POV como
   conselho, Confissão vulnerável, Pattern interrupt, Lista, Aviso de erro, How-to). Sem
   ângulo definido, escolher o padrão que melhor abre o contraste do vídeo.
2. **Commitment hook (15-30s):** dá o motivo de ficar até o fim — escolher um: lacuna de
   informação ("o passo 3 é o que ninguém faz"), prova de resultado (mostrar o fim antes),
   gancho narrativo, ou gancho de tutorial ("no final você sai com X rodando"). Até o
   segundo 30 a pessoa precisa saber o que vai ganhar e estar comprometida.

**Contrato Quality-CTR (inegociável):** o que o título e a thumbnail prometeram, o hook
entrega nos primeiros 30s. Clickbait-mismatch (prometer e não cumprir) destrói a confiança
e o algoritmo demove o vídeo. Se o hook não consegue honrar o pacote, o errado é o pacote —
voltar ao Passo 2 e ajustar a promessa, não inflar o hook.

**Benchmarks numéricos (alvo mensurável, não "retém bem"):** ~71% dos espectadores decidem ficar
ou sair nos **3 primeiros segundos** — o hook tem que firar aí. Retenção média (AVD) alvo: **≥70%
nos primeiros 30s** e **≥50% no vídeo todo** (long-form). Short: sweet-spot **31-60s** (decisão em
3s, payoff até o segundo 3). Esses números são a régua do `/desempenho-yt` na hora de validar.

## Passo 6 — Marcar cortes pra short

Releer o roteiro e marcar o(s) trecho(s) com a frase mais forte ou a demonstração mais
visual: `[CORTE-SHORT: mm:ss-mm:ss — razão do corte]`. Zero ou vários — sem mínimo
obrigatório.

## Passo 7 — Short standalone (quando não há long-form pra cortar)

Estrutura invertida: começa pelo **payoff/lição** no segundo 0-1 (não pela configuração).
Uma promessa só. 15-30s (curto retém mais; máx 60s). Sem "e aí galera", sem slow build.

Regras de short que a pesquisa 2026 prova decisivas:
- **Primeiros 1-3s decidem tudo** (swipe ou fica). Abrir com MOVIMENTO/mudança visual, não
  tela estática — e **texto grande no 1º frame** (`[1º-FRAME: <≤4 palavras de impacto>]`),
  pra prender quem assiste sem som.
- **Loop:** o fim conecta de volta no começo (a última frase puxa a primeira), pra o short
  reiniciar sem corte perceptível — replay aumenta a distribuição. Marcar `[LOOP-RE-WATCH:
  como o fim emenda no início]`.
- Uma lacuna de curiosidade aberta no 1º segundo, fechada no fim.

**Cardápio de moldes — escolher pelo JOB do short** (cada um é uma espinha testada; cruzar com o
estágio de funil do Passo 0):
- **HVC** (Hook → Value → CTA) — dica rápida, "como fazer X". O mais simples. Topo/meio.
- **PAS** (Problema → Agitação → Solução) — quando a dor do público é o gancho. Topo.
- **AIDA** (Atenção → Interesse → Desejo → Ação) — quando há oferta/venda no fim. Fundo.
- **PSP** (Problema → Solução → Prova) — quando você TEM prova autorizada. Fundo.
- **BAB** (Before → After → Bridge) — transformação/antes-depois (a ponte = como chegar lá). Fundo.
- **PASTOR** (Problema → Amplificação → Story → Transformação → Oferta → Resposta) — narrativa de
  venda mais longa (curta-média), quando o caso vende sozinho. Fundo.
Default: HVC pra ensinar, PAS pra atrair, BAB/PSP pra provar. O molde dá a espinha; a voz e o
conteúdo são sempre do canal.

## Passo 8 — Refinar o pacote (título + thumbnail) com o corpo pronto

Voltar ao rascunho do Passo 2 e fechar o pacote sabendo o que o vídeo de fato entrega.

**Títulos — gerar 15-20, selecionar os 3 melhores.** O método nº1 do Paddy Galloway (estrategista
de 50bi+ views): escrever MUITOS títulos e escolher, porque o clique é upstream de toda retenção —
CTR é metade do jogo. Rascunhar 15-20 ângulos (curiosidade, número, contraste, dor, "como", erro,
resultado), depois cravar os **3 melhores** pra A/B. Cada um cria uma lacuna de curiosidade junto
com a thumbnail (a combinação faz a pergunta; nenhuma das duas entrega a resposta sozinha).
Concreto > vago. Sem promessa que o vídeo não cumpre (ver contrato Quality-CTR).

**Conceito de thumbnail** — aqui o `/roteiro-yt` projeta SÓ o conceito (sujeito, texto,
contraste); quem GERA a capa e pontua é a **`/thumbnail`** (Four C's + crivo de CTR), na
edição ou avulsa. Regras duras do conceito (pesquisa 2026):
- **1 sujeito dominante.** Uma coisa que para o dedo, não uma colagem.
- **3-5 palavras de texto, no máximo** — bold, sans-serif, legível no mobile (a maioria
  assiste no celular). O texto **complementa** o título, não repete.
- **Emoção no rosto** quando houver rosto — expressão (surpresa, foco, alívio) dá +20-30%
  de CTR vs rosto neutro. Faceless: o sujeito é a tela/resultado, com a mesma força.
- **Alto contraste** — sujeito claro sobre fundo escuro ou cores complementares. Contraste
  importa mais que a paleta. Tem que funcionar em miniatura.
- **Consistência de marca** — mesma família de cor/fonte/estilo em todas as capas do canal
  (usar `marca/design-guide.md` e `marca/tokens.css`). Estilo consistente dá +15-20% de
  CTR com inscritos.

## Passo 9 — Passar pela voz do canal

Aplicar `/escritor-br` usando **`canal-youtube/voz-canal.md`** — nunca `nucleo/voz.md` (é
voz de fala, não de copy escrita). Sem `voz-canal.md` preenchido, parar (ver
Pré-checagem). Vale pro roteiro E pros títulos — título genérico não tem a voz do canal.

## Saída

Salvar em `canal-youtube/roteiros/longa/<slug>.md` (ou `.../shorts/<slug>.md`):

```markdown
# Pacote

**Títulos (3):**
1. <título — a lacuna que ele abre>
2. <título>
3. <título>

**Thumbnail:**
- Sujeito: <o que domina a imagem>
- Texto na capa (≤5 palavras): <não repete o título>
- Emoção/foco: <expressão ou resultado em destaque>
- Contraste/cor: <sujeito x fundo, dentro da marca>

**A lacuna:** <por que título + thumbnail juntos fazem clicar — a pergunta que abrem>
**Pilar:** <pilar batido>
**Molde usado:** <nome da fórmula em docs/formulas.md, ou "nenhum — primeiro do canal">

## Roteiro

[00:00] [hook — ≤10 palavras]
[00:08] [commitment hook — motivo de ficar]
[00:30] [setup]
...
[INTERRUPT: corta pra terminal]
[LOOP-ABRE: o erro que quase derrubou]
...
[CORTE-SHORT: 04:12-04:48 — a frase mais forte]
[LOOP-FECHA: aqui está o erro]
...
[MEIO-50%: vira pra demonstração]
[CTA-MEIO: comenta qual você usaria]
[payoff — cumpre a promessa do pacote]
[CTA — um só]
[END-SCREEN: próximo vídeo + inscrever]

## Descrição (SEO YouTube) — 3 blocos, ~250 palavras
<Bloco 1 — gancho nos primeiros ~150 caracteres (aparece antes do "mostrar mais"):
 reescreve a promessa do vídeo com a palavra-chave principal logo no começo.>

<Bloco 2 — Chapters (capítulos). Vira "Key Moments" na busca do Google e +~11% de retenção.
 Regras: 1º timestamp É 00:00, mínimo 3 capítulos, em ordem. Derivados dos timestamps do roteiro:>
00:00 <gancho/intro>
00:30 <primeiro ponto>
0X:XX <...>

<Bloco 3 — links + hashtags: link do canal/oferta + 3 a 5 hashtags relevantes (mais que isso
 o YouTube classifica como spam).>
#claudecode #ia #<terceira>

## Tags
8 a 12 tags relevantes (mistura de amplas e de nicho). YouTube hoje pune tag que não bate com
o conteúdo — nada de encher com termo irrelevante.
tag1, tag2, ... (8-12)
```

## Iteração de pacote (amarra no /desempenho-yt)

Quando o canal tiver dados: CTR abaixo de ~4% nas primeiras 48h = o público não respondeu
ao pacote — repacote (novo título e/ou thumbnail), não mexer no vídeo. Os 3 títulos servem
pra teste A/B. O `/desempenho-yt` mede a RETENÇÃO (sinal #1) contra o benchmark da faixa e
marca a fórmula como validada/não funciona no `formulas-video.md`; padrão que funcionou vai
pro `nucleo/aprendizados.md` e ganha prioridade no próximo roteiro.

## Repurpose multiplataforma (create once, optimize 3x)

O mesmo roteiro/short rende em várias plataformas — mas NÃO é o mesmo arquivo copiado. Adaptar o
que cada algoritmo premia:
- **TikTok:** caption mais longa (até ~2.200 chars) com palavras-chave (TikTok indexa a caption
  pra busca); tom mais solto.
- **Reels (Instagram):** caption curta + gancho; hashtags poucas e relevantes (ver `/post`).
- **Shorts (YouTube):** keyword no INÍCIO do título e da descrição (o Shorts puxa por busca);
  título ≤ ~40 chars.
- **Sempre:** exportar SEM marca d'água de outra plataforma (TikTok/CapCut watermark derruba o
  alcance pelo Originality Score). Reusar o mesmo corte de vídeo, trocar só caption/título/tags.
Quando o roteiro vira short, gerar de uma vez as 3 versões de caption (TikTok/Reels/Shorts).

## Regras

- Pacote (título+thumbnail) é decisão central, não rabicho — projetado cedo (Passo 2),
  fechado no fim (Passo 8). O clique é upstream de tudo.
- **Fundo sem prova autorizada vira meio.** Vídeo de FUNDO precisa de prova real e AUTORIZADA
  (`nucleo/provas.md`) e de oferta ATIVA (`nucleo/ofertas.md`). Sem prova autorizada, NÃO
  inventar depoimento/número — avisar o dono e roteirizar como MEIO ("não há prova autorizada
  pra sustentar um vídeo de fundo; vou como meio, que constrói confiança sem prometer caso que
  não posso provar"). Peça pública só usa prova autorizada e só vende oferta ATIVA (CLAUDE.md).
- **Mix de funil (orientação, não trava):** a régua de partida é **60% topo / 30% meio / 10%
  fundo** (piso 40% topo, ao menos 1 fundo por ciclo). O erro comum do mercado é falta de fundo
  (só ~14% dos criadores fazem fundo) — não excesso de venda. Lembrar isso ao dono quando ele
  só pedir vídeos de topo. (O `/calendario` ainda não distribui o mix — por ora é só nota; é
  suposição a calibrar com performance real.)
- **Contrato Quality-CTR:** o hook entrega o que o pacote prometeu, nos primeiros 30s.
  Sem clickbait-mismatch — o algoritmo de 2026 pune clique alto com retenção baixa.
- Corpo antes do hook, sempre — hook calibrado no que já foi escrito, nunca no vácuo.
- Conteúdo real, nunca placeholder. Claim técnico não confirmado não entra (ver Passo 3).
- Molde é esqueleto, nunca cópia — frase, tema ou thumbnail do vídeo de referência jamais
  entram no roteiro novo.
- Voz do canal (`voz-canal.md`), nunca a voz de copy (`nucleo/voz.md`) — são fala e
  escrita, registros diferentes.
- Sem long-form pra cortar, short standalone segue a estrutura invertida (Passo 7) — não
  é "long-form encurtado".
- **Retenção tem dois pontos críticos:** os 30s iniciais E o meio (~50%). Marcar reforço nos
  dois, não só na abertura.
- **SEO não é opcional:** todo long-form sai com Chapters (00:00, mín 3 — viram Key Moments no
  Google), descrição em 3 blocos, 3-5 hashtags e 8-12 tags relevantes. É distribuição grátis.
- Short vive ou morre nos **primeiros 1-3s** + **loop** — texto no 1º frame, fim que emenda no
  início.

---

**✓ Pronto:** roteiro (long-form ou short) + pacote (título+thumbnail) + SEO, na voz do canal · **→ próximo passo:** gravar e depois `/editar-video` — corta, normaliza o áudio e queima a legenda na gravação. Esteira de YouTube é opcional (em teste/beta) — só seguir quando o dono pedir, não é passo automático do fluxo principal. Se faltar `voz-canal.md` ou a fórmula (o que mais trava aqui), o sistema reorienta antes.
