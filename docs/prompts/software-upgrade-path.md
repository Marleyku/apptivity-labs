# Prompt: Labs software upgrade path

Phased campaign to get **all** ALGR `sites.json` products onto the **latest practical** versions. Inventory dated **2026-10-03**. Do **not** execute a phase unless the user starts it. Always run **Phase 0** (forced backups) immediately before the first bump of that phase.

Products: `sites`, `miles2go`, `favorbank`, `calendar`, `apptivity`, `goatkitz`, `teaching`, `apochromatic`, `createacal-www`.

## Current → practical target

| Software | Labs today | Practical target | Why not absolute latest |
|----------|------------|------------------|-------------------------|
| Node | mostly 22; sites CI 24; host 24.13 | **24 LTS** (Krypton) | Node 26 is Current, not LTS |
| React | 19.3.0 | **19.3.0** (no-op / pin) | Already latest |
| Vite (app builds) | 6.4.3; goatkitz root hoist 7.3.6 | **7.3.x** aligned | Vite 8 is a second major; defer |
| Vitest | 2 / 3 / 4 / 5 scatter | **5.0.x** | Teaching already on 5 |
| Wrangler | sites ~4.127; createacal-www unpinned | **4.x latest** (~4.144) | Stay on major 4 |
| Prisma | 7.10.0 | **7.10.0** (confirm) | Prisma 8 is RC only |
| Express | 4.22.3 | **4.22.3** (confirm) | Express 5 is breaking |
| TypeScript | ~5.9.3 where used | **5.9.3** pins | TS 7 too new |
| Playwright | 1.62–1.63 | **1.63.x** | Patch/minor only |
| `@vitejs/plugin-react` | ^4.3.4 | Match Vite 7 peer | Coupled to Vite phase |

No Next.js / Jest in these repos. npm + lockfiles; no Corepack `packageManager` pins.

## Phase 0 — Backup all sites (mandatory)

Use skill `auto-backup` (`~/.cursor/skills/auto-backup`).

1. Confirm each product is in `~/.config/auto-backup/sites.toml`. Register missing sites **before** Phase 1.
2. Force a snapshot for **every** site (`FORCE=1` / `--force`) so “same HEAD” skip and dirty trees still produce a pre-upgrade artifact.
3. Per site: **git bundle (code)** + **Postgres dump** (Prisma/pg products) + **uploads** if configured → `~/Backups/<id>/` and offsite **private** `Marleyku/apptivity-backups`.
4. Verify `history.jsonl` success rows and GitHub Release/files. Do not put dumps in product remotes or R2.
5. **Rollback:** restore that timestamp’s bundle/dump only with explicit user confirmation; restore DB to a **scratch** database first.

If a site has no DB (static Worker: `sites`, `createacal-www`), still backup **code** (bundle) and record Worker/deploy SHA.

## Per-phase execution checklist

1. Forced Auto-Backup for **affected** sites (full Phase 0 if the campaign is starting).
2. Branch / PR per product (or one PR per product in the phase).
3. Bump versions + refresh lockfile.
4. Tests + smoke + product `deploy` map (`sites.json`) unless the user said not to ship.
5. Linear `CURSOR-*` notes only if the user asked for tickets.
6. **Pause** for approval before the next software phase.

## Phase 1 — Node 24 LTS

**Touch:** `.nvmrc` / `engines` / CI workflows / Apochromatic Docker `node:22-*` / docs. Pin **apptivity** (currently unpinned). Align **sites** CI (already 24) with product apps.

**Pitfalls:** native addons, Prisma engine download, Playwright browsers, `miles2go` engines `>=20 <25` (24 is OK).

**Remediation:** revert `.nvmrc` to 22; `rm -rf node_modules && npm ci`; `npx playwright install`; `npx prisma generate`.

**Verify:** `node -v` is 24.x LTS; CI green; unit tests; smoke per deploy map.

## Phase 2 — Vitest 5

**Touch:** favorbank, calendar, apptivity, apochromatic (2.x); goatkitz (3.x); miles2go (4.x). Teaching already 5.0.x.

**Pitfalls:** config keys, pool/threads vs forks, snapshot paths, goatkitz workspace peer (root vs analytics package).

**Remediation:** migrate 2→3→4→5 using Vitest notes; isolate workspace vitest versions; one product at a time.

**Verify:** `npx vitest run` green per product.

## Phase 3 — Vite 7 + plugin-react

**Touch:** all Vite app products. **Unify goatkitz** so root hoist and storefront share one Vite major (today 7 vs 6).

**Pitfalls:** config/env (`envDir`, `loadEnv`), asset URLs, HMR, Workers Assets `dist/` for sites, dist-rebuild-race (staging dir + flock).

**Remediation:** keep 6.4.3 lock; fix `vite.config`; rebuild into `dist.staging` then swap. Cloudflare Workers Builds must run `npm run build` **before** `wrangler deploy` (empty `build_command` leaves `dist` missing).

**Verify:** `npm run build`; local smoke; sites production Worker serves new assets.

**Defer:** Vite 8.

## Phase 4 — Wrangler 4.latest

**Touch:** pin `sites`; add a **pinned** wrangler (or npm script) for `createacal-www` (today floating `npx wrangler`).

**Pitfalls:** assets/config deprecations; Workers Builds trigger with empty `build_command`.

**Remediation:** pin previous 4.127; fix `wrangler.toml`; set CF `build_command` to `npm run build`.

**Verify:** wrangler deploy / dry-run + production smoke.

## Phase 5 — Playwright ~1.63

**Touch:** products with Playwright.

**Pitfalls:** browser download size/CI time; selector flake after browser bump.

**Remediation:** pin prior 1.62.x; `npx playwright install`.

**Verify:** existing e2e/smoke scripts where present.

## Phase 6 — TypeScript 5.9.3 pins

Declare/pin **5.9.3** on products that already use TS (calendar, goatkitz, apochromatic; lock-only miles2go/favorbank). No JS→TS migration. **Defer TypeScript 7.**

**Verify:** `tsc --noEmit` where a tsconfig exists.

## Confirm / no-op (document on upgrade day; no forced churn)

- **React 19.3.0** — already latest; keep pins.
- **Prisma 7.10.0** — latest stable; do not adopt 8 RC.
- **Express 4.22.3** — latest 4.x; Express 5 is a future phase.

## Future backlog (own campaigns)

1. Express 5  
2. Vite 8 + `@vitejs/plugin-react` 6  
3. Prisma 8 after stable GA + adapter-pg guide  
4. TypeScript 7  

Each still starts with Phase 0-style forced backups.

## Related

- Skill `auto-backup`
- Principles `smoke-test-after-plans`, `ship-after-change`, `dist-rebuild-race`, `restart-when-needed`, `developer-contact-email`
