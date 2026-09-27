# Deferred major upgrades (backlog)

Recorded as backlog only — **not** in current execution scope. Patch floors (React 19.3, react-router-dom 7.18.4, Vite 6.4.3, Express 4.22.3) remain the supported baseline.

## Vite 6 → 7/8

- Highest ROI among deferred majors (Rolldown build speed, unified bundler).
- Climb via Vite 7 → optional `rolldown-vite` → Vite 8.
- Touches all frontends: sites, miles2go, favorbank, goatkitz storefront, calendar, apptivity, teaching, apochromatic.
- Revisit after Tailwind 4 + Prisma 7 projects (both landed).

## Express 4 → 5

- Security/hygiene (`path-to-regexp` ReDoS mitigations, async error forwarding).
- Requires route-path audit across every Express API; not a performance win.
- Stay on Express 4.22.x until a dedicated route-audit project is scheduled.

## React Router 7 → 8

- New baseline (ESM-only, middleware defaults, drop `react-router-dom` shim).
- Requires Vite 7+ and Node 22.22+.
- Limited upside for SPA library-mode apps until Framework Mode is intentional.
- Stay on v7 and keep patching until then.

## Priority when promoted

1. Vite 8  
2. Express 5  
3. React Router 8 (after Vite)
