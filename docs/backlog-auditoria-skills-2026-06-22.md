# Backlog — Auditoria das skills de vídeo/conteúdo (2026-06-22)

> Auditoria de 5 skills (1 auditor por skill, cada um com pesquisa de estado-da-arte na
> internet). Fontes reais: OpusClip (13.5M clips), Paddy Galloway, MrBeast retention, Screen
> Studio, dados Instagram/YouTube 2026. NADA implementado — backlog pra implementar a partir
> de 2026-06-23. Cada item vira spec→plano→execução pelo ciclo normal.

## Convergência (o que TODOS os auditores apontaram)

O ImpulsoX-OS **produz com acabamento premium, mas não desenha pro sinal que distribui
(save/send) nem fecha o loop de medição.** Dois movimentos macro elevam tudo:
1. **Desenhar pro SAVE/SEND** — mudar o briefing de toda peça pra mirar o sinal nº1 de alcance
   de 2026 (send vale 3-5x like). Baixo esforço, maior alavanca. Apareceu em /post E /reel-marca.
2. **Fechar o loop com `/desempenho`** — ler retenção/save/send do publicado e realimentar a
   próxima peça. Transforma "peça bonita" em "sistema que melhora sozinho" (cerne do OS).

---

## QUICK-WINS (alto valor / baixo esforço) — fazer primeiro

| # | Skill | Melhoria | Por quê | Fonte |
|---|-------|----------|---------|-------|
| 1 | gravar-tela | **Capturar movimento contínuo do cursor** (`mousemove` no uiohook, não só `click`) | ÚNICA que obriga mudar a GRAVAÇÃO — sem capturar agora, a edição não recupera depois. Destrava cursor HD/smoothing no /editar-video = efeito que mais separa "ffmpeg cru" de Screen Studio. Só adicionar listener + throttle ~60Hz | Screen Studio |
| 2 | editar-video | **Remover filler words** ("é", "tipo", "né", "então...") | Whisper word-level JÁ roda no pipeline; só filtrar lista PT-BR e fundir spans no corte de silêncio existente. Maior gap vs Descript/OpusClip; "som amador→profissional" | OpusClip #18-19, Descript |
| 3 | post + reel-marca | **Objetivo SAVE/SEND na peça** — declarar se a peça é desenhada pra ser SALVA (slide/frame-referência guardável) ou ENVIADA (gancho "manda pra quem precisa") | Send pesa 3-5x like, save 2-3x; fator nº1 de alcance NOVO em 2026 (Mosseri). Apareceu em 2 auditorias. É briefing+copy, sem motor novo | Later, Buffer, OpusClip |
| 4 | post | **Punchline/dado-chave no ÚLTIMO slide** (não tratar o fecho só como CTA) | O dado mais valioso exclusivo no último slide puxa completion >60% → Explore | TryMyPost, TrueFuture |
| 5 | roteiro-yt | **15-20 títulos → seleciona 3** (hoje gera só 3) | Método nº1 do Galloway (estrategista de 50bi views); CTR é 50% do jogo; custo ~zero | Colin&Samir × Paddy Galloway |
| 6 | reel-marca | **CTA de negócio local** (Book/Call/WhatsApp + geotag/fachada como cena padrão) | Cliente é PME local; é onde o reel vira venda. Listing com booking converte 6.8% vs 4.1% | agentr.ee, SearchEngineLand |
| 7 | roteiro-yt | **Intro = 1º frame continua o thumbnail** (continuação visual literal da capa) | Fecha o gap clique→hook; benchmark MrBeast 70% retenção | How MrBeast Solved YouTube |
| 8 | post | **Atualizar 5-9 → 7-10 slides** + meta completion >60% | Range defasado; sweet-spot Q1 2026 = 7-10, com 10 maximizando dwell se completion >60% | TryMyPost, TrueFuture |
| 9 | roteiro-yt | **Benchmarks numéricos na régua** (71%/3s, sweet-spot 31-60s, AVD alvo) | Torna "retém bem" mensurável | Virvid |

---

## MÉDIO ESFORÇO / alto valor

