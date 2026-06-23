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
   cada um com correção proposta).
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
