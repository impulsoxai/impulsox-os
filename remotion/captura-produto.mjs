#!/usr/bin/env node
// captura-produto.mjs — tira screenshot (top + full) das landing pages de producao/paginas/
// pro reel mostrar a página real no Browser-mockup. Salva em public/paginas/<slug>-{top,full}.png.
// Uso: node remotion/captura-produto.mjs <slug>=<caminho-html> [<slug2>=<caminho2> ...]
// Ex:  node remotion/captura-produto.mjs restaurante=producao/paginas/demos/restaurante/index.html
//
// IMPORTANTE: rola a página inteira ANTES do screenshot. Páginas com animação scroll-triggered
// (IntersectionObserver, comum em landing premium) saem PRETAS nas seções de baixo se capturadas
// paradas — só animam quando entram na viewport. O scroll dispara isso.
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
if (!args.length) {
  console.error("uso: node remotion/captura-produto.mjs <slug>=<caminho-html> [...]");
  process.exit(1);
}
const out = resolve(process.cwd(), "public", "paginas");
mkdirSync(out, { recursive: true });

const alvos = args.map((a) => {
  const i = a.indexOf("=");
  return { slug: a.slice(0, i), path: resolve(process.cwd(), a.slice(i + 1)) };
});

const browser = await chromium.launch();
for (const p of alvos) {
  if (!existsSync(p.path)) { console.log("FALTA " + p.path); continue; }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(p.path).href, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1000);
  // rola a página inteira devagar pra disparar as animações scroll-triggered
  const altura = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < altura; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${p.slug}-top.png` });
  await page.screenshot({ path: `${out}/${p.slug}-full.png`, fullPage: true });
  console.log("ok " + p.slug);
  await ctx.close();
}
await browser.close();
console.log("FIM");
