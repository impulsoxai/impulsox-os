---
name: thumbnail
description: >
  Use pra criar ou avaliar a CAPA (thumbnail) de um vídeo do YouTube — "/thumbnail",
  "faz a capa desse vídeo", "minha thumbnail tá fraca", "thumbnail que dá clique",
  "avalia essa capa", "preciso de uma miniatura", "gera 3 capas pra eu escolher". Consultor
  de CTR: gera 3 conceitos capa+título distintos, monta a imagem (frame+texto on-brand ou
  por IA) e PONTUA a capa contra os Four C's (mín 8/10 pra liberar). Capa decide o clique —
  esta skill trata ela como o ativo #1 do vídeo, não enfeite. Roda sozinha (vídeo de fora
  também) ou chamada pelo /roteiro-yt e /editar-video.
---

# /thumbnail — A capa que decide o clique

No YouTube, a capa vende antes do vídeo. CTR baixo = o vídeo morre antes de qualquer
retenção. Esta skill trata a thumbnail como o **ativo #1** — não decoração. O trabalho não é
deixar bonito; é maximizar clique honesto. Ser opinativa: capa fraca é reprovada, não elogiada.

Já existe o motor (`scripts/gerar-thumbnail.mjs` — frame+texto via ffmpeg, on-brand, grátis;
ou por IA via Fal sob confirmação). Esta skill é a **craft** em volta dele: conceito,
Four C's e o crivo de pontuação. Capa + título são **uma unidade** — funcionam juntos ou
falham juntos.

Autoria: ImpulsoX AI. Framework dos Four C's e pontuação adaptados de prática de packaging de
YouTube (Thumbnail MasterClass) à voz e às regras da casa.

## Degrau mínimo (Escada de Contexto)

Roda no degrau 0 com defaults; calibra de verdade no **degrau 2** (com `marca/` — cor, fonte,
estilo de capa do canal). Sem marca, gera e marca como default até a `/identidade` rodar.

## O que ler antes

- `marca/design-guide.md` + `marca/tokens.css` — cor de destaque, fonte display, estilo de
  capa; consistência de capa entre vídeos dá +15-20% de CTR com inscritos
- `canal-youtube/voz-canal.md` — o título sai na voz do canal, não genérico
- `canal-youtube/roteiros/<...>` — se a capa vem de um vídeo roteirizado, o **conceito de
  thumbnail já foi projetado no Passo 8 do `/roteiro-yt`** (sujeito, texto ≤5 palavras,
  contraste); partir dele em vez de reinventar
- `canal-youtube/criadores-monitorados.md` / `formulas-video.md` — o MOLDE de capa de quem
  performa no nicho (copiar a mecânica: 1 sujeito, tamanho/cor do texto, padrão — nunca a arte)
- `docs/frase-que-pega.md` — pro título (os 9 padrões de hook §2.5 valem na capa)

## Regra de formato (decidir primeiro — não confundir)

- **Short / reel (vertical 9:16):** NÃO tem capa separada. A "thumbnail" é o próprio frame do
  vídeo com a legenda. Aqui a skill só ajuda a escolher um bom frame (rosto enquadrado, olhar
  na câmera) — não gera capa composta. (Mesma regra do `/editar-video`.)
- **Vídeo longo (horizontal 16:9):** aí sim tem capa 16:9 dedicada — é onde esta skill faz o
  trabalho completo abaixo.

## Fase 1 — Descoberta (antes de qualquer conceito)

Levantar o contexto. **Parada dura: sem asset real discutido, não finalizar prompt de imagem.**

1. **Sobre o quê é o vídeo?** — tema, o gancho, o que entrega (o payoff). Se veio do
   `/roteiro-yt`, já está no pacote.
2. **Público** — a idade muda o estilo: mais jovem pede cor forte e expressão exagerada;
   18-25+ pede realismo, sobriedade, credibilidade. (Cruzar com `nucleo/perfil.md`.)
3. **Que asset existe?** — frame do vídeo, foto do rosto, print de tela, produto, cena. Sem
   asset, dizer onde conseguir (frame do próprio vídeo via `--frame`, foto real, ou IA via
   Fal) — e só seguir com um asset definido.
4. **Estilo do canal** — já há padrão de capa? Referência que admira?

## Fase 2 — Três conceitos (capa + título), distintos

Gerar **3 conceitos genuinamente diferentes** — não variações da mesma ideia. Cada um:

- **Título** (≤ ~50 caracteres — orçamento do `/roteiro-yt`): cria a premissa. Um dos 6
  padrões de hook (`frase-que-pega.md` §2.5).
- **Conceito de capa** (2-3 frases): cria curiosidade e **não repete o texto do título** — a
  combinação faz a pergunta; nenhum dos dois entrega a resposta sozinho.
- **Alavanca de curiosidade**: Pergunta · Choque · Suspense (cliffhanger) · Conhecimento oculto.
- **Os Four C's** (abaixo) destrinchados.

