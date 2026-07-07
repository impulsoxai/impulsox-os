# Acervo — o sistema de landing page do Matt Ganzak (destilado)

> **Cartão antes da skill.** Destilado dos prints + transcript do treinamento "Day 4
> Landing Page Coder Working" (Sprint Community, Matt Ganzak, capturado 2026-07-07).
> Fonte bruta completa em `ImpulsoX-AI/material-matt/focus-pilot-workstream-landing-page.md`.
> Regra de ouro da casa vale aqui: **copiamos a MECÂNICA das regras dele, nunca o
> conteúdo** — as ofertas, os números, a biografia e a voz são do Matt. O que transfere
> é COMO ele estrutura o brief do agente e as réguas de copy/código.
>
> Lido por: `/copy` (Camadas 2-3, calibragem de força) e `/pagina` (estrutura e
> processo). Complementa — não substitui — `docs/persuasao.md`, `docs/swipe-copy.md`
> e `docs/frase-que-pega.md`.

## Por que este acervo existe

O Matt vende landing page premium há 25 anos (250k newsletter, exits reais) e opera
um agente próprio (Focus Pilot) que gera páginas sozinho. A config que ele injeta no
agente é um **gabarito testado de brief de copy+código** — o custo de descobrir essas
regras já foi pago por ele. Régua do CLAUDE.md: "copiar a fórmula de quem já faz
sucesso, não inventar".

---

## 1. As regras de VOZ que transferem (mecânica, não a voz dele)

A voz de cada negócio mora em `nucleo/voz.md` — estas são as regras ESTRUTURAIS que
o Matt fixa e que valem pra qualquer voz:

- **"The copy is the product — design stays out of the way."** A página é motor de
  persuasão, não peça de portfólio. Decisão de design que compete com a copy, perde.
- **Ritmo hard-cut:** uma ideia por linha. Se a frase precisa de vírgula, provavelmente
  são duas frases. Nível de leitura de 5ª série (nosso `/copy` já pede 6ª-7ª — o Matt
  é ainda mais agressivo; a direção é a mesma).
- **Espaço em branco é elemento de design.** Parágrafo denso = quebrar ou cortar.
- **Tension devices nomeados:** verdade contrária que para o scroll no headline;
  reticências que puxam o olho pra baixo; pergunta retórica que fabrica concordância
  ANTES do CTA aterrissar. (Casa com nossos `docs/hooks.md` e `frase-que-pega.md` —
  aqui o achado é POSICIONAL: a pergunta retórica vem imediatamente antes do CTA.)
- **Anti-patterns dele que adotamos como régua dura de landing page:**
  - CTA vago nunca: "Learn More", "Get Started", "Saiba mais", "Clique aqui" → banidos.
    CTA é ação plana e específica ("Começar por R$ X", "Falar no WhatsApp").
  - **Repetir o MESMO CTA, nunca adicionar um segundo.** Um CTA por página, ancorado
    no hero e repetido após cada bloco de prova. (Já é regra do `/copy`; o refinamento
    dele: o CTA repetido é IDÊNTICO, não uma variação — variação dilui a decisão.)
  - Zero energia de guru, zero hustle-culture, zero "destrave seu potencial".
  - Sem empilhar CTAs acima da dobra.

## 2. A dobra de abertura (o achado mais forte de copy)

> **"Lead with the hard truth or the pain, never the product. The promise comes AFTER
> the reader feels seen."**

Sequência do hero dele: **verdade dura/dor → promessa → um CTA**. A promessa só entra
depois que o leitor se reconheceu. É mais específico que o nosso PAS: define a ORDEM
dentro do hero, não só da página. Exemplo real dele (não copiar a frase, copiar a
mecânica): "Hard work does not equal validation." (verdade dura) → "AI does the work.
You run the business." (promessa) → "START THE SPRINT — $1" (CTA único e específico).

## 3. Estrutura de página (bate com a nossa, com 2 refinamentos)

Estrutura dele: HERO (dor → promessa → CTA) → PROOF (números reais) → MECHANISM (o
que a oferta inclui, concreto) → OBJECTION HANDLING → FINAL CTA. Igual à do `/copy`.
Os refinamentos que adotamos:

1. **Objeção respondida com REFRAME CONTRÁRIO, não com defesa.** "Não tenho tempo" /
   "já tentei mentoria antes" → responder virando a premissa, não justificando. A
   defesa soa vendedor; o reframe soa professor.
2. **CTA final: recompõe a promessa e repete o CTA. NENHUMA informação nova.** Fold
   final que introduz argumento novo reabre a decisão em vez de fechá-la.

## 4. Prova social — régua de especificidade

- **Só número real e específico.** Nunca "milhares de clientes satisfeitos".
- **História de cliente usa MÉTRICA DE OUTPUT, nunca cifra de renda:** "produtos
  lançados, horas economizadas, ferramentas canceladas" — nunca "faturou R$ X",
  nunca "substituí minha renda". Motivo duplo: (a) compliance (promessa de renda é
  suprimida por classificador de plataforma e atrai comprador que cancela); (b) output
  é verificável, renda não.
