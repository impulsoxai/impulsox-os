---
name: provas
description: >
  Use quando o negócio precisa de prova social real — "/provas", "não tenho depoimento",
  "como peço avaliação?", "transforma esse feedback em caso", "monta meu banco de
  provas", ou sempre que outra skill recusar uma peça por falta de material real
  (prova social, antes/depois, caso). Monta e mantém o banco de provas do negócio:
  roteiro pra pedir, formatação do material bruto e registro de autorização de uso.
---

# /provas — O banco de provas sociais

O sistema inteiro tem uma regra dura: prova só real. Esta skill é a linha de produção
dessa matéria-prima — sem ela, a regra vira bloqueio; com ela, cada cliente satisfeito
vira insumo de post, anúncio e página.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda do **degrau 0** (a voz calibra o pedido, mas não trava). Quanto mais material o
usuário tiver, mais rico o banco.

## O que ler antes

- `nucleo/voz.md` e `nucleo/negocio.md` — o pedido de depoimento sai na voz da marca
- `nucleo/provas.md` — o que já existe no banco (não pedir de novo o que já tem)

## Tipos de prova (do mais forte ao mais fácil)

1. **Caso com número** — situação antes → o que foi feito → resultado mensurável
2. **Depoimento espontâneo** — texto ou áudio do cliente, com nome
3. **Avaliação pública** — Google, redes (alimentada pela `/local`)
4. **Print de resultado** — mensagem de agradecimento, métrica, foto da entrega
5. **Volume** — "N clientes desde [ano]", "N entregas em [região]" (fato contável)

## Fluxo 1 — Garimpar o que já existe

Primeira rodada é arqueologia, não pedido:
> "Antes de pedir depoimento novo: você tem prints de mensagens de clientes agradecendo?
> Avaliações no Google? Algum número que dá orgulho (clientes atendidos, anos, entregas)?
> Joga tudo aqui ou em `dados/provas/` que eu organizo."

Cada achado entra no banco já classificado por tipo e status de autorização.

## Fluxo 2 — Pedir do jeito certo

O segredo do depoimento é o **momento**: logo após uma entrega que deu certo, nunca em
massa pra base fria. Entregar ao usuário:

1. **A mensagem de pedido** (WhatsApp, na voz da marca, 3-4 linhas): específica sobre o
   que foi entregue, fácil de responder ("pode ser áudio mesmo"), sem formulário longo.
2. **As 2-3 perguntas que geram caso** (não "gostou?"): "como era antes?", "o que mudou
   na prática?", "o que diria pra quem está em dúvida?".
3. **O lembrete de timing**: pedir no pico de satisfação — entrega concluída, problema
   resolvido, elogio espontâneo recebido.

## Fluxo 3 — Lapidar o bruto

Áudio transcrito ou texto corrido vira prova utilizável:
- **Depoimento:** cortar sem distorcer — manter as palavras do cliente (a imperfeição
  é o que soa verdadeiro), tirar só o irrelevante. Nunca "melhorar" colocando palavra
  que o cliente não disse.
- **Caso:** montar na espinha do `docs/persuasao.md` (antes → o que foi feito → depois
  com número), confirmando os fatos com o usuário.
- Registrar a origem de cada prova (print salvo em `dados/provas/`, data, contexto).

## Autorização — inegociável

Prova só vai pra peça pública com consentimento registrado:
- Pedir junto com o depoimento: "posso usar com seu nome no nosso site/redes?"
- Status no banco: **autorizada com nome** / **autorizada anônima** ("cliente do setor
  X") / **uso interno** (proposta um-a-um) / **pendente** (não usar em nada público)
- LGPD: nome, foto e dado identificável só com o "sim" do cliente. Na dúvida, anônima.

## O banco — `nucleo/provas.md`

Cada prova é um bloco: tipo, o material em si, origem, data, status de autorização e
onde já foi usada (evitar a mesma prova em tudo). Quem consome: `/post` (módulos FALA
e HISTÓRIA), `/linkedin`, `/ads-meta` (criativo de prova), `/pagina`, `/lancar-produto`,
`/proposta` e `/relatorio`.

## Regras

- Nunca inventar, exagerar ou "compor" depoimento de pedaços de clientes diferentes.
- Nunca usar prova com status pendente ou uso interno em peça pública.
- Incentivo por avaliação: nunca pagar por avaliação positiva (viola termos do Google
  e é propaganda enganosa). Pedir avaliação honesta pode; comprar nota, jamais.
- Banco vazio não trava peça — a peça muda de intenção (regra das skills de produção)
  e esta skill entra na fila como próximo passo sugerido.
