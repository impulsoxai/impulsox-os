# Optimization Rules — First 14 Days

> Early data is noisy. Look for signal, not certainty. Thresholds are starting
> defaults to adapt per account, not platform guarantees.
> Bidding note (2026-06): CPC is live; conversion-based (CPA) bidding is roadmap-only.
> Until CPA ships, optimize manually toward Pixel/CAPI conversion events — the platform
> will not do it for you. Keep events flowing so the account has history when CPA arrives.

## Daily readout (every day)
Serving status, spend, impressions, clicks, CTR, avg CPC/CPM, landing behavior,
conversion events, rejections, broken tracking.

## Phase rules
**Day 1 — confirm it works**
- Confirm serving, clicks, UTMs firing, events received, landing pages load.
- Fix anything broken before judging performance.

**Days 2-3 — clear obvious failures**
- Pause ads that are rejected or clearly broken.
- Do NOT pause on thin data (default: ignore any ad with < 100 clicks).

**Days 4-7 — find early signal**
- Compare ad groups by post-click behavior, not CTR alone.
- Pause an ad only after >= 200 clicks AND 0 conversions AND below-account-median CTR.
- Duplicate ads that produced conversions; add 2-3 fresh variations around them.

**Days 8-14 — move budget to signal**
- Shift budget toward ad groups with the lowest cost per qualified conversion.
- Build the next creative batch. Improve the weakest landing page.
- Tighten measurement (dedup, missing events).

## Hard don'ts
- Don't declare the channel dead after one weak ad.
- Don't scale before tracking is confirmed working.
- Don't judge everything on CTR.
- Don't change every variable at once — change one, observe, repeat.

## Thresholds summary
| Decision | Rule of thumb |
|---|---|
| Ignore (too little data) | < 100 clicks |
| Pause underperformer | >= 200 clicks, 0 conversions, CTR below account median |
| Clone winner | any ad with conversions at acceptable cost |
| Scale ad group | lowest cost per qualified conversion over the window |
