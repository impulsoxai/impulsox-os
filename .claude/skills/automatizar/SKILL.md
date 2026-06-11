---
name: automatizar
description: >
  Use quando uma tarefa repetida do usuário deve virar automação permanente —
  "/automatizar", "cansei de fazer isso na mão", "dá pra automatizar X?", "cria uma
  automação pra mim", ou quando o sistema nota a mesma tarefa pela terceira vez. Também
  é o destino natural da resposta sobre tarefa repetida colhida no /plugar. Descobre o
  que se repete, verifica o que o sistema já cobre e cria skill nova sob medida em
  .claude/skills/.
---

# /automatizar — Rotina repetida vira skill

O sistema cresce com o uso: cada tarefa que o usuário repete é uma automação esperando
pra existir. Esta skill colhe essas rotinas, descarta o que já tem cobertura e
transforma o resto em skill nova calibrada pro negócio.

Autoria: ImpulsoX AI. Conteúdo original.

## Ponto de partida

Conferir primeiro o que já foi plantado:

- `nucleo/foco.md` e a resposta sobre "tarefa que gostaria de tirar das costas" colhida
  pelo `/plugar` — se existe, abrir por ela: "você mencionou que repete [X]. Bora
  automatizar essa primeiro?"
- O histórico da própria conversa — se o pedido nasceu de "cansei de fazer isso", a
  rotina já está descrita; não re-perguntar o que acabou de ser dito.

## Descoberta (quando a rotina ainda não está clara)

Três perguntas, uma por vez:

1. "O que você faz toda semana no marketing que gostaria de nunca mais fazer na mão?"
2. "Quando você faz [tarefa], o que você tem em mãos no começo? (um tema, uma planilha,
   um link, um pedido de cliente...)"
3. "E o que precisa existir no final pra tarefa contar como feita?"

Entrada e saída definem a skill; o miolo é trabalho do sistema.

## Antes de criar: o que já existe?

Conferir, nesta ordem:

1. **As skills do ImpulsoX-OS** em `.claude/skills/` — a rotina pode ser um caso de uso
   de skill existente (ex: "fazer post toda semana" = `/calendario` + `/post`, não skill
   nova).
2. **O catálogo de skills nativas** em `docs/skills-prontas.md` — Claude Code já traz
   skill pronta pra documentos, planilhas, apresentações e afins.
3. Só o que sobra vira skill nova.

Quando já existe cobertura, mostrar o caminho em vez de criar duplicata.

## Proposta

Pra cada rotina sem cobertura, apresentar antes de criar:

```
/<nome-proposto>
Faz: [uma frase]
Recebe: [entrada típica]
Entrega: [saída concreta]
Usa: [arquivos do núcleo/marca + ferramentas externas, se houver]
```

Esperar aprovação (ou ajuste) do usuário. Nada de criar skill surpresa.

## Criação

Pra cada skill aprovada, criar `.claude/skills/<nome>/SKILL.md` seguindo o padrão das
skills do sistema:

- Frontmatter com `name` e `description` começando por "Use quando..." — gatilhos
  concretos com as palavras que o usuário realmente usaria (sem gatilho bom, a skill
  nunca é encontrada).
- Seção "O que ler antes" apontando os arquivos do núcleo/marca de que ela depende.
- Workflow em passos, com os pontos de aprovação do usuário marcados.
- Seção "Regras" com o que sempre e o que nunca fazer.
- Calibrada com `nucleo/voz.md` e `nucleo/negocio.md` — skill genérica é skill ruim.
- Arquivos de apoio (template, exemplo) dentro da pasta da própria skill.

Depois de criar, registrar a skill nova no `CLAUDE.md` da pasta (linha na lista de
automações) e sugerir `/salvar`.

## Regras

- Só automatizar o que se repete. Tarefa que aconteceu uma vez se executa, não se
  automatiza.
- Máximo 3 skills novas por rodada — qualidade de gatilho e calibração vêm antes de
  volume; rodadas seguintes existem.
- Skill que depende de ferramenta não configurada (API, MCP, credencial) → avisar antes
  e oferecer a versão que funciona hoje, com o upgrade documentado dentro dela.
- Nome de skill: verbo ou substantivo curto em português, no padrão das existentes.
- Testar o gatilho na hora: pedir pro usuário invocar a skill recém-criada uma vez; se
  não disparar, ajustar a description antes de encerrar.
