# Entregabilidade de e-mail — o que tira o e-mail da caixa de entrada

> Lido pelo `/email` como **gate** antes de fechar qualquer e-mail. A ordem importa: o filtro
> decide **quem você é antes de ler o que você escreveu**. Autenticação, reputação de domínio
> e engajamento pesam MUITO mais que palavra-gatilho. Por isso este doc abre pela infra e só
> depois trata a régua de palavras — que é higiene de margem, não o gate principal.
>
> Contexto da casa: e-mail marketing para base **opt-in própria** (não cold). A régua de
> palavras foi adaptada de acervo de cold outbound (GrowthEngineX) — onde ela pesa mais por
> falta de reputação/relação. Em base opt-in com domínio reputado, **o peso dela é menor**;
> não tratar como "a régua".

## Camada 0 — Infra e autenticação (o gate de verdade, antes de qualquer palavra)

Sem isto, o conteúdo nem é avaliado — o e-mail não entra no jogo. **Pré-requisito antes de
declarar qualquer sequência "pronta pra disparar":**

- **SPF + DKIM + DMARC** no domínio de envio. Desde 01/04/2024, Gmail e Yahoo **exigem os três**
  de quem envia em volume; sem eles, vai pra spam ou é bloqueado antes do conteúdo. DMARC no
  mínimo `p=none`. Conferir com o dono se o domínio dele já tem (a ferramenta de envio costuma
  configurar; não assumir que está feito).
- **Domínio de envio próprio e aquecido** — não disparar volume de um domínio novo/frio.
  Reputação se constrói com consistência de envio.
- **One-click unsubscribe** (RFC 8058 / header `List-Unsubscribe` + `List-Unsubscribe-Post`) —
  exigência de Gmail/Yahoo desde 2024 **e** boa prática LGPD. Descadastro cumprido em **até 48h**.
  Não basta link no rodapé: tem que estar no header. Verificar se a ferramenta de envio injeta.
- **Taxa de reclamação de spam < 0,3%** (ideal < 0,1%). É um dos sinais que mais movem
  reputação. Acima disso, todo o domínio sofre.
- **Higiene de lista** — remover inativos, fazer *sunset* de quem não abre há meses. Lista que
  só engaja sobe reputação; lista cheia de morto derruba. Conectar com o `/desempenho`.

> Pré-requisito de infra ≠ degrau de voz. A skill `/email` precisa do degrau 2 (voz) pra
> ESCREVER bem, mas pra DISPARAR de verdade o pré-requisito real é esta Camada 0. Declarar os
> dois separados; uma sequência só está "pronta pra ar" quando a Camada 0 está resolvida.

## Camada 1 — Engajamento e relevância

Depois da infra, o que mais decide inbox é o comportamento do destinatário: aberturas,
cliques, respostas, "não é spam". E-mail relevante pra quem pediu engaja; engajamento sobe
reputação. Por isso a régua nº1 de conteúdo não é "evitar palavra", é **mandar coisa que a
pessoa quer abrir** — segmentar, respeitar a cadência, não cansar a lista.

## Camada 2 — A lógica do conteúdo (higiene de margem)

Resolvidas a infra e o engajamento, aí sim o conteúdo importa **na margem**. Filtro soma
sinais; cada gatilho isolado é leve, **acumulados** pesam — mas num domínio reputado, palavra
solta quase não move a agulha. Princípio: **e-mail tem que soar como pessoa real falando claro,
não como anúncio, cupom, golpe ou alerta de banco.** Na dúvida, menos hype. Bate com a voz da
casa: "ambição grande, entrega calma" — calma também entrega melhor.

## Palavras e expressões de risco (evitar, sobretudo no ASSUNTO)

O assunto é o mais sensível — é onde o filtro olha primeiro. Hífen, pontuação ou separação
**não** salvam a palavra (`grátis!!!` continua "grátis"; `c-l-i-q-u-e` continua "clique").

**Promessa / pressão / venda dura:**
grátis, 100% grátis, totalmente grátis, de graça, oferta, oferta especial, oferta imperdível,
promoção, super promoção, desconto, X% de desconto, melhor preço, menor preço, preço
imbatível, liquidação, última chance, por tempo limitado, só hoje, agora, urgente, aja agora,
compre já, compre agora, garanta já, clique aqui, clique no link, acesse agora, aproveite,
não perca, imperdível, exclusivo, ganhe dinheiro, renda extra, dinheiro fácil, lucro,
lucro garantido, resultado garantido, 100% garantido, satisfação garantida, sem risco, sem
compromisso, rico, fique rico, milhões, mil reais, R$ no assunto, $$$, dinheiro, bônus,
brinde grátis, sorteio, você ganhou, parabéns você foi selecionado.

