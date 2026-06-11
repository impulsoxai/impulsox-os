# Perfis de negócio — o catálogo dos moldes

> Fonte única dos quatro tipos de negócio que o ImpulsoX-OS atende. O `/plugar` e o
> `/cliente` leem este arquivo, deixam o usuário escolher um molde e geram a partir dele
> um `nucleo/perfil.md` **preenchido** (nunca placeholder). As skills de produção leem o
> `perfil.md` do negócio — não este catálogo — na mesma leitura silenciosa do núcleo.
>
> Autoria: ImpulsoX AI. Conteúdo original.

---

## Por que existe (e por que NÃO mexe na constituição)

A raiz `CLAUDE.md` é a **constituição do produto**: como o OS lê contexto, decide, mede e
aprende. Ela não muda de negócio pra negócio. O que muda é o **tipo** de negócio atendido
— e isso mora em `nucleo/perfil.md` (ou `clientes/<nome>/nucleo/perfil.md` no modo
agência), lido junto com `negocio.md`/`voz.md`/`foco.md`.

O perfil diz às skills **como se comportar pra este tipo de negócio**: quem é o "cliente",
quais skills lideram, qual a ênfase da Escada de Contexto, o que se produz mais e o que
não se aplica. A constituição fica intocada.

---

## O arquivo `nucleo/perfil.md` (estrutura comum)

Todo perfil preenche os mesmos campos — muda o conteúdo:

```markdown
# Perfil do negócio

> Define o TIPO de negócio e como as skills se comportam pra ele.
> Preenchido pelo /plugar (ou /cliente) a partir do molde escolhido.
> Lido junto com o resto do núcleo.

**Perfil:** [pme-local | agencia | criador | profissional-liberal]

## Quem é o "cliente" deste negócio
[Pra PME local, é quem compra o produto/serviço. Pra criador, é a AUDIÊNCIA — quem
assiste/segue — e a monetização vem depois (patrocínio, infoproduto, comunidade).]

## Skills que lideram
[A ordem natural de trabalho deste perfil — o que o sistema sugere primeiro.]

## Ênfase da Escada de Contexto
[Que degrau importa mais aqui e qual a fonte de subida típica.]

## O que se produz mais
[Os entregáveis recorrentes deste perfil.]

## O que NÃO se aplica
[Skills que não fazem sentido pra este perfil — pra não oferecer fora de hora.]

## Mix do /calendario
[As proporções de intenção deste perfil — o /calendario lê daqui.]
```

---

## Os 4 moldes

### Molde 1 — PME local (`pme-local`)
Restaurante, clínica, loja, oficina, salão, serviço com região. O pão-com-manteiga.

- **Cliente:** quem compra o produto/serviço, decide na busca local e no boca a boca.
- **Skills que lideram:** `/local` (Google é onde o cliente decide) → `/perfil-ig` →
  `/calendario` → `/post`. `/raio-x` e `/proposta` só no modo agência (quando a ImpulsoX
  vende pra ele).
- **Ênfase da Escada:** degrau 1 quase sempre disponível (tem site ou perfil no Google);
  subir pra 3 com a entrevista vale muito porque o diferencial local é específico.
- **Produz mais:** posts educativos do nicho, prova social local, presença no Maps.
- **Não se aplica:** `/lancar-produto` (raro), GEO pesado (só se o nicho for buscado em IA).
- **Mix do `/calendario`:** Ensinar 35% · Provar 30% (prova local pesa) · Posicionar 15% ·
  Vender 20%.

### Molde 2 — Agência / consultoria (`agencia`)
Equipe pequena (ou solo) entregando pra vários clientes. **É o modo da própria ImpulsoX.**

- **Cliente:** outras empresas (PMEs) que contratam marketing como serviço.
- **Skills que lideram:** `/raio-x` (abre porta) → `/proposta` (fecha) → `/cliente` (pluga) →
  produção dentro da pasta do cliente → `/relatorio` (retém).
