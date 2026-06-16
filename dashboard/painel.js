const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const hhmmss = (d) => d.toLocaleTimeString("pt-BR", { hour12: false });
const horaDe = (ts) => { const d = new Date(ts); return isNaN(d) ? "--:--:--" : hhmmss(d); };
const reais = (n) => "US$ " + Number(n || 0).toFixed(2).replace(".", ",");

// relógio
const clock = $("clock");
function tick() { clock.textContent = hhmmss(new Date()); }
tick(); setInterval(tick, 1000);

// status -> classe de tag no feed
const TAG = { ok: "ok", inicio: "pipe", erro: "erro", aviso: "prod" };
// as 4 etapas do ciclo (corrige é o loop de volta, mostrado como selo)
const ETAPAS = [["decide", "Decide"], ["produz", "Produz"], ["publica", "Publica"], ["mede", "Mede"]];

async function atualizar() {
  let e;
  try { e = await (await fetch("/api/estado")).json(); }
  catch {
    document.body.classList.add("offline");
    $("live-label").textContent = "sem conexão";
    return;
  }
  document.body.classList.remove("offline");
  $("live-label").textContent = "Ao vivo";

  $("negocio").textContent = e.negocio;
  $("degrau").textContent = "Degrau " + (e.escada.degrau ?? "—");

  // ── Ao vivo ───────────────────────────────────────────
  const atv = e.atividade || [];
  $("feed-count").textContent = atv.length ? atv.length + " passos" : "ocioso";
  $("feed").innerHTML = atv.length
    ? atv.map((p) => `<li><time>${horaDe(p.ts)}</time>` +
        `<span class="tag ${TAG[p.status] || "get"}">${esc(p.skill)}</span>` +
        `<span class="msg">${esc(p.etapa)}</span></li>`).join("")
    : `<li class="ocioso">sistema ocioso — rode uma skill (ex.: /post) pra ver o passo a passo aqui</li>`;

  // ── Custos de IA ──────────────────────────────────────
  $("cost-total").textContent = reais(e.custos.total);
  $("cost-sub").textContent = (e.custos.n || 0) + " gerações pagas";
  const modelos = Object.entries(e.custos.por_modelo || {});
  $("providers").innerHTML = modelos.length
    ? modelos.map(([m, v]) => `<span class="prov on">${esc(m)} ${reais(v).replace("US$ ", "$")}</span>`).join("")
    : `<span class="prov">sem gasto ainda</span>`;

  // ── O ciclo ───────────────────────────────────────────
  $("counter").innerHTML = ETAPAS.map(([k, nome], i) => {
    const v = e.ciclo[k] ?? 0;
    const cls = v > 0 ? "stage done" : "stage";
    return `<div class="${cls}"><div class="num">${v}</div><div class="name">${nome}</div></div>` +
      (i < ETAPAS.length - 1 ? `<div class="sep">·</div>` : "");
  }).join("");

  // ── Produção & publicado ──────────────────────────────
  $("prod-num").innerHTML = `${e.producao.length}<span class="u">peças · ${e.publicado.length} no ar</span>`;
  const recentes = [...e.producao].sort((a, b) => (b.data || "").localeCompare(a.data || "")).slice(0, 4);
  $("prod-list").innerHTML = recentes
    .map((p) => `<li><time>${esc(p.data || "—")}</time><span class="tag prod">${esc(p.tipo)}</span><span class="msg">${esc(p.slug)}</span></li>`).join("");

  // ── Contexto ──────────────────────────────────────────
  $("ctx-foco").innerHTML = `${e.foco.secoes.length}<small>blocos de foco</small>`;
  $("ctx-ofertas").innerHTML = `${e.ofertas.length}<small>ofertas ativas</small>`;
  $("ctx-list").innerHTML = e.ofertas.length
    ? e.ofertas.map((o) => `<li>${esc(o)}</li>`).join("")
    : `<li>sem oferta ativa</li>`;

  // ── Saúde do núcleo ───────────────────────────────────
  const nuc = e.saude.nucleo || [];
  const cheios = nuc.filter((a) => a.preenchido).length;
  $("saude-num").innerHTML = `${cheios}/${nuc.length}<span class="u">arquivos preenchidos</span>`;
  $("saude-pend").textContent = e.saude.pendencias_total + " pendência(s) a confirmar";
  $("nucleo-pills").innerHTML = nuc
    .map((a) => `<span class="np ${a.preenchido ? "on" : ""}">${esc(a.arquivo.replace(".md", ""))}</span>`).join("");
}

atualizar();
setInterval(atualizar, 2000);
