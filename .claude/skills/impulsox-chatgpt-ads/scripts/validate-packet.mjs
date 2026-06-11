#!/usr/bin/env node
// Validate a ChatGPT Ads campaign-plan.json (canonical object).
// Usage: node validate-packet.mjs <path-to-campaign-plan.json>
// Exit 0 = all pass; exit 1 = at least one failure.
// Deterministic gate. The LLM is unreliable at counting chars — this is the source of truth.
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

const TITLE_MAX = 50;
const COPY_MAX = 100;
const HINT_MIN = 8;
const HINT_MAX = 15;
const VALID_OBJECTIVES = ["clicks", "reach"];
const VALID_DATA_TYPES = ["contents", "customer_action", "plan_enrollment", "custom"];
const ALLOWED_COUNTRIES = ["US", "CA", "AU", "NZ", "GB", "BR", "MX", "JP", "KR"];
const PLACEHOLDER_RE = /\b(TODO|TBD|FIXME|xxx+|lorem ipsum)\b/i;
const HYPE_FAIL_RE = /\b(guaranteed|guarantee|instant\s+wealth|explosive\s+growth|risk[- ]free|100%\s+guaranteed|endorsed\s+by\s+openai|openai\s+recommends)\b/i;
const emojiCount = (str) => [...String(str ?? "")].filter(c => /\p{Emoji_Presentation}/u.test(c)).length;

const path = process.argv[2];
if (!path) {
  console.error("usage: node validate-packet.mjs <campaign-plan.json>");
  process.exit(1);
}

let plan;
try {
  plan = JSON.parse(readFileSync(path, "utf8"));
} catch (e) {
  console.log(`FAIL: cannot parse JSON — ${e.message}`);
  process.exit(1);
}

const fails = [];
const warns = [];
const len = (s) => [...String(s ?? "")].length; // count code points, not UTF-16 units

// --- 0. Eligibility hard gate (Regra Absoluta #4) -------------------------
// LIVE = self-serve or active pilot (verified 2026-06-10; re-verify before launch).
// PILOT_ANNOUNCED = OpenAI announced upcoming pilot — plans allowed only as prepare_pilot.
const LIVE_COUNTRIES = ["US", "CA", "AU", "NZ", "GB"];
const PILOT_ANNOUNCED_COUNTRIES = ["BR", "MX", "JP", "KR"];
const elig = plan?.verdict?.eligibility ?? {};
const advCountry = plan?.meta?.advertiser_country;
const decision = plan?.verdict?.decision;
if (!["launch", "fix_first", "narrow", "do_not_launch", "prepare_pilot"].includes(decision))
  fails.push(`Verdict.decision invalid: "${decision}".`);
if (elig.category_allowed !== true)
  fails.push("Eligibility: category_allowed must be true (category is excluded).");
if (elig.landing_page_ready !== true)
  warns.push("Eligibility: landing_page_ready is not true — Verdict should reflect a blocker.");
if (PILOT_ANNOUNCED_COUNTRIES.includes(advCountry)) {
  if (decision !== "prepare_pilot" && decision !== "do_not_launch")
    fails.push(`Advertiser country ${advCountry} is pilot-announced (not live) — decision must be prepare_pilot or do_not_launch.`);
  if (decision === "prepare_pilot" && elig.pilot_announced !== true)
    fails.push("prepare_pilot requires eligibility.pilot_announced: true.");
} else if (LIVE_COUNTRIES.includes(advCountry)) {
  if (elig.advertiser_country_ok !== true)
    fails.push(`Eligibility: advertiser_country_ok must be true (advertiser country ${advCountry} is live).`);
  if (decision === "prepare_pilot")
    fails.push(`Advertiser country ${advCountry} is live — use launch/fix_first/narrow, not prepare_pilot.`);
} else {
  if (decision !== "do_not_launch")
    fails.push(`Advertiser country "${advCountry}" is neither live nor pilot-announced — decision must be do_not_launch.`);
}
if ((elig.advertiser_country_ok !== true || elig.category_allowed !== true)
    && decision !== "do_not_launch" && decision !== "prepare_pilot")
  fails.push("Ineligible advertiser/category but decision is not do_not_launch or prepare_pilot.");
