// dashboard/leitura.mjs

import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

// Extrai o conteúdo de uma seção marcada por "**Título:**" até a próxima linha "**...**"
// ou linha em branco. Cobre dois formatos: bullets ("- item") e prosa inline/contínua
// (texto após o "**Título:**", podendo quebrar em mais linhas). Marcadores "_(vazio)_"
// e seção ausente → []. Tolerante a entrada vazia.
function itensDaSecao(md, tituloRegex) {
  const linhas = md.split(/\r?\n/);
  const itens = [];
  let dentro = false;
  let prosa = null; // buffer de prosa corrida (inline + continuação de linha)
  const ehMarcadorVazio = (s) => /^_\(.*\)_$/.test(s.trim());
  const flush = () => { if (prosa && prosa.trim()) itens.push(prosa.trim()); prosa = null; };

  for (const l of linhas) {
    const cab = l.match(/^\*\*(.+?):\*\*\s*(.*)$/); // linha "**Título:** [resto]"
    if (cab) {
      flush();
      dentro = tituloRegex.test(cab[1]);
      if (dentro && cab[2] && !ehMarcadorVazio(cab[2])) prosa = cab[2]; // inline após o título
      continue;
    }
    if (/^\*\*/.test(l)) { flush(); dentro = false; continue; } // outra seção "**...**"
    if (!dentro) continue;
    const bullet = l.match(/^\s*-\s+(.*\S)\s*$/);
    if (bullet) { flush(); itens.push(bullet[1]); continue; }
    const txt = l.trim();
    if (!txt) { flush(); continue; }        // linha em branco encerra a prosa
    if (ehMarcadorVazio(txt)) continue;     // marcador _(...)_ ignorado
    prosa = prosa ? prosa + " " + txt : txt; // continuação da prosa corrida
  }
  flush();
  return itens;
}

export function parseEscada(md = "") {
  const mDeg = md.match(/\*\*Degrau atual:\*\*\s*(\d+)/);
  return {
    degrau: mDeg ? Number(mDeg[1]) : null,
    pendencias: itensDaSecao(md, /Suposições|a confirmar/i),
    proximo: itensDaSecao(md, /Próximo degrau/i),
  };
}

export function parseFoco(md = "") {
  const secoes = [];
  let atual = null;
  for (const l of md.split(/\r?\n/)) {
    const h = l.match(/^##\s+(.*\S)\s*$/);
    if (h) { atual = { titulo: h[1], itens: [] }; secoes.push(atual); continue; }
    if (!atual) continue;
    const item = l.match(/^\s*-\s+(.*\S)\s*$/);
    if (item) { atual.itens.push(item[1]); continue; }
    const txt = l.trim();
    if (txt && !txt.startsWith(">")) atual.itens.push(txt);
  }
  return { secoes };
}

export function parseOfertas(md = "") {
  // só o trecho entre "Ofertas ATIVAS" e "Ofertas FUTURAS"
  const ini = md.search(/##\s*Ofertas ATIVAS/i);
  const fim = md.search(/##\s*Ofertas FUTURAS/i);
  // fail-safe: sem cabeçalho ATIVAS, começa do início — mas SEMPRE corta em FUTURAS,
  // pra nunca vazar oferta de roadmap (regra: peça pública só vende oferta ATIVA).
  const inicio = ini === -1 ? 0 : ini;
  const trecho = md.slice(inicio, fim === -1 ? undefined : fim);
  const nomes = [];
  for (const l of trecho.split(/\r?\n/)) {
    const m = l.match(/^##\s*Oferta:\s*(.*\S)\s*$/i);
    if (m) nomes.push(m[1]);
  }
  return nomes;
}

// uma entrada de aprendizado é uma linha "- **[DATA]** ..." com DATA real (não o
// placeholder [AAAA-MM-DD] da seção "Formato de cada entrada").
const RE_ENTRADA_APREND = /^\s*-\s+\*\*\[\d{4}-\d{2}-\d{2}\]/;

function secaoTemEntrada(md, tituloRegex) {
  let dentro = false;
  for (const l of md.split(/\r?\n/)) {
    const h = l.match(/^##\s+(.*\S)\s*$/);
    if (h) { dentro = new RegExp(tituloRegex, "i").test(h[1]); continue; }
    if (dentro && RE_ENTRADA_APREND.test(l)) return true;
  }
  return false;
}

export function parseAprendizados(md = "") {
  const entradas = [];
  for (const l of md.split(/\r?\n/)) {
    if (RE_ENTRADA_APREND.test(l)) entradas.push(l.replace(/^\s*-\s+/, "").trim());
  }
  return {
    organico_preenchido: secaoTemEntrada(md, "Conteúdo orgânico"),
    pago_preenchido: secaoTemEntrada(md, "Tráfego pago"),
    entradas,
  };
}

export function parseProvas(md = "") {
  // provas reais ficam ANTES da seção "## Formato de cada prova"; o exemplo de formato
  // mora dentro de um code fence ```...```. Cortar os dois pra não contar exemplo.
  const fimFormato = md.search(/##\s*Formato/i);
  const corpo = fimFormato === -1 ? md : md.slice(0, fimFormato);
  const semCodigo = corpo.replace(/```[\s\S]*?```/g, "");
  const n = (semCodigo.match(/^###\s+/gm) || []).length;
  return { preenchido: n > 0, n };
}

const TIPOS_PRODUCAO = ["posts", "linkedin", "paginas", "copy"];

export function listarProducao(raiz) {
  const out = [];
  for (const tipo of TIPOS_PRODUCAO) {
    const dir = join(raiz, "producao", tipo);
    if (!existsSync(dir)) continue;
    for (const nome of readdirSync(dir)) {
      if (!statSync(join(dir, nome)).isDirectory()) continue;
      const m = nome.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
      out.push({ tipo, data: m ? m[1] : "", slug: m ? m[2] : nome });
    }
  }
  return out;
}

// md pode ser null (arquivo ausente). Lê linhas de tabela "| data | canal | link |".
export function parsePublicacoes(md) {
  if (!md) return [];
  const out = [];
  for (const l of md.split(/\r?\n/)) {
    const cols = l.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 3 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0])) {
      out.push({ data: cols[0], canal: cols[1], link: cols[2] });
    }
  }
  return out;
}
