# Mapa de skills — como tudo se conecta

> O ImpulsoX-OS não é um monte de comandos soltos: as skills se chamam umas às outras em
> cadeias. Este mapa mostra QUEM chama QUEM, pra ninguém se perder. Cada seta é uma conexão
> real codificada nas skills. Produto da ImpulsoX AI.
>
> **Visão de produto (a esteira completa em 4 fases):** `docs/blueprint-esteira-crescimento.md`
> — como as skills se ordenam pra levar um negócio local de "leads parados" a "tráfego pago que
> converte" (casa → dinheiro que já existe → demanda orgânica → ads). Este mapa é o QUEM-CHAMA-QUEM;
> o blueprint é a ORDEM e o PORQUÊ.

---

## A esteira de VENDA (do prospect ao contrato)

```
/oferta ──→ /raio-x ──→ /proposta ──→ /cliente ──→ (produção)
constrói a   diagnóstico   fecha o      pluga o
oferta forte da URL        negócio      cliente
   │             │             │
   │             │             └─→ /email (follow-up da proposta)
   └→ /pagina    └─→ /copy (mini-redesign da abertura, no raio-x)
```

- **/oferta** constrói/diagnostica a oferta (Equação de Valor + anatomia de 6 partes) →
  grava em `nucleo/ofertas.md` → vira a base de tudo que vende. Roda ANTES da /proposta
  e da /pagina: oferta fraca com copy boa converte devagar
- **/raio-x** diagnostica a URL → vira a matéria-prima da **/proposta**
- **/proposta** lê o raio-x + `nucleo/provas.md` + a oferta → proposta fechável → **/email**
- **/cliente** cria a pasta do cliente → tudo passa a rodar lá dentro

---

## A esteira de IDENTIDADE VISUAL (a base de tudo que é visual)

```
/identidade ──→ DESTILA ──→ marca/design-guide.md + tokens.css ──→ (todas as skills visuais leem)
   │                              [a marca vira LEI]
   ├─ Open Design (cria a base ao vivo; liga sozinho na porta 7456)
   ├─ mood board de escolha (cliente leigo escolhe a cor/clima vendo)
   └─ já tem marca? extrai + propõe evolução lado a lado
```

- **/identidade** é o gerente da marca: cria (Open Design + mood board) ou extrai+eleva →
  **DESTILA** nos 2 arquivos → **toda skill visual** (post, página, anúncio, e-mail) lê deles
- O refino premium NÃO acontece aqui — vem depois, no **/pagina**

---

## A esteira de PÁGINA premium (o produto de R$ 10k+)

```
/pagina ──┬─ etapa COPY ──→ /copy ──→ /escritor-br
          ├─ etapa CONSTRUÇÃO (lê marca/tokens.css)
          ├─ etapa 3.5 PREMIUM ──→ /premium-design (Uso 3)
          │                          │
          │                          ├─ 3 melhores sites do NICHO (cliente escolhe o estilo)
          │                          └─ re-estiliza no nível deles + marca CRAVADA
          ├─ etapa VERIFICAÇÃO (Playwright 390/768/1440)
          └─ depois: /seo (Schema/GEO) antes de publicar
```

- **/pagina** orquestra: copy (**/copy**+**/escritor-br**) → constrói na marca → **/premium-design**
  põe o nível agência → verifica visual → **/seo** fecha a achabilidade
- **/premium-design** Uso 3 = padrão premium (3 sites do nicho, marca cravada, posicionamento 10k+);
  Uso 4 = captura dirigida pelo dono ("faz essa animação igual", cola URL). Camada de movimento
  lê o catálogo `docs/craft-movimento.md` (9 efeitos cinematográficos, quando usar, de onde capturar).

---

## A esteira de CONTEÚDO orgânico (o ciclo que se fecha)

```
/radar ──→ /calendario ──→ /post · /linkedin · /conteudo ──→ /revisar ──→ /publicar ──→ /desempenho
ideias     decide o quê     produzem as peças                crivo        ao ar          mede
embasadas  e quando         (leem marca + voz + provas)       sênior                        │
   ↑                                                                                        │
   └──────────────── nucleo/aprendizados.md ←─── o que funcionou volta pro próximo ciclo ───┘
```

