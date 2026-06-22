# Design — Skill `/reel-marca` (reel de motion graphics por código)

> Spec da skill que gera reel de vídeo de marca via Remotion, no template ImpulsoX-OS.
> ImpulsoX AI · 2026-06-21.

## O que é

Skill do template (`.claude/skills/reel-marca/SKILL.md`) que produz **reel de motion
graphics de marca por código (Remotion)** — texto animado + **produto real do cliente em
mockup** + identidade visual da marca. Vertical 9:16 (1080x1920), legenda queimada.

**Distinta do `/post`**, que faz reel com rosto/cena real por IA (Fal/Kling). Os dois se
completam: `/reel-marca` = motion graphics de marca por código; `/post` = cena real por IA.
Ver [[reel-remotion-decisao]] e [[reel-remotion-formula]] na memória do projeto.

## Por que existe

Validamos a fórmula em 2 reels aprovados pelo dono (conteúdo IG/LinkedIn + landing pages) em
2026-06-21. Virou processo repetível → merece skill (regra do CLAUDE.md: rotina vira skill).
Entregável das ofertas ATIVAS (Conteúdo IG/LinkedIn produz reels) e material institucional.

## Arquitetura (Híbrido C): motor parametrizado + template de referência

### O motor — `remotion/` (na raiz do projeto/clone)

Biblioteca de componentes reusáveis, **parametrizada pela marca do cliente**:

- **`remotion/src/tema.ts`** (NOVO) — expõe `C` (objeto de cores: fundo, primaria/roxo,
  acento/dourado, texto, etc.) + nomes de fonte (display/mono). Hoje `C` está hardcoded em
  `premium.tsx` (cores ImpulsoX); refatorar para leitura da marca. Como lê: um passo da skill
  (ou um script `gerar-tema.mjs`) faz o parse das `--cor-*`/`--fonte-*` de `marca/tokens.css`
  (regex simples nas custom properties) e gera/atualiza `tema.ts` com os valores do cliente —
  o `.tsx` importa `C` de `tema.ts` (não dá pra `@import` CSS dentro do Remotion como objeto JS,
  por isso o parse vira um módulo). Cliente sem `tokens.css` → defaults premium marcados
  "(confirmar com a marca)".
- **`remotion/src/premium.tsx`** — FundoTech, AneisRadar, Scanner, CornerBrackets, Particulas,
  Glitch, HudPainel, GradeFeed/GradeVazia, Contador, AnelProgresso, LogoDrawOn. Importam `C` de
  `tema.ts` (não mais hardcoded).
- **`remotion/src/efeitos.tsx`** — Camera (dolly 2D), CamadaParallax (DOF), Bloom, Aberracao +
  FiltrosRGB, LightLeakMarca.
- **`remotion/src/produto.tsx`** — Phone (mockup celular), CarrosselReal (slides deslizando),
  Browser (mockup navegador + URL), ScrollPagina (full-page rolando, `maxScroll` configurável),
  LequePosts, LequePaginas. **O coração da fórmula** (mostra o produto REAL do cliente).
- **`remotion/src/logo3d.tsx`** — Logo3D (X 3D via Three.js). OPCIONAL — só quando pedido.
  REGRA: ThreeCanvas NÃO coexiste com CameraMotionBlur global (blur clona filhos N× e quebra o
  WebGL/delayRender). Quando usar 3D, o blur fica LOCAL nas cenas 2D, a cena 3D fica sem blur.
- **`remotion/src/index.ts`** + **`Root.tsx`** — registerRoot + Composition (1 por reel).

### O template de referência

- **`remotion/src/templates/reel-referencia.tsx`** — o reel APROVADO pelo dono (estrutura
  5-beats validada), parametrizado pela marca. A IA COPIA este arquivo e adapta cenas/copy/
  produto por oferta. NÃO é o reel do OpenClawd (esse foi só a lição "mostrar produto real",
  registrada na memória, não vira código). É o NOSSO reel validado.

### Captura de produto

- **`remotion/captura-produto.mjs`** (NOVO) — Playwright (já no projeto): abre o HTML de
  `producao/paginas/<demo>/index.html`, tira screenshot `-top.png` (viewport) e `-full.png`
  (fullPage), salva em `public/paginas/`. Posts já são PNG em `producao/posts/<post>/slide-*.png`
  → copiados direto pra `public/carrosseis/`.

### public/ (na RAIZ do projeto — cwd onde roda o comando)

`public/carrosseis/` (posts), `public/paginas/` (screenshots), `public/trilhas/` (mp3
royalty-free que o dono põe). REGRA CRÍTICA: `public/` tem que estar na raiz do cwd, senão
staticFile() dá 404 silencioso (lição custou render perdido).

## Fluxo da skill (guiado, com 2 gates)

1. **Lê contexto** (silêncio) — `nucleo/voz.md`, `nucleo/ofertas/*` (só ATIVAS),
   `marca/tokens.css`, `nucleo/provas.md` (só prova autorizada em peça pública).
