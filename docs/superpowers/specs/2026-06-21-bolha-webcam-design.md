# Spec — Fase 4: bolha de webcam (ImpulsoX-YT-OS)

> Quarta fase do PRD-mãe `2026-06-20-gravacao-movimento-design.md`.
> Compõe o `webcam.mp4` por cima do `tela.mp4` como bolha redonda no canto, com sombra.
> Resolve o formato "rosto + tela". Abordagem ffmpeg provada.

| | |
|---|---|
| **Status** | Rascunho para aprovação (gate: zero código até "vai") |
| **Fase** | 4 (polimento visual) |
| **Depende de** | Fase 2 (`gravar-tela` produz `webcam.mp4` separado) — na main |
| **Plataforma** | Windows (render ffmpeg) |
| **Escopo** | SÓ a bolha (moldura/wallpaper = futuro, decisão travada) |

---

## 1. Problema

A Fase 2 grava `tela.mp4` e `webcam.mp4` **separados de propósito** — pra compor a bolha na
edição, não na gravação (flexibilidade: muda canto/tamanho sem regravar). Falta o passo que
junta os dois: a webcam vira uma **bolha redonda no canto** sobre a tela.

---

## 2. Abordagem ffmpeg — provada

Testado e validado (frame com sombra difere do sem — a composição funciona):
- **Bolha redonda:** webcam escalada+cropada quadrada → máscara circular via `geq` no canal
  alpha (`a = 255` dentro do raio `pow(X-r,2)+pow(Y-r,2) <= r²`, senão `0`).
- **Sombra suave:** um círculo preto semi-transparente (`color=black@0` + `geq` alpha), passado
  por `gblur`, levemente maior que a bolha e deslocado — overlay ANTES da bolha.
- **Composição em camadas:** `corpo → sombra → bolha` via dois `overlay`.

---

## 3. Arquitetura

### 3.1 `scripts/lib-edicao.mjs` — função PURA nova

| Função | Faz |
|---|---|
| `filtroBolhaWebcam({ ladoBolha, canto, margem, sombra, largura, altura })` | monta o trecho de `-filter_complex` (rotulado) que recorta a webcam (input `[1:v]`) em círculo de `ladoBolha`px, gera a sombra, e faz os dois overlays no `canto`. Devolve `{ filtro, mapV }` onde `filtro` é a string e `mapV` é o label final do vídeo (ex.: `[vbolha]`) |

`canto` ∈ `ir|il|sr|sl` (inferior/superior × direito/esquerdo) → vira a expressão de posição do
`overlay` (`W-w-margem`/`margem` × `H-h-margem`/`margem`). Funções auxiliares puras pra montar
a máscara circular e a posição.

### 3.2 `scripts/editar-video.mjs` — passo novo

- Flag `--webcam <arquivo.mp4>` (opcional). Sem ela → nenhuma bolha (comportamento atual).
- Flags da bolha (defaults): `--canto ir` · `--bolha-tamanho 0.2` (fração da largura) · `--margem 40`.
- Quando `--webcam` é passado: adiciona o `webcam.mp4` como segundo input do ffmpeg do corpo e
  encadeia o `filtroBolhaWebcam` **DEPOIS do zoom** (a bolha fica fixa no canto, sobre tudo —
  não dá zoom junto). Como isso usa `-filter_complex` (dois inputs), o passo do corpo passa a
  montar um filtergraph completo (escala + legenda + zoom no `[0:v]`, depois bolha com `[1:v]`).
- `ladoBolha` = `round(1920 * bolhaTamanho)` (ex.: 0.2 → 384px).

---

## 4. Saída

`final.mp4` com a webcam como bolha redonda no canto, com sombra. Sem `--webcam`, idêntico ao
de hoje (sem bolha).

---

## 5. Composição & ordem no render

A bolha entra no MESMO passo do corpo, no fim do filtergraph do vídeo:
```
[0:v] escala1080p (, legenda) (, zoompan)  →  [vcorpo]
[1:v] escala+crop quadrado + máscara circular  →  [cam]
       círculo preto + gblur  →  [sombra]
[vcorpo][sombra] overlay(canto)  →  [vtmp]
[vtmp][cam]      overlay(canto)  →  [vbolha]   (map final do vídeo)
```
O áudio segue do corpo (a webcam carrega o mic, mas o áudio já vem do `baseVideo`; a faixa de
áudio da webcam **não** é usada aqui — o áudio é o do corpo). Isso evita áudio duplicado.

> Nota: hoje o corpo usa `-vf` (filtro simples). Com `--webcam` vira `-filter_complex` (dois
> inputs). O plano trata os dois caminhos: sem webcam mantém `-vf` (zero regressão); com webcam
> usa `-filter_complex`.

---

## 6. Casos de aceite

1. **Sem webcam:** `editar-video` sem `--webcam` → render idêntico ao atual (sem bolha, usa `-vf`).
2. **Máscara circular:** `filtroBolhaWebcam` gera a expressão `geq` com `pow(X-r,2)+pow(Y-r,2)` e `a=...255...0`.
3. **Canto:** `canto:"ir"` → overlay `W-w-40:H-h-40`; `canto:"sl"` → `40:40`.
4. **Tamanho:** `bolhaTamanho 0.2` @ 1920 → ladoBolha 384.
5. **Sombra presente:** o filtro inclui um `gblur` e um overlay de sombra antes da bolha.
6. **Smoke real (PC do dono):** `tela.mp4` + `webcam.mp4` → render mostra a bolha redonda no canto inferior-direito, com sombra; final 1920×1080.

---

## 7. Testes (TestPilot)

- Unit puro: `filtroBolhaWebcam` (expressão da máscara, posição por canto, ladoBolha, sombra presente, label de saída). Funções auxiliares de posição/máscara testadas isoladas.
- Smoke real: compõe tela+webcam de teste → bolha redonda visível no canto, com sombra (frame confere). Hardware/ffmpeg do dono.
- Regressão: render sem `--webcam` continua usando `-vf` e sai igual; zoom + legenda + escala intactos.

---

## 8. Fora desta fase

- **Moldura/wallpaper** (encolher a tela + fundo decorativo) — futuro (decisão travada: reduz a tela, ruim pra tutorial).
- **Bolha reativa ao zoom** (cresce/encolhe com a câmera) — era refinamento PixiJS, fora do headless.
- **Espelhar a webcam, roundness ajustável, borda colorida** — refinamentos futuros (YAGNI; começa redonda+sombra).
- macOS/Linux.

---

## 9. Próximo passo

Aprovação → `writing-plans` → código da Fase 4. Depois disto, o PRD Gravação & Movimento está
completo (gravar → zoom → editar → bolha). Aí o **guia de uso pro dono** (pedido dele) amarra
tudo num passo a passo simples.
