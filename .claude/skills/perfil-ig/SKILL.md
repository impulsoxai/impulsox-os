---
name: perfil-ig
description: >
  Use quando o perfil do Instagram precisa converter visita em seguidor e seguidor em
  lead — "/perfil-ig", "otimiza meu Instagram", "arruma minha bio", "meu perfil não
  converte", "capas dos destaques", ou antes de rodar anúncio que leva ao perfil.
  Otimiza o pacote completo: campo de nome pesquisável, bio, link, destaques com capas
  da marca, fixados e grade — o perfil é a landing page do Instagram.
---

# /perfil-ig — O perfil que converte a visita

Anúncio e post bom levam a pessoa até o perfil; é ali que ela decide seguir, chamar ou
ir embora — em menos de 5 segundos. Esta skill trata o perfil como o que ele é: a
landing page do Instagram. Rodar antes de investir em tráfego.

Autoria: ImpulsoX AI. Conteúdo original.

## O que ler antes

- `nucleo/negocio.md` (o que vende, pra quem, diferencial) e `nucleo/voz.md`
- `marca/design-guide.md` + `marca/tokens.css` — capas de destaque e fixados saem da marca
- `nucleo/provas.md` — prova social entra no fixado e no destaque
- **Print do perfil atual** — pedir ao usuário (o sistema não acessa o Instagram
  logado); sem print, montar do zero e marcar como proposta

## O pacote, item a item

### 1. Campo de nome (o mais ignorado e o único pesquisável)
A busca do Instagram varre o **campo de nome**, não a bio. Formato:
`[Nome] | [o que faz + onde, como o cliente busca]` — ex: "Clínica Sorria | Dentista
em Moema". Marca pessoal: `[Nome] | [especialidade]`. Até 64 caracteres, sem emoji
no lugar de palavra-chave.

### 2. Bio (150 caracteres que respondem 3 perguntas)
Em até 4 linhas: **pra quem** + **o que ganha** (resultado, não cargo) + **prova curta**
(número do banco de provas, se houver) + **chamada com seta pro link**. Sem clichê de
bio ("apaixonado por", "transformando vidas"). Texto passa pelo `/escritor-br`.

### 3. Link
Um destino que continua a conversa: WhatsApp com mensagem pré-preenchida, página da
`/pagina`, ou agregador quando há mais de uma oferta — nesse caso, máximo 3-4 opções
ordenadas pela prioridade do `nucleo/foco.md`. Link quebrado ou genérico ("linktr.ee/x"
sem contexto) é lead perdido.

### 4. Foto de perfil
Legível em 32px: logo reduzido (versão de `marca/logo/`) ou rosto bem enquadrado para
marca pessoal. Testar: encolher e ver se ainda se reconhece.

### 5. Destaques (a vitrine permanente)
4-6 destaques que respondem o que todo cliente pergunta: Serviços/Preços · Resultados
(prova) · Como funciona · Quem somos · Contato/Local. Gerar as **capas** com a
identidade (HTML 1080x1920 → PNG via Playwright, mesmo pipeline do `/post`): fundo da
marca + ícone ou palavra única, consistentes entre si. Salvar em
`producao/perfil-ig/capas/`.

### 6. Fixados (os 3 posts que vendem por você)
Primeira impressão da grade. Combinação padrão:
1. **Apresentação** — quem é o negócio e pra quem (módulo TESE do `/post`)
2. **Prova** — melhor caso/depoimento do banco (módulo FALA/HISTÓRIA)
3. **Oferta ou carro-chefe** — o que mais converte, com chamada única
Se não existem, encomendar ao `/post` com esses briefs.

### 7. Grade e conta
Sequência de capas já é regra do `/post` (alternância dos 3 registros da marca).
Conferir: conta Professional (libera métricas e o `/publicar`), categoria certa,
botões de contato ativos.

## Saída

`producao/perfil-ig/perfil.md` — antes/depois de cada item, textos prontos pra colar
(nome, bio), capas em PNG, briefs dos fixados e checklist final de aplicação (5 min no
app, passo a passo). A aplicação é manual pelo dono — configuração de perfil não tem
API e automação de terceiros nesse ponto viola os termos.

## Regras

- Número ou prova na bio: só do `nucleo/provas.md` (real e autorizado).
- Bio diz o que o cliente ganha, não o que a empresa "é apaixonada por fazer".
- Capas de destaque: identidade da marca, sem ícone genérico de banco de imagem
  destoando do design-guide.
- Re-rodar após mudança de foco (`nucleo/foco.md`) — perfil desatualizado anuncia
  prioridade antiga.
