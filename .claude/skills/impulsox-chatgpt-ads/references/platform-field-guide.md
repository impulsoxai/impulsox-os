# OpenAI Ads — Platform Field Guide

> Verified: 2026-06-10 against official OpenAI docs + hands-on agency reports.
> These facts are VOLATILE — beta changes weekly. RE-VERIFY LIVE before every launch.
> Sources at bottom.

## Country availability (drives the geo gate — re-verify FIRST)
| Country | Status (2026-06-10) | Plan type allowed |
|---|---|---|
| US | Self-serve LIVE (ads.openai.com, since 2026-05-05) | launch / fix_first / narrow |
| CA, AU, NZ | Closed pilot LIVE | launch / fix_first / narrow |
| UK (GB) | Pilot LIVE (first expansion wave) | launch / fix_first / narrow |
| **Brazil (BR)**, MX, JP, KR | Pilot ANNOUNCED — "coming weeks", closed beta, NOT self-serve at first, selected advertisers only | **prepare_pilot** only |
| Everywhere else | Not announced | do_not_launch |

- Demand for pilot slots is expected to exceed availability — prepare_pilot clients should
  be waitlist-ready BEFORE the pilot opens (see SKILL.md "Pilot-readiness mode").
- Self-serve approval: ~2 business days; longer for restricted verticals.

## Structure
- Managed in OpenAI Ads Manager (ads.openai.com) — self-serve since 2026-05-05 (US).
  Ads API: api.ads.openai.com/v1.
- Hierarchy: Campaign -> Ad Group -> Ad.
- Campaign defines objective, budget, dates, targeting.
- Ad Group organizes ads around one conversation theme/intent.
- Ad holds title, copy, image, landing URL, advertiser name + favicon.
- Ads appear in ChatGPT, below relevant conversations.
- Multi-advertiser placements: multiple ads can appear in one response (carousel-style) —
  copy must win on usefulness side-by-side with competitors, not just alone.
- Auction: relevance-weighted second price.

## Advertiser eligibility (who can advertise) — HARD GATE
- Advertiser must be a business based in a LIVE country (see Country availability table).
  Brazil is pilot-announced: not launchable yet, but prepare_pilot plans are allowed.
- Verification via Persona + sanctions screening; in practice requires a registered
  business with an **EIN** (US) or equivalent in CA/AU/NZ.
- An agency that marks "I act on behalf of clients" at signup **cannot create an account**.
  The agency must be **invited by a client** who owns the account
  (Settings -> Users -> Invite).
- Country, currency, timezone, and advertiser type **cannot be changed after signup**.
- ImpulsoX never owns the account or billing. The client owns it and pays OpenAI.
- DO NOT forge US location/business to bypass verification — sanctions/identity screening
  makes this fraud and grounds for ban. The invite model above is the only path.

## Allowed vs excluded categories — HARD GATE
- Allowed: consumer goods, **local services**, travel/experiences, digital products/education.
- Excluded: dating, alcohol, tobacco, **health**, **financial/legal**, gambling, political.
- An offer in an excluded category is `do_not_launch`.

## Audience (who sees ads)
- Shown to: **Free and Go users, 18+, in live countries** (see availability table).
- NOT shown to: Plus, Pro, Business users, or under-18.

## Objectives and bidding
- Objectives: Reach (CPM buying) and Clicks (CPC buying). CPC arrived with the
  self-serve launch (2026-05-05).
- CPC: docs recommend starting max bid ~$3-$5 per click; market tutorials commonly
  cite ~$3.50 (re-verify).
- CPM: docs list ~$60 default max bid (re-verify).
- **Conversion-based bidding (CPA): NOT live — on the roadmap.** Pixel and Conversions
  API are already available: set them up from day zero so historical conversion data is
  flowing when CPA bidding ships. This applies to prepare_pilot clients too.
- Choosing: CPC for performance/local-services (traffic quality is measurable);
  CPM only for pure awareness with a strong brand asset.
- Reported metrics: impressions, clicks, spend, CTR, avg CPC, avg CPM, conversions
  (when conversion measurement is configured).

## Geo targeting
- Granular: country, region/state, DMA, ZIP. Good for local-services (e.g. Orlando area).

## Context hints
- Describe relevant conversations, topics, or keywords.
- NOT exact-match keywords. Do NOT guarantee delivery.
- Build from user conversation moments, not from a Google keyword dump.

## Creative limits
- Title: recommended 16-24 characters; maximum 50.
- Copy: recommended 32-48 characters; maximum 100.
- Image: square, no larger than 1200 x 1200.
- Landing page: valid, reachable, relevant, must NOT block OpenAI user agents.

## Account caps & operations
- Up to ~5,000 campaigns and ~5,000 ad groups per account (re-verify).
- Manual account review can take a few business days.
- Ads pass review before serving ("Serving" / "Not serving").
- Ads API billing is **prepaid** — zero balance means billable calls fail.

## Current unknowns (do not assume)
- No mature cross-industry CPC/CPM/CTR/CPA/ROAS benchmarks yet.
- Not every advertiser has self-serve access (beta may be gated).
- No exact context-hint matching.
- No new ad formats beyond what public docs confirm.

## Sources (re-verify live before launch)
- https://help.openai.com/en/articles/20001207-getting-started-with-openai-ads-manager-beta
- https://help.openai.com/en/articles/20001224-create-a-campaign-in-openai-ads-manager
- https://help.openai.com/en/articles/20001212-create-ads-for-chatgpt
- https://developers.openai.com/ads/api-quickstart
- 2026-06: expansion wave (UK live; BR/MX/JP/KR announced) + CPC/self-serve:
  https://weareroast.com/news/openai-ads-manager-explained-hands-on-testing-of-chatgpt-advertising/
  https://www.marketingdive.com/news/openai-solidifies-ad-platform-ambitions-with-chatgpt-ads-manager/819801/
  https://ppc.land/chatgpt-ads-go-live-in-the-uk-as-openai-expands-pilot-beyond-us/
