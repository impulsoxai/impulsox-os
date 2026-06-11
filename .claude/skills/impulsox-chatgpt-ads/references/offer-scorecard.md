# Offer Scorecard

> Verified: 2026-06-10. Score the offer before spending. Verdict = points, not opinion.

## Eligibility pre-check (HARD GATE — runs first, step 0)
Before scoring, check eligibility against the **Country availability table** in
platform-field-guide (it changes — re-verify live):
- Country LIVE (US/CA/AU/NZ/GB as of 2026-06-10) → proceed to scoring normally.
- Country PILOT-ANNOUNCED (BR/MX/JP/KR) → score normally, but the ceiling verdict is
  **`prepare_pilot`**: full plan + measurement + waitlist readiness, no spend until the
  pilot opens. Set `eligibility.pilot_announced: true` and `advertiser_country_ok: false`.
- Country neither live nor announced → `do_not_launch`.
- Category excluded (health/financial/legal/dating/alcohol/tobacco/gambling/political)
  → `do_not_launch` regardless of country.

In the JSON: set `verdict.eligibility.advertiser_country_ok`, `pilot_announced`,
`category`, `category_allowed`, `landing_page_ready`. The validator enforces the
country/decision pairing.

## Score 9 criteria (0-2 each, max 18)
0 = absent, 1 = partial, 2 = strong.

| # | Criterion | 2 points means |
|---|---|---|
| 1 | Clear buyer | One specific buyer named |
| 2 | Specific problem | A problem the buyer already knows they have |
| 3 | One-sentence offer | Product explained in one sentence |
| 4 | Landing page ready | Page matches the ad and is reachable |
| 5 | Conversation fit | A real ChatGPT moment where the ad is useful |
| 6 | Provable claim | Every claim is backed by the page |
| 7 | Measurable conversion | A trackable event exists (lead/order/reservation) |
| 8 | Reason to act now | A clear next step / reason to click |
| 9 | Eligibility (country + category) | Advertiser in a LIVE country AND allowed category (pilot-announced country scores 1) |

Criterion 9 is also the hard gate: score 0 → `do_not_launch` no matter the total;
score 1 (pilot-announced country, allowed category) → verdict ceiling is `prepare_pilot`.

## Verdict thresholds (when eligible)
- 16-18: **launch** — offer, page, tracking, claims ready.
- 11-15: **fix_first** — one or two concrete gaps; list them in `blockers`.
- 7-10: **narrow** — too broad; pick one buyer, one use case, one promise, re-score.
- 0-6: **do_not_launch** — spend would be irresponsible; state blocking gaps.
- Pilot-announced country + total >= 11: **prepare_pilot** — everything built and
  validated now, launch the day access opens. Total < 11: fix the gaps first (the
  waitlist window is exactly the time to fix them).

## Output rule
Always emit the full `verdict.criteria` array (per-criterion points), the total `score`,
and the named `decision`. Never give a verdict without the score table.
