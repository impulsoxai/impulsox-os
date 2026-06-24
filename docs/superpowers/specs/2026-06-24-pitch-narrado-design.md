# Design — `docs/pitch-narrado.md` + conserto do passo 5 da `/slides`

> Spec do craft de pitch narrado que converte. Origem: o pitch institucional gerado pela
> `/slides` saiu fraco (auditoria do `revisor-marketing` reprovou: headline descreve produto,
> arco vazio, prova inventada, oferta inativa). Causa raiz: o passo 5 da `/slides` é um
> checklist passivo de regras, não ensina COMO escrever um pitch que converte. Data: 2026-06-24.

## Problema

A `/slides` (passo 5) escreve a copy do deck a partir de um checklist de regras inline
("headline vende resultado", "wedge é espinha", "arco dor→virada→prova"). Regra diz o que
EVITAR, não ensina o craft de COMO escrever. Resultado: pitch chapado, que descreve a empresa
em vez de convencer o dono que ouve.

O sistema já é rico em craft de escrita, mas tudo cobre o nível da PEÇA ou da FRASE, nunca o
ARCO de uma sequência narrada ao vivo:

- `docs/persuasao.md` — gatilhos + storytelling de uma peça (post/anúncio)
- `docs/frase-que-pega.md` — a frase isolada (hook, headline, device)
- `docs/swipe-copy.md` — moldes de copy de página
- `/escritor-br` — humanização (tira tique de IA, põe alma)
- `/oferta` — constrói a oferta (Equação de Valor de Hormozi, já no sistema)

Falta o nível acima: como encadear slides falados num arco que prende e converte.

## Solução

Um doc de craft novo, `docs/pitch-narrado.md`, que ENSINA o método (não lista o que evitar),
mais o conserto do passo 5 da `/slides` pra LER esse doc e rodar um loop ativo de escrita
(rascunho → auto-crítica → reescrita), em vez do checklist passivo.

### Fronteira (não duplicar o que existe)

| Doc | Cobre |
|---|---|
| `persuasao.md` | gatilhos + storytelling de UMA peça |
| `frase-que-pega.md` | a FRASE isolada (hook, device) |
| `pitch-narrado.md` (novo) | o ARCO de uma sequência de slides falada — o nível acima |
| `/oferta` | constrói a oferta; o pitch só REFERENCIA, não recalcula |

## O conteúdo de `docs/pitch-narrado.md` — 4 pilares

Cada pilar adaptado PT-BR + voz da casa (ambição grande, entrega calma — nunca grito) +
regras duras (só oferta ATIVA, prova só real). Cada um com exemplo na voz da ImpulsoX, puxado
dos exemplos BOM do `nucleo/voz.md`.

### Pilar 1 — O arco oscilante (Nancy Duarte, Sparkline)

O pitch não é subida linear (dor → solução → fim). Oscila entre **"o que é"** (a dor real de
hoje) e **"o que poderia ser"** (o futuro), várias vezes. Cada ida-e-volta gera energia por
contraste. O doc ensina a MAPEAR o arco (a oscilação) antes de escrever qualquer slide.

### Pilar 2 — A espinha estratégica (Andy Raskin, 5 passos)

Como amarrar o arco numa narrativa que vende:
1. **Mudança grande inegável** — abrir pelo status quo que mudou, não pelo concorrente
   (ImpulsoX: "só 15% das PMEs usam IA de verdade — pesquisa Sebrae/FGV").
2. **Nomear o inimigo** — o jeito velho ("usar IA é abrir o ChatGPT e perguntar").
3. **A terra prometida** — o futuro concreto e desejável.
4. **O produto como caminho** — apresentado como o meio de chegar lá (presente mágico),
   não como lista de feature.
5. **Prova de quem chegou** — evidência real do banco (`nucleo/provas.md`).

### Pilar 3 — O slide de oferta (Alex Hormozi, Equação de Valor)

