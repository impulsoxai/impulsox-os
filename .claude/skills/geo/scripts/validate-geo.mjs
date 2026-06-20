#!/usr/bin/env node
/**
 * validate-geo.mjs: validador determinístico de citabilidade (GEO). ImpulsoX AI. Sem deps, sem LLM.
 *
 * Valida um bloco de conteúdo citável contra as regras do estudo de Princeton (KDD 2024,
 * arXiv:2311.09735) e o consenso de mercado documentado em referencias/citabilidade.md.
 * Filosofia: falha-fecha, mensagens acionáveis, zero rede. O "olho clínico" é do agente;
 * o piso objetivo é deste script (mesma régua de ouro da /revisar-pagina: nada sem regra).
 *
 * Uso:
 *   node validate-geo.mjs arquivo.json          # valida 1 ou N blocos de um JSON
 *   node validate-geo.mjs --texto "..." --tipo faq
 *   echo '<json>' | node validate-geo.mjs -     # stdin
 *
 * Um bloco: { tipo: "faq"|"article"|"resposta", texto, fonte?, jsonld? }
 * Saída: JSON { ok, total, aprovados, blocos:[{ok, erros:[{code,msg}]}] }; exit 1 se algum reprova.
 */

// Lista de hype banido (espelha a régua de persuasão honesta do docs/persuasao.md).
const HYPE = [
  "revolucionário", "revolucionario", "disruptivo", "imperdível", "imperdivel",
  "melhor do mundo", "número 1", "numero 1", "líder absoluto", "lider absoluto",
  "garantido", "100% garantido", "milagroso", "incrível oportunidade", "incrivel oportunidade",
  "tempo limitado", "última chance", "ultima chance", "não perca", "nao perca",
  "exclusivo", "secreto", "o que ninguém te conta", "o que ninguem te conta",
];

const LIMITES = { faq: [40, 320], article: [60, 600], resposta: [40, 400] };

const reSentenca = /[^.!?]+[.!?]+/;
const reNumero = /\b\d+([.,]\d+)?\s*(%|mil|milh(ão|ões|ao|oes)|bi|k|x|anos?|meses|dias|semanas|R\$|\$)?/i;
// "fonte reconhecível": atribuição textual (segundo X / fonte: X / via X / — Autor) ou URL/citação.
const reFonte = /(segundo|conforme|de acordo com|fonte:|via |publicad[oa] (em|por)|estudo d[aeo]|pesquisa d[aeo]|relatório d[aeo]|dados d[aeo])\s+[A-Z0-9]/i;
const reURL = /https?:\/\/|www\.|\.(com|org|gov|edu|br)\b/i;

