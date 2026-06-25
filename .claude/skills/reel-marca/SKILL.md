---
name: reel-marca
description: >
  Use pra criar reel de vídeo de MARCA por código (motion graphics) pro negócio do cliente —
  "/reel-marca", "faz um reel da marca", "vídeo institucional", "reel pra divulgar", "reel do
  meu serviço/produto", "reel de antes e depois", "reel com depoimento". Produz reel vertical
  9:16 na identidade e voz do cliente, mostrando o RESULTADO/PRODUTO/SERVIÇO REAL dele em mockup,
  com copy auditada e estrutura de retenção comprovada. Serve qualquer nicho — restaurante,
  academia, médico, advogado, loja, estética, prestador. Distinta do /post (reel com rosto/cena
  por IA) — esta é motion graphics por código (Remotion): texto animado, produto em mockup.
---

# /reel-marca — Reel de motion graphics de marca (Remotion)

Gera um reel 9:16 pro negócio do cliente, na identidade visual e voz DELE, com a estrutura dos
reels que mais retêm em 2026 (ver `reel-formula-viral` na memória — dados de 2M+ clips, não
achismo). É motion graphics por código — não usa IA pra rosto/cena (isso é o `/post`).

**Agnóstica de nicho.** Roda no clone de cada cliente e faz reel pro negócio daquele cliente: a
academia vende o resultado do treino; o restaurante, o prato; o dentista, o sorriso; o advogado,
a área de atuação. O reel vende **o que aquele cliente vende**, lendo o núcleo dele. O contexto
(negócio, ofertas, voz, marca) define tudo — nunca um nicho ou oferta assumidos.

Autoria: ImpulsoX AI.

## Princípio 1 — mostrar o REAL (o que dá o "wow")

Reel abstrato impressiona pouco; ver o resultado REAL do negócio (o prato, o antes/depois, a
página, o depoimento de quem comprou) impressiona muito. Puxar peças reais de `producao/` ou
ativos da marca/fotos do cliente — nunca mockup genérico inventado.

## Princípio 2 — estrutura de RETENÇÃO (copiar quem viraliza, não inventar)

Baseado em dados (memória `reel-formula-viral`). Métrica a perseguir: **retenção 3s ≥ 65%**.

**Estrutura vencedora:** HOOK EMPILHADO (0-3s) → RESULTADO cedo → COMO/PROVA → CTA (no FIM).

- **Hook empilhado** (+35-45% retenção) = 3 camadas SIMULTÂNEAS no 1º segundo:
  1. **Visual** — pattern interrupt: movimento/zoom/prop, começar no MEIO da ação. NUNCA estático.
  2. **Verbal/texto** — a frase mais forte na posição 1, ≤8 palavras, no TERÇO SUPERIOR, frame 1.
  3. Hook por tipo (rotacionar entre reels), em ordem de retenção:
     - **Specific Outcome 45%** (número concreto) — "12 manchas sumiram em 30 dias".
     - **POV Realism 42%** — "POV: você achou o restaurante que vira rotina".
     - **Unpopular Opinion 38%** — "Pare de assinar contrato sem ler a cláusula 7".
     - **Question 28%** — "Treina há 6 meses e não muda nada?".
     - **Pain Point 27%** — "Cansado de treinar e ver 0 resultado?".
     - **Generic Reveal 12% ("Oi pessoal") = NUNCA.** Não enterrar a melhor frase.
- **RESULTADO primeiro** (Show End First): mostrar o payoff cedo (o antes/depois, o prato pronto,
  a página no ar), depois o "como". O cérebro se compromete a ver o resto.
- **CTA só no FIM**, depois do payoff. Nunca no hook. Só ~15% promo.
- **CTA de negócio local = ação + prova de local.** Pra PME local, o CTA que converte é o verbo
  do negócio ("Agende", "Chame no WhatsApp", "Peça agora", "Reserve" — vem da oferta ATIVA) +
  prova de local quando o nicho pede: a fachada, o ponto, "atende em [bairro/cidade]" (do
  `nucleo/negocio.md`). É o que ancora o lead local e serve de capa no Google Business Profile.
