---
name: atualizar-motor
description: >
  Use quando o template ImpulsoX-OS recebeu melhorias e este negócio (clone) precisa
  recebê-las — "/atualizar-motor", "puxa as novidades do template", "atualiza minhas skills",
  "o ImpulsoX-OS mudou, traz pra cá", "minhas skills estão velhas". Puxa do repo-template SÓ
  o motor (skills, CLAUDE.md, docs) e NUNCA toca nos dados deste negócio (nucleo, marca,
  producao, dados, clientes, .env). É o que mantém todos os clones atualizados sem perder
  o núcleo de cada um.
---

# /atualizar-motor — Trazer as melhorias do template sem perder o núcleo

No modelo "um clone por negócio", cada pasta (ImpulsoX-AI, Eskina…) é uma ilha: melhorou o
template, o clone não sabe. Esta skill é a ponte. Ela puxa do repo-template **só o motor** —
as skills, a constituição, os docs — e protege com unhas e dentes os **dados** deste negócio:
voz, marca, produção, tudo que é único daqui fica intocado.

Autoria: ImpulsoX AI. Conteúdo original.

> Esta skill mexe em git, mas não escreve lógica nova — é orquestração de git com proteções.
> Não aciona BLAST. A validação é comportamental: depois de atualizar, o núcleo continua igual
> e as skills novas aparecem.

## A regra inegociável — motor sobe, dado fica

| Vem do template (MOTOR — pode atualizar) | É deste negócio (DADO — NUNCA tocar) |
|---|---|
| `.claude/skills/` | `nucleo/` (voz, negocio, foco, escada, perfil, provas, aprendizados) |
| `CLAUDE.md` (a constituição) | `marca/` (design-guide, tokens, logo) |
| `docs/` (persuasao, formulas, ferramentas, perfis, skills-prontas) | `producao/` (tudo que o sistema gerou) |
| `scripts/` (código compartilhado das skills) | `dados/` (uploads, exports, transcrições) |
| `.env.example`, `.gitignore` | `clientes/` (se houver) · `.env` (segredos) |

Se algum dia uma atualização do motor **precisar** mexer num arquivo de dado (ex: novo campo
no `escada.md`), isso NÃO é trabalho desta skill — ela avisa e o `/atualizar` (o que reconcilia
núcleo com realidade) cuida, com aprovação. Esta skill só move motor.

## Pré-requisito (configurar uma vez por clone)

O clone precisa conhecer o template como uma segunda origem ("template"). Conferir:

```bash
git remote -v
```

Se não existe um remote `template`, criar (apontando pro repo do ImpulsoX-OS):

```bash
git remote add template https://github.com/impulsoxai/impulsox-os.git
```

> O `origin` continua sendo o repo PRIVADO deste negócio (ex: impulsox, eskina). O `template`
> é só leitura — a gente puxa dele, nunca empurra pra ele.

## Workflow

### Passo 0 — Rede de segurança (sempre)

Antes de qualquer pull, garantir que o trabalho atual está salvo e que dá pra voltar:

1. `git status` — se há mudança não commitada, rodar `/salvar` antes (não atualizar por cima
   de trabalho solto).
2. Criar um branch de segurança: `git branch antes-de-atualizar-motor`. Se algo der errado, é
   pra cá que se volta.

### Passo 1 — Buscar e mostrar o que mudou (antes de aplicar)

```bash
git fetch template
```

Comparar o motor local com o do template e **mostrar ao usuário, em português, o que mudou** —
só nos caminhos de motor:

```bash
git diff --stat HEAD template/main -- .claude/ CLAUDE.md docs/ scripts/ .env.example
```

Traduzir o resultado em linguagem de dono: "3 skills novas (`/abrir`, `/geo`, …), `persuasao.md`
ganhou a seção do Schwartz, `/post` mudou". Nada de despejar diff cru.

