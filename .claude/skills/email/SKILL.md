---
name: email
description: >
  Use para escrever e-mail que vende sem soar spam — "/email", "sequência de boas-vindas",
  "newsletter", "e-mail pro lead", "follow-up da proposta", "nutrir minha lista", ou quando
  o `/criar-ebook` entrega a isca (boas-vindas) e o `/proposta` precisa de follow-up. Produz
  os três tipos de e-mail da casa — sequência de boas-vindas, newsletter mensal e follow-up
  de proposta — na voz da marca, com prova só autorizada e LGPD respeitada.
---

# /email — Sequências, newsletter e follow-up

E-mail é o único canal que o negócio realmente possui — não depende de algoritmo. Mas lista
queima rápido quando o e-mail é só venda. Esta skill escreve para a régua da casa: entregar
valor primeiro, vender com objeção respondida, nunca tom de cobrança. Todo texto sai na voz
do dono e passa pelo `/escritor-br` antes de ir.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Precisa do **degrau 2** (voz definida) — e-mail genérico na caixa de entrada é deletado na
primeira linha. Sem `nucleo/voz.md` rico, avisar que o resultado melhora muito depois do
`/voz` e seguir com o tom provisório.

**Pré-requisito de infra (separado do degrau de voz):** ESCREVER bem pede o degrau 2;
**DISPARAR** de verdade pede a Camada 0 do `docs/entregabilidade-email.md` — domínio com
SPF/DKIM/DMARC, one-click unsubscribe, reputação. Pode escrever a sequência sem isso, mas só
declarar "pronta pra ar" quando a infra estiver resolvida. Conferir com o dono qual ferramenta
de envio ele usa (ela costuma resolver a autenticação) — não assumir que está feito.

- **DMARC sai do `p=none` — ele é só a partida.** `p=none` serve pra observar (recebe relatório,
  não protege); o destino é **`p=quarantine`** e depois **`p=reject`**, que é o que Gmail/Yahoo
  passaram a exigir de quem dispara em volume. Domínio parado em `p=none` está exposto a spoofing
  e perde entregabilidade — avançar a política conforme os relatórios mostram que o tráfego
  legítimo está alinhado.
- **Reclamação de spam é o limiar que mata a lista.** Alvo **≤ 0,10%** de spam complaints; o
  **teto de emergência é 0,30%** — passar disso e o Gmail começa a bloquear/jogar tudo na lixeira
  (a régua oficial do Gmail desde 2024). Por isso a lista só recebe quem pediu (LGPD abaixo),
  o descadastro é fácil (one-click) e o conteúdo entrega valor — reclamação alta vem de e-mail
  não pedido ou só-venda. Acompanhar a taxa pelo painel da ferramenta de envio.

## O que ler antes

- `docs/gabarito-execucao-texto.md` — **PRIMEIRO**: gates de qualidade do texto (2 passes de copy, proibições por busca literal, gate específico desta skill no §6, aceite). Nenhum gate é opcional
- `nucleo/voz.md` — a voz manda em assunto, abertura e fecho de cada e-mail
- `nucleo/ofertas.md` — a oferta que a sequência empurra, com benefício e objeções
- `nucleo/provas.md` — só prova com status **autorizada** entra no corpo
- `docs/persuasao.md` — gatilhos honestos; o contrato do assunto (entrega o que promete)
- `docs/hooks.md` — o ASSUNTO é hook: nasce com 2-3 variações de mecânicas diferentes
  (regra da casa); a variação vencedora vem da taxa de abertura medida
- `docs/entregabilidade-email.md` — a régua de palavras/formatação que tiram o e-mail da
  caixa de entrada; é o **gate** antes de fechar qualquer assunto, preview ou corpo

## E-mail legível por IA — o inbox virou ambiente mediado (jan/2026)

Desde jan/2026 o Gmail roda Gemini no inbox (AI Overviews + AI Inbox — CNBC, jan/2026):
a IA **resume o e-mail antes de a pessoa abrir** e **despriorização atinge até ~40% dos
e-mails que chegam** (Folderly, 2026); o CTR médio já caiu (~4,35% → ~3,93%). O resumo da
IA é o novo preview — regras novas, válidas pros 3 modos:

1. **O 1º parágrafo tem que sobreviver a um resumo de 1 frase.** Se o Gemini resumir só a
   abertura, o leitor ainda recebe a promessa + o próximo passo? Escrever o parágrafo 1
   como se fosse o e-mail inteiro.
