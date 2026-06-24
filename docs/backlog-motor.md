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

- [ ] **Check de versão no `/abrir`** (resolve o furo acima). Quando o dono abre um clone, a
  `/abrir` faz `git fetch template` + compara a versão do `CLAUDE.md` local vs `template/main`.
  Se o template está na frente, avisa: "motor novo disponível (vX.Y.Z): [resumo]. Rodar
  `/atualizar-motor`?" — o dono decide, nada automático. **Pontos de design a resolver no
  brainstorm:** (1) a `/abrir` hoje é "só instrução, não roda código" — passa a tocar git
  leve; (2) `git fetch` adiciona latência e precisa de rede (a rede do dono dropa GitHub às
  vezes — precisa de falha graciosa: se o fetch falhar, o "bom dia" sai normal, sem travar);
  (3) onde cachear pra não fazer fetch a cada abertura no mesmo dia. Merece spec próprio.

## Notas

- Este doc é MOTOR → ele mesmo desce pros clones no próximo `/atualizar-motor`. Cada clone vê
  o backlog do motor que roda.
- Quando uma versão termina de propagar pra todos os clones, marcar a linha como propagada
  (não apagar — histórico).
