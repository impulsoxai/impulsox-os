# Radar de tema de vídeo — /tema-yt (passo 0) — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-17 · Autoria: ImpulsoX AI.
> Antecede a Fase 1 do canal: escolher O TEMA antes de roteirizar.

## Problema

Hoje o `/roteiro-yt` começa com um tema que o dono dá. Mas tema bom não se inventa — vem de
**demanda real**: o que está em alta em IA/Claude Code e o que os criadores de sucesso
(Sabrina/Chase/Jonathan) estão falando agora. Sem esse passo, o canal arrisca roteirizar tema
morto. Esta skill é o passo 0: pesquisa, pontua e ranqueia temas reais, e entrega o melhor pro
`/roteiro-yt`. Princípio do CLAUDE.md: copiar a fórmula de quem performa — inclui o que eles
escolhem falar.

## Escopo

- **No escopo:** coletar temas de 4 fontes (vídeos recentes dos criadores via RSS/yt-dlp;
  busca web de tendências IA/Claude Code; tópicos repetidos entre 3+ criadores; lacunas que a
  IA detecta); pontuar por sinais determinísticos; a IA reordena o topo com julgamento; entregar
  lista ranqueada com por quê + ângulo pro canal + fórmula sugerida; gravar em
  `canal-youtube/temas/<AAAA-MM>.md`. Skill `/tema-yt`, acoplada ao `/roteiro-yt` (passo 0).
- **Fora (fases próprias):** raspar redes atrás de login (nunca); Google Trends API; agendar a
  coleta; gerar o roteiro (isso é o `/roteiro-yt`); temas de post (isso é o `/radar`).

## Decisões (do brainstorming)

1. **4 fontes:** (a) vídeos recentes dos criadores monitorados (RSS + yt-dlp pra views/título);
   (b) WebSearch de tendências IA/Claude Code (lançamentos/features novas); (c) tópicos
   repetidos entre 3+ criadores (sinal forte de demanda); (d) lacunas (tema com demanda que
   ninguém cobriu bem — a IA detecta, não é determinístico).
2. **Score determinístico + a IA reordena o topo.** Script pontua e lista; a IA revisa o top e
   ajusta a ordem com julgamento (relevância pro canal, fadiga do tema, potencial de hook) antes
   de mostrar ao dono. Híbrido: base transparente + camada de inteligência.
3. **Skill própria `/tema-yt`** (não estender o `/radar`, que é de post; nem o
   `checar-criadores-yt.mjs`, que é radar de FORMATO/dissecção, não de TEMA).
4. **Saída rica:** lista ranqueada de 5-10 temas, cada um com: por que (fonte + sinal), ângulo
   sugerido pro canal, e qual fórmula (Sabrina/Chase/Jonathan em `formulas-video.md`) casa.
5. **Reuso:** `lib-youtube.mjs` (RSS, `classificarRelevancia` por pilar), yt-dlp (já instalado,
   usado na pesquisa da Sabrina pra views reais).

## Arquitetura

### 1. `scripts/lib-tema-yt.mjs` (novo — funções puras, ZERO deps, testáveis sem rede)

- `extrairTema(titulo)` → tópico-núcleo normalizado do título (minúsculas, sem stopwords de
  embalagem tipo "how to", "the", números soltos; mantém o assunto: "claude code memory",
  "faceless video"...). Heurística simples, determinística.
- `agruparTemasRepetidos(itens)` → recebe `[{tema, criador, dias, pilar, views}]`, junta os
  temas iguais, devolve `[{tema, nCriadores, diasMin, pilar, viewsMax}]` (nCriadores = quantos
  criadores distintos tocaram).
- `pontuarTema({ nCriadores, diasDesde, alinhaPilar, views })` → número. Peso: recorrência
  (`nCriadores * 3`) + recência (`max(0, 14 - diasDesde)`) + pilar (`alinhaPilar ? 5 : 0`) +
  views normalizada (`min(5, views/50000)`). Transparente.
- `dedup(temas)` → remove duplicata textual simples (mesmo `tema` após normalização).

### 2. `scripts/coletar-temas-yt.mjs` (novo — orquestrador, SÓ LEITURA)

- Lê `canal-youtube/criadores-monitorados.md` (`lerCriadores` da `lib-youtube.mjs`) e
  `canal-youtube/pilares.md` (`lerPilares`).
