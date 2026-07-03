---
name: radar
description: >
  Use quando o sistema precisa de IDEIAS de conteúdo embasadas em pesquisa real — "/radar",
  "ideias de post", "o que postar esse mês", "pesquisa o nicho", "o que os concorrentes
  estão fazendo", "tô sem pauta", ou quando o `/calendario` não encontra um radar do mês.
  Pesquisa em cinco camadas (nicho, busca social, concorrentes, sazonalidade, demanda
  interna) e devolve 15-20 ideias pontuadas em `producao/radar/<AAAA-MM>.md`. É a matéria-
  prima do calendário — decide o que MERECE virar pauta, não inventa do nada.
---

# /radar — Pesquisa de ideias de conteúdo

Calendário sem pesquisa é chute bem-intencionado. Esta skill vai à rua (web + dados do
negócio) e volta com pautas que têm demanda real: o que o público pergunta, o que o setor
mexeu, o que o concorrente cobriu (e o que deixou de fora), que data comercial está
chegando. Cada ideia nasce com a palavra-chave que responde — porque o Instagram também
é busca, e legenda otimizada para descoberta rende muito além do feed.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda do **degrau 1** — precisa ao menos do negócio/nicho definido no núcleo. Abaixo disso,
perguntar "o que você vende e pra quem?" e marcar o radar inteiro como rascunho. Com núcleo
e ofertas preenchidos (degrau 3+), as ideias saem amarradas à prioridade comercial.

## O que ler antes

- `nucleo/negocio.md` — o que vende, pra quem, diferencial (define o nicho da busca)
- `nucleo/ofertas.md` — cada ideia nasce ligada a uma oferta; prioridade comercial pesa
- `nucleo/perfil.md` — o tipo de negócio molda a fonte (criador puxa tema/autoridade; PME
  local puxa "[serviço] em [cidade]" e datas regionais)
- `nucleo/aprendizados.md` — o que a medição já provou que funciona aqui (não redescobrir)
- `producao/radar/` — radar anterior: não repetir ideia já usada, fechar lacunas que ficaram
- `producao/ideias/banco.md` — o banco do `/pulso` (diário): EVERGREEN com tração alta
  entra como candidata do mês SEM re-pesquisar (demanda já medida); o que o pulso viu
  morrer sem uso também ensina (tema quente que o dono deixou passar)

## Workflow — 5 camadas de pesquisa

A pesquisa é via **WebSearch/WebFetch** (consultas em pt-BR, sempre com o ano corrente).
Cada camada alimenta a lista de ideias; nenhuma inventa dado.

### 1. Nicho — o que mudou no setor
Notícias, mudanças de regra, lançamentos e tendências recentes do segmento do negócio.
Buscar em pt-BR com o ano. O que é novidade vira pauta de autoridade ("o que muda com X").

### 2. Busca social — as perguntas reais do público (priorizadas por tração)
As dúvidas que as pessoas digitam — **mas ranqueadas pelo que tem engajamento real AGORA**,
não pelo que parece interessante. Não basta saber que perguntam; saber o que está
*bombando* separa pauta morna de pauta que pega. **Cada ideia nasce com a palavra-chave
que ela responde** — o Instagram funciona como motor de busca; legendas e títulos
otimizados para descoberta alcançam quem procura aquilo.

Fontes, em ordem de uso (todas gratuitas, sem chave paga, sem terceiro — só o que já
existe no ambiente):

1. **Google PAA** — "Pessoas também perguntam" via WebSearch. As dúvidas explícitas.
2. **Reddit** (JSON público, sem login) — buscar o termo e ler o que sobe:
   `https://www.reddit.com/search.json?q=<termo>&sort=top&t=month&limit=25`
   e subreddit do nicho: `https://www.reddit.com/r/<sub>/top.json?t=month&limit=25`.
   O campo `score` (upvotes) e `num_comments` são a métrica de tração — post com score
   alto = dor real do público. Ler título + comentários top.
3. **Hacker News** (Algolia API free, sem chave) — relevante pra nicho tech/SaaS/dev:
   `https://hn.algolia.com/api/v1/search?query=<termo>&tags=story&numericFilters=created_at_i>...`
   ordenar por `points`. Pular se o nicho não for tech.
