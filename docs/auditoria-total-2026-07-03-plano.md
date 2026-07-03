# Auditoria Total do ImpulsoX-OS — Plano Consolidado de Implementação

> Síntese das 6 auditorias externas (2026-07-02/03), cada uma com auditor de contexto
> limpo + pesquisa web real. Relatórios-fonte:
> 1. `auditoria-copy-2026-07-02.md` ⭐ (prioridade do dono)
> 2. `auditoria-cinematografico-2026-07-02.md` ⭐ (prioridade do dono)
> 3. `auditoria-comercial-2026-07-03.md`
> 4. `auditoria-ciclo-conteudo-2026-07-03.md`
> 5. `auditoria-youtube-2026-07-03.md`
> 6. `auditoria-ads-medicao-infra-2026-07-03.md`
>
> Este arquivo é o MAPA e a ORDEM. O detalhe de cada item (arquivo:linha, fonte) vive
> no relatório do eixo. Implementar por onda; marcar ☑ ao concluir; melhorias são MOTOR
> (template → `/atualizar-motor` nos clones).

---

## O que os 6 auditores concordaram (temas transversais)

**T1 — Números sem fonte (o achado nº1, presente nos 6 eixos).** ~40 estatísticas de
mercado cravadas nos SKILL.md sem fonte nem data — incluindo 1 citação QUEBRADA
(/treinar-vendas) e 2 usadas como argumento de venda ao cliente (/seo 2,7x; /provas +80%).
O sistema exige fonte do cliente e não exige de si. Já mordeu uma vez (LCP 2,0s).
→ Fix: mutirão único + regra de conduta no CLAUDE.md ("fato de mercado carrega
fonte+data") + o refresh mensal do /formulas passa a revisitar esses números.
O gabarito de como fazer certo JÁ EXISTE na casa: `/velocidade` e o par
grounding+validador do `/geo`.

**T2 — Gates auto-referentes: o modelo se auto-avalia onde máquina verificaria.**
O audit "ainda-IA" do escritor-br é introspecção (regex pegaria); a nota do /revisar
nunca é calibrada contra o resultado real; o movimento (produto de R$ 10k) é verificado
com screenshot parado. → Princípio: **modelo cria, máquina verifica** — lib-humanizador,
QA de vídeo do scroll, calibragem juiz×resultado.

**T3 — O loop de medição vaza no encanamento.** Registro por peça fragmentado sem chave
canônica ("Validadas aqui" vazio há meses é sintoma, não preguiça); o token Meta que
publica JÁ lê insights e ninguém usa; peça quente medida 3 semanas depois; Trial Reel e
alerta proativo são decisões sem dono. → slug canônico + metricas-instagram.mjs +
check 72h + check quinzenal.

**T4 — Contratos órfãos entre skills.** /publicar referencia "janela" que o /calendario
não gera; /ads-meta manda régua que o /analisar-ads não recebe (colunas de vídeo);
3 durações de short em 3 lugares; /carteira promete dado que o /intake não coleta.
→ Cada contrato entre skills precisa das duas pontas escritas.

**T5 — Camada BR ausente no acervo.** Swipe 100% gringo; tabela de pagamento sem 12x/PIX/
boleto; sementes de fórmula 100% americanas; zero referência de copy BR. Para um produto
vendido como "premium BR", o diferencial local não está escrito.

**T6 — Bugs de código silenciosos (3).** /atualizar-motor não propaga CLAUDE.md (carimbo
de versão MENTE); lib-shorts amputa short aos 30s no meio da frase; recência fictícia
(`dias: 7` cravado) no radar de temas do YouTube.

**T7 — A joia que nenhum concorrente copia:** ponte CRM→VoC→copy (objeções e motivos de
perda reais do CRM v3 virando matéria-prima da copy). Jasper/Copy.ai não moram dentro da
operação; o ImpulsoX-OS mora.

---

## URGENTE — antes de qualquer onda (bugs + relógio)

| ☐ | Item | Eixo | Por quê agora |
|---|---|---|---|
| ☐ | `/atualizar-motor`: `CLAUDE.md` no checkout + carimbo do template + teste de aceitação | 6 | Propagação quebrada em silêncio; 2 clones esperando update — TUDO desta auditoria desce por esse cano |
| ☐ | `lib-shorts.mjs`: teto 60s + corte no fim da frase + aviso no dry-run | 5 | Bug amputa payoff de corte válido; 1 arquivo + teste |
| ☐ | `coletar-temas-yt.mjs`: upload_date real no lugar de `dias: 7` + score outlier (views ÷ mediana do canal) | 5 | Ranking roda com sinal fictício |
| ☐ | ChatGPT Ads: re-verificar tabela de países (UK/JP/KR live) + description sem estado cravado | 6 | BR abre "em semanas" — a oferta é o dia 1 |
| ☐ | `/salvar`: varredura de segredo antes do `git add -A` (`ixk_live_`, `sk-`, `Bearer `, `AKIA`) | 6 | Risco real com dono leigo; 3 linhas |
| ☐ | Corrigir citação QUEBRADA do /treinar-vendas (30%/+50% com fonte falsa) | 3 | Fonte falsa é pior que sem fonte |

## ONDA 1 — Quick-wins de custo ~zero (1 sessão, ~35 itens)

Todos os "menores" dos 6 relatórios, em lote por arquivo. Destaques:
- **Regra de conduta no CLAUDE.md**: "fato de mercado carrega (fonte, mês/ano)" + mutirão nos ~40 números órfãos (T1)
- Consentimento LGPD no /agente-ia (microcopy + {timestamp, texto} no capture)
- 3 linhas BR na tabela de pagamento da anatomia.md (12x âncora, PIX)
- Path `producao/email/`→`producao/emails/` no /conteudo; fonte no +70%/+400% do /copy
- Coluna hora + origem (hero/derivada) no /calendario; "≤24h da reunião" na /proposta
- Google Trends (script já existe) na camada 2 do /radar; honestidade da fonte 5
- Tally por fonte no banco.md do /pulso (somar, não zerar)
- Unificar 375→390px; transições no /slides; GIF no mood board da /identidade
- Uma régua de duração de short nos 3 lugares; aposentar #Shorts; disclosure IA no /thumbnail
- Texto morto "28d→7d" fora do /analisar-ads; EMQ ≥7 no /ads-meta; AI Max no /ads-google
- llms.txt rebaixado pra "aposta de custo zero"; 2,7x/3,1x com enquadre de correlação
- Foto+cargo+cidade no /provas; downsell no fecho de proposta perdida
- `--comparar-por mes` no analisar-dados.mjs; VVSA na régua de shorts

## ONDA 2 — Os dois eixos prioritários do dono ⭐

**2A — Copy (escritor-br):**
| ☐ | Item |
|---|---|
| ☐ | `scripts/lib-humanizador.mjs` + testes — vícios regexáveis + restrições duras + palavras banidas do voz.md; gate vira pass/fail com linha:coluna |
| ☐ | Tabela de vícios: onda 2025+ ("destacando/evidenciando/vale destacar/nesse sentido"), hedging enfileirado, trio adjetival, exceção meia-risca pra intervalo numérico |
| ☐ | Anti-template de LOTE no audit (peça abre/fecha igual à anterior?) |
| ☐ | Seção "e-mail legível por IA" no /email (1º parágrafo sobrevive a resumo do Gemini) + plain-text vs HTML por modo |
| ☐ | Camada BR no swipe-copy (12x, PIX, boleto, WhatsApp-CTA como mecânicas) + 2-3 sementes BR no /formulas |
| ☐ | Vídeo nativo + newsletter na tabela do /linkedin |
| ☐ | Protocolo VoC com volume (N mínimo, frequência decide headline) |

**2B — Cinematográfico (landing + reels WOW):**
| ☐ | Item |
|---|---|
| ☐ | QA de movimento: Playwright `recordVideo` do scroll (390+1440) na Etapa 4a do /pagina e no /revisar-pagina |
| ☐ | Motion tokens: seção "Movimento" no design-guide + `--dur-*`/`--ease-marca` no tokens.css; /pagina, /reel-marca, /slides consomem |
| ☐ | Biblioteca de efeitos executáveis (`premium-design/references/efeitos/` — os 10 do catálogo, license-safe, com reduced-motion) |
| ☐ | CSS scroll-driven nativo como default + View Transitions API nos docs (Barba.js aposentado) |
| ☐ | Sound design no /reel-marca: trilha ANTES do storyboard, corte no beat, SFX por código, biblioteca license-safe |
| ☐ | 2-3 direções de template no reel (calmo/enérgico/técnico) + doutrina de motion dos 3 primeiros segundos |
| ☐ | Preloader narrativo como efeito #11; completar acervo por nicho + seeds em marca/design-systems/ |

## ONDA 3 — Fechar o loop de medição (T3)

| ☐ | Item |
|---|---|
| ☐ | `scripts/metricas-instagram.mjs` (token já existe; espelho do metricas-youtube.mjs) |
| ☐ | Registro canônico por peça: slug como chave + bloco estruturado no legenda.md → publicacoes.md |
| ☐ | Check de 72h no /desempenho (peça quente + veredito Trial Reel) |
| ☐ | Calibrar o juiz: nota /revisar × resultado real → aprendizados.md |
| ☐ | Objetivo declarado da peça no pacote do /revisar (pass/fail da mecânica) |
| ☐ | Baseline no /perfil-ig; janela fixa de 7 dias no mensal |

## ONDA 4 — Comercial (fechamento + retenção)

| ☐ | Item |
|---|---|
| ☐ | /proposta: aceite digital (Clicksign/Autentique/ZapSign) + Deal no CRM (stage=proposta) |
| ☐ | /raio-x: modo auditoria PAGA (isca 1-pág vs produto completo) — a oferta Attraction do Money Model |
| ☐ | /depoimento: gatilho no marco de RESULTADO pra serviço (não deal ganho) |
| ☐ | /intake: bloco Contrato (vigência, valor, renovação) + "vitória da semana 1"; /carteira: alerta renovação ≤30d |
| ☐ | /reativar: benchmark honesto (12-18%; 4 toques) + segmento por recência + métrica própria |
| ☐ | /relatorio: check quinzenal com dono + modo --trimestral (QBR com deck via /slides) |
| ☐ | /roi: janelas casadas no lib-roi; /treinar-vendas: comprador como subagente com persona oculta |
| ☐ | Ponte CRM→VoC→copy (T7 — a joia; depende do protocolo VoC da onda 2A) |

## ONDA 5 — YouTube (quando o canal for testar de verdade)

| ☐ | Item |
|---|---|
| ☐ | Test & Compare de PACOTE (título+thumb) no /thumbnail; /roteiro-yt aponta os 3 títulos pra lá; apagar CTR 4% |
| ☐ | Ponte Shorts→long-form (related video manual) no /shorts + /publicar |
| ☐ | Seção de narração no /voz --canal (WPM 140-160, pausas, energia; teste lido em voz alta) |
| ☐ | Des-hardcodear o nicho (tema-yt lê de canal-youtube/pilares.md) |
| ☐ | Gate de saída do "em teste": 3-5 vídeos reais ponta a ponta no canal próprio |

---

## Regras da implementação

1. **Tudo é MOTOR** — nasce no template, desce via /atualizar-motor (consertar o bug dele PRIMEIRO, senão desce mentindo).
2. **Cada onda fecha com commit + CHANGELOG + bump de versão.**
3. **Script novo nasce com teste** (padrão lib-*.mjs da casa).
4. **O que os auditores mandaram NÃO mexer, não mexe** (lista em cada relatório).
5. Ao concluir onda, marcar ☑ aqui e atualizar a memória `auditoria-total-pendente`.
