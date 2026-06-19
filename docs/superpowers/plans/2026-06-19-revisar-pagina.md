# /revisar-pagina — Plano de Implementação

> **For agentic workers:** este plano constrói uma SKILL do ImpulsoX-OS (documento de
> instrução para a IA), não código de app. Não há TDD com pytest: a validação é
> **comportamental** (rodar a skill numa página real e conferir o relatório), o padrão das
> demais skills do sistema. Steps usam checkbox (`- [ ]`).

**Goal:** Criar a skill `/revisar-pagina` que revisa uma página pronta (HTML local ou URL) em
design visual e copy, com olhos frios e régua nomeada, e devolve um relatório priorizado.

**Architecture:** Três artefatos. (1) Um agente frio em `.claude/agents/revisor-pagina.md`
que julga design+copy contra régua nomeada e nunca inventa achado. (2) A skill
`.claude/skills/revisar-pagina/SKILL.md` que orquestra: renderiza (Playwright 390/768/1440),
lê a régua, dispara o agente, monta o relatório, orquestra o impeccable com fallback. (3) Plug
na `/publicar` como gate pré-deploy (mostra relatório, espera OK). Nasce no template
ImpulsoX-OS; desce pros clones via `/atualizar-motor`.

**Tech Stack:** Markdown (SKILL.md + agente). Playwright (já usado por `/pagina` e
`/premium-design`). impeccable (plugin de terceiros, com fallback). Sem dependências novas.

---

## Estrutura de arquivos

- Create: `.claude/agents/revisor-pagina.md` — o avaliador frio (design + copy, régua nomeada).
- Create: `.claude/skills/revisar-pagina/SKILL.md` — a skill orquestradora.
- Create: `.claude/skills/revisar-pagina/references/captura-screens.md` — o script Playwright
  390/768/1440 + limpeza (reaproveita o padrão de `/premium-design/references/captura.md`).
- Modify: `.claude/skills/publicar/SKILL.md` — plugar o gate pré-deploy (mostra relatório,
  espera OK).
- Modify: `CLAUDE.md` ou `README.md` (lista de automações) — registrar a skill no fluxo.

Cada arquivo tem uma responsabilidade: o agente julga, a skill orquestra, o reference guarda
o script, a `/publicar` chama. Isolados e testáveis um a um.

---

### Task 1: Agente frio `revisor-pagina`

**Files:**
- Create: `.claude/agents/revisor-pagina.md`

- [ ] **Step 1: Escrever o agente** com frontmatter (name, description, tools restritos a
  leitura: Read, Grep, Glob — o agente NÃO edita nada) e o corpo definindo o papel.

Conteúdo obrigatório do corpo:
- **Papel:** diretor de arte sênior + redator sênior, olhos frios. Recebe só os screenshots
  (390/768/1440), o texto extraído da página, e a régua. Não viu a criação da página.
- **A regra de ouro (literal):** "Nenhum achado sem regra nomeada. Só reporto um problema se
  ele violar uma regra objetiva que eu cito: heurística de Nielsen (listar as 10), regra do
  /copy (vende ou descreve; Desejo − (Esforço + Confusão)), princípio do DNA premiado, ou a
  voz.md. Opinião sem regra por trás é cortada. Prefiro reportar 5 achados ancorados a 20
  achismos." Justificativa embutida: estudo Baymard/Nielsen — IA julgando UI por screenshot
  acerta só 19%; ancorar em regra é o que separa review útil de ruído.
- **Severidade (escala Nielsen):** 🔴 Blocker (quebra a página) · 🟡 Major (atrapalha de
  verdade) · 🟢 Cosmetic (polish).
- **Formato de cada achado (4 campos):** O quê (concreto, com seção/tela) · Regra violada
  (nomeada) · Como consertar · Quem resolve (skill de destino).
- **Saída:** 1 linha de veredito honesto no topo + achados por severidade + ordem de ataque
  no fim. Sem reescrever copy (só apontar). Sem floreio.
