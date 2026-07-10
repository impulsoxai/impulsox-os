---
name: detectar-ia
description: >
  Use antes de publicar um artigo, página ou post longo pra medir quanto o texto vai
  soar de IA num detector, e ANTES de colar num GPTZero/Originality da vida. Também
  quando o usuário disser "roda o detector", "quanto dá de IA nesse texto?", "isso tá
  com cara de IA?", ou trouxer um score de detector externo preocupado. Skill de apoio.
---

# /detectar-ia — Termômetro de cara-de-IA (pré-publicação)

Roda um índice 0-100 sobre o texto e aponta os trechos que vão pesar num detector, pra
afiar ANTES de publicar. **É termômetro, não juiz** — não trava nada, informa.

> **A verdade que ancora a skill.** Detector de IA é estatisticamente não-confiável:
> falso-positivo alto (a Bíblia e a Declaração de Independência são flagradas como IA),
> a OpenAI desligou o próprio detector em 2023. Escrita BOA e clara pontua parecido com
> IA. Então o alvo NUNCA é "zerar o detector" — é o texto ser bom, específico e com a
> voz da marca. O índice aqui é um **termômetro relativo**: só significa algo comparado
> ao chão dos exemplares Fable (~9). Perto do chão = ótimo. Perseguir zero é diluir texto bom.

## Como roda

1. Salvar o texto num arquivo (se só existe no chat, jogar no scratchpad).
2. Rodar: `node scripts/detectar-ia.mjs <arquivo>`
3. Ler o índice + a quebra por sinal + os trechos culpados por linha.
4. **Se o índice está acima do chão +15** (ex.: > ~24): pegar os trechos apontados e
   mandar pro `/escritor-br` afiar SÓ esses trechos (não reescrever o texto todo).
5. Re-rodar pra confirmar que caiu. Repetir até chegar perto do chão OU até sobrar só
   especificidade humana (número, nome, cena) que não se deve diluir.

## O que os 4 sinais querem dizer (e o que o /escritor-br faz com cada um)

- **Burstiness alto** (frases do mesmo tamanho) → o `/escritor-br` quebra o ritmo: frase
  curta depois de longa, de propósito. É o sinal de maior peso (40%).
- **Densidade de tells alta** → cortar os tells apontados por linha; a tabela do
  `/escritor-br` (e o `lib-humanizador.mjs`) cobre cada um, inclusive os de substância
  (significance inflation, vague attribution).
- **Repetição de n-grama alta** → a mesma construção de frase se repete; variar.
- **Abertura uniforme alta** (parágrafos abrindo com conector ou a mesma palavra) → o
  `/escritor-br` reabre cada parágrafo com fato, número, nome ou afirmação seca, nunca
  conector. Cuidado: molde de guia proposital ("O que volta:" após cada pedido) é assinatura
  sua, não tique. O sinal aponta; você decide se é seu molde ou monotonia.

## A régua (anti-perseguição de zero)

- **Não diluir o específico pra baixar número.** Número exato, nome próprio, cena
  concreta são HUMANOS, não tell — o `/escritor-br` chama isso de freio de falso-positivo.
  Se o que sobra pesando é especificidade, o texto está pronto mesmo com índice médio.
- **O único redutor honesto de detector EXTERNO é densidade de VOZ, não truque de
  vocabulário.** Evidência medida num caso real (ImpulsoX AI, 10/07/2026, GPTZero):
  pillar só-modelo 72% → com 3 injeções da voz do dono 64% → peça majoritariamente
  dele 45%. Texto neutro com índice alto → o caminho é a seção "AMOSTRA [NOME]" da
  `nucleo/voz.md` (1ª pessoa, opinião, convite, fecho com calor), nunca trocar
  palavra clara por palavra rebuscada.
- O chão dos exemplares é ~9 (medido, não chutado). Até texto ótimo tem 1 tell afiável;
  índice baixo com 1 trecho apontado é normal, não é reprovação.

## O que NÃO é

- Não reescreve (isso é o `/escritor-br`).
- Não trava publicação (o gate duro que trava é o `lib-humanizador.mjs`, dentro do escritor-br).
- Não reproduz o número do GPTZero (fórmula fechada; isto é um proxy relativo honesto).
- O chão ~9 é calibração interna do motor: quando o `/formulas` fizer o refresh mensal
  dos tells, o teste-guarda de `detectar-ia.test.mjs` avisa se o número saiu do lugar.

---

**✓ Pronto:** índice de cara-de-IA medido + trechos apontados · **↩ esta é uma skill de apoio:** o próximo passo é o `/escritor-br` afiar os trechos que pesam; depois re-rodar aqui pra confirmar. O gate frio final continua sendo o `/revisar`.
