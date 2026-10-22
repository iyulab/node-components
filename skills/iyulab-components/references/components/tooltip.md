# u-tooltip

```ts
import '@iyulab/components/dist/components/tooltip/UTooltip.js';
```

**Tag:** `u-tooltip`

Hover/focus tooltip anchored to a `for` target. Opens and closes automatically; Escape closes an open tooltip without moving the pointer or focus (WCAG 1.4.13) — inside a dialog, the first Escape closes the tooltip and the next one the dialog.

Assistive technology: the host gets `role="tooltip"` and an `id`, and each `for` target gets that `id` appended to its `aria-describedby` (an existing value is kept; an author's own `id`/`role` is never overwritten). A screen reader therefore reads the tooltip text as the target's description. An `interactive` tooltip (one that holds links or controls) is not an APG tooltip — it gets the description link but no `role="tooltip"`; for content a user must operate, prefer a non-modal dialog or a toggletip.

```html
<u-button id="save-btn">Save</u-button>
<u-tooltip for="#save-btn" placement="top">
  Save your changes (Ctrl+S)
</u-tooltip>

<!-- Interactive tooltip (stays open when hovered) -->
<u-tooltip for="#info" interactive placement="bottom" offset="8">
  <a href="/docs">Learn more</a>
</u-tooltip>

<!-- Tracking cursor position -->
<u-tooltip for="#chart" tracking>
  Data point detail
</u-tooltip>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Tooltip content |

## Properties

Inherits all `UFloatingElement` properties (see [floating.md](../extensions/floating.md)), plus:

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `for` | `string` | — | ✓ | CSS selector of the target element |
| `open` | `boolean` | `false` | ✓ | Visibility state |
| `placement` | `Placement` | — | — | Preferred placement |
| `offset` | `OffsetOptions` | `0` | — | Gap from target |
| `shift` | `boolean` | `false` | — | Correct the cross-axis position *within* the placed side (see note below) |
| `arrow` | `boolean` | `false` | — | Show pointing arrow |
| `showDelay` | `number` | `0` | — | Open delay in ms |
| `hideDelay` | `number` | `0` | — | Close delay in ms |
| `interactive` | `boolean` | `false` | ✓ | Keep open when mouse is over tooltip |
| `tracking` | `boolean` | `false` | ✓ | Follow mouse cursor position |

> **Placement fallback**: whenever `placement` is set, floating-ui's `flip` middleware is
> always applied — if the placed side has no room, the element switches to another side.
> The opposite side on the same axis is tried first; only when that is also out of room does
> it move to the perpendicular axis, so `right-end` falls back through `left-end` to
> `top-end`/`bottom-end`. That last step is what a full-width trigger needs — with room on
> neither the left nor the right, staying on the horizontal axis means going off-screen.
> `shift` is a separate, narrower correction: it nudges the element along the cross axis
> *within* whichever side ended up being used. Neither can be turned off independently.


## CSS Parts

| Part | Description |
|------|-------------|
| `base` | Outer tooltip box |

## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `show` | ✓ | Before tooltip opens |
| `hide` | ✓ | Before tooltip closes |
