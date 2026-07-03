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

// Limita o trecho ao teto de duração (default 60s — banda forte de short em 2026 é
// 20-60s; teto real da plataforma é 180s). Quando precisa truncar e há `palavras`
// (word-timestamps do vídeo), recua o corte pro FIM DA FRASE mais próxima dentro do
// teto — truncar no meio da frase amputa o payoff. Sem fronteira de frase no alcance,
// recua pro fim da última palavra inteira; sem palavras, corta seco no teto.
// Devolve `truncado: true` quando mexeu no fim — o dry-run avisa em vez de silenciar.
export function limitarDuracao({ inicio, fim }, { teto = 60, palavras } = {}) {
  if (fim - inicio <= teto) return { inicio, fim, truncado: false };
  const tetoAbs = inicio + teto;
  let corte = tetoAbs;
  if (Array.isArray(palavras) && palavras.length) {
    const noAlcance = palavras.filter((p) => p.fim > inicio && p.fim <= tetoAbs);
    const fimFrase = [...noAlcance].reverse().find((p) => /[.!?…]$/.test(p.texto.trim()));
    const ultima = noAlcance[noAlcance.length - 1];
    if (fimFrase) corte = fimFrase.fim;
    else if (ultima) corte = ultima.fim;
  }
  return { inicio, fim: +corte.toFixed(3), truncado: true };
}

// Compat: nome antigo com o teto antigo. Preferir limitarDuracao.
export function limitar30s({ inicio, fim }) {
  return limitarDuracao({ inicio, fim }, { teto: 30 });
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
