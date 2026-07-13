---
name: conteudo
description: >
  Use quando você JÁ SABE o tema e quer TUDO dele de uma vez — "/conteudo", "transforma
  esse tema em conteúdo", "artigo + posts sobre X", "conteúdo completo do tema", ou ao
  executar uma linha do calendário que pede blog + redes. Orquestra: artigo pro site,
  carrossel via /post, post de LinkedIn via /linkedin — tudo amarrado num tema só.
  (Quer só UM post? é o `/post`. Quer explodir uma FONTE LONGA já pronta (vídeo, artigo) em
  vários formatos? é o `/repurpose`. Esta aqui parte de UM tema e monta o pacote dele.)
---

# /conteudo — Um tema, o pacote inteiro

Skill orquestradora. Recebe um tema e entrega o conjunto: artigo pro site + peça de
Instagram + post de LinkedIn, todos apontando um pro outro. Uma pesquisa, três saídas —
o jeito mais barato de manter presença em todos os canais.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Precisa do **degrau 1** (negócio e voz). Abaixo, pergunta o mínimo e marca o pacote
como rascunho a confirmar.

## O que ler antes

- `docs/gabarito-execucao-texto.md` — **PRIMEIRO**: gates de qualidade do texto (2 passes de copy, proibições por busca literal, gate específico desta skill no §6, aceite). Nenhum gate é opcional
- `nucleo/negocio.md`, `nucleo/voz.md`, `nucleo/foco.md`
- `docs/hooks.md` — título do artigo e abertura de cada peça nascem com 2-3 variações de
  hook de mecânicas diferentes (regra da casa)
- `producao/calendario/<mes>.md` — se o tema veio de lá
- `producao/artigos/` — não repetir artigo existente
- `dados/` — transcrição de vídeo do dono, quando a entrada for repurposing (ver abaixo)

## Entrada por vídeo (repurposing)

O tema não precisa nascer em branco: um vídeo de 10 minutos do dono já tem artigo,
carrossel e LinkedIn dentro. Quando a entrada é um vídeo:

- **Transcrição na mão** (arquivo do usuário em `dados/`) → ler e tratar a fala como a
  matéria-prima do pacote: a voz já está ali, o conteúdo já está ali.
- **Só o link** → se o `yt-dlp` estiver instalado na máquina, baixar a legenda/transcrição
  automática; se não estiver, pedir a transcrição ao usuário (ditado do WhatsApp, Otter,
  Whisper) — nunca inventar o que o vídeo disse. (Ferramenta nova entra no `docs/ferramentas.md`
  quando o clone a adotar.)

A fala do dono é a melhor fonte de voz que existe — preferir as palavras dele às "bonitas".
Daí segue o fluxo normal: fechar o ângulo (Passo 1) a partir do que o vídeo entregou.
`/radar` lista os vídeos existentes do cliente como fonte de pauta (camada 5).

## Passo 1 — Fechar o ângulo

Tema sem ângulo é commodity. Antes de escrever, definir:
- **Pergunta real** que o cliente do negócio faz sobre esse tema (a que ele digitaria
  numa busca ou perguntaria a uma IA)
- **Resposta da marca** em uma frase — a posição que diferencia este artigo dos dez
  primeiros resultados que já existem
- Se há site/concorrência mapeada, espiar rapidamente como o tema já foi tratado
  (WebSearch) pra fugir do óbvio

## Passo 2 — Artigo (800-1.500 palavras)

Salvar em `producao/artigos/<slug>.md` com frontmatter (título, descrição de 150-160
caracteres, data, **palavra-chave**, `rascunho: true` — o usuário aprova antes de ir pro
site, e **`id: BLOG-<AAAA>-S<semana>-<seq>`** — o asset ID que o `/desempenho` usa pra
casar tráfego/conversão com a peça; as peças derivadas do pacote herdam a semana/seq nos
seus próprios IDs de canal). A palavra-chave do artigo é a **âncora cross-canal**: a mesma keyword vira a keyword
das 2 primeiras linhas da legenda do `/post` e o cluster do `/linkedin` (ver Passo 3). Um
tema, uma keyword, todos os canais reforçando o mesmo termo — é o que faz o pacote inteiro
empurrar a mesma busca em vez de competir consigo mesmo.

Estrutura que funciona pra leitor E pra máquina de busca (clássica ou IA):

1. **Resposta primeiro.** O primeiro parágrafo responde a pergunta central de forma
   completa em 2-4 frases. Quem só lê isso já sai servido — e é esse trecho que uma IA
   ou um featured snippet cita.
2. **Desenvolvimento por subtítulos H2** — cada um respondendo uma sub-pergunta real,
   com dado, exemplo ou passo prático. Sem encheção pra inflar contagem de palavra.
3. **Onde a empresa entra** — conexão natural com o serviço, sem virar panfleto.
4. **Quem assina (E-E-A-T)** — o artigo tem AUTOR nomeado (o dono/especialista, com a
   credencial em 1 linha) e pelo menos **1 marca de experiência vivida** no corpo
   ("atendemos N [clientes do nicho] e o padrão que vemos é X" — puxar de
   `nucleo/negocio.md`/`provas.md`, nunca inventar). É o sinal que Google e os motores de
   IA usam pra decidir QUEM citar; artigo órfão de autor compete só por keyword.