- **/radar** pesquisa → **/calendario** decide → skills de produção executam (cada uma lê
  `marca/`, `nucleo/voz.md`, `nucleo/provas.md`) → **/revisar** (olhos frios) → **/publicar**
- **/desempenho** mede → destila em `aprendizados.md` → alimenta o próximo **/calendario**
- **/pulso** (diário, irmão do /radar): varre as fontes de `nucleo/fontes.md` (últimas
  24-48h), filtra pela lente do negócio e alimenta o **banco de ideias vivo**
  (`producao/ideias/banco.md`). Ideia QUENTE → `/post`/`/linkedin` na hora (newsjacking);
  EVERGREEN → o `/calendario` colhe. O `/abrir` sugere o pulso quando o dia ainda não
  rodou. Fronteira: `/radar` = foto do MÊS (5 camadas); `/pulso` = o que tem validade
  de 48h. Hooks das peças saem de `docs/hooks.md` (acervo de mecânicas, validado pelo
  /desempenho)
- **/repurpose** (opcional, entre /radar e /calendario): 1 fonte longa (vídeo, artigo,
  newsletter) vira uma semana de peças nativas (IG, LinkedIn, Reel/TikTok) via as skills
  donas, graduadas pelo /revisar e jogadas no /calendario. Oferecido quando o dono tem
  material denso pra reaproveitar; não empurrado.
- Todo texto passa pelo **/escritor-br** (humaniza); toda peça de venda pelo **/revisar**
- **Reel: dois caminhos distintos.** **/post** faz reel com rosto/cena REAL por IA (Fal).
  **/reel-marca** faz reel de MOTION GRAPHICS por código (Remotion): texto animado + produto/
  serviço real do cliente em mockup (carrossel, página, antes/depois, depoimento), na marca e
  voz dele, com estrutura de retenção comprovada. Opcional — oferecido quando o dono quer vídeo
  de marca; serve qualquer nicho. Lê o núcleo do cliente; o motor desce do template.
- **Sequência do /reel-marca** (de onde entra, pra onde sai):

  ```
  (precisa antes) /identidade → /post ou /pagina   ← marca + peça real pra mostrar
                          │
                          ▼
                    /reel-marca ──→ /revisar ──→ /publicar ──→ /desempenho
                    (motion graphics)  (olhos frios)            (mede save/send,
                                                                 realimenta o próximo)
  ```
  Pré-requisito mínimo: `marca/` (tema do reel) + alguma peça real em `producao/`. Sem isso, a
  Escada de Contexto reorienta (faz `/identidade`/`/post` antes). Fecha o loop no `/desempenho`.

---

## A esteira de YOUTUBE (o canal, ciclo completo)

```
/tema-yt ──→ /roteiro-yt ──→ /gravar-tela ──→ /editar-video ──→ /shorts ──→ /publicar ──→ /desempenho
escolhe     escreve com      tela+voz        corta+áudio       longo→      YouTube       mede retenção
tema real   a fórmula        +webcam         +karaokê          N shorts    (privado)     valida fórmula
(4 fontes)  (Sabrina/Chase/                                                                │
            Jonathan)                                                                      │
   ↑                                                                                       │
   └───────────────── formulas-video.md ←─── fórmula validada ganha prioridade ───────────┘
```

- **/tema-yt** (demanda real) → **/roteiro-yt** (copia fórmula de quem performa + classifica o
  vídeo por funil topo/meio/fundo e ajusta hook/CTA/prova) → **/gravar-tela** → editar →
  shorts → publicar → **/desempenho** (porta única YT+IG; retenção valida a fórmula) → realimenta
  _(`/desempenho-yt` é só um redirect pra `/desempenho` — não chamar direto)_
