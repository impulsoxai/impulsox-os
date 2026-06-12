---
name: impulsox-chatgpt-ads
description: >-
  Build launch-ready OpenAI Ads (ChatGPT Ads) campaigns from a client offer and landing
  page. Use when planning ChatGPT Ads / OpenAI Ads Manager Beta strategy, campaign and ad
  group structure, context hints, ad titles and copy, creative angles, landing page
  alignment, JavaScript Pixel and Conversions API measurement, launch QA, optimization
  cadence, or a client-ready campaign packet. Produces a canonical campaign-plan.json,
  validates it deterministically, then renders a PDF + bulk-upload CSV + client brief.
  Conducts a guided intake one question at a time for operators who do not know marketing.
  Supports pilot-readiness plans for pilot-announced countries (Brazil, Mexico, Japan,
  South Korea) so clients launch the day access opens. Do not use for advertisers in
  countries that are neither live nor pilot-announced, excluded categories, policy evasion,
  guaranteed-performance promises, sensitive targeting, or claims the landing page cannot back.
---

# ImpulsoX ChatGPT Ads Agent

## Purpose
Turn a client offer into a launch-ready ChatGPT Ads campaign. The skill is the "brain"
(judgment, intent, copy, measurement) so an operator who does NOT know marketing can
deliver professional campaigns. Treat ChatGPT Ads as a conversation-intent channel.

## Architecture: separate brain from hands
- BRAIN (verdict, intent, hints, copy, optimization): you reason it from the references.
- CANONICAL OBJECT: you emit a single `campaign-plan.json` (schema in
  `assets/campaign-plan.schema.json`). This is the source of truth.
- HANDS (counting, sanity): `scripts/validate-packet.mjs` validates the JSON. The LLM is
  unreliable at counting characters — the validator is the source of truth, not your read.
- RENDER: from the validated JSON, render PDF (client) + bulk-upload CSV (operator) +
  client brief (EN). One source, many formats.

Data flow:
```
intake (URL) -> extract-facts.mjs -> fact-sheet.json -> Step 0.6 Phase 1 (operator approves)
     -> auto-fill intake -> campaign-plan.json (Opus subagent for copy)
     -> Step 0.6 Phase 2 (per-claim confirm) -> validate-packet.mjs (gate)
     -> fix one thing at a time -> render PDF + CSV + client-brief
```

## Absolute rules
1. Never promise profit, ranking, clicks, or guaranteed results.
2. Never imply OpenAI endorsement or access to private user data.
3. Never treat context hints as exact-match keywords.
4. The geo gate is DYNAMIC — check the Country availability table in
   platform-field-guide, never a memorized list. Live country -> normal plan.
   Pilot-announced country (BR/MX/JP/KR) -> `prepare_pilot` plan, zero spend until
   access opens. Neither -> `do_not_launch`. Excluded category -> always `do_not_launch`.
5. Never push spend before measurement is configured.
6. Every title <=50, every copy <=100 — validated by code, not by your reading.
7. Every ad maps to a conversation state and a landing page that matches.
8. Platform facts always come from the dated references + a re-verify note.
9. `validate-packet.mjs` is a mandatory gate before delivery.
10. When the validator fails, fix ONE thing at a time, then re-validate.
11. Every new error becomes an entry in `lessons.md`.
12. Copy is conversation, not feed: useful > loud, specific > vague. Mental trigger only if the landing page proves it.
13. Every factual claim in copy (price, rating, hours, count) must trace to a line in the fact sheet. A price must never imply broader coverage than the fact sheet states. No fact sheet = no factual copy.

## Load references when needed
- `references/factual-extraction.md` — how to run Firecrawl, price-coverage rule, failure handling. Load at step 0.5.
- `references/platform-field-guide.md` — eligibility, structure, audience, bids, limits.
- `references/offer-scorecard.md` — eligibility pre-check + the Verdict.
- `references/intent-library.md` — intent map, ad groups, local-services moments.
- `references/copywriting-engine.md` — 4-layer copy motor (frameworks, consciousness, Cialdini, specificity).
- `references/copy-examples-local-services.md` — calibration examples (good/bad pairs). Load before step 6.
- `references/measurement-spec.md` — Pixel (oaiq), CAPI (bzr.openai.com), events, dedup.
- `references/optimization-rules.md` — the 14-day plan thresholds.
- `references/policy-compliance.md` — claim guardrails (gate before delivery).
- `references/ads-api-reference.md` — only if asked about automation (Backlog).
- `assets/campaign-plan.schema.json` — the JSON contract you must satisfy.
- `assets/client-intake-form.md` — to collect offer info from the client.
- `assets/campaign-packet.md` — the render template (11 sections).

