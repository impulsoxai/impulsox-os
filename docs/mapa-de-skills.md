# Mapa de skills — como tudo se conecta

> O ImpulsoX-OS não é um monte de comandos soltos: as skills se chamam umas às outras em
> cadeias. Este mapa mostra QUEM chama QUEM, pra ninguém se perder. Cada seta é uma conexão
> real codificada nas skills. Produto da ImpulsoX AI.

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
- **/premium-design** Uso 3 = padrão premium (3 sites do nicho, marca cravada, posicionamento 10k+)

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
/ads-google · /ads-meta ──→ (cliente/agência sobe, guia visual) ──→ /analisar-ads
cria a campanha pronta        anúncio nunca sobe sozinho             mede o que converteu
   ↑                          (viola termos)                              │
   └────────────── nucleo/aprendizados.md (Tráfego pago) ←───────────────┘
```

- **/ads-meta** abre com **swipe file** (Passo 0): pesquisa anúncios vencedores no Meta Ad
  Library (winners 2+ meses ativos), disseca e grava molde em `producao/ads/swipe-meta.md` —
  é o `/formulas` dos anúncios (copiar mecânica de quem performa, nunca conteúdo)
- **/ads-*** monta a campanha + guia visual de leigo → humano sobe → **/analisar-ads** mede
  (cálculo só por script) → padrão volta pro próximo **/ads-***

---

## Inteligência competitiva (alimenta estratégia)

- **/concorrente** — mantém o dossiê vivo do concorrente do cliente (posicionamento, preço,
  ofertas, cadência, anúncios ativos, novidades, lacuna) em `nucleo/concorrentes.md`, só de
  fonte pública (site, Meta Ad Library, busca aberta). É a FONTE: `/radar` lê a lacuna de
  pauta, `/ads-meta` parte dos anúncios mapeados, `/oferta` e `/proposta` leem o comparativo.
  Opcional — entra quando o dono quer inteligência competitiva.

## Presença que não é feed (perfil + local)

- **/perfil-ig** — otimiza o perfil do Instagram (bio, destaques, nome de busca) pra
  converter quem chega. Roda no setup e quando o perfil está fraco; aponta pra /calendario.
- **/local** — Perfil de Empresa no Google (post local, responder avaliação via API oficial).
  Entra pra negócio com ponto físico/atendimento por região; aponta pra /publicar.

## Medição (três portas, fronteira clara)

- **/desempenho** — porta única de social orgânico + YouTube (alcance/save/send/retenção →
  diagnóstico acionável). É a porta padrão de "como foi?".
- **/analisar-ads** — só tráfego PAGO (CSV do Google/Meta; cálculo por script; atribuição).
- **/analisar-dados** — genérica de planilha de NEGÓCIO (CSV/XLSX/JSON além de marketing).
- **/relatorio** — consolida o que as três medem num relatório executivo pro cliente
  (topo OUTCOME: o resultado de negócio, não só métrica de vaidade).

## Skills que TODAS as outras usam (a infraestrutura invisível)

| Skill | Papel | Quem chama |
|---|---|---|
| **/escritor-br** | humaniza todo texto | post, linkedin, email, copy, ads, conteudo |
| **/revisar** | crivo sênior antes do ar | obrigatório em venda/ads pago |
| **/revisar-pagina** | olhos frios em design + copy de página pronta (régua nomeada) | publicar (gate pré-deploy de página), sob demanda |
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
| /concorrente | /radar (lacuna→pauta) ou /proposta·/oferta (posicionar) | nome dos concorrentes |
| /repurpose | /calendario (peças jogadas no mês) | fonte longa, núcleo |
| /post · /linkedin · /conteudo | /revisar | marca/, voz, provas |
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
| /relatorio | /calendario (próximo ciclo) | métricas de /desempenho, /analisar-ads |
| /analisar-dados | conforme o dado pedir | CSV/XLSX/JSON do negócio |
| /tema-yt | /roteiro-yt | criadores-monitorados, pilares |
| /roteiro-yt | /gravar-tela → /editar-video | **voz-canal.md, fórmula** |
| /slides | /gravar-tela | **marca/ (senão: rodar /identidade antes)** |
| /gravar-tela | /editar-video | — (só a gravação crua) |
| /editar-video | /shorts → /publicar | final.mp4, whisper |
| /shorts | /publicar | palavras.json |
| /desempenho (YouTube) | /tema-yt (próximo vídeo) | métricas/publicação |
| /ads-google · /ads-meta | (humano sobe) → /analisar-ads em 30d | **marca/, página de destino** |
| /analisar-ads | /ads-* (nova campanha) | exports CSV |
| /criar-ebook | /email (sequência) ou /pagina (captura) | núcleo, marca |
| /lancar-produto | /pagina · /email · /ads-* (orquestra) | oferta, marca |

Pré-requisito em **negrito** = o que mais trava na prática; quando falta, o sistema oferece
fazer o que falta primeiro OU seguir com defaults marcados "a confirmar".

## A regra que amarra tudo

Cada skill **lê o núcleo + a marca antes de produzir**, e marca **fato vs suposição**
(Escada de Contexto). A marca é sempre a do cliente; a fonte de verdade são os arquivos
(`nucleo/`, `marca/`), nunca a memória de uma sessão. Melhoria de motor nasce no template e
desce pros clones via **/atualizar-motor** — trabalho de marketing fica no clone.