- **/thumbnail** (consultor de CTR: Four C's + crivo de nota) é chamada pela **/editar-video**
  (capa do vídeo longo) e roda **avulsa** (capa pra vídeo de fora; repacote quando o CTR cai).
  O **/roteiro-yt** projeta o conceito; a **/thumbnail** gera e pontua. Capa decide o clique
- **/slides** (opcional, eixo vídeo) — deck de apresentação premium na marca pra rodar no PC
  durante a gravação: slides em tela cheia, produto real em mockup, slides-ponte pra demo ao vivo
  no Claude Code e notas do apresentador. Entra avulsa ou depois de `/roteiro-yt`·/tema-yt; sai
  pro `/gravar-tela`. Distinta do `/reel-marca` (vídeo que toca sozinho) — aqui o dono navega ao vivo.

---

## A esteira de ADS (cria → mede → corrige)

```
/ads-google · /ads-meta ──→ /revisar ──→ (cliente/agência sobe, guia visual) ──→ /analisar-ads
cria a campanha pronta       OBRIGATÓRIO   anúncio nunca sobe sozinho             mede o que converteu
   ↑                         (ads pago)    (viola termos)                              │
   └──────────────── nucleo/aprendizados.md (Tráfego pago) ←───────────────────────────┘
                     (o /ads-* LÊ antes de montar; o /analisar-ads escreve)
```

- **/ads-meta** abre com **swipe file** (Passo 0): pesquisa anúncios vencedores no Meta Ad
  Library (winners 2+ meses ativos), disseca e grava molde em `producao/ads/swipe-meta.md` —
  é o `/formulas` dos anúncios (copiar mecânica de quem performa, nunca conteúdo)
- **/ads-*** monta a campanha + guia visual de leigo → humano sobe → **/analisar-ads** mede
  (cálculo só por script) → padrão volta pro próximo **/ads-***
- **Criativo do `/ads-meta`** lê o framework "4 Elementos" (Ad Copy/Creative/Headline/Description)
  de `docs/formula-ads-jp.md` — checklist por elemento + contra-exemplo do anúncio ruim
- **TRÁFEGO PAGO É O ÚLTIMO PASSO** (tese do `docs/formula-ads-jp.md`): antes de ads, arrumar a
  casa — reativar a base (`/reativar`), juntar review compliant (`/local`+`/depoimento`), ligar
  o orgânico (`/radar`→`/calendario`). Lead pago vaza em negócio que não responde. Ordem na
  Conduta do CLAUDE.md.

---

## Eixo lead → dinheiro (integração com o ImpulsoX CRM v3)

O CRM é dono do lead/venda/receita; o OS fala com ele pela `scripts/lib-crm.mjs` (service
token `ixk_live_` por tenant, no `.env` do clone). As skills:

- **/leads** — ponte do lead pro CRM (Contact) + lê status do funil. Não recria captura.
- **/velocidade** — speed-to-lead: calcula (por `lib-velocidade`, nunca de cabeça) quantos leads
  e R$ o negócio perde por responder devagar, e o ganho de responder em <5min. Roda por
  estimativa (prospect novo) ou dado real do CRM (timestamps). Chamada pelo `/raio-x` e
  `/proposta` como argumento de abertura; é a métrica de saída da Fase 1 da esteira.
- **/treinar-vendas** — Pilar 5 da esteira: gera script de vendas (diagnóstico), faz role-play
  (IA banca o cliente que rebate) e pontua call real por rubrica nomeada (Descoberta/Valor/
  Objeção/Fechamento). Calibra nas objeções reais do CRM (deals perdidos). Persuasão honesta.
- **/roi** — gasto de ads × receita real do CRM → faturamento influenciado, CAC, ROI
  (cálculo por `lib-roi`). Alimenta o /relatorio.
- **/carteira** — modo agência: lê o CRM de cada cliente (1 token por tenant) → visão de
  carteira (receita, leads, saúde, o que fazer hoje). O cockpit pra escalar N clientes.
- **/reativar** — segmenta inativos no CRM + escreve win-back na voz da marca (SEMPRE com
  oferta/gancho), por e-mail ou WhatsApp; o CRM/agente dispara pela régua de follow-up. Modo
  serviço-cliente-final reativa a base do cliente do cliente (Pilar 1 de `docs/formula-ads-jp.md`).
- **/depoimento** — gatilho de timing: vê deal ganho no CRM (poll; webhook é fase 2) →
  aciona o pedido de prova do /provas no pós-resultado. Modo serviço: review compliant pros
  clientes do cliente (Pilar 2; operação no Google é da `/local`; sem gating/incentivo ao cliente).
- **/agente-ia** — o lead que o chat da página captura entra no CRM (via /api/chat → Contact).

Pendente no CRM (não bloqueia o básico): UTM no Contact (atribuição por campanha) e webhook
(depoimento em tempo real). Ver `docs/prd-integracao-crm.md`.

## Inteligência competitiva (alimenta estratégia)

- **/concorrente** — mantém o dossiê vivo do concorrente do cliente (posicionamento, preço,
  ofertas, cadência, anúncios ativos, novidades, lacuna) em `nucleo/concorrentes.md`, só de
  fonte pública (site, Meta Ad Library, busca aberta). É a FONTE: `/radar` lê a lacuna de
  pauta, `/ads-meta` parte dos anúncios mapeados, `/oferta` e `/proposta` leem o comparativo.
  Opcional — entra quando o dono quer inteligência competitiva.

## Apoio — infraestrutura de pesquisa

- **/pesquisa-web** — camada de execução opcional pra fonte pública/gratuita (GitHub, RSS,
  YouTube, V2EX, Bilibili, busca semântica), via ferramenta de terceiro `agent-reach` quando
  instalada na máquina. Não expande a regra de zero-login: canais que exigem cookie (Twitter,
  Reddit completo, Instagram, Facebook, 小红书) ficam desligados, nunca em conta de cliente.
  Chamada por `/radar`, `/pulso`, `/concorrente`; sem ela, essas skills seguem com
  WebSearch/WebFetch/yt-dlp direto — nunca trava.

## Presença que não é feed (perfil + local)

- **/perfil-ig** — otimiza o perfil do Instagram (bio, destaques, nome de busca) pra
  converter quem chega. Roda no setup e quando o perfil está fraco; aponta pra /calendario.
- **/local** — Perfil de Empresa no Google (post local, responder avaliação via API oficial).
  Entra pra negócio com ponto físico/atendimento por região; aponta pra /publicar.
- **/review-engine** — motor de Google Review em esteira: monta a sequência de 3 mensagens
  (check-in → pedido → lembrete) na voz da marca + reativação da base + plano de resposta, e o
  roteiro de provisionamento pra plugar no CRM+agente WhatsApp. Vende em 3 tiers (básico sem
  Hermes → resposta IA → Hermes gerente). A `/local` cuida do PERFIL e responde as reviews;
  esta cuida do FLUXO que gera o volume. Motor roda sem Hermes (Tier 1). Opcional — entra
  quando o negócio quer review automático. Arquitetura em `docs/prd-motor-review-engine.md`.

## Medição (três portas, fronteira clara)

- **/desempenho** — porta única de social orgânico + YouTube (alcance/save/send/retenção →
  diagnóstico acionável). É a porta padrão de "como foi?".
- **/analisar-ads** — só tráfego PAGO (CSV do Google/Meta; cálculo por script; atribuição).
- **/analisar-dados** — genérica de planilha de NEGÓCIO (CSV/XLSX/JSON além de marketing).
- **/roi** — cruza o gasto de mídia (do /analisar-ads) com a receita real do CRM (via
  `lib-crm`: reports/deals/invoices) → faturamento influenciado, CAC, ROI. Dinheiro só por
  script (`lib-roi`). É o topo OUTCOME que o /relatorio usa. Precisa de `CRM_TOKEN` no `.env`.
- **/relatorio** — consolida o que as três medem num relatório executivo pro cliente
  (topo OUTCOME: o resultado de negócio, não só métrica de vaidade); puxa o ROI do /roi.

## Skills que TODAS as outras usam (a infraestrutura invisível)

| Skill | Papel | Quem chama |
|---|---|---|
| **/escritor-br** | humaniza todo texto | post, linkedin, email, copy, ads, conteudo |
| **/revisar** | crivo sênior antes do ar | obrigatório em venda/ads pago |
| **/revisar-pagina** | olhos frios em design + copy de página pronta (régua nomeada) | publicar (gate pré-deploy de página), sob demanda |
| **/detectar-ia** | termômetro de cara-de-IA (índice relativo, aponta trechos p/ afiar) | antes de publicar artigo/página/post longo; sob demanda |
| **/provas** | banco de prova real | copy, post, pagina, proposta, ads, relatorio |
| **/oferta** | constrói/diagnostica a oferta (Equação de Valor) | antes de proposta, pagina, lancar-produto |
| **/formulas** | moldes de post que funcionam | post, linkedin, repurpose |
| **/premium-design** | DNA visual + nível agência | identidade, pagina |
| **/copy** | engine de copy de conversão (4 camadas) | pagina, raio-x (mini-redesign) |
| **/geo** | mede/estrategia citação por IA (par do /seo: /geo decide, /seo marca) | sob demanda, depois do /seo |

## Skills de SISTEMA (operam o motor, não produzem peça)

- **/abrir** (começa a sessão) · **/salvar** (backup GitHub) · **/painel** (dashboard ao vivo)
- **/plugar** (1º setup) · **/atualizar** (revisa o núcleo) · **/atualizar-motor** (puxa
  melhorias do template pros clones) · **/automatizar** (rotina repetida → skill nova)
- **/cliente** (cria a casa do cliente, modo agência) · **/intake** (onboarding operacional
  do contrato: acessos por convite, KPI, aprovação, escopo → `nucleo/intake.md`)
- **/voz** (entrevista de voz → nucleo/voz.md)

---

## Fluxo PRINCIPAL × OPCIONAIS (o que o sistema guia por padrão)

Nem toda esteira entra no fluxo padrão. O sistema guia **todo cliente** pelo essencial e só
oferece os add-ons quando o dono pede.

```
FLUXO PRINCIPAL (o guia conduz por aqui, em ordem):
   1. DESIGN/IDENTIDADE → identidade (marca) → página premium    [a base de tudo]
   2. CONTEÚDO AUTOMÁTICO → radar → calendário → post · linkedin → revisar → publicar → desempenho
      (Instagram, Facebook, LinkedIn — a presença que roda sempre)

OPCIONAIS (o guia NÃO empurra; só entram quando o dono pede explicitamente):
   • YouTube  ⚠️ EM TESTE/BETA — funciona, mas não oferecer a cliente como serviço pronto
              até a Vivian validar (tema-yt → roteiro → editar → shorts → upload → desempenho-yt)
   • Apresentação/slides  (/slides → /gravar-tela)  — deck premium pra gravar vídeo
   • Dashboard de cliente (/dashboard) — painel de KPIs reutilizável, ticket alto; entra
     quando o cliente tem dados e precisa enxergá-los
   • Automação de cliente (/automacao-cliente) — script em agenda vendido como assinatura
     (setup + mensalidade); upsell natural de quem já tem /dashboard
   • Google Ads     (ads-google → analisar-ads)
   • Meta/FB Ads    (ads-meta → analisar-ads)
   • ChatGPT Ads    (impulsox-chatgpt-ads)
   • Produto/lançamento (criar-ebook, lancar-produto, email)
```

Regra do guia: ao terminar uma skill do **fluxo principal**, apontar o próximo passo
principal. Os **opcionais** o guia menciona uma vez ("se o cliente quiser ads/YouTube, é só
pedir") mas nunca empurra como próximo passo automático. O dono ativa o opcional quando há
contrato pra aquilo.

## Tabela de fluxo guiado (o sistema usa pra apontar o próximo passo)

> Cada skill, ao terminar, sugere o **próximo** daqui e pergunta se quer seguir (regra no
> CLAUDE.md). O **pré-requisito** é o que ela precisa; se faltar, o sistema se acha e
> reorienta. Não é trilho fixo — o dono pode pular, e o sistema se reposiciona.

| Terminou | Próximo passo natural | Pré-requisito (se falta, reorienta) |
|---|---|---|
| /oferta | /proposta (serviço/B2B) ou /copy → /pagina (vender em página) | negocio, ofertas |
| /raio-x | /proposta | — (só a URL) |
| /proposta | /cliente (se fechou) ou /email (follow-up) | nucleo/provas, ofertas |
| /cliente | /intake → /identidade | — |
| /intake | /identidade | cliente criado (/cliente) |
| /identidade | /voz (se voz rasa) → depois /calendario ou /pagina | núcleo lido |
| /voz | /calendario ou produção | — |
| /calendario | /post · /linkedin · /conteudo (peça a peça) | radar do mês, núcleo |
| /radar | /calendario (ou /repurpose, se há fonte longa pra reaproveitar) | núcleo |
| /pulso | ideia QUENTE → /post·/linkedin agora; EVERGREEN → /calendario | núcleo; sem fontes.md, a 1ª rodada monta |
| /concorrente | /radar (lacuna→pauta) ou /proposta·/oferta (posicionar) | nome dos concorrentes |
| /repurpose | /calendario (peças jogadas no mês) | fonte longa, núcleo |
| /post · /linkedin · /conteudo | /revisar (artigo/página: /detectar-ia antes) | marca/, voz, provas |
| /detectar-ia | /escritor-br (afia os trechos que pesam) → re-roda | texto pronto num arquivo |
| /revisar | /publicar (se aprovada) | a peça pronta |
| /publicar | /desempenho (no fim do mês) | publicacoes.md |
| /desempenho | /calendario (próximo ciclo) | métricas |
| /pagina | /seo → /publicar (add-on: /agente-ia) | **marca/ (senão: rodar /identidade antes)** |
| /agente-ia | /publicar (chat liga com o /api/chat do CRM) | página pronta + núcleo |
| /copy | /escritor-br → volta pro /pagina | voz |
| /seo | /geo (mede citação por IA) → /publicar | a página pronta |
| /geo | /publicar (ou plano de citação) | a página/site no ar |
| /perfil-ig | /calendario | perfil atual ou print |
| /local | /publicar | Perfil de Empresa no Google |
| /review-engine | /local (mantém perfil + responde); provisionamento liga o disparo | nome do dono/serviços (`nucleo/negocio.md`); motor auto espera CRM+WhatsApp+`gbp.mjs` |
| /relatorio | /calendario (próximo ciclo) | métricas de /desempenho, /analisar-ads |
| /analisar-dados | conforme o dado pedir | CSV/XLSX/JSON do negócio |
| /roi | /relatorio | CRM_TOKEN no .env + gasto do /analisar-ads |
| /leads | /roi (cruza) ou /relatorio | CRM_TOKEN no .env |
| /velocidade | /raio-x ou /proposta (vira argumento) | leads/mês + tempo de resposta (CRM ou estimativa) |
| /treinar-vendas | (time treina) → medir fechamento no CRM | oferta ATIVA; CRM calibra (objeções reais) |
| /carteira | /abrir no cliente que pede ação, ou /relatorio | modo agência + CRM_TOKEN por cliente |
| /reativar | (CRM dispara) → /roi mede depois | CRM_TOKEN (ou segmento manual) |
| /depoimento | /provas (formata e guarda) | CRM_TOKEN (ou dono diz quem fechou) |
| /tema-yt | /roteiro-yt | criadores-monitorados, pilares |
| /roteiro-yt | /revisar (roteiro+pacote, antes de gravar) → /gravar-tela → /editar-video | **voz-canal.md, fórmula** |
| /slides | /gravar-tela | **marca/ (senão: /identidade antes) · docs/pitch-narrado.md** |
| /gravar-tela | /editar-video | — (só a gravação crua) |
| /editar-video | /shorts → /publicar | final.mp4, whisper |
| /shorts | /publicar | palavras.json |
| /desempenho (YouTube) | /tema-yt (próximo vídeo) | métricas/publicação |
| /ads-google · /ads-meta | /revisar (obrigatório) → (humano sobe) → /analisar-ads em 30d | **marca/, página de destino** |
| /analisar-ads | /ads-* (nova campanha) | exports CSV |
| /criar-ebook | /email (sequência) ou /pagina (captura) | núcleo, marca |
| /dashboard | oferta de manutenção mensal (no vídeo de entrega) → registrar em ofertas.md | **marca/ (senão defaults) · dados do cliente só na etapa 7 (mock antes)** |
| /automacao-cliente | mensalidade em ofertas.md + CRM; logs na 1ª semana | **triagem de viabilidade (da /automatizar) · credenciais em .env · blindagem de erro no PRD** |
| /lancar-produto | /pagina · /email · /ads-* (orquestra) | oferta, marca |

Pré-requisito em **negrito** = o que mais trava na prática; quando falta, o sistema oferece
fazer o que falta primeiro OU seguir com defaults marcados "a confirmar".

## A regra que amarra tudo

Cada skill **lê o núcleo + a marca antes de produzir**, e marca **fato vs suposição**
(Escada de Contexto). A marca é sempre a do cliente; a fonte de verdade são os arquivos
(`nucleo/`, `marca/`), nunca a memória de uma sessão. Melhoria de motor nasce no template e
desce pros clones via **/atualizar-motor** — trabalho de marketing fica no clone.
