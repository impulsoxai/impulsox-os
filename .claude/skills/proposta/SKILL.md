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

## Degrau mínimo (Escada de Contexto)

Precisa do **degrau 1** de quem propõe (oferta e diferencial). O diagnóstico do
`/raio-x` do prospect eleva muito a qualidade, mas não é pré-requisito.

## O que ler antes

- O diagnóstico do `/raio-x` do prospect (se existe — é a melhor matéria-prima)
- `nucleo/negocio.md` e `nucleo/provas.md` **da agência/de quem propõe** — serviços,
  diferencial e os casos que sustentam a proposta
- `nucleo/ofertas.md` — as ofertas viram os **blocos da proposta** (escopo, benefício e
  investimento de cada uma; a objeção da oferta antecipa a do prospect)
- `nucleo/perfil.md` — esta skill é do modo `agencia` (vender pra um prospect) ou de
  negócio próprio que fecha serviço um-a-um (`profissional-liberal`). Perfil `criador` só
  usa se for vender mentoria/serviço
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
6. **Plano de ação mútuo** — não só o que a agência faz; o que o CLIENTE faz e quando
   (material, aprovação, acesso) numa pequena tabela de datas/responsáveis. Pesquisa B2B
   2026: as propostas que mais fecham trazem plano de ação mútuo, não só preço — ele
   constrói consenso e tira o "vou pensar". Cada linha: o quê · quem · quando.
7. **Próximo passo único** — uma ação, clara: "responde este e-mail / chama no WhatsApp
   até [validade] que agendamos o início". Validade real, destacada uma vez, sem
   contagem regressiva teatral.

### Blindar contra as 5 razões de perda (pesquisa de 23 mil propostas)

Estruturar a proposta já antecipando por que deals morrem — e desarmando os 3 maiores:
- **Orçamento/timing (31%)** → ter sempre uma **opção de entrada** acessível (a de baixo da
  ancoragem) e um começo rápido possível "este mês".
- **Escolheu concorrente (28%)** → o bloco "por que a gente" + o mecanismo único (o *como*
  que o concorrente não tem), não disputa de preço.
- **Sem decisão (22%)** → o plano de ação mútuo + próximo passo com data combatem a inércia;
  é a maior causa silenciosa. Tornar o "sim" o caminho mais fácil que o "deixa pra depois".

## Produção

1. Montar o conteúdo e aprovar com o usuário antes do visual.
2. HTML premium com a marca de quem propõe (padrão `/pagina`: tokens, tipografia
   hierárquica, mobile-first — proposta é lida no celular) + PDF.
3. Salvar em `clientes/<nome>/proposta-<YYYY-MM-DD>.html` (+ `.pdf`) ou
   `producao/propostas/` se o prospect ainda não tem pasta.
4. Registrar no fim da pasta do cliente: data de envio, validade, status (enviada /
   negociando / fechada / perdida) — insumo pro follow-up.
5. **Follow-up:** proposta enviada e silêncio não é "não" — acionar `/email` pra sequência
   de follow-up (3 toques: resumo do valor → prova/caso → pergunta de fechamento, nunca
   tom de cobrança). É o que recupera proposta parada sem queimar a relação.

## Regras

- Preço, prazo e condição: sempre do dono. O sistema sugere estrutura de opções,
  nunca o valor.
- Sem promessa de resultado garantido ("vamos dobrar suas vendas") — a foto do depois
  é direção, não contrato; dizer isso na própria proposta gera mais confiança.
- Escopo sem ambiguidade: o que NÃO está incluso aparece escrito (briga futura
  evitada na assinatura).
- Texto passa pelo `/escritor-br`; peça inteira respeita as regras do
  `docs/persuasao.md` (dentro do teto de gatilhos de lá: aqui, aversão à perda + prova).
- Proposta perdida vira aprendizado: perguntar o motivo e registrar no
  `nucleo/aprendizados.md` quando o usuário souber.

---

**✓ Pronto:** proposta comercial fechável (HTML + PDF) com escopo, prova e investimento · **→ próximo passo:** `/cliente` se fechou (pluga o cliente e a produção começa) ou `/email` se ainda não respondeu (sequência de follow-up). Se faltar `nucleo/provas.md` ou `ofertas.md`, o sistema reorienta antes de montar.
