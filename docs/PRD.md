# PRD — ImpulsoX-OS

> Product Requirements Document · produto da ImpulsoX AI · impulsoxai.com.br
> Versão do motor na data deste PRD: **v0.2.19** (ver rodapé do `CLAUDE.md` pra versão atual)
> Última atualização: 2026-07-03

---

## 1. O que é o ImpulsoX-OS

O ImpulsoX-OS é um **sistema operacional de marketing** que roda dentro do Claude Code. Não é
um chatbot, não é um gerador de posts avulsos, não é um SaaS com botões — é um conjunto de
**63 skills** (comandos especializados, cada um com sua própria doutrina, régua de qualidade e
scripts de apoio) que juntos conhecem o negócio, mantêm a identidade da marca e produzem
marketing de verdade: conteúdo, anúncios, páginas, vídeos, propostas, relatórios.

Na prática, o sistema fecha um ciclo: **decide** o que fazer (`/calendario`, `/radar`) →
**produz** a peça (`/post`, `/pagina`, `/reel-marca`...) → **publica** (`/publicar`) →
**mede** (`/desempenho`, `/roi`) → **corrige** (os aprendizados voltam pro próximo ciclo).
O dono do negócio não precisa saber marketing nem git nem código — o sistema conduz.

### 1.1 Princípio central — a Escada de Contexto

O sistema **nunca trava esperando informação que ainda não tem**. Toda skill opera em
qualquer grau de conhecimento sobre o negócio e marca claramente o que é **fato** (extraído
ou confirmado) e o que é **suposição** (rascunho a confirmar com o dono).

| Degrau | O sistema tem | O que entrega |
|:---:|---|---|
| 0 | Só o nome do negócio | Defaults premium + perguntas mínimas |
| 1 | URL de um site (atual ou antigo) | Extração automática → rascunhos prontos |
| 2 | + logo e/ou referências visuais | Identidade calibrada com o gosto do cliente |
| 3 | + entrevista de voz (transcrição ou ao vivo) | Núcleo completo: voz, foco, estratégia |
| 4 | + dados reais (ads, analytics, CRM) | Campanhas e relatórios baseados em performance |

Cada skill sabe seu degrau mínimo, roda mesmo abaixo dele com defaults marcados, e devolve
uma lista **"confirmar com o cliente"** quando assume algo. O degrau atual fica registrado em
`nucleo/escada.md` (negócio próprio) ou `clientes/<nome>/escada.md` (cada cliente).

### 1.2 A arquitetura em 3 camadas

```
┌─────────────────────────────────────────────────────────┐
│  NÚCLEO (nucleo/) — quem é o negócio                     │
│  negocio.md · ofertas.md · voz.md · foco.md · escada.md  │
│  provas.md · aprendizados.md · fontes.md · perfil.md     │
├─────────────────────────────────────────────────────────┤
│  MARCA (marca/) — a identidade visual                    │
│  design-guide.md · tokens.css · logo/ · design-systems/  │
├─────────────────────────────────────────────────────────┤
│  63 SKILLS (.claude/skills/) — o que o sistema FAZ       │
│  cada uma lê núcleo + marca antes de produzir            │
└─────────────────────────────────────────────────────────┘
```

Toda skill **lê o núcleo e a marca antes de produzir** — nenhuma peça sai genérica ou
desalinhada com o que a empresa é. A marca é sempre a do cliente; nunca a imaginação da IA.

### 1.3 Modo agência × modo negócio próprio

O mesmo motor serve dois modos:
- **Negócio próprio**: o núcleo mora na raiz (`nucleo/`, `marca/`).
- **Modo agência**: cada cliente vive em `clientes/<nome>/` com seu próprio núcleo, marca e
  produção — autossuficiente. A skill `/cliente` cria essa estrutura.

Melhoria de sistema nasce no **template** (este repositório) e desce pros **clones** (cada
negócio real, próprio ou de cliente) via `/atualizar-motor` — nunca o contrário. Trabalho de
marketing (peças, núcleo, dados) fica sempre no clone, nunca sobe pro template.

### 1.4 Como o sistema decide o que fazer

Todo pedido passa por roteamento em três níveis: primeiro as skills da casa
(`.claude/skills/`), depois o catálogo de skills nativas do Claude Code, e só então execução
direta. Pedido amplo ("cuida do meu Instagram este mês") → a skill de estratégia decide **o
quê**, depois as skills de produção executam.

O sistema **guia** o dono pela esteira: ao terminar uma skill, aponta o próximo passo natural
e **espera o "sim"** antes de encadear — nunca dispara a próxima skill sozinho. Se o dono
pular uma etapa, o sistema percebe o que falta e se reorienta, sem travar nem forçar ordem.

