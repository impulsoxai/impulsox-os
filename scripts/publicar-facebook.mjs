#!/usr/bin/env node
/**
 * publicar-facebook.mjs — publica uma peça do /post na página do Facebook (Graph API).
 * ImpulsoX AI. Irmão do publicar-instagram: reusa lib-peca, lib-graph, lib-fal-upload.
 * Mídia hospedada no Fal CDN. Dry-run por padrão; --confirmar publica.
 * META_TOKEN_PAGINA / FAL_KEY NUNCA em log ou erro.
 *
 * Uso: node scripts/publicar-facebook.mjs --peca producao/posts/<slug> --tipo carrossel|post|reel [--confirmar]
 */
import { existsSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { registrarPasso } from "./registrar-passo.mjs";
import { detectarMidia, lerLegenda } from "./lib-peca.mjs";
import { graphPost, graphGet } from "./lib-graph.mjs";

export { detectarMidia, lerLegenda };

// payload por tipo na página FB. post -> foto única (/photos); reel -> vídeo (/videos).
export function payloadFacebook(tipo, { url, caption } = {}) {
  if (tipo === "reel") return { endpoint: "videos", params: { file_url: url, description: caption } };
  return { endpoint: "photos", params: { url, caption } };
}

// params do post de álbum (carrossel = multi-foto): message + attached_media[i] indexados.
export function paramsAlbum(caption, fbids) {
  const p = { message: caption };
  fbids.forEach((id, i) => { p[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id }); });
  return p;
}

async function permalinkDe(base, postId, token) {
  try {
    const j = await graphGet(base, postId, { fields: "permalink_url" }, token);
    return j.permalink_url || `https://facebook.com/${postId}`;
  } catch { return `https://facebook.com/${postId}`; }
}

// publica na página do Facebook. Devolve {id, permalink, tipo}.
export async function publicarNoFacebook({ page, token, tipo, urls, caption, graphBase = process.env.GRAPH_BASE_URL || "https://graph.facebook.com/v21.0" }) {
  let postId;
  if (tipo === "carrossel") {
    // álbum: sobe cada foto sem publicar (published:false) e amarra num post de feed
    const fbids = [];
    for (const url of urls) {
      const f = await graphPost(graphBase, `${page}/photos`, { url, published: "false" }, token);
      fbids.push(f.id);
    }
    const feed = await graphPost(graphBase, `${page}/feed`, paramsAlbum(caption, fbids), token);
    postId = feed.id;
  } else {
    const { endpoint, params } = payloadFacebook(tipo, { url: urls[0], caption });
    const r = await graphPost(graphBase, `${page}/${endpoint}`, params, token);
    postId = r.post_id || r.id;
  }
  const permalink = await permalinkDe(graphBase, postId, token);
  return { id: postId, permalink, tipo };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const pecaDir = flag("--peca");
  const tipo = flag("--tipo");
  const confirmar = has("--confirmar");

  if (!pecaDir) falhar("informe --peca <pasta da peça>.");
  if (!["carrossel", "post", "reel"].includes(tipo)) falhar("--tipo inválido (use carrossel, post ou reel).");

  let midia, caption;
  try { midia = detectarMidia(pecaDir, tipo); caption = lerLegenda(pecaDir); }
  catch (e) { falhar(e.message); }

  const page = process.env.META_PAGINA_ID;
  const token = process.env.META_TOKEN_PAGINA;
  if (!page || !token) falhar("defina META_PAGINA_ID e META_TOKEN_PAGINA no .env.");

  if (!confirmar) {
    console.log(JSON.stringify({
      dry_run: true, tipo, pagina: page, midias: midia.length,
      arquivos: midia.map((m) => m.split(/[\\/]/).pop()),
      legenda_preview: caption.slice(0, 80), nota: "rode de novo com --confirmar pra publicar de verdade.",
    }, null, 2));
    process.exit(0);
  }

  (async () => {
    try {
      registrarPasso({ skill: "/publicar", etapa: `publicando no Facebook (${tipo})`, status: "inicio" });
      console.log("Subindo mídia pro Fal CDN...");
      const { uploadParaFalCDN } = await import("./lib-fal-upload.mjs");
      const urls = [];
      for (const m of midia) urls.push(await uploadParaFalCDN(m));
      console.log("Publicando no Facebook...");
      const r = await publicarNoFacebook({ page, token, tipo, urls, caption });
      const raiz = process.cwd();
      const pub = join(raiz, "producao", "publicacoes.md");
      mkdirSync(dirname(pub), { recursive: true });
      if (!existsSync(pub)) appendFileSync(pub, "# Publicações\n\n| Data | Canal | Link |\n|---|---|---|\n");
      appendFileSync(pub, `| ${new Date().toISOString().slice(0, 10)} | facebook | ${r.permalink} |\n`);
      registrarPasso({ skill: "/publicar", etapa: `publicado no Facebook: ${r.permalink}`, status: "ok" });
      console.log(JSON.stringify({ ok: true, ...r }, null, 2));
    } catch (e) {
      registrarPasso({ skill: "/publicar", etapa: "falha ao publicar no Facebook", status: "erro" });
      falhar(e.message);
    }
  })();
}
