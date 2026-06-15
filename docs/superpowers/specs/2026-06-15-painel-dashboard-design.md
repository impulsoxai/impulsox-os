# Painel ImpulsoX-OS — status board vivo (Fase 1) — design

> Spec de melhoria do motor ImpulsoX-OS. Nasce no template; desce pros clones via
> `/atualizar-motor`. Data: 2026-06-15 · Autoria: ImpulsoX AI.

## Problema

O sistema produz marketing (núcleo, calendário, peças, publicações, aprendizados) mas não
tem um lugar único pra **ver o sistema operacional rodando**. Hoje o estado está espalhado
em arquivos `.md` e pastas de `producao/`. Falta um painel que leia tudo e mostre, num
relance: em que degrau o negócio está, qual o foco, o que foi produzido e publicado, e o
que está pendente.

## Modelo de entrega (quem usa, e onde)

O ImpulsoX-OS é vendido como pacote: a ImpulsoX faz a landing page e opera o marketing por
~1 mês, e **depois entrega o sistema pro cliente rodar na máquina dele** (clone do
ImpulsoX-OS). O painel é parte dessa entrega — é o que o **dono do negócio (não-técnico)**
abre pra ver o próprio marketing funcionando.

Consequências de design:
- **Abrir com um clique.** O cliente não usa terminal. Precisa de um lançador (atalho /
  `.cmd` no Windows) que sobe o servidor e abre o navegador sozinho.
- **Roda 100% local, na máquina do cliente.** Os dados dele **nunca saem do computador** —
  privacidade total. Isso é virtude do produto, não só detalhe técnico.
- **É um entregável polido.** Faz parte do que o cliente comprou; o acabamento on-brand
  importa (e o mesmo painel serve de demo na venda).
- **Cada cliente roda o seu.** Um clone por cliente, cada painel lê o núcleo/produção
  daquele negócio. A "visão de agência" (vários de uma vez) é da ImpulsoX, não do cliente —
  fica pra evolução posterior.

## Escopo

- **Fase 1 (este spec):** status board **vivo** e **só-leitura**. Servidor local Node lê
  os arquivos do negócio em tempo real e renderiza um painel on-brand que atualiza sozinho.
- **Fora desta fase (roadmap, ver "Fase 2"):** disparar skills pelo painel (botões que
  rodam `/post`, `/calendario`, `/publicar`). Depende de um job-runner com gate de
  aprovação humana. Desenhado depois, por cima desta fundação.

## Decisões (do brainstorming)

1. **Painel vivo**, não snapshot estático — servidor local que lê arquivos em tempo real e
   atualiza a página sozinha (combina com o padrão Token Monitor que o usuário já roda).
2. **Só-leitura (status board)** — mostra o estado; ação continua pelo Claude Code. Sem
   endpoint de escrita nesta fase.
3. **Node puro, sem framework** — `http` nativo + front-end vanilla. Bate com o DNA do
   sistema ("framework só se solicitado"); zero build step, zero dependência.
4. **Quatro blocos:** o ciclo rodando · produção & publicado · contexto do negócio ·
   custos & saúde.
5. **Fase 1 = um negócio** (o diretório atual). A generalização pra `clientes/<nome>/`
   (modo agência) é evolução da mesma base.

## Arquitetura — 1 servidor + front-end estático

### 1. `scripts/dashboard.mjs` (novo — servidor local, zero deps)
- **O que faz:** sobe um servidor `http` preso a `127.0.0.1` que (a) serve o front-end
  estático de `dashboard/` e (b) expõe `GET /api/estado` — lê os arquivos do negócio e
  devolve um JSON com o estado atual.
- **Porta:** `DASHBOARD_PORT` (default 5173); imprime a URL ao subir.
- **Só `GET`. Nenhum endpoint de escrita.** Preso a localhost (nunca `0.0.0.0`).
- **Whitelist de leitura** (caminhos permitidos): `nucleo/`, `producao/`, `marca/`,
  `dados/custos.jsonl`. Tudo fora disso é negado. **Nunca** lê `.env`, `.git`, `scripts/`
  nem qualquer chave. `FAL_KEY`/tokens jamais chegam ao `/api/estado` nem ao navegador.

### 2. `dashboard/` (novo — front-end vanilla)
- `index.html` — estrutura dos 4 blocos.
- `estilo.css` — importa `marca/tokens.css` (cores, fontes) → painel **on-brand**. Sem
  marca, cai nos defaults premium do sistema.
- `painel.js` — busca `/api/estado`, renderiza os blocos, e re-busca a cada ~5s (o "vivo").
  Mostra "atualizado há Xs"; se o servidor cair, avisa sem quebrar.

### 3. Leitura e parse (funções puras, testáveis)
Cada fonte tem uma função pura que recebe o texto do arquivo e devolve dados estruturados:
- `parseEscada(md)` → degrau atual + lista de pendências ("confirmar com o cliente").
- `parseFoco(md)` → foco do mês, metas, prazos.
- `parseOfertas(dir)` → ofertas **ATIVAS** (ignora FUTURAS — regra da casa).
- `parseAprendizados(md)` → aprendizados consolidados.
- `parseProvas(md)` → provas com status de autorização.
- `listarProducao(dir)` → peças em `producao/{posts,linkedin,paginas,copy}/` (data, slug,
  status lido do `legenda.md`/meta quando existe).