- **Biografia do dono é argumento válido, previsão pro leitor NUNCA.** "Construí
  negócios a R$ X/mês" (biografia, ok) vs "você vai chegar a R$ X/mês" (proibido).
  Framing aprovado: capacidade ("o que é possível construir"), nunca resultado
  garantido. Já era nossa regra de persuasão honesta — aqui ganha o teste rápido:
  *a frase prevê o futuro do leitor? reescreve.*

## 5. Regras de processo (transferem direto pro /pagina)

- **"Don't offer ten options — write the thing."** Entregar A copy, sinalizando o
  ÚNICO tradeoff que vale discussão. Não apresentar leque de 10 variações pro cliente
  escolher (paralisia). Nosso sprint de 10 headlines continua — mas a ENTREGA é 3
  finalistas com recomendação, nunca as 10.
- **Fact-check antes de entregar:** se a linha de impacto exige um claim indefensável,
  reescreve a LINHA (não defende o claim).
- **Cada página tem UM destino de funil, decidido pela temperatura do tráfego.** Frio
  → oferta gratuita/entrada; morno → oferta da comunidade/core. **Nunca mandar tráfego
  frio direto pra oferta paga cara.** (Casa com nosso `docs/formula-ads-jp.md`.)
- **Testar no mobile antes de declarar pronto.** Não é opcional.

## 6. Código (bate 1:1 com nosso padrão — confirmação externa, não novidade)

Semantic HTML + CSS moderno, zero framework pesado sem pedido explícito, mobile-first,
performance inegociável (lazy-load abaixo da dobra, sem render-blocking), WCAG 2.1 AA
como piso, **zero JavaScript decorativo** ("se não serve à conversão, não entra —
scroll-jacking, parallax, contador animado: fora, salvo pedido do dono"). Nota: nosso
eixo cinematográfico (`dna-cinematografico.md`) diverge aqui DE PROPÓSITO — quando o
posicionamento é WOW/agência, movimento é argumento de venda. A régua de decisão:
página de CONVERSÃO direta segue o Matt (copy manda, design sai da frente); página de
POSICIONAMENTO premium segue o DNA cinematográfico. Perguntar qual é o job da página
antes de escolher o regime.

## 7. Mecânica de fluxo do agente dele (pro nosso motor, não pra copy)

- **Prompt curto + referências visuais lidas ANTES de codar** — comando explícito por
  peça ("FIRST read the reference images in the source folder before writing
  anything"), redundante com a config. Redundância proposital: config diz a regra,
  prompt reforça por tarefa.
- **O bug que ele pagou pra descobrir:** o agente DIZIA que tinha lido as referências
  mas não tinha incorporado (saiu "AI slop" ao vivo). Lição: fonte declarada ≠ fonte
  usada — gate que CONFIRME o uso da referência (ex.: nosso `/premium-design` citar
  qual token/molde aplicou onde), não só assumir.
- **Gate de aprovação nomeado:** o agente narra "isso é o ponto de aprovação
  (human-in-the-loop)" e pergunta aprovar/rejeitar/iterar — em vez de "ficou bom?".
  Adotável nos fechos do `/pagina` e `/premium-design`.
- **Replicar efeito visual sem importar a lib:** ele pede "copie o ESTILO do Framer
  Motion em HTML puro" — pega a mecânica do efeito, não o pacote. Mesmo princípio do
  nosso `craft-movimento.md`.

---

## 7.5 O MODELO DE NEGÓCIO decide o site (antes de qualquer pixel)

Do treinamento "Agency Website Rebuild" (mesma fonte): a decisão de precificação
vem ANTES do código, porque ela muda a página inteira:

| Elemento | Oferta produtizada (preço fixo) | Retainer/considerada |
|---|---|---|
| CTA do hero | "Ver pacotes" / comprar direto | "Agendar conversa" |
| Preço | público e transparente | "a partir de" + qualificação antes |
| Prova | resultado por pacote | cases com número de receita/lead |
| Form | curto, estilo checkout | longo, perguntas de qualificação |
| Conteúdo | método/processo | resultado/ROI |

Teste dos 30 segundos antes de construir: *"este negócio vende X pra Y por Z,
pago assim"* — se o dono não completa a frase, resolver isso primeiro (a
construção fica 10x mais rápida com a resposta travada). Modelo híbrido: o site
tem que fazer UM caminho parecer o próximo passo óbvio — nunca dois CTAs
competindo.

**Fórmula de posicionamento do hero (variante com prazo):** "Ajudamos [comprador
específico] a conseguir [resultado específico] em [prazo específico] sem [a
coisa que ele odeia]". O prazo é o elemento que a nossa fórmula de headline
ainda não pedia explicitamente — quando há prazo real entregável, ele entra.

**Site de agência/serviço: 5 páginas é o suficiente** (Home, Serviços, Cases,
Sobre, Contato/Aplicação) — "anything more is procrastination disguised as
ambition". E a regra de corte por seção: constrói confiança OU aproxima do CTA;
não faz nenhum → sai.

