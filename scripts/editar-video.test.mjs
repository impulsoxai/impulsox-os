import { test } from "node:test";
import assert from "node:assert/strict";
import { montarPlanoDryRun } from "./editar-video.mjs";
import { planoVelocidade, normalizarTrechos } from "./lib-edicao.mjs";

test("montarPlanoDryRun resume corte, duração e arquivos de saída", () => {
  const saidaSil = `
[silencedetect @ 0x1] silence_start: 2.5
[silencedetect @ 0x1] silence_end: 4.0 | silence_duration: 1.5
`;
  const plano = montarPlanoDryRun({ saidaSilencedetect: saidaSil, duracaoTotal: 12, slug: "demo", minSilencio: 0.8 });
  assert.equal(plano.dry_run, true);
  assert.equal(plano.cortes, 1);
  // silêncio 1.5s − 2×0.15 de folga = 1.2s removido de 12s = 10%
  assert.equal(Math.round(plano.percentRemovido), 10);
  assert.deepEqual(plano.saidas, ["canal-youtube/edicao/demo/final.mp4", "canal-youtube/edicao/demo/legenda.srt"]);
});

test("montarPlanoDryRun inclui plano de velocidade quando há trechos", () => {
  const trechos = normalizarTrechos(
    [{ inicio: 0, fim: 60, acao: "acelerar", fator: 2, audio: "mudo" }], 120
  );
  const p = montarPlanoDryRun({
    saidaSilencedetect: "", duracaoTotal: 120, slug: "demo", minSilencio: 0.8, trechos,
  });
  assert.ok(p.velocidade, "deve trazer o bloco de velocidade");
  assert.equal(p.velocidade.duracaoFinal, planoVelocidade(trechos, 120).duracaoFinal);
});
