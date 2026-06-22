#!/usr/bin/env node
// gerar-tts.mjs — locução por IA (ElevenLabs). Isolado: trocar de provedor depois não mexe no
// gerar-video. Chave em ELEVENLABS_KEY (.env, gitignored). estimarCustoTTS é pura/testável.
// Uso: ELEVENLABS_KEY=... node scripts/gerar-tts.mjs "texto da fala" --voz <voiceId> --saida fala.mp3
import { writeFileSync } from "node:fs";

const PRECO_POR_1K = 0.30; // ~$0.30/1000 chars (ElevenLabs, jun/2026)

// estima o custo em USD de uma fala (string) ou várias (array de strings). Pura.
export function estimarCustoTTS(texto) {
  const arr = Array.isArray(texto) ? texto : [texto];
  const chars = arr.reduce((n, t) => n + String(t || "").length, 0);
  return Math.round((chars / 1000) * PRECO_POR_1K * 100) / 100;
}

// gera o mp3 de uma fala via ElevenLabs. Faz I/O (rede+disco) — não testada em unidade.
export async function gerarTTS({ texto, voz, saida, key = process.env.ELEVENLABS_KEY, fetchFn = fetch }) {
  if (!key) throw new Error("ELEVENLABS_KEY não definido no .env.");
  if (!voz) throw new Error("informe --voz <voiceId> (voz pronta ou já clonada no provedor).");
  const r = await fetchFn(`https://api.elevenlabs.io/v1/text-to-speech/${voz}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texto, model_id: "eleven_multilingual_v2" }),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(saida, buf);
  return saida;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
  const texto = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--voz" && args[i - 1] !== "--saida");
  const voz = flag("--voz");
  const saida = flag("--saida") || "fala.mp3";
  if (!texto) { console.error("informe o texto da fala."); process.exit(1); }
  console.log(`custo estimado: $${estimarCustoTTS(texto).toFixed(2)}`);
  gerarTTS({ texto, voz, saida })
    .then((s) => console.log("gerado: " + s))
    .catch((e) => { console.error("ERRO: " + e.message); process.exit(1); });
}