- **As 10 heurísticas de Nielsen** listadas por nome (visibilidade do status, correspondência
  com o mundo real, controle do usuário, consistência, prevenção de erro, reconhecer em vez
  de lembrar, flexibilidade, estético e minimalista, recuperação de erro, ajuda).

- [ ] **Step 2: Validar (comportamental)** — abrir o arquivo e conferir o checklist:
  - frontmatter tem `tools` só de leitura (sem Edit/Write)?
  - a regra de ouro está literal e citável?
  - as 10 heurísticas estão nomeadas?
  - o formato de 4 campos por achado está explícito?

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/revisor-pagina.md
git commit -m "feat(agente): revisor-pagina — avaliador frio design+copy com régua nomeada"
```

---

### Task 2: Reference do script de captura

**Files:**
- Create: `.claude/skills/revisar-pagina/references/captura-screens.md`

- [ ] **Step 1: Escrever o reference** com o script Playwright que: aceita arquivo local
  (`file://`) OU URL; renderiza em 390, 768 e 1440px; rola a página inteira (dispara
  lazy-load/animações); salva 1 screenshot full-page por largura. Reaproveitar o padrão de
  `.claude/skills/premium-design/references/captura.md` (mesmo install, mesmo fallback de
  aviso em voz alta se Playwright faltar). Incluir o passo de extrair o texto visível da
  página (pra camada de copy) via `document.body.innerText` ou grep do HTML.

Script (Node, sem deps além de playwright):

```javascript
// captura-screens.js — screenshots 390/768/1440 + texto da página (local ou URL)
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) {
  console.error('Playwright indisponível, usando captura manual');
  console.error('Instale: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}
(async () => {
  const alvo = process.argv[2];                 // caminho local ou URL
  const outDir = process.argv[3] || '.';
  const url = alvo.startsWith('http') ? alvo : 'file:///' + alvo.split('\\').join('/');
  const browser = await chromium.launch();
  const sizes = [[390,844,'mobile'],[768,1024,'tablet'],[1440,900,'desktop']];
  let texto = '';
  for (const [w,h,nome] of sizes) {
    const page = await browser.newPage({ viewport:{width:w,height:h} });
    await page.goto(url, { waitUntil:'networkidle', timeout:60000 });
    await page.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));} window.scrollTo(0,0); });
    await page.screenshot({ path: outDir+'/shot-'+nome+'.png', fullPage:true });
    if (!texto) texto = await page.evaluate(()=>document.body.innerText);
    await page.close();
  }
  require('fs').writeFileSync(outDir+'/texto.txt', texto);
  await browser.close();
  console.log('OK screenshots + texto.txt em ' + outDir);
})().catch(e=>{ console.error('CAPTURA FALHOU:', e.message); process.exit(1); });
```

Documentar: se sair com código 2 (Playwright ausente), a skill avisa em voz alta e pede ao
usuário rodar o install ou fornecer os screenshots manualmente. Nunca degradar calado.

- [ ] **Step 2: Validar** — rodar o script numa página de teste (uma das demos do clone ou
  qualquer HTML) e conferir que gera `shot-mobile/tablet/desktop.png` + `texto.txt`.

```bash
node .claude/skills/revisar-pagina/references/captura-screens.js <html-de-teste> /tmp/rev-teste
ls /tmp/rev-teste   # espera: shot-mobile.png shot-tablet.png shot-desktop.png texto.txt
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/revisar-pagina/references/captura-screens.md
git commit -m "feat(revisar-pagina): reference do script de captura 390/768/1440 + texto"
```

---

### Task 3: A skill orquestradora `SKILL.md`

**Files:**
- Create: `.claude/skills/revisar-pagina/SKILL.md`

