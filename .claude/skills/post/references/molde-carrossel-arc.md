# Molde: Carousel Arc + pipeline de design-system (Duncan Rogoff)

> Dissecado do vídeo "How I Use Claude Code to Make INSANE Instagram Carousels"
> (youtube.com/watch?v=jFAH0txMwiI, assistido em 2026-07-06, frames + transcript).
> Regra da casa: copiar a MECÂNICA, nunca o conteúdo nem a estética. A identidade é
> sempre a do cliente (marca/design-guide.md manda; este molde é estrutura).

## 1. O Carousel Arc — a espinha de 5 atos (frame 8:00~)

Estrutura fixa de narrativa do carrossel, cada ato com regras duras:

| Ato | Trabalho | Regras do slide |
|---|---|---|
| **HOOK** | prender a atenção | UMA frase forte + payoff prometido; zero contexto |
| **PAIN** | nomear a dor | nomeia o problema DIRETO; lista em X do que quebra |
| **STEPS** | mostrar o sistema | o MECANISMO que resolve; lista numerada 01/02/03 |
| **RESULT** | provar que funciona | número específico e grande; outcomes com checkmark |
| **JOIN** | dirigir a ação | preço + promessa de destravamento; keyword/CTA único |

Rodapé do molde dele (a função de cada ato em 2 palavras): GRAB ATTENTION → NAME THE
PAIN → SHOW THE SYSTEM → PROVE IT WORKS → DRIVE THE ACTION.

Mapeamento pro nosso sistema: HOOK sai de `docs/hooks.md` (2-3 mecânicas diferentes);
PAIN sai das dores da oferta (`nucleo/ofertas.md` tem "as dores" prontas por produto);
RESULT só com prova AUTORIZADA (`nucleo/provas.md`) — número inventado nunca; JOIN
respeita a régua de CTA da matriz (marca/CTA só no fim).

## 2. Anatomia do slide dele (frame 10:00~, slide-01 real)

- Fundo escuro atmosférico (gradiente radial sutil), NÃO chapado nem ruidoso.
- **Eyebrow label** pequeno em mono/caps no terço inferior ("CLAUDE CODE · SETUP") —
  categoriza antes do título.
