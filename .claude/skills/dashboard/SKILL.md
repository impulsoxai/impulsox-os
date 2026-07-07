---
name: dashboard
description: >
  Use para CRIAR um dashboard de relatórios pra cliente (KPIs, gráfico, tabela, filtro
  de período, export CSV) — "/dashboard", "cria um dashboard", "painel de indicadores
  pro cliente", "relatório visual dos dados". Entrega React+Vite+Chart.js com camada de
  dados genérica (useData) que troca de fonte em um arquivo só — construído uma vez,
  reusado em todo cliente. Produto de ticket alto do portfólio (referência de mercado:
  US$ 1.500-5.000, Sprint/Matt Ganzak, jul/2026). (Dashboard do NOSSO CRM já existe —
  isto é pra dashboard avulso de cliente, com os dados dele.)
---

# /dashboard — Dashboard de cliente reutilizável

Painel de indicadores premium pra cliente: 4 cards de KPI, gráfico de linha
multi-série, tabela ordenável com busca, filtro de período que atualiza tudo junto,
export CSV. A arquitetura é o produto: **camada de dados genérica** — trocar de
cliente = reescrever um arquivo (o hook de dados), o resto do dashboard nunca muda.

Método destilado do Sprint vídeo 5 (Matt Ganzak) — fonte bruta em
`ImpulsoX-AI/material-matt/sprint-video5-dashboard.md`; mecânica transferida, nunca
o conteúdo. Autoria da skill: ImpulsoX AI.

## Degrau mínimo (Escada de Contexto)

Roda no degrau 0 com dados MOCK (o build inteiro funciona sem dado real — é assim
que se constrói). Dado real do cliente (API, export, planilha) só entra na última
etapa. Sem marca definida, usar defaults premium e marcar pra calibrar depois.

## O que ler antes

- `marca/design-guide.md` + `marca/tokens.css` — o dashboard veste a marca do
  cliente (cores dos cards, tipografia, tom dos gráficos), nunca default de lib
- `nucleo/negocio.md` + `nucleo/ofertas.md` — quais métricas IMPORTAM pra este
  negócio (um restaurante mede outra coisa que um SaaS); dashboard é oferta
  modular — vender a peça que resolve a dor de agora, upsell depois
- `docs/acervo-landing-matt.md` — o método Brief→PRD→Loop é o mesmo; este skill é
  a variante de dashboard
- Se o cliente é usuário do CRM ImpulsoX: `scripts/lib-crm.mjs` já dá acesso aos
  dados — o hook de dados pode ler de lá direto

## Arquitetura (a regra que não se negocia)

**Um hook de dados genérico entre a fonte e os componentes.** Todo componente lê
dele; nenhum componente sabe de onde o dado vem. Shape fixo:

```js
// src/hooks/useData.js — o ÚNICO arquivo que muda entre clientes
return {
  kpis:   [ { label, value, trend } ],  // cards
  series: [ { label, data: [] } ],      // gráfico
  rows:   [ { ...columns } ],           // tabela
  loading: bool,
  error:  string | null
}
```

Stack padrão: **React + Vite + Chart.js + Tailwind** (leve, demo rápida; Next só se
o projeto já for Next). Deploy: o que o cliente já usa (nosso padrão: VPS próprio ou
Cloudflare Pages).

## As 7 etapas (uma responsabilidade cada, com loop entre elas)

1. **Setup** — scaffold, shell com sidebar, placeholders. Rodar no localhost ANTES da etapa 2.
2. **useData() com MOCK realista** — etapa PRÓPRIA, nunca embutida num componente.
   Mock primeiro é o que permite construir e testar tudo sem esperar acesso ao dado
   real do cliente (que sempre atrasa). Aceita `dateRange` desde já.
3. **KPI cards** — 4 cards lendo `kpis`; valor formatado pt-BR (R$, %, milhar);
   tendência com cor; 2 colunas mobile / 4 desktop.
4. **Gráfico de linha** — multi-série (mínimo métrica + comparação), legenda,
   tooltip formatado, respeita o filtro de período.
5. **Tabela** — sort por coluna, paginação (10/página), busca em tempo real.
6. **Filtro de período + export CSV** — o filtro atualiza cards, gráfico E tabela
   simultaneamente; o CSV exporta as linhas FILTRADAS (o que está visível), nunca o
   dataset cheio.
