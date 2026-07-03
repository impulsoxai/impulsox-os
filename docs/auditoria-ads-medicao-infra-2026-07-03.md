# Auditoria externa — Eixo ADS / MEDIÇÃO / PÁGINA-TECH / INFRA (etapa 6 de 6 — FINAL)

> Auditor externo (contexto limpo + pesquisa web real) · 2026-07-03
> Escopo: ads-google, ads-meta, impulsox-chatgpt-ads, analisar-ads · analisar-dados, roi,
> relatorio, painel · seo, geo, velocidade · abrir, atualizar, atualizar-motor,
> automatizar, salvar, agente-ia.
> NÃO re-reporta: números-sem-fonte como regra (transversal #1 — só instâncias novas),
> loop IG manual/metricas-instagram.mjs, check de 72h, CSV 4-passos do /leads, gate
> saúde-da-casa, check de versão no /abrir (já no backlog-motor.md).

---

## 1. Diagnóstico do eixo em 5 linhas

A doutrina de ads é honesta num nível raro (atribuição inflada 2-5x declarada, "humano sobe a campanha", duas fases antes do automático, gate casa-pronta) — mas **congela o mundo de meados de junho/2026 num eixo que muda semanalmente**: o `/ads-google` não tem UMA linha sobre AI Max (a maior mudança do Search desde o PMax, saindo de beta agora, DSA morre em fev/2027), o `/ads-meta` prega o criativo certo sem citar Andromeda nem Event Match Quality, e a tabela de países do ChatGPT Ads está "verified 2026-06-10" enquanto UK/JP/KR já abriram e o Brasil abre "nas próximas semanas" — a *description* da skill crava "país-piloto" como fato estático. Na medição, o `/roi` divide receita de 6 meses por gasto de 90 dias e chama de ROI (a skill manda "marcar a janela" em vez de casá-la — sendo que `receitaPorMes` já vem mensal), e o `/relatorio` promete o "alerta proativo entre relatórios" que **nenhuma skill executa** — a rotina que a pesquisa diz ser O diferencial de retenção (Swydo/AgencyAnalytics monitoram diário) não tem dono. Na infra, um bug de contrato: o comando do `/atualizar-motor` **não inclui `CLAUDE.md` no checkout** — a constituição nunca desce pros clones e o `motor-versao.md` carimba a versão velha lida do arquivo que não atualizou. E o `/seo` vende llms.txt e "Schema = 2,7x mais citação" como mecanismo comprovado quando a evidência 2026 é mista-pra-negativa — o eixo que audita honestidade dos outros precisa da própria régua.

---

## 2. Achados por skill

### Ads

**/ads-google** (`.claude/skills/ads-google/SKILL.md`)
- 🟡 **AI Max não existe na skill — o plano de Pesquisa nasce datado.** Em 2026 o AI Max for Search saiu de beta (+7% de conversões no full suite, dado do Google), DSA começa a migrar automático em set/2026 e é aposentado em fev/2027, e a skill — que se vende como "o sistema decide e explica em uma linha o porquê" — não tem posição. A Fase 2 (`SKILL.md:68-73`) para em "broad match + Smart Bidding", estado da arte de 2024-25. *Melhoria: bloco "AI Max — quando ligar" na Fase 2 (após conversões rastreadas, com locations/brand controls) + nota de que DSA está morrendo.*
- 🟢 Carona do transversal #1, instâncias novas: "+5-17%" (`:39`), "~69% conversion modeling" (`:111-112`), "CPC R$ 4-25 / CPL R$ 15-350" (`:114-116`), "CPC subiu ~13%" (`:51`) — sem fonte nem data.

**/ads-meta** (`.claude/skills/ads-meta/SKILL.md`)
- 🟡 **A doutrina de criativo está certa e o mecanismo que a justifica não está escrito — e falta a régua objetiva do sinal: EMQ.** Os "10-15 ativos + 3-5/semana + variação real" (`:315-319, 358`) batem com o consenso Andromeda 2026 (clustering de criativos similares: 395 anúncios iguais performam como 10; fadiga caiu pra 2-3 semanas). Mas "Andromeda" não aparece, e o pré-requisito Pixel+CAPI (`:181-198`) não cita **Event Match Quality ≥ 7** — o check nº1 de CAPI em 2026. Sem EMQ, "CAPI ligado" é binário cego. *Melhoria: 3 linhas — Andromeda como o porquê do volume+diversidade; EMQ ≥7 verificável no pré-requisito; fadiga 2-3 semanas como razão da reposição semanal.*
- 🟢 Fase 1 com Detailed Targeting (`:138-141`) defensável só pra hiperlocal raio <16km; sob Andromeda a recomendação dominante é estrutura simples + criativo diverso desde cedo — marcar a Fase 1 como exceção hiperlocal, não default.

**/impulsox-chatgpt-ads** (`SKILL.md` + `references/platform-field-guide.md`)
- 🔴 **A tabela de países congelou em 2026-06-10 e o mercado andou 3+ semanas — e a *description* crava "Brasil é país-piloto" como fato estático.** Verificado ao vivo: UK live 06/06, self-serve UK 22/06, Japão e Coreia live 22/06, fim do piso de gasto no self-serve US, Brasil/México "coming weeks" — pode abrir a qualquer dia. O geo-gate dinâmico salva o fluxo interno, mas `platform-field-guide.md:3,8-16` está desatualizado E a porta de entrada (`SKILL.md:5`) vai orientar errado no dia em que o BR abrir. *Melhoria: re-verificar e datar a tabela AGORA; description sem estado cravado ("status muda semanalmente — a skill confere ao rodar").*
- 🟢 OpenAI sinalizou múltiplos formatos de anúncio (jul/2026) — a creative matrix assume formato único. Watch-item no Backlog da skill.

**/analisar-ads** (`.claude/skills/analisar-ads/SKILL.md`)
- 🟡 **Contrato órfão com o /ads-meta: a régua Hook Rate/Hold Rate nunca roda porque o export pedido não tem as colunas.** `ads-meta/SKILL.md:188-192` manda "levar pro /analisar-ads na leitura de 30 dias" — mas o Passo 1 (`:53-63`) pede só custo/cliques/impressões/conversões; nem o script nem o `--mapa` conhecem métricas de vídeo (3s views, ThruPlay, plays at 25/50/75%). O diagnóstico "qual parte do criativo corrigir" morre entre as duas skills. *Melhoria: colunas de vídeo no export Meta + 2 campos no `--mapa`; a régua vira seção do relatório.*
- 🟢 "Mudança de janela do Meta (28d → 7d-click)" (`:40-42`) é de 2021 — texto morto que confunde. E carona: "ROAS Google ~3,5x · Meta ~1,9x (mediana 2026)" (`:98-99`) sem fonte no arquivo que é a régua de leitura.

### Medição

**/roi** (`.claude/skills/roi/SKILL.md`)
- 🟡 **ROI com janelas descasadas por construção: receita da janela fixa do CRM (6m) ÷ gasto do período da análise (90d/mês).** A skill sabe (`:61-62`) mas resolve com nota de rodapé — sendo que o shape já traz `receitaPorMes`/`dealsPorMes` mensais (`:44-45`): recortar a receita dos MESMOS meses do gasto é aritmética no lib-roi. *Melhoria: `recortarJanela(receitaPorMes, mesesDoGasto)` — ROI sempre de janelas casadas; o 6m-total vira contexto, nunca numerador.*
- 🟢 CAC sem definir o campo canônico de "clientes novos" (deals ganhos? contacts? invoices?). Cravar na skill.

**/relatorio** (`.claude/skills/relatorio/SKILL.md`)
- 🔴 **O "alerta proativo entre relatórios" (`:90-99`) não tem dono, gatilho nem mecanismo — promessa sem skill.** O /desempenho é mensal e manual, o /analisar-ads sob demanda, o /painel passivo. Ninguém olha número entre os dias 1 e 30 — e a pesquisa 2026: o que separa agência que retém é monitoramento contínuo com alerta antes de o cliente notar (core de AgencyAnalytics/Swydo); 48% dos churns 2025 = "dissatisfaction with delivery". Instância de RETENÇÃO do padrão "decisão sem dono". *Melhoria: check quinzenal leve (10 min: CPL da semana, alcance, leads do CRM) com gatilho de alerta, agendável; no mínimo o /abrir puxando "há N dias sem olhar número".*
- 🟡 **Só existe o mensal — não existe QBR.** Prática 2026 que retém contrato: mensal escrito + revisão trimestral AO VIVO. Pra contrato 10k+ o QBR é onde se renova, e a casa já tem o /slides. *Melhoria: modo `--trimestral` que agrega 3 meses + gera o deck via /slides.*

**/analisar-dados** — 🟢 a skill confessa a lacuna do script (`:268-272`): variação % período-a-período vive em workaround manual. Implementar `--comparar-por mes` no `analisar-dados.mjs`.

**/painel** — sem achado. Só-leitura, localhost, fronteira limpa.

### Página-tech

**/seo** (`.claude/skills/seo/SKILL.md`)
- 🟡 **llms.txt afirmado como mecanismo de citação (`:113-114`) — a evidência meados-2026 diz que não.** ~10% de adoção, crawlers principais não buscam o arquivo, estudos não medem ganho, Google o compara à keywords meta tag. *Melhoria: rebaixar pra "aposta de custo zero, sem evidência de ganho medido (2026) — fazemos pelo custo, não prometemos por ele".*
- 🟡 **`:132-135` — "~2,7x mais citada no Perplexity / ~3,1x nas AI Overviews" usado como argumento de venda sem fonte.** A instância mais perigosa do transversal #1: é dimensionamento de ganho entregue ao cliente — e LLMs não consomem JSON-LD na inferência; números assim são correlação de estudo de vendor. *Melhoria: fonte nomeada + reenquadrar como correlação, ou cortar do relatório de cliente.*

**/geo** (`.claude/skills/geo/SKILL.md`)
- 🟡 **Passo 1: "rodar essas perguntas via WebSearch" (`:65`) não testa os motores que a skill declara auditar.** WebSearch amostra o índice de busca — não é o ChatGPT/Gemini/Perplexity respondendo. Mesma família da fonte 5 do /radar (etapa 4). *Melhoria: declarar o que o sistema testa sozinho vs o que é tarefa de 5 min do dono (print do ChatGPT/Perplexity); coluna "motor testado como" na tabela.*
- 🟢 O conjunto grounding (`citabilidade.md` FATO/VOZ) + validador determinístico (`validate-geo.mjs`, falha-fecha) é **o melhor padrão de honestidade do sistema inteiro** — replicar, não mexer.

**/velocidade** — sem achado. Fontes rastreáveis, cálculo por script, fato vs suposição marcado. **É o gabarito de como número de mercado deve viver no sistema.**

### Infra/operação

**/atualizar-motor** (`.claude/skills/atualizar-motor/SKILL.md`)
- 🔴 **O comando do Passo 2 (`:105`) não inclui `CLAUDE.md` — a constituição nunca desce pros clones, e o carimbo de versão mente.** `git checkout template/main -- .claude/ docs/ scripts/ remotion/ .env.example .gitignore` — sem `CLAUDE.md`. O texto abaixo (`:115-117`) diz que o CLAUDE.md "também atualiza", mas não há comando. Consequência dupla: (a) toda regra nova de conduta fica pra trás nos clones; (b) o Passo 4 (`:143`) lê a versão do CLAUDE.md LOCAL — velho — e grava no `motor-versao.md`: o clone instala skills v0.2.12 e carimba v0.2.8. *Melhoria: `CLAUDE.md` no checkout + teste de aceitação "versão do rodapé local == versão do template".*

**/salvar** (`.claude/skills/salvar/SKILL.md`)
- 🟡 **`git add -A` (`:58`) protegido só pelo pressuposto do `.gitignore` — sem varredura de segredo no conteúdo.** Cenário real: token do CRM (`ixk_live_...`), chaves `ixs_pub_`, tokens Meta — dono leigo cola num `.md` de `producao/` e o /salvar sobe pro GitHub. *Melhoria: grep pelos padrões da casa (`ixk_live_`, `sk-`, `Bearer `, `AKIA`) antes do add; achado → mostrar a linha e perguntar, nunca subir.*

**/agente-ia** (`.claude/skills/agente-ia/SKILL.md`)
- 🟡 **O widget captura PII (nome+contato → Contact no CRM, `:54-55, 99-101`) sem camada de consentimento** — sendo que a casa já tratou consentimento como BLOCKER (B1). Falta: aviso "assistente virtual/IA", link de política de privacidade, registro auditável do opt-in ({timestamp, texto}) no Contact — a prova que o /intake exige e o /reativar precisa. O agente-ia é onde o consentimento NASCE; hoje nasce indocumentado. *Melhoria: microcopy de consentimento + persistir {timestamp, texto, canal} no capture.*

**/abrir · /atualizar · /automatizar** — saudáveis. A triagem de viabilidade com ROI do /automatizar (`:447-483`) está acima do mercado de "agent builders".

---

## 3. Top 6 melhorias do eixo (impacto ÷ esforço)

| # | O que mudar | Arquivo | Por quê | Fonte |
|---|---|---|---|---|
| 1 | **Consertar o /atualizar-motor: `CLAUDE.md` entra no checkout + carimbo lido do template** + teste "versão local == template pós-update" | `atualizar-motor/SKILL.md:105,143` | A constituição nunca propaga; o motor-versao.md grava versão falsa — o mecanismo que mantém N clones coerentes está quebrado em silêncio, com 2 clones esperando update agora | verificação direta no arquivo |
| 2 | **Dar dono ao alerta proativo + criar o QBR** — check quinzenal leve com gatilho de alerta + modo `--trimestral` do /relatorio gerando deck via /slides | `relatorio/SKILL.md:90-99` | Retenção é o produto: 48% dos churns = "dissatisfaction with delivery"; monitorar entre relatórios e revisar ao vivo por trimestre é o que os líderes fazem | swydo.com (client retention · marketing reporting) |
| 3 | **Re-verificar e datar o ChatGPT Ads AGORA + description sem estado cravado** — UK live + self-serve, JP/KR live, fim do piso US; BR "coming weeks" | `impulsox-chatgpt-ads/references/platform-field-guide.md:3,8-16` · `SKILL.md:5` | A oferta é "lançar no dia 1" — com tabela 3 semanas velha, o cliente BR perde o dia 1 que pagou pra não perder | digiday.com · ppc.land |
| 4 | **Atualização 2026 dos guias de ads** — "AI Max: quando ligar" (+DSA→fev/2027) no /ads-google; Andromeda + EMQ ≥7 no /ads-meta; colunas de vídeo no /analisar-ads (fecha o contrato Hook/Hold) | `ads-google/SKILL.md:58-93` · `ads-meta/SKILL.md:181-198,315-319` · `analisar-ads/SKILL.md:53-63` | O eixo vende "o sistema decide" e não tem posição sobre a maior mudança do Search em 5 anos; a régua de criativo mais acionável nunca roda por falta de 2 colunas | blog.google (AI Max · DSA) · tryatria.com (Andromeda) |
| 5 | **Honestidade GEO nos próprios números** — llms.txt rebaixado; 2,7x/3,1x com fonte+enquadre de correlação ou fora do argumento de venda; /geo declara o que testa vs o que é print do dono | `seo/SKILL.md:113-114,132-135` · `geo/SKILL.md:65-71` | Crawlers não buscam llms.txt, estudos não medem ganho, LLM não consome JSON-LD na inferência — o sistema que exige fonte do cliente vende mecanismo não comprovado | aeo.press (state of llms.txt 2026) · searchengineland.com (schema sem hype) |
| 6 | **/roi com janelas casadas** — lib-roi recorta receita/deals pelos meses do gasto; ROI sempre da MESMA janela; total-6m vira contexto | `roi/SKILL.md:41-45,61-62` + `scripts/lib-roi.mjs` | O número que sustenta o ticket divide 6 meses de receita por 90 dias de gasto com nota de rodapé — o dado mensal já está no shape validado; é aritmética | shape validado no gate e2e (backlog-oportunidades) |

**Menores (custo ~zero, fazer junto):** consentimento LGPD no /agente-ia (microcopy + {timestamp, texto} — quase top 6; é onde o consentimento da esteira NASCE); varredura de segredo no /salvar; apagar texto morto "28d→7d" do /analisar-ads:40-42; campo canônico de "clientes novos" no CAC; `--comparar-por mes` no analisar-dados.mjs; Fase 1 do /ads-meta como exceção hiperlocal; watch-item "múltiplos formatos" no chatgpt-ads; fontes nas instâncias novas do transversal #1.

**O que NÃO mexer:** o aviso de atribuição inflada 2-5x do /analisar-ads; "humano sobe a campanha"; a arquitetura brain/hands + validador do chatgpt-ads (o desenho de skill mais maduro do sistema); o par grounding+validador do /geo; o checkout seletivo do /atualizar-motor (o bug é UM caminho faltando, não o desenho); a triagem ROI do /automatizar; o /velocidade inteiro. **Verificado positivo:** LCP 2,5s no /seo está certo (a correção do incidente pegou); thresholds CWV 2026 não mudaram (INP refinou medição, não limiar; "Engagement Reliability" segue proposta).

---

## Fontes principais

OpenAI/Digiday — expansão do pilot · PPC Land — UK live + self-serve, JP/KR live · Briefs — fim do piso self-serve · Google Blog — AI Max + DSA→AI Max (fev/2027) · Search Engine Land — AI Max / schema sem hype · Jetfuel/Atria/Confect — Andromeda 2026 (clustering, EMQ, fadiga) · Swydo — client retention 2026 + QBR · AEO Press/ALLMO — llms.txt 2026 · web.dev — CWV 2026
