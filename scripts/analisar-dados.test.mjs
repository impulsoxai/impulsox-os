// Testes do analisar-dados.mjs — Node test runner nativo (node --test), sem deps.
// CLI determinístico: testa via subprocess (argv + exit code + stdout JSON).
// ImpulsoX AI. Cobre: happy path (agrupado e total), centavos, formatos BR/US,
// entrada JSON, erros de uso, determinismo, encoding e segurança (input malicioso
// tratado como DADO, nunca executado).

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./analisar-dados.mjs", import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "dados-test-"));
process.on("exit", () => rmSync(tmp, { recursive: true, force: true }));

let n = 0;
function arquivoTmp(conteudo, ext = "csv") {
  const p = join(tmp, `d${n++}.${ext}`);
  writeFileSync(p, conteudo, "utf8");
  return p;
}
function run(args) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8" });
    return { code: 0, stdout, stderr: "" };
  } catch (e) {
    return { code: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

// ─── Happy path ──────────────────────────────────────────────────────────────
test("happy path: agrupa por dimensão e soma os valores", () => {
  const csv = arquivoTmp(
    "Categoria,Receita,Qtd\n" +
    "Bebidas,100.00,3\n" +
    "Bebidas,50.00,2\n" +     // mesma categoria soma
    "Comida,200.00,4\n"
  );
  const { code, stdout } = run([csv, "--dimensao", "Categoria", "--valores", "Receita,Qtd", "--moeda", "Receita"]);
  assert.equal(code, 0);
  const out = JSON.parse(stdout);
  const bebidas = out.por_dimensao.find((x) => x.Categoria === "Bebidas");
  assert.equal(bebidas.Receita_centavos, 15000);  // 150.00 → 15000 centavos
  assert.equal(bebidas.Qtd, 5);
  assert.equal(bebidas.registros, 2);
  assert.equal(out.agregado.Receita_centavos, 35000); // total
  assert.equal(out.agregado.Qtd, 9);
});

test("ranking: por_dimensao ordena pelo primeiro valor, decrescente", () => {
  const csv = arquivoTmp("Cat,V\nA,10\nB,99\nC,50\n");
  const out = JSON.parse(run([csv, "--dimensao", "Cat", "--valores", "V"]).stdout);
  assert.deepEqual(out.por_dimensao.map((x) => x.Cat), ["B", "C", "A"]);
});

test("sem --dimensao: só o agregado total", () => {
  const csv = arquivoTmp("Cat,V\nA,10\nB,20\n");
  const out = JSON.parse(run([csv, "--valores", "V"]).stdout);
  assert.equal(out.por_dimensao, undefined);
  assert.equal(out.agregado.V, 30);
  assert.equal(out.agregado.registros, 2);
});

// ─── Formatos de número BR / US ──────────────────────────────────────────────
test("formato BR: 1.234,56 vira 123456 centavos", () => {
  const csv = arquivoTmp("Cat,Receita\nX,\"1.234,56\"\n");
  const out = JSON.parse(run([csv, "--valores", "Receita", "--moeda", "Receita"]).stdout);
  assert.equal(out.agregado.Receita_centavos, 123456);
});

test("formato US: 1,234.56 vira 123456 centavos", () => {
  const csv = arquivoTmp("Cat,Receita\nX,\"1,234.56\"\n");
  const out = JSON.parse(run([csv, "--valores", "Receita", "--moeda", "Receita"]).stdout);
  assert.equal(out.agregado.Receita_centavos, 123456);
});

test("símbolo de moeda e espaços são ignorados", () => {
  const csv = arquivoTmp("Cat,Receita\nX,\"R$ 1.000,00\"\n");
  const out = JSON.parse(run([csv, "--valores", "Receita", "--moeda", "Receita"]).stdout);
  assert.equal(out.agregado.Receita_centavos, 100000);
});

test("separador ; é detectado (export PT-BR)", () => {
  const csv = arquivoTmp("Cat;Receita\nA;10,00\n");
  const out = JSON.parse(run([csv, "--valores", "Receita", "--moeda", "Receita"]).stdout);
  assert.equal(out.agregado.Receita_centavos, 1000);
});

// ─── Entrada JSON ────────────────────────────────────────────────────────────
test("entrada JSON (array de objetos) agrega igual ao CSV", () => {
  const json = arquivoTmp(JSON.stringify([
    { Categoria: "A", Receita: 10, Qtd: 1 },
    { Categoria: "A", Receita: 5, Qtd: 2 },
  ]), "json");
  const out = JSON.parse(run([json, "--dimensao", "Categoria", "--valores", "Receita,Qtd", "--moeda", "Receita"]).stdout);
  assert.equal(out.por_dimensao[0].Receita_centavos, 1500);
  assert.equal(out.por_dimensao[0].Qtd, 3);
});

test("entrada JSON no formato { dados: [...] }", () => {
  const json = arquivoTmp(JSON.stringify({ dados: [{ Cat: "X", V: 7 }] }), "json");
  const out = JSON.parse(run([json, "--valores", "V"]).stdout);
  assert.equal(out.agregado.V, 7);
});

// ─── Erros de uso (saída != 0, mensagem clara, sem stack trace cru) ───────────
test("sem arquivo: erro e exit != 0", () => {
  const { code, stderr } = run(["--valores", "V"]);
  assert.notEqual(code, 0);
  assert.match(stderr, /ERRO:/);
  assert.doesNotMatch(stderr, /at \w+ \(/);
});

test("sem --valores: erro claro", () => {
  const csv = arquivoTmp("Cat,V\nA,1\n");
  const { code, stderr } = run([csv]);
  assert.notEqual(code, 0);
  assert.match(stderr, /valores.*obrigat/i);
});

test("--moeda fora de --valores: erro claro", () => {
  const csv = arquivoTmp("Cat,V\nA,1\n");
  const { code, stderr } = run([csv, "--valores", "V", "--moeda", "Outra"]);
  assert.notEqual(code, 0);
  assert.match(stderr, /moeda/i);
});

test("coluna pedida não existe: erro lista as colunas", () => {
  const csv = arquivoTmp("Cat,V\nA,1\n");
  const { code, stderr } = run([csv, "--valores", "NaoExiste"]);
  assert.notEqual(code, 0);
  assert.match(stderr, /NaoExiste/);
});

test("JSON inválido: erro claro", () => {
  const bad = arquivoTmp("{naoEhJson", "json");
  const { code, stderr } = run([bad, "--valores", "V"]);
  assert.notEqual(code, 0);
  assert.match(stderr, /JSON/i);
});

test("arquivo inexistente: falha sem vazar stack trace", () => {
  const { code, stderr } = run(["/caminho/que/nao/existe.csv", "--valores", "V"]);
  assert.notEqual(code, 0);
  assert.doesNotMatch(stderr, /at \w+ \(/);
});

// ─── Determinismo ────────────────────────────────────────────────────────────
test("idempotência: mesmo input → mesma saída (exceto gerado_em)", () => {
  const csv = arquivoTmp("Cat,V\nA,10\nB,20\n");
  const args = [csv, "--dimensao", "Cat", "--valores", "V"];
  const a = JSON.parse(run(args).stdout);
  const b = JSON.parse(run(args).stdout);
  delete a.gerado_em; delete b.gerado_em;
  assert.deepEqual(a, b);
});

// ─── Encoding ────────────────────────────────────────────────────────────────
test("encoding: acento na dimensão é preservado", () => {
  const csv = arquivoTmp("Cat,V\nPromoção São João,10\n");
  const out = JSON.parse(run([csv, "--dimensao", "Cat", "--valores", "V"]).stdout);
  assert.equal(out.por_dimensao[0].Cat, "Promoção São João");
});

// ─── Segurança: input malicioso tratado como DADO, nunca executado ───────────
test("segurança: injection na dimensão vira dado inerte, sem crash", () => {
  const ataques = ["'; DROP TABLE x; --", "<script>alert(1)</script>", "$(whoami)", "../../etc/passwd", "{{7*7}}"];
  for (const nome of ataques) {
    const csv = arquivoTmp("Cat,V\n" + `"${nome}",10\n`);
    const { code, stdout } = run([csv, "--dimensao", "Cat", "--valores", "V"]);
    assert.equal(code, 0, `crashou com: ${nome}`);
    const out = JSON.parse(stdout);
    assert.equal(out.por_dimensao[0].Cat, nome);  // literal, não avaliado
    assert.equal(out.por_dimensao[0].V, 10);
  }
});

test("segurança: número gigante não vira Infinity/NaN no JSON", () => {
  const csv = arquivoTmp("Cat,V\nBig,999999999999999\n");
  const { code, stdout } = run([csv, "--valores", "V"]);
  assert.equal(code, 0);
  const out = JSON.parse(stdout); // JSON.parse falharia se fosse Infinity/NaN
  assert.ok(Number.isFinite(out.agregado.V));
});

test("valor não-numérico vira 0, não quebra", () => {
  const csv = arquivoTmp("Cat,V\nX,abc\n");
  const out = JSON.parse(run([csv, "--valores", "V"]).stdout);
  assert.equal(out.agregado.V, 0);
});