---

## 2. Fluxo principal × opcionais

Nem toda esteira do sistema entra na esteira padrão de todo cliente.

### Fluxo PRINCIPAL (o sistema conduz por aqui, em ordem)

```
1. IDENTIDADE  →  /identidade (a marca)  →  /pagina (site premium)
2. CONTEÚDO    →  /radar → /calendario → /post · /linkedin → /revisar → /publicar → /desempenho
                  (Instagram, Facebook, LinkedIn — a presença que roda sempre)
```

### OPCIONAIS (só entram quando o dono pede explicitamente)

- **YouTube** ⚠️ em teste/beta — funciona ponta a ponta, mas só é oferecido como serviço
  pronto ao cliente depois de validado com vídeos reais no canal próprio.
- **Apresentação/slides** — deck premium pra gravar vídeo ou apresentar a cliente.
- **Google Ads**, **Meta/Facebook Ads**, **ChatGPT Ads**.
- **Produto/lançamento** (e-book, curso, mentoria).

---

## 3. As 63 skills, por eixo

Cada skill abaixo tem: **o que faz**, **quando é chamada**, **o que produz/onde salva**, e
**suas conexões** (quem chama, pra quem aponta depois).

### 3.1 Eixo SISTEMA — operam o motor, não produzem peça de marketing

#### `/abrir`
Ponto de entrada de toda sessão de trabalho. Lê o núcleo inteiro, anuncia o degrau da Escada
de Contexto, o foco do mês e o que está pendente — em poucas linhas, sem relatório longo.
Chamado no início do dia ("bom dia", "onde paramos"). Diferente do `/plugar` (que é a
primeira instalação, não a abertura diária).

#### `/plugar`
O primeiro comando da vida do sistema pra um negócio. Conduz uma entrevista **invertida**: o
dono dá uma "aula" solta sobre o negócio (texto ou áudio via whisper local, grátis) → o
sistema marca cobertura contra 12 pontos de business context (método inspirado em Hormozi) →
pergunta só o que faltou, podendo pular qualquer pergunta. Funciona com ou sem URL (se tem
site, extrai antes de perguntar). Preenche `nucleo/negocio.md`, `ofertas.md`, `voz.md`
(provisória), `foco.md`, `escada.md`, e a aula crua fica preservada em
`nucleo/aula-do-dono.md` — a melhor amostra de voz até a entrevista completa do `/voz` rodar.

#### `/atualizar`
Revisão de sanidade do núcleo. Compara `nucleo/`, `marca/` e `clientes/` com o estado real do
workspace, propõe correções cirúrgicas quando algo envelheceu, e recalcula o degrau da
Escada. Chamado depois de períodos sem usar o sistema ou quando uma resposta saiu baseada em
informação claramente desatualizada.

#### `/atualizar-motor`
A ponte entre o template (este repositório) e cada clone (negócio real). Puxa do
repo-template **só o motor** — skills, `CLAUDE.md`, `docs/`, `scripts/` — e protege com
verificação explícita os dados de cada negócio (núcleo, marca, produção, `.env`). Roda um
gate de segurança: se o diff tocar em qualquer arquivo de dado, para e avisa em vez de
aplicar. Grava `motor-versao.md` no clone com a versão e o commit do template.

#### `/automatizar`
Fábrica de automação sob medida. Quando o dono repete a mesma tarefa manual (ou o sistema
nota o padrão), esta skill verifica o que já existe, desenha o fluxo e cria uma **skill
nova** dentro de `.claude/skills/` do clone. É o destino natural da pergunta "que tarefa
você repete e gostaria de tirar das costas?" do `/plugar`.

#### `/cliente`
Modo agência: cria a estrutura completa de um cliente novo — `CLAUDE.md` próprio, núcleo,
marca, pasta de produção — com o degrau de contexto já registrado. Passo 5 mapeia as rotinas
que o dono do cliente repete (dimensiona o escopo e o preço do retainer). Tudo daqui pra
frente roda dentro dessa pasta.

#### `/intake`
Onboarding **operacional** do contrato novo (não confundir com o `/plugar`, que é o
briefing de negócio). Coleta acessos por convite seguro (nunca senha), o KPI do contrato, o
calendário de aprovação, o escopo, e — desde a auditoria de julho/2026 — o **bloco Contrato**
(vigência, valor, data de renovação) e a "vitória da semana 1" (o resultado controlável que o
cliente vê nos primeiros 7 dias). Roda depois do `/cliente`, antes do `/identidade`.

#### `/salvar`
Backup no GitHub sem o dono precisar saber o que é git. Faz commit e push automaticamente,
com mensagem em português explicando o que mudou. Desde a auditoria: varre o conteúdo antes
do commit atrás de padrões de token/chave secreta coladas sem querer, e nunca sobe se achar.

