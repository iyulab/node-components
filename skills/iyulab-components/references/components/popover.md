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
| `dismiss` | `string[]` | `['click','escape','scroll','resize']` | ✓ | Close triggers — see note below |
| `autofocus` | `boolean` | `false` | ✓ | Focus first focusable element on open |

### `dismiss` semantics

`click` and `escape` express user intent and always close the popover.

`scroll` and `resize` are viewport-geometry changes and **only close the popover when it is
anchored to a coordinate** — i.e. the virtual anchor created by `trigger="contextmenu"`, whose
`clientX`/`clientY` stop matching whatever they pointed at once the page reflows.

A popover anchored to a **real element** is not closed by scrolling or resizing: `autoUpdate`
keeps it pinned to its anchor. If the anchor scrolls out of its clipping area entirely, the
popover is *hidden* rather than closed (see `anchor-hidden` in
[extensions/floating.md](../extensions/floating.md)) and returns when the anchor comes back.

> Before 1.8.2 `scroll`/`resize` closed unconditionally, which contradicted `autoUpdate` and
> collapsed open `u-select`/`u-input` listboxes on any page scroll.

## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `show` | ✓ | Before popover opens |
| `hide` | ✓ | Before popover closes |

## Methods

| Method | Description |
|--------|-------------|
| `focusTo(index)` | Move focus to nth focusable element inside popover |