2. **Escolhe oferta** — pergunta qual oferta ATIVA o reel vende (lista só ATIVAS; ofertas
   FUTURAS/"não gerar conteúdo" ficam fora — regra da casa).
3. **Checa produto real** (Escada de Contexto) — procura peça da oferta em `producao/`. Não
   achou → avisa o degrau e oferece rodar `/post` ou `/pagina` antes ("produto real é o que dá
   o impacto; quer produzir 1 peça primeiro, ou seguir com mockup genérico marcado?").
4. **Storyboard 5-beats** — hook (situação real do dono) → problema (sem culpar) → MONEY SHOT
   (produto real no mockup, cena mais longa) → variedade/diferencial → assinatura suave.
   **GATE 1: dono aprova o storyboard.**
5. **Copy na voz** — escreve as legendas (curtas, queimadas) chamando `/copy` ou `/escritor-br`,
   na voz do cliente. Sem grito/caixa-alta/FOMO (regra da voz). **GATE 2: dono aprova a copy.**
6. **Auditoria da copy** — `/revisar` (auditor de marketing frio). Reprovou → ajusta e repassa.
7. **Captura produto** — `captura-produto.mjs` (páginas) ou copia PNG (posts) → `public/`.
8. **Coda** — copia `templates/reel-referencia.tsx`, adapta cenas/copy/produto pra oferta,
   aplica trilha escolhida (fade-in 1s / fade-out 2s / ~40% volume).
9. **Audita frames** — 1 still por cena (`npx remotion still ... --frame=N`); pega layout
   quebrado / imagem 404 barato, ANTES do full render.
10. **Render** → `producao/reels/<slug>/reel.mp4` (9:16). Guarda a composição `.tsx`
    (reeditável). Fecha apontando o próximo passo (`/revisar` final ou `/publicar`).

## Áudio, formato, saída

- **Áudio:** `public/trilhas/*.mp3` (dono põe faixas royalty-free — ex: YouTube Audio Library,
  Pixabay). Skill lista, dono escolhe, aplica via `<Audio src={staticFile} />` + fade. Sem
  trilha → reel mudo (avisa uma vez, não trava; legenda queimada cobre os 85% que veem mudo).
- **Formato:** só 9:16 (1080x1920) na v1. Multi-plataforma (1:1, 16:9) = rodada futura.
- **Saída:** `producao/reels/<slug>/reel.mp4` + composição `.tsx`. Cru/produção nunca tocado
  por `/atualizar-motor` (regra: motor desce do template, produção fica no clone).

## Regras técnicas (viram avisos no SKILL.md — todas custaram render perdido)

1. `public/` na RAIZ do cwd (404 silencioso senão).
2. Fundo SÓLIDO escuro + glow LINEAR do topo; NUNCA orb radial (vira "bola" feia). Grade
   técnica fina com máscara linear. Vinheta leve só nas pontas. Sem grão pesado. O glow do topo
   é halo discreto (`linear 180deg, transparent 0%, cor 22%, transparent 50%`, opacidade
   0.05-0.11) — cor cheia colada no topo mancha.
3. **CameraMotionBlur envolve SÓ o conteúdo que se move, NUNCA o fundo.** Blur no fundo borra a
   grade/glow e deixa rastro sujo. Padrão por cena: `<FundoTech/>` direto → `<Movimento><Camera>
   conteúdo </Camera></Movimento>` → overlays (legenda/brackets). Nunca envolver a cena inteira.
4. ThreeCanvas (3D) não coexiste com CameraMotionBlur → blur local nas cenas 2D, 3D sem blur.
5. Auditar frames antes do full render.
6. Duração da Composition = soma das Sequences − soma das Transitions (TransitionSeries).
7. Three.js exige `--gl=angle` no render.
8. Página dark (fundo preto) faz money shot ruim no scroll (preto vazio) → preferir página com
   imagem cheia (foto), ou ajustar `maxScroll` pra parar antes do rodapé vazio.

## O que NÃO está no escopo (YAGNI / rodada futura)

- Multi-formato (1:1, 16:9) — só 9:16 agora.
- Busca/download automático de música — dono põe os mp3 na pasta.
- Geração de música/voz por IA.
- Reel com rosto/cena real — isso é o `/post` (Fal), não esta skill.

## Dependências

Pacotes Remotion já instalados: `remotion @remotion/cli @remotion/bundler @remotion/transitions
@remotion/motion-blur @remotion/animation-utils @remotion/google-fonts @remotion/paths
@remotion/light-leaks @remotion/three three @react-three/fiber @remotion/media-utils
@remotion/shapes`. `playwright` (captura) já no projeto.

## Critério de sucesso

Dono chama `/reel-marca`, escolhe oferta ATIVA, aprova storyboard + copy, e recebe um reel 9:16
com produto real, na voz e marca dele, copy auditada, em `producao/reels/<slug>/`. A skill
funciona pra qualquer cliente (lê a marca do clone), desce via `/atualizar-motor`.
