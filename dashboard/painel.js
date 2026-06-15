const $ = (id) => document.getElementById(id);

async function atualizar() {
  let e;
  try { e = await (await fetch("/api/estado")).json(); }
  catch { $("atualizado").textContent = "sem conexão com o servidor"; return; }

  $("negocio").textContent = e.negocio;
  $("atualizado").textContent = "atualizado " + new Date(e.atualizado_em).toLocaleTimeString("pt-BR");

  $("ciclo").innerHTML = ["decide", "produz", "publica", "mede"]
    .map((k) => `<div class="etapa"><b>${e.ciclo[k]}</b><span>${k}</span></div>`).join("");

  $("producao").innerHTML =
    `<p>${e.producao.length} peças produzidas · ${e.publicado.length} publicadas</p>` +
    e.producao.map((p) => `<div class="peca">${p.data} · ${p.tipo} · ${p.slug}</div>`).join("");

  const ofertas = e.ofertas.map((o) => `<li>${o}</li>`).join("");
  $("contexto").innerHTML =
    `<p>Degrau ${e.escada.degrau ?? "?"} · ${e.foco.secoes.length} blocos de foco</p>` +
    `<ul>${ofertas}</ul>`;

  const nucleoVazio = e.saude.nucleo.filter((a) => !a.preenchido).map((a) => a.arquivo);
  $("saude").innerHTML =
    `<p>Custo de API: US$ ${e.custos.total.toFixed(2)} (${e.custos.n} gerações)</p>` +
    `<p>${e.saude.pendencias_total} pendências a confirmar</p>` +
    (nucleoVazio.length ? `<p>Núcleo a preencher: ${nucleoVazio.join(", ")}</p>` : `<p>Núcleo completo.</p>`);
}

atualizar();
setInterval(atualizar, 5000);
