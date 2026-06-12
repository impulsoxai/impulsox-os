---
name: radar
description: >
  Use quando o sistema precisa de IDEIAS de conteúdo embasadas em pesquisa real — "/radar",
  "ideias de post", "o que postar esse mês", "pesquisa o nicho", "o que os concorrentes
  estão fazendo", "tô sem pauta", ou quando o `/calendario` não encontra um radar do mês.
  Pesquisa em cinco camadas (nicho, busca social, concorrentes, sazonalidade, demanda
  interna) e devolve 15-20 ideias pontuadas em `producao/radar/<AAAA-MM>.md`. É a matéria-
  prima do calendário — decide o que MERECE virar pauta, não inventa do nada.
---

# /radar — Pesquisa de ideias de conteúdo

Calendário sem pesquisa é chute bem-intencionado. Esta skill vai à rua (web + dados do
negócio) e volta com pautas que têm demanda real: o que o público pergunta, o que o setor
mexeu, o que o concorrente cobriu (e o que deixou de fora), que data comercial está
chegando. Cada ideia nasce com a palavra-chave que responde — porque o Instagram também
é busca, e legenda otimizada para descoberta rende muito além do feed.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda do **degrau 1** — precisa ao menos do negócio/nicho definido no núcleo. Abaixo disso,
perguntar "o que você vende e pra quem?" e marcar o radar inteiro como rascunho. Com núcleo
e ofertas preenchidos (degrau 3+), as ideias saem amarradas à prioridade comercial.

## O que ler antes

- `nucleo/negocio.md` — o que vende, pra quem, diferencial (define o nicho da busca)
- `nucleo/ofertas.md` — cada ideia nasce ligada a uma oferta; prioridade comercial pesa
- `nucleo/perfil.md` — o tipo de negócio molda a fonte (criador puxa tema/autoridade; PME
  local puxa "[serviço] em [cidade]" e datas regionais)
- `nucleo/aprendizados.md` — o que a medição já provou que funciona aqui (não redescobrir)
- `producao/radar/` — radar anterior: não repetir ideia já usada, fechar lacunas que ficaram

## Workflow — 5 camadas de pesquisa

A pesquisa é via **WebSearch/WebFetch** (consultas em pt-BR, sempre com o ano corrente).
Cada camada alimenta a lista de ideias; nenhuma inventa dado.

### 1. Nicho — o que mudou no setor
Notícias, mudanças de regra, lançamentos e tendências recentes do segmento do negócio.
Buscar em pt-BR com o ano. O que é novidade vira pauta de autoridade ("o que muda com X").

### 2. Busca social — as perguntas reais do público
As dúvidas que as pessoas digitam: "Pessoas também perguntam" (PAA) do Google, fóruns,
Reddit, comentários. **Cada ideia nasce com a palavra-chave que ela responde** — o
Instagram funciona como motor de busca; legendas e títulos otimizados para descoberta
alcançam quem procura aquilo.

### 3. Concorrentes — o que cobriram e o que deixaram de fora
Olhar os 2-3 concorrentes mapeados (no núcleo, ou perguntar quais são). Registrar os
ângulos que eles **NÃO** cobriram — a lacuna é a melhor oportunidade. Conteúdo de
concorrente é inspiração de ângulo, nunca cópia.

### 4. Sazonalidade — as datas dos próximos 60 dias
Datas comerciais brasileiras dos próximos 60 dias relevantes ao nicho. Se o MCP
`brazil-mcp-server` estiver disponível, usar a tool de feriados/datas; senão, WebSearch.
Cruzar com a sazonalidade declarada em `nucleo/ofertas.md`.

### 5. Demanda interna — as dúvidas que já chegaram
Se houver export ou relato de perguntas de clientes (ex.: log do agente de WhatsApp em
`dados/`), cada dúvida recorrente vira **ideia validada** — alguém já perguntou. Vídeos
existentes do cliente (transcrições em `dados/`) também são fonte: cada bloco de um vídeo
do dono é uma pauta candidata (repurposing — ver `/conteudo`).

## Saída — `producao/radar/<AAAA-MM>.md`

15-20 ideias. Cada uma com:

- **Título de trabalho** — a pauta em uma linha
- **Oferta relacionada** — qual item de `nucleo/ofertas.md` ela serve (ou "topo de funil")
- **Palavra-chave** — o termo de busca que a ideia responde
- **Formato sugerido** — carrossel · reel · artigo · LinkedIn
- **Pontuação 1-5** em três eixos: **relevância** (cabe no negócio) × **demanda** (gente
  procura) × **lacuna** (concorrente não cobriu) — somar para ranquear
- **Fato / suposição** — marcado: a busca confirmou (fato) ou é palpite a validar

Cabeçalho do arquivo: mês, camadas que rodaram e quais ficaram sem dado (ex.: "sem export
de WhatsApp este mês").

## Regras

- **Nunca inventar dado de pesquisa.** Camada sem resultado → dizer que ficou vazia, não
  preencher com suposição disfarçada de fato.
- Ideia de concorrente é inspiração de **ângulo**, nunca cópia de pauta ou de texto.
- O `/calendario` **lê** o radar, mas a decisão final do mix é dele (prioridade comercial,
  perfil, aprendizados). O radar propõe; o calendário dispõe.
- Palavra-chave em toda ideia — sem termo de busca, a ideia não entra (descoberta é metade
  do alcance).
- Radar é do mês: um arquivo por `<AAAA-MM>`, sem sobrescrever os anteriores (viram histórico).

## Teste de aceitação (comportamental)

1. Núcleo preenchido → `/radar` devolve 15-20 ideias pontuadas, cada uma com oferta e
   palavra-chave; as camadas sem dado aparecem marcadas, não inventadas.
2. `/calendario` sem radar do mês → oferece rodar `/radar` antes de montar o plano.
3. Concorrente citado → o radar registra a lacuna dele, nunca copia a pauta.
4. MCP de feriados indisponível → a camada 4 cai pra WebSearch e segue, sem travar.
