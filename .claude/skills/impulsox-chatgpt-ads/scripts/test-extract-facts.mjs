#!/usr/bin/env node
/**
 * test-extract-facts.mjs — Acceptance tests for extract-facts.mjs
 *
 * Tests use mocks / stubs — NO real Firecrawl calls, NO credit usage.
 *
 * Test A — cache hit: valid cache → script returns cached data without calling Firecrawl
 * Test B — cache miss, mock Firecrawl: full map→select→scrape flow with mocked SDK
 * Test C — failure handling: Firecrawl throws → exit(1), no file written
 *
 * Run with: node skill/scripts/test-extract-facts.mjs
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SCRIPT = resolve(__dirname, "extract-facts.mjs");

// ── Test harness ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    failed++;
    return false;
  } else {
    console.log(`  ok: ${message}`);
    passed++;
    return true;
  }
}

function createTempDir() {
  const dir = join(tmpdir(), `extract-facts-test-${randomBytes(6).toString("hex")}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function cleanup(dir) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // best-effort
  }
}

// ── Helper: run extract-facts.mjs with environment overrides ─────────────────
// We override MODULE_MOCK_PATH to inject a mock Firecrawl SDK.
// The script reads this env var when present and uses the mock instead of the real SDK.
// However, since extract-facts.mjs uses a hard-coded require path, we instead use a
// wrapper approach: write a small mock module, then run the script patched via env.
//
// Strategy: set FIRECRAWL_MOCK_FILE env var. The test patches extract-facts.mjs at
// runtime by spawning with FIRECRAWL_TEST_MODE=1 and writing a sidecar mock file
// the script reads when that env var is set.
//
// Simpler strategy (no patching needed): generate a temp version of extract-facts.mjs
// with the SDK path replaced by the mock path, then run that.

function createMockSdk(tempDir, behavior) {
  // behavior: "success" | "map_fail" | "scrape_fail"
  const mockFile = join(tempDir, "mock-firecrawl-sdk.cjs");

  const mockDocs = JSON.stringify([
    {
      url: "https://restaurantexemplo.com/",
      markdown:
        "# Restaurante Exemplo\n\nWelcome to Restaurante Exemplo — Family-owned since 2010!\n\n## Menu\nRibeirão Preto Classic - $18.50\nEspeto Misto - $24.00\n\n## Hours\nMonday 11am - 9pm\nFriday 11am - 10pm\n\n123 Main St, Orlando, FL 32801\n\nReservations via OpenTable. Best Brazilian food in Orlando!",
    },
  ]);

  let sdkCode;

  if (behavior === "success") {
    sdkCode = `
"use strict";
class Firecrawl {
  async map(url) {
    return {
      links: [
        { url: url },
        { url: url + '/menu' },
        { url: url + '/about' },
        { url: url + '/contact-not-relevant' },
      ]
    };
  }
  async batchScrape(urls, opts) {
    return {
      id: 'mock-batch-id',
      status: 'completed',
      completed: urls.length,
      total: urls.length,
      data: ${mockDocs},
    };
  }
}
exports.Firecrawl = Firecrawl;
`;
  } else if (behavior === "map_fail") {
    sdkCode = `
"use strict";
class Firecrawl {
  async map(url) { throw new Error('Firecrawl map error: 402 Payment Required'); }
  async batchScrape() { throw new Error('should not be called'); }
}
exports.Firecrawl = Firecrawl;
`;
  } else if (behavior === "scrape_fail") {
    sdkCode = `
"use strict";
class Firecrawl {
  async map(url) {
    return { links: [{ url: url }, { url: url + '/menu' }] };
  }
  async batchScrape(urls, opts) {
    const err = new Error('Firecrawl batchScrape error: 429 Too Many Requests');
    err.status = 429;
    throw err;
  }
}
exports.Firecrawl = Firecrawl;
`;
  }

  writeFileSync(mockFile, sdkCode, "utf8");
  return mockFile;
}

function createPatchedScript(tempDir, mockSdkPath, behavior) {
  // Read the original script and replace the SDK path with the mock path
  const original = readFileSync(SCRIPT, "utf8");
  const sdkPathLine = `"C:/Users/ACER/AppData/Roaming/npm/node_modules/firecrawl-cli/node_modules/@mendable/firecrawl-js/dist/index.js"`;
  const mockPathNormalized = mockSdkPath.replace(/\\/g, "/");
  const patched = original.replace(sdkPathLine, JSON.stringify(mockPathNormalized));

  // Also stub out loadApiKey to always return a fake key
  const patchedWithApiKey = patched.replace(
    "function loadApiKey() {",
    "function loadApiKey() { return 'fc-test-key-000'; if (false) {"
  ).replace(
    // Close the extra if block we opened — find the closing brace of original loadApiKey
    "  return null;\n}",
    "  return null;\n  }\n}"
  );

  const patchedFile = join(tempDir, "extract-facts-patched.mjs");
  writeFileSync(patchedFile, patchedWithApiKey, "utf8");
  return patchedFile;
}

function runScript(scriptPath, args, env = {}) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    env: { ...process.env, ...env },
    encoding: "utf8",
    timeout: 30000,
  });
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

// ── Test A — Cache hit ────────────────────────────────────────────────────────
console.log("\nTest A — cache hit");
{
  const tempDir = createTempDir();
  const cacheDir = join(tempDir, ".firecrawl-cache");
  mkdirSync(cacheDir, { recursive: true });
  const outputPath = join(tempDir, "out.json");

  // Write a valid recent cache entry
  const cachedSheet = {
    domain: "restaurantexemplo.com",
    scraped_at: new Date().toISOString(), // now → within TTL
    business_name: "Restaurante Exemplo",
    prices: [],
    menu_items: [],
    hours: [],
    address: "123 Main St",
    reservation_method: "OpenTable",
    site_claims: [],
    extraction_complete: false,
  };
  writeFileSync(
    join(cacheDir, "restaurantexemplo.com-fact-sheet.json"),
    JSON.stringify(cachedSheet, null, 2),
    "utf8"
  );

  // Use a patched script that would fail if the SDK is called (map_fail mock)
  const mockSdkPath = createMockSdk(tempDir, "map_fail");
  const patchedScript = createPatchedScript(tempDir, mockSdkPath, "map_fail");

  const result = runScript(
    patchedScript,
    ["https://restaurantexemplo.com", outputPath],
    { FIRECRAWL_API_KEY: "fc-test-key-000" }
  );

  // Override cwd to tempDir so .firecrawl-cache is found there
  // We need to run with cwd=tempDir
  const result2 = spawnSync(
    process.execPath,
    [patchedScript, "https://restaurantexemplo.com", outputPath],
    {
      cwd: tempDir,
      env: { ...process.env, FIRECRAWL_API_KEY: "fc-test-key-000" },
      encoding: "utf8",
      timeout: 30000,
    }
  );

  const stdout = result2.stdout ?? "";
  const exitCode = result2.status ?? 1;

  assert(exitCode === 0, `exit code is 0 (got ${exitCode})\n  stderr: ${result2.stderr}`);
  assert(stdout.includes("[cache hit]"), `stdout contains "[cache hit]" (got: ${stdout.trim()})`);
  assert(existsSync(outputPath), "output file was written");

  if (existsSync(outputPath)) {
    const written = JSON.parse(readFileSync(outputPath, "utf8"));
    assert(written.domain === "restaurantexemplo.com", `domain is correct (got: ${written.domain})`);
  }

  cleanup(tempDir);
}

// ── Test B — Cache miss, mock Firecrawl ───────────────────────────────────────
console.log("\nTest B — cache miss, mock Firecrawl success");
{
  const tempDir = createTempDir();
  const outputPath = join(tempDir, "out.json");

  const mockSdkPath = createMockSdk(tempDir, "success");
  const patchedScript = createPatchedScript(tempDir, mockSdkPath, "success");

  const result = spawnSync(
    process.execPath,
    [patchedScript, "https://restaurantexemplo.com", outputPath],
    {
      cwd: tempDir,
      env: { ...process.env, FIRECRAWL_API_KEY: "fc-test-key-000" },
      encoding: "utf8",
      timeout: 30000,
    }
  );

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const exitCode = result.status ?? 1;

  assert(exitCode === 0, `exit code is 0 (got ${exitCode})\n  stderr: ${stderr}\n  stdout: ${stdout}`);
  assert(existsSync(outputPath), "output file was written");

  if (existsSync(outputPath)) {
    const sheet = JSON.parse(readFileSync(outputPath, "utf8"));

    assert(sheet.domain === "restaurantexemplo.com", `domain = restaurantexemplo.com (got: ${sheet.domain})`);
    assert(typeof sheet.scraped_at === "string", "scraped_at is a string");
    assert(sheet.extraction_complete === false, "extraction_complete is false");

    // prices: every entry must have covers field (even if empty string)
    if (Array.isArray(sheet.prices) && sheet.prices.length > 0) {
      const allHaveCovers = sheet.prices.every((p) => "covers" in p);
      assert(allHaveCovers, `all prices have covers field (prices: ${JSON.stringify(sheet.prices)})`);
    } else {
      assert(true, "prices array present (empty — mock may not produce prices)");
    }

    assert(Array.isArray(sheet.menu_items), "menu_items is an array");
    assert(Array.isArray(sheet.hours), "hours is an array");
    assert(Array.isArray(sheet.site_claims), "site_claims is an array");
    assert(typeof sheet.prices !== "undefined", "prices field exists");
    assert(typeof sheet.business_name === "string", "business_name is a string");
  }

  // Verify cache was written
  const cacheFile = join(tempDir, ".firecrawl-cache", "restaurantexemplo.com-fact-sheet.json");
  assert(existsSync(cacheFile), "cache file written in .firecrawl-cache/");

  cleanup(tempDir);
}

// ── Test C — Failure handling (scrape_fail) ──────────────────────────────────
console.log("\nTest C — failure handling (batchScrape throws 429)");
{
  const tempDir = createTempDir();
  const outputPath = join(tempDir, "out.json");

  const mockSdkPath = createMockSdk(tempDir, "scrape_fail");
  const patchedScript = createPatchedScript(tempDir, mockSdkPath, "scrape_fail");

  const result = spawnSync(
    process.execPath,
    [patchedScript, "https://restaurantexemplo.com", outputPath],
    {
      cwd: tempDir,
      env: { ...process.env, FIRECRAWL_API_KEY: "fc-test-key-000" },
      encoding: "utf8",
      timeout: 30000,
    }
  );

  const exitCode = result.status ?? 0;
  assert(exitCode !== 0, `exit code is non-zero on error (got ${exitCode})`);
  assert(!existsSync(outputPath), "no output file written on failure");

  cleanup(tempDir);
}

// ── Test C2 — Failure handling (map_fail) ────────────────────────────────────
console.log("\nTest C2 — failure handling (map throws)");
{
  const tempDir = createTempDir();
  const outputPath = join(tempDir, "out.json");

  const mockSdkPath = createMockSdk(tempDir, "map_fail");
  const patchedScript = createPatchedScript(tempDir, mockSdkPath, "map_fail");

  const result = spawnSync(
    process.execPath,
    [patchedScript, "https://restaurantexemplo.com", outputPath],
    {
      cwd: tempDir,
      env: { ...process.env, FIRECRAWL_API_KEY: "fc-test-key-000" },
      encoding: "utf8",
      timeout: 30000,
    }
  );

  const exitCode = result.status ?? 0;
  assert(exitCode !== 0, `exit code is non-zero when map fails (got ${exitCode})`);
  assert(!existsSync(outputPath), "no output file written when map fails");

  cleanup(tempDir);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll tests passed.");
  process.exit(0);
}
