---
name: ads-meta
description: >
  Use para criar campanha de Meta Ads (Instagram + Facebook) do zero — "/ads-meta",
  "quero anunciar no Instagram", "campanha no Facebook", "impulsionar de verdade".
  Monta a campanha completa (objetivo, públicos, criativos com a identidade da marca,
  orçamento) como plano de configuração passo a passo para o Gerenciador de Anúncios,
  com os criativos prontos gerados pelo /post.
---

# /ads-meta — Campanha de Meta Ads com criativo da marca

Meta Ads vive e morre pelo criativo. Esta skill monta a estrutura E produz os criativos
(via `/post`, com a identidade de `marca/`) — a parte que o dono do negócio não
conseguiria fazer sozinho no Gerenciador.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Precisa do **degrau 1** pra estrutura; os criativos pedem **degrau 2** (marca). Sem
marca, gera o plano e marca os criativos como defaults até a `/identidade` rodar.

## O que ler antes

- `nucleo/negocio.md`, `nucleo/foco.md`, `marca/design-guide.md`
- `nucleo/ofertas.md` — **cada oferta de prioridade alta é um conjunto de anúncios
  candidato** (a objeção da oferta vira ângulo de criativo)
- `nucleo/provas.md` — o criativo de prova só usa material com status autorizada
- `producao/ads/analise-*.md` — se existe análise, partir das sugestões dela
- `producao/posts/` — criativos orgânicos que performaram são candidatos a anúncio
- `producao/ads/swipe-meta.md` — banco de anúncios vencedores já dissecados (Passo 0); se
  existe e está fresco (<30 dias), partir dele em vez de pesquisar de novo

## Passo 0 — Swipe file: o que JÁ está ganhando no nicho (research antes de criar)

Criativo feito no vácuo queima orçamento. Antes de inventar arte, olhar o que o **mercado já
validou**: anúncios do nicho que rodam há meses e seguem ativos — o anunciante ainda paga por
eles porque convertem. É o mesmo princípio do `/formulas` (copiar a mecânica de quem
performa, nunca o conteúdo), aplicado a anúncio. Conduta do CLAUDE.md.

**Fonte: Meta Ad Library — pública, sem login** (`facebook.com/ads/library`). Respeita a
regra de nunca raspar atrás de login. Raspar via firecrawl (skill `firecrawl-scrape`/`-search`)
a página de resultados do nicho/concorrente.

1. **Termo de busca:** o nicho do negócio (ou um concorrente nomeado pelo dono). Perguntar se
   não estiver claro. País = Brasil (`countries=BR`); `active_status=active`.
2. **Filtro de winner (a sacada — com a ressalva honesta):** ficar com anúncio que **começou
   há 60+ dias E ainda aparece ativo**. Começou cedo + ainda no ar = **forte candidato** a
   winner (o anunciante segue pagando), **não garantia**. Dado de mercado: só ~11% dos
   anúncios passam de 60 dias — quem sobrevive a isso já se separou da maioria. Anúncio recente
   (semanas) ainda não provou nada; descartar.
   - **O que a biblioteca NÃO comprova:** a Ad Library mostra a **data de início**, mas não a
     duração contínua — o anúncio pode ter sido **pausado e religado** (a biblioteca não
     distingue), e "data de início" é a de criação, não de veiculação ininterrupta. Logo:
     tratar como sinal forte, nunca como "rodou X dias sem parar". Registrar no swipe a **data
     da observação** (o que é winner hoje pode ser campanha velha religada) pra reavaliar depois.
   **Cegueira da biblioteca (avisar o dono):** pra anúncio comercial BR, a Ad Library **não
   mostra gasto, alcance, impressões, CTR nem segmentação** (esses campos só aparecem em
   anúncio político/social). O swipe lê **estrutura, não resultado numérico** — "está há muito
   tempo no ar" é o único proxy de performance disponível. Não prometer ao dono métrica que a
   biblioteca não dá.
