---
name: concorrente
description: >
  Use pra vigiar o concorrente do cliente — "/concorrente", "mapeia meu concorrente",
  "o que o concorrente X tá fazendo", "o que o concorrente mudou?", "eu vs eles",
  "análise da concorrência", "como me comparo com o concorrente". Mantém um dossiê vivo
  por concorrente (posicionamento, preço, ofertas, cadência, anúncios ativos, novidades)
  em nucleo/concorrentes.md — a fonte que /radar, /ads-meta, /oferta e /proposta leem.
  Só fonte pública (site, Meta Ad Library, busca aberta); nunca raspa rede social logada.
---

# /concorrente — Inteligência competitiva (dossiê vivo)

Inteligência competitiva é serviço de consultoria, não de freela — é o que separa quem
"cuida do marketing" de quem "conhece o mercado do cliente". Esta skill mantém um perfil
vivo de cada concorrente que o resto do sistema consome: o `/radar` acha a lacuna de pauta
nele, o `/ads-meta` parte dos anúncios já mapeados, a `/oferta` e a `/proposta` ancoram
preço e posição no comparativo.

Autoria: ImpulsoX AI. Conteúdo original.

## O job exclusivo (o que esta skill é e o que NÃO é)

Esta skill é a **FONTE** do dado de concorrente. Mantém o dossiê; os outros consomem:
- **`/radar`** lê a cadência/ângulos do concorrente pra achar a lacuna de pauta — não
  re-pesquisa do zero.
- **`/ads-meta`** parte dos anúncios já registrados aqui (e aprofunda no swipe se quiser).
- **`/oferta`** e **`/proposta`** leem o comparativo (cliente × concorrentes).

Não é o `/radar` (aquele decide pauta do mês); não é o `/ads-meta` (aquele monta campanha).
Esta documenta o adversário; os outros usam o que ela documenta.

## Degrau mínimo (Escada de Contexto)

Roda no degrau 0 (só o que o dono informa). Calibra de verdade no degrau 1 (firecrawl
disponível + concorrente com site/anúncios públicos). Nunca trava: trabalha com o que tem
e marca o que falta.

## O que ler antes

- `nucleo/concorrentes.md` — o dossiê atual (se existe); é o que o modo Alerta compara.
- `nucleo/negocio.md` — concorrentes já citados + o posicionamento do próprio cliente.
- `nucleo/ofertas.md` — ofertas ATIVAS do cliente (pro modo Comparativo).

## Três modos

### Modo 1 — Mapear (o modo-base)
Gatilho: `/concorrente`, "mapeia meu concorrente", "analisa o concorrente X". Monta ou
atualiza o dossiê de um ou mais concorrentes.

1. **Entrada.** Concorrentes informados pelo dono, ou os já citados no núcleo. Se nenhum,
   perguntar: "Quais são seus 2-3 principais concorrentes? (nome + site, se souber)".
2. **Coletar em escada** (ver "Fontes" abaixo): degrau 0 → 1 → 2, degradando sem travar.
3. **Destilar no dossiê** (`nucleo/concorrentes.md`): preencher o bloco por concorrente,
   marcando fato vs suposição, com data e degrau.
4. **Lacuna.** Pra cada concorrente, registrar os ângulos que ele NÃO cobre — a melhor
   oportunidade pro cliente.
5. **Fechar** apontando o próximo passo.

### Modo 2 — Alerta (só o delta)
Gatilho: "o que o concorrente mudou?", "novidade do concorrente".

1. Reler o dossiê atual.
2. Recoletar (degrau 1+2) e comparar com o registrado.
3. Reportar **só o que mudou** (anúncio novo, preço, página nova, oferta nova) — não
   re-despejar o dossiê inteiro. Atualizar a data de observação.
