---
name: slides
description: >
  Use pra criar um deck de apresentação premium (slides em tela cheia, na marca do negócio) pra
  rodar no PC enquanto grava vídeo — "/slides", "faz uns slides", "apresentação pro vídeo", "deck
  pra gravação", "slides com a minha marca". Gera um HTML navegável (setas, tela cheia, presenter
  view) com produto real em mockup, slides-ponte pra demo ao vivo no Claude Code e notas do
  apresentador. Aceita tema em 1 frase, roteiro colado, ou roteiro de /roteiro-yt·/tema-yt
  (Escada de Contexto). Distinta do /reel-marca (vídeo que toca sozinho) — aqui o dono NAVEGA
  ao vivo. Tem modo institucional (pitch ImpulsoX pronto) e modo tema (deck do vídeo da vez).
---

# /slides — Deck de apresentação premium pra gravação

Gera um deck de slides em tela cheia, na identidade visual do negócio, pra rodar no navegador
durante a gravação de um vídeo. O dono passa os slides no clique e alterna pro Claude Code pra
mostrar o produto real sendo feito. Premium nível-agência: a marca é cravada, nunca tem cara de
template (CLAUDE.md proíbe estética default).

Autoria: ImpulsoX AI.

## O que NÃO é
- Não é vídeo que toca sozinho — isso é o `/reel-marca`. Aqui o dono navega ao vivo.
- Não é overlay de OBS — é deck de tela cheia que o dono passa no clique.

## Pré-requisitos (Escada de Contexto)
- **Marca** (`marca/tokens.css`, `marca/design-guide.md`) — pro deck sair na identidade do cliente.
  Sem ela: defaults premium escuros marcados "confirmar com a marca" (não trava); ofereça
  `/identidade` antes.
- **Núcleo** (`nucleo/negocio.md`, `nucleo/voz.md`, `nucleo/ofertas.md`, `nucleo/provas.md`) —
  pro conteúdo sair na voz do dono e só vender oferta ATIVA.
- **Produto real** (opcional, melhora muito): peças em `producao/` (carrosséis, páginas) pra
  mostrar em mockup. Sem nada: slides de texto.
- **Node + Playwright** pra a verificação visual (já no projeto).

## Fluxo (guiado — 2 gates de aprovação)

1. **Lê o contexto** (silêncio): núcleo + `marca/tokens.css` + `marca/design-guide.md`.

2. **Detecta a entrada** (Escada de Contexto, os 3 níveis):
   - tema em 1 frase → puxa o núcleo e escreve o roteiro dos slides na voz do dono;
   - roteiro colado → vira slides direto;
   - vindo de `/roteiro-yt`·`/tema-yt` → transforma o roteiro em slides;
   - nada informado → **modo institucional** (pitch da ImpulsoX: o que ela faz com Claude Code,
     ofertas ATIVAS, produto real). Salvo/versionado como deck-base.

3. **Escolhe o produto real:** varre `producao/` (carrosséis em `posts/*/slide-*.png`, páginas),
   casa com o tema, marca quais entram em mockup. Sem produto → slide de texto.

4. **GATE 1 — storyboard.** Mostra o esqueleto numa tabela: para cada slide, o tipo (capa/
   conteúdo/produto-real/ponte-demo/assinatura), o headline, onde entra cada ponte-demo e qual
   produto real aparece. Espera o "sim". (Regra do `/reel-marca`: alinhar a estrutura antes de produzir.)

5. **Escreve a copy** — headlines answer-first, 1 ideia por slide, na voz do dono → passa pelo
   `/escritor-br` (humaniza). **Só oferta ATIVA** (CLAUDE.md — peça pública não vende oferta
   futura/roadmap, nem "em breve"). Escreve as notas do apresentador (`data-notes`) aqui:
   nas pontes-demo, o passo a passo do que fazer no Claude Code.

6. **GATE 2 — copy completa.** Mostra TODO o texto de tela + as notas, slide a slide, numa
   tabela. Espera o "sim". **Nunca construir com texto não aprovado.** (Regra do dono no
   `/reel-marca`: "antes de fazer, me passa sempre o que vai escrever".)

7. **Constrói o deck:**
   - copia `references/engine.html` pra `producao/slides/<tema>/deck.html`;
   - lê `marca/tokens.css` e substitui o bloco `/* TOKENS_DA_MARCA */` pelas cores/fontes reais
     (`--bg --fg --muted --accent --accent-2 --font-display --font-body`). Sem `marca/tokens.css`,
     mantém os defaults premium e marca "a confirmar";
   - adiciona o CSS dos mockups (de `references/blocos.md`) ao `<style>`;
   - monta os slides a partir de `references/blocos.md`, com a copy aprovada, no `<!-- SLIDES -->`;
   - copia os assets reais de `producao/` pra `producao/slides/<tema>/assets/`;
   - gera `producao/slides/<tema>/notas.md` (as `data-notes` de cada slide, em ordem) pro segundo monitor.

8. **Verifica:** `node .claude/skills/slides/references/verificar.mjs producao/slides/<tema>/deck.html
   producao/slides/<tema>/_shots`. Lê os screenshots; se algum slide vier quebrado/preto ou fora
   da marca, corrige. (Deletar `_shots/` depois, ou deixar pro dono ver.)

9. **Abre no navegador** pra conferência ao vivo: `start producao/slides/<tema>/deck.html`
   (Windows). Lembra os controles: `→`/`←` passa, `F` tela cheia, `S` notas, `B` preto.

**Modo institucional** = deck-base único, atualizado a cada rodada. **Modo tema** = pasta nova por vídeo.

## Encaixe no sistema
Opcional (o guia não empurra), eixo vídeo. Pré-requisito mínimo: `marca/` — sem ela, reorienta
pro `/identidade`. Entra avulsa ou depois de `/roteiro-yt`·/tema-yt. Sai pro `/gravar-tela`.

Reusa: mockups phone/browser (mesmo padrão do `/reel-marca`), `/escritor-br` (humaniza),
`/provas` (prova real), regra "1 herói / answer-first" da `/pagina` e do reel.

## Saída
`producao/slides/<tema>/deck.html` (auto-contido, abre offline) + `assets/` + `notas.md`. A
produção fica no clone; o motor (engine, blocos, verificar) desce do template via `/atualizar-motor`.

---

**✓ Pronto:** deck premium na marca, navegável em tela cheia, com produto real e notas do
apresentador · **→ próximo passo:** `/gravar-tela` — grava a tela passando o deck e alternando
pro Claude Code. Pré-requisito: `marca/`; se faltar, o sistema reorienta pro `/identidade`.