# Changelog

Todas as mudanças relevantes do motor ImpulsoX-OS ficam registradas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/); o
versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

O `/atualizar-motor` usa este arquivo e a versão do rodapé do `CLAUDE.md` para
saber o que cada clone está rodando e o que ainda falta puxar do template.

## [0.2.15] — 2026-07-03

> Onda 2A da auditoria total: o eixo COPY (prioridade nº 1 do dono). Princípio novo:
> **modelo cria, máquina verifica.**

### Adicionado
- **`scripts/lib-humanizador.mjs` + 11 testes** — gate DETERMINÍSTICO do /escritor-br:
  varre DUROS (travessão, meia-risca fora de intervalo, aspa curva, ` -- `), BANIDAS
  (palavras da voz.md por parâmetro) e VÍCIOS (a parte regexável da tabela + onda 2025)
  com linha e coluna. Duro/banida = não entrega; 3+ vícios = aglomerado. Fronteiras
  unicode PT (o \b do JS não enxerga acento). CLI com exit code.
- **Tabela de vícios atualizada com a onda 2025+** (Wikipedia/Forbes): "destacando/
  evidenciando/garantindo que", "vale destacar/nesse sentido/sendo assim", hedging
  enfileirado, trio adjetival — e a exceção da meia-risca de intervalo ("seg–sex").
- **Anti-template de LOTE** no audit (peças do mesmo batch não podem compartilhar a
  assinatura rítmica) e **fidelidade de voz nomeável** (citar 2 marcadores da voz.md
  presentes no final — "parece a marca" sem apontar onde não passa).
- **Seção "E-mail legível por IA" no /email** — Gemini resume o inbox desde jan/2026
  (até 40% despriorizado): 1º parágrafo sobrevive a resumo de 1 frase, chave nos
  primeiros 100-200 chars, teste do sumarizador no gate; plain-text vs HTML decidido
  POR MODO (follow-up = plain-text obrigatório); política de sunset 90-120d.
- **Camada BR no acervo** — seção MECÂNICAS BR no swipe-copy (12x como âncora, PIX com
  desconto, boleto como confiança, WhatsApp-CTA documentado como mecânica) + sementes BR
  no Modo 2 do /formulas (Ícaro de Carvalho, Paulo Maccedo, Rafael Albertoni — mecânica,
  nunca tema) + busca PT-BR obrigatória no refresh.
- **Protocolo de mineração VoC com volume no /copy** — 30+ frases em tabela de 4 colunas,
  frequência decide a candidata a headline, e a ponte CRM→VoC (objeções e motivos de
  perda dos deals como matéria-prima — a mina que SaaS de copy não tem).
- **Headlines perdedoras viram teste** — fecho da /copy oferece as 3 finalistas como
  variações de criativo no /ads-meta; o público escolhe, não o gosto.

## [0.2.14] — 2026-07-03

> Onda 1 da auditoria total: ~30 quick-wins de custo baixo em 25+ arquivos.
> Tema central: honestidade de número + contratos entre skills fechados.

### Adicionado
- **Regra de conduta no CLAUDE.md:** "fato de mercado carrega fonte + data — inclusive
  dentro do próprio motor"; sem fonte nomeável → "ordem de grandeza", nunca fato. O
  refresh mensal do /formulas passa a revisitar esses números. Gabarito: /velocidade e
  o par grounding+validador do /geo.
- **Mutirão de números órfãos:** ~25 estatísticas ganharam fonte+data ou foram rebaixadas
  a ordem de grandeza (linkedin, formulas/hooks.md, desempenho, post, proposta, oferta,
  provas, lancar-produto, ads-google, ads-meta, analisar-ads, seo, copy). `docs/hooks.md`
  virou a CASA ÚNICA dos números de hook (formulas/reel-marca referenciam).
- **Consentimento LGPD no /agente-ia** — o widget se apresenta como IA, microcopy de
  opt-in antes de pedir contato, prova {timestamp, texto, canal} persistida no Contact
  (alimenta o gate do /reativar).
- **Camada BR na anatomia de oferta** — 12x como âncora, PIX com desconto, boleto como
  objeção de confiança na tabela de forma de pagamento.
