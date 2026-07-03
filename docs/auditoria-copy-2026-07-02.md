# Auditoria externa — Eixo COPY/TEXTO (prioridade nº1)

> Auditor externo (agente com contexto limpo + pesquisa web) · 2026-07-02
> Escopo: `escritor-br`, `copy`, `email`, `conteudo`, `linkedin`, `formulas`, `repurpose`,
> `criar-ebook` + docs de apoio (persuasao, frase-que-pega, hooks, swipe-copy).
> Verificado contra as 3 auditorias passadas — não repete o que já está registrado.
> Etapa 1 de 6 da auditoria total (ver memória `auditoria-total-pendente`).

---

## 1. Diagnóstico do eixo em 5 linhas

O craft é genuinamente acima do mercado — a stack Schwartz/Heath/Sugarman/Loewenstein + tabela de vícios PT-BR é melhor que o que Jasper/Copy.ai entregam de fábrica. A fraqueza estrutural é outra: **o sistema exige fonte e data do cliente, mas não exige de si mesmo** — dezenas de números de mercado (28%, 6,6%, +78%, ~45%, 2M+ clips) estão cravados nos SKILL.md sem fonte nem validade, e vão apodrecer em silêncio (a lição do "LCP 2,0s" que já mordeu uma vez). Segundo: **todos os gates de qualidade são o mesmo modelo se auto-avaliando no mesmo contexto** — zero verificação determinística (script) e zero medição pré-publicação, num sistema que já provou saber fazer `lib-*.mjs` com testes. Terceiro: **o cânone é 100% importado/traduzido** — nenhuma referência de copy BR, nenhuma psicologia de preço brasileira (12x, PIX, boleto) em lugar nenhum. Quarto: o loop de validação existe no papel mas está **vazio** ("Validadas aqui" do hooks.md: `_(vazio)_`) — todo o eixo opera em teoria não confirmada na conta.

---

## 2. Achados por skill

### /copy (`.claude/skills/copy/SKILL.md`)

- 🟡 **`SKILL.md:91-92` — estatística sem fonte num motor que proíbe estatística sem fonte.** "Em teste real, escrever com VoC rendeu **+70% de leads** e headline **+400%**" — sem nome do teste, sem fonte, sem data. É o caso Copyhackers/Beckett Simonon, mas o arquivo não diz. A regra da casa ("dado de terceiro tem fonte nomeada", `conteudo/SKILL.md:137`) vale pro próprio motor. *Melhoria: nomear a fonte ou rebaixar pra "casos documentados pela Copyhackers".*
- 🟡 **`SKILL.md:114-116` — o sprint de 10 headlines morre na escolha; não existe teste.** As 3 finalistas são apresentadas e uma é escolhida por gosto. Estado da arte 2026 (Anyword, predictive score com ~82% de acurácia direcional) é não confiar no gosto: variantes viram teste real. O sistema já tem a infra (ads = laboratório de headline; `/desempenho`) mas nenhuma linha conecta "as 2 headlines perdedoras" a um teste barato de anúncio. *Melhoria: no fecho da /copy, oferecer "as 3 finalistas viram variação de criativo no /ads-meta — o público escolhe, não a gente".*
- 🟢 **`SKILL.md:98-101` — VoC presente mas raso vs. estado da arte.** O método maduro (message mining — LoopVOC) minera 80-120 frases em planilha de 5 colunas (frases memoráveis / o que querem / o que irrita / emoções + e −) e conta frequência — a headline vencedora costuma ser a frase mais repetida, não a mais bonita. A Camada 1 pede "pescar as palavras" sem método nem volume mínimo. *Melhoria: mini-protocolo de mineração (N mínimo de frases, contar repetição, a mais frequente vira candidata a headline).*
- ✅ Nota positiva verificada: a data "FAQ rich result aposentado em mai/2026" (`SKILL.md:261-262`) **está correta** — Google retirou em 7/mai/2026 (Search Engine Land). O auditor foi verificar esperando erro e a skill estava mais atualizada que o conhecimento dele.

### /email (`.claude/skills/email/SKILL.md`)

