# Prompt: App Store asset best practices (Labs iOS)

Source: [Apple — App Store asset best practices](https://developer.apple.com/app-store/asset-best-practices/) (capture for Labs Rulebook).  
Also read: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (§2.3 Accurate Metadata) and [Apple Advertising Policies](https://developer.apple.com/app-store/advertising/).

Use when creating or updating **App Store Connect** assets for Labs **iOS** apps (FavorBank, Miles2Go, and any future Capacitor/CapGo product). Do **not** invent App Store packaging for web-only products.

## Asset types

| Asset | Role |
|-------|------|
| **App icon** | Store + Home Screen / Spotlight — unique, expressive, legible at all sizes |
| **Product page header** | First impression on the product page (image or video creative) |
| **Search results creative** | First impression in Search (optional; else events/previews/screenshots show) |
| **Screenshots** | Up to 10 on product page; up to 3 may appear in search |
| **App previews** | Up to 3 short videos of real UI / gameplay |
| **In‑App Events** | Event card **16:9** + details **9:16**; complement the event badge |
| **Creative assets** | Brand / seasonal / new content (iOS 27+ surfaces including product page & search) |

Prefer Apple’s official templates (Figma / Photoshop / Pixelmator / Sketch) and preview in **App Store Connect** (product page preview + Preview tool) before publish.

## Content & policy (all assets)

### Focus on the core experience

- Show the app **in use** (or content clearly tied to its function).
- **Do not** include: specific pricing or discounts, website URLs, copyright symbols, unverifiable awards/claims, logos or references to other platforms/marketplaces.
- **Do not** include Apple-designated badges (Editor’s Choice, App of the Day, Game of the Day, Apple Design Award, etc.) — those already appear in Store UI when earned.

### Design for all customers

- **Global audience** — inclusive imagery; localize images/videos/metadata for regions you ship.
- **4+ Store display** — assets shown on the App Store must be appropriate for age rating **4+**, even if the app itself is rated higher. Avoid objectionable content (explicit/harmful imagery, profanity, illegal drugs, self-harm, hate speech, stereotypes, sexually suggestive content, inflammatory religious commentary, misleading religious quotations).
- **Violence** (if ever relevant) — no gore/graphic imagery; no weapons pointed at a person or the viewer.

## Format guidance

### Still images

- Current photography/illustration/UI; strong composition; clear focal point.
- Text overlays: short phrase that **enhances** the visual, not a long description; localize.
- Keep key art and text in the **safe area**; center the focal point to avoid clipping across devices/orientations.

### Video (app previews & creatives)

- **Poster frame** must stand alone and represent the app.
- **Start strong** — value prop / best feature in the first seconds; pacing slow enough to follow (accessibility).
- **Loop seamlessly** — no visible jump on repeat (Store autoplays/loops).
- **Audio muted by default** — creative must work silent; if audio is used, short music loop > heavy SFX; no sudden loud peaks; loop cleanly.

## Per-asset checklist

### App icon

- [ ] Unique and instantly recognizable at small sizes
- [ ] Expresses product purpose/personality
- [ ] Prefer **Icon Composer** layered Liquid Glass when targeting current Apple icon pipelines
- [ ] Verify legibility: App Store, Spotlight, Home Screen

### Product page header

- [ ] One clear idea (not dense collage)
- [ ] Designed for a **first-time** visitor
- [ ] Safe-area checked in Apple templates
- [ ] Optional: reuse as universal creative with search results for brand consistency
- [ ] Optional: product page optimization A/B for header variants

### Search results

- [ ] Purpose obvious at a glance
- [ ] Prefer firsthand UI/content experience
- [ ] Safe-area checked

### Screenshots

- [ ] Depict real in-app UX (not accolades/CTA wallpaper)
- [ ] Lead with strongest features; sequence as a use story
- [ ] Match current UI / brand aesthetic
- [ ] Specs: follow Apple screenshot specifications for device sizes

### App previews

- [ ] Real UI (or gameplay), not slide decks
- [ ] Beginning / middle / end story
- [ ] Compelling first seconds; poster frame strong
- [ ] Silent-first; seamless loop

### In‑App Events

- [ ] Both **16:9** card and **9:16** details media
- [ ] Visual continuity (color/illustration)
- [ ] Complements the event badge (does not duplicate its label)

## Labs workflow notes

- Marketing catalog frames (`public/marketing/…`) are **not** a substitute for App Store Connect assets, but style/tone should stay congruent with store screenshots.
- When regenerating store-bound shots, follow this playbook **and** product brand rules; prefer skill `app-marketing-catalog` for catalog gallery work.
- Submit via App Store Connect (version or Asset Library) or ASC API; keep approved assets in the Asset Library for reuse.

## Anti-patterns

| Avoid | Why |
|-------|-----|
| Price/sale overlays on screenshots | Evergreen + global relevance; policy |
| “#1 app” / fake awards | Unverifiable claims |
| Android/Play Store marks | Other-platform references banned |
| Tiny unreadable UI chrome as hero | Fails legibility / safe area |
| Fast-cut music-video preview | Hard to follow; accessibility |
| Web-only product “fake” App Store pack | Scope: iOS apps only |