- `parsePublicacoes(md)` → o que foi ao ar (data, canal, link).
- `parseCustos(jsonl)` → soma de gasto de API por período/script/modelo.
- `saudeNucleo(dir)` → quais arquivos do núcleo estão preenchidos vs vazios/stub.
Parse tolerante: arquivo ausente ou vazio não quebra; o bloco mostra "vazio / a preencher".

### 4. Os quatro blocos (derivados do JSON)
1. **Ciclo rodando** — decide (calendário) → produz (`producao/`) → publica
   (`publicacoes.md`) → mede (`aprendizados.md`) → corrige. Cada etapa com
   contagem/estado. É o que dá cara de "sistema vivo".
2. **Produção & publicado** — lista de peças com data/status; o que foi ao ar com link.
3. **Contexto** — degrau da Escada, foco do mês, ofertas ativas, aprendizados.
4. **Custos & saúde** — soma do `dados/custos.jsonl`, saúde do núcleo, pendências a confirmar.

### 5. Custos — ledger novo (adição pequena nos scripts existentes)
Pra o bloco 4 mostrar gasto real, os scripts `gerar-imagem.mjs`, `gerar-video.mjs` e
`gerar-avatar.mjs` passam a **anexar uma linha** em `dados/custos.jsonl` a cada cobrança
bem-sucedida: `{"data","script","modelo","custo"}`. O painel soma. `dados/` já é
gitignored (fica local). Sem o ledger, o bloco 4 mostra só saúde do núcleo + pendências.

### 6. Wiring (lançador, skill e docs)
- **Lançador de um clique `painel.cmd`** (raiz do clone, Windows) — o cliente dá dois
  cliques: o script roda `node scripts/dashboard.mjs` e abre o navegador na URL sozinho.
  Sem terminal, sem comando digitado. É o caminho principal pro cliente final.
- **Skill `/painel`** — mesmo efeito pra quem está no Claude Code (a ImpulsoX, na operação).
  Sobe o servidor e abre o navegador. Mensagem clara se a porta estiver ocupada.
- **`docs/ferramentas.md`** — documentar o painel, o lançador, a porta e o ledger de custo.

## Segurança (inegociável)

- Só-leitura, só `GET`, preso a `127.0.0.1`. Nenhuma escrita, nenhum spawn de processo
  nesta fase.
- Whitelist de caminhos legíveis. `.env`, `.git`, `scripts/` e qualquer credencial ficam
  **fora**. Nenhuma chave chega ao `/api/estado` ou ao navegador — testado.
- O painel não inventa dado: arquivo vazio aparece como "a preencher", nunca preenchido
  com suposição.

## Tratamento de erro

- Arquivo ausente/vazio/mal-formado → o bloco mostra estado degradado ("vazio / a
  preencher"), nunca quebra o painel inteiro.
- Porta ocupada → erro claro em PT com instrução de trocar `DASHBOARD_PORT`.
- Servidor offline no front → o painel avisa "sem conexão com o servidor" e mantém o
  último estado, sem tela branca.

## Testes

- **Parse (puro, sem servidor):** cada `parse*` testado com um trecho-fixture do `.md`
  real → assertiva no dado estruturado (ex.: `parseEscada` extrai o degrau certo;
  `parseOfertas` ignora FUTURAS).
- **Smoke do servidor:** sobe em porta efêmera sobre um repo-fixture, `GET /api/estado`
  devolve JSON com as chaves dos 4 blocos.
- **Segurança:** assertiva de que `/api/estado` **não** contém nenhuma chave/segredo e que
  caminho fora da whitelist é negado.

## Critério de pronto

- `node scripts/dashboard.mjs` sobe um painel em `localhost`, on-brand, com os 4 blocos
  lendo dados reais do negócio, atualizando sozinho.
- Núcleo vazio não quebra — mostra "a preencher".
- Nenhuma chave/segredo vaza pro navegador (testado).
- Scripts `gerar-*` registram custo em `dados/custos.jsonl`; o bloco de custo soma.
- `painel.cmd` (dois cliques, sem terminal) sobe o painel e abre o navegador pro cliente
  não-técnico; `/painel` faz o mesmo no Claude Code; `docs/ferramentas.md` atualizado.
- Nada de `nucleo/marca/producao` é escrito pelo painel; só leitura.

## Fase 2 (roadmap — desenhada depois, não neste spec)

Disparar skills pelo painel (botões "gerar post", "montar calendário", "publicar"). Exige
um **job-runner** que invoca `claude -p` (infra já descrita em `docs/headless.md`):
spawn de processo, fila, streaming de log (SSE) e **gate de aprovação humana** — skill
criativa gera **rascunho** que cai no painel pra você aprovar; nada vai ao ar sem aceite
(regra inegociável da constituição). A Fase 1 é pré-requisito: é o mesmo painel, e é nele
que o rascunho é revisado. Por isso o front-end e a camada de dados desta fase nascem
reaproveitáveis.

## Fora de escopo (YAGNI)

- Autenticação (painel é localhost, só-leitura).
- Banco de dados (a fonte de verdade são os arquivos do repo).
- Visão multi-cliente de agência (evolução da mesma base, depois da Fase 1 validada).
- Histórico/gráficos temporais de métrica (o `/desempenho` cuida de medição; o painel
  mostra estado, não série histórica — por ora).