- 🔴 **A caixa de entrada virou ambiente mediado por IA e a skill não sabe.** Desde jan/2026 o Gmail roda Gemini com AI Overviews e AI Inbox (CNBC): resume o e-mail antes de a pessoa abrir, e até 40% dos e-mails que chegam ao inbox são despriorizados pela IA (Folderly); CTR médio caiu de ~4,35% pra ~3,93%. A regra nova: informação-chave nos primeiros 100-200 caracteres, valor concreto > linguagem emocional (Bloomreach) — o resumo da IA é o novo "preview". A skill trata assunto+preview como o jogo inteiro e não tem uma linha sobre escrever pro sumarizador. *Melhoria: seção "e-mail legível por IA" — o primeiro parágrafo tem que sobreviver a um resumo de 1 frase do Gemini.*
- 🟡 **Decisão plain-text vs HTML ausente.** HTML pesado sinaliza marketing e cai na aba Promoções; texto simples lê como mensagem 1-a-1 (SendCheckIt). Para os 3 modos da skill a resposta é diferente (follow-up de proposta = plain-text obrigatório; newsletter = leve), e a skill não decide nem orienta. *Melhoria: 1 linha por modo.*
- 🟢 **Sem política de sunset/higiene de lista.** Complaint rate ≤0,10% está coberto, mas o maior driver de reputação em 2026 é parar de mandar pra quem não abre/clica há X meses. A skill escreve sequências; ninguém corta a lista. *(O `/reativar` faz win-back, que é outra coisa.)*

### /linkedin (`.claude/skills/linkedin/SKILL.md`)

- 🟡 **`SKILL.md:52-59` — dois formatos que o algoritmo de 2026 mais premia não existem no cardápio.** Vídeo nativo (+36% YoY, prioridade explícita do feed — Hootsuite) e **newsletter** (entrega direto na caixa de entrada, ignora o algoritmo — Dataslayer) — pra um sistema cuja tese é "não depender de algoritmo" (é o argumento do /email!), a newsletter do LinkedIn é exatamente a tese e está fora. *Melhoria: adicionar os 2 formatos à tabela de roteamento; newsletter mensal pode reaproveitar o modo 2 do /email.*
- 🟡 **`SKILL.md:49-50, 65-67, 119-121, 151-153` — sete números de algoritmo cravados como fato, sem fonte nem data de validade.** "~28% mais no B2B", "engaja ~6,6%", "+78% de distribuição", "~40% do alcance na 1ª hora", "perdeu 60-66%", "~1,6% dos seguidores". Hoje batem com a pesquisa (Dataslayer, Linkboost) — mas são constantes de plataforma, mudam por update, e nada no sistema os revisita (o refresh mensal do `/formulas` cobre `docs/formulas.md`, não os SKILL.md). É o padrão exato do incidente "LCP 2,0s". *Melhoria: ver Top 8 #1.*
- 🟢 Comentário pesa ~15x o like no ranking 2026 (Contentdrips) — a skill trata comentário só via Golden Hour; vale citar o peso pra calibrar o fecho-que-abre-conversa como mecânica, não estilo.

### /conteudo (`.claude/skills/conteudo/SKILL.md`)

- 🟡 **`SKILL.md:127` — path inconsistente com a skill dona.** O pacote entrega `producao/email/<data>-<slug>.md`; o `/email` salva em `producao/emails/<tipo>-<slug>/` (email/SKILL.md:100). Singular vs plural + estrutura diferente = produção espalhada em duas pastas. *Melhoria: alinhar ao formato do /email.*
- 🟡 **Passo 2 sem sinais de E-E-A-T/autoria.** O artigo tem answer-first, H2, FAQ, JSON-LD — mas nenhuma linha sobre autor nomeado, credencial, experiência de primeira mão ("atendemos 40 clínicas e vimos X") — que é o que Google e os motores de IA usam pra decidir *quem* citar. O sistema tem a matéria-prima (`nucleo/negocio.md`, `provas.md`) e não a usa como sinal de autoridade no artigo. *Melhoria: bloco "quem assina" + 1 marca de experiência vivida por artigo.*

### /formulas (`.claude/skills/formulas/SKILL.md`)

- 🟡 **`SKILL.md:36-42` — taxonomia de retenção (45%/42%/38%/28%/27%/12%) apresentada como constante universal, sem fonte no arquivo.** Mesma doença dos números do /linkedin — e ela se replica: está duplicada em `docs/hooks.md:16-21` ("pesquisa 2026, 2M+ clips", qual?) e no /reel-marca. Se a pesquisa de origem envelhecer, são 3+ lugares dessincronizando. *Melhoria: fonte+data uma vez, os outros referenciam.*
- 🟡 **`SKILL.md:98-100` — as sementes do Modo 2 são 100% criadores americanos de nicho IA.** Pro negócio próprio (ImpulsoX) serve; pro produto vendido a PME brasileira (clínica, academia, construtora), o Modo 2 não tem nenhuma semente BR e nenhuma instrução de buscar breakdown em português. Fórmula de hook transfere entre línguas só em parte — o first-3-words test, por exemplo, muda porque a sintaxe do PT empurra o verbo e o número pra posições diferentes. *Melhoria: instrução "buscar também análises BR do nicho do cliente" + 2-3 sementes BR.*