## 8. O método de CONSTRUÇÃO dele (pré-Focus Pilot): Brief → PRD → Prompts → Loop → Ship

Da aula "Build a landing page from a brief" (Sprint vídeo 4, fonte bruta em
`ImpulsoX-AI/material-matt/sprint-video4-landing-from-brief.md`). É o método manual
que o Focus Pilot depois automatizou — e as disciplinas transferem pro nosso `/pagina`:

- **PRD antes de código, com gate de revisão barato:** *"Fixing it in the PRD takes
  30 seconds. Fixing it after four prompts takes much longer."* Nosso `/pagina` já
  tem etapas; o refinamento dele é o CHECKLIST de aprovação do plano: toda feature
  necessária (e nenhum nice-to-have), critério de "pronto" explícito (mobile, form
  envia, toggle funciona), **máximo 6 blocos de construção, cada um fazendo UM
  trabalho** (se o plano deu 12, consolidar; se um bloco faz três coisas, dividir).
- **O Loop — nunca avançar sem verificar o bloco atual.** Os 4 casos dele (rodou
  limpo → confirmar contra o PRD antes de seguir; erro → colar o erro exato, nunca
  chutar; ficou errado → descrever e consertar ANTES de continuar; fez demais →
  perguntar se o excesso atrapalha o próximo passo). É a versão de construção do
  nosso "sempre perguntar antes de seguir" — vale dentro da própria skill: cada
  fold construído se verifica contra o plano antes do próximo.
- **QA da URL viva por checklist nomeado**, não por olhada: seções todas presentes,
  form com estado de sucesso E de erro, responsivo em 375px, zero erro de console,
  Lighthouse 90+. Falta algo → escreve o fix, não "ficou bom".
- **Estados de erro são parte do escopo do form**, não polish: sucesso E falha
  desenhados desde o primeiro build.
- **Benchmark de preço dele (EUA, referência de mercado, jul/2026):** landing
  bilíngue deployada com form = US$ 500-2.000; dashboard de cliente = US$ 1.500-
  5.000. E o argumento comercial: a página viva É o pitch — "more persuasive than
  any pitch deck" (casa com nosso `/raio-x` de demonstração).

## Quando este acervo NÃO manda — limite de nicho

O sistema do Matt é **resposta direta pra oferta CONSIDERADA** (mentoria, SaaS,
serviço de ticket alto, infoproduto): o visitante precisa ser convencido, tem objeção
real, a compra é uma decisão. É o caso da própria ImpulsoX e de consultores,
agências, clínicas de procedimento caro, software.

Pra **negócio local de decisão rápida** (restaurante, salão, petshop) e pra **compra
aspiracional** (imobiliária, arquitetura, turismo), parte das regras INVERTE:

- **"Abra com a dor" não vale.** Restaurante abre com APETITE (a foto do prato é o
  hero); imobiliária abre com ASPIRAÇÃO (a casa, o bairro, a vida). Dor antes do
  jantar espanta; o produto É a abertura.
- **"Copy manda, design sai da frente" inverte.** Nesses nichos a FOTO vende e a
  copy só tira fricção (horário, reserva, endereço, WhatsApp). Investir em
  fotografia/tour > investir em argumento.
- **Objeção-reframe só onde há objeção.** Decisão de impulso/ocasião quase não tem;
  imobiliária tem MUITO (preço, financiamento, confiança) — lá o reframe vale.

O que transfere pra QUALQUER nicho (o núcleo universal): CTA único, específico e
repetido idêntico ("Reservar mesa", "Agendar visita" — nunca "Saiba mais"); prova
concreta (nota do Google, nº de vendas no bairro — nunca "milhares de clientes");
uma promessa por página; um destino de funil; mobile antes de "pronto"; zero jargão.

Régua de decisão: ler `nucleo/perfil.md` do negócio ANTES de aplicar o regime. Compra
considerada → acervo inteiro. Decisão rápida/aspiracional → só o núcleo universal, e
o hero segue o apetite/aspiração do nicho.

## Checklist de uso rápido (na hora de escrever a copy da landing)

- [ ] Hero abre com dor/verdade dura; promessa só DEPOIS do leitor se reconhecer
- [ ] Um CTA, específico, idêntico em toda repetição; zero "Saiba mais"
- [ ] Uma ideia por linha; vírgula sobrando = duas frases
- [ ] Pergunta retórica de concordância posicionada antes do CTA
- [ ] Prova: número real; história de cliente em métrica de output, nunca renda
- [ ] Biografia como autoridade, nunca como previsão do leitor
- [ ] Objeção nº 1 respondida com reframe contrário
- [ ] CTA final sem informação nova
- [ ] Entrega: a copy pronta + o único tradeoff que vale discutir (não um leque)
- [ ] Job da página definido: conversão direta (regime Matt) ou posicionamento WOW
      (regime cinematográfico)?

*Acervo do motor ImpulsoX-OS · fonte nomeada no topo · refresh quando novos vídeos
do Matt forem dissecados (`ImpulsoX-AI/material-matt/INDICE.md`).*
