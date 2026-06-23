# Auditoria do Sistema Operacional completo — 2026-06-23

> **STATUS (2026-06-23): todos os achados 🔴🟡🟢 foram CORRIGIDOS** (commits 6273057,
> 8d1d017, b982246, 21d7685). U1-U3 (CHANGELOG/fechos/script), mapa + 7 órfãs, C1-C3
> (desambiguação), L1 (loop página), F1-F3 (forma), P1-P5 (polish). As **🆕 OPORTUNIDADES**
> abaixo NÃO são correção — são features novas; ficam como backlog pra brainstorm→spec→código
> uma a uma (par O1 `/leads` + O2 `/roi` é o de maior alavanca).


> Auditoria de NÍVEL-SISTEMA do ImpulsoX-OS (4 auditores em paralelo: arquitetura, UX do
> dono leigo, consistência/manutenção, oportunidades). NÃO é auditoria de conteúdo de skill
> individual — essa é a `docs/auditoria-skills-2026-06-23.md`. Aqui o alvo é o SO como um
> todo: como as 50 skills se encaixam, navegam, se mantêm e o que falta.
>
> Veredito geral dos 4 auditores: **o motor é maduro e raro.** Fronteiras entre skills
> demarcadas, fechos disciplinados, regras duras respeitadas, produção completa. Os
> problemas são de **sincronia (doc atrás do código)**, **polish de descoberta** e
> **camadas que ainda não existem (pós-lead + escala de operação)** — não de quebra
> estrutural. NADA implementado ainda: este é o backlog pra decidir spec→plano→código.

---

## 🔴 URGENTES — quebram um contrato do próprio sistema

| # | O quê | Onde | Quem achou |
|---|---|---|---|
| U1 | **CHANGELOG parou em 0.2.1, sistema está em v0.2.4** — 3 versões fantasma. O `/atualizar-motor` usa o CHANGELOG + versão do rodapé pra saber o que cada clone precisa puxar; hoje o mecanismo de propagação está CEGO (perdeu esteira YouTube, /reel-marca, /repurpose, /shorts, scorecard, auditoria 2026). | `CHANGELOG.md` vs `CLAUDE.md:208` | Consistência |
| U2 | **3 skills sem o fecho "→ próximo passo"** (regra dura do CLAUDE.md, "BLOCKING/todo cliente"). `thumbnail` é skill VIVA (chamada por /editar-video) e quebra a esteira; `gravar-tela` e `reel-marca` são Fase 2 (decidir se ficam de fora conscientemente). | `.claude/skills/{thumbnail,gravar-tela,reel-marca}/SKILL.md` | Arquitetura + Consistência (2 auditores) |
| U3 | **Prefixo de script inconsistente** em `impulsox-chatgpt-ads`: 5 menções usam `scripts/...`, 1 usa `skill/scripts/...`. Leigo seguindo o passo erra o caminho. | `impulsox-chatgpt-ads/SKILL.md` (linhas 28/90/155/190) + `references/factual-extraction.md` | Consistência |

---

## 🟡 ATRITO REAL — custa navegação ou converge entre auditores

### Mapa-de-skills desatualizado (2 auditores convergem)
- **7 skills ausentes do mapa:** `analisar-dados`, `geo`, `local`, `perfil-ig`, `relatorio`,
  `gravar-tela`, `impulsox-chatgpt-ads`. `geo` é citada no CLAUDE.md como par do `/seo` e
  mesmo assim some do mapa. O mapa se vende como "QUEM chama QUEM pra ninguém se perder" —
  e tem buraco. _(Arquitetura citou 4; Consistência citou 7 — a lista de 7 é a boa.)_
- **Correção:** adicionar as 7 ao mapa e à tabela de fluxo guiado; trocar o `(gravar)`
  genérico da esteira YouTube por `/gravar-tela`; nota de fronteira pra `analisar-dados` ×
  `analisar-ads`.

### Colisões de descoberta (UX leigo)
- **C1 — "preciso de um site" / "por que não apareço no Google?" colide entre 3 portas.**
  `/raio-x`, `/seo` e `/pagina` (e `/geo`) disputam as mesmas frases; a frase "por que não
  apareço no Google?" está IDÊNTICA em `/raio-x` e `/seo`. Leigo cai na errada. **É o único
  achado que faz o leigo errar de skill de verdade.** Correção: linha de desempate na voz
  do dono em cada description (tem site? quer criar? quer medir?); a frase compartilhada
  fica em UMA só (provável `/raio-x`).
- **C2 — `/desempenho-yt` é porta morta que ainda compete por gatilho.** A própria
  description diz "a análise agora vive na porta única /desempenho", mas mantém gatilhos
  ("como foi o vídeo?", "mede retenção") que colidem com `/desempenho`. Correção: encolher
  pra stub interno (tirar os gatilhos) ou remover da lista.
- **C3 — "conteúdo" pulverizado** entre `/post`, `/conteudo`, `/calendario`. Reforçar na
  description de `/conteudo` que é o pacote pesado de UM tema ("já sei o tema, quero tudo dele").

### Loop de fluxo aberto (arquitetura)
- **L1 — medição→correção de PÁGINA/oferta não fecha.** O ciclo decide→produz→publica→mede→
  corrige fecha bem em conteúdo (desempenho→aprendizados→calendario) e ads (analisar-ads→
  ads-*), mas quando `/desempenho` ou `/analisar-ads` mostra que a PÁGINA converte mal,
  nenhum próximo-passo volta pra `/copy`/`/pagina`/`/oferta`. Correção: incluir no fecho de
  `/desempenho` e `/analisar-ads` o ramo "se o gargalo é a página → /copy ou /oferta".

