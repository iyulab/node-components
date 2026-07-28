# UFloatingElement

```ts
import { UFloatingElement } from '@iyulab/components';
```

Abstract base class for anchored floating elements (tooltips, popovers, dropdowns). Wraps [`@floating-ui/dom`](https://floating-ui.com/) for automatic positioning.

## When to extend

Use when building a component that floats relative to a `for` target element with auto-placement, shift, and arrow support.

```ts
import { UFloatingElement } from '@iyulab/components';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('my-dropdown')
export class MyDropdown extends UFloatingElement {
  render() {
    return html`<slot></slot>`;
  }
}
```

```html
<button id="btn">Open</button>
<my-dropdown for="#btn" placement="bottom" trigger="click" shift>
  Dropdown content
</my-dropdown>
```

## Inherited Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `open` | `boolean` | `false` | ✓ | Visibility state |
| `disabled` | `boolean` | `false` | ✓ | Prevent opening |
| `for` | `string` | — | ✓ | CSS selector for the anchor element |
| `strategy` | `'absolute'\|'fixed'` | `'absolute'` | — | CSS positioning strategy |
| `placement` | `Placement` | — | — | Preferred placement from `@floating-ui/dom` |
| `offset` | `OffsetOptions` | `0` | — | Distance from anchor |
| `shift` | `boolean` | `false` | — | Shift to stay within viewport |
| `arrow` | `boolean` | `false` | — | Show pointing arrow |
| `showDelay` | `number` | `0` | — | Open delay (ms) |
| `hideDelay` | `number` | `0` | — | Close delay (ms) |

## Derived state

| Attribute | Description |
|-----------|-------------|
| `anchor-hidden` | **Read-only — do not set.** Applied automatically while the anchor is fully outside its clipping area (scroll container or viewport). The element is hidden but **not closed** (`open` stays `true`) and returns as soon as the anchor is visible again. Available as a style hook: `my-dropdown[anchor-hidden] { … }` |

This matters most with `strategy="fixed"`, which is used precisely so the floating element
escapes `overflow` ancestor clipping — without `anchor-hidden` the panel would keep covering
unrelated content after its anchor scrolled out of the panel. Backed by the `hide` middleware
of `@floating-ui/dom`. Added in 1.8.2.

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `show(target?)` | `Promise<boolean>` | Open and position the floating element; returns `false` if cancelled |
| `hide()` | `void` | Close the floating element |

## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `show` | ✓ | Before opening |
| `hide` | ✓ | Before closing |
