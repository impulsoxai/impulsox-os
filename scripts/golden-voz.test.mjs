// golden-voz.test.mjs — golden set de regressão de voz (auditoria 2, item 4; 13/07/2026).
// GENÉRICO (motor): cada par é "peça VAZADA → versão CORRIGIDA" que exercita uma regra
// mecânica do gate — a vazada tem que FALHAR, a corrigida tem que PASSAR. Roda a cada
// mudança de regra/modelo; se um "antes" passar ou um "depois" falhar, a mudança quebrou
// o contrato de voz.
//
// No CLONE de um negócio, o /corrigiu ALIMENTA este set com pares REAIS extraídos do
// histórico git (`git show <commit>^:<peça>` / `git show <commit>:<peça>` →
// scripts/fixtures/golden-voz/). Essas fixtures são DADO do negócio e NÃO sobem pro
// template — só este runner genérico, com os pares-molde abaixo, é motor.
import { test } from "node:test";
import assert from "node:assert/strict";
import { gate } from "./gate-voz.mjs";

// par 1 — nacionalidade pelo nome, não por gíria (banidas_gerais)
test("golden: peça com gíria de nacionalidade FALHA; corrigida PASSA", () => {
  const antes = gate("A cobrança sai nos sistemas gringos.", { publico: true });
  const depois = gate("A cobrança sai nos sistemas americanos.", { publico: true });
  assert.ok(!antes.pass && antes.falhas.some((f) => f.tipo.startsWith("banida")), antes.resumo);
  assert.ok(depois.pass, depois.resumo);
});

// par 2 — dois-pontos de enumeração acima do budget (dois_pontos)
test("golden: peça com dois-pontos retóricos acima do budget FALHA; corrigida PASSA", () => {
  const antes = gate("Não é ferramenta: é sistema. A chance está aí: quase ninguém usa.");
  const depois = gate("Não é ferramenta, é sistema. E a chance está aí, quase ninguém usa.");
  assert.ok(!antes.pass && antes.falhas.some((f) => f.tipo === "dois-pontos-retorico"), antes.resumo);
  assert.ok(depois.pass, depois.resumo);
});

// par 3 — maiúscula mística em substantivo comum (maiuscula_mistica)
test("golden: peça com maiúscula mística FALHA; corrigida PASSA", () => {
  const antes = gate("Montar esse Sistema tomaria o tempo que você não tem.");
  const depois = gate("Montar esse sistema tomaria o tempo que você não tem.");
  assert.ok(!antes.pass && antes.falhas.some((f) => f.tipo.startsWith("maiuscula-mistica")), antes.resumo);
  assert.ok(depois.pass, depois.resumo);
});

// par 4 — ponto e vírgula em prosa (pontuacao)
test("golden: peça com ponto e vírgula em prosa FALHA; corrigida PASSA", () => {
  const antes = gate("O sistema roda sozinho; o dono só aprova.");
  const depois = gate("O sistema roda sozinho. O dono só aprova.");
  assert.ok(!antes.pass && antes.falhas.some((f) => f.tipo === "ponto-e-virgula-em-prosa"), antes.resumo);
  assert.ok(depois.pass, depois.resumo);
});