2. **Informação-chave nos primeiros 100-200 caracteres do corpo** (Bloomreach, 2026) —
   valor CONCRETO antes de linguagem emocional; a IA prioriza e resume o específico.
3. **Teste do sumarizador no gate:** antes de fechar, resumir o e-mail em 1 frase; se a
   frase não carrega oferta/valor/ação, reescrever a abertura.

**Plain-text vs HTML — decisão por modo (não por gosto):** HTML pesado sinaliza marketing
e cai em Promoções; texto simples lê como mensagem 1-a-1 (SendCheckIt):
- **Follow-up de proposta → plain-text OBRIGATÓRIO** (é conversa comercial 1-a-1, não peça).
- **Boas-vindas → plain-text ou HTML mínimo** (logo + texto; o lead quer a isca, não design).
- **Newsletter → HTML leve** (imagem só quando carrega conteúdo; nunca e-mail-imagem).

**Higiene de lista (sunset) — o driver de reputação nº 1 em 2026:** quem não abre/clica há
90-120 dias sai do envio regular (vai pra reativação do `/reativar` ou sai de vez).
Mandar pra lista morta derruba a reputação do domínio inteiro — cortar a lista é o que
mantém o resto entregando. Lembrar o dono disso a cada newsletter.

## Três modos

Decidir cedo qual se aplica (o pedido ou o handoff já indica).

### 1. Boas-vindas pós-isca (handoff do `/criar-ebook`)
Quem baixou a isca levantou a mão — é o lead mais quente que existe. Sequência de **4-5
e-mails**. **O 1º sai NA HORA** (automático, no segundo em que ele se cadastra — é quando a
atenção e a confiança estão no pico) e a **janela de ouro são as primeiras 48h pós-signup**:
concentrar os e-mails que mais constroem relação aí, enquanto a marca ainda está fresca. Lead
que recebe o 1º e-mail só horas depois já esfriou. Os primeiros toques saem mais juntos
(dia 0 na hora, dia 1, dia 2), depois espaçam:
1. **Entrega da isca** — o link/arquivo, sem enrolação, e o próximo passo de leitura. **Dispara
   imediato** no cadastro, não em lote diário.
2. **Melhor conteúdo** — o material mais forte do negócio sobre o tema da isca (constrói
   autoridade antes de vender).
3. **Prova autorizada** — caso ou depoimento real (de `nucleo/provas.md`) que mostra o
   resultado possível.
4. **Oferta com objeção respondida** — a oferta ligada à isca, com a principal objeção de
   `nucleo/ofertas.md` desarmada no corpo.
5. **Convite direto** — chamada única e clara para a ação (falar, agendar, comprar).
Sugerir intervalos (ex.: dia 0 **na hora do cadastro**, dia 1, dia 2, dia 4, dia 7 — peso na
janela de 48h) — ajustar ao ciclo do negócio.

**Variante longa — o arco de 7 dias (funil de keyword/lead magnet forte, método
ScaleUP/Sprint jul/2026):** quando a isca é robusta (vídeo-treinamento + material denso) e a
oferta pede mais aquecimento, esticar pra 7 e-mails com um trabalho POR dia: d1 entrega +
arma a série · d2 o frame macro (por que AGORA, janela real, sem escassez fabricada) · d3
credibilidade por HISTÓRIA — a lição cara, a cicatriz (confiança por vulnerabilidade) · d4 a
ideia central contrária, o e-mail mais encaminhável (CTA suave entra aqui) · d5 prova por
caso específico · d6 a MATEMÁTICA da oferta (argumento quantitativo) · d7 fechamento com
DUAS portas (entrada de baixo atrito + alta intenção). Régua de forma: 1 ideia e 1 CTA por
e-mail, <250 palavras, legível em 90s no celular; CTA suave d2-3 → médio d4-5 → duro d6-7;
**todo e-mail tem P.S. que trabalha** (não decorativo).

### 2. Newsletter mensal
Reaproveita o que o mês já produziu: ler `producao/` (o que `/conteudo` e `/post` geraram).
Estrutura: **1 ideia central** (o tema do mês, com a opinião do dono) + **2-3 notas curtas**
(novidades, links, bastidor) + **1 CTA** única. Newsletter é relação, não folheto — a venda
entra leve, no rodapé.

