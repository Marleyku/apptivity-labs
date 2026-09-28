# Prompt: ship after change (product deploy map)

After shippable app/server/Worker changes land for a Labs product, publish so the host matches the work—unless the user says not to deploy.

## Hard rule

1. Identify the product repo (cwd / workspace).
2. Read ALGR `sites.json` for that product’s `deploy` command list.
3. Run those steps in order (migrations before rebuild/restart when schema changed).
4. Smoke the product’s health / `version.json` / public URL as appropriate.
5. Note deploy state in any Linear completion comment (`shipped` / `not deployed`).

## Typical patterns (see sites.json for authoritative commands)

| Product | Pattern |
| --- | --- |
| sites | `npm run deploy` (Vite + wrangler) |
| favorbank | migrate → build → `pm2 reload favorbank` |
| miles2go / apptivity / goatkitz / apochromatic | build → `systemctl --user restart …` |
| calendar | `npm run deploy` |
| createacal-www | `npx wrangler deploy` |
| teaching | `npm run serve` (dist freshness) |

## Related

- `dist-rebuild-race` — if the product serves live `dist/`
- `restart-when-needed` — HMR vs process restart
- Product overlays may still exist (`prod-publish.mdc`, `deploy-after-push.mdc`, `commit-push-deploy.mdc`); prefer ALGR map when they conflict.