7. **Dado real + polish** — trocar o mock por fetch real DENTRO do useData
   (normalizador: shape da fonte real → shape fixo), spinner de loading, mensagem
   de erro, retry; passada final de estilo com os tokens da marca.
   Disciplina de API nova: **entender antes de codar** (ler a doc da API, mapear
   endpoint/auth/shape SEM escrever código) → implementar com key só em `.env` →
   resposta inesperada = escrever normalizador, nunca remendar os componentes.
   O swap não toca nenhum outro arquivo.

**O loop entre etapas (herdado do método da landing):** nunca construir a etapa
N+1 sem verificar a N contra o plano — rodou limpo? bate com o combinado? erro →
colar o erro exato, nunca chutar. Mudança grande de layout = ponto de aprovação
nomeado: "aprovar, rejeitar ou ajustar antes de seguir?"

## Modos de falha típicos (diagnóstico direto)

| Sintoma | Causa provável (na prática) |
|---|---|
| Gráfico não renderiza | import do Chart.js faltando ou canvas não encontrado |
| KPI mostra `undefined` | hook não retorna o shape que o card espera — conferir os dois juntos |
| Filtro atualiza um componente só | estado do período não propagado a todos |
| CSV baixa vazio | export lendo as linhas não-filtradas |
| Fonte responde mas painel em branco | shape real ≠ shape fixo → escrever normalizador no useData |

## Troca de cliente (a produtização)

Cliente novo = **só o useData.js muda**: fetch da fonte dele + normalizador pro
shape fixo + loading/erro + dateRange. Ordem de grandeza da prática: ~30 min de
swap depois do primeiro build. Nenhum outro arquivo é tocado. Fontes comuns:
API REST/GraphQL do sistema do cliente, Google Sheets/Analytics, export CSV
recorrente, ou o CRM ImpulsoX via `lib-crm`.

## Gate de QA antes da entrega

Rodar `docs/qa-entrega-build.md` completo: self-review contra o plano (funcional →
completo → segurança), os 5 checks de segurança (key só no .env, .gitignore,
console sem dado sensível, sem TODO) e o checklist pré-entrega (funcional, visual
375px/desktop, Lighthouse 90+ na URL viva). Só depois disso a entrega abaixo acontece.

## Entrega e comercial (embutido, não opcional)

1. **URL viva + vídeo curto de walkthrough** (2 min, gravado no dia da entrega —
   `/gravacao` resolve): mostrar o filtro mudando tudo junto e o export.
2. **Guia de 1 página de troca de fonte de dados** no e-mail de entrega — mostra
   profundidade e prepara o terreno pra manutenção.
3. **Oferecer a manutenção mensal ANTES de pedirem, dentro do vídeo:** manter,
   adicionar métricas novas conforme o negócio muda, atualizar. É o upsell natural
   da esteira (regra da casa: vender modular, upsell depois) — cliente de
   dashboard que paga uma vez é bom; o que paga mensal é ótimo. Preço da
   manutenção: registrar em `nucleo/ofertas.md` quando definido (referência de
   mercado do método: US$ 500/mês, jul/2026 — calibrar pra realidade BR do nicho).
4. Dashboard entregue vira prova social (com autorização) em `nucleo/provas.md`.

## Regras

- **Marca do cliente em todo pixel** — tokens, não default de Chart.js/Tailwind.
- **Dado real nunca inventado**: mock é claramente mock ("Demonstração · dados
  fictícios") até o dado real entrar; screenshot público de dashboard de cliente
  só com dado fictício ou autorização (LGPD).
- **Métricas escolhidas pelo negócio, não pelo template**: as 4 KPIs saem de
  `nucleo/negocio.md`/conversa com o dono — o que ele decide com esse número?
  Número que não muda decisão não ganha card.
- Peça pública sobre o dashboard (post, proposta) só se a oferta está ATIVA em
  `nucleo/ofertas.md`.

---

**✓ Pronto:** dashboard entregue (URL viva + walkthrough + guia de troca de fonte) ·
**→ próximo passo:** oferta de manutenção mensal feita no vídeo; se aceita,
registrar em `nucleo/ofertas.md` e no CRM. Skill opcional da esteira — entra quando
o cliente tem dados e precisa enxergá-los, nunca empurrada como passo automático.
