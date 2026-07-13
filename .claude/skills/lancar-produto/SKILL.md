---
name: lancar-produto
description: >
  Use quando um produto digital (e-book pago, curso, mentoria, template, serviço
  produtizado) precisa ir ao mercado — "/lancar-produto", "quero lançar meu curso",
  "como vendo esse e-book?", "monta o lançamento". Orquestra o lançamento completo no
  método americano adaptado ao Brasil: oferta, pré-lançamento em 3 atos, página de
  vendas, sequência de e-mails, carrinho aberto/fechado e divulgação nas redes e ads.
---

# /lancar-produto — Lançamento de produto digital

Lançamento não é "postar que está vendendo". É uma sequência planejada que constrói
desejo antes de abrir o carrinho — o método que o mercado americano refinou por 20 anos
(Product Launch Formula e derivados), adaptado aqui pro contexto BR (Pix, WhatsApp,
Hotmart/Kiwify). Esta skill monta a máquina inteira com as outras skills do sistema.

Autoria: ImpulsoX AI. Conteúdo original.

## O que ler antes

- `nucleo/negocio.md`, `nucleo/voz.md`, `nucleo/foco.md`
- O produto em si (`producao/ebooks/<slug>/` se veio do `/criar-ebook`)
- Tamanho da audiência atual (lista de e-mail/WhatsApp, seguidores) — define o tipo de
  lançamento

## Passo 0 — Escolher o tipo de lançamento

| Tipo | Quando | Como |
|---|---|---|
| **Semente** | Produto ainda não existe ou não foi validado | Vender uma turma/lote pequeno ANTES de produzir tudo — valida com dinheiro real, e o feedback molda o produto |
| **Cliente fundador** | O produto é SOFTWARE/SaaS (app, agente, sistema) ainda em construção | Um cliente com a dor financia o MVP a taxa reduzida em troca de acesso antecipado, input no roadmap e desconto PERMANENTE (~50% do preço público). **IP fica 100% com o dono** — o cliente compra licença de uso, nunca equity ou exclusividade, por escrito ANTES da primeira linha de código. Rejeição = pesquisa de mercado grátis (disposição a pagar é a validação). O desconto do fundador define o PISO do preço público, não o teto |
| **Interno** | Produto pronto + audiência própria (mesmo pequena) | O lançamento completo desta skill, pra lista/seguidores |
| **Perpétuo** | Depois de 1-2 lançamentos internos que funcionaram | Funil sempre aberto (captura → sequência automática → oferta), alimentado por tráfego pago |

**Gate de prontidão pra SaaS/software (antes de qualquer lançamento público) — o teste
"pronto o bastante pra vender", 6 perguntas:** o loop central de valor funciona de ponta
a ponta? · usuário consegue se cadastrar e acessar sozinho? · consegue PAGAR pelo
produto? · está numa URL viva? · falha com graça, sem crashar? · você compartilharia a
URL com o cliente fundador hoje? — 6 sim = lança; "pronto de verdade" não existe, o
resto é feature e feature vem DEPOIS do primeiro pagante. E a **história fundadora**
(3 posts: o problema do cliente → o build junto → o resultado) é o conteúdo de
pré-lançamento pronto — publicar antes de abrir ao público, via esteira normal
(/calendario → /post). (Método Sprint/Matt Ganzak, jul/2026 — mecânica, não conteúdo.)

**Gate de validação por CONTEÚDO (antes do tipo Semente/Fundador, custa zero):** grava
1 vídeo curto atacando a dor nº1 do público + CTA de opt-in/comentário. Engajamento alto
= demanda existe, segue pro lançamento; baixo = pivota o ÂNGULO e testa de novo antes de
produzir qualquer coisa. Régua: ~100 opt-ins em 7 dias de orgânico = demanda confirmada
(ordem de grandeza — AI Deployment Playbook/Ganzak, jul/2026; calibrar pela audiência).
O conteúdo é o teste de mercado mais barato que existe — o produto nasce pra uma
audiência que já pediu, nunca pro deserto.

Audiência zero? Recomendar: isca gratuita (`/criar-ebook`) + captura + 30-60 dias
construindo lista ANTES de lançar. Lançar pro deserto frustra e queima o produto.

## Passo 1 — A oferta (antes de qualquer texto)

Oferta fraca não se conserta com copy. Montar e validar:
- **Promessa central:** o resultado específico que o comprador leva (não o conteúdo —
  a transformação)
- **Empilhamento de valor:** produto principal + complementos que removem obstáculos
  reais (template, checklist, sessão de dúvidas, comunidade) — cada item resolve um
  "mas e se...?" do comprador
- **Preço e ancoragem:** valor somado dos componentes vs preço cobrado; parcelamento BR
- **Garantia:** incondicional de 7 dias é o piso legal no Brasil (CDC, compra online);
  garantia maior/condicional é decisão de oferta
- **Razão real de urgência:** turma com data, lote com preço, bônus que expira. **Nunca
  escassez falsa** — contador que reinicia destrói confiança e é o atalho mais usado
  pra queimar marca

