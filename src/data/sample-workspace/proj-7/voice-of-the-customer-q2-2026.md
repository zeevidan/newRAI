# Voice of the Customer — Q2 2026

**Prepared for:** Q2 Business Review, CloudSuite Leadership  
**Owner:** Maya Thompson, Director of Customer Experience  
**Compiled by:** Customer Story Editor (agent) with the VoC agent team  
**Period covered:** Feb 1 – Apr 30, 2026  
**Status:** Final — approved for distribution  
**Classification:** Internal

> **Privacy note.** Customer names and exact deal values in this report are masked. Account identities are replaced with stable aliases (e.g. *Customer A*) and contract value is shown as banded ARR. Raw values were resolved at query time through the **Customer PII & Deal Data** vault and are not stored in this document. See [Methodology](#7-methodology--data-sources).

---

## 1. Executive summary

This quarter we analyzed **5,186 customer signals** from Salesforce, ServiceNow, and recorded calls across **312 accounts**. Sentiment is **net positive (+38 NPS, up 6 points QoQ)**, but three themes are driving the majority of detractor volume and at-risk renewals.

**What customers love**
- Time-to-value after onboarding is strong once configured — repeated praise for the reporting engine and support responsiveness.
- The new role-based access model resolved a top-3 complaint from Q1.

**What's hurting us**
- **Onboarding friction** remains the #1 detractor driver (31% of negative signals), concentrated in SSO/environment setup.
- **Reliability perception** in the EMEA region after two March incidents.
- **Pricing transparency** at renewal, especially for mid-market expansion.

**Where it matters most.** The themes above are over-indexed in our **high-value segment** (ARR band **$250K–$1M+**), where 4 accounts representing a combined **$1M–$2.5M ARR band** flagged onboarding or reliability as a renewal risk.

**Recommended focus for Q3** (detail in §6):
1. Ship the guided SSO setup + validation agent (owner: Product).
2. Stand up an EMEA reliability comms playbook (owner: Support + SRE).
3. Pilot transparent expansion pricing for mid-market (owner: RevOps).

---

## 2. By the numbers

| Metric | Q2 2026 | QoQ |
|---|---:|---:|
| Customer signals analyzed | 5,186 | +12% |
| Accounts represented | 312 | +4% |
| Net Promoter Score (NPS) | +38 | +6 |
| Detractor signals | 1,042 | −3% |
| Signals from high-value segment | 1,498 | +9% |
| At-risk renewals flagged | 11 | +2 |

**Signal sources**

| Source | Signals | Notes |
|---|---:|---|
| Salesforce (cases, feedback, deal context) | 1,284 | Masked ACV via vault |
| ServiceNow (support tickets) | 3,902 | 90-day window |
| Recorded calls (Gong highlights) | 47 transcripts → 1,000+ tagged moments | QBR + renewal calls |

---

## 3. Sentiment overview

Overall sentiment is positive and improving, but **enterprise** sentiment trails **mid-market** for the first time in three quarters — driven almost entirely by the onboarding and reliability themes.

| Segment | Sentiment | Trend | Lead driver |
|---|---|---|---|
| Enterprise (ARR $250K–$1M+) | Neutral–Positive | ↓ | Onboarding, reliability |
| Mid-market (ARR $50K–$250K) | Positive | ↑ | Pricing transparency |
| SMB (ARR < $50K) | Positive | → | Feature requests |

---

## 4. Top themes

Themes are ranked by **weighted volume** (signal count × ARR band of the originating account), so a complaint from a large account counts for more than one from a trial user.

### Theme 1 — Onboarding & SSO friction · *31% of detractor volume*

Customers reach value quickly **once configured**, but configuration is the wall. SSO setup across environments is the single most cited blocker, followed by unclear role mapping.

> "We got SSO working, but every new sandbox needs another ticket. It took us three weeks to feel productive." — *Customer A, Enterprise ($250K–$500K band)* — `transcripts/gong-call-highlights.md`

> "The product is great. Getting our team in the door was not." — *Customer D, Enterprise ($500K–$1M band)* — Salesforce renewal note

**Evidence:** 412 ServiceNow tickets in the access/SSO category; 18 Gong moments tagged `onboarding-friction`; 3 renewal notes citing setup time.

### Theme 2 — Reliability perception (EMEA) · *22% of detractor volume*

Two March incidents (EU region) disproportionately shaped EMEA sentiment. The incidents were resolved within SLA, but **communication during the incidents** is what customers remember.

> "The outage was short. The silence was long." — *Customer B, Enterprise ($1M+ band)* — QBR transcript

**Evidence:** 287 tickets referencing latency/availability (76% EMEA); sentiment dipped −0.4 in EMEA the week of Mar 14.

### Theme 3 — Pricing transparency at renewal · *17% of detractor volume*

Mid-market accounts expanding seats find pricing hard to predict. This is a **trust** issue more than a cost issue — customers want to model expansion themselves.

> "I can't forecast my own renewal. That makes the budget conversation harder than it should be." — *Customer C, Mid-market ($50K–$100K band)* — Salesforce feedback

**Evidence:** 121 feedback records mention pricing/quote clarity; concentrated in accounts that expanded seats in the last 90 days.

### Themes 4–6 (watchlist)

| Theme | Detractor share | Signal |
|---|---:|---|
| Mobile app gaps | 11% | Feature requests, SMB-led |
| Reporting export limits | 10% | Power users, enterprise |
| In-app guidance | 9% | New users across segments |

---

## 5. At-risk renewals (masked)

Four high-value accounts cite a top theme as a renewal risk. Values shown as ARR bands; identities masked.

| Account | Segment | ARR band | Risk theme | Next step |
|---|---|---|---|---|
| Customer A | Enterprise | $250K–$500K | Onboarding | Exec sponsor + setup concierge |
| Customer B | Enterprise | $1M+ | Reliability (EMEA) | Incident retro + comms plan |
| Customer D | Enterprise | $500K–$1M | Onboarding | Guided SSO pilot |
| Customer E | Mid-market | $100K–$250K | Pricing | Transparent expansion quote |

---

## 6. Recommendations for Q3

1. **Guided SSO setup + validation agent** — Turn the #1 detractor driver into a self-serve flow with live config validation. *Owner: Product · Impact: high · Effort: medium.*
2. **EMEA reliability comms playbook** — Proactive status updates and a 24h post-incident note. The incidents were within SLA; the gap is communication. *Owner: Support + SRE · Impact: high · Effort: low.*
3. **Transparent expansion pricing pilot** — Let mid-market model seat expansion. *Owner: RevOps · Impact: medium · Effort: medium.*
4. **Close the loop** — Reply to the 11 at-risk accounts with the specific change their feedback drove. *Owner: CX · Impact: high · Effort: low.*

---

## 7. Methodology & data sources

This report was assembled by a team of agents coordinated by the **Customer Story Editor**:

- **Salesforce Insights Agent** — pulled 1,284 feedback and case records plus deal context; banded all ACV values through the vault.
- **Support Signals Agent** — extracted 3,902 ServiceNow tickets (90-day window) and 47 Gong call transcripts, tagging recurring pain points.
- **Theme Synthesizer** — de-duplicated signals across sources and clustered them into weighted themes with sentiment scoring (`analysis/themes-clustered.md`, `analysis/sentiment-by-segment.md`).
- **Customer Story Editor** — wove the evidence into this narrative and published it here after manager approval.

**Masking.** All customer names, contacts, and exact deal sizes were resolved through the **Customer PII & Deal Data** vault and replaced with stable aliases and ARR bands before any text was written to the workspace. PII-masking and deal-size redaction ran as a tool step on every source pull, enforced by the org's PII-masking guardrail.

**Source artifacts** (this workspace):
- `sources/salesforce/sf-customer-feedback-q2.csv`
- `sources/servicenow/snow-tickets-90d.csv`
- `sources/transcripts/gong-call-highlights.md`
- `analysis/themes-clustered.md`
- `analysis/sentiment-by-segment.md`

---

*Generated by the Voice of the Customer agent team · Q2 2026 · Acme Corp — CloudSuite.*
