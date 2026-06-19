---
name: revisar-pagina
description: >
  Use quando uma página web PRONTA precisa de olhos frios em design visual + copy antes
  de ir ao ar: "/revisar-pagina", "revisa essa página", "o que dá pra melhorar nessa
  página?", "minha página tá boa?", "revisa o design e a copy". Chamada automaticamente
  pela /publicar ANTES de uma página subir. Renderiza a página (HTML local ou URL),
  despacha o agente revisor-pagina com contexto limpo e devolve um relatório priorizado
  por severidade (Blocker / Major / Cosmetic), cada achado ancorado em regra nomeada.
  Não conserta: aponta e encaminha pra /copy, /escritor-br, /pagina ou /premium-design.
---

# /revisar-pagina: Olhos frios na página pronta (design + copy)

Quem constrói a página não enxerga o próprio ponto cego, e a IA que construiu também
aprova o que fez. Esta skill resolve com um avaliador separado, que não viu a criação:
ele julga a página pronta contra régua objetiva e devolve o que melhorar, priorizado.
Pra dono de negócio que não domina design nem copy, é a segunda opinião profissional
automática, antes da página ir ao ar.

Esta skill não conserta nada: ela aponta e encaminha pra skill que conserta.

Autoria: ImpulsoX AI. Conteúdo original.

## O que é / quando roda

Revisor de design visual + copy de uma página pronta (HTML local ou URL no ar), com
olhos frios. Dois gatilhos:

- **Automático:** a `/publicar` chama esta skill ANTES de publicar uma página. O sistema
  mostra o relatório ao dono e ESPERA o OK antes de seguir. O dono decide publicar mesmo
  com achados (a ressalva fica registrada). O sistema nunca trava no escuro: mostra,
  explica e aguarda a decisão.
- **Sob demanda:** `/revisar-pagina <arquivo ou URL>` a qualquer momento que o dono
  queira validar uma página.

**Degrau mínimo (Escada de Contexto): 1.** Precisa só da página (o HTML local ou a URL).
Sem núcleo preenchido a skill ainda roda; ver "A régua" para o que muda na saída.

## A régua (o que ler antes)

Antes de julgar, a skill carrega a régua objetiva. São os arquivos que transformam
opinião em regra nomeada:

- `marca/design-systems/`: o DNA premiado do nicho (a referência do que é nível alto).
- `marca/design-guide.md` + `marca/tokens.css`: a identidade que a página DEVERIA
  respeitar (cor, tipo, espaçamento, clima).
- `docs/persuasao.md`: gatilhos e regras de persuasão honesta.
- `docs/frase-que-pega.md`: a craft do hook/headline que gruda.
- `nucleo/voz.md`: tom, palavras e clichês banidos da marca.

Se esses arquivos faltarem (núcleo vazio), a skill cai pras heurísticas de Nielsen e
pras regras do `/copy` como régua base, e MARCA isso na saída: "sem DNA do nicho pra
comparar, review mais genérico". A revisão nunca trava por falta de régua; ela degrada
e avisa.

## Fluxo (passo a passo)

1. **Entrada.** Receber o caminho de um HTML local OU uma URL no ar.

2. **Renderizar.** Rodar o script de `references/captura-screens.md`, que gera
   `shot-mobile.png` (390px), `shot-tablet.png` (768px), `shot-desktop.png` (1440px) e
   `texto.txt` (o texto visível da página). Se o Playwright faltar (script sai com código
   2) ou a captura falhar, seguir o "Aviso de fallback" do reference: AVISAR EM VOZ ALTA e
   pedir os screenshots das 3 telas manualmente ao dono. Nunca degradar em silêncio.

3. **Ler a régua.** Carregar os arquivos da seção "A régua" acima (os que existirem).

4. **Camada DESIGN.** Orquestrar a ferramenta externa "impeccable" (heurísticas de
   Nielsen + cognitive load + flag de AI-slop) sobre os screenshots.
   - **impeccable é ferramenta de TERCEIROS.** Antes de usar com pasta de CLIENTE,
     revisar a confiança do plugin, as credenciais de provedor e as permissões de MCP
     (regra do CLAUDE.md).
   - O impeccable LÊ a marca do cliente (`design-guide.md` + `tokens.css`) e ajusta
     DENTRO dela. Nunca impõe a identidade dele: não troca paleta, fonte nem clima por
     defaults próprios. A marca é sempre a do cliente.
   - **Fallback explícito:** se o impeccable estiver indisponível, AVISAR EM VOZ ALTA e
     rodar só a camada da casa (heurísticas de Nielsen + DNA premiado de
     `marca/design-systems/`). Nunca inventar o que o impeccable teria dito.

5. **Camada COPY.** Aplicar sobre o `texto.txt`:
   - a régua do `/copy` ("vende ou descreve?": cada linha aumenta o desejo ou reduz o
     esforço/confusão; headline fraco, genérico ou que não para o dedo é achado);
   - a régua do `/escritor-br` (travessão, vícios de linguagem, cara de IA, frase
     robótica, clichês banidos).
   - SÓ APONTAR. Esta camada não reescreve nada.