### Padrões de forma divergentes (consistência)
- **F1 — Escada de Contexto não é declarada uniforme.** Só `/pagina` usa "degrau mínimo"
  explícito; as outras embutem o pré-requisito em prosa no fecho. Não dá pra varrer o
  sistema e extrair "degrau de cada skill". Decisão: padronizar campo "Degrau mínimo: N" no
  cabeçalho OU assumir o mapa como fonte única (e tirar a expectativa por-skill do CLAUDE.md).
- **F2 — "Teste de aceitação" só em 6 skills** e a fábrica `/automatizar` não o exige no
  molde — divergência que se perpetua a cada skill nova. Decisão: se é estado-da-arte,
  `/automatizar` passa a exigir.
- **F3 — CLAUDE.md vs prática:** constituição manda "✓ pronto" (minúsculo) + "→ próximo
  passo natural:"; skills usam "✓ Pronto" (maiúsculo) + às vezes "→ próximo passo:" (sem
  "natural"). Consistente entre si, diverge da letra. Correção barata: alinhar o CLAUDE.md à
  prática real.

---

## 🟢 POLISH

- **P1 — fronteira post vs reel-marca não está no frontmatter** (só no mapa). Como o roteador
  escolhe pela description, repetir a linha de fronteira em cada uma (como seo/geo fazem):
  `/post` = reel de rosto/cena real por IA; `/reel-marca` = motion graphics por código.
- **P2 — `/plugar` não comunica "comece aqui"** — nome é jargão interno. Garantir que o
  onboarding pós-instalação (README/1ª tela) diga "digite /plugar ou só 'quero começar'".
- **P3 — `/abrir` poderia oferecer o menu-conversa no 1º uso** ("não sabe o que pedir? fala
  o que quer: 'cuida do meu Instagram', 'preciso de um site'...") — transforma a lista de 50
  em conversa.
- **P4 — `impulsox-chatgpt-ads` 100% em inglês** no meio de 49 em PT-BR; sem gatilho PT.
  Adicionar linha de gatilhos PT ("anunciar no ChatGPT", "anúncio na IA").
- **P5 — skills de infra com gatilho de leigo** (`/escritor-br`, `/provas`, `/copy`) competem
  como porta de entrada. Risco baixo; confirmar que o leigo nunca precise invocar
  `/premium-design` sozinho (description escrita pra Vivian, não pro cliente).

---

## 🆕 OPORTUNIDADES — o que move o ponteiro R$5k → R$10k+

Padrão dos 4 auditores: produção está COMPLETA (não mexer). A alavanca está em **(a) pós-lead**
e **(b) escala de operação** — a camada que separa "gerador de conteúdo" de "parceiro de
crescimento". Priorizadas por (impacto × esforço):

| # | Skill nova | O quê | Por que vale 10k | Esforço |
|---|---|---|---|---|
| O1 ⭐ | **`/leads`** | recebe o lead que a /pagina gera, qualifica, marca origem (UTM), dispara 1ª resposta | elo perdido entre gerar lead e medir dinheiro; sem ele "ROI" é sempre estimado | M |
| O2 ⭐ | **`/roi`** | cruza leads × vendas fechadas → faturamento influenciado, CAC, ROI por canal | é o argumento literal que sustenta cobrar 10k e renovar; alimenta /relatorio | M |
| O3 | **`/reativar`** | sequência win-back de lista/base parada (herda infra do /email) | dinheiro que já existe na base do cliente; ROI altíssimo | P |
| O4 | **`/intake`** | onboarding comercial pós-fechamento (acessos, pixels, KPI do contrato, calendário de aprovação) | 1ª impressão que justifica 10k; hoje improvisado | P |
| O5 | **`/depoimento`** | gera prova: roteiro de pedido no momento certo + coleta + vira peça → abastece /provas | fecha o loop de prova social que se retroalimenta | P-M |
| O6 | **`/concorrente`** | vigia competitiva contínua (Ad Library, preço, cadência) → input de /calendario, /oferta, /proposta | inteligência = consultoria, não freela | M |
| O7 | **Hub multi-cliente** | evolução do /painel + /abrir lendo todos os `clientes/*/escada.md` → visão de carteira (quem no verde/vermelho, contrato vencendo) | alavanca pra escalar N=1 → N=20 sem afogar | M |
| O8 | **`/agente-ia` na página** | assistente conversacional que qualifica visitante 24/7 na própria landing | "IA-Ready" que o cliente VÊ e toca; upsell sobre a página de 5k; tendência 2026 | M-G |

**Par de maior alavanca:** O1+O2 juntos fecham o vazamento "lead→dinheiro". Fazer primeiro.

---

## ORDEM DE ATAQUE sugerida

1. **Urgentes (U1-U3)** — baratos, e U1 destrava o `/atualizar-motor` (que você vai rodar
   nos clones). Fazer ANTES de propagar pros clones.
2. **Mapa + colisões (mapa desatualizado, C1, C2)** — texto, alto retorno de navegação.
3. **Loop página/oferta (L1) + frontmatters (P1)** — fecham coerência.
4. **Forma (F1-F3)** — decisões de padrão; uma vez decididas, valem pra sempre.
5. **Oportunidades** — O1+O2 (par lead→dinheiro) é o projeto de maior valor; o resto entra
   por contrato/demanda.

## O que está saudável (não mexer)
- Produção de conteúdo orgânico, página premium, identidade visual, loop medir→aprender.
- Regras duras respeitadas: oferta ATIVA, motor-no-template, esperar-o-sim, sem encadeamento
  automático. Scripts sem órfãos reais. Agentes uniformes. Tamanho de skill sob controle.