- Por criador: yt-dlp `--flat-playlist --print "%(id)s|%(title)s"` nos vídeos recentes (já
  usado na pesquisa Sabrina); pega título + (quando barato) views via `--print %(view_count)s`.
- `extrairTema` em cada título → `classificarRelevancia` (pilar) → monta os itens →
  `agruparTemasRepetidos` → `pontuarTema` → ordena por score → `dedup`.
- Grava os candidatos em `canal-youtube/temas/<AAAA-MM>.md` (matéria-prima ranqueada).
- Saída JSON: `[{tema, score, nCriadores, diasMin, pilar, viewsMax}]`. Não decide nada sozinho;
  a skill faz o refino com a IA.
- yt-dlp ausente ou YouTube bloqueando → segue com o que conseguir, avisa (não trava).

### 3. Skill `/tema-yt` (nova)

- Fluxo:
  1. Rodar `coletar-temas-yt.mjs` → candidatos dos criadores (fontes a, c).
  2. **WebSearch** de tendências IA/Claude Code recentes (fonte b: lançamentos, features novas).
  3. A IA cruza tudo, **detecta lacunas** (fonte d), **reordena o topo** com julgamento
     (relevância, fadiga, potencial de hook), descarta tema repetido/morto.
  4. Entregar 5-10 temas ranqueados, cada um: **tema · por que (fonte + sinal) · ângulo pro
     canal · fórmula sugerida** (cruza `canal-youtube/formulas-video.md`).
  5. O dono escolhe um → vira o input do `/roteiro-yt`.
- Gravar a lista final em `canal-youtube/temas/<AAAA-MM>.md`.
- Nunca raspar rede atrás de login (régua do `/formulas`). Só RSS/yt-dlp público + web aberta.

### 4. `/roteiro-yt` ganha Passo 0

- No início do `/roteiro-yt`, antes de "Ler os moldes": **"Tema definido?"** Se o tema não veio
  do dono nem de um item escolhido em `canal-youtube/temas/<mês>.md`, sugerir rodar `/tema-yt`
  primeiro. Tema escolhido pelo radar carrega a fórmula sugerida pro Passo 1.

## Dados / fluxo

`criadores-monitorados.md` → `coletar-temas-yt.mjs` (RSS/yt-dlp views) + WebSearch (tendências)
→ score determinístico → a IA reordena + lacunas → `canal-youtube/temas/<mês>.md` (lista
ranqueada) → dono escolhe → `/roteiro-yt` (Passo 0 consome).

## Tratamento de erro (PT-BR, acionável)

YouTube bloqueia RSS/yt-dlp (anti-bot) → segue com o que coletar + WebSearch, avisa · yt-dlp
ausente → guia de instalação · `criadores-monitorados.md` só com exemplos/sem Channel ID válido
→ só WebSearch + aviso pra preencher (`resolver-canal-yt.mjs`) · nenhum tema com score relevante
→ avisar e sugerir um tema perene do nicho · WebSearch indisponível → usar só os criadores.

## Testes

- **Funções puras (sem rede, fixtures):** `extrairTema` (remove embalagem, mantém assunto);
  `agruparTemasRepetidos` (conta criadores distintos, junta iguais); `pontuarTema` (cada peso:
  recorrência, recência, pilar, views; soma esperada); `dedup` (remove duplicata normalizada).
- **Orquestrador:** só-leitura, mockar saída do yt-dlp; nenhum teste roda yt-dlp nem rede.

## Critério de pronto

- `coletar-temas-yt.mjs` devolve temas ranqueados dos criadores (score determinístico),
  gravando em `canal-youtube/temas/<mês>.md`. Só-leitura.
- `lib-tema-yt.mjs` coberto por testes de função pura.
- Skill `/tema-yt` cruza as 4 fontes, reordena o topo com a IA, entrega lista ranqueada com
  por quê + ângulo + fórmula, e o dono escolhe o tema.
- `/roteiro-yt` tem Passo 0 (tema definido? senão `/tema-yt`).
- Erros em PT; nunca raspa login; testes verdes sem rede.

## Fora de escopo (YAGNI)

- Google Trends / APIs pagas de tendência.
- Coleta agendada automática (sob demanda).
- Raspar redes atrás de login.
- Geração do roteiro (é o `/roteiro-yt`).
- Temas de post/Instagram (é o `/radar`).