4. **YouTube** (yt-dlp, já instalado) — buscar o termo e olhar os vídeos do último mês com
   mais views: `yt-dlp "ytsearch20:<termo>" --dateafter now-30days --print "%(view_count)s | %(title)s | %(webpage_url)s" --skip-download`.
   Título de vídeo que viralizou = ângulo que o algoritmo premia. (Mesmo anti-bot de
   sempre pode bater — se falhar, registrar a fonte como vazia, não travar.)
4.5. **Google Trends** (`scripts/trends-best-effort.mjs` — o script já existe no repo, sem
   chave, best-effort) — related queries + interesse do termo-raiz. Pra PME local BR é A
   fonte de demanda que Reddit/HN não cobrem ("clínica em Moema" não tem subreddit).
   Mesmo contrato das outras: falhou/bloqueou → fonte vazia, nunca trava nem inventa.
5. **Autocomplete nativo de plataforma** — honestidade operacional: o que o SISTEMA
   consegue sozinho é só o do **YouTube** (endpoint público de suggest). O autocomplete de
   **Instagram/TikTok exige app logado — é TAREFA DE 2 MIN DO DONO**, não coleta do
   sistema: pedir a ele "digita [termo-raiz], '[serviço] como', '[serviço] vale a pena' na
   busca do IG/TikTok e me manda um print (ou digita as sugestões)". Nunca apresentar
   sugestão de IG/TikTok que o dono não mandou — isso seria demanda inventada, o oposto
   da tese do radar. Complementa o PAA: o PAA dá a dúvida em texto, o autocomplete dá o
   jeito que o público busca vídeo/social. Sugestão que se repete entre plataformas =
   pauta com demanda confirmada.

Fechar a camada cruzando as fontes: tema que aparece em DUAS+ com tração alta vira ideia
de pontuação de demanda 5. Tema só do WebSearch (sem sinal de engajamento) entra como
demanda 3 e marcado **suposição**. **Engajamento medido vira fato; ausência de sinal vira
suposição** — nunca inflar demanda sem o número que a sustenta.

> Por que só essas fontes: TikTok/Instagram/X exigem API paga (ScrapeCreators) ou cookies
> em área cinza dos termos — risco à conta do cliente, vetado pelo CLAUDE.md. Reddit/HN/
> YouTube cobrem o suficiente pra separar pauta quente de morna sem chave nem risco. Se um
> dia houver chave oficial paga autorizada pelo dono, esta camada ganha as fontes extras.

> Se `/pesquisa-web` (agent-reach) estiver instalada na máquina, ela pode servir de roteador
> pras mesmas fontes públicas (Reddit, YouTube, busca) com fallback automático — não muda a
> regra acima, só a confiabilidade da busca. Sem ela, seguir com os comandos diretos.

### 3. Concorrentes — o que cobriram e o que deixaram de fora
**Se existe `nucleo/concorrentes.md`** (dossiê do `/concorrente`), ler de lá a cadência e a
**lacuna já mapeada** — não re-pesquisar o concorrente do zero. Sem o dossiê, olhar os 2-3
concorrentes citados no núcleo (ou perguntar quais são) e registrar os ângulos que eles
**NÃO** cobriram. A lacuna é a melhor oportunidade. Conteúdo de concorrente é inspiração de
ângulo, nunca cópia. (Pra um perfil completo do concorrente, rodar o `/concorrente` antes.)

### 4. Sazonalidade — as datas dos próximos 60 dias
Datas comerciais brasileiras dos próximos 60 dias relevantes ao nicho. Se o MCP
`brazil-mcp-server` estiver disponível, usar a tool de feriados/datas; senão, WebSearch.
Cruzar com a sazonalidade declarada em `nucleo/ofertas.md`.

### 5. Demanda interna — as dúvidas que já chegaram
Se houver export ou relato de perguntas de clientes (ex.: log do agente de WhatsApp em
`dados/`), cada dúvida recorrente vira **ideia validada** — alguém já perguntou. Vídeos
existentes do cliente (transcrições em `dados/`) também são fonte: cada bloco de um vídeo
do dono é uma pauta candidata (repurposing — ver `/conteudo`).

