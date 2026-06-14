# Copy de conversão em 4 camadas — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-14 · Autoria: ImpulsoX AI.

## Problema

A copy de landing page sai **fraca e com cara de IA**, mesmo quando `nucleo/voz.md`
está preenchido (confirmado no clone ImpulsoX-AI). Diagnóstico:

1. **Não é falta de voz.** A voz existe no clone e a copy continua fraca → o gargalo
   é a **engine**, não o motorista.
2. **`/copy` mistura "forte" com "humano" numa passada só.** Tenta converter e soar
   natural ao mesmo tempo. Resultado: copy correta, sem força e sem alma.
3. **Zero exemplo de copy que converte.** A `/copy` tem fórmulas (esqueletos) mas
   nenhum before→depois real. Regra ensina menos que exemplo concreto.
4. **`/escritor-br` é checklist raso.** Tabela de 16 vícios, passada única, sem
   loop de auto-crítica, sem restrições duras, sem freio de falso-positivo (corta
   prosa boa junto com o ruim), sem injeção de voz com método.

## Referência pesquisada — humanizer (blader/humanizer)

SKILL.md de 34KB, MIT, v2.8.0. Baseado no "Signs of AI writing" da Wikipedia.
**33 padrões** em 6 famílias. Três mecanismos que o nosso motor não tem e que serão
absorvidos (em PT-BR, não copiados em inglês):

- **Loop draft → audit → final.** Escreve rascunho → pergunta *"o que ainda denuncia
  IA aqui?"* → reescreve. Auto-crítica explícita, não passada única.
- **Restrições duras** (não "evite", mas "zero"): travessão `—` é o tell #1 de IA →
  reescrita final não contém nenhum. Idem aspas curvas, title-case em headings,
  boldface mecânico, emoji decorativo.
- **Freio de falso-positivo:** "o que NÃO marcar" + "sinais de escrita humana,
  preserve" (detalhe específico, sentimento misto, gíria datada, variação de ritmo).
  Impede o humanizer de matar prosa boa.
- **Seção "Personality and Soul":** limpo ≠ bom. Texto sem voz é tão denunciável
  quanto texto com clichê.

**Decisão:** absorver esse rigor para DENTRO do `/escritor-br` em PT-BR. Não instalar
o humanizer como skill separada (faria o mesmo trabalho do `/escritor-br`, em inglês,
brigando com ele).

## Arquitetura — 4 camadas, 2 skills

Princípio central: **separar "forte" de "humano".** Conversão e naturalidade são dois
trabalhos com critérios diferentes; viram duas etapas com dois audits diferentes.

```
┌─ /copy ───────────────────────────────────────────────┐
│ CAMADA 1 · MIRA        consciência+sofisticação,       │  já existe (Passo 0)
│                        1 leitor/1 promessa/1 ação       │
│ CAMADA 2 · RASCUNHO    headline sprint, estrutura,      │  +consulta swipe-copy.md
│                        gatilhos + exemplo real análogo  │
│ CAMADA 3 · AFIAÇÃO     loop de auto-crítica de          │  NOVO
│                        CONVERSÃO + régua Desejo−Fricção  │
└────────────────────────────────────────────────────────┘
                          ↓ entrega copy FORTE
┌─ /escritor-br (turbinado com rigor do humanizer) ─────┐
│ CAMADA 4 · HUMANO+VOZ  loop draft→audit→final,          │  turbinado
│                        restrições duras, freio de        │
│                        falso-positivo, SOUL, injeta voz  │
└────────────────────────────────────────────────────────┘
                          ↓ entrega copy FORTE + HUMANA
```

Por que duas skills e não uma mega-skill: o `/escritor-br` é infraestrutura
compartilhada — `/post`, `/linkedin`, `/email`, `/ads-*` também o chamam. Não pode
morrer nem ser absorvido pela `/copy`. A esteira já existe: a `/copy` hoje chama o
`/escritor-br` no gate de entrega. Mantém-se esse handoff.

### Os dois audits são diferentes (o ponto-chave)

| | Camada 3 (Afiação) | Camada 4 (Humanização) |
|---|---|---|
| Pergunta do loop | *"isso VENDE ou só descreve?"* | *"isso ainda parece IA?"* |
| Régua | Desejo − (Esforço + Confusão) | 33 padrões + restrições duras |
| Mora em | `/copy` | `/escritor-br` |
| Saída | copy forte (pode ainda ter tom de IA) | copy forte E humana |

## Mudanças por arquivo

### 1. `.claude/skills/copy/SKILL.md`
- **Camada 2 — pluga o swipe file.** Antes de escrever cada bloco-chave (hero,
  oferta, quebra de objeção, CTA), consultar `docs/swipe-copy.md` e puxar 1 exemplo
  análogo como referência de força (não pra copiar — pra calibrar o nível).
- **Camada 3 — NOVO passo "Afiação".** Loop de auto-crítica de conversão, rodado
  ANTES de mandar pro `/escritor-br`:
  1. Reler a copy inteira com uma pergunta só: *"cada linha aumenta o desejo ou
     reduz esforço/confusão? A que não faz nenhum, descreve em vez de vender — corta
     ou reescreve."*
  2. Caçar os 3 pecados de copy fraca: **(a) descreve o produto** em vez do resultado;
     **(b) genérico** — serve pra qualquer concorrente, troca o logo e continua válido;
     **(c) abstrato** — sem número, nome ou cena concreta.
  3. Reescrever os pontos fracos puxando força do swipe-copy.md.
  - O gate de repetição e o passo de ritmo que já existem entram aqui (são parte da
    afiação), não some nada.
