# /editar-video: filler + vertical + punch-in + intro morta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar 4 melhorias de retenção ao /editar-video (remover filler words, vertical 9:16, punch-in automático, corte de intro morta), como funções puras testáveis + flags.

**Architecture:** Funções puras novas em `scripts/lib-edicao.mjs` (TDD), integradas no orquestrador `scripts/editar-video.mjs`. Reusa `palavras` ({texto,inicio,fim}) do transcrever, `keeps` ({inicio,fim}) de segmentosManter, `filtroZoompan` (regiões {inicio,fim,foco:{x,y},nivel}). Sem flags = comportamento atual.

**Tech Stack:** Node ESM, ffmpeg, Whisper local, `node --test`.

---

## File Structure

- `scripts/lib-edicao.mjs` (MODIFICAR) — `LISTA_FILLER`, `spansFiller`, `mesclarCortes`, `filtroEscala9x16`, `punchInRegioes`, `cortarIntroMorta`.
- `scripts/lib-edicao.test.mjs` (MODIFICAR) — testes das 5 funções.
- `scripts/editar-video.mjs` (MODIFICAR) — integração (filler default, --vertical, punch-in, intro morta).
- `.claude/skills/editar-video/SKILL.md` (MODIFICAR) — documentar.

---

### Task 1: `spansFiller` — acha vícios de fala isolados

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

- [ ] **Step 1: Escrever o teste falhando** (append em `scripts/lib-edicao.test.mjs`; adicionar `spansFiller, LISTA_FILLER` ao import de "./lib-edicao.mjs")

```javascript
test("spansFiller acha vício isolado entre pausas", () => {
  // "é" isolado (gap >0.3s antes e depois) -> vira span de corte
  const palavras = [
    { texto: "então", inicio: 0.0, fim: 0.4 },
    { texto: "é", inicio: 2.0, fim: 2.3 },   // isolado: 1.6s de gap antes, 1.7s depois
    { texto: "vamos", inicio: 4.0, fim: 4.5 },
  ];
  const spans = spansFiller(palavras, { gapMin: 0.3 });
  assert.equal(spans.length, 1);
  assert.deepEqual(spans[0], { inicio: 2.0, fim: 2.3 });
});

test("spansFiller ignora vício colado na fala (não isolado)", () => {
  // "tipo" sem gap suficiente antes (0.1s) -> é parte da frase, não corta
  const palavras = [
    { texto: "uma", inicio: 0.0, fim: 0.5 },
    { texto: "tipo", inicio: 0.6, fim: 0.9 },
    { texto: "de", inicio: 1.0, fim: 1.2 },
  ];
  assert.deepEqual(spansFiller(palavras, { gapMin: 0.3 }), []);
});

test("spansFiller sem vícios devolve vazio", () => {
  const palavras = [{ texto: "olá", inicio: 0, fim: 0.5 }, { texto: "mundo", inicio: 0.6, fim: 1.0 }];
  assert.deepEqual(spansFiller(palavras), []);
});

test("LISTA_FILLER contém vícios PT-BR comuns", () => {
  assert.ok(LISTA_FILLER.includes("é"));
  assert.ok(LISTA_FILLER.includes("tipo"));
  assert.ok(LISTA_FILLER.includes("né"));
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `spansFiller is not a function`.

- [ ] **Step 3: Implementar** (em `scripts/lib-edicao.mjs`, perto do topo após os outros exports)

```javascript
// Vícios de fala PT-BR (hesitações). Lista curta e SEGURA — nada que seja palavra de conteúdo
// frequente. A remoção só corta o vício quando ISOLADO (cercado de pausa), nunca no meio da frase.
export const LISTA_FILLER = ["é", "éé", "ééé", "tipo", "né", "então", "ãã", "ããã", "hum", "ahn", "eh", "tá"];

// normaliza pra comparar: minúsculo, sem pontuação nas bordas.
function _norm(t) { return String(t).toLowerCase().replace(/^[^\wçáàâãéêíóôõúü]+|[^\wçáàâãéêíóôõúü]+$/gi, ""); }