### 3. Follow-up de proposta (handoff do `/proposta`)
Proposta enviada e silêncio não é "não" — é falta de follow-up. **3 toques**, nunca tom de
cobrança:
1. **Resumo do valor** — relembra o resultado prometido, não o preço.
2. **Prova / caso** — um caso parecido que fechou e deu certo (prova autorizada).
3. **Pergunta de fechamento** — uma pergunta aberta que convida à resposta ("faz sentido
   seguir, ou o momento não é agora?"), nunca "e aí, decidiu?".
Sugerir intervalos (ex.: dia 2, 5, 9 após o envio da proposta).

## Gate de entregabilidade (antes de fechar cada e-mail)

Depois de escrever assunto + preview + corpo, e **antes** do `/escritor-br`, varrer cada peça
contra `docs/entregabilidade-email.md`: palavra de promessa/pressão/phishing, CAIXA ALTA,
`!!!`, excesso de link, urgência falsa. Sinalizou → reescrever a linha (padrões seguros do
doc) e revarrer. O assunto é o campo mais sensível — varrer com mais rigor. E-mail bem escrito
que cai no spam não vende; este gate é tão obrigatório quanto o `/escritor-br`.

## Saída

`producao/emails/<tipo>-<slug>/` (ex.: `boas-vindas-ebook-trafego/`):
- um `.md` por e-mail, cada um com **assunto** + **preview** (a linha de prévia) + **corpo**
- `sequencia.md` — a ordem dos e-mails e os intervalos sugeridos entre eles

## Regras

- **Todo texto passa pelo `/escritor-br`** — nenhum e-mail sai com cara de IA.
- Prova só **autorizada** (`nucleo/provas.md`); sem prova real, a peça troca de ângulo ou
  espera — nunca inventa caso ou número.
- **LGPD inegociável:** só escrever para quem deu contato **voluntariamente** (baixou isca,
  pediu proposta, assinou a lista). Não construir lista comprada nem fazer disparo a frio.
  - **Base legal explícita:** registrar QUAL base sustenta cada lista — consentimento (art. 7
    LGPD: quem baixou isca/assinou) ou legítimo interesse/soft opt-in (cliente que já comprou).
    É o que a ANPD cobra; lista sem base identificável não dispara.
  - **One-click unsubscribe, não só link no rodapé:** descadastro no header (RFC 8058) +
    cumprido em **até 48h** — exigência de Gmail/Yahoo desde 2024 e da LGPD. Ver Camada 0 do
    `docs/entregabilidade-email.md`. Verificar se a ferramenta de envio injeta o header.
- Assunto cumpre o que promete (contrato do hook) — clickbait queima a lista e a reputação
  de envio.
- **Gate de entregabilidade obrigatório** (`docs/entregabilidade-email.md`): varrer assunto e
  corpo por palavra/formatação de spam antes de fechar. Reescrever hype em linguagem plana.
- **Métrica de sucesso é CLIQUE/CTOR, não abertura.** O Apple Mail Privacy Protection (MPP)
  pré-carrega imagens e infla a taxa de abertura — abertura virou número fantasiado, não mede
  interesse real. A régua passou a ser **clique** e **CTOR** (click-to-open rate: cliques ÷
  aberturas). Open rate só serve, com ressalva, pra comparar A/B de assunto na mesma base — nunca
  como prova de que a campanha funcionou. Toda métrica entra em relatório só de **export real**
  da ferramenta de envio; nunca estimar de cabeça.
- Uma CTA por e-mail. E-mail que pede três coisas não consegue nenhuma.

## Teste de aceitação (comportamental)

1. Handoff do `/criar-ebook` → sequência de 4-5 e-mails com intervalos, prova só autorizada,
   descadastro presente.
2. Newsletter → puxa material real de `producao/`, 1 ideia central + notas + 1 CTA.
3. Follow-up de proposta → 3 toques sem tom de cobrança; o último é pergunta aberta.
4. Lista sem origem voluntária declarada → a skill recusa o disparo a frio e explica a LGPD.
5. Assunto com palavra de spam ("oferta imperdível", CAIXA ALTA, "!!!") → o gate sinaliza e
   reescreve em linguagem plana antes de fechar; revarre limpo.

---

**✓ Pronto:** sequência de e-mails pronta (assunto, corpo, intervalos, descadastro) · **→ próximo passo:** sequência que VENDE (oferta, lançamento, win-back) passa pelo `/revisar` antes do disparo (regra do CLAUDE.md: peça de venda não vai ao ar sem crivo frio). Em follow-up de proposta, é a etapa final — aguardar a resposta e, quando vier, voltar pra `/proposta`; com tráfego rodando, `/analisar-ads` mede o retorno. Fora isso, a sequência fecha aqui.
