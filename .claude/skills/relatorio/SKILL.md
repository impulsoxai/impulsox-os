---
name: relatorio
description: >
  Use quando o trabalho do mês precisa virar relatório apresentável — "/relatorio",
  "monta o relatório do cliente", "fecha o mês", "preciso mostrar resultado pro
  cliente", ou no fim de cada mês no modo agência. Junta o que o /desempenho e o
  /analisar-ads já mediram num relatório mensal com a marca da agência, em linguagem
  de dono de negócio: o que fizemos, o que aconteceu, o que vem agora. É a skill de
  retenção — cliente renova quando enxerga o valor.
---

# /relatorio — O mês visível pro cliente

Agência perde cliente quando o trabalho fica invisível. Os números já existem no
sistema (`/desempenho`, `/analisar-ads`); esta skill transforma eles na peça que o
cliente lê em 5 minutos e entende por que continua pagando.

Autoria: ImpulsoX AI. Conteúdo original.

## O que ler antes

- `producao/relatorios/desempenho-<mes>.md` — orgânico (se não existe, **rodar
  `/desempenho` primeiro** — relatório sem medição é ficção)
- `producao/ads/analise-*.md` — pago, se o cliente roda ads
- `producao/calendario/<mes>.md` + `producao/publicacoes.md` — o que foi entregue
- `nucleo/aprendizados.md` — o que o mês ensinou
- Marca de **quem assina**: no modo agência, o relatório pro cliente sai com a marca
  da agência (raiz); peça interna do próprio negócio sai com a marca da empresa

## Estrutura (nesta ordem — decisor lê de cima e para quando confia)

1. **O mês em uma frase** — a conclusão honesta antes de qualquer número
2. **O que foi entregue** — peças publicadas, campanhas ativas, páginas no ar (volume
   conferível, com links)
3. **Os números que importam** — 4-6 métricas no máximo, sempre com comparação
   (mês anterior ou meta) e uma linha de leitura em português de gente: "alcance subiu
   18% — puxado pelos dois carrosséis de [tema]". Nada de despejo de planilha
4. **O que aprendemos** — padrões do `nucleo/aprendizados.md` em linguagem simples;
   é o que mostra que existe método, não sorte
5. **Plano do próximo mês** — 3-5 ações concretas saídas dos aprendizados
6. **Recado final** — onde precisamos do cliente (material, aprovação, acesso, prova)

## Produção

1. Montar o conteúdo e mostrar pro usuário **antes** de diagramar (número errado
   diagramado bonito é constrangimento bonito).
2. Diagramar em HTML com a identidade (tokens da marca de quem assina) → PDF, mesmo
   pipeline do `/criar-ebook`. Capa, 4-8 páginas, gráficos simples (barras de
   comparação em HTML/CSS — sem biblioteca).
3. Salvar em `clientes/<nome>/producao/relatorios/<YYYY-MM>.pdf` (modo agência) ou
   `producao/relatorios/mensal-<YYYY-MM>.pdf` (negócio próprio).

## Honestidade — a parte que segura contrato de verdade

- Mês fraco: dizer fraco, explicar o porquê e mostrar a correção em andamento. Cliente
  aceita mês ruim com plano; não aceita descobrir que foi enrolado.
- Métrica de vaidade não maquia resultado: se o objetivo era lead e veio curtida, o
  relatório diz isso.
- Nunca atribuir ao marketing o que não é dele (venda que veio de indicação, pico
  sazonal) — credibilidade vale mais que um gráfico bonito.

## Regras

- Todo número vem dos relatórios das skills de medição — nunca recalculado de cabeça,
  nunca estimado pra preencher lacuna. Sem dado de um canal → o relatório marca
  "sem medição neste canal" e sugere configurar.
- Linguagem de dono de negócio; jargão só com tradução na mesma frase.
- Texto passa pelo `/escritor-br`.
- Mensal por padrão; oferecer agendar a rotina (fim do mês: `/desempenho` →
  `/relatorio` → `/calendario` do mês seguinte — o ciclo completo).
