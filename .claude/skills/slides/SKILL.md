---
name: slides
description: >
  Use pra criar um deck de apresentação premium (slides em tela cheia, na marca do negócio) pra
  rodar no PC — gravando um vídeo (YouTube) OU apresentando pra um cliente em potencial —
  "/slides", "faz uns slides", "apresentação pro vídeo", "deck pra gravação", "apresentação pro
  cliente", "pitch pra reunião", "slides com a minha marca". Gera um HTML navegável (setas, tela cheia, presenter
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

5. **Escreve a copy — loop ativo de pitch narrado (não checklist).** A régua completa do craft
   mora em `docs/pitch-narrado.md` (Sparkline, espinha de Raskin, Equação de Valor, demo
   Tell-Show-Tell). **Ler antes de escrever.** O passo não é preencher slides: é rodar o loop
   que o `/escritor-br` usa, adaptado pra pitch:
   - **a. Mapa do arco** — antes de qualquer slide, desenhar a oscilação do Sparkline (onde abro
     no vale/dor, onde subo pro pico/futuro, quantas vezes oscilo) e a espinha de Raskin (mudança
     inegável, inimigo/jeito velho, terra prometida, produto como caminho, prova). É o esqueleto
     emocional, não a tabela de slides.
   - **b. Rascunho** — escrever o pitch inteiro lido em sequência, do primeiro ao último slide de
     seguida, em voz alta na cabeça, em ~90s. NUNCA slide isolado (cada slide pensado só pra si
     gera repetição de ideia e perda de fio).
   - **c. Auto-crítica explícita** (bullets, obrigatório, não pular) — responder:
     - qual slide DESCREVE produto em vez de vender o ganho do ouvinte?
     - onde o arco fica linear (sobe e não oscila)?
     - a prova é real, tirada de `nucleo/provas.md` com fonte, ou inventada?
     - o slide de oferta mexe nos 4 fatores da Equação de Valor (sonho, probabilidade, tempo,
       esforço), ou só lista serviço?
     - algum slide vende oferta INATIVA (roadmap/futura/"em breve")? (regra dura do CLAUDE.md)
     - a aversão à perda está calma (constatação), ou virou grito?
   - **d. Reescrita** — resolver cada bullet da auto-crítica. Voltar ao mapa se o arco quebrou.

   O fecho é sempre UM CTA de baixo atrito (o verbo do negócio: "Chama no WhatsApp", "Agende"),
   nunca só logo + URL. Escreve as notas do apresentador (`data-notes`) aqui: nas pontes-demo, o
   passo a passo do que fazer ao vivo (o ouvinte vê o ganho, não a ferramenta, ver Pilar 4 do doc).

6. **Humaniza — OBRIGATÓRIO antes de mostrar (passo que não se pula).** TODA a copy passa pelo
   `/escritor-br` antes do GATE 2. Slide tem texto curto, então o tique de IA salta à vista: o
   dono não pode ver texto com cara de robô. Régua mínima (o `/escritor-br` aplica, mas confira):
   - **Proibido o travessão `—` de IA** ("X — Y") como conector de ênfase. É a marca registrada
     de texto gerado. Trocar por ponto, vírgula, dois-pontos ou reescrever a frase.
   - **Acentuação correta, sempre.** Português sem acento ("voce", "negocio", "conteudo") tem
     cara de amador e de texto mal-codificado. O `deck.html` é UTF-8 (`<meta charset="utf-8">`),
     acento renderiza certo. Escrever "você", "negócio", "conteúdo", "é", "mês". Nunca remover
     acento por receio de encoding: é bug, não cautela.
   - **Sem repetir frase nem ideia de efeito entre slides.** Lido em sequência, repetir "na sua
     voz", "do seu jeito", "sem cara de IA" em dois ou três slides empobrece e salta no vídeo.
     Cada slide é dono da sua frase forte; se a ideia precisa reaparecer, reescrever com outra
     construção. Varrer o conjunto inteiro antes do GATE 2.
   - **Regência e gramática conferidas** ("reel DA marca", não "de marca"). Um erro de português
     queima a marca numa peça pública.
   - Sem clichê de IA ("solução", "potencialize", "transforme", "no mundo de hoje", "imagine").
   - Voz do `nucleo/voz.md`: ambição grande, entrega calma. Zero grito, zero FOMO, zero
     caixa-alta pra ênfase, zero exclamação em rajada. Fala como gente, usa "você".
   - Frase que um humano falaria em voz alta. Se soa a brochura, reescreve.

