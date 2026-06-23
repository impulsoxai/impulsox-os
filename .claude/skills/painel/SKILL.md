---
name: painel
description: >
  Use pra abrir o painel do ImpulsoX-OS — "/painel", "abre o dashboard", "mostra o
  sistema rodando", "ver o painel", "passo a passo ao vivo". Sobe o servidor local
  (só-leitura) e abre o navegador no painel: feed ao vivo (passo a passo), ciclo,
  produção, contexto, custos e saúde do negócio. É o mesmo painel que o cliente abre
  com o painel.cmd.
---

# /painel — Abrir o painel ao vivo do ImpulsoX-OS

Sobe o servidor de `dashboard/servidor.mjs` e abre o navegador no painel. **Só-leitura:**
lê núcleo, produção, publicações, custos e o feed de atividade; não escreve nada.

Autoria: ImpulsoX AI. Conteúdo original.

## Fluxo

1. Conferir Node presente (`node --version`). Ausente → avisar e parar.
2. Subir o servidor (em background): `node dashboard/servidor.mjs` na raiz do clone.
   Porta default 5173 (`DASHBOARD_PORT` pra trocar). Porta ocupada → avisar e sugerir
   outra porta.
3. Abrir `http://127.0.0.1:5173` no navegador (`start ""` no Windows).
4. Avisar o usuário que o painel está no ar e que fechar o processo encerra o servidor.

## O que o painel mostra

- **Ao vivo** — o passo a passo do sistema em tempo real (marcos de `dados/atividade.jsonl`,
  alimentado pelo hook `.claude/hooks/atividade-passo.mjs` e pelos scripts).
- **O ciclo** — Decide → Produz → Publica → Mede, com os números reais.
- **Produção & publicado**, **Contexto** (degrau, foco, ofertas), **Custos de IA**
  (gasto por modelo) e **Saúde do núcleo** (arquivos preenchidos + pendências).
- **Saúde do banco de provas** — quantas objeções estão cobertas (preço / demora /
  funciona-pra-mim / confio?), idade da última captura e se as peças estão reciclando a mesma
  prova. Banco fraco aparece como alerta — é o que impede vender sem munição (lido de
  `nucleo/provas.md`, ver `/provas`).

## Regras

- Só-leitura. A skill nunca usa o painel pra escrever em núcleo/produção.
- Localhost sempre. Nunca expor em `0.0.0.0`.
- Cliente final usa o `painel.cmd` (dois cliques); esta skill é o atalho de quem está no
  Claude Code.

---

**✓ Pronto:** dashboard ao vivo com o ciclo, produção, contexto, custos e saúde do núcleo · **→ próximo passo:** sem próximo obrigatório — o painel é só-leitura; use o que ele mostrar pra decidir onde agir.