- **Marca/assinatura SÓ no FIM** — logo/intro animada no começo o algoritmo lê como ANÚNCIO e
  derruba o alcance. O reel NÃO abre com a marca.

**Duração-alvo por tipo:** viral/showcase 7-15s · dica/produto 15-30s · educativo/tutorial 30-60s.

## Objetivo do reel: salvar ou enviar (decidir ANTES do storyboard)

Em 2026 o sinal que mais distribui não é o like — é **save** (~2-3x) e **send/DM** (~3-5x; fator
nº1 de alcance pra quem não te segue). Antes do storyboard, declarar pra qual o reel é desenhado:

- **Pra SALVAR** — precisa de um frame-resumo guardável (o "print que vale guardar": o antes/
  depois, a tabela de preço, o checklist). Costuma ser a penúltima cena.
- **Pra ENVIAR** — precisa de um gancho explícito no fim ("manda isso pro dono do [negócio]"). O
  conteúdo tem que ser relatável o bastante pra virar "isso é a sua cara".

É o 1º filtro do briefing. Reel que não mira save NEM send fica bonito e some.

## Pré-requisitos (Escada de Contexto)

- **Núcleo do cliente** (`nucleo/negocio.md`, `nucleo/ofertas/*`, `nucleo/voz.md`) — define o que
  o reel vende e como fala. É o que o torna DAQUELE negócio.
- **Marca** (`marca/tokens.css`) — pro reel sair na identidade do cliente. Sem ela: defaults
  premium marcados "confirmar com a marca" (não trava).
- **Algo real pra mostrar** — peça em `producao/`, ou ativo da marca, ou foto de antes/depois /
  produto / serviço do cliente. Sem nada real: avisar o degrau e oferecer `/post` ou `/pagina`.
- **Node + Remotion** instalados. ffmpeg pro render.

## Fluxo (guiado — 2 gates de aprovação)

1. **Lê o contexto do CLIENTE** (silêncio): `nucleo/negocio.md`, `nucleo/voz.md`,
   `nucleo/ofertas/*` (só ATIVAS), `marca/tokens.css`, `nucleo/provas.md`.
2. **Gera o tema da marca:** `node remotion/gerar-tema.mjs` (tokens.css do cliente → tema.ts).
3. **Escolhe o que o reel vende + o tipo** (viral/showcase/educativo → duração-alvo). Listar só
   ofertas ATIVAS do cliente; FUTURA/"não gerar conteúdo" fica de fora.
4. **Escolhe o hook** (1 das categorias acima, pelo que cabe no caso) e **o que é o RESULTADO**
   a mostrar cedo (antes/depois? produto? página? depoimento?).
5. **Checa o que há de real** pra mostrar (peça/ativo/foto). Não achou → Escada de Contexto.
6. **Storyboard** seguindo a estrutura de retenção (hook empilhado → resultado cedo → como/prova
   → CTA no fim, marca só no fim). Conteúdo tirado do núcleo do cliente. Tabela. **GATE 1.**
7. **Escreve TODO o texto que vai na tela e MOSTRA pro dono — antes de codar nada.** Legendas
   curtas (≤8 palavras no hook, terço superior), karaokê, na voz do cliente (`/copy` ou
   `/escritor-br`). Sem grito/caixa-alta/FOMO. Apresentar **cena a cena, o texto exato de cada
   uma** (hook, legendas, kicker save/send, CTA, assinatura) numa tabela. **GATE 2 — esperar o
   "sim". Nunca renderizar com texto não aprovado.** (Render gasta tempo; texto errado = refazer.)
8. **Auditoria da copy:** `/revisar`. Reprovou → ajustar.
9. **Captura o real:** páginas → `node remotion/captura-produto.mjs <slug>=<caminho-html>`;
   posts → copiar `producao/posts/<post>/slide-*.png` pra `public/carrosseis/<post>/`; fotos de
   antes/depois/produto/autor de depoimento → `public/provas/` ou `public/`.
