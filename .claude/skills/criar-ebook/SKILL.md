---
name: criar-ebook
description: >
  Use para criar um e-book ou material rico completo — "/criar-ebook", "faz um ebook
  sobre X", "material pra capturar leads", "guia em PDF", "isca digital". Produz o
  e-book inteiro: estrutura, conteúdo real, diagramação em PDF com a identidade da
  marca, e a página de captura que o distribui. Serve tanto pra isca gratuita quanto
  pra produto vendável.
---

# /criar-ebook — Material rico do conteúdo à capa

Um e-book bom é um produto, não um PDF de enrolação. Esta skill produz o material
completo — pesquisa, texto, diagramação com a marca — e o caminho de distribuição
(captura de leads ou venda).

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda no **degrau 1** (negócio e voz); a diagramação fica boa de verdade no **degrau 2**
(marca).

## O que ler antes

- `docs/gabarito-execucao-texto.md` — **PRIMEIRO**: gates de qualidade do texto (2 passes de copy, proibições por busca literal, aceite). Nenhum gate é opcional
- `docs/gabarito-execucao-visual.md` — na diagramação: QA visual com defeitos nomeados (amostra de 3 páginas antes do resto) + gate antes do passo caro
- `nucleo/negocio.md`, `nucleo/voz.md` — o e-book tem que soar como a marca
- `marca/design-guide.md` + `marca/tokens.css` — diagramação na identidade
- `producao/artigos/` — artigos existentes sobre o tema são matéria-prima legítima
  (reaproveitar e aprofundar, não repetir)

## Passo 1 — Definir o produto

Três perguntas:
1. "Tema e promessa: o que o leitor consegue FAZER depois de ler?"
2. "Isca gratuita (troca por e-mail/WhatsApp) ou produto pago?"
3. "Tamanho — a resposta 2 decide o default:
   - **Isca → CURTA e consumível (5-15 páginas, lida em <15 min):** checklist, template,
     guia de UMA coisa. A prática 2026 de lead magnet migrou pro quick-win porque a taxa
     de CONSUMO da isca prevê a conversão da sequência melhor que a taxa de download —
     e-book de 50 páginas baixado e não lido esfria o lead que o `/email` vai nutrir.
   - **Produto pago / peça de autoridade → aprofundado (30-50 páginas)** se o tema
     sustentar."

Promessa vaga → afunilar: e-book que ensina UMA coisa bem feita converte mais que
enciclopédia rasa.

## Passo 2 — Estrutura aprovada antes do texto

Esqueleto: título de capa (promessa, não tema) → introdução curta (por que isso importa
AGORA, 1 página) → 4-8 capítulos, cada um resolvendo uma etapa do problema → conclusão
com plano de ação (checklist aplicável) → página final com a oferta da empresa (ponte
natural, não panfleto). Aprovar com o usuário antes de escrever.

## Passo 3 — Escrever

- Cada capítulo: conceito → exemplo concreto → como aplicar (passos). O leitor age, não
  só lê.
- Dado de terceiro com fonte nomeada; sem estatística inventada.
- Caso real da empresa quando existir (pedir material); sem inventar caso.
- **Texto inteiro passa pelo `/escritor-br`** — e-book com cara de IA destrói a
  autoridade que ele deveria construir.

## Passo 4 — Diagramar

PDF com a identidade da marca (HTML → PDF, mesma técnica do `/post`, ou skill nativa de
PDF quando disponível):
- Capa com título-promessa, logo e UMA imagem/elemento forte
- Tipografia da marca, hierarquia clara, respiro generoso (margem é design)
- Elementos de leitura: destaques de citação, caixas de checklist, numeração de capítulo
- Rodapé com marca + página; capa de fechamento com a chamada
- Formato A4 vertical (imprime bem, lê bem em tela)

Salvar em `producao/ebooks/<slug>/` (fonte + PDF final).

## Passo 5 — Distribuição

- **Isca:** acionar `/pagina` pra página de captura enxuta (promessa + 3 bullets do que
  o leitor leva + formulário mínimo: nome e e-mail/WhatsApp) + e-mail/mensagem de
  entrega pronta. Mencionar LGPD (consentimento + finalidade no formulário).
- **Nutrição pós-captura:** acionar `/email` pra sequência de boas-vindas (4-5 e-mails:
  entrega da isca → melhor conteúdo → prova → oferta com objeção respondida → convite).
  Quem baixou a isca é o lead mais quente; a sequência transforma download em conversa.
- **Pago:** preparar o material de venda — descrição pra plataforma (Hotmart/Kiwify ou
  similar), 3 argumentos centrais, FAQ de compra. O cadastro na plataforma é do usuário;
  o sistema entrega o pacote pronto pra subir.
- Acionar `/calendario` pra agendar as peças de divulgação (posts que apontam pra
  captura/venda).

## Regras

- Conteúdo do e-book entrega valor de verdade ANTES de vender qualquer coisa — material
  que é só funil disfarçado queima a marca.
- Promessa da capa = conteúdo interno. Sem títulos-isca que o miolo não paga.
- Isca gratuita: pedir só os dados necessários (LGPD: minimização).
- E-book pago tem que valer o preço sozinho, sem depender de "bônus".

---

**✓ Pronto:** e-book/isca pronto pra subir (conteúdo + capa + 3 argumentos + FAQ) · **→ próximo passo:** `/revisar` antes de subir (peça pública de venda — regra do CLAUDE.md); aprovado, `/email` pra montar a sequência que entrega/vende o material, ou `/pagina` se for criar a página de captura/venda. Se faltar núcleo ou `marca/`, o sistema reorienta antes de gerar.
