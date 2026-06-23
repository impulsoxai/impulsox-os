# Auditoria das skills — 2026-06-23

> Auditoria ampla de ~24 skills de valor direto (5 auditores em paralelo, cada um com
> pesquisa real de estado-da-arte 2026). NADA implementado ainda — este é o backlog pra
> decidir o que vira spec→plano→código. Cada achado tem fonte real.

---

## 🔴 URGENTES — fatos que QUEBRARAM em 2026 (corrigir já)

Números que as skills cravam mas que mudaram este ano. Skill que se vende como estado-da-arte
e entrega número velho perde credibilidade (e, no produto R$10k, entrega "reprovado").

| # | O quê | Onde | Fonte |
|---|---|---|---|
| U1 | **LCP "good" 2,5s → 2,0s** (Google core update mar/2026) | `/pagina` (Etapa 4b), `/premium-design` (gate 5), `/seo` (Fase 2) | DigitalApplied CWV 2026 |
| U2 | **FAQ rich result aposentado** (7 mai/2026) — FAQPage não gera mais sanfona na SERP; vale por **citabilidade IA** agora | `/seo`, `/copy` (Camada 4.5) | DigitalApplied Schema 2026 |
| U3 | **Pisos de orçamento BR desatualizados** — Google R$600→R$2-3k/mês; Meta R$20→~R$100/dia (CPC/CPM +12-13% em 2026) | `/ads-google`, `/ads-meta` | aIntegrare, Nexus Growth BR |
| U4 | **Open rate morreu como métrica** (Apple MPP) — usar clique/CTOR | `/email` | DigitalApplied welcome 2026 |

---

## 🟢 QUICK-WINS de alto valor (texto, baixo esforço)

### Conteúdo (sinais de algoritmo 2026)
- **`/post`** — legenda como SEO de keyword (hashtag-follow morreu; busca é por keyword); send-gancho DEFAULT (send vale 3-5x like, é o nº1 pra não-seguidores); comment-velocity no fecho; texto-na-tela como sinal de categorização. _Fonte: DataSlayer, Aibrify, Socialync._
- **`/linkedin`** — Golden Hour (entregar 1-2 comentários prontos + responder na 1ª hora); dwell time explícito (sinal nº1); saves no LinkedIn (desenhar doc PDF salvável). _Fonte: GrowLeads, DataSlayer, Melanie Goodman._
- **`/conteudo`** — keyword/cluster cross-canal (a keyword do artigo vira keyword da legenda IG + cluster do LinkedIn); trava qualidade > volume (3 fortes > 10 mornas). _Fonte: Haus of Dawn, ImageWorks._
- **`/formulas`** — hierarquia de sinal certa (send > save > comment-velocity, não like); campo "tipo de hook + retenção esperada" (unifica com a taxonomia do /reel-marca). _Fonte: DataSlayer, OpusClip._

### Estratégia
- **`/analisar-ads`** — ⭐ alerta de **atribuição inflada** (ROAS de plataforma ≠ incremental, infla 2-5x; não usar pra decidir orçamento Google×Meta); aviso da janela Meta 28d→7d-click; limiar de conversões (≥30-50 conv, não só cliques). _Fonte: Cassandra, get-ryze, DigitalApplied._
- **`/raio-x`** — eixo **GEO/visibilidade em IA** (aparece no ChatGPT/Gemini/AI Overviews?); checagem de bots de IA (robots permite GPTBot/ClaudeBot? llms.txt?). _Fonte: digital-interaction, RedRattler._
- **`/calendario`** — repurposing one-to-many explícito (1 Hero → N derivadas); mix por objetivo (alcance→reel, save→carrossel). _Fonte: Equinet, Aurelius._
- **`/desempenho`** — contextualizar engagement contra benchmark 2026 por formato (médio 0,48% -24% YoY; evita falso alarme). _Fonte: Socialinsider, InfluenceFlow._

### Página/venda
- **`/pagina`** — `fetchpriority="high"` + preload no hero (fix de maior impacto LCP); form mínimo (nome+contato = +120% conv); CTA sticky no mobile. _Fonte: DigitalApplied, Landingi, Involve.me._
- **`/seo`** — Schema em HTML estático (não JS — IA não renderiza); multiplicador de citação no relatório (Schema completo = ~2,7x Perplexity, ~3,1x AI Overviews). _Fonte: DigitalApplied, Stackmatix._
- **`/email`** — 1º e-mail imediato + janela de ouro 48h; limiar de spam 0,10% alvo / 0,30% teto; DMARC p=none→quarantine/reject. _Fonte: DigitalApplied, Chronos, Litmus._
- **`/proposta`** — "sem reunião marcada, não manda proposta" + janela 50 dias (47% win ≤50d vs ~20% depois); benchmark de close honesto (25% mediana / 35% topo). _Fonte: Optifai, GetAccept._
- **`/premium-design`** — aviso "kinetic typography quase nunca passa em produção" (briga com a11y/crawler/CWV). _Fonte: StudioMeyer._
- **`/geo`** — adicionar AI Overviews/AI Mode do Google ao conjunto auditado (maior alcance no BR). _Fonte: Mersel, Frase._
- **`/identidade`** — semear entidade (`sameAs`/`knowsAbout`, nome canônico) já no design-guide pra alimentar Schema depois. _Fonte: Stackmatix._