10. **Coda o reel:** copiar `remotion/src/templates/reel-referencia.tsx` pra
    `remotion/src/<slug>.tsx`, adaptar à estrutura de retenção, registrar a Composition em
    `remotion/src/Root.tsx`. Trilha: `public/trilhas/*.mp3` (dono escolhe; fade-in 1s/out 2s/~40%
    vol). Sem trilha → mudo (legenda queimada cobre os ~60% sem som).
11. **Audita 1 frame por cena** (`npx remotion still ... --frame=N`) antes do full render.
12. **Renderiza (só com o texto do GATE 2 aprovado):** `npx remotion render remotion/src/index.ts <CompId>
    producao/reels/<slug>/reel.mp4` (`--gl=angle` se logo 3D). Esse é o reel MUDO (preservar).
    Guarda o `.tsx`.
12b. **Trilha + compressão (1 passo de ffmpeg).** Muxa a música de fundo E comprime de uma vez —
    o render do Remotion sai com bitrate alto (~3-4 Mbps, 6-10 MB); recomprimir com CRF 23 corta
    ~50% sem perda visível (Instagram recomprime no upload de qualquer jeito). Salva
    `reel-com-trilha.mp4` ao lado, PRESERVANDO o `reel.mp4` mudo:
    ```bash
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 producao/reels/<slug>/reel.mp4)
    fo=$(python3 -c "print(round($dur-2,3))")   # fade-out começa 2s antes do fim
    ffmpeg -y -i producao/reels/<slug>/reel.mp4 -i producao/reels/trilhas/<trilha>.m4a \
      -filter_complex "[1:a]volume=0.22,afade=t=in:st=0:d=1,afade=t=out:st=${fo}:d=2[a]" \
      -map 0:v -map "[a]" -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart \
      -c:a aac -b:a 160k -shortest producao/reels/<slug>/reel-com-trilha.mp4
    ```
    Régua de áudio: **`volume=0.22`** (música de fundo ≈ −28/−29 dB) · **fade-in 1s / out 2s**.
    Trilha tratada antes (loudnorm -14 LUFS + estéreo) se gravada de celular. Sem trilha → pular,
    o reel mudo já serve (legenda queimada cobre os ~60% sem som).
13. **Gera a capa (cover):** `npx remotion still remotion/src/index.ts <CompId>
    producao/reels/<slug>/capa.png --frame=<N>`. Default `N` = um frame do MONEY SHOT (a cena do
    produto/resultado real — melhor prova visual). A skill sugere o frame; ajustável vendo o
    render. A capa serve de thumbnail/post estático e de vídeo-capa no Google Business Profile.

**Sequência (de onde vem, pra onde vai):** o reel-marca normalmente entra DEPOIS de ter marca
(`/identidade`) e peça real pra mostrar (`/post`, `/pagina`); e sai pra `/revisar` (olhos frios)
→ `/publicar` → `/desempenho` (mede save/send e realimenta o próximo). É opcional na esteira —
entra quando o dono quer vídeo de marca.

Fechar com: "✓ reel pronto: `producao/reels/<slug>/reel-com-trilha.mp4` (+ `reel.mp4` mudo,
`capa.png`) · → próximo: `/revisar` (olhos frios) → `/publicar` → `/desempenho` fecha o loop."

## Cenas de PROVA (fortes em qualquer nicho)

- **Antes/depois** (componente `AntesDepois`) — slider dourado revela a foto "depois" sobre a
  "antes". É Show End First/transformação (academia, dentista, estética, reforma). Pôr CEDO (é o
  resultado). Fotos em `public/provas/`.
- **Depoimento** (componente `Depoimento`) — card glassmorphism com aspas, texto, autor, estrelas.
  **Regra da casa: peça pública só usa prova autorizada.** Se o dono digitar um depoimento na
  hora, AVISAR pra usar só depoimento REAL (nunca inventar) e oferecer gravar em `nucleo/provas.md`
  quando ele confirmar que é autorizado. Não usar prova não autorizada.

## Regras técnicas (todas já custaram render perdido)

