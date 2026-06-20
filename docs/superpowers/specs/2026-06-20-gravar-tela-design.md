# Spec — Fase 2: `/gravar-tela` (ImpulsoX-YT-OS)

> Segunda fatia do PRD-mãe `2026-06-20-gravacao-movimento-design.md`.
> Grava tela + voz + webcam (cru, separados), o dono no comando do início/fim.
> Tampa o "passo zero" do pipeline: hoje o `editar-video` assume que a gravação já existe.

| | |
|---|---|
| **Status** | Rascunho para aprovação (gate: zero código até "vai") |
| **Fase** | 2 de 4 (Velocidade ✓ → **Gravação** → Cérebro do zoom → Moldura/fundo) |
| **Depende de** | nada — puro ffmpeg, sem dep nativa |
| **Plataforma** | Windows-only (MVP) |
| **Saída alimenta** | `/editar-video` (corta/acelera/legenda) e a bolha de webcam (Fase 4) |

---

## 1. Problema

O pipeline (`tema → roteiro → editar → shorts → upload → métricas`) não tem a etapa de
**gravar a tela**. O `editar-video/SKILL.md` assume "a gravação existe? pedir o caminho do
arquivo". Hoje o dono grava com ferramenta de fora. Esta skill captura a gravação crua
dentro do sistema.

---

## 2. O que a Fase 2 entrega

Skill `/gravar-tela` + scripts que gravam **tela + voz (mic) + webcam**, em arquivos
**separados e crus**, com o dono controlando início e fim.

Decisões do brainstorm (todas travadas):
1. **Disparo:** script que o DONO inicia e para (não eu — minha execução é por comando, não contínua).
2. **Captura:** tela (`gdigrab`) + voz do mic (`dshow`) + webcam (`dshow`). Áudio do sistema fica pra Fase 2.1 (loopback WASAPI, mais frágil).
3. **Webcam separada:** saem `tela.mp4` + `webcam.mp4` (webcam carrega o áudio do mic). A bolha (canto, tamanho, redondo, sombra) é composta na EDIÇÃO — não na gravação. Coerente com "grava cru → decide na revisão".
4. **Telemetria do cursor:** NÃO nesta fase (YAGNI). Entra na Fase 3 junto com o cérebro do zoom, onde o `uiohook-napi` (dep nativa) é realmente usado.
5. **Escolha de dispositivo:** lista dinâmica → dono escolhe → salva no `.env`; depois automático. Mic interno OU USB separado.

---

## 3. Arquitetura — 3 peças

Segue o padrão do sistema (funções puras em lib + orquestrador + SKILL.md), igual à Fase 1.

### 3.1 `scripts/lib-gravacao.mjs` — funções PURAS (testáveis sem ffmpeg)

| Função | Faz |
|---|---|
| `parseDispositivosDshow(saida)` | parseia a saída de `ffmpeg -list_devices` → `{ video: [...], audio: [...] }` (cada um `{nome, alt}`) |
| `argsCapturaTela({ saida, fps, tela })` | monta os args do ffmpeg `gdigrab` → `tela.mp4` |
| `argsCapturaWebcam({ webcam, mic, fps, saida })` | monta os args do ffmpeg `dshow` (vídeo webcam + áudio mic) → `webcam.mp4` |
| `resolverDispositivos(envCfg, disponiveis)` | casa o `.env` com o que está conectado; se o salvo sumiu, sinaliza `precisaEscolher` |

### 3.2 `scripts/gravar-tela.mjs` — orquestrador

- **`iniciar [--slug <nome>] [--reconfigurar]`:**
  1. Roda `ffmpeg -list_devices true -f dshow -i dummy` → `parseDispositivosDshow`.
  2. `resolverDispositivos`: se o `.env` tem webcam/mic válidos e conectados → usa. Senão (1ª vez, `--reconfigurar`, ou dispositivo salvo sumiu) → lista numerada, dono escolhe, **salva no `.env`**.
  3. Dispara **dois processos ffmpeg** em background (tela + webcam/mic), grava os PIDs num arquivo de estado (`canal-youtube/gravacoes/<slug>/.gravando.json`).
  4. Imprime: "🔴 gravando em `<slug>`. Quando terminar: `node scripts/gravar-tela.mjs parar`".
- **`parar`:**
  1. Lê os PIDs do estado.
  2. Encerra cada ffmpeg **LIMPO** (manda `q` no stdin do processo — finaliza o mp4 sem corromper; matar o PID bruto corromperia o arquivo).
  3. Confirma os arquivos finais e remove o estado. Imprime: "✓ pronto: `tela.mp4` + `webcam.mp4`. Próximo: `/editar-video`".