## Passo 2 — Pré-lançamento em 3 atos (o coração do método)

Sequência de conteúdo gratuito que vende "de lado" — ensina de verdade enquanto
constrói o caso da compra. 7-14 dias antes da abertura, um ato a cada 2-4 dias:

- **Ato 1 — A oportunidade:** a mudança/possibilidade que o público não viu ainda.
  Ensina algo aplicável + planta a promessa. (Responde: "por que isso importa AGORA?")
- **Ato 2 — A transformação:** prova de que funciona — caso real, demonstração,
  bastidor do método. (Responde: "funciona pra alguém como eu?")
- **Ato 3 — O caminho:** como aplicar + o que separa quem consegue sozinho de quem
  precisa do produto. Anuncia a abertura com data e hora. (Responde: "qual o próximo
  passo?")

Formato por canal: vídeo/live quando o usuário topa aparecer; carrossel + artigo + posts
quando não. Cada ato vira peças via `/post`, `/linkedin` e `/conteudo`, agendadas no
`/calendario`.

## Passo 3 — Sequência de e-mails/WhatsApp

Padrão de mercado de lançamento (molde PLF adaptado; ordem de grandeza — a fadiga do
formato no BR muda, reconferir a cada ciclo): 6-9 mensagens em 10-14 dias (ajustar ao
tamanho do ciclo):
1. Véspera do Ato 1 — "vem coisa nova" (curiosidade honesta)
2. Ato 1 publicado → link + contexto
3. Ato 2 publicado → link + caso
4. Ato 3 + anúncio da abertura (data/hora)
5. **Abertura do carrinho** — a oferta completa, link direto
6. Prova social + resposta às 3 objeções mais comuns (dia 2-3 do carrinho)
7. Penúltimo dia — lembrete com a razão real de urgência
8. Último dia, manhã — "fecha hoje à noite"
9. Último dia, 2-3h antes — última chamada, curta e direta

Carrinho aberto: **4-7 dias** (menos não dá tempo de decidir; mais dissolve a urgência).
A concentração de vendas no fim do carrinho é padrão consistente do formato (ordem de
grandeza: metade cai nas últimas 24-48h — prática PLF, sem estudo único) — os e-mails
finais não são opcionais.
**Todo texto passa pelo `/escritor-br`.**

## Passo 4 — Infraestrutura

- **Página de vendas:** acionar `/pagina` (promessa, atos condensados em prova, oferta
  empilhada, garantia, FAQ de compra, UMA chamada)
- **Checkout:** plataforma do usuário (Hotmart/Kiwify/similar) — entregar descrição,
  preço, parcelamento e área de membros prontos pra colar; cadastro é do usuário
- **Pagamento BR:** Pix + cartão parcelado no mínimo
- **Rastreio:** UTMs em todos os links da sequência; pixel da plataforma de ads se
  houver tráfego pago

## Passo 5 — Amplificação (opcional, com verba)

- `/ads-meta`: distribuição dos atos (públicos frios/mornos) + remarketing nos dias de
  carrinho aberto pra quem viu os atos
- `/ads-google`/ChatGPT Ads: capturar quem busca a solução durante a janela
- Orçamento: maioria no carrinho aberto (intenção quente), não espalhado igual

## Passo 6 — Pós-lançamento

48h depois de fechar: números na mão (`/analisar-ads` se houve tráfego pago) —
inscritos→compradores, origem das vendas, e-mail que mais converteu. Registrar em
`producao/lancamentos/<slug>/balanco.md`: o que repetir, o que cortar. Segundo
lançamento sempre rende mais que o primeiro — se o processo foi registrado.

## Saída

`producao/lancamentos/<slug>/` com: `plano.md` (cronograma completo dia a dia),
`oferta.md`, atos (briefs pras skills de produção), `sequencia-emails.md`,
página em `producao/paginas/`, e o balanço pós-lançamento.

## Regras

- Escassez só real. Promessa de renda/resultado garantido: nunca (e no Brasil atrai
  problema com CDC e plataformas).
- Garantia de 7 dias é lei em venda online BR — está na oferta, sempre.
- Depoimento só real e com autorização. Print de resultado idem.
- O pré-lançamento tem que ser bom SOZINHO — quem não comprar precisa sair melhor do
  que entrou (é isso que faz o próximo lançamento funcionar).
- LGPD: lista com consentimento; descadastro em toda mensagem.
- **Toda peça do lançamento passa pelo `/revisar` antes do ar** (página, e-mail, anúncio —
  regra do CLAUDE.md: venda/ads pago não sobe sem crivo frio). O plano orquestra; o gate
  fica em cada frente.

---

**✓ Pronto:** plano de lançamento orquestrado (oferta + atos + briefs das peças) · **→ próximo passo:** `/pagina` (página do lançamento), `/email` (sequência) e `/ads-*` (tráfego) — a skill orquestra cada frente; cada peça passa pelo `/revisar` antes do ar. Se faltar oferta firmada ou `marca/`, o sistema reorienta antes de disparar as peças.
