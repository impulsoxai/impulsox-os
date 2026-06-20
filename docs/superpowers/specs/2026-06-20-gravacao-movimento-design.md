# PRD-mãe — Gravação & Movimento no ImpulsoX-YT-OS

> Port headless do Recordly para dentro do pipeline. Documento guarda-chuva das 4 fases.

| | |
|---|---|
| **Status** | Aprovado (visão/arquitetura/escopo/faseamento). Specs de fase abrem a seguir; gate de código mantido por fase. |
| **Tipo** | PRD-mãe (visão completa). Cada fase ganha spec própria depois. |
| **Local** | `docs/superpowers/specs/` |
| **Fonte** | Recordly (Electron, AGPL-3.0) → `zoomSuggestionUtils.ts` |
| **Alvo** | ImpulsoX-YT-OS (pipeline headless ffmpeg/whisper) |
| **Pré-requisito p/ implementar** | Aprovação deste PRD → spec de fase → plano → código |

---

## 1. Contexto e problema

O ImpulsoX-YT-OS já é um pipeline completo e headless:

```
tema-yt → roteiro-yt → editar-video → shorts → publicar-youtube → desempenho-yt
```

**O buraco:** não existe a etapa de *gravar a tela com polimento*. O `editar-video/SKILL.md:31` literalmente assume "a gravação existe? pedir o caminho do arquivo" — ou seja, hoje você grava com uma ferramenta de fora e joga o `.mp4` pronto no pipeline. Não há captura própria, nem auto-zoom, nem aceleração de velocidade.

O **Recordly** (app Electron de desktop, AGPL-3.0) preenche exatamente esse "passo zero". Ele tem 4 motores:

1. **Captura** — nativa por SO (macOS ScreenCaptureKit, Windows WGC) + telemetria do cursor (`uiohook-napi`): cada clique/movimento/arraste com timestamp + x/y normalizado + tipo de interação.
2. **Cérebro do auto-zoom** (`zoomSuggestionUtils.ts`) — funções puras em TS. Telemetria → agrupa cliques → cospe regiões `{start, end, focus}` e classifica o tipo (dropdown, seleção-de-texto, campo). **Zero dependência nativa. É a parte portável e é o que importa.**
3. **Render** — PixiJS/WebGL (canvas GPU): zoom animado, motion blur, overlay de cursor, fundo/padding/sombra. **Só roda em browser** — não em ffmpeg headless.
4. Webcam bubble, timeline, export MP4/GIF, marketplace.

---

## 2. Objetivo

Adicionar ao ImpulsoX-YT-OS a capacidade de **gravar tela + rosto, acelerar e aplicar auto-zoom**, 100% dentro do pipeline headless, **portando o cérebro do Recordly** em vez de acoplar o app.

Resultado prático imediato: uma call de 40 min vira um vídeo postável de 13–20 min, com voz natural, zoom certo nos cliques e o polimento que já existe (corte de silêncio, legenda karaokê, −14 LUFS).

---

## 3. Decisão de arquitetura (a parte honesta)

Recordly e ImpulsoX-YT-OS nasceram de filosofias opostas. **Não dá pra "colar" o Recordly dentro do OS.**

| | Recordly | ImpulsoX-YT-OS |
|---|---|---|
| Runtime | App Electron GUI, usuário clica | Scripts headless (`node ...mjs`) |
| Render | PixiJS / WebGL (canvas GPU) | Filtergraph ffmpeg |
| Uso | Pessoa grava + edita ao vivo | Pipeline roda sem supervisão |

Foram considerados 3 caminhos:

- **Recordly expor MCP/CLI** — não existe; exigiria fork + construir dentro do código dele.
- **Automação de tela** (Playwright/uiohook dirigindo a janela por fora) — frágil, quebra a cada update do app.
- **✅ Portar a lógica para dentro do OS (Caminho A)** — não preciso "controlar o Recordly"; eu *viro* o Recordly, headless.

**Decisão: Caminho A.** Copio só as funções puras de `zoomSuggestionUtils.ts` (TS limpo), construo a captura via ffmpeg, e aplico zoom via `zoompan` no `editar-video`. O render PixiJS (animação fina) fica de fora por construção — depende de GPU/tempo-real.

> ⚠️ **Nota de controle:** diferente do Open Design (servidor MCP que me deu "mãos"), o Recordly é app de desktop sem MCP/API/CLI. Eu consigo *abrir* o processo, mas não *operar* a UI dele. Por isso o valor vem de portar o cérebro, não de pilotar o app.

