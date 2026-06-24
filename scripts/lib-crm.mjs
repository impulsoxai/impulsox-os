// lib-crm.mjs — ponte ImpulsoX-OS → ImpulsoX CRM v3 (API REST, envelope success/fail).
// Só transporte: não calcula nada (ROI/etc. é da skill). Auth por service token por tenant
// (Bearer ixk_live_...), um token por clone de cliente no .env. O token NUNCA aparece em
// erro/log (redigido). Nunca ler o Postgres direto — sempre pela API (isolamento por tenant).
// Segue o padrão de scripts/lib-graph.mjs.

// remove o token de qualquer texto (defesa: nunca vazar credencial)
export function semToken(txt, token) {
  return token ? String(txt).split(token).join("***") : String(txt);
}

// erro de transporte com o status HTTP — a skill decide o que fazer (429=espera, 401=avisa)
export class CrmError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "CrmError";
    this.status = status;
  }
}

// monta o cliente a partir do ambiente; erro claro se falta config
export function crmFromEnv(env = process.env) {
  const base = env.CRM_BASE_URL;
  const token = env.CRM_TOKEN;
  if (!base) throw new Error("CRM_BASE_URL faltando no .env (ex: https://crm.exemplo.com/api)");
  if (!token) throw new Error("CRM_TOKEN faltando no .env (service token ixk_live_... do tenant)");
  return { base: base.replace(/\/$/, ""), token };
}

// núcleo: 1 request, trata envelope, redige token, mapeia status → CrmError legível
export async function crmFetch(base, token, method, path, { query, body } = {}) {
  let url = `${base}${path}`;
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams(query);
    url += `?${qs}`;
  }
  const opts = { method, headers: { "Authorization": `Bearer ${token}` } };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  let r, txt;
  try {
    r = await fetch(url, opts);
    txt = await r.text();
  } catch (e) {
    throw new CrmError(0, `CRM inacessível: ${semToken(e.message, token).slice(0, 160)}`);
  }
  let j;
  try { j = JSON.parse(txt); } catch {
    // resposta não-JSON (ex: 502 do proxy) → erro com o status real
    throw new CrmError(r.status, `CRM: resposta inválida (${r.status}). ${semToken(txt, token).slice(0, 160)}`);
  }
  if (!r.ok || j.success === false) {
    const msg = semToken(j.error || JSON.stringify(j), token).slice(0, 200);
    throw new CrmError(r.status, `CRM erro ${r.status}: ${msg}`);
  }
  return j.data;
}

// helpers finos por recurso (só transporte; query/body passam direto)
export const listContacts  = (c, q) => crmFetch(c.base, c.token, "GET",  "/contacts", { query: q });
export const createContact = (c, b) => crmFetch(c.base, c.token, "POST", "/contacts", { body: b });
export const listDeals     = (c, q) => crmFetch(c.base, c.token, "GET",  "/deals",    { query: q });
export const listInvoices  = (c, q) => crmFetch(c.base, c.token, "GET",  "/invoices", { query: q });
export const getReports    = (c, q) => crmFetch(c.base, c.token, "GET",  "/reports",  { query: q });
export const importCsv     = (c, b) => crmFetch(c.base, c.token, "POST", "/csv",      { body: b });
