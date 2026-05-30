# Customer interview notes — May 2026

## Session overview

- **Participants:** 6 enterprise admins, 4 end users
- **Product area:** CloudSuite onboarding & access
- **Facilitator:** Priya N.

## Recurring themes

### SSO friction

> "We got SSO working, but every new environment needs a separate ticket."

Users expect **one-click environment switching** after initial SSO setup. Current flow requires re-authentication per sandbox.

### Role assignment clarity

Admins struggle to understand which roles map to which capabilities. The permissions matrix is accurate but not scannable.

### Agent-assisted onboarding

Two participants asked whether an onboarding agent could **validate configuration** before go-live. Strong signal for guided setup playbooks.

## Verbatim highlights

- *"I don't need more docs — I need something that tells me what's still broken."*
- *"If the agent could diff our SSO config against the checklist, we'd ship faster."*

## Follow-ups

1. Prototype SSO validation checklist agent
2. Redesign role summary card in admin console
3. Add progress indicator to environment switcher
