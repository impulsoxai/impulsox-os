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

## Quando roda

- Chamada pelo `/pagina` na etapa de COPY, **antes** de qualquer layout (copy primeiro,
  design depois — regra do `/pagina`).
- Sozinha, pra escrever ou revisar a copy de uma página.
- Pelo `/raio-x`, pra a copy do mini-redesign de demonstração.

## O que ler antes

- `nucleo/voz.md` — **a voz é o motorista** (tom, palavras banidas, exemplos "BOM").
- `nucleo/negocio.md` — posicionamento (o que de fato se vende) e diferencial.
- `nucleo/ofertas.md` — benefício, objeções e público de cada oferta (matéria-prima).
- `nucleo/provas.md` — **só prova autorizada** entra; banco vazio → marcar pendente.
- `nucleo/aprendizados.md` — o que a medição real já provou que converte aqui; pesa
  mais que qualquer fórmula genérica.
- `docs/persuasao.md` — **fonte única** de níveis de consciência, sofisticação e
  gatilhos. Não reescrever esse conteúdo aqui; ler de lá e aplicar.

Degrau mínimo: 2 (voz definida). Sem voz, escrever em tom neutro e marcar "confirmar voz".

## Passo 0 — Mirar antes de escrever

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

## Passo 1 — Headline (vale 80% do esforço)

5x mais gente lê o headline do que o corpo. Regras:
- **Benefício/resultado no headline; o "o que é" vai no subtítulo** (qualifica e torna
  crível). Pergunta-teste: se a pessoa ler *só o headline*, sabe o que ganha?
- **Message-match:** se veio de um anúncio, o headline ecoa a promessa do anúncio —
  senão, ela quica.
- **Sprint obrigatório:** escrever **10 versões** antes de escolher. As 3 primeiras são
  óbvias; as boas vêm depois. Forçar variedade — direto, curiosidade, benefício, dor,
  mecanismo. Apresentar as **3 melhores** ao usuário com a recomendação.

Toolbox de fórmulas (esqueleto, não molde a copiar):
| Fórmula | Forma |
|---|---|
| Benefício específico + gancho | resultado concreto + claim ousado OU quebra de objeção ("…sem X") |
| Resultado + condição | "[resultado desejado] sem [dor/esforço temido]" |
| 4U | Útil · Urgente · Único · Ultra-específico (mirar 2-3 num headline) |
| Mecanismo | nomear o "como" diferente quando o nicho está saturado |

## Passo 2 — Estrutura que converte (ordem provada, não reinvente)

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

Teste de cada bloco: ele **aumenta o desejo** ou **reduz esforço/confusão**? Se não faz
nem um nem outro, corta.

## Passo 3 — Ritmo (o que faz NÃO soar robótico)

Leitor não lê frase a frase, lê momento. Momento vem do ritmo:
- **Varie o tamanho da frase.** Curta pra impacto. Média pra explicar. E, de vez em
  quando, uma longa que ganha fôlego e constrói até o fim. Frases todas do mesmo tamanho
  soam de máquina.
- **Fragmentos valem.** "De propósito. Funcionam." Soam humanos.
- **Bucket brigades:** a cada poucos blocos, uma frase curta que empurra ("E tem mais.",
  "Repara nisso:") — sem virar bordão.
- Frase acima de ~20 palavras → quebrar ou encurtar.

## Passo 4 — Caça à repetição (GATE obrigatório — o erro mais comum)

Antes de entregar, varrer a copy inteira:
1. **Primeira palavra de cada bloco/parágrafo** — não pode repetir entre vizinhos.
2. **Palavra-tema colada** — se "operar/operando", "presença", "negócio" (ou qualquer
   termo) se repete em blocos vizinhos, trocar por sinônimo ou reescrever.
3. **Estrutura de frase repetida** — "A IA faz X. A IA faz Y." → variar a forma.
4. **Mesma ideia dita duas vezes** — headline e subtítulo (ou hero e CTA final) dizendo
   o mesmo com outras palavras → cortar uma.
5. **Truque:** ler de trás pra frente, bloco a bloco — o cérebro para de "consertar"
   sozinho e a repetição salta.

> Exceção (estreita): anáfora deliberada de **3+ batidas no corpo** ("Você X. Você Y.
> Você Z.") cria ritmo e é bem-vinda. MAS num **headline ou frase de duas partes**,
> repetir o mesmo verbo/palavra ("A IA **cuida**… você **cuida**…") é repetição por
> descuido, não anáfora — reescrever. Na dúvida, varia.

## Passo 5 — Clareza acima de esperteza

- **Benefício** (resultado pro cliente) antes de **recurso** (o que a coisa faz).
- Zero jargão de marketing: cortar "alavancar", "potencializar", "transformar seu
  negócio", "solução completa/inovadora", "levar a outro patamar". São muletas genéricas
  — e a `voz.md` já bane várias.
- Linguagem simples (leitura de 6ª-7ª série). Palavra simples > palavra chique.
- Falar com **"você"**. Foco no leitor, não na empresa.

## Regras inegociáveis (herdadas de docs/persuasao.md)

- **A voz da marca dirige.** A copy soa como `nucleo/voz.md`, não como fórmula.
- **Sem prova inventada.** Número, depoimento e caso só de `nucleo/provas.md` autorizado.
  Sem prova real → mudar o ângulo (demonstração, processo, garantia), nunca inventar.
- **Sem urgência/escassez falsa.** Só se for contável e real.
- **Hook cumpre o que promete** — gancho que não entrega queima a marca.
- **Uma ação só** por página.
- A copy final passa pelo **`/escritor-br`** (naturalidade pt-BR) antes de ir pro `/pagina`.

## Saída

`producao/copy/<pagina>.md`:
- Copy por dobra (kicker · headline · subtítulo · corpo · CTA).
- As **3 opções de headline** com a recomendação.
- Nota de quais blocos têm **prova real** vs **pendente** (pra `/provas` resolver).

O `/pagina` consome este arquivo como fonte do texto.

## Checklist final (rodar antes de entregar)

- [ ] Consciência + sofisticação definidas (de persuasao.md); um leitor, uma promessa, uma ação
- [ ] Sprint de 10 headlines feito; 3 melhores apresentadas com recomendação
- [ ] Benefício no headline, "o que é" no subtítulo; message-match com a origem do tráfego
- [ ] Cada bloco aumenta desejo OU reduz esforço/confusão
- [ ] Uma ação só; CTA acima da dobra e no fim; texto específico
- [ ] Gate de repetição: 1ª palavra, palavra-tema, estrutura, ideia repetida
- [ ] Ritmo: tamanhos de frase variados, sem monotonia
- [ ] Zero jargão de marketing; benefício antes de recurso; "você"
- [ ] Prova só real; pendências marcadas
- [ ] Passou pelo /escritor-br

## Onde registrar

`/copy` é **motor** (skill do sistema). Nasce no template ImpulsoX-OS e desce pros clones
via `/atualizar-motor`. Registrar na lista de automações do `CLAUDE.md` (seção Sistema) e
adicionar o passo "chamar `/copy` na etapa de COPY" ao `/pagina` e ao `/raio-x`.
