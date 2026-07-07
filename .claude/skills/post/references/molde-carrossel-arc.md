# Molde: Carousel Arc + pipeline de design-system (Duncan Rogoff)

> Dissecado do vídeo "How I Use Claude Code to Make INSANE Instagram Carousels"
> (youtube.com/watch?v=jFAH0txMwiI, assistido em 2026-07-06, frames + transcript).
> Regra da casa: copiar a MECÂNICA, nunca o conteúdo nem a estética. A identidade é
> sempre a do cliente (marca/design-guide.md manda; este molde é estrutura).

## 1. O Carousel Arc — a espinha de 5 atos (frame 8:00~)

Estrutura fixa de narrativa do carrossel, cada ato com regras duras:

| Ato | Trabalho | Regras do slide |
|---|---|---|
| **HOOK** | prender a atenção | UMA frase forte + payoff prometido; zero contexto |
| **PAIN** | nomear a dor | nomeia o problema DIRETO; lista em X do que quebra |
| **STEPS** | mostrar o sistema | o MECANISMO que resolve; lista numerada 01/02/03 |
| **RESULT** | provar que funciona | número específico e grande; outcomes com checkmark |
| **JOIN** | dirigir a ação | preço + promessa de destravamento; keyword/CTA único |

Rodapé do molde dele (a função de cada ato em 2 palavras): GRAB ATTENTION → NAME THE
PAIN → SHOW THE SYSTEM → PROVE IT WORKS → DRIVE THE ACTION.

Mapeamento pro nosso sistema: HOOK sai de `docs/hooks.md` (2-3 mecânicas diferentes);
PAIN sai das dores da oferta (`nucleo/ofertas.md` tem "as dores" prontas por produto);
RESULT só com prova AUTORIZADA (`nucleo/provas.md`) — número inventado nunca; JOIN
respeita a régua de CTA da matriz (marca/CTA só no fim).

## 2. Anatomia do slide dele (frame 10:00~, slide-01 real)

- Fundo escuro atmosférico (gradiente radial sutil), NÃO chapado nem ruidoso.
- **Eyebrow label** pequeno em mono/caps no terço inferior ("CLAUDE CODE · SETUP") —
  categoriza antes do título.
