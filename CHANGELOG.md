# Changelog

Todas as mudanças relevantes do motor ImpulsoX-OS ficam registradas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/); o
versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

O `/atualizar-motor` usa este arquivo e a versão do rodapé do `CLAUDE.md` para
saber o que cada clone está rodando e o que ainda falta puxar do template.

## [0.2.5] — 2026-06-23

### Adicionado
- Skill `/agente-ia` — SDR conversacional na landing: gera o widget de chat na marca
  (injetável) + a persona (do núcleo, só oferta ATIVA + prova autorizada) + o contrato de
  `POST /api/chat`. Runtime vive no CRM (item novo no `docs/prd-integracao-crm.md`); o widget
  fica em estado desabilitado honesto até o endpoint existir. (Oportunidade O8 — 3ª OS-puro;
  o "liga" depende do CRM.)
- Skill `/intake` — onboarding operacional do cliente novo (acessos por convite seguro —
  nunca senha; KPI do contrato; calendário de aprovação; escopo) → formulário pro cliente +
  `nucleo/intake.md`. Roda após `/cliente`, antes de `/identidade`. (Oportunidade O4.)
- Skill `/concorrente` — vigia competitiva: dossiê vivo do concorrente em
  `nucleo/concorrentes.md` (posicionamento, preço, ofertas, cadência, anúncios ativos via
  Meta Ad Library, lacuna), só de fonte pública. Modos mapear/alerta/comparativo.
  `/radar`, `/ads-meta`, `/oferta` e `/proposta` consomem o dossiê. (Oportunidade O6 — 1ª
  das 3 OS-puro da auditoria; as do eixo-lead esperam o CRM ganhar a ponte — ver
  `docs/prd-integracao-crm.md`.)
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
