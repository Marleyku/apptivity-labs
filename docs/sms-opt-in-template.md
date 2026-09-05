# SMS Opt-In — VIA_TEXT compliance template

Single source of wording for Twilio toll-free verification (TFV). Keep **VIA_TEXT** (`START` / `Y`). Do **not** use a website checkbox form as the primary consent method.

Replace placeholders per product. Consent structure stays identical; only names, emails, and sample flavor change.

## Placeholders

| Placeholder | Example |
|-------------|---------|
| `{{APP_NAME}}` | FavorBank, Miles2Go, APPtivity, APPtivity Labs, Kunzler Family |
| `{{BRAND_LEGAL}}` | APPtivity Labs, LLC (or product legal name) |
| `{{SUPPORT_EMAIL}}` | support@favorbank.app |
| `{{SMS_NUMBER}}` | +1 833-633-6162 |
| `{{SMS_NUMBER_E164}}` | +18336336162 |
| `{{PRIVACY_URL}}` | https://…/privacy |
| `{{TERMS_URL}}` | https://…/terms |
| `{{OPT_IN_URL}}` | https://…/sms-opt-in |

## TFV use-case categories (do not narrow)

Keep all six on the TFV record and name them in consent copy:

1. **TWO_FACTOR_AUTHENTICATION** — verification / authentication codes  
2. **ACCOUNT_NOTIFICATIONS** — account activity and notices  
3. **CUSTOMER_CARE** — support / help replies  
4. **DELIVERY_NOTIFICATIONS** — fulfillment / shipment-style / delivery notices  
5. **EVENTS** — event, schedule, and reminder notices  
6. **SECURITY_ALERT** — security alerts  

Program is **transactional/service only**. No marketing or promotional SMS under this consent.

---

## Page copy (render in UI)

### Hero

**Kicker:** SMS messaging consent  

**Headline:** Clear consent. / No surprises.  

**Support:**  
`{{APP_NAME}}` only sends optional **transactional/service** text messages after you opt in by texting **START** or **Y** to `{{SMS_NUMBER}}`. Consent happens from your phone — not through a website form.

### How to opt in (VIA_TEXT)

1. Open Messages on your phone.  
2. Send **START** or **Y** to `{{SMS_NUMBER}}` (tap-to-text CTA allowed).  
3. You will receive a confirmation SMS.  

Consent is never assumed and is never collected through a primary website checkbox form.

### Consent statement (required — lists all six types)

By texting **START** or **Y** to `{{SMS_NUMBER}}`, you agree to receive **transactional/service** SMS from `{{BRAND_LEGAL}}` / `{{APP_NAME}}` for:

- verification and two-factor authentication codes  
- account notifications  
- customer care and support replies  
- delivery and fulfillment notices  
- event, schedule, and reminder notices  
- security alerts  

These messages are **not** marketing or promotional. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply. Reply **STOP** to opt out or **HELP** for help. See `{{PRIVACY_URL}}` and `{{TERMS_URL}}`.

### Messages you may receive

Same six types as above, with optional one-line product examples (app flavor only).

### Confirmation after START/Y

> `{{APP_NAME}}`: You’re subscribed to transactional SMS for verification codes, account notifications, customer care, delivery notices, event/schedule reminders, and security alerts. Msg&data rates may apply. Reply HELP for help, STOP to cancel. `{{OPT_IN_URL}}`

### HELP reply

> `{{APP_NAME}}` Support: Transactional SMS for verification, account notices, customer care, delivery notices, events/reminders, and security alerts. Msg&data rates may apply. Reply STOP to cancel. Help: `{{SUPPORT_EMAIL}}` · `{{OPT_IN_URL}}`

### STOP

Reply **STOP** anytime to unsubscribe. One confirmation is sent; no further SMS unless you text **START** or **Y** again.

### Sample outbound messages (one per category)

Use product flavor; keep category clear:

| Category | Sample pattern |
|----------|----------------|
| 2FA | `{{APP_NAME}}`: Your verification code is 123456. Do not share this code. Reply STOP to cancel. |
| Account | `{{APP_NAME}}`: Account notice — [brief account event]. Reply STOP or HELP. |
| Customer care | `{{APP_NAME}}`: Support update — [brief reply]. Reply STOP or HELP. |
| Delivery | `{{APP_NAME}}`: Delivery/fulfillment update — [brief status]. Reply STOP or HELP. |
| Events | `{{APP_NAME}}`: Reminder — [event/schedule]. Reply STOP or HELP. |
| Security | `{{APP_NAME}}`: Security alert — [brief alert]. If this wasn’t you, contact `{{SUPPORT_EMAIL}}`. Reply STOP or HELP. |

### Support footer

Questions: `{{SUPPORT_EMAIL}}`  
Entity: `{{BRAND_LEGAL}}`

---

## TFV field alignment (API)

When editing the Toll-Free Verification, keep:

- `optInType` = `VIA_TEXT`  
- `optInKeywords` = `START`, `Y`  
- `useCaseCategories` = all six (unchanged)  
- `optInImageUrls` = live pages that show this **text** opt-in flow  
- `optInConfirmationMessage` / `helpMessageSample` / `useCaseSummary` / `additionalInformation` = same six-type transactional language as above  
- Explicit: no promotional or marketing SMS under this program  
