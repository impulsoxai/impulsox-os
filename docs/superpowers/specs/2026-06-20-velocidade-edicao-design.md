# Spec — Fase 1: Velocidade na edição (ImpulsoX-YT-OS)

> Primeira fatia do PRD-mãe `2026-06-20-gravacao-movimento-design.md`.
> Adiciona ao `editar-video` a edição por trechos: **acelerar / cortar fora / manter 1x**.

| | |
|---|---|
| **Status** | Rascunho para aprovação (gate: zero código até "vai") |
| **Fase** | 1 de 4 (Velocidade → Gravação → Cérebro do zoom → Moldura/fundo) |
| **Depende de** | nada — `editar-video.mjs` + `lib-edicao.mjs` já existem |
| **Plataforma** | Windows-only (MVP) |
| **Caso âncora** | Call de 40–60 min → vídeo postável de 11–20 min, voz natural |

---

## 1. Problema

Hoje o `editar-video` só corta silêncio e renderiza. Não acelera nem corta trechos
escolhidos. Uma call longa não vira conteúdo postável sem ferramenta de fora.

O `setpts` que já existe no `lib-edicao.mjs:40` **só costura os cortes de silêncio**
(zera timestamp via `PTS-STARTPTS`) — não acelera. Velocidade é recurso novo.

---

## 2. O que a Fase 1 entrega

Edição por **trechos**, cada trecho com **uma ação**:

| Ação | ffmpeg | Áudio |
|---|---|---|
| **manter 1x** | trecho intacto | voz normal |
| **acelerar Nx** | `setpts=PTS/N` (vídeo) | **por trecho:** `atempo` (voz, pitch preservado) **ou** mudo |
| **cortar fora** | trecho removido do concat | — |

- **Entrada de trechos:** linguagem natural **OU** tabela de tempos (os dois aceitos).
- **Velocidade sem trava:** qualquer fator; **aviso** acima de 2x com voz (inteligibilidade), mas obedece.
- **Fluxo:** falar → dry-run (plano em número) → aprovar/ajustar → render. Só renderiza com OK.
- **Original cru intocado.** Render gera `final.mp4` novo. Reeditável quantas vezes quiser.

---

## 3. Arquitetura — segue o padrão existente

Nada de reescrever o `editar-video`. **Estende** o que já há, no mesmo estilo
(funções puras em `lib-edicao.mjs`, orquestração no `editar-video.mjs`, dry-run por
padrão, `--confirmar` renderiza).

### 3.1 Contrato de dados — `plano-edicao.json`

A interface entre "o que o dono quer" e "o que o ffmpeg faz". Lista de trechos ordenada:

```json
{
  "trechos": [
    { "inicio": 0,    "fim": 120,  "acao": "cortar" },
    { "inicio": 120,  "fim": 480,  "acao": "manter" },
    { "inicio": 480,  "fim": 2100, "acao": "acelerar", "fator": 2, "audio": "mudo" },
    { "inicio": 2100, "fim": 2400, "acao": "manter" }
  ]
}
```

- `inicio`/`fim` em segundos. `acao` ∈ `manter | acelerar | cortar`.
- `acelerar` exige `fator` (>1) e `audio` ∈ `voz | mudo`.
- Trechos não cobertos por nenhuma regra → **`manter` por default** (nunca some conteúdo sem ordem explícita).

### 3.2 Funções puras novas (em `lib-edicao.mjs`) — testáveis sem ffmpeg

| Função | Faz |
|---|---|
| `parseTrechosTabela(texto)` | tabela `00:00–02:00 cortar` → `[{inicio,fim,acao,...}]` |
| `normalizarTrechos(trechos, duracaoTotal)` | ordena, valida sobreposição, preenche buracos com `manter`, clampa em `duracaoTotal` |
| `filtroVelocidadeConcat(trechos, {loudnorm})` | trechos → filtergraph ffmpeg (`setpts`/`atempo`/mudo/concat), análogo ao `filtroCorteConcat` existente |
| `planoVelocidade(trechos, duracaoTotal)` | resumo do dry-run: duração final, nº de trechos por ação, % cortado/acelerado, avisos (>2x com voz) |

