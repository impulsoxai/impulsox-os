# /concorrente — vigia competitiva contínua (design)

> Data: 2026-06-23 · Produto: ImpulsoX-OS · Oportunidade O6 da auditoria
> (`docs/auditoria-so-2026-06-23.md`). OS puro — não toca no CRM.

## Problema

O `/radar` traz tendências do nicho e olha lacuna de pauta do concorrente; o `/ads-meta`
disseca a Ad Library pra montar swipe de anúncio. Mas ninguém **mantém um perfil vivo do
concorrente** — quem é, posicionamento, preço, ofertas, cadência, anúncios ativos,
novidades. Inteligência competitiva é serviço de consultoria (alavanca de posicionamento
10k+), não de freela; e hoje cada skill que precisa de concorrente recomeça do zero.

## Job exclusivo (fronteira anti-duplicação)

`/concorrente` mantém o **dossiê vivo** de cada concorrente em `nucleo/concorrentes.md` — a
FONTE única. Os outros CONSOMEM o pedaço deles:

- `/radar` → lê cadência/ângulos do concorrente pra achar a lacuna de pauta (não re-pesquisa).
- `/ads-meta` → lê os anúncios ativos registrados (não re-disseca do zero; ainda pode
  aprofundar no swipe).
- `/oferta` e `/proposta` → leem o comparativo (cliente × concorrentes).

Uma fonte, vários consumidores — o padrão que o OS já usa (núcleo, formulas, provas).

## Três modos

1. **Mapear** (`/concorrente`, "mapeia meu concorrente", "analisa o concorrente X") — monta
   ou atualiza o dossiê de um ou mais concorrentes. É o modo-base.
2. **Alerta** ("o que o concorrente mudou?", "novidade do concorrente") — compara o estado
   atual com o dossiê anterior e reporta **só o delta** (anúncio novo, preço mudado, página
   nova, oferta nova). Sob demanda; ao terminar, sugere rechecar em ~30 dias (sem cron).
3. **Comparativo** ("eu vs eles", chamado por `/proposta` e `/oferta`) — gera a tabela
   cliente × concorrentes (preço, oferta, presença, ângulos, lacunas) a partir do dossiê.

## Fontes em escada (zero login — regra do CLAUDE.md)

Nunca raspar rede social atrás de login. Empilha conforme o contexto sobe:

- **Degrau 0 — o dono informa:** quem são, preços que conhece, o que ouviu. Semente do
  dossiê; funciona sem raspar nada. Sem isso, perguntar "quais são seus 2-3 concorrentes?".
- **Degrau 1 — público sem login:**
  - **Site do concorrente** via `firecrawl-scrape`/`firecrawl-crawl`: posicionamento, preço
    (se exposto), ofertas, novidades. Guardar o que foi capturado pra o modo Alerta comparar.
  - **Meta Ad Library** (`facebook.com/ads/library`, público) via firecrawl — anúncios
    ativos: estrutura, oferta, há quanto aparece. **Reusa a mecânica do `/ads-meta`** (mesma
    fonte, mesma cegueira honesta — ver abaixo).
- **Degrau 2 — busca aberta** via `WebSearch`: notícia, review, menção, ranking, presença.
  Pra redes sociais, só o que aparece em busca pública (nunca raspar IG/LinkedIn logado).

Cada campo do dossiê marca **fato** (capturado/confirmado) vs **suposição** (a confirmar) —
Escada de Contexto.

## Cegueira honesta (herda do /ads-meta)

A skill AVISA o dono dos limites da fonte:
- Ad Library de anúncio **comercial** BR não mostra gasto, alcance, impressões, CTR nem
  segmentação (só anúncio político/social mostra). O dossiê lê **estrutura, não resultado**.
- "Ativo há X" é a **data de criação** do anúncio, não de veiculação contínua (pode ter sido
  pausado e religado — a biblioteca não distingue).
- Preço só entra se **exposto publicamente**; senão, fica como suposição do dono ou lacuna.

## O arquivo `nucleo/concorrentes.md`

Um arquivo, vários concorrentes. Por concorrente, um bloco:

