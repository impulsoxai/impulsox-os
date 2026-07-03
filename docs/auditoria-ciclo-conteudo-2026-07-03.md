# Auditoria externa — Eixo CICLO DE CONTEÚDO/SOCIAL (etapa 4 de 6)

> Auditor externo (contexto limpo + pesquisa web real) · 2026-07-03
> Escopo: radar, calendario, pulso, revisar, publicar, desempenho, post (processo),
> perfil-ig, local, concorrente.
> Verificado contra as 6 auditorias passadas — NÃO re-reporta: save/send no briefing,
> punchline no fecho, 7-10 slides e swipe-retention (implementados no /post desde 22/06);
> "Validadas aqui vazio" como sintoma (copy 02/07); newsletter/vídeo LinkedIn (copy #6);
> loop página L1 (fechado no fecho do /desempenho); números sem fonte como regra geral
> (copy top #1 — só aponta instâncias NOVAS como carona).

---

## 1. Diagnóstico do eixo em 5 linhas

O desenho do ciclo é melhor que o dos SaaS de referência (Metricool/Buffer não têm "aprendizados que pesam mais que o padrão genérico", nem revisor de contexto limpo, nem banco de hooks com promessa de validação). Mas o ciclo **fecha no papel e vaza na tubulação**: (1) a produção é diária (/pulso, newsjacking de 48h) e a medição é **mensal e manual** (CSV colado) — a peça QUENTE morre 3 semanas antes de ser medida, e o Trial Reel que o /post oferece exige uma decisão em 24-72h que **nenhuma skill é dona**; (2) o registro por peça é fragmentado em 3 lugares (Status do calendário, `legenda.md`, `publicacoes.md`) **sem chave canônica nem os campos que o loop precisa** (mecânica de hook, fórmula, objetivo send/save/converter, nota do revisor) — é por isso que, meses depois, `hooks.md` "Validadas aqui" segue vazio: não é preguiça, é encanamento; (3) o gate preditivo (/revisar, nota X/10) **nunca é calibrado contra o resultado real** — ninguém confere se as peças 9/10 performaram acima das 8/10. E o maior desperdício: o token Meta que já PUBLICA via Graph API poderia LER insights — a infra do fechamento automático do loop está no `.env` e o /desempenho a trata como "v2 pra depois".

---

## 2. Por skill

### /radar (`.claude/skills/radar/SKILL.md`)

- 🟡 **`SKILL.md:59-78` — a camada 2 não usa o Google Trends que o próprio repo já tem.** `scripts/trends-best-effort.mjs` existe, é testado e roda sem chave (o `/tema-yt` usa) — e o /radar, cuja tese é "demanda medida vira fato", não o cita. Pra PME local BR, Reddit e HN (2 das 4 fontes com número) têm cobertura quase nula ("clínica em Moema" não tem subreddit); o Trends é exatamente a fonte de demanda BR gratuita que falta. *Melhoria: adicionar `trends-best-effort.mjs` como fonte 3.5 da camada 2, com o mesmo contrato best-effort.*
- 🟡 **`SKILL.md:72-78` — a fonte 5 (autocomplete IG/TikTok) não é executável pelo sistema e a skill não diz isso.** "Digitar o termo-raiz e anotar as sugestões" pressupõe alguém logado no app — o sistema opera zero-login (regra da casa). O autocomplete do YouTube tem endpoint público; o do IG/TikTok é tarefa do DONO no celular dele. Como está escrito, a skill parece prometer uma coleta que ela não faz — e num radar que jura "nunca inventar dado", a fonte vira ou etapa pulada em silêncio ou sugestão alucinada. *Melhoria: marcar a fonte 5 como "tarefa de 2 min do dono (mandar print/lista)" e separar o autocomplete YT (executável) do IG/TikTok (manual).*
- 🟢 **A saída (`SKILL.md:122-136`) não registra o formato de descoberta da própria plataforma.** Em 2026 a busca do Instagram indexa voiceover, texto-na-tela e legenda como SEO (o /post já sabe disso na ponta); o radar entrega "palavra-chave" mas não diz se o termo é de busca Google ou de busca IG — são intenções diferentes e formatos diferentes. Uma coluna "onde essa busca acontece" refinaria o roteamento de formato do /calendario.

### /calendario (`.claude/skills/calendario/SKILL.md`)

- 🟡 **`SKILL.md:113-116` + saída `:127-129` — o plano tem DATA e não tem HORA, e o /publicar referencia uma "janela" que não existe.** `publicar/SKILL.md:132-133` manda "publicar na janela do calendário" — mas a seção Datas do calendário distribui dias e a tabela de saída não tem coluna de horário. Contrato órfão entre as duas skills. E horário importa mais em 2026, não menos: a primeira hora decide o alcance no LinkedIn e o comment-velocity que o próprio /post persegue (`post/SKILL.md:453-457`) só existe se alguém publica quando o público está lá; os SaaS vendem "best time" como feature central (+25-40% de engajamento com timing por dado histórico). *Melhoria: coluna "hora" na tabela (default por plataforma + o /desempenho aprende a janela DESTA conta e grava em `aprendizados.md`).*
- 🟢 **`SKILL.md:99-111` — a pauta Hero/derivadas não tem rastreio na saída.** O plano marca Hero e derivadas em prosa, mas a tabela (Data/Rede/Formato/Intenção/Tema/Status) não tem campo pra isso — na execução, a produção não sabe olhar a Hero pronta antes de fazer a derivada. Uma coluna "origem" (hero / derivada-de-X / avulsa) resolve.

### /pulso (`.claude/skills/pulso/SKILL.md`)

- 🟡 **`SKILL.md:104` — "zerar na virada" apaga o dado que a curadoria de fontes precisa.** A regra do `fontes.md` é "fonte que nunca rende ideia sai" (`SKILL.md:128-129`) — mas o histórico USADAS/VENCIDAS é zerado todo mês e **nenhum lugar acumula "quantas ideias cada fonte rendeu"**. A decisão de cortar fonte fica pra memória de sessão, que a casa mesma diz que não é fonte de verdade. *Melhoria: mini-tabela de tally por fonte no rodapé do `banco.md` (fonte · ideias geradas · usadas), somada na virada em vez de apagada.*
- 🟢 **O digest não fecha com o /desempenho.** Peça nascida de ideia QUENTE segue o fluxo normal, mas nada marca na peça que ela foi newsjacking — no relatório mensal, o desempenho de newsjacking (que naturalmente rende pico curto) se mistura com evergreen e contamina a média. Um campo `origem: pulso-quente` na peça deixaria o /desempenho separar as réguas.

### /revisar (`.claude/skills/revisar/SKILL.md`)

- 🔴 **`SKILL.md:50-85` — a nota preditiva nunca é confrontada com o resultado real.** O scorecard (Hook=50%) é um preditor de performance — e o sistema tem, a jusante, a medição real (/desempenho). Nenhuma linha em nenhuma das duas skills correlaciona "nota pré-publicação × save/send/reach pós". Sem essa calibragem, o gate de 8/10 é dogma: se as peças 9 não performam acima das 7, o peso de 50% no hook está errado PRA ESTA conta e ninguém vai descobrir. É o coração do "content intelligence loop" (observar → validar padrão) aplicado ao próprio juiz. *Melhoria: registrar a nota no `legenda.md`/`publicacoes.md`; o /desempenho ganha 3 linhas — "peças nota ≥9 vs 7-8: a nota previu?" — e o resultado calibra o scorecard em `aprendizados.md`.*
- 🟡 **O scorecard não checa a peça contra o OBJETIVO que ela mesma declarou.** O /post obriga a peça a nascer com alvo declarado (ENVIAR/SALVAR/CONVERTER, `post/SKILL.md:169-199`) — mas o revisor avalia "Shareability 10%" genérica, sem receber nem conferir o alvo: uma peça desenhada pra SALVAR pode passar sem slide-referência se o resto compensar. *Melhoria: o pacote do despacho leva o objetivo declarado; o revisor confere a mecânica correspondente (gancho de envio / slide guardável / PONTE+prova) como item pass/fail.*

### /publicar (`.claude/skills/publicar/SKILL.md`)

- 🟡 **`SKILL.md:82-84` — o `publicacoes.md` registra id/data/link e descarta os metadados que o loop precisa.** A peça carrega (no `legenda.md`) mecânica de hook, fórmula, tipo de capa, objetivo e agora a nota do revisor — e o registro de publicação não leva nada disso. Na hora de medir, o /desempenho precisa fazer join manual entre calendário + pasta da peça + publicacoes.md **sem chave definida** (slug? id? data?). É a razão estrutural de "Validadas aqui" continuar vazio: validar mecânica exige cruzar 3 arquivos à mão, todo mês. *Melhoria: definir o slug como chave canônica e o `publicar` copiar pro `publicacoes.md` uma linha estruturada (slug · id · data · formato · objetivo · mecânica · fórmula · capa · nota-revisor · origem pulso/radar).*
- 🟢 **`SKILL.md:94` — "Limite: 25 posts/24h" pode ter envelhecido.** Fontes 2026 e a doc da Meta citam 50 posts/24h por conta via API (Reels e Stories no mesmo balde). Instância nova da doença "número sem fonte+data" — aqui inofensiva até um cliente de volume alto. Conferir na doc oficial e datar.

### /desempenho (`.claude/skills/desempenho/SKILL.md`)

- 🔴 **`SKILL.md:38-48` — o loop roda manual sendo que a credencial da automação já está no `.env`.** O token Meta que o `/publicar` usa pra POSTAR (mesmo app, mesma infra) dá acesso aos insights via Graph API (`instagram_manage_insights`) — e o lado YouTube JÁ TEM o espelho pronto (`scripts/metricas-youtube.mjs`). Não existe `metricas-instagram.mjs`. Resultado: a plataforma onde o sistema mais publica é a única onde o dono precisa exportar CSV na mão, todo mês — a fricção exata que faz o mês fechar sem medição (o próprio /calendario admite esse cenário em `calendario/SKILL.md:154-156`). O "v1 colar / v2 API" fazia sentido antes do /publicar existir; hoje é o elo manual num ciclo já automatizado nas duas pontas. *Melhoria: `metricas-instagram.mjs` lendo os ids de `publicacoes.md` (reach, saved, shares, views por media_id) — 1 script, fecha o loop de verdade.*
- 🟡 **Cadência única mensal ignora as duas janelas que 2026 exige.** (a) A peça QUENTE do /pulso vale 24-48h e é medida semanas depois, junto do evergreen — o aprendizado de newsjacking chega sempre frio; (b) o **Trial Reel** que o /post instrui (`post/SKILL.md:417-425`) exige a decisão "promover ao grid ou não" em 24-72h olhando retenção/send — **nenhuma skill é dona dessa leitura**; a decisão vai ser no feeling; (c) peças publicadas dia 2 e dia 28 entram na mesma tabela mensal com janelas de exposição desiguais — o `lib-desempenho` normaliza por reach, mas reach acumula com o tempo; comparar sem janela fixa enviesa contra as recentes (a régua "amostra pequena", `:117-118`, cobre volume, não janela). *Melhoria: dois modos — "check de 72h" (peça QUENTE + veredito do Trial Reel, 3 números, 2 min) e o mensal; no mensal, medir cada peça na janela fixa de 7 dias pós-publicação quando a API existir.*
- 🟢 **Carona da doença dos números:** "~0,48% (-24% ano a ano)", "carrossel ~0,55% > reel ~0,50% > imagem ~0,35%" (`SKILL.md:73-76`) e o "1.36x" do /post (`post/SKILL.md:110`), "12-18% vs 2-3%" (`post/SKILL.md:194`) — sem fonte nem data, no arquivo que é literalmente a régua de julgamento. Entram no mutirão do top #1 da auditoria de copy.

### /post — lado processo/ciclo (`.claude/skills/post/SKILL.md`)

- 🟡 **`SKILL.md:417-425` — o Trial Reel abre uma decisão que o ciclo não fecha** (detalhado no achado do /desempenho). A skill entrega "instrução de marcar Trial" e o fluxo acaba — nem o /publicar registra que a peça está em trial, nem o /desempenho tem o passo de veredito. *Melhoria: status `em-trial` no calendário/publicacoes + o check de 72h do /desempenho decide promover.*
- 🟢 **`SKILL.md:45-48, 364-366` — a peça registra mecânica/capa no `legenda.md`, mas o contrato de forma desse registro não existe.** "Registrar no legenda.md" aparece 4 vezes sem um molde único — cada peça vai registrar num formato, e o join do /desempenho vira parsing artesanal. Um bloco YAML fixo no topo do `legenda.md` (slug, formato, objetivo, mecânica, fórmula, capa, nota) padroniza de graça. *(Par do achado do /publicar.)*

### /perfil-ig (`.claude/skills/perfil-ig/SKILL.md`)

- 🟡 **A skill otimiza e nunca mede — único subciclo do eixo sem verificação.** A tese é "o perfil é a landing page do IG", mas não há métrica de antes/depois: visitas ao perfil, taxa visita→seguidor, cliques no link — tudo disponível nos insights nativos (e na mesma Graph API). O `/desempenho` não ingere métrica de perfil; a `perfil.md` de saída não tem campo baseline. Otimização sem baseline é opinião. *Melhoria: capturar 3 números de baseline no dia da otimização (o dono cola dos insights) e re-olhar em 30 dias no /desempenho.*
- 🟢 **`SKILL.md:33-37` — o campo de nome como "o único pesquisável" envelheceu parcialmente:** em 2026 a busca do IG varre legenda, texto-na-tela e áudio; o campo de nome segue o mais forte pra busca de PERFIL, mas a frase absoluta merece ajuste — e a bio ganhou peso como fonte do "Your Algorithm"/categorização. Reescrever a justificativa, manter a prática.

### /local (`.claude/skills/local/SKILL.md`)

- 🟡 **O checklist (Passo 2, `SKILL.md:44-58`) não cobre as mudanças 2026 do GBP.** Três novidades com impacto direto: (a) o Google agora **auto-gera "Serviços" por IA** no painel — serviço errado auto-populado engana cliente e suja o match de categoria; auditar/corrigir os auto-gerados tem que estar no checklist; (b) o GBP alimenta os **AI Overviews** (Gemini) — a skill não conecta isso ao `/geo` em nenhuma linha, sendo que pra PME local o GBP é A fonte de citação por IA; (c) o ranking local passou a pesar **engajamento do perfil** (freshness, interação, sentimento de review) acima de autoridade de domínio — a "rotina viva" do Passo 3 virou fator de ranking, não higiene. *Melhoria: bloco "GBP na era da IA" com os 3 itens + linha de fronteira com o /geo.*
- 🟢 **`SKILL.md:74, 110` — a política referenciada está atual (17/abr/2026 confere: banimento de menção de nome, kiosk e incentivo, enforcement por IA do Gemini removendo review não-compliant).** A régua canônica do Passo 3.5 está à frente do mercado. Vale 1 linha nova: o enforcement agora é automático e retroativo — review antigo não-compliant pode sumir do perfil sem aviso (gerenciar expectativa do dono).

### /concorrente (`.claude/skills/concorrente/SKILL.md`)

- 🟡 **`SKILL.md:102-117` — o dossiê não tem bloco de presença LOCAL, e pra PME o campo de batalha é o Local Pack, não a Ad Library.** O dossiê coleta site, anúncios e busca aberta — mas nota do Google, volume/velocidade de reviews, posição no Local Pack e cadência de posts no GBP (tudo público, zero login, e o `/local` Passo 1 já faz essa comparação por fora do dossiê) não têm campo. Pro cliente típico (clínica, academia), o /concorrente entrega inteligência do canal errado e o /local re-pesquisa o concorrente que o dossiê deveria ter. *Melhoria: bloco "Presença local" no molde do dossiê (nota · nº reviews · última review · Local Pack top3? · posts GBP) e o /local passa a ler/alimentar o dossiê em vez de comparar avulso.*
- 🟢 **`SKILL.md:66-67` — o modo Alerta manda "rechecar em ~30 dias, sem cron" e não oferece a `/automatizar`.** A doutrina "tarefa com cara de rotina → oferecer automatizar" está no CLAUDE.md; o fecho do modo Alerta é exatamente esse caso e não faz a oferta.

---

## 3. Top 6 melhorias do eixo (impacto ÷ esforço)

| # | O que mudar | Arquivo | Por quê | Fonte |
|---|---|---|---|---|
| 1 | **`scripts/metricas-instagram.mjs`** — ler insights (reach/saved/shares/views) dos media_ids de `publicacoes.md` com o token Meta que já publica; espelho do `metricas-youtube.mjs` que já existe | `desempenho/SKILL.md:38-48` + script novo | O ciclo está automatizado nas duas pontas e manual no meio; a fricção do CSV mensal é o que faz mês fechar sem medição — e sem medição o eixo inteiro roda em teoria | elfsight.com (IG Graph API 2026) · later.com |
| 2 | **Registro canônico por peça** — slug como chave; bloco estruturado no `legenda.md` (formato, objetivo, mecânica, fórmula, capa, nota do revisor, origem pulso/radar) copiado pro `publicacoes.md` na publicação | `post/SKILL.md:45-48,364-366` · `publicar/SKILL.md:82-84` | É o encanamento que falta pro loop de validação: hoje validar uma mecânica de hook exige join manual de 3 arquivos — a razão estrutural de `docs/hooks.md:91` seguir vazio | review.content-science.com |
| 3 | **Check de 72h no /desempenho** — modo rápido pra peça QUENTE do /pulso e pro veredito do Trial Reel (promover ao grid ou não), além do mensal; no mensal, janela fixa de 7 dias por peça quando a API entrar | `desempenho/SKILL.md:4-6` (+ `post/SKILL.md:417-425`) | Newsjacking medido 3 semanas depois não ensina nada; e o Trial Reel cria uma decisão de métrica em 24-72h que nenhuma skill é dona hoje | buffer.com (IG algorithm 2026) · later.com |
| 4 | **Calibrar o juiz: nota do /revisar × resultado real** — o /desempenho compara peças nota ≥9 vs 7-8 e grava em `aprendizados.md` se o scorecard previu; divergência recalibra o peso do hook | `revisar/SKILL.md:50-85` + `desempenho/SKILL.md:107-118` | O gate de 8/10 decide o que vai ao ar e nunca foi validado nesta conta; learning loop de verdade calibra o preditor, não só a peça | userpilot.com (Build-Measure-Learn) |
| 5 | **Doutrina de horário** — coluna "hora" no calendário (default por plataforma; o /desempenho aprende a janela real da conta), e o /publicar para de referenciar uma "janela" que não existe | `calendario/SKILL.md:113-116,127-129` · `publicar/SKILL.md:132-133` | Primeira hora decide alcance; timing por dado histórico rende +25-40% — e hoje é contrato órfão entre duas skills | growleads.io · metricool.com |
| 6 | **GBP era-IA no /local + bloco local no /concorrente** — auditar os "Serviços" auto-gerados por IA, engajamento-como-ranking, ponte com /geo (GBP alimenta AI Overviews); dossiê do concorrente ganha nota/reviews/Local Pack | `local/SKILL.md:44-58` · `concorrente/SKILL.md:102-117` | Pra PME local o GBP virou a superfície de citação por IA e o campo de batalha competitivo — e o eixo hoje coleta inteligência do canal errado (Ad Library) pra esse perfil | exploredigital.com · pinmeto.com · alevdigital.com |

**Menores (custo ~zero, fazer junto):** plugar `trends-best-effort.mjs` na camada 2 do /radar (o script já existe); honestidade operacional na fonte 5 do /radar (autocomplete IG/TikTok = tarefa do dono); tally por fonte no `banco.md` do /pulso (não zerar, somar); objetivo declarado da peça no pacote do /revisar (pass/fail da mecânica); coluna origem (hero/derivada) na tabela do /calendario; conferir e datar o "25 posts/24h" do /publicar (doc Meta indica 50); baseline de 3 números no /perfil-ig; linha "enforcement retroativo por IA" no Passo 3.5 do /local; oferta de `/automatizar` no fecho do modo Alerta do /concorrente; fontes nos números do /desempenho (~0,48%, 0,55/0,50/0,35) e do /post (1.36x, 12-18%).

**O que NÃO mexer:** a fronteira /pulso × /radar (limpa e rara — nenhum SaaS separa "validade de 48h" de "foto do mês"); o filtro das 3 perguntas do /pulso; a régua "tração medida vira fato" do /radar; o mapa sintoma→skill do /desempenho; o revisor de contexto limpo; o mapa de automação não-negociável do /publicar; a régua canônica de compliance de review do /local (à frente do mercado, atual em abr/2026).

**Registro positivo verificado:** os itens do /post apontados na auditoria de 22/06 (save/send, punchline, 7-10 slides, swipe-retention, régua do reel, tabela formato↔objetivo) **foram implementados**; o SEO-por-keyword da legenda e o Trial Reel batem com o estado 2026 confirmado (shares como sinal nº1, hashtag-follow morto, busca indexando texto-na-tela e voiceover).

---

## Fontes

Buffer — Instagram algorithm 2026 · Later — IG rank signals 2026 · Hootsuite — IG algorithm tips · Dataslayer — LinkedIn 2026 · GrowLeads — LinkedIn first 60 min · Metricool — AI social media 2026 · Later — AI social media management · Userpilot — Build-Measure-Learn · Content Science Review — content intelligence · Explore Digital — GBP 2026 · PinMeTo — AI × local ranking · Launchcodex — GBP review policy abr/2026 · Elfsight — IG Graph API 2026 · Atria — FB ads competitor tools · Visualping — AI competitor analysis
