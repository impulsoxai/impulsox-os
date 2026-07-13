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

- `docs/gabarito-execucao-texto.md` — **PRIMEIRO**: gates de qualidade do texto (2 passes de copy, proibições por busca literal, gate específico desta skill no §6, aceite). Nenhum gate é opcional
- O diagnóstico do `/raio-x` do prospect (se existe — é a melhor matéria-prima)
- `nucleo/negocio.md` e `nucleo/provas.md` **da agência/de quem propõe** — serviços,
  diferencial e os casos que sustentam a proposta
- `nucleo/ofertas.md` — as ofertas viram os **blocos da proposta** (escopo, benefício e
  investimento de cada uma; a objeção da oferta antecipa a do prospect)
- `nucleo/perfil.md` — esta skill é do modo `agencia` (vender pra um prospect) ou de
  negócio próprio que fecha serviço um-a-um (`profissional-liberal`). Perfil `criador` só
  usa se for vender mentoria/serviço
- `nucleo/concorrentes.md` — se existe o dossiê do `/concorrente`, o comparativo (cliente ×
  concorrentes) ancora o "por que a gente" e a defesa de preço na lacuna que eles deixam
- `docs/persuasao.md` — a proposta é peça de persuasão; regras inegociáveis valem
- `marca/` de quem propõe — identidade visual da proposta

## Gate de timing — antes de montar (não pular)

- **Sem reunião marcada, não manda proposta.** Proposta que cai na caixa de entrada sem uma
  conversa antes vira PDF ignorado — o decisor não construiu contexto nem compromisso. A
  proposta serve a uma reunião (ao vivo ou call): apresenta-se nela, ou manda-se logo após,
  com a próxima conversa já agendada. Sem isso marcado, o passo certo é o `/email` (aquecer +
  conseguir a reunião), não a proposta. Se o dono insistir em mandar a frio, avisar o custo e
  seguir — guiar, não travar.
- **Janela dos 50 dias.** Proposta fechada em **≤50 dias** do primeiro contato fecha a ~47% de
  win rate; depois disso cai pra ~20% (Proposify, State of Proposals — base de 2,6M+ propostas).
  Deal que arrasta perde força. Calibrar a validade e o follow-up (via `/email`) pra empurrar a
  decisão dentro dessa janela — urgência honesta é manter o ritmo, não inventar prazo teatral.
- **Velocidade de envio.** Proposta enviada em **≤24h da reunião** fecha ~25% mais (cobl.ai,
  sales proposal statistics, 2025) — o pico de intenção é o dia da conversa. A proposta não
  espera a semana fechar; espera no máximo o dia seguinte.

## O que perguntar (só o que falta)

1. **Escopo pretendido:** o que vai ser vendido? (do diagnóstico ou da conversa)
2. **Preço:** quem define é o dono — perguntar valor (ou faixa) de cada opção. O
   sistema estrutura e ancora; **nunca inventa preço**.
3. **Prazo e condições:** início, duração, forma de pagamento.
4. **Validade real da proposta** (gera a urgência honesta).

## Estrutura persuasiva (nesta ordem)

1. **Onde o negócio está + o custo de não agir** — espelho do diagnóstico: os 2-3 problemas
   que mais custam, com o dado do raio-x. Puxar do `/raio-x` o **custo de não-agir** em número
   (lead/venda que escapa por mês enquanto fica assim) e contrastar com o investimento da
   proposta — é o esqueleto do ROI honesto, sem prometer retorno garantido. Aversão à perda
   bem usada: o que continuar perdendo pesa mais que o que se ganha. O prospect precisa se
   reconhecer na primeira página.
   - **Abrir pela velocidade de resposta (o número que mais fecha):** chamar a `/velocidade`
     pra cravar "você responde lead em X; em <5min qualificaria ~21x mais — são ~Y leads e
     R$ Z/mês na mesa". É o custo-de-não-agir mais concreto e o argumento de maior conversão.
     Estimativa do dono se não há CRM (marcar "a confirmar"); número real se há. Nunca prometer
     o ganho — falar em potencial estimado.
2. **Onde dá pra chegar** — a foto do depois, concreta, sem prometer número garantido.
3. **Como — o plano em fases** — escopo claro por fase: o que será feito, o que entrega,
   em quanto tempo. Fase 1 com vitória rápida visível (gera confiança pro resto).
4. **Por que a gente** — 1-2 provas do `nucleo/provas.md` (caso com número vale ouro
   aqui; status "uso interno" pode, é peça um-a-um).
5. **Investimento** — 2-3 opções nomeadas pelo resultado, não por "bronze/prata/ouro".
   A do meio é a recomendada (ancoragem: a de cima dá referência, a de baixo dá porta
   de entrada). Preço por extenso, sem asterisco escondido.
