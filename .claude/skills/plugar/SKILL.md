---
name: plugar
description: >
  Use quando o usuário acabou de instalar o ImpulsoX-OS e quer ligar o sistema, plugar um
  negócio próprio, começar o primeiro setup, ou disser "/plugar", "instalar o sistema",
  "configurar", "começar". Também quando a reunião com o cliente é amanhã e só existe a URL
  de um site antigo — o sistema arranca pela extração e refina depois.
---

# /plugar — Ligar o sistema para um negócio

Primeiro comando da vida do sistema — e a primeira impressão do produto. Tem que fluir
como conversa boa, não como formulário de cadastro: cada pergunta espera a resposta,
cada resposta muda a próxima. Quando termina, o sistema conhece a empresa, o jeito dela
falar e a dor que ela quer resolver — no degrau de contexto mais alto que a informação
disponível permitir.

Autoria: ImpulsoX AI. Conteúdo original.

## Princípio que rege esta skill

Esta skill aplica a **Escada de Contexto** (ver CLAUDE.md). Ela funciona com o que houver
agora. Se o usuário tem tempo e quer a entrevista completa, sobe ao degrau 3. Se só tem
uma URL e pressa, sobe ao degrau 1 pela extração e marca o resto como suposição. Nunca
trava exigindo informação que o usuário ainda não tem.

## Fase 0 — Pré-checagem

1. **Já tem contexto?** Conferir se `nucleo/negocio.md`, `nucleo/voz.md`, `nucleo/foco.md`
   já têm conteúdo real (não o placeholder "_(vazio...)_"). Se algum tiver, perguntar:
   > "Encontrei um núcleo já preenchido. Quer que eu aproveite o que está aí e pergunte
   > só o que falta, ou prefere apagar e montar de novo?"
   Núcleo virgem → entrar direto na conversa. **Aproveitar** = marcar a cobertura dos 12
   pontos contra o núcleo existente e só perguntar os buracos — e se
   `nucleo/aula-do-dono.md` já existe, **não repedir a aula**; oferecer complementá-la
   ("quer gravar mais 2 minutos sobre o que mudou?"). **Apagar e montar de novo** preserva
   a aula antiga (renomear com data, nunca deletar — mesma regra do `/voz`).

2. **Perfil do negócio.** Pra moldar o sistema ao caso, perguntar (uma escolha):
   > "Pra eu moldar o sistema ao seu caso, qual te descreve melhor?
   > 1. **Negócio local** — você vende um produto/serviço numa região (loja, clínica, restaurante…)
   > 2. **Agência / consultoria** — você atende vários clientes
   > 3. **Criador / canal** — YouTube, marca pessoal, infoproduto, newsletter
   > 4. **Profissional liberal** — serviço especializado entregue por você"

   A escolha mapeia num molde de `docs/perfis.md` (`pme-local` · `agencia` · `criador` ·
   `profissional-liberal`) que vira o `nucleo/perfil.md` na Fase 3.
   - **Agência** → o núcleo da raiz passa a descrever a **sua agência**; cada cliente entra
     depois em `clientes/<nome>/` pela skill de plugar cliente (que também pergunta o perfil
     DELE — um cliente pode ser criador, PME local etc.). Continuar a entrevista mirando a
     agência como o "negócio" desta rodada.
   - **Os outros três** → o núcleo da raiz (`nucleo/`) é desse negócio. Seguir aqui.

   Esta skill **nunca** sobrescreve a raiz `CLAUDE.md` (a constituição do produto). O perfil
   só molda o comportamento via `nucleo/perfil.md` — escrito junto com o resto do núcleo.

## Fase 1 — Definir o degrau de partida

Perguntar:
> "Pra eu já começar com o pé direito: a empresa tem um site no ar? Pode ser o atual ou
> um antigo. Se tiver, me manda o link — eu extraio o que der de lá antes da gente
> conversar, e a entrevista fica mais curta."

- **Tem URL:** rodar a extração (Fase 2A) e só então entrevistar o que faltar.
- **Não tem URL:** ir direto à entrevista (Fase 2B), partindo do degrau 0.

## Fase 2A — Extração (quando há URL) → degrau 1

Usar a skill de scraping (firecrawl) para ler o site. Extrair, sem inventar:
- O que a empresa vende / serviços e como descreve cada um
- Preços, se publicados (anotar exatamente o que cada preço cobre)
- Público que ela parece atender
- Tom de escrita do site (formal? próximo? técnico?)
- Cores, fontes e logo visíveis (passar esses achados para a skill `/identidade` depois)
- Contato, região, redes sociais