- **`public/` na RAIZ do projeto** (cwd). staticFile() resolve daí — fora da raiz, 404 silencioso.
- **Fundo SÓLIDO + glow LINEAR do topo** (halo discreto `linear 180deg, transparent 0%, cor 22%,
  transparent 50%`, opacidade 0.05-0.11). NUNCA orb radial ("bola") nem cor cheia no topo (mancha).
- **CameraMotionBlur envolve SÓ o conteúdo que se move, NUNCA o fundo** (rastro sujo). Padrão por
  cena: `<FundoTech/>` → `<Movimento><Camera>conteúdo</Camera></Movimento>` → overlays.
- **Logo 3D (Three.js) NÃO coexiste com CameraMotionBlur** → blur local nas cenas 2D; `--gl=angle`.
- **Página com animação scroll-triggered sai PRETA** parada — `captura-produto.mjs` já rola antes
  do print. Página dark: ajustar `maxScroll` pra não parar no rodapé vazio.
- **Auditar frames antes do full render.** Duração = soma Sequences − soma Transitions.
- **Ritmo:** comando em terminal digita devagar (~1 char/4 frames); carrossel ~30-34 frames/slide.
- **Vídeo GRAVADO não se monta todo no Remotion — ele TREME.** Quando o reel tem gravação de tela
  (página rolando capturada via Playwright), o `<Video>` do Remotion faz seek impreciso em mp4
  H.264 e a junção sai trêmula (judder no começo de cada clipe). **Regra: Remotion só nas partes
  ANIMADAS por código (intro, marca, transições); a GRAVAÇÃO junta via ffmpeg** (sem o problema de
  seek). Se for inevitável meter o clipe gravado no Remotion, re-encodar antes com keyframe a cada
  frame: `ffmpeg -i in.mp4 -c:v libx264 -g 1 -keyint_min 1 -pix_fmt yuv420p -crf 20 out.mp4` (todo
  frame vira seekable, mata o judder). Gravar a página sem branco/tremor: scroll LINEAR (não
  easeInOutQuad), settle ~22ms/frame, esperar `fonts.ready` + forçar lazy-images (rolar até o fim
  e voltar) ANTES de capturar.

## O motor (componentes reusáveis em `remotion/src/`)

`tema.ts` (cores/fontes da marca do cliente, gerado), `premium.tsx` (fundo, HUD, partículas,
contador, anel, grade), `efeitos.tsx` (câmera dolly, parallax, bloom, light-leak), `produto.tsx`
(Phone, Browser, CarrosselReal, ScrollPagina, leques, **AntesDepois**, **Depoimento**),
`sistema.tsx` (Terminal, OpenDesignMock — pra produto digital/SaaS), `logo3d.tsx` (opcional),
`templates/reel-referencia.tsx` (molde validado — COPIAR e adaptar, não editar).

## Exemplos já feitos (referência de aplicação, NÃO o que toda skill produz)

A ImpulsoX usou a skill em 3 reels (conteúdo de redes; landing pages; o sistema rodando no Claude
Code) — exemplos de como a fórmula se aplica. Pra cliente de outro nicho, a estrutura é a mesma, o
conteúdo é o DELE.

## Saída

`producao/reels/<slug>/reel.mp4` (9:16, 1080x1920, legenda queimada) + `capa.png` (cover pra
thumbnail/GBP) + a composição `.tsx`. A produção fica no clone; o motor desce do template via
`/atualizar-motor` e nunca é sobrescrito.

## Formato

v1: só 9:16 vertical + capa still. **Multi-formato (1:1, 4:5, 16:9)** e **cutdowns (15s/5s)** são
lote futuro — exigem layout responsivo (as cenas hoje são calibradas em px fixos pro 9:16) e peça
dedicada (cutdown bem-feito é hook+payoff com ritmo próprio, não corte cego do mp4).

---

**✓ Pronto:** reel de marca 9:16 (motion graphics na marca + produto real) + capa · **→ próximo passo:** `/revisar` — crivo sênior de olhos frios antes de ir ao ar; depois `/publicar`. Pré-requisito: núcleo do cliente + `marca/tokens.css`; se faltar marca, o sistema reorienta pro `/identidade`.