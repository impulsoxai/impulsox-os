---
name: pulso
description: >
  Use para a varredura DIÁRIA de notícias e ideias de post — "/pulso", "o que tem de novo
  hoje?", "ideias de hoje", "varre as notícias", "o que postar hoje?", ou chamada pelo
  `/abrir` quando o pulso do dia ainda não rodou. Varre as fontes curadas de
  `nucleo/fontes.md` (últimas 24-48h), pontua cada achado pela lente do negócio e
  alimenta o banco de ideias vivo em `producao/ideias/banco.md`. É o radar de todo dia:
  o `/radar` tira a foto do MÊS; o `/pulso` pega o que tem validade de 48 horas.
---

# /pulso — A varredura diária de ideias

O dono nunca mais senta na frente da tela sem pauta. Todo dia o pulso varre as fontes do
nicho, separa o que interessa AO NEGÓCIO (não o que é notícia genérica), rascunha o ângulo
e deposita no banco de ideias. Criar conteúdo vira colher, não inventar.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Roda do **degrau 1** (negócio/nicho definido no núcleo). Sem `nucleo/fontes.md`, a
primeira rodada monta o arquivo junto com o dono (ver "Primeira rodada") — nunca trava.

## O que ler antes

- `nucleo/fontes.md` — as fontes curadas (é o combustível; sem ele, primeira rodada)
- `nucleo/negocio.md` + `nucleo/ofertas.md` — o filtro: ideia boa é a que serve a uma
  oferta ATIVA ou ao topo de funil do nicho
- `nucleo/foco.md` — o cluster do momento (ideia fora do cluster só entra se for MUITO forte)
- `nucleo/aprendizados.md` — o tipo de pauta que já provou render aqui
- `producao/ideias/banco.md` — o banco atual (dedup: não repetir ideia viva; reaquecer só
  vencida com gancho novo)

## Guarda de rodada

O cabeçalho do `banco.md` guarda a data da última varredura. **Já rodou hoje → não roda
de novo** (mostrar as ideias quentes de hoje e parar). Isso deixa o `/abrir` chamar o
pulso todo dia sem risco de varredura dupla.

## Workflow — varrer, filtrar, pontuar, depositar

### 1. Varrer (só as últimas 24-48h, só fonte grátis e dentro dos termos)

Percorrer as fontes de `nucleo/fontes.md` por tipo. Fonte que falhar → registrar como
vazia e seguir (nunca travar o dia por uma fonte fora do ar):

- **Google News RSS** (grátis, sem chave, pt-BR):
  `https://news.google.com/rss/search?q=<termo>&hl=pt-BR&gl=BR&ceid=BR:pt-419`
  — um fetch por termo-chave do arquivo de fontes. É a espinha da varredura de notícia.
- **RSS/newsletters** — fetch direto do XML de cada feed listado.
- **Reddit** (JSON público): `https://www.reddit.com/r/<sub>/new.json?limit=25` e
  `search.json?q=<termo>&sort=top&t=day`. `score` + `num_comments` = tração.
- **Hacker News** (Algolia, sem chave): `https://hn.algolia.com/api/v1/search_by_date?query=<termo>&tags=story`
  — só pra nicho tech/IA; ordenar por `points`.
- **YouTube** (yt-dlp): `yt-dlp "ytsearch10:<termo>" --dateafter now-2days --print
  "%(view_count)s | %(title)s | %(webpage_url)s" --skip-download` — título que explodiu
  em 48h = ângulo que o algoritmo está premiando agora.
- **Firecrawl** (se instalado): `firecrawl search "<termo>" --sources news --tbs qdr:d`
  — camada extra de notícia fresca; sem firecrawl, as fontes acima bastam.

> Mesma regra do `/radar`: nada de scraping pago de TikTok/IG/X nem cookie em área
> cinza. Fonte nova só entra em `nucleo/fontes.md` se for grátis e dentro dos termos.

### 2. Filtrar pela lente (o corte que separa commodity de pauta)

Cada achado responde três perguntas. Duas não → descarta:
1. **Interessa ao CLIENTE do negócio** (não só ao dono)? Notícia de nicho que o público
   não sente na pele não é pauta.
2. **Temos lente própria?** Dá pra completar a frase: "isso muda [X] pro [cliente do
   negócio] porque [Y]"? Sem lente = notícia crua = commodity (mil contas postam igual).
3. **Serve a uma oferta ATIVA ou ao cluster?** (`nucleo/foco.md` + `ofertas.md`)

### 3. Pontuar e classificar validade

- **Tração (1-5):** número real da fonte (upvotes, views, pontos). Sem número → máx 3.
- **Lente (1-5):** quão forte é o ângulo próprio (5 = opinião que só este negócio daria).
- **Validade:** `QUENTE` (notícia — vale 24-48h, depois todo mundo já postou) ·
  `MORNA` (tendência — vale a semana) · `EVERGREEN` (dor permanente — vale o mês).
- **Newsjacking, as 3 regras duras:** só surfar notícia onde o negócio agrega expertise
  de verdade; velocidade importa (QUENTE parada 2 dias morre — avisar o dono no digest);
  **nunca** surfar tragédia, morte ou crise alheia pra vender.

### 4. Depositar no banco — `producao/ideias/banco.md`

Formato do banco (criar na primeira rodada):