#### `/painel`
Sobe um dashboard local (só-leitura) com o feed ao vivo do que o sistema está fazendo, o
ciclo de conteúdo, a produção, o contexto e a saúde do negócio. Mesmo painel que o cliente
abre com um clique (`painel.cmd`).

#### `/voz`
A entrevista de voz de verdade — 30+ minutos de áudio do dono, transcritos e destilados em
`nucleo/voz.md`. É o que faz o sistema escrever como a pessoa fala e não como uma IA
genérica. Lê a aula crua que o `/plugar` já capturou (nunca a descarta, mesmo se o dono pedir
pra "refazer do zero") e completa o que faltou. Também atende `--canal` (voz de narração
falada, para o YouTube — esqueleto diferente: WPM medido, mapa de pausas, curva de energia).

---

### 3.2 Eixo IDENTIDADE VISUAL — a base de tudo que é visual

#### `/identidade`
O gerente da marca. Dois caminhos: **CRIAR** (negócio sem marca — entrevista + mood board de
referências reais, ou logo do zero) ou **EXTRAIR** (marca já existe — extrai do site,
documenta, e propõe uma versão evoluída lado a lado pro dono escolher manter ou adotar).
Termina destilando em `marca/design-guide.md` (cores, tipografia, logo, tom, e — desde
julho/2026 — a seção **Movimento**: easing autoral e as 3 durações da marca) e
`marca/tokens.css` (as variáveis CSS que toda skill visual lê). O refino premium não acontece
aqui — vem depois, no `/pagina`.

#### `/premium-design`
O motor de design system real. Não é porta de entrada do dono leigo — é chamado por baixo
pelo `/identidade` e pelo `/pagina`. Captura o código-fonte de sites premiados de verdade
(Awwwards, Godly), extrai o design system (cores, tipografia, layout — a direção, já que
código de animação minificado não é capturável), e recombina numa identidade nova. O **Uso
3** é o produto de posicionamento (10k+): mostra os 3 melhores sites do NICHO do cliente,
ele escolhe o estilo, a skill re-estiliza no nível deles com a marca dele cravada. Acervo
curado em `references/referencias-por-nicho.md` (7 nichos cobertos: restaurante, imobiliário,
tech/SaaS, wellness, jurídico, e-commerce, saúde) e a biblioteca de 11 efeitos de movimento
executáveis em `references/efeitos.md`.

---

### 3.3 Eixo PÁGINA PREMIUM — o produto de R$ 5.000+

#### `/pagina`
Cria uma landing page ou site completo do zero, com padrão de portfólio de agência.
Orquestra internamente: etapa **COPY** (chama `/copy` → `/escritor-br`) → etapa
**CONSTRUÇÃO** (HTML/CSS/JS lendo `marca/tokens.css`) → etapa **3.5 PREMIUM** (chama
`/premium-design` Uso 3) → etapa **VERIFICAÇÃO** (screenshot Playwright em 390/768/1440px, e
desde a auditoria: **vídeo do scroll** quando há camada de movimento, porque foto parada não
mostra easing travando). Entrega dados estruturados (Schema) prontos. Próximo passo:
`/seo` antes de publicar.

#### `/copy`
O motor de copy de conversão, chamado antes de qualquer construção de página. Roda em
camadas: **Mira** (nível de consciência do tráfego, nível de sofisticação do mercado, uma
promessa/um leitor/uma ação) → **VoC** (minerar 30+ frases literais do cliente real, nunca
inventadas) → rascunho → **Afiação** (loop de auto-crítica: cada linha vende ou só descreve?)
→ **Citabilidade GEO** (a página converte humano E é citável por IA). Nunca inventa prova —
dado que falta vira pendência marcada, não texto fabricado.

#### `/escritor-br`
Passo obrigatório dentro de toda skill de conteúdo do sistema — transforma texto com cara de
IA em texto humano, na voz da marca. Roda um loop rascunho → auditoria "isso ainda parece
IA?" → final, e desde a auditoria de julho/2026 tem um **gate determinístico**:
`scripts/lib-humanizador.mjs` varre o texto por regex atrás de travessão, aspas curvas e ~15
vícios de linguagem de IA (incluindo a onda de vocabulário 2025+), com linha e coluna exatas
— não é mais só o modelo "achando" que está limpo.

#### `/revisar-pagina`
Olhos frios em design + copy de uma página **pronta**, chamado automaticamente pelo
`/publicar` antes de qualquer página subir. Renderiza a página, despacha um agente separado
(que não viu a criação, contexto limpo) e devolve achados priorizados por severidade —
Blocker/Major/Cosmetic — cada um ancorado numa regra nomeada. Não conserta, aponta e
encaminha pra `/copy`, `/escritor-br`, `/pagina` ou `/premium-design`.

