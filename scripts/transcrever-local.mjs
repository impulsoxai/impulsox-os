#!/usr/bin/env node
/**
 * transcrever-local.mjs — transcreve um áudio com whisper LOCAL (grátis, offline). Devolve
 * palavras com timestamp pra legenda. WHISPER_BIN/WHISPER_MODEL/WHISPER_IDIOMA no .env
 * (defaults: whisper / small / pt). Erro guiado se o binário não existir. ImpulsoX AI.
 *
 * Uso: node scripts/transcrever-local.mjs <audio> [--json saida.json]
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Normaliza a saída JSON do whisper (openai-whisper word_timestamps) em palavras.
export function parseWhisperJson(obj) {
  const palavras = [];
  for (const seg of obj.segments || []) {
    for (const w of seg.words || []) {
      palavras.push({ inicio: w.start, fim: w.end, texto: String(w.word || "").trim() });
    }
  }
  if (palavras.length === 0) {
    for (const seg of obj.segments || []) {
      palavras.push({ inicio: seg.start, fim: seg.end, texto: String(seg.text || "").trim() });
    }
  }
  return palavras;
}

// Roda o whisper local e devolve as palavras. `exec` injetável pra teste.
export function transcrever(audio, { bin, modelo, idioma, exec = execFileSync } = {}) {
  const whisperBin = bin || process.env.WHISPER_BIN || "whisper";
  const whisperModelo = modelo || process.env.WHISPER_MODEL || "small";
  const whisperIdioma = idioma || process.env.WHISPER_IDIOMA || "pt";
  const dir = mkdtempSync(join(tmpdir(), "whisper-"));
  try {
    exec(whisperBin, [
      audio, "--model", whisperModelo, "--language", whisperIdioma,
      "--word_timestamps", "True", "--output_format", "json", "--output_dir", dir,
    ], { stdio: "pipe" });
  } catch (e) {
    if (e.code === "ENOENT") {
      throw new Error(`whisper não encontrado ('${whisperBin}'). Instale (ex: pip install -U openai-whisper) ou aponte WHISPER_BIN no .env.`);
    }
    throw new Error(`whisper falhou: ${String(e.message).slice(0, 200)}`);
  }
  const nome = audio.split(/[\\/]/).pop().replace(/\.[^.]+$/, "");
  const jsonPath = join(dir, `${nome}.json`);
  if (!existsSync(jsonPath)) throw new Error("whisper rodou mas não gerou o JSON esperado.");
  return parseWhisperJson(JSON.parse(readFileSync(jsonPath, "utf8")));
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  try { process.loadEnvFile(); } catch { /* sem .env: usa defaults/PATH */ }
  const audio = process.argv[2];
  const i = process.argv.indexOf("--json");
  if (!audio) falhar("informe o arquivo de áudio.");
  try {
    const palavras = transcrever(audio);
    const saida = JSON.stringify(palavras, null, 2);
    if (i !== -1 && process.argv[i + 1]) writeFileSync(process.argv[i + 1], saida);
    else console.log(saida);
  } catch (e) { falhar(e.message); }
}
