#!/usr/bin/env node
/**
 * publicar-youtube.mjs — sobe final.mp4 (short ou longo) pro YouTube como PRIVADO, com
 * metadados confirmados. Auto via OAuth (refresh_token); assistido (pacote pro Studio) sem
 * credencial. Dry-run por padrão; --confirmar sobe. ImpulsoX AI. Data API v3.
 * YT_REFRESH_TOKEN/secret NUNCA em log ou erro.
 *
 * Uso: node scripts/publicar-youtube.mjs --slug vivian --titulo "..." --descricao "..." \
 *        --tags "a,b" [--privacidade private|unlisted|public] [--thumb capa.png] [--confirmar]
 */
import { readFileSync, existsSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { registrarPasso } from "./registrar-passo.mjs";
import { detectarShort, montarMetadados, validarUpload, montarPacoteAssistido } from "./lib-youtube-upload.mjs";

const FFPROBE = process.env.FFPROBE_BIN || "ffprobe";

// Resumo do dry-run — função pura, testável.
export function montarPlano({ slug, final, titulo, descricao, tags, privacidade, ehShort, temCredencial }) {
  return {
    dry_run: true, slug, final, titulo, privacidade, ehShort,
    modo: temCredencial ? "automático" : "assistido",
    tags, descricaoPreview: (descricao || "").slice(0, 80),
    nota: "rode de novo com --confirmar pra subir de verdade.",
  };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

// ffprobe → {largura, altura, duracaoSeg}. Isola a leitura de mídia.
function sondarVideo(arquivo) {
  const r = spawnSync(FFPROBE, ["-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", arquivo], { encoding: "utf8" });
  const linhas = (r.stdout || "").trim().split("\n");
  return { largura: Number(linhas[0]) || 0, altura: Number(linhas[1]) || 0, duracaoSeg: Number(linhas[2]) || 0 };
}

// Troca refresh_token por access_token (OAuth2). Token nunca volta em erro legível.
async function obterAccessToken({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!r.ok) throw new Error(`OAuth falhou (HTTP ${r.status}) — refresh_token pode ter expirado; reautorize pelo guia.`);
  const j = await r.json();
  if (!j.access_token) throw new Error("OAuth não devolveu access_token — reautorize pelo guia.");
  return j.access_token;
}

// Upload resumável: inicia (metadados) → PUT do binário → devolve o id do vídeo.
async function subirVideo({ accessToken, arquivo, metadados }) {
  const inicio = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(metadados) });
  if (!inicio.ok) throw new Error(`início do upload falhou (HTTP ${inicio.status}).`);
  const urlUpload = inicio.headers.get("location");
  if (!urlUpload) throw new Error("YouTube não devolveu a URL de upload resumável.");
  const bin = readFileSync(arquivo);
  const put = await fetch(urlUpload, { method: "PUT", headers: { "Content-Type": "video/*" }, body: bin });
  if (!put.ok) throw new Error(`envio do vídeo falhou (HTTP ${put.status}).`);
  const j = await put.json();
  if (!j.id) throw new Error("upload concluiu mas o YouTube não devolveu o id do vídeo.");
  return j.id;
}

// Seta a thumbnail (vídeo longo). Falha aqui não derruba o upload já feito.
async function setarThumb({ accessToken, videoId, thumb }) {
  const bin = readFileSync(thumb);
  const r = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`,
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "image/png" }, body: bin });
  if (!r.ok) console.error(`AVISO: thumbnail não aplicada (HTTP ${r.status}).`);
}

function registrarPublicacao({ slug, videoId, privacidade }) {
  const caminho = join("producao", "publicacoes.md");
  mkdirSync("producao", { recursive: true });
  if (!existsSync(caminho)) writeFileSync(caminho, "# Publicações\n\n");
  appendFileSync(caminho, `- [${new Date().toISOString()}] YouTube ${slug}: https://youtu.be/${videoId} (${privacidade})\n`);
}

if (import.meta.main) {
  try { process.loadEnvFile(); } catch { /* sem .env: modo assistido */ }
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const slug = flag("--slug");
  const final = flag("--video") || (slug ? join("canal-youtube", "edicao", slug, "final.mp4") : undefined);
  const titulo = flag("--titulo");
  const descricao = flag("--descricao") || "";
  const tags = (flag("--tags") || "").split(",").map((t) => t.trim()).filter(Boolean);
  const privacidade = flag("--privacidade") || "private";
  const thumb = flag("--thumb");
  const confirmar = has("--confirmar");

  if (!slug && !final) falhar("informe --slug <nome> ou --video <arquivo>.");
  if (!final || !existsSync(final)) falhar(`vídeo não encontrado: ${final}`);

  const erros = validarUpload({ arquivo: final, titulo, descricao });
  if (erros.length) falhar(erros.join(" "));

  let dims = { largura: 0, altura: 0, duracaoSeg: 0 };
  try { dims = sondarVideo(final); } catch { console.error("AVISO: ffprobe falhou — assumindo vídeo longo."); }
  const ehShort = detectarShort(dims);

  const clientId = process.env.YT_CLIENT_ID, clientSecret = process.env.YT_CLIENT_SECRET, refreshToken = process.env.YT_REFRESH_TOKEN;
  const temCredencial = Boolean(clientId && clientSecret && refreshToken);
  const metadados = montarMetadados({ titulo, descricao, tags, privacidade, ehShort });

  if (!confirmar) {
    console.log(JSON.stringify(montarPlano({ slug, final, titulo, descricao, tags, privacidade, ehShort, temCredencial }), null, 2));
    process.exit(0);
  }

  if (!temCredencial) {
    const txt = montarPacoteAssistido({ slug, final, metadados, thumb });
    const saida = join(dirname(final), "metadados.txt");
    writeFileSync(saida, txt);
    console.log(JSON.stringify({ ok: true, modo: "assistido", pacote: saida }, null, 2));
    process.exit(0);
  }

  (async () => {
    try {
      registrarPasso({ skill: "/publicar", etapa: "subindo vídeo pro YouTube", status: "inicio" });
      const accessToken = await obterAccessToken({ clientId, clientSecret, refreshToken });
      const videoId = await subirVideo({ accessToken, arquivo: final, metadados });
      if (thumb && existsSync(thumb)) await setarThumb({ accessToken, videoId, thumb });
      registrarPublicacao({ slug, videoId, privacidade });
      registrarPasso({ skill: "/publicar", etapa: `vídeo no YouTube: ${videoId}`, status: "ok" });
      console.log(JSON.stringify({ ok: true, modo: "automático", videoId, link: `https://youtu.be/${videoId}`, privacidade }, null, 2));
    } catch (e) {
      registrarPasso({ skill: "/publicar", etapa: "falha no upload do YouTube", status: "erro" });
      falhar(e.message);
    }
  })();
}