Rotular Conceito A / B / C. **Esperar o dono escolher** antes de gerar imagem — mas a escolha
não é necessariamente UM: ver o loop A/B abaixo. Se o canal tem o **Test & Compare** nativo do
YouTube, o ideal é levar 2-3 conceitos pro teste, não descartar dois.

## Loop A/B nativo (não jogar fora 2 dos 3 conceitos)

O YouTube tem **Test & Compare** (teste de miniatura nativo, grátis): sobe-se até 3 capas e o
YouTube roda o experimento e aplica a vencedora sozinho. **A métrica que ele otimiza é
watch-time share por impressão — NÃO o CTR.** Ou seja: a capa vencedora é a que traz quem
ASSISTE mais, não só quem clica mais. Isso muda a régua — clique vazio não ganha o teste.

Fluxo recomendado quando o canal tem acesso:
1. Gerar os 2-3 melhores conceitos como imagens reais (não escolher 1 no olho).
2. Subir todos no Test & Compare **desde o 1º upload** — não esperar "o CTR cair".
3. Deixar o YouTube decidir por watch-time share. O crivo Four C's (Fase 4) serve pra **não
   subir capa furada** (todas ≥8), não pra eleger a vencedora — quem elege é o teste real.

**Pré-requisito (verificar):** o Test & Compare exige verificação avançada do canal e roda no
desktop. Se o canal ainda não tem acesso, cair pro caminho de capa única (escolher 1 pelo
crivo) e guardar os outros conceitos pro repacote. Avisar o dono dessa condição.

## Os Four C's (o checklist inegociável de toda capa)

| C | O que avaliar | Régua |
|---|---|---|
| **Composição** | ponto focal, linhas de leitura, escala | 1 sujeito dominante; o olho pousa num lugar só. **Máximo 1 sujeito + 1 objeto + 1 contexto** — capa poluída perde no feed |
| **Cor** | estratégia de contraste, significado | sujeito claro sobre fundo escuro (ou complementar); contraste importa mais que paleta. Dentro da marca |
| **Assets limpos** | qualidade do material, recorte | iluminação chapada e clara; recorte limpo; resolução que aguenta o mobile. Asset ruim = capa ruim |
| **Curiosidade** | a pergunta que se forma na cabeça | a capa abre uma lacuna que só o clique fecha. Sem pergunta, não há clique |

**Mobile-first:** a capa é vista a ~120px. Formas grandes, rosto grande, objeto grande. O que
não lê em miniatura não existe. **Emoção no rosto** (surpresa, foco, alívio) tende a ganhar de
rosto neutro — é heurística forte da prática de packaging, não número medido aqui; quando o
`/desempenho-yt` provar no canal real, vira aprendizado em `nucleo/aprendizados.md`.

**Good clickbait only (régua da casa):** exagerar o INTERESSE, nunca a realidade. É o mesmo
contrato Quality-CTR do `/roteiro-yt` — a capa promete o que o vídeo entrega. Clickbait-mismatch
o algoritmo de 2026 pune (clique alto + retenção baixa = demovido). Capa que mente queima o canal.

## Fase 3 — Gerar a imagem (com o conceito escolhido)

Orquestrar `scripts/gerar-thumbnail.mjs` (não reimplementar):

- **Frame + texto (default, grátis, determinística, on-brand):**
  `node scripts/gerar-thumbnail.mjs --slug <slug> --texto "<≤5 palavras>" --video <arq> --frame <tempo>`
  → `canal-youtube/edicao/<slug>/thumb-frame.png`. Layout composto: faixa de cor da marca +
  texto à esquerda, frame à direita (resolve vídeo vertical que não vira capa por crop cego).
  Cores da marca por `--fundo-cor`/`--destaque-cor`; fonte por `--fonte` (default Space Grotesk
  da marca). Quando há só uma imagem (não vídeo), passar `--frame caminho.png`.
- **Por IA (Fal, tem custo):** `--fal --conceito "<descrição do sujeito/cena>"`. Mostra o
  preview do plano (prompt + saída + modelo); **só gera com `--confirmar`** e aval do dono.
  Prompt em inglês, alto contraste, 1 sujeito dominante, **sem texto na imagem** (o texto
  entra on-brand pelo layout, não pela IA). Trava de custo — nunca gera sem confirmar.
  - **Escolha do modelo (`--modelo`, default `nano`):** a capa é o ativo #1, então o default é
    qualidade — `nano` (Banana 2: texto e luz corretos, ~8-12¢). Opções:
    `nano-pro` (estúdio, capa que exige o máximo, ~15¢) · `minimax` (foto realista barata, ~1¢,
    pra iterar/volume) · `schnell`/`dev` (FLUX, estilizado/abstrato). Trocar é só a flag — sem
    lock-in. `--resolucao 1K|2K|4K` pesa em nano/nano-pro (4K dobra o preço).
  - **`--ref <foto.png>`** mantém o mesmo sujeito (rosto/produto) entre capas — **só com foto
    real autorizada**, nunca rosto identificável puramente gerado por IA.
  - Estimar antes sem gastar: a própria `gerar-imagem.mjs --precos` mostra a tabela
    modelo×resolução×preço, e `--dry-run` calcula o custo da chamada exata.

