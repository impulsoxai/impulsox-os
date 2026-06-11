<p align="center">
  <img src="assets/logo-impulsox-ai.png" alt="ImpulsoX AI" width="220">
</p>

# ImpulsoX-OS

> O sistema operacional de marketing da sua empresa, dentro do Claude Code.

Marketing premium — conteúdo, anúncios e páginas — produzido por um sistema que conhece
o seu negócio, mantém a sua identidade visual e trabalha com o contexto que tiver na mão,
melhorando conforme você alimenta mais informação.

Produto da **ImpulsoX AI** · [impulsoxai.com.br](https://impulsoxai.com.br)

---

## Instalar (um comando)

Abra o Claude Code em qualquer pasta e cole:

```
Clona o https://github.com/impulsoxai/impulsox-os.git na pasta atual,
entra nela e roda o /plugar.
```

Ele clona, entra na pasta e dispara a entrevista de configuração. Você só responde.

Prefere o terminal?

```bash
git clone https://github.com/impulsoxai/impulsox-os.git
cd impulsox-os
claude
```

E dentro do Claude Code: `/plugar`.

O `/plugar` te entrevista sobre o negócio (5-7 minutos), monta o núcleo de contexto e
configura o sistema. Roda uma vez. Sem tempo pra entrevista? Passa só a URL do site —
o sistema extrai o que der e já começa a produzir; refina depois.

Ao terminar, renomeie a pasta pro nome do seu negócio — ela é a sua operação agora.

---

## A ideia

Marketing parado em circuito aberto — decide, executa, não mede, repete no escuro —
vira circuito fechado dentro do OS: decide, produz, publica, mede, corrige. Uma pessoa
com o sistema entrega o que antes exigia um time.

O sistema funciona em qualquer **degrau de contexto**: do "só sei o nome" até
"tenho dados reais de campanha". Ele nunca trava esperando informação — produz com o
que tem e marca o que é suposição, pra você confirmar.

---

## As 16 automações

**Fundação** — `/plugar` liga o sistema com uma entrevista de 5-7 min · `/identidade`
extrai a marca do seu site ou cria do zero (logo incluso) · `/escritor-br` garante que
nenhum texto saia com cara de IA.

**Conteúdo** — `/calendario` decide o que postar e quando (você não precisa saber
marketing) · `/post` cria carrossel, post e roteiro de reel com a sua marca ·
`/linkedin` escreve pro algoritmo de 2026 · `/conteudo` transforma um tema em artigo +
Instagram + LinkedIn · `/publicar` leva ao ar (Instagram automático, LinkedIn pessoal
em um clique).

**Anúncios** — `/analisar-ads` lê seus exports de Google e Meta e diz o que escalar e
o que pausar (cálculo 100% em script, não em opinião) · `/ads-google` monta a campanha
pronta pra importar · `/ads-meta` monta campanha com criativos da sua marca.

**Premium** — `/cliente` pluga um cliente novo em modo agência · `/raio-x` diagnostica
qualquer presença digital a partir da URL · `/pagina` entrega landing page padrão
R$ 5.000.

**Produtos digitais** — `/criar-ebook` produz o material completo diagramado ·
`/lancar-produto` monta o lançamento inteiro (método validado, adaptado ao Brasil).

## Estrutura

- `nucleo/` — o cérebro: quem é a empresa, como fala, o que é foco agora
- `marca/` — o rosto: cores, tipografia, logo, tokens de design
- `clientes/` — uma pasta por cliente (modo agência)
- `producao/` — o que o sistema gera
- `.claude/skills/` — as automações do sistema

## Como o sistema pensa — Escada de Contexto

O sistema nunca trava esperando informação. Só tem a URL de um site antigo e a reunião
é amanhã? Ele extrai o que der, marca o que assumiu e já produz opções. Cada informação
nova (logo, entrevista, dados de campanha) sobe um degrau — e tudo que foi feito antes
se recalibra. Fato é fato, suposição é marcada, e você sempre sabe qual é qual.

---

*Produto da ImpulsoX AI.*
