# Conversation Intent Library

> Verified: 2026-05-30. Map user states to ad groups. ChatGPT Ads match conversation
> moments, not keywords.

## The 6 user states (match the JSON enum exactly)
`exploring | comparing | planning | fixing | buying | booking`
Each becomes a candidate ad group. Pick the ones the offer truly serves.

| State | What the user asks ChatGPT | Offer angle that fits |
|---|---|---|
| exploring | "What are my options for X?" | Introduce the category + your fit |
| comparing | "Which option is better?" | Make the choice easier, show the edge |
| planning | "How do I do/plan X?" | Give a concrete plan/checklist |
| fixing | "Why is X broken / not working?" | Remove the blocker fast |
| buying | "What should I pick / which one?" | Reduce risk, justify the pick |
| booking | "Who can help me / where do I book?" | Offer a consult/demo/reservation |

## How to turn a state into an ad group
For each chosen state, define:
- `user_state` (from enum above).
- `moment` — the specific conversation in that state.
- 8-15 `context_hints` describing that conversation.
- `offer_angle`.
- `landing_page` that continues the thought.

## Conversation-moment sentence format
Write 5-10 of these to seed ad groups:
```text
When a user is asking ChatGPT to [job], our offer helps them [outcome].
```

## Local-services moment library (client #0: Orlando restaurants)
Local services (restaurants, salons, clinics-as-services, tradespeople) live mostly in
`exploring`, `buying`, and `booking`. For a tourist-area restaurant:

- exploring: "where to eat in orlando", "best restaurants near disney",
  "good dinner spots orlando", "family restaurants near universal",
  "places to eat near disney springs", "orlando dining recommendations".
- buying: "is X restaurant worth it", "best italian near disney",
  "top rated family restaurant orlando".
- booking: "book a table orlando", "dinner reservation near disney",
  "restaurant reservation orlando tonight", "last minute table orlando".

Lean on Orlando's tourism angle: visitors in an unfamiliar city asking ChatGPT for a
trustworthy nearby pick. Use granular geo (region/DMA/ZIP) to stay local.

## Anti-patterns
- One giant ad group called "AI software" or "restaurant". Split by state instead.
- Same hints across every state. Each state has its own conversation language.
- Sending every state to the homepage. Match each to a specific page.
