---
name: pagina
description: >
  Use para criar landing page ou site de uma página com padrão premium — "/pagina",
  "cria a landing page", "preciso de um site", "página de vendas", "página pro
  lançamento". Entrega HTML/CSS/JS completo com a identidade da marca, copy que
  converte, dados estruturados e verificação visual em múltiplos tamanhos de tela —
  o produto de R$ 5.000 do portfólio.
---

# /pagina — Landing page premium

A entrega mais valiosa do sistema. Página que não parece feita por IA, carrega rápido,
converte e responde bem tanto pra quem busca no Google quanto pra quem pergunta a uma
IA. Processo em etapas com aprovação visual — nunca um arquivão de uma vez.

Autoria: ImpulsoX AI. Conteúdo original.

## O que ler antes

- `marca/design-guide.md` + `marca/tokens.css` — sem marca, rodar `/identidade` antes
  (página premium sem identidade não existe; aqui a escada TEM degrau mínimo: 2)
- `nucleo/negocio.md`, `nucleo/voz.md` — oferta e voz
- `producao/raio-x/` — se houver diagnóstico, os vazamentos apontados viram requisitos

**Ferramentas opcionais (usar quando instaladas):**
- **Open Design** (plugin MCP `open-design`, daemon local em `127.0.0.1:7456`) — canvas de
  iteração visual ao vivo: criar projeto, gerar artefato, o usuário/cliente vê o design
  renderizar em tempo real e itera conversando. Ideal pra Etapa 2→3 e pra reunião de
  apresentação. Requer o daemon ativo (`pnpm tools-dev` na pasta do Open Design); se o
  MCP não responder, avisar como subir o daemon e seguir sem ele.
- **impeccable** — executor de qualidade de design anti-estética-de-IA. Instala por máquina
  (`claude plugin install impeccable@impeccable`); se `/impeccable` não existir, seguir sem
  ela. Comandos reais, cada um roda solto via `/impeccable <cmd>` (NÃO existe encadeamento
  fixo `init→shape→craft…`): `shape` (planejar UX antes de codar), `craft` (fluxo completo
  de construção), `critique` (hierarquia/clareza/ressonância), `audit` (a11y, performance,
  responsivo), `polish` (acabamento final), `typeset`/`layout`/`colorize` (tipografia, espaço,
  cor), `bolder`/`quieter`/`distill` (intensidade), `live` (variações no browser).
  Fluxo sugerido sobre o HTML gerado: `shape` → `craft` → `critique` + `audit` → `polish`.

**Regra firme:** quando usar Open Design ou impeccable, elas LEEM `marca/design-guide.md` +
`marca/tokens.css` e trabalham DENTRO da marca do negócio — nunca impõem paleta, fonte ou
identidade próprias. A marca é sempre a do cliente. (Num clone com a marca já preenchida,
`/impeccable init` pode capturar esse contexto de forma persistente; é opcional, porque a
regra de ler os arquivos da marca já garante a fidelidade.)

Sem nenhuma das duas, seguir o processo desta skill — as regras abaixo cobrem o essencial.

## Etapa 1 — Estrutura antes de pixel

Definir e aprovar com o usuário ANTES de codar (mensagem curta, não documento):
- **Promessa central** — a frase que segura a página inteira (na voz da marca)
- **Ordem das seções** — padrão que funciona: abertura com promessa + prova rápida →
  problema que o visitante reconhece → a oferta e como funciona → provas (depoimentos,
  números, portfólio REAIS) → quebra de objeções (FAQ) → chamada final
- **Uma conversão** — a página inteira empurra pra UMA ação (WhatsApp, formulário,
  compra). Duas chamadas = nenhuma.

## Etapa 2 — Copy

Escrever o texto completo antes do layout (layout serve o texto, não o contrário):
- Resposta direta no primeiro bloco: o visitante entende em 5 segundos o que é, pra
  quem e por que confiar
- Específico > superlativo: "atendemos em até 2h" > "atendimento ágil"
- FAQ com 5-8 perguntas reais respondidas de forma direta
- **Todo o texto passa pelo `/escritor-br`**
- Prova que não existe não entra: sem depoimento real, a seção sai (instrução explícita
  de coleta no lugar)

## Etapa 3 — Construção

- HTML5 semântico, CSS moderno (custom properties consumindo `marca/tokens.css`, grid,
  `clamp()` pra tipografia fluida), JavaScript só onde tem função
- Mobile-first de verdade: projetar a 390px primeiro, expandir depois
- Performance como requisito: imagens otimizadas (WebP, `loading="lazy"` abaixo da
  dobra), zero framework por padrão, fontes com `font-display: swap`
- `prefers-reduced-motion` respeitado em qualquer animação
- Dados estruturados no `<head>`: `LocalBusiness`/`Organization` + `FAQPage` do FAQ.
  A camada de Schema/GEO completa e suas regras moram no `/seo` (autoridade única) —
  rodar `/seo` antes de publicar fecha a auditoria on-page + citabilidade por IA
- Acessibilidade: contraste AA, foco visível, alt em toda imagem com conteúdo

**Proibições de estética genérica de IA** (mesmo espírito do `/identidade`): sem
degradê roxo-azul de template, sem grade de cards como primeira impressão, sem ícone
em quadradinho sobre cada título, sem Inter/Roboto como escolha nova. A página tem que
ter UM elemento memorável — um detalhe tipográfico, uma cor usada com coragem, um
layout de abertura que não está em todo template.

## Etapa 4 — Verificação visual (obrigatória)

Abrir a página real (Playwright) e capturar screenshot em **390px, 768px e 1440px**.
Olhar as imagens de verdade: texto vazando? hierarquia funciona no celular? botão da
conversão visível sem rolar no mobile? Corrigir e re-capturar até as três larguras
estarem certas. Mostrar as capturas ao usuário pra aprovação — ele aprova vendo.

## Etapa 5 — Entrega

`producao/paginas/<slug>/` com `index.html`, assets e `publicacao.md` (como subir:
Vercel/Netlify/hospedagem própria, apontamento de domínio em passos simples). Variações
pra reunião comercial (cenário "site antigo, reunião amanhã"): gerar 2 direções da
Etapa 1 + abertura de cada uma renderizada — decisão visual na reunião, página completa
depois da escolha.

## Regras

- Conteúdo real sempre; placeholder explícito (`[SUBSTITUIR: foto da equipe]`) quando
  o material não existe — nunca texto fake que parece final.
- Página com formulário → mencionar política de privacidade (LGPD).
- Nunca declarar pronto sem a Etapa 4 executada com as três capturas conferidas.
