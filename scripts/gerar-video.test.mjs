// scripts/gerar-video.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { argsFfmpeg, duracaoAudio, casarDuracoes, mixVozTrilha } from "./gerar-video.mjs";

const SCRIPT = fileURLToPath(new URL("./gerar-video.mjs", import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "vid-test-"));
process.on("exit", () => rmSync(tmp, { recursive: true, force: true }));

function run(args, env = {}) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8", env: { ...process.env, ...env } });
    return { code: 0, stdout, stderr: "" };
  } catch (e) { return { code: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" }; }
}
function roteiro(obj) { const p = join(tmp, `r${Math.random().toString(36).slice(2)}.json`); writeFileSync(p, JSON.stringify(obj)); return p; }

test("erro: sem roteiro", () => {
  const r = run([]); assert.equal(r.code, 1); assert.match(r.stderr, /roteiro/i);
});

test("erro: roteiro sem cenas", () => {
  const r = run([roteiro({ slug: "x", cenas: [] }), "--dry-run"]);
  assert.equal(r.code, 1); assert.match(r.stderr, /cena/i);
});

test("dry-run: plano com 2 cenas, vertical 1080x1920, soma a duração", () => {
  const r = run([roteiro({ slug: "x", cenas: [{ texto: "a", visual: "v1", segundos: 5 }, { texto: "b", visual: "v2", segundos: 6 }] }), "--dry-run"]);
  assert.equal(r.code, 0, r.stderr);
  const plano = JSON.parse(r.stdout);
  assert.equal(plano.cenas.length, 2);
  assert.equal(plano.largura, 1080);
  assert.equal(plano.altura, 1920);
  assert.equal(plano.duracao_total, 11);
  assert.equal(plano.modelo_video, "kling");
});

test("dry-run: cena com imagem pronta (sem visual) vale, e --modelo seedance é aceito", () => {
  const r = run([roteiro({ slug: "x", cenas: [{ texto: "a", imagem: "/t/foto.png", segundos: 3 }] }), "--modelo", "seedance", "--dry-run"]);
  assert.equal(r.code, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).modelo_video, "seedance");
});

test("erro: --modelo inválido", () => {
  const r = run([roteiro({ slug: "x", cenas: [{ texto: "a", visual: "v", segundos: 3 }] }), "--modelo", "xpto", "--dry-run"]);
  assert.equal(r.code, 1); assert.match(r.stderr, /modelo/i);
});

test("argsFfmpeg: gera args com escala vertical e legenda drawtext", () => {
  const a = argsFfmpeg({
    clipes: ["/t/c0.mp4", "/t/c1.mp4"],
    legendas: ["primeira", "segunda"],
    trilha: "/t/m.mp3",
    saida: "/t/reel.mp4",
    largura: 1080, altura: 1920, fonte: "/t/fonte.ttf", cor: "#d4af37",
  });
  const s = a.join(" ");
  assert.match(s, /1080:1920/);          // escala vertical
  assert.match(s, /drawtext/);            // legenda queimada
  assert.match(s, /\/t\/reel\.mp4/);      // saída
  assert.match(s, /\/t\/m\.mp3/);         // trilha
});

test("argsFfmpeg: escapa caminho de fonte do Windows (barra invertida quebra o filtro)", () => {
  const a = argsFfmpeg({
    clipes: ["/t/c0.mp4"],
    legendas: ["x"],
    trilha: undefined,
    saida: "/t/reel.mp4",
    largura: 1080, altura: 1920, fonte: "C:\\Windows\\Fonts\\arialbd.ttf", cor: "#d4af37",
  });
  const s = a.join(" ");
  assert.doesNotMatch(s, /C:\\Windows/);   // nada de barra invertida crua (era o bug)
  assert.match(s, /C\\:\/Windows\/Fonts/); // drive escapado + barras normais
});

test("argsFfmpeg: corte rápido — trima cada clipe pra duração da cena", () => {
  const a = argsFfmpeg({
    clipes: ["/t/c0.mp4", "/t/c1.mp4"],
    legendas: ["a", "b"],
    duracoes: [3, 2],
    saida: "/t/reel.mp4",
    largura: 1080, altura: 1920, fonte: "/t/f.ttf", cor: "#d4af37",
  });
  const s = a.join(" ");
  assert.match(s, /trim=duration=3/);  // clipe 0 cortado em 3s
  assert.match(s, /trim=duration=2/);  // clipe 1 cortado em 2s
});

import { custoClipe } from "./gerar-video.mjs";

test("custoClipe: preço por modelo/segundos (preços reais Fal)", () => {
  assert.equal(custoClipe("kling", 5), 0.35);
  assert.equal(custoClipe("kling", 10), 0.70);
  assert.equal(Number(custoClipe("seedance", 5).toFixed(2)), 0.74);   // 5 * 0.148
  assert.equal(Number(custoClipe("seedance", 1).toFixed(3)), 0.296);  // clamp min 2s
  assert.equal(custoClipe("ltx", 8), 0.04);                            // flat
  assert.equal(custoClipe("wan", 5), 0.40);                            // 81 frames = base
  assert.equal(custoClipe("wan", 6), 0.50);                            // >81 frames = x1.25
});

test("duracaoAudio extrai segundos da saída do ffprobe", () => {
  assert.equal(duracaoAudio("duration=3.456000\n"), 3.456);
});

test("duracaoAudio devolve 0 quando não acha duração", () => {
  assert.equal(duracaoAudio("lixo sem duracao"), 0);
});

test("casarDuracoes aplica a duração da fala (+folga) em cada cena", () => {
  const cenas = [{ visual: "a" }, { visual: "b" }];
  const out = casarDuracoes(cenas, [2.0, 3.5], { folga: 0.4 });
  assert.equal(out[0].segundos, 2.4);
  assert.equal(out[1].segundos, 3.9);
  assert.equal(out[0].visual, "a");
});

test("casarDuracoes mantém segundos existente quando não há áudio pra cena", () => {
  const cenas = [{ visual: "a", segundos: 5 }];
  const out = casarDuracoes(cenas, [0], { folga: 0.4 });
  assert.equal(out[0].segundos, 5);
});

test("mixVozTrilha mixa voz e música com a música mais baixa", () => {
  const a = mixVozTrilha({ video: "v.mp4", voz: "voz.mp3", trilha: "m.mp3", saida: "out.mp4", duckDb: 18 });
  assert.deepEqual(a.slice(0, 6), ["-y", "-i", "v.mp4", "-i", "voz.mp3", "-i"]);
  assert.ok(a.join(" ").includes("volume=-18dB"));
  assert.ok(a.join(" ").includes("amix=inputs=2"));
  assert.ok(a.join(" ").includes("out.mp4"));
});

test("mixVozTrilha sem trilha usa só a voz", () => {
  const a = mixVozTrilha({ video: "v.mp4", voz: "voz.mp3", saida: "out.mp4" });
  assert.deepEqual(a.slice(0, 5), ["-y", "-i", "v.mp4", "-i", "voz.mp3"]);
  assert.ok(!a.join(" ").includes("amix"));
  assert.ok(a.join(" ").includes("1:a"));
});