- **Formatos LinkedIn 2026** — vídeo nativo (+36% YoY) e newsletter (inbox, ignora feed)
  no cardápio e no roteamento; comentário ~15x like documentado como mecânica.
- **AI Max no /ads-google** (quando ligar + aviso DSA morre fev/2027) · **Andromeda +
  EMQ ≥7 no /ads-meta** (Fase 1 virou exceção hiperlocal) · **colunas de vídeo no
  /analisar-ads** (fecha o contrato Hook/Hold Rate).
- **Coluna HORA + Origem (hero/derivada) no /calendario** — fecha o contrato órfão com o
  /publicar; /desempenho aprende a janela real da conta.
- **Google Trends na camada 2 do /radar** (script já existia) + honestidade operacional
  da fonte 5 (autocomplete IG/TikTok = tarefa do dono, nunca coleta inventada).
- **Placar de fontes no /pulso** (acumulado que sustenta "fonte que não rende sai").
- **`--comparar-por` no analisar-dados.mjs** — agrupa por mês e calcula variação % mês a
  mês no script (testado end-to-end).
- **VVSA (viewed-vs-swiped) na régua de Shorts** do lib-desempenho + diagnóstico
  apontando /shorts (2 testes novos).
- Menores: E-E-A-T/autor no /conteudo; e-book isca = curta consumível por default;
  transições de slide + reinício do vídeo no /slides; disclosure IA fotorrealista no
  /thumbnail; #Shorts aposentado (detecção por formato) e limite API 50/24h no /publicar;
  tempo de 1ª resposta no /leads; rotinas mapeadas gravadas no /cliente; ANPD-agência no
  gate do /reativar; oferta de /automatizar no modo Alerta do /concorrente; baseline de
  3 números no /perfil-ig; enforcement retroativo de review no /local; CAC com campo
  canônico no /roi; /escritor-br citado no /repurpose; 390px unificado no premium-design;
  downsell na proposta perdida + "enviar ≤24h da reunião"; llms.txt e "2,7x" do /seo
  reenquadrados com honestidade (aposta de custo zero / correlação, não promessa).

## [0.2.13] — 2026-07-03

> Fase URGENTE da auditoria total (6 auditores externos + pesquisa web, relatórios em
> `docs/auditoria-*-2026-07-0*.md`, plano em `docs/auditoria-total-2026-07-03-plano.md`).
> Bugs silenciosos e itens com relógio, corrigidos antes das ondas 1-5.

### Corrigido
- **`/atualizar-motor` não propagava o `CLAUDE.md`** — a constituição nunca descia pros
  clones e o `motor-versao.md` carimbava a versão velha com confiança. Agora: `CLAUDE.md`
  no checkout, versão lida do TEMPLATE com gate local==template, teste de aceitação novo.
- **`lib-shorts.mjs` amputava short aos 30s em silêncio** (meio da frase = payoff perdido).
  Novo `limitarDuracao`: teto 60s default (`--teto` até 180s), corte recuado pro fim da
  frase via `palavras.json`, flag `truncado` + aviso no dry-run. Régua de duração unificada
  (20-60s conforme o job) no `/shorts` e `/roteiro-yt`. 12 testes.
- **Recência fictícia no radar de temas** (`dias: 7` cravado) — agora `upload_date` real do
  yt-dlp (`diasDesdeUploadDate`); data desconhecida vale 0, nunca frescor inventado. Score
  ganhou **outlier** (views ÷ mediana do canal — demanda de TEMA, padrão Galloway) no lugar
  de views absoluto. Fallback de termos hardcoded ("claude code") removido — termos vêm de
  `pilares.md`/`--termos`. 15 testes.
- **Citação quebrada no `/treinar-vendas`** (30%/+50% apontavam pra fonte que não os contém)
  — reescrito sem falsa precisão; benchmarks de call marcados como ordem de grandeza.

### Adicionado
- **Varredura de segredo no `/salvar`** — grep de padrões de credencial (`ixk_live_`,
  `sk-`, `Bearer`, `AKIA`, `ghp_`) no CONTEÚDO antes do `git add -A`; achado → mostra e
  pergunta, nunca sobe. O `.gitignore` protege arquivo, não token colado em nota.
