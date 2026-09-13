# Deploy checklist — Labs Terms + consent

## 1. Canonical docs (sites)

- [ ] `docs/legal/TOS-TEMPLATE.md`, `PRIVACY-COMPANION.md`, `CONSENT-CONTRACT.md` current
- [ ] `TERMS_VERSION` / effective date bumped when copy changes
- [ ] Live Labs Terms + Privacy updated from template
- [ ] `npm run deploy` in `/home/marley/Code/sites`

## 2. Product Terms pages

For each operating product, render the template with product placeholders:

| Product | Typical target |
| --- | --- |
| sites | `src/pages/Terms.jsx`, `Privacy.jsx` |
| miles2go | Marketing Terms + `src/config/terms.js` |
| favorbank | `TermsPage.jsx` (+ Privacy companion) |
| calendar | `Terms.jsx` (+ Privacy) |
| createacal-www | `public/terms/index.html` (+ privacy blurb) |
| goatkitz | CMS / `terms-of-service-html.ts` fallback |
| apptivity | `/terms` (+ `/privacy` stub if missing) |

Preserve product-specific IP addenda (e.g. CreateACal photo license) after the common sections.

## 3. Consent gate (account products)

- [ ] `TermsConsentPopover` wired on accept-terms / onboarding (`acknowledge` default)
- [ ] `POST /api/auth/accept-terms` (or equivalent) persists `termsAcceptedAt` + `termsVersion`
- [ ] Core tracking consent with `requireCoreConsent: true`; decline blocks entry
- [ ] App shell blocked while gate incomplete
- [ ] Optional: product flag for `scroll-ack` mode

## 4. Marketing-only

- [ ] Terms/Privacy pages updated
- [ ] Footer/links point at local `/terms` or `https://www.apptivity.online/terms`
- [ ] No account gate required

## 5. Smoke

- [ ] `/terms` shows required telemetry + no-sale sections
- [ ] Signup: Terms link opens popover → Acknowledge enables continue → tracking → app
- [ ] `scroll-ack` verified if enabled for that product
- [ ] SMS opt-in pages still link correctly; not replaced by this TOS
