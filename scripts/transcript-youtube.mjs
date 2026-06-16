#!/usr/bin/env node
/**
 * transcript-youtube.mjs — puxa a transcrição pública de um vídeo do YouTube (legenda
 * manual ou automática), sem API key e sem login — mesmo dado que o painel "Mostrar
 * transcrição" do player exibe. ImpulsoX AI.
 *
 * Uso: node scripts/transcript-youtube.mjs <url-ou-videoId> [--texto]
 *   sem --texto: imprime JSON [{inicio, texto}, ...]
 *   com --texto: imprime só o texto corrido, sem timestamp
 */
import { buscarTranscript } from "./lib-youtube.mjs";

// Reconhece o videoId (11 caracteres) em URL completa, youtu.be, /shorts/ ou já puro.
export function extrairVideoId(entrada) {
  const m = entrada.match(/(?:v=|youtu\.be\/|\/shorts\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(entrada) ? entrada : null;
}

function falhar(msg) { console.error("ERRO: " + msg); process.exit(1); }

if (import.meta.main) {
  const [entrada, ...flags] = process.argv.slice(2);
  if (!entrada) falhar("informe a URL ou o videoId do vídeo.");
  const videoId = extrairVideoId(entrada);
  if (!videoId) falhar("não reconheci um videoId nessa entrada.");
  const soTexto = flags.includes("--texto");

  buscarTranscript(videoId)
    .then((blocos) => {
      if (soTexto) console.log(blocos.map((b) => b.texto).join(" "));
      else console.log(JSON.stringify(blocos, null, 2));
    })
    .catch((e) => falhar(e.message));
}
