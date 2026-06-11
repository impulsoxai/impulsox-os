---
name: formulas
description: >
  Use quando um post viral deve virar molde reutilizável — "/formulas", "vi esse post
  que bombou, analisa", "por que isso viralizou?", "me dá fórmulas de post que
  funcionam", "atualiza as fórmulas". Disseca peças que o usuário traz (texto, print ou
  link), pesquisa análises públicas na web e cruza com os dados da própria conta,
  mantendo o arquivo vivo de moldes em docs/formulas.md que o /post e o /linkedin
  consomem. Nunca raspa rede social atrás de login — a curadoria é do usuário.
---

# /formulas — Engenharia reversa do que funciona

Copywriter profissional guarda um arquivo de referências (swipe file) há décadas. Esta
skill faz a versão sistematizada: o usuário traz a peça que parou o dedo dele, o
sistema extrai **a fórmula, não a cópia** — e valida contra os números da própria
conta quando eles existem.

Autoria: ImpulsoX AI. Conteúdo original.

## Limite inegociável

O sistema **não acessa Instagram, LinkedIn nem X/Twitter por conta própria** — essas
redes vivem atrás de login e raspá-las viola os termos (risco real pra conta do
usuário). Quem encontra o post é o usuário, no feed dele; o sistema analisa o que ele
trouxer. Pesquisa automática só na web aberta (artigos, breakdowns públicos).

## Modo 1 — Dissecar (o coração da skill)

Usuário traz uma peça: texto colado, print ou link público. Extrair, nesta ordem:

1. **O gancho** — que tipo de abertura é? (pergunta, contraintuitivo, número, cena,
   lista, confissão). Qual loop ela abre?
2. **A estrutura** — mapear o esqueleto tela a tela ou parágrafo a parágrafo: onde
   está a tensão, onde o "mas", onde a prova, como fecha.
3. **Os gatilhos** — quais do `docs/persuasao.md` estão em jogo (o persuasao.md define
   o teto de dominantes — se a peça empilha mais, anotar; viral mal-feito também ensina).
4. **O formato** — carrossel/texto/vídeo, tamanho, ritmo visual.
5. **Por que segurou** — uma frase honesta. "Não sei dizer" é resposta válida; fórmula
   forçada de cima de um acaso vira superstição.

Destilar no molde e gravar em `docs/formulas.md`. **A fórmula é o esqueleto abstrato**
— qualquer negócio consegue vesti-la com o próprio conteúdo. Jamais copiar frase,
tema ou identidade da peça original.

## Modo 2 — Pesquisar (web aberta)

Quando o usuário pede "atualiza as fórmulas" ou não tem peça pra trazer:

1. Buscar (via skill de scraping/busca) análises públicas recentes: breakdowns de
   posts que performaram, estudos de hooks, relatórios de formato por rede.
2. Filtrar: só fórmula com **explicação plausível** entra; "use emoji no título" sem
   porquê, não. Anotar a fonte de cada uma.
3. Gravar as aprovadas pelo usuário em `docs/formulas.md` com origem `mercado`.

Sugerir refresh por trimestre — fórmula de rede social apodrece rápido.

## Modo 3 — Validar (os dados da casa)

O melhor filtro é a própria conta. Quando `producao/relatorios/` tem relatórios do
`/desempenho`:

1. Cruzar as peças medidas com as fórmulas que elas usaram (o `/post` e o `/linkedin`
   registram a fórmula na pasta da peça).
2. Promover ou rebaixar: fórmula que performa na conta ganha marca **validada aqui**
   (e o padrão vai pro `nucleo/aprendizados.md`); fórmula de mercado que flopou duas
   vezes ganha **não funciona neste nicho** — economiza as próximas tentativas.

## O arquivo `docs/formulas.md`

Cada fórmula é um bloco:

```markdown
## [nome curto da fórmula]
- **Esqueleto:** [estrutura abstrata, passo a passo]
- **Gancho típico:** [o molde da primeira linha/tela]
- **Gatilhos:** [1-2 do playbook]
- **Rede e formato:** [onde rende]
- **Origem:** dissecada de peça real ([data]) | mercado ([fonte]) — **validada aqui** /
  a testar / não funciona neste nicho
```

Máximo ~20 fórmulas vivas. Arquivo é arsenal, não museu: fórmula rebaixada duas vezes
sai ou vira nota de rodapé.

## Quem consome

`/post` e `/linkedin` leem `docs/formulas.md` junto com o playbook e escolhem o molde
pelo tema — priorizando as **validadas aqui**. O `/calendario` pode citar a fórmula
sugerida na linha do plano.

## Regras

- Fórmula ≠ cópia. Esqueleto sim; frase, tema ou estética da peça original, nunca.
- **Viral ≠ vende.** Alcance sem salvamento, compartilhamento ou lead é vaidade — a
  validação do Modo 3 olha os sinais que o `/desempenho` prioriza, não curtida.
- Toda fórmula carrega origem e status. Molde de mercado nunca vira "verdade da conta"
  sem passar pelo Modo 3.
- Não inventar métrica da peça dissecada ("isso teve 2M de views") — se o usuário não
  informou o desempenho, a fórmula entra sem número.
- Análise de peça de concorrente direto: dissecar pode, imitar tema na sequência não —
  apontar o conflito quando notar.
