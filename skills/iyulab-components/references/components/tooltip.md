# u-tooltip

```ts
import '@iyulab/components/dist/components/tooltip/UTooltip.js';
```

**Tag:** `u-tooltip`

Hover/focus tooltip anchored to a `for` target. Opens and closes automatically.

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
> always applied — if the placed side has no room, the element switches to the opposite side.
> `shift` is a separate, narrower correction: it nudges the element along the cross axis
> *within* whichever side ended up being used. Neither can be turned off independently.


## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `show` | ✓ | Before tooltip opens |
| `hide` | ✓ | Before tooltip closes |
