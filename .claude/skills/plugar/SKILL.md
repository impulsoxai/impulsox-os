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
   Núcleo virgem → entrar direto na conversa.

2. **Modo de uso.** Perguntar:
   > "Este sistema vai cuidar do marketing do **seu próprio negócio**, ou você atende
   > **vários clientes** (agência/freelancer)?"
   - Negócio próprio → o núcleo da raiz (`nucleo/`) é desse negócio. Seguir aqui.
   - Vários clientes → o núcleo da raiz passa a descrever a **sua agência**; cada cliente
     entra depois em `clientes/<nome>/` pela skill de plugar cliente. Continuar a
     entrevista mirando a agência como o "negócio" desta rodada.

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

## Fase 2B — Entrevista

Ritmo de conversa: lançar a pergunta, esperar, só então seguir. Resposta vaga ganha
**uma** segunda chance ("me dá um exemplo concreto?"); se continuar vaga, entra como
está e o campo fica marcado pra refino futuro. Pergunta que a Fase 2A já respondeu não
se repete.

**Sobre o negócio:**
1. "Qual o nome do negócio? (se a marca é você, vale o seu nome mesmo)"
2. "Um cliente em potencial te para e pergunta 'o que vocês fazem?'. Qual a sua
   resposta de uma frase?"
3. "Pensa no último cliente que fechou com você: quem era e o que ele estava
   precisando quando chegou?"
4. "Por que escolhem você e não o concorrente? O que te diferencia de verdade?"

**Sobre a voz (provisório — a voz de verdade vem depois, no `/voz`):**
5. "Em uma frase, como a marca fala? (ex: próxima e descontraída / técnica e precisa /
   sóbria e premium) — só pro sistema não sair mudo enquanto a gente não faz a entrevista
   de voz."
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
- `nucleo/negocio.md` — respostas 1-4 (+ extração): o que é, o que entrega, quem paga, diferencial
- `nucleo/voz.md` — respostas 5-6: tom provisório, exemplos, lista do que evitar.
  Marcar no topo do arquivo que é esboço, a ser substituído pela entrevista do `/voz`.
- `nucleo/foco.md` — respostas 7-8: prioridade, metas, prazos, sazonalidade

Regras de escrita do núcleo:
- Não inventar. Resposta vaga entra como veio, ou vira um campo marcado "_a confirmar_".
- Separar **fato** de **suposição** quando a origem foi extração sem confirmação.
- Não deixar o aviso de placeholder nos arquivos finais.

## Fase 4 — Registrar a escada

Atualizar `nucleo/escada.md`:
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
✓ Modo: [negócio próprio | agência]
✓ Degrau de contexto: [n] — [o que isso permite]
✓ Núcleo: negocio.md · voz.md · foco.md
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

- Mirar em ~5 minutos de conversa; nunca passar muito disso. Pergunta emperrada não
  segura o setup — anota-se o que veio e a conversa anda.
- O roteiro é fechado: pergunta fora da lista só quando uma resposta abriu lacuna que
  impede o sistema de trabalhar.
- Nunca bloquear por falta de informação — descer um degrau é sempre opção.
