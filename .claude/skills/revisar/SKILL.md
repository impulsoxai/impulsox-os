---
name: revisar
description: >
  Use quando uma peça pronta precisa do crivo de um marketing sênior antes de ir ao ar
  — "/revisar", "revisa esse post", "esse anúncio tá bom?", "dá uma olhada antes de
  publicar", e SEMPRE antes de publicar anúncio pago ou peça de venda. Despacha o
  agente revisor-marketing com contexto limpo (ele não viu a criação da peça), recebe
  veredito e achados objetivos, e encaminha as correções pra skill de origem.
---

# /revisar — O crivo sênior antes do ar

Quem escreve não enxerga o próprio ponto cego — vale pra gente e vale pra IA: o mesmo
contexto que criou a peça tende a aprová-la. Esta skill resolve com **olhos frios**: um
agente separado, que não participou da criação, julga a peça contra as regras do
sistema. Pra quem não vem do marketing, é a segunda opinião profissional automática.

Autoria: ImpulsoX AI. Conteúdo original.

## Quando rodar

- **Obrigatório:** antes de `/publicar` peça de intenção "vender" e antes de qualquer
  anúncio pago subir (`/ads-google`, `/ads-meta`) — dinheiro envolvido, sem exceção.
- **Recomendado:** primeira peça de cada cliente novo (calibra cedo), página de vendas,
  proposta comercial.
- **Sob demanda:** qualquer peça que o usuário queira validar.

## Como roda

1. **Reunir o pacote:** a peça final (texto + imagens renderizadas, se houver) e os
   caminhos dos arquivos de referência (`nucleo/`, `docs/persuasao.md`).
2. **Despachar o agente `revisor-marketing`** (via Task/subagente) com o pacote — em
   contexto limpo, sem o histórico de criação da peça. É isso que garante a revisão
   fria: o revisor não sabe quais escolhas doeram, só vê o resultado.
3. **Receber o veredito:** APROVADA / AJUSTAR / REPROVADA + achados (um por linha,
   cada um com correção proposta). **Para peça de social orgânico, junto vem a nota
   X/10 do scorecard** (ver "Nota numérica" abaixo); anúncio pago e página ficam só
   com o veredito categórico.
4. **Encaminhar:**
   - **APROVADA** → registrar no Status do calendário ("revisada") e seguir pro
     `/publicar`.
   - **AJUSTAR** → aplicar as correções **pela skill de origem** (`/post`, `/linkedin`,
     `/ads-*` — ela conhece as regras do formato), re-renderizar o que mudou e passar
     de novo pelo revisor. Máximo 2 rodadas; na terceira divergência, o usuário decide.
   - **REPROVADA** → mostrar os achados ao usuário e refazer pela skill de origem com
     o brief corrigido.
5. **Mostrar ao usuário** o veredito e os achados sempre — a revisão também ensina o
   dono a ler marketing.

## Nota numérica (só peça de social orgânico: post, carrossel, reel, legenda)

Para peça de **social orgânico**, o revisor devolve **nota X/10 ponderada + o veredito**
(os dois somam): a nota é o motor do loop, o veredito é o rótulo legível pro dono.

**Anúncio pago e copy de página NÃO recebem nota** — ficam com o veredito categórico
(prioridades diferentes: política de plataforma, clareza da oferta, prova não cabem na
ponderação Hook=50%).

### Scorecard (7 dimensões ponderadas)

| Dimensão | Peso | O que checa |
|---|---|---|
| **Hook strength** | **50%** | As 3-5 primeiras palavras param o scroll? Específico/surpreendente/polarizador? Passa como tweet sozinho? Sem throat-clearing ("em um mundo cada vez mais…") |
| Curiosidade + especificidade | 10% | Número/nome/momento real vs genérico; abre questão e resolve |
| Carga emocional | 10% | Provoca sentimento forte (surpresa, indignação, reconhecimento)? Sem emoção não viaja |
| Shareability | 10% | **Pass/fail contra o OBJETIVO DECLARADO da peça** (o pacote do despacho leva o campo `objetivo` do bloco meta): `enviar` → tem o gancho de envio ("manda pra quem…")? `salvar` → tem o slide/frame-referência guardável? `converter` → tem PONTE + prova? Peça que não cumpre a mecânica do próprio objetivo não pontua aqui, mesmo boa no resto |
| Voice match | 10% | Soa como a `nucleo/voz.md`? Tem ponto de vista ou poderia ser qualquer IA? |
| Polaridade | 5% | Diz algo discutível? Dá pra concordar OU rebater? Puxa do Wedge de `negocio.md` |
| Fit de plataforma | 5% | Tamanho/hook/hashtag certos; convida a métrica que a plataforma premia |

