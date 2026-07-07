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
- `nucleo/concorrentes.md` — se existe o dossiê do `/concorrente`, os anúncios ativos do
  concorrente já estão mapeados ali; partir deles no Passo 0 e aprofundar no swipe
- `docs/formula-ads-jp.md` — fórmula de anúncio dissecada (framework "4 Elementos", checklist
  por elemento, contra-exemplo do anúncio ruim). É o molde de criativo do Passo 3.

## Pré-requisito de medição — Pixel + CAPI (sem isso o Advantage+ aprende errado)

"O Advantage+ é só tão bom quanto o dado que ele aprende." Em 2026, **só o Pixel de navegador não
basta**: iOS, bloqueadores de anúncio e o fim do cookie de terceiro comem boa parte do sinal antes
de chegar na Meta. A correção é a **Conversions API (CAPI)** — o evento sai do servidor do cliente
(não do navegador), então não é bloqueado. Pixel + CAPI juntos = o dado que o algoritmo precisa.

Tratar como pré-requisito obrigatório quando o destino é site (não "ajuste depois"):

1. **Pixel** instalado na página (o `/seo`/`/pagina` cuidam do código no site).
2. **CAPI** ligado — caminho mais simples pra PME: **Conversions API via parceiro/Gateway** (sem
   dev) ou a integração nativa da plataforma do site (Shopify, WordPress, etc.). Pra WhatsApp/lead
   sem site, o evento vem do próprio fluxo da Meta.
3. **Deduplicação** Pixel↔CAPI (mesmo `event_id`) pra não contar o mesmo lead duas vezes.
4. **Event Match Quality (EMQ) ≥ 7** — o número que o Gerenciador mostra (Eventos → cada
   evento) e que diz se o sinal está SAUDÁVEL, não só ligado. EMQ baixo = evento chega sem
   dado suficiente pra casar com usuário (faltam e-mail/telefone hasheados no payload).
   "CAPI ligado" sem EMQ é binário cego — o playbook 2026 trata EMQ como o check nº 1
   (Atria/Jetfuel, 2026). Conferir no go-live e na leitura de 30 dias.

O guia visual entrega o passo a passo de Pixel + CAPI com link do tutorial oficial da Meta. Sem
esse pré-requisito, avisar o dono em uma linha: a campanha roda, mas o Advantage+ vai otimizar com
sinal furado — é a causa nº 1 de PME que paga e não converte.

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
   - **Ângulo de descoberta extra (truque do JP, `docs/formula-ads-jp.md`):** pra achar quem
     mais roda anúncio no nicho além do concorrente óbvio — pegar um **review recente** de uma
     agência/negócio que domina o nicho → achar o **nome real do negócio** de quem avaliou
     (LinkedIn/busca) → colar esse nome na Ad Library. Revela anunciantes que o dono não
     conhecia. Só fonte pública; nunca raspar atrás de login.
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

## Passo 0.5 — Gate "casa pronta?" (antes de montar a campanha)

