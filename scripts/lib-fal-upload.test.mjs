import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { uploadParaFalCDN } from "./lib-fal-upload.mjs";

function mockFal() {
  return createServer((req, res) => {
    if (req.url.includes("/storage/auth/token")) {
      const base = `http://127.0.0.1:${req.socket.localPort}`;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ base_url: base, token: "tok-temp" }));
    } else if (req.url.includes("/files/upload")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ access_url: "https://cdn.fal.test/abc.png" }));
    } else { res.writeHead(404).end("no"); }
  });
}

test("uploadParaFalCDN sobe e devolve access_url", async () => {
  const srv = mockFal();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const dir = mkdtempSync(join(tmpdir(), "up-"));
  const f = join(dir, "x.png"); writeFileSync(f, "PNGDATA");
  const url = await uploadParaFalCDN(f, { falKey: "k", restBase: base });
  assert.equal(url, "https://cdn.fal.test/abc.png");
  srv.close();
});

test("uploadParaFalCDN sem FAL_KEY lança erro claro, sem vazar chave", async () => {
  await assert.rejects(
    () => uploadParaFalCDN("x.png", { falKey: "" }),
    (e) => /FAL_KEY/.test(e.message) && !/segredo/.test(e.message)
  );
});
