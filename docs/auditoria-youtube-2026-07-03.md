# Auditoria externa — Eixo YOUTUBE & VÍDEO CURTO (etapa 5 de 6)

> Auditor externo (contexto limpo + pesquisa web real) · 2026-07-03
> Escopo: roteiro-yt, tema-yt, shorts, thumbnail, desempenho-yt, voz --canal.
> Não repete: backlog 22/06 (roteiro/editar/gravar), etapa 2 (reel-marca), etapa 4
> (check de 72h — vale idêntico pro YT, só amarrar).

---

## 1. Diagnóstico do eixo em 5 linhas

O eixo tem a **melhor doutrina de roteiro do sistema** (skeleton, foreshadowing, funil, benchmarks — o backlog de 22/06 foi de fato implementado), mas **não está pronto pra sair de "em teste" — a rigor está "não testado"**: o `canal-youtube/` do template segue em degrau 0 (`escada.md:6`), sem `voz-canal.md` nem `formulas-video.md`, então o `/roteiro-yt` **para na própria pré-checagem** — o eixo nunca rodou ponta a ponta nem no negócio próprio. Por baixo da doutrina bonita há **contradições de régua entre skills** (3 números diferentes pra duração de short; CTR fixo de 4% vs "compare consigo mesmo") e **um bug silencioso que amputa shorts aos 30s**. O radar de temas ranqueia com sinal de recência **fictício** (`dias: 7` cravado) e sem score de outlier — mede tamanho de canal, não demanda. E o eixo está **escrito pro canal da ImpulsoX** (nicho "IA/Claude Code" hardcoded em skill e script): como produto vendável a PME, é single-tenant. Veredito: **manter "⚠️ em teste"** até (a) rodar 3-5 vídeos reais no canal próprio e (b) corrigir os 🔴 abaixo.

---

## 2. Por skill

### /roteiro-yt (`.claude/skills/roteiro-yt/SKILL.md`)

- 🟡 **`SKILL.md:323` — "CTR abaixo de ~4% nas primeiras 48h" contradiz a doutrina da própria casa.** O `/thumbnail:176-178` manda comparar com "a mediana dos últimos vídeos do canal (não um número fixo)" e o `scripts/lib-desempenho.mjs:33-34` documenta "benchmark fixo engana — CTR cai com impressões". Duas réguas pra MESMA decisão de repacote. *Melhoria: unificar na régua relativa (mediana do canal) e apagar o 4%.*
- 🟡 **`SKILL.md:195` vs `:207` vs `/shorts:44` — três durações de short no mesmo eixo.** Passo 5 crava "sweet-spot **31-60s**"; Passo 7 manda "**15-30s** (máx 60s)"; o `/shorts` corta TUDO em **≤30s**. Dado 2026: banda forte 20-45s, 50-60s chega a 76% de watch-through, teto real 3min desde out/2024. *Melhoria: uma régua só (ex.: 20-60s conforme o job, teto 60s default), citada nos 3 lugares.*
- 🟢 **`SKILL.md:324` — "os 3 títulos servem pra teste A/B" sem mecanismo.** Desde dez/2025 o Test & Compare nativo testa **título** e **pacote título+thumbnail** (até 3 combinações) — a amarra existe de graça e a skill não a cita (só o `/thumbnail` cita, e desatualizado). *Melhoria: 1 linha apontando os 3 títulos pro Test & Compare de pacote.*

### /tema-yt (`.claude/skills/tema-yt/SKILL.md`)

- 🔴 **`scripts/coletar-temas-yt.mjs:71,81` — `dias: 7` cravado pra TODO vídeo → o termo de recência do score é uma constante.** Em `lib-tema-yt.mjs:43`, `recencia = max(0, 14 - diasDesde)` = sempre 7. O ranking que a skill vende como "demanda real ranqueada" tem o sinal de recência **fictício** — vídeo de 2 dias e vídeo de 6 meses pontuam igual nesse termo. O yt-dlp entrega `%(upload_date)s` no mesmo `--print`. *Melhoria: coletar a data real e calcular `diasDesde`.*
- 🟡 **`scripts/lib-tema-yt.mjs:45` — `views/50000` cru mede tamanho de canal, não demanda de tema.** Vídeo mediano de um canal de 2M satura o sinal; o **outlier** verdadeiro (vídeo com 10x a mediana do próprio canal — o padrão Galloway/1of10 de detectar demanda) não existe no score. *Melhoria: coletar 5-10 vídeos por canal (já coleta) e pontuar `views ÷ mediana do canal`, não views absoluto.*
- 🟡 **`SKILL.md:12-13` + `coletar-temas-yt.mjs:78` — nicho "IA/Claude Code" hardcoded na skill e default `"claude code","ai automation"` no script.** O eixo está escrito pro canal próprio; num clone de cliente (dentista, academia) o texto orienta errado. Condição de vendabilidade: o nicho vem de `canal-youtube/pilares.md`/núcleo, nunca do corpo da skill. *Melhoria: parametrizar e marcar o exemplo como exemplo.*