6. **Despacho frio.** Despachar o agente `revisor-pagina` (via ferramenta de
   subagente/Task) com contexto LIMPO, passando: os três screenshots, o `texto.txt`, a
   régua carregada e a regra de ouro. O agente não viu a criação da página. Receber os
   achados dele já priorizados.

## A regra de ouro

> **Nenhum achado sem regra nomeada.**

Todo achado tem que apontar uma regra objetiva por nome: uma heurística de Nielsen, uma
régua do `/copy`, um princípio do DNA premiado de `marca/design-systems/`, ou a
`nucleo/voz.md`. Opinião sem regra por trás é cortada.

Por que isto é lei: estudo do Baymard Institute (citado por Jakob Nielsen) achou que IA
julgando UI por screenshot dá só 19% de sugestões boas, 9% prejudiciais e 72% de ruído.
Ancorar cada achado numa regra nomeada é exatamente o que separa review útil de ruído
convincente mas errado. Sem a âncora, o review vira parte dos 72%.

## Formato do relatório (a entrega)

O relatório vem do agente `revisor-pagina`; esta skill só formata e apresenta ao dono.
Estrutura:

- **1 linha de veredito honesto** sobre o estado da página.
- **Achados agrupados por severidade:**
  - 🔴 **Blocker**: quebra a página (texto ilegível, CTA invisível, layout estourado no
    mobile). Não pode ir ao ar assim.
  - 🟡 **Major**: atrapalha de verdade (hierarquia confusa, headline fraco, copy que
    descreve em vez de vender). Custa conversão.
  - 🟢 **Cosmetic**: polish (espaçamento irregular, micro-inconsistência). Melhora, não
    bloqueia.
- **Cada achado com 4 campos:** o quê (com a seção e a tela onde aparece) · regra
  violada (nomeada) · como consertar (a ação concreta) · quem resolve (a skill de
  destino).
- **Ordem de ataque no fim:** o que consertar primeiro, por impacto.

## Anti-duplicação (o que esta skill NÃO é)

- **Não é a `/revisar`.** Aquela julga o marketing/venda de uma peça (post, anúncio,
  proposta) com crivo de diretor de marketing. Esta julga design visual + copy de uma
  PÁGINA pronta.
- **Não é a `/raio-x`.** Aquela diagnostica a presença digital de uma empresa a partir
  da URL (SEO, redes, presença local). Esta revisa uma página específica em design+copy.
- **Não reescreve copy.** Encaminha pra `/copy` e `/escritor-br`. Aponta, não conserta.
- **Não é a verificação visual da `/pagina`.** Aquela é do próprio criador conferindo a
  obra dele nas 3 telas. Esta é olhos frios, separados, contra o DNA premiado.

Esta skill ORQUESTRA réguas e ferramentas que já existem (o script de captura, o
impeccable, as réguas do `/copy` e `/escritor-br`, o agente `revisor-pagina`). Não
reimplementa nenhuma.

## Regras

- **Não conserta.** Encaminha pra `/copy`, `/escritor-br`, `/pagina` ou `/premium-design`
  conforme o tipo do achado. A skill de destino conhece o formato e mantém a marca.
- **Escopo fechado:** design visual + copy. Não cobre conversão/UX-flow, nem
  técnico/SEO/performance. Isso é de outras skills.
- **Ferramenta de terceiros segue a regra do CLAUDE.md:** com pasta de cliente, revisar
  confiança do plugin, credenciais e permissões de MCP antes de usar o impeccable. A
  ferramenta lê a marca do cliente, nunca impõe a dela.

## Guiar pela esteira

Ao terminar, apontar o próximo passo natural e ESPERAR o sim. Não encadear sozinho pra
outra skill. Exemplo de fechamento:

> ✓ revisão pronta: 5 achados (1 🔴, 2 🟡, 2 🟢).
> → quer que eu rode `/copy` nos 2 achados críticos de copy?

No gatilho automático (chamada pela `/publicar`), o fechamento é a decisão de publicar:
mostrar o relatório e perguntar se o dono quer publicar assim mesmo, ajustar antes, ou
mandar pras skills de conserto.

## Teste de aceitação (comportamental)

1. **Página com copy fraca** (descreve o produto em vez de vender o resultado) → aparece
   um achado ancorado na régua do `/copy` ("vende ou descreve?"), com a ação de conserto
   e destino `/copy`.
2. **impeccable indisponível** → a skill avisa em voz alta e degrada pra camada da casa
   (Nielsen + DNA premiado), sem inventar o que o impeccable teria dito.
3. **Página boa** → poucos achados, nenhum achismo sem regra nomeada por trás.
4. **Chamada pela `/publicar`** → mostra o relatório completo e ESPERA o OK do dono antes
   de seguir; não publica sozinha.
5. **Núcleo sem `marca/design-systems/`** → o review roda em modo genérico (Nielsen +
   `/copy`) e MARCA na saída "sem DNA do nicho pra comparar, review mais genérico".

## Onde registrar

Esta skill é MOTOR: nasce no template ImpulsoX-OS e desce pros clones via
`/atualizar-motor`. Melhoria nela mora no template, nunca direto num clone.
