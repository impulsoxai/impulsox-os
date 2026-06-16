import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checarCriadores } from "./checar-criadores-yt.mjs";

const RSS_DUAS_ENTRADAS = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
<entry>
<yt:videoId>relevante01</yt:videoId>
<title>Como usar Claude Code do zero</title>
<published>2026-06-10T12:00:00+00:00</published>
<author><name>Canal Teste</name></author>
<media:group><media:description>Tutorial completo de claude code</media:description></media:group>
</entry>
<entry>
<yt:videoId>irrelevante1</yt:videoId>
<title>Receita de bolo de cenoura</title>
<published>2026-06-09T12:00:00+00:00</published>
<author><name>Canal Teste</name></author>
<media:group><media:description>Bolo fofinho em 20 minutos</media:description></media:group>
</entry>
</feed>`;

function montarFixture() {
  const raiz = mkdtempSync(join(tmpdir(), "canal-yt-"));
  mkdirSync(join(raiz, "canal-youtube", "pesquisa"), { recursive: true });
  writeFileSync(join(raiz, "canal-youtube", "criadores-monitorados.md"),
    `| Criador | Handle | Channel ID |\n|---|---|---|\n| Canal Teste | — | UCAAAAAAAAAAAAAAAAAAAAAA |\n`);
  writeFileSync(join(raiz, "canal-youtube", "pilares.md"),
    `## Ensinar Claude Code do zero\nPalavras-chave: claude code\n`);
  return raiz;
}

function mockYoutube() {
  return createServer((req, res) => {
    if (req.url.includes("/feeds/videos.xml")) {
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end(RSS_DUAS_ENTRADAS);
    } else if (req.url.startsWith("/watch")) {
      const porta = req.socket.localPort;
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<html><script>var x = {"captionTracks":[{"baseUrl":"http://127.0.0.1:${porta}/timedtext","languageCode":"pt"}]};</script></html>`);
    } else if (req.url.startsWith("/timedtext")) {
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end(`<transcript><text start="0.0">Falando sobre claude code</text></transcript>`);
    } else { res.writeHead(404).end(); }
  });
}

test("checarCriadores grava na fila só o vídeo relevante e ignora o irrelevante", async () => {
  const raiz = montarFixture();
  const srv = mockYoutube();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;

  const r1 = await checarCriadores({ raiz, baseUrl });
  assert.equal(r1.relevantes.length, 1);
  assert.equal(r1.relevantes[0].videoId, "relevante01");

  const fila = readFileSync(join(raiz, "canal-youtube", "pesquisa", "fila.md"), "utf8");
  assert.match(fila, /Como usar Claude Code do zero/);
  assert.doesNotMatch(fila, /Receita de bolo de cenoura/);

  srv.close();
});

test("checarCriadores não reprocessa vídeo já visto numa segunda chamada", async () => {
  const raiz = montarFixture();
  const srv = mockYoutube();
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;

  await checarCriadores({ raiz, baseUrl });
  const r2 = await checarCriadores({ raiz, baseUrl });
  assert.equal(r2.relevantes.length, 0);

  srv.close();
});

test("checarCriadores segue mesmo se um criador falhar (RSS indisponível)", async () => {
  const raiz = mkdtempSync(join(tmpdir(), "canal-yt-"));
  mkdirSync(join(raiz, "canal-youtube", "pesquisa"), { recursive: true });
  writeFileSync(join(raiz, "canal-youtube", "criadores-monitorados.md"),
    `| Criador | Handle | Channel ID |\n|---|---|---|\n| Canal Quebrado | — | UCBBBBBBBBBBBBBBBBBBBBBB |\n`);
  writeFileSync(join(raiz, "canal-youtube", "pilares.md"), `## Pilar\nPalavras-chave: x\n`);
  const srv = createServer((req, res) => res.writeHead(500).end());
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;

  const r = await checarCriadores({ raiz, baseUrl });
  assert.equal(r.relevantes.length, 0);
  assert.equal(r.totalCriadores, 1);

  srv.close();
});
