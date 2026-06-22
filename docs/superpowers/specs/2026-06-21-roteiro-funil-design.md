# Design — Camada de funil (TOFU/MOFU/BOFU) na `/roteiro-yt`

> Spec da mudança na skill /roteiro-yt do template ImpulsoX-OS. ImpulsoX AI · 2026-06-21.

## O que é

A `/roteiro-yt` ganha uma **camada de funil**: classifica o vídeo em topo/meio/fundo de funil
(TOFU/MOFU/BOFU) e calibra pacote + roteiro conforme o estágio. Inspirado no CAM
(simpletechskills), que tuna o roteiro por intenção de funil. Base de dados na memória
`funil-conteudo-video` (pesquisa 2026: Wistia, Socialync, Funnel.io, neuentity).

**Agnóstica de nicho** — roda no clone de cada cliente, lê o núcleo DELE.

## Por que

Roteiro de topo e de fundo são DIFERENTES (topo segura com curiosidade e some o CTA; fundo
mostra prova e vende). Sem a camada de funil, todo vídeo sai com o mesmo molde — ou só atrai sem
vender, ou vende cedo e espanta. É a peça que o CAM tem e a esteira YT não tinha. Erro de
mercado provado: 50% fazem topo, só 14% fazem fundo ("balde sem fundo": view sem venda).

## O que muda na skill (camada POR CIMA, não reescrita)

### 1. Passo novo — "Estágio de funil" (após a pré-checagem, antes do pacote)

A skill **infere o estágio do tema e confirma com o dono**:
- Heurística de inferência:
  - **TOPO (TOFU)** — dor ampla / curiosidade / "erros que…", sem oferta nem prova no tema.
  - **MEIO (MOFU)** — "como funciona", "passo a passo", "X ou Y?", comparação, bastidores.
  - **FUNDO (BOFU)** — prova / oferta / "antes e depois" / case com número / depoimento.
- Apresenta ao dono em 1 linha que ENSINA o conceito: ex. "Isso parece TOPO — atrai quem nem
  sabe do problema, sem chamar pra comprar. Confirma ou ajusta (topo/meio/fundo)?". O dono
  confirma ou corrige. (Escada de Contexto: se o tema veio do `/tema-yt` já com estágio marcado
  no futuro, usar a marca; por ora o `/tema-yt` não marca, então sempre infere+confirma.)

### 2. Calibra pacote + roteiro pelo estágio (a régua, da memória `funil-conteudo-video`)

| | TOPO | MEIO | FUNDO |
|---|---|---|---|
| Hook | trend/dor relatável/opinião forte | promessa de aprender ("passo a passo") | prova/oferta ("antes e depois") |
| CTA | NENHUM ou só "salva/segue" | leve ("quer o guia?", link) | DIRETO (agende, compre, link na bio) |
| Tom | não-promocional | útil sem empurrar | promocional assumido + reasseguramento |
| Duração | curtíssimo (short 15-60s) | mais longo (tutorial 3-15min) | médio (demo/case ou walkthrough) |
| Prova | quase nenhuma | social proof leve, bastidores | PESADA (depoimento, antes/depois com nº) |
| Dado do núcleo | dor do cliente (`perfil.md`, `voz.md`, `negocio.md`) | expertise/objeções (`negocio.md`, `ofertas.md`) | oferta ATIVA + prova (`ofertas.md`, `provas.md`) |

Regra-mãe: **topo = dor do cliente · meio = expertise do negócio · fundo = oferta + prova.**

### 3. Salvaguarda do fundo (regra da casa)

**Sem prova AUTORIZADA em `provas.md`, o FUNDO vira MEIO** — a skill avisa ("não há prova
autorizada pra sustentar um vídeo de fundo; vou roteirizar como meio, que constrói confiança
sem prometer caso que não posso provar") e NÃO inventa depoimento/número. Peça pública só usa
prova autorizada (CLAUDE.md). Idem: fundo só vende oferta ATIVA (nunca FUTURA).

### 4. Orientação de mix (nota, não automação)

A skill lembra, quando fizer sentido, a régua **60-30-10** (60% topo / 30% meio / 10% fundo,
piso 40% topo, ≥1 fundo por ciclo) e o dado "só 14% fazem fundo" — pra o dono não cair no
balde-sem-fundo. É só orientação no texto: o `/calendario` não distribui o mix ainda (fase
futura). Marcar como suposição a calibrar com performance real.

## O que NÃO muda

Toda a parte existente continua intacta: retenção (30s iniciais + reforço no meio 50%), pacote
(título + thumbnail amarrados, "Quality CTR"), voz do canal (`voz-canal.md`), moldes do
`/formulas`, estrutura long-form vs short. O funil é uma lente que ajusta essas peças, não as
substitui.

## Arquitetura

Mudança 100% no `.claude/skills/roteiro-yt/SKILL.md` (documento — a skill é texto, sem código).
Sem script novo, sem teste de unidade (skill é prompt/processo, não função pura). A memória
`funil-conteudo-video` é a fonte de dados que o SKILL.md referencia/resume.

## Critério de sucesso

Ao roteirizar, a skill: (1) infere e confirma o estágio com o dono em linguagem simples; (2)
ajusta hook/CTA/tom/prova/duração pela régua do estágio; (3) puxa o dado certo do núcleo por
estágio; (4) rebaixa fundo→meio sem prova autorizada; (5) mantém tudo que já fazia (retenção,
pacote, voz). Funciona pra qualquer nicho (lê o núcleo do clone).

## Fora de escopo (fase futura)

- `/calendario` distribuir o mix 60-30-10 e marcar cada tema (decisão de estratégia). Quando
  vier: calendário marca, /roteiro-yt lê a marca (Escada de Contexto).
- Métrica de funil no `/desempenho-yt` (medir conversão do fundo vs alcance do topo).
