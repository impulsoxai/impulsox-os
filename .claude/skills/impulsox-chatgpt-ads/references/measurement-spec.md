# OpenAI Ads — Measurement Spec

> Verified against developers.openai.com/ads on 2026-05-29. VERIFY LIVE before launch.

## Minimum stack
- UTMs on every landing page URL.
- JavaScript Pixel near the top of `<head>`.
- Conversion events for high-value actions.
- Server-side Conversions API for durable conversions (purchases, leads, subs, booked calls).
- Same event id across pixel + server for deduplication.

## UTM pattern
```text
utm_source=chatgpt
utm_medium=paid
utm_campaign={{campaign_name}}
utm_content={{ad_group_name}}__{{ad_name}}
utm_term={{context_theme}}
```

## Event taxonomy
Data types: `contents`, `customer_action`, `plan_enrollment`, `custom`.

| Event | Data type | Fires when |
|---|---|---|
| page_viewed | contents | Important page loads |
| contents_viewed | contents | Product/listing/article viewed |
| items_added | contents | Items added to cart/selection |
| checkout_started | contents | Checkout starts |
| order_created | contents | Purchase completed (key conversion) |
| lead_created | customer_action | Lead form / contact request |
| registration_completed | customer_action | Account/event registration done |
| appointment_scheduled | customer_action | Demo/consultation booked |
| subscription_created | plan_enrollment | Paid subscription starts |
| trial_started | plan_enrollment | Free trial starts |
| custom | custom | Not covered by standard taxonomy |

- Monetary values: integers in lowest denomination (2599 = $25.99). `amount` requires `currency`.
- `custom_event_name`: lowercase/numbers/underscore/dash, 1-64 chars, not a built-in name.

## Pixel (browser only)
Install in `<head>`:
```html
<script>
(function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments);};
q.q=[];w.oaiq=q;var js=d.createElement(s);js.async=true;js.src=u;
var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(js,f);
})(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");
oaiq("init",{ pixelId:"<YOUR-PIXEL-ID>" });
</script>
```
Send events: `oaiq("measure", eventName, eventProps, eventOptions)`.

```javascript
// order with value
oaiq("measure","order_created",
  { type:"contents", amount:2599, currency:"USD",
    contents:[{ id:"sku_123", name:"Starter bundle", content_type:"product", quantity:1 }] },
  { event_id:"order_12345" });

// lead
oaiq("measure","lead_created",{ type:"customer_action" });

// custom
oaiq("measure","custom",
  { type:"custom", amount:12999, currency:"USD" },
  { custom_event_name:"quote_requested", event_id:"quote_req_123" });
```
- CRITICAL: `event_id` and `custom_event_name` go in `eventOptions`, NOT in `eventProps`.
- SDK auto-captures `oppref`, stores `__oppref` first-party cookie, adds `source_url`, timestamps, batches.
- Keep `debug:true` while testing. Never call the server API from page code.

## Conversions API (server only)
```bash
curl -X POST "https://bzr.openai.com/v1/events?pid=<PIXEL-ID>" \
  -H "Authorization: Bearer <API-KEY>" \
  -H "Content-Type: application/json" \
  --data '{
    "validate_only": false,
    "events": [{
      "id": "order_12345",
      "type": "order_created",
      "timestamp_ms": 1773892800000,
      "oppref": "oppref_abc",
      "source_url": "https://shop.example.com/checkout/confirmation",
      "action_source": "web",
      "data": { "type":"contents", "amount":2599, "currency":"USD",
        "contents":[{ "id":"sku_123","name":"Starter bundle","content_type":"product","quantity":1 }] }
    }]
  }'
```
- Batch up to 1,000 events. One bad event fails the whole batch.
- `timestamp_ms`: within last 7 days, no more than 10 minutes ahead.
- `source_url` required when `action_source` is `web`.
- `action_source`: web | mobile_app | offline | physical_store | phone_call | email | other.
- `validate_only:true` during setup tests.
- Server does NOT auto-capture `oppref` — pass it yourself when available.

## Deduplication
- Reuse the same value as pixel `event_id` and API `id`.
- Same Pixel ID on both sides. For custom events, same `custom_event_name` on both sides.
- Match key: Pixel ID + event name (or custom_event_name) + id.

## Provisioning
- Create Pixel ID and Conversions API key in the Conversions tab of Ads Manager.

## Warning
- Do not optimize on CTR alone. Judge by relevant traffic that becomes measurable action.

## Sources
- https://developers.openai.com/ads/measurement-pixel
- https://developers.openai.com/ads/conversions-api
- https://developers.openai.com/ads/supported-events