3. **Teardown de cada winner** (3-6 melhores), o que dá pra ver na biblioteca:
   - **Hook** — os primeiros 3 segundos / a primeira linha do texto primário (onde a
     persuasão vive). Em vídeo, a cena de abertura; em estático, a manchete.
   - **Estrutura** — PAS? história? demonstração? lista? antes/depois?
   - **Oferta + CTA** — o que promete e qual a chamada única.
   - **Ângulo de gatilho** — qual gatilho domina (prova, aversão à perda, curiosidade…).
   - Vídeo: descrever o **hook/abertura** + o que a thumbnail e a legenda revelam. A
     pré-visualização nem sempre dá os frames internos do MP4 sem reproduzir — não prometer
     leitura cena a cena. Não baixar criativo de terceiro: é teardown, não cópia.
4. **Gravar o banco** em `producao/ads/swipe-meta.md`: tabela dos winners (anunciante · data da
   observação · há quanto aparece ativo · hook · estrutura · oferta/CTA · ângulo) + os 2-3
   **padrões recorrentes**. Só chamar de "padrão do nicho" o que aparece em **anunciantes
   distintos** (≥3) — 2 anúncios do mesmo concorrente é estilo dele, não padrão do nicho. Os
   padrões viram os **moldes** dos criativos do Passo 3.

**Se o scrape voltar vazio:** a Ad Library carrega por scroll infinito/JS — um `firecrawl-scrape`
simples pode não pegar os resultados. Nesse caso, tentar `firecrawl-interact` (rolar a página) ou
cair pra leitura manual guiada (o dono abre a biblioteca e cola o que vê). Não tratar "scrape
vazio" como "nicho sem winners" — pode ser falha técnica do scrape, não ausência de anúncio.

Régua: o swipe é **mecânica, nunca conteúdo**. Copiar a estrutura/hook-pattern/formato —
jamais a frase, a arte, a marca ou a oferta do concorrente. Frase e identidade são sempre do
cliente. Sem firecrawl disponível ou biblioteca vazia pro nicho → avisar em uma linha e seguir
com os ângulos de persuasão do Passo 3 (não travar a campanha).

## Passo 1 — Fundamentos (perguntar só o que falta)

1. **Objetivo real:** mensagem no WhatsApp? lead? venda no site? visita ao perfil?
   (Traduzir para o objetivo de campanha certo — quem não sabe marketing escolhe
   "engajamento" e queima dinheiro.)
2. **Orçamento mensal** confortável pra 60-90 dias.
3. **Região e público base:** quem compra, idade aproximada, onde mora.
4. **Destino:** WhatsApp, formulário, site? Conferir que existe e funciona.

## Passo 2 — Estrutura

Padrão enxuto (PME aprende mais rápido com menos campanhas):
- **1 campanha** pelo objetivo definido (vendas/leads/tráfego — CBO ligado)
- **2-3 conjuntos de anúncio:**
  - Público amplo na região (a entrega da Meta otimiza sozinha — confiar no algoritmo
    com criativo segmentando por mensagem)
  - Interesse direto do nicho (1-3 interesses, não 15)
  - Remarketing (envolvidos com perfil/site, 30-60 dias) — quando a base existir
- **3-4 criativos por conjunto**, formatos misturados:
  - Estático 1080x1350 (gerado pelo `/post` com a marca)
  - Carrossel quando a oferta tem etapas ou portfólio
  - Roteiro de vídeo curto (o usuário grava; vídeo nativo costuma ganhar)

## Passo 3 — Criativos e textos

Acionar o **`/post`** para cada peça estática/carrossel, com a diretriz de anúncio:
gancho mais direto que o orgânico, oferta explícita, uma chamada só. Textos (primário
125 chars visíveis, título 40, descrição 30) passam pelo **`/escritor-br`**.