- **ChatGPT Ads re-verificado (2026-07-03)** — tabela de países atualizada (UK live+self-serve,
  JP/KR live, piso de gasto US removido, BR/MX "coming weeks"); description sem estado
  cravado ("status muda semanalmente — a skill confere ao rodar"); watch-item de múltiplos
  formatos.

## [0.2.12] — 2026-07-02

> Entrevista invertida no `/plugar` (método Hormozi via vídeo Dream Labs) + auditoria
> externa da melhoria aplicada (8 ajustes).

### Adicionado
- `/plugar` Fase 2B invertida: o dono dá uma AULA solta (texto ou áudio via whisper local)
  → o sistema marca cobertura contra 12 pontos de business context → pergunta SÓ o que
  faltou (pode pular; aula curta ganha fallback em blocos). Aula crua preservada em
  `nucleo/aula-do-dono.md` (fato ≠ fala); pede 2-3 amostras reais de texto; eco de
  validação da voz; asset novo `.claude/skills/plugar/assets/contexto-do-negocio.md`.
- `/voz` lê a aula do `/plugar` antes do roteiro e NUNCA a descarta no "refazer do zero".

## [0.2.11] — 2026-06-29

> Integração do playbook JP Middleton (agência de IA ~US$25M) + esteira de crescimento +
> auditoria de olhos frios com pesquisa de mercado. Tese central: **tráfego pago é o último
> passo** — antes, arrumar a casa (reativar base, review, atendimento, orgânico).

### Adicionado
- `docs/formula-ads-jp.md` — teardown da fórmula de ads do JP (framework "4 Elementos":
  Ad Copy/Creative/Headline/Description + checklist por elemento + contra-exemplo) e o playbook
  de reativação de base (gancho-SEMPRE-com-oferta) e review. **Alerta jurídico:** a mecânica de
  review do JP (filtro 1-5 + sorteio) é ILEGAL (gating + incentivo; Google abr/2026 + FTC; caso
  Fashion Nova US$4,2M) — documentado o que NÃO fazer + o playbook compliant que performa igual.
- `docs/blueprint-esteira-crescimento.md` — mapa-mestre de 4 fases (Casa → lead que já existe →
  orgânico → pago), com métrica de saída por fase e a coluna "o que dá pra entregar hoje sem o
  agente WhatsApp".
- `docs/auditoria-esteira-2026-06-29.md` — auditoria de olhos frios (subagente) + pesquisa de
  mercado 2026; backlog priorizado (blockers de LGPD/WhatsApp resolvidos; 6 oportunidades).

### Adicionado (pós-auditoria — oportunidades 1 e 2)
- **Skill `/velocidade`** + `scripts/lib-velocidade.mjs` (+ 8 testes) — speed-to-lead: calcula
  por script quantos leads e R$ o negócio perde por responder devagar e o ganho de responder em
  <5min. Roda por estimativa (prospect) ou dado real do CRM. Chamada pelo `/raio-x` e `/proposta`
  como argumento de abertura; é a métrica de saída da Fase 1. Argumento de venda nº 1 da esteira.
- **Molde da oferta-esteira** (`.claude/skills/oferta/references/molde-esteira.md`) + catálogo
  exemplo (`docs/exemplo-oferta-impulsox.md`) — 6 partes + Money Model + gates de compliance pra
  montar a oferta do Sistema de Crescimento. Filosofia modular: ofertas coexistem, vende-se o que
  o cliente precisa agora, upsell depois. + garantia de risco invertido (SLA / serviço condicional
  / anti-garantia, wording real, nunca faturamento).
- **Skill `/treinar-vendas`** (Pilar 5 da esteira) — script de vendas (diagnóstico) + role-play
  (IA banca o cliente que rebate) + nota da call por rubrica ponderada nomeada (Descoberta 30% /
  Valor 25% / Objeção 25% / Fechamento 20%). Calibra nas objeções reais do CRM.
- **Gate "saúde da casa"** no `/carteira` + Passo 0.5 na `/ads-meta` — 6 checagens objetivas antes
  de liberar tráfego pago (destino converte, responde rápido, prova, orgânico, Pixel+CAPI, verba).
  Informa e recomenda a ordem, não trava. Transforma "ads por último" de regra verbal em gate.