---

## 4. Escopo

### 4.1 Dentro do escopo (reproduzo headless)

| Recurso | Como |
|---|---|
| Gravar tela | ffmpeg `gdigrab` (Windows) |
| Gravar webcam + bolha no canto | ffmpeg `dshow` + filtro `overlay` |
| Bolha redonda + sombra + posição | filtros ffmpeg |
| Telemetria de cliques | hook local (`uiohook-napi` ou equivalente) → `telemetria.json` |
| Onde/quando dar zoom (cérebro) | portar funções puras do `zoomSuggestionUtils.ts` |
| Zoom nos cliques | ffmpeg `zoompan` nos focos que o cérebro cospe |
| Velocidade global e por trecho | ffmpeg `setpts` (vídeo) + `atempo` (áudio, mantém pitch) |
| Fundo/wallpaper + padding + cantos | ffmpeg (esforço médio) |
| Corte de silêncio, legenda karaokê, −14 LUFS | **já existe** no `editar-video` |

### 4.2 Fora do escopo (o "luxo de movimento" do PixiJS)

Tudo que depende de render GPU em tempo real. Não é o que prende espectador.

| Recurso | Reproduz? | Por quê fica de fora |
|---|---|---|
| Cursor suavizado (spring/smoothing) | ❌ | Física de mola por frame, GPU |
| Motion blur no zoom/pan | ❌ | Filtro PixiJS por frame |
| Cursor bounce no clique | ❌ | Animação GPU sincronizada ao clique |
| Cursor estilizado (overlay macOS) | ⚠️ muito difícil | Esconder cursor real + desenhar falso seguindo telemetria |
| Curva de zoom suave (ease in/out) | ⚠️ parcial | `zoompan` faz zoom, mas a curva é mais dura que PixiJS — aceitável, não idêntico |
| Webcam zoom-reativa (bolha cresce no zoom) | ⚠️ difícil | Sincronizar bolha à câmera frame-a-frame |
| Timeline visual / preview ao vivo | ❌ | É GUI; sou headless. Trabalho por marcadores, não arrastando |

### 4.3 Veredito de escopo

**~90% do valor visível sem o Recordly.** Os 10% que ficam de fora são polimento de animação fina — bonito, mas não é o que retém. O que retém é **zoom certo na hora certa + legenda + ritmo**, e isso o pipeline entrega.

---

## 5. Decisões de produto travadas neste PRD

1. **Caminho A** (portar cérebro + construir captura headless) — confirmado.
2. **Velocidade tem dois sabores:** global (acelera tudo) **e** por trecho ("speed regions" — acelera só as partes chatas, mantém a fala em 1x). MVP da Fase 1 entrega global; por-trecho é o alvo completo da fase.
3. **Ordem de pipeline obrigatória:** **corta silêncio → depois acelera o que sobrou.** Rodar junto "burro" briga (acelerar já encurta pausas). Tratado no `editar-video`.
4. **Gravação ≠ edição — sempre separadas.** Gravar só captura e salva o **original cru, intocado**. A edição roda DEPOIS, em cima do cru, e **sempre gera arquivo novo** (nunca sobrescreve o original). Consequência: o dono nunca "esquece de marcar e perde" — reeditável quantas vezes quiser.
5. **Toda decisão de edição é na REVISÃO, não na gravação.** Nada (corte de silêncio, velocidade, trechos) é decidido no momento de gravar. O dono assiste/decide depois, com o vídeo na frente. Não há "default que decide no escuro".
6. **Fluxo de edição = falar → dry-run → aprovar → render:**
   - (a) **Dono fala** o que quer ("corta o silêncio, acelera de 8min a 35min em 2x, tira a intro" — ou "é uma live, não corta nada, só acelera o final").
   - (b) **Dry-run:** o `editar-video` mostra o PLANO em número, SEM renderizar ("tiro 1min30 de silêncio + acelero o trecho → call de 60min vira 18min. Confere?").
   - (c) **Dono aprova ou ajusta** — ajuste refaz o dry-run (barato, nada renderizado ainda).
   - (d) **Render só com o OK.** Gera o vídeo novo; cru intocado.
   - **Dois detalhes confirmados:** (i) se o dono não souber o que quer, o sistema **sugere** ("essa call tem 20min de silêncio/enrolação, recomendo cortar X e acelerar Y") e ele decide em cima; (ii) **reeditável sempre** — novo pedido → novo dry-run → novo render, cru nunca some.
