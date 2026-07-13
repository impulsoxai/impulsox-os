---
name: shorts
description: >
  Use pra transformar um vídeo longo do canal em vários shorts verticais — "/shorts",
  "corta esse vídeo em shorts", "gera os cortes verticais", "repurpose esse longo". Pega o
  final.mp4 (16:9) e gera shorts 9:16 (20-60s) com legenda karaokê, por marcador [CORTE-SHORT]
  do roteiro ou por trechos que eu proponho da transcrição e você aprova.
---

# /shorts — Vídeo longo → vários shorts

Repurpose no padrão da Sabrina (1 longo/semana → shorts diários). Pega o vídeo longo já
editado e corta os melhores trechos em shorts verticais legendados. Copiar a fórmula de
quem já faz sucesso (CLAUDE.md): cada corte segue o molde de short que retém.

Autoria: ImpulsoX AI. Conteúdo original.

## Pré-checagem

1. **Existe `canal-youtube/edicao/<slug>/final.mp4`?** Senão, rodar `/editar-video` antes.
2. **Existe `palavras.json` no mesmo lugar?** É a transcrição pra legenda dos shorts. Sem
   ele, os shorts saem sem legenda — avisar e sugerir re-rodar `/editar-video`.
3. `nucleo/aprendizados.md` (bloco vídeo, se existir) — o que o /desempenho já provou que
   retém neste canal orienta a escolha dos trechos antes do padrão genérico.
4. `docs/craft-video.md` — a lei do short (payoff no segundo 0-1, loop, muted-first, 20-60s
   conforme o job) é a régua de cada corte.

## Fluxo

1. **Achar os trechos:**
   - Roteiro do slug tem `[CORTE-SHORT]`? → rodar `node scripts/gerar-shorts.mjs --slug
     <slug>` (dry-run) — lista os cortes.
   - Sem marcador? → **ler `palavras.json`**, identificar os trechos fortes (hook/punch/
     número, fórmula em `canal-youtube/formulas-video.md`), propor ao dono pra aprovar, e
     montar o `--cortes "ini-fim,..."`.
2. **Escolher o trecho certo (pesquisa 2026):** o short decide nos **primeiros 1-3s**.
   Priorizar cortes cujo começo já tem MOVIMENTO/punch (não fala morna de transição) —
   começar na frase de impacto, não na preparação. Cada short = uma lacuna só, 20-60s.
3. **Escolher o reenquadre** conforme o conteúdo: `--reenquadre crop` (talking-head/tela
   centralizada, default) ou `split` (screen-recording, vídeo no topo + legenda embaixo).
4. **Dry-run primeiro** — mostrar quantos shorts, tempos e duração. Com OK, `--confirmar`.
5. **Apontar os shorts** em `canal-youtube/edicao/<slug>/shorts/` e sugerir `/publicar`
   (que já detecta short e sobe privado). Na publicação, 3-5 hashtags de NICHO — o YouTube
   detecta short por formato; `#Shorts` é cargo cult em 2026 e não entra.
6. **A PONTE que justifica a estratégia — "related video" (manual, sem API):** em 2026 os
   modelos de Shorts e long-form foram DESACOPLADOS (tubebuddy/socialbee) — short viral
   NÃO puxa mais o vídeo longo sozinho; o link manual virou a única ponte confiável (e é
   o mecanismo do padrão Sabrina que esta skill copia). Instruir o dono, por short
   publicado: **Studio → Shorts → editar → "Vídeo relacionado" → apontar o long-form de
   origem** (2 cliques, sem API). Short sem related video é tráfego jogado fora — este
   passo entra no checklist de publicação, não é opcional.

## Regras

- Régua de duração (a MESMA do `/roteiro-yt`): **20-60s conforme o job** — curto força
  clareza; 50-60s aguenta payoff maior (até ~76% de watch-through; opus.pro/shortimize,
  2026). Teto do script: 60s default, configurável via `--teto` até 180s (limite da
  plataforma). Trecho maior que o teto → o script recua o corte pro fim da frase mais
  próxima (via `palavras.json`) e AVISA no dry-run — nunca trunca em silêncio.
- O corte tem que **prender nos primeiros 1-3s** — começar no punch, não na preparação.
- Legenda reusa a transcrição do longo (não transcreve de novo).
- Modo análise (sem marcador): a IA propõe, o dono aprova — nunca corta sem aval.
- Short é o próprio frame com legenda — sem capa composta (isso é vídeo longo).
- Falha de um short não derruba os outros.
- Cadência que escala (pesquisa + Sabrina/Jonathan): 3-5 shorts/semana. Cortar vários de um
  longo de uma vez alimenta essa cadência.

---

**✓ Pronto:** N shorts verticais (9:16, 20-60s) com legenda karaokê, cortados do longo · **→ próximo passo:** `/publicar` — leva os shorts pro YouTube (detecta short por formato e sobe privado). Esteira de YouTube é opcional (em teste/beta) — só seguir quando o dono pedir, não é passo automático do fluxo principal. Se faltar `palavras.json`, os shorts saem sem legenda e o sistema reorienta.
