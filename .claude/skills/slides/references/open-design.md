# Comandar o Open Design pra desenhar o deck (referência da `/slides`)

O Open Design (OD) é a ferramenta de terceiros que desenha o **visual premium** do deck. A
`/slides` o comanda por baixo dos panos (o dono leigo não vê nada disso) e depois pluga assets
reais + navegação no HTML que ele devolve. Provado: o dono aprovou o deck do OD e rejeitou o que
a skill tinha escrito à mão.

> Ferramenta EXTERNA. Antes de usar com pasta de cliente, revisar confiança/permissões (regra do
> CLAUDE.md). Daemon é LOCAL — confirmar preso ao `localhost`. Reconferir o README a cada upgrade
> (comando/porta mudam). Memória: `open-design-daemon`, `ferramentas-design`.

## 1. Garantir o daemon no ar (porta FIXA 7456)

O MCP do OD fala com `http://127.0.0.1:7456`. Se `list_projects` falhar com "cannot reach the
daemon", subir (em background, da pasta do OD):

```
cd C:/Users/ACER/tools/open-design && pnpm exec tools-dev --daemon-port 7456
```

FORÇAR `--daemon-port 7456` — sem isso ele escolhe outra porta e o MCP não acha. Confirmar vivo:
`curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7456` (404 = no ar, só sem rota na raiz).

## 2. Criar o projeto + disparar o run

- `create_project({ name, id })` — id-slug estável (ex: `<negocio>-deck-<tema>`).
- `start_run({ project, prompt })` — o brief é tudo. O run leva 5-30min (agente próprio do OD).
- `get_run({ runId })` a cada 30-60s até `status: succeeded`. Não cancelar por impaciência
  (mtime parado = agente pensando). Mostrar ao dono o `studioUrl` como link clicável pra
  acompanhar ao vivo.
- Ao terminar: baixar o HTML — `curl -s "http://127.0.0.1:7456/api/projects/<id>/raw/index.html"
  -o producao/slides/<tema>/index.html`.

## 3. O brief (o que CRAVAR no prompt do run)

O visual sai bom na medida do brief. Sempre incluir:

- **Tokens reais de `marca/tokens.css`** explícitos: fundo, superfícies, cor primária, acento,
  texto, bordas, as 2 fontes (display + corpo). "Cravar exatamente, é a marca do cliente."
- **Estética de referência:** decks de pitch de tech premium (Linear / Vercel / Stripe) —
  escuro, tipografia grande e confiante, pouquíssimo texto por slide, 1 herói por slide,
  microdetalhes (grid técnico sutil, kicker monoespaçado, números gigantes). "Cada slide é uma
  cena, não um formulário." Glow LINEAR do topo, nunca orb radial. Cantos vivos.
- **A copy aprovada, texto EXATO**, slide a slide, com acentuação correta. "Use exatamente este
  texto, não invente, não adicione." (A copy já passou por humanização + auditoria antes daqui.)
- **Formato:** HTML único, slides 16:9 (`section` 100vw×100vh), Google Fonts das fontes da marca.
- **Placeholders de mockup** onde entram as peças reais: phone vertical (carrossel/reel), browser
  (página). A skill troca por `<img>` depois.
- **SEM JS de navegação** — a skill injeta a navegação depois (`navegacao.html`). Pedir
  `data-screen-label` em cada `<section>` (o presenter view usa).
- Respeitar `prefers-reduced-motion`.

## 4. Depois do OD (a skill faz, não o OD)

- Trocar placeholders por `<img>` das peças reais (ver regra do mockup 4:5 = `contain` no
  SKILL.md passo 9b).
- Injetar `navegacao.html` antes de `</body>`, com o array `NOTAS` preenchido.
- Verificar com `verificar.mjs` e abrir no navegador.

## Fallback (OD indisponível)

Se o daemon não sobe ou o run falha: usar `engine.html` + `blocos.md` (montar o deck à mão,
injetar tokens, montar slides). É o plano B — o visual fica bom, mas o OD entrega o "nível
agência" que o dono validou. Não é o caminho padrão.