// prepare_pilot plans must never claim launch readiness with eligibility ok=true
if (decision === "prepare_pilot" && elig.advertiser_country_ok === true)
  fails.push("prepare_pilot plans must set advertiser_country_ok: false (country is not live yet).");
if (!Array.isArray(plan?.verdict?.criteria) || plan.verdict.criteria.length === 0)
  fails.push("Verdict.criteria missing — score table required.");
if (typeof plan?.verdict?.score !== "number")
  fails.push("Verdict.score must be a number.");

// --- 0b. Meta: schema_version required ------------------------------------
if (!plan?.meta?.schema_version || String(plan.meta.schema_version).trim() === "")
  fails.push("meta.schema_version is required (e.g. \"1.1\").");

// --- 1. Campaign sanity ----------------------------------------------------
const camp = plan?.campaign ?? {};
if (!VALID_OBJECTIVES.includes(camp.objective))
  fails.push(`campaign.objective must be one of ${VALID_OBJECTIVES.join("|")} (got "${camp.objective}").`);
if (!(typeof camp.budget_daily === "number" && camp.budget_daily > 0))
  fails.push("campaign.budget_daily must be a number > 0.");
const countries = camp?.geo?.countries ?? [];
if (!Array.isArray(countries) || countries.length === 0)
  fails.push("campaign.geo.countries must list at least one country.");
for (const c of countries)
  if (!ALLOWED_COUNTRIES.includes(c)) fails.push(`campaign.geo country "${c}" not in ${ALLOWED_COUNTRIES.join("/")}.`);
// geo targeting a pilot-announced country requires a prepare_pilot plan
if (countries.some((c) => PILOT_ANNOUNCED_COUNTRIES.includes(c)) && decision !== "prepare_pilot")
  fails.push("campaign.geo targets a pilot-announced country — decision must be prepare_pilot.");

// --- 2. Ad groups: hints + ads (title/copy/utms) --------------------------
const adGroups = Array.isArray(plan?.ad_groups) ? plan.ad_groups : [];
if (adGroups.length === 0) fails.push("ad_groups is empty.");
let adCount = 0;
for (const ag of adGroups) {
  const name = ag?.name ?? "(unnamed)";
  const hints = Array.isArray(ag?.context_hints) ? ag.context_hints : [];
  if (hints.length < HINT_MIN || hints.length > HINT_MAX)
    fails.push(`Ad group "${name}" has ${hints.length} hints (want ${HINT_MIN}-${HINT_MAX}).`);
  const ads = Array.isArray(ag?.ads) ? ag.ads : [];
  if (ads.length === 0) fails.push(`Ad group "${name}" has no ads.`);
  for (const ad of ads) {
    adCount++;
    if (len(ad?.title) > TITLE_MAX) fails.push(`Title ${len(ad.title)}>${TITLE_MAX} in "${name}": "${ad.title}"`);
    if (len(ad?.copy) > COPY_MAX) fails.push(`Copy ${len(ad.copy)}>${COPY_MAX} in "${name}": "${ad.copy}"`);
    if (!ad?.title) fails.push(`Ad in "${name}" missing title.`);
    if (!ad?.copy) fails.push(`Ad in "${name}" missing copy.`);
    const u = ad?.utms ?? {};
    if (u.source !== "chatgpt") fails.push(`Ad in "${name}": utms.source must be "chatgpt".`);
    if (u.medium !== "paid") fails.push(`Ad in "${name}": utms.medium must be "paid".`);
    if (!u.campaign) warns.push(`Ad in "${name}": utms.campaign is empty.`);
    if (!ad?.framework_note || String(ad.framework_note).trim() === "")
      fails.push(`Ad "${ad?.title ?? "(no title)"}" in "${name}" missing framework_note.`);
  }
}

