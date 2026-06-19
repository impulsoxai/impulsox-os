# Entregabilidade de e-mail — o que tira o e-mail da caixa de entrada

> Lido pelo `/email` como **gate** antes de fechar qualquer assunto, preview ou corpo.
> E-mail bem escrito que cai no spam não vende. Filtro de spam reage a palavra, pontuação,
> formatação e promessa exagerada — independente de a lista ser opt-in. Esta lista é a régua.
>
> Adaptado de patterns de entregabilidade (GrowthEngineX, +1000 campanhas) para o
> português-BR e o contexto da casa: e-mail marketing para base **opt-in própria** (não cold).
> A lógica transfere; as palavras foram traduzidas pros equivalentes que o público BR vê.

## A lógica (antes da lista)

Filtro de spam soma sinais. Cada gatilho isolado é leve; **acumulados** derrubam o e-mail.
Princípio: **e-mail tem que soar como pessoa real falando claro, não como anúncio, cupom,
golpe ou alerta de banco.** Na dúvida entre duas frases, escolher a de menos hype. Bate com a
voz da casa: "ambição grande, entrega calma" — calma também entrega melhor.

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
