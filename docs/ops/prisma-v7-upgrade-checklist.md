# Prisma ORM 6 → 7 upgrade checklist

Pilot completed on **FavorBank**.

## Recipe (Node ESM / JS apps)

Use this path until apps fully adopt TypeScript for the data layer. Prisma 7’s new `prisma-client` generator emits TypeScript/`export type` that plain Node cannot load; **`prisma-client-js` still works on Prisma 7** and keeps `@prisma/client` imports stable.

1. Install: `npm i @prisma/client@7 @prisma/adapter-pg pg` and `npm i -D prisma@7` (ensure `dotenv` present).
2. `prisma/schema.prisma`:
   - Keep `provider = "prisma-client-js"`
   - Remove `url = env("DATABASE_URL")` from `datasource` (URL moves to config)
3. Add root `prisma.config.ts` with `defineConfig` + `env("DATABASE_URL")` + migrations/seed.
4. Update central client (`server/lib/prisma.js`):
   - `import 'dotenv/config'` **before** reading `DATABASE_URL` (ESM import order)
   - `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`
5. Update any script/seed that calls `new PrismaClient()` to pass the same adapter.
6. `npx prisma generate`
7. Smoke: `user.count` (or equivalent) + `/api/health` + cheap unit tests
8. Deploy/restart; commit Prisma-related files only

## Do not

- Mix with Tailwind 4 or Vite majors in the same PR
- Use `prisma-client` + custom `output` on plain JS servers without `tsx` (generated `.ts` / `export type` will crash Node)
- Pass Accelerate `prisma://` URLs into `PrismaPg`

## Roll order

1. favorbank (pilot)  
2. miles2go  
3. calendar  
4. apptivity  
5. apochromatic  
6. goatkitz (last — largest import surface)

## TypeScript follow-up (later)

Migrate generators to `prisma-client` + required `output` when the app runs under TypeScript/`tsx` end-to-end.