- Título GRANDE em serif, 3 linhas máx, quebra de linha pensada ("Claude forgets you.
  Here's the 10-minute fix.") — tensão + solução na mesma frase.
- UMA mensagem por slide. 8 slides por carrossel (nosso padrão atual: 7 — ok, faixa 7-8).
- Densidade: slide de hook quase vazio; slides de meio com lista; nunca parágrafo.

## 3. O pipeline que faz a qualidade (a parte que NÓS vamos adotar)

Ordem dele — cada etapa alimenta a seguinte:

1. **Referência real primeiro** (Pinterest: busca "graphic design", "typography poster";
   salva 10-15 pins que têm a VIBE) → nosso equivalente: /premium-design captura DNA.
2. **Prompt-chave:** "turn this into a design system in an html file and a design md
   file" → sai `design-system.md` + showcase HTML navegável (paleta com REGRAS de uso
   por token — ex.: "accent: só um bloom por composição", "asymmetric composition:
   âncora à esquerda, piscinas de luz à direita", "film grain: textura atmosférica,
   sentida não vista").
3. **O design system vira LEI da skill** — todo slide obedece os tokens + regras
   editoriais (= nosso marca/design-guide.md + tokens.css, com um plus: regras de
   COMPOSIÇÃO por slide, não só cor/fonte).
4. **Imagem por IA com as regras do design system NO prompt** (ele usa Higgsfield):
   o prompt de imagem é construído a partir das regras ("void background #0A0A0B,
   azure-cyan volumetric glow, asymmetric: robô ancorado à esquerda...") — a imagem
   nasce DENTRO da identidade, não colada depois.
5. **Saída completa de uma vez:** 8 PNGs 1080x1350 renderizados em paralelo + legenda
   de IG + post de LinkedIn do mesmo tema (par IG+LI num comando — nós já fazemos em
   skills separadas; o ganho é oferecer o par por padrão).
6. Agendamento por ferramenta externa (ele: Blotato — nós já descartamos; nosso
   /publicar cobre).

## 4. O que adotar vs o que já temos

| Mecânica dele | Status no ImpulsoX-OS |
|---|---|
| Arco de 5 atos com regra por slide | ADOTAR como estrutura nomeada no /post (hoje a skill tem estrutura, mas não este arco com regra dura por ato) |
| Regras de COMPOSIÇÃO no design system (não só paleta) | ADOTAR — design-guide.md ganha seção "regras editoriais de composição" |
| Prompt de imagem IA derivado do design system | ADOTAR no /post (reel/imagem) — imagem nasce na identidade |
| Eyebrow label categorizando o slide | ADOTAR na anatomia do slide |
| Par IG+LinkedIn gerado junto | oferecer por padrão (skills já existem) |
| Pinterest como fonte de referência | já coberto (premium-design, acervo por nicho) |
| Blotato/agendador | descartado (decisão registrada) |

## 5. DNA visual do estilo "Concept Poster" (prints em alta, 2026-07-06 — estilo APROVADO pela dona como direção)

> A dona aprovou ESTA estética como direção do carrossel ImpulsoX — mecânica abaixo,
> sempre traduzida pras cores/fontes da marca do cliente (nunca as do Duncan).

- **Papel, não tela:** fundo em cor de papel com grão sutil; a peça parece um CARTAZ
  impresso, não um slide de PowerPoint.
- **Tipografia gigante condensada** em caixa-alta, preta no papel claro, leading
  apertado; a palavra-chave da frase pode virar a cor de accent. Contraste de escala
  brutal: display enorme + labels minúsculos, nada no meio.
- **UM accent só** (no dele: coral #E96A3C) usado com disciplina: uma palavra, barras,
  molduras, formas grandes. Nunca dois accents competindo.
- **Labels em MONO com prefixo `//`** ("// 01 — COVER", "DS NO. 02 / 05.27.26"):
  eyebrow no topo em mono espaçado, cor apagada — categoriza e dá cara de spec técnica.
- **Grid de painéis com moldura fina** (fio preto 1-2px): colunas alternando
  papel/accent/preto; rodapé em barra preta com texto mono claro.
- **Numerais gigantes** 01/02/03 como elemento gráfico (não só lista).
- **Detalhes editoriais:** texto vertical rotacionado na margem, setas →, carimbos/
  tickets, códigos de data. É o que dá o "feito por designer".
- **Ilustração flat vetorial** 2-3 cores quando entra (semáforo, personagem), nunca
  foto genérica.

**Tradução ImpulsoX (tokens.css):** papel-creme → dark `#06060d` + grão (`--grao`);
tipo preto → off-white `#f0ebe0` (Sora 800 caps); accent coral → dourado `#d4af37`
(regra: UMA palavra/elemento por slide); roxo `#7c3aed` = cor ESTRUTURAL (painéis,
numerais); labels mono → DM Mono em `--cor-texto-mudo`; molduras → fio dourado
(`--cor-borda`/`--cor-borda-forte`); barra de rodapé → superfície `#0e0e18` com mono.

## 6. O sistema de capas + a grade de feed (prints do Instagram real dele, 2026-07-06)

A capa NÃO é uma escolha única ("foto ou tipografia") — é um SISTEMA por formato. O
leitor aprende a ler o feed:

| Tipo de capa | Sinaliza | Quando usar |
|---|---|---|
| Rosto/foto + banner de texto | REEL (vídeo) | toda thumbnail de vídeo — rosto para o scroll |
| Tipografia pura (split de 2 cores) | carrossel de opinião/dado | tese forte, número forte |
| MASCOTE da marca | carrossel de lista/ferramentas | top N, roundup, tutorial |
| Foto de contexto + texto grande | carrossel de dor visual | quando a dor é uma CENA |

- **Grade pensada:** as capas alternam as 2-3 famílias de cor da marca em xadrez — o
  perfil visto de longe é um tabuleiro coeso. (Já prometemos "grade de feed pensada"
  no ofertas.md — isto é o COMO.)
- **Mascote = assinatura visual recorrente** (ImpulsoX tem: `marca/mascote/`) — o
  personagem aparece na capa de listas e dentro de slides; reconhecimento instantâneo
  no Explore.
- **Card-ticket de produto real:** ferramenta/produto vira cartãozinho (nome +
  descrição + prova social ex. estrelas) com seta desenhada apontando — o "produto
  real em mockup" com acabamento de cartaz.
- **Paginação `N/7` + seta gigante em TODO slide** — reduz drop-off no meio.
- **Último slide fixo: SAVE / SHARE / FOLLOW + @handle** — CTA de algoritmo (save/send).
  A VENDA fica na legenda, com keyword de comentário ("comenta X que eu mando no DM")
  — automação de DM só por ferramenta oficial/compliant, regra da casa.

## 7. Anti-padrões que o molde evita

- Slide com mais de uma ideia. — Parágrafo em slide. — CTA no meio do carrossel.
- Número redondo/vago no RESULT (tem que ser específico) — e na nossa casa: só com
  prova autorizada; sem prova, o RESULT vira demonstração de capacidade, nunca número
  inventado.
- Estética genérica de template: a identidade vem do design system do CLIENTE.

## 8. Catálogo de ESTILOS VISUAIS (rotação — não repetir sempre o mesmo)

> Decisão da dona (2026-07-08): o carrossel ImpulsoX tem MAIS DE UM estilo visual
> aprovado, rotacionados pra o feed não ficar monótono. O ARCO (§1) e as regras de
> slide (§2, §7) valem pra todos; o que muda é a pele. Regra de rotação: não usar o
> mesmo estilo em 2 carrosséis seguidos do mesmo perfil. Registrar o estilo usado no
> bloco META do `legenda.md` (campo `estilo:`) — o `/desempenho` valida qual performa.

### Estilo A — "Concept Poster" (cartaz impresso)
O do §5 acima. Papel + grão, display condensado caixa-alta, um accent, painéis com
fio, numerais gigantes, detalhes editoriais. Tradução ImpulsoX já definida no §5.

### Estilo B — "Spec Sheet" (folha de especificação técnica) — aprovado 2026-07-08
Dissecado de carrossel do @chase.ai (visto 2026-07-08). A peça parece uma FOLHA DE
ENGENHARIA/blueprint: grid de desenho técnico, marcas de registro, anotações de medida.
Mecânica (nunca as cores/fontes dele):

- **Fundo papel claro com GRID técnico visível** (linhas finas quadriculadas, tom
  apagado) — desenho técnico, não caderno escolar.
- **Marcas de registro de impressão** nos 4 cantos (cruzes `+` finas no accent) +
  **cota de medida** no topo ("⊢ 1080 PX ⊣") — o slide se auto-documenta como peça.
- **Moldura de metadados em MONO nos 4 cantos**: topo-esquerda etiqueta de estado em
  barra preta ("PROMPT 01", "FINAL 24 HOURS"), topo-direita código curto ("T-24H ▲"),
  rodapé-esquerda specs em mono minúsculo (3-4 linhas: modelo, versão, data), rodapé-
  direita paginação "SHEET 02 / 08" + "SWIPE →". A moldura é IDÊNTICA em todo slide —
  é ela que dá unidade ao carrossel.
- **Título em 2 linhas com hierarquia dura**: linha 1 display preto no papel; linha 2
  display claro DENTRO de tarja no accent (a tarja é o highlight). Sempre esse par.
- **Legenda de figura** sob o título, em mono: "FIG.2 — plan-for-opus.prompt" +
  fio horizontal curto. Numeração de figura avança ao longo do carrossel.
- **Card terminal escuro pro conteúdo copiável**: quando o slide entrega um prompt/
  código/receita, ele vai num cartão quase-preto estilo terminal — header mono
  ("PROMPT · FABLE 5" + botão "COPY" desenhado), corpo mono claro com **negrito nas
  palavras-chave**, cantoneiras no accent nos cantos do card. É o "card-ticket" do §6
  em versão técnica — o produto entregável do slide vira objeto.
- **Corpo de texto curto com 2-3 termos em negrito + 1 palavra no accent** — o olho
  varre só o marcado e entende o slide.
- **Comparação em par de cards**: opção atual = card preto sólido; alternativa = card
  só com contorno no accent; seta → entre eles (slide de antes/depois ou A vs B).
- **Mascote/ilustração 3D voxel/pixel** na capa (1 slide só) — objeto físico "de
  brinquedo" segurando a metáfora (relógio, timer). Entra na capa, não se repete.
- **Capa com adesivos/badges espalhados** (chips isométricos "24H", "5 PROMPTS", "RUN
  NOW") em volta do objeto central — densidade só na capa; slides internos são limpos.
- **Último slide = "YOUR MOVE"**: mesmo grid, quase vazio, recapitula a promessa em
  display + CTA de algoritmo (save/share/follow) — consistente com o §6.

**Tradução ImpulsoX (tokens.css):** manter a LÓGICA clara-técnica invertendo pro nosso
dark: fundo `#06060d` com grid técnico em linha `--cor-borda` a ~8% de opacidade; papel
→ superfície `#0e0e18` quando precisar de card claro; display Sora 800 caps em
`#f0ebe0`; tarja de highlight → dourado `#d4af37` com texto escuro (regra do accent
único mantida); cruzes de registro, cotas e cantoneiras em dourado; mono = DM Mono em
`--cor-texto-mudo`; card terminal = preto `#030308` com fio dourado; roxo `#7c3aed`
segue estrutural (barras de etiqueta, card sólido da comparação).

### Estilo C — "Editorial de Notícia" (newsjacking) — aprovado 2026-07-09
Nascido na peça "Anthropic/cobrança" (Opus, 2026-07-08; aprovado pela dona). É a pele
oficial de peça de NOTÍCIA (origem pulso-quente): cara de matéria de revista técnica,
urgência sem grito. Mecânica:

- **Fundo dark da marca** (sem grid técnico; grão sutil) — mais editorial, menos folha
  de engenharia que o Estilo B.
- **Header por slide:** esquerda mono "// NN · NOME-DA-SEÇÃO" (CAPA, O QUE ACONTECEU,
  POR QUE ISSO, O DETALHE, NO BRASIL, A JANELA, PRA GUARDAR, SUA VEZ) · direita a
  **etiqueta do ATO em mono apagado** (FONTE ▲, DOR ▲, VIRADA ▲, PONTE ▲, DADO ▲,
  RESUMO ▲, FECHO ▲) — o arco de 5 atos fica NOMEADO no canto de cada slide.
- **Título display gigante** (3-4 linhas), última palavra/palavra-chave na cor de
  acento + ponto final. FIG.n em mono colorido embaixo (numera ao longo da peça).
- **Ghost letter** gigante em contorno (AI, ≠, símbolo do slide) ancorando o canto
  inferior direito — preenche o vazio e assina o tema.
- **Quote-card** em bloco chapado da cor estrutural (roxo) com aspas grandes + fonte
  em mono ("// FONTE / ANO") — pra citação da notícia.
- **Versus cards** (lá fora × no Brasil) e **checklist numerado** com fio — herdados
  do Estilo B, mesma gramática.
- **Rodapé:** site à esquerda; em slide de dado/notícia, "FONTE: X / ANO" no lugar —
  **fonte nomeada no próprio slide é obrigatória em peça de notícia**.
- **Fecho:** recap "em 3 linhas" (guarda a punchline) + slide final com CTA chips
  (cheio + contorno + @handle); em newsjacking o CTA primário é ENVIAR.

### Regras do catálogo
- Estilo novo só entra aqui depois de aprovado pela dona (print → disseca mecânica →
  tradução em tokens da marca). Nunca improvisar um estilo não catalogado em peça real.
- Todo estilo obedece §1 (arco), §2 (1 ideia/slide), §6 (paginação, seta, slide final)
  e §7 (anti-padrões). Estilo é pele, não estrutura.
- Cliente de agência: o catálogo transfere a MECÂNICA; cores/fontes vêm sempre do
  `marca/design-guide.md` + `tokens.css` DO CLIENTE.
