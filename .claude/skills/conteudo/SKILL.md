---
name: conteudo
description: >
  Use quando um tema deve virar o pacote completo de conteúdo — "/conteudo", "transforma
  esse tema em conteúdo", "artigo + posts sobre X", "conteúdo completo do tema", ou ao
  executar uma linha do calendário que pede blog + redes. Orquestra: artigo pro site,
  carrossel via /post, post de LinkedIn via /linkedin — tudo amarrado num tema só.
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

- `nucleo/negocio.md`, `nucleo/voz.md`, `nucleo/foco.md`
- `producao/calendario/<mes>.md` — se o tema veio de lá
- `producao/artigos/` — não repetir artigo existente

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
caracteres, data, palavra-chave, `rascunho: true` — o usuário aprova antes de ir pro site).

Estrutura que funciona pra leitor E pra máquina de busca (clássica ou IA):

1. **Resposta primeiro.** O primeiro parágrafo responde a pergunta central de forma
   completa em 2-4 frases. Quem só lê isso já sai servido — e é esse trecho que uma IA
   ou um featured snippet cita.
2. **Desenvolvimento por subtítulos H2** — cada um respondendo uma sub-pergunta real,
   com dado, exemplo ou passo prático. Sem encheção pra inflar contagem de palavra.
3. **Onde a empresa entra** — conexão natural com o serviço, sem virar panfleto.
4. **FAQ final (3-5 perguntas)** — perguntas reais com respostas diretas de 2-4 frases.
5. **Chamada** — próximo passo concreto (WhatsApp, orçamento, contato).

Junto do artigo, gerar o bloco de dados estruturados (JSON-LD: `Article` + `FAQPage`)
num arquivo ao lado, pronto pra colar no site. Não anunciar isso como "estratégia GEO" —
é simplesmente como artigo bem feito se escreve em 2026. As regras de Schema/GEO (que
tipos, como marcar, robots pra IA) são do `/seo`, a autoridade única — quando o artigo
vai pro site, passar pelo `/seo` evita divergência de marcação.

**Texto passa pelo `/escritor-br`** antes de fechar.

## Passo 3 — Derivar as peças

- **Instagram:** extrair do artigo o recorte mais visual (os passos, o dado mais forte,
  o contraste) e acionar o **`/post`** com tema e intenção definidos. A legenda fecha
  apontando: "guia completo no site/link da bio".
- **LinkedIn:** extrair o recorte de opinião/experiência (não o resumo do artigo — o
  ponto de vista por trás dele) e acionar o **`/linkedin`**. Link do artigo vai no
  primeiro comentário.

Derivar é reescrever pro canal, nunca copiar trecho. Os três conteúdos se reforçam, não
se repetem.

## Passo 4 — Entregar o pacote

```
✓ Artigo: producao/artigos/<slug>.md (rascunho — aprovar antes de subir)
✓ Dados estruturados: <slug>.jsonld
✓ Instagram: producao/posts/<data>-<slug>/ (PNGs + legenda)
✓ LinkedIn: producao/linkedin/<data>-<slug>.md
→ Aprovou tudo? /publicar sobe o que for automatizável.
```

Atualizar Status no calendário.

## Regras

- Artigo afirma só o que a empresa pode sustentar; dado de terceiro tem fonte nomeada.
- Sem palavra-chave socada artificialmente — densidade natural, o assunto se repete
  porque o texto é sobre ele.
- Um tema por pacote. Tema gordo demais → dividir em dois no calendário.
- Site ainda não existe? Gerar o artigo mesmo assim (fica pronto) e avisar que a skill
  de página (Fase premium) resolve a casa dele.
