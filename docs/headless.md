# Execução headless — skills em cron no VPS

> Como rodar skills do ImpulsoX-OS sem ninguém na frente do terminal: `claude -p` (modo
> não-interativo) disparado por cron num VPS. Este doc é **referência de configuração** —
> a ativação real (crontab) é por clone, manual, e está **fora do plano v0.2**.
> Autoria: ImpulsoX AI. Conteúdo original.

## A regra inegociável

**Headless nunca decide publicação sozinho.** Só executa peça que um humano já aprovou via
`/revisar`. O cron move o que já passou pelo crivo — nunca cria-e-publica no escuro. Skill
que decide o que vai ao ar (calendário, copy nova, anúncio) não roda headless; quem roda é
o braço operacional (`/publicar` o que está aprovado, `/desempenho` que só lê e mede).

Por que: o produto vende confiança ("revisor sênior antes do ar", "nada que arrisque sua
conta"). Automação que publica sem humano quebra isso na primeira peça ruim.

## Como funciona

`claude -p "<prompt>"` roda uma vez, sem prompt interativo, e sai. O cron chama esse comando
no horário marcado, dentro da pasta do clone. Forma geral de um job:

```bash
cd /srv/clientes/<cliente> && \
  claude -p "/publicar o que está aprovado e ainda não foi ao ar" \
    --allowedTools "Bash(git*),Read,Write" \
    --output-format json \
    >> logs/headless-$(date +%F).json 2>&1
```

### Autenticação — uma chave por cliente

`ANTHROPIC_API_KEY` no ambiente do job (no `.env` do clone, nunca versionado). **Uma chave
por cliente** — é o que torna o custo rastreável: cada clone consome na sua própria chave,
e a fatura sai por cliente sem rateio no olho.

```bash
# no .env do clone (fora do git)
ANTHROPIC_API_KEY=sk-ant-...-deste-cliente
```

### Permissões mínimas por job (`--allowedTools`)

Headless roda sem ninguém pra aprovar permissão na hora — então cada job declara o **mínimo**
que precisa. Não dar `Bash` aberto: liste só o que o job usa.

| Job | `--allowedTools` típico | Por quê |
|---|---|---|
| `/publicar` (diário) | `Bash(git*),Read,Write` + a tool de publicação | mexe em git e na API da rede |
| `/desempenho` (semanal) | `Read,Write,Bash(node*)` | só lê exports e roda o script de métrica |

Menos é mais: tool a mais em job headless é superfície de risco sem ninguém olhando.

### Saída e log

`--output-format json` deixa a saída parseável (sucesso/erro, custo, o que foi feito).
**Um log por cliente, por dia** (`logs/headless-<data>.json` na pasta do clone) — some com a
chave por cliente pra fechar custo e auditar o que o cron fez.

### Notificação de falha

Job que falha tem que gritar — ninguém está olhando o terminal. Mandar o aviso por um **bot
de Telegram** configurado no clone (token no `.env`): se o `claude -p` sair com código ≠ 0 ou
o JSON marcar erro, uma linha pro chat do operador ("`<cliente>`: `/publicar` headless falhou
às 06:00 — ver `logs/headless-2026-06-12.json`"). Sucesso é silencioso; só a falha avisa.
Quando o clone configurar esse bot, registrar o padrão no `docs/ferramentas.md`.

## Jobs candidatos

- **`/publicar` (diário)** — leva ao ar o que `/revisar` já aprovou e ainda não foi publicado.
  Nunca gera peça nova; só move o aprovado.
- **`/desempenho` (semanal)** — coleta métricas do que foi publicado e grava aprendizados.
  É leitura + medição (script determinístico), sem decisão de publicação.

Outras skills (calendário, post, ads) **não** entram em cron: envolvem decisão criativa e
aprovação humana, que é justamente o que o headless não pode substituir.

## Ativação (fora deste plano)

Montar o crontab é por clone e manual — depende do VPS, dos horários do cliente e das contas
conectadas. Esqueleto, pra quando for ativar:

```cron
# m h  dom mon dow   comando
  0 6   *   *   *    cd /srv/clientes/acme && claude -p "/publicar aprovados" --allowedTools "Bash(git*),Read,Write" --output-format json >> logs/headless-$(date +\%F).json 2>&1
  0 8   *   *   1    cd /srv/clientes/acme && claude -p "/desempenho da semana" --allowedTools "Read,Write,Bash(node*)" --output-format json >> logs/headless-$(date +\%F).json 2>&1
```

Antes de ativar num clone: confirmar que `/revisar` está sendo usado de fato (sem aprovação
humana a montante, o headless não tem o que mover), que a `ANTHROPIC_API_KEY` do cliente está
no `.env`, e que o bot de Telegram aponta pro chat certo.