- **Ênfase da Escada:** o núcleo da raiz descreve a **agência**; cada cliente tem a própria
  escada em `clientes/<nome>/`. O trabalho vive dentro da pasta do cliente.
- **Produz mais:** diagnósticos, propostas, e a produção de cada cliente na voz DELE.
- **Não se aplica:** nada é proibido — é o perfil mais completo. Atenção: voz e marca são
  sempre do cliente, nunca da agência (a constituição já garante isso).
- **Mix do `/calendario`:** definido por cliente, não pela agência.

### Molde 3 — Criador / canal (`criador`)
YouTube, marca pessoal, infoproduto, newsletter.

- **Cliente:** a **audiência** — quem assiste e segue. Não há "venda de serviço local";
  a monetização é indireta (patrocínio, infoproduto, comunidade, afiliação).
- **Skills que lideram:** `/calendario` (cadência é tudo pra criador) → `/conteudo` (um tema
  vira vídeo-base + corte + post) → `/post` e `/linkedin` → `/criar-ebook` e `/lancar-produto`
  quando houver infoproduto. `/desempenho` pesa mais aqui (o algoritmo é o chefe).
- **Ênfase da Escada:** degrau 3 (a voz e o ponto de vista do criador) é o que mais importa —
  conteúdo de criador morno não existe pro algoritmo. Degrau 4 (dados de desempenho) vira o
  motor: o que reteve audiência manda no próximo `/calendario`.
- **Produz mais:** roteiros, cortes, carrosséis derivados de vídeo, posts de posicionamento.
- **Não se aplica:** `/local` (sem região), `/raio-x` de presença local. `/proposta` só se
  for vender mentoria/serviço.
- **Mix do `/calendario`:** Ensinar 45% · Posicionar 30% (a opinião do criador é o produto) ·
  Provar 10% · Vender 15%.
- **Nota de adaptação:** pra criador, "vender" raramente é oferta direta — é construir
  autoridade e lista. O `persuasao.md` vale igual, com reciprocidade e autoridade no topo.

### Molde 4 — Profissional liberal / freelancer (`profissional-liberal`)
Advogado, arquiteto, dentista autônomo, designer, consultor solo. Serviço entregue por uma
pessoa, muitas vezes sem ponto físico.

- **Cliente:** quem contrata o serviço especializado; a confiança na pessoa é o que fecha.
- **Skills que lideram:** `/perfil-ig` e `/linkedin` (marca pessoal é o ativo) →
  `/calendario` → `/conteudo`. `/local` quando atende uma região; `/proposta` pra fechar
  cliente um-a-um.
- **Ênfase da Escada:** degrau 3 — a autoridade demonstrada é tudo; a voz pessoal precisa
  estar bem capturada.
- **Produz mais:** conteúdo de autoridade, casos (com autorização), presença no LinkedIn.
- **Não se aplica:** `/lancar-produto` no início (raro); ads pesados só com caixa pra isso.
- **Mix do `/calendario`:** Ensinar 40% · Provar 25% · Posicionar 20% · Vender 15%.

---

## Como cada skill usa o perfil

- **`/calendario`** — lê o "Mix do /calendario" do `perfil.md` no lugar do padrão genérico
  40/25/20/15. Perfil `agencia` não tem mix próprio: o mix sai do `perfil.md` de cada cliente.
- **`/post` e `/linkedin`** — formato e tom acompanham o perfil (criador fala em 1ª pessoa
  com opinião forte; PME local ensina o nicho com prova local).
- **`/identidade`** — o clima visual parte do perfil (criador pede personalidade; profissional
  liberal pede sobriedade que passa confiança).
- **`/raio-x` e `/proposta`** — fazem sentido no modo agência (vender pra um prospect); pra
  negócio próprio, só quando ele mesmo vai vender um serviço um-a-um.
- **`/local`** — só perfis com região (`pme-local`, às vezes `profissional-liberal`). Não
  oferecer a `criador`.

A leitura é silenciosa: o usuário vê o resultado moldado ao tipo dele, não o relatório.
