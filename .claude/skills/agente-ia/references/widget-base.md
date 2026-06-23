# Widget base — molde do chat injetável

> Molde do widget que a `/agente-ia` adapta com `marca/tokens.css`. Self-contained (1 bloco
> injetável antes de `</body>`). Cores/fonte/raio SAEM dos tokens da marca — substituir os
> `var(--...)` pelos tokens reais do cliente. Acessível e com estado desabilitado honesto.

```html
<!-- ImpulsoX-OS · widget /agente-ia · injetar antes de </body> -->
<div id="ix-chat" data-endpoint="" data-site-key="" aria-live="polite">
  <button id="ix-chat-bubble" aria-label="Abrir conversa com o assistente" aria-expanded="false">
    <!-- ícone simples; trocar por SVG da marca se houver -->
    <span aria-hidden="true">💬</span>
  </button>
  <div id="ix-chat-window" role="dialog" aria-label="Assistente de [NEGÓCIO]" hidden>
    <header id="ix-chat-head">[NEGÓCIO] · assistente</header>
    <div id="ix-chat-log" role="log"></div>
    <form id="ix-chat-form">
      <label class="sr-only" for="ix-chat-input">Sua mensagem</label>
      <input id="ix-chat-input" autocomplete="off" placeholder="Tire sua dúvida…" />
      <button type="submit" aria-label="Enviar">→</button>
    </form>
    <p id="ix-chat-off" hidden>Assistente fora do ar agora. Fale no
      <a href="https://wa.me/[NUMERO]">WhatsApp</a>.</p>
  </div>
</div>

<style>
  /* tudo sai dos tokens da marca — substituir pelos reais */
  #ix-chat{position:fixed;right:20px;bottom:20px;z-index:9999;
    font-family:var(--font-body,system-ui)}
  #ix-chat-bubble{width:56px;height:56px;border-radius:var(--radius-full,999px);
    border:0;background:var(--cor-destaque,#101418);color:#fff;font-size:24px;cursor:pointer;
    box-shadow:0 6px 24px rgba(0,0,0,.18)}
  #ix-chat-window{position:absolute;right:0;bottom:68px;width:340px;max-width:86vw;
    background:var(--cor-fundo,#fff);color:var(--cor-texto,#101418);
    border-radius:var(--radius,16px);box-shadow:0 12px 40px rgba(0,0,0,.22);overflow:hidden}
  #ix-chat-head{padding:14px 16px;background:var(--cor-destaque,#101418);color:#fff;
    font-weight:700}
  #ix-chat-log{height:300px;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
  #ix-chat-log .u{align-self:flex-end;background:var(--cor-destaque,#101418);color:#fff;
    padding:8px 12px;border-radius:12px;max-width:80%}
  #ix-chat-log .a{align-self:flex-start;background:rgba(0,0,0,.06);
    padding:8px 12px;border-radius:12px;max-width:80%}
  #ix-chat-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(0,0,0,.08)}
  #ix-chat-input{flex:1;padding:10px;border:1px solid rgba(0,0,0,.15);border-radius:10px}
  #ix-chat-form button{border:0;background:var(--cor-destaque,#101418);color:#fff;
    border-radius:10px;width:44px;cursor:pointer}
  #ix-chat-off{padding:12px;margin:0;font-size:14px}
  .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
  @media (prefers-reduced-motion:no-preference){#ix-chat-window{transition:opacity .2s}}
</style>

<script>
(function(){
  var root=document.getElementById('ix-chat');
  var endpoint=root.dataset.endpoint;            // URL do /api/chat do CRM
  var siteKey=root.dataset.siteKey;              // chave PÚBLICA do tenant (ixs_pub_...)
  var bubble=document.getElementById('ix-chat-bubble');
  var win=document.getElementById('ix-chat-window');
  var log=document.getElementById('ix-chat-log');
  var form=document.getElementById('ix-chat-form');
  var input=document.getElementById('ix-chat-input');
  var off=document.getElementById('ix-chat-off');
  var msgs=[];
  bubble.addEventListener('click',function(){
    var open=win.hasAttribute('hidden');
    if(open){win.removeAttribute('hidden');bubble.setAttribute('aria-expanded','true');input.focus();}
    else{win.setAttribute('hidden','');bubble.setAttribute('aria-expanded','false');}
  });
  function add(role,text){var d=document.createElement('div');d.className=role==='user'?'u':'a';
    d.textContent=text;log.appendChild(d);log.scrollTop=log.scrollHeight;}
  // estado desabilitado honesto: sem endpoint OU sem chave, não finge conversar
  if(!endpoint||!siteKey){form.setAttribute('hidden','');off.removeAttribute('hidden');return;}
  function fail(){form.setAttribute('hidden','');off.removeAttribute('hidden');}
  form.addEventListener('submit',function(e){
    e.preventDefault();var t=input.value.trim();if(!t)return;
    add('user',t);msgs.push({role:'user',content:t});input.value='';
    // body sem system: a persona fica guardada no CRM, resolvida pela chave do tenant
    fetch(endpoint,{method:'POST',headers:{
        'Content-Type':'application/json',
        'x-impulsox-site':siteKey              // chave pública resolve o tenant no CRM
      },
      body:JSON.stringify({messages:msgs,page_context:{url:location.href}})})
      .then(function(r){return r.json();})
      .then(function(j){
        var d=(j&&j.data)||j||{};
        if(d.reply){add('assistant',d.reply);msgs.push({role:'assistant',content:d.reply});}
        else{fail();}
        // d.capture (lead fechado) é tratado pelo CRM — cria o Contact server-side;
        // o widget não faz nada com PII no front.
      })
      .catch(fail);
  });
})();
</script>
```

**Instalação:** injetar antes de `</body>`; preencher os dois `data-`:
- `data-endpoint` → URL do `POST /api/chat` do CRM.
- `data-site-key` → a **chave pública** do tenant no CRM (`ixs_pub_...`), gerada na aba
  Integrações do CRM. É pública por desenho (vai pro front); o dano máximo se vazar é abusar
  do chat daquele tenant, contido pelo rate-limit do CRM. **Nunca** usar aqui o service token
  secreto (`ixk_live_...`) nem o `tenant_id` cru.

Trocar `[NEGÓCIO]` e `[NUMERO]` do WhatsApp; conferir que os `var(--...)` batem com os tokens
reais da marca. Faltando `data-endpoint` OU `data-site-key`, o widget mostra o fallback do
WhatsApp (não finge conversar).

**A persona NÃO vai no widget** — fica guardada no CRM por tenant; a `data-site-key` resolve
o tenant e o CRM carrega a persona certa. O OS sobe a persona uma vez via o endpoint de
gestão do CRM (JWT-only). Persona nunca toca o front.
