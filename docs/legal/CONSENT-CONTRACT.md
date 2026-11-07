# Consent contract — Labs signup gate

Implementer spec for APPtivity Labs products with accounts. Source of truth for UX + API expectations.

**Terms version:** `2026-09-28`  
**Brand:** APPtivity Labs, LLC

## Flow (both steps required)

```
Signup / Login → TOS popover acknowledge → Core tracking consent → Enter app
```

Block the app shell while `needsTermsAcceptance` or `needsCoreTrackingConsent`.

Legacy users missing `termsAcceptedAt` / matching `termsVersion`, or missing core analytics consent timestamps, must complete the gate before using authenticated features.

---

## A. Terms acceptance — popover UX (required)

Full Terms stay at `/terms` for SEO/footer. **Signup acknowledgment happens inside a modal/popover**, not by hoping the user opens a new tab.

### Component API

`TermsConsentPopover` with:

| Prop | Values | Default |
| --- | --- | --- |
| `mode` | `'acknowledge'` \| `'scroll-ack'` | `'acknowledge'` |
| `termsVersion` | string ISO date version | Labs current |
| `privacyUrl` / `termsUrl` | paths | `/privacy`, `/terms` |
| `onAcknowledged` | `(payload) => void` | — |

Shared behavior:

1. Parent shows **two visible checkboxes** (CURSOR-759 / formerly CAL-759): one for **Terms of Service**, one for **Privacy Policy**. Continue stays disabled until both are acknowledged.
2. Terms row: checkbox + link opens the Terms popover; **I agree** in the popover checks the Terms box (do not accept via bold link alone).
3. Privacy row: checkbox + link to `/privacy` (new tab OK); user checks the box after reading.
4. Popover: short summary + scrollable full Terms body; quiet **Open full page** link for a11y/print.
5. Footer: primary **I agree** / **Acknowledge**; Cancel/Close without accepting.
6. Agreeing sets local `tosAcknowledged` for that version; parent **Continue** stays disabled until both boxes are done.
7. Submit gate: `POST /api/auth/accept-terms` with `{ termsVersion }` → persist `termsAcceptedAt` + `termsVersion` on the user (server of truth). **Never trust client-only acceptance.**

### Default — `acknowledge`

Enable **I agree** as soon as the popover is open (user can scroll freely). Clicking Agree records acknowledgment for the current version.

### Secondary — `scroll-ack`

Use for stronger evidence of review (regulated / higher-risk products):

1. Terms body is a scroll container.
2. **I agree** stays **disabled** until `scrollTop + clientHeight >= scrollHeight - epsilon` (or bottom sentinel via IntersectionObserver).
3. Optional helper copy: “Scroll to the end to continue.”
4. On reach-bottom, enable **I agree**; same API persistence as default.

Ship **acknowledge** as the Labs default everywhere; enable **scroll-ack** per product flag when needed.

---

## B. Core tracking consent (required to use service)

UI when `requireCoreConsent` is **true** (Labs default for account products):

| Purpose | Required? |
| --- | --- |
| Product analytics | Yes (checked / disabled-on) |
| Session replay / diagnostics | Yes where the product uses it |
| Error monitoring | Disclosed as core (may be always-on operationally) |
| Experiments | Optional, off by default |
| Marketing attribution | Optional, off by default |

Disclosure in TOS popover + tracking step must match Terms: service use requires improvement/error telemetry; no sale/trade/exchange of personal info for marketing.

API: ATLAS-style `PUT .../analytics-consent` with `sourceSurface: 'onboarding_consent'` where present; otherwise localStorage gate + server flag when the product adds ATLAS later.

**Decline core → cannot continue.**

---

## Portable UI

Copy from skill templates or Miles2Go reference:

- `TermsConsentPopover` — `mode: 'acknowledge' | 'scroll-ack'`
- Adapt Miles2Go `AcceptTermsPage` to open popover (not checkbox-only + external link only)
- Adapt `AnalyticsConsentForm` with `requireCoreConsent` default **true**

## Versioning

`TERMS_VERSION = '2026-09-28'`. Re-prompt when stored version &lt; current.

## Hard rules

1. Required tracking consent for service use.
2. No-sale / no-trade / no-exchange language in Terms + Privacy companion.
3. Never trust client-only Terms acceptance without a server timestamp.
4. Default TOS UX is **popover acknowledge**; secondary is **scroll-to-end then acknowledge**.
5. **Two visible checkboxes** for Terms and Privacy on accept-terms (CURSOR-759); Continue disabled until both are acknowledged — never bold-link-only acknowledgement.
6. Marketing-only surfaces (no accounts): Terms pages only; if a checkbox is added later, it must open the same popover pattern—not a bare external link.
