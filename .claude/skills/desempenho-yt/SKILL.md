---
name: desempenho-yt
description: >
  Use pra medir os vídeos do YouTube e validar qual fórmula funciona — "/desempenho-yt",
  "como foi o vídeo?", "qual fórmula performou?", "mede a retenção", "fecha o ciclo do
  canal". Puxa métricas reais (Analytics API ou coladas do Studio), compara a retenção ao
  benchmark do formato e marca a fórmula como validada / não funciona no formulas-video.md.
---

# /desempenho-yt — Medir o vídeo, validar a fórmula

Conteúdo sem medição é circuito aberto. Esta skill pega o que `/publicar` levou ao ar no
YouTube, busca os números reais, e prova qual fórmula funciona — pela RETENÇÃO, o sinal #1
do algoritmo (pesquisa 2026: +10pts de retenção ≈ +25% de impressões). Views são vaidade.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo

- **Automático:** `.env` com `YT_CLIENT_ID/SECRET/REFRESH_TOKEN` (Fase 3) e o refresh_token
  com o escopo `yt-analytics.readonly` → puxa sozinho.
- **Manual:** o dono cola retenção/views/inscritos do YouTube Studio → o sistema interpreta.
  Nunca travar por falta de credencial.

## Fluxo

1. **Sugerir o que medir.** Ler `producao/publicacoes.md`; pelos dias desde a publicação,
   apontar quais vídeos já dá pra medir (≥7-14 dias — antes disso a retenção é instável).
2. **Puxar as métricas.** Rodar `node scripts/metricas-youtube.mjs --slug <nome> [--short
   --duracao <seg>]` (auto) ou com `--manual "<texto colado do Studio>"`.
3. **Ler o veredito** (validada / a testar / não funciona) — vem da retenção vs benchmark
   da faixa (short ~70%, long 5-10min ~55% etc).
4. **Cruzar com a fórmula.** Identificar a fórmula que o vídeo usou (no roteiro/pacote) em
   `canal-youtube/formulas-video.md` e aplicar o veredito. **Mostrar ao dono antes de gravar.**
5. **Gravar o aprendizado.** Atualizar o status da fórmula no `formulas-video.md` e destilar
   o padrão duradouro em `nucleo/aprendizados.md`. Subir o degrau da Escada (degrau 4, vídeo).

## Regras

- Retenção é o sinal principal; views/inscritos são contexto/desempate.
- Benchmark é relativo ao nicho/canal — com histórico, comparar à média do próprio canal.
- Vídeo com <7 dias: avisar que a retenção ainda muda; medir mesmo assim só como prévia.
- Nunca gravar veredito sem o dono confirmar.
- Fórmula validada aqui passa a ter prioridade no `/roteiro-yt` (aprendizado > padrão genérico).
