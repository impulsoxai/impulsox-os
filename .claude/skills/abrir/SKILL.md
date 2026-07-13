---
name: abrir
description: >
  Use no começo de uma sessão de trabalho pra carregar o contexto do negócio e ver onde
  as coisas estão — "/abrir", "começar o dia", "bom dia", "o que temos pra hoje", "abre o
  sistema", "onde paramos", ou no primeiro turno depois de um tempo sem mexer. (Primeira
  instalação do sistema é o `/plugar`, não esta.) Lê o núcleo, anuncia o
  degrau da Escada de Contexto e o foco do mês, e mostra o que está pendente — em poucas
  linhas, sem relatório.
---

# /abrir — Abertura de sessão

Primeiro comando do dia. Carrega o contexto e devolve uma síntese curta pra começar a
trabalhar sabendo de três coisas: quem é o negócio, em que degrau da Escada ele está, e o
que está pendente. Não é relatório — é o "bom dia" do sistema.

Autoria: ImpulsoX AI. Conteúdo original.

> Esta skill é só instrução: lê arquivos e resume. Não gera nem roda código — com UMA
> exceção só-leitura: o check de versão do motor (Passo 1.5), que roda `git fetch` e
> compara versões, nunca altera nada.

## O que ler antes

- `nucleo/negocio.md` — quem é o negócio, em uma linha
- `nucleo/foco.md` — prioridade do mês, prazos, sazonalidade
- `nucleo/voz.md` — só pra resumir o tom em 3-4 palavras
- `nucleo/escada.md` — **o degrau atual e o que falta confirmar** (é o que diferencia esta
  skill de uma abertura genérica)
- `nucleo/perfil.md` — se existir, o tipo de negócio (molda o que sugerir como próximo passo)
- `producao/calendario/<mês-atual>.md` — se existir, o que está pendente vs. publicado
- `nucleo/aprendizados.md` — só pra puxar 1 padrão recente, se houver
- `nucleo/provas.md` — só a **saúde do banco**: tem prova suficiente e variada pra vender? Se
  está vazio/magro ou a última captura é antiga, vira pendência ("banco de provas fraco —
  rodar `/provas` antes da próxima peça de venda"). Não listar as provas, só o estado.
- `producao/ideias/banco.md` — só o **cabeçalho** (data da última varredura do `/pulso`):
  se não rodou hoje, vira a sugestão de próximo passo; se rodou, citar em meia linha quantas
  ideias quentes estão vivas ("pulso de hoje: 3 quentes no banco").

No modo agência, quando a sessão está aberta dentro de `clientes/<nome>/`, ler o núcleo
**desse cliente**, não o da raiz.

## Workflow

### Passo 1 — Conferir se há o que abrir

Se `nucleo/negocio.md`, `voz.md` ou `foco.md` ainda estão em placeholder (vazios), não
fingir contexto. Responder:

> "O núcleo ainda não foi preenchido. Rodo o `/plugar` pra ligar o sistema?"

E parar. Sistema sem núcleo não tem o que abrir.

### Passo 1.5 — Check de versão do motor (silencioso, com falha graciosa)

Resolve o furo "clone não sabe que há motor novo" (backlog do motor). Regras duras:

1. **Cache diário:** se `dados/.motor-check` existe e tem a data de HOJE, pular o passo
   inteiro (sem fetch). Um check por dia basta.
2. **Só se o remote `template` existir** (`git remote get-url template`): rodar
   `git fetch template --quiet` com tolerância a falha — **se o fetch falhar (sem rede,
   GitHub fora), seguir o "bom dia" normal SEM mencionar o check**. Nunca travar a abertura.
3. Comparar a versão do rodapé do `CLAUDE.md` local (`· vX.Y.Z`) com a de
   `git show template/main:CLAUDE.md`. Gravar a data de hoje em `dados/.motor-check`
   (mesmo quando falhou — não insistir no mesmo dia).
4. Template na frente → UMA linha na síntese: "⬆ motor novo disponível (vX.Y.Z): rodar
   `/atualizar-motor`?" — o dono decide, nada roda sozinho. Versões iguais → silêncio.

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

Se for a **primeira vez** do dono (sem histórico de sessão / núcleo recém-preenchido),
fechar com a linha-convite que tira o peso da lista de comandos:
> Não sabe por onde? É só falar o que você quer — ex.: "cuida do meu Instagram",
> "preciso de um site", "analisa meus anúncios". Eu acho a ferramenta e conduzo.

Regras da síntese:
- Cabe em ~8 linhas no terminal. Se passar disso, está virando relatório — cortar.
- O **degrau da Escada** sempre aparece — é a informação que orienta o que o sistema pode
  afirmar hoje e o que ainda é suposição.
- "Pendente" só lista o que tem ação real. Sem pendência — escrever "Nada pendente — campo
  livre."
- Não listar quais arquivos foram lidos. Não confirmar leitura. Só usar o contexto.

### Passo 3 — Sugerir o próximo passo certo (uma linha, opcional)

Quando há um próximo passo óbvio dado o estado, oferecer **um** só, calibrado pelo perfil:

- Pulso do dia não rodou (e `nucleo/fontes.md` existe) → "Rodo o `/pulso` de hoje?
  (varredura de 5 min — ideias quentes do dia no banco)" — é a sugestão padrão de
  começo de dia quando não há pendência mais urgente.
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
6. Check de motor: sem rede/remote → o "bom dia" sai normal, sem erro nem menção; template
   na frente → uma linha oferecendo `/atualizar-motor`; já checado hoje → não refaz o fetch.
