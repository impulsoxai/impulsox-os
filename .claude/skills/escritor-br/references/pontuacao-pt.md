# Pontuação do português — a régua da casa

> Criado em 11/07/2026 a pedido do dono do negócio ("siga as regras do português, veja onde coloca
> vírgula, ponto ou continua a frase"), depois de dois-pontos de enumeração vazarem no
> uma peça real. Duas camadas: primeiro a NORMA CULTA (o que a gramática permite),
> depois a VOZ DA CASA (o que o dono usa de fato — mais restrita que a norma).
> Princípio da norma: pontuação marca a SINTAXE da frase, não a respiração de quem fala.
> Fontes: Norma Culta, Português.com.br, Descomplica (guias de gramática, consultados 07/2026).
>
> **Ortografia e ACENTUAÇÃO seguem a norma SEMPRE — sem exceção.** As amostras do dono
> dão a VOZ (ritmo, vocabulário, postura), não a gramática: ela escreveu rápido e avisou
> que não revisou acento nem vírgula (11/07/2026). Ao imitar as amostras, imita-se o
> jeito, e corrige-se ortografia, acento e pontuação pela norma. Typo nunca é voz.

---

## 1. Vírgula ( , )

**USE quando:**
- Enumeração de itens na frase: "página, posts e conteúdo".
- Elemento deslocado no começo: "No primeiro mês, a ImpulsoX opera tudo."
- Aposto e explicação intercalada: "A Anthropic, dona do Claude, lançou..."
- Vocativo: "Boa noite Paulo, tudo bem?" (em publicado: "é só chamar, Paulo").
- Antes de "mas", "porém", "só que": "achei que fosse um carro, só que a luz estava alta".
- **Antes de "e" quando os SUJEITOS são diferentes:** "É a hora que o dinheiro escapa,
  e ninguém tem tempo de perseguir" (sujeito 1 = o dinheiro, sujeito 2 = ninguém →
  vírgula recomendada pela norma). Mesmo sujeito → sem vírgula: "Ela cruza a fatura e
  escreve o lembrete". (Regra conferida a pedido do dono do negócio, 11/07/2026.)
- Ações encadeadas em sequência (o ritmo do dono): "foi chegando perto, a luz estava
  alta, eu parei e fiquei olhando".

**NUNCA:**
- Entre sujeito e verbo: ~~"O sistema, roda na sua máquina"~~ → "O sistema roda na sua máquina".
- Entre verbo e complemento na ordem direta: ~~"A gente entrega, o sistema pronto"~~.

## 2. Ponto final ( . )

O sinal PADRÃO da casa. Fecha uma ideia completa antes da próxima começar.
- Ideia nova = frase nova. Na dúvida entre vírgula, dois-pontos ou travessão → **ponto**.
- É o substituto oficial do travessão banido (regra de 09/07) e do dois-pontos retórico.
- Frase curta seca é recurso legítimo da voz: "fui para a frente da casa, e nada."

## 3. Dois-pontos ( : )

A norma culta permite antes de enumeração, citação e esclarecimento. **A voz da casa quase
nunca usa** — as amostras do dono têm ZERO dois-pontos retórico ou de enumeração.

**Como reescrever (na ordem de preferência):**
| Padrão com ":" | Reescrita na voz da casa |
|---|---|
| "Trabalha nos arquivos: monta o relatório, organiza a planilha." | "Trabalha nos arquivos. Monta o relatório, organiza a planilha." |
| "O acerto vem do contexto: preço, regra, jeito de atender." | "O acerto vem do que ela sabe do seu negócio, como preço, regra e jeito de atender." |
| "Ela gosta: de ler e escrever." (erro de norma) | "Ela gosta de ler e escrever." (integra na frase, sem sinal) |
| "Ele disse: que não vem." (erro de norma) | "Ele disse que não vem." |

**Onde ":" segue permitido (isenções do gate):**
- Rótulo de layout/metadado ("Fonte:", "O que volta:", frontmatter "slug:").
- Abrindo lista VERTICAL (itens em linhas próprias com marcador ou número).
- URL e horário.
- Budget de 1 retórico por peça — pra quando a frase realmente pede. Acima disso o gate FALHA.

**Erros de norma que o ":" costuma esconder:** dois-pontos logo após verbo ("gosta: de ler")
e antes de "que" ("disse: que") são ERRO gramatical, não estilo — nunca passam.

## 4. Ponto e vírgula ( ; )

Norma: pausa entre a vírgula e o ponto; itens longos de lista; linguagem de lei e regulamento.
**Voz da casa: não usa.** Onde caberia ";", a casa põe ponto final. (Exceção única: código.)

## 5. Reticências ( ... )

O dono pode usar para enumeração aberta, e só para isso: "uma automação, CRM, Dashboard...".
Nunca para suspense ou hesitação em peça publicada.

## 6. Exclamação ( ! )

Só em pico emocional REAL, no máximo 1-2 por texto longo (amostras: "Até que chegou o dia
que eu vi!", "vai dar certo!"). Nunca dupla (!!) — o gate falha. Nunca em título de venda.

## 7. Interrogação ( ? )

Pergunta direta e concreta: "Você conseguiu ler a proposta?".
**Vício a corrigir ao imitar as amostras:** "?" em frase afirmativa ("Gostaria de saber
se você leu?" / "sempre fiquei intrigada de onde nós viemos?") — em publicado, ou vira
pergunta direta ou vira afirmação com ponto.

## 8. Travessão ( — ) e parênteses

- Travessão: **banido** em peça publicada (regra 09/07). Substituto padrão = ponto final;
  segunda opção = vírgula; terceira = parênteses.
- Parênteses: aparte RÁPIDO, no estilo da amostra 4 ("(como se fosse uma camuflagem)").
  Máximo um por parágrafo; aparte longo vira frase própria.

---

## Teste final (antes do gate mecânico)

1. Leia a frase em voz alta. Onde a ideia FECHA, é ponto — não vírgula, não dois-pontos.
2. Tem ":" fora de rótulo/lista vertical? Reescreva pela tabela do §3.
3. Tem vírgula entre sujeito e verbo? Tire.
4. A frase tem 3+ vírgulas e não é enumeração nem ritmo narrativo? Quebre em duas.
5. Rode `node scripts/gate-voz.mjs` — o budget de ":" é contado por máquina.
