import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { payloadFacebook, paramsAlbum, publicarNoFacebook } from "./publicar-facebook.mjs";

const SCRIPT = fileURLToPath(new URL("./publicar-facebook.mjs", import.meta.url));

function peca(arquivos, legenda = "Legenda real.") {
  const dir = mkdtempSync(join(tmpdir(), "peca-"));
  for (const a of arquivos) writeFileSync(join(dir, a), "DATA");
  if (legenda !== null) writeFileSync(join(dir, "legenda.md"), legenda);
  return dir;
}

test("payloadFacebook: post = /photos {url,caption}; reel = /videos {file_url,description}", () => {
  assert.deepEqual(payloadFacebook("post", { url: "u", caption: "c" }), { endpoint: "photos", params: { url: "u", caption: "c" } });
  assert.deepEqual(payloadFacebook("reel", { url: "v", caption: "c" }), { endpoint: "videos", params: { file_url: "v", description: "c" } });
});

test("paramsAlbum: message + attached_media indexados", () => {
  const p = paramsAlbum("leg", ["a", "b"]);
  assert.equal(p.message, "leg");
  assert.equal(p["attached_media[0]"], JSON.stringify({ media_fbid: "a" }));
  assert.equal(p["attached_media[1]"], JSON.stringify({ media_fbid: "b" }));
});

function mockGraph() {
  return createServer((req, res) => {
    let body = ""; req.on("data", (d) => (body += d)); req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      if (req.method === "POST" && /\/photos/.test(req.url)) res.end(JSON.stringify({ id: "PHOTO-1", post_id: "POST-1" }));
      else if (req.method === "POST" && /\/feed/.test(req.url)) res.end(JSON.stringify({ id: "FEED-1" }));
      else if (req.method === "POST" && /\/videos/.test(req.url)) res.end(JSON.stringify({ id: "VIDEO-1" }));
      else if (req.method === "GET" && /permalink_url/.test(req.url)) res.end(JSON.stringify({ permalink_url: "https://facebook.com/XYZ" }));
      else res.writeHead(404).end("{}");
    });
  });
}
async function comMock(fn) {
  const srv = mockGraph();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try { return await fn(base); } finally { srv.close(); }
}

test("publicarNoFacebook: post devolve id + permalink", async () => {
  await comMock(async (graphBase) => {
    const r = await publicarNoFacebook({ page: "PG", token: "T", tipo: "post", urls: ["u"], caption: "c", graphBase });
    assert.equal(r.id, "POST-1");
    assert.match(r.permalink, /facebook\.com/);
  });
});

test("publicarNoFacebook: carrossel sobe fotos + cria feed", async () => {
  await comMock(async (graphBase) => {
    const r = await publicarNoFacebook({ page: "PG", token: "T", tipo: "carrossel", urls: ["a", "b"], caption: "c", graphBase });
    assert.equal(r.id, "FEED-1");
  });
});

test("publicarNoFacebook: reel sobe vídeo", async () => {
  await comMock(async (graphBase) => {
    const r = await publicarNoFacebook({ page: "PG", token: "T", tipo: "reel", urls: ["v"], caption: "c", graphBase });
    assert.equal(r.id, "VIDEO-1");
  });
});

test("erro da Graph não vaza o token (FB)", async () => {
  const srv = createServer((req, res) => { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: { message: "tok=SECRETO-FB" } })); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  await assert.rejects(
    () => publicarNoFacebook({ page: "PG", token: "SECRETO-FB", tipo: "post", urls: ["u"], caption: "c", graphBase: base }),
    (e) => !/SECRETO-FB/.test(e.message)
  );
  srv.close();
});

test("CLI dry-run FB: valida e mostra plano, sem publicar", () => {
  const dir = peca(["imagem.png"], "Legenda.");
  const out = execFileSync("node", [SCRIPT, "--peca", dir, "--tipo", "post"], {
    encoding: "utf8", env: { ...process.env, META_PAGINA_ID: "PG", META_TOKEN_PAGINA: "T" },
  });
  assert.match(out, /dry.?run/i);
  assert.match(out, /"pagina": "PG"/);
});
