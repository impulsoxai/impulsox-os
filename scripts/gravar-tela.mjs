#!/usr/bin/env node
/**
 * gravar-tela.mjs — grava TELA + VOZ(mic) + WEBCAM em arquivos crus separados.
 * O dono controla início/fim. Puro ffmpeg, Windows. ImpulsoX AI.
 *
 * Uso:
 *   node scripts/gravar-tela.mjs iniciar [--slug demo] [--reconfigurar] [--fps 30]
 *
 * UM comando só, que fica aberto: resolve dispositivos (.env ou lista+escolha+salva),
 * dispara 2 ffmpeg (tela.mp4 + webcam.mp4 com mic) em foreground e grava até o dono
 * apertar ENTER — aí manda 'q' no stdin de cada um pra fechar o mp4 com moov atom válido.
 * Quem grava é quem para: no Windows, taskkill não finaliza um console ffmpeg sem janela
 * (trunca o arquivo), então 'q' no stdin é a única parada limpa.
 */
import { spawnSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { parseDispositivosDshow, argsCapturaTela, argsCapturaWebcam, resolverDispositivos } from "./lib-gravacao.mjs";

if (import.meta.main) { try { process.loadEnvFile(); } catch { /* sem .env: 1ª vez */ } }
const FFMPEG = process.env.FFMPEG_BIN || "ffmpeg";

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }
const args = process.argv.slice(2);
const cmd = args[0];
const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
const has = (n) => args.includes(n);

// pergunta no terminal (índice de 1) e devolve o item escolhido.
function escolher(lista, titulo) {
  if (lista.length === 0) falhar(`${titulo}: nenhum dispositivo encontrado.`);
  console.log(`\n${titulo}:`);
  lista.forEach((d, i) => console.log(`  ${i + 1}: ${d.nome}`));
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => {
    rl.question(`Escolha (1-${lista.length}) [1]: `, (resp) => {
      rl.close();
      const i = Math.max(1, Math.min(lista.length, Number(resp) || 1)) - 1;
      res(lista[i]);
    });
  });
}

// salva/atualiza GRAVAR_WEBCAM e GRAVAR_MIC no .env da raiz (linha a linha, sem apagar o resto).
function salvarEnv(webcam, mic) {
  const envPath = ".env";
  let linhas = existsSync(envPath) ? readFileSync(envPath, "utf8").split("\n") : [];
  const setK = (k, v) => {
    const idx = linhas.findIndex((l) => l.startsWith(k + "="));
    const linha = `${k}=${v}`;
    if (idx !== -1) linhas[idx] = linha; else linhas.push(linha);
  };
  setK("GRAVAR_WEBCAM", webcam);
  setK("GRAVAR_MIC", mic);
  writeFileSync(envPath, linhas.filter((l) => l !== "").join("\n") + "\n");
}

function listarDispositivos() {
  const r = spawnSync(FFMPEG, ["-hide_banner", "-list_devices", "true", "-f", "dshow", "-i", "dummy"], { encoding: "utf8" });
  return parseDispositivosDshow(r.stderr || ""); // a lista vai pro STDERR
}

async function iniciar() {
  try { spawnSync(FFMPEG, ["-version"], { stdio: "ignore" }); } catch { falhar("ffmpeg não encontrado no PATH."); }
  const slug = flag("--slug") || "gravacao";
  const fps = Number(flag("--fps")) || 30;
  const base = join("canal-youtube", "gravacoes", slug);

  const disp = listarDispositivos();
  let r = resolverDispositivos({ webcam: process.env.GRAVAR_WEBCAM, mic: process.env.GRAVAR_MIC }, disp);
  if (has("--reconfigurar") || r.precisaEscolher) {
    if (r.motivo) console.log("• " + r.motivo);
    const webcam = await escolher(disp.video, "Webcam");
    const mic = await escolher(disp.audio, "Microfone");
    salvarEnv(webcam.nome, mic.nome);
    r = { precisaEscolher: false, webcam: webcam.nome, mic: mic.nome };
    console.log("✓ salvo no .env (use --reconfigurar pra trocar depois).");
  }

  mkdirSync(base, { recursive: true });
  const telaMp4 = join(base, "tela.mp4");
  const webcamMp4 = join(base, "webcam.mp4");
  // Foreground: ESTE processo segura os dois ffmpeg. O stdin de cada um fica aberto ("pipe")
  // pra receber 'q' — a ÚNICA forma de o ffmpeg fechar o mp4 com moov atom válido no Windows
  // (taskkill, mesmo sem /F, não entrega o sinal a um console app sem janela e trunca o
  // arquivo). Por isso quem grava é quem para — não dá pra separar em 'iniciar'/'parar'.
  const pTela = spawn(FFMPEG, argsCapturaTela({ fps, saida: telaMp4 }), { stdio: ["pipe", "ignore", "ignore"] });
  const pWeb = spawn(FFMPEG, argsCapturaWebcam({ webcam: r.webcam, mic: r.mic, fps, saida: webcamMp4 }), { stdio: ["pipe", "ignore", "ignore"] });

  console.log(`\n🔴 gravando em '${slug}'. Aperte ENTER pra parar.`);

  // espera o ENTER do dono.
  await new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question("", () => { rl.close(); res(); });
  });

  // manda 'q' nos dois ffmpeg e espera cada um finalizar o mp4 (fecha o stdin pra garantir).
  console.log("• finalizando os arquivos…");
  const fechar = (p) => new Promise((res) => {
    if (p.exitCode !== null) return res();
    p.on("close", () => res());
    try { p.stdin.write("q"); p.stdin.end(); } catch { res(); }
  });
  await Promise.all([fechar(pTela), fechar(pWeb)]);

  console.log(`✓ pronto: ${telaMp4} + ${webcamMp4}\n→ próximo: /editar-video pra cortar/acelerar/legendar.`);
  process.exit(0);
}

if (import.meta.main) {
  if (cmd === "iniciar" || cmd === "gravar") iniciar().catch((e) => falhar(e.message));
  else falhar("uso: node scripts/gravar-tela.mjs iniciar [--slug <nome>] [--reconfigurar] [--fps 30]  (grava até você apertar ENTER)");
}
