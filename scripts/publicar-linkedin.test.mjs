import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { orgUrn, conteudoLinkedin, corpoPost, publicarNoLinkedin } from "./publicar-linkedin.mjs";

const SCRIPT = fileURLToPath(new URL("./publicar-linkedin.mjs", import.meta.url));

function peca(arquivos, legenda = "Legenda real.") {
  const dir = mkdtempSync(join(tmpdir(), "peca-"));
  for (const a of arquivos) writeFileSync(join(dir, a), "DATA");
  if (legenda !== null) writeFileSync(join(dir, "legenda.md"), legenda);
  return dir;
}

test("orgUrn: aceita numérico e URN completa", () => {
  assert.equal(orgUrn("123"), "urn:li:organization:123");
  assert.equal(orgUrn("urn:li:organization:9"), "urn:li:organization:9");
});

test("conteudoLinkedin: post = media única; carrossel = multiImage", () => {
  assert.deepEqual(conteudoLinkedin("post", ["urn:li:image:1"]), { media: { id: "urn:li:image:1" } });
  assert.deepEqual(conteudoLinkedin("carrossel", ["a", "b"]), { multiImage: { images: [{ id: "a" }, { id: "b" }] } });
});

test("corpoPost: estrutura do post público de empresa", () => {
  const c = corpoPost("urn:li:organization:1", "leg", { media: { id: "x" } });
  assert.equal(c.author, "urn:li:organization:1");
  assert.equal(c.commentary, "leg");
  assert.equal(c.visibility, "PUBLIC");
  assert.equal(c.lifecycleState, "PUBLISHED");
  assert.deepEqual(c.content, { media: { id: "x" } });
});

function mockLi() {
  let n = 0;
  return createServer((req, res) => {
    let body = ""; req.on("data", (d) => (body += d)); req.on("end", () => {
      const base = `http://127.0.0.1:${req.socket.localPort}`;
      if (req.method === "POST" && /\/rest\/images/.test(req.url)) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ value: { uploadUrl: `${base}/upload`, image: "urn:li:image:" + (++n) } }));
      } else if (req.method === "PUT" && /\/upload/.test(req.url)) {
        res.writeHead(201).end("");
      } else if (req.method === "POST" && /\/rest\/posts/.test(req.url)) {
        res.writeHead(201, { "x-restli-id": "urn:li:share:999" }).end("{}");
      } else { res.writeHead(404).end("{}"); }
    });
  });
}
async function comMock(fn) {
  const srv = mockLi();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try { return await fn(base); } finally { srv.close(); }
}

test("publicarNoLinkedin: post sobe imagem e publica, devolve URN + permalink", async () => {
  await comMock(async (base) => {
    const dir = mkdtempSync(join(tmpdir(), "x-"));
    const f = join(dir, "p.png"); writeFileSync(f, "D");
    const r = await publicarNoLinkedin({ org: "1", token: "T", tipo: "post", caminhos: [f], caption: "c", base });
    assert.equal(r.id, "urn:li:share:999");
    assert.match(r.permalink, /linkedin\.com\/feed\/update/);
  });
});

test("publicarNoLinkedin: carrossel sobe N imagens", async () => {
  await comMock(async (base) => {
    const dir = mkdtempSync(join(tmpdir(), "x-"));
    const c = [join(dir, "a.png"), join(dir, "b.png")];
    for (const f of c) writeFileSync(f, "D");
    const r = await publicarNoLinkedin({ org: "1", token: "T", tipo: "carrossel", caminhos: c, caption: "c", base });
    assert.equal(r.id, "urn:li:share:999");
  });
});

test("erro do LinkedIn não vaza o token", async () => {
  const srv = createServer((req, res) => { res.writeHead(401, { "Content-Type": "application/json" }); res.end(JSON.stringify({ message: "tok=SECRETO-LI" })); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const dir = mkdtempSync(join(tmpdir(), "x-")); const f = join(dir, "p.png"); writeFileSync(f, "D");
  await assert.rejects(
    () => publicarNoLinkedin({ org: "1", token: "SECRETO-LI", tipo: "post", caminhos: [f], caption: "c", base }),
    (e) => !/SECRETO-LI/.test(e.message)
  );
  srv.close();
});

test("CLI: reel é bloqueado (v2)", () => {
  const dir = peca(["reel.mp4"]);
  assert.throws(() => execFileSync("node", [SCRIPT, "--peca", dir, "--tipo", "reel"], { encoding: "utf8", env: { ...process.env, LINKEDIN_ORG_ID: "1", LINKEDIN_TOKEN: "T" } }), /./);
});

test("CLI dry-run LinkedIn: valida e mostra plano, sem publicar", () => {
  const dir = peca(["slide-01.png", "slide-02.png"], "Legenda.");
  const out = execFileSync("node", [SCRIPT, "--peca", dir, "--tipo", "carrossel"], {
    encoding: "utf8", env: { ...process.env, LINKEDIN_ORG_ID: "123", LINKEDIN_TOKEN: "T" },
  });
  assert.match(out, /dry.?run/i);
  assert.match(out, /urn:li:organization:123/);
});