**Molde do swipe (Passo 0):** quando o banco `swipe-meta.md` tem padrões recorrentes, usá-los
como esqueleto dos criativos (formato, estrutura de hook, ritmo) — mecânica testada no nicho,
preenchida com a oferta e a marca do cliente. Molde transfere; frase e arte são do dono.

**Persuasão por criativo** (ver `docs/persuasao.md`): cada criativo do conjunto carrega
**um ângulo de gatilho diferente** — é isso que "variação real" significa:
- um de **prova/transformação** (caso real, antes/depois com material verdadeiro)
- um de **aversão à perda** (o custo de continuar como está, nomeado sem terrorismo)
- um de **curiosidade** (loop aberto no gancho que o próprio criativo fecha)
- a oferta com **escassez só quando real** (turma com data, agenda com limite)

Texto primário em PAS quando é anúncio frio: a dor como o público descreve →
o custo de conviver com ela → a saída com chamada única. As 125 chars visíveis têm que
segurar sozinhas — o "ver mais" é o corte. Remarketing inverte: já conhecem a marca,
abrir direto na oferta com prova.

Regras de criativo que evitam reprovação e fadiga:
- Sem promessa de resultado garantido, sem "você" acusatório em tema sensível (políticas
  da Meta), sem antes/depois enganoso
- Escassez inventada além de antiética é risco de conta: a Meta pune urgência falsa
  como prática enganosa
- Variação real entre criativos (ângulos diferentes, não a mesma arte em 4 cores)

## Passo 4 — Plano de configuração

Meta Ads não tem importação tipo Editor pra PME — entregar o **guia visual de leigo**
(`producao/ads/meta-<slug>-<YYYY-MM-DD>.html` + PDF, na marca de quem assina) com:
- Tabela campanha → conjuntos → anúncios (nomes padronizados: `[objetivo]-[publico]-[data]`)
- **Passo a passo no Gerenciador, em ordem de tela e sem jargão**, cada passo com:
  - **Diagrama/mockup desenhado** da tela e do que clicar (HTML/CSS — NÃO screenshot real;
    rotular como ilustração do fluxo, não captura).
  - **Link do tutorial OFICIAL da Meta** (Central de Ajuda / Meta Blueprint) pra aquele
    passo — sempre atualizado, nunca desatualiza.
- Pixel/API de conversões como pré-requisito quando o destino é site
- Arquivos dos criativos prontos na pasta
- **Quem executa:** o dono faz com o guia, ou a agência faz pelo cliente (acesso ao
  Gerenciador dele). Automação de conta de ads viola termos — o clique final é humano.
- Janela de aprendizado: não mexer por 7 dias ou ~50 conversões por conjunto; primeira
  leitura séria em 30 dias com `/analisar-ads`

## Regras

- **Swipe antes de inventar:** olhar o que já ganha no nicho (Passo 0) antes de criar arte
  nova. Filtro de winner = começou há 2+ meses E ainda ativo. Copiar mecânica, nunca conteúdo.
  Meta Ad Library é pública; nunca raspar atrás de login.
- Criativo orgânico vencedor vira anúncio antes de arte nova — dado > estreia.
- Nunca prometer CPM/CPA/resultado. Leilão muda todo dia.
- Orçamento mínimo honesto: abaixo de ~R$ 20/dia por conjunto, consolidar conjuntos.
- Conta de anúncio, página e pixel são do cliente — o sistema orienta, nunca pede senha.
- Remarketing respeita a LGPD: avisar sobre política de privacidade na página quando
  houver pixel.

---

**✓ Pronto:** campanha de Meta Ads + criativos da marca + guia visual de leigo · **→ próximo passo:** o **humano sobe a campanha** no Gerenciador (guia visual; anúncio nunca sobe sozinho — viola termos), depois `/analisar-ads` em ~30 dias pra medir o que converteu. Ads é esteira opcional. Pré-requisito que costuma faltar: `marca/` e uma página/destino que funcione — se faltar, o sistema reorienta (rodar `/identidade`/`/pagina` antes).
