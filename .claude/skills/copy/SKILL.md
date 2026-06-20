---
name: copy
description: >
  Use SEMPRE que precisar escrever ou revisar copy de página que converte —
  "/copy", "escreve a copy dessa landing", "essa copy está fraca/repetitiva",
  "headline que converte", "melhora o texto da página". Chamada pelo /pagina ANTES
  de construir (copy vem antes do layout) e pelo /raio-x (copy do mini-redesign).
  Sinais de que é hora: texto genérico, repetição de palavra, headline fraco,
  página que descreve o produto em vez de vender o resultado. Não inventa prova.
---

# /copy — Copy de landing page que converte

Engine de copy de conversão. Existe porque construir bonito não basta: página premium
com texto fraco, repetitivo ou genérico não converte. Princípio central:

> **A fórmula organiza, a VOZ da marca dirige.** Fórmula que dita a voz produz copy
> genérica. A voz mora em `nucleo/voz.md` — é o motorista; os frameworks abaixo são o
> andaime, não a casa.

E uma régua que decide cada linha (Julian Shapiro):

> **Conversão = Desejo − (Esforço + Confusão).** Toda linha ou **aumenta o desejo** ou
> **reduz o esforço/confusão** de agir. A linha que não faz nenhum dos dois, sai.

Autoria: ImpulsoX AI. Embasada em `docs/persuasao.md` + frameworks consagrados de
conversão (Schwartz, Shapiro, PAS/BAB, Cialdini).

## Três passadas, três perguntas

Esta skill leva a copy de **clara → forte → memorável**; a `/escritor-br` fecha **humana**.
São critérios diferentes, então são etapas diferentes — nunca na mesma passada (misturar é o
que produz "copy correta, sem força e sem alma"):

| Passada | Pergunta | Régua | Mora em |
|---|---|---|---|
| **Afiação** (Camada 3) | *"isso VENDE ou só descreve?"* | Desejo − (Esforço + Confusão) | `/copy` |
| **Ideia** (Camada 4) | *"isso PEGA ou só informa?"* | as frases BOM do `voz.md` | `/copy` |
| **Humano** (Camada 5) | *"isso ainda parece IA?"* | tabela de vícios + restrições duras | `/escritor-br` |

Afia (vende?), faz pegar (gruda?), humaniza (soa gente?). O handoff pro `/escritor-br` é o
gate de entrega.

## Quando roda

- Chamada pelo `/pagina` na etapa de COPY, **antes** de qualquer layout (copy primeiro,
  design depois — regra do `/pagina`).
- Sozinha, pra escrever ou revisar a copy de uma página.
- Pelo `/raio-x`, pra a copy do mini-redesign de demonstração.

## O que ler antes

- `nucleo/voz.md` — **a voz é o motorista** (tom, palavras banidas, exemplos "BOM").
- `nucleo/negocio.md` — posicionamento (o que de fato se vende) e diferencial.
- `nucleo/ofertas.md` (ou `nucleo/ofertas/`) — benefício, objeções e público de cada
  oferta (matéria-prima). **Ler a separação ATIVAS × FUTURAS:** a página só fala das
  ofertas ATIVAS. Oferta marcada como FUTURA / roadmap / "não gerar conteúdo" **nunca**
  entra na copy (ver Regras inegociáveis).
- `nucleo/provas.md` — **só prova autorizada** entra; banco vazio → marcar pendente.
- `nucleo/aprendizados.md` — o que a medição real já provou que converte aqui; pesa
  mais que qualquer fórmula genérica.
- `docs/persuasao.md` — **fonte única** de níveis de consciência, sofisticação e
  gatilhos. Não reescrever esse conteúdo aqui; ler de lá e aplicar.
- `docs/swipe-copy.md` — **acervo de copy real que converte** (lido na Camada 2 pra
  calibrar a força de cada bloco; molde transfere, frase não).
- `docs/frase-que-pega.md` — **a craft da frase criativa e autêntica** (lido na Camada 4:
  Made to Stick, devices, Big Idea, autenticidade).

Degrau mínimo: 2 (voz definida). Sem voz, escrever em tom neutro e marcar "confirmar voz".

---

