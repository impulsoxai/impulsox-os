import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { detectarMidia, lerLegenda, payloadContainer, publicarNoInstagram } from "./publicar-instagram.mjs";

function mockGraph() {
  let containerN = 0;
  return createServer((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      if (req.method === "POST" && /\/media_publish/.test(req.url)) {
        res.end(JSON.stringify({ id: "MEDIA-123" }));
      } else if (req.method === "POST" && /\/media/.test(req.url)) {
        res.end(JSON.stringify({ id: "CONTAINER-" + (++containerN) }));
      } else if (req.method === "GET" && /status_code/.test(req.url)) {
        res.end(JSON.stringify({ status_code: "FINISHED" }));
      } else if (req.method === "GET" && /permalink/.test(req.url)) {
        res.end(JSON.stringify({ permalink: "https://instagram.com/p/XYZ" }));
      } else { res.writeHead(404).end("{}"); }
    });
  });
}

async function comMock(fn) {
  const srv = mockGraph();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try { return await fn(base); } finally { srv.close(); }
}

function peca(arquivos, legenda = "Legenda real do post.") {
  const dir = mkdtempSync(join(tmpdir(), "peca-"));
  for (const a of arquivos) writeFileSync(join(dir, a), "DATA");
  if (legenda !== null) writeFileSync(join(dir, "legenda.md"), legenda);
  return dir;
}

test("detectarMidia: carrossel ordena os slide-*.png", () => {
  const dir = peca(["slide-02.png", "slide-01.png", "slide-03.png", "legenda.md"]);
  const m = detectarMidia(dir, "carrossel");
  assert.equal(m.length, 3);
  assert.match(m[0], /slide-01\.png$/);
  assert.match(m[2], /slide-03\.png$/);
});

test("detectarMidia: carrossel com 1 slide lança (precisa 2-10)", () => {
  const dir = peca(["slide-01.png"]);
  assert.throws(() => detectarMidia(dir, "carrossel"), /2 a 10/);
});

test("detectarMidia: post pega o único png; reel pega o mp4", () => {
  const dp = peca(["imagem.png"]);
  assert.match(detectarMidia(dp, "post")[0], /imagem\.png$/);
  const dr = peca(["reel.mp4"]);
  assert.match(detectarMidia(dr, "reel")[0], /reel\.mp4$/);
});

test("detectarMidia: sem mídia lança", () => {
  const dir = peca([]);
  assert.throws(() => detectarMidia(dir, "post"), /nenhuma imagem/i);
});

test("lerLegenda lê legenda.md; vazia lança", () => {
  const dir = peca(["imagem.png"], "Minha legenda.");
  assert.equal(lerLegenda(dir), "Minha legenda.");
  const vazio = peca(["imagem.png"], "   ");
  assert.throws(() => lerLegenda(vazio), /legenda/i);
});

test("payloadContainer: post = image_url + caption", () => {
  const p = payloadContainer("post", { url: "u1", caption: "leg" });
  assert.deepEqual(p, { image_url: "u1", caption: "leg" });
});

test("payloadContainer: filho de carrossel = image_url + is_carousel_item", () => {
  const p = payloadContainer("carrossel", { url: "u1", filho: true });
  assert.deepEqual(p, { image_url: "u1", is_carousel_item: "true" });
});

test("payloadContainer: pai do carrossel = CAROUSEL + children + caption", () => {
  const p = payloadContainer("carrossel", { urls: ["a", "b"], caption: "leg" });
  assert.deepEqual(p, { media_type: "CAROUSEL", children: "a,b", caption: "leg" });
});

test("payloadContainer: reel = REELS + video_url + caption", () => {
  const p = payloadContainer("reel", { url: "v1", caption: "leg" });
  assert.deepEqual(p, { media_type: "REELS", video_url: "v1", caption: "leg" });
});

test("publicarNoInstagram: post devolve id + permalink", async () => {
  await comMock(async (graphBase) => {
    const r = await publicarNoInstagram({ ig: "IGID", token: "T", tipo: "post", urls: ["u1"], caption: "leg", graphBase });
    assert.equal(r.id, "MEDIA-123");
    assert.match(r.permalink, /instagram\.com/);
  });
});

test("publicarNoInstagram: carrossel cria filhos + pai + publica", async () => {
  await comMock(async (graphBase) => {
    const r = await publicarNoInstagram({ ig: "IGID", token: "T", tipo: "carrossel", urls: ["a", "b", "c"], caption: "leg", graphBase });
    assert.equal(r.id, "MEDIA-123");
  });
});

test("publicarNoInstagram: reel polla status e publica", async () => {
  await comMock(async (graphBase) => {
    const r = await publicarNoInstagram({ ig: "IGID", token: "T", tipo: "reel", urls: ["v1"], caption: "leg", graphBase });
    assert.equal(r.id, "MEDIA-123");
  });
});

test("erro da Graph não vaza o token", async () => {
  const srv = createServer((req, res) => { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: { message: "Bad" } })); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  await assert.rejects(
    () => publicarNoInstagram({ ig: "IGID", token: "TOK-SECRETO", tipo: "post", urls: ["u1"], caption: "x", graphBase: base }),
    (e) => !/TOK-SECRETO/.test(e.message)
  );
  srv.close();
});
