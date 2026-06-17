// lib-youtube-upload.mjs — funções puras pro upload no YouTube (Fase 3). ZERO deps, sem
// rede: montam corpo de request, validam e detectam short. ImpulsoX AI.

// Short do YouTube = vídeo vertical (altura > largura) com duração até 180s.
export function detectarShort({ largura, altura, duracaoSeg }) {
  return Number(altura) > Number(largura) && Number(duracaoSeg) <= 180;
}

// Monta o corpo do videos.insert (snippet + status). categoryId 27 = Education.
// ehShort: garante "#Shorts" no fim da descrição (sem duplicar).
export function montarMetadados({ titulo, descricao, tags = [], privacidade = "private", categoria = "27", ehShort = false }) {
  let description = descricao || "";
  if (ehShort && !/#Shorts\b/i.test(description)) description = `${description}\n\n#Shorts`;
  return {
    snippet: { title: titulo, description, tags, categoryId: categoria },
    status: { privacyStatus: privacidade, selfDeclaredMadeForKids: false },
  };
}

// Valida os campos do upload e devolve lista de erros acionáveis (PT). Vazia = ok.
export function validarUpload({ arquivo, titulo, descricao = "" }) {
  const erros = [];
  if (!arquivo) erros.push("arquivo de vídeo não informado.");
  if (!titulo) erros.push("título ausente.");
  else if (titulo.length > 100) erros.push(`título passa de 100 caracteres (tem ${titulo.length}).`);
  if (descricao.length > 5000) erros.push(`descrição passa de 5000 caracteres (tem ${descricao.length}).`);
  return erros;
}

// Texto legível pro modo assistido (sem credencial): o dono arrasta o vídeo no Studio e
// cola estes metadados. Não publica nada — só prepara.
export function montarPacoteAssistido({ slug, final, metadados, thumb }) {
  const s = metadados.snippet, st = metadados.status;
  return [
    `# Upload assistido — ${slug}`,
    ``,
    `Vídeo: ${final}`,
    thumb ? `Thumbnail: ${thumb}` : `Thumbnail: (nenhuma — short usa o próprio frame)`,
    ``,
    `Título: ${s.title}`,
    `Tags: ${(s.tags || []).join(", ")}`,
    `Privacidade: ${st.privacyStatus}`,
    ``,
    `Descrição:`,
    s.description,
    ``,
    `--- Passo a passo ---`,
    `1. Abra https://studio.youtube.com → Criar → Enviar vídeos.`,
    `2. Selecione o arquivo acima.`,
    `3. Cole título, descrição e tags. Deixe a privacidade em ${st.privacyStatus}.`,
    `4. Revise no player e publique você mesmo.`,
    ``,
  ].join("\n");
}