- **`/intake` — 5ª frente da esteira** (acessos extras por fase) + **gate de prova de consentimento
  da base** (data+canal+texto do opt-in; e-mail não cobre WhatsApp). Resolve o blocker LGPD do
  onboarding no dia 1.

### Mudado
- `CLAUDE.md` §Conduta — 3 regras novas: "tráfego pago é o último passo", "review nunca por
  gating/incentivo ao cliente", "vender modular, fazer upsell depois". Bump v0.2.11.
- `/raio-x` (vazamento de velocidade) + `/proposta` (abertura) chamam `/velocidade`.
- `/oferta` lê o molde-esteira pro perfil agência.
- `/ads-meta` — framework "4 Elementos" no Passo 3 + descoberta via Ad Library (reviews→nome real).
- `/reativar` — canal WhatsApp + regra de ouro (reativação SEMPRE com oferta) + modo serviço-
  cliente-final + **gate LGPD (consentimento próprio de WhatsApp, opt-out, multa ANPD R$50M) +
  template HSM obrigatório** antes de disparo em massa.
- `/depoimento` + `/local` — modo serviço (review pros clientes do cliente) COMPLIANT; régua de
  incentivo canônica na `/local` Passo 3.5 (as outras só referenciam); resposta a review em
  escala passa por aprovação (nunca full-auto); "premiar a equipe" rebaixado a ideia a validar
  (Google não atribui review por funcionário).
- `mapa-de-skills.md` — esteira pré-ads + referências aos docs novos.

## [0.2.10] — 2026-06-24

> Craft de movimento: o sistema já elevava páginas com animação (`/premium-design` Uso 2), mas
> sem catálogo nomeado de efeitos. E faltava o caminho "dono viu uma animação e quer igual".

### Adicionado
- `docs/craft-movimento.md` — catálogo de 9 efeitos cinematográficos com WOW (text-split,
  count-up, scroll cinematic, magnetic, clip-path, parallax, spotlight, WebGL, smooth scroll),
  cada um com ficha (quando dá WOW / quando não / custo / reduced-motion / de qual site real
  capturar: Apple, Lusion, OHZI, GSAP, Lenis, Codrops). Regras: movimento serve a mensagem,
  capturar de fonte real, performance é lei, reduced-motion sempre, máx 2-3 por página. Lido
  por `/premium-design` e `/pagina`.
- `/premium-design` **Uso 4** — captura dirigida pelo dono: ele cola a URL de um site, a skill
  usa a Fase 1 (Captura) pra isolar o efeito e adapta com a marca. Do site vem só o "como".

### Mudado
- `/premium-design` Uso 2 lê o `craft-movimento.md` (ganha o vocabulário que faltava).
- `/pagina` Etapa 3.5 referencia o catálogo.
- `CLAUDE.md` — craft-movimento.md entra na lista de docs de craft lidos.

## [0.2.9] — 2026-06-24

> Craft de pitch narrado: a `/slides` passou a gerar pitch fraco (auditoria do
> `revisor-marketing` reprovou — headline descrevia produto, arco vazio, prova inventada).
> Causa raiz: o passo 5 era um checklist passivo. Conserto: doc de craft novo + loop ativo.

### Adicionado
- `docs/pitch-narrado.md` — craft do ARCO de pitch que converte (o nível acima de
  `persuasao.md`/`frase-que-pega.md`). 4 pilares: Sparkline (Duarte, arco oscilante), espinha
  estratégica (Raskin, 5 passos: mudança inegável → inimigo → terra prometida → produto-caminho
  → prova), Equação de Valor (Hormozi, o slide de oferta), demo Tell-Show-Tell. Na voz da casa,
  com as regras duras (só oferta ATIVA, prova só real do banco, calma nunca grito). Lido por
  `/slides`; disponível pra `/proposta` e `/roteiro-yt`.

