#!/usr/bin/env node
/**
 * editar-video.mjs — edita a gravação crua do long-form: corta silêncio, transcreve
 * (whisper local), queima legenda + gera .srt, cola intro/outro da marca, renderiza 16:9.
 * Dry-run por padrão; --confirmar renderiza. ImpulsoX AI. ffmpeg via binário.
 *
 * Uso: node scripts/editar-video.mjs --video bruto.mp4 --slug demo [--min-silencio 0.8]
 *        [--tela tela.mp4 --voz voz.wav] [--sem-intro] [--confirmar]
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { segmentosManter, filtroCorteConcat, planoCorte, montarSRT, montarASS, filtroLegendaAss, filtroLoudnorm, lerGlossario, corrigirTermos, parseTrechosTabela, normalizarTrechos, planoVelocidade, filtroVelocidadeConcat } from "./lib-edicao.mjs";
import { transcrever } from "./transcrever-local.mjs";
import { registrarPasso } from "./registrar-passo.mjs";

// Carrega o .env da raiz quando rodado direto (não em teste). WHISPER_BIN/FFMPEG_BIN etc.
if (import.meta.main) {
  try { process.loadEnvFile(); } catch { /* sem .env: usa defaults/PATH */ }
}

const FFMPEG = process.env.FFMPEG_BIN || "ffmpeg";

// Resumo do dry-run a partir da saída do silencedetect — função pura, testável.
export function montarPlanoDryRun({ saidaSilencedetect, duracaoTotal, slug, minSilencio = 0.8, trechos = null }) {
  const seg = segmentosManter(saidaSilencedetect, { minSilencio, duracaoTotal });
  const p = planoCorte(seg, duracaoTotal);
  const base = `canal-youtube/edicao/${slug}`;
  const out = { dry_run: true, slug, ...p, segmentos: seg.length, saidas: [`${base}/final.mp4`, `${base}/legenda.srt`] };
  // edição por trechos (plano de velocidade): só anexa quando há trechos a aplicar.
  if (trechos && trechos.length) out.velocidade = planoVelocidade(trechos, duracaoTotal);
  return out;
}