Apresentar o que extraiu como uma tabela e marcar cada item como **fato** (estava no
site) e pedir confirmação rápida. O que não estava no site continua **suposição** até a
entrevista ou o cliente confirmar.

> "Foi isso que tirei do site. O que está certo eu trato como fato; o resto a gente ajusta.
> Algo aqui já está desatualizado ou errado?"

## Fase 2B — Entrevista (a aula primeiro, as perguntas só pra cobrir o que faltou)

A entrevista é **invertida**: o dono dá uma AULA solta sobre o negócio antes de qualquer
pergunta. Fala solta captura a voz muito melhor que resposta de formulário, e ninguém quer
responder 12 campos. As perguntas viram rede de segurança do que a aula não cobriu — não
interrogatório. Molde de cobertura: `assets/contexto-do-negocio.md`.

**Passo 1 — Pedir a aula.**
> "Antes de qualquer pergunta: me dá uma aula sobre o seu negócio, como se estivesse
> explicando pra um sócio novo que começa amanhã. Fala solto, do seu jeito, na ordem que
> quiser — não precisa responder nada específico, só me conta. Pode escrever aqui ou me
> mandar um **áudio** (áudio pega melhor o seu jeito de falar). E se você tiver 2-3 textos
> que você mesmo escreveu — um post, um e-mail, uma mensagem que mandou pra um cliente —
> cola junto: exemplo real vale mais que qualquer descrição."

Casos do que chega:
- **Áudio (arquivo):** transcrever com o whisper local do repo —
  `node scripts/transcrever-local.mjs <audio>` (usa o CLI `whisper`; erro guiado se
  faltar). Alternativa que o dono mesmo resolve: mandar o áudio pra si no WhatsApp e usar
  o "transcrever", ou o ditado do celular — aí ele cola o texto.
- **Só um link** ("tá tudo no meu site: URL"): rodar a Fase 2A na URL e repedir a aula
  reformulada — "li o site; agora me conta o que ele **não** conta: como você pensa esse
  mercado, por que os clientes escolhem você, o que te limita hoje."
- **Amostras de texto:** guardar junto com a aula — vão pro mesmo arquivo na Fase 3 e são
  o melhor calibre de voz ESCRITA (a aula dá a voz falada; amostra publicada dá a escrita).

A aula crua (texto ou transcrição) é preservada **inteira e do jeito que veio** — o destino
é `nucleo/aula-do-dono.md` (ver Fase 3), a melhor amostra de voz que o sistema terá até o
`/voz` rodar.

**Passo 2 — Marcar cobertura.** Ler/ouvir a aula e marcar, nos 12 pontos de
`assets/contexto-do-negocio.md` (**a lista canônica de cobertura — fonte única**), quais
já vieram e quais faltaram. A Fase 2A (extração) também conta como cobertura.
- Ponto coberto **de verdade** → não se repergunta.
- Ponto tocado **de raspão** → vale **um** probe curto ("você citou X de passagem — me dá
  um exemplo concreto?"); se não render, entra como veio.
- **Aula curta** (cobriu menos de 4 pontos) → não despejar 8+ perguntas uma a uma. Avisar
  e oferecer: "sua aula me deu [o que veio]; se topar falar mais 2 minutos sobre [os 2-3
  maiores buracos], corto as perguntas pela metade — ou te mando o que falta em blocos de
  3 pra responder de uma vez". O dono escolhe o formato.

**Passo 3 — Perguntar SÓ o que faltou.** Rodar apenas os pontos não cobertos, **um por
vez** (ou nos blocos de 3, se a aula foi curta e o dono preferiu). Cada pergunta o dono
pode responder **ou pular** ("pula" → vira pendência da Escada em `nucleo/escada.md`,
nunca trava o setup).

A pergunta de cada ponto é a "versão ao dono" do molde. As perguntas numeradas abaixo são
as **versões expandidas/adaptadas por perfil** de alguns pontos — mapeamento: pergunta
1-2 ↔ pontos 1-2 · pergunta 3 ↔ ponto 3 · pergunta 4 ↔ ponto 9 · pergunta 4b ↔ ponto 10 ·
bloco de ofertas ↔ ponto 4 · perguntas 5-6 ↔ pontos 6 e 12 · perguntas 7-8 ↔ pontos 8 e
11. **Pontos 5 (como você pensa) e 7 (modelo de negócio) não têm versão expandida — usar
a pergunta do molde direto.** A pergunta 9 (atrito) é extra do `/plugar`, fora dos 12.

Resposta vaga ganha **uma** segunda chance ("me dá um exemplo concreto?"); se continuar
vaga, entra como está e o campo fica marcado pra refino futuro.

