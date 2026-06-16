import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  parseFeedRSS, parseTimedText, extrairTrilhasLegenda, escolherTrilha,
  lerCriadores, lerPilares, classificarRelevancia, resolverChannelId,
  buscarFeedRSS, buscarTranscript,
} from "./lib-youtube.mjs";

const RSS_EXEMPLO = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
<entry>
<id>yt:video:abc12345678</id>
<yt:videoId>abc12345678</yt:videoId>
<yt:channelId>UCiGWNa6QK6CiKPvv5-YPv8g</yt:channelId>
<title>Como usar Claude Code do zero</title>
<published>2026-06-10T12:00:00+00:00</published>
<author><name>Canal Teste</name></author>
<media:group><media:description>Tutorial completo de claude code para iniciantes</media:description></media:group>
</entry>
<entry>
<id>yt:video:zzz98765432</id>
<yt:videoId>zzz98765432</yt:videoId>
<yt:channelId>UCiGWNa6QK6CiKPvv5-YPv8g</yt:channelId>
<title>Receita de bolo de cenoura</title>
<published>2026-06-09T12:00:00+00:00</published>
<author><name>Canal Teste</name></author>
<media:group><media:description>Bolo fofinho em 20 minutos</media:description></media:group>
</entry>
</feed>`;

const TIMEDTEXT_EXEMPLO = `<?xml version="1.0" encoding="utf-8" ?><transcript><text start="0.5" dur="2.3">Hello there</text><text start="2.8" dur="3.1">Welcome &amp; thanks</text></transcript>`;

// --- Task 2: parseFeedRSS ---

test("parseFeedRSS extrai videoId, titulo, descricao, publicado e canal de cada entry", () => {
  const entradas = parseFeedRSS(RSS_EXEMPLO);
  assert.equal(entradas.length, 2);
  assert.deepEqual(entradas[0], {
    videoId: "abc12345678",
    titulo: "Como usar Claude Code do zero",
    descricao: "Tutorial completo de claude code para iniciantes",
    publicado: "2026-06-10T12:00:00+00:00",
    canal: "Canal Teste",
  });
  assert.equal(entradas[1].videoId, "zzz98765432");
});

test("parseFeedRSS devolve lista vazia pra feed sem entry", () => {
  assert.deepEqual(parseFeedRSS("<feed></feed>"), []);
});

// --- Task 3: parseTimedText ---

test("parseTimedText extrai inicio e texto decodificado de cada bloco", () => {
  const blocos = parseTimedText(TIMEDTEXT_EXEMPLO);
  assert.deepEqual(blocos, [
    { inicio: 0.5, texto: "Hello there" },
    { inicio: 2.8, texto: "Welcome & thanks" },
  ]);
});

test("parseTimedText devolve lista vazia sem blocos <text>", () => {
  assert.deepEqual(parseTimedText("<transcript></transcript>"), []);
});

// --- Task 4: extrairTrilhasLegenda + escolherTrilha ---

const HTML_EXEMPLO = `<html><script>var ytInitialPlayerResponse = {"captions":{"playerCaptionsTracklistRenderer":{"captionTracks":[{"baseUrl":"https://www.youtube.com/api/timedtext?v=abc\\u0026lang=en","languageCode":"en","kind":"asr"},{"baseUrl":"https://www.youtube.com/api/timedtext?v=abc\\u0026lang=pt","languageCode":"pt"}]}}};</script></html>`;

test("extrairTrilhasLegenda lê as trilhas do captionTracks e decodifica a baseUrl", () => {
  const trilhas = extrairTrilhasLegenda(HTML_EXEMPLO);
  assert.equal(trilhas.length, 2);
  assert.equal(trilhas[0].idioma, "en");
  assert.equal(trilhas[0].gerada, true);
  assert.equal(trilhas[1].idioma, "pt");
  assert.equal(trilhas[1].gerada, false);
  assert.equal(trilhas[1].url, "https://www.youtube.com/api/timedtext?v=abc&lang=pt");
});

test("extrairTrilhasLegenda devolve [] quando a página não tem captionTracks", () => {
  assert.deepEqual(extrairTrilhasLegenda("<html></html>"), []);
});

test("escolherTrilha prioriza pt, depois en, depois a primeira disponível", () => {
  const trilhas = [{ idioma: "en", url: "u-en" }, { idioma: "pt", url: "u-pt" }];
  assert.equal(escolherTrilha(trilhas).url, "u-pt");
  assert.equal(escolherTrilha([{ idioma: "es", url: "u-es" }]).url, "u-es");
});

test("escolherTrilha lança erro claro quando não há nenhuma trilha", () => {
  assert.throws(() => escolherTrilha([]), /sem legenda/);
});

// --- Task 5: lerCriadores + lerPilares + classificarRelevancia ---

const CRIADORES_MD = `| Criador | Handle | Channel ID |
|---|---|---|
| Sabrina Ramonov | — | UCiGWNa6QK6CiKPvv5-YPv8g |
| Chase AI | @Chase-H-AI | (resolver) |
`;

test("lerCriadores devolve só linhas com Channel ID válido (UC + 22)", () => {
  const criadores = lerCriadores(CRIADORES_MD);
  assert.equal(criadores.length, 1);
  assert.deepEqual(criadores[0], { nome: "Sabrina Ramonov", handle: "—", channelId: "UCiGWNa6QK6CiKPvv5-YPv8g" });
});

const PILARES_MD = `# Pilares de conteúdo — canal