### /repurpose (`.claude/skills/repurpose/SKILL.md`)

- 🟢 **Não cita o `/escritor-br` em lugar nenhum** (grep: 0 ocorrências). Na prática está coberto porque as skills donas (/post, /linkedin) o chamam — mas o passo 2 ("extrair temas") produz texto que o dono lê, e a regra da casa é "passo obrigatório dentro das skills de conteúdo". Uma linha resolve a ambiguidade.
- 🟢 **Passo 5 exige nota ≥8/10 do /revisar por peça do batch** — num batch de 8 peças são 8 despachos de subagente. Custo alto sem gradação (peça de topo de funil poderia ter gate mais leve que peça de venda). Anotar como decisão consciente ou graduar.

### /criar-ebook (`.claude/skills/criar-ebook/SKILL.md`)

- 🟡 **`SKILL.md:36` — o cardápio de tamanho (10-20 / 30-50 páginas) contraria a prática 2026 de isca.** O mercado migrou pra "quick win" (checklist, template, calculadora, diagnóstico — consumível em <15 min) porque taxa de *consumo* da isca prevê conversão da sequência melhor que taxa de download; e-book de 50 páginas baixado e não lido esfria o lead que o /email vai nutrir. A skill até avisa "afunilar promessa vaga", mas oferece 30-50 páginas como opção neutra. *Melhoria: default = isca curta consumível; 30-50 páginas só pra produto pago/autoridade.*

### Docs de apoio (persuasao, frase-que-pega, hooks, swipe-copy)

- 🟡 **`docs/swipe-copy.md` — 13 entradas, 100% de fontes gringas (Unbounce/CXL), zero copy BR.** Não existe entrada de mecânica que só existe no Brasil: parcelamento como âncora ("12x de R$ 97" lê mais barato que "R$ 997"), PIX com desconto como reversão de fricção, boleto como objeção de confiança, o "chama no WhatsApp" como CTA-rei (esse a casa já usa, mas não está documentado como mecânica no swipe). Pra um produto que se vende como copy BR premium, o acervo não tem DNA local. Referências reais do mercado BR pra garimpar mecânica (não frase): Paulo Maccedo, Rafael Albertoni/Sociedade Brasileira de Copywriting, Ícaro de Carvalho — o estilo "carta longa BR" deles é dissecável pelo próprio /formulas.
- 🟢 `docs/hooks.md:91` — "Validadas aqui: _(vazio)_". Não é defeito de texto, é o sintoma: o eixo inteiro roda em molde de mercado há meses e nenhuma mecânica foi confirmada ou rebaixada com dado da conta. Enquanto isso, "validada aqui pesa mais que molde de mercado" é uma promessa vazia.

---

## 3. /escritor-br em profundidade dobrada

**Veredito honesto: é a melhor peça do eixo, e está à frente do mercado em conteúdo.** A tabela de 25+ vícios PT-BR com os específicos da língua (cadeia de gerúndios, "além disso", tricolon à brasileira, cópula evitada, variação elegante) é mais completa que qualquer humanizador comercial examinado. O freio de falso-positivo ("tell isolado não condena; procurar aglomerado") está alinhado com a posição oficial do guia da Wikipedia — que muitos imitadores ignoram. O SOUL ("limpo não basta") resolve o erro nº1 dos humanizadores: texto esterilizado que continua denunciável por ausência de voz.

**Os 8 pilares aguentam o estado da arte?** Sim, em teoria. Loewenstein, Schwartz, Sugarman, Heath, Wiebe seguem sendo o cânone que os melhores operacionalizam em 2026; a régua "lacuna vaga dá ré" (PMC 2024) e o "fechar é obrigação" (caso Copyhackers dos +927% de cliques sem venda) são exatamente o que separa curiosity gap de clickbait. Nenhum pilar está errado ou datado. O problema não é o conteúdo — é a **execução ser inteiramente auto-referente**. Quatro furos concretos:

