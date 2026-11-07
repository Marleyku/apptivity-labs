# Prompt: safe-area inset watch (native-ready webapps)

Prepare Labs SPAs so a future **App Store / Play** shell (Capacitor / CapGo) does not clip UI under the status bar, notch, Dynamic Island, or home indicator.

## Why a watch

CSS `env(safe-area-inset-*)` alone is usually enough on modern browsers, but native WebViews often:

- report **0** insets until after first layout / orientation change
- change insets when rotating, folding, or toggling system UI
- need **CSS variables** for Tailwind/arbitrary values and JS layout math

A small boot-time watch keeps `--safe-area-inset-*` (and aliases) current.

## Required HTML

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

Without `viewport-fit=cover`, insets stay `0` even on notched devices.

## CSS usage (preferred)

```css
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
}

/* Examples */
.fixed-header {
  padding-top: max(0.5rem, var(--safe-area-inset-top));
}
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.feedback-fab {
  bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px));
}
```

Surfaces that **must** respect insets:

| Surface | Typical inset |
|---------|----------------|
| Sticky / fixed top chrome | top (+ left/right if edge-to-edge) |
| Bottom navigation / tab bar | bottom |
| Feedback FAB / floating actions | bottom (and side if needed) |
| Bottom sheets / dial sheets | bottom |
| Full-bleed auth / onboarding | top + bottom |
| Drawers from the edge | top + bottom (+ side) |

## JS watch (required for Cap-ready SPAs)

Install once at app entry (after DOM ready):

```js
import { installSafeAreaInsetWatch } from './lib/installSafeAreaInsetWatch.js';
installSafeAreaInsetWatch();
```

Canon template: ALGR `scraps/safe-area-inset-watch/templates/installSafeAreaInsetWatch.js`.

Behavior:

1. Measure `env(safe-area-inset-*)` via a probe element (or read computed custom properties).
2. Write `--safe-area-inset-top|right|bottom|left` on `:root` (and optional `--sat` / `--sab` aliases).
3. Re-run on `resize`, `orientationchange`, and `visualViewport` `resize`/`scroll` when available.
4. No-op harmlessly on desktop browsers (values stay `0px`).

## Native StatusBar (when Cap is present)

If `@capacitor/status-bar` is used:

1. `StatusBar.setOverlaysWebView({ overlay: true })` so content draws edge-to-edge.
2. Rely on safe-area padding — do **not** add a fake fixed status-bar spacer that fights insets.
3. Reference: Miles2Go `src/utils/nativeStatusBar.js`.

## Anti-patterns

| Avoid | Why |
|-------|-----|
| Hard-coded `padding-top: 44px` / `47px` for “iPhone notch” | Breaks on Android cutouts, islands, landscape, tablets |
| Omitting `viewport-fit=cover` | Insets always zero in Cap WebView |
| Ignoring bottom inset on FAB / tab bar | Controls sit under the home indicator |
| Watching once at boot only | Orientation / split changes leave stale layout |
| Applying safe-area only in “native” builds | Ship the same CSS/JS on web so store conversion is a packaging step |

## Checklist (new webapp or Cap enablement)

1. Viewport meta includes `viewport-fit=cover`.
2. `installSafeAreaInsetWatch()` at boot.
3. Fixed top/bottom chrome and FABs use `env(...)` / CSS vars.
4. If Cap StatusBar is enabled, overlay + safe-area (no double padding).
5. Smoke on a notched simulator / device (portrait + landscape).
