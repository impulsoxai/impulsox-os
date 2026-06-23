# Widget base — molde do chat injetável

> Molde do widget que a `/agente-ia` adapta com `marca/tokens.css`. Self-contained (1 bloco
> injetável antes de `</body>`). Cores/fonte/raio SAEM dos tokens da marca — substituir os
> `var(--...)` pelos tokens reais do cliente. Acessível e com estado desabilitado honesto.

```html
<!-- ImpulsoX-OS · widget /agente-ia · injetar antes de </body> -->
<div id="ix-chat" data-endpoint="" aria-live="polite">
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
  var endpoint=root.dataset.endpoint;            // setar pro /api/chat do CRM ao instalar
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
  // estado desabilitado honesto: sem endpoint configurado, não finge conversar
  if(!endpoint){form.setAttribute('hidden','');off.removeAttribute('hidden');return;}
  form.addEventListener('submit',function(e){
    e.preventDefault();var t=input.value.trim();if(!t)return;
    add('user',t);msgs.push({role:'user',content:t});input.value='';
    fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages:msgs,page_context:{url:location.href}})})
      .then(function(r){return r.json();})
      .then(function(j){var reply=(j&&j.data&&j.data.reply)||(j&&j.reply);
        if(reply){add('assistant',reply);msgs.push({role:'assistant',content:reply});}
        else{form.setAttribute('hidden','');off.removeAttribute('hidden');}})
      .catch(function(){form.setAttribute('hidden','');off.removeAttribute('hidden');});
  });
})();
</script>
```

**Instalação:** injetar antes de `</body>`; setar `data-endpoint` pro `POST /api/chat` do CRM
do cliente; trocar `[NEGÓCIO]` e `[NUMERO]` do WhatsApp; conferir que os `var(--...)` batem
com os tokens reais da marca. Sem `data-endpoint`, o widget mostra o fallback do WhatsApp (não
finge conversar).
