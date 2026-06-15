// dashboard/leitura.mjs

// Extrai os itens (linhas "- ...") de uma seção marcada por "**Título:**" até o próximo
// "**" de início de linha ou o fim do texto. Tolerante: seção ausente → [].
function itensDaSecao(md, tituloRegex) {
  const linhas = md.split(/\r?\n/);
  const out = [];
  let dentro = false;
  for (const l of linhas) {
    if (/^\*\*/.test(l)) {                     // começo de uma seção "**...**"
      dentro = tituloRegex.test(l);
      continue;
    }
    if (dentro) {
      const m = l.match(/^\s*-\s+(.*\S)\s*$/);
      if (m) out.push(m[1]);
    }
  }
  return out;
}

export function parseEscada(md = "") {
  const mDeg = md.match(/\*\*Degrau atual:\*\*\s*(\d+)/);
  return {
    degrau: mDeg ? Number(mDeg[1]) : null,
    pendencias: itensDaSecao(md, /Suposições|a confirmar/i),
    proximo: itensDaSecao(md, /Próximo degrau/i),
  };
}
