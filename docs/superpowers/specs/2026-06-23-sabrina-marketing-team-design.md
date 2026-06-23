# Incorporar inteligência do time de marketing da Sabrina — 4 ganhos cirúrgicos

> Data: 2026-06-23 · Produto: ImpulsoX-OS · Origem: artigo "Set Up Your AI Marketing
> Team in Claude (7 Free Skills)" de Sabrina Ramonov (sabrina.dev, 17/06/2026).

## Contexto

O artigo descreve um pack de 7 skills (content-coach, brand-brief, post-writer,
post-grader, post-scheduler, viral-hooks, repurpose) + o app Blotato. Lemos as 7
SKILL.md uma por uma. Veredito: o sistema dela é o **nosso fluxo principal, mais raso**.
Já ganhamos em profundidade (núcleo, Escada de Contexto, design premium, ads, GEO,
página R$5k). Mas 4 pedaços de inteligência valem incorporar — cirúrgico, sem inchar.

### O que NÃO adotamos (e por quê)

- **post-scheduler / Blotato** — Blotato é produto da própria Sabrina, concorrente do
  nosso `/publicar`, e manda credencial de redes sociais pra servidor externo. Choca com
  a regra "nunca arriscar a conta de um cliente por automação fora dos termos". Fora.
- **Os 100 templates literais do viral-hooks** — é o "repositório de 100 skills, AI slop,
  built for someone else's business" que a própria Sabrina avisa pra não usar. Metade tem
  tom de vendedor americano ("Don't scroll if...", "feel illegal to know") que choca com
  nossa `voz.md` (professor, não vendedor). Adotamos a TAXONOMIA, não os templates.
- **Nota numérica no `/revisar-pagina`** — Baymard/Nielsen: IA julgando UI por screenshot
  dá 72% de ruído. Nota 0-10 numa página visual é número inventado sem âncora. A página
  fica só com severidade (Blocker/Major/Cosmetic), como hoje.
- **content-coach, brand-brief, post-writer literais** — já cobertos e melhores em
  `/abrir`+roteamento, núcleo+`/plugar`+`/voz`, `/post`+`/linkedin`+`/copy`.

---

## Ganho 1 — Nota numérica no `/revisar` (só post/legenda orgânico)

### O que muda

O `/revisar` hoje devolve veredito categórico (APROVADA/AJUSTAR/REPROVADA) + achados, sem
número. Para peça de **social orgânico** (post, carrossel, reel, legenda), passa a devolver
**nota X/10 ponderada + veredito** — os dois somam. A nota é o motor do loop; o veredito é
o rótulo legível pro dono leigo.

**Anúncio pago e copy de página continuam com veredito categórico atual, intocados.**
Prioridades diferentes (política de plataforma, clareza da oferta, prova) não cabem na
ponderação Hook=50%.

### Scorecard (7 dimensões, ponderado)

| Dimensão | Peso | O que checa |
|---|---|---|
| Hook strength | **50%** | Primeiras 3-5 palavras param o scroll? Específico/surpreendente/polarizador? Passa como tweet sozinho? Sem throat-clearing. |
| Curiosidade + especificidade | 10% | Número/nome/momento real vs genérico. Abre questão e resolve. |
| Carga emocional | 10% | Provoca sentimento forte (surpresa, indignação, reconhecimento)? Sem emoção não viaja. |
| Shareability | 10% | O leitor marcaria alguém / salvaria / mandaria? Motivo específico. "Informativo" não conta. |
| Voice match | 10% | Soa como a `voz.md` da marca? Tem ponto de vista ou poderia ser qualquer IA? |
| Polaridade | 5% | Diz algo discutível? Dá pra concordar OU rebater? Puxa do Wedge (Ganho 2). |
| Fit de plataforma | 5% | Tamanho/hook/hashtag certos. Convida a métrica que a plataforma premia (matriz do Ganho 3). |

**Implicação do Hook=50%:** hook 4/10 com resto perfeito teto ~7; hook 10/10 com resto
mediano ~7,5. Post abaixo de 8 quase sempre = reescrever o hook.

### Auditoria de voz (pass/fail, penaliza a nota)

Cada falha subtrai 0,5 da nota final (teto −3): travessão, contração ausente,
número por extenso, voz passiva, filler (really/very/just/literalmente/etc. → equivalentes
PT do `/escritor-br`), abertura-filler, contagem de hashtag fora do limite da plataforma.

