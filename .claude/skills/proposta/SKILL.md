---
name: proposta
description: >
  Use quando um diagnóstico ou conversa comercial precisa virar proposta fechável —
  "/proposta", "monta a proposta pro cliente X", "transforma esse raio-x em proposta",
  "preciso mandar orçamento", ou logo após o /raio-x impressionar um prospect.
  Produz proposta comercial premium (HTML com a marca + PDF): situação atual, escopo
  em fases, prova, investimento com opções e um próximo passo único.
---

# /proposta — Do diagnóstico ao contrato

O `/raio-x` abre a porta ("olha o que está custando cliente pro seu negócio"); esta
skill fecha o ciclo: transforma o diagnóstico em proposta que o decisor entende,
compara e aprova. Mesmo padrão visual premium da `/pagina` — a proposta também vende
a qualidade de quem a fez.

Autoria: ImpulsoX AI. Conteúdo original.

## O que ler antes

- O diagnóstico do `/raio-x` do prospect (se existe — é a melhor matéria-prima)
- `nucleo/negocio.md` e `nucleo/provas.md` **da agência/de quem propõe** — serviços,
  diferencial e os casos que sustentam a proposta
- `docs/persuasao.md` — a proposta é peça de persuasão; regras inegociáveis valem
- `marca/` de quem propõe — identidade visual da proposta

## O que perguntar (só o que falta)

1. **Escopo pretendido:** o que vai ser vendido? (do diagnóstico ou da conversa)
2. **Preço:** quem define é o dono — perguntar valor (ou faixa) de cada opção. O
   sistema estrutura e ancora; **nunca inventa preço**.
3. **Prazo e condições:** início, duração, forma de pagamento.
4. **Validade real da proposta** (gera a urgência honesta).

## Estrutura persuasiva (nesta ordem)

1. **Onde o negócio está** — espelho do diagnóstico: os 2-3 problemas que mais custam,
   com o dado do raio-x (aversão à perda honesta: nomear o custo de seguir assim).
   O prospect precisa se reconhecer na primeira página.
2. **Onde dá pra chegar** — a foto do depois, concreta, sem prometer número garantido.
3. **Como — o plano em fases** — escopo claro por fase: o que será feito, o que entrega,
   em quanto tempo. Fase 1 com vitória rápida visível (gera confiança pro resto).
4. **Por que a gente** — 1-2 provas do `nucleo/provas.md` (caso com número vale ouro
   aqui; status "uso interno" pode, é peça um-a-um).
5. **Investimento** — 2-3 opções nomeadas pelo resultado, não por "bronze/prata/ouro".
   A do meio é a recomendada (ancoragem: a de cima dá referência, a de baixo dá porta
   de entrada). Preço por extenso, sem asterisco escondido.
6. **Próximo passo único** — uma ação, clara: "responde este e-mail / chama no WhatsApp
   até [validade] que agendamos o início". Validade real, destacada uma vez, sem
   contagem regressiva teatral.

## Produção

1. Montar o conteúdo e aprovar com o usuário antes do visual.
2. HTML premium com a marca de quem propõe (padrão `/pagina`: tokens, tipografia
   hierárquica, mobile-first — proposta é lida no celular) + PDF.
3. Salvar em `clientes/<nome>/proposta-<YYYY-MM-DD>.html` (+ `.pdf`) ou
   `producao/propostas/` se o prospect ainda não tem pasta.
4. Registrar no fim da pasta do cliente: data de envio, validade, status (enviada /
   negociando / fechada / perdida) — insumo pro follow-up.

## Regras

- Preço, prazo e condição: sempre do dono. O sistema sugere estrutura de opções,
  nunca o valor.
- Sem promessa de resultado garantido ("vamos dobrar suas vendas") — a foto do depois
  é direção, não contrato; dizer isso na própria proposta gera mais confiança.
- Escopo sem ambiguidade: o que NÃO está incluso aparece escrito (briga futura
  evitada na assinatura).
- Texto passa pelo `/escritor-br`; peça inteira respeita as regras do
  `docs/persuasao.md` (máx 2 gatilhos: aqui, aversão à perda + prova).
- Proposta perdida vira aprendizado: perguntar o motivo e registrar no
  `nucleo/aprendizados.md` quando o usuário souber.
