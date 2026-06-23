# /intake — onboarding operacional do cliente (design)

> Data: 2026-06-23 · ImpulsoX-OS · Oportunidade O4 da auditoria. OS puro — não toca no CRM
> (pode, no futuro, fechar criando o contato no CRM quando a ponte do PRD existir).

## Problema

Onboarding profissional é a 1ª impressão que justifica 10k. Hoje é improvisado: existe um
`client-intake-form.md` só dentro do `/impulsox-chatgpt-ads`. Falta o intake comercial
unificado pós-fechamento (acessos, KPI do contrato, calendário de aprovação, escopo).

## Fronteira (anti-duplicação)

- `/plugar` = quem é o negócio (negócio, oferta, voz) — não repetir.
- `/cliente` = cria a estrutura técnica (pasta, CLAUDE.md, núcleo) no modo agência.
- `/intake` = **como vamos operar juntos** — o operacional do contrato. Roda DEPOIS do
  `/cliente`, ANTES do `/identidade`.

## O que coleta (4 frentes — só o operacional)

1. **Acessos** — contas de rede, domínio, pixels/analytics. **Nunca pede senha.** Só o
   método seguro de cada plataforma:
   - Meta Business / Google Ads / GA4 → convite de membro (cliente adiciona a agência).
   - Conta nova → "cliente cria e te convida".
   - Token/chave de API → vai pro `.env` do clone, nunca pro `intake.md`.
   Registra o **status** de cada acesso: `pedido` / `recebido` / `testado`. Nunca a credencial.
2. **KPI do contrato** — a métrica de sucesso e o prazo (o que vamos bater, até quando).
3. **Calendário de aprovação** — quem aprova as peças, em quanto tempo, por qual canal.
4. **Escopo/limites** — o que está dentro e o que está fora do contrato (evita escopo solto).

## Entrega

- **(a) Formulário pro cliente** — perguntas em PT simples (sem jargão), na marca, pronto
  pra mandar. Adapta o molde do `client-intake-form.md` do chatgpt-ads pro caso geral (sem
  a parte de elegibilidade de ads).
- **(b) `nucleo/intake.md`** (negócio próprio) ou `clientes/<nome>/nucleo/intake.md` (modo
  agência) — respostas + status dos acessos + KPI + escopo. Vira fonte que `/proposta`,
  `/relatorio` e o hub multi-cliente (futuro) leem.

## Segurança (regra dura)

- **Nunca coletar senha de cliente em texto.** Só método de acesso (convite/token-no-.env).
- O `intake.md` registra STATUS do acesso, jamais a credencial.
- Token de API que precise existir vai pro `.env` do clone (gitignored), nunca commitado.

## O arquivo `nucleo/intake.md`

```markdown
# Intake operacional — [cliente] · [data]

## Acessos (status, nunca a senha)
| Plataforma | Método | Status | Observação |
|---|---|---|---|
| Instagram/Meta Business | convite de membro | pedido/recebido/testado | |
| Google Ads / GA4 | convite | … | |
| Domínio / hospedagem | … | … | |
| Pixel/Analytics | id no .env | … | |

## KPI do contrato
- Meta: [o que bater] · Prazo: [até quando] · Como medimos: [fonte]

## Aprovação
- Quem aprova: [nome] · Prazo de resposta: [ex: 48h] · Canal: [WhatsApp/e-mail]

## Escopo
- Dentro: [...]
- Fora: [...]
```

## Fluxo

1. **Pré-requisito.** Estrutura do cliente criada (`/cliente`) — se falta, reorientar pra ela.
2. **Gerar o formulário** pro cliente (PT simples, na marca) e entregar pra mandar.
3. **Receber as respostas** (o dono cola o que o cliente devolveu).
4. **Registrar acessos** pelo método seguro — status, nunca senha.
5. **Gravar `intake.md`** com as 4 frentes; marcar pendências (acesso não recebido = pendência).
6. **Fechar** apontando o próximo passo (`/identidade`).

## Regras

- Nunca senha em texto; só método de acesso + status.
- Só o operacional — não repetir o briefing de negócio (isso é `/plugar`).
- Acesso pendente = pendência marcada, não trava a produção (Escada de Contexto).
- Motor: template → clones via `/atualizar-motor`. OS puro (não toca no CRM por ora).

## Degrau mínimo

Roda no degrau 1 (cliente já plugado pelo `/cliente`). Sem estrutura, reorienta pra `/cliente`.

## Teste de aceitação

1. Cliente recém-criado → gera o formulário PT na marca + cria `intake.md` com as 4 frentes.
2. Dono tenta dar uma senha → a skill recusa e instrui o método seguro (convite/token).
3. Acesso não recebido ainda → status `pedido`, marcado como pendência; não trava.
4. `intake.md` pronto → `/proposta` e `/relatorio` conseguem ler KPI/escopo de lá.

## Posição no fluxo

`/cliente` → **`/intake`** → `/identidade`. Opcional pra negócio próprio (faz mais sentido
no modo agência); oferecido, não empurrado.

## Arquivos

- Criar: `.claude/skills/intake/SKILL.md` + `assets/formulario-intake.md` (molde pro cliente).
- Tocar: `cliente/SKILL.md` (fecho aponta `/intake`), `docs/mapa-de-skills.md`, `CHANGELOG.md`.
