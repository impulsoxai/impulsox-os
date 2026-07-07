# Molde da oferta — Esteira de Crescimento (agência local)

> Molde reutilizável pra montar a oferta do **Sistema de Crescimento** (a esteira de 4 fases do
> `docs/blueprint-esteira-crescimento.md`) que uma agência vende pro cliente local (academia,
> clínica, dentista, etc). A `/oferta` usa este esqueleto quando o negócio é `agencia` vendendo a
> esteira — preenche as 6 partes com os números do cliente. É MOTOR: o molde é genérico; preço,
> garantia e prova são sempre do negócio que assina.
>
> Régua: aplica TODAS as regras da `/oferta` (Equação de Valor, posicionamento PURE, garantia
> honesta, sem estética de guru) + os gates de compliance da esteira (LGPD/WhatsApp, review sem
> gating). Não vende o que depende do agente WhatsApp antes de ele existir (~jul/2026).

---

## Posicionamento PURE (preencher antes da Equação)

A esteira já nasce PURE pro cliente local — confirmar com o caso dele:
- **Penoso:** lead escapa, telefone não atendido, base parada, sem review. Dói no caixa.
- **Urgente:** todo dia que passa = lead que vai pro concorrente que responde primeiro (78%).
- **Reconhecido:** o dono SABE que perde cliente assim (já viu acontecer).
- **Caro:** chamada perdida ~R$1.200 (home services); 62% das ligações não atendidas.

**Mecanismo proprietário (o "como" só seu):** "Sistema de Crescimento em 4 fases — arrumo a casa
ANTES de gastar 1 real em ads, então cada lead pago converte em vez de vazar." É o contrário do
que toda agência faz (vende ads primeiro). Esse é o wedge.

---

## A oferta nas 6 partes (esqueleto — preencher com o cliente)

### 1. Entrega central (por fase, na ordem da esteira)
- **Fase 0 — A Casa:** identidade + landing premium que converte + SDR na página.
- **Fase 1 — Dinheiro que já existe (mídia zero):** reativação da base (com oferta), coleta de
  review compliant, responder lead rápido. ⚠️ o disparo automático em massa é Fase 2 do produto
  (depende do agente WhatsApp ~jul/2026) — até lá, entrega e-mail + QR/recibo + responder review.
- **Fase 2 — Demanda orgânica:** conteúdo (carrossel, reel, LinkedIn) que constrói marca e gera
  lead e prova.
- **Fase 3 — Tráfego pago:** ads só agora, com a casa cheia → converte.

### 2. Pilha de bônus (que faz a entrega central parecer barata)
Candidatos (escolher 2-3 reais, nunca inflar): auditoria de velocidade de resposta (`/velocidade`)
de brinde no fechamento; setup do Perfil Google + primeiros reviews; 1 mês de conteúdo orgânico
adiantado; dashboard de saúde da casa. Bônus é aditivo real, não "R$50 mil em bônus" fake.

### 3. Garantia (RISCO INVERTIDO — só o que você CONTROLA. Catálogo de 8 tipos em references/garantia.md)

**A regra de ouro (pesquisa de mercado, fontes na auditoria):** garante o que está **sob seu
controle** — execução, prazo, transparência, volume de entrega. **NUNCA** o que depende do
algoritmo/mercado: faturamento, ranking, número de vendas, leads. Prometer o que não controla é
antiético e quem faz "dá o número mais baixo possível pra se proteger" — o cliente percebe.
Princípio: prova forte + garantia fraca > garantia forte + prova fraca.

Os 3 tipos que cabem na esteira/agência local (com wording real testado de mercado):

| Tipo | Quando usar | Exemplo de wording (adaptar à voz do dono) |
|---|---|---|
| **SLA de entrega** | sempre cabe; o mais seguro | "Monto sua Fase 0+1 em X dias úteis ou não cobro o setup." |
| **Serviço condicional** (a favorita do Hormozi — "trabalho de graça até X") | quando há um marco controlável claro | "Coloco N reviews novos no seu Google em 30 dias — se não, sigo trabalhando de graça até bater." (só se o método compliant está instalado E o cliente tem fluxo de clientes) · "Ativo seu atendimento <5min; se no mês 1 não estiver no ar, o mês 2 é por conta da casa." |
| **Anti-garantia** | ticket alto, comprador maduro, prova forte | "Não dou garantia de resultado — trabalho com quem leva a sério e segue o plano. Se você precisa de garantia pra começar, não somos pra você." |