**Vídeo de fora do sistema:** funciona igual — basta o `--video <arq>` (ou `--frame foto.png`).
Não precisa ter passado pela nossa edição.

**Segurança de marca (inegociável):** nunca rosto identificável **gerado por IA** — pessoa
reconhecível só com foto real autorizada. A imagem serve a marca (cor, fonte, contraste), não
atropela. Contraste do texto sobre a imagem ≥ 4.5:1 (medir, não estimar).

## Fase 4 — Pontuar (o crivo, mín 8/10 pra liberar)

Com a imagem pronta, pontuar **estrito** — capa não passa só por gentileza:

| Nota | Significado |
|---|---|
| 9-10 | Excepcional. Curiosidade forte, clareza perfeita, nível pro |
| 8 | Passa. Bom potencial de CTR, polimento menor opcional |
| 6-7 | Precisa de trabalho. Fraca em 1-2 C's. Revisar antes de postar |
| ≤5 | Recomeçar. Conceito ou execução fundamentalmente furada |

Avaliar cada C (Passa/Falha + nota concreta) + **alinhamento com o título** (Passa/Falha).
Veredito: **PRONTA PRA POSTAR** (≥8) ou **REVISAR** (com a correção específica). Abaixo de 8,
voltar — ajustar conceito/asset/texto e regerar.

O **8/10 é régua interna da casa** (crivo de qualidade), não padrão da indústria — serve pra
barrar capa furada antes de subir. Quem elege a *vencedora* entre capas boas é o Test & Compare
real (watch-time share), não a nota. Nota alta ≠ mais clique; é só o piso de aceitação.

## Saída

Em `canal-youtube/edicao/<slug>/` (ou `canal-youtube/thumbnails/<slug>/` quando roda avulsa):
- `thumb-frame.png` (e/ou `thumb-fal.png`) — a(s) capa(s)
- `pacote-capa.md` — os 3 conceitos, o escolhido, o título final, e o crivo Four C's + nota

## Próximo passo

Ao terminar, apontar o próximo (regra do `CLAUDE.md`) e esperar o "sim":
- Capa nasceu dentro da edição → volta pro **/editar-video** (Fase de revisão) → **/revisar**
- Capa avulsa pra vídeo pronto → **/publicar** (sobe o vídeo + capa)
- CTR abaixo da **mediana dos últimos vídeos do canal** (não um número fixo — CTR saudável
  varia muito por nicho/tamanho; comparar consigo mesmo), medido pelo **/desempenho-yt** →
  repacote: nova capa/título aqui, sem mexer no vídeo. Os conceitos guardados servem ao repacote
- Se há **Test & Compare**: o A/B roda desde o 1º upload (ver Loop A/B acima) — a vencedora por
  watch-time share já entra sozinha, sem esperar o CTR cair

## Regras

- **CTR > estética.** Toda decisão otimiza clique honesto, não beleza.
- **Capa + título = uma unidade.** Nunca aprovar um sem conferir o outro. Título não repete o
  texto da capa.
- **Asset-first.** Não finalizar prompt de imagem sem asset real definido.
- **Mín 8/10.** Capa abaixo de 8 nos Four C's volta pra revisão — não libera por gentileza.
- **Good clickbait only.** Exagera interesse, nunca realidade. Contrato Quality-CTR vale.
- **1 sujeito + 1 objeto + 1 contexto, no máximo.** Capa poluída perde no mobile.
- **Marca sempre:** cor/fonte/estilo do canal; consistência entre capas. Nunca trocar a
  identidade por default da ferramenta.
- **Custo Fal só com `--confirmar`.** A versão frame+texto é grátis e é o default.
- **Nunca rosto identificável gerado por IA.** Pessoa reconhecível só com foto real autorizada.
- Molde de capa de quem performa é esqueleto (1 sujeito, tamanho de texto, padrão) — nunca a
  arte, a frase ou a identidade do criador de referência.

## Teste de aceitação (comportamental)

1. Vídeo longo + asset → 3 conceitos capa+título distintos → escolhido → `thumb-frame.png`
   on-brand → crivo Four C's com nota; ≥8 libera, <8 manda revisar.
2. Short/reel → a skill NÃO gera capa composta; orienta a escolher um bom frame.
3. Sem asset discutido → a skill para e pede o asset antes de gerar prompt.
4. `--fal` sem `--confirmar` → mostra só o preview do plano; não gasta crédito.
5. Capa veio do `/roteiro-yt` → parte do conceito do Passo 8, não reinventa.
6. Em todos: marca preservada (cor/fonte/contraste); nunca rosto IA identificável.

---

**✓ Pronto:** thumbnail 16:9 na marca, aprovada no crivo Four C's (≥8) · **↩ esta é uma skill de apoio:** a capa é consumida pelo `/editar-video` e `/roteiro-yt` (e gerada avulsa quando o dono pede) — não tem próximo passo próprio; o fluxo volta pra quem a chamou.
