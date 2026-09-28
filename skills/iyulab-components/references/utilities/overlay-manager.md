# OverlayManager

```ts
import { OverlayManager } from '@iyulab/components';
```

Internal static manager that **owns the layer scale for every stacking surface**. Used by `UOverlayElement` (`u-dialog`, `u-drawer`) to track open overlays, assign z-index, and manage body scroll locking — and read by `Toast` for the notification layer.

## Layer scale

Stacking is a contract, not a negotiation between components. Two bands exist, and the notification band is **always above** the overlay band:

| Band | Value | Owned by |
|------|-------|----------|
| Overlay | `9999 + depth`, capped at `9999 + 1000` | `UOverlayElement` subclasses (`u-dialog`, `u-drawer`, custom overlays) |
| **Notification** | `OverlayManager.notificationZIndex` | `Toast` |

Overlay z-index comes from **how many overlays are open at once** (stack depth), not from how many have ever been opened. That is what bounds the band — and a bounded band is what lets the notification layer sit above it by construction. More than 1000 simultaneous overlays share the top value: they stop stacking relative to each other, but notifications stay above them.

> **Do not hardcode a z-index for a surface that must appear above overlays.** Read `OverlayManager.notificationZIndex` so the value follows the scale.

## Layer stack — one Escape closes the topmost layer

Every surface that closes on Escape is a **layer**, and layers stack in **the order they opened**: `u-dialog` and `u-drawer`, an open `u-popover` (unless its `dismiss` leaves out `escape`), and any app surface that registers itself. One Escape closes the topmost layer only — a popover opened inside a popover closes alone, a drawer opened inside an app panel closes before the panel.

The manager listens once, on `document` in the bubble phase:

- an Escape a control already handled (`defaultPrevented` — a list closing, an input clearing) closes no layer;
- the Escape that closes a layer is marked consumed (`preventDefault`), so a listener an app put on `window` sees `defaultPrevented === true`;
- an Escape during IME composition is left alone.

An app surface that is not a `UOverlayElement` (a shell panel, a custom sheet) joins the same order:

```ts
OverlayManager.openLayer(panel, () => closePanel());   // when it opens
OverlayManager.closeLayer(panel);                      // when it closes, by any path
```

> **Note:** You generally do not need to use `OverlayManager` directly. It is called automatically by overlay components. Only use it if you are building a custom overlay component that extends `UOverlayElement`.

## API

| Member | Type / Returns | Description |
|--------|----------------|-------------|
| `OverlayManager.add(overlay, lockBody?)` | `void` | Register an overlay; assigns a z-index from the overlay band by stack depth; optionally locks body scroll |
| `OverlayManager.remove(overlay, lockBody?)` | `void` | Unregister an overlay; releases scroll lock if no overlays remain |
| `OverlayManager.isTopmost(overlay)` | `boolean` | Returns `true` if the overlay is the topmost in the overlay (z-index) stack |
| `OverlayManager.openLayer(el, onEscape)` | `void` | Put `el` on top of the layer stack; `onEscape` runs when it is topmost and an unhandled Escape arrives. Opening an open layer moves it to the top |
| `OverlayManager.closeLayer(el)` | `void` | Take `el` off the layer stack (no-op if it is not on it) |
| `OverlayManager.topLayer` | `HTMLElement \| undefined` | The topmost layer |
| `OverlayManager.size` | `number` | Number of currently open overlays |
| `OverlayManager.notificationZIndex` | `number` | z-index of the notification layer — guaranteed above the whole overlay band. Use this for toasts, snackbars, and anything else that must remain visible over an open modal |
| `OverlayManager.trapStack` | `FocusTrap[]` | Shared focus-trap stack (used internally by focus-trap library) |

## Example (custom overlay)

```ts
import { UOverlayElement } from '@iyulab/components';

class MyOverlay extends UOverlayElement {
  // UOverlayElement already calls OverlayManager.add/remove internally
  // Override requestClose() if you need custom close logic
  override requestClose(source: string) {
    if (source === 'backdrop' && this.hasUnsavedChanges) return;
    super.requestClose(source);
  }
}
```
