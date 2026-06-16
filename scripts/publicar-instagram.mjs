#!/usr/bin/env node
/**
 * publicar-instagram.mjs — publica uma peça do /post no Instagram (Graph API).
 * ImpulsoX AI. Mídia hospedada no Fal CDN. Dry-run por padrão; --confirmar publica.
 * Tokens (META_TOKEN_PAGINA, FAL_KEY) NUNCA em log ou erro.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

// Detecta a mídia da peça por tipo. Lança Error (chamador trata).
export function detectarMidia(dir, tipo) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Error(`pasta da peça não encontrada: ${dir}`);
  const arqs = readdirSync(dir);
  if (tipo === "carrossel") {
    const slides = arqs.filter((a) => /^slide-\d+\.png$/i.test(a)).sort();
    if (slides.length < 2 || slides.length > 10) throw new Error(`carrossel precisa de 2 a 10 slides (achei ${slides.length}).`);
    return slides.map((a) => join(dir, a));
  }
  if (tipo === "reel") {
    const mp4 = arqs.filter((a) => /\.mp4$/i.test(a)).sort();
    if (mp4.length === 0) throw new Error("nenhum vídeo .mp4 na pasta da peça (reel).");
    return [join(dir, mp4[0])];
  }
  const pngs = arqs.filter((a) => /\.png$/i.test(a)).sort();
  if (pngs.length === 0) throw new Error("nenhuma imagem .png na pasta da peça (post).");
  return [join(dir, pngs[0])];
}

export function lerLegenda(dir) {
  const caminho = join(dir, "legenda.md");
  const txt = existsSync(caminho) ? readFileSync(caminho, "utf8").trim() : "";
  if (!txt) throw new Error("legenda vazia ou legenda.md ausente na pasta da peça.");
  return txt;
}

// Monta o corpo do POST /{ig}/media por tipo. Graph API quer strings nos params.
// carrossel: chamar com {url, filho:true} pra cada filho; depois {urls:[ids], caption} pro pai.
export function payloadContainer(tipo, { url, urls, caption, filho } = {}) {
  if (tipo === "reel") return { media_type: "REELS", video_url: url, caption };
  if (tipo === "post") return { image_url: url, caption };
  if (filho) return { image_url: url, is_carousel_item: "true" };
  return { media_type: "CAROUSEL", children: urls.join(","), caption };
}

// remove o token de qualquer texto de erro (defesa: nunca vazar credencial)
function semToken(txt, token) { return token ? String(txt).split(token).join("***") : String(txt); }

async function graphPost(base, path, params, token) {
  const body = new URLSearchParams({ ...params, access_token: token });
  const r = await fetch(`${base}/${path}`, { method: "POST", body });
  const txt = await r.text();
  let j; try { j = JSON.parse(txt); } catch { throw new Error(`Graph: resposta inválida. ${semToken(txt, token).slice(0, 200)}`); }
  if (!r.ok || j.error) throw new Error(`Graph erro: ${semToken(JSON.stringify(j.error || j), token).slice(0, 200)}`);
  return j;
}

async function graphGet(base, path, query, token) {
  const qs = new URLSearchParams({ ...query, access_token: token });
  const r = await fetch(`${base}/${path}?${qs}`);
  const txt = await r.text();
  let j; try { j = JSON.parse(txt); } catch { throw new Error(`Graph: resposta inválida. ${semToken(txt, token).slice(0, 200)}`); }
  if (!r.ok || j.error) throw new Error(`Graph erro: ${semToken(JSON.stringify(j.error || j), token).slice(0, 200)}`);
  return j;
}

// orquestra o fluxo 2-passos (container -> media_publish) por tipo. Devolve {id, permalink, tipo}.
export async function publicarNoInstagram({ ig, token, tipo, urls, caption, graphBase = process.env.GRAPH_BASE_URL || "https://graph.facebook.com/v21.0" }) {
  let creationId;
  if (tipo === "carrossel") {
    const filhos = [];
    for (const url of urls) {
      const c = await graphPost(graphBase, `${ig}/media`, payloadContainer("carrossel", { url, filho: true }), token);
      filhos.push(c.id);
    }
    const pai = await graphPost(graphBase, `${ig}/media`, payloadContainer("carrossel", { urls: filhos, caption }), token);
    creationId = pai.id;
  } else {
    const c = await graphPost(graphBase, `${ig}/media`, payloadContainer(tipo, { url: urls[0], caption }), token);
    creationId = c.id;
    if (tipo === "reel") {
      let pronto = false;
      for (let t = 0; t < 60; t++) {
        const s = await graphGet(graphBase, creationId, { fields: "status_code" }, token);
        if (s.status_code === "FINISHED") { pronto = true; break; }
        if (s.status_code === "ERROR") throw new Error("Instagram: processamento do reel falhou.");
        await new Promise((r) => setTimeout(r, 5000));
      }
      if (!pronto) throw new Error("Instagram: reel não ficou pronto a tempo (timeout).");
    }
  }
  const pub = await graphPost(graphBase, `${ig}/media_publish`, { creation_id: creationId }, token);
  const info = await graphGet(graphBase, pub.id, { fields: "permalink" }, token);
  return { id: pub.id, permalink: info.permalink, tipo };
}