Tráfego pago é o último passo (CLAUDE.md). Antes de montar, conferir rápido o gate de saúde da
casa (mesmo checklist do `/carteira`): destino converte? responde lead rápido (`/velocidade`)?
tem prova social? tração orgânica? Pixel+CAPI? Se a casa está furada, avisar em uma linha — "ads
vai vazar em [item]; consertar antes rende mais" — e oferecer a ordem certa. **Não trava** (o
dono decide), mas não monta campanha fingindo que a casa está pronta quando não está.

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
- **Público — em duas fases (mesma lógica do `/ads-google`, honesto pra conta nova):**
  - **Fase 1 — EXCEÇÃO HIPERLOCAL, não default (raio < 16 km / conta nova local):** usar
    **Detailed Targeting** (segmentação manual) — interesse direto do nicho (1-3 interesses, não
    15) + região. Em raio pequeno o amplo não tem o que otimizar e o manual performa melhor.
    **Fora do hiperlocal, o consenso 2026 sob Andromeda é estrutura simples + criativo diverso
    desde cedo** (o targeting acontece no criativo, não na audiência) — não prender conta
    regional/nacional na Fase 1 por hábito.
  - **Fase 2 (depois de acumular conversão — ~50/semana):** migrar pro **Advantage+ Audience**
    (público amplo, a Meta otimiza sozinha pelo sinal de quem já converteu). Advantage+ só DEPOIS
    de ter dado, nunca como ponto de partida cego.
  - **Remarketing** (envolvidos com perfil/site, 30-60 dias) — quando a base existir, em qualquer
    fase. **É o primeiro dinheiro de ads, não o último** (método ScaleUP/Sprint jul/2026:
    "retargeting não é como você acha clientes novos — é como você PARA DE PERDER os que já
    ganhou; se o funil orgânico+e-mail não converte sem ads, ads não conserta"). Audiências por
    temperatura, cada uma com ângulo próprio: viu 50%+ de vídeo → CTA direto pra página de venda
    (já investiu minutos; precisa do fechamento, não de outro teaser) · baixou a isca → ad
    quebra-objeção · abriu e-mails sem clicar → prova + CTA duro · lookalike de COMPRADORES →
    frio, manda pro CONTEÚDO (topo), nunca direto pra venda. Regras de operação: warm em
    frequência baixa (2-4 impressões/semana), **refresh de criativo a cada 7-14 dias** (audiência
    quente satura rápido — mesma oferta, ângulo novo), verba pequena por audiência, matar o que
    estoura o CPA-alvo e escalar agressivo o que fica bem abaixo. Lookalike frio só DEPOIS do
    remarketing dar lucro.
  - Deixar a fase explícita no plano: começa controlado, migra pro automático quando tem dado.
- **3-4 conjuntos** no máximo (não fatiar demais — cada conjunto precisa de evento pra aprender).
- **Criativos:** ver Passo 3 — em 2026 o volume e o tipo de criativo importam mais que o número de
  conjuntos. O gargalo de resultado é criativo, não estrutura de público.

## Passo 3 — Criativos e textos

Acionar o **`/post`** para cada peça estática/carrossel, com a diretriz de anúncio:
gancho mais direto que o orgânico, oferta explícita, uma chamada só. Textos (primário
125 chars visíveis, título 40, descrição 30) passam pelo **`/escritor-br`**.

**Checklist "4 Elementos do Anúncio" (`docs/formula-ads-jp.md`):** todo anúncio se quebra em
quatro partes, cada uma com função distinta. Usar como régua de cada criativo:
- **Texto principal (Ad Copy):** chamar o público no topo, ANTES do corte do "ver mais"
  ("Donos de academia:"); usar "NOVO"; nível 5ª série; liderar com resultado/ROI (caso real se
  houver); vender o alívio (menos trabalho), não o recurso.
- **Criativo (imagem/vídeo):** texto NA imagem chamando o nicho em PT ("DONOS DE ACADEMIA");
  alto contraste (texto claro/fundo escuro); evitar fundo claro vibrante; copy da imagem em
  5ª série; símbolo do nicho. Diretriz pro `/post` no modo anúncio.
- **Título (Headline):** "Novo" + nicho direto + urgência no fim + "feito pra aquele mercado".
- **Descrição:** camada de prova/confiança — só prova **autorizada** (`nucleo/provas.md`);
  sem prova, reforça diferencial/novidade (nunca inventa social proof).
- **DON'T:** anúncio que serve pra qualquer nicho não serve pra nenhum (contra-exemplo no doc).
  Recurso vago → traduzir em **resultado numerável** ("Agende 20-50 atendimentos/mês"), sem
  número inventado. Ancorar na dor + no ganho (PAS).

**Volume de criativo — o gargalo nº 1 do Advantage+ (2026):** o padrão antigo de 3-4 criativos não
alimenta o algoritmo. **O porquê tem nome: Andromeda** — o motor de entrega 2026 da Meta agrupa
criativos SIMILARES em clusters (395 anúncios iguais performam como 10; Atria/Jetfuel, 2026), então
volume só conta com DIVERSIDADE real; e a fadiga de criativo caiu pra **2-3 semanas** — é a razão
da reposição semanal, não capricho. Mirar **10-15 ativos por campanha** + **3-5 novos por semana** —
o Advantage+ testa volume e a fadiga mata performance rápido. É aqui que o `/post` puxa o peso:
gerar peças em escala (variações de hook, formato e ângulo sobre a mesma oferta) é o que abastece
essa esteira. Sem reposição semanal, a conta estabiliza e o CPA sobe.

**Formato dominante — vídeo curto e UGC, não opcional:** o mix que ganha em 2026 é cerca de **30%
vídeo curto (6-15s) + 30-40% UGC/depoimento** (menor CPA), o resto estático/carrossel. UGC =
material com cara de pessoa real, não anúncio polido. **Depoimento autorizado de `nucleo/provas.md`
é UGC** — puxar de lá. O roteiro de vídeo curto conecta com o reel do `/post`. Formatos:
  - Vídeo curto 6-15s / reel (gerado/roteirizado pelo `/post`; vídeo nativo costuma ganhar)
  - UGC/depoimento autorizado (`nucleo/provas.md`, status autorizada)
  - Estático 1080x1350 e carrossel (`/post` com a marca) — base, não maioria

**Régua de diagnóstico de criativo (diz QUAL parte do vídeo corrigir):**
  - **Hook Rate** = quem assistiu 3s ÷ impressões. Alvo **> 25-35%**. Baixo = o primeiro frame não
    segura; trocar a abertura.
  - **Hold Rate** = quem chegou a 15s ÷ quem viu 3s. Alvo **> 30%**. Baixo = o hook prende mas o
    corpo perde; encurtar ou refazer o meio.
  - Levar isso pro `/analisar-ads` na leitura de 30 dias — corrige o criativo certo, não a campanha
    toda.

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
  - **Aviso no topo do guia:** a Meta unificou os fluxos do Gerenciador em fev/2026 — as telas
    podem ter mudado de lugar. Instruir o dono a **conferir cada passo contra a tela atual do
    Gerenciador de Anúncios**; os diagramas ilustram o fluxo, não são captura da versão de hoje.
- **Pixel + CAPI como pré-requisito** quando o destino é site (ver seção "Pré-requisito de
  medição" acima) — passo a passo dos dois no guia, não só do Pixel
- Arquivos dos criativos prontos na pasta
- **Quem executa:** o dono faz com o guia, ou a agência faz pelo cliente (acesso ao
  Gerenciador dele). Automação de conta de ads viola termos — o clique final é humano.
- Janela de aprendizado: não mexer por 7 dias ou ~50 eventos por conjunto; primeira
  leitura séria em 30 dias com `/analisar-ads`. O Advantage+ precisa de **~50 eventos/semana** por
  conjunto pra sair da fase de aprendizado — abaixo disso ele não estabiliza.

## Regras

- **Swipe antes de inventar:** olhar o que já ganha no nicho (Passo 0) antes de criar arte
  nova. Filtro de winner = começou há 2+ meses E ainda ativo. Copiar mecânica, nunca conteúdo.
  Meta Ad Library é pública; nunca raspar atrás de login.
- Criativo orgânico vencedor vira anúncio antes de arte nova — dado > estreia.
- Nunca prometer CPM/CPA/resultado. Leilão muda todo dia.
- Orçamento mínimo honesto BR 2026 (CPM subiu ~12%): o Advantage+ pede **~R$ 100/dia** pra juntar
  os ~50 eventos/semana e sair da fase de aprendizado. Abaixo disso, consolidar em menos conjuntos
  (ou um só) pra concentrar evento, e avisar o dono que vai aprender devagar.
- Conta de anúncio, página e pixel são do cliente — o sistema orienta, nunca pede senha.
- Remarketing respeita a LGPD: avisar sobre política de privacidade na página quando
  houver pixel.

---

**✓ Pronto:** campanha de Meta Ads + criativos da marca + guia visual de leigo · **→ próximo passo:** o **humano sobe a campanha** no Gerenciador (guia visual; anúncio nunca sobe sozinho — viola termos), depois `/analisar-ads` em ~30 dias pra medir o que converteu. Ads é esteira opcional. Pré-requisito que costuma faltar: `marca/` e uma página/destino que funcione — se faltar, o sistema reorienta (rodar `/identidade`/`/pagina` antes).
