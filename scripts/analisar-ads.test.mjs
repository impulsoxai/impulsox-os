// Testes do analisar-ads.mjs — Node test runner nativo (node --test), sem deps.
// CLI determinístico: testa via subprocess (argv + exit code + stdout JSON).
// ImpulsoX AI. Cobre: happy path, formatos BR/US, erros de uso, robustez de
// parser, determinismo, encoding e segurança (input malicioso como dado).

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./analisar-ads.mjs", import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "ads-test-"));
process.on("exit", () => rmSync(tmp, { recursive: true, force: true }));

let n = 0;
function csvFile(conteudo) {
  const p = join(tmp, `c${n++}.csv`);
  writeFileSync(p, conteudo, "utf8");
  return p;
}

// roda o script; devolve { code, stdout, stderr }
function run(args) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8" });
    return { code: 0, stdout, stderr: "" };
  } catch (e) {
    return { code: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

const MAPA = '{"campanha":"Campaign","custo":"Cost","cliques":"Clicks","impressoes":"Impr","conversoes":"Conv"}';

// ─── Happy path ──────────────────────────────────────────────────────────────
test("happy path: agrega e calcula em centavos", () => {
  const csv = csvFile(
    "Campaign,Cost,Clicks,Impr,Conv\n" +
    "Marca,100.00,200,1000,10\n" +
    "Marca,50.00,100,500,5\n" +     // mesma campanha soma
    "Genérica,30.00,50,2000,0\n"
  );
  const { code, stdout } = run([csv, "--mapa", MAPA, "--plataforma", "google"]);
  assert.equal(code, 0);
  const out = JSON.parse(stdout);
  assert.equal(out.plataforma, "google");
  const marca = out.campanhas.find((c) => c.campanha === "Marca");
  assert.equal(marca.custo_centavos, 15000);   // 150.00 → 15000 centavos
  assert.equal(marca.cliques, 300);
  assert.equal(marca.conversoes, 15);
  assert.equal(marca.cpa_centavos, 1000);       // 15000/15
  assert.equal(marca.ctr, 0.2);                 // 300/1500
});

test("ranking: campanha com conversão vem antes, por CPA crescente", () => {
  const csv = csvFile(
    "Campaign,Cost,Clicks,Impr,Conv\n" +
    "SemConv,90.00,300,1000,0\n" +
    "CPAalto,100.00,100,500,2\n" +   // CPA 5000
    "CPAbaixo,100.00,100,500,10\n"   // CPA 1000
  );
  const out = JSON.parse(run([csv, "--mapa", MAPA]).stdout);
  assert.equal(out.campanhas[0].campanha, "CPAbaixo");
  assert.equal(out.campanhas[1].campanha, "CPAalto");
  assert.equal(out.campanhas[2].campanha, "SemConv");
});

// ─── Formatos de número BR / US ──────────────────────────────────────────────
test("formato BR: 1.234,56 vira 123456 centavos", () => {
  const csv = csvFile("Campaign,Cost\n" + 'BR,"1.234,56"\n');
  const out = JSON.parse(run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']).stdout);
  assert.equal(out.campanhas[0].custo_centavos, 123456);
});

test("formato US: 1,234.56 vira 123456 centavos", () => {
  const csv = csvFile("Campaign,Cost\n" + 'US,"1,234.56"\n');
  const out = JSON.parse(run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']).stdout);
  assert.equal(out.campanhas[0].custo_centavos, 123456);
});

test("símbolo de moeda e espaços são ignorados", () => {
  const csv = csvFile("Campaign,Cost\n" + 'X,"R$ 1.000,00"\n');
  const out = JSON.parse(run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']).stdout);
  assert.equal(out.campanhas[0].custo_centavos, 100000);
});

// ─── Robustez de parser ──────────────────────────────────────────────────────
test("separador ; é detectado (export PT-BR)", () => {
  const csv = csvFile("Campaign;Cost;Clicks\n" + "A;10,00;5\n");
  const out = JSON.parse(run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost","cliques":"Clicks"}']).stdout);
  assert.equal(out.campanhas[0].custo_centavos, 1000);
  assert.equal(out.campanhas[0].cliques, 5);
});

test("linhas de título antes do cabeçalho são puladas", () => {
  const csv = csvFile(
    "Relatório de Campanhas\n" +
    "Período: 01/01 a 31/01\n" +
    "Campaign,Cost\n" +
    "A,10.00\n"
  );
  const out = JSON.parse(run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']).stdout);
  assert.equal(out.campanhas.length, 1);
  assert.equal(out.campanhas[0].custo_centavos, 1000);
});

test("linha de total/Account é ignorada", () => {
  const csv = csvFile(
    "Campaign,Cost\n" +
    "A,10.00\n" +
    "Total,9999.00\n" +
    "Todas as campanhas,8888.00\n"
  );
  const out = JSON.parse(run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']).stdout);
  assert.equal(out.campanhas.length, 1);
  assert.equal(out.agregado.custo_centavos, 1000);
});

test("BOM no início do arquivo não quebra o cabeçalho", () => {
  const csv = csvFile("﻿Campaign,Cost\n" + "A,10.00\n");
  const out = JSON.parse(run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']).stdout);
  assert.equal(out.campanhas[0].custo_centavos, 1000);
});

// ─── Erros de uso (saída != 0, mensagem clara, sem stack trace cru) ───────────
test("sem arquivo: erro e exit != 0", () => {
  const { code, stderr } = run(["--mapa", MAPA]);
  assert.notEqual(code, 0);
  assert.match(stderr, /ERRO:/);
  assert.doesNotMatch(stderr, /at \w+ \(/); // sem stack trace cru
});

test("sem --mapa: erro claro", () => {
  const csv = csvFile("Campaign,Cost\nA,10\n");
  const { code, stderr } = run([csv]);
  assert.notEqual(code, 0);
  assert.match(stderr, /mapa.*obrigat/i);
});

test("--mapa com JSON inválido: erro claro", () => {
  const csv = csvFile("Campaign,Cost\nA,10\n");
  const { code, stderr } = run([csv, "--mapa", "{naoEhJson"]);
  assert.notEqual(code, 0);
  assert.match(stderr, /JSON/i);
});

test("--mapa sem campanha/custo: erro claro", () => {
  const csv = csvFile("Campaign,Cost\nA,10\n");
  const { code, stderr } = run([csv, "--mapa", '{"cliques":"X"}']);
  assert.notEqual(code, 0);
  assert.match(stderr, /campanha.*custo/i);
});

test("coluna do mapa não existe no cabeçalho: erro lista as colunas", () => {
  const csv = csvFile("Campaign,Cost\nA,10\n");
  const { code, stderr } = run([csv, "--mapa", '{"campanha":"Campaign","custo":"NaoExiste"}']);
  assert.notEqual(code, 0);
  assert.match(stderr, /NaoExiste/);
});

test("arquivo inexistente: falha sem vazar stack trace", () => {
  const { code } = run(["/caminho/que/nao/existe.csv", "--mapa", MAPA]);
  assert.notEqual(code, 0);
});

test("CSV só com cabeçalho: nenhuma campanha → erro", () => {
  const csv = csvFile("Campaign,Cost\n");
  const { code, stderr } = run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']);
  assert.notEqual(code, 0);
  assert.match(stderr, /sem dados|nenhuma campanha/i);
});

// ─── Determinismo (Phase 6) ──────────────────────────────────────────────────
test("idempotência: mesmo input → mesma saída (exceto gerado_em)", () => {
  const csv = csvFile("Campaign,Cost,Clicks\nA,10.00,5\nB,20.00,8\n");
  const args = [csv, "--mapa", '{"campanha":"Campaign","custo":"Cost","cliques":"Clicks"}'];
  const a = JSON.parse(run(args).stdout);
  const b = JSON.parse(run(args).stdout);
  delete a.gerado_em; delete b.gerado_em;
  assert.deepEqual(a, b);
});

// ─── Encoding (Phase 9) ──────────────────────────────────────────────────────
test("encoding: acento em nome de campanha é preservado", () => {
  const csv = csvFile("Campaign,Cost\n" + "São Paulo — Promoção,10.00\n");
  const out = JSON.parse(run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']).stdout);
  assert.equal(out.campanhas[0].campanha, "São Paulo — Promoção");
});

// ─── Segurança (Phase 10): input malicioso tratado como DADO, nunca executado ─
test("segurança: nome de campanha com injection vira dado inerte, sem crash", () => {
  const ataques = [
    "'; DROP TABLE users; --",
    "<script>alert(1)</script>",
    "$(whoami)",
    "../../etc/passwd",
    "{{7*7}}",
  ];
  for (const nome of ataques) {
    const csv = csvFile("Campaign,Cost\n" + `"${nome}",10.00\n`);
    const { code, stdout } = run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']);
    assert.equal(code, 0, `crashou com: ${nome}`);
    const out = JSON.parse(stdout);
    assert.equal(out.campanhas[0].campanha, nome);     // literal, não avaliado
    assert.equal(out.campanhas[0].custo_centavos, 1000);
  }
});

test("segurança: número gigante não vira Infinity/NaN no JSON", () => {
  const csv = csvFile("Campaign,Cost\n" + "Big,999999999999999\n");
  const { code, stdout } = run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']);
  assert.equal(code, 0);
  const out = JSON.parse(stdout); // JSON.parse falharia se fosse Infinity/NaN
  assert.ok(Number.isFinite(out.campanhas[0].custo_centavos));
});

test("valor não-numérico em custo vira 0, não quebra", () => {
  const csv = csvFile("Campaign,Cost\n" + "X,abc\n");
  const out = JSON.parse(run([csv, "--mapa", '{"campanha":"Campaign","custo":"Cost"}']).stdout);
  assert.equal(out.campanhas[0].custo_centavos, 0);
});