#### `/agente-ia`
Add-on premium da página: um widget de chat conversacional (SDR que qualifica e captura
lead), na marca do cliente, injetável na página do `/pagina`. O runtime (chamar a Claude e
capturar o lead) vive no CRM via `/api/chat` — o widget só liga de verdade quando esse
endpoint existe. Desde a auditoria: o consentimento LGPD nasce documentado (microcopy de
opt-in + registro de timestamp/texto/canal no Contact do CRM).

---

### 3.4 Eixo CONTEÚDO ORGÂNICO — o ciclo que se fecha

#### `/radar`
A pesquisa que embasa o mês de conteúdo. Cinco camadas (nicho, busca social, concorrentes,
sazonalidade, demanda interna — incluindo Google Trends) e devolve 15-20 ideias pontuadas em
`producao/radar/<AAAA-MM>.md`. Decide o que **merece** virar pauta, nunca inventa do nada.
É a matéria-prima do `/calendario`.

#### `/pulso`
O irmão diário do `/radar`. Varre as fontes curadas de `nucleo/fontes.md` nas últimas 24-48h,
pontua cada achado pela lente do negócio e alimenta o banco de ideias vivo
(`producao/ideias/banco.md`). Ideia QUENTE (newsjacking) → produção na hora; EVERGREEN → o
`/calendario` colhe depois. Mantém um placar acumulado por fonte (fonte que nunca rende ideia
é candidata a sair da curadoria).

#### `/concorrente`
Mantém um dossiê vivo por concorrente do cliente (posicionamento, preço, ofertas, cadência,
anúncios ativos, presença local) em `nucleo/concorrentes.md`, só de fonte pública. É a fonte
que `/radar`, `/ads-meta`, `/oferta` e `/proposta` leem. Opcional — entra quando o dono quer
inteligência competitiva.

#### `/calendario`
Decide **o quê** postar e **quando**. Gera o plano mensal (Instagram + LinkedIn) a partir do
núcleo e do radar do mês, pronto pra cada skill de produção executar peça a peça. Desde a
auditoria, cada linha tem **hora** (não só data — a primeira hora decide alcance) e a
**origem** (peça hero ou derivada de qual peça).

#### `/post`
Produz peça visual de Instagram: carrossel, post único, ou reel com foto/cena real gerada
por IA (Fal — animada e legendada). Distinto do `/reel-marca` (motion graphics por código).
Cada peça nasce com um **objetivo declarado** (enviar/salvar/converter) e 2-3 variações de
hook de mecânicas diferentes, registradas num bloco de metadados no topo do `legenda.md` —
a chave que fecha o loop de medição depois.

#### `/linkedin`
Conteúdo de LinkedIn calibrado pro algoritmo de 2026: post de texto, post com imagem,
documento PDF (o "carrossel" do LinkedIn), vídeo nativo, ou newsletter (que entrega direto na
caixa de entrada, ignorando o feed). Profundidade e voz pessoal acima de link solto.

#### `/conteudo`
Quando o dono já sabe o tema e quer o pacote inteiro de uma vez: artigo pro site + carrossel
(`/post`) + post de LinkedIn (`/linkedin`), tudo amarrado pela mesma palavra-chave
cross-canal. O artigo tem resposta-primeiro, subtítulos, FAQ, e desde a auditoria: um bloco
de autoria (E-E-A-T) com a credencial de quem assina.

#### `/repurpose`
Explode UMA fonte longa já pronta (transcrição de vídeo, artigo, newsletter) em uma semana
inteira de conteúdo nativo — Instagram, LinkedIn, Reel/Short, TikTok — cada peça pela skill
dona, graduada pelo `/revisar` e jogada no `/calendario`. Não inventa: só usa o que está na
fonte.

#### `/formulas`
Disseca peças virais que o usuário traz (texto, print, link), pesquisa análises públicas e
cruza com os dados da própria conta, mantendo `docs/formulas.md` — o arquivo vivo de moldes
que `/post` e `/linkedin` consomem. Nunca raspa rede social atrás de login.

#### `/revisar`
O crivo de marketing sênior antes de qualquer peça ir ao ar. Despacha um agente separado com
contexto limpo (não viu a criação) que devolve nota 0-10 ponderada (hook vale 50%) + veredito
categórico pra anúncios/páginas. Nota abaixo de 8 → ajustar pela skill de origem, no máximo 2
rodadas. Obrigatório antes de qualquer anúncio pago ou peça de venda.

