# APPtivity Labs, LLC Static Website

This repository contains a dependency-free static website for **APPtivity Labs, LLC**, intended for deployment to Cloudflare Pages at <https://www.apptivity.online>.

## Project structure

All deployable files are in `public/`:

- `index.html` — homepage and product overview
- `contact.html` — public contact page
- `privacy.html` — Privacy Policy, including SMS/mobile data language
- `terms.html` — Terms of Service, including SMS terms
- `styles.css` — responsive site styles
- `logo.svg` — simple APPtivity Labs wordmark
- `favicon.svg` — browser favicon
- `_headers` — Cloudflare Pages security headers

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

## Local preview

Because the website is plain HTML/CSS, it can be previewed with any static file server. For example:

```bash
python3 -m http.server 8080 --directory public
```

Then open <http://localhost:8080>.