4. Sugerir rechecar em ~30 dias. **Sem cron automático por default** — o dono no controle.
   Mas isto é tarefa com cara de rotina (regra do CLAUDE.md): no fecho, **oferecer a
   `/automatizar`** ("quer que isso rode sozinho todo mês e te avise só quando houver
   mudança?") — detecção agendada COM aprovação humana é o estado da arte; o cron só
   entra se o dono disser sim.

### Modo 3 — Comparativo (cliente × eles)
Gatilho: "eu vs eles", ou chamado por `/proposta` e `/oferta`.

1. Ler o dossiê + as ofertas ATIVAS do cliente (`nucleo/ofertas.md`).
2. Montar a tabela: preço · oferta · presença · ângulos · lacuna — cliente vs cada
   concorrente.
3. Entregar pra skill que chamou (ou avulso pro dono).

## Fontes em escada (zero login — regra do CLAUDE.md)

Nunca raspar rede social atrás de login (risco real à conta). Empilha conforme o contexto:

- **Degrau 0 — o dono informa.** Quem são, preços que conhece, o que ouviu. Semente do
  dossiê; funciona sem raspar nada.
- **Degrau 1 — público sem login:**
  - **Site do concorrente** via `firecrawl-scrape`/`firecrawl-crawl`: posicionamento, preço
    (se exposto), ofertas, novidades. Guardar o capturado pra o modo Alerta comparar depois.
  - **Meta Ad Library** (`facebook.com/ads/library`, público) via firecrawl — anúncios
    ativos: estrutura, oferta, há quanto aparece. Mesma mecânica e fonte do `/ads-meta`.
- **Degrau 2 — busca aberta** via `WebSearch`: notícia, review, menção, ranking, presença.
  Pra redes sociais, só o que aparece em busca pública — nunca raspar IG/LinkedIn logado.

Se o firecrawl faltar nesta máquina (instala por `firecrawl`/skill), avisar em uma linha e
seguir com degrau 0 + WebSearch — nunca travar a skill por falta da ferramenta.

## Cegueira honesta (avisar o dono — herda do /ads-meta)

- A Ad Library de anúncio **comercial** BR não mostra gasto, alcance, impressões, CTR nem
  segmentação (só anúncio político/social mostra). O dossiê lê **estrutura, não resultado**.
- "Ativo há X" é a **data de criação** do anúncio, não de veiculação contínua (pode ter
  sido pausado e religado — a biblioteca não distingue).
- Preço só entra como fato se **exposto publicamente**; senão, é suposição do dono ou lacuna.

## O dossiê — `nucleo/concorrentes.md`

Um arquivo, vários concorrentes. Por concorrente:

```markdown
## [Nome do concorrente] — [site]
> Última observação: [data] · Degrau: [0/1/2]

- **Quem é / posicionamento:** [como se posiciona; fato ou (suposição)]
- **Preço/oferta:** [o que cobra, se exposto; senão: (suposição) ou (lacuna)]
- **Ofertas ativas:** [o que vende hoje]
- **Cadência de conteúdo:** [frequência/onde posta — pro /radar]
- **Anúncios ativos (Ad Library):** [quantos, ângulo, oferta, há quanto aparece]
- **Novidades/mudanças:** [o que apareceu desde a última observação — pro modo Alerta]
- **Ângulos que ele NÃO cobre:** [a lacuna — a oportunidade pro cliente]
```

## Regras

- **Zero login.** Só fonte pública (site, Ad Library pública, busca aberta). Nunca raspar
  rede social logada.
- **Fato vs suposição** marcado sempre; preço/dado não confirmado nunca vira fato.
- **Inspiração, não cópia.** O dossiê serve pra achar a lacuna e posicionar — nunca pra
  copiar tema, estética ou identidade do concorrente.
- **Cegueira honesta** declarada (limites da Ad Library).
- É MOTOR: nasce no template ImpulsoX-OS e desce pros clones via `/atualizar-motor`. Nunca
  instalar direto num clone. Não toca no CRM.

## Teste de aceitação (comportamental)

1. Dono dá 2 concorrentes sem mais nada → dossiê semente criado (degrau 0), resto marcado
   pendente; nada inventado como fato.
2. Concorrente com site + anúncios públicos → dossiê em degrau 1, com a cegueira honesta da
   Ad Library declarada.
3. Modo Alerta com dossiê anterior → reporta só o delta, não re-despeja tudo.
4. Modo Comparativo chamado pela `/proposta` → tabela cliente×concorrentes a partir do
   dossiê, sem re-pesquisar.
5. `/radar` rodando depois → lê a cadência/lacuna do dossiê em vez de re-pesquisar o
   concorrente do zero.

---

**✓ Pronto:** dossiê do concorrente vivo em `nucleo/concorrentes.md` (fato vs suposição, com a lacuna mapeada) · **→ próximo passo:** `/radar` — usa a lacuna do concorrente pra achar pauta que ele não cobre; ou `/proposta`/`/oferta` se o objetivo é posicionar o cliente contra eles. Esperar o "sim" do dono. Pré-requisito: ao menos o nome dos concorrentes; sem isso a skill pergunta antes de seguir.
