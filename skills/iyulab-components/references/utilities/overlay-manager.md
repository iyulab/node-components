# OverlayManager

```ts
import { OverlayManager } from '@iyulab/components';
```

Internal static manager for the overlay stack. Used by `UOverlayElement` (`u-dialog`, `u-drawer`) to track open overlays, assign z-index, and manage body scroll locking.

> **Note:** You generally do not need to use `OverlayManager` directly. It is called automatically by overlay components. Only use it if you are building a custom overlay component that extends `UOverlayElement`.

## API

| Member | Type / Returns | Description |
|--------|----------------|-------------|
| `OverlayManager.add(overlay, lockBody?)` | `void` | Register an overlay; increments z-index; optionally locks body scroll |
| `OverlayManager.remove(overlay, lockBody?)` | `void` | Unregister an overlay; releases scroll lock if no overlays remain |
| `OverlayManager.isTopmost(overlay)` | `boolean` | Returns `true` if the overlay is the topmost in the stack (used for ESC key handling) |
| `OverlayManager.size` | `number` | Number of currently open overlays |
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