- Título GRANDE em serif, 3 linhas máx, quebra de linha pensada ("Claude forgets you.
  Here's the 10-minute fix.") — tensão + solução na mesma frase.
- UMA mensagem por slide. 8 slides por carrossel (nosso padrão atual: 7 — ok, faixa 7-8).
- Densidade: slide de hook quase vazio; slides de meio com lista; nunca parágrafo.

## 3. O pipeline que faz a qualidade (a parte que NÓS vamos adotar)

Ordem dele — cada etapa alimenta a seguinte:

1. **Referência real primeiro** (Pinterest: busca "graphic design", "typography poster";
   salva 10-15 pins que têm a VIBE) → nosso equivalente: /premium-design captura DNA.
2. **Prompt-chave:** "turn this into a design system in an html file and a design md
   file" → sai `design-system.md` + showcase HTML navegável (paleta com REGRAS de uso
   por token — ex.: "accent: só um bloom por composição", "asymmetric composition:
   âncora à esquerda, piscinas de luz à direita", "film grain: textura atmosférica,
   sentida não vista").
3. **O design system vira LEI da skill** — todo slide obedece os tokens + regras
   editoriais (= nosso marca/design-guide.md + tokens.css, com um plus: regras de
   COMPOSIÇÃO por slide, não só cor/fonte).
4. **Imagem por IA com as regras do design system NO prompt** (ele usa Higgsfield):
   o prompt de imagem é construído a partir das regras ("void background #0A0A0B,
   azure-cyan volumetric glow, asymmetric: robô ancorado à esquerda...") — a imagem
   nasce DENTRO da identidade, não colada depois.
5. **Saída completa de uma vez:** 8 PNGs 1080x1350 renderizados em paralelo + legenda
   de IG + post de LinkedIn do mesmo tema (par IG+LI num comando — nós já fazemos em
   skills separadas; o ganho é oferecer o par por padrão).
6. Agendamento por ferramenta externa (ele: Blotato — nós já descartamos; nosso
   /publicar cobre).

## 4. O que adotar vs o que já temos

| Mecânica dele | Status no ImpulsoX-OS |
|---|---|
| Arco de 5 atos com regra por slide | ADOTAR como estrutura nomeada no /post (hoje a skill tem estrutura, mas não este arco com regra dura por ato) |
| Regras de COMPOSIÇÃO no design system (não só paleta) | ADOTAR — design-guide.md ganha seção "regras editoriais de composição" |
| Prompt de imagem IA derivado do design system | ADOTAR no /post (reel/imagem) — imagem nasce na identidade |
| Eyebrow label categorizando o slide | ADOTAR na anatomia do slide |
| Par IG+LinkedIn gerado junto | oferecer por padrão (skills já existem) |
| Pinterest como fonte de referência | já coberto (premium-design, acervo por nicho) |
| Blotato/agendador | descartado (decisão registrada) |

## 5. DNA visual do estilo "Concept Poster" (prints em alta, 2026-07-06 — estilo APROVADO pela dona como direção)

> A dona aprovou ESTA estética como direção do carrossel ImpulsoX — mecânica abaixo,
> sempre traduzida pras cores/fontes da marca do cliente (nunca as do Duncan).

- **Papel, não tela:** fundo em cor de papel com grão sutil; a peça parece um CARTAZ
  impresso, não um slide de PowerPoint.
- **Tipografia gigante condensada** em caixa-alta, preta no papel claro, leading
  apertado; a palavra-chave da frase pode virar a cor de accent. Contraste de escala
  brutal: display enorme + labels minúsculos, nada no meio.
- **UM accent só** (no dele: coral #E96A3C) usado com disciplina: uma palavra, barras,
  molduras, formas grandes. Nunca dois accents competindo.
- **Labels em MONO com prefixo `//`** ("// 01 — COVER", "DS NO. 02 / 05.27.26"):
  eyebrow no topo em mono espaçado, cor apagada — categoriza e dá cara de spec técnica.
- **Grid de painéis com moldura fina** (fio preto 1-2px): colunas alternando
  papel/accent/preto; rodapé em barra preta com texto mono claro.
- **Numerais gigantes** 01/02/03 como elemento gráfico (não só lista).
- **Detalhes editoriais:** texto vertical rotacionado na margem, setas →, carimbos/
  tickets, códigos de data. É o que dá o "feito por designer".
- **Ilustração flat vetorial** 2-3 cores quando entra (semáforo, personagem), nunca
  foto genérica.

**Tradução ImpulsoX (tokens.css):** papel-creme → dark `#06060d` + grão (`--grao`);
tipo preto → off-white `#f0ebe0` (Sora 800 caps); accent coral → dourado `#d4af37`
(regra: UMA palavra/elemento por slide); roxo `#7c3aed` = cor ESTRUTURAL (painéis,
numerais); labels mono → DM Mono em `--cor-texto-mudo`; molduras → fio dourado
(`--cor-borda`/`--cor-borda-forte`); barra de rodapé → superfície `#0e0e18` com mono.

## 6. O sistema de capas + a grade de feed (prints do Instagram real dele, 2026-07-06)

A capa NÃO é uma escolha única ("foto ou tipografia") — é um SISTEMA por formato. O
leitor aprende a ler o feed:

| Tipo de capa | Sinaliza | Quando usar |
|---|---|---|
| Rosto/foto + banner de texto | REEL (vídeo) | toda thumbnail de vídeo — rosto para o scroll |
| Tipografia pura (split de 2 cores) | carrossel de opinião/dado | tese forte, número forte |
| MASCOTE da marca | carrossel de lista/ferramentas | top N, roundup, tutorial |
| Foto de contexto + texto grande | carrossel de dor visual | quando a dor é uma CENA |

- **Grade pensada:** as capas alternam as 2-3 famílias de cor da marca em xadrez — o
  perfil visto de longe é um tabuleiro coeso. (Já prometemos "grade de feed pensada"
  no ofertas.md — isto é o COMO.)
- **Mascote = assinatura visual recorrente** (ImpulsoX tem: `marca/mascote/`) — o
  personagem aparece na capa de listas e dentro de slides; reconhecimento instantâneo
  no Explore.
- **Card-ticket de produto real:** ferramenta/produto vira cartãozinho (nome +
  descrição + prova social ex. estrelas) com seta desenhada apontando — o "produto
  real em mockup" com acabamento de cartaz.
- **Paginação `N/7` + seta gigante em TODO slide** — reduz drop-off no meio.
- **Último slide fixo: SAVE / SHARE / FOLLOW + @handle** — CTA de algoritmo (save/send).
  A VENDA fica na legenda, com keyword de comentário ("comenta X que eu mando no DM")
  — automação de DM só por ferramenta oficial/compliant, regra da casa.

## 7. Anti-padrões que o molde evita

- Slide com mais de uma ideia. — Parágrafo em slide. — CTA no meio do carrossel.
- Número redondo/vago no RESULT (tem que ser específico) — e na nossa casa: só com
  prova autorizada; sem prova, o RESULT vira demonstração de capacidade, nunca número
  inventado.
- Estética genérica de template: a identidade vem do design system do CLIENTE.
