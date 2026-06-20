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
