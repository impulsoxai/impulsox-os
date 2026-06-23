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

## Modo proativo — mapear rotinas

Além de reagir a "cansei de fazer isso", esta skill roda proativa: varrer as rotinas do
negócio antes de virarem queixa. Entrevista curta:
> "O que você (ou sua equipe) repete toda semana?"

Listar as candidatas, **estimar o ganho** de cada uma (tempo/semana economizado) e propor
2-3 automações concretas — o resto fica pra próxima rodada (teto de 3). É o mesmo motor da
fase de mapeamento do `/cliente`.

**Onde a skill nasce (regra de ouro):** automação específica deste negócio/cliente →
`.claude/skills/` do clone. Automação que serve a **qualquer** cliente → nasce no template
(ImpulsoX-OS) e desce pelo `/atualizar-motor`. Nunca instalar melhoria de motor direto num
clone.

## Descoberta (quando a rotina ainda não está clara)

Três perguntas, uma por vez:

1. "O que você faz toda semana no marketing que gostaria de nunca mais fazer na mão?"
2. "Quando você faz [tarefa], o que você tem em mãos no começo? (um tema, uma planilha,
   um link, um pedido de cliente...)"
3. "E o que precisa existir no final pra tarefa contar como feita?"

Entrada e saída definem a skill; o miolo é trabalho do sistema.

## Triagem de viabilidade (antes de prometer automação)

Nem toda tarefa repetida deve virar automação. Antes de propor uma skill, passar a rotina
pela triagem. As 3 primeiras perguntas decidem se **dá** pra automatizar (viabilidade
técnica) e de que tipo; a 4ª decide se **vale** (viabilidade econômica) — tarefa pode passar
nas três técnicas e ainda assim não dever virar skill por não se pagar.

1. **Gatilho determinístico?** — dá pra dizer com precisão *quando* a tarefa começa (um
   evento claro: chegou uma planilha, virou o mês, cliente mandou um pedido), ou o começo
   depende de alguém decidir na hora que é hora? (Sem gatilho automático **não** veta: a
   maioria das nossas skills o dono dispara na mão — isso é "skill sob demanda", não "não
   automatizável". O ❌ é pra quando nem sob demanda faz sentido.)
2. **Entrada e saída conhecidas?** — o que entra e o que sai são sempre os mesmos campos/
   formato, ou variam a cada vez de um jeito que ninguém consegue descrever antes?
3. **Precisa de julgamento?** — o miolo exige decisão criativa/contextual humana (gosto,
   estratégia, sensibilidade de marca), ou é mecânico o bastante pra uma regra/IA executar?
   (Julgamento *parcial* — IA decide dentro de guardas + humano aprova — **não** veta: é o caso
   "IA no loop", o mais comum nas nossas skills.)
4. **Vale a pena? (ROI)** — frequência × tempo manual por vez justifica **criar e MANTER** a
   skill? Piso simples: repete **≥ 1×/mês** OU economiza **≥ ~15 min/semana**. Abaixo disso,
   o esforço de construir e manter costuma superar o que o dono gastaria fazendo na mão.
   Lembrar: skill com bordas variáveis exige revisão humana recorrente (tratar exceção) — ✅
   não significa "zero toque". Orçar ~15-25% do esforço de criação por ano em manutenção.

| Gatilho determinístico | Entrada/saída conhecida | Precisa julgamento | Veredito |
|---|---|---|---|
| Sim | Sim | Não | ✅ **Skill determinística** — script/regra resolve (ex: calcular métrica, montar CSV de ads) |
| Sim | Sim | Sim | ✅ **Skill com IA no loop** — IA decide dentro de guardas (ex: escrever post na voz, propor calendário). A maioria das nossas é esta |
| Sim | Não | — | 🟡 **Mapear entrada/saída primeiro** — definir os campos antes de criar; sem isso a skill sai instável |
| Não (nem sob demanda) | — | — | ❌ **Fica manual** — decisão pontual, executar e morrer ali |
| (passou no técnico) | mas ROI não fecha | — | 🟡 **Esperar** — viável mas não se paga ainda; refazer a conta quando a frequência subir |

**Risco/reversibilidade:** automação que **toca conta de cliente, publica ou gasta dinheiro**
tem a barra mais alta — vale a regra do `CLAUDE.md` ("nunca arriscar a conta de um cliente").
Aí, mesmo viável e com ROI, manter o humano no clique final (entregar pronto, não disparar).

Veredito ❌ ou 🟡 → dizer ao dono em uma linha por que ainda não vira skill (e o que faltaria
pra virar), em vez de criar uma automação que vai falhar ou não se pagar. Veredito ✅ → seguir
pro "Antes de criar". O tipo (determinística vs IA no loop) já orienta como a skill é escrita.

## Antes de criar: o que já existe?

Conferir, nesta ordem:

1. **As skills do ImpulsoX-OS** em `.claude/skills/` — a rotina pode ser um caso de uso
   de skill existente (ex: "fazer post toda semana" = `/calendario` + `/post`, não skill
   nova).
2. **O catálogo de skills nativas** em `docs/skills-prontas.md` — Claude Code já traz
   skill pronta pra documentos, planilhas, apresentações e afins.
3. **O catálogo de ferramentas** em `docs/ferramentas.md` — se a skill nova precisa fazer
   algo "de fora" (renderizar imagem, publicar, ler API, calcular métrica), a ferramenta
   já pode estar documentada com padrão de uso, `.env` e script. Não duplicar código que
   já existe; usar a ferramenta de lá.
4. Só o que sobra vira skill nova.

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

Se a skill usa uma ferramenta externa (API/CLI/conector) **ainda não catalogada**,
registrar ela em `docs/ferramentas.md` no mesmo movimento (o que resolve · precisa de
conta? · `.env` · script · pegadinha) — pra próxima skill já encontrar o padrão.

Depois de criar, registrar a skill nova no `README.md` (na lista "As N automações",
atualizando a contagem do título) e sugerir `/salvar`.

## Regras

- Só automatizar o que se repete. Tarefa que aconteceu uma vez se executa, não se
  automatiza.
- Passar toda rotina pela **triagem de viabilidade** (técnica + ROI) antes de prometer skill.
  Sem gatilho nem sob demanda → fica manual; entrada/saída indefinida → mapear primeiro; ROI
  que não fecha → esperar. Não criar automação que vai falhar nem que não se paga só pra dizer
  "automatizei".
- Máximo 3 skills novas por rodada — qualidade de gatilho e calibração vêm antes de
  volume; rodadas seguintes existem.
- Skill que depende de ferramenta não configurada (API, MCP, credencial) → avisar antes
  e oferecer a versão que funciona hoje, com o upgrade documentado dentro dela.
- Nome de skill: verbo ou substantivo curto em português, no padrão das existentes.
- Testar o gatilho na hora: pedir pro usuário invocar a skill recém-criada uma vez; se
  não disparar, ajustar a description antes de encerrar.

---

**✓ Pronto:** rotina repetida virou skill nova, com gatilho testado · **→ próximo passo:** seguir usando a skill recém-criada no fluxo normal — a automação já está plugada e dispara sozinha quando o gatilho aparece.
