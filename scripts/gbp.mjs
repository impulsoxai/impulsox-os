#!/usr/bin/env node
/**
 * gbp.mjs — Google Meu Negócio (Business Profile API): cria post local e responde avaliação.
 * ImpulsoX AI. OAuth2 (refresh token -> access token). Dry-run por padrão; --confirmar publica.
 * Segredos (access_token, client_secret, refresh_token) NUNCA em log ou erro.
 *
 * Uso:
 *   node scripts/gbp.mjs --acao post --texto "..." [--cta URL] [--imagem foto.png] [--topico STANDARD|OFFER] [--confirmar]
 *   node scripts/gbp.mjs --acao post --peca producao/posts/<slug> [--confirmar]   (texto = legenda.md)
 *   node scripts/gbp.mjs --acao responder --review accounts/A/locations/L/reviews/R --resposta "..."|@arquivo [--confirmar]
 *
 * Resposta a avaliação NEGATIVA: o /local exige leitura humana antes — nunca automática no escuro.
 */
import { readFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { registrarPasso } from "./registrar-passo.mjs";
import { lerLegenda } from "./lib-peca.mjs";
import { semToken } from "./lib-graph.mjs";

// corpo do LocalPost (pure). topico: STANDARD|OFFER|EVENT|ALERT.
export function corpoPostGbp({ summary, ctaUrl, mediaUrl, topico = "STANDARD", idioma = "pt-BR" }) {
  const corpo = { languageCode: idioma, summary, topicType: topico };
  if (ctaUrl) corpo.callToAction = { actionType: "LEARN_MORE", url: ctaUrl };
  if (mediaUrl) corpo.media = [{ mediaFormat: "PHOTO", sourceUrl: mediaUrl }];
  return corpo;
}

// troca o refresh token por um access token. Devolve a string do access_token.
export async function obterTokenGoogle({ clientId, clientSecret, refreshToken,
  tokenUrl = process.env.GBP_TOKEN_URL || "https://oauth2.googleapis.com/token" }) {
  if (!clientId || !clientSecret || !refreshToken) throw new Error("credenciais do Google ausentes (GBP_CLIENT_ID/SECRET/REFRESH_TOKEN).");
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
  const r = await fetch(tokenUrl, { method: "POST", body });
  const txt = await r.text();
  let j; try { j = JSON.parse(txt); } catch { throw new Error("Google OAuth: resposta inválida."); }
  if (!r.ok || !j.access_token) throw new Error(`Google OAuth falhou: ${semToken(JSON.stringify(j), clientSecret).slice(0, 150)}`);
  return j.access_token;
}

// chamada autenticada à Business Profile API. Redige o token em erros.
async function gbpFetch(apiBase, method, path, token, body) {
  const r = await fetch(`${apiBase}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const txt = await r.text();
  let j; try { j = txt ? JSON.parse(txt) : {}; } catch { throw new Error(`GBP: resposta inválida. ${semToken(txt, token).slice(0, 200)}`); }
  if (!r.ok || j.error) throw new Error(`GBP erro: ${semToken(JSON.stringify(j.error || j), token).slice(0, 200)}`);
  return j;
}

// cria um post local. location = "accounts/A/locations/L".
export async function criarPostLocal({ apiBase = process.env.GBP_API_BASE || "https://mybusiness.googleapis.com/v4", token, location, corpo }) {
  const j = await gbpFetch(apiBase, "POST", `${location}/localPosts`, token, corpo);
  return { name: j.name || "", searchUrl: j.searchUrl || "" };
}

// responde uma avaliação. reviewName = "accounts/A/locations/L/reviews/R".
export async function responderAvaliacao({ apiBase = process.env.GBP_API_BASE || "https://mybusiness.googleapis.com/v4", token, reviewName, comentario }) {
  return gbpFetch(apiBase, "PUT", `${reviewName}/reply`, token, { comment: comentario });
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const acao = flag("--acao");
  const confirmar = has("--confirmar");
  const creds = {
    clientId: process.env.GBP_CLIENT_ID, clientSecret: process.env.GBP_CLIENT_SECRET,
    refreshToken: process.env.GBP_REFRESH_TOKEN,
  };
  const location = process.env.GBP_LOCATION_ID;
  if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) falhar("defina GBP_CLIENT_ID, GBP_CLIENT_SECRET e GBP_REFRESH_TOKEN no .env.");

  if (acao === "post") {
    const peca = flag("--peca");
    let texto = flag("--texto");
    if (!texto && peca) { try { texto = lerLegenda(peca); } catch (e) { falhar(e.message); } }
    if (!texto) falhar("informe --texto ou --peca (com legenda.md).");
    if (!location) falhar("defina GBP_LOCATION_ID no .env (accounts/A/locations/L).");
    const cta = flag("--cta"); const topico = flag("--topico") || "STANDARD"; const imagem = flag("--imagem");

    if (!confirmar) {
      console.log(JSON.stringify({ dry_run: true, acao: "post", location, topico, tem_cta: !!cta, tem_imagem: !!imagem, texto_preview: texto.slice(0, 100), nota: "rode com --confirmar pra publicar." }, null, 2));
      process.exit(0);
    }
    (async () => {
      try {
        registrarPasso({ skill: "/local", etapa: "publicando post no Google Meu Negócio", status: "inicio" });
        const token = await obterTokenGoogle(creds);
        let mediaUrl;
        if (imagem) { const { uploadParaFalCDN } = await import("./lib-fal-upload.mjs"); mediaUrl = await uploadParaFalCDN(imagem); }
        const r = await criarPostLocal({ token, location, corpo: corpoPostGbp({ summary: texto, ctaUrl: cta, mediaUrl, topico }) });
        const raiz = process.cwd();
        const pub = join(raiz, "producao", "publicacoes.md");
        mkdirSync(dirname(pub), { recursive: true });
        if (!existsSync(pub)) appendFileSync(pub, "# Publicações\n\n| Data | Canal | Link |\n|---|---|---|\n");
        appendFileSync(pub, `| ${new Date().toISOString().slice(0, 10)} | google-meu-negocio | ${r.searchUrl || r.name} |\n`);
        registrarPasso({ skill: "/local", etapa: "post publicado no Google Meu Negócio", status: "ok" });
        console.log(JSON.stringify({ ok: true, ...r }, null, 2));
      } catch (e) { registrarPasso({ skill: "/local", etapa: "falha ao publicar no Google Meu Negócio", status: "erro" }); falhar(e.message); }
    })();
  } else if (acao === "responder") {
    const reviewName = flag("--review");
    let resposta = flag("--resposta");
    if (resposta && resposta.startsWith("@")) { try { resposta = readFileSync(resposta.slice(1), "utf8").trim(); } catch (e) { falhar(e.message); } }
    if (!reviewName || !resposta) falhar("informe --review <accounts/A/locations/L/reviews/R> e --resposta <texto|@arquivo>.");

    if (!confirmar) {
      console.log(JSON.stringify({ dry_run: true, acao: "responder", review: reviewName, resposta_preview: resposta.slice(0, 120), nota: "rode com --confirmar pra enviar a resposta." }, null, 2));
      process.exit(0);
    }
    (async () => {
      try {
        registrarPasso({ skill: "/local", etapa: "respondendo avaliação no Google", status: "inicio" });
        const token = await obterTokenGoogle(creds);
        await responderAvaliacao({ token, reviewName, comentario: resposta });
        registrarPasso({ skill: "/local", etapa: "avaliação respondida no Google", status: "ok" });
        console.log(JSON.stringify({ ok: true, review: reviewName }, null, 2));
      } catch (e) { registrarPasso({ skill: "/local", etapa: "falha ao responder avaliação no Google", status: "erro" }); falhar(e.message); }
    })();
  } else {
    falhar("--acao inválida (use post ou responder).");
  }
}