- [ ] **Step 1: Escrever o frontmatter** (name: revisar-pagina; description com os gatilhos:
  "/revisar-pagina", "revisa essa página", "o que melhorar nessa página", "minha página tá
  boa?", chamada pela /publicar antes de publicar).

- [ ] **Step 2: Escrever o corpo da skill** com as seções, na ordem:

  1. **O que é / quando roda** — revisor de design+copy de uma página pronta; gatilho
     automático pela `/publicar` (mostra relatório, espera OK) + sob demanda. Degrau mínimo 1.
  2. **A régua (o que ler antes)** — `marca/design-systems/` (DNA do nicho), `marca/design-guide.md`
     + `tokens.css` (identidade a respeitar), `docs/persuasao.md`, `docs/frase-que-pega.md`,
     `nucleo/voz.md`. Sem esses, cai pra Nielsen + regras do /copy e marca "review genérico".
  3. **Fluxo (passo a passo):**
     - Entrada: HTML local ou URL.
     - Renderiza com o script de `references/captura-screens.md` (3 telas + texto).
     - **Camada DESIGN:** orquestrar o impeccable (heurísticas Nielsen + cognitive load +
       AI-slop). Antes de usar com pasta de cliente: revisar confiança/credenciais/permissões
       (regra do CLAUDE.md). O impeccable lê a marca do cliente, nunca impõe a dele. Fallback
       explícito: impeccable indisponível → avisar em voz alta e rodar só a camada da casa
       (Nielsen + DNA premiado), sem inventar o que ele faria.
     - **Camada COPY:** aplicar as réguas de `/copy` (vende ou descreve?) e `/escritor-br`
       (travessão, cara-de-IA, vícios) sobre `texto.txt`. Só apontar, não reescrever.
     - **Despacho frio:** dispatch do agente `revisor-pagina` (Task 1) com contexto limpo —
       passar os screenshots + texto + régua + a regra de ouro. Receber os achados.
  4. **A regra de ouro (repetir literal na skill):** nenhum achado sem regra nomeada — é o que
     evita os 72% de ruído (citar Baymard/Nielsen).
  5. **Formato do relatório:** veredito (1 linha) + achados por severidade (🔴🟡🟢), cada um
     com os 4 campos (o quê · regra violada · como consertar · quem resolve) + ordem de ataque.
  6. **Anti-duplicação** (tabela do spec): não é `/revisar` (marketing), nem `/raio-x`
     (presença digital), nem reescreve copy, nem é a verificação da `/pagina`.
  7. **Regras:** não conserta (encaminha pra `/copy`, `/pagina`, `/premium-design`). Não
     cobre conversão/UX-flow nem técnico/SEO. Ferramenta de terceiros segue a regra do CLAUDE.md.
  8. **Guiar pela esteira:** ao terminar, apontar o próximo passo (ex.: "→ 2 achados críticos
     de copy: quer que eu rode `/copy` neles?") e esperar o sim.
  9. **Teste de aceitação (comportamental):** listar 4-5 casos (página com copy fraca → achado
     ancorado em regra /copy aparece; impeccable ausente → avisa e degrada; página boa → poucos
     achados, sem achismo; chamada pela /publicar → mostra relatório e espera OK).
  10. **Onde registrar:** motor; nasce no template, desce via `/atualizar-motor`.

- [ ] **Step 3: Validar (comportamental)** — rodar a skill mentalmente contra uma das 3 demos
  do clone (ex.: pedir review da home). Conferir: ela renderiza, lê a régua, dispara o agente,
  e o relatório tem veredito + achados com os 4 campos + cada achado cita uma regra. Nenhum
  achado sem regra. Confirmar que o fallback do impeccable está descrito.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/revisar-pagina/SKILL.md
git commit -m "feat(skill): /revisar-pagina — orquestra captura, impeccable, régua e agente frio"
```

---

### Task 4: Plug na `/publicar` (gate pré-deploy)

**Files:**
- Modify: `.claude/skills/publicar/SKILL.md`

- [ ] **Step 1: Ler a `/publicar`** e achar o ponto antes do deploy efetivo.

```bash
grep -n "deploy\|publicar\|antes de\|vercel\|subir" .claude/skills/publicar/SKILL.md | head
```

- [ ] **Step 2: Inserir o gate** — um bloco que, antes de publicar uma página, chama
  `/revisar-pagina` na página alvo, mostra o relatório ao dono, e **espera o OK** pra seguir.
  Texto a inserir (adaptar ao tom da `/publicar`):

```markdown
## Antes de publicar página — revisão de olhos frios (gate)

Se o que vai ao ar é uma página (landing/site), rodar `/revisar-pagina` nela primeiro.
Mostrar o relatório priorizado ao dono e **esperar o OK** antes de publicar. O dono decide
publicar mesmo com achados — o gate informa, não trava no escuro (regra do CLAUDE.md: sempre
perguntar antes de seguir). Achado crítico de copy/design → oferecer rodar `/copy` ou
`/pagina` antes de subir.
```

- [ ] **Step 3: Validar** — conferir que o bloco entrou no ponto certo (antes do deploy) e que
  o fluxo "revisar → mostrar → esperar OK → publicar" está claro.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/publicar/SKILL.md
git commit -m "feat(publicar): gate de /revisar-pagina antes de publicar página"
```

---

### Task 5: Registrar a skill no mapa do sistema

**Files:**
- Modify: `CLAUDE.md` (ou `README.md` / `docs/mapa-de-skills.md` — o que listar automações)

- [ ] **Step 1: Achar a lista de automações/mapa de skills.**

```bash
grep -rln "mapa-de-skills\|lista de automações\|/revisar\b" CLAUDE.md README.md docs/ | head
```

- [ ] **Step 2: Adicionar a linha** de `/revisar-pagina` na seção certa (revisão/qualidade,
  perto de `/revisar`), descrevendo: revisa design+copy de uma página pronta, olhos frios,
  régua nomeada, gate pré-publicação.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md docs/
git commit -m "docs: registra /revisar-pagina no mapa de skills"
```

---

## Self-Review (rodado pelo autor do plano)

**1. Cobertura do spec:**
- Blindagem (regra nomeada) → Task 1 (agente) + Task 3 (skill repete). ✓
- Renderizar 390/768/1440 + texto → Task 2. ✓
- Camada design (orquestra impeccable + fallback) → Task 3. ✓
- Camada copy (réguas /copy + /escritor-br, só aponta) → Task 1 + Task 3. ✓
- Relatório priorizado (veredito + severidade + 4 campos) → Task 1 + Task 3. ✓
- Régua = DNA premiado + docs → Task 3 (seção régua). ✓
- Agente frio → Task 1. ✓
- Gatilho automático pré-publicar (espera OK) → Task 4. ✓
- Sob demanda → Task 3 (frontmatter/gatilhos). ✓
- Anti-duplicação → Task 3 (seção). ✓
- Ferramenta de terceiros (regra CLAUDE.md) → Task 3. ✓
- Degrau mínimo 1 → Task 3. ✓
- Onde registrar (motor/template) → Task 5. ✓

**2. Placeholders:** nenhum TBD/TODO; o script está completo; o conteúdo de cada artefato está
descrito com o que precisa conter. (Os corpos de SKILL.md/agente são prosa de instrução, não
código — descritos por seção obrigatória, que é o "código" deste domínio.)

**3. Consistência de nomes:** `revisor-pagina` (agente) × `revisar-pagina` (skill) — proposital
e consistente em todas as tasks (agente = substantivo, skill = verbo, padrão do sistema:
`revisor-marketing`/`/revisar`). Script `captura-screens.js` citado igual em Task 2 e 3.
Artefatos de saída (`shot-mobile/tablet/desktop.png`, `texto.txt`) idênticos entre Task 2 e 3.