**Implicação do Hook=50%:** hook 4/10 com resto perfeito teto ~7; hook 10/10 com resto
mediano ~7,5. Post abaixo de 8 quase sempre = reescrever o hook.

### Auditoria de voz (pass/fail, penaliza a nota)

Cada falha subtrai 0,5 da nota final (teto −3): travessão `—`, contração ausente onde a
voz pede fala, número por extenso, voz passiva, filler ("realmente/muito/só/basicamente/
literalmente"), abertura-filler, contagem de hashtag fora do limite da plataforma.

### Régua da nota

**"10 não existe. 8 é forte. 9 quase nada a consertar. Harsh but fair."** Nota falsa alta
custa mais que crítica honesta. O loop existente (AJUSTAR → re-revisar, máx 2 rodadas) usa
a nota como gatilho: **nota < 8 → AJUSTAR** pela skill de origem, re-graduar; na 3ª
divergência o dono decide.

**A nota é GRAVADA, não só falada:** ao aprovar, escrever a nota final no campo
`nota-revisar` do bloco meta do `legenda.md` da peça — o `/publicar` a copia pro registro
canônico e o `/desempenho` CALIBRA O JUIZ com ela (peças ≥9 performaram acima das 7-8?).
Se `nucleo/aprendizados.md` registrar divergência do scorecard (2+ meses), ajustar o peso
conforme o aprendizado — a régua desta conta vale mais que o default.

## Checklist de copy de página (quando a peça é landing/página de venda)

Quando a peça revisada é copy de página (vinda da `/copy` + `/escritor-br`), o revisor
aplica também estas frentes — é a última rede contra o que escapa das camadas anteriores:

- **Conversão:** cada linha aumenta o desejo OU reduz esforço/confusão? Headline carrega
  o benefício e o "o que é" está no subtítulo? Uma ação só? Caçar os pecados da copy
  fraca — descreve o produto em vez do resultado; genérico (passa no teste do logo);
  abstrato (sem número/nome/cena).
- **Concreto preservado:** canal/produto/número específicos não viraram categoria vaga.
  O canal é "WhatsApp", não "por mensagem"/"por lá"; o produto tem nome, não é "a
  solução"/"a ferramenta"; horário-cena continua cena.
- **Registro escrito:** se a `voz.md` pede português por extenso, zero contração falada
  ("tá/pra/cê/tava/pro"). Soar humano não é soar relaxado.
- **Restrições duras:** nenhum travessão `—`/meia-risca `–`/`--`, nenhuma aspa curva
  `“ ”`, nenhum título em title-case, sem negrito mecânico, sem emoji decorativo.
- **Prova e lacuna honesta:** todo número/depoimento tem origem autorizada no
  `nucleo/provas.md` (sem fonte → achado de pendência, nunca passa como fato); o
  gancho/headline entrega o que promete, na intensidade prometida.

Esses achados entram no veredito como qualquer outro (um por linha, com correção
proposta). O revisor continua julgando, não reescrevendo — a correção volta pra `/copy`.

## Regras

- O revisor **não reescreve** — julga. Reescrita é da skill de origem (mantém formato,
  marca e registro de fórmula).
- Veredito do revisor não sobrepõe o usuário: usuário pode publicar peça com ressalva,
  mas a ressalva fica registrada no Status ("publicada com ressalva do revisor").
  Exceção: achado de **política de plataforma em anúncio pago** — aí o sistema não
  publica e explica o risco (conta do cliente vale mais que o prazo).
- Revisão não substitui o `/escritor-br` — são camadas diferentes (voz/humanização vs
  julgamento estratégico). A peça passa pelos dois.

---

**✓ Pronto:** veredito do revisor sênior (APROVADA / AJUSTAR / REPROVADA) + achados · **→ próximo passo:** `/publicar` se aprovada — leva a peça ao ar. Pré-requisito: a peça pronta; AJUSTAR/REPROVADA volta pra skill de origem antes de seguir.
