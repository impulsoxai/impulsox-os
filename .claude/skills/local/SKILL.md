---
name: local
description: >
  Use quando o negócio atende uma região e precisa aparecer no Google Maps e na busca
  local — "/local", "Google Meu Negócio", "perfil da empresa no Google", "não apareço
  no Maps", "como respondo essa avaliação?", "quero aparecer no 'perto de mim'".
  Otimiza o Perfil de Empresa no Google por completo, monta a rotina de posts e
  avaliações e escreve respostas humanas a avaliações — positivas e negativas — na
  voz da marca.
---

# /local — Presença local que traz cliente

Pra negócio que atende região (clínica, restaurante, oficina, salão, loja, serviço a
domicílio), o cliente decide na busca local: "perto de mim", "melhor X em [bairro]".
Aparecer ali costuma render mais que qualquer rede social — e é de graça. Esta skill
cuida do Perfil de Empresa no Google de ponta a ponta.

Autoria: ImpulsoX AI. Conteúdo original.

## Degrau mínimo (Escada de Contexto)

Precisa do **degrau 1** (serviços e região do `nucleo/negocio.md`).

## O que ler antes

- `nucleo/negocio.md` (serviços, região, diferencial) e `nucleo/voz.md` (as respostas
  a avaliações saem na voz da marca)
- `nucleo/perfil.md` — esta skill só faz sentido em perfis com região (`pme-local`, às
  vezes `profissional-liberal`). Perfil `criador` não tem presença local — não rodar
- `nucleo/provas.md` — avaliações boas viram prova; a `/provas` pede mais

O sistema **nunca pede a senha do painel do Google**: entrega tudo pronto (textos,
checklist, respostas) e o dono cola — mesmo princípio do LinkedIn pessoal. Com o
conector configurado (seção no fim), parte disso vira automático pela API oficial.

## Passo 1 — Diagnóstico

Buscar o negócio no Google (nome + cidade) e nos termos que o cliente usaria:
- O perfil existe? Está reivindicado?
- O que aparece: nota, quantidade de avaliações, fotos, concorrentes do Local Pack
- Comparar com os 3 que aparecem primeiro: o que eles têm que o perfil não tem?

## Passo 2 — Perfil completo (o checklist que move o ponteiro)

Entregar preenchido, pronto pra colar no painel:

- **Categoria principal + secundárias** — a decisão mais importante do perfil; sugerir
  as exatas do nicho
- **Descrição (até 750 caracteres)** — como o cliente busca, na voz da marca, sem
  encher de palavra-chave (o Google pune e o cliente percebe)
- **Serviços/produtos** — cada um com descrição curta
- **Atributos** que se aplicam (estacionamento, acessibilidade, agendamento...)
- **Horários** — incluindo feriados (perfil com horário errado perde confiança e clique)
- **Checklist de fotos** — fachada (acha na rua), interior, equipe, antes/depois do
  serviço; o que fotografar com o celular, sem produção
- **NAP consistente** — nome, endereço e telefone idênticos em site, redes e diretórios;
  divergência derruba a confiança do Google

## Passo 3 — Rotina viva (perfil parado afunda)

- **Posts no perfil:** 1 por semana — oferta, novidade ou dica curta; pode reaproveitar
  o tema do `/calendario` reescrito pro formato (não a mesma arte)
- **Avaliações:** meta honesta de N novas por mês; o pedido sai pela `/provas` (momento
  certo + mensagem pronta). **Nunca comprar avaliação nem fazer "troca por desconto"**
  — viola os termos do Google e arrisca o perfil inteiro (ver Passo 3.5)
- **Perguntas e respostas:** semear as 3-5 perguntas que todo cliente faz, com resposta

## Passo 3.5 — Campanha de coleta de review COMPLIANT (a parte que escala — Pilar 2)

Quando o negócio quer **mais review em escala** (e quando isso vira serviço pro cliente final
da agência — `docs/formula-ads-jp.md` §0.5.B), a coleta segue regra dura de compliance. O
Google reforçou a política em **17/abr/2026** e a FTC criminalizou em **out/2024** (multa civil).
**Duas coisas são PROIBIDAS e a skill nunca gera:**
1. **Review gating** — filtrar por nota antes de pedir (só elogio vai pro Google, crítica vai
   pro privado). Caso real: Fashion Nova, US$ 4,2M de multa.
2. **Incentivo ao cliente pelo review** — desconto, brinde, sorteio em troca de review do
   Google. Inclui entrada em sorteio. Proibido independente da nota.

**A campanha que A SKILL monta (legal e que performa por volume+timing):**
- **Pedir a TODOS, do mesmo jeito**, no timing do resultado/atendimento — sem filtrar nota.
- **Link direto** pra página de review (ou QR no recibo/fatura), no **dispositivo do próprio
  cliente, depois** que ele saiu — nunca tablet/kiosk no local (pressão + dispara filtro de spam
  por mesmo IP/device).
- **Responder TODOS** os reviews (Passo 4) — onde a IA escala valor de verdade.
- **Não pedir pra cliente citar o nome do funcionário** no review (proibido desde abr/2026);
  menção espontânea é ok.

