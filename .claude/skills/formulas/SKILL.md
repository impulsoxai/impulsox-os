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

**Vídeo do YouTube** entra como quarta forma de peça (link). Antes de dissecar:
1. `node scripts/transcript-youtube.mjs <link>` — puxa a transcrição pública (legenda
   manual ou automática, o que existir). **O YouTube bloqueia download automático de
   legenda com frequência** (rate-limit/anti-bot — devolve erro "indisponível"); é o ponto
   frágil do fluxo, não bug do script. Sem transcrição: avisar e dissecar só por
   título/descrição/visual, sem inventar fala que não foi dita. Pra um vídeo específico em
   que a legenda importa muito, a alternativa manual é abrir "Mostrar transcrição" no
   próprio player e colar o texto aqui.
2. Disseca gancho/estrutura/gatilhos pelos 5 passos acima, **mais** estes campos
   exclusivos de vídeo (só quando Rede=YouTube):
   - **Hook (tipo + texto literal dos 3-15s):** transcrito da fala real, não resumo.
   - **Ritmo de corte:** rápido/médio/lento — pela frequência de troca de assunto na
     transcrição.
   - **Estrutura de retenção:** que loop de curiosidade abre e quando fecha.
   - **Composição da fala:** frase curta vs longa, repetição proposital, pergunta
     retórica, jargão vs linguagem simples.

## Modo 2 — Pesquisar (web aberta)

Quando o usuário pede "atualiza as fórmulas" ou não tem peça pra trazer:

1. Buscar (via skill de scraping/busca) análises públicas recentes: breakdowns de
   posts que performaram, estudos de hooks, relatórios de formato por rede.
   Pro nicho de IA/Claude Code, canais americanos de referência (sementes, não lista
   fechada — `canal-youtube/criadores-monitorados.md` tem a lista viva): Sabrina Ramonov,
   Luuk Alleman, Matt Ganzak, Jonathan Acuña "Doctor AI", Duncan Rogoff, Chase AI, Yury AI.
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

## Modo 4 — Monitorar canais (cron)

Acionado pelo agendamento automático (ver `CronCreate` no setup do canal) ou por pedido
("checa os criadores", "tem vídeo novo relevante?"):

1. Rodar `node scripts/checar-criadores-yt.mjs` — devolve a lista de vídeos relevantes
   (já filtrados pelos 3 pilares do canal, transcript já anexado quando disponível) e já
   grava a entrada em `canal-youtube/pesquisa/fila.md` com status **a dissecar**.
2. Pra cada vídeo relevante retornado: aplicar o Modo 1 (Dissecar) usando o transcript já
   capturado — não buscar de novo. Gravar o molde em `docs/formulas.md` com origem
   `mercado (<canal>, <data>)` e status **a testar**.
3. Atualizar a entrada correspondente em `fila.md` de **a dissecar** pra **dissecado —
   ver docs/formulas.md**.
4. Notificar (push notification) **só** os vídeos que passaram pelo filtro de
   relevância — resumo de uma linha do que é o vídeo, canal de origem e o pilar batido.
   Desempenho do vídeo de origem (visualizações, se disponível) entra como contexto na
   notificação, nunca como filtro — tema bom com desempenho fraco ainda notifica.
5. Vídeo que `checar-criadores-yt.mjs` não classificou como relevante não aparece em
   `fila.md` nem gera notificação — fica só no `.ultimo-visto.json`, sem ruído.

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

---

**✓ Pronto:** molde destilado e gravado em `docs/formulas.md` (esqueleto, não cópia) · **↩ esta é uma skill de apoio:** o arsenal de fórmulas é consumido por `/post` e `/linkedin` (e citado pelo `/calendario`) — não tem próximo passo próprio; o fluxo volta pra produção, que veste o molde com o conteúdo da marca.
