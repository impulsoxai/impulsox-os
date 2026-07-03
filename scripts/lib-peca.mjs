// lib-peca.mjs — lê a mídia e a legenda de uma peça do /post (pasta producao/posts/<slug>).
// Compartilhado pelos conectores de publicação (Instagram, Facebook). Funções puras, lançam Error.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

// Detecta a mídia da peça por tipo. carrossel: slide-*.png (2-10) · post: 1 png · reel: 1 mp4.
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
  // a legenda publicável é o corpo SEM o bloco de meta (se houver)
  return removerMeta(txt);
}

// Bloco de meta da peça: frontmatter simples no TOPO do legenda.md, entre linhas `---`.
// É a chave canônica do loop de medição (slug, formato, objetivo, mecânica, fórmula,
// capa, nota do /revisar, origem pulso/radar). Parse tolerante: key: value por linha.
export function lerMetaPeca(texto) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(texto).trim());
  if (!m) return {};
  const meta = {};
  for (const linha of m[1].split(/\r?\n/)) {
    const kv = /^([\w-]+)\s*:\s*(.+)$/.exec(linha.trim());
    if (kv) meta[kv[1].toLowerCase()] = kv[2].trim();
  }
  return meta;
}

export function removerMeta(texto) {
  return String(texto).trim().replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
}

// Lê a meta direto da pasta da peça (legenda.md pode não existir → {}).
export function lerMetaDaPeca(dir) {
  const caminho = join(dir, "legenda.md");
  if (!existsSync(caminho)) return {};
  return lerMetaPeca(readFileSync(caminho, "utf8"));
}