// --- 3. Measurement: data types + monetary integers -----------------------
const events = Array.isArray(plan?.measurement?.events) ? plan.measurement.events : [];
if (events.length === 0) fails.push("measurement.events is empty.");
for (const ev of events) {
  if (!VALID_DATA_TYPES.includes(ev?.data_type))
    fails.push(`Event "${ev?.event}": data_type "${ev?.data_type}" invalid.`);
  if (ev?.value_minor_units != null && !Number.isInteger(ev.value_minor_units))
    fails.push(`Event "${ev?.event}": value_minor_units must be an integer (minor units, e.g. 2599).`);
}
if (!plan?.measurement?.dedup?.event_id_strategy)
  warns.push("measurement.dedup.event_id_strategy is empty (needed when pixel+CAPI overlap).");

// --- 4. Client brief disclaimer (no guaranteed results) -------------------
const disc = plan?.client_brief?.disclaimers ?? "";
if (!disc) fails.push("client_brief.disclaimers missing.");
else if (!/guarantee|garantia/i.test(disc))
  warns.push("client_brief.disclaimers should state results are not guaranteed.");

// --- 5. Placeholder scan ---------------------------------------------------
const raw = JSON.stringify(plan);
if (PLACEHOLDER_RE.test(raw)) fails.push("Placeholder text found (TODO/TBD/xxx/lorem).");

// --- 6. Hype / policy check -----------------------------------------------
for (const ag of adGroups) {
  const agName = ag?.name ?? "(unnamed)";
  for (const ad of (Array.isArray(ag?.ads) ? ag.ads : [])) {
    const adTitle = ad?.title ?? "";
    const adCopy  = ad?.copy  ?? "";
    if (HYPE_FAIL_RE.test(adTitle))
      fails.push(`Prohibited claim in "${agName}" title: "${adTitle}"`);
    if (HYPE_FAIL_RE.test(adCopy))
      fails.push(`Prohibited claim in "${agName}" copy: "${adCopy}"`);
    const totalEmoji = emojiCount(adTitle) + emojiCount(adCopy);
    if (totalEmoji > 1)
      warns.push(`>1 emoji in "${agName}" ad "${adTitle}" (${totalEmoji} found).`);
    const capsWordsTitle = (adTitle.match(/\b[A-Z]{2,}\b/g) ?? []).length;
    if (capsWordsTitle > 2)
      warns.push(`Excessive CAPS in "${agName}" title: "${adTitle}" (${capsWordsTitle} all-caps words).`);
    const capsWordsCopy = (adCopy.match(/\b[A-Z]{2,}\b/g) ?? []).length;
    if (capsWordsCopy > 3)
      warns.push(`Excessive CAPS in "${agName}" copy: "${adCopy}" (${capsWordsCopy} all-caps words).`);
    if (adTitle.includes("!"))
      warns.push(`Exclamation mark in "${agName}" title: "${adTitle}"`);
  }
}

