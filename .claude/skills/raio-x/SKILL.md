---
name: raio-x
description: >
  Use para diagnosticar a presença digital de uma empresa a partir só da URL —
  "/raio-x", "analisa o site da empresa X", "diagnóstico do meu site", "por que não
  apareço no Google?", ou como material de impacto antes de uma reunião comercial.
  Audita site, conteúdo, presença local e redes, e entrega relatório com notas e o
  plano do que consertar primeiro — a porta de entrada de venda do sistema.
---

# /raio-x — Diagnóstico da presença digital

Recebe uma URL, devolve um relatório que o dono do negócio entende em 5 minutos: notas
por área, os 3 problemas mais caros e o que fazer primeiro. É a peça que abre reunião
comercial — mostra valor antes de pedir contrato.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau de contexto

Roda no degrau 1 (só a URL). Tudo que extrair aqui alimenta a escada — se a empresa
virar cliente, o `/cliente` aproveita a extração inteira.

É uma skill do modo `agencia` (ver `nucleo/perfil.md`): faz sentido quando o negócio
vende marketing como serviço e diagnostica um prospect. Negócio próprio dos outros perfis
não costuma rodar `/raio-x` em si mesmo — usa `/desempenho` pra olhar pra dentro.

## O que auditar (com a URL na mão)

### 1. Site — fundação
Scraping (firecrawl) + verificação direta:
- **Clareza:** em 5 segundos dá pra saber o que a empresa vende e pra quem? A oferta
  principal está acima da dobra?
- **Conversão:** existe chamada clara (WhatsApp, telefone, formulário)? Em quantos
  cliques?
- **Técnica:** título e descrição de cada página principal; site responde rápido?
  funciona no celular? HTTPS? Páginas quebradas nos links principais?
- **Conteúdo:** blog/artigos existem? Respondem perguntas reais ou são institucionais
  vazios? Dados estruturados (JSON-LD) presentes?

### 2. Presença local (quando o negócio é local)
- Perfil no Google (Maps): existe? Completo (fotos, horário, categoria certa)? Nota e
  volume de avaliações vs concorrentes próximos (WebSearch)
- Consistência: nome, endereço e telefone iguais no site e no perfil?

### 3. Redes sociais
- Quais existem (links no site / busca)? Frequência das últimas publicações? A bio diz
  o que a empresa faz e pra onde mandar o interessado?

### 4. Concorrência (rápida)
- 2-3 buscas pelo serviço + cidade: quem aparece na frente? O que eles têm que o
  auditado não tem? (uma linha por concorrente, sem dossiê)

## Notas

Por área (Site · Conversão · Conteúdo · Local · Redes): **nota 0-10 + uma frase de
justificativa cada**. Critério: o que custa dinheiro pesa mais — site sem WhatsApp
visível derruba Conversão inteira; blog inexistente pesa menos que oferta confusa.

## Saída

`producao/raio-x/<dominio>-<YYYY-MM-DD>.md`:

```markdown
# Raio-X — [empresa] · [data]

## A leitura em uma frase
[o diagnóstico que dói e que é verdade]

## Notas
| Área | Nota | Por quê |
|------|:---:|---------|
...

## Os 3 vazamentos mais caros
1. [problema → o que custa → conserto]
...

## Plano dos primeiros 30 dias
[3-5 ações em ordem, cada uma ligada a uma skill do sistema que a executa]

## O que este raio-x não vê
[dados internos: analytics, custo real de ads, taxa de conversão — vem depois]
```

Quando for material de reunião, gerar também a versão apresentável (PDF via skill de
PDF, com a marca da agência) — 2 páginas no máximo; relatório de 20 páginas ninguém lê.

Prospect demonstrou interesse depois do diagnóstico? O passo seguinte é a `/proposta` —
ela consome este relatório e transforma os problemas apontados em proposta comercial
fechável, no mesmo dia.

## Mini-redesign (opcional — a prova de valor da reunião)

Diagnóstico aponta o problema; o mini-redesign **mostra a solução**. Reescreve e
re-renderiza só a **abertura (dobra inicial)** do site auditado num "antes → depois" —
a peça que faz o prospect ver, não imaginar, o que a ImpulsoX entrega. Gerar quando o
raio-x vai pra reunião comercial; pular num diagnóstico só técnico.

Escopo firme: **só a abertura**, nunca a página inteira. Página completa é o `/pagina`,
depois de fechar o contrato — o mini-redesign é a amostra, não a entrega.

1. **Copy da abertura** — rodar o `/copy` pra reescrever promessa/headline/subtítulo/CTA
   da dobra, a partir do que o scraping extraiu (oferta, público). Degrau 1 (só a URL):
   sem `voz.md` do prospect, escrever em tom premium neutro e marcar "confirmar voz".
   A copy passa pelo `/escritor-br` antes de renderizar (mesmo gate do `/copy`).
2. **Render antes → depois** — capturar a abertura ATUAL do site (Playwright, screenshot
   da dobra) e montar a abertura NOVA em HTML/CSS premium (sem a marca da agência — é o
   site do prospect; usar cor/logo extraídos do próprio site quando houver, defaults
   premium quando não). Renderizar a versão nova em **390px e 1440px**.
3. **Entrega** — em `producao/raio-x/<dominio>-redesign/`: as capturas antes/depois e o
   HTML da abertura nova. Na reunião, a imagem lado a lado vale mais que o relatório.

Honestidade obrigatória: rotular como **demonstração da abertura**, não página pronta.
Nada de prova inventada na copy — sem depoimento real, a abertura não exibe número/caso.

## Regras

- Cada problema apontado tem evidência (o que foi visto, onde). Nada de crítica vaga.
- Tom: direto sem humilhar — o dono vai ler; o objetivo é ele contratar, não se ofender.
- Não inventar dado de tráfego/posição que não dá pra ver de fora — a seção "o que este
  raio-x não vê" existe pra isso (e é gancho honesto pra próxima conversa).
- Auditar só o que é público. Nunca tentar acesso a área logada.
