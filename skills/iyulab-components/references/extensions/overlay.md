# UOverlayElement

```ts
import { UOverlayElement } from '@iyulab/components';
```

Abstract base class for full-screen or contained overlays (dialogs, drawers, side sheets). Manages:

- **Focus-trap** via `focus-trap` library
- **Body scroll lock** while open
- **ESC key** and **backdrop click** close
- **OverlayManager** z-index stacking

## When to extend

Use when building a modal-style component that should block interaction with the rest of the page.

```ts
import { UOverlayElement } from '@iyulab/components';
import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('my-modal')
export class MyModal extends UOverlayElement {
  @property() title = '';

  render() {
    return html`
      <div class="backdrop" part="backdrop"></div>
      <div class="panel" part="panel">
        <h2>${this.title}</h2>
        <slot></slot>
        <button @click=${() => this.requestClose('button')}>Close</button>
      </div>
    `;
  }
}
```

## Inherited Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `open` | `boolean` | `false` | ✓ | Open/closed state |
| `mode` | `'modal'\|'non-modal'` | `'modal'` | ✓ | `modal` enables focus-trap |
| `contained` | `boolean` | `false` | ✓ | Use `position: absolute` relative to parent |
| `closeOn` | `string[]` | `['escape','backdrop','button']` | ✓ | Allowed close trigger sources |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `show()` | `boolean` | Open overlay; returns `false` if cancelled |
| `hide()` | `boolean` | Close overlay; returns `false` if cancelled |
| `requestClose(source)` | `void` | Request close from a source string; respects `closeOn` policy |

## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `show` | ✓ | Before overlay opens |
| `hide` | ✓ | Before overlay closes |

## Custom close policy

Override `requestClose` to add custom logic before closing:

```ts
override requestClose(source: string) {
  if (source === 'backdrop' && this.hasUnsavedChanges) {
    // show a confirmation prompt instead
    return;
  }
  super.requestClose(source);
}
```
