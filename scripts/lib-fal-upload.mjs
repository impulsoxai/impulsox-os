// Sobe um arquivo local pro Fal CDN e devolve a URL pública (access_url).
// Lança Error (não process.exit) — o chamador trata. FAL_KEY/Bearer nunca em mensagem de erro.
import { readFileSync } from "node:fs";

const MIME = { mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", mp4: "audio/mp4",
  ogg: "audio/ogg", aac: "audio/aac", jpg: "image/jpeg", jpeg: "image/jpeg",
  png: "image/png", webp: "image/webp" };

export async function uploadParaFalCDN(caminho, opts = {}) {
  const falKey = opts.falKey ?? process.env.FAL_KEY;
  const restBase = opts.restBase ?? process.env.FAL_REST_BASE ?? "https://rest.alpha.fal.ai";
  if (!falKey) throw new Error("FAL_KEY não definida no ambiente (.env).");
  const ext = caminho.split(".").pop().toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const nome = caminho.split(/[\\/]/).pop();
  const tr = await fetch(`${restBase}/storage/auth/token?storage_type=fal-cdn-v3`, {
    method: "POST", headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" }, body: "{}",
  });
  const tTxt = await tr.text();
  if (!tr.ok) throw new Error(`Fal auth HTTP ${tr.status}: ${tTxt.slice(0, 200)}`);
  let tj; try { tj = JSON.parse(tTxt); } catch { throw new Error(`Fal auth: resposta inválida. ${tTxt.slice(0, 200)}`); }
  const form = new FormData();
  form.append("file", new Blob([readFileSync(caminho)], { type: mime }), nome);
  const ur = await fetch(`${tj.base_url}/files/upload`, {
    method: "POST", headers: { Authorization: `Bearer ${tj.token}` }, body: form,
  });
  const uTxt = await ur.text();
  if (!ur.ok) throw new Error(`Fal upload HTTP ${ur.status}: ${uTxt.slice(0, 200)}`);
  let uj; try { uj = JSON.parse(uTxt); } catch { throw new Error(`Fal upload: resposta inválida. ${uTxt.slice(0, 200)}`); }
  if (!uj.access_url) throw new Error(`Fal upload: URL não retornada. ${JSON.stringify(uj).slice(0, 200)}`);
  return uj.access_url;
}
