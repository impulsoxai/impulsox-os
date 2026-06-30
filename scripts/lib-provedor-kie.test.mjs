import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { submeterTarefaKie, aguardarResultadoKie } from "./lib-provedor-kie.mjs";
import { submeterTarefaVeoKie, aguardarResultadoVeoKie } from "./lib-provedor-kie.mjs";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { uploadParaKieAPI } from "./lib-provedor-kie.mjs";

function mockKie(handler) {
  const srv = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => handler(req, body ? JSON.parse(body) : {}, res));
  });
  return new Promise((resolve) => srv.listen(0, "127.0.0.1", () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` })));
}

test("submeterTarefaKie: POST createTask, devolve taskId", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    assert.equal(req.url, "/api/v1/jobs/createTask");
    assert.equal(req.headers.authorization, "Bearer test-key");
    assert.equal(payload.model, "nano-banana-2");
    assert.deepEqual(payload.input, { prompt: "x" });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, msg: "success", data: { taskId: "task_123" } }));
  });
  const taskId = await submeterTarefaKie({
    kieKey: "test-key", base: url, model: "nano-banana-2", input: { prompt: "x" },
  });
  srv.close();
  assert.equal(taskId, "task_123");
});

test("submeterTarefaKie: erro HTTP lança com código", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    res.writeHead(402, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 402, msg: "Insufficient Credits" }));
  });
  await assert.rejects(
    () => submeterTarefaKie({ kieKey: "k", base: url, model: "x", input: {} }),
    /402|Insufficient Credits/
  );
  srv.close();
});

test("aguardarResultadoKie: polla até success, devolve resultUrls", async () => {
  let chamadas = 0;
  const { srv, url } = await mockKie((req, payload, res) => {
    chamadas++;
    res.writeHead(200, { "content-type": "application/json" });
    if (chamadas < 2) {
      res.end(JSON.stringify({ code: 200, data: { taskId: "task_123", state: "generating" } }));
    } else {
      res.end(JSON.stringify({
        code: 200,
        data: { taskId: "task_123", state: "success", resultJson: JSON.stringify({ resultUrls: ["https://x/img.png"] }) },
      }));
    }
  });
  const r = await aguardarResultadoKie({ kieKey: "k", base: url, taskId: "task_123", intervaloMs: 10, timeoutMs: 2000 });
  srv.close();
  assert.deepEqual(r.resultUrls, ["https://x/img.png"]);
});

test("aguardarResultadoKie: state fail lança com failMsg", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, data: { taskId: "task_123", state: "fail", failMsg: "content policy" } }));
  });
  await assert.rejects(
    () => aguardarResultadoKie({ kieKey: "k", base: url, taskId: "task_123", intervaloMs: 10, timeoutMs: 2000 }),
    /content policy/
  );
  srv.close();
});

test("submeterTarefaVeoKie: POST /api/v1/veo/generate, devolve taskId", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    assert.equal(req.url, "/api/v1/veo/generate");
    assert.equal(payload.model, "veo3_fast");
    assert.equal(payload.prompt, "a dog running");
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, msg: "success", data: { taskId: "veo_task_1" } }));
  });
  const taskId = await submeterTarefaVeoKie({
    kieKey: "k", base: url, prompt: "a dog running", model: "veo3_fast", aspect_ratio: "9:16", resolution: "1080p",
  });
  srv.close();
  assert.equal(taskId, "veo_task_1");
});

test("aguardarResultadoVeoKie: successFlag 1, devolve resultUrls", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, data: { taskId: "veo_task_1", successFlag: 1, response: { resultUrls: ["https://x/v.mp4"] } } }));
  });
  const r = await aguardarResultadoVeoKie({ kieKey: "k", base: url, taskId: "veo_task_1", intervaloMs: 10, timeoutMs: 2000 });
  srv.close();
  assert.deepEqual(r.resultUrls, ["https://x/v.mp4"]);
});

test("aguardarResultadoVeoKie: successFlag 2 (failed) lança erro", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, data: { taskId: "veo_task_1", successFlag: 2 } }));
  });
  await assert.rejects(
    () => aguardarResultadoVeoKie({ kieKey: "k", base: url, taskId: "veo_task_1", intervaloMs: 10, timeoutMs: 2000 }),
    /falhou|failed/i
  );
  srv.close();
});

test("uploadParaKieAPI: sobe base64 e devolve URL pública", async () => {
  const { srv, url } = await mockKie((req, payload, res) => {
    assert.equal(req.url, "/api/file-base64-upload");
    assert.ok(payload.base64Data.startsWith("data:"));
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, data: { downloadUrl: "https://kie.cdn/x.png" } }));
  });
  const dir = mkdtempSync(join(tmpdir(), "kie-up-"));
  const f = join(dir, "ref.png");
  writeFileSync(f, "PNGDATA");
  const result = await uploadParaKieAPI(f, { kieKey: "k", base: url });
  srv.close();
  assert.equal(result, "https://kie.cdn/x.png");
});

test("uploadParaKieAPI sem KIE_KEY lança erro claro", async () => {
  await assert.rejects(
    () => uploadParaKieAPI("x.png", { kieKey: "" }),
    /KIE_KEY/
  );
});