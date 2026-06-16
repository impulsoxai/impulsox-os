#!/usr/bin/env node
/**
 * publicar-linkedin.mjs — publica uma peça do /post na página de empresa do LinkedIn.
 * ImpulsoX AI. LinkedIn Posts API (/rest/posts). Diferente da Meta: sobe o binário DIRETO
 * (initializeUpload -> PUT -> referencia a URN), sem Fal CDN. Dry-run por padrão; --confirmar.
 * LINKEDIN_TOKEN NUNCA em log ou erro.
 *
 * v1: post (imagem única) + carrossel (multi-imagem). Vídeo e documento PDF = v2.
 * Uso: node scripts/publicar-linkedin.mjs --peca producao/posts/<slug> --tipo post|carrossel [--confirmar]
 */
import { readFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { registrarPasso } from "./registrar-passo.mjs";
import { detectarMidia, lerLegenda } from "./lib-peca.mjs";
import { semToken } from "./lib-graph.mjs";

export { detectarMidia, lerLegenda };

// normaliza o ID da organização pra URN (aceita numérico ou URN completa)
export function orgUrn(orgId) {
  return /^urn:li:organization:/.test(orgId) ? orgId : `urn:li:organization:${orgId}`;
}

// conteúdo do post por tipo (URNs de imagem já subidas). carrossel = multiImage; post = media única.
export function conteudoLinkedin(tipo, urns) {
  if (tipo === "carrossel") return { multiImage: { images: urns.map((id) => ({ id })) } };
  return { media: { id: urns[0] } };
}

// corpo do POST /rest/posts (página de empresa, público).
export function corpoPost(autorUrn, caption, content) {
  return {
    author: autorUrn,
    commentary: caption,
    visibility: "PUBLIC",
    distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
    content,
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };
}

function headersLi(token, version) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "LinkedIn-Version": version,
    "X-Restli-Protocol-Version": "2.0.0",
  };
}

// sobe uma imagem: initializeUpload -> PUT do binário -> devolve a URN da imagem.
async function subirImagem(base, autorUrn, token, caminho, version) {
  const init = await fetch(`${base}/rest/images?action=initializeUpload`, {
    method: "POST", headers: headersLi(token, version),
    body: JSON.stringify({ initializeUploadRequest: { owner: autorUrn } }),
  });
  const iTxt = await init.text();
  if (!init.ok) throw new Error(`LinkedIn initializeUpload HTTP ${init.status}: ${semToken(iTxt, token).slice(0, 200)}`);
  let ij; try { ij = JSON.parse(iTxt); } catch { throw new Error(`LinkedIn: resposta inválida no initializeUpload. ${semToken(iTxt, token).slice(0, 200)}`); }
  const uploadUrl = ij?.value?.uploadUrl;
  const urn = ij?.value?.image;
  if (!uploadUrl || !urn) throw new Error(`LinkedIn: initializeUpload sem uploadUrl/image. ${semToken(iTxt, token).slice(0, 200)}`);
  const put = await fetch(uploadUrl, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: readFileSync(caminho) });
  if (!put.ok) throw new Error(`LinkedIn upload da imagem HTTP ${put.status}.`);
  return urn;
}

// publica na página de empresa. Devolve {id (URN do post), permalink, tipo}.
export async function publicarNoLinkedin({ org, token, tipo, caminhos, caption,
  base = process.env.LINKEDIN_BASE_URL || "https://api.linkedin.com",
  version = process.env.LINKEDIN_VERSION || "202509" }) {
  const autor = orgUrn(org);
  const urns = [];
  for (const c of caminhos) urns.push(await subirImagem(base, autor, token, c, version));
  const corpo = corpoPost(autor, caption, conteudoLinkedin(tipo, urns));
  const r = await fetch(`${base}/rest/posts`, { method: "POST", headers: headersLi(token, version), body: JSON.stringify(corpo) });
  const txt = await r.text();
  if (!r.ok) throw new Error(`LinkedIn /posts HTTP ${r.status}: ${semToken(txt, token).slice(0, 200)}`);
  const postUrn = r.headers.get("x-restli-id") || r.headers.get("x-linkedin-id") || "";
  const permalink = postUrn ? `https://www.linkedin.com/feed/update/${postUrn}` : "https://www.linkedin.com/company/";
  return { id: postUrn, permalink, tipo };
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
  if (tipo === "reel") falhar("LinkedIn: vídeo ainda não suportado (v2). Use post ou carrossel.");
  if (!["carrossel", "post"].includes(tipo)) falhar("--tipo inválido no LinkedIn (use post ou carrossel).");

  let midia, caption;
  try { midia = detectarMidia(pecaDir, tipo); caption = lerLegenda(pecaDir); }
  catch (e) { falhar(e.message); }

  const org = process.env.LINKEDIN_ORG_ID;
  const token = process.env.LINKEDIN_TOKEN;
  if (!org || !token) falhar("defina LINKEDIN_ORG_ID e LINKEDIN_TOKEN no .env.");

  if (!confirmar) {
    console.log(JSON.stringify({
      dry_run: true, tipo, organizacao: orgUrn(org), midias: midia.length,
      arquivos: midia.map((m) => m.split(/[\\/]/).pop()),
      legenda_preview: caption.slice(0, 80), nota: "rode de novo com --confirmar pra publicar de verdade.",
    }, null, 2));
    process.exit(0);
  }

  (async () => {
    try {
      registrarPasso({ skill: "/publicar", etapa: `publicando no LinkedIn (${tipo})`, status: "inicio" });
      console.log("Subindo imagem(ns) pro LinkedIn...");
      const r = await publicarNoLinkedin({ org, token, tipo, caminhos: midia, caption });
      const raiz = process.cwd();
      const pub = join(raiz, "producao", "publicacoes.md");
      mkdirSync(dirname(pub), { recursive: true });
      if (!existsSync(pub)) appendFileSync(pub, "# Publicações\n\n| Data | Canal | Link |\n|---|---|---|\n");
      appendFileSync(pub, `| ${new Date().toISOString().slice(0, 10)} | linkedin | ${r.permalink} |\n`);
      registrarPasso({ skill: "/publicar", etapa: `publicado no LinkedIn: ${r.permalink}`, status: "ok" });
      console.log(JSON.stringify({ ok: true, ...r }, null, 2));
    } catch (e) {
      registrarPasso({ skill: "/publicar", etapa: "falha ao publicar no LinkedIn", status: "erro" });
      falhar(e.message);
    }
  })();
}