## CAMADA 1 · MIRA — mirar antes de escrever

Da `docs/persuasao.md`, fixar duas coisas (não reescrever a teoria, só aplicar):
- **Nível de consciência** do tráfego que chega (inconsciente → pronto pra agir). Frio
  precisa aquecer com dor/problema antes de pedir ação; quente vai direto pra fricção
  baixa e CTA. Define quanto a página precisa "aquecer".
- **Nível de sofisticação** do mercado. Mercado que já ouviu toda promessa não compra
  promessa — compra **mecanismo** (o *como* que torna a promessa crível e diferente).
  Quanto mais saturado o nicho, mais a página vive da VIRADA/mecanismo, não do benefício.

Depois, travar em uma frase cada:
- **Um leitor** (pra quem se fala) · **uma promessa** (o resultado central) ·
  **uma ação** (o que ele faz no fim). Página que mira três leitores não converte nenhum.

---

## CAMADA 2 · RASCUNHO

### Passo 1 — Headline (vale 80% do esforço)

5x mais gente lê o headline do que o corpo. Regras:
- **Benefício/resultado no headline; o "o que é" vai no subtítulo** (qualifica e torna
  crível). Pergunta-teste: se a pessoa ler *só o headline*, sabe o que ganha?
- **Message-match:** se veio de um anúncio, o headline ecoa a promessa do anúncio —
  senão, ela quica.
- **Sprint obrigatório:** escrever **10 versões** antes de escolher. As 3 primeiras são
  óbvias; as boas vêm depois. Forçar variedade — direto, curiosidade, benefício, dor,
  mecanismo. Apresentar as **3 melhores** ao usuário com a recomendação.
- **Gate de especificidade no headline:** headline sem **número, nome próprio ou recorte
  concreto** é candidato a refazer — é aqui que a abstração mais custa (5x mais leitores que o
  corpo). "Aumente sua eficiência" não passa; "Recupere a venda das 22h" passa. A Camada 3 caça
  abstração no corpo; este gate a caça antes, no lugar que mais importa.

Toolbox de fórmulas (esqueleto, não molde a copiar):
| Fórmula | Forma |
|---|---|
| Benefício específico + gancho | resultado concreto + claim ousado OU quebra de objeção ("…sem X") |
| Resultado + condição | "[resultado desejado] sem [dor/esforço temido]" |
| 4U | Útil · Urgente · Único · Ultra-específico (mirar 2-3 num headline) |
| Mecanismo | nomear o "como" diferente quando o nicho está saturado |

> **Consultar o swipe file.** Antes de fechar o headline, abrir `docs/swipe-copy.md` e
> puxar 1 molde análogo (ex.: "três usos em seis palavras", "produto como verbo") como
> régua de força. É calibragem — pega a mecânica, nunca a frase nem a marca de origem.

### Passo 2 — Estrutura que converte (ordem provada, não reinvente)

```
HERO        benefício (headline) + qualifica (subtítulo) + 1 CTA + prova rápida/visual
PROBLEMA    2-4 dores específicas ("isso sou eu") — PAS: problema → agita → (vira no próximo)
VIRADA      a solução como MECANISMO/diferencial (o que muda, por que é crível)
PROVA       demonstração / casos / números REAIS (nunca inventar; vazio = pendente)
COMO FUNCIONA  3 passos que tiram o medo e mostram controle
OBJEÇÕES    responder as 3-4 que travam a compra (vêm do ofertas.md) + reversão de risco
CTA FINAL   recompõe o benefício + uma ação só
```

CTA primário acima da dobra **e** repetido no fim. **Uma ação só** — cada opção extra é
um motivo pra não decidir. Texto específico ("Falar no WhatsApp"), nunca "Clique aqui" /
"Saiba mais". O CTA continua a narrativa do hero (continuidade), não muda de assunto.

> **Consultar o swipe file por bloco.** Antes de escrever hero, oferta, quebra de objeção
> e CTA, puxar 1 exemplo análogo do `docs/swipe-copy.md` (ex.: "objeção embutida no sub",
> "CTA verbo específico", "show don't tell"). Calibra o nível; não copia a marca.

