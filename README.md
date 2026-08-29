# APPtivity Labs site

Corporate / marketing site for **APPtivity Labs**, hosted on Cloudflare Workers as `apptivity-labs`.

- Production: https://www.apptivity.online
- Source of truth: this repo (ported from the former ChatGPT Site)

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