```markdown
## [Nome do concorrente] — [site]
> Última observação: [data] · Degrau: [0/1/2]

- **Quem é / posicionamento:** [como se posiciona; fato ou suposição]
- **Preço/oferta:** [o que cobra, se exposto; senão: suposição/lacuna]
- **Ofertas ativas:** [o que vende hoje]
- **Cadência de conteúdo:** [com que frequência/onde posta — pro /radar]
- **Anúncios ativos (Ad Library):** [quantos, ângulo, oferta, há quanto aparece]
- **Novidades/mudanças:** [o que apareceu desde a última observação — pro modo Alerta]
- **Ângulos que ele NÃO cobre:** [a lacuna — a melhor oportunidade pro cliente]
```

Concorrente de conteúdo é **inspiração de ângulo, nunca cópia** (regra do `/radar` herdada).

## Consumidores (ligações a adicionar)

- `radar/SKILL.md` — "O que ler antes"/camada 3 passa a ler `nucleo/concorrentes.md` quando
  existe (em vez de re-pesquisar o concorrente do zero).
- `ads-meta/SKILL.md` — Passo 0 (swipe) pode partir dos anúncios já registrados no dossiê.
- `oferta/SKILL.md` e `proposta/SKILL.md` — leem o comparativo pra ancorar preço/posição.

## Fluxo (modo Mapear)

1. **Entrada.** Concorrentes informados pelo dono, ou ler os já citados no núcleo
   (`negocio.md`/`concorrentes.md`); se nenhum, perguntar os 2-3 principais.
2. **Coletar em escada.** Degrau 0 (dono) → 1 (site via firecrawl + Ad Library) → 2
   (WebSearch). Degradar sem travar; marcar o que faltou.
3. **Destilar no dossiê.** Preencher o bloco por concorrente em `nucleo/concorrentes.md`,
   fato vs suposição, com data e degrau.
4. **Lacuna.** Pra cada concorrente, registrar os ângulos que ele NÃO cobre (a oportunidade).
5. **Fechar** apontando o próximo passo (ver Guiar pela esteira).

## Modo Alerta (delta)

1. Reler o dossiê atual.
2. Recoletar (degrau 1+2) e comparar com o registrado.
3. Reportar **só o que mudou** (anúncio novo, preço, página, oferta). Atualizar a data.
4. Sugerir rechecar em ~30 dias (sem cron automático — dono no controle).

## Modo Comparativo (cliente × eles)

1. Ler o dossiê + as ofertas ATIVAS do cliente (`nucleo/ofertas.md`).
2. Montar tabela: preço · oferta · presença · ângulos · lacuna, cliente vs cada concorrente.
3. Entregar pro `/proposta` ou `/oferta` que chamou (ou avulso pro dono).

## Regras

- **Zero login.** Só fonte pública (site, Ad Library pública, busca aberta). Nunca raspar
  rede social logada (risco à conta — regra do CLAUDE.md).
- **Fato vs suposição** marcado sempre; preço/dado não confirmado nunca vira fato.
- **Inspiração, não cópia.** O dossiê serve pra achar a lacuna e posicionar — nunca pra
  copiar tema, estética ou identidade do concorrente.
- **Cegueira honesta** declarada (limites da Ad Library).
- É MOTOR: nasce no template, desce via `/atualizar-motor`. Não toca no CRM.

## Degrau mínimo

Roda no degrau 0 (só o que o dono informa). Calibra de verdade no degrau 1 (firecrawl
disponível + concorrente com site/anúncios públicos).

## Teste de aceitação (comportamental)

1. Dono dá 2 concorrentes sem mais nada → dossiê semente criado (degrau 0), resto marcado
   pendente; nada inventado como fato.
2. Concorrente com site + anúncios públicos → dossiê preenchido em degrau 1, com a cegueira
   honesta da Ad Library declarada.
3. Modo Alerta com dossiê anterior → reporta só o delta, não re-despeja tudo.
4. Modo Comparativo chamado pela `/proposta` → tabela cliente×concorrentes a partir do
   dossiê, sem re-pesquisar.
5. `/radar` rodando depois → lê a cadência/lacuna do dossiê em vez de re-pesquisar o
   concorrente do zero.

## Posição no fluxo

Alimenta `/radar` (antes do calendário), `/oferta` e `/proposta`. Opcional — oferecido
quando o dono quer inteligência competitiva; não empurrado.

## Arquivos

- Criar: `.claude/skills/concorrente/SKILL.md`.
- Criar (no 1º uso): `nucleo/concorrentes.md` (template no spec acima).
- Tocar: `radar/SKILL.md`, `ads-meta/SKILL.md`, `oferta/SKILL.md`, `proposta/SKILL.md`
  (ler o dossiê) + `docs/mapa-de-skills.md` + `CHANGELOG.md`.
