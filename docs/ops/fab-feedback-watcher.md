# FAB feedback watcher (best practices)

## Goal

Watch Linear for in-app FAB → `[Needs Review]` issues, then either:

1. **Triage** (default): summarize + email `admin@goapptivity.com` asking **approve / defer / reject**
2. **Auto-build** (gated): implement/repair only when authorized

## Authorization (hard gate)

| Signal | Agent action |
|--------|----------------|
| `[Needs Review]` / label Needs Review / `Approval: pending` / `Source: in-app-fab` | Summarize only. Do **not** code. |
| Title or body contains **`-AMK`** | Authorized — implement immediately in mapped repo |
| Human says **approve \<issue\>** in chat, or Linear `Approval: approved` | Implement that one issue only |
| “process feedback” / “next iteration” | Fetch newest FAB issue → ask approve/defer/reject |

Never batch-implement ungated FAB items.

## Repo map (team / id prefix → code)

| Linear | Repo path | Deploy / restart |
|--------|-----------|------------------|
| Miles2Go / `M2G-*` | `/home/marley/Code/miles2go` | `npm run build` + `systemctl --user restart miles2go` |
| FavorBank / `FVRB-*` | `/home/marley/Code/favorbank` | `npm run build` + `pm2 restart favorbank` |
| Teaching / `TEA-*` | `/home/marley/Code/teaching` | `npm run build` + restart `npm run serve` |
| Calendar / CreateACal | `/home/marley/Code/calendar` | `npm run deploy` |
| Cursor Apps + `apptivity.online` | `/home/marley/Code/sites` | `npm run deploy` |
| APPtivity product (`goapptivity.com`) | `/home/marley/Code/apptivity` | restart `apptivity` + `apptivity-vite` |
| GOATkitz / `GOA-*` | `/home/marley/Code/goatkitz` | `npm run build` + restart `goatkitz` (+ vite) |

## Watcher cadence

- Cursor Automation (Glass): **every 15m** — “FAB Needs Review watcher”
- Local agent loop: `AGENT_LOOP_TICK_fab_watch` every 15m (same prompt)

Each tick:

1. List issues updated in the last ~20m with Needs Review / `[Needs Review]` / `in-app-fab`
2. Skip already-seen ids (state file below)
3. For each new issue: triage email **or** `-AMK`/approved build
4. Comment on Linear when work starts/finishes

## State file

`docs/ops/.fab-watcher-seen.json` — last processed Linear issue ids + timestamps (gitignored).

## Admin galleries

Access-protected: https://www.apptivity.online/admin  
Cloudflare Access email allowlist required.
