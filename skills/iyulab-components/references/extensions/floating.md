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