**Sobre o negócio** (só o que a aula não cobriu):
1. "Qual o nome do negócio? (se a marca é você, vale o seu nome mesmo)"
2. "Um cliente em potencial te para e pergunta 'o que vocês fazem?'. Qual a sua
   resposta de uma frase?"
3. "Pensa no último cliente que fechou com você: quem era e o que ele estava
   precisando quando chegou?"
4. "Por que escolhem você e não o concorrente? O que te diferencia de verdade?"
4b. "Qual opinião forte você tem sobre o seu setor — algo que a maioria dos seus
   concorrentes rebateria?" (o **Wedge**: a crença contrária que divide a audiência,
   não o diferencial). Se travar, empurrar: "que hábito comum do seu nicho você acha
   um erro? que conselho repetido você ignora?". Pegar algo específico, mesmo pequeno;
   se ainda não vier, marcar como pendência da Escada — nunca inventar.

A pergunta 3 se adapta ao perfil escolhido na Fase 0:
- **criador** → "Quem é a sua audiência — quem assiste/segue você — e como você pretende
  monetizar (patrocínio, infoproduto, comunidade)?" (criador não tem "cliente que fecha";
  tem audiência e monetização indireta)
- **pme-local** → manter, puxando **região** e o diferencial **local** ("o que te traz
  cliente do bairro/cidade?")
- **agencia** e **profissional-liberal** → manter como está.

**Sobre as ofertas (no máximo 3 nesta primeira rodada):**
O bloco abaixo também passa pela cobertura: o que a aula já descreveu da oferta **não se
repergunta** — só se confirmam os campos que faltaram (tipicamente preço, objeções,
sazonalidade), e em **bloco único** ("da sua oferta X ficou faltando só: quanto custa,
que objeção aparece na venda e se tem época de alta — me dá esses 3?"), nunca as 7
sub-perguntas em sequência. Pra cada oferta principal — no máximo três agora, o resto
entra depois pelo `/atualizar`:
- "O que é essa oferta, em uma frase concreta? E pra quem ela é?"
- "Quanto custa — valor ou faixa?"
- "Qual o benefício principal **na linguagem do cliente** — o resultado que ele leva?"
- "O que diferencia essa oferta do concorrente?"
- "Que objeções aparecem na hora de vender? (ex: 'é caro', 'não tenho tempo')"
- "Tem época de alta ou baixa? Alguma data que puxa essa oferta?"
- "Entre as suas ofertas, qual você mais quer vender agora?" (prioridade comercial)

Anotar cada oferta no formato de `nucleo/ofertas.md`. Mais de três ofertas no negócio →
registrar as três prioritárias agora e avisar que as outras entram depois com o
`/atualizar`. Negócio sem oferta clara (ex: criador ainda monetizando) → deixar o arquivo
com o que houver e marcar o resto como suposição, sem travar.

**Sobre a voz (provisório — a voz de verdade vem depois, no `/voz`):**
5. "Cola aqui a última mensagem que você mandou pra um cliente — WhatsApp, e-mail, o que
   for. É o melhor retrato de como você fala." (autoanálise "sou formal/informal" sai
   genérica; artefato real não. Se o dono não tiver nada à mão, aceitar a descrição em
   uma frase — só pro sistema não sair mudo até o `/voz`.)
6. "Tem palavra, promessa ou estilo que você **não** quer ver no seu marketing?"

Deixar explícito que isto é um esboço: a voz boa não sai de duas perguntas rápidas. Sai
da entrevista longa do `/voz` (30+ min de áudio do dono) — é ela que faz o sistema
escrever como a pessoa fala. Marcar a voz como provisória até o `/voz` rodar.

**Sobre o foco:**
7. "O que é prioridade nos próximos meses? (vender mais de quê, pra quem, até quando)"
8. "Tem sazonalidade ou data importante chegando?"

**Sobre o atrito (semente de automação futura):**
9. "Que tarefa de marketing você repete e gostaria de tirar das costas?"

## Fase 3 — Preencher o núcleo

Com o que veio da extração + entrevista, escrever:
- `nucleo/negocio.md` — respostas 1-4b (+ extração): o que é, o que entrega, quem paga,
  diferencial e a **Opinião contrária / Wedge** (resposta 4b)
- `nucleo/perfil.md` — a partir do molde escolhido na Fase 0 (catálogo em `docs/perfis.md`):
  copiar os campos do molde (cliente, skills que lideram, ênfase da escada, o que se produz
  mais, o que não se aplica, mix do `/calendario`) já **preenchidos pro caso deste negócio**,
  nunca placeholder. Perfil `agencia` herda o mix por cliente (não fixa um aqui).
- `nucleo/aula-do-dono.md` — **a aula crua do Passo 1, inteira e datada** (do jeito que o
  dono falou/escreveu, sem limpar), mais as amostras de texto que ele colou. É a amostra
  de voz de referência — o `/voz` lê este arquivo antes de entregar o roteiro e **nunca**
  o descarta. Fatos que estão na aula (preço, oferta, meta) moram nos arquivos deles
  (`ofertas.md`, `negocio.md`, `foco.md`) — aqui fica a FALA, lá ficam os FATOS.
- `nucleo/voz.md` — tom provisório extraído da aula + respostas 5-6: trechos exemplares
  da fala do dono (citações literais, não a aula inteira), lista do que evitar, e um
  ponteiro pra `nucleo/aula-do-dono.md`. Preservar a palavra do dono, não achatar em
  ficha. Marcar no topo que é esboço, a ser aprofundado pela entrevista do `/voz`.
- `nucleo/foco.md` — respostas 7-8: prioridade, metas, prazos, sazonalidade
- `nucleo/ofertas.md` — bloco de ofertas: um bloco por oferta (até 3), no formato do
  arquivo. Campo sem resposta firme entra marcado `(?)`; nunca inventar preço ou objeção.

Regras de escrita do núcleo:
- Não inventar. Resposta vaga entra como veio, ou vira um campo marcado "_a confirmar_".
- Separar **fato** de **suposição** quando a origem foi extração sem confirmação.
- Não deixar o aviso de placeholder nos arquivos finais.

**Eco de validação da voz provisória.** Antes de fechar a fase, escrever **uma frase
curta** na voz que a aula ensinou (um gancho de post serve) e mostrar:
> "Escrevi essa frase no seu tom: _[frase]_. Soa como você, ou tá com cara de outra
> pessoa?"
Se não bateu, ajustar o esboço do `voz.md` com o que o dono apontar — 30 segundos agora
poupam toda peça futura de sair na voz errada.

## Fase 4 — Registrar a escada

Atualizar `nucleo/escada.md`:
- **Perfil escolhido** como fato confirmado (ex: "perfil: criador")
- **Degrau atual** alcançado (1 se só extração, 3 se entrevista completa)
- Lista de **fatos confirmados** e **suposições a confirmar**
- **Próximo degrau** e o que falta pra subir (ex: "passar exports de ads → degrau 4")

## Fase 5 — Handoff para a identidade visual

A marca é base de toda peça visual. Encaminhar:
> "Agora a parte visual. Posso montar a identidade da marca — extraio do site se você
> tem um, ou crio do zero. Se você tiver o logo e prints de 2-3 sites/marcas que você
> admira, me manda que fica muito melhor. Rodo a `/identidade`?"

Passar para a `/identidade` os achados visuais da Fase 2A (cores, fontes, logo do site).

## Fase 6 — Fechar

Resumir o que ficou configurado e o degrau atingido:
```
✓ Perfil: [PME local | agência | criador | profissional liberal]
✓ Degrau de contexto: [n] — [o que isso permite]
✓ Núcleo: negocio.md · perfil.md · voz.md · foco.md
✓ Fatos confirmados: [n]   Suposições a confirmar: [n]
✓ Voz: provisória — rodar /voz pra entrevista de verdade
→ Próximo: /voz (a voz do dono) · /identidade (marca) · depois, produção de conteúdo
```
Se houver suposições, listar as principais para o usuário confirmar quando puder.
Mencionar a tarefa repetida da pergunta 9 como candidata a virar automação no futuro.

Recomendar o `/voz` como próximo passo de maior retorno: enquanto a voz for provisória,
todo texto sai mais genérico do que poderia. A entrevista de 30 min é o que mais eleva a
qualidade de tudo que o sistema escreve.

## Regras

- A aula do dono corre livre (sem limite de tempo). Já as PERGUNTAS de cobertura miram
  poucos minutos: só o que a aula não cobriu, e o dono pode pular qualquer uma. Pergunta
  emperrada não segura o setup — anota-se o que veio e a conversa anda.
- O roteiro é fechado: pergunta fora da lista só quando uma resposta abriu lacuna que
  impede o sistema de trabalhar.
- Nunca bloquear por falta de informação — descer um degrau é sempre opção.

---

**✓ Pronto:** negócio plugado (núcleo, aula do dono e degrau de contexto registrados) · **→ próximo passo:** `/voz` — a entrevista de 30 min é o maior salto de qualidade de tudo que o sistema escreve (a aula já dá a semente; o `/voz` completa). A `/identidade` vem logo depois — o handoff dela já foi oferecido na Fase 5.