**Cara de golpe / phishing (banir sempre):**
sua conta, atualize seus dados, confirme seus dados, verifique sua identidade, clique para
verificar, ação necessária, ação imediata, aviso importante, último aviso, notificação de
segurança, senha, redefinir senha, acesso bloqueado, regularize, pendência, débito em aberto.

**Categorias que nunca aparecem (queimam reputação do domínio):**
emagrecimento, perca peso, cura, milagre, fórmula secreta, aposta, cassino, jackpot, viagra,
farmácia online, sem receita, antienvelhecimento.

## Formatação que sinaliza spam

- **Sem CAIXA ALTA** em palavra ou frase (assunto ou corpo). MAIÚSCULA grita = spam.
- **Sem `!!!`** nem `???` — no máximo um, e raramente.
- **Sem excesso de pontuação ou símbolo** no assunto (★, →, 💰, $$$).
- **Sem assunto enganoso** (RE:/ENC: forjado, "sua fatura" sem fatura).
- **Poucos links** no corpo — muitos links = sinal de spam. Um CTA, um link.
- **Sem imagem pesada sem texto** (e-mail só-imagem cai no spam). Texto real domina.
- **Emoji no assunto:** no máximo um, só se a voz da marca usa; zero é mais seguro.

## Padrões seguros (reescrever hype em linguagem observacional)

| Em vez de (risco) | Escrever (seguro) |
|---|---|
| "Oferta especial pra você" | "uma coisa que pode te interessar" |
| "Garanta já com desconto" | "se fizer sentido, te conto como funciona" |
| "Clique aqui agora" | "me responde que eu te mando" |
| "Resultado garantido" | "pode ajudar, dependendo do seu caso" |
| "Por tempo limitado" | "não sei se é o momento certo pra você" |
| "Aumente suas vendas" | resultado concreto e específico ("recuperar a venda das 22h") |
| "Ganhe dinheiro" | o ganho real, nomeado (tempo, clientes, etc.) |

Regra de reescrita: troca **pressão por permissão**, **hype por observação**, **promessa
vaga por número/cena concreta**. Frase que soa anúncio → reescreve até soar gente falando.
(É o mesmo princípio do `docs/frase-que-pega.md`: específico-verdadeiro > esperto-genérico.)

**Cuidado: não troque hype por vago.** Reescrita segura ≠ assunto evasivo. Assunto com
**número, pergunta ou clareza direta** AUMENTA abertura — "uma coisa que pode te interessar"
entrega pouco e baixa a taxa de abertura sem ganho real de entrega. O que queima é **hype +
formatação agressiva combinados** (CAIXA ALTA + "!!!" + "GRÁTIS"), não a assertividade. Assunto
pode ser direto e específico; só não pode gritar nem prometer o que o corpo não cumpre.

## Assunto e preview (o que mais move abertura)

- **Assunto curto:** < ~40 caracteres (mobile corta o resto). Os de maior abertura têm 2-4
  palavras. Direto vence enrolado.
- **Preview / preheader:** a linha de prévia que aparece depois do assunto na caixa de entrada
  — é a segunda chance de fisgar. Não repetir o assunto: **complementar** (o assunto abre, o
  preview adianta o valor). Preview vazio ou repetido desperdiça espaço de abertura.
- Contrato do assunto: cumpre o que promete (mesma régra do `docs/persuasao.md`). Clickbait no
  assunto queima a lista e a reputação de envio.

## Nome de empresa com palavra banida

Se uma palavra de risco aparece no nome real de uma empresa citada, não dropar a empresa —
reescrever pra tirar o token isolado quando o nome ainda lê claro (ex.: "Crédito Fácil
Ltda" no corpo → "a Crédito Fácil"; o filtro pesa menos um nome próprio que um chamado de
venda). Não inventar nome.

## Checklist final (rodar antes de aprovar o e-mail)

- [ ] Assunto varrido — sem palavra de promessa/pressão/phishing, sem CAIXA ALTA, sem `!!!`
- [ ] Corpo varrido — hype reescrito em linguagem plana; sem cara de cupom/golpe
- [ ] Um CTA, um link — não vários
- [ ] Sem urgência falsa (escassez só com fato real, como na régua de persuasão)
- [ ] Lê como pessoa real, não como anúncio
- [ ] Descadastro presente e claro (LGPD)

Sinalizou algo → reescrever a linha e revarrer. Limpo → segue pro `/escritor-br` (humaniza) e
fecha.