7. **Corte de silêncio é OPCIONAL, decidido na revisão (§6), não fixo.** Pra **live de ensino** o dono manda não cortar — a pausa do professor (pensar, respirar, deixar o aluno acompanhar) é proposital. Com o corte desligado, a regra de ordem (§3) não se aplica àquele vídeo.
8. **Modelo de edição = vídeo dividido em trechos, cada trecho com uma ação:** **acelerar** (1,5x/2x/4x), **cortar fora** (remove), ou **manter 1x**. Não é "tudo ou nada". É o coração da Fase 1 e resolve call de 1h → highlights (ex.: 1h → ~11min). Como o dono informa os trechos (por tempo vs. por marcador) fica na spec da Fase 1.
9. **MVP Windows-only.** `gdigrab`/`dshow` são Windows; macOS (`avfoundation`)/Linux (`x11grab`) ficam como futuro registrado, fora do MVP.
10. **Métricas: opção A** — rascunho do §10 aceito como norte; cada fase refina os seus critérios na spec dela (a métrica de auto-zoom vira concreta — X e N — na spec da Fase 3).
11. **Transcript da call = Whisper LOCAL** (`transcrever-local.mjs`, já pronto). Grátis, 100% offline — call de cliente não vaza pra nuvem. Um transcript, três usos: legenda karaokê, texto/ata, e pontos pra sugerir cortes. Diarização (quem-falou-quando) o Whisper puro não faz → item futuro (AssemblyAI/Deepgram, pago/nuvem).
4. **Contrato de artefatos** (estilo JSON-canônico do ImpulsoX):
   - `/gravar-tela` produz `gravacao.mp4` + `telemetria.json` (+ webcam separada ou já composta — ver §8 decisões abertas).
   - `lib-zoom.mjs` lê `telemetria.json` → emite `regioes-zoom.json` (`{start, end, focus, tipo}`).
   - `editar-video` consome `gravacao.mp4` + `regioes-zoom.json` → aplica `zoompan` + polimento existente + velocidade.

---

## 6. Faseamento

Decisão da Vivian: **fazer tudo, mas dividir por partes.** Igual ao resto do ImpulsoX-YT-OS (Fase 1, 2, 2.5, 3…) e à Regra de Ouro do sistema (spec → plano → implementa, uma fase por vez). Cada fatia funciona e é testada antes da próxima.

| Fase | Entrega | Depende de | Por quê nesta ordem |
|---|---|---|---|
| **1 — Velocidade** | `editar-video` ganha acelerar (global + por trecho) | nada (pipeline já existe) | Resolve **já** o caso da call grande; menor fatia, prova o método |
| **2 — Gravação** | skill `/gravar-tela`: tela + bolha de webcam no canto + telemetria | nada | Tampa o buraco do passo zero; gera o arquivo que o resto consome |
| **3 — Cérebro do zoom** | captura de cliques + port do `zoomSuggestionUtils.ts` + zoom no `editar-video` | Fase 2 (precisa dos cliques gravados) | O diferencial real do Recordly |
| **4 — Moldura/fundo** | fundo estilizado, padding, cantos, bolha redonda + sombra | Fase 2 | Polimento visual, menor valor de retenção |

**Ordem confirmada: 1 → 2 → 3 → 4.** Cada fase: spec própria → plano → implementa → testa (TestPilot, 13 fases) → valida.

---

## 7. Detalhamento por fase

### Fase 1 — Velocidade
- **O quê:** flag de velocidade global no `editar-video` (`setpts` + `atempo` mantendo pitch) e modo por-trecho (acelera só pedaços marcados: espera, digitação).
- **Caso de uso âncora:** call de 40 min → exporto a 1,5x/2x → 20 min/13 min, voz natural.
- **Regra dura:** corte de silêncio **antes** da aceleração.
- **Nota:** o `setpts` que já existe no pipeline só costura os cortes de silêncio (zera timestamp) — **não** acelera. Velocidade global é recurso novo.
- **Por trecho** depende de marcadores (no roteiro ou derivados da telemetria) — definir formato na spec da fase.

### Fase 2 — Gravação
- **O quê:** skill `/gravar-tela`. Captura tela (`gdigrab`) + webcam (`dshow`) + telemetria do cursor (hook local) → `gravacao.mp4` + `telemetria.json`.
- **Bolha de webcam:** redonda, com sombra, canto/posição/tamanho configuráveis (filtro `overlay`).
- **Decisão aberta:** compor a bolha no momento da gravação **ou** gravar webcam separada e compor na edição (mais flexível). Resolver na spec da fase.