### Ads (tracking é a causa nº1 de PME que não converte)
- **`/ads-google`** — Enhanced Conversions como pré-requisito (não "tag genérica"); Consent Mode v2 + LGPD; benchmark BR por setor no "o que esperar". _Fonte: GROAS, Dataslayer, ALM._
- **`/ads-meta`** — Pixel + **CAPI** como pré-requisito obrigatório; regra de degrau (Detailed Targeting pra conta nova/hiperlocal, Advantage+ só após dado — replicar a lógica 2-fases do ads-google); Hook Rate / Hold Rate como régua de criativo. _Fonte: Conversios, OptiFOX, Koro._

### Prova/relatório
- **`/provas`** — indexar prova por **OBJEÇÃO que mata** (não só tipo); forçar número+prazo no caso; mix multi-formato (+37% mediana). _Fonte: Intentsify, Braintrust, Genesys._
- **`/relatorio`** — framework narrativo por seção (Observação→Hipótese→Ação→Resultado→Próximo); foco em OUTCOME não atividade; entrega por inbox (não esperar logar); seção "prova do mês". _Fonte: AgencyAnalytics, LayerFive, Statnexa._

---

## 🟡 MÉDIO esforço, alto valor

- **`/conteudo`** — ⭐ multiplicar saída: 1 pillar → 10-15 peças + 3-5 reels/shorts + e-mail (muda a economia da esteira inteira). Derivar reel do artigo (aciona /post ou /reel-marca). _Fonte: Beplan, ImageWorks._
- **`/linkedin`** — Topic Authority: 70-80% dos posts num cluster de nicho (+78% distribuição); ler nucleo/foco.md e amarrar. _Fonte: Melanie Goodman._
- **`/copy`** — passo de **VoC (Voice of Customer)**: minerar linguagem real do cliente (reviews/WhatsApp/transcrição) antes de escrever (+70% leads, headline +400% em teste real). _Fonte: CXL, Copyflight._
- **`/ads-meta`** — volume de criativo muito maior (10-15 ativos/campanha, não 3-4 — gap nº1 de resultado do Advantage+); UGC/vídeo curto como formato dominante. _Fonte: OptiFOX, Verde Media._
- **`/ads-google`** — PMax como camada complementar (20-30%, com brand exclusions, só após 30+ conv/mês). _Fonte: NAV43, Nine.am._
- **`/seo`** + **`/identidade`** — Schema de entidade (`sameAs`/`knowsAbout`/Organization). _Fonte: Stackmatix._
- **`/desempenho`** — fonte de tráfego YT (Browse vs Search vs Suggested) no diagnóstico; satisfaction signals (surveys). _Fonte: Humble&Brag, John Isaacson._
- **`/proposta`** — multi-threading (3+ contatos = +42% close); bloco de ROI/custo de não-agir. _Fonte: GetAccept, Optifai._
- **`/oferta`** — taxonomia canônica do Money Model (Attraction→upsell/downsell→continuity) + downsell explícito; CAC payback ≤30 dias como meta numérica. _Fonte: AntHodges, Brecken._
- **`/radar`** — autocomplete nativo de plataforma (YouTube/IG/TikTok) como fonte de demanda. _Fonte: DesignRush._
- **`/analisar-dados`** — variação período-a-período no script (não no "olho"); comparação contra meta de foco.md. _Fonte: boa prática._

---

## 🔵 SALTOS TRANSVERSAIS (sistêmicos — o maior valor de longo prazo)

Olhando o sistema todo, onde conectar skills rende mais que melhorar uma:

1. **Banco de prova indexado por OBJEÇÃO vira motor de matching** — `/provas` reindexado por
   objeção que cada prova mata; toda peça de venda (copy, post, pagina, proposta, ads) pergunta
   "qual objeção enfrento aqui?" e puxa a prova cirúrgica. Atravessa 6 skills. _Baixo esforço._
2. **Fechar o loop prova → medição → captura** — quando `/desempenho`/`/analisar-ads` detecta
   resultado real bom, disparar `/provas` ("momento de pico, peça depoimento agora"). A medição
   vira gatilho de captura no timing certo. Nenhuma ferramenta de mercado fecha isso. _Médio._
3. **`/relatorio` como retenção ATIVA** — narrativa por seção + entrega por inbox + prova do mês
   + alerta proativo entre relatórios (retenção +67%, é a skill que segura contrato). _Baixo/médio._
4. **Sistema todo puxando prova em VÍDEO** — conectar `/provas` a `/post`/`/reel-marca`/`/editar-video`
   (depoimento bruto → reel de prova legendado na marca). Vídeo +80% conversão. _Médio._
5. **Cobertura de prova na Escada de Contexto** — `/abrir` e `/painel` reportarem "saúde do banco
   de provas" (objeções cobertas, idade da última captura, reciclagem); aciona `/provas` antes de
   produzir peça com prova fraca. _Baixo._

**Tema comum:** a prova social está FORA do loop decide→produz→mede→corrige. Trazê-la pra dentro
(saltos 1-2-5) é onde a ImpulsoX se diferencia de qualquer ferramenta de reporting/prova.

---

## Ritual recomendado

Vários números de 2026 já mudaram DENTRO de 2026 (LCP, FAQ rich result, métricas de e-mail,
custos BR de ads). Skills que se vendem como estado-da-arte precisam de **reconferência de
limiares a cada core update do Google e a cada mudança Gmail/Yahoo**. Vale uma skill/rotina de
"auditar limiares" ou nota no `/atualizar-motor`.