### Mudado
- `/slides` passo 5 — de checklist passivo pra **loop ativo** (mapa do arco → rascunho →
  auto-crítica explícita → reescrita), lendo `docs/pitch-narrado.md`. Os 4 achados que
  reprovaram o pitch viram as perguntas da auto-crítica, pegas antes do GATE 2. O bloco de
  regras inline duplicado saiu (a régua mora no doc, fonte única).
- `CLAUDE.md` — pitch-narrado.md entra na lista de docs de craft lidos.

## [0.2.8] — 2026-06-23

> CRM no ar (service token `ixk_live_` + chave pública `ixs_pub_` mergeados). Primeiras
> oportunidades do eixo-lead plugadas.

### Adicionado
- `scripts/lib-crm.mjs` — a ponte OS→CRM v3: `crmFetch` (Bearer service-token, envelope
  success/fail, `CrmError` com status), helpers reports/contacts/deals/invoices/csv. Token
  sempre redigido em erro. Só transporte. 7/7 testes (mock http). Fundação do eixo-lead.
- Skill `/roi` (O2 ⭐) — cruza gasto de mídia (do `/analisar-ads`) × receita real do CRM
  (reports/deals/invoices via lib-crm) → faturamento influenciado, CAC, ROI. Cálculo só por
  `scripts/lib-roi.mjs` (5/5 testes; divisão-por-zero→null, nunca inventa). Atribuição por
  canal (UTM por campanha espera o sub 1 do PRD). Alimenta o `/relatorio`.
- `.env.example` — `CRM_BASE_URL` + `CRM_TOKEN` (um token por tenant, scope data:read).
- Eixo-lead completo (ponte validada com dado real — `GET /reports` 200):
  - `/leads` (O1) — ponte do lead pro CRM (Contact) + lê status; não recria captura.
  - `/carteira` (O7) — modo agência: lê o CRM por tenant (1 token/cliente) → visão de
    carteira (receita, leads, saúde, "o que fazer hoje"). Cockpit pra escalar N clientes.
  - `/reativar` (O3) — segmenta inativos no CRM + escreve win-back na voz; o CRM dispara
    pela régua de follow-up que já tem (não duplica o motor).
  - `/depoimento` (O5) — gatilho de timing: deal ganho no CRM (poll) → aciona o pedido de
    prova do `/provas` no pós-resultado. (Webhook = fase 2.)
- `receitaDeReports()` na `lib-crm` — lê o shape real `data.receitaTotal.value`.

### Ligado
- `/agente-ia` — chat da landing operante: persona sobe via `PUT /api/settings/persona`,
  widget usa a `ixs_pub_` (`x-impulsox-site`) no `POST /api/chat`. (Detalhe do passo de
  ativação no SKILL.)

## [0.2.7] — 2026-06-23

### Adicionado
- Skill `/slides` — deck de apresentação premium navegável (HTML tela cheia, na marca) pra
  rodar no PC: gravando vídeo do YouTube OU apresentando pra cliente em potencial. Produto
  real em mockup, slides-ponte pra demo ao vivo, notas do apresentador. Modo institucional
  (pitch) + modo tema (deck do vídeo). Distinta do `/reel-marca` (vídeo que toca sozinho).

## [0.2.6] — 2026-06-23

> Oportunidades da auditoria SO — as 3 que NÃO dependem do CRM. As 5 do eixo-lead
> (`/leads`, `/roi`, `/reativar`, `/depoimento`, hub multi-cliente) esperam o CRM ganhar a
> ponte do `docs/prd-integracao-crm.md`.

### Adicionado
- Skill `/concorrente` — vigia competitiva: dossiê vivo do concorrente em
  `nucleo/concorrentes.md` (posicionamento, preço, ofertas, cadência, anúncios ativos via
  Meta Ad Library, lacuna), só de fonte pública (zero login). Modos mapear/alerta/
  comparativo. `/radar`, `/ads-meta`, `/oferta` e `/proposta` consomem o dossiê. (O6.)
- Skill `/intake` — onboarding operacional do cliente novo (acessos por convite seguro —
  nunca senha; KPI do contrato; calendário de aprovação; escopo) → formulário pro cliente +
  `nucleo/intake.md`. Roda após `/cliente`, antes de `/identidade`. (O4.)