> A **linguagem natural** (ex.: "acelera de 8 a 35 em 2x") é interpretada pelo
> assistente (eu) → vira `plano-edicao.json` → passa por `normalizarTrechos`. O parser
> determinístico cobre só a **tabela**; o natural eu traduzo e mostro no dry-run pra confirmar.

### 3.3 Orquestração (`editar-video.mjs`)

- Nova flag `--plano <plano-edicao.json>` (ou trechos vindos da conversa).
- **Ordem dura:** corte de silêncio (se ligado) **→ depois** velocidade. Os tempos dos
  trechos são informados **sobre o vídeo já sem silêncio** OU sobre o cru — definir default
  (ver §6). Proposta: trechos sobre o **cru** (o que o dono assiste), e o pipeline reconcilia.
- **Silêncio opcional:** flag `--sem-corte-silencio` (live de ensino). Sem corte, a ordem
  acima não se aplica.
- Dry-run (sem `--confirmar`) imprime o `planoVelocidade`. `--confirmar` renderiza `final.mp4`.

---

## 4. Áudio acelerado

- **voz:** `atempo` mantém o pitch. ffmpeg encadeia `atempo` pra fatores >2 (ex.: 4x = `atempo=2,atempo=2`).
- **mudo:** trilha de áudio silenciada no trecho (vídeo acelerado, sem som).
- Decisão é **por trecho** (campo `audio`), escolhida no dry-run.

---

## 5. Casos de aceite

1. **Tabela:** `08:00–35:00 2x mudo` + `00:00–02:00 cortar` → dry-run mostra duração final
   correta; render produz vídeo com aquele trecho 2x mudo e a intro removida.
2. **Natural:** "corta os 2 primeiros minutos e acelera o meio em 2x" → eu traduzo →
   dry-run bate com o pedido → render OK.
3. **Voz preservada:** trecho `acelerar 1.5x audio=voz` → áudio sai 1.5x **sem mudar o tom** (sem esquilo).
4. **Aviso >2x:** trecho `acelerar 3x audio=voz` → dry-run **avisa** "difícil de entender", mas renderiza se confirmado.
5. **Live de ensino:** `--sem-corte-silencio` + acelerar só o final → silêncio do meio **intacto**.
6. **Cru intocado:** após render, o arquivo original é byte-idêntico ao de antes.
7. **Buraco vira manter:** trechos cobrindo só parte do vídeo → o resto sai em 1x (nada some sem ordem).
8. **Reedição:** rodar de novo com plano diferente → novo `final.mp4`, sem tocar no cru.

---

## 6. Decisões abertas (resolver no plano de implementação)

- **Referencial dos tempos:** trechos informados sobre o **cru** (o que o dono vê ao revisar)
  vs. sobre o vídeo **já sem silêncio**. Proposta: sobre o cru; o pipeline corta silêncio
  primeiro e remapeia. Confirmar na implementação.
- **Conflito silêncio × trecho acelerado:** se um trecho a acelerar contém silêncio que o
  corte removeria — a remoção vem antes; o trecho acelera o que sobrou. Documentar no dry-run.
- **Formato da tabela:** separador (`–` vs `-` vs `a`), unidade (`mm:ss` vs `hh:mm:ss`).
  Aceitar os comuns; normalizar no parser.

---

## 7. Testes (TestPilot — meta 13/13)

- Unit puro: `parseTrechosTabela`, `normalizarTrechos` (sobreposição, buraco, clamp),
  `filtroVelocidadeConcat` (filtergraph esperado por ação), `planoVelocidade` (duração, avisos).
- Regressão: o corte de silêncio existente continua passando.
- Smoke ponta-a-ponta: vídeo curto de teste → plano misto (cortar+acelerar+manter) →
  render real → conferir duração final e que o cru não mudou.

---

## 8. Fora desta fase

- Gravação de tela/webcam (Fase 2).
- Auto-zoom / telemetria de cliques (Fase 3).
- Moldura/fundo (Fase 4).
- Sugestão automática de trechos a partir da transcrição/telemetria — **stub** nesta fase
  (o dono informa os trechos); a sugestão inteligente entra quando houver telemetria (pós-Fase 3).
- macOS/Linux.

---

## 9. Próximo passo

Aprovação desta spec → `writing-plans` cria o plano de implementação da Fase 1 → código.
Gate mantido: nenhuma linha até o "vai".