### Content-decay — reaquecer o que já performou
Antes de fechar a lista, cruzar o radar novo com as peças antigas que **deram certo**
(ler `nucleo/aprendizados.md` e os relatórios de `producao/relatorios/`). Conteúdo que
performou tem prazo de validade: o alcance morre conforme a audiência muda e o tema sai de
circulação. Quando uma pauta nova bate com um campeão antigo (mesmo tema, mesma dor),
sinalizar **"reaquecer"** — refazer a peça que já provou demanda, em formato novo ou com
dado atualizado, costuma render mais barato que pauta inédita. Marcar essas ideias como
`reaquecer (peça de <data>)` na saída: é demanda já validada pelo próprio negócio, não
suposição.

## Saída — `producao/radar/<AAAA-MM>.md`

15-20 ideias. Cada uma com:

- **Título de trabalho** — a pauta em uma linha
- **Oferta relacionada** — qual item de `nucleo/ofertas.md` ela serve (ou "topo de funil")
- **Palavra-chave** — o termo de busca que a ideia responde
- **Formato sugerido** — carrossel · reel · artigo · LinkedIn
- **Pontuação 1-5** em três eixos: **relevância** (cabe no negócio) × **demanda** (gente
  procura — peso pela tração medida na camada 2, não só "parece útil") × **lacuna**
  (concorrente não cobriu) — somar para ranquear
- **Sinal de tração** (quando houver) — a métrica que sustenta a demanda: ex.
  "Reddit 340 upvotes / 80 comentários", "YT 120k views/30d". Sem número → demanda fica em
  3 e a ideia vai marcada suposição
- **Fato / suposição** — marcado: a busca confirmou (fato) ou é palpite a validar

Cabeçalho do arquivo: mês, camadas que rodaram e quais ficaram sem dado (ex.: "sem export
de WhatsApp este mês").

## Regras

- **Nunca inventar dado de pesquisa.** Camada sem resultado → dizer que ficou vazia, não
  preencher com suposição disfarçada de fato.
- **Tração medida vira fato; ausência de número vira suposição.** Demanda 4-5 só com sinal
  real (upvotes/comentários/views). Sem métrica, a ideia entra como suposição — jamais
  inflar demanda pra justificar uma pauta.
- **Só fonte gratuita e dentro dos termos.** Reddit JSON público, HN Algolia, yt-dlp.
  Nada de scraping pago de TikTok/IG/X ou cookies em área cinza — risco à conta do cliente.
- Ideia de concorrente é inspiração de **ângulo**, nunca cópia de pauta ou de texto.
- O `/calendario` **lê** o radar, mas a decisão final do mix é dele (prioridade comercial,
  perfil, aprendizados). O radar propõe; o calendário dispõe.
- Palavra-chave em toda ideia — sem termo de busca, a ideia não entra (descoberta é metade
  do alcance).
- Radar é do mês: um arquivo por `<AAAA-MM>`, sem sobrescrever os anteriores (viram histórico).

## Teste de aceitação (comportamental)

1. Núcleo preenchido → `/radar` devolve 15-20 ideias pontuadas, cada uma com oferta e
   palavra-chave; as camadas sem dado aparecem marcadas, não inventadas.
2. `/calendario` sem radar do mês → oferece rodar `/radar` antes de montar o plano.
3. Concorrente citado → o radar registra a lacuna dele, nunca copia a pauta.
4. MCP de feriados indisponível → a camada 4 cai pra WebSearch e segue, sem travar.
5. Camada 2 → tema com upvotes/views altos aparece com o número anexado e demanda 4-5;
   tema só do WebSearch entra demanda 3 e marcado suposição. yt-dlp/Reddit falhando →
   fonte registrada como vazia, sem travar a camada.

---

**✓ Pronto:** temas pesquisados com demanda real (fontes citadas) · **→ próximo passo:** `/calendario` — transforma os temas em plano do mês (o quê e quando). Sem núcleo lido, o radar não calibra por foco/oferta — o sistema reorienta. _(Se você tem uma fonte longa — vídeo, artigo, newsletter — o `/repurpose` vira o mês inteiro de uma vez; é só pedir.)_
