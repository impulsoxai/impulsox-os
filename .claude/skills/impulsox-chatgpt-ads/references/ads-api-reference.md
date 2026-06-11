# OpenAI Ads API — Reference

> Verified 2026-05-29. Documented for FUTURE automation. Not used in v1 manual flow.
> VERIFY LIVE before building automation.

## Base & auth
- Base URL: `https://api.ads.openai.com/v1`
- Auth: `Authorization: Bearer <OPENAI_ADS_API_KEY>` (key from Settings tab of Ads Manager).

## Confirm access
```bash
curl -X GET "https://api.ads.openai.com/v1/ad_account" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" -H "Accept: application/json"
# -> { id, name, url, preview_url, timezone, currency_code }
```

## Upload creative
```bash
curl -X POST "https://api.ads.openai.com/v1/upload" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" -H "Content-Type: application/json" \
  -d '{ "image_url": "https://example.com/card.png" }'
# -> { file_id }   (multipart/form-data also accepted for local files)
```

## Create campaign
```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" -H "Content-Type: application/json" \
  -d '{ "name":"Spring launch", "status":"active",
        "budget": { "lifetime_spend_limit_micros": 25000000 } }'
# -> { id: "cmpn_...", ... }   (25000000 micros = $25)
```

## Create ad group
```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" -H "Content-Type: application/json" \
  -d '{ "campaign_id":"cmpn_101", "name":"US English", "status":"active",
        "context_hints":["productivity","team collaboration"],
        "bidding_config": { "billing_event_type":"impression", "max_bid_micros":60000 } }'
```

## Create ad
```bash
curl -X POST "https://api.ads.openai.com/v1/ads" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" -H "Content-Type: application/json" \
  -d '{ "ad_group_id":"adgrp_301", "name":"Planner card", "status":"active",
        "creative": { "type":"chat_card", "title":"Try the workspace planner",
          "body":"Coordinate tasks, docs, and meetings in one place.",
          "target_url":"https://example.com/planner", "file_id":"file_901" } }'
# -> creative.review_status: "in_review"
```

## Insights
```bash
curl -sS -G "https://api.ads.openai.com/v1/ads/ad_501/insights" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode "time_granularity=daily" --data-urlencode "limit=7"
# -> list of { readable_time, impressions, clicks, spend, ... }
```

## Notes for future automation
- Budget in `lifetime_spend_limit_micros`; bid in `max_bid_micros` (1_000_000 micros = 1 unit).
- Creative type observed: `chat_card`.
- New ads return `review_status: in_review`.

## Source
- https://developers.openai.com/ads/api-quickstart