### /shorts (`.claude/skills/shorts/SKILL.md`)

- 🔴 **`SKILL.md:44` + `scripts/lib-shorts.mjs:22-24` — truncamento SILENCIOSO aos 30s amputa o payoff.** `limitar30s` corta em `inicio+30` sem avisar nem no dry-run: um `[CORTE-SHORT: 04:12-04:48]` (36s — **válido** pelo sweet-spot 31-60s do próprio `/roteiro-yt:195`) perde os 6 segundos finais no meio da frase — exatamente onde mora o payoff/loop que a doutrina exige. *Melhoria: teto 60s default (configurável até 180s), e quando precisar cortar, cortar no fim da FRASE mais próxima (o `palavras.json` tem os tempos) com aviso no dry-run.*
- 🟡 **`SKILL.md:38-40` — falta o passo que justifica a estratégia inteira: o link "related video" (Short→long-form).** Em 2026 os modelos de Shorts e long-form foram **desacoplados** (crescimento em Shorts não transborda mais pro longo automaticamente) — o link manual no Studio virou a única ponte confiável, não tem API (é tarefa manual a instruir ao dono), e é o mecanismo do padrão Sabrina que a skill diz copiar. Nem `/shorts` nem `/publicar` o citam. *Melhoria: passo final "linkar o long-form de origem como related video (manual, Studio)" no fecho.*
- 🟢 **`SKILL.md:40` + `/publicar:111` — `#Shorts` é cargo cult em 2026.** A detecção é por formato (vertical ≤180s); a hashtag não ajuda e ocupa espaço. Inofensivo, mas a skill o vende como mecanismo.

### /thumbnail (`.claude/skills/thumbnail/SKILL.md`)

- 🟡 **`SKILL.md:80-95` — o Loop A/B ficou desatualizado (pra melhor): o Test & Compare testa TÍTULO e PACOTE desde dez/2025.** A skill prega "capa + título = uma unidade" (`:185-186`) mas o teste nativo que orquestra só sobe capas — hoje dá pra testar a unidade de verdade (até 3 pacotes título+thumb), disponível pra todo canal com Advanced Features, sem YPP. A métrica (watch time/impressão) a skill já acerta. *Melhoria: reescrever o fluxo pra subir 2-3 PACOTES.*
- 🟢 **`SKILL.md:127-137` — capa fotorrealista por IA sem tratar a política de disclosure de mai/2026.** O YouTube passou a detectar automaticamente conteúdo fotorrealista sintético não declarado (distribuição reduzida ou remoção). A regra "nunca rosto identificável por IA" cobre o pior caso, mas cena realista via Fal sem o checkbox de disclosure agora tem custo algorítmico. *Melhoria: 1 linha aqui + item no checklist do `/publicar`.*

### /desempenho-yt (redirect) + `scripts/lib-desempenho.mjs`

- 🟡 **`lib-desempenho.mjs:6-8,26` — a régua YT não tem a métrica nº1 de Shorts 2026: viewed-vs-swiped (VVSA).** O modelo de Shorts pesa swipe nos 1-3s, replay e shares; a régua da casa julga short só por AVD ≥70% (proxy razoável) — `swipeBom: 0.65` existe apenas no balde `ig`. Sem o swipe, o diagnóstico "hook fraco vs conteúdo fraco" do short fica cego. Referência 2026: VVSA <60% fraco, 70-90% forte. *Melhoria: campo `vvsa` em `taxasYouTube` + linha no diagnóstico.*
- 🟢 **`SKILL.md:33`** — o fecho aponta `/tema-yt` e fecha o ciclo — correto. O gap de cadência (check de 72h pra decisão de repacote) já foi reportado na etapa 4 pro IG; vale idêntico pro Short — só amarrar, não refazer.

### /voz --canal (`.claude/skills/voz/SKILL.md`)

- 🟡 **`SKILL.md:93-97` + `:116-135` — o modo --canal reusa o template de saída de COPY escrita.** As seções da Fase 3 (emoji, hashtags, caixa-alta, "mecânica de escrita") são de texto; não existe **nenhuma seção de narração**: WPM alvo, mapa de pausas, curva de energia, como abre/fecha ideia falada, muletas a preservar de propósito. Pesquisa: 140-160 WPM é a faixa de credibilidade+compreensão (acima de 160, ~-10% de compreensão a cada +10 WPM); pacing variável e pausa são O separador amador→pro. O "atenção extra na escuta" é 1 parágrafo sem estrutura de saída — o `voz-canal.md` nasce com esqueleto errado. *Melhoria: bloco de seções específico do --canal (ritmo/WPM medido da transcrição, pausas, energia, vícios-assinatura).*
- 🟢 **`SKILL.md:161-169` — a Fase 4 valida voz de narração com 2 frases ESCRITAS.** Pra voz falada, o teste certo é um trecho de ~30s que o dono LÊ EM VOZ ALTA (valida ritmo e naturalidade, não vocabulário). *Melhoria: no --canal, trocar o teste por parágrafo-de-leitura.*