#### `/publicar`
Leva a peça aprovada ao ar. Publica **automaticamente** onde a API oficial permite —
Instagram (Graph API), Facebook, LinkedIn empresa, YouTube (Data API, sobe como privado) — e
entrega publicação **assistida** de um clique onde automação violaria os termos (LinkedIn
pessoal). Nunca publica sem aprovação explícita. Instagram e YouTube tem checagem prévia:
`/revisar-pagina` se for site, o guia visual se for ads.

#### `/desempenho`
A porta única de medição de social orgânico + YouTube. Detecta a plataforma, usa a régua
certa (Instagram: save/send/reach; YouTube: retenção/curva/CTR), diagnostica o que consertar
**apontando a skill que resolve**, e destila padrões em `nucleo/aprendizados.md`. Desde a
auditoria: lê insights do Instagram direto pela Graph API (sem CSV manual), tem um **check de
72h** pra peça quente/Trial Reel, e **calibra o juiz** — compara a nota que o `/revisar` deu
com o resultado real, recalibrando o peso do scorecard se divergir.

#### `/desempenho-yt`
Redirect interno puro — encaminha pra `/desempenho`. Existe só pra quem digita por hábito.

#### `/perfil-ig`
Otimiza o perfil do Instagram inteiro (nome pesquisável, bio, link, destaques, fixados) — o
perfil é a landing page do Instagram. Ganhou, na auditoria, uma captura de baseline (3
números antes/depois) pra provar que a otimização valeu.

#### `/local`
Otimiza o Perfil de Empresa no Google por completo (fotos, categorias, posts, Q&A), monta a
rotina de posts/avaliações e escreve respostas humanas a reviews. Passo 3.5 tem a régua
canônica de coleta de review **compliant** (nunca gating, nunca incentivo ao cliente — só à
equipe interna) que as outras skills referenciam.

---

### 3.5 Eixo VENDA E COMERCIAL — do prospect ao contrato fechado

#### `/oferta`
Constrói ou diagnostica a **oferta** em si (o que o cliente realmente compra), usando a
Equação de Valor e a anatomia de 6 partes (bônus, garantia, escassez, forma de pagamento —
incluindo, desde a auditoria, as mecânicas brasileiras: 12x como âncora, PIX com desconto,
boleto). Grava em `nucleo/ofertas.md`. Roda **antes** de `/proposta` e `/pagina` — oferta
fraca com copy boa converte devagar.

#### `/raio-x`
Diagnostica a presença digital de uma empresa a partir só da URL — a porta de entrada de
venda do sistema. Audita site, conteúdo, presença local e redes; entrega notas + o plano do
que consertar primeiro. Desde a auditoria, tem dois empacotamentos: a versão **isca**
(grátis, resumo de impacto) e a **auditoria PAGA** (relatório completo com custo em R$ por
vazamento, mini-redesign, plano de 30 dias, call de entrega — a porta Attraction do Money
Model).