5. **FAQ final (3-5 perguntas)** — perguntas reais com respostas diretas de 2-4 frases.
6. **Chamada** — próximo passo concreto (WhatsApp, orçamento, contato).

Junto do artigo, gerar o bloco de dados estruturados (JSON-LD: `Article` + `FAQPage`)
num arquivo ao lado, pronto pra colar no site. Não anunciar isso como "estratégia GEO" —
é simplesmente como artigo bem feito se escreve em 2026. As regras de Schema/GEO (que
tipos, como marcar, robots pra IA) são do `/seo`, a autoridade única — quando o artigo
vai pro site, passar pelo `/seo` evita divergência de marcação.

**Texto passa pelo `/escritor-br`** antes de fechar.

## Passo 3 — Multiplicar a saída (1 pillar → N peças)

O artigo é a **peça-mãe (pillar)**: dentro de um artigo de 800-1.500 palavras moram
**10-15 peças sociais + 3-5 reels/shorts + um e-mail**. Não derivar só "1 IG + 1 LinkedIn" —
isso joga fora 80% do que o tema rende e mantém a economia da esteira cara. Cada subtítulo
H2, cada dado, cada passo, cada FAQ é matéria-prima de uma peça. Derivar é reescrever pro
canal, nunca copiar trecho — as peças se reforçam, não se repetem.

**O que sai de um pillar:**

- **Instagram (carrossel/post):** os recortes mais visuais (os passos, o dado mais forte,
  o contraste, cada H2 vira um ângulo) → acionar o **`/post`** com tema e intenção. A
  **keyword do artigo entra nas 2 primeiras linhas da legenda** (cross-canal). A legenda
  fecha apontando: "guia completo no site/link da bio".
- **Reel/Short (peça de descoberta):** o reel é o que chega a quem não te segue — todo pillar
  deriva 1-3 reels. Extrair o gancho mais forte (o dado que choca, o erro comum, o "antes/
  depois") e acionar **`/post reel`** (reel b-roll) ou **`/reel-marca`** quando o tema pede a
  cara da marca. É a peça que traz público novo pro resto do pacote.
- **LinkedIn:** o recorte de opinião/experiência (não o resumo do artigo — o ponto de vista
  por trás dele) → acionar o **`/linkedin`**, **amarrando o post ao cluster** de
  `nucleo/foco.md` (a keyword do artigo é o tema do cluster). Link do artigo no 1º comentário.
- **E-mail:** o artigo vira um e-mail (resumo + o link) pra base — acionar o **`/email`** quando
  houver lista. Fecha o ciclo: quem já é cliente recebe o conteúdo direto.

**Cross-canal é a regra:** a keyword do artigo é a mesma keyword da legenda IG e o mesmo
cluster do LinkedIn. Um termo, todos os canais — o pacote inteiro empurra a mesma busca.

**Trava de qualidade > volume.** Multiplicar é tirar tudo que o tema DÁ, não inflar o que ele
não tem. **3 peças fortes valem mais que 10 mornas.** Se o artigo só sustenta 4 ângulos
verdadeiros, entregar 4 — e dizer ao usuário "esse tema rende 4 peças fortes; forçar 12 sairia
morno". Tema gordo rende muitas peças naturalmente; tema magro, poucas. Recusar inflar é regra,
não exceção.

## Passo 4 — Entregar o pacote

```
✓ Artigo (pillar): producao/artigos/<slug>.md (rascunho — aprovar antes de subir)
✓ Dados estruturados: <slug>.jsonld
✓ Instagram: producao/posts/<data>-<slug>/ (N peças — PNGs + legenda)
✓ Reel/Short: producao/posts/<data>-<slug>/ (peça de descoberta)
✓ LinkedIn: producao/linkedin/<data>-<slug>.md (no cluster de foco)
✓ E-mail: producao/emails/<tipo>-<slug>/ (formato do /email — pasta única, não espalhar)
→ keyword única em todos · Aprovou tudo? /publicar sobe o que for automatizável.
```

O número de peças é o que o tema sustenta com força (Passo 3), não um número fixo.

Atualizar Status no calendário.

## Regras

- Artigo afirma só o que a empresa pode sustentar; dado de terceiro tem fonte nomeada.
- Sem palavra-chave socada artificialmente — densidade natural, o assunto se repete
  porque o texto é sobre ele.
- Um tema por pacote. Tema gordo demais → dividir em dois no calendário.
- **Qualidade > volume, sempre.** O número de peças derivadas é o que o tema sustenta com
  força — nunca um alvo a bater. 3 fortes > 10 mornas; recusar inflar quando o tema não dá.
- Keyword única atravessa o pacote (artigo = legenda IG = cluster LinkedIn). Não trocar o
  termo de canal pra canal — dilui a busca.
- Site ainda não existe? Gerar o artigo mesmo assim (fica pronto) e avisar que a skill
  de página (Fase premium) resolve a casa dele.

---

**✓ Pronto:** pacote de conteúdo (artigo + Instagram + LinkedIn) amarrado num tema · **→ próximo passo:** `/revisar` — crivo sênior de olhos frios antes de qualquer peça ir ao ar. Pré-requisito: `marca/`, voz e provas; se faltar, o sistema reorienta.
