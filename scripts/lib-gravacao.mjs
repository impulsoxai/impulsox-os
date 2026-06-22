// lib-gravacao.mjs — funções puras pra gravação de tela (Fase 2). ZERO deps, sem rede,
// sem disco: só parseiam/montam o que o orquestrador passa pro ffmpeg. ImpulsoX AI.

// Parseia a saída de `ffmpeg -list_devices true -f dshow -i dummy` (vai pro STDERR).
// Cada device é `"Nome" (video|audio|none)`, seguido opcionalmente de uma linha
// `Alternative name "@device_..."`. A última linha "Error opening ... dummy" é esperada.
export function parseDispositivosDshow(saida) {
  const video = [];
  const audio = [];
  let ultimo = null; // {obj} pra pendurar o alt-name na próxima linha
  for (const linhaRaw of String(saida).split("\n")) {
    const linha = linhaRaw.trim();
    const md = linha.match(/"([^"]+)"\s+\((video|audio|none)\)\s*$/);
    if (md) {
      const tipo = md[2];
      if (tipo === "none") { ultimo = null; continue; }
      const obj = { nome: md[1], alt: null };
      (tipo === "video" ? video : audio).push(obj);
      ultimo = obj;
      continue;
    }
    const ma = linha.match(/Alternative name\s+"([^"]+)"/);
    if (ma && ultimo) { ultimo.alt = ma[1]; ultimo = null; }
  }
  return { video, audio };
}

// Args do ffmpeg pra capturar a TELA inteira (gdigrab, Windows) -> mp4 sem áudio.
// faststart deixa o moov atom utilizável. CRF 18 (quase sem perda) + preset fast: texto/UI
// nítido na gravação de tela — CRF 23 (default) borra letra pequena e ícones.
export function argsCapturaTela({ fps = 30, saida }) {
  return [
    "-y", "-f", "gdigrab", "-framerate", String(fps), "-i", "desktop",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", saida,
  ];
}

// Args do ffmpeg pra capturar WEBCAM (vídeo) + MIC (áudio) via dshow -> um mp4.
// O dshow recebe os dois dispositivos no mesmo -i "video=...:audio=...".
export function argsCapturaWebcam({ webcam, mic, fps = 30, saida }) {
  return [
    "-y", "-f", "dshow", "-framerate", String(fps),
    "-i", `video=${webcam}:audio=${mic}`,
    "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-movflags", "+faststart", saida,
  ];
}

// Casa o que está salvo no .env com o que está conectado agora. Se ambos existem e estão
// na lista, grava direto. Se falta algum OU o salvo sumiu (USB desplugado), pede escolha.
export function resolverDispositivos(envCfg, disponiveis) {
  const temVideo = (n) => disponiveis.video.some((d) => d.nome === n);
  const temAudio = (n) => disponiveis.audio.some((d) => d.nome === n);
  const { webcam, mic } = envCfg || {};
  if (!webcam || !mic) return { precisaEscolher: true, motivo: "nenhum dispositivo salvo ainda." };
  if (!temVideo(webcam)) return { precisaEscolher: true, motivo: `a webcam salva ("${webcam}") não está conectada.` };
  if (!temAudio(mic)) return { precisaEscolher: true, motivo: `o mic salvo ("${mic}") não está conectado.` };
  return { precisaEscolher: false, webcam, mic };
}