### Fase 3 — Cérebro do zoom
- **O quê:** portar as funções puras de `zoomSuggestionUtils.ts` para `lib-zoom.mjs`. Lê `telemetria.json` → agrupa cliques → emite `regioes-zoom.json` com `{start, end, focus, tipo}`. `editar-video` aplica `zoompan` nos focos.
- **Limite honesto:** a curva de zoom do `zoompan` é mais dura que a do PixiJS. Aceitável; não idêntica.
- **AGPL:** ver §9.

### Fase 4 — Moldura/fundo
- **O quê:** fundo/wallpaper estilizado, padding, cantos arredondados no vídeo, refinamento da bolha. Tudo via filtros ffmpeg.
- **Prioridade:** mais baixa (polimento). Só se valer o esforço depois de 1–3 validadas.

---

## 8. Stack técnico

| Camada | Ferramenta |
|---|---|
| Captura tela (Windows) | ffmpeg `gdigrab` |
| Captura webcam (Windows) | ffmpeg `dshow` (DirectShow) |
| Telemetria de cliques | `uiohook-napi` ou hook nativo equivalente |
| Composição bolha / fundo / padding | filtros ffmpeg (`overlay`, etc.) |
| Velocidade | `setpts` (vídeo) + `atempo` (áudio) |
| Auto-zoom | `lib-zoom.mjs` (port TS→mjs) + ffmpeg `zoompan` |
| Polimento existente | corte de silêncio, legenda karaokê, −14 LUFS (já no `editar-video`) |

**Decisões abertas (resolver nas specs de fase):**
- Bolha composta na gravação vs. na edição (§7, Fase 2).
- Formato dos marcadores de "trecho chato" para velocidade por-trecho (§7, Fase 1).
- Telemetria em macOS/Linux: `gdigrab`/`dshow` são Windows. Equivalentes (`avfoundation` no macOS, `x11grab` no Linux) ficam fora do MVP — decidir se o MVP é Windows-only.

---

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| **AGPL-3.0** do `zoomSuggestionUtils.ts` | AGPL é copyleft (não é só "citar origem"): o derivado herda a licença e o §13 pode exigir oferecer o código-fonte a quem usa o programa via rede. Para uma agência que **opera** o pipeline como serviço, isso é decisão de negócio, não só técnica. **Mitigações:** (a) isolar o módulo portado, (b) reimplementação "clean-room" do algoritmo a partir do comportamento documentado em vez de copiar o código, ou (c) aceitar AGPL nesse componente. **Não sou advogado — vale validar antes da Fase 3.** |
| **Velocidade × corte de silêncio** | Ordem fixa no pipeline: silêncio primeiro, velocidade depois (§5.3). |
| **Plataforma de captura** | `gdigrab`/`dshow` = Windows. Definir se MVP é Windows-only e onde a captura roda. |
| **Gravação não é headless de verdade** | A captura de tela/webcam/cliques roda na **máquina local** da Vivian (Windows), não no VPS — não dá pra gravar uma tela que não existe num servidor headless. A **edição** (zoom, silêncio, legenda, velocidade) é que roda no pipeline, onde o `.mp4` estiver. Isso quebra parcialmente o "tudo headless server-side" — assumido conscientemente. |
| **Curva de zoom mais dura** | `zoompan` ≠ PixiJS. Aceito como trade-off de escopo (§4.2). |

---

## 10. Métricas de sucesso (proposta — confirmar)

> Não foram acordadas na conversa. Rascunho para a Vivian ajustar.

- Call de ~40 min vira vídeo postável de 13–20 min **sem voz de esquilo** (pitch preservado).
- Auto-zoom acerta a região de clique relevante em ≥ X% dos casos, validado em N gravações de teste.
- ~90% do valor visível do Recordly reproduzido (zoom + ritmo + legenda), confirmado em revisão lado-a-lado.
- Cada fase passa no TestPilot (13/13) antes de seguir.

---

## 11. Fora deste PRD / próximos passos

- Este é o **PRD-mãe**: trava visão, arquitetura, escopo (dentro/fora), faseamento e ordem.
- **Requisitos detalhados e critérios de aceite** ficam na spec de cada fase.
- Próximo passo natural: fechar a **spec da Fase 1 (Velocidade)** — uma pergunta por vez — pois é a menor, resolve já o caso da call e prova o fluxo antes da gravação.
- **Gate mantido:** nenhuma linha de código até a spec de fase ser aprovada por você.
