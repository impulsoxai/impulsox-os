// lib-shorts.mjs — funções puras pra Fase 2.5 (vídeo longo -> shorts). ZERO deps, sem
// rede/disco: parse de tempo/marcador, recorte de palavras e filtros de reenquadre. ImpulsoX AI.

// "m:ss" ou "h:mm:ss" -> segundos.
export function parseTempo(txt) {
  const partes = String(txt).split(":").map(Number);
  return partes.reduce((acc, n) => acc * 60 + n, 0);
}

// Extrai os cortes das linhas [CORTE-SHORT: mm:ss-mm:ss — razão] do roteiro.
export function acharCortesPorMarcador(roteiroTexto) {
  const re = /\[CORTE-SHORT:\s*([\d:]+)\s*-\s*([\d:]+)\s*[—-]\s*([^\]]+)\]/g;
  const out = [];
  let m;
  while ((m = re.exec(roteiroTexto))) {
    out.push({ inicio: parseTempo(m[1]), fim: parseTempo(m[2]), razao: m[3].trim() });
  }
  return out;
}

// Limita o trecho a no máximo 30s (padrão de short que retém).
export function limitar30s({ inicio, fim }) {
  return { inicio, fim: Math.min(fim, inicio + 30) };
}

// Palavras cujo tempo cai em [inicio, fim], com os tempos rebaseados pra começar em 0
// (a legenda do short começa do zero, não do minuto do vídeo longo).
export function recortarPalavras(palavras, inicio, fim) {
  return palavras
    .filter((p) => p.inicio >= inicio && p.fim <= fim)
    .map((p) => ({ inicio: +(p.inicio - inicio).toFixed(3), fim: +(p.fim - inicio).toFixed(3), texto: p.texto }));
}

// Reenquadre CROP: escala cobrindo a altura alvo e corta a faixa central na largura 9:16.
// Bom pra talking-head / tela centralizada. `-2` = ffmpeg mantém proporção (par).
export function filtroReenquadreCrop({ alvoLargura = 1080, alvoAltura = 1920 } = {}) {
  return `scale=-2:${alvoAltura},crop=${alvoLargura}:${alvoAltura}`;
}

// Reenquadre SPLIT: vídeo 16:9 escalado pra largura alvo, colado no TOPO sobre fundo da
// marca 9:16 (sobra embaixo pra legenda grande). Bom pra screen-recording.
export function filtroReenquadreSplit({ alvoLargura = 1080, alvoAltura = 1920, fundoCor = "0x06060D" } = {}) {
  return `scale=${alvoLargura}:-2[vid];color=c=${fundoCor}:s=${alvoLargura}x${alvoAltura}[bg];[bg][vid]overlay=0:0`;
}
