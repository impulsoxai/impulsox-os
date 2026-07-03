#!/usr/bin/env node
/**
 * publicar-instagram.mjs — publica uma peça do /post no Instagram (Graph API).
 * ImpulsoX AI. Mídia hospedada no Fal CDN. Dry-run por padrão; --confirmar publica.
 * Tokens (META_TOKEN_PAGINA, FAL_KEY) NUNCA em log ou erro.
 */
import { existsSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { registrarPasso } from "./registrar-passo.mjs";
import { detectarMidia, lerLegenda } from "./lib-peca.mjs";
import { graphPost, graphGet } from "./lib-graph.mjs";

// re-export: testes e outros módulos importam a leitura de peça pelo conector (compat)
export { detectarMidia, lerLegenda };

// Monta o corpo do POST /{ig}/media por tipo. Graph API quer strings nos params.
// carrossel: chamar com {url, filho:true} pra cada filho; depois {urls:[ids], caption} pro pai.
export function payloadContainer(tipo, { url, urls, caption, filho } = {}) {
  if (tipo === "reel") return { media_type: "REELS", video_url: url, caption };
  if (tipo === "post") return { image_url: url, caption };
  if (filho) return { image_url: url, is_carousel_item: "true" };
  return { media_type: "CAROUSEL", children: urls.join(","), caption };
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

  const ig = process.env.IG_USUARIO_ID;
  const token = process.env.META_TOKEN_PAGINA;
  if (!ig || !token) falhar("defina IG_USUARIO_ID e META_TOKEN_PAGINA no .env.");

  if (!confirmar) {
    console.log(JSON.stringify({
      dry_run: true, tipo, conta: ig, midias: midia.length,
      arquivos: midia.map((m) => m.split(/[\\/]/).pop()),
      legenda_preview: caption.slice(0, 80), nota: "rode de novo com --confirmar pra publicar de verdade.",
    }, null, 2));
    process.exit(0);
  }

  (async () => {
    try {
      registrarPasso({ skill: "/publicar", etapa: `publicando no Instagram (${tipo})`, status: "inicio" });
      console.log("Subindo mídia pro Fal CDN...");
      const { uploadParaFalCDN } = await import("./lib-fal-upload.mjs");
      const urls = [];
      for (const m of midia) urls.push(await uploadParaFalCDN(m));
      console.log("Publicando no Instagram...");
      const r = await publicarNoInstagram({ ig, token, tipo, urls, caption });
      const raiz = process.cwd();
      const pub = join(raiz, "producao", "publicacoes.md");
      mkdirSync(dirname(pub), { recursive: true });
      if (!existsSync(pub)) appendFileSync(pub, "# Publicações\n\n| Data | Canal | Link |\n|---|---|---|\n");
      appendFileSync(pub, `| ${new Date().toISOString().slice(0, 10)} | instagram | ${r.permalink} |\n`);
      // Registro CANÔNICO do loop de medição: slug como chave + media_id + a meta da peça
      // (bloco --- do legenda.md). É o que o metricas-instagram.mjs e o /desempenho leem —
      // valida mecânica/fórmula sem join manual de 3 arquivos.
      const { lerMetaDaPeca } = await import("./lib-peca.mjs");
      const meta = lerMetaDaPeca(pecaDir);
      const slug = meta.slug || pecaDir.replace(/[\\/]+$/, "").split(/[\\/]/).pop();
      const campos = ["formato", "objetivo", "mecanica", "formula", "capa", "nota-revisar", "origem"]
        .map((k) => `${k}=${meta[k] ?? (k === "formato" ? tipo : "-")}`).join("; ");
      appendFileSync(pub, `IG ${slug}: id=${r.id}; data=${new Date().toISOString().slice(0, 10)}; ${campos}; link=${r.permalink}\n`);
      registrarPasso({ skill: "/publicar", etapa: `publicado no Instagram: ${r.permalink}`, status: "ok" });
      console.log(JSON.stringify({ ok: true, ...r }, null, 2));
    } catch (e) {
      registrarPasso({ skill: "/publicar", etapa: "falha ao publicar no Instagram", status: "erro" });
      falhar(e.message);
    }
  })();
}