Teste de cada bloco: ele **aumenta o desejo** ou **reduz esforço/confusão**? Se não faz
nem um nem outro, corta.

---

## CAMADA 3 · AFIAÇÃO — loop de auto-crítica de CONVERSÃO (NOVO, obrigatório)

Rodar **antes** de mandar pro `/escritor-br`. Não é humanização — é checar se a copy
**vende** ou só **descreve**. Uma passada de leitura inteira fazendo uma pergunta só:

> *"Cada linha aumenta o desejo ou reduz esforço/confusão? A linha que não faz nenhum
> dos dois descreve em vez de vender — corta ou reescreve."*

### Os pecados da copy fraca (caçar e corrigir)
1. **Descreve o produto** em vez do resultado. "Tem integração com WhatsApp" → "Seu
   cliente te acha no WhatsApp e é respondido na hora, sem você parar o que faz."
2. **Genérico** — serve pra qualquer concorrente. Teste do logo: troca o nome da marca
   e a frase continua verdadeira pra um concorrente? Então não diz nada. Reescrever pra
   só fazer sentido pra ESTE negócio.
3. **Abstrato** — sem número, sem nome, sem cena concreta. "Aumente sua eficiência" →
   "Responda 40 mensagens enquanto atende o caixa."
4. **Diluição do concreto (o mais traiçoeiro)** — pegar algo específico que já estava na
   copy e trocar por uma categoria vaga no meio do texto. É o pecado nº 2 e nº 3
   acontecendo *na reescrita*, não no rascunho. Regra dura: **nome de canal, produto,
   número ou horário, uma vez concreto, continua concreto até o fim. Nunca substituir por
   genérico.** Casos reais que escaparam:
   - "WhatsApp" não vira "por mensagem" nem "por lá" → escreve **WhatsApp**.
   - um horário-cena ("22h47") não vira rótulo abstrato ("dessas 22h47") → continua cena.
   - o nome do produto não vira "a solução" / "a ferramenta" → escreve **o nome**.
   Varredura: achou categoria genérica onde existe o nome/número específico? Volta o específico.

