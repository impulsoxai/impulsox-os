# Contexto do Negócio — molde de cobertura

> Molde interno do `/plugar`. **Não é um formulário pra despejar no dono.**
> O dono dá uma AULA solta sobre o negócio primeiro (texto ou áudio, do jeito dele).
> Depois o sistema usa esta lista pra marcar o que a aula JÁ cobriu e perguntar
> APENAS o que faltou — uma pergunta por vez, e o dono pode pular qualquer uma.
>
> Origem: os 12 pontos de "Business Context" do método Hormozi (as perguntas que fazem
> a IA parar de "soar como IA"), traduzidos e postos em 1ª pessoa, na voz de quem RESPONDE.
> A regra de ouro: **preservar a fala do dono, não achatar em ficha.** O núcleo guarda a
> resposta como o dono falou — é ela que ensina a voz.

---

## Como usar (o sistema, não o dono)

1. **Pedir a aula.** "Me dá uma aula sobre o seu negócio, como se estivesse explicando
   pra um sócio novo que começa amanhã. Fala solto, do seu jeito, na ordem que quiser —
   não precisa responder nada específico. Pode escrever aqui ou me mandar um áudio (áudio
   pega melhor o seu jeito de falar). Se tiver 2-3 textos que você mesmo escreveu, cola
   junto." Áudio (arquivo) → `node scripts/transcrever-local.mjs <audio>`; ou o dono
   transcreve via WhatsApp/ditado e cola o texto.
2. **Marcar cobertura.** Ouvir/ler a aula e marcar, nos 12 pontos abaixo, quais já vieram
   e quais não. Coberto de verdade → não se repergunta. De raspão → **um** probe curto.
   **Aula curta (menos de 4 pontos)** → não despejar as perguntas uma a uma: oferecer mais
   2 minutos de aula sobre os maiores buracos, ou os pontos que faltam em blocos de 3.
3. **Só o que faltou.** Perguntar os pontos não cobertos, **um por vez** (ou nos blocos de
   3), com a versão "pergunta ao dono" de cada ponto. O dono pode responder ou dizer
   "pula" — pular vira pendência da Escada (`nucleo/escada.md`), nunca trava o setup.
4. **Gravar preservando a voz.** A aula crua inteira + amostras → `nucleo/aula-do-dono.md`
   (datada, sem limpar — o `/voz` lê e nunca descarta). As respostas → núcleo do jeito que
   o dono falou. `nucleo/voz.md` recebe o tom provisório + trechos exemplares (citações),
   não a aula inteira — fato mora em `ofertas.md`/`negocio.md`/`foco.md`, fala mora na aula.

---

## Os 12 pontos (cobertura) — cada um com a pergunta ao dono

Formato: **[ponto]** → *pergunta ao dono, se faltar* → onde grava.

1. **Quem você é** → "Quem é você e a empresa, em poucas linhas?" → `negocio.md`
2. **O que você vende** → "O que você vende, concretamente?" → `negocio.md` / `ofertas.md`
3. **Pra quem você vende** → "Quem é o cliente típico? Pensa no último que fechou: quem era, o que precisava?" → `negocio.md`
4. **Sua oferta** → "Qual a oferta principal — o que o cliente leva, por quanto?" → `ofertas.md`
5. **Como você pensa** → "Como você enxerga esse mercado? Qual sua leitura dele?" → `negocio.md`
6. **Sua voz de marca** → "Cola aqui a última mensagem que você mandou pra um cliente (WhatsApp, e-mail, o que for) — é o melhor retrato de como você fala." (autoanálise "sou formal/informal" sai genérica; artefato real não) → `voz.md`
7. **Seu modelo de negócio** → "Como o dinheiro entra? (venda avulsa, recorrência, ticket, mix)" → `negocio.md`
8. **Metas e restrições** → "O que você quer nos próximos meses? E o que te limita hoje (tempo, verba, equipe)?" → `foco.md`
9. **Posicionamento / o que te diferencia** → "Por que escolhem você e não o concorrente?" → `negocio.md`
10. **Opinião contrária (Wedge)** → "Qual opinião forte você tem sobre o setor que a maioria dos concorrentes rebateria?" → `negocio.md` (Wedge)
11. **Sazonalidade / datas** → "Tem época de alta/baixa? Alguma data que puxa venda?" → `foco.md` / `ofertas.md`
12. **Regras, princípios e preferências** → "Tem regra sua inegociável no marketing? Palavra, promessa ou estilo que você NÃO quer ver?" → `voz.md` (palavra/estilo) / `nucleo/perfil.md` (regra de operação) — nunca a raiz `CLAUDE.md`

> Os pontos 3, 4 e 9 já são cobertos pela Fase 2B do `/plugar` (perguntas 2-4b e o bloco de
> ofertas). Não duplicar: se a aula ou o roteiro base já resolveu, marcar coberto.

---

## Exemplo de como uma resposta em 1ª pessoa SOA (molde de voz, não conteúdo)

> Exemplo real de um `business-context.md` bem escrito (negócio fictício "The Hungry
> Passport", newsletter de comida/viagem). **É referência de TOM, não de conteúdo** — não
> copiar nada disto pro núcleo de ninguém. O que importa: repara que está em 1ª pessoa, com
> opinião, específico, do jeito que a pessoa fala — não é ficha neutra de cadastro.

- **Quem você é:** *"The Hungry Passport, uma newsletter e marca de comida-e-viagem. Eu sou
  o Remy: ex-filho-de-restaurante (cozinheiro, depois salão) que virou escritor de comida e
  viagem em tempo integral. Base em Melbourne, semi-nômade, 3 a 4 países por ano."*
- **Qual o problema nº1 que você resolve:** *"Ela não tem um problema de onde-comer. Tem um
  problema de não-confio-em-nenhuma-fonte. Eu resolvo: um humano confiável com gosto de
  verdade, que comeu lá, dizendo exatamente onde ir, o que pedir e como pegar o desconto."*
- **Como você soa:** *"O amigo viajado com bom gosto e zero paciência pra bobagem. Primeira
  pessoa, conversado, rápido. Frases curtas e certeiras do lado de uma frase sensorial
  suculenta. Específico acima de floreio: o prato, a rua, o preço, a jogada. Uma opinião
  forte por edição. Assinado Remy, quase sempre com um P.S."*

Contraste — a MESMA informação em ficha neutra (o que a gente NÃO quer):

- ❌ *"Empresa do ramo de conteúdo de comida e viagem. Público: viajantes de renda média-alta.
  Tom de voz: informal e especializado."*

A ficha neutra é verdadeira e morta. A versão em 1ª pessoa ensina a voz. **É essa que o
núcleo guarda.**
