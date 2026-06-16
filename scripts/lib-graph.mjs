// lib-graph.mjs — helpers da Meta Graph API (Instagram + Facebook). Compartilhado pelos
// conectores de publicação. O access_token NUNCA aparece em mensagem de erro (redigido).

// remove o token de qualquer texto de erro (defesa: nunca vazar credencial)
export function semToken(txt, token) { return token ? String(txt).split(token).join("***") : String(txt); }

export async function graphPost(base, path, params, token) {
  const body = new URLSearchParams({ ...params, access_token: token });
  const r = await fetch(`${base}/${path}`, { method: "POST", body });
  const txt = await r.text();
  let j; try { j = JSON.parse(txt); } catch { throw new Error(`Graph: resposta inválida. ${semToken(txt, token).slice(0, 200)}`); }
  if (!r.ok || j.error) throw new Error(`Graph erro: ${semToken(JSON.stringify(j.error || j), token).slice(0, 200)}`);
  return j;
}

export async function graphGet(base, path, query, token) {
  const qs = new URLSearchParams({ ...query, access_token: token });
  const r = await fetch(`${base}/${path}?${qs}`);
  const txt = await r.text();
  let j; try { j = JSON.parse(txt); } catch { throw new Error(`Graph: resposta inválida. ${semToken(txt, token).slice(0, 200)}`); }
  if (!r.ok || j.error) throw new Error(`Graph erro: ${semToken(JSON.stringify(j.error || j), token).slice(0, 200)}`);
  return j;
}
