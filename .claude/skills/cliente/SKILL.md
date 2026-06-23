---
name: cliente
description: >
  Use no modo agência, quando entra um cliente novo no sistema — "/cliente", "plugar
  cliente", "cliente novo", "cria a pasta do cliente X", "vou atender a empresa Y".
  Cria a estrutura completa do cliente (CLAUDE.md próprio, núcleo, marca, produção) com
  o degrau de contexto registrado, pronta pra qualquer skill trabalhar nela.
---

# /cliente — Plugar um cliente no sistema

Cada cliente vive em `clientes/<nome>/`, autossuficiente: contexto próprio, marca
própria, produção própria. Esta skill cria essa casa e registra o quanto o sistema já
sabe sobre o cliente — pra qualquer sessão futura saber o que pode afirmar.

Autoria: ImpulsoX AI. Conteúdo original.

## Passo 1 — Mini-entrevista (5 perguntas, uma por vez)

1. "Nome do cliente (como você o chama no dia a dia)?"
2. "Que tipo de negócio é o dele?
   1. **Negócio local** (loja, clínica, restaurante…)
   2. **Agência / consultoria**
   3. **Criador / canal** (YouTube, marca pessoal, infoproduto)
   4. **Profissional liberal** (serviço especializado entregue por ele)"
3. "O que vamos entregar pra ele? (conteúdo, ads, página, identidade — pode ser mais
   de um)"
4. "O que você já tem dele? (site, logo, transcrição de reunião, exports de ads,
   prints de referência — qualquer coisa)"
5. "Tem prazo ou data importante? (reunião marcada, lançamento)"

A resposta 2 mapeia num molde de `docs/perfis.md` e vira o `perfil.md` do cliente no Passo 2.

## Passo 2 — Criar a estrutura

```
clientes/<slug-do-nome>/
├── CLAUDE.md          ← gerado agora (modelo abaixo)
├── nucleo/
│   ├── negocio.md  ·  perfil.md  ·  voz.md  ·  foco.md  ·  escada.md
├── marca/
│   ├── design-guide.md  ·  logo/  ·  tokens.css (quando houver)
├── producao/
└── dados/             ← o que o cliente mandar (exports, prints, transcrições)
```

Slug: minúsculas, sem acento, espaço vira hífen — mas o nome legível fica no CLAUDE.md.
Pasta já existe? Avisar e perguntar: complementar ou criar com sufixo.

Gerar `nucleo/perfil.md` do molde escolhido na resposta 2 (catálogo em `docs/perfis.md`),
preenchido pro caso deste cliente — nunca placeholder. É o perfil DELE, independente do
perfil da agência.

## Passo 3 — O CLAUDE.md do cliente

Gerar com este conteúdo (preenchido, não placeholder):

```markdown
# [Nome do cliente] — cliente da [nome da agência]

> Pasta autossuficiente. Instruções daqui valem por cima das da raiz quando
> conflitarem. Abrir a sessão DENTRO desta pasta ao trabalhar para este cliente.

## Entregas combinadas
- [resposta 3, em itens]

## Degrau de contexto
[degrau atual + data] — ver `nucleo/escada.md` antes de afirmar qualquer coisa
sobre este cliente. Fato é fato; suposição se confirma antes de publicar.

## Prazos
- [resposta 5, ou "sem prazo definido"]

## O que herda da agência
Processo e qualidade vêm das skills da raiz. Voz, marca e contexto são DESTE
cliente (`nucleo/` e `marca/` desta pasta) — nunca os da agência.

## Regras específicas deste cliente
[vazio — cresce conforme o trabalho ensina]
```

## Passo 4 — Aproveitar o que já existe (Escada de Contexto)

Conforme a resposta 4:
- **Tem site/URL** → oferecer rodar a extração da `/plugar` (Fase 2A) apontada pra esta
  pasta → degrau 1 na hora
- **Tem transcrição de reunião** → ler e preencher o núcleo do cliente com ela → degrau 3
- **Tem logo/prints** → guardar em `dados/` e encaminhar pra `/identidade`
- **Tem exports de ads** → guardar em `dados/ads/` e oferecer `/analisar-ads`
- **Não tem nada** → degrau 0, defaults premium, seguir mesmo assim

Atualizar `clientes/<slug>/nucleo/escada.md` com o degrau alcançado e as pendências.

## Passo 5 — Mapear rotinas (dimensiona o retainer)

Ainda no onboarding, uma entrevista curta — é o que transforma "atendo esse cliente" em
escopo de retainer definido. Perguntar:
> "O que você (ou a equipe do cliente) repete toda semana e gostaria de tirar das costas?"

Listar as candidatas, **estimar o ganho** de cada uma (tempo/semana) e propor 2-3
automações concretas. As aprovadas viram skill pela `/automatizar`, criadas em
`.claude/skills/` DESTE clone quando são específicas do cliente. **Regra de ouro:** se a
automação serve a todos os clientes, ela nasce no template (ImpulsoX-OS), não aqui — e desce
pelo `/atualizar-motor`. O conjunto de rotinas mapeadas dimensiona o escopo (e o preço) do
retainer.

## Passo 6 — Resumo e próximo passo

```
✓ Cliente plugado: clientes/<slug>/
✓ Perfil: [PME local | agência | criador | profissional liberal]
✓ Degrau de contexto: [n]
✓ Material recebido: [lista]
→ Próximo: [a ação mais valiosa agora — ex: "/identidade com o site dele",
  "reunião é amanhã: /pagina já consegue gerar 2 direções pra apresentar"]
```

A recomendação de próximo passo considera o prazo: reunião amanhã muda a ordem do que
fazer primeiro.

## Regras

- Cliente nunca vê suposição apresentada como fato — o que o sistema assumiu vai
  marcado na entrega.
- Dado de um cliente jamais aparece no trabalho de outro (nem como "exemplo").
- Trabalhar para o cliente = sessão aberta dentro da pasta dele.

---

**✓ Pronto:** estrutura do cliente criada (CLAUDE.md, núcleo, marca, produção) com o degrau registrado · **→ próximo passo:** `/intake` — coleta o operacional do contrato (acessos, KPI, aprovação, escopo) antes de começar a produção; depois `/identidade`. Esperar o "sim" do dono.
