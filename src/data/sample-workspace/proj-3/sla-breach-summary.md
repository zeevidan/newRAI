# SLA breach summary — 90-day window

**Report date:** May 19, 2026  
**Data source:** ServiceNow export (`tickets-90d-0519.csv`)  
**Prepared by:** Ops analytics agent

## Headline metrics

| Metric | Value | Δ vs prior period |
|--------|-------|-------------------|
| Total tickets | 12,847 | +4.2% |
| SLA breaches | 1,203 | +18.6% |
| Breach rate | 9.4% | +1.1 pp |
| Mean time to resolve (breached) | 31.2h | +6.4h |

## Top breach categories

1. **Password / access resets** — 412 breaches (34%)
2. **VPN connectivity** — 287 breaches (24%)
3. **Software provisioning** — 198 breaches (16%)

## Root cause clusters

### Staffing gaps (Tier 1)

Weekend and holiday coverage remains understaffed relative to ticket volume. Breach rate spikes **Sat–Mon**.

### Automation backlog

42% of access-reset tickets still require manual approval despite existing auto-approve rules for low-risk groups.

### Stale routing rules

Routing to decommissioned assignment groups caused 73 tickets to sit unassigned >4h.

## Recommendations

1. Enable **agent triage** for access-reset category with approval playbooks
2. Patch routing table; add weekly drift check agent
3. Pilot weekend on-call rotation for Tier 1

## Appendix

See `exports/tickets-90d-0519.csv` for raw ticket-level data.
