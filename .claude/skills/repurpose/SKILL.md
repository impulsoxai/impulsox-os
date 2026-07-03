---
name: repurpose
description: >
  Use quando uma peça longa (artigo, transcrição de YouTube, newsletter, script) deve
  virar uma semana de conteúdo — "/repurpose", "transforma esse vídeo em posts", "quebra
  isso em conteúdo", "uma semana de posts a partir disso". Extrai os temas de 1 fonte
  longa e os distribui no mix do negócio (Instagram, LinkedIn, Reel/Short, TikTok),
  gerando cada peça pela skill dona, graduando via /revisar e jogando no /calendario.
  Mata o "o que eu posto hoje". Não inventa: só usa o que está na fonte.
---

# /repurpose — 1 peça longa vira uma semana de conteúdo

Criador não faz peça nova todo dia: ele pega uma fonte densa (um vídeo, um artigo, uma
entrevista) e a destila em muitas peças nativas de cada rede. Esta skill faz isso — o
trabalho pesado de distribuição, sem reescrever a mesma coisa em fontes diferentes.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda no degrau 0 com defaults; calibra de verdade a partir do degrau 3 (núcleo com voz,
ofertas ATIVAS e Wedge). Sem núcleo, roda em degrau baixo e marca o que falta — nunca trava.

## O que ler antes

- `nucleo/voz.md` — toda peça sai na voz da marca
- `nucleo/negocio.md` — em especial o campo **Opinião contrária / Wedge** (alimenta os
  ângulos polarizadores do batch)
- `nucleo/ofertas.md` — **só oferta ATIVA** entra em peça pública; roadmap/futuras ficam fora
- `nucleo/perfil.md` — o mix do perfil manda (criador, PME local, agência etc.)
- `marca/design-guide.md` + `marca/tokens.css` — pras peças visuais
- `docs/formulas.md` + `docs/frase-que-pega.md` — o hook de cada peça sai daqui

## Quando NÃO é esta skill

Entrada curta (uma ideia, menos de um parágrafo) → não é repurpose: manda pro `/post`.
Esta skill precisa de material denso pra destilar.

## Fluxo

1. **Entrada.** Receber a fonte longa: artigo, transcrição de YouTube, newsletter ou
   script. Transcrição/script vêm com vício de fala — planejar cortar ("né", "tipo", "ã").

2. **Extrair os temas.** Ler a fonte inteira e puxar:
   - **1 tese central** — a maior ideia.
   - **3-7 pontos de apoio** — cada um forte o bastante pra virar peça sozinho.
   - **Todo ativo concreto** — números, nomes, histórias, citações, resultados, takes
     contrários. É a matéria-prima dos hooks e da prova.
   Devolver os temas em 2-3 linhas pro dono redirecionar se errou o ponto — **sem obrigar
   a aprovar um outline longo.**

   (Todo texto que o dono lê ou que vira peça passa pelo `/escritor-br` — aqui e nos
   passos seguintes; as skills donas do formato já o chamam, e o resumo de temas também
   sai limpo, não com cara de outline de IA.)

3. **Mapear no mix do negócio.** Distribuir os temas pelos formatos que o negócio usa:
   **Instagram (carrossel/post) · LinkedIn · vídeo vertical (Reel + TikTok)**. Um
   roteiro de vídeo vertical serve TikTok e Reels juntos (mesmo formato 9:16). Sem X
   (quase não usamos). Reusar
   um tema entre formatos **só quando o ângulo muda** — nunca publicar a mesma peça em
   fontes diferentes. O número de peças sai da força da fonte (ver anti-enchimento), não
   de uma cota fixa; ajustar ao `nucleo/perfil.md` (o mix do perfil manda).

4. **Gerar cada peça pela skill dona** (esta skill ORQUESTRA, não reimplementa):
   - Instagram (carrossel/post) → `/post`
   - LinkedIn → `/linkedin`
   - Reel/TikTok → o **roteiro de reel do `/post`** (gera vídeo vertical a partir do
     texto). NÃO usar `/shorts` aqui: `/shorts` corta um vídeo longo que JÁ existe
     (precisa de `.mp4`); só vale se a fonte do repurpose for o próprio vídeo bruto e o
     dono quiser cortes dele.
   Cada peça abre com hook do `/formulas` (protocolo first-3-words), **variando a
   categoria de hook no batch** — feed inteiro com o mesmo hook tem cara de template.

5. **Graduar.** Cada peça de social orgânico passa pelo `/revisar` (nota X/10). Não
   entregar peça abaixo de 8/10 — loop no hook.

6. **Destino: o calendário.** Jogar as peças aprovadas no `/calendario` (não publicar
   direto). O dono aprova e publica pelo `/publicar`.

## Regras

- **Anti-enchimento.** Fonte magra demais pra N ângulos distintos → fazer MENOS peças
  fortes, nunca encher com peça fraca. Dizer ao dono quando a fonte não dá pra mais.
- **Peça pública só vende oferta ATIVA** (CLAUDE.md). Roadmap/piloto/futuras fora — nem
  como "em breve".
- **Só conteúdo real.** Nada inventado a partir do que não está na fonte. Dado ausente →
  instrução de substituição, nunca fato fabricado.
- **Anti-formulaico.** Variar categoria de hook e formato no batch.
- É MOTOR: nasce no template ImpulsoX-OS e desce pros clones via `/atualizar-motor`. Nunca
  instalar direto num clone.

## Posição no fluxo

Entra entre `/radar` e `/calendario`: uma fonte longa alimenta o mês inteiro de uma vez.

## Teste de aceitação (comportamental)

1. Transcrição de YouTube de 20 min → tese + 3-7 pontos + ativos concretos extraídos;
   temas resumidos em 2-3 linhas; peças geradas pelas skills donas e graduadas.
2. Fonte magra (meio parágrafo) → a skill avisa que não é caso de repurpose e manda pro `/post`.
3. Fonte rica mas que só sustenta 4 ângulos fortes → 4 peças fortes, não 10 fracas (a skill
   diz o porquê).
4. Núcleo com Wedge → ao menos uma peça do batch usa o ângulo polarizador.
5. Oferta futura citada na fonte → fica fora das peças públicas.

---

**✓ Pronto:** uma fonte longa destilada em várias peças nativas (IG, LinkedIn, Reel/Short, TikTok), cada uma graduada e jogada no calendário · **→ próximo passo:** `/calendario` — encaixar as peças no mês e seguir pra produção/publicação. Esperar o "sim" do dono antes de seguir.
