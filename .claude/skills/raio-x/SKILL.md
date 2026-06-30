---
name: raio-x
description: >
  Use para diagnosticar a presença digital de uma empresa a partir só da URL —
  "/raio-x", "analisa o site da empresa X", "diagnóstico do meu site", "por que não
  apareço no Google?", ou como material de impacto antes de uma reunião comercial.
  Audita site, conteúdo, presença local e redes, e entrega relatório com notas e o
  plano do que consertar primeiro — a porta de entrada de venda do sistema.
  (Use esta quando quer um DIAGNÓSTICO geral da presença — tendo site ou não. Para CRIAR
  um site é o `/pagina`; para AJUSTAR uma página que já existe é o `/seo`.)
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

## Regra de ouro — verificar antes de dar nota

**Nenhuma nota sai de suposição.** Cada nota e cada vazamento precisa de uma coleta real
antes — buscar, abrir, conferir. O que não deu pra verificar de fora **não vira nota**: vira
linha "a confirmar". Misturar palpite com fato num documento de venda queima a credibilidade
da agência na primeira vez que o cliente conferir (ex.: dizer "redes fracas" e o dono abrir o
Instagram com 50 mil seguidores). Coleta primeiro, nota depois.

## O que auditar (com a URL na mão)

### 1. Site — fundação
Scraping (firecrawl) + verificação direta:
- **Clareza:** em 5 segundos dá pra saber o que a empresa vende e pra quem? A oferta
  principal está acima da dobra?
- **Conversão:** existe chamada clara (WhatsApp, telefone, formulário)? Em quantos
  cliques?
- **Técnica (Core Web Vitals reais, não "responde rápido?"):** medir os três sinais que
  o Google usa, com o limiar **2026** — **LCP ≤ 2,0s** (novo teto "good", era 2,5s antes do
  core update de mar/2026), **INP < 200ms**, **CLS < 0,1**. Mais: HTTPS, mobile, título e
  descrição de cada página principal, páginas quebradas nos links. Acima dos limiares =
  furo de Site que custa Google.
- **Conteúdo:** blog/artigos existem? Respondem perguntas reais ou são institucionais
  vazios? Dados estruturados (JSON-LD) presentes?