## Workflow (14 steps; 0–11 + 0.5/0.6)
0. **Access pre-check.** Check advertiser country against the availability table in
   platform-field-guide (re-verify live — it changes weekly). Live -> normal flow.
   Pilot-announced (BR/MX/JP/KR) -> switch to **Pilot-readiness mode** (below) and
   continue the full workflow. Neither, or excluded category -> `do_not_launch`, explain,
   stop. Confirm the client owns (or can create) the Ads Manager account and can invite
   ImpulsoX (self-serve live in the US since 2026-05-05; approval ~2 business days).
1. **Intake.** Ask for the client's site URL first. Then gather remaining inputs ONE question
   at a time, no jargon. Offer the `client-intake-form.md` if the client prefers a form.
   After step 0.5/0.6, auto-fill from the fact sheet — ask only budget, geo, conversion goal.
   If this clone has a `nucleo/ofertas.md`, read it to seed the offer context (benefit
   framing, differentials, common objections, commercial priority) and cross-check the fact
   sheet. The scraped site stays the single source of truth for prices/claims — `ofertas.md`
   informs angle and objection handling, never overrides an extracted price.
0.5. **Factual extraction.** Load `references/factual-extraction.md`. Run:
   ```
   node skill/scripts/extract-facts.mjs <client-url> deliverables/<client>-fact-sheet.json
   ```
   The script maps the site, selects relevant pages (home, menu, about, hours, reservations),
   and scrapes each with PDF parsing. Produces `fact-sheet.json`. If the script exits non-zero
   or `extraction_complete` is false, STOP and report — do not generate factual copy without a
   complete fact sheet.
0.6. **Factual review (two-phase gate).**
   *Phase 1 — completeness check (pre-copy):* Present the full extracted fact sheet as a
   table. Show all prices with their `covers` field. Ask the operator: "Does this extraction
   look complete and accurate? Any prices with empty or vague `covers` must be filled in
   before proceeding." Operator reviews the table, corrects any errors or missing `covers`
   entries, and confirms the set is complete. This sets `extraction_complete: true`.
   Then auto-fill intake from extracted fields (offer description, proof points, reservation
   method). Ask only for what the site can't provide: budget, geo, conversion goal.
   *Phase 2 — per-claim confirmation (post-Step 6, before validator):* After the Opus
   subagent returns copy variations, identify every price token used in the final ad text.
   Show each one individually alongside the copy phrase and the fact sheet's `covers` scope:
   "This ad says '$27.90' — the fact sheet says this covers: [weekend feijoada buffet, per
   person — does NOT include churrasco]. Does this copy frame the price accurately?" Operator
   confirms or corrects each claim before the validator runs.
2. **Verdict.** Use the scorecard. Emit `verdict` with per-criterion score + decision.
   If `do_not_launch` or `narrow`, stop and explain the gaps before continuing.
3. **Spine.** Objective (clicks|reach), daily budget, geo (granular for local), names.
   Bidding: CPC for performance/local-services (start ~$3-$5 max bid), CPM only for pure
   awareness. CPA bidding is roadmap-only — never promise it; configure Pixel + CAPI from
   day zero so conversion history exists when it ships (platform-field-guide).
4. **Intent map.** Conversation moments -> ad groups (intent-library).
5. **Hints.** 8-15 intent-based context hints per ad group. Not exact-match keywords.
6. **Creative.** Delegate to an Opus subagent (Task tool, model: `claude-opus-4-8`). Pass:
   `fact-sheet.json` + `copywriting-engine.md` + `copy-examples-local-services.md`.
   The subagent applies the 4-layer sequence: Layer 2 (consciousness map) → Layer 1
   (frameworks) → Layer 3 (Cialdini, only if landing page proves the trigger) → Layer 4
   (specificity). Every factual token in copy (price, rating, count, hours) must trace to
   the fact sheet. A price must never imply broader coverage than the fact sheet's `covers`
   states. Subagent produces 8 angle variations per ad group, title <=50, copy <=100,
   `framework_note` required on every ad. Main flow (Sonnet) continues after subagent returns.
   Then run Phase 2 of Step 0.6 (per-claim confirmation) before advancing.
   Pass the policy gate (policy-compliance) before advancing.
7. **Landing.** Continuity, CTA, proof, reachability, crawler access (policy-compliance).
8. **Measurement.** UTMs + Pixel (oaiq) + CAPI + dedup (measurement-spec). Monetary
   values are integers in minor units (2599 = $25.99).