## Ensinar Claude Code do zero
Texto de contexto aqui.

Palavras-chave: claude code, anthropic, vibe coding

## Mostrar o ImpulsoX-OS rodando
Outro texto.

Palavras-chave: impulsox, sistema operacional de marketing
`;

test("lerPilares extrai nome e palavras-chave (minúsculas, sem espaço) de cada pilar", () => {
  const pilares = lerPilares(PILARES_MD);
  assert.equal(pilares.length, 2);
  assert.equal(pilares[0].nome, "Ensinar Claude Code do zero");
  assert.deepEqual(pilares[0].palavrasChave, ["claude code", "anthropic", "vibe coding"]);
  assert.equal(pilares[1].nome, "Mostrar o ImpulsoX-OS rodando");
});

test("classificarRelevancia acerta o pilar pela palavra-chave encontrada", () => {
  const pilares = lerPilares(PILARES_MD);
  const r = classificarRelevancia("Tutorial completo de Claude Code para iniciantes", pilares);
  assert.equal(r.relevante, true);
  assert.equal(r.pilar, "Ensinar Claude Code do zero");
  assert.equal(r.palavra, "claude code");
});

test("classificarRelevancia devolve relevante:false quando nenhuma palavra-chave bate", () => {
  const pilares = lerPilares(PILARES_MD);
  const r = classificarRelevancia("Receita de bolo de cenoura fofinho", pilares);
  assert.deepEqual(r, { relevante: false, pilar: null, palavra: null });
});

// --- Task 6: resolverChannelId ---

function mockCanalHtml(channelId) {
  return createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    // Formato real da página pública do YouTube: o Channel ID vem em "externalId".
    res.end(`<html><script>var x = {"externalId":"${channelId}"};</script></html>`);
  });
}

test("resolverChannelId acha o channelId na página pública do handle", async () => {
  const srv = mockCanalHtml("UCAAAAAAAAAAAAAAAAAAAAAA");
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const id = await resolverChannelId("@TesteAI", { baseUrl: base });
  assert.equal(id, "UCAAAAAAAAAAAAAAAAAAAAAA");
  srv.close();
});

test("resolverChannelId lança erro claro quando não acha channelId na página", async () => {
  const srv = createServer((req, res) => { res.writeHead(200).end("<html>sem nada aqui</html>"); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  await assert.rejects(() => resolverChannelId("@semcanal", { baseUrl: base }), /não achei o channelId/);
  srv.close();
});

// --- Task 7: buscarFeedRSS ---

test("buscarFeedRSS busca o RSS público do canal e devolve as entradas parseadas", async () => {
  const srv = createServer((req, res) => {
    if (req.url.includes("/feeds/videos.xml")) {
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end(RSS_EXEMPLO);
    } else { res.writeHead(404).end(); }
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const entradas = await buscarFeedRSS("UCiGWNa6QK6CiKPvv5-YPv8g", { baseUrl: base });
  assert.equal(entradas.length, 2);
  srv.close();
});

test("buscarFeedRSS lança erro claro em HTTP de erro", async () => {
  const srv = createServer((req, res) => { res.writeHead(404).end(); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  await assert.rejects(() => buscarFeedRSS("UCxxx", { baseUrl: base }), /RSS do canal/);
  srv.close();
});

// --- Task 8: buscarTranscript ---

test("buscarTranscript abre a página do vídeo, acha a trilha e baixa o timedtext", async () => {
  const srv = createServer(async (req, res) => {
    if (req.url.startsWith("/watch")) {
      const porta = req.socket.localPort;
      const trackUrl = `http://127.0.0.1:${porta}/timedtext?lang=pt`;
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<html><script>var x = {"captionTracks":[{"baseUrl":"${trackUrl}","languageCode":"pt"}]};</script></html>`);
    } else if (req.url.startsWith("/timedtext")) {
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end(TIMEDTEXT_EXEMPLO);
    } else { res.writeHead(404).end(); }
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const blocos = await buscarTranscript("abc12345678", { baseUrl: base });
  assert.equal(blocos.length, 2);
  assert.equal(blocos[0].texto, "Hello there");
  srv.close();
});

test("buscarTranscript lança erro claro quando o vídeo não tem legenda", async () => {
  const srv = createServer((req, res) => { res.writeHead(200).end("<html>sem captionTracks</html>"); });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  await assert.rejects(() => buscarTranscript("zzz", { baseUrl: base }), /sem legenda/);
  srv.close();
});
