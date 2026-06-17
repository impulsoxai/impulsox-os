---
name: shorts
description: >
  Use pra transformar um vídeo longo do canal em vários shorts verticais — "/shorts",
  "corta esse vídeo em shorts", "gera os cortes verticais", "repurpose esse longo". Pega o
  final.mp4 (16:9) e gera shorts 9:16 (≤30s) com legenda karaokê, por marcador [CORTE-SHORT]
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

## Fluxo

1. **Achar os trechos:**
   - Roteiro do slug tem `[CORTE-SHORT]`? → rodar `node scripts/gerar-shorts.mjs --slug
     <slug>` (dry-run) — lista os cortes.
   - Sem marcador? → **ler `palavras.json`**, identificar os trechos fortes (hook/punch/
     número, fórmula em `canal-youtube/formulas-video.md`), propor ao dono pra aprovar, e
     montar o `--cortes "ini-fim,..."`.
2. **Escolher o reenquadre** conforme o conteúdo: `--reenquadre crop` (talking-head/tela
   centralizada, default) ou `split` (screen-recording, vídeo no topo + legenda embaixo).
3. **Dry-run primeiro** — mostrar quantos shorts, tempos e duração. Com OK, `--confirmar`.
4. **Apontar os shorts** em `canal-youtube/edicao/<slug>/shorts/` e sugerir `/publicar`
   (que já detecta short e sobe privado).

## Regras

- Cada short ≤30s (curto força clareza — padrão dos canais que retêm).
- Legenda reusa a transcrição do longo (não transcreve de novo).
- Modo análise (sem marcador): a IA propõe, o dono aprova — nunca corta sem aval.
- Short é o próprio frame com legenda — sem capa composta (isso é vídeo longo).
- Falha de um short não derruba os outros.
