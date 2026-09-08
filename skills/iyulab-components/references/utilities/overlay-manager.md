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

> **Note:** You generally do not need to use `OverlayManager` directly. It is called automatically by overlay components. Only use it if you are building a custom overlay component that extends `UOverlayElement`.

## API

| Member | Type / Returns | Description |
|--------|----------------|-------------|
| `OverlayManager.add(overlay, lockBody?)` | `void` | Register an overlay; assigns a z-index from the overlay band by stack depth; optionally locks body scroll |
| `OverlayManager.remove(overlay, lockBody?)` | `void` | Unregister an overlay; releases scroll lock if no overlays remain |
| `OverlayManager.isTopmost(overlay)` | `boolean` | Returns `true` if the overlay is the topmost in the stack (used for ESC key handling) |
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