**Furo 1 — O audit "ainda-IA" é o mesmo modelo, no mesmo contexto, corrigindo a si mesmo (SKILL.md:63-68).** A pesquisa de 2025 é clara: humanos leigos detectam texto de IA no nível do acaso, mas usuários pesados de LLM acertam ~90% (Wikipedia: Signs of AI writing) — ou seja, os tells são **mecânicos e aprendíveis**, e o que é mecânico se pega com máquina, não com introspecção. O sistema já tem o padrão perfeito pra isso (`scripts/lib-*.mjs` com testes, como lib-desempenho e lib-velocidade): a varredura de restrições duras (travessão, aspa curva, title-case) e ~15 dos vícios da tabela ("é importante ressaltar", "no mundo atual", "não é apenas X, mas", gerúndio encadeado, "de forma eficaz") são **regex puro**. Hoje a "varredura final" (SKILL.md:82-83) é uma promessa de atenção do modelo; deveria ser um script que devolve pass/fail com linha e coluna. É a melhoria de maior alavanca do eixo inteiro: transforma o gate de "confie em mim" pra "verificado".

**Furo 2 — A tabela parou na onda de vocabulário de 2024; a de 2025+ não entrou.** O guia da Wikipedia registrou que em meados de 2025 os modelos migraram para "enhancing/highlighting/showcasing" — em PT-BR: "destacando", "evidenciando", "reforçando", "garantindo (que)", "vale destacar", "nesse sentido", "sendo assim". Faltam também dois padrões estruturais que denunciam: **hedging enfileirado** ("pode", "geralmente", "em muitos casos" na mesma frase) e o **trio adjetival** ("rápido, prático e eficiente" — primo do tricolon, mas em adjetivos). E um refino: a proibição absoluta de meia-risca (`–`) sem exceção pra **intervalo numérico** ("seg–sex", "2024–2026", "9h–18h") vai mutilar texto legítimo — intervalo numérico é o único uso onde o hífen no lugar é que é o erro.

**Furo 3 — Voz sem métrica de fidelidade.** "A voz é reconhecível como a da marca" (critério de pronto, SKILL.md:189) é julgado pelo mesmo modelo que escreveu. É o que Writer.com resolve com enforcement estrutural: termos proibidos e "use carefully" viram checagem automática, não lembrança. Versão ImpulsoX (barata): as palavras banidas do `voz.md` entram na mesma varredura-script do Furo 1; e o audit ganha um item objetivo — "cite 2 marcadores do voz.md presentes no final" (jeito de abrir, palavra da casa, postura). Presença nomeável > impressão.

**Furo 4 — Anti-template de peça, mas não de lote.** O freio de falso-positivo protege UMA peça; nada protege o **feed**. Dez saídas do escritor-br na mesma semana tendem a compartilhar a assinatura rítmica do humanizador (abertura curta de soco + parágrafo de 1 linha + fecho que devolve a bola — o próprio molde da casa vira o novo template detectável). O /repurpose varia categoria de hook no batch; ninguém varia a **prosa** no batch. *Melhoria: no uso embutido em lote, o audit ganha 1 pergunta: "esta peça abre/fecha igual à anterior do lote?".*

**O que falta pra converter mais (não só soar humano):** o craft-de-engajamento cobre a frase; o elo fraco é a **matéria-prima da frase**. O Pilar 2 (voz do cliente) diz "as minas são provas.md, log do agente, /radar" — mas não existe rotina que abasteça essas minas com fala literal de cliente (o CRM v3 integrado tem exatamente esses dados: mensagens, objeções, motivos de perda). Enquanto o garimpo de VoC for opcional e manual, o escritor-br reescreve com inteligência genérica calibrada por voz.md — bom, mas o teto do "indistinguível E converte mais" é escrever com a frase que o cliente real do cliente já disse. Essa ponte CRM→VoC→copy é o upgrade estrutural que nenhum concorrente (Jasper, Copy.ai) tem como fazer, porque eles não moram dentro da operação.

---

## 4. Top 8 melhorias do eixo (impacto ÷ esforço)

