# Prompt: Labs typing animation

Reusable **typing animation** for Labs products: a chat-style bubble with three bouncing dots that means “more is coming” (peer typing, assistant composing, or deferred content still hidden).

**Name:** always call this the **typing animation** in UI docs, tickets, and code comments.

## When to use

| Use | Example |
| --- | --- |
| Chat peer / assistant composing | APPtivity chat “other party is typing” |
| Deferred reveal | Teaching Present Split View — title first, body waiting |
| Soft pending copy | Any in-thread “still writing…” cue |

**Do not use** for full-page loaders, button busy states, or upload progress — those stay product-standard spinners/progress.

## Markup (required structure)

```html
<div class="typing-animation" role="status" aria-live="polite">
  <span class="visually-hidden">
    <!-- Product-specific polite string, e.g. "Someone is typing" -->
  </span>
  <span class="typing-animation-bubble" aria-hidden="true">
    <span class="typing-animation-dot"></span>
    <span class="typing-animation-dot"></span>
    <span class="typing-animation-dot"></span>
  </span>
</div>
```

React template: ALGR `scraps/typing-animation/templates/TypingAnimation.jsx`.

## CSS (required behavior)

Template: ALGR `scraps/typing-animation/templates/typing-animation.css`.

Must preserve:

1. Three circular dots in a rounded chat bubble (asymmetric corner OK).
2. Staggered bounce (~1.35s, delays ~0.18s / ~0.36s on 2nd / 3rd dots).
3. `@media (prefers-reduced-motion: reduce)` — animation off; dots remain visible at steady opacity.
4. Product may remint `--typing-animation-dot` / `--typing-animation-bubble` (or equivalent) to match brand; structure and timing stay.

## Class names

| Role | Canon class |
| --- | --- |
| Root | `typing-animation` |
| Bubble | `typing-animation-bubble` |
| Dot | `typing-animation-dot` |
| Keyframes | `typing-animation-bounce` |

**Legacy:** Teaching Split View shipped as `split-typing-indicator` / `split-typing-bubble` / `split-typing-dot` / `split-typing-bounce`. Treat that as the same feature. New work (especially APPtivity chat) uses the canon `typing-animation*` names. Migrating Teaching to canon names is optional cleanup.

## Accessibility copy

Always pair with a short polite status string (visually hidden or visible, product choice), e.g.:

- Chat: “Someone is typing”
- Assistant: “Assistant is composing a reply”
- Split reveal: “More content is waiting — tap or press Next to reveal”

## Reference implementation

Teaching Present Split View title-only cue:

- Markup: `teaching/src/Card.jsx` (`hideSplitBody` + typing indicator)
- Styles: `teaching/src/index.css` (`.split-typing-*` block)

## Checklist before shipping

- [ ] Canon class names (or documented legacy alias)
- [ ] `role="status"` + `aria-live="polite"` + hidden status text
- [ ] Bubble `aria-hidden="true"`
- [ ] Reduced-motion fallback
- [ ] Colors from product theme, not Teaching greens hard-coded into another app