- Skill `/agente-ia` — SDR conversacional na landing: gera o widget de chat na marca
  (injetável) + a persona (do núcleo, só oferta ATIVA + prova autorizada) + o contrato de
  `POST /api/chat`. Runtime vive no CRM (item novo no `docs/prd-integracao-crm.md`); o widget
  fica em estado desabilitado honesto até o endpoint existir. (O8.)
- `docs/prd-integracao-crm.md` — PRD da ponte CRM↔OS (service token por tenant, UTM no
  Contact, filtros, `POST /api/chat`, webhook) que destrava as 5 oportunidades do eixo-lead.

## [0.2.5] — 2026-06-23

### Adicionado
- Skills `/copy`, `/geo`, `/local`, `/perfil-ig`, `/relatorio`, `/analisar-dados`,
  `/gravar-tela` agora aparecem no `docs/mapa-de-skills.md` (estavam órfãs); seções novas
  de "Presença que não é feed" e "Medição (três portas)".
- Incorporação da inteligência do time Sabrina (ver 0.2.4): nota X/10, Wedge, matriz CTA,
  `/repurpose`.

### Alterado
- **Auditoria de nível-sistema** (4 frentes: arquitetura, UX do dono leigo, consistência,
  oportunidades) — `docs/auditoria-so-2026-06-23.md`. Correções:
  - Desambiguação de descoberta: "preciso de um site / por que não apareço no Google" tem
    desempate claro entre `/raio-x` (diagnóstico), `/pagina` (criar) e `/seo` (ajustar).
  - `/desempenho-yt` vira stub que não compete por gatilho com a porta única `/desempenho`.
  - `/conteudo` description distinta de `/post` (um post) e `/repurpose` (fonte longa).
  - Loop medição→página: `/desempenho` e `/analisar-ads` apontam `/copy`/`/oferta` quando o
    gargalo é a landing.
  - Fronteira `/post` (reel IA) vs `/reel-marca` (motion graphics) no frontmatter.
  - CLAUDE.md: mapa-de-skills como fonte única do degrau; fecho alinhado à prática.
  - `/automatizar` exige "Teste de aceitação" + fecho padrão no molde de skill nova.
- Fechos "→ próximo passo" adicionados em `/thumbnail`, `/gravar-tela`, `/reel-marca`.
- Onboarding: README e `/abrir` reforçam "fale natural, não decore comando".

### Corrigido
- **CHANGELOG reconstruído** (0.2.2/0.2.3/0.2.4 estavam faltando — o `/atualizar-motor`
  estava cego sobre o que os clones precisavam puxar).
- Prefixo de script padronizado no `impulsox-chatgpt-ads` (`scripts/`, não `skill/scripts/`).
- `impulsox-chatgpt-ads` ganha gatilhos em PT-BR na description.

## [0.2.4] — 2026-06-23

### Adicionado
- Skill `/revisar-pagina` — avaliador frio de design+copy de página pronta (agente
  `revisor-pagina`, régua nomeada, captura 390/768/1440); gate antes de `/publicar`.
- Skill `/reel-marca` — reel de motion graphics por código (Remotion): texto animado +
  produto real do cliente em mockup, na marca e voz dele; tema parametrizável por
  `marca/tokens.css`; CTA local + objetivo save/send + cover.
- **YT-OS Gravação & Movimento** (port headless do Recordly): `/gravar-tela` (tela + voz +
  webcam + telemetria de cliques/cursor + áudio do sistema), auto-zoom por clique
  (anti-tontura), bolha de webcam, edição por trechos/velocidade, filler-removal,
  auto-reframe 9:16, punch-in, corte de intro morta.
- Skill `/repurpose` — 1 fonte longa vira uma semana de peças nativas (IG, LinkedIn,
  Reel/TikTok) via as skills donas, graduadas pelo `/revisar`, jogadas no `/calendario`.
- Campo **Opinião contrária / Wedge** em `nucleo/negocio.md` (capturado no `/plugar` e
  `/voz`; lido por `/post`, `/formulas`, `/calendario`, `/repurpose`).
- Nota X/10 + scorecard de 7 dimensões (Hook=50%) no `/revisar` e no agente
  `revisor-marketing`, só para peça de social orgânico.