> Se o diff incluir QUALQUER arquivo de `nucleo/`, `marca/`, `producao/`, `dados/`, `clientes/`
> → **parar e avisar**: "o template mexeu num arquivo de dado, isso precisa de revisão manual
> com `/atualizar`, não entra no automático". Motor e dado não se misturam nunca.

### Passo 2 — Aplicar só o motor

Trazer do template apenas os caminhos de motor, deixando o núcleo deste negócio intocado:

```bash
git checkout template/main -- .claude/ docs/ scripts/ .env.example
```

O `CLAUDE.md` da raiz é a constituição (motor) e também atualiza — **mas** se este clone tem
regras próprias adicionadas ao fim do `CLAUDE.md` (raro), preservá-las: nesse caso, aplicar a
versão do template e re-anexar as regras locais, mostrando ao usuário o que foi mantido.

> Por que `checkout <ref> -- <caminhos>` e não `merge`/`pull` puro: assim a gente escolhe
> exatamente QUAIS pastas vêm do template. `nucleo/`, `marca/`, `producao/`, `dados/`,
> `clientes/` e `.env` nem entram no comando — ficam exatamente como estavam. Proteção por
> construção, não por confiança.

### Passo 3 — Conferir que o dado está intacto

Antes de fechar, provar que nada de dado mudou:

```bash
git status
```

A lista de arquivos alterados tem que conter **só** caminhos de motor (`.claude/`, `docs/`,
`scripts/`, `CLAUDE.md`, `.env.example`). Se aparecer qualquer coisa de `nucleo/`, `marca/`,
`producao/`, `dados/` → **desfazer tudo** (`git checkout antes-de-atualizar-motor -- .`) e
avisar o usuário que algo saiu do esperado. Dado alterado é abortar, sem exceção.

### Passo 4 — Validar e salvar

1. Rodar `/abrir` — o resumo tem que sair igual a antes (nome, degrau, tom da voz rica). Se a
   voz sumiu ou ficou genérica, o núcleo foi tocado → abortar pelo branch de segurança.
2. Se há skills novas, listá-las pro usuário ("agora você tem `/geo`, `/atualizar-motor`…").
3. `/salvar` no repo PRIVADO deste negócio (`origin`) — registra o motor atualizado.
4. Apagar o branch de segurança só depois de tudo confirmado.

## Regras

- **Nunca** `git push template` — o template é leitura. Empurrar pro template misturaria o dado
  do negócio no molde público. (O `/salvar` empurra pro `origin`, o repo privado do negócio.)
- **Nunca** atualizar por cima de trabalho não commitado — `/salvar` antes, sempre.
- Dado tocado = abortar. Não existe "atualização parcial do núcleo" aqui; isso é do `/atualizar`.
- Conflito de merge não deve acontecer (motor e dado são arquivos separados); se acontecer no
  `CLAUDE.md` por causa de regra local, mostrar os dois lados e perguntar — nunca resolver no
  escuro.
- Esta skill é por clone: roda dentro da pasta do negócio que vai ser atualizado, um de cada vez.

## Teste de aceitação (comportamental)

1. Template ganhou uma skill nova → `/atualizar-motor` traz ela; `/abrir` mostra a voz rica
   intacta depois.
2. `git status` pós-atualização lista só caminhos de motor; zero arquivo de `nucleo/`/`marca/`.
3. Template (hipoteticamente) mexeu num arquivo de `nucleo/` → a skill PARA e manda usar
   `/atualizar`, não aplica.
4. Sem remote `template` configurado → a skill oferece criar o remote antes de seguir.
5. Trabalho não commitado → a skill manda `/salvar` antes de atualizar.

## Onde registrar

Depois de criar, registrar `/atualizar-motor` na lista de automações do `CLAUDE.md` (seção
Sistema), e — como ela faz parte do MOTOR — ela mesma se propaga pros próximos clones na
próxima atualização. O primeiro clone (ImpulsoX-AI) recebe ela manualmente desta vez; os
próximos já nascem com ela via template.
