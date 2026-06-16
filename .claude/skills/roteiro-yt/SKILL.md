---
name: roteiro-yt
description: >
  Use para escrever roteiro de vídeo do canal YouTube — "/roteiro-yt", "escreve o
  roteiro desse vídeo", "roteiriza esse tema pro YouTube", "transforma isso num short",
  ou ao processar um item aprovado da fila em canal-youtube/pesquisa/fila.md. Escreve
  roteiro long-form (8-15min) e short (30-60s), na voz própria do canal, a partir dos
  moldes que o /formulas já mantém — não pesquisa de novo.
---

# /roteiro-yt — Escrever o roteiro do vídeo

Roteiro de vídeo não nasce do nada — nasce do molde que já provou funcionar (`/formulas`)
e da voz de quem vai narrar (`canal-youtube/voz-canal.md`). Esta skill só escreve; quem
pesquisa formato é o `/formulas` (Modo 1/2/4), quem decide tema é o dono ou a fila de
pesquisa.

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

## Passo 2 — Grounding técnico (só pilar "ensinar Claude Code do zero")

Antes de afirmar qualquer comportamento, comando ou feature do Claude Code no roteiro,
validar contra a documentação oficial atual (Claude Code muda rápido; conhecimento de
treino sem checar pode estar desatualizado). Mesmo cuidado do `claude-code-guide`. Claim
que não dá pra confirmar agora: ou tira do roteiro, ou marca pra confirmar antes de
gravar — nunca entra como fato sem checar.

## Passo 3 — Escrever o corpo (long-form)

Nesta ordem — **o corpo vem antes do hook**:

1. **Setup:** contexto mínimo pra entender o que vem (sem "hey galera/bem-vindo de
   volta").
2. **Pontos principais:** um bloco por ideia/demo, cada um com cue de tela:
   `[TELA: o que aparece — ex: terminal rodando claude code, zoom no diff]`. Toda frase
   serve um propósito (valor, curiosidade ou avançar a história) — frase de
   preenchimento não entra.
3. **Payoff:** a entrega da promessa do vídeo.
4. **CTA:** um pedido só (inscrever, comentar, ou próximo vídeo da série) — nunca
   acumular CTA.

Timestamp sugerido em cada bloco (ex: `[02:30]`), calculado pelo tamanho do texto a ~150
palavras/minuto de fala.

## Passo 4 — Escrever o hook (por último)

Com o corpo pronto, escrever a abertura: frase ≤10 palavras, sem credencial, sem "e aí
galera". Em ~20s precisa: validar o clique (confirmar que é sobre o que a pessoa
clicou), levantar a aposta (por que importa) e abrir um loop de curiosidade que só o
Payoff fecha.

## Passo 5 — Marcar cortes pra short

Releer o roteiro e marcar o(s) trecho(s) com a frase mais forte ou a demonstração mais
visual: `[CORTE-SHORT: mm:ss-mm:ss — razão do corte]`. Zero ou vários — sem mínimo
obrigatório.

## Passo 6 — Short standalone (quando não há long-form pra cortar)

Estrutura invertida: começa pelo **payoff/lição** no segundo 0-1 (não pela configuração).
Uma promessa só. 30-60s. Sem "hey galera", sem slow build. Termina com a mesma lição
reforçada ou um gancho pro canal.

## Passo 7 — Passar pela voz do canal

Aplicar `/escritor-br` usando **`canal-youtube/voz-canal.md`** — nunca `nucleo/voz.md` (é
voz de fala, não de copy escrita). Sem `voz-canal.md` preenchido, parar (ver
Pré-checagem).

## Saída

Salvar em `canal-youtube/roteiros/longa/<slug>.md` (ou `.../shorts/<slug>.md`):

```markdown
# <Título 1> | <Título 2> | <Título 3>

**Thumbnail-hint:** <frase curta pra capa>
**Pilar:** <pilar batido>
**Molde usado:** <nome da fórmula em docs/formulas.md, ou "nenhum — primeiro do canal">

## Roteiro

[hook]
...
[CORTE-SHORT: 04:12-04:48 — a frase mais forte]
...

## Descrição (SEO YouTube)
<descrição otimizada, primeiras 2 linhas valem mais — aparecem antes do "mostrar mais">

## Tags
tag1, tag2, tag3...
```

## Regras

- Corpo antes do hook, sempre — hook calibrado no que já foi escrito, nunca no vácuo.
- Conteúdo real, nunca placeholder. Claim técnico não confirmado não entra (ver Passo 2).
- Molde é esqueleto, nunca cópia — frase, tema ou thumbnail do vídeo de referência jamais
  entram no roteiro novo.
- Voz do canal (`voz-canal.md`), nunca a voz de copy (`nucleo/voz.md`) — são fala e
  escrita, registros diferentes.
- Sem long-form pra cortar, short standalone segue a estrutura invertida (Passo 6) — não
  é "long-form encurtado".