### 1b. Visibilidade em IA / GEO — aparece quando o cliente pergunta pra uma IA?
O comprador de 2026 pergunta no ChatGPT/Gemini/Perplexity e lê o AI Overview do Google
antes de clicar em qualquer site. Auditar:
- **Citação:** perguntar a uma IA "[serviço] em [cidade]" (ex.: "melhor dentista em
  Pinheiros") — a empresa **aparece na resposta**? Quem aparece no lugar dela? É o mesmo
  teste de vazamento da busca por intenção, agora no canal IA.
- **Crawlability pra bots de IA:** o `robots.txt` **permite** `GPTBot`, `ClaudeBot` e
  `CCBot`? (Bloquear esses bots tira a empresa do índice das IAs.) Existe `llms.txt` na
  raiz? Sem permissão de crawler, a empresa é invisível pra IA por construção — furo que
  o dono nem sabe que tem.

### 2. Presença local (quando o negócio é local)
- Perfil no Google (Maps): existe? Completo (fotos, horário, categoria certa)? Nota e
  volume de avaliações vs concorrentes próximos (WebSearch)
- Consistência: nome, endereço e telefone iguais no site e no perfil?

### 3. Redes sociais — medir, não chutar
- Quais existem (links no site / busca)?
- **Tamanho e atividade reais via WebSearch** — buscar o @perfil: seguidores, nº de posts.
  (Instagram/TikTok vivem atrás de login; firecrawl recusa e raspar login é proibido — o
  caminho legal é a WebSearch do perfil, que devolve seguidores/posts de fontes públicas.)
  Sem esse número, a nota de Redes não sai como fato — vira "a confirmar".
- A bio diz o que a empresa faz e pra onde mandar o interessado?

### 4. Busca por intenção — o teste que prova o vazamento de descoberta (OBRIGATÓRIO)
Fazer 2-3 buscas reais "serviço + cidade" como um cliente faria ("feijoada Orlando",
"dentista Pinheiros", "rodízio I-Drive"): **o auditado aparece? Quem aparece no lugar dele?**
É essa busca que transforma "acho que ele não rankeia" em fato. Uma linha por concorrente
que apareceu na frente — sem dossiê.

## Notas

Por área (Site · Conversão · Conteúdo · Local · Redes): **nota 0-10 + uma frase de
justificativa cada, com a EVIDÊNCIA coletada** (o que foi visto/buscado, não o que se
imagina). Critério: o que custa dinheiro pesa mais — site sem WhatsApp visível derruba
Conversão inteira; blog inexistente pesa menos que oferta confusa.

Âncora das notas (pra não ser arbitrário):
- **9-10** = forte de verdade, pouco a melhorar. **7-8** = bom, com lacuna pontual.
- **5-6** = mediano, dá pra dobrar. **3-4** = furo claro que custa dinheiro. **0-2** = ausente.

**Anti-viés (inegociável):** o objetivo é a verdade, não "ter o que vender". Site forte
recebe nota alta — inventar vazamento onde não há queima a credibilidade e o cliente percebe.
Se o negócio já está bem, o valor da agência aparece no que falta de IA/conversão, não em
problema fabricado. Um raio-x honesto que diz "seu site é ótimo, o vazamento é no atendimento"
vende mais que um que ataca tudo.

## Saída

`producao/raio-x/<dominio>-<YYYY-MM-DD>.md`:

```markdown
# Raio-X — [empresa] · [data]

## A leitura em uma frase
[o diagnóstico que dói e que é verdade — só com base no que foi verificado]

## Notas
| Área | Nota | Por quê (com a evidência coletada) |
|------|:---:|---------|
...
> Cada "por quê" cita o que foi VISTO/BUSCADO. O que não deu pra medir de fora não vira
> nota — entra como "a confirmar" na justificativa ou na seção final.

## Os 3 vazamentos mais caros
1. [problema → o que custa → conserto] — marcar **[verificado]** (com a evidência) ou
   **[a confirmar]** (hipótese plausível que precisa de acesso interno pra fechar)
...

> **Vazamento que quase sempre cabe — velocidade de resposta (speed-to-lead).** Chamar a
> `/velocidade` pra cravar o número: "responder lead em <5min qualifica ~21x mais; sua demora
> custa ~X leads e R$ Y/mês". É o vazamento mais concreto e o que mais fecha reunião. Sem CRM,
> roda por estimativa do dono (marcar "a confirmar"); com CRM, vira número real. É também a
> métrica de saída da Fase 1 da esteira (`docs/blueprint-esteira-crescimento.md`).

## Plano dos primeiros 30 dias
[3-5 ações em ordem, cada uma ligada a uma skill do sistema que a executa]

## O que este raio-x não vê (e o que ficou a confirmar)
[dados internos: analytics, custo real de ads, taxa de conversão — vem depois]
[+ tudo que foi marcado "a confirmar" acima: a lista honesta do que assumimos e ainda
 não medimos. Vira a pauta da reunião — gancho, não fraqueza.]
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

- Cada problema apontado tem evidência REAL e coletada (o que foi visto/buscado, onde).
  Nada de crítica vaga, nada de nota por palpite.
- **Fato vs suposição, sempre marcado.** Verificado = afirma; não-verificado = "a confirmar".
  Nunca apresentar hipótese como medição — é a régua da Escada de Contexto.
- Tom: direto sem humilhar — o dono vai ler; o objetivo é ele contratar, não se ofender.
- **Anti-viés:** não fabricar problema pra ter o que vender. Negócio bom recebe nota boa; o
  valor da agência aparece no que de fato falta (IA, conversão, descoberta).
- Não inventar dado de tráfego/posição que não dá pra ver de fora — a seção "o que este
  raio-x não vê" existe pra isso (e é gancho honesto pra próxima conversa).
- Auditar só o que é público. Nunca tentar acesso a área logada.

---

**✓ Pronto:** diagnóstico da URL com notas, os vazamentos mais caros e o plano de 30 dias · **→ próximo passo:** `/proposta` — consome este raio-x e o transforma em proposta fechável no mesmo dia. Pré-requisito é só a URL, então segue direto.
