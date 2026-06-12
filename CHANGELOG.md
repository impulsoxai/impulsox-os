# Changelog

Todas as mudanças relevantes do motor ImpulsoX-OS ficam registradas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/); o
versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

O `/atualizar-motor` usa este arquivo e a versão do rodapé do `CLAUDE.md` para
saber o que cada clone está rodando e o que ainda falta puxar do template.

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
