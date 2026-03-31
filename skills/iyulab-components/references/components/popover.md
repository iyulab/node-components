# u-popover

```ts
import '@iyulab/components/dist/components/popover/UPopover.js';
```

**Tag:** `u-popover`

Anchored floating panel attached to a `for` target element. Trigger and dismiss behavior are fully configurable.

```html
<u-button id="btn">Open Popover</u-button>

<u-popover for="#btn" placement="bottom" trigger="click">
  <div style="padding: 1rem;">Popover content</div>
</u-popover>

<!-- Hover tooltip-like -->
<u-popover for="#btn" trigger="hover" placement="top" shift arrow>
  Quick info
</u-popover>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Popover content |

## Properties

Inherits all `UFloatingElement` properties (see [floating.md](../extensions/floating.md)), plus:

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `for` | `string` | — | ✓ | CSS selector of the anchor element |
| `open` | `boolean` | `false` | ✓ | Visibility state |
| `disabled` | `boolean` | `false` | ✓ | Disable opening |
| `placement` | `Placement` | — | — | Preferred placement (`top`, `bottom`, `left`, `right`, `*-start`, `*-end`) |
| `offset` | `OffsetOptions` | `0` | — | Distance from anchor |
| `shift` | `boolean` | `false` | — | Auto-shift to stay in viewport |
| `arrow` | `boolean` | `false` | — | Show arrow pointing to anchor |
| `showDelay` | `number` | `0` | — | Open delay in ms |
| `hideDelay` | `number` | `0` | — | Close delay in ms |
| `trigger` | `'click'\|'contextmenu'\|'hover'\|'focus'\|'manual'` | `'click'` | ✓ | Open trigger |
| `dismiss` | `string[]` | `['click','escape','scroll','resize']` | ✓ | Close triggers |
| `autofocus` | `boolean` | `false` | ✓ | Focus first focusable element on open |

## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `show` | ✓ | Before popover opens |
| `hide` | ✓ | Before popover closes |

## Methods

| Method | Description |
|--------|-------------|
| `focusTo(index)` | Move focus to nth focusable element inside popover |