// spansFiller — acha as palavras-vício ISOLADAS (gap de silêncio >= gapMin antes E depois, ou
// borda do vídeo). Só essas viram corte. Pura. palavras = [{texto, inicio, fim}].
export function spansFiller(palavras, { lista = LISTA_FILLER, gapMin = 0.3 } = {}) {
  const set = new Set(lista.map(_norm));
  const out = [];
  for (let i = 0; i < palavras.length; i++) {
    const p = palavras[i];
    if (!set.has(_norm(p.texto))) continue;
    const gapAntes = i === 0 ? Infinity : p.inicio - palavras[i - 1].fim;
    const gapDepois = i === palavras.length - 1 ? Infinity : palavras[i + 1].inicio - p.fim;
    if (gapAntes >= gapMin && gapDepois >= gapMin) out.push({ inicio: p.inicio, fim: p.fim });
  }
  return out;
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: PASS (4 novos + existentes).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(editar-video): spansFiller — acha vícios de fala isolados"
```

---

### Task 2: `mesclarCortes` — subtrai os spans de filler dos keeps

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
test("mesclarCortes corta um span no meio de um keep, dividindo em dois", () => {
  const keeps = [{ inicio: 0, fim: 10 }];
  const out = mesclarCortes(keeps, [{ inicio: 4, fim: 5 }]);
  assert.deepEqual(out, [{ inicio: 0, fim: 4 }, { inicio: 5, fim: 10 }]);
});
test("mesclarCortes com span fora dos keeps não muda nada", () => {
  const keeps = [{ inicio: 0, fim: 3 }];
  assert.deepEqual(mesclarCortes(keeps, [{ inicio: 5, fim: 6 }]), [{ inicio: 0, fim: 3 }]);
});
test("mesclarCortes sem spans devolve os keeps iguais", () => {
  const keeps = [{ inicio: 0, fim: 3 }, { inicio: 5, fim: 8 }];
  assert.deepEqual(mesclarCortes(keeps, []), keeps);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: FAIL — `mesclarCortes is not a function`.

- [ ] **Step 3: Implementar**

```javascript
// mesclarCortes — remove os intervalos `remover` de dentro dos segmentos `keeps` (mantidos),
// devolvendo novos keeps (possivelmente divididos). Pura. Tudo em segundos.
export function mesclarCortes(keeps, remover) {
  if (!remover || remover.length === 0) return keeps.map((k) => ({ ...k }));
  let atual = keeps.map((k) => ({ ...k }));
  for (const r of remover) {
    const prox = [];
    for (const k of atual) {
      // sem sobreposição: mantém o keep inteiro
      if (r.fim <= k.inicio || r.inicio >= k.fim) { prox.push(k); continue; }
      // parte antes do corte
      if (r.inicio > k.inicio) prox.push({ inicio: k.inicio, fim: r.inicio });
      // parte depois do corte
      if (r.fim < k.fim) prox.push({ inicio: r.fim, fim: k.fim });
    }
    atual = prox;
  }
  return atual;
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(editar-video): mesclarCortes — subtrai spans dos segmentos mantidos"
```

---

### Task 3: `filtroEscala9x16` — auto-reframe vertical (crop central)

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
test("filtroEscala9x16 monta scale-cover + crop central + setsar", () => {
  const f = filtroEscala9x16({ largura: 1080, altura: 1920 });
  assert.equal(
    f,
    "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1"
  );
});
test("filtroEscala9x16 usa default 1080x1920", () => {
  assert.ok(filtroEscala9x16().includes("1080:1920"));
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementar** (perto de `filtroEscala1080p`)

```javascript
// filtroEscala9x16 — reframe vertical 9:16: escala pra COBRIR e corta a faixa central (perde as
// laterais do 16:9). Pro short. force_original_aspect_ratio=increase garante que cobre antes do crop.
export function filtroEscala9x16({ largura = 1080, altura = 1920 } = {}) {
  return `scale=${largura}:${altura}:force_original_aspect_ratio=increase,` +
    `crop=${largura}:${altura},setsar=1`;
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(editar-video): filtroEscala9x16 — auto-reframe vertical (crop central)"
```

---

### Task 4: `punchInRegioes` — zoom suave nos buracos sem clique

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
test("punchInRegioes insere zoom no buraco maior que gapMax", () => {
  // vídeo de 30s, uma região de clique em 2-4s. Buraco 4-30 (26s) > 12 -> insere punch-in.
  const existentes = [{ inicio: 2, fim: 4, foco: { x: 0.3, y: 0.3 }, nivel: 1.4 }];
  const out = punchInRegioes(30, existentes, { gapMax: 12, dur: 2.5, nivel: 1.15 });
  // mantém a região existente + pelo menos 1 punch-in no buraco
  assert.ok(out.length >= 2);
  const punch = out.find((r) => r.nivel === 1.15);
  assert.ok(punch);
  assert.deepEqual(punch.foco, { x: 0.5, y: 0.5 }); // foco central
});
test("punchInRegioes não insere quando não há buraco grande", () => {
  // vídeo curto (8s) todo coberto: sem buraco > gapMax
  const existentes = [{ inicio: 0, fim: 8, foco: { x: 0.5, y: 0.5 }, nivel: 1.4 }];
  const out = punchInRegioes(8, existentes, { gapMax: 12 });
  assert.equal(out.filter((r) => r.nivel === 1.15).length, 0);
});
test("punchInRegioes em vídeo sem regiões preenche os buracos", () => {
  const out = punchInRegioes(30, [], { gapMax: 12, dur: 2.5, nivel: 1.15 });
  assert.ok(out.length >= 1);
  assert.ok(out.every((r) => r.nivel === 1.15));
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```javascript
// punchInRegioes — preenche os "buracos" da timeline (trechos > gapMax sem nenhum zoom) com um
// punch-in suave (zoom `nivel`, duração `dur`, foco central) no meio do buraco. Combina com as
// regiões existentes (clique) sem sobrepor. Pura. Retorna a lista ordenada por inicio.
export function punchInRegioes(duracaoTotal, existentes = [], { gapMax = 12, dur = 2.5, nivel = 1.15 } = {}) {
  const ordenadas = [...existentes].sort((a, b) => a.inicio - b.inicio);
  const novas = [];
  let cursor = 0;
  const tentarBuraco = (ini, fim) => {
    if (fim - ini > gapMax) {
      const meio = (ini + fim) / 2;
      novas.push({ inicio: meio - dur / 2, fim: meio + dur / 2, foco: { x: 0.5, y: 0.5 }, nivel });
    }
  };
  for (const r of ordenadas) {
    tentarBuraco(cursor, r.inicio);
    cursor = Math.max(cursor, r.fim);
  }
  tentarBuraco(cursor, duracaoTotal);
  return [...existentes, ...novas].sort((a, b) => a.inicio - b.inicio);
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(editar-video): punchInRegioes — zoom suave nos trechos sem clique"
```

---

### Task 5: `cortarIntroMorta` — remove o silêncio inicial sempre

**Files:**
- Modify: `scripts/lib-edicao.mjs`
- Test: `scripts/lib-edicao.test.mjs`

- [ ] **Step 1: Escrever o teste falhando**

```javascript
test("cortarIntroMorta avança o 1º keep até pouco antes da 1ª fala", () => {
  const keeps = [{ inicio: 0, fim: 20 }];
  const out = cortarIntroMorta(keeps, 4.0, { margem: 0.3 });
  assert.equal(out[0].inicio, 3.7); // 4.0 - 0.3
  assert.equal(out[0].fim, 20);
});
test("cortarIntroMorta não mexe quando o vídeo já começa falando", () => {
  const keeps = [{ inicio: 0, fim: 20 }];
  const out = cortarIntroMorta(keeps, 0.2, { margem: 0.3 });
  assert.equal(out[0].inicio, 0); // 0.2-0.3 < 0, não avança
});
test("cortarIntroMorta sem fala (primeiraFalaSeg null) não mexe", () => {
  const keeps = [{ inicio: 0, fim: 20 }];
  assert.deepEqual(cortarIntroMorta(keeps, null), keeps);
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```javascript
// cortarIntroMorta — se o vídeo começa com silêncio antes da 1ª palavra falada, avança o início
// do 1º segmento mantido pra pouco antes da fala (deixa `margem` de respiro). Roda SEMPRE — a
// intro morta nunca deve ficar, nem em live de ensino. Pura. primeiraFalaSeg null/undefined = sem fala.
export function cortarIntroMorta(keeps, primeiraFalaSeg, { margem = 0.3 } = {}) {
  if (primeiraFalaSeg == null || keeps.length === 0) return keeps.map((k) => ({ ...k }));
  const alvo = primeiraFalaSeg - margem;
  const out = keeps.map((k) => ({ ...k }));
  if (alvo > out[0].inicio && alvo < out[0].fim) out[0].inicio = alvo;
  return out;
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --test scripts/lib-edicao.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib-edicao.mjs scripts/lib-edicao.test.mjs
git commit -m "feat(editar-video): cortarIntroMorta — remove o silêncio inicial sempre"
```

---

### Task 6: Integrar no editar-video.mjs

**Files:**
- Modify: `scripts/editar-video.mjs`

> Integração de I/O — sem unit test; verificado por dry-run e syntax-load. As funções puras têm teste (Tasks 1-5).

- [ ] **Step 1: Importar as funções novas**

No import de `./lib-edicao.mjs` (linha 14), adicionar: `spansFiller, mesclarCortes, filtroEscala9x16, punchInRegioes, cortarIntroMorta`.

- [ ] **Step 2: Ler a flag --vertical**

Onde as flags são lidas (perto do topo do bloco `if (import.meta.main)`), adicionar:
```javascript
  const vertical = has("--vertical");
```
(usar o helper `has` existente.)

- [ ] **Step 3: Aplicar filler + intro morta nos keeps (após transcrever)**

No fluxo de render (a parte async, depois de `transcrever` produzir `palavras` e antes de montar
o filtro de corte/concat), localizar onde `segmentosManter` gera os keeps. Logo após ter `palavras`
e os `keeps`, inserir:
```javascript
      // filler words: remove vícios isolados (conservador). intro morta: corta silêncio inicial sempre.
      let keepsFinais = keeps;
      if (palavras && palavras.length) {
        const fillers = spansFiller(palavras);
        if (fillers.length) {
          keepsFinais = mesclarCortes(keepsFinais, fillers);
          console.error(`• ${fillers.length} vício(s) de fala removido(s).`);
        }
        keepsFinais = cortarIntroMorta(keepsFinais, palavras[0].inicio);
      }
```
E usar `keepsFinais` (em vez de `keeps`) na chamada que monta o corte/concat do vídeo.

> NOTA: confirmar no arquivo o nome exato da variável dos keeps e onde o corte é montado. Como o
> editar-video tem o passo de corte de silêncio ANTES da transcrição em alguns fluxos, aplicar o
> filler/intro-morta no ponto onde tanto `palavras` quanto os keeps já existem. Se a ordem atual
> dificultar, o filler vira um corte adicional aplicado sobre o vídeo já cortado por trechos —
> seguir o padrão do arquivo, NÃO inventar reordenação grande. Intro morta roda mesmo com
> `--sem-corte-silencio` (é o requisito): garantir que a chamada de `cortarIntroMorta` não esteja
> dentro do `if (!semCorteSilencio)`.

- [ ] **Step 4: Aplicar --vertical no render do corpo**

Onde o corpo é escalado (hoje `filtroEscala1080p()`), trocar por condicional:
```javascript
      const filtroEscala = vertical ? filtroEscala9x16() : filtroEscala1080p();
```
e usar `filtroEscala` no lugar de `filtroEscala1080p()` na montagem dos filtros do corpo. Quando
`--vertical`, o zoompan/legenda devem usar 1080x1920 — passar `{ largura: 1080, altura: 1920 }`
pro `filtroZoompan` nesse caso (hoje passa 1920x1080).

- [ ] **Step 5: Aplicar punch-in nas regiões de zoom**

Onde as regiões de zoom são carregadas (quando `modoZoom === "auto"` e há `regioes-zoom.json`),
após obter `regioes`, passar por:
```javascript
        const regioesComPunch = punchInRegioes(duracaoTotal, regioes || []);
        zoomFiltro = filtroZoompan(regioesComPunch, { fps: 30, largura: vertical ? 1080 : 1920, altura: vertical ? 1920 : 1080 });
```
(substituindo a montagem direta de `filtroZoompan(regioes, ...)`).

- [ ] **Step 6: Verificar carga + dry-run + testes puros**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && node --check scripts/editar-video.mjs && node --test scripts/lib-edicao.test.mjs 2>&1 | grep -iE "pass|fail"`
Expected: sem erro de sintaxe; testes das funções puras verdes.

- [ ] **Step 7: Commit**

```bash
git add scripts/editar-video.mjs
git commit -m "feat(editar-video): filler removal + --vertical + punch-in + intro morta"
```

---

### Task 7: Documentar no SKILL.md

**Files:**
- Modify: `.claude/skills/editar-video/SKILL.md`

- [ ] **Step 1: Adicionar a documentação**

Em `.claude/skills/editar-video/SKILL.md`, adicionar uma seção:

```markdown
## Retenção: vícios de fala, vertical, punch-in, intro morta

Quatro automações que separam edição amadora de profissional (pesquisa OpusClip, 13.5M clips):

- **Vícios de fala removidos** — "é", "tipo", "né", "então" ditos ISOLADOS (entre pausas) são
  cortados junto com o silêncio. Conservador: nunca corta um "tipo" no meio de frase. O dry-run
  mostra quantos saíram.
- **Vertical (`--vertical`)** — gera o short em 9:16 (1080x1920) com crop central (pega a faixa
  do meio). Sem a flag, sai 16:9 como antes. (Reframe com rosto/webcam = refinamento futuro.)
- **Punch-in automático** — em trechos longos sem clique (>12s parado), entra um zoom suave
  (1.15x, ~2.5s) pra resetar a atenção. Só preenche os buracos; onde já há zoom de clique, mantém.
- **Intro morta cortada sempre** — se o vídeo começa com silêncio antes da 1ª fala, esse pedaço
  é removido mesmo com `--sem-corte-silencio` (a pausa do meio pode ser proposital; a intro morta
  nunca). Hook colado no começo retém mais.
```

- [ ] **Step 2: Verificar**

Run: `cd "C:/Users/ACER/Desktop/ImpulsoX-OS" && grep -n "Vícios de fala\|--vertical\|Punch-in\|Intro morta" .claude/skills/editar-video/SKILL.md`
Expected: as linhas inseridas aparecem.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/editar-video/SKILL.md
git commit -m "docs(editar-video): documenta filler, vertical, punch-in, intro morta"
```

---

## Self-Review (preenchido)

**Spec coverage:**
- Filler words (spansFiller + mesclarCortes, conservador/isolado) → Tasks 1, 2, 6. ✓
- --vertical (filtroEscala9x16, crop central, sem bolha) → Tasks 3, 6. ✓
- Punch-in (punchInRegioes, preenche buracos >12s) → Tasks 4, 6. ✓
- Intro morta (cortarIntroMorta, sempre, até com --sem-corte-silencio) → Tasks 5, 6 (nota explícita). ✓
- Doc → Task 7. ✓
- Zero regressão (sem flags = atual) → Task 6 (condicionais), garantido.

**Placeholder scan:** sem TBD/TODO. A Task 6 Step 3 tem uma NOTA de cuidado (confirmar nome da
var dos keeps e ordem do fluxo no arquivo, NÃO reordenar grande) — é instrução de integração
cuidadosa, não placeholder; o código a inserir está completo.

**Type consistency:** `spansFiller(palavras)→[{inicio,fim}]`, `mesclarCortes(keeps, remover)→keeps`,
`filtroEscala9x16({largura,altura})→string`, `punchInRegioes(dur, existentes, opts)→[{inicio,fim,
foco:{x,y},nivel}]` (mesmo formato que filtroZoompan consome), `cortarIntroMorta(keeps,
primeiraFalaSeg)→keeps`. Campos: keeps `{inicio,fim}`, palavras `{texto,inicio,fim}`, regiões
`{inicio,fim,foco:{x,y},nivel}` — batem com o código existente (segmentosManter, transcrever,
filtroZoompan).
