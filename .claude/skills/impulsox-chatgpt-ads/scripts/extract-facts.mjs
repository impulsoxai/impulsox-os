#!/usr/bin/env node
/**
 * extract-facts.mjs — Step 0.5 of the ImpulsoX ChatGPT Ads workflow.
 *
 * Extracts structured facts from a client site using Firecrawl (map → select → batchScrape).
 * Writes a fact-sheet.json that is the single source of truth for every factual claim in copy.
 *
 * Usage:
 *   node extract-facts.mjs <url> [outputPath] [--refresh]
 *
 * The script NEVER sets extraction_complete = true; only the operator does that in Step 0.6.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { URL as NodeURL } from "node:url";

// ── SDK import (global firecrawl-cli node_modules) ───────────────────────────
const FIRECRAWL_SDK_PATH =
  "C:/Users/ACER/AppData/Roaming/npm/node_modules/firecrawl-cli/node_modules/@mendable/firecrawl-js/dist/index.js";

const _require = createRequire(import.meta.url);
const { Firecrawl } = _require(FIRECRAWL_SDK_PATH);

// ── Credentials loader ────────────────────────────────────────────────────────
function loadApiKey() {
  // 1. Env var takes precedence
  if (process.env.FIRECRAWL_API_KEY) return process.env.FIRECRAWL_API_KEY;

  // 2. Stored credentials from firecrawl-cli login
  const credPath = join(homedir(), "AppData", "Roaming", "firecrawl-cli", "credentials.json");
  if (existsSync(credPath)) {
    try {
      const creds = JSON.parse(readFileSync(credPath, "utf8"));
      if (creds?.apiKey) return creds.apiKey;
    } catch {
      // ignore malformed credentials file
    }
  }

  return null;
}

// ── URL filter heuristics ─────────────────────────────────────────────────────
const RELEVANT_PATH_SUBSTRINGS = [
  "",           // homepage / root (every URL has a pathname with at least "/")
  "/menu",
  "/cardapio",
  "/cardápio",
  "/about",
  "/sobre",
  "/hours",
  "/horarios",
  "/horários",
  "/reservations",
  "/book",
  "/reservas",
];

function isRelevantUrl(urlStr) {
  try {
    const u = new NodeURL(urlStr);
    const pathname = u.pathname.toLowerCase();
    return RELEVANT_PATH_SUBSTRINGS.some((sub) => pathname.includes(sub));
  } catch {
    return false;
  }
}

// ── Monetary helpers ──────────────────────────────────────────────────────────
const PRICE_RE = /\$\s*([\d,]+(?:\.\d{1,2})?)/g;
const ITEM_PRICE_RE =
  /([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s'\-]{2,40}?)\s*[\-–—:]\s*\$\s*([\d,]+(?:\.\d{1,2})?)/g;

function toMinorUnits(dollarStr) {
  const n = parseFloat(dollarStr.replace(/,/g, ""));
  return Math.round(n * 100);
}

// ── Text parsers ──────────────────────────────────────────────────────────────
function parseBusinessName(texts) {
  // Strategy: look for OG title, first H1, or <title> tag content from aggregated markdown
  const combined = texts.join("\n");

  // Common markdown H1
  const h1 = combined.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();

  // "Welcome to X" pattern
  const welcome = combined.match(/welcome\s+to\s+([A-Z][^\n|]{2,50})/i);
  if (welcome) return welcome[1].trim();

  return "";
}

function parsePrices(texts) {
  const combined = texts.join("\n");
  const prices = [];
  const seen = new Set();

  let match;
  ITEM_PRICE_RE.lastIndex = 0;
  while ((match = ITEM_PRICE_RE.exec(combined)) !== null) {
    const item = match[1].trim();
    const amount_minor = toMinorUnits(match[2]);
    const key = `${item}|${amount_minor}`;
    if (!seen.has(key) && item.length >= 3) {
      seen.add(key);
      prices.push({ item, amount_minor, currency: "USD", covers: "" });
    }
  }

  return prices;
}

function parseMenuItems(texts) {
  // Extract lines that look like menu item names (title-case, not headers)
  const combined = texts.join("\n");
  const items = new Set();
  const lines = combined.split("\n");
  for (const line of lines) {
    const clean = line.replace(/[#*_`>]/g, "").trim();
    // Heuristic: 3–60 chars, starts with capital, no URL, no long sentence
    if (clean.length >= 3 && clean.length <= 60 && /^[A-ZÀ-Ö]/.test(clean) && !clean.includes("http")) {
      items.add(clean);
    }
  }
  return Array.from(items).slice(0, 50);
}

function parseHours(texts) {
  const combined = texts.join("\n");
  const hours = [];
  // Pattern: "Monday 11am - 9pm" or "Mon-Fri: 11:00 AM – 10:00 PM"
  const DAY_RE =
    /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Mon[- ]Fri|Mon[- ]Sun|Daily|Weekday[s]?|Weekend[s]?)\b[:\s]+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm|AM|PM))\s*[-–—to]+\s*([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm|AM|PM))/gi;
  let m;
  while ((m = DAY_RE.exec(combined)) !== null) {
    hours.push({ day: m[1].trim(), open: m[2].trim(), close: m[3].trim() });
  }
  return hours;
}

function parseAddress(texts) {
  const combined = texts.join("\n");
  // Look for a street address pattern
  const addr = combined.match(/\d{1,5}\s+[A-Z][^\n,]{5,60},\s*[A-Z][a-z]+,?\s*[A-Z]{2}\s*\d{5}/);
  return addr ? addr[0].trim() : "";
}

function parseReservationMethod(texts) {
  const combined = texts.join("\n").toLowerCase();
  if (combined.includes("opentable")) return "OpenTable";
  if (combined.includes("resy")) return "Resy";
  if (combined.includes("tock")) return "Tock";
  if (combined.includes("yelp")) return "Yelp";
  if (combined.includes("reserve") || combined.includes("book a table") || combined.includes("book online"))
    return "Online reservation (platform not identified)";
  if (combined.includes("call") || combined.includes("phone")) return "Phone";
  return "";
}

function parseSiteClaims(texts) {
  const combined = texts.join("\n");
  const claims = [];
  // Short boast sentences that include superlatives or brand words
  const boastRe =
    /(?:we\s+(?:are|offer|serve|pride)|best\s+\w+|award[\-\s]winning|family[\-\s]owned|fresh\s+\w+|locally\s+sourced|made\s+from\s+scratch|[0-9]+\+?\s+years?)[^.!?\n]{0,120}[.!?]/gi;
  let m;
  while ((m = boastRe.exec(combined)) !== null) {
    const claim = m[0].trim();
    if (claim.length >= 15 && claim.length <= 200) claims.push(claim);
  }
  return [...new Set(claims)].slice(0, 15);
}

// ── Normalise raw Firecrawl documents into a fact sheet ───────────────────────
function normalizeToFactSheet(domain, documents) {
  const texts = documents
    .map((d) => d.markdown || d.content || "")
    .filter(Boolean);

  const prices = parsePrices(texts);
  // If any price lacks covers, extraction_complete stays false (always false from this script anyway)
  const hasUnclearCovers = prices.some((p) => p.covers === "");

  const factSheet = {
    domain,
    scraped_at: new Date().toISOString(),
    business_name: parseBusinessName(texts),
    prices,
    menu_items: parseMenuItems(texts),
    hours: parseHours(texts),
    address: parseAddress(texts),
    reservation_method: parseReservationMethod(texts),
    site_claims: parseSiteClaims(texts),
    extraction_complete: false, // ALWAYS false — only operator sets true in Step 0.6
  };

  // Optional fields — only include if found
  // rating and review_count require structured data we don't auto-detect well;
  // leave them absent unless explicitly parseable
  // (schema marks them as optional / not in required[])

  return factSheet;
}

// ── Cache helpers ─────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCacheDir() {
  return join(process.cwd(), ".firecrawl-cache");
}

function getCachePath(domain) {
  return join(getCacheDir(), `${domain}-fact-sheet.json`);
}

function loadCache(domain) {
  const cachePath = getCachePath(domain);
  if (!existsSync(cachePath)) return null;
  try {
    const cached = JSON.parse(readFileSync(cachePath, "utf8"));
    const age = Date.now() - new Date(cached.scraped_at).getTime();
    if (age < CACHE_TTL_MS) return cached;
  } catch {
    // Corrupted cache — treat as miss
  }
  return null;
}

function saveCache(domain, factSheet) {
  const cacheDir = getCacheDir();
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
  writeFileSync(getCachePath(domain), JSON.stringify(factSheet, null, 2), "utf8");
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const forceRefresh = args.includes("--refresh");
  const positional = args.filter((a) => !a.startsWith("--"));

  const siteUrl = positional[0];
  if (!siteUrl) {
    console.error("Usage: node extract-facts.mjs <url> [outputPath] [--refresh]");
    process.exit(1);
  }

  let domain;
  try {
    domain = new NodeURL(siteUrl).hostname.replace(/^www\./, "");
  } catch {
    console.error(`[error] Invalid URL: ${siteUrl}`);
    process.exit(1);
  }

  const defaultOutput = `./${domain}-fact-sheet.json`;
  const outputPath = resolve(positional[1] ?? defaultOutput);

  // ── Cache check ──
  if (!forceRefresh) {
    const cached = loadCache(domain);
    if (cached) {
      console.log(`[cache hit] ${domain} (scraped ${cached.scraped_at})`);
      writeFileSync(outputPath, JSON.stringify(cached, null, 2), "utf8");
      console.log(`[output] ${outputPath}`);
      return;
    }
  }

  // ── Init SDK ──
  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error(
      "[error] No Firecrawl API key found. Run `firecrawl config` or set FIRECRAWL_API_KEY."
    );
    process.exit(1);
  }

  const app = new Firecrawl({ apiKey });

  // ── Step 1: map ──
  console.log(`[map] ${siteUrl}`);
  let mapData;
  try {
    mapData = await app.map(siteUrl);
  } catch (err) {
    console.error(`[error] map failed: ${err?.message ?? err}`);
    process.exit(1);
  }

  if (!mapData?.links || mapData.links.length === 0) {
    console.error("[error] map returned no links. Cannot proceed with scrape.");
    process.exit(1);
  }

  const allUrls = mapData.links.map((l) => (typeof l === "string" ? l : l.url)).filter(Boolean);
  console.log(`[map] Found ${allUrls.length} total URLs`);

  // ── Step 2: select ──
  let selectedUrls = allUrls.filter(isRelevantUrl);

  if (selectedUrls.length === 0) {
    console.warn("[warn] No URLs matched the relevance filter — falling back to homepage only.");
    selectedUrls = [siteUrl];
  }

  console.log(`[select] ${selectedUrls.length} URLs selected for scraping`);

  // ── Step 3: batchScrape ──
  const scrapeOptions = {
    options: {
      formats: ["markdown"],
      onlyMainContent: true,
      parsers: [{ type: "pdf", mode: "auto" }], // PDF parsing enabled
    },
  };

  console.log(`[scrape] Starting batch scrape of ${selectedUrls.length} URL(s)…`);
  let batchJob;
  try {
    // CRITICAL: limit is exactly selectedUrls.length — never a rounder placeholder
    batchJob = await app.batchScrape(selectedUrls.slice(0, selectedUrls.length), scrapeOptions);
  } catch (err) {
    const status = err?.status ?? err?.response?.status ?? "";
    const statusStr = status ? ` (status ${status})` : "";
    console.error(`[error] batchScrape failed${statusStr}: ${err?.message ?? err}`);
    // Do NOT write partial fact sheet
    process.exit(1);
  }

  if (!batchJob || batchJob.status === "failed" || batchJob.status === "cancelled") {
    console.error(`[error] Batch scrape ended with status: ${batchJob?.status ?? "unknown"}`);
    process.exit(1);
  }

  const documents = batchJob.data ?? [];
  if (documents.length === 0) {
    console.error("[error] Batch scrape returned zero documents.");
    process.exit(1);
  }

  console.log(`[scrape] Received ${documents.length} document(s)`);

  // ── Normalize ──
  const factSheet = normalizeToFactSheet(domain, documents);

  // ── Save cache ──
  saveCache(domain, factSheet);

  // ── Write output ──
  writeFileSync(outputPath, JSON.stringify(factSheet, null, 2), "utf8");
  console.log(`[output] ${outputPath}`);
}

main().catch((err) => {
  console.error(`[fatal] ${err?.message ?? err}`);
  process.exit(1);
});