### Regras

- **"10 não existe. 8 é forte. 9 quase nada a consertar. Harsh but fair."** Nota falsa
  alta custa mais que crítica honesta.
- Loop: nota < 8 → AJUSTAR pela skill de origem → re-graduar. Máx 2 rodadas (regra atual
  do `/revisar` preservada); 3ª divergência, o dono decide.
- Top 3 fixes (quote → por que dói → fix exato) — formato já existente no `/revisar`,
  preservado.
- O agente `revisor-marketing` recebe o scorecard como parte das instruções (a régua das
  7 dimensões + auditoria). Ele continua julgando, não reescrevendo.

### Arquivos tocados
- `.claude/skills/revisar/SKILL.md` — seção de scorecard para social orgânico.
- agente `revisor-marketing` (definição) — régua das 7 dimensões + auditoria de voz.

---

## Ganho 2 — Campo "Wedge" em `nucleo/negocio.md`

### O que muda

O brand-brief da Sabrina chama a "Strong Opinion / Wedge" de **"single biggest viral
fuel"**: a crença contrária do dono que o setor rebateria. Diferencial ("o que faço
melhor") ≠ wedge ("a opinião polêmica que divide a audiência"). Não temos campo explícito.

Adiciona campo **"Opinião contrária / Wedge"** em `nucleo/negocio.md` — posicionamento
estratégico, vive junto com diferenciais mas como campo próprio.

### Captura e consumo

- **Captura:** pergunta-wedge entra na entrevista do `/plugar` e do `/voz`. Se o dono
  trava ("não tenho opinião"), empurrar: "que hábito comum do seu setor você acha erro?
  que conselho comum você ignora?" — pegar algo específico, mesmo pequeno. Se ainda
  travar, marcar como pendência (degrau da Escada), não inventar.
- **Consumo:** `/post`, `/formulas`, `/calendario`, `/repurpose` leem o Wedge pra alimentar
  ângulos polarizadores (post "todo mundo erra X", contrarian take). Alimenta também a
  dimensão Polaridade do Ganho 1.

### Arquivos tocados
- template `nucleo/negocio.md` (estrutura) — campo novo.
- `.claude/skills/plugar/SKILL.md` — pergunta-wedge na entrevista.
- `.claude/skills/voz/SKILL.md` — pergunta-wedge na entrevista longa.
- `.claude/skills/post/SKILL.md`, `formulas/SKILL.md`, `calendario/SKILL.md` — ler o Wedge.

---

## Ganho 3 — Matriz CTA×plataforma + protocolo de hook (`/post` + `/formulas`)

### Matriz CTA × plataforma × métrica

Cada plataforma premia uma métrica; o CTA mira aquela métrica. Reforça o "send é o
default" da auditoria de 2026-06-22 (não substitui — complementa por plataforma).

| Plataforma | Premia mais | Tipo de CTA |
|---|---|---|
| LinkedIn | Comentário (~2x peso vs like) | Pergunta polarizadora, "o que você adicionaria?" |
| Instagram (feed) | Save, depois share/send | "Salva isto pra...", "Manda pra alguém que..." |
| Instagram (Reels) | Completion, depois save | Texto na tela + "salva pra depois" |
| TikTok / Reel | Watch-time / completion | Hook nos primeiros 1,7s; texto na tela "espera o final" |
| X / Threads | Reply (peso alto vs like) | Take polarizador, "me diz que tô errado" |
| Facebook | Share | "Marca alguém que precisa ver isto" |

Vai pro `/post` (seção CTA por plataforma) — convive com a regra send-default.

### Protocolo de iteração de hook

O hook é ~50% do desempenho. Escrever o hook PRIMEIRO e reescrever 3-5x antes do corpo:
1. 3 variações de hook (categorias diferentes).
2. **first-3-words test:** as 3 primeiras palavras sozinhas criam curiosidade/surpresa?
   ("Aqui está o que eu" → falha; "Testei 47" → passa).
3. Primeira palavra = a mais forte (número/nome/surpresa na frente, cortar "então/hoje").
4. Passa como tweet sozinho? Se só faz sentido com o corpo, fraco.
5. Não soa IA. Sem abertura genérica.

Vai pro `/formulas` + `docs/frase-que-pega.md`.

### Taxonomia ângulo→categoria (ordenada por teto de viralização)