export function validarBloco(bloco) {
  const erros = [];
  const tipo = (bloco?.tipo || "resposta").toLowerCase();
  const texto = String(bloco?.texto || "").trim();
  const temFonteCampo = !!(bloco?.fonte && String(bloco.fonte).trim());

  if (!texto) {
    return { ok: false, erros: [{ code: "VAZIO", msg: "bloco sem texto." }] };
  }

  // 1. Front-load: a primeira sentença deve responder direto (não abrir com rodeio/pergunta).
  const m = texto.match(reSentenca);
  const primeira = (m ? m[0] : texto).trim();
  const abreFraco = /^(neste|nesta|hoje em dia|no mundo atual|vamos|imagine|você já|voce ja|antes de|primeiro,|para começar|para comecar)/i.test(primeira);
  if (abreFraco || primeira.endsWith("?")) {
    erros.push({ code: "FRONTLOAD", msg: "a primeira sentença não responde direto. RAG cita o trecho, não a página: comece pela resposta." });
  }

  // 2. Estatística com fonte: >=1 número no bloco.
  if (!reNumero.test(texto)) {
    erros.push({ code: "SEM_ESTATISTICA", msg: "nenhum dado numérico. Princeton: estatística rende +32% de citação. Inclua >=1 número concreto." });
  }

  // 3. Citação autoritativa: fonte no campo OU atribuição textual OU URL.
  const temFonteTexto = reFonte.test(texto) || reURL.test(texto);
  if (!temFonteCampo && !temFonteTexto) {
    erros.push({ code: "SEM_FONTE", msg: "nenhuma fonte reconhecível. Princeton: citação rende +30 a +41%. Atribua a fonte (campo fonte, 'segundo X', ou URL)." });
  }

  // 3b. Número sem fonte = reprovado (regra do citabilidade.md): se tem número mas nenhuma fonte.
  if (reNumero.test(texto) && !temFonteCampo && !temFonteTexto) {
    erros.push({ code: "NUMERO_SEM_FONTE", msg: "há número sem atribuição de fonte. Todo dado citado carrega a fonte." });
  }

  // 4. Limites de caractere por tipo.
  const [min, max] = LIMITES[tipo] || LIMITES.resposta;
  if (texto.length < min) erros.push({ code: "CURTO", msg: `bloco ${tipo} com ${texto.length} chars, mínimo ${min}. Trecho curto demais não é auto-contido.` });
  if (texto.length > max) erros.push({ code: "LONGO", msg: `bloco ${tipo} com ${texto.length} chars, máximo ${max}. RAG recupera trechos: quebre em blocos menores.` });

  // 5. Detecção de hype.
  const baixo = texto.toLowerCase();
  const achados = HYPE.filter((h) => baixo.includes(h));
  if (achados.length) {
    erros.push({ code: "HYPE", msg: `linguagem de hype: ${achados.join(", ")}. GEO premia fluência factual, não superlativo (keyword stuffing REDUZ visibilidade no estudo).` });
  }

  // 6. Keyword stuffing: palavra de conteúdo (>4 letras) repetida demais.
  const palavras = baixo.match(/\b[a-zà-ú]{5,}\b/gi) || [];
  const cont = {};
  for (const p of palavras) cont[p] = (cont[p] || 0) + 1;
  const densas = Object.entries(cont).filter(([, n]) => n >= 5).map(([p]) => p);
  if (densas.length && palavras.length < 120) {
    erros.push({ code: "STUFFING", msg: `repetição artificial: ${densas.join(", ")}. Densidade de palavra-chave reduz visibilidade em IA.` });
  }

  // 7. Schema válido (se houver jsonld): tipo FAQPage ou Article com @context.
  if (bloco?.jsonld) {
    const j = bloco.jsonld;
    const t = j["@type"];
    if (!j["@context"] || !/schema\.org/.test(String(j["@context"]))) {
      erros.push({ code: "SCHEMA_CONTEXT", msg: "jsonld sem @context schema.org válido." });
    }
    if (!["FAQPage", "Article", "QAPage"].includes(t)) {
      erros.push({ code: "SCHEMA_TIPO", msg: `jsonld @type "${t}" inesperado. Use FAQPage, QAPage ou Article.` });
    }
  }

  return { ok: erros.length === 0, erros };
}

export function validar(blocos) {
  const arr = Array.isArray(blocos) ? blocos : [blocos];
  const res = arr.map(validarBloco);
  const aprovados = res.filter((r) => r.ok).length;
  return { ok: aprovados === arr.length, total: arr.length, aprovados, blocos: res };
}

// --- CLI (só roda quando chamado direto, não no import dos testes) -----------
const ehMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("validate-geo.mjs");
if (ehMain) {
  (async () => {
    const { readFileSync } = await import("node:fs");
    const args = process.argv.slice(2);
    const flag = (n) => { const i = args.indexOf(n); return i !== -1 ? args[i + 1] : undefined; };
    let blocos;
    if (flag("--texto")) {
      blocos = [{ tipo: flag("--tipo") || "resposta", texto: flag("--texto"), fonte: flag("--fonte") }];
    } else {
      const alvo = args.find((a) => !a.startsWith("--")) || "-";
      const raw = alvo === "-" ? readFileSync(0, "utf8") : readFileSync(alvo, "utf8");
      blocos = JSON.parse(raw);
    }
    const out = validar(blocos);
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  })().catch((e) => { console.error("ERRO:", e.message); process.exit(2); });
}
