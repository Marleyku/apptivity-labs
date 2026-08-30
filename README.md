# APPtivity Labs site

Corporate / marketing site for **APPtivity Labs**, hosted on Cloudflare Workers as `apptivity-labs`.

- Production: https://www.apptivity.online
- Source of truth: this repo (ported from the former ChatGPT Site)
- Admin catalogs: https://www.apptivity.online/admin (Cloudflare Access)

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

For the beta form API locally:

```bash
npx wrangler dev
```

## Deploy

```bash
npm run deploy
```

Deploys Worker `apptivity-labs` to `apptivity.online` and `www.apptivity.online`.

Beta applications are stored in the `BETA_APPLICATIONS` KV namespace (`beta:<uuid>` keys plus `beta:index`).

## In-app Feedback FAB

Public floating **Feedback** button (screenshot + markup → `POST /api/feedback`).

- Persists to KV as `feedback:<uuid>` (+ `feedback:index`)
- Best-effort sync to Linear **Cursor Apps** as `[Needs Review][category] …` (Backlog + **Needs Review** label)
- Agents must **not** implement FAB issues until a human explicitly approves them (see `.cursor/rules/fab-feedback-gate.mdc`)

### Linear secrets (Worker)

```bash
npx wrangler secret put LINEAR_API_KEY
# optional overrides:
# npx wrangler secret put LINEAR_TEAM_ID
# npx wrangler secret put LINEAR_FEEDBACK_LABEL_ID
# npx wrangler secret put LINEAR_FEEDBACK_STATE_ID
```

Defaults (Cursor Apps): team `a1565639-bc8b-4101-9969-8ae775e626a3`, Needs Review label `ce252be7-84b7-4e92-a675-dd594483fcf4`, Backlog `8ea9b562-ba0b-4e94-83e1-71e31e9ac4d0`.

Local: copy `.dev.vars.example` → `.dev.vars` and set `LINEAR_API_KEY`.

## Marketing catalogs + Access admin

Catalogs live under `public/marketing/<appSlug>/` (`catalog.json` + iPhone 16 framed shot pairs).

Admin UI:

- `/admin` — index of apps
- `/admin/:appSlug` — marketing brief, top 15 features, shot gallery (top-down | perspective together)

### Cloudflare Access (`/admin*`)

Protect `www.apptivity.online/admin*` (and optionally `apptivity.online/admin*` before the apex redirect) with Cloudflare Access. Allowlist operator email(s); default `mkunzler@gmail.com`.

1. Enable Zero Trust / Access once: [Zero Trust dashboard](https://one.dash.cloudflare.com/) → create team / Enable Access if prompted.
2. Create an API token with **Access: Apps and Policies Write** and **Access: Organizations, Identity Providers, and Groups Write**.
3. Run:

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=987539556123157f25da0488779bc326
node scripts/setup-cloudflare-access.mjs
```

4. Open https://www.apptivity.online/admin, complete the Access login (email OTP or configured IdP), then browse galleries.
5. Do **not** add `/admin` to public uptime checks (they would fail without Access cookies).

**Browser access:** complete Cloudflare Access login (email / IdP). Access sits at the edge before the Worker.

**Stored Worker Basic Auth** (second layer / local / fallback if Access identity is present or Access is disabled): secrets `ADMIN_BASIC_USER` + `ADMIN_BASIC_PASS`. Local copy (gitignored): `.admin-basic.local`. When Access has authenticated the request (`Cf-Access-Authenticated-User-Email`), Basic Auth is skipped.

### Regenerate catalogs

Personal Cursor skill: `~/.cursor/skills/app-marketing-catalog/`

Or reseeds from existing screenshots:

```bash
node scripts/seed-marketing-catalogs.mjs
node ~/.cursor/skills/app-marketing-catalog/scripts/validate-catalog.mjs public/marketing/miles2go
```
