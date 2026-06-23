# Factual Extraction (Step 0.5)

Verificado em: 2026-05-31 | Re-verificar antes do launch

## 1. Purpose

You never emit an unverified factual claim. Before any copy that asserts a price, hour,
rating, address, or self-description, you build a **fact sheet** — the single source of truth
for every number and claim in the campaign. If a value is not in the approved fact sheet, it
does not go in the ad. No exceptions.

This reference exists because of a real failure (see Section 5). Treat the fact sheet as
load-bearing, not bureaucratic.

## 2. When to run

Run this at **Step 0.5**, immediately after intake captures the client's site URL and before
any step that asserts facts (context hints, ad titles, ad copy, landing-page alignment).

**Step 0.6** (operator review) happens right after. The extraction script never approves its
own output — only the operator does, by setting `extraction_complete: true`. You do not
generate factual copy until Step 0.6 is signed off.

## 3. How — the map → select → scrape flow

Run:

```
node scripts/extract-facts.mjs <client-url> deliverables/<client>-fact-sheet.json
```

The script runs three internal stages. Understand why each exists:

- **map** — Lists every URL on the domain *before* scraping anything. This prevents the
  "passou batido do cardápio" bug: a homepage-only scrape returns the site without the menu,
  because restaurant menus usually live on a separate page (`/menu`, `/cardapio`) or a linked
  PDF. Mapping first guarantees those pages are discoverable.
- **select** — Filters the mapped URLs by a path heuristic (homepage, `/menu`, `/cardapio`,
  `/about`, `/sobre`, `/hours`, `/reservas`, etc.). Only relevant pages get scraped — this
  controls Firecrawl credits. If nothing matches, it falls back to the homepage and warns.
- **scrape with PDF parsing** — Batch-scrapes the selected pages with `parsers: [{ type: "pdf" }]`
  enabled. Restaurant menus are frequently published as PDFs; without PDF parsing the menu
  content is silently lost even though the URL was found.
- **exact `limit`** — The batch scrape uses `limit = selectedUrls.length`, the real count of
  selected pages, never a rounder placeholder. An inflated limit triggers a 402 rejection
  before the job runs, wasting the call.

The script **always** writes `extraction_complete: false`. That flag flips to `true` only at
Step 0.6, by the operator.

## 4. What to extract

After the script runs, verify the resulting fact sheet has these fields populated and correct:

- **Prices** — each with an explicit `covers` stating exactly what the price includes (Section 5).
- **Menu items** — the dish names offered.
- **Hours** — per day, with open and close.
- **Rating and review count** — each with a `source` (e.g. "Google Reviews").
- **Address**.
- **Reservation method** — OpenTable, Resy, phone, etc.
- **Site claims** — the claims the site makes about itself ("most famous Brazilian restaurant
  in Orlando", "family-owned", "award-winning"). You may only repeat a claim the site itself
  makes; you never invent one.

## 5. The price-coverage rule

**This is the most important rule in this reference. Read it carefully.**

### The rule

Every price entry in the fact sheet MUST record, in its `covers` field, exactly what that
price covers — the item, the quantity, who it serves, any conditions (days, per-person), and
what it explicitly does NOT include. A price with an empty or vague `covers` is an **incomplete
extraction**. You do not proceed on it. You do not write copy from it.

### Why it exists

v1.2 of this skill shipped a false claim in a real client deliverable (a Brazilian
restaurant, anonymized here). The ad read
"feijoada buffet $27.90" in a way that the `$27.90` could be read as the price of the
churrasco too. Root cause: there was no structured source of truth, so the model stitched copy
from a loose intake fact.

`$27.90` is the price of the **weekend feijoada buffet, per person** — and nothing else. The
churrasco (picanha na chapa) costs **$79 for a 500g cut that serves 2 people** — a completely
different scope. An ad that surfaces "$27.90" without the feijoada/weekend/per-person scope is
a false factual claim. False claims in ads cause review rejection, client complaints, and lost
trust.

The `covers` field is the fix: it forces the scope to travel with the number, so the model
can never silently re-attach a price to the wrong dish.

### Concrete examples (from the real incident, anonymized)

Incomplete — `covers` is empty. Blocks. Do not proceed:

```json
{ "item": "feijoada buffet", "amount_minor": 2790, "covers": "" }
```

Complete — scope is explicit, including what it excludes:

```json
{
  "item": "feijoada buffet",
  "amount_minor": 2790,
  "covers": "weekend feijoada buffet, per person — does NOT include churrasco, a la carte items, or any other dish. Weekends only."
}
```

Wrong value AND ambiguous — `$27.90` is not the price of the picanha. This entry is factually
incorrect and must be rejected, not just clarified:

```json
{ "item": "picanha", "amount_minor": 2790, "covers": "picanha dish" }
```

Correct picanha entry — right value, scoped, excludes the feijoada:

```json
{
  "item": "picanha na chapa",
  "amount_minor": 7900,
  "covers": "500g cut, serves 2 people, shareable — does NOT include feijoada"
}
```

### Blocking rule

If any price entry has `covers: ""` or a vague `covers` ("food item", "a dish", "main"), the
fact sheet is **not complete**. Stop. Ask the operator to fill in the exact scope for that
price before continuing. Do not infer the scope yourself — the bug above was caused by exactly
that kind of inference.

## 6. Cache

The script caches by domain with a **7-day TTL**, keyed on the domain (e.g.
`.firecrawl-cache/restaurantexemplo.com-fact-sheet.json`). A cache hit within 7 days reuses the
prior scrape instead of spending credits — restaurant facts rarely change within a week.

Force a fresh scrape with `--refresh`:

```
node scripts/extract-facts.mjs <client-url> deliverables/<client>-fact-sheet.json --refresh
```

Use `--refresh` when the operator knows the menu or hours just changed, or when re-verifying
right before launch.

## 7. Failure handling

If Firecrawl fails — site down, credits exhausted, anti-bot block, map returns no links — the
script exits non-zero with a clear message and writes **no partial fact sheet**.

When this happens, you do NOT proceed to generate any factual copy. Instruct the operator:

- Verifique os créditos do Firecrawl: `firecrawl --status`
- Verifique se o site do cliente está acessível (abra a URL no navegador).
- Resolva a causa (recarregar créditos, esperar o site voltar, ajustar acesso) e rode o script
  de novo.

Só depois que o script termina com sucesso e o operador aprova no Step 0.6 você gera copy
factual.