### 3.3 `.claude/skills/gravar-tela/SKILL.md`

Guia o dono: como iniciar/parar, escolher dispositivo, trocar mic, onde saem os arquivos,
e o próximo passo (`/editar-video`).

---

## 4. Saída

```
canal-youtube/gravacoes/<slug>/
  tela.mp4       (gdigrab — a tela, sem áudio)
  webcam.mp4     (dshow — webcam + voz do mic)
  .gravando.json (estado temporário; some no 'parar')
```

Os dois entram no `/editar-video` (corta silêncio, acelera, legenda) e na composição da
bolha (Fase 4). Sincronização tela↔webcam: os dois ffmpeg iniciam quase juntos; pequeno
offset é aceitável e ajustável na edição (a fala guia o sync).

---

## 5. Tratamento do mic (interno OU USB separado)

- A escolha de áudio é sempre da **lista dinâmica** — nunca hardcoded. Cobre mic interno
  (ex.: "Grupo de microfones (Realtek(R) Audio)") e mic USB separado.
- O `.env` guarda o NOME do dispositivo escolhido (`GRAVAR_MIC`, `GRAVAR_WEBCAM`).
- **Nome instável do USB:** se o mic salvo no `.env` não estiver na lista de conectados na
  hora de gravar (desplugado, porta USB trocada) → o script **avisa e re-lista** ("o mic
  salvo não está conectado — escolha outro"), nunca quebra com erro feio.
- **`--reconfigurar`** força a re-escolha sem editar o `.env` na mão.

---

## 6. Erros e bordas

- **ffmpeg ausente** → erro guiado (igual ao `editar-video`).
- **Nenhuma webcam/mic detectada** → avisa claro (não trava com stack trace).
- **`iniciar` com gravação já em curso** (`.gravando.json` existe) → avisa, oferece `parar` antes.
- **`parar` sem gravação ativa** → "nada gravando agora".
- **Encerramento sujo** (PC desligou, processo morto) → o `parar` tenta finalizar; se o mp4
  ficou incompleto, avisa que pode estar truncado (ffmpeg mp4 sem `q` perde o moov atom).
- **Espaço em disco baixo** → não bloqueia, mas a gravação longa pode encher; fora do MVP avisar proativamente.

---

## 7. Casos de aceite

1. **Primeira gravação:** `iniciar` lista dispositivos, escolho webcam+mic, salva no `.env`, grava; `parar` produz `tela.mp4` + `webcam.mp4` tocáveis.
2. **Segunda gravação:** `iniciar` usa o `.env`, não pergunta nada, grava direto.
3. **Mic USB desplugado:** `.env` aponta um mic ausente → `iniciar` avisa e re-lista, não quebra.
4. **`--reconfigurar`:** força a re-escolha mesmo com `.env` válido.
5. **Parada limpa:** `parar` encerra com `q` → os dois mp4 têm moov atom válido (abrem e têm duração correta).
6. **Dupla iniciar:** segundo `iniciar` sem `parar` → avisa, não dispara terceiro ffmpeg.
7. **Saída alimenta o pipeline:** `tela.mp4` roda no `/editar-video` sem ajuste.

---

## 8. Testes (TestPilot — meta verde)

- Unit puro: `parseDispositivosDshow` (vídeo/áudio/alt-name, a linha "Error opening dummy" ignorada), `argsCapturaTela` / `argsCapturaWebcam` (args ffmpeg esperados por config), `resolverDispositivos` (env válido / env ausente / dispositivo salvo sumiu → precisaEscolher).
- Smoke real: `iniciar` → grava ~5s → `parar` → conferir que `tela.mp4` e `webcam.mp4` existem, abrem no ffprobe e têm duração > 0. (Roda na máquina do dono, Windows, com webcam — não em CI headless.)

---

## 9. Fora desta fase

- Áudio do sistema (loopback WASAPI) → Fase 2.1.
- Telemetria do cursor / auto-zoom → Fase 3.
- Composição da bolha (canto, redondo, sombra), fundo/moldura → Fase 4 (a gravação só entrega os crus).
- macOS (`avfoundation`) / Linux (`x11grab`).
- Atalho de desktop (`.bat`) pra rodar sem terminal → melhoria pós-MVP (o script já permite).

---

## 10. Próximo passo

Aprovação desta spec → `writing-plans` cria o plano da Fase 2 → código. Gate mantido.
Depois da Fase 2: **Fase 3 (cérebro do zoom)** — onde entra a telemetria e o port do
Recordly (e a decisão de licença AGPL).
