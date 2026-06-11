---
name: desempenho
description: >
  Use quando é hora de medir o que foi publicado e aprender com isso — "/desempenho",
  "como foram os posts?", "o que funcionou esse mês?", "fecha o ciclo", ou no fim de
  cada mês antes do próximo /calendario. Puxa métricas reais do Instagram via Graph API
  (ou recebe do usuário quando não há API), destila padrões duradouros em
  nucleo/aprendizados.md e alimenta o próximo ciclo de planejamento. É o elo que fecha
  o circuito: decide → produz → publica → mede → corrige.
---

# /desempenho — Medir, aprender, realimentar

Conteúdo sem medição é circuito aberto. Esta skill pega o que `/publicar` levou ao ar,
busca os números reais, separa o que repetir do que abandonar, e grava as conclusões
onde o `/calendario` vai ler no próximo ciclo. O sistema corrige a própria rota.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Funciona em dois modos:

- **Automático (preferido):** existe `.env` com `IG_USUARIO_ID` e `META_TOKEN_PAGINA`
  (as mesmas credenciais do `/publicar`) e `producao/publicacoes.md` tem ids
  registrados → o sistema busca tudo sozinho.
- **Manual (sem API):** o usuário cola os números do app do Instagram (alcance,
  salvamentos, compartilhamentos, curtidas, comentários, novos seguidores por post) ou
  manda prints. Registrar com a fonte anotada ("informado manualmente em [data]").
  Nunca travar por falta de credencial.

Quando dados reais entram pela primeira vez, atualizar `nucleo/escada.md`: o contexto
subiu ao **degrau 4** no eixo de conteúdo orgânico.

## O que ler antes

- `producao/publicacoes.md` — ids e datas do que foi publicado
- `producao/calendario/<mes>.md` — intenção e tema planejados de cada peça
- `nucleo/aprendizados.md` — o que já se sabe (pra confirmar ou revisar, não redescobrir)

## Coleta (modo automático)

Cálculo de métrica é trabalho de script, nunca de cabeça — mesmo princípio do
`/analisar-ads`. As chamadas vivem em `scripts/desempenho-instagram.mjs` (Node, só
`fetch`, lê o `.env`). Se o script ainda não existe, criar na primeira execução pedindo
aprovação do código ao usuário. O script deve:

1. Ler os ids de `producao/publicacoes.md`.
2. Buscar por publicação: alcance, impressões, salvamentos, compartilhamentos,
   curtidas, comentários, visitas ao perfil e cliques no link quando disponíveis.
3. Calcular taxas (salvamento/alcance, compartilhamento/alcance, interação total/alcance)
   e imprimir tabela ordenável em texto — números prontos, zero aritmética pro modelo.
4. Erro de API: imprimir a resposta literal. Token expirado é a causa mais comum
   (renovar pelo guia do `/publicar`).

## Análise — separar sinal de ruído

Cruzar número com o que o calendário diz sobre cada peça (tema, formato, intenção):

- **Sinais fortes:** salvamentos e compartilhamentos (indicam valor real); novos
  seguidores atribuíveis. Curtida é o sinal mais fraco — nunca ranquear só por ela.
- Comparar **dentro do mesmo formato** (carrossel com carrossel) antes de comparar
  formatos entre si.
- Procurar padrão, não pico: um post viral isolado é anedota; três posts de "ensinar"
  superando todos os de "vender" é padrão.
- **Validar fórmulas:** quando a peça registrou a fórmula usada (de `docs/formulas.md`),
  cruzar molde × resultado e atualizar o status da fórmula no arquivo — promover a
  **validada aqui** ou rebaixar a **não funciona neste nicho** (duas tentativas fracas).
- Menos de ~8 peças publicadas no período → relatório sai, mas conclusões marcadas
  como **tendência fraca (amostra pequena)**, não como aprendizado consolidado.

## Saídas

**1. Relatório do período** em `producao/relatorios/desempenho-<YYYY-MM>.md`:
tabela completa por peça, top 3 / bottom 3 com hipótese do porquê em uma linha cada,
e recomendação concreta pro mês seguinte (o que aumentar, o que cortar, o que testar).

**2. Aprendizados duradouros** em `nucleo/aprendizados.md` — só o que sobrevive ao mês:
padrões confirmados ("carrossel de erro comum salva 3x mais que dica solta"), não
números crus nem casos isolados. Cada entrada com data e evidência em uma linha.
Aprendizado novo que contradiz um antigo → revisar o antigo, não acumular contradição.

**3. Status no calendário** — marcar as peças medidas.

## Fechar o ciclo

Ao terminar, conectar com o planejamento:

> "Esses aprendizados já ficam valendo: o próximo `/calendario` monta o mês lendo o que
> funcionou aqui. Quer que eu já monte?"

## Regras

- Número só de fonte real (API ou informado pelo usuário). Estimativa inventada não
  entra em relatório nem em aprendizado — nunca.
- Cálculo no script, interpretação no modelo. Nada de aritmética "de cabeça".
- `nucleo/aprendizados.md` é destilado, não arquivo morto: máximo ~15 entradas vivas;
  aprendizado superado é removido ou revisado.
- Sem auto-elogio: se o mês foi fraco, o relatório diz que foi fraco e por quê.
- Token e credencial jamais aparecem em log, relatório ou conversa.