**Incentivo — pode, mas o segredo é incentivar a EQUIPE, não o cliente:**

| Incentivar… | Pode? | Como |
|---|---|---|
| **A EQUIPE do negócio** (bônus/ranking por review gerado) | ✅✅ **Melhor** | A IA rastreia review por atendente → dono premia; competição interna ok |
| Review no **Google** (cliente) | ❌ Não | Proibido sempre |
| Review no **site próprio / Trustpilot** | ✅ Sim | Pra TODOS, divulgado, pequeno |
| **Participação em pesquisa** ("compartilhe seu resultado") | ✅ Sim | Pra todos, qualquer nota, desacoplado do Google review |
| **Referral / indicação** | ✅ Sim | Não é review |

**Disparo em escala:** pelo **agente WhatsApp/CRM** (em construção, ~jul/2026) — a skill monta a
campanha e os roteiros; até o agente existir, entrega pronto e marca o disparo como pendente.
**Validar a política vigente** (Google + leis BR) antes de instalar pra qualquer cliente — as
regras mudam; esta seção reflete jun/2026.

## Passo 4 — Responder avaliações (o que mais gente lê e quase ninguém faz bem)

Resposta a avaliação é texto público de marketing — o próximo cliente lê antes de ligar.

**Positiva:** curta, pessoal, citando algo específico da avaliação (nada de "Obrigado
pelo feedback!" em série — parece robô). Variar a abertura entre respostas.

**Negativa — o protocolo:**
1. Responder rápido, sem brigar e sem ironia — quem lê é o próximo cliente, não o autor
2. Agradecer o relato e **assumir o que for verdade** (erro admitido com elegância
   gera mais confiança que perfil 5.0 imaculado)
3. Explicar sem desculpa esfarrapada, oferecer resolver e levar pro privado
   ("me chama no [contato] que resolvemos")
4. Nunca expor dado do cliente na resposta, mesmo que ele tenha errado
5. Avaliação falsa/difamatória: responder com calma + orientar a contestação no painel

## Saída

`producao/local/perfil-google.md` — diagnóstico, checklist preenchido, posts do mês e
banco de respostas. Avaliações novas que chegarem: o usuário cola aqui, a skill responde
na hora.

## Conector — automação via API oficial (opcional)

O Google tem API oficial pro Perfil de Empresa (Business Profile API): atualizar
informações, criar posts e responder avaliações programaticamente — dentro dos termos.
O acesso exige aprovação do Google (formulário de solicitação + projeto no Google
Cloud + OAuth), voltada a agências que gerenciam perfis de clientes.

**Mapa de automação desta skill:**

| Tarefa | Sem conector | Com conector |
|---|---|---|
| Atualizar informações do perfil | Assistido (texto pronto, dono cola) | Automático |
| Posts semanais no perfil | Assistido | Automático (com aprovação prévia da peça) |
| Responder avaliações | Assistido | Automático **só após aprovação de cada resposta** |
| Ler avaliações novas | Usuário cola | Automático (vira rotina de monitoramento) |

**Configurar (uma vez):** guiar o usuário — projeto no Google Cloud → ativar as
Business Profile APIs → solicitar acesso no formulário oficial do Google → OAuth da
conta dona do perfil. Credenciais no `.env` (`GBP_CLIENT_ID`, `GBP_CLIENT_SECRET`,
`GBP_REFRESH_TOKEN`, `GBP_LOCATION_ID`). O conector **já existe**: `scripts/gbp.mjs`
(`--acao post` cria post local; `--acao responder` responde avaliação; dry-run por padrão,
`--confirmar` publica; segredos nunca em log). Aprovação do Google pode levar dias ou
semanas — **o modo assistido funciona desde o dia 1**, o conector é upgrade, nunca pré-requisito.

Resposta a avaliação negativa **nunca** sai automática sem o usuário ler — é a resposta
mais sensível do marketing local.

## Regras

- Tudo que o perfil afirma tem que ser verdade conferível (horário, serviço, preço).
- Respostas seguem `nucleo/voz.md` — protocolo é o esqueleto, a voz é da marca.
- Sem técnica cinza: keyword stuffing no nome da empresa ("Padaria X - Melhor Pão da
  Cidade") viola as diretrizes e some com o perfil.
- **Review COMPLIANCE (Passo 3.5) é regra dura:** nunca gating (filtrar por nota), nunca
  incentivo ao cliente pelo review do Google, nunca pedir pra citar nome de funcionário.
  Incentivo só na equipe / canal próprio / pesquisa / referral. Validar política antes de instalar.
- Negócio sem ponto físico (atende a domicílio): configurar como área de atendimento,
  sem endereço público.

---

**✓ Pronto:** Perfil de Empresa no Google otimizado (checklist, posts do mês, banco de respostas) · **→ próximo passo:** `/publicar` — sobe os posts do perfil e mantém a rotina viva; ou siga a produção de conteúdo com `/calendario`. Se faltar `nucleo/negocio.md` (região/serviços), o sistema reorienta pra preencher antes.