// --- 8. Claim verification (v1.3) -----------------------------------------
if (!plan?.meta?.fact_sheet_ref || String(plan.meta.fact_sheet_ref).trim() === "") {
  fails.push("meta.fact_sheet_ref missing — cannot verify factual claims. Run extract-facts.mjs and add path to meta.");
} else {
  const fsRef = String(plan.meta.fact_sheet_ref).trim();
  let factSheet = null;
  try {
    // Resolve relative to the plan file's directory
    const planDir = dirname(resolve(path));
    const fsPath = fsRef.startsWith("/") || /^[A-Za-z]:/.test(fsRef) ? fsRef : join(planDir, fsRef);
    factSheet = JSON.parse(readFileSync(fsPath, "utf8"));
  } catch (e) {
    fails.push(`fact_sheet_ref "${fsRef}" cannot be loaded — ${e.message}`);
  }

  if (factSheet) {
    const FACT_PATTERNS = {
      price:  /\$\d+(?:\.\d{2})?/g,
      rating: /\b\d\.\d\s*stars?\b/gi,
      count:  /\b[\d,]+\+?\s*(?:reviews?|guests?)\b/gi,
      hours:  /\b(?:\d{1,2}\s*(?:AM|PM)|till\s+midnight|open\s+daily)\b/gi,
    };

    // Extract "NOT include X, Y" exclusions from a covers string
    function extractExclusions(coversStr) {
      const m = (coversStr ?? "").match(/\bNOT\s+include\s+([^.—\n]+)/i);
      if (!m) return [];
      return m[1].split(/[,;]/).map(s => s.trim().toLowerCase()).filter(s => s.length > 2);
    }

    for (const ag of adGroups) {
      const agName = ag?.name ?? "(unnamed)";
      for (const ad of (Array.isArray(ag?.ads) ? ag.ads : [])) {
        const angle = ad?.angle ?? ad?.title ?? "(no angle)";
        const adText = `${ad?.title ?? ""} ${ad?.copy ?? ""}`;

        // ── price tokens ──
        for (const m of [...adText.matchAll(FACT_PATTERNS.price)]) {
          const token = m[0];
          const amountMinor = Math.round(parseFloat(token.replace("$", "")) * 100);
          const matches = (factSheet.prices ?? []).filter(p => p.amount_minor === amountMinor);
          if (matches.length === 0) {
            fails.push(`Unverified claim in "${agName}/${angle}": "${token}" not in fact sheet`);
          } else {
            // Scope check: if copy mentions items excluded in covers → FAIL
            const ctxStart = Math.max(0, m.index - 60);
            const ctxEnd = Math.min(adText.length, m.index + token.length + 60);
            const context = adText.substring(ctxStart, ctxEnd).toLowerCase();
            for (const price of matches) {
              const exclusions = extractExclusions(price.covers);
              for (const excl of exclusions) {
                // Match whole-word substrings of excl against context
                const exclWord = excl.split(/\s+/)[0]; // first significant word
                if (exclWord.length > 3 && context.includes(exclWord)) {
                  fails.push(`Unverified claim in "${agName}/${angle}": "${token}" scope mismatch — fact sheet limits this price to "${price.covers.substring(0, 60)}..." but copy implies broader coverage`);
                  break;
                }
              }
            }
          }
        }

        // ── rating tokens ──
        for (const m of [...adText.matchAll(FACT_PATTERNS.rating)]) {
          const token = m[0];
          const val = parseFloat((token.match(/\d\.\d/) ?? ["0"])[0]);
          const fsVal = factSheet?.rating?.value;
          if (fsVal == null || Math.abs(fsVal - val) > 0.05)
            fails.push(`Unverified claim in "${agName}/${angle}": "${token}" not in fact sheet (fact sheet rating: ${fsVal ?? "not found"})`);
        }

        // ── count tokens (reviews/guests) ──
        for (const m of [...adText.matchAll(FACT_PATTERNS.count)]) {
          const token = m[0];
          const claimed = parseInt(token.replace(/[^\d]/g, ""));
          const fsCount = factSheet?.review_count?.value;
          if (fsCount == null || claimed > fsCount * 1.1)
            fails.push(`Unverified claim in "${agName}/${angle}": "${token}" not in fact sheet (fact sheet review_count: ${fsCount ?? "not found"})`);
        }

        // ── hours tokens ──
        for (const m of [...adText.matchAll(FACT_PATTERNS.hours)]) {
          const token = m[0];
          if (/till\s+midnight/i.test(token)) {
            const hoursJson = JSON.stringify(factSheet?.hours ?? []).toLowerCase();
            if (!hoursJson.includes("12:00 am") && !hoursJson.includes("midnight") && !hoursJson.includes("00:00"))
              fails.push(`Unverified claim in "${agName}/${angle}": "${token}" — 'till midnight' not confirmed in fact sheet hours`);
          }
          if (/open\s+daily/i.test(token) && (factSheet?.hours ?? []).length < 7)
            warns.push(`Claim "${token}" in "${agName}/${angle}" — fact sheet has only ${(factSheet?.hours ?? []).length} days; verify "open daily" is accurate`);
        }
      }
    }
  }
}

// --- report ----------------------------------------------------------------
for (const w of warns) console.log(`WARN: ${w}`);
if (fails.length === 0) {
  console.log(`PASS: plan valid (${adGroups.length} ad groups, ${adCount} ads, ${events.length} events).`);
  process.exit(0);
}
for (const f of fails) console.log(`FAIL: ${f}`);
console.log(`\n${fails.length} failure(s).`);
process.exit(1);