**Princípios que vêm da pesquisa:**
- **Atrelar a garantia às AÇÕES do cliente** filtra o cliente ruim e mantém você honesto ("se
  você me der acesso à base e aprovar os criativos no prazo, eu garanto X"). Máx 2 condições.
- **Primeiro ganho rápido (emotional win em ~7 dias)** sustenta a garantia: engenheirar um
  resultado controlável cedo (ex: o número do `/velocidade` na 1ª semana, ou o Perfil Google no
  ar) — Hormozi: "criar wins emocionais rápido depois da compra".
- **Comprador local cético** → o reembolso do SETUP (não da operação) é o que dá permissão pra
  tentar, sem expor a margem da mensalidade.
- **Teste de estresse:** se 10% acionarem, quebra a margem? Se sim, a garantia está errada.

### 4. Escassez / urgência (só real)
A urgência REAL aqui é o custo de não-agir (o número do `/velocidade`: "cada mês assim = R$ X na
mesa"), não countdown fake. Capacidade real de atendimento da agência (quantos clientes novos/mês
ela aguenta) é escassez legítima. Nunca "só 3 vagas" mentira.

### 5. Nome
"Sistema de Crescimento [Nicho]" ou o nome que o dono da agência escolher na voz dele. O nome
carrega o mecanismo (4 fases, casa antes do ads), não superlativo.

### 6. Preço + forma de pagamento (ancoragem 2026)
Modelo que o mercado de agência de IA usa em 2026 (ver `docs/auditoria-esteira-2026-06-29.md`):
- **Setup + mensal (Agent Licensing):** taxa de setup (Fase 0+1 montadas) + mensalidade de
  operação/otimização. O setup ancora o valor; a mensal sustenta o caixa recorrente (continuity).
- **Hybrid retainer:** base mensal fixa (operação) + variável por entrega nova (campanha, fase).
- **Value capture:** preço ancorado no valor anual gerado × 15-20% (não em horas). Ex: se a
  esteira destrava R$X/ano em lead que vazava, capturar 15-20% disso justifica o preço.
- **AI Audit Gateway (porta de entrada / Money Model):** vender primeiro uma **auditoria paga**
  barata (o `/raio-x` + `/velocidade` com número da perda) — baixa fricção, gera caixa, e ancora
  o projeto grande. É a oferta de Attraction da escada.

---

## VENDER MODULAR, fazer upsell depois (a régua comercial)

A esteira NÃO é um pacote fechado de "tudo ou nada". **Vende-se o que o cliente precisa AGORA** —
cada fase/produto vende sozinho (página, conteúdo, CRM+agente, auditoria, ads). O cliente entra
por onde dói mais; gosta; aí sobe pra mais produtos. No começo, o importante é VENDER ALGO —
cliente satisfeito vira cliente que compra mais. Empurrar o sistema completo na primeira venda
afasta; oferecer a peça certa pro problema dele fecha.

Regra: descobrir a NECESSIDADE do cliente primeiro (qual fase dói), vender essa, entregar bem,
depois oferecer a adjacente. O Sistema completo (todas as fases) é o DESTINO do upsell, não a
primeira oferta.

## Money Model da esteira (a sequência, não uma oferta só)

| Etapa | Oferta | Papel |
|---|---|---|
| Attraction | Auditoria paga (raio-x + velocidade) OU a peça que o cliente já quer (página, conteúdo) | porta de baixa fricção; o primeiro "sim" |
| Core | A fase que resolve a dor atual do cliente (não o pacote) | a primeira entrega real que gera resultado |
| Upsell | A fase adjacente (gostou da página → conteúdo → ads) | sobe quando a confiança está no pico |
| Continuity | Operação mensal (orgânico + Fase 1 rodando) + ads | receita recorrente; o que sustenta escala |
| Máximo | Sistema de Crescimento completo (4 fases) | o destino do upsell; cliente que comprou tudo |

Meta de caixa: **CAC payback ≤ 30 dias** — o que o cliente paga no 1º mês cobre o custo de
adquiri-lo. A auditoria paga (Attraction) ajuda a fechar isso.

Exemplo de catálogo modular montado: `docs/exemplo-oferta-impulsox.md`.

---

## Gates de honestidade (herdados — não furar)
- **Não vender o que depende do agente WhatsApp** (~jul/2026) como pronto: reativação/atendimento
  automático em massa fica como "fase 2 do produto". Vender só o que entrega hoje.
- **LGPD/WhatsApp:** disparo em massa exige consentimento próprio + template HSM (ver `/reativar`).
- **Review:** sem gating, sem incentivo ao cliente (ver `/local` Passo 3.5).
- **Nunca garantir faturamento.** Só o controlável (velocidade, entrega, volume de review).
- **Sem estética de guru, sem escassez fake** (régua da `/oferta`).