O slide de oferta não lista serviço — mexe nos 4 fatores da Equação de Valor:
(Resultado dos Sonhos × Probabilidade Percebida) ÷ (Tempo × Esforço). Aumentar sonho +
probabilidade percebida (via prova/garantia REAL), diminuir tempo + esforço ("você aprova, a
IA trabalha" = done-for-you ataca o esforço). **Referencia o `/oferta`, não recalcula a
equação.** Probabilidade percebida vem de prova real ou garantia de processo, nunca de
afirmação vazia (o erro do pitch reprovado).

### Pilar 4 — A demo que converte (Tell-Show-Tell)

Pros slides-ponte de demo ao vivo: abrir pelo **"depois"** (o resultado transformado) antes do
clique; **dizer o valor → mostrar → reforçar**; o dono vê o GANHO, não a ferramenta interna
("olha a página entrando no ar", não "Claude Code rodando").

### Fecho do doc

Regras inegociáveis no fim (padrão do `persuasao.md`): só oferta ATIVA; prova só real do banco;
calma nunca grito; o arco serve o dono que ouve, não a empresa que fala.

## O conserto do passo 5 da `/slides`

### Parte A — o passo 5 LÊ o `pitch-narrado.md`

Igual a `/slides` já lê `marca/tokens.css` e o núcleo. Remove o bloco de regras inline
duplicado — a régua passa a morar no doc (fonte única).

### Parte B — passo 5 vira loop ATIVO (mecânica do `escritor-br`)

1. **Mapa do arco** — antes de escrever slide, desenhar a oscilação do Sparkline (o que é ↔ o
   que poderia ser) e a espinha de Raskin. Esqueleto emocional, não tabela de slides.
2. **Rascunho** — o pitch inteiro lido em sequência (regra existente: nunca slide isolado).
3. **Auto-crítica explícita** (bullets, não opcional) — responder:
   - qual slide DESCREVE produto em vez de vender ganho?
   - onde o arco fica linear (não oscila)?
   - a prova é real do banco, ou inventada?
   - a oferta mexe nos 4 fatores da Equação de Valor?
   - algum slide vende oferta INATIVA (roadmap/futura)?
4. **Reescrita** resolvendo os bullets.

Os 4 achados do auditor de hoje (descreve produto / arco vazio / prova inventada / oferta
inativa) viram exatamente as perguntas da auto-crítica — pegas ANTES do GATE 2, não depois.

O GATE 2 (mostrar copy pro dono) e o passo 8 (auditoria `/revisar`) continuam intactos — o loop
só melhora o que chega lá.

## Encaixe no sistema (motor)

- `pitch-narrado.md` é MOTOR (template) — desce pros clones via `/atualizar-motor`, não é
  trabalho de cliente.
- `CLAUDE.md`: 1 linha na lista de docs lidos — "para pitch narrado (slides, proposta ao vivo,
  vídeo), ler `docs/pitch-narrado.md`".
- `docs/mapa-de-skills.md`: registrar o doc como dependência da `/slides`.
- `CHANGELOG.md` + bump de versão (v0.2.9 no rodapé do `CLAUDE.md`).
- Quem mais pode ler o doc: `/proposta` e skills de vídeo (`/roteiro-yt`) — disponível, não
  obrigatório.

## Fora de escopo (tratado separado, não neste spec)

Pendências de núcleo do cliente (ImpulsoX-AI), via `/atualizar` no `ofertas-impulsox.md`:
1. CRM → mover de FUTURAS pra ATIVAS (confirmado pronto e vendável).
2. Trial de 3 dias → remover (descontinuado; aparece como porta de entrada em 2 ofertas).
3. Agente WhatsApp / prazo ~27/06 → atualizar status.

São trabalho de cliente, não de motor. Spec foca só no motor.

## Critério de pronto

- `docs/pitch-narrado.md` existe com os 4 pilares, exemplos na voz da ImpulsoX, regras
  inegociáveis no fecho, e fontes citadas (Duarte, Raskin, Hormozi, frameworks de demo).
- Passo 5 da `/slides` lê o doc e roda o loop ativo (mapa → rascunho → auto-crítica →
  reescrita); o bloco de regras inline duplicado foi removido.
- CLAUDE.md, mapa-de-skills, CHANGELOG e versão atualizados.
- Nenhuma duplicação com `persuasao.md` / `frase-que-pega.md` / `/oferta`.