```markdown
# Banco de ideias — vivo
> Última varredura: AAAA-MM-DD · fontes que falharam hoje: [nenhuma | lista]

## QUENTES (usar em 24-48h ou morrem)
| Ideia (título de trabalho) | Ângulo (a lente em 1 frase) | Fonte + tração | Oferta | Score | Status |
|---|---|---|---|---|---|

## MORNAS (valem a semana)
...mesma tabela...

## EVERGREEN (alimentam o /calendario)
...mesma tabela...

## USADAS / VENCIDAS (histórico do mês; zerar na virada)
```

Regras do banco: ideia nova entra com Status `nova`; virou peça → `usada (link da peça)`;
QUENTE com 48h+ → mover pra VENCIDAS. Dedup por tema (mesma notícia de 2 fontes = 1 ideia,
tração somada). O ângulo JÁ VAI RASCUNHADO — o banco não guarda link seco, guarda a ideia
com a lente pronta ("Claude lançou X → post: o que muda pra quem atende no WhatsApp").

### 5. Digest do dia (a entrega)

Mostrar ao dono, em poucas linhas:
- **3-5 ideias quentes rankeadas** (score = tração × lente), cada uma com o hook sugerido
  em 1 linha (usar `docs/hooks.md` como molde do hook)
- O que venceu sem ser usado (aprendizado: tema quente que o dono deixou passar)
- Uma linha de contagem: "banco tem N vivas (Q quentes, M mornas, E evergreen)"

Ideia QUENTE aprovada → oferecer produzir AGORA (`/post`/`/linkedin` — newsjacking não
espera calendário). EVERGREEN → fica no banco; o `/calendario` colhe na próxima rodada.

## Primeira rodada (sem `nucleo/fontes.md`)

Não travar: montar o arquivo com o dono em 5 minutos. Propor, a partir do
`nucleo/negocio.md`, 3-5 termos-chave do nicho + 2-3 subreddits + 2-3 canais YT do setor
+ os concorrentes já citados no núcleo, gravar em `nucleo/fontes.md` (molde abaixo) e
rodar a primeira varredura em seguida. O arquivo melhora com o uso: fonte que nunca rende
ideia sai; fonte nova que o dono indicar entra.

Molde do `nucleo/fontes.md`:

```markdown
# Fontes do pulso — curadas pra este negócio
> Lidas pelo /pulso todo dia. Só fonte grátis e dentro dos termos.

## Termos de busca (Google News RSS + firecrawl)
- <termo 1 do nicho>

## Feeds RSS / newsletters
- <url do feed> — <por que está aqui>

## Reddit (subs do nicho)
- r/<sub>

## YouTube (termos ou canais monitorados)
- <termo de busca ou canal>

## Concorrentes (só fonte pública)
- <nome + site>
```

## Fronteira com o /radar (não se pisam)

| | /pulso | /radar |
|---|---|---|
| Cadência | diária (5-10 min) | mensal (profunda) |
| Pergunta | "o que aconteceu ONTEM que nos interessa?" | "o que o público PROCURA este mês?" |
| Alimenta | banco de ideias (newsjacking + evergreen) | `producao/radar/<mês>.md` → calendário |
| Camadas | notícia + tendência fresca | 5 camadas (PAA, busca social, concorrente, sazonalidade, demanda interna) |

O `/calendario` lê os dois: o radar dá a espinha do mês; o banco do pulso dá o evergreen
acumulado e o espaço de flex pra pauta quente. O `/radar` também lê o banco (EVERGREEN
com tração alta vira candidata a pauta do mês sem re-pesquisar).

## Regras

- **Nunca inventar tração.** Sem número real, score de tração máx 3 e marcado suposição.
- **Notícia sem lente não entra no banco.** O filtro das 3 perguntas é inegociável.
- **Só fonte grátis e dentro dos termos** (mesma régua do /radar).
- Ângulo de concorrente é inspiração de mecânica, nunca cópia de pauta/texto (regra da casa).
- Peça que nascer de ideia QUENTE passa pelo fluxo normal (`/escritor-br` → `/revisar` se
  for venda) — velocidade não pula o crivo.
- Banco é um por negócio (`producao/ideias/banco.md`); em modo agência, cada cliente tem
  o seu (`clientes/<nome>/producao/ideias/banco.md`) com o `fontes.md` dele.

## Teste de aceitação (comportamental)

1. `nucleo/fontes.md` presente → varredura roda, ideias novas entram pontuadas com fonte
   + tração; fontes fora do ar aparecem como "falhou hoje", sem travar.
2. Sem `fontes.md` → a skill monta o arquivo com o dono e roda em seguida.
3. Rodou de manhã, o dono chama de novo à tarde → mostra as quentes de hoje, não re-varre.
4. Notícia bombando sem lente do negócio → descartada (não entra nem como morna).
5. Ideia QUENTE de ontem não usada → movida pra VENCIDAS no dia seguinte e citada no digest.
6. `/calendario` do mês seguinte → colhe as EVERGREEN do banco sem re-pesquisar.

---

**✓ Pronto:** banco de ideias alimentado + digest do dia (3-5 quentes com hook) · **→ próximo passo:** ideia QUENTE aprovada → `/post` ou `/linkedin` agora (newsjacking não espera); EVERGREEN → o `/calendario` colhe. Pré-requisito: núcleo com negócio definido; sem `fontes.md`, a primeira rodada monta.