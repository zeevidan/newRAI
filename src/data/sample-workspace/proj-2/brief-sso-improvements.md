# Feature brief: SSO environment improvements

**Author:** Alex Chen  
**Target release:** Q3 2026  
**Priority:** P1

## Goal

Reduce SSO-related onboarding time by enabling **persistent session handoff** across CloudSuite environments after initial federation setup.

## User story

As an enterprise admin, I want to switch between production and sandbox without re-entering credentials, so that I can validate integrations quickly.

## Scope

### In scope

- Session token propagation for linked environments
- Admin-visible SSO health dashboard
- Agent-readable SSO config export (redacted)

### Out of scope

- Custom IdP development
- Non-SAML protocols (phase 2)

## Engineering notes

- Coordinate with identity team on token refresh semantics
- Vault-stored client secrets must rotate without breaking active sessions
- Add heartbeat-friendly validation endpoint for onboarding agents

## Acceptance criteria

- [ ] Admin completes SSO once, accesses 2+ environments without re-login
- [ ] SSO health status visible within 30s of config change
- [ ] Zero plaintext secrets in agent logs
