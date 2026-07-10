# Backlog do motor — o que entrou e o que falta propagar

> Rastreio vivo do MOTOR (template ImpulsoX-OS): o que cada versão trouxe e o que ainda
> precisa descer pros clones. É o lugar de olhar quando o template avança e os clones podem
> ter ficado pra trás. Atualizado em 2026-06-24.
>
> Regra de ouro (CLAUDE.md): melhoria de sistema nasce no template; trabalho de marketing
> fica no clone. O motor desce pros clones via `/atualizar-motor` (puxa só `.claude/`,
> `CLAUDE.md`, `docs/`, `scripts/` — nunca toca `nucleo/`, `marca/`, `producao/`).

## Como o clone recebe uma atualização do motor

1. O clone tem 2 remotes git: `origin` (repo privado do negócio) e `template` (este repo,
   só leitura).
2. `/atualizar-motor` roda DENTRO da pasta do clone: `git fetch template` → mostra o diff só
   dos caminhos de motor → `git checkout template/main -- .claude/ docs/ scripts/ ...` (o
   núcleo nem entra no comando) → confere que só motor mudou → grava `motor-versao.md` → salva.
3. O clone sabe qual motor roda por dois carimbos: a versão no rodapé do `CLAUDE.md`
   (`· vX.Y.Z*`) e o `motor-versao.md` (versão + data + hash do commit do template).

## ⚠️ Furo conhecido: os clones não sabem SOZINHOS que há motor novo

Hoje nada compara a versão do clone com a do template automaticamente. O clone fica na versão
antiga até o dono abrir a pasta e rodar `/atualizar-motor` na mão. A "detecção" depende de
lembrar. → Resolvido pela feature **check de versão no `/abrir`** (ver pendências abaixo).

---

## ✅ Entregue

| Versão | O que entrou | Estado |
|---|---|---|
| 0.2.9 | `docs/pitch-narrado.md` (craft do arco de pitch: Sparkline/Duarte, Raskin, Equação de Valor/Hormozi, demo Tell-Show-Tell) + conserto do passo 5 da `/slides` (checklist passivo → loop ativo) + CLAUDE.md/mapa/CHANGELOG | ✅ no template (main). **Falta propagar pros clones.** |

## 🔓 Falta propagar pros clones

- [ ] **`/atualizar-motor` na ImpulsoX-AI** → puxar v0.2.9 (pitch-narrado + /slides novo).
  *O clone está em v0.2.8.* Rodar dentro de `c:\Users\ACER\Desktop\ImpulsoX-AI`.
- [ ] Mesma coisa pra qualquer outro clone que exista (Eskina etc.).

## ▶ Próximas features de motor (a construir)

- [ ] **Parametrizar o reel `DemoNotebook.tsx`** (2026-06-24). O componente do reel "entrar no
  notebook" (3 páginas demo rolando + marca) nasceu hardcoded pras demos da ImpulsoX
  (`demos/maresia.mp4` etc.). Pro próximo cliente, parametrizar: a lista de clipes (nome, nicho,
  duração) vem de um prop/config do clone, não fixa no código. Também avaliar a regra nova
  (Remotion só animação + gravação via ffmpeg) ao refazer — hoje monta tudo no Remotion (funciona
  com `-g 1`, mas não é o padrão ideal). Roda no clone, não no motor. Ver `/reel-marca` + memória
  `reel-remotion-formula`.
- [ ] **Remotion no clone precisa das deps no package.json** (achado 2026-06-24). O clone
  ImpulsoX-AI tinha os componentes `.tsx` mas o `package.json` NÃO listava as deps do Remotion
  (10 pacotes) — `npm install` não instalava nada. Quando o `/atualizar-motor` desce o motor, tem
  que garantir que as deps de Remotion entrem no package.json do clone (ou o `/reel-marca` faz o
  install na 1ª vez). Hoje adicionei na mão no ImpulsoX-AI; o fluxo precisa cobrir isso.
