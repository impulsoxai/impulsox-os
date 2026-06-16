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