---

## 3. Top 6 melhorias do eixo (impacto ÷ esforço)

| # | O que mudar | Arquivo | Por quê | Fonte |
|---|---|---|---|---|
| 1 | **Consertar o corte de short**: teto 60s default (config. até 180s), corte no fim da frase via `palavras.json`, aviso no dry-run quando truncar — e UMA régua de duração citada nos 3 lugares | `scripts/lib-shorts.mjs:22-24` · `shorts/SKILL.md:44` · `roteiro-yt/SKILL.md:195,207` | Bug silencioso amputa o payoff de corte válido pela régua do próprio roteiro; 50-60s chega a 76% watch-through e o teto real é 3min | opus.pro · shortimize.com |
| 2 | **Recência real + score de outlier no radar de temas**: `upload_date` do yt-dlp no lugar do `dias: 7` cravado; `views ÷ mediana do canal` no lugar de views cru | `scripts/coletar-temas-yt.mjs:71,81` · `scripts/lib-tema-yt.mjs:41-48` | O ranking que decide o próximo vídeo roda com o termo de recência constante (fictício) e um termo de views que mede tamanho de canal, não demanda de tema | 1of10.com · colinandsamir.com (Paddy Galloway) |
| 3 | **Test & Compare de PACOTE (título+thumb)**: o /thumbnail sobe 2-3 pacotes (não só capas); o /roteiro-yt aponta os 3 títulos pra lá; apagar o CTR fixo de 4% | `thumbnail/SKILL.md:80-95` · `roteiro-yt/SKILL.md:323-324` | Desde dez/2025 o teste nativo cobre título e combinações — a "unidade capa+título" que a casa prega virou testável de graça | tubefilter.com · searchenginejournal.com |
| 4 | **Ponte Shorts→long-form**: passo "related video" (manual no Studio, sem API) no fecho do /shorts e checklist do /publicar + nota do desacoplamento dos modelos | `shorts/SKILL.md:38-40` · `publicar/SKILL.md:111` | Os modelos foram desacoplados em 2026 — short viral não puxa mais o longo sozinho; o link manual é a única ponte confiável e é o mecanismo do padrão Sabrina que o eixo diz copiar | tubebuddy.com · socialbee.com |
| 5 | **Seção de narração no /voz --canal**: WPM medido da transcrição (alvo 140-160), mapa de pausas, curva de energia, vícios-assinatura + teste de validação lido em voz alta | `voz/SKILL.md:93-97,116-135,161-169` | O voz-canal.md hoje nasce com esqueleto de copy escrita (emoji, hashtags); pacing e pausa são o que separa narração amadora de retenção alta — e nada disso tem lugar pra morar | voicecrafters.com · undetectable.ai |
| 6 | **Des-hardcodear o nicho** (multi-tenant): tema-yt e coletar-temas leem nicho/termos de `canal-youtube/pilares.md`; "IA/Claude Code" vira exemplo marcado | `tema-yt/SKILL.md:12-13` · `scripts/coletar-temas-yt.mjs:78` | O eixo é vendido como produto pra PME e está escrito pro canal da ImpulsoX — num clone de cliente, a skill orienta o nicho errado; é condição de sair do "em teste" como oferta | regra da própria casa (CLAUDE.md, template→clones) |

**Menores (custo ~zero):** VVSA na régua de Shorts do `lib-desempenho.mjs`; aposentar o `#Shorts` do `/publicar:111` (detecção é por formato — miraflow.ai); linha de disclosure de IA fotorrealista (mai/2026) no `/thumbnail` + `/publicar` (outlierkit.com); nota no `/roteiro-yt` sobre satisfação/session contribution e clusters de micro-nicho de fev/2026 (consistência de formato virou fator de distribuição — vidiq.com); renomear o "re-hook de 40-60%" do Passo 4 como doutrina explícita de re-engagement anchor (learn.tubeai.app).

**O que NÃO mexer:** a espinha do `/roteiro-yt` (skeleton+foreshadowing, corpo-antes-do-hook, funil topo/meio/fundo, contrato Quality-CTR) está à frente do mercado — os frameworks públicos de 2025-26 confirmam cada peça; os Four C's e a régua "watch-time share elege, nota só barra" do `/thumbnail` estão corretos e atuais; o leque de 5 ângulos por contraste do `/tema-yt` é melhor que o que os SaaS de ideação vendem; e o mapa sintoma→skill do redirect `/desempenho-yt` está certo.

**Condição de sair do "⚠️ em teste":** (a) rodar 3-5 vídeos reais ponta a ponta no canal próprio (o `canal-youtube/` do template está em degrau 0 — o /roteiro-yt para na pré-checagem); (b) corrigir os 2 🔴 (corte de short + recência fictícia).

*Nota: `docs/funil-conteudo-video.md` não existe no repo (a base do funil vive embutida no `/roteiro-yt`, Passo 0).*
