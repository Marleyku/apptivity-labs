# Tailwind CSS 3 → 4 upgrade checklist

Pilot completed on **FavorBank** (`npx @tailwindcss/upgrade@latest --force`).

## Recipe (Vite + React apps)

1. Clean git tree (or use `--force` if only unrelated untracked files).
2. Run: `npx @tailwindcss/upgrade@latest --force`
3. Confirm:
   - `tailwindcss@4.x` + `@tailwindcss/postcss@4.x` installed
   - `autoprefixer` removed (v4 handles prefixes)
   - `postcss.config.js` uses `'@tailwindcss/postcss': {}`
   - `src/index.css` uses `@import 'tailwindcss'` (no `@tailwind` directives)
   - Theme tokens live in `@theme { ... }` in CSS; `tailwind.config.js` deleted when migrated
   - `darkMode: 'class'` becomes `@custom-variant dark (&:is(.dark *));` when present
4. `npm run build` must succeed.
5. Visual smoke: home/dashboard, auth, one settings surface, dark mode if used.
6. Deploy/restart per app; verify `/api/health` or public 200.
7. Commit only Tailwind-related files.

## Optional Vite plugin path

Upgrade guide prefers `@tailwindcss/vite` over PostCSS for Vite. The official upgrade tool currently migrates to `@tailwindcss/postcss`. Keep PostCSS unless a repo needs the Vite plugin for perf/DX.

## Roll order

1. favorbank (pilot)  
2. apochromatic (tiny CSS)  
3. miles2go  
4. apptivity  
5. calendar  
6. teaching (large `index.css`)  
7. goatkitz storefront (monorepo last)

Do **not** mix with Prisma 7 or Vite majors in the same PR.

## Class / template notes

The upgrade tool rewrites many template class names (shadow/outline/ring renames, etc.). Review `git diff --stat` for unexpected scope; do not hand-edit unless build or visual smoke fails.
