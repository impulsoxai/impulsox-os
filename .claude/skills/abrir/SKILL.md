---
name: abrir
description: >
  Use no começo de uma sessão de trabalho pra carregar o contexto do negócio e ver onde
  as coisas estão — "/abrir", "começar", "bom dia", "o que temos pra hoje", "abre o
  sistema", ou no primeiro turno depois de um tempo sem mexer. Lê o núcleo, anuncia o
  degrau da Escada de Contexto e o foco do mês, e mostra o que está pendente — em poucas
  linhas, sem relatório.
---

# /abrir — Abertura de sessão

Primeiro comando do dia. Carrega o contexto e devolve uma síntese curta pra começar a
trabalhar sabendo de três coisas: quem é o negócio, em que degrau da Escada ele está, e o
que está pendente. Não é relatório — é o "bom dia" do sistema.

Autoria: ImpulsoX AI. Conteúdo original.

> Esta skill é só instrução: lê arquivos e resume. Não gera nem roda código.

## O que ler antes

- `nucleo/negocio.md` — quem é o negócio, em uma linha
- `nucleo/foco.md` — prioridade do mês, prazos, sazonalidade
- `nucleo/voz.md` — só pra resumir o tom em 3-4 palavras
- `nucleo/escada.md` — **o degrau atual e o que falta confirmar** (é o que diferencia esta
  skill de uma abertura genérica)
- `nucleo/perfil.md` — se existir, o tipo de negócio (molda o que sugerir como próximo passo)
- `producao/calendario/<mês-atual>.md` — se existir, o que está pendente vs. publicado
- `nucleo/aprendizados.md` — só pra puxar 1 padrão recente, se houver

No modo agência, quando a sessão está aberta dentro de `clientes/<nome>/`, ler o núcleo
**desse cliente**, não o da raiz.

## Workflow

### Passo 1 — Conferir se há o que abrir

Se `nucleo/negocio.md`, `voz.md` ou `foco.md` ainda estão em placeholder (vazios), não
fingir contexto. Responder:

> "O núcleo ainda não foi preenchido. Rodo o `/plugar` pra ligar o sistema?"

E parar. Sistema sem núcleo não tem o que abrir.

### Passo 2 — A síntese (curta, formato fixo)

Se o núcleo está preenchido, devolver UMA mensagem enxuta:

```
[Nome do negócio] — [o que faz em 5-8 palavras]
Degrau [n] da Escada · [o que esse degrau permite, em meia linha]
Foco do mês: [prioridade do foco.md, uma frase]
Tom: [3-4 palavras]

Pendente: [o que está aberto — peças não publicadas do calendário, suposição a confirmar,
medição do mês passado não feita; no máximo 3 itens]

O que vamos fazer?
```

Regras da síntese:
- Cabe em ~8 linhas no terminal. Se passar disso, está virando relatório — cortar.
- O **degrau da Escada** sempre aparece — é a informação que orienta o que o sistema pode
  afirmar hoje e o que ainda é suposição.
- "Pendente" só lista o que tem ação real. Sem pendência — escrever "Nada pendente — campo
  livre."
- Não listar quais arquivos foram lidos. Não confirmar leitura. Só usar o contexto.

### Passo 3 — Sugerir o próximo passo certo (uma linha, opcional)

Quando há um próximo passo óbvio dado o estado, oferecer **um** só, calibrado pelo perfil:

- Degrau < 3 e sem entrevista → "Vale subir o contexto: rodo o `/plugar` completo?"
- Calendário do mês não existe → "Quer que eu monte o `/calendario` do mês?"
- Mês anterior fechou sem medição → "Antes de planejar, mede o mês passado? (`/desempenho`)"
- Suposição antiga ainda marcada "a confirmar" → apontar qual e perguntar se confirma.
- Perfil **criador** com calendário vencido → puxar a cadência ("faz [X] dias do último post").

Nunca empilhar três sugestões. Uma, a mais valiosa pro estado atual, ou nenhuma.

## Regras

- Resposta curta sempre — esta skill perde a função se virar parede de texto.
- O degrau da Escada é obrigatório na síntese; o resto é resumo.
- Não rodar nenhuma outra skill automaticamente. `/abrir` só carrega e mostra; quem decide
  o próximo passo é o usuário.
- Se o `design-guide.md` estiver vazio, não mencionar aqui — só vira assunto quando uma
  skill visual for chamada.
- Não inventar pendência pra parecer útil. Estado limpo é uma resposta válida e boa.

## Teste de aceitação (validar lendo, sem código)

1. Núcleo vazio → oferece `/plugar` e para. Não inventa contexto.
2. Núcleo cheio → síntese de ≤8 linhas com o degrau da Escada visível.
3. Calendário com peças pendentes → aparecem em "Pendente"; calendário limpo → "Nada pendente".
4. Sessão dentro de `clientes/<nome>/` → resume o cliente, não a agência.
5. Sugere no máximo UM próximo passo, coerente com o degrau e o perfil.