| # | O que mudar | Arquivo | Por quê | Fonte |
|---|---|---|---|---|
| 1 | **Regra "fato de mercado carrega fonte+data" no motor** — todo número de algoritmo/plataforma nos SKILL.md ganha `(fonte, mês/ano)`; o refresh mensal do /formulas passa a revisitar também esses números | `CLAUDE.md` (conduta) + `linkedin/SKILL.md`, `formulas/SKILL.md`, `docs/hooks.md` | ~15 números hoje corretos vão apodrecer sem ninguém saber; o sistema já pagou esse preço uma vez (LCP 2,0s) | dataslayer.ai, blog.hootsuite.com |
| 2 | **`scripts/lib-humanizador.mjs`** — varredura determinística das restrições duras + ~15 vícios regexáveis + palavras banidas do voz.md; o escritor-br roda o script no passo 3 e só entrega com pass | `escritor-br/SKILL.md` + script novo | O gate mais importante do eixo é hoje uma promessa de atenção; máquina pega tell mecânico melhor que auto-crítica (leigos detectam ao acaso; padrões são mecânicos) | en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing |
| 3 | **Atualizar a tabela de vícios com a onda 2025+** — "destacando/evidenciando/garantindo/vale destacar/nesse sentido", hedging enfileirado, trio adjetival + exceção de meia-risca pra intervalo numérico | `escritor-br/SKILL.md:97-123` | O vocabulário-tell muda a cada geração de modelo; a tabela congelou em 2024 | forbes.com (Wikipedia signs 2025) |
| 4 | **Seção "e-mail legível por IA"** — 1º parágrafo sobrevive a resumo de 1 frase; chave nos primeiros 100-200 chars; concreto > emocional; + decisão plain-text vs HTML por modo | `email/SKILL.md` + `docs/entregabilidade-email.md` | Gemini resume/filtra o inbox desde jan/2026; até 40% dos e-mails entregues são despriorizados; CTR já caiu | folderly.com, bloomreach.com, cnbc.com |
| 5 | **Camada BR no acervo** — mecânicas de preço/fricção brasileiras no swipe (12x como âncora, PIX, boleto, WhatsApp-CTA documentado) + 2-3 sementes BR no Modo 2 do /formulas | `docs/swipe-copy.md`, `formulas/SKILL.md:98-100` | Produto vendido como copy BR premium com acervo 100% Unbounce/CXL; o diferencial local não está escrito em lugar nenhum | blog.voceligado.com.br (referências BR) |
| 6 | **Formatos LinkedIn 2026** — vídeo nativo e newsletter entram na tabela de roteamento do /linkedin | `linkedin/SKILL.md:52-67` | Vídeo +36% YoY; newsletter entrega direto no inbox (a tese "dono do canal" que a casa já defende no /email) | hootsuite, dataslayer |
| 7 | **Protocolo de mineração VoC com volume** — N mínimo de frases, planilha de 5 colunas, frequência decide a candidata a headline; e a ponte CRM→VoC (objeções/motivos de perda do CRM v3 viram matéria-prima automática) | `copy/SKILL.md:87-101` (+ futura ligação lib-crm) | Fala literal repetida > frase inventada bonita; é a vantagem estrutural que SaaS de copy não consegue copiar | loopvoc.com |
| 8 | **Headlines perdedoras viram teste, não lixo** — fecho da /copy oferece as 3 finalistas como variantes de criativo no /ads-meta; /desempenho registra a vencedora em aprendizados.md | `copy/SKILL.md:299-311` | Fecha o único elo aberto do eixo: escolha de headline por gosto num sistema cuja tese é medir; substitui o "predictive score" da Anyword por dado real da conta | anyword.com |

**Correções menores (fazer junto, custo ~zero):** path `producao/email/` → `producao/emails/` no `/conteudo:127`; fonte na estatística +70%/+400% em `copy/SKILL.md:91`; default de isca curta no `/criar-ebook:36`; 1 linha citando /escritor-br no `/repurpose`; bloco de autoria/E-E-A-T no Passo 2 do `/conteudo`.

**O que NÃO mexer:** a arquitetura em camadas afia→pega→humaniza da /copy (é o desenho certo e raro); o freio de falso-positivo e o SOUL do escritor-br; a régua Desejo−(Esforço+Confusão); a separação molde≠frase. E registro: o auditor foi verificar a data "FAQ aposentado mai/2026" esperando pegar erro — a skill estava certa e mais atualizada que a média do mercado.

---

## Fontes

Wikipedia: Signs of AI writing · Forbes — 10 giveaway signs (2025) · Dataslayer — LinkedIn algorithm fev/2026 · Hootsuite — LinkedIn algorithm 2026 · Linkboost — LinkedIn changes 2026 · Contentdrips — LinkedIn 2026 · Folderly — Gmail Gemini deliverability · Bloomreach — Gemini Gmail · CNBC — Gemini no Gmail (jan/2026) · SendCheckIt — plain text vs HTML · Chronos — Gmail/Yahoo 2026 · LoopVOC — VoC copywriting · Anyword vs Jasper — predictive score · AtomWriter — Writer.com brand voice review · Você Ligado — copywriters do Brasil · Search Engine Land — FAQ rich results retired · Hastewire — detecção de IA em PT