7. **GATE 2 — copy completa (já humanizada).** Mostra TODO o texto de tela + as notas, slide a
   slide, numa tabela. Espera o "sim". **Nunca construir com texto não aprovado nem não
   humanizado.** (Regra do dono no `/reel-marca`: "antes de fazer, me passa sempre o que vai
   escrever".)

8. **Auditoria independente — OBRIGATÓRIA (olhos frios de fora).** Antes de construir, despachar
   o `/revisar` (agente `revisor-marketing`, contexto limpo, não viu a criação) com a copy final
   dos slides + a voz da marca. Ele devolve veredito por slide (APROVADA/AJUSTAR/REPROVADA) e
   diagnóstico. Por que existe: a copy de deck é fácil de sair fraca (headline que descreve, ideia
   repetida, prova esquecida no banco) e o autor tem apego. Achou AJUSTAR/REPROVADA → corrigir e
   re-rodar do passo 5. SÓ segue pra construir quando a auditoria passa. (É o mesmo gate frio do
   `/post`/`/pagina` antes de ir ao ar.)

9. **Constrói o deck — VISUAL via Open Design, navegação por cima (a skill orquestra, o dono não
   sabe dos passos).** O caminho premium (provado: o dono aprovou o deck do OD, rejeitou o que a
   skill escreveu à mão) é deixar o **Open Design** desenhar o visual e a skill plugar o resto.
   Tudo por baixo dos panos — o dono só pediu `/slides`.

   **9a. Open Design desenha o deck** (ver a referência da casa em `references/open-design.md`):
   - se o daemon não responde (`list_projects` falha), subir: `pnpm exec tools-dev --daemon-port
     7456` em `C:/Users/ACER/tools/open-design` (porta 7456 fixa, senão o MCP não acha — ver
     memória `open-design-daemon`);
   - `create_project` + `start_run` com um brief que CRAVA os tokens reais de `marca/tokens.css`
     (cores, fontes), a estética premium (decks de pitch tech: Linear/Vercel/Stripe — escuro,
     tipografia grande, 1 herói por slide), e a copy aprovada (texto EXATO, "use exatamente este
     texto, não invente"). Pedir slides 16:9 num HTML único, **com placeholders de mockup**
     (phone pra carrossel/reel, browser pra página) e **sem JS de navegação** (a skill põe depois).
   - pollar `get_run` (5-30min); ao terminar, baixar o `index.html` pra `producao/slides/<tema>/`.
   - **Fallback** (OD indisponível/falha): usar `references/engine.html` + `references/blocos.md`
     do jeito antigo (copiar engine, injetar tokens, montar slides). É o plano B, não o padrão.

   **9b. A skill pluga o resto no HTML do OD:**
   - **assets reais** de `producao/`: trocar cada placeholder de mockup por `<img>` (ou `<video>`,
     ver reel abaixo). Capturar com Playwright (carrossel/página são HTML). REGRA DO MOCKUP: a
     foto enche o frame com `object-fit:cover` SÓ quando o ratio bate; **carrossel de Instagram é
     4:5 e o phone-mockup é 9:19.5 — `cover` corta o headline. Usar `object-fit:contain` + fundo
     da marca** (a imagem inteira centrada, sem corte). Capturar o slide no tamanho NATIVO
     (1080x1350) e deixar o `contain` enquadrar — não tentar esticar HTML de px fixo.
   - **REEL = VÍDEO RODANDO no mockup (não capa estática).** O dono adorou ("ficou massa!"): o
     reel toca dentro do phone, em loop, mudo. Copiar o `reel.mp4` (o MUDO, não o com-trilha) pra
     a pasta do deck e usar `<video src="reel.mp4" autoplay muted loop playsinline poster="reel-
     capa.png">`. O `poster` é a capa de fallback (frame do money shot via `ffmpeg -ss`) enquanto
     o vídeo carrega. CSS: `object-fit:cover` (reel já é 9:16, casa com o phone). O mp4 pesa
     (~7MB) então o deck deixa de ser 100% leve, mas abre offline igual. Capa estática só se não
     houver mp4.
   - **navegação** (deck de gravação de verdade): injetar antes de `</body>` o bloco de teclado +
     presenter view + blackout (modelo em `references/navegacao.html`): `→`/espaço próximo,
     `←` anterior, `Home`/`End`, `F` tela cheia, `S` presenter view (nota + próximo slide),
     `B` blackout. Funciona com o scroll-snap do OD (navega por `scrollIntoView`) ou com o engine
     próprio (display:none). As notas do apresentador entram aqui (array na ordem dos slides).
   - **transição de slide — num vídeo gravado, a transição É o motion design:** corte seco
     entre slides lê como PowerPoint. Injetar um crossfade/slide-reveal de ~300ms no easing
     da marca (`--ease-marca` do tokens.css quando existir; senão `cubic-bezier(0.16,1,0.3,1)`)
     na troca de slide — os decks de referência (Linear/Vercel/Stripe) vivem de
     micro-transição, não de efeito. Uma transição só, consistente, no deck inteiro.
   - **vídeo no mockup reinicia ao entrar no slide:** autoplay desde o load faz o dono chegar
     no slide com o loop no meio. No handler de navegação: ao ativar o slide do reel,
     `video.currentTime = 0; video.play()` — 3 linhas, o money shot sempre abre do começo.
   - **`notas.md`** pro segundo monitor (as notas de cada slide, em ordem).

10. **Verifica:** `node .claude/skills/slides/references/verificar.mjs producao/slides/<tema>/index.html
   producao/slides/<tema>/_shots` (no fallback, `deck.html`). Lê os screenshots; se algum slide
   vier quebrado/preto, fora da marca, com mockup cortado, ou com erro de tela (acento/regência
   diferente do texto-fonte), corrige. (Deletar `_shots/` depois, ou deixar pro dono ver.)

11. **Abre no navegador** pra conferência ao vivo: `start producao/slides/<tema>/index.html`
   (ou `deck.html` no fallback). Lembra os controles: `→`/`←` passa, `F` tela cheia, `S` notas,
   `B` preto.

**Modo institucional** = deck-base único, atualizado a cada rodada. **Modo tema** = pasta nova por vídeo.

## Encaixe no sistema
Opcional (o guia não empurra), eixo vídeo. Pré-requisito mínimo: `marca/` — sem ela, reorienta
pro `/identidade`. Entra avulsa ou depois de `/roteiro-yt`·/tema-yt. Sai pro `/gravar-tela`.

**Conecta sozinha (o leigo não precisa saber).** A skill orquestra por baixo: o craft de pitch
vem de `docs/pitch-narrado.md`, **Open Design** desenha o visual premium, `/escritor-br` humaniza
a copy, `/revisar` (`revisor-marketing`) audita com olhos frios, `/provas` dá a prova real,
mockups phone/browser vêm do padrão do `/reel-marca`.
O dono pede `/slides` e recebe o deck pronto — nenhuma dessas etapas vira pergunta pra ele.

## Saída
`producao/slides/<tema>/index.html` (do Open Design, com navegação plugada; `deck.html` no
fallback) + `assets/` (as peças reais) + `notas.md`. Abre offline. A produção fica no clone; o
motor (engine, blocos, verificar, open-design.md, navegacao.html) desce do template via
`/atualizar-motor`.

---

**✓ Pronto:** deck premium na marca, navegável em tela cheia, com produto real e notas do
apresentador · **→ próximo passo:** `/gravar-tela` — grava a tela passando o deck e alternando
pro Claude Code. Pré-requisito: `marca/`; se faltar, o sistema reorienta pro `/identidade`.