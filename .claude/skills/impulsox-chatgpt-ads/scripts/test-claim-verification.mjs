#!/usr/bin/env node
/**
 * test-claim-verification.mjs — Tests for validate-packet.mjs Section 8 (claim verification).
 * Usage: node scripts/test-claim-verification.mjs
 */
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const VALIDATOR = join(__dirname, "validate-packet.mjs");
const FIXTURE_FS = join(__dirname, "../fixtures/exemplo-restaurante-fact-sheet.json");

const TMP = join(REPO_ROOT, ".test-tmp-claim-verification");
if (existsSync(TMP)) rmSync(TMP, { recursive: true });
mkdirSync(TMP, { recursive: true });

let passed = 0;
let failed = 0;

function run(planObj) {
  const planPath = join(TMP, `plan-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(planPath, JSON.stringify(planObj, null, 2), "utf8");
  const result = spawnSync("node", [VALIDATOR, planPath], { encoding: "utf8" });
  return { stdout: result.stdout, stderr: result.stderr, exit: result.status };
}

function assert(label, condition, detail) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${label}`);
    if (detail) console.log(`         ${detail}`);
    failed++;
  }
}

// Minimal valid plan shell (passes sections 0–7 except claim verification)
function makePlan(overrides = {}) {
  return {
    meta: {
      client: "Test Client",
      advertiser_country: "US",
      delivery_language: "en",
      currency: "USD",
      generated_at: "2026-05-31T00:00:00Z",
      platform_facts_verified_at: "2026-05-31T00:00:00Z",
      skill_version: "1.1.0",
      schema_version: "1.2",
      fact_sheet_ref: FIXTURE_FS,
      facts_verified_at: "2026-05-31T00:00:00Z",
      ...overrides.meta,
    },
    verdict: {
      decision: "fix_first",
      score: 14,
      criteria: [{ name: "Test", points: 14, max: 18, note: "ok" }],
      eligibility: {
        advertiser_country_ok: true,
        category: "local_services",
        category_allowed: true,
        landing_page_ready: true,
      },
    },
    offer: {
      name: "Test Offer",
      landing_page: "https://example.com",
      price: "$27.90",
      buyer: "Test buyer",
      problem: "Test problem",
      proof: ["4.9 stars"],
      constraints: [],
    },
    campaign: {
      name: "test-campaign",
      objective: "clicks",
      budget_daily: 20,
      geo: { countries: ["US"], regions: ["Florida"], zips: ["32819"] },
      start_date: "2026-05-31",
    },
    ad_groups: [
      {
        name: "test-group",
        user_state: "exploring",
        context_hints: [
          "where to eat orlando",
          "best restaurants near disney",
          "orlando dining",
          "family dinner orlando",
          "restaurant international drive",
          "dinner near universal studios",
          "authentic food orlando",
          "top rated restaurant orlando",
        ],
        ads: [
          {
            angle: overrides.angle ?? "proof",
            title: overrides.title ?? "Test Ad Title",
            copy: overrides.copy ?? "Test ad copy text.",
            image_direction: "Test image.",
            final_url: "https://example.com/?utm_source=chatgpt&utm_medium=paid&utm_campaign=test&utm_content=test-group__proof&utm_term=test",
            utms: {
              source: "chatgpt",
              medium: "paid",
              campaign: "test-campaign",
              content: "test-group__proof",
              term: "test",
            },
            framework_note: "AIDA — exploring/unaware",
          },
        ],
        events: [
          { event_name: "appointment_scheduled", event_type: "monetary", value: 2790 },
        ],
      },
    ],
    measurement: {
      pixel_id: null,
      events: [
        { event: "appointment_scheduled", data_type: "customer_action", browser_pixel: true, capi: true, value_minor_units: 2790, currency: "USD" },
        { event: "page_viewed", data_type: "contents", browser_pixel: true, capi: false, value_minor_units: null, currency: "USD" },
      ],
      dedup: { event_id_strategy: "UUID per reservation, same on pixel and CAPI." },
    },
    launch_checklist: ["Install pixel"],
    optimization: {
      day: 1,
      day_7: "Review CTR.",
      day_14: "Optimize budget.",
    },
    client_brief: {
      summary: "Test campaign.",
      disclaimers: "Advertising results are not guaranteed.",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Case 1 — FAIL: price-scope bug (churrasco mentioned alongside feijoada price $27.90)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nCase 1 — FAIL: price scope mismatch");
{
  const plan = makePlan({
    title: "Churrasco and Feijoada Buffet",
    copy: "Churrasco and feijoada buffet $27.90 per person. Open weekends.",
  });
  const { stdout, exit } = run(plan);
  assert("exits non-zero", exit !== 0, `exit code: ${exit}`);
  assert("output contains FAIL", stdout.includes("FAIL"), stdout.slice(0, 300));
  assert("mentions scope mismatch or not in fact sheet",
    stdout.toLowerCase().includes("scope mismatch") || stdout.toLowerCase().includes("not in fact sheet"),
    stdout.slice(0, 400));
}

// ─────────────────────────────────────────────────────────────────────────────
// Case 2 — PASS: factual match (4.9 stars, 7,500+ reviews — matches fact sheet)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nCase 2 — PASS: correct factual claims match fact sheet");
{
  const plan = makePlan({
    title: "4.9 Stars on International Drive",
    copy: "4.9 stars, 7,500+ reviews. Open daily till midnight.",
  });
  const { stdout, exit } = run(plan);
  // Should pass or fail only for non-claim reasons (e.g. schema 1.2 fields)
  const claimFails = (stdout.match(/^FAIL:.*Unverified claim/gm) ?? []);
  assert("no unverified-claim FAILs", claimFails.length === 0, claimFails.join(" | "));
}

// ─────────────────────────────────────────────────────────────────────────────
// Case 3 — PASS: positioning-only copy (no false FAIL from FACT_PATTERNS)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nCase 3 — PASS: positioning copy does not trigger false FAIL");
{
  const plan = makePlan({
    title: "Dinner Worth Remembering in Orlando",
    copy: "Skip the tourist traps. Authentic Brazilian cuisine. Reserve now.",
  });
  const { stdout, exit } = run(plan);
  const claimFails = (stdout.match(/^FAIL:.*Unverified claim/gm) ?? []);
  assert("no unverified-claim FAILs", claimFails.length === 0, claimFails.join(" | "));
}

// ─────────────────────────────────────────────────────────────────────────────
// Case 4 — FAIL: meta.fact_sheet_ref missing
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nCase 4 — FAIL: meta.fact_sheet_ref missing");
{
  const plan = makePlan({ meta: { fact_sheet_ref: undefined } });
  delete plan.meta.fact_sheet_ref;
  delete plan.meta.facts_verified_at;
  const { stdout, exit } = run(plan);
  assert("exits non-zero", exit !== 0, `exit code: ${exit}`);
  assert("mentions fact_sheet_ref missing",
    stdout.toLowerCase().includes("fact_sheet_ref"),
    stdout.slice(0, 300));
}

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────
rmSync(TMP, { recursive: true });

console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
