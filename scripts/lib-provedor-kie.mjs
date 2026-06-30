// Tudo que é específico do kie.ai (auth Bearer, createTask, polling, parse de
// resultJson). KIE_KEY nunca aparece em mensagem de erro. Modelos "createTask"
// genéricos (Kling, Nano Banana, Seedance, OmniHuman...) — Veo usa endpoint
// dedicado, ver submeterTarefaVeo/aguardarResultadoVeo neste mesmo arquivo
// (adicionado em task futura).

import { readFileSync } from "node:fs";

async function jsonSafe(resp) {
  const t = await resp.text();
  try { return JSON.parse(t); } catch { return { _raw: t }; }
}

export async function submeterTarefaKie({ kieKey, base = "https://api.kie.ai", model, input, callBackUrl }) {
  const resp = await fetch(`${base}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: { Authorization: `Bearer ${kieKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input, ...(callBackUrl ? { callBackUrl } : {}) }),
  });
  const j = await jsonSafe(resp);
  if (!resp.ok || j.code !== 200) throw new Error(`kie.ai createTask falhou (${j.code ?? resp.status}): ${j.msg ?? j._raw ?? "erro desconhecido"}`);
  const taskId = j?.data?.taskId;
  if (!taskId) throw new Error(`kie.ai: resposta sem taskId. ${JSON.stringify(j).slice(0, 200)}`);
  return taskId;
}

export async function aguardarResultadoKie({ kieKey, base = "https://api.kie.ai", taskId, intervaloMs = 3000, timeoutMs = 360000 }) {
  const auth = { headers: { Authorization: `Bearer ${kieKey}` } };
  const inicio = Date.now();
  for (;;) {
    const resp = await fetch(`${base}/api/v1/jobs/recordInfo?taskId=${taskId}`, auth);
    const j = await jsonSafe(resp);
    const state = j?.data?.state;
    if (state === "success") {
      const resultJson = j?.data?.resultJson;
      let parsed; try { parsed = JSON.parse(resultJson); } catch { throw new Error(`kie.ai: resultJson inválido. ${String(resultJson).slice(0, 200)}`); }
      return parsed;
    }
    if (state === "fail") throw new Error(`kie.ai: tarefa falhou. ${j?.data?.failMsg || j?.data?.failCode || "sem detalhe"}`);
    if (Date.now() - inicio > timeoutMs) throw new Error(`kie.ai: tarefa não ficou pronta em ${Math.round(timeoutMs / 1000)}s (timeout).`);
    await new Promise((r) => setTimeout(r, intervaloMs));
  }
}

// Veo é caso especial: endpoint próprio (não passa por createTask/recordInfo
// genérico), status via campo successFlag (0=gerando,1=ok,2=falhou,3=falha upstream).

export async function submeterTarefaVeoKie({ kieKey, base = "https://api.kie.ai", prompt, model = "veo3_fast", imageUrls, aspect_ratio, resolution, duration, callBackUrl }) {
  const resp = await fetch(`${base}/api/v1/veo/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${kieKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt, model,
      ...(imageUrls ? { imageUrls } : {}),
      ...(aspect_ratio ? { aspect_ratio } : {}),
      ...(resolution ? { resolution } : {}),
      ...(duration ? { duration } : {}),
      ...(callBackUrl ? { callBackUrl } : {}),
    }),
  });
  const j = await jsonSafe(resp);
  if (!resp.ok || j.code !== 200) throw new Error(`kie.ai Veo falhou (${j.code ?? resp.status}): ${j.msg ?? j._raw ?? "erro desconhecido"}`);
  const taskId = j?.data?.taskId;
  if (!taskId) throw new Error(`kie.ai Veo: resposta sem taskId. ${JSON.stringify(j).slice(0, 200)}`);
  return taskId;
}

export async function aguardarResultadoVeoKie({ kieKey, base = "https://api.kie.ai", taskId, intervaloMs = 3000, timeoutMs = 360000 }) {
  const auth = { headers: { Authorization: `Bearer ${kieKey}` } };
  const inicio = Date.now();
  for (;;) {
    const resp = await fetch(`${base}/api/v1/veo/record-info?taskId=${taskId}`, auth);
    const j = await jsonSafe(resp);
    const flag = j?.data?.successFlag;
    if (flag === 1) {
      const resultUrls = j?.data?.response?.resultUrls;
      if (!resultUrls) throw new Error(`kie.ai Veo: resposta sem resultUrls. ${JSON.stringify(j).slice(0, 200)}`);
      return { resultUrls };
    }
    if (flag === 2 || flag === 3) throw new Error(`kie.ai Veo: geração falhou (successFlag ${flag}).`);
    if (Date.now() - inicio > timeoutMs) throw new Error(`kie.ai Veo: vídeo não ficou pronto em ${Math.round(timeoutMs / 1000)}s (timeout).`);
    await new Promise((r) => setTimeout(r, intervaloMs));
  }
}

// kie.ai não aceita data URI em image_input — exige URL pública. Sobe via
// File Upload API (base64) e devolve downloadUrl. Arquivo expira em 3 dias
// no kie (suficiente pro tempo entre upload e a tarefa consumir a URL).
export async function uploadParaKieAPI(caminho, { kieKey, base = "https://api.kie.ai" } = {}) {
  if (!kieKey) throw new Error("KIE_KEY não definida no ambiente (.env).");
  const ext = caminho.split(".").pop().toLowerCase();
  const mime = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" }[ext] || "application/octet-stream";
  const b64 = readFileSync(caminho).toString("base64");
  const resp = await fetch(`${base}/api/file-base64-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${kieKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ base64Data: `data:${mime};base64,${b64}`, uploadPath: "images" }),
  });
  const j = await jsonSafe(resp);
  if (!resp.ok || j.code !== 200) throw new Error(`kie.ai upload falhou (${j.code ?? resp.status}): ${j.msg ?? j._raw ?? "erro desconhecido"}`);
  const downloadUrl = j?.data?.downloadUrl;
  if (!downloadUrl) throw new Error(`kie.ai upload: resposta sem downloadUrl. ${JSON.stringify(j).slice(0, 200)}`);
  return downloadUrl;
}