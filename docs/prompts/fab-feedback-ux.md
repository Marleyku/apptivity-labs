# Prompt: FAB feedback UX (Ctrl+Enter + temporary drag)

Applies to **all** Labs products with an in-app Feedback FAB.

## 1. Ctrl+Enter / ⌘+Enter submits

On the feedback **message** control (`textarea` / product equivalent):

```js
onKeyDown={(e) => {
  if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  if (busy || capturing || (category === 'bug' && !message.trim())) return;
  void submit();
}}
```

Show a short tip under the field: `Tip: Ctrl+Enter or ⌘+Enter to send` (localize when the product uses i18n).

## 2. Temporary FAB drag / reposition

Users can drag the floating Feedback button when it covers other UI.

| Rule | Behavior |
|------|----------|
| Drag | Pointer drag moves the FAB (clamp inside the viewport with a small margin) |
| Click | Short press without meaningful move still opens feedback |
| Persistence | **None** — React state / memory only |
| Reset | Clear offset on **full page load** and on **SPA route change** (`pathname` / `search` / `hash`) |
| Anti-pattern | Saving position in `localStorage` / cookies |

Reference hook: ALGR `scraps/fab-feedback-ux/templates/useTemporaryFabPosition.js` (uses `react-router-dom` `useLocation`).

Products **without** React Router (e.g. Teaching): reset on remount, `popstate`/`hashchange`/href change, and meaningful workspace UI mode signals (Teaching watches `.app` className).

When `pos` is set, override CSS anchors (`right`/`bottom` or `left`/`bottom`) with `style={{ left, top, right: 'auto', bottom: 'auto' }}` while keeping `position: fixed`. Add `touch-action: none` on the FAB so pointer drag works on touch devices.

## Checklist for new FAB sites

1. Wire Ctrl+Enter on the message field + tip copy.
2. Wire temporary drag via the hook (or equivalent).
3. Confirm position resets after navigation and hard reload.