| Skill | Melhoria | Por quê | Fonte |
|-------|----------|---------|-------|
| editar-video | **`--vertical` auto-reframe 9:16** (crop centralizado + bolha webcam = rosto) | Destrava o SHORT, formato que a skill diz priorizar mas força 16:9. ffmpeg crop/pad puro | OpusClip AI Reframe #46 |
| editar-video | **Punch-in automático em fala longa** (zoom suave a cada ~8-12s quando não há clique) | Reaproveita filtroZoompan; reseta atenção em talking-head estático | OpusClip #20 |
| editar-video | **Corte de hook / intro morta** (avisar no dry-run "primeiros Ns sem fala = cortar?") | Intro branded = "watch-time poison" | OpusClip #1-7 |
| reel-marca | **Multi-formato** (9:16+1:1+4:5) + **cutdowns 15/5s** do mesmo .tsx — ⏸️ ADIADO (2026-06-22): exige layout responsivo (cenas em px fixos pro 9:16) + peça dedicada; vira lote próprio | Entregável-padrão de agência paga; multiplica valor percebido do mesmo render | Superside, Jungle Films |
| reel-marca | **Gerar capa/cover** (still) junto do .mp4 (remotion still já existe) + variante pro GBP | Cover é entregável pago; vídeo no Google Business Profile = human proof que converte | Jungle Films, agentr.ee |
| roteiro-yt | **Cardápio de 6 moldes short-form** (HVC/AIDA/PAS/PSP/PASTOR/BAB) escolhidos por job | Dá ao roteirista escolha guiada por objetivo, com dados | Virvid |
| roteiro-yt | **Passo "skeleton + foreshadowing plantado"** antes do corpo | Galloway monta one-pager skeleton e planta foreshadowing nos 2 primeiros min; separa top de genérico | Colin&Samir × Galloway |
| roteiro-yt | **Bloco repurpose multiplataforma** (caption longa TikTok/SEO, curta Reels, keyword Shorts, sem watermark) | "Create once, optimize 3x"; multiplica alcance do mesmo roteiro | Hootsuite, Virvid |
| post | **Swipe-retention** (cada slide interno abre micro-loop pro próximo) | "The algorithm demands swipes"; hoje o loop só está capa→fecho | Marketing Agent |
| post | **Régua técnica do reel** (3s hook, legenda 42-60pt animada que muda cor, 2-3 cortes nos 3s, muted-first) | 50% saem nos 3 primeiros segundos | TrueFan, Inro |
| post | **Tabela formato↔objetivo** (reel=alcance/novos seguidores 1.36x; carrossel=save/engajamento) | Roteia escolha por meta, não por gosto | Buffer |
| gravar-tela | **Cursor HD redesenhado** (esconde nativo queimado, desenha cursor suave por cima na edição) | Paridade real com Screen Studio (depende do #1 — exige a trilha de movimento) | Screen Studio |
| gravar-tela | **Áudio do sistema** (Fase 2.1 já mapeada) + fps/codec do gdigrab fixados e documentados | Trava tutorial com som do PC; movimento fluido depende de fps (hoje default cego) | Screen Studio, Recordly |

---

## TRANSVERSAL (vale pra todas) — o maior salto

**Fechar o loop com `/desempenho`:** ler a curva de retenção + save + send do que foi publicado
e realimentar a próxima peça. Diagnóstico automático: dip 0-2s = promessa fraca; cliff no meio =
dead air; spike no fim = loop funcionou. Hoje cada skill produz mas não aprende com o resultado
real. É o que materializa "decidir→produzir→medir→corrigir" do CLAUDE.md.

---

## Ordem sugerida de implementação (2026-06-23+)

1. **Quick-wins #1-#9** (1 dia, baixo risco, alto retorno) — começar por gravar-tela #1 (é a
   única que obriga mudar a captura; quanto antes, mais gravações já saem com a trilha de cursor).
2. **save/send transversal** (#3) — mudar briefing de /post e /reel-marca.
3. **Médio esforço** conforme prioridade comercial.
4. **Loop com /desempenho** — a frente macro, maior, faz por último (depende de ter dados reais
   publicados pra medir).

Método: cada item (ou grupo) entra pelo ciclo brainstorm→spec→plano→execução normal. Quick-wins
pequenos podem ir em lote num spec só por skill.
