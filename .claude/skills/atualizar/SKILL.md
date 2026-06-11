---
name: atualizar
description: >
  Use quando o núcleo pode ter envelhecido em relação à realidade — "/atualizar",
  "revisa minha memória", "isso ainda tá certo?", "faz uma varredura", depois de
  períodos sem usar o sistema, ou quando uma resposta saiu baseada em informação
  claramente velha. Compara nucleo/, marca/ e clientes/ com o estado real do workspace,
  propõe correções cirúrgicas e recalcula o degrau da Escada de Contexto.
---

# /atualizar — O núcleo encontra a realidade

Memória que envelhece vira mentira contada com confiança. Esta skill confronta o que
os arquivos de contexto afirmam com a evidência que o workspace acumulou — e, exclusivo
do ImpulsoX-OS, recalcula o degrau da Escada: informação nova que entrou sem ninguém
registrar pode significar um degrau acima; promessa antiga não cumprida, um degrau
marcado a mais do que existe.

Autoria: ImpulsoX AI. Conteúdo original.

## Passo 1 — Levantar a evidência

Inventariar o workspace (sem ler arquivo por arquivo — estrutura e datas bastam pra
começar; abrir só o que levantar suspeita):

- Pastas em `clientes/` — cada uma é um cliente que o núcleo da agência deveria conhecer
- `producao/` — calendários, peças, relatórios e suas datas (o que foi feito de verdade)
- `dados/` — entrou export de ads ou analytics que ninguém processou?
- `marca/` — design-guide e tokens preenchidos? logo presente?
- `.claude/skills/` — skills criadas pelo `/automatizar` que o CLAUDE.md não menciona
- `producao/publicacoes.md` e `producao/relatorios/` — publicou-se sem medir?

## Passo 2 — Confrontar com o que a memória afirma

Pra cada arquivo de contexto, a pergunta é a mesma: **isso ainda é verdade?**

- `nucleo/negocio.md` — serviços, preços e clientes citados batem com as pastas e peças
  produzidas?
- `nucleo/foco.md` — o arquivo mais perecível do sistema: datas passaram? a meta "até
  [mês]" venceu? a sazonalidade citada já era?
- `nucleo/voz.md` — as últimas peças aprovadas seguem o tom descrito, ou o usuário foi
  corrigindo na prática e ninguém atualizou o arquivo?
- `nucleo/aprendizados.md` — entradas com mais de ~6 meses ainda valem?
- `nucleo/escada.md` — **recalcular o degrau pelos critérios do CLAUDE.md:**
  - subiu sem registro? (ex: `dados/ads/` tem exports → degrau 4 disponível; entrevista
    aconteceu na conversa mas a escada ainda diz 1)
  - está inflado? (escada diz 3, mas `voz.md` segue cheio de "_a confirmar_")
  - suposições listadas que o cliente já confirmou em peças aprovadas → promover a fato
- `marca/design-guide.md` — coerente com as últimas peças geradas?
- `clientes/<nome>/` — mesma checagem, escada própria de cada um (só quando o usuário
  pedir varredura geral ou estiver trabalhando nesse cliente)

## Passo 3 — Propor, nunca aplicar no escuro

Lista curta, cada item com a evidência:

```
Encontrei [n] pontos desatualizados:

1. nucleo/foco.md diz "lançamento em março" — estamos em [mês], e producao/ mostra
   o lançamento concluído. Proposta: registrar como concluído e perguntar o foco novo.
2. nucleo/escada.md marca degrau 1, mas dados/ads/ tem 2 exports de [data].
   Proposta: rodar /analisar-ads e subir o eixo de dados pra degrau 4.
3. [...]

Aplico tudo, só alguns, ou nada?
```

## Passo 4 — Aplicar com cirurgia

Só o aprovado. Linha relevante, sem reformatar o arquivo; mostrar cada mudança feita.
Informação que precisa de resposta do usuário (foco novo, meta nova) → perguntar, não
inventar. Fechar atualizando `nucleo/escada.md` com o degrau recalculado e a data da
varredura.

## Regras

- Evidência ou nada: ponto sem prova no workspace não entra na lista.
- Nunca apagar memória — corrigir, marcar como vencida ou perguntar. Histórico do que
  mudou fica no git (`/salvar`).
- Ambiguidade (pasta vazia com nome de cliente, peça sem data) → perguntar, não supor.
- Tudo coerente? Dizer "núcleo bate com a realidade, nada a mudar" e parar — varredura
  limpa também é resultado.
- Sugerir esta skill quando o sistema notar contradição entre núcleo e realidade no
  meio de outra tarefa — não esperar o usuário descobrir sozinho.