- B-roll com voz narrada (`gerar-tts.mjs` ElevenLabs; a fala manda a duração; karaokê).
- Camada de funil TOFU/MOFU/BOFU na `/roteiro-yt`.

### Alterado
- `/desempenho` vira **porta única** YouTube + Instagram com diagnóstico acionável
  (sintoma → skill que conserta); `/desempenho-yt` vira redirect.
- `/post` — save/send default, punchline no último slide, 7-10 slides, swipe-retention,
  matriz CTA × plataforma, régua técnica de reel; reel de conteúdo na fórmula viral.
- `/formulas` — protocolo de iteração de hook (first-3-words) + taxonomia ordenada por teto.
- **Auditoria 2026** aplicada (estado-da-arte em ~25 skills); fecho "→ próximo passo"
  padronizado em todas as skills.
- `/atualizar-motor` inclui `remotion/` e `.gitignore` no checkout do motor.

### Corrigido
- CWV medido 2-3x usando a mediana (1º run é cold start, inflava o LCP).

## [0.2.3] — 2026-06-17

### Adicionado
- Skill `/painel` — status board vivo do negócio (servidor local + front em `dashboard/`,
  4 blocos, live 5s, ciclo protagonista) + ledger de custo (`dados/custos.jsonl`).
- Conector de **publicação** (`/publicar`): Instagram + Facebook + LinkedIn via API oficial
  (dry-run + `--confirmar`, redação de token) e Google Meu Negócio (`/local`).
- **Canal YouTube (Fase 1-3.5):** `/roteiro-yt` (packaging título+thumbnail, hook split,
  funil), `/tema-yt` (radar de tema), `/thumbnail`, `/editar-video` (corte de silêncio,
  legenda karaokê, normalização -14 LUFS), `/shorts` (long→shorts), upload pro YouTube,
  `/desempenho-yt` (métricas/retenção), `/voz --canal`, `/formulas` modo vídeo + Modo 4
  (monitorar criadores).
- `/identidade` — mood board de escolha, logo por IA (wordmark por grid), árvore de decisão
  completa, liga o daemon do Open Design sozinha.
- `/premium-design` — Uso 2 (elevar design com camada premium) e Uso 3 (re-estilizar no
  jeito de site premiado do nicho com a marca cravada; biblioteca `referencias-por-nicho.md`).
- `docs/mapa-de-skills.md` — como as esteiras se conectam + infra invisível.

### Alterado
- Sistema **guia pela esteira**: cada skill aponta o próximo passo, pergunta antes, e se
  acha se o dono pular etapa. Fluxo principal × opcionais (YouTube beta/ads/chatgpt-ads só
  quando o dono pede).
- `canal-youtube/` no template usa só exemplos genéricos; dado real do canal vai pro clone.
- Regra global "copiar a fórmula de quem já faz sucesso" gravada na conduta.

## [0.2.2] — 2026-06-14

### Adicionado
- Skill `/copy` — engine de copy de conversão para landing pages, em 4 camadas (incl. a
  Camada de Ideia: caçar a frase que pega), plugada no `/pagina` com gate `/escritor-br`.
- `docs/frase-que-pega.md` + `docs/swipe-copy.md` — craft de hook e acervo de copy real.
- **Fal.ai imagem + vídeo** (substitui OpenAI): `gerar-imagem.mjs` (minimax/FLUX/Nano
  Banana) e `gerar-video.mjs` (Kling/Seedance/LTX; corte rápido por cena); `/post` passa a
  entregar **reel** (foto + vídeo), não só carrossel.
- `gerar-avatar.mjs` — foto + áudio vira pessoa falando (lip-sync), com guarda de custo.
- `/raio-x` ganha etapa de mini-redesign (prova de valor da reunião).

### Alterado
- Regra dura "**peça pública só vende oferta ATIVA**" gravada no `/copy` e na conduta.

## [0.2.1] — 2026-06-13

### Corrigido
- `/premium-design` — captura automática via Playwright não resolvia o módulo nesta
  máquina (`Cannot find module 'playwright'`). Playwright + Chromium agora são
  dependência do projeto (`npm i -D playwright`), e o script de `references/captura.md`
  roda por argumento de URL (`node captura.js <url>`) com passo de install documentado
  no topo.
