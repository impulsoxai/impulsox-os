---
name: calendario
description: >
  Use quando o usuário quer saber O QUE postar e QUANDO — "monta meu calendário",
  "/calendario", "o que eu posto esse mês?", "cuida do meu Instagram", "planeja o
  conteúdo", ou quando ele claramente não sabe por onde começar no marketing. Gera o
  plano mensal de conteúdo (Instagram + LinkedIn) a partir do núcleo do negócio, pronto
  para as skills de produção executarem peça a peça.
---

# /calendario — O sistema decide o que postar

O dono do negócio não precisa saber marketing. Esta skill olha o negócio, o foco do mês
e decide: quais temas, em que formato, em que rede, em que dia. O resultado é um plano
que as skills de produção (`/post`, `/linkedin`, `/conteudo`) executam uma peça por vez.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Funciona a partir do degrau 1 (extração de site). Abaixo disso, pedir o mínimo:
"o que você vende e pra quem?" — e marcar o plano inteiro como rascunho a confirmar.
Com degrau 3+ (entrevista feita), o plano sai calibrado de verdade.

## O que ler antes

- `nucleo/negocio.md` — o que vende, pra quem, diferencial e a **Opinião contrária /
  Wedge** — os ângulos polarizadores do mês (post de posição, "todo mundo erra X") saem dela
- `nucleo/perfil.md` — o TIPO de negócio; o **"Mix do /calendario"** de lá substitui a
  proporção padrão desta skill (criador 45/30/10/15, PME local 35/30/15/20 etc.). Perfil
  `agencia` não fixa mix: usar o `perfil.md` do cliente cuja sessão está aberta
- `nucleo/foco.md` — prioridade do mês, sazonalidade, datas
- `nucleo/ofertas.md` — catálogo de ofertas; o **mix do mês é proporcional à prioridade
  comercial** de cada oferta (prioridade alta aparece mais no plano)
- `nucleo/voz.md` — tom (afeta o tipo de pauta que cabe)
- `nucleo/aprendizados.md` — o que a medição já provou que funciona pra este negócio;
  quando há aprendizado consolidado, ele **pesa mais que o padrão genérico** desta skill
  (ex: se "ensinar" salva 3x mais aqui, a proporção de intenções se ajusta a isso)
- `producao/` — o que já foi publicado (não repetir tema recente)
- `producao/radar/<mês>.md` — as ideias pesquisadas do mês (oferta, palavra-chave,
  pontuação). **Se não existir, oferecer rodar `/radar` antes** — calendário com radar
  sai embasado em demanda real; sem ele, sai do núcleo e marca as pautas como suposição.

## Como montar o plano

### 1. Volume honesto
Perguntar quanto o usuário consegue sustentar:
> "Quantas peças por semana cabem na tua rotina sem virar peso? Recomendo começar com
> 2-3 no Instagram e 1-2 no LinkedIn — constância vale mais que volume."
Nunca propor mais do que ele confirmar. Plano abandonado em duas semanas é pior que
plano modesto cumprido.

### 2. Mistura de intenções
Distribuir as peças do mês entre quatro intenções. A proporção vem do **"Mix do
/calendario"** do `nucleo/perfil.md` — cada tipo de negócio tem o seu (criador
45/30/10/15, PME local 35/30/15/20, profissional liberal 40/25/20/15). Sem `perfil.md`
preenchido, usar o padrão genérico abaixo:
- **Ensinar (40%)** — resolver dúvida real do cliente do negócio; é o que gera salvamento
  e compartilhamento, os sinais que o algoritmo mais valoriza em 2026
- **Provar (25%)** — resultado, bastidor, depoimento, antes/depois (só com material real)
- **Posicionar (20%)** — opinião e ponto de vista da marca; o que ela defende e critica
- **Vender (15%)** — oferta direta com chamada clara
Se o foco do mês é lançamento/data forte, subir Vender pra ~25% naquela janela.

Quando possível, dar ao mês um **fio condutor**: uma pergunta grande do nicho que as
peças respondem em pedaços (loop de série — ver `docs/persuasao.md`). Quem acompanha
volta pra próxima peça; o mapa intenção → gatilhos do playbook orienta a produção de
cada uma.

### 3. Formato por OBJETIVO (não por gosto)
O formato segue o que a peça precisa entregar — escolher pelo objetivo, não pelo hábito:
- **Alcance / descoberta → reel.** Reels dominam a descoberta no IG 2026 (é o formato que
  o algoritmo mais empurra pra não-seguidores). Pauta de topo de funil que precisa achar
  gente nova nasce reel.