#### `/proposta`
Transforma um diagnóstico em proposta fechável: HTML premium + PDF, com situação atual,
escopo em fases, prova, investimento com opções. Desde a auditoria, o próximo-passo-único
virou **aceite digital** (link de assinatura tipo Clicksign/Autentique, não mais "me chama no
WhatsApp") e a proposta enviada vira um **Deal no CRM** — follow-up automático dos 50 dias.

#### `/velocidade`
Calcula, por script (nunca de cabeça), quantos leads e quantos reais o negócio perde por
responder devagar — e o ganho de responder em menos de 5 minutos. É o argumento de venda nº1
da esteira e a métrica de saída da Fase 1. Chamado pelo `/raio-x` e `/proposta` como abertura.

#### `/treinar-vendas`
Treinador de vendas com IA — Pilar 5 da esteira. Gera o script do nicho (diagnosticar antes
de prescrever), faz **role-play** (a IA banca o cliente que rebate) e pontua calls reais por
rubrica nomeada. Desde a auditoria, o role-play ganhou engenharia **anti-teatro**: o
comprador roda como agente separado com persona oculta e regra de cessão explícita, pra não
entregar o fechamento de bandeja.

#### `/depoimento`
O gatilho de **timing** pra pedir prova social — olha os deals ganhos no CRM e dispara o
pedido no pós-resultado. Desde a auditoria, bifurca por tipo: negócio transacional (deal
ganho = pedir na hora) vs. serviço/projeto (o gatilho é o marco de resultado real, não a
assinatura do contrato). O pedido em si e o banco são do `/provas`.

#### `/provas`
Monta e mantém o banco de prova social real do negócio: roteiro pra pedir (priorizando
vídeo/áudio), formatação, registro de autorização de uso, e indexação por **objeção que
cada prova mata**. Chamado por `/copy`, `/post`, `/pagina`, `/proposta`, `/ads-meta`,
`/relatorio`.

#### `/lancar-produto`
Orquestra o lançamento completo de um produto digital (curso, mentoria, e-book pago) no
método de pré-lançamento em 3 atos: oferta, sequência de e-mails, carrinho aberto/fechado,
divulgação. Coordena `/oferta`, `/pagina`, `/email`, `/ads-*`.

#### `/criar-ebook`
Produz um e-book/material rico completo — estrutura, conteúdo real, PDF na marca, página de
captura. Serve tanto como isca gratuita (default: curta, 5-15 páginas, consumível em menos de
15 min) quanto produto vendável (30-50 páginas).

#### `/email`
Os três tipos de e-mail da casa: sequência de boas-vindas pós-isca, newsletter mensal,
follow-up de proposta. Desde a auditoria, escreve pensando que o Gmail resume o e-mail com
Gemini antes da pessoa abrir (informação-chave nos primeiros 100-200 caracteres) e decide
plain-text vs. HTML por modo.

---

### 3.6 Eixo LEAD → DINHEIRO — integração com o CRM próprio

O CRM da ImpulsoX (produto irmão) é o dono do lead/venda/receita; o OS conversa com ele via
`scripts/lib-crm.mjs` (token de serviço por cliente).

#### `/leads`
A ponte do lead pro CRM (cria o Contact) e leitura do status do funil. Não recria captura —
o CRM é a fonte da verdade.

#### `/roi`
Cruza o gasto de mídia (do `/analisar-ads`) com a receita real do CRM → faturamento
influenciado, CAC, ROI. Cálculo só por script (`lib-roi.mjs`) — dinheiro nunca se estima.
Desde a auditoria, o cálculo sempre usa **janelas casadas**: receita e gasto do mesmo período
de meses, nunca receita de 6 meses dividida por gasto de 90 dias.

#### `/carteira`
Modo agência: lê o CRM de cada cliente e mostra a carteira inteira num cockpit — receita,
leads, saúde (semáforo 🔴🟡🟢). Desde a auditoria, o semáforo inclui alerta de **renovação de
contrato** próxima com KPI no amarelo — o anti-churn mais barato.

#### `/reativar`
Segmenta quem esfriou no CRM (por faixa de recência: 30-90 dias, 90 dias-1 ano, 1 ano+) e
escreve a sequência de win-back **sempre com oferta/gancho concreto** — nunca "sentimos sua
falta" vazio. Passa por gate duro de LGPD/política WhatsApp antes de liberar disparo.

#### `/agente-ia`
(já descrito no eixo Página — o lead que o chat captura entra direto no CRM)

---

### 3.7 Eixo MEDIÇÃO — três portas, fronteira clara

#### `/analisar-ads`
Só tráfego **pago**: lê exports CSV do Google/Meta Ads, calcula com script determinístico e
devolve ranking de campanhas + sugestões. Desde a auditoria, pede as colunas de vídeo
(Hook Rate, Hold Rate) quando a conta roda criativo em vídeo.

#### `/analisar-dados`
Genérica de qualquer planilha de **negócio** (vendas, estoque, financeiro — não só
marketing). Recebe CSV/XLSX/JSON/TXT e devolve resumo executivo + a tabela de números.
Ganhou, na auditoria, `--comparar-por` (variação % mês a mês calculada no script, nunca
estimada visualmente).

#### `/relatorio`
Consolida o que `/desempenho`, `/analisar-ads` e `/roi` mediram num relatório mensal
apresentável, em linguagem de dono de negócio. É a skill de **retenção** — cliente renova
quando enxerga o valor. Desde a auditoria: um **check quinzenal** (10 min, alerta proativo se
algo sair da faixa) entre relatórios, e um modo `--trimestral` que vira **QBR** — revisão ao
vivo com deck (`/slides`) onde o contrato se renova de verdade.

---

### 3.8 Eixo ADS — cria, mede, corrige

#### `/ads-google`
Monta campanha de Google Search do zero: estrutura, palavras-chave (em duas fases — frase
controlada primeiro, ampla+Smart Bidding só depois de dado), anúncios, extensões,
negativação. Sai pronta pra importar no Google Ads Editor, com guia visual pra quem nunca
abriu a ferramenta. Desde a auditoria, cobre o AI Max (a evolução 2026 da Pesquisa por IA).

#### `/ads-meta`
Monta campanha de Meta Ads (Instagram+Facebook): objetivo, público (Detailed Targeting em
conta nova/hiperlocal, Advantage+ depois de dado), criativos gerados pelo `/post`. Abre com
**swipe file** (Passo 0) — pesquisa anúncios vencedores reais no Meta Ad Library e disseca a
mecânica. Desde a auditoria, cobre o motor Andromeda (clustering de criativo) e exige EMQ ≥7
como check de saúde do pixel.

#### `impulsox-chatgpt-ads`
Monta campanha de ChatGPT Ads (OpenAI Ads Manager) — disponibilidade por país muda
semanalmente, a skill re-verifica ao vivo a cada rodada. Produz um `campaign-plan.json`
canônico, valida deterministicamente, renderiza PDF + CSV de bulk-upload + brief pro cliente.
Faz intake guiado, pergunta por pergunta, pra quem não entende de ads.

#### `/analisar-ads`
(já descrito no eixo Medição)

---

### 3.9 Eixo YOUTUBE — ⚠️ opcional, em teste

#### `/tema-yt`
Escolhe o tema do próximo vídeo antes de roteirizar — pesquisa demanda real (criadores
monitorados, busca YouTube, Google Trends) **no nicho do canal** (lido de
`canal-youtube/pilares.md`, nunca hardcoded — multi-tenant desde a auditoria).

#### `/roteiro-yt`
Escreve o roteiro completo (long-form 8-15min e short) copiando a fórmula de quem performa
no nicho, classificando o vídeo por estágio de funil (topo/meio/fundo) e calibrando hook/CTA/
prova por estágio. Propõe o pacote (título+thumbnail).

#### `/gravar-tela`
Captura tela + voz do microfone + webcam em arquivos crus separados, com o dono controlando
início e fim. Entra direto no `/editar-video`.

#### `/editar-video`
Corta silêncio, normaliza áudio (-14 LUFS), gera legenda karaokê queimada + `.srt` (com a cor
ativa vindo dos tokens da marca, nunca hardcoded), cola intro/outro, renderiza o long-form e
monta a thumbnail.

#### `/shorts`
Corta o vídeo longo em vários shorts verticais (20-60s, teto configurável) a partir de
marcadores `[CORTE-SHORT]` no roteiro ou de trechos propostos da transcrição. Desde a
auditoria, nunca trunca no meio de uma frase (recua pro fim da frase mais próxima) e lembra
o dono de linkar o short ao vídeo longo de origem ("related video") — a única ponte que
ainda funciona desde que os algoritmos de Shorts e long-form foram desacoplados.

#### `/thumbnail`
Consultor de CTR: gera 3 conceitos de capa+título distintos, monta a imagem e pontua contra
os "Four C's". Desde a auditoria, integra com o **Test & Compare** nativo do YouTube — testa
o pacote título+thumbnail inteiro, não só a capa, e é o público que elege a vencedora.

#### `/slides`
Deck de apresentação premium em tela cheia, na marca, pra rodar durante gravação de vídeo ou
apresentação a cliente. Produto real em mockup, slides-ponte pra demo ao vivo, notas do
apresentador. Distinta do `/reel-marca` — aqui o dono navega ao vivo.

#### `/desempenho-yt`
(redirect — já descrito)

---

### 3.10 Skills de infraestrutura invisível

#### `/pesquisa-web`
Camada de execução opcional pra fonte pública/gratuita (Reddit, YouTube, RSS, GitHub, V2EX,
Bilibili, busca semântica), via a ferramenta de terceiro `agent-reach` quando instalada.
Chamada por `/radar`, `/pulso`, `/concorrente` — nunca ponto de entrada, nunca em conta de
cliente logada.

#### `/geo`
Audita se o negócio é citado hoje pelas IAs generativas (ChatGPT, Gemini, Perplexity),
mapeia as fontes que elas usam no nicho, entrega o plano pra passar a ser citado, e instala
monitoramento mensal. Par do `/seo`: o `/geo` mede e estrategiza, o `/seo` executa.

#### `/seo`
Ajusta uma página que **já existe** pra ser achada no Google e citável por IA: Schema
JSON-LD, answer-first, FAQ, robots.txt liberando os crawlers de IA. Desde a auditoria, trata
llms.txt como aposta de custo zero (não mecanismo comprovado) e não usa multiplicadores de
citação sem fonte no relatório do cliente.

---

## 4. A infraestrutura técnica por trás das skills

Cada skill lê a doutrina de referência que precisa em `docs/`:

- `docs/persuasao.md` — gatilhos e storytelling, com as regras de persuasão honesta
- `docs/frase-que-pega.md` + `docs/hooks.md` — o craft do hook/headline que gruda
- `docs/swipe-copy.md` — acervo de mecânicas de copy real que converte (molde, nunca frase)
- `.claude/skills/escritor-br/references/craft-de-engajamento.md` — os 8 pilares da escrita
  frase a frase
- `docs/pitch-narrado.md` — o arco de qualquer pitch narrado (deck, proposta ao vivo)
- `docs/craft-movimento.md` + `docs/dna-cinematografico.md` — o catálogo de 11 efeitos
  cinematográficos e a direção criativa de página nível-agência
- `docs/modelos-mentais.md` — Jobs to Be Done, Teoria das Restrições, psicologia de preço
- `docs/blueprint-esteira-crescimento.md` — a visão de produto em 4 fases (Casa → dinheiro
  que já existe → orgânico → pago)

### Scripts determinísticos (`scripts/`)

Regra dura do sistema: **dinheiro e métrica nunca se calculam de cabeça**. Toda vez que uma
skill precisa somar, dividir ou comparar números, ela chama um script puro e testado:
`lib-roi.mjs`, `lib-desempenho.mjs`, `lib-velocidade.mjs`, `lib-humanizador.mjs`,
`lib-crm.mjs`, entre outros — todos com suite de teste própria (394 testes no total, na
versão deste PRD).

### O CRM próprio

O ImpulsoX CRM (produto irmão, v3, multi-tenant) é o dono de contato/deal/receita. O OS fala
com ele só por `scripts/lib-crm.mjs`, nunca acessa o banco direto. Cada cliente tem seu
próprio token de serviço no `.env`.

---

## 5. Regras de conduta que atravessam todas as skills

Do `CLAUDE.md` — a constituição do sistema:

1. **Fato de mercado carrega fonte e data.** Todo número de plataforma/algoritmo escrito numa
   skill ganha `(fonte, mês/ano)`; sem fonte nomeável, vira "ordem de grandeza da prática de
   mercado", nunca fato cravado.
2. **Peça pública só vende oferta ATIVA.** Produto em construção nunca aparece em página,
   post, anúncio, proposta — nem como "em breve".
3. **Tráfego pago é o último passo, nunca o primeiro.** Antes de ads: reativar a base
   (`/reativar`), juntar review compliant (`/local`+`/depoimento`), ligar o orgânico
   (`/radar`→`/calendario`).
4. **Vender modular, upsell depois.** Nunca empurrar o pacote fechado — descobrir a
   necessidade do dono e vender a peça que resolve a dor dele agora.
5. **Review nunca por gating nem por incentivo ao cliente** — proibido por Google e FTC,
   risco real de multa e banimento de perfil.
6. **Copiar a fórmula de quem já performa, nunca inventar** — em toda peça (roteiro,
   legenda, thumbnail, anúncio), partir do molde testado de quem já pagou o custo de
   descobrir o que funciona.

---

## 6. Estado atual e o que falta

**Completo e em produção:** todo o fluxo principal (identidade → página → conteúdo →
publicação → medição), a esteira comercial completa (oferta → raio-x → proposta → cliente), a
integração com o CRM próprio, e as 6 auditorias externas de julho/2026 implementadas
(copy, cinematográfico, comercial, medição, YouTube — 7 commits, v0.2.13→v0.2.19).

**Opcional, funcional mas não oferecido como serviço fechado:**
- **YouTube** — o ciclo inteiro funciona ponta a ponta, mas segue "⚠️ em teste" até rodar
  3-5 vídeos reais no canal próprio.
- **TikTok** — o sistema **produz** o vídeo vertical (mesmo arquivo do Reel serve TikTok),
  mas **não publica automaticamente** — não existe integração de upload. Upload é manual.

**Pendências conhecidas (não bloqueiam o uso):**
- Acervo de design por nicho: 7/7 nichos com 3 referências validadas cada; a extração de
  código-fonte completa (`marca/design-systems/`) só roda quando aparece o primeiro cliente
  real daquele nicho.
- `/atualizar-motor` já rodou no clone ImpulsoX-AI; outros clones (se existirem) ainda
  precisam da mesma atualização.

**Integração com o CRM — funcional, com 3 gaps do lado do CRM** (ver
`docs/prd-integracao-crm.md`): a ponte `lib-crm.mjs` está pronta e testada, e `/roi`,
`/leads`, `/carteira`, `/reativar`, `/depoimento` já leem/escrevem o CRM de verdade. Três
itens ainda faltam do lado do CRM, cada um com fallback já funcionando:
1. **UTM no Contact** — hoje o `/roi` atribui receita por canal (Instagram, WhatsApp), não
   por campanha exata; a skill declara essa limitação no relatório.
2. **Webhook de eventos** (`deal.won` em tempo real) — o `/depoimento` roda por poll (sob
   demanda) em vez de reagir no instante do fechamento; não bloqueia, só não é automático.
3. **`POST /api/chat`** — o widget do `/agente-ia` na landing page instala em estado
   desabilitado honesto até esse endpoint existir no CRM.

---

*ImpulsoX-OS · produto da ImpulsoX AI · impulsoxai.com.br*
