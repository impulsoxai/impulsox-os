# Captura de telas + texto da página (para revisão)

> Este script renderiza uma página (HTML local OU URL) em três tamanhos de tela
> (390px mobile, 768px tablet, 1440px desktop) e extrai o texto visível dela. As
> imagens alimentam a revisão de design, o texto alimenta a revisão de copy. É o que
> dá ao agente avaliador o material para julgar a página em design e copy de uma vez.

> **Passo de install (uma vez por projeto, antes da captura automática):**
> ```bash
> npm i -D playwright && npx playwright install chromium
> ```
> Sem isso, o script abaixo sai com **código 2** (`Cannot find module 'playwright'`) e a
> revisão **cai para o modo manual** (pedir os screenshots ao usuário). A skill DEVE avisar
> isso em voz alta (ver "Aviso de fallback" no fim deste arquivo). Nunca degradar em silêncio.

## O script

Salvar como `captura-screens.js` e rodar pela toolchain do projeto, que garante o binário
resolvido.

```javascript
// captura-screens.js: screenshots 390/768/1440 + texto da pagina (local ou URL)
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) {
  console.error('Playwright indisponível, usando captura manual');
  console.error('Instale: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}
(async () => {
  const alvo = process.argv[2];                 // caminho local ou URL
  const outDir = process.argv[3] || '.';
  const url = alvo.startsWith('http') ? alvo : 'file:///' + alvo.split('\\').join('/');
  const browser = await chromium.launch();
  const sizes = [[390,844,'mobile'],[768,1024,'tablet'],[1440,900,'desktop']];
  let texto = '';
  for (const [w,h,nome] of sizes) {
    const page = await browser.newPage({ viewport:{width:w,height:h} });
    await page.goto(url, { waitUntil:'networkidle', timeout:60000 });
    await page.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));} window.scrollTo(0,0); });
    await page.screenshot({ path: outDir+'/shot-'+nome+'.png', fullPage:true });
    if (!texto) texto = await page.evaluate(()=>document.body.innerText);
    await page.close();
  }
  require('fs').writeFileSync(outDir+'/texto.txt', texto);
  await browser.close();
  console.log('OK screenshots + texto.txt em ' + outDir);
})().catch(e=>{ console.error('CAPTURA FALHOU:', e.message); process.exit(1); });
```

## Uso

```bash
node <caminho>/captura-screens.js <html-ou-url> <pasta-saida>
```

O segundo argumento é a página alvo (arquivo HTML local ou URL completa), o terceiro é a
pasta onde gravar a saída (opcional, padrão é a pasta atual).

Exemplo com arquivo local:
```bash
node captura-screens.js "C:\clientes\acme\pagina\index.html" "C:\tmp\revisao-acme"
```

Exemplo com URL:
```bash
node captura-screens.js https://www.cliente.com.br "C:\tmp\revisao-cliente"
```

O que ele gera na pasta de saída:
- `shot-mobile.png` (390px), `shot-tablet.png` (768px), `shot-desktop.png` (1440px): a página
  inteira (fullPage) em cada tamanho, com o lazy-load disparado pela rolagem.
- `texto.txt`: o texto visível da página (innerText do body), capturado uma vez.

## Aviso de fallback (obrigatório)

Quando a captura automática falhar, a skill **anuncia explicitamente** antes de continuar:

> ⚠️ **Playwright indisponível / captura falhou.** Instale com
> `npm i -D playwright && npx playwright install chromium` para captura automática.

Dois casos:
- **Código 2** (Playwright ausente): o módulo não está instalado. A skill avisa e pede ao
  usuário que rode o install acima, **ou** que forneça os screenshots das 3 telas
  (mobile/tablet/desktop) manualmente.
- **Falha de execução** (rede, timeout, exit 1): a página não carregou ou demorou demais. A
  skill avisa, sugere conferir a URL/o caminho do HTML, e cai pro manual: pedir os screenshots
  das 3 telas ao usuário.

Degradar em silêncio é proibido: o usuário precisa saber que a revisão entrou no caminho
manual e por quê.

## Nota: páginas com animação contínua

O script usa `waitUntil:'networkidle'`, que espera a rede ficar ociosa antes de capturar. Em
sites com animação contínua (vídeo em loop, partículas, polling que nunca para de pedir rede),
o estado "idle" pode nunca chegar e o `goto` estoura o timeout de 60s.

Nesse caso, trocar a linha do `goto` por uma que não espera o idle:
```javascript
await page.goto(url, { waitUntil:'domcontentloaded', timeout:60000 });
await page.waitForTimeout(3000);   // dá tempo de a página assentar
```
`domcontentloaded` libera assim que o HTML é parseado, e o `waitForTimeout(3000)` dá 3 segundos
para fontes, imagens e a primeira dobra assentarem antes do screenshot.