- **Profundidade / salvamento → carrossel.** Carrossel é o que gera save e dwell time —
  conteúdo que ensina, lista, compara, dá passo a passo. É a espinha do "ensinar".
- **Posicionamento / frase → post único** (dado, opinião, bastidor).
- **Ritmo semanal de referência (IG):** **3-4 reels + 2-3 carrosséis por semana** ajusta-se
  ao volume que o dono sustenta — reel puxa alcance, carrossel sustenta autoridade.
- **LinkedIn:** texto pessoal com profundidade > link externo (algoritmo derruba post com
  link no corpo). Documento PDF para conteúdo educativo denso. Tom de pessoa, não de
  assessoria de imprensa.
- O mesmo tema pode render nas duas redes, mas **reescrito por rede** — nunca a mesma
  legenda copiada.

### 3b. Repurposing one-to-many — uma peça Hero gera várias derivadas
Não tratar cada linha do calendário como peça do zero. O padrão eficiente de 2026 é
**1 peça Hero → N derivadas**: a peça mais densa do mês (artigo do `/conteudo`, carrossel
forte, vídeo do dono) vira a fonte, e dela saem carrosséis recortados, reels de trechos,
cortes e posts de frase. Uma pesquisa boa, muitas peças — muda a economia da esteira.
No plano, marcar a peça Hero e as **derivadas** que descendem dela (ex.: "carrossel Hero:
5 erros ao contratar X" → "reel: o erro nº1" + "post: a frase do erro nº3"). A produção
puxa a Hero primeiro; as derivadas reaproveitam o material já feito.

Opcional — sobrepor **Hero/Hub/Hygiene (70-20-10)** ao mix de intenções: Hygiene (70%) é
o conteúdo de rotina que responde dúvida (boa parte do "ensinar"); Hub (20%) é a série
que constrói autoridade num tema; Hero (10%) é a peça grande que puxa alcance. Os dois
eixos convivem: intenção diz o PORQUÊ da peça, Hero/Hub/Hygiene diz o PESO dela na esteira.

### 4. Datas
Distribuir nos dias confirmados pelo usuário. Aproveitar a sazonalidade do
`nucleo/foco.md` (datas do setor, lançamentos). Não inventar "dia nacional de X" como
muleta — só datas que importam ao público do negócio.

## Saída

Salvar em `producao/calendario/<YYYY-MM>.md`:

```markdown
# Calendário — [Mês/Ano]
> Gerado em [data] · degrau de contexto [n] · [n] peças/semana combinadas

| Data | Rede | Formato | Intenção | Tema | Status |
|------|------|---------|----------|------|--------|
| 03/07 | IG | carrossel | ensinar | [tema específico] | pendente |
| ... |

## Por que estes temas
[2-4 linhas conectando os temas ao foco do mês — pro usuário entender a lógica]

## A confirmar
[suposições usadas, se degrau < 3]
```

Cada linha do calendário é executável: "produz a peça do dia 03/07" → a skill de
produção certa assume com tema e intenção já definidos. Ao publicar uma peça, marcar
o Status.

## Apresentar ao usuário

Mostrar o plano e explicar a lógica em linguagem simples (ele não sabe marketing — a
explicação é parte do produto). Pedir um OK geral, não aprovação linha a linha. Ajustar
o que ele apontar e salvar.

## Regras

- Tema específico, nunca genérico. "5 erros ao contratar [serviço] em [cidade]" sim;
  "dicas de [área]" não.
- Não repetir tema dos últimos 60 dias (conferir `producao/`).
- Sem promessa de resultado ("vai viralizar") — o plano organiza, não garante.
- Plano é vivo: no fim do mês, rodar `/desempenho` antes do próximo `/calendario` — os
  aprendizados que ela grava em `nucleo/aprendizados.md` calibram o ciclo seguinte. Se o
  mês fechou sem medição, sugerir a medição antes de planejar de novo.

---

**✓ Pronto:** plano mensal em `producao/calendario/<mês>.md`, peça a peça executável · **→ próximo passo:** `/post`, `/linkedin` ou `/conteudo` — cada linha do calendário vira peça pronta. Pré-requisito: radar do mês e núcleo; se faltar o radar, o sistema oferece rodar `/radar` antes pra embasar as pautas.
