// lib-youtube.mjs — helpers puros e de rede pro radar de criadores e transcript do
// YouTube. Tudo aqui acessa só dado PÚBLICO (RSS do canal, página do vídeo, endpoint de
// legenda) — nunca atrás de login, mesma régua do /formulas. ImpulsoX AI. ZERO deps.

// Extrai videoId/título/descrição/data/canal de cada <entry> do feed Atom público do
// YouTube (https://www.youtube.com/feeds/videos.xml?channel_id=...).
export function parseFeedRSS(xml) {
  const entradas = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  return entradas
    .map((bloco) => ({
      videoId: bloco.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || "",
      titulo: bloco.match(/<title>([^<]*)<\/title>/)?.[1] || "",
      descricao: bloco.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1]?.trim() || "",
      publicado: bloco.match(/<published>([^<]+)<\/published>/)?.[1] || "",
      canal: bloco.match(/<author>\s*<name>([^<]*)<\/name>\s*<\/author>/)?.[1] || "",
    }))
    .filter((e) => e.videoId);
}

function decodificarEntidades(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Extrai {inicio, texto} de cada <text start="..."> do endpoint público timedtext.
export function parseTimedText(xml) {
  const blocos = [...xml.matchAll(/<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g)];
  return blocos.map(([, inicio, textoBruto]) => ({
    inicio: Number(inicio),
    texto: decodificarEntidades(textoBruto),
  }));
}

// Extrai as trilhas de legenda (captionTracks) embutidas na página pública do vídeo.
export function extrairTrilhasLegenda(html) {
  const m = html.match(/"captionTracks":(\[[^\]]*\])/);
  if (!m) return [];
  let arr;
  try { arr = JSON.parse(m[1]); } catch { return []; }
  return arr.map((t) => ({
    url: (t.baseUrl || "").replace(/\\u0026/g, "&"),
    idioma: t.languageCode || "",
    gerada: t.kind === "asr",
  }));
}

// Escolhe a melhor trilha por preferência de idioma; cai pra primeira disponível.
export function escolherTrilha(trilhas, preferencias = ["pt", "pt-BR", "en"]) {
  if (trilhas.length === 0) throw new Error("vídeo sem legenda disponível (nem automática).");
  for (const pref of preferencias) {
    const achada = trilhas.find((t) => t.idioma === pref || t.idioma.startsWith(pref));
    if (achada) return achada;
  }
  return trilhas[0];
}

// Lê a tabela markdown de criadores monitorados. Linha sem Channel ID válido (UC + 22
// caracteres) é ignorada — fica fora do monitoramento até alguém resolver e preencher.
export function lerCriadores(md) {
  const linhas = md.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|"));
  const semSeparador = linhas.filter((l) => !/^\|[\s-:|]+\|$/.test(l));
  const linhasDados = semSeparador.slice(1); // a primeira que resta é o cabeçalho
  return linhasDados
    .map((l) => {
      const [nome, handle, channelId] = l.split("|").slice(1, -1).map((c) => c.trim());
      return { nome, handle, channelId };
    })
    .filter((c) => /^UC[\w-]{22}$/.test(c.channelId || ""));
}

// Lê os pilares (## título + linha "Palavras-chave: a, b, c") de canal-youtube/pilares.md.
export function lerPilares(md) {
  const blocos = md.split(/(?:^|\n)##\s+/).slice(1);
  return blocos.map((bloco) => {
    const linhas = bloco.split("\n");
    const nome = linhas[0].trim();
    const linhaChave = linhas.find((l) => /^Palavras-chave:/i.test(l.trim()));
    const palavrasChave = linhaChave
      ? linhaChave.replace(/^Palavras-chave:/i, "").split(",").map((p) => p.trim().toLowerCase()).filter(Boolean)
      : [];
    return { nome, palavrasChave };
  });
}

// Classifica um texto (título+descrição de vídeo) contra os pilares — primeira palavra-
// chave encontrada decide o pilar. Substring simples, sem peso nem score.
export function classificarRelevancia(texto, pilares) {
  const t = texto.toLowerCase();
  for (const pilar of pilares) {
    const achada = pilar.palavrasChave.find((p) => t.includes(p));
    if (achada) return { relevante: true, pilar: pilar.nome, palavra: achada };
  }
  return { relevante: false, pilar: null, palavra: null };
}

// Resolve o Channel ID (UC...) a partir do @handle público — abre a página do canal
// (sem login, sem API key) e lê o channelId embutido no HTML.
export async function resolverChannelId(handle, { baseUrl = "https://www.youtube.com" } = {}) {
  const h = handle.startsWith("@") ? handle : `@${handle}`;
  const r = await fetch(`${baseUrl}/${h}`);
  if (!r.ok) throw new Error(`não consegui abrir a página do canal ${h} (HTTP ${r.status}).`);
  const html = await r.text();
  const m = html.match(/"channelId":"(UC[\w-]{22})"/);
  if (!m) throw new Error(`não achei o channelId na página de ${h} — confirma o handle.`);
  return m[1];
}

// Monta a URL do RSS público (sem API key) do canal.
export function feedUrlPara(channelId, baseUrl = "https://www.youtube.com") {
  return `${baseUrl}/feeds/videos.xml?channel_id=${channelId}`;
}

// Busca e parseia o RSS público do canal.
export async function buscarFeedRSS(channelId, { baseUrl = "https://www.youtube.com" } = {}) {
  const r = await fetch(feedUrlPara(channelId, baseUrl));
  if (!r.ok) throw new Error(`RSS do canal ${channelId} falhou (HTTP ${r.status}).`);
  return parseFeedRSS(await r.text());
}

// Busca a transcrição pública de um vídeo: abre a página, acha a melhor trilha de
// legenda disponível e baixa o timedtext. Sem API key, sem login.
export async function buscarTranscript(videoId, { baseUrl = "https://www.youtube.com" } = {}) {
  const r = await fetch(`${baseUrl}/watch?v=${videoId}`);
  if (!r.ok) throw new Error(`não consegui abrir o vídeo ${videoId} (HTTP ${r.status}).`);
  const html = await r.text();
  const trilha = escolherTrilha(extrairTrilhasLegenda(html));
  const rt = await fetch(trilha.url);
  if (!rt.ok) throw new Error(`download da legenda de ${videoId} falhou (HTTP ${rt.status}).`);
  return parseTimedText(await rt.text());
}
