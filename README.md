# APPtivity Labs, LLC Static Website

This repository contains a dependency-free static website for **APPtivity Labs, LLC**, intended for deployment to Cloudflare Pages at <https://www.apptivity.online>.

## Project structure

All deployable files are in `public/`:

- `index.html` — homepage and product overview
- `contact.html` — public contact page
- `privacy.html` — Privacy Policy, including SMS/mobile data language
- `terms.html` — Terms of Service, including SMS terms
- `sms-opt-in.html` — SMS opt-in disclosure for transactional messages
- `styles.css` — responsive site styles
- `logo.svg` — simple APPtivity Labs wordmark
- `favicon.svg` — browser favicon
- `_headers` — Cloudflare Pages security headers
- `_redirects` — clean-URL rewrites, including `/sms-opt-in`

## Cloudflare Pages deployment

1. Push this repository to GitHub.
2. In Cloudflare, open **Workers & Pages** and choose **Create application**.
3. Select **Pages** and connect the GitHub repository.
4. Use these build settings:
   - **Framework preset:** None
   - **Build command:** leave blank
   - **Build output directory:** `public`
5. Deploy the site.
6. Add the custom domain `www.apptivity.online` in the Cloudflare Pages project settings.
7. Confirm DNS is proxied through Cloudflare and that the Pages custom domain status is active.

## Cloudflare Workers Static Assets deployment

The production site must be deployed from a commit that contains
`public/sms-opt-in.html`. Editing the file in Codex does not upload it to
Cloudflare; the commit must be pushed to GitHub and a new deployment must finish.

1. Push the current branch to GitHub and merge its pull request into the branch
   connected to Cloudflare (normally `main`).
2. In **Cloudflare Dashboard → Workers & Pages**, open `apptivity-labs`.
3. Open **Settings → Builds** and verify the connected repository is
   `Marleyku/apptivity-labs` and the production branch is `main`.
4. Verify the deploy command is `npx wrangler deploy`. The checked-in
   `wrangler.jsonc` publishes `./public`, so no Worker JavaScript entry point or
   separate build output is needed.
5. Open **Deployments**, retry the latest deployment (or create a new one), and
   deploy the newest `main` commit.
6. Confirm the deployment log reports a successful asset upload. Then visit
   <https://apptivity.online/sms-opt-in> in a private browser window.

The `_redirects` file rewrites both `/sms-opt-in` and `/sms-opt-in/` to the
deployed `sms-opt-in.html` asset. If both the clean URL and
`/sms-opt-in.html` return 404, Cloudflare is serving a deployment that does not
contain the file; clearing a browser cache will not upload it.

## Local preview

Because the website is plain HTML/CSS, it can be previewed with any static file server. For example:

```bash
python3 -m http.server 8080 --directory public
```

Then open <http://localhost:8080>.
