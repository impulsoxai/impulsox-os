# QA de entrega de build — o gate antes de código ir pro cliente

> Fecha o buraco entre os gates que já existem: `/revisar` cobre peça de
> marketing, `/revisar-pagina` cobre página (visual+copy). ESTE doc cobre **build
> de código entregue a cliente** — dashboard (`/dashboard`), automação
> (`/automacao-cliente`), página com JS não-trivial (`/pagina`), app sob medida.
> Destilado do método Sprint/Matt Ganzak (jul/2026, mecânica não conteúdo; fonte
> bruta no vault da ImpulsoX). Princípio: **"o checklist não é overhead — é o
> produto. Cliente paga por coisa que funciona; o checklist é como se prova."**

## A ordem do QA (barata → cara)

1. **Self-review ANTES de testar no navegador** — revisar o próprio output contra
   o plano/PRD é o passo N+1 de todo build, não opcional. Três passadas:
   - **Funcional por etapa:** faz exatamente o pedido? falta peça? edge case
     descoberto (dado vazio, campo faltando)?
   - **Completa do build:** requisito a requisito do plano + inconsistência
     entre arquivos.
   - **Segurança:** os 5 checks abaixo.
2. **Operar como usuário** (navegador/terminal) — achar problema com evidência
   (erro exato, screenshot, response body), nunca por impressão.
3. **Checklist pré-entrega** — só entrega quando TODOS os itens passam,
   independente do tamanho/preço do projeto.

## Os 5 checks de segurança (5 minutos, antes de TODA entrega)

1. **Nenhuma credencial no código-fonte.** Buscar o VALOR das keys em todos os
   arquivos — só podem existir no `.env`/secrets. Bots varrem repos públicos em
   minutos; key vazada = incidente com conta de cliente.
2. **`.env` no `.gitignore`** — conferir ANTES do primeiro commit. Já commitou?
   Remover do tracking E ROTACIONAR a key (remover do histórico não basta).
3. **Zero dado sensível em console.log** — operar o app logado com o Console
   aberto: e-mail, senha, token ou dado de pagamento aparecendo = remover antes
   de entregar.
4. **Rota protegida não bypassável** — janela anônima, navegar DIRETO pra cada
   rota protegida: todas redirecionam pro login. Uma renderizando conteúdo =
   furo de auth.
5. **Zero TODO no código entregue** — busca global; cada TODO ou se completa ou
   se remove com justificativa. TODO de auth/erro esquecido é passivo jurídico.

## Checklist pré-entrega (o mesmo pra todo build)

**Funcional**
- [ ] Todo requisito do plano/PRD implementado (conferir item a item, não de memória)
- [ ] Zero link quebrado; todo form envia E mostra feedback (sucesso e erro)
- [ ] Auth (se houver): login, logout, sessão persiste no refresh, rota protegida redireciona
- [ ] Estados de loading, erro e vazio existem em toda view dependente de dado
- [ ] Console limpo (zero erro vermelho); Network sem request falhando

**Visual & performance**
- [ ] Correto em 375px E em desktop; sem overflow de texto; imagem sem esticar
- [ ] Cores/tipografia batem com a marca (`marca/tokens.css`)
- [ ] Lighthouse na URL VIVA (não localhost), device Mobile: 90+ nos quatro
      scores — e o score final vira prova de qualidade apresentada ao cliente
- [ ] Carrega rápido (LCP ≤ 2,5s — régua CWV oficial) e sem layout shift visível

**Segurança & entrega**
- [ ] Os 5 checks de segurança acima passaram
- [ ] README: o que é, como configurar, como operar (parte do produto, não cortesia)
- [ ] Cliente usa as PRÓPRIAS keys/contas dele (nunca as nossas em produção)
- [ ] URL viva verificada por CONTEÚDO (marcador único da versão nova, não só status 200)
- [ ] Walkthrough gravado (`/gravacao`) + oferta de manutenção feita

## Diagnóstico rápido (evidência → ação)

| Evidência | Leitura |
|---|---|
| Console vermelho | copiar mensagem COMPLETA (arquivo+linha) — nunca resumir de memória |
| Network linha vermelha | status + URL + response body juntos |
| Layout errado | screenshot do elemento + CSS aplicado (Inspect), não só "ficou torto" |
| `exited with code 1` | o erro real está ACIMA dessa linha — rolar e copiar ele |
| Funciona local, quebra no deploy | env var faltando no ambiente OU config do host — colar o log de deploy |

## Onde este gate roda

- `/pagina` — a Revisão final da skill já cobre visual/copy; este doc adiciona os
  5 checks de segurança e o checklist funcional quando a página tem form/JS.
- `/dashboard` — antes do walkthrough de entrega (etapa 7 concluída).
- `/automacao-cliente` — antes de ativar a agenda no ambiente do cliente
  (inclui: forçar uma falha e ver o alerta chegar).
- Qualquer build sob medida que saia do sistema pra um cliente.

O gate frio de peça de marketing continua sendo o `/revisar`; o de página, o
`/revisar-pagina`. Este é o terceiro irmão: **código que vai pro cliente**.