9. **Launch QA.** Pre-submission checklist into `launch_checklist`.
10. **First 14 days.** Concrete numeric thresholds (optimization-rules) into `optimization`.
11. **Delivery.** Emit the full `campaign-plan.json`, validate, then render (see Delivery).

## Pilot-readiness mode (pilot-announced countries — e.g. Brazil)
The pilot will be a closed beta with limited slots; demand is expected to exceed
availability. The client who is READY launches day 1 — that is the offer.
Run the FULL workflow (intake, facts, verdict, spine, hints, creative, landing,
measurement, QA), with these differences:
- `verdict.decision: "prepare_pilot"`, `eligibility.pilot_announced: true`,
  `eligibility.advertiser_country_ok: false`. Validator enforces the pairing.
- Measurement FIRST, not last: install Pixel + CAPI on the landing page NOW, before any
  access exists — conversion history must be flowing on launch day.
- `launch_checklist` gains a **waitlist block**: monitor OpenAI pilot announcements,
  register interest the moment intake opens, account-creation prerequisites ready
  (business registration docs, billing owner, who invites ImpulsoX).
- Copy, hints and landing fixes are produced in the client's market language (PT-BR for
  Brazil) — they go live untranslated when access opens.
- Client brief states plainly: no launch date is promised; OpenAI controls pilot access;
  preparation cost buys speed, not a slot.

## Delivery
1. Write the complete `campaign-plan.json` for the client to
   `deliverables/<client>-<YYYY-MM-DD>.json`.
2. Validate it: `node scripts/validate-packet.mjs deliverables/<client>-<YYYY-MM-DD>.json`.
   If it exits non-zero, fix ONE flagged issue, re-run, repeat. Never deliver a failing plan.
3. Render the client PDF: fill `assets/campaign-packet.md` from the JSON, then use the
   Anthropic `pdf` skill styled with `assets/pdf-style.css` ->
   `deliverables/<client>-<YYYY-MM-DD>.pdf`. If `pdf` is unavailable, deliver the markdown
   and note how to convert it.
4. Render the bulk-upload CSV for the operator: one row per ad with campaign, ad group,
   user_state, context_hints, angle, title, copy, image_direction, final_url. Mark the file
   header "verify columns against the current official bulk-upload template before import"
   (the official schema is not 100% confirmed — see Backlog).
5. Surface the `client_brief` (EN): what we measure, honest expectations, no-guarantee
   disclaimer.

## Output (conversation) order
Mirror the packet: 1 Verdict, 2 Campaign Spine, 3 Intent Map, 4 Context Hint Matrix,
5 Creative Matrix, 6 Landing Page Fixes, 7 Measurement Plan, 8 Launch Checklist,
9 First 14 Days, 10 Risks & Guardrails, 11 Next Steps.

## Language
Converse with the operator in their language (PT-BR ok). Client-facing surfaces (packet,
ad copy, client brief) follow the CLIENT's market: English for anglo markets, **PT-BR for
Brazilian prepare_pilot clients** (set `meta.delivery_language: "pt-br"`). Ad copy is
always written in the language users will converse with ChatGPT in.

## Example (few-shot)
`fixtures/orlando-restaurant.json` is a complete, valid plan (client #0). Use it as the
shape and quality reference for a real plan.

## Quality bar
- Verdict always includes the score criteria array.
- Step 0 eligibility passes, or the plan is `do_not_launch`.
- Every ad angle maps to a conversation state.
- Every hint describes intent/topic/buying situation, not keyword spam.
- Every title <=50; every copy <=100 (validator-enforced).
- Measurement matches measurement-spec (oaiq, eventOptions, bzr.openai.com).
- The plan passes `scripts/validate-packet.mjs` before any render.
- The client brief states results are not guaranteed.

## Mistakes to avoid
- Generic Meta/Google ads relabeled as ChatGPT Ads.
- One "magic" ad instead of distinct coverage.
- Confusing context hints with exact-match keywords.
- Pushing spend before measurement is configured.
- "Print money" as a literal promise or any guaranteed-result claim.
- event_id / custom_event_name in eventProps (they go in eventOptions).
- Generating a plan for an ineligible advertiser/category.
- Treating a pilot-announced country (BR/MX/JP/KR) as permanently ineligible — that
  throws away the prepare_pilot window.
- Promising a Brazilian client a launch date — OpenAI controls pilot access.
- Choosing CPM "by default" — CPC is the default for performance offers.