- Atualizar o checklist final e a seção "Onde registrar" pra citar a Camada 3 e o
  swipe-copy.md.

### 2. `.claude/skills/escritor-br/SKILL.md`
Turbinar sem perder o que já é bom (a tabela PT-BR de vícios). Acrescentar:
- **Loop draft → audit → final** como processo oficial (substitui os "3 modos"
  avulsos por uma sequência com auto-crítica no meio): rascunho → *"o que aqui ainda
  denuncia IA?"* (listar tells restantes em bullets) → final que resolve.
- **Restrições duras** (régua de "zero", não "evite"): reescrita final sem travessão
  `—`/`–`, sem aspas curvas `“ ”`, sem title-case em heading, sem boldface mecânico,
  sem emoji decorativo. Varredura final: achou `—` → não está pronto.
- **Freio de falso-positivo** (seção nova "O que NÃO matar"): preservar detalhe
  específico (número, nome próprio, cena), sentimento misto, gíria/referência datada,
  variação de ritmo deliberada. Humanizar não pode achatar prosa boa nem diluir os
  gatilhos/especificidade que a `/copy` construiu (já há semente disso no "Critério
  de pronto" atual — expandir).
- **Seção SOUL** ("Limpo não basta"): texto sem voz é tão denunciável quanto texto
  com clichê. Injetar opinião/ponto de vista, ritmo variado, e a personalidade do
  `nucleo/voz.md`. Inclui um before/after "limpo mas sem alma → com pulso".
- **Fundir os 33 padrões com os 16 atuais:** trazer os que faltam e têm equivalente
  PT-BR (cópula evitada "serve como/se destaca como" → "é"; falsos intervalos "de X
  a Y"; variação elegante/troca de sinônimo; signposting "vamos explorar"; punchlines
  fabricadas/staccato; aforismo "X é o Y de Z"; aberturas retóricas falso-sinceras
  "Olha,"/"Sinceramente?"). Manter os PT-BR-específicos que o humanizer não tem
  (gerúndios em cadeia, "além disso", tricolon BR).
- Aplicar à seção "Personality and Soul" a ressalva do humanizer: **não injetar
  opinião/1ª pessoa em texto técnico/de referência** (JSON, schema, spec) — lá o
  neutro É o humano correto.

### 3. `docs/swipe-copy.md` — NOVO
Acervo vivo de copy que converte, lido pela `/copy` na Camada 2. Padrão do
`docs/formulas.md` (que já faz isso pros posts).
- **Conteúdo:** copy real de landing pages que convertem — **garimpada via firecrawl**
  (decisão do usuário: exemplos reais, não curados de cabeça). Por bloco: headline,
  hero, sub, quebra de objeção, prova, CTA.
- **Formato de cada entrada:** o trecho real → **por que converte** (qual gatilho/
  princípio aciona, referência a persuasao.md) → **o molde transferível** (o que dá
  pra reaproveitar sem copiar a marca de origem).
- **Curadoria honesta:** marcar a fonte de cada exemplo. Adaptar pra PT-BR quando o
  original é em inglês, sinalizando que é adaptação. Nunca apresentar copy de terceiro
  como própria.
- **Vivo:** cresce quando o usuário traz um exemplo forte, ou quando o `/desempenho`
  prova que uma copy converteu de verdade neste negócio (gancho futuro, fora do escopo
  desta entrega).

### 4. `CLAUDE.md` + `README.md`
- `CLAUDE.md`: citar `docs/swipe-copy.md` onde os docs de referência são listados
  (junto de persuasao.md, formulas.md).
- `README.md`: registrar swipe-copy.md e a Camada 3 da `/copy` se houver mapa de docs.
- Bump de versão do rodapé (`v0.2.1` → `v0.2.2`) se for o padrão do repo.

## Pesquisa pendente (na implementação)

Garimpar via firecrawl copy real de landing pages reconhecidas por conversão
(ex.: páginas de SaaS/infoproduto/serviço premium BR e global com copy forte),
extrair os trechos de hero/headline/CTA/objeção, e montar o swipe-copy.md com a
análise do porquê. Mínimo viável: ~8-12 entradas cobrindo os blocos-chave.

## Fora de escopo (YAGNI)

- Não criar skill nova. As duas que existem absorvem tudo.
- Não instalar o humanizer como dependência/skill de terceiro.
- Não traduzir os 33 padrões literalmente — só os que têm valor em PT-BR e não
  duplicam os 16 atuais.
- Gancho `/desempenho → swipe-copy.md` fica anotado, não implementado agora.

## Critério de pronto

- `/copy` tem Camada 3 (Afiação) explícita e consulta o swipe-copy.md na Camada 2.
- `/escritor-br` tem loop draft→audit→final, restrições duras, freio de
  falso-positivo e seção SOUL — sem perder a tabela PT-BR.
- `docs/swipe-copy.md` existe com ≥8 entradas reais, com fonte e análise.
- `CLAUDE.md`/`README.md` citam o novo arquivo.
- Os dois audits (conversão vs anti-IA) estão claramente separados e em ordem.
- Nada quebra o handoff existente `/copy → /escritor-br` nem o uso do `/escritor-br`
  por `/post`, `/linkedin`, `/email`.
