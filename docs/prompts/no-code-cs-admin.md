# Prompt: No-Code CS admin (Labs)

Staff must close ≥90% of non-bug customer tickets from `/admin` without code, SQL, or deploys for routine CS/ops/copy.

## Target shape

1. **CS workspace** — curated safe mutations only (lookup, auth assists, partner/SMS, ledger adjustments, privacy export/wipe for leads).
2. **Messages** — outbound SMS/email log + audited resend.
3. **Ops / CMS-lite** — evaluated feature flags, site banner, copy snippet overrides.
4. **Audit UI** — browse every staff mutation.
5. **Eng** — `/dev` (or eng-only) for backup/bulk CRUD; not CS daily path.

## Capability checklist (adapt per product)

- User search (phone / email / name / id) + dossier
- View-as read-only snapshot
- Clear lockouts; revoke sessions; revoke credentials (per-item when possible)
- Partner/household invite resend, regenerate, force unlink, CS-initiated relink
- Edit identity (display name / phone) with uniqueness checks
- SMS/email consent + delivery log peek
- Points/ledger typed ADJUSTMENT; cancel/fulfill reserved actions
- Unstick legal/onboarding/analytics consent gates (without wipe)
- Privacy export + typed wipe (lead+)
- Roles: `cs` / `cs_lead` / `eng` via allowlisted identity

## Acceptance

A CS agent closes common tickets from `/admin` without Slack-to-engineering. Remaining work is bugs or new features.

## Related

- Principle: `no-code-cs-admin`
- FavorBank audit: `docs/ops/no-code-rule-favorbank-audit-2026-09-09.md`
- Miles2Go audit: `docs/admin-cs-capability-audit.md`
