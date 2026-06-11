# ChatGPT Ads *Campaign* Packet — {{client_name}}

> **Prepared by ImpulsoX AI** · {{date}} · Platform facts verified {{platform_verified_at}}
> Rendered from validated `campaign-plan.json` — source of truth. Re-verify live docs before launch.

---

## 1. Verdict

**Score: {{verdict_score}} / 18 · Decision: {{verdict_decision}}**

| # | Criterion | Score | Max | Note |
|---|---|---|---|---|
| 1 | Clear buyer | {{c1_points}} | 2 | {{c1_note}} |
| 2 | Specific problem | {{c2_points}} | 2 | {{c2_note}} |
| 3 | One-sentence offer | {{c3_points}} | 2 | {{c3_note}} |
| 4 | Landing page ready | {{c4_points}} | 2 | {{c4_note}} |
| 5 | Conversation fit | {{c5_points}} | 2 | {{c5_note}} |
| 6 | Provable claim | {{c6_points}} | 2 | {{c6_note}} |
| 7 | Measurable conversion | {{c7_points}} | 2 | {{c7_note}} |
| 8 | Reason to act now | {{c8_points}} | 2 | {{c8_note}} |
| 9 | Eligibility (country + category) | {{c9_points}} | 2 | {{c9_note}} |

### Blockers before launch

{{verdict_blockers}}

---

## 2. Campaign Spine

| Field | Value |
|---|---|
| Campaign name | `{{campaign_name}}` |
| Objective | `{{campaign_objective}}` |
| Daily budget | `{{budget_daily}}` |
| Currency | `{{currency}}` |
| Countries | {{geo_countries}} |
| Regions / DMAs | {{geo_regions}} |
| ZIP codes | {{geo_zips}} |
| Primary conversion | `{{primary_conversion_event}}` |
| Ad groups | {{ad_group_count}} |
| Total ads | {{total_ads}} |

---

## 3. Conversation Intent Map

| Ad Group | User State | Conversation Moment | Offer Angle | Landing Page |
|---|---|---|---|---|
{{intent_map_rows}}

---

## 4. Context Hint Matrix

| Ad Group | Context Hints | Exclusions |
|---|---|---|
{{hint_matrix_rows}}

---

## 5. Creative Matrix

| Ad Group | Angle | Title | Copy | Image Direction | Final URL |
|---|---|---|---|---|---|
{{creative_matrix_rows}}

---

## 6. Landing Page Fixes

{{landing_fixes_list}}

---

## 7. Measurement Plan

| Event | Data Type | Pixel | CAPI | Value |
|---|---|---|---|---|
{{measurement_events_rows}}

### Pixel install

Install in `<head>` of `{{landing_page_domain}}`:

```html
<script>
(function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments);};
q.q=[];w.oaiq=q;var js=d.createElement(s);js.async=true;js.src=u;
var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(js,f);
})(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");
oaiq("init",{ pixelId:"<YOUR-PIXEL-ID>" });
</script>
```

### Primary conversion event

```javascript
oaiq("measure", "{{primary_conversion_event}}",
  { type: "{{primary_event_data_type}}", amount: {{primary_event_value}}, currency: "{{currency}}",
    contents: [{ id: "reservation", name: "Table reservation", content_type: "service", quantity: 1 }] },
  { event_id: "<UNIQUE-UUID-PER-EVENT>" });
```

### Conversions API (server-side)

```bash
curl -X POST "https://bzr.openai.com/v1/events?pid=<PIXEL-ID>" \
  -H "Authorization: Bearer <API-KEY>" \
  -H "Content-Type: application/json" \
  --data '{
    "validate_only": false,
    "events": [{
      "id": "<SAME-UUID-AS-PIXEL-EVENT>",
      "type": "{{primary_conversion_event}}",
      "timestamp_ms": <UNIX-MS>,
      "oppref": "<oppref-cookie-value>",
      "source_url": "{{landing_page}}",
      "action_source": "web",
      "data": { "type": "{{primary_event_data_type}}", "amount": {{primary_event_value}}, "currency": "{{currency}}" }
    }]
  }'
```

### Deduplication strategy

{{dedup_strategy}}

### UTM pattern

```
utm_source=chatgpt
utm_medium=paid
utm_campaign={{campaign_name}}
utm_content={{ad_group_name}}__{{ad_angle}}
utm_term={{context_theme}}
```

---

## 8. Launch Checklist

{{launch_checklist_items}}

---

## 9. First 14 Days

### Optimization thresholds

| Decision | Rule |
|---|---|
| Ignore (thin data) | `< {{threshold_min_clicks}}` clicks |
| Pause underperformer | `>= {{threshold_pause_clicks}}` clicks · 0 conversions · CTR below account median |
| Clone winner | Any ad with conversions at `CPA < ${{threshold_scale_cpa}}` |
| Scale ad group | Lowest cost per qualified conversion over the window |

### Day-by-day plan

**Day 1 — Confirm it works**
{{day_1_tasks}}

**Days 2–3 — Clear obvious failures**
{{day_2_3_tasks}}

**Days 4–7 — Find early signal**
{{day_4_7_tasks}}

**Days 8–14 — Move budget to signal**
{{day_8_14_tasks}}

---

## 10. Risks & Guardrails

### Policy risks
- All ad copy passed compliance review: no guaranteed results, no OpenAI endorsement, no private data claims.
- Claims backed by landing page: *{{provable_claims}}*
- Re-verify live policy docs before launch — platform rules change frequently.

### Measurement gaps
- Pixel not installed until confirmed by checklist item 4.
- CAPI deduplication unconfirmed until Day 1 check.
- `oppref` cookie passthrough to server depends on client-side access.

### Wasted-spend risks
- Budget ${{budget_daily}}/day is below recommended $50/day minimum — data accumulates slowly.
- Do not pause ads before `{{threshold_min_clicks}}` clicks — data is statistically meaningless.
- Do not scale before tracking is confirmed working.

---

## 11. Client Brief

### What we measure

{{client_brief_what_we_measure}}

### What to expect

{{client_brief_expectations}}

### Disclaimer

{{client_brief_disclaimers}}

---

## Sources / Facts Used

Every number in this campaign traces to the client's website, extracted and operator-approved on {{facts_verified_at}}.

| Fact | Value | Covers | Source |
|---|---|---|---|
{{fact_sheet_prices_table}}
| Rating | {{fact_sheet_rating_value}} stars | — | {{fact_sheet_rating_source}} |
| Reviews | {{fact_sheet_review_count_value}}+ | — | {{fact_sheet_review_count_source}} |

> **Render note:** Replace each `{{fact_sheet_prices_table}}` row with one row per entry in
> `fact-sheet.json → prices[]`, formatted as:
> `| {item} | ${amount_minor/100:.2f} | {covers} | {domain} |`
> Show `covers` in full — this is the scope the operator confirmed before launch.

---

*ImpulsoX AI · impulsoxai.com.br · ChatGPT Ads · {{date}}*