// Roda silencedetect e devolve {saida, duracaoTotal}. O ffmpeg escreve o relatório
// (Duration + linhas silence_*) no STDERR, não no stdout — por isso lemos r.stderr.
// limiarDb: sensibilidade do silêncio (mais negativo = mais permissivo p/ ruído de fundo).
function detectarSilencio(video, minSilencio, limiarDb = -30) {
  const r = spawnSync(FFMPEG, [
    "-i", video, "-af", `silencedetect=noise=${limiarDb}dB:d=${minSilencio}`, "-f", "null", "-",
  ], { encoding: "utf8" });
  const saida = r.stderr || "";
  const md = saida.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  const duracaoTotal = md ? Number(md[1]) * 3600 + Number(md[2]) * 60 + Number(md[3]) : 0;
  return { saida, duracaoTotal };
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const has = (n) => args.includes(n);

  const slug = flag("--slug");
  const video = flag("--video") || flag("--tela");
  const voz = flag("--voz");
  const minSilencio = Number(flag("--min-silencio")) || 0.8;
  const limiarDb = flag("--limiar-db") !== undefined ? Number(flag("--limiar-db")) : -30;
  const confirmar = has("--confirmar");
  const semIntro = has("--sem-intro");
  const planoArq = flag("--plano");
  const semCorteSilencio = has("--sem-corte-silencio");

  if (!slug) falhar("informe --slug <nome>.");
  if (!video) falhar("informe --video <arquivo> (ou --tela + --voz).");
  if (!existsSync(video)) falhar(`arquivo não encontrado: ${video}`);
  try { execFileSync(FFMPEG, ["-version"], { stdio: "ignore" }); }
  catch { falhar("ffmpeg não encontrado no PATH. Instale o ffmpeg pra editar vídeo."); }

  const { saida, duracaoTotal } = detectarSilencio(video, minSilencio, limiarDb);
  if (duracaoTotal < 10) falhar(`gravação curta demais (${duracaoTotal.toFixed(1)}s) — confira o arquivo.`);

  // carrega os trechos de edição por velocidade do plano-edicao.json, se informado.
  let trechos = null;
  if (planoArq) {
    if (!existsSync(planoArq)) falhar(`plano não encontrado: ${planoArq}`);
    const raw = JSON.parse(readFileSync(planoArq, "utf8"));
    trechos = normalizarTrechos(raw.trechos || [], duracaoTotal);
  }

  if (!confirmar) {
    console.log(JSON.stringify({ ...montarPlanoDryRun({ saidaSilencedetect: saida, duracaoTotal, slug, minSilencio, trechos }),
      nota: "rode de novo com --confirmar pra renderizar de verdade." }, null, 2));
    process.exit(0);
  }

  (async () => {
    const base = join("canal-youtube", "edicao", slug);
    mkdirSync(base, { recursive: true });
    const cortado = join(base, "_cortado.mp4");
    const acelerado = join(base, "_velocidade.mp4");
    const tmpSrt = join(base, "legenda.srt");
    const tmpAss = join(base, "_karaoke.ass");
    const tmpPalavras = join(base, "palavras.json");
    const final = join(base, "final.mp4");
    try {
      // pipeline: corte de silêncio (a não ser que pulado) → depois passo de velocidade.
      // baseVideo é o vídeo de trabalho corrente: começa cru, vira _cortado, depois _velocidade.
      let baseVideo = video;
      let cortouSilencio = false;
      if (!semCorteSilencio) {
        registrarPasso({ skill: "/editar-video", etapa: "cortando silêncio + normalizando áudio", status: "inicio" });
        const seg = segmentosManter(saida, { minSilencio, duracaoTotal });
        // corta o silêncio E normaliza o áudio pro padrão YouTube (-14 LUFS) no mesmo passo —
        // loudnorm vai DENTRO do filtergraph (ffmpeg não deixa -af junto de -filter_complex).
        execFileSync(FFMPEG, ["-y", "-i", video, "-filter_complex", filtroCorteConcat(seg, { loudnorm: filtroLoudnorm() }),
          "-map", "[vout]", "-map", "[aout]", cortado], { stdio: "inherit" });
        baseVideo = cortado;
        cortouSilencio = true;
      }

      // passo de velocidade: acelera/corta trechos do plano-edicao.json.
      // loudnorm SÓ aqui quando o corte de silêncio foi pulado — senão normalizaria 2×.
      if (trechos && trechos.length) {
        registrarPasso({ skill: "/editar-video", etapa: "aplicando velocidade por trechos", status: "inicio" });
        const loud = cortouSilencio ? {} : { loudnorm: filtroLoudnorm() };
        execFileSync(FFMPEG, ["-y", "-i", baseVideo, "-filter_complex", filtroVelocidadeConcat(trechos, loud),
          "-map", "[vout]", "-map", "[aout]", acelerado], { stdio: "inherit" });
        baseVideo = acelerado;
      }

      registrarPasso({ skill: "/editar-video", etapa: "transcrevendo (whisper local)", status: "inicio" });
      let temLegenda = false;
      try {
        let palavras = transcrever(voz || baseVideo);
        // glossário da marca: conserta termos que o whisper foneticiza (reel, ImpulsoX...).
        const glossPath = join("canal-youtube", "glossario.md");
        if (existsSync(glossPath)) palavras = corrigirTermos(palavras, lerGlossario(readFileSync(glossPath, "utf8")));
        if (palavras.length) {
          writeFileSync(tmpSrt, montarSRT(palavras));   // .srt pro YouTube CC (acessibilidade/SEO)
          writeFileSync(tmpAss, montarASS(palavras));   // .ass karaokê pra queimar (retenção)
          writeFileSync(tmpPalavras, JSON.stringify(palavras, null, 2)); // pra Fase 2.5 (shorts) reusar
          temLegenda = true;
        }
      } catch (e) { console.error("AVISO: legenda pulada — " + e.message); }

      const corpo = temLegenda ? join(base, "_legendado.mp4") : baseVideo;
      if (temLegenda) {
        // queima a karaokê (destaque palavra-a-palavra); áudio já normalizado, só copia.
        execFileSync(FFMPEG, ["-y", "-i", baseVideo, "-vf", filtroLegendaAss({ assCaminho: tmpAss }),
          "-c:a", "copy", corpo], { stdio: "inherit" });
      }

      const intro = join("canal-youtube", "edicao", "templates", "intro.mp4");
      const outro = join("canal-youtube", "edicao", "templates", "outro.mp4");
      const partes = [];
      if (!semIntro && existsSync(intro)) partes.push(intro);
      partes.push(corpo);
      if (!semIntro && existsSync(outro)) partes.push(outro);
      if (partes.length > 1) {
        const lista = join(base, "_concat.txt");
        writeFileSync(lista, partes.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n"));
        execFileSync(FFMPEG, ["-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", final], { stdio: "inherit" });
        rmSync(lista, { force: true });
      } else {
        execFileSync(FFMPEG, ["-y", "-i", corpo, "-c", "copy", final], { stdio: "inherit" });
      }

      registrarPasso({ skill: "/editar-video", etapa: `vídeo pronto: ${final}`, status: "ok" });
      console.log(JSON.stringify({ ok: true, slug, final, srt: temLegenda ? tmpSrt : null }, null, 2));
    } catch (e) {
      registrarPasso({ skill: "/editar-video", etapa: "falha ao editar vídeo", status: "erro" });
      falhar(e.message);
    }
  })();
}