### O que faz parte da Afiação (não some nada — só mudou de lugar)
- **Gate de repetição** (era Passo 4) entra aqui. Varrer a copy inteira:
  1. **Primeira palavra de cada bloco/parágrafo** — não pode repetir entre vizinhos.
  2. **Palavra-tema colada** — termo repetido em blocos vizinhos → sinônimo ou reescrita.
  3. **Estrutura de frase repetida** — "A IA faz X. A IA faz Y." → variar a forma.
  4. **Mesma ideia dita duas vezes** — headline e subtítulo (ou hero e CTA) dizendo o
     mesmo → cortar uma.
  5. **Truque:** ler de trás pra frente, bloco a bloco — a repetição salta.
  > Exceção (estreita): anáfora deliberada de **3+ batidas no corpo** ("Você X. Você Y.
  > Você Z.") cria ritmo e é bem-vinda. MAS num **headline ou frase de duas partes**,
  > repetir o mesmo verbo ("A IA **cuida**… você **cuida**…") é descuido, não anáfora →
  > reescrever. Na dúvida, varia.
- **Ritmo** (era Passo 3) entra aqui — parte de afiar pra impacto, não de humanizar:
  - **Varie o tamanho da frase.** Curta pra impacto. Média pra explicar. De vez em
    quando, uma longa que ganha fôlego e constrói até o fim.
  - **Fragmentos valem.** "De propósito. Funcionam."
  - **Bucket brigades:** a cada poucos blocos, uma frase curta que empurra ("E tem
    mais.", "Repara nisso:") — sem virar bordão.
  - Frase acima de ~20 palavras → quebrar ou encurtar.

### Reescrever puxando força do swipe
Nos pontos fracos achados acima, voltar ao `docs/swipe-copy.md` e usar o molde análogo
pra reerguer a linha — sempre a mecânica, nunca a frase de origem.

Saída desta camada: **copy forte e clara**. Pode ser morna (informa mas não gruda) e ter
tom de IA. Fazer pegar é a Camada 4; soar humano é a Camada 5.

---

## CAMADA 4 · IDEIA — caçar a frase que pega (NOVO)

Copy clara que ninguém lembra não vendeu. Depois de afiar (vende?), uma passada pra fazer
os **momentos-chave grudarem** — hero, título de cada fold, CTA. Brilho nos picos, não na
página toda (página inteira "esperta" cansa e soa publicitária).

**A craft mora em `docs/frase-que-pega.md`** — Made to Stick (Inesperado + Concreto +
Crível), os devices retóricos, a Big Idea (Schwartz) e o gate de autenticidade. Não
reescrever a teoria aqui; ler de lá e aplicar. Régua final: as frases marcadas **BOM** no
`nucleo/voz.md` (o nível a bater e o jeito da casa).

O essencial pra rodar aqui:
1. Achar a **Big Idea** da página (o ângulo verdadeiro que surpreende) — a frase **destila**
   ela, não enfeita. Decorar não cola; reenquadrar cola.
2. Nos momentos que carregam, escrever **3 variações** com 1-2 devices (antítese, virada,
   específico vívido, paralelismo…). A 1ª é a óbvia; a sacada vem na 2ª/3ª.
3. Rodar os testes do doc: **grude** (lembra de olhos fechados?) · **motor** (surpreende +
   concreto + verdade) · **slogan** (claro, com sentido, da marca) · **autenticidade**
   (não mente; específico-verdadeiro > esperto-genérico) · **calma** (pegou sem gritar?).
4. Apresentar os momentos-chave com a melhor + as alternativas; o usuário escolhe.

> **Pega dentro da calma** e **autenticidade é gate.** Frase que gruda aqui é afiada, não
> gritada — resolve o "sem bordão" da voz (bordão é slogan repetido; isto é precisão
> memorável, usada uma vez no ponto certo). E esperteza que mente cai, por mais esperta.

Saída desta camada: **copy forte E memorável**. Falta a citabilidade (4.5) e virar humana (5).

---

## CAMADA 4.5 · CITABILIDADE (GEO — a página aparece na IA)

A página premium do sistema é IA-Ready: tem que **converter humano E ser citável por
ChatGPT/Gemini/Perplexity**. Esses motores extraem **sentenças standalone com dado e fonte**,
não prosa fluida. Há uma **tensão real** com a Camada 4 — a frase que gruda é fluida e
sugestiva; a frase citável é factual e auto-contida. Resolver assim: a **frase memorável vive
nos picos** (hero, título de fold); a **frase citável vive nos blocos de resposta** (abertura
de seção, FAQ). Não competem — ocupam lugares diferentes.

Checar (cruza com `/seo` e `/geo`, que são a autoridade de Schema/on-page — aqui é só a copy):
1. **Answer-first** — a 1ª linha do hero e de cada seção principal **responde a pergunta** que
   o título abre, em uma frase que faz sentido fora de contexto. Não enrolar antes de responder.
2. **Claim com dado + fonte** — afirmação forte vem com **número e de onde veio** (Princeton
   KDD: citação por IA sobe +41% com quote, +30% com fonte, +32% com estatística). Dado real,
   nunca inventado — vazio = pendente, como toda prova.
3. **FAQ extraível** — prever bloco de FAQ onde cada pergunta é a que o público realmente
   digita e a resposta é **standalone** (a IA cita a resposta sozinha, sem o resto da página).
4. Sem virar robótico: a citabilidade mora nos blocos de resposta/FAQ; o resto da copy mantém
   ritmo e voz. Citável **e** humana, em camadas — não a página inteira em tom de verbete.

Saída: **copy forte, memorável E citável**. Falta só virar humana — Camada 5.

---

## CAMADA 5 · entrega pro /escritor-br (humano + voz)

A copy forte passa pelo **`/escritor-br`** (naturalidade pt-BR, tira cara de IA, injeta
a voz). É o último passo antes de salvar/voltar pro `/pagina`. Ver "Gate de entrega".

## Passo de clareza (vale em todas as camadas)

- **Benefício** (resultado pro cliente) antes de **recurso** (o que a coisa faz).
- Zero jargão de marketing: cortar "alavancar", "potencializar", "transformar seu
  negócio", "solução completa/inovadora", "levar a outro patamar". A `voz.md` já bane várias.
- Linguagem simples (leitura de 6ª-7ª série). Palavra simples > palavra chique.
- Falar com **"você"**. Foco no leitor, não na empresa.

## Regras inegociáveis (herdadas de docs/persuasao.md)

- **A voz da marca dirige.** A copy soa como `nucleo/voz.md`, não como fórmula.
- **Sem prova inventada.** Número, depoimento e caso só de `nucleo/provas.md` autorizado.
  Sem prova real → mudar o ângulo (demonstração, processo, garantia), nunca inventar.
- **Só oferta ATIVA na página.** A copy vende exclusivamente o que está à venda agora
  (ofertas ATIVAS do `ofertas.md`). Produto em construção, piloto ou roadmap (seção
  FUTURAS / "não gerar conteúdo") **não aparece** — nem como "em breve". Vender o que
  não existe quebra a confiança e expõe o cliente quando o comprador cobra a entrega.
- **Swipe é molde, não cópia.** Nunca transplantar frase, tema ou marca do `swipe-copy.md`.
- **Sem urgência/escassez falsa.** Só se for contável e real.
- **Hook cumpre o que promete** — gancho que não entrega queima a marca.
- **Uma ação só** por página.
- A copy final passa pelo **`/escritor-br`** antes de ir pro `/pagina`.

## Saída

`producao/copy/<pagina>.md`:
- Copy por dobra (kicker · headline · subtítulo · corpo · CTA).
- As **3 opções de headline** com a recomendação.
- Nota de quais blocos têm **prova real** vs **pendente** (pra `/provas` resolver).

**Gate de entrega (obrigatório):** antes de salvar/entregar e antes de devolver pro
`/pagina`, a copy completa (já afiada na Camada 3 e com a frase caçada na Camada 4) passa
pelo **`/escritor-br`** (Camada 5 — humano + voz). A ordem é: **afia → faz pegar →
humaniza**. Copy que não passou pelas três não está pronta. O **gate frio final é o `/revisar`** (agente separado, olhos limpos) — roda
quando a peça vai ao ar (obrigatório antes de publicar venda/ads, regra do próprio
`/revisar`), não dentro desta skill.

O `/pagina` consome este arquivo como fonte do texto (já revisado pelo `/escritor-br`).

## Checklist final (rodar antes de entregar)

- [ ] Camada 1: consciência + sofisticação definidas; um leitor, uma promessa, uma ação
- [ ] Camada 2: sprint de 10 headlines; 3 melhores com recomendação; swipe consultado por bloco
- [ ] Benefício no headline, "o que é" no subtítulo; message-match com a origem do tráfego
- [ ] Camada 3 (Afiação): rodada — cada linha vende, não descreve; pecados caçados (inclui diluição do concreto)
- [ ] Gate de repetição: 1ª palavra, palavra-tema, estrutura, ideia repetida
- [ ] Ritmo: tamanhos de frase variados, sem monotonia
- [ ] Camada 4 (Ideia): hero, títulos de fold e CTA passam no teste do grude — frase que pega, calma e verdadeira (régua = frases BOM do voz.md)
- [ ] Camada 4.5 (GEO): hero e seções abrem answer-first; claim forte com dado+fonte; FAQ extraível standalone (citável por IA)
- [ ] Uma ação só; CTA acima da dobra e no fim; texto específico
- [ ] Zero jargão de marketing; benefício antes de recurso; "você"
- [ ] Prova só real; pendências marcadas
- [ ] Camada 5: passou pelo /escritor-br (humano + voz). Gate frio `/revisar` fica pra antes de publicar

## Onde registrar

`/copy` é **motor** (skill do sistema). Nasce no template ImpulsoX-OS e desce pros clones
via `/atualizar-motor`. Registrada na lista de automações do `README.md` (seção Premium) e
plugada na **Etapa 2 — Copy** do `/pagina` (a etapa de COPY roda esta skill) e na etapa
de **mini-redesign** do `/raio-x` (copy da abertura do "antes → depois"). A Camada 2 lê
`docs/swipe-copy.md`; a Camada 3 (Afiação) é o audit de conversão antes do handoff pro
`/escritor-br`.