Adotar a INTELIGÊNCIA da taxonomia, não os 100 templates: Receipt (prova/número) >
Contrarian/Myth-Buster > Negative Frame (erro) > Stolen Lessons ("copiei X, resultado Y" =
nosso `/formulas`) > Curiosity Gap > Listicle > Secret > Audience Callout > Question >
Transformation > Speed > Urgency > Confession. Os moldes do topo (Receipt, Contrarian,
Stolen Lessons) batem com nossa regra "copiar a fórmula de quem performa". Adaptar ao
nosso tom (professor, não vendedor) via `/formulas`.

### Arquivos tocados
- `.claude/skills/post/SKILL.md` — matriz CTA×plataforma.
- `.claude/skills/formulas/SKILL.md` — protocolo de hook + taxonomia ordenada.
- `docs/frase-que-pega.md` — first-3-words test + primeira-palavra-mais-forte.

---

## Ganho 4 — Skill nova `/repurpose`

### O que faz

1 peça longa → semana de conteúdo multiplataforma. Mata o "o que posto hoje". Gap real
nosso (o mais próximo, `/shorts` e `/conteudo`, não fazem 1-longo→semana).

### Fluxo

1. **Entrada:** artigo, transcript de YouTube, newsletter ou script longo. Se a entrada é
   curta (< 1 parágrafo) → não é esta skill, manda pro `/post`.
2. **Carregar contexto:** núcleo (voz, ofertas ATIVAS, Wedge), `design-guide.md`. Sem
   núcleo, roda em degrau baixo e marca o que falta (Escada de Contexto).
3. **Extrair:** 1 tese central + 3-7 pontos de apoio (cada um forte o bastante pra virar
   peça) + todo ativo concreto (números, nomes, histórias, takes contrários). Resumir os
   temas em 2-3 linhas pro dono redirecionar — **não obrigar a aprovar outline longo.**
4. **Mapear no nosso mix:** IG (carrossel/post) + LinkedIn + Reel/Short + **TikTok**
   (roteiro short serve TikTok e Reels — mesmo formato vertical). Reusar tema entre
   formatos só quando o ÂNGULO muda. Sem X (quase não usamos).
5. **Gerar cada peça pela skill dona:** `/post` (IG), `/linkedin`, `/shorts`/roteiro
   (Reel/TikTok). Cada peça abre com hook do `/formulas` (protocolo do Ganho 3), variando
   a categoria no batch (anti-formulaico).
6. **Graduar:** cada peça de social orgânico passa pelo `/revisar` (nota do Ganho 1).
   Não entregar peça < 8/10 — loop no hook.
7. **Destino:** jogar as peças no `/calendario` (não no scheduler dela). O dono aprova e
   publica via `/publicar`.

### Regras

- **Anti-enchimento:** fonte magra demais pra N ângulos distintos → fazer MENOS peças
  fortes, nunca encher com peça fraca. (Princípio nosso, alinhado à honestidade.)
- **Peça pública só vende oferta ATIVA** (regra do CLAUDE.md) — roadmap/futuras fora.
- **Só conteúdo real** — nada inventado a partir do que não está na fonte.
- É MOTOR: nasce no template, desce via `/atualizar-motor`. Nunca instalar direto num clone.

### Posição no fluxo

Entre `/radar` e `/calendario`: 1 fonte longa alimenta o mês. Guiar pela esteira ao
terminar (apontar `/calendario` como próximo, esperar o sim).

### Arquivos criados/tocados
- `.claude/skills/repurpose/SKILL.md` — skill nova.
- `docs/mapa-de-skills.md` — posicionar `/repurpose` no fluxo (opcional/principal).
- `.claude/skills/radar/SKILL.md` — fecho "→ próximo passo" pode mencionar `/repurpose`.

---

## Critério de pronto

- `/revisar` devolve nota+veredito para post orgânico; anúncio/página intocados.
- `nucleo/negocio.md` tem campo Wedge; `/plugar` e `/voz` perguntam; consumidores leem.
- `/post` tem matriz CTA×plataforma; `/formulas` tem protocolo de hook + taxonomia.
- `/repurpose` existe, produz mix IG+LinkedIn+Reel/Short+TikTok via skills donas,
  gradua via `/revisar`, joga no `/calendario`.
- Tudo no template (motor), não em clone. Pronto pra `/atualizar-motor`.