- [ ] **Check de versão no `/abrir`** (resolve o furo acima). Quando o dono abre um clone, a
  `/abrir` faz `git fetch template` + compara a versão do `CLAUDE.md` local vs `template/main`.
  Se o template está na frente, avisa: "motor novo disponível (vX.Y.Z): [resumo]. Rodar
  `/atualizar-motor`?" — o dono decide, nada automático. **Pontos de design a resolver no
  brainstorm:** (1) a `/abrir` hoje é "só instrução, não roda código" — passa a tocar git
  leve; (2) `git fetch` adiciona latência e precisa de rede (a rede do dono dropa GitHub às
  vezes — precisa de falha graciosa: se o fetch falhar, o "bom dia" sai normal, sem travar);
  (3) onde cachear pra não fazer fetch a cada abertura no mesmo dia. Merece spec próprio.

- [ ] **`docs/craft-video.md`** — doc de craft de vídeo/reel (a real alavanca do veredito do
  auditor, 2026-06-24). A craft de retenção/hook de vídeo está hoje DUPLICADA inline em 4
  skills (`/roteiro-yt`, a régua de reel do `/post`, `/reel-marca`, `/shorts`): cada uma carrega
  sua cópia de "muted-first, 2-3 cortes nos 3s, foreshadowing, open loops, reforço ~50%, AVD,
  Quality-CTR". Centralizar num doc e as skills passam a LER em vez de duplicar — é o paralelo
  real da melhoria da `/slides` (que extraiu craft pro `pitch-narrado.md`). Merece spec próprio.
  **Decisão do auditor sobre propagar o LOOP da /slides:** NÃO propagar a auto-crítica inline
  pra `/post`/`/linkedin`/`/roteiro-yt` — seria redundante com `/escritor-br` (humaniza, loop
  draft→audit→final) + `/revisar` (gate frio externo, nota Hook=50%), que essas skills já
  chamam e a `/slides` não chamava. O que transfere da `/slides` é a extração pra doc, não o loop.
- [ ] **Gate frio no eixo YouTube** (lacuna secundária, achada na mesma auditoria). O `/revisar`
  só pontua social orgânico IG/LinkedIn; o `revisor-marketing` não lê Quality-CTR nem funil de
  vídeo, e `/roteiro-yt` vai direto pra `/editar-video` sem crivo externo. Eixo YouTube está
  "em teste" no sistema → fica como nota, não ação agora. Reavaliar quando o YouTube sair de teste.

## Notas

- Este doc é MOTOR → ele mesmo desce pros clones no próximo `/atualizar-motor`. Cada clone vê
  o backlog do motor que roda.
- Quando uma versão termina de propagar pra todos os clones, marcar a linha como propagada
  (não apagar — histórico).

## Metodologia Fable→Opus — gabaritos de execução (2026-07-08)

Tese: inteligência não transfere entre modelos, decisão transfere. As decisões que
produzem peça "nível Fable" viram checklist com gates (2 passes de copy, proibições por
busca literal, QA visual com defeitos nomeados, gate antes do passo caro) executável no
Opus 4.8 do dia a dia. Levantamento completo feito na sessão de 2026-07-08.

- [x] `docs/gabarito-execucao-social.md` — /post + /linkedin (feito 2026-07-08)
- [x] `docs/gabarito-execucao-texto.md` — copy, proposta, email, conteudo, roteiro-yt,
  ads-google, ads-meta, criar-ebook; bloco de aceite pra oferta/raio-x (feito 2026-07-08)
- [x] `docs/gabarito-execucao-visual.md` — pagina, slides, reel-marca, dashboard,
  criar-ebook, identidade, premium-design (feito 2026-07-08)
- [x] Ponteiros "ler PRIMEIRO" inseridos nas 18 SKILL.md alvo (feito 2026-07-08)
- [ ] **Replicar os 3 gabaritos + ponteiros + catálogo de estilos §8 no template
  ImpulsoX-OS** (nasceram no clone ImpulsoX-AI — regra da casa: motor mora no template;
  descer pros demais clones via /atualizar-motor)
- [ ] NÃO aplicado de propósito (já resolvido de outra forma): /roi /velocidade
  /analisar-* (cálculo por script), /geo (validador), /revisar /revisar-pagina
  /escritor-br (SÃO o QA), /thumbnail (crivo Four C's), skills de sistema.
- [ ] Validar na prática: 1º ciclo de produção no Opus 4.8 com gabarito vs peça desta
  sessão — comparar no /revisar; ajustar gates que o Opus interpretar mal.
