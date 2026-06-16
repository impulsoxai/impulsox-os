#!/usr/bin/env node
/**
 * checar-criadores-yt.mjs — varre o RSS dos criadores monitorados, detecta vídeo novo,
 * classifica relevância contra os 3 pilares do canal e, quando relevante, busca a
 * transcrição pública e grava na fila pra dissecção (Modo 4 do /formulas). Nunca acessa
 * nada atrás de login — só RSS público e a página pública do vídeo. ImpulsoX AI.
 *
 * Nota: na primeira execução (sem `.ultimo-visto.json`), TODOS os vídeos atuais do feed
 * de cada criador entram como "novos" — é a carga inicial. Execuções seguintes só pegam
 * o que entrou depois do último visto.
 *
 * Uso: node scripts/checar-criadores-yt.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { lerCriadores, lerPilares, buscarFeedRSS, classificarRelevancia, buscarTranscript } from "./lib-youtube.mjs";

const REL_CRIADORES = ["canal-youtube", "criadores-monitorados.md"];
const REL_PILARES = ["canal-youtube", "pilares.md"];
const REL_ULTIMO_VISTO = ["canal-youtube", "pesquisa", ".ultimo-visto.json"];
const REL_FILA = ["canal-youtube", "pesquisa", "fila.md"];

function lerUltimoVisto(raiz) {
  const caminho = join(raiz, ...REL_ULTIMO_VISTO);
  if (!existsSync(caminho)) return {};
  return JSON.parse(readFileSync(caminho, "utf8"));
}

function gravarUltimoVisto(raiz, estado) {
  const caminho = join(raiz, ...REL_ULTIMO_VISTO);
  mkdirSync(join(raiz, "canal-youtube", "pesquisa"), { recursive: true });
  writeFileSync(caminho, JSON.stringify(estado, null, 2));
}

function gravarNaFila(raiz, entrada) {
  const caminho = join(raiz, ...REL_FILA);
  mkdirSync(join(raiz, "canal-youtube", "pesquisa"), { recursive: true });
  if (!existsSync(caminho)) writeFileSync(caminho, "# Fila de pesquisa — vídeos relevantes detectados\n\n");
  const linhaTranscript = entrada.transcriptErro
    ? `- **Transcrição:** indisponível (${entrada.transcriptErro})`
    : `- **Transcrição:** capturada (${entrada.transcript.length} trechos)`;
  const bloco = [
    `## ${entrada.titulo}`,
    `- **Canal:** ${entrada.canal}`,
    `- **Pilar:** ${entrada.pilar}`,
    `- **Link:** https://www.youtube.com/watch?v=${entrada.videoId}`,
    `- **Publicado:** ${entrada.publicado}`,
    `- **Status:** a dissecar`,
    linhaTranscript,
    "",
  ].join("\n");
  appendFileSync(caminho, bloco + "\n");
}

export async function checarCriadores({ raiz = process.cwd(), baseUrl } = {}) {
  const criadores = lerCriadores(readFileSync(join(raiz, ...REL_CRIADORES), "utf8"));
  const pilares = lerPilares(readFileSync(join(raiz, ...REL_PILARES), "utf8"));
  const ultimoVisto = lerUltimoVisto(raiz);
  const relevantes = [];

  for (const criador of criadores) {
    let videos;
    try {
      videos = await buscarFeedRSS(criador.channelId, { baseUrl });
    } catch (e) {
      console.error(`AVISO: RSS de ${criador.nome} falhou — ${e.message}`);
      continue;
    }

    const ultimoId = ultimoVisto[criador.channelId];
    const novos = [];
    for (const v of videos) {
      if (v.videoId === ultimoId) break;
      novos.push(v);
    }
    if (videos.length > 0) ultimoVisto[criador.channelId] = videos[0].videoId;

    for (const v of novos) {
      const classe = classificarRelevancia(`${v.titulo} ${v.descricao}`, pilares);
      if (!classe.relevante) continue;
      let transcript, transcriptErro;
      try {
        transcript = await buscarTranscript(v.videoId, { baseUrl });
      } catch (e) {
        transcriptErro = e.message;
      }
      const entrada = { ...v, canal: criador.nome, pilar: classe.pilar, transcript, transcriptErro };
      gravarNaFila(raiz, entrada);
      relevantes.push(entrada);
    }
  }

  gravarUltimoVisto(raiz, ultimoVisto);
  return { totalCriadores: criadores.length, relevantes };
}

if (import.meta.main) {
  checarCriadores()
    .then((r) => console.log(JSON.stringify({ ok: true, totalCriadores: r.totalCriadores, relevantes: r.relevantes.map((v) => v.titulo) }, null, 2)))
    .catch((e) => { console.error("ERRO: " + e.message); process.exit(1); });
}