6. **Plano de ação mútuo (MAP) — com mais de um nome do lado do cliente** — não só o que a
   agência faz; o que o CLIENTE faz e quando (material, aprovação, acesso) numa pequena tabela
   de datas/responsáveis. Pesquisa B2B 2026: as propostas que mais fecham trazem plano de ação
   mútuo, não só preço — ele constrói consenso e tira o "vou pensar". Cada linha: o quê · quem ·
   quando. **Multi-threading:** deal com **3+ contatos envolvidos** fecha ~42% mais que deal de
   um contato só, e ter um **sponsor executivo** (quem decide o orçamento) dentro da conversa
   multiplica o close por ~2,3x (dados de proposal software 2025 — Proposify/cobl.ai; ordem de
   grandeza, reconferir anualmente). Então o MAP nomeia mais de uma pessoa do lado do cliente — e o
   próximo passo (#7) pede pra trazer quem decide pra mesa, não deixa a proposta presa num
   contato só que pode sumir.
7. **Próximo passo único = ACEITE, não "me chama"** — e-assinatura fecha 3,4x mais e 33%
   mais rápido que proposta que termina em conversa (~21% fecham nos primeiros 5 min —
   cobl.ai/Proposify, 2025); o pico de intenção é o momento da leitura, e "responde este
   e-mail" o desperdiça. Em ordem de preferência:
   - **Link de assinatura digital** (BR, com plano grátis/barato: Clicksign, Autentique,
     ZapSign) — o dono sobe o PDF na ferramenta e o link vai NO botão final da proposta;
   - **Botão de aceite na própria proposta HTML** ("Aceito a opção [X] — iniciar") que
     registra data/hora e abre o WhatsApp com a mensagem de aceite pré-preenchida — mínimo
     viável quando o dono não quer ferramenta;
   - "chama no WhatsApp até [validade]" fica como CAMINHO SECUNDÁRIO pra quem tem dúvida,
     nunca como o CTA principal. Validade real, destacada uma vez, sem contagem teatral.

### Blindagem de escopo (os 5 elementos que evitam o projeto-pesadelo)

Scope creep quase nunca é má-fé — é documento vago (método Sprint/Matt Ganzak, jul/2026).
Todo escopo da proposta carrega os 5, escritos em português simples (lível em 3 min):

1. **Entregáveis** — lista explícita, item por item. Não está na lista = fora do escopo.
2. **Exclusões nomeadas** — o que cliente costuma pedir DEPOIS (integração extra, versão
   app, páginas adicionais, gestão de usuários): escrever que não está incluso.
3. **Política de revisão** — 1 rodada dentro de X dias da entrega; revisão = ajuste em
   algo que EXISTE; feature nova = fase nova. Definido ANTES de começar, nunca durante.
4. **Janela de aceite** — sem retorno do cliente dentro da janela de review, a entrega é
   considerada aceita (protege de projeto que nunca fecha).
5. **Sinal antes de começar** — 50% na assinatura, 50% na entrega (cliente novo, sem
   exceção; cliente de carteira pode ter condição melhor). Trabalho não começa sem sinal.

### Objeções de preço (a objeção quase nunca é o preço)

É falta de valor percebido, falta de orçamento AGORA, ou dúvida se você entrega — e cada
uma tem resposta diferente; descontar de cara é o erro mais caro. Scripts:

- "Mais do que eu esperava" → "O que você esperava? Quero entender o que faria sentido."
  E OUVIR — não preencher o silêncio; a resposta revela qual objeção é de verdade.
- "Preciso pensar" → "Claro. O que te ajudaria a decidir com confiança?"
- "Faz por menos?" → "Faço. Te mostro como fica um escopo menor." **Tira FEATURE, nunca
  margem** — nunca o mesmo escopo mais barato (é o downsell das Regras, com nome de opção:
  a versão reduzida vem nomeada e com caminho de volta pra fase 2).
- "Sem orçamento agora" → "Quando renova? Seguro este escopo e preço por 30/60 dias." →
  follow-up com data no CRM.
- "Já tentei e não funcionou" → "Me conta o que aconteceu." → ouvir e MOSTRAR a
  ferramenta viva (a demo da seção acima), não argumentar.
- "Preciso falar com sócio" → "Te preparo um resumo de 1 página pra compartilhar hoje?"
  → é a deixa do multi-threading do MAP: pedir pra trazer quem decide.

### Blindar contra as 5 razões de perda (pesquisa de 23 mil propostas — Proposify, 2025)

Estruturar a proposta já antecipando por que deals morrem — e desarmando os 3 maiores:
- **Orçamento/timing (31%)** → ter sempre uma **opção de entrada** acessível (a de baixo da
  ancoragem) e um começo rápido possível "este mês".
- **Escolheu concorrente (28%)** → o bloco "por que a gente" + o mecanismo único (o *como*
  que o concorrente não tem), não disputa de preço.
- **Sem decisão (22%)** → o plano de ação mútuo + próximo passo com data combatem a inércia;
  é a maior causa silenciosa. Tornar o "sim" o caminho mais fácil que o "deixa pra depois".

### A demo antes da proposta (quando há reunião ao vivo)

Quando o dono apresenta em reunião (não só envia o arquivo), a proposta fecha mais se
vier DEPOIS de uma demo viva — método validado (Sprint/Matt Ganzak, jul/2026; mecânica,
não conteúdo). Os 4 momentos, nesta ordem:

1. **Ferramenta VIVA na tela, não screenshot** — o CRM rodando, o site publicado, a
   página gerando em tempo real. A demo é o pitch.
2. **A frase que muda a conversa:** "isso aqui roda o MEU negócio todo dia." Vender o
   que se usa é credibilidade que concorrente não copia (e é literalmente verdade no
   nosso caso: OS + CRM próprios).
3. **Mostrar as CONEXÕES, não a peça isolada** — o agente que alimenta o CRM, o
   relatório que chega sozinho. Quem vê sistema conectado não pergunta preço,
   pergunta prazo.
4. **Prospect disse "quero" → brief NA HORA, não follow-up.** Puxar as perguntas de
   diagnóstico e preencher junto, na mesma conversa. O brief preenchido é o
   fechamento; agendar "outra call pra alinhar" esfria o sim.

## Produção

1. Montar o conteúdo e aprovar com o usuário antes do visual.
2. HTML premium com a marca de quem propõe (padrão `/pagina`: tokens, tipografia
   hierárquica, mobile-first — proposta é lida no celular) + PDF.
3. Salvar em `clientes/<nome>/proposta-<YYYY-MM-DD>.html` (+ `.pdf`) ou
   `producao/propostas/` se o prospect ainda não tem pasta.
4. Registrar a proposta como **Deal no CRM** quando há `CRM_TOKEN` (lib-crm): criar/
   atualizar o Deal com stage=proposta, valor da opção do meio e validade — é o que faz o
   follow-up dos 50 dias, o `/roi` e a `/carteira` ENXERGAREM propostas em aberto sem
   ninguém reler rodapé de arquivo. Sem token → fallback: registrar no fim da pasta do
   cliente (data de envio, validade, status enviada/negociando/fechada/perdida). Mudou o
   status → atualizar o Deal (ganhou/perdeu), não só o markdown.
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
- **Enviada em até 24h da conversa, lível em ~90 segundos.** Proposta que chega 3 dias
  depois esfria; proposta de 3 páginas não é lida. A abertura reflete a LINGUAGEM que o
  prospect usou na conversa (as palavras dele, não as nossas) e mostra o RESULTADO antes
  do método — abrir com credenciais é o anti-padrão nº 1.
- Proposta perdida vira aprendizado: perguntar o motivo e registrar no
  `nucleo/aprendizados.md` quando o usuário souber. **E perdida não morre sem downsell:**
  oferecer a oferta um degrau abaixo do catálogo (a "opção de entrada" da ancoragem, ou a
  peça modular que resolve a dor mais aguda — ver `nucleo/ofertas.md`); "não pra R$ X" muitas
  vezes é "sim pra R$ X/3". Só depois do downsell recusado o deal fecha como perdido.
- **Benchmark de close honesto (pra calibrar a expectativa do dono):** taxa de fechamento de
  proposta enviada gira em torno de **25% na mediana** e **~35% no topo** (Proposify, base
  2,6M propostas; Flowcase 2025). Serve pra ancorar o
  dono: nem toda proposta fecha, e perder 2 de 3 é normal — o jogo é mandar mais propostas
  qualificadas (com reunião antes, dentro da janela dos 50 dias, com multi-threading), não
  esperar 100%. Evita o desânimo de quem acha que "proposta que não fecha é erro".

---

**✓ Pronto:** proposta comercial fechável (HTML + PDF) com escopo, prova e investimento · **→ próximo passo:** `/revisar` **antes de enviar** (peça de venda — regra do CLAUDE.md: não sai sem crivo frio); depois `/cliente` se fechou (pluga o cliente e a produção começa) ou `/email` se ainda não respondeu (sequência de follow-up). Se faltar `nucleo/provas.md` ou `ofertas.md`, o sistema reorienta antes de montar.
