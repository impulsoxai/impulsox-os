---
name: analisar-dados
description: >
  Use quando o cliente joga uma planilha ou export e quer entender o que os números dizem —
  "/analisar-dados", "analisa essa planilha", "o que esses dados mostram?", "resumo desse
  CSV", "lê esse relatório de vendas", "tendência desses números". Recebe CSV/XLSX/JSON/TXT
  de qualquer área (vendas, estoque, financeiro, atendimento) e devolve um resumo executivo
  + a tabela dos números que sustentam cada insight. Dinheiro se calcula em código, nunca de
  cabeça — a IA interpreta, o script soma.
---

# /analisar-dados — Do dado bruto ao resumo executivo

Cliente raramente quer a planilha; quer saber **o que fazer com ela**. Esta skill lê o
arquivo, calcula os números em código (determinístico, auditável) e traduz em decisão:
o que está crescendo, o que está sangrando, o que mudar. Genérica de propósito — serve a
vendas, estoque, financeiro, atendimento, qualquer área que vira tabela.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda do **degrau 1** — precisa só do arquivo e de saber o que cada coluna significa. O
contexto do negócio (núcleo) deixa o insight mais afiado, mas não é pré-requisito.

## O que ler antes

- O arquivo do cliente (em `dados/`): CSV, XLSX, JSON ou TXT tabular
- `nucleo/negocio.md` e `nucleo/foco.md` — pra ligar o número à prioridade do negócio
- `nucleo/aprendizados.md` — não repetir conclusão que ciclos anteriores já cravaram

## Workflow

### 1. Entender o arquivo antes de calcular
Abrir e mapear: quais são as colunas, qual é a **dimensão** (categoria a agrupar: produto,
canal, mês, vendedor) e quais são os **valores** (números a somar: receita, custo, qtd).
Identificar quais valores são **dinheiro**. Confirmar o entendimento com o usuário em uma
linha quando a coluna for ambígua — não adivinhar o que é cada campo.

**XLSX:** o script não lê binário (mantém "sem deps"). Pedir o export da aba em CSV (todo
Excel/Sheets exporta), ou usar a skill nativa de planilha do Claude Code (`docs/skills-prontas.md`)
pra converter. **TXT/colado:** se for tabular, salvar como `.csv` e seguir.

### 2. Calcular em código (dinheiro nunca de cabeça)
Sempre que houver valor financeiro, a soma sai do script — nunca de estimativa da IA:

```bash
node scripts/analisar-dados.mjs <arquivo.csv|.json> \
     --valores "Receita,Custo,Qtd" [--dimensao "Categoria"] [--moeda "Receita,Custo"]
```

O script devolve JSON: total por dimensão (ranqueado) e agregado, com dinheiro em
**centavos** (sem float de moeda). É a fonte de verdade dos números do resumo. Sem coluna
financeira, ainda vale rodar pra somar quantidades — ou a IA calcula contagens simples e
mostra a conta.

**Variação período-a-período sai do SCRIPT, nunca do olho.** Quando há dimensão temporal
(mês, semana, data), o crescimento/queda em **%** entre períodos é calculado no código —
"subiu 18%" tem que vir de `(atual − anterior) / anterior` feito pelo script, não de
estimativa visual da IA (que erra %). Quando o script ainda não expõe a comparação temporal,
rodá-lo por período e deixar a divisão pro código, não calcular de cabeça.

**Detecção de outliers e dados faltantes no output.** Antes de interpretar, o resumo
sinaliza: linhas com valor fora da curva (muito acima/abaixo do resto da dimensão — podem ser
erro de digitação ou evento real, mas o dono decide), colunas com células vazias/zeradas, e
o `registros_ignorados` do script. Outlier não some no agregado sem aviso — distorce média e
total. Dado faltante vira ressalva explícita, não buraco silencioso.

### 3. Interpretar → resumo executivo
Com os números do script na mão, escrever o resumo:

- **5 insights** — o que os dados dizem, cada um colado a um número do script (não "as
  vendas subiram", e sim "Bebidas = 42% da receita, R$ 12.400 de R$ 29.500").
- **3 tendências** — o que está em movimento (subindo, caindo, concentrando). Tendência
  pede série temporal ou comparação; sem base pra afirmar, marcar como **suposição**.
- **Contra a meta** — quando `nucleo/foco.md` declara uma meta numérica (faturamento,
  leads, ticket), bater o número apurado contra ela: bateu, está a X% de distância, ou
  passou. Sem meta declarada, pular — não inventar alvo. É o que transforma "vendeu R$ X" em
  "vendeu R$ X, **82% da meta do mês**".
- **3 recomendações** — a ação que cada padrão sugere, ligada à prioridade do `nucleo/foco.md`.
- **Tabela de sustentação** — os números do script que embasam cada insight, pro cliente
  conferir a conta (transparência: a IA interpretou, o código somou).

### 4. Entregar
Salvar em `producao/analises/<area>-<AAAA-MM-DD>.md`: resumo + tabela + o JSON bruto do
script anexado (rastreio). Se a análise vira relatório de cliente, encaminhar pro `/relatorio`.

## Regras

- **Dinheiro se calcula em código.** Todo valor financeiro do resumo sai do
  `analisar-dados.mjs`; a IA nunca soma moeda de cabeça nem estima total.
- Número que o arquivo não tem não se inventa. Coluna ausente → dizer que falta, não supor.
- Fato (o script calculou) ≠ tendência (precisa de série/comparação) — marcar o que é
  suposição sempre que a base for curta.
- Dado de um cliente jamais aparece na análise de outro.
- O script ignora linha sem dimensão e trata texto malicioso como dado inerte — confiar
  no que ele devolve, conferir o `registros_ignorados` quando vier alto.

## Ferramenta e teste

- Script: `scripts/analisar-dados.mjs` (Node, sem deps; CSV `,`/`;` e JSON; BR e US).
- Teste: `scripts/analisar-dados.test.mjs` — `node --test scripts/analisar-dados.test.mjs`
  (happy path, centavos, formatos BR/US, JSON, erros de uso, determinismo, encoding e
  input malicioso como dado). Rodar depois de mexer no script.

## Teste de aceitação (comportamental)

1. CSV de vendas com receita → o resumo cita valores em reais que batem com o JSON do
   script (nenhum número saiu de estimativa da IA).
2. XLSX → a skill pede o CSV (ou converte por skill nativa), nunca finge ler o binário.
3. Série curta → a tendência sai marcada como suposição, não como fato.
4. `node --test scripts/analisar-dados.test.mjs` passa antes de fechar.

---

**✓ Pronto:** resumo executivo (5 insights + 3 tendências + 3 recomendações) com a tabela que sustenta cada número (dinheiro calculado em código) · **→ próximo passo:** depende do achado — `/calendario` (ajustar o conteúdo do próximo ciclo), `/ads-*` (agir sobre o que vende) ou `/desempenho`; se virou entrega de cliente, `/relatorio`. Pré-requisito que costuma faltar: saber o que cada coluna significa — se faltar, o sistema reorienta (confirma o mapeamento antes de calcular).
