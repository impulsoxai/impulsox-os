import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { semToken, crmFromEnv, crmFetch, CrmError, getReports, createContact, receitaDeReports } from "./lib-crm.mjs";

// servidor mock do CRM: ecoa o que recebeu e responde pelo path
function mockCrm(handler) {
  return createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => handler(req, res, body));
  });
}
async function up(srv) { await new Promise((r) => srv.listen(0, "127.0.0.1", r)); return `http://127.0.0.1:${srv.address().port}`; }

test("semToken redige o token em qualquer texto", () => {
  assert.equal(semToken("erro com ixk_live_abc no meio", "ixk_live_abc"), "erro com *** no meio");
  assert.equal(semToken("sem token", ""), "sem token");
});

test("crmFromEnv exige CRM_BASE_URL e CRM_TOKEN", () => {
  assert.throws(() => crmFromEnv({}), /CRM_BASE_URL|CRM_TOKEN/);
  const c = crmFromEnv({ CRM_BASE_URL: "http://x/api", CRM_TOKEN: "ixk_live_k" });
  assert.equal(c.base, "http://x/api");
  assert.equal(c.token, "ixk_live_k");
});

test("crmFetch success:true devolve data", async () => {
  const srv = mockCrm((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: { receita6m: 12000 } }));
  });
  const base = await up(srv);
  const data = await crmFetch(base, "ixk_live_k", "GET", "/reports");
  assert.deepEqual(data, { receita6m: 12000 });
  srv.close();
});

test("crmFetch manda Authorization Bearer e o body", async () => {
  let seenAuth = null, seenBody = null;
  const srv = mockCrm((req, res) => {
    seenAuth = req.headers["authorization"]; seenBody = req.headers["content-type"];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: { ok: 1 } }));
  });
  const base = await up(srv);
  await createContact({ base, token: "ixk_live_k" }, { name: "Ana", channel: "site" });
  assert.equal(seenAuth, "Bearer ixk_live_k");
  assert.equal(seenBody, "application/json");
  srv.close();
});

test("crmFetch success:false vira CrmError SEM o token", async () => {
  const srv = mockCrm((req, res) => {
    // o CRM por engano ecoa o token no erro — a lib tem que redigir
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "sem scope (token ixk_live_k)" }));
  });
  const base = await up(srv);
  await assert.rejects(
    () => crmFetch(base, "ixk_live_k", "GET", "/reports"),
    (e) => {
      assert.ok(e instanceof CrmError);
      assert.equal(e.status, 403);
      assert.ok(!/ixk_live_k/.test(e.message), "token NAO pode aparecer no erro");
      return true;
    }
  );
  srv.close();
});

test("crmFetch mapeia 401/429 no status do CrmError", async () => {
  for (const code of [401, 429]) {
    const srv = mockCrm((req, res) => {
      res.writeHead(code, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "x" }));
    });
    const base = await up(srv);
    await assert.rejects(() => getReports({ base, token: "k" }), (e) => e.status === code);
    srv.close();
  }
});

test("receitaDeReports lê o shape {value} e tolera número cru", () => {
  assert.equal(receitaDeReports({ receitaTotal: { value: 7194 } }), 7194);  // shape real
  assert.equal(receitaDeReports({ receitaTotal: 5000 }), 5000);             // número cru
  assert.equal(receitaDeReports({}), 0);                                    // sem campo
  assert.equal(receitaDeReports(null), 0);
});

test("crmFetch resposta não-JSON vira CrmError legível", async () => {
  const srv = mockCrm((req, res) => { res.writeHead(502).end("Bad Gateway"); });
  const base = await up(srv);
  await assert.rejects(() => getReports({ base, token: "k" }), (e) => e instanceof CrmError && e.status === 502);
  srv.close();
});
