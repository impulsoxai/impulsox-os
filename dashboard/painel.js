const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

// as 4 etapas do ciclo (a 5ª, "corrige", é o loop de volta — mostrada como selo)
const ETAPAS = [
  ["decide", "Decide", "calendário"],
  ["produz", "Produz", "peças"],
  ["publica", "Publica", "no ar"],
  ["mede", "Mede", "aprendizados"],
];

async function atualizar() {
  let e;
  try { e = await (await fetch("/api/estado")).json(); }
  catch {
    document.body.classList.add("offline");
    $("atualizado").innerHTML = "<i></i> sem conexão";
    return;
  }
  document.body.classList.remove("offline");

  $("negocio").textContent = e.negocio;
  $("degrau").textContent = "Degrau " + (e.escada.degrau ?? "—");
  $("atualizado").innerHTML = "<i></i> " + new Date(e.atualizado_em).toLocaleTimeString("pt-BR");

  // ── ao vivo (passo a passo do sistema) ────────────────
  const hora = (ts) => { const d = new Date(ts); return isNaN(d) ? "--:--:--" : d.toLocaleTimeString("pt-BR"); };
  const atv = e.atividade || [];
  $("atividade").innerHTML = atv.length
    ? atv.map((p, i) => `<div class="passo ${i === 0 ? "novo" : ""}">` +
        `<span class="hora">${hora(p.ts)}</span>` +
        `<span class="st st-${esc(p.status)}" aria-hidden="true"></span>` +
        `<span class="sk">${esc(p.skill)}</span>` +
        `<span class="et">${esc(p.etapa)}</span></div>`).join("")
    : `<div class="ocioso">sistema ocioso — rode uma skill (ex.: /post) pra ver o passo a passo aqui</div>`;

  // ── ciclo (protagonista) ──────────────────────────────
  $("ciclo").innerHTML = ETAPAS.map(([k, label, sub], i) =>
    `<div class="etapa"><span class="num">${e.ciclo[k]}</span>` +
    `<span class="et-label">${label}</span><span class="et-sub">${sub}</span></div>` +
    (i < ETAPAS.length - 1 ? `<span class="seta" aria-hidden="true">&rarr;</span>` : "")
  ).join("") + `<span class="corrige">&#8635; corrige</span>`;

  // ── produção & publicado ──────────────────────────────
  const porTipo = {};
  for (const p of e.producao) porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
  const chips = Object.entries(porTipo)
    .map(([t, n]) => `<span class="chip">${esc(t)} <b>${n}</b></span>`).join("");
  const recentes = [...e.producao]
    .sort((a, b) => (b.data || "").localeCompare(a.data || "")).slice(0, 5)
    .map((p) => `<div class="linha"><span class="data">${esc(p.data || "—")}</span>` +
      `<span class="tipo-tag">${esc(p.tipo)}</span><span class="slug">${esc(p.slug)}</span></div>`).join("");
  $("producao").innerHTML =
    `<div class="destaque"><b>${e.producao.length}</b> produzidas <span class="sep">/</span> <b>${e.publicado.length}</b> no ar</div>` +
    `<div class="chips">${chips}</div><div class="lista">${recentes}</div>`;

  // ── contexto ──────────────────────────────────────────
  const ofertas = e.ofertas.map((o) => `<span class="oferta">${esc(o)}</span>`).join("");
  $("contexto").innerHTML =
    `<div class="destaque"><b>${e.foco.secoes.length}</b> blocos de foco <span class="sep">/</span> <b>${e.ofertas.length}</b> ofertas ativas</div>` +
    `<div class="ofertas">${ofertas || '<span class="vazio">sem oferta ativa</span>'}</div>`;

  // ── custos & saúde ────────────────────────────────────
  const dots = e.saude.nucleo.map((a) =>
    `<span class="dot ${a.preenchido ? "on" : "off"}" title="${esc(a.arquivo)}">${esc(a.arquivo.replace(".md", ""))}</span>`).join("");
  $("saude").innerHTML =
    `<div class="custo"><span class="cifra">US$ ${e.custos.total.toFixed(2)}</span><span class="cd">${e.custos.n} gerações</span></div>` +
    `<div class="pend">${e.saude.pendencias_total} pendência(s) a confirmar</div>` +
    `<div class="nucleo">${dots}</div>`;
}

atualizar();
setInterval(atualizar, 2000);
