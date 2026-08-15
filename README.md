# APPtivity Labs website

This repository contains the public administrative website for **APPtivity Labs, LLC**. Production is deployed as the Cloudflare Worker `apptivity-labs`, with static assets served from `public/`.

- Canonical production URL: <https://www.apptivity.online>
- Worker preview URL: <https://apptivity-labs.mkunzler.workers.dev>
- Source repository: <https://github.com/Marleyku/apptivity-labs>

Requests to `https://apptivity.online` are permanently redirected to the same path and query string on `https://www.apptivity.online`.

## Project structure

- `public/` â€” deployable HTML, CSS, SVG assets, and security headers
- `worker/index.js` â€” canonical-host redirect and static-assets delegation
- `wrangler.jsonc` â€” production Worker and assets configuration
- `scripts/check-site.mjs` â€” dependency-free HTML, route, link, and Worker-routing checks
- `.github/workflows/deploy.yml` â€” validation and production deployment workflow

Clean policy routes are provided for `/privacy`, `/terms`, and `/sms-opt-in` through Workers static-assets HTML handling.

## Local validation

Node.js 24 is used in CI. Run:

```bash
npm run check
npx --yes wrangler@4 deploy --dry-run --outdir .wrangler/dry-run
```

For a browser preview of the static files:

```bash
python3 -m http.server 8080 --directory public
```

Then open <http://localhost:8080>.

## Production deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`. The workflow validates the site and Worker bundle before deploying with Cloudflare's official Wrangler action.

Configure these GitHub Actions secrets for the repository:

- `CLOUDFLARE_ACCOUNT_ID` â€” the Cloudflare account containing `apptivity-labs`
- `CLOUDFLARE_API_TOKEN` â€” a narrowly scoped token with permission to deploy Workers in that account

Never commit token values. The deployment job uses the protected GitHub `production` environment and prevents overlapping production deployments.

Manual deployments can be started from the workflow's **Run workflow** control. For emergency rollback, select a previous deployment in the Cloudflare Worker dashboard or use Wrangler's rollback command from an authenticated workstation.

## Monitoring

Cloudflare Web Analytics should track `www.apptivity.online`. The scheduled `Uptime check` GitHub Actions workflow checks the homepage and public policy routes and creates or updates a GitHub issue when production is unhealthy.
