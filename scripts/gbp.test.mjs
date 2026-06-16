import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { corpoPostGbp, obterTokenGoogle, criarPostLocal, responderAvaliacao } from "./gbp.mjs";

const SCRIPT = fileURLToPath(new URL("./gbp.mjs", import.meta.url));

test("corpoPostGbp: STANDARD simples; com CTA; com mídia", () => {
  assert.deepEqual(corpoPostGbp({ summary: "oi" }), { languageCode: "pt-BR", summary: "oi", topicType: "STANDARD" });
  const c = corpoPostGbp({ summary: "oi", ctaUrl: "https://x", mediaUrl: "https://img.png", topico: "OFFER" });
  assert.equal(c.topicType, "OFFER");
  assert.deepEqual(c.callToAction, { actionType: "LEARN_MORE", url: "https://x" });
  assert.deepEqual(c.media, [{ mediaFormat: "PHOTO", sourceUrl: "https://img.png" }]);
});

function mockToken(accessToken = "AT-123") {
  return createServer((req, res) => {
    let b = ""; req.on("data", (d) => (b += d)); req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ access_token: accessToken, expires_in: 3600, token_type: "Bearer" }));
    });
  });
}
async function comServer(srv, fn) {
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try { return await fn(base); } finally { srv.close(); }
}

test("obterTokenGoogle: refresh -> access_token", async () => {
  await comServer(mockToken("AT-XYZ"), async (tokenUrl) => {
    const t = await obterTokenGoogle({ clientId: "c", clientSecret: "s", refreshToken: "r", tokenUrl });
    assert.equal(t, "AT-XYZ");
  });
});

test("obterTokenGoogle: sem credenciais lança", async () => {
  await assert.rejects(() => obterTokenGoogle({ clientId: "", clientSecret: "", refreshToken: "" }), /credenciais/);
});

function mockApi() {
  return createServer((req, res) => {
    let b = ""; req.on("data", (d) => (b += d)); req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      if (req.method === "POST" && /localPosts/.test(req.url)) res.end(JSON.stringify({ name: "accounts/1/locations/2/localPosts/9", searchUrl: "https://maps.google.com/post/9" }));
      else if (req.method === "PUT" && /\/reply/.test(req.url)) res.end(JSON.stringify({ comment: "ok", updateTime: "2026-06-16T00:00:00Z" }));
      else res.writeHead(404).end("{}");
    });
  });
}

test("criarPostLocal: devolve name + searchUrl", async () => {
  await comServer(mockApi(), async (apiBase) => {
    const r = await criarPostLocal({ apiBase, token: "AT", location: "accounts/1/locations/2", corpo: corpoPostGbp({ summary: "oi" }) });
    assert.match(r.name, /localPosts/);
    assert.match(r.searchUrl, /maps\.google/);
  });
});

test("responderAvaliacao: PUT reply funciona", async () => {
  await comServer(mockApi(), async (apiBase) => {
    const r = await responderAvaliacao({ apiBase, token: "AT", reviewName: "accounts/1/locations/2/reviews/3", comentario: "obrigado!" });
    assert.equal(r.comment, "ok");
  });
});

test("erro da GBP não vaza o token", async () => {
  const srv = createServer((req, res) => { res.writeHead(401, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: { message: "tok=SECRETO-GBP" } })); });
  await comServer(srv, async (apiBase) => {
    await assert.rejects(
      () => criarPostLocal({ apiBase, token: "SECRETO-GBP", location: "accounts/1/locations/2", corpo: corpoPostGbp({ summary: "x" }) }),
      (e) => !/SECRETO-GBP/.test(e.message)
    );
  });
});

test("CLI dry-run post: valida e mostra plano, sem publicar", () => {
  const out = execFileSync("node", [SCRIPT, "--acao", "post", "--texto", "Oferta da semana"], {
    encoding: "utf8", env: { ...process.env, GBP_CLIENT_ID: "c", GBP_CLIENT_SECRET: "s", GBP_REFRESH_TOKEN: "r", GBP_LOCATION_ID: "accounts/1/locations/2" },
  });
  assert.match(out, /dry.?run/i);
  assert.match(out, /"acao": "post"/);
});

test("CLI dry-run responder: mostra plano", () => {
  const out = execFileSync("node", [SCRIPT, "--acao", "responder", "--review", "accounts/1/locations/2/reviews/3", "--resposta", "Obrigado!"], {
    encoding: "utf8", env: { ...process.env, GBP_CLIENT_ID: "c", GBP_CLIENT_SECRET: "s", GBP_REFRESH_TOKEN: "r" },
  });
  assert.match(out, /dry.?run/i);
  assert.match(out, /responder/);
});
