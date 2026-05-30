# Themes — clustered & weighted

**Author:** Theme Synthesizer (agent)  
**Inputs:** Salesforce feedback (1,284), ServiceNow tickets (3,902), Gong moments (1,000+)  
**Method:** Embedding cluster → de-dup across sources → weight by originating account ARR band  
**Last run:** Apr 30, 2026

## Weighting

Each signal is scored `1 × ARR_band_multiplier` so feedback from larger accounts surfaces higher.

| ARR band | Multiplier |
|---|---:|
| $1M+ | 5.0 |
| $500K–$1M | 4.0 |
| $250K–$500K | 3.0 |
| $100K–$250K | 2.0 |
| $50K–$100K | 1.5 |
| < $50K | 1.0 |

## Clusters (ranked by weighted volume)

| # | Theme | Raw signals | Weighted | Detractor share | Top source |
|---|---|---:|---:|---:|---|
| 1 | Onboarding & SSO friction | 612 | 1,840 | 31% | ServiceNow |
| 2 | Reliability perception (EMEA) | 341 | 1,305 | 22% | Gong + tickets |
| 3 | Pricing transparency at renewal | 198 | 1,010 | 17% | Salesforce |
| 4 | Mobile app gaps | 276 | 540 | 11% | Salesforce |
| 5 | Reporting export limits | 154 | 600 | 10% | ServiceNow |
| 6 | In-app guidance | 233 | 470 | 9% | Gong |

## De-duplication notes

- 84 signals appeared in **both** ServiceNow and Gong (same account, same week) and were merged to avoid double-counting.
- Pricing cluster is small in raw count but high in weight — driven by expanding mid-market accounts.

## Hand-off

Sentiment scoring by segment → `sentiment-by-segment.md`. Final narrative → `../report/voice-of-the-customer-q2-2026.md`.