- `/premium-design` — o fallback para captura manual deixou de ser silencioso: quando o
  Playwright está ausente (script sai com código 2) ou a rede bloqueia, a skill anuncia
  em voz alta "⚠️ Playwright indisponível, usando captura manual" antes de cair pros
  métodos manuais. Regra gravada no `SKILL.md` (Fase 1) e em `references/captura.md`.

### Adicionado
- `package.json` / `package-lock.json` — `playwright` em devDependencies (motor de
  captura do `/premium-design`).

## [0.2.0] — 2026-06-12

### Adicionado
- Skill `/premium-design` — motor de design que extrai e recombina DNA visual de
  referências reais; alimenta a biblioteca `marca/design-systems/`.
- `nucleo/ofertas.md` — catálogo de ofertas do negócio (o que é, pra quem, preço,
  benefício, objeções, sazonalidade, prioridade comercial); lido por calendário,
  conteúdo, anúncios e proposta.
- Skill `/radar` — pesquisa de ideias de conteúdo em 5 camadas (nicho, busca
  social, concorrentes, sazonalidade, demanda interna).
- Skill `/email` — sequências de boas-vindas, newsletter mensal e follow-up de
  proposta.
- Skill `/analisar-dados` — resumo executivo de CSV/XLSX/JSON/TXT, com script de
  agregação para valores financeiros (dinheiro se calcula em código) e teste.
- `docs/headless.md` — guia de execução de skills via `claude -p` em cron no VPS.
- `motor-versao.md` — gravado nos clones pelo `/atualizar-motor`: versão, data e
  hash do commit do template aplicado.

### Alterado
- `/identidade` — as 3 direções nascem da `/premium-design` a partir de
  referências reais; o fallback da imaginação sai marcado como "sem DNA real".
- `/pagina` — escolhe um design system de `marca/design-systems/` antes de codar.
- `/post` — craft visual: layouts nomeados (CAPA, SOLO, DUO, NÚMERO, CITAÇÃO,
  CTA FINAL), regra de contraste tipográfico e sequência de capas no feed.
- `/plugar`, `/voz` — entrevista passa a cobrir ofertas.
- `/calendario`, `/post`, `/linkedin`, `/ads-google`, `/ads-meta`, `/proposta`,
  `impulsox-chatgpt-ads` — passam a consumir `nucleo/ofertas.md`.
- `/cliente`, `/automatizar` — fase de mapeamento de rotinas repetíveis.
- `/conteudo`, `/radar` — aceitam transcrição de vídeo como fonte (repurposing).
- `/criar-ebook`, `/proposta` — handoff para o `/email`.
- `/atualizar-motor` — grava `motor-versao.md` e cria a tag local
  `pre-atualizacao-<versao>` antes de sobrescrever as skills do clone.
- `CLAUDE.md` — versão 0.2.0; menções a `marca/design-systems/` e
  `nucleo/ofertas.md`.
- `README.md` — contagem 32 → **37 automações**; `/radar`, `/email`, `/analisar-dados`,
  `/premium-design` e `/atualizar-motor` listados nas seções.

### Notas de implementação (aprendizados)
- O `/post` já trazia "Sequência de capas no feed" e o princípio de contraste de uma
  versão anterior; a Fase 1.3 **reforçou** (kerning explícito, registro no `legenda.md`)
  em vez de duplicar seção.
- `node --test scripts/` não expande o diretório nesta versão do Node (24.x): rodar os
  arquivos de teste explicitamente (`node --test scripts/*.test.mjs` ou listando-os).
- `yt-dlp` (repurposing no `/conteudo`) e o bot de Telegram (alertas headless) ainda **não**
  estão em `docs/ferramentas.md`; as referências ficaram condicionais ("quando o clone
  adotar"), pra não apontar pra entrada inexistente.

## [0.1.0] — 2026-06-10

### Adicionado
- Primeira versão do motor: núcleo, marca, docs, scripts e o conjunto inicial de
  skills, incluindo o `/atualizar-motor` que leva o motor do template aos clones.
