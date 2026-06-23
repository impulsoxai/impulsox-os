// Uso: node verificar.mjs <caminho-do-deck.html> <dir-saida>
// Abre o deck, navega slide a slide tirando screenshot de cada um, e um do presenter view.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { mkdirSync } from 'fs';
import { resolve } from 'path';

const deck = process.argv[2];
const outDir = process.argv[3] || '.';
if (!deck) { console.error('uso: node verificar.mjs <deck.html> <dir-saida>'); process.exit(1); }
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(pathToFileURL(resolve(deck)).href);

  const total = await page.$$eval('.slide', s => s.length);
  console.log('slides:', total);
  if (total === 0) console.warn('aviso: nenhum slide encontrado no deck');
  for (let n = 0; n < total; n++) {
    await page.screenshot({ path: resolve(outDir, `slide-${String(n + 1).padStart(2, '0')}.png`) });
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
  }
  await page.keyboard.press('Home');
  await page.keyboard.press('s'); // presenter view
  await page.waitForTimeout(150);
  await page.screenshot({ path: resolve(outDir, 'presenter.png') });
} finally {
  await browser.close();
}
console.log('ok →', outDir);