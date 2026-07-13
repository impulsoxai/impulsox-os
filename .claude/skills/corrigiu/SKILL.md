---
name: corrigiu
description: >
  Use SEMPRE que a dona corrigir texto ou voz do sistema — "a gente não escreve assim",
  "quem fala isso?", "troca X por Y", "nunca usa Z", "arruma isso para não acontecer
  mais". Transforma a correção em regra executável em UM passo: aplica na peça,
  classifica (regexável → JSON+teste · formato → folha · subjetiva → rubrica), VARRE
  contradições em docs/skills que ensinem o padrão proibido, e varre as outras peças
  recentes pelo mesmo erro. É o funil que fecha o loop de aprendizado de voz.
---

# /corrigiu — Correção vira regra, em um passo

A lição mais cara do sistema (auditorias de 10-11/07/2026): **regra que virou regex não
vaza; regra que ficou em prosa vaza.** E o elo fraco do loop era manual — o modelo da
sessão "lembrar" de gravar a regra. Esta skill é o funil obrigatório: toda correção da
dona passa por aqui e sai como regra executável + teste, ou morre de propósito na peça.

Autoria: ImpulsoX AI. Conteúdo original.

## O teste de entrada (10 segundos)

**Esta correção muda como o sistema escreve daqui pra frente?**
- NÃO (só vale pra esta peça: um número, um nome, um detalhe do contexto) → aplicar na
  peça e PARAR. Não gravar nada. Regra pontual gravada é ruído que dilui o cérebro.
- SIM → o funil inteiro abaixo, sem pular passo.

## O funil (5 passos, nesta ordem)

### Passo 1 — Aplicar na peça da vez
Corrigir o texto (verbatim se a dona ditou — palavra por palavra, sem "melhorar").
Peça visual → re-render + QA no olho do slide alterado.

### Passo 2 — Classificar e gravar (a decisão central)

| Tipo | Como reconhecer | Onde grava | Obrigatório junto |
|---|---|---|---|
| **Regexável** | Palavra, expressão literal, padrão de pontuação, CTA proibido | `scripts/voz-regras.json` (bloco certo, com `_keep_it` + data + incidente) | Caso de teste em `scripts/gate-voz.test.mjs` que reproduz o incidente real |
| **De formato** | Só vale num formato (slide, legenda, e-mail, página) | `scripts/voz-regras.json` em `cta_por_formato`/bloco do formato; se for craft (não regex), folha `nucleo/voz/formatos/<formato>.md` (criar se não existe, com "Keep-it:") | Teste se regexável |
| **Subjetiva** | Postura, tom, "não soa como eu" — máquina não pega | `nucleo/voz.md` (NÃO FAÇA, item datado com o incidente) e, se for critério de julgamento, a rubrica do `.claude/agents/revisor-voz.md` | — |

Na dúvida entre dois tipos: gravar no mais mecânico possível. Aviso que a dona confirmar
pela SEGUNDA vez promove a proibição dura (regra da auditoria 2).

### Passo 3 — Varredura de CONTRADIÇÃO (o passo que sempre se esquece)
O sistema já ensinou o erro de hoje duas vezes ("Chama no WhatsApp" como exemplo positivo
no gabarito; "travessão → dois-pontos" no escritor-br E no NÃO FAÇA #7). Por isso:

```
Grep do padrão proibido (e de sinônimos da instrução) em:
  .claude/skills/  ·  .claude/agents/  ·  docs/  ·  nucleo/voz.md
```

Procurar não só o padrão em si, mas **instrução que o ENSINE ou o dê como exemplo bom**.
Cada ocorrência: corrigir na hora. Proibição num arquivo + exemplo positivo em outro =
o gerador recai garantido.

### Passo 4 — Varrer as peças recentes pelo mesmo erro
Grep do padrão em `producao/` (peças ainda não publicadas primeiro). O mesmo vício quase
nunca está numa peça só — "Envia para o sócio" estava em DUAS outras quando a dona
corrigiu a primeira. Corrigir todas + re-render do que mudou.

### Passo 5 — Provar e mostrar
1. `node --test scripts/gate-voz.test.mjs scripts/golden-voz.test.mjs` → todos verdes (o
   teste novo passa E nenhum antigo quebrou; o golden set garante que a regra nova não
   deixou passar peça que o dono já corrigiu).
1b. Se a correção de hoje é regexável, **alimentar o golden set**: extrair o antes/depois
   com `git show <commit>^:<peça>` / `git show <commit>:<peça>` pra
   `scripts/fixtures/golden-voz/` + par de asserts no `golden-voz.test.mjs` (as fixtures
   são DADO do negócio — ficam no clone, não sobem pro template).
2. `node scripts/gate-voz.mjs` nas peças alteradas → PASS.
3. Mostrar à dona, cirúrgico: o que entrou, em qual arquivo, uma linha por gravação.
   O resto dos arquivos fica intocado.

## Regras

- **Verbatim é sagrado.** Texto que a dona ditou entra palavra por palavra — inclusive
  a pontuação dela (o incidente da vírgula que virou dois-pontos na tela 6 prova).
- Regra nova NUNCA nasce só em prosa. Se é regexável e ficou só no NÃO FAÇA, o passo 2
  não terminou.
- O JSON é fonte única mecânica: regra regexável hardcoded no `.mjs` é dívida — mover
  pro JSON quando tocar no arquivo.
- Cérebro compartilhado: as gravações desta skill alimentam TODOS os agentes (revisor-voz,
  revisor-marketing, futuramente o Hermes) — por isso grava-se no cérebro
  (`nucleo/` + `voz-regras.json`), nunca no prompt de um agente específico.
- Correção que contradiz regra existente → mostrar as duas à dona e perguntar qual vale;
  nunca resolver no escuro (pode ser evolução da voz ou exceção pontual).

## Teste de aceitação (comportamental)

1. Dona diz "a gente nunca usa folha" → item no NÃO FAÇA + avisos no JSON + teste +
   grep acha "Salva esta folha" em 2 outras peças e corrige → gate re-rodado PASS.
2. Dona corrige um número numa peça → aplica e para; nada gravado (teste de entrada).
3. Regra nova sobre dois-pontos → grep acha doc antigo ensinando o contrário → doc
   corrigido na mesma rodada.

---

**✓ Pronto:** correção aplicada na peça + regra gravada (JSON/teste/folha/NÃO FAÇA) + contradições varridas + peças recentes limpas · **↩ esta é uma skill de apoio:** dispara quando a dona corrige; o fluxo volta pra peça que estava em produção (e o crivo frio segue sendo `/revisar` + `revisor-voz`).
