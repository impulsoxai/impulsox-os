# Captura de código-fonte de referências

> **Passo de install (uma vez por projeto, antes da captura automática):**
> ```bash
> npm i -D playwright && npx playwright install chromium
> ```
> Sem isso, o script Playwright abaixo falha (`Cannot find module 'playwright'`) e a
> captura **cai para o método manual** — e a skill DEVE avisar isso em voz alta
> (ver "Aviso de fallback" no fim deste arquivo). Nunca degradar em silêncio.

## Onde achar referências premium

- **Awwwards** (awwwards.com) — vencedores de prêmios, o padrão-ouro
- **Godly.website** — curadoria de sites modernos, ótimo para dark/tech
- **Landbook** (land-book.com) — landing pages por categoria
- **Minimal Gallery** — minimalismo refinado
- **Dark Mode Design** — referências dark
- **SaaS Landing Page** (saaslandingpage.com) — específico para SaaS

Critério de escolha: o *estilo* serve ao cliente (não o conteúdo). Para cada projeto, 1 referência de tipografia/layout + 1 de animação/movimento costuma bastar.

## Métodos de download (do mais simples ao mais robusto)

### 1. Ctrl+S no navegador (suficiente em ~70% dos casos)
Abrir o site → `Ctrl+S` → "Página da web, completa". Salva HTML + CSS + assets em uma pasta. Funciona bem para sites estáticos e muitos SPAs já renderizados.

### 2. wget (estáticos)
```bash
wget -p -k -E --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)" https://site.com
```
- `-p`: baixa todos os assets da página
- `-k`: converte links para locais
- `-E`: ajusta extensões
- user-agent evita bloqueios básicos

### 3. SPAs / sites com JS pesado (React, Next, animações via JS)
O HTML inicial vem vazio — é preciso capturar o DOM **renderizado**:
1. Abrir o site, esperar carregar tudo (rolar a página inteira para disparar lazy-load)
2. DevTools → Elements → botão direito no `<html>` → Copy → Copy outerHTML → salvar como `rendered.html`
3. DevTools → Sources (ou aba Network filtrando CSS) → salvar todos os `.css`
4. Para animações via JS: Sources → procurar arquivos não-minificados; se tudo for minificado, capturar pelo menos os keyframes CSS e descrever o comportamento JS observado no prompt de extração

Alternativa automatizada (Playwright). Salvar como `captura.js` e rodar pela toolchain
do projeto, que garante o binário resolvido:
```bash
npx playwright install chromium   # idempotente; pula se já instalado
node captura.js https://site.com
```
```javascript
// captura.js — DOM renderizado + CSS computado de qualquer site, incluindo SPAs.
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error('Playwright indisponível, usando captura manual');
  console.error('Instale com: npm i -D playwright && npx playwright install chromium');
  console.error('Ou use os métodos manuais 1-2 (Ctrl+S / wget) deste arquivo.');
  process.exit(2); // sinaliza fallback — quem chama deve anunciar e cair pro manual
}
(async () => {
  const url = process.argv[2] || 'https://site.com';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  // rolar até o fim para disparar lazy-load e animações de scroll
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 150));
    }
  });
  const html = await page.content();
  require('fs').writeFileSync('rendered.html', html);
  // capturar CSS carregado
  const styles = await page.evaluate(() =>
    [...document.styleSheets].map(s => {
      try { return [...s.cssRules].map(r => r.cssText).join('\n'); }
      catch { return `/* externo: ${s.href} */`; }
    }).join('\n\n')
  );
  require('fs').writeFileSync('styles.css', styles);
  await browser.close();
})().catch(e => { console.error('CAPTURA FALHOU:', e.message); process.exit(1); });
```
Este script é o equivalente caseiro do "Site Downloader". Se ele sair com código 2
("Playwright indisponível"), a skill **avisa em voz alta e passa pro método manual** —
nunca segue calada (ver "Aviso de fallback" abaixo).

## Aviso de fallback — obrigatório

Quando a captura automática falhar (Playwright ausente, exit 2; ou rede/Cloudflare
bloqueando), a skill **anuncia explicitamente** antes de continuar:

> ⚠️ **Playwright indisponível, usando captura manual** — instale com
> `npm i -D playwright && npx playwright install chromium` para captura automática.

Só então segue pelos métodos 1-2 (Ctrl+S / wget) ou pede o `rendered.html` ao usuário.
Degradar em silêncio é proibido: o usuário precisa saber que entrou no caminho manual.

### 4. CSS computado de um elemento específico
Quando só interessa um componente (um botão, um card): DevTools → Elements → selecionar elemento → aba Computed ou Styles → copiar. Útil para extrair um efeito pontual sem baixar o site inteiro.

## Limpeza antes da extração

Remover (ruído que polui o contexto da IA):
- `<script>` de analytics/tracking (GA, GTM, Meta Pixel, Hotjar)
- Meta tags de CMS, comentários de build
- JS minificado ilegível (manter só se contiver keyframes/configs de animação legíveis)
- Conteúdo repetitivo (listas longas de itens idênticos — manter 2 exemplos)

Manter sempre:
- Todo CSS (externo, `<style>`, inline) — é onde mora a identidade
- `@keyframes`, `@font-face`, custom properties (`:root`)
- HTML estrutural de cada tipo de seção (1 exemplo de cada)

## Limites práticos

- Se o total passar de ~3000 linhas após limpeza, dividir a extração: rodar o extractor por seção (hero, depois componentes, depois animações) e consolidar.
- Sites atrás de Cloudflare agressivo podem bloquear wget — usar o método do navegador ou Playwright com `headless: false`.
