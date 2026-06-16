---
name: roteiro-yt
description: >
  Use para escrever roteiro de vídeo do canal YouTube — "/roteiro-yt", "escreve o
  roteiro desse vídeo", "roteiriza esse tema pro YouTube", "transforma isso num short",
  ou ao processar um item aprovado da fila em canal-youtube/pesquisa/fila.md. Escreve
  roteiro long-form (8-15min) e short (30-60s), com o pacote (título+thumbnail) que faz
  clicar, na voz própria do canal, a partir dos moldes que o /formulas já mantém.
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
2. **Tema e pilar definidos?** Vem do pedido direto do dono, ou de um item de
   `canal-youtube/pesquisa/fila.md` que ele aprovou pra adaptar. Sem os dois, perguntar.
3. **Long-form ou short?** Se não foi dito, perguntar — muda a estrutura inteira (ver
   abaixo).

## Passo 1 — Ler os moldes

Ler `docs/formulas.md` filtrando entradas com Rede=YouTube. Priorizar **validada aqui**;
sem nenhuma validada, usar **a testar**. Não pesquisar de novo — se não houver molde
nenhum de YouTube, avisar e sugerir rodar `/formulas` (Modo 2) antes.

## Passo 2 — Pacote primeiro-rascunho (a PROMESSA antes do roteiro)

O clique vem antes de tudo: se ninguém clica, retenção, watch time e lead não existem.
Antes de escrever uma linha do corpo, definir a **promessa do vídeo** — o que título e
thumbnail prometem juntos. Essa promessa é o contrato que o hook (Passo 5) vai honrar.

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

Nesta ordem — **o corpo vem antes do hook**:

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
3. **Payoff:** a entrega da promessa do pacote (Passo 2). O que o título prometeu, aqui
   se cumpre — explicitamente.
4. **CTA:** um pedido só (inscrever, comentar, ou próximo vídeo da série) — nunca
   acumular CTA.

Timestamp sugerido em cada bloco (ex: `[02:30]`), calculado pelo tamanho do texto a ~150
palavras/minuto de fala.

## Passo 5 — Escrever a abertura (por último): hook + commitment hook

Com o corpo pronto, escrever os primeiros 30s — o trecho mais decisivo do vídeo. Dois
movimentos:

1. **Hook (0-15s):** frase de abertura ≤10 palavras, sem credencial, sem "e aí galera".
   Confirma que o vídeo é sobre o que a pessoa clicou (honra o pacote do Passo 2) e abre
   a tensão. Hooks que prendem em 15s retêm ~65% até os 3min; sem isso, cai pra ~45%.
2. **Commitment hook (15-30s):** dá o motivo de ficar até o fim — escolher um: lacuna de
   informação ("o passo 3 é o que ninguém faz"), prova de resultado (mostrar o fim antes),
   gancho narrativo, ou gancho de tutorial ("no final você sai com X rodando"). Até o
   segundo 30 a pessoa precisa saber o que vai ganhar e estar comprometida.

**Contrato Quality-CTR (inegociável):** o que o título e a thumbnail prometeram, o hook
entrega nos primeiros 30s. Clickbait-mismatch (prometer e não cumprir) destrói a confiança
e o algoritmo demove o vídeo. Se o hook não consegue honrar o pacote, o errado é o pacote —
voltar ao Passo 2 e ajustar a promessa, não inflar o hook.

## Passo 6 — Marcar cortes pra short

Releer o roteiro e marcar o(s) trecho(s) com a frase mais forte ou a demonstração mais
visual: `[CORTE-SHORT: mm:ss-mm:ss — razão do corte]`. Zero ou vários — sem mínimo
obrigatório.

## Passo 7 — Short standalone (quando não há long-form pra cortar)

Estrutura invertida: começa pelo **payoff/lição** no segundo 0-1 (não pela configuração).
Uma promessa só. 30-60s. Sem "e aí galera", sem slow build. Termina com a mesma lição
reforçada ou um gancho pro canal (loop de re-watch quando couber).

## Passo 8 — Refinar o pacote (título + thumbnail) com o corpo pronto

Voltar ao rascunho do Passo 2 e fechar o pacote sabendo o que o vídeo de fato entrega.

**Títulos — 3 opções:** cada uma cria uma lacuna de curiosidade junto com a thumbnail (a
combinação faz a pergunta; nenhuma das duas entrega a resposta sozinha). Concreto > vago.
Sem promessa que o vídeo não cumpre (ver contrato Quality-CTR).

**Conceito de thumbnail — regras duras (pesquisa 2026):**
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
[payoff — cumpre a promessa do pacote]
[CTA — um só]

## Descrição (SEO YouTube)
<descrição otimizada, primeiras 2 linhas valem mais — aparecem antes do "mostrar mais">

## Tags
tag1, tag2, tag3...
```

## Iteração de pacote (amarra na Fase 3 — /desempenho)

Quando o canal tiver dados: CTR abaixo de ~4% nas primeiras 48h = o público não respondeu
ao pacote — repacote (novo título e/ou thumbnail), não mexer no vídeo. Os 3 títulos servem
pra teste A/B. Padrão de pacote que funcionou vai pro `nucleo/aprendizados.md` e pesa no
próximo roteiro. (Enquanto a Fase 3 não existe, registrar o palpite; medir depois.)

## Regras

- Pacote (título+thumbnail) é decisão central, não rabicho — projetado cedo (Passo 2),
  fechado no fim (Passo 8). O clique é upstream de tudo.
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
