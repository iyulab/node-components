# Events

All custom events are declared in `src/events/` and registered on `GlobalEventHandlersEventMap` for TypeScript autocomplete and type safety.

## How events work

Events are dispatched via `UElement.fire()`:

```ts
// Default: bubbles=true, composed=true, cancelable=true
this.fire('show');

// With detail
this.fire<PickEventDetail>('pick', {
  detail: { value: this.value, selected: true, shiftKey: false, metaKey: false, ctrlKey: false }
});

// Non-cancelable
this.fire('change', { cancelable: false });
```

`fire()` returns `false` if `preventDefault()` was called — use this for cancellable operations:

```ts
if (!this.fire('show')) return; // cancelled by consumer
this.open = true;
```

## Relaying native events

Use `relay()` to surface a shadow DOM native event on the host element:

```ts
// Inside a component
private handleInput(e: Event) {
  this.relay(e); // re-dispatches 'input' from the host element
}
```

---

## Event Catalog

| Event | Detail type | Cancelable | Fired by |
|-------|-------------|------------|---------|
| `show` | `unknown` | ✓ | `u-alert`, `u-dialog`, `u-drawer`, `u-popover`, `u-tooltip` |
| `hide` | `unknown` | ✓ | `u-alert`, `u-dialog`, `u-drawer`, `u-popover`, `u-tooltip` |
| `change` | `unknown` | ✗ | `u-checkbox`, `u-radio`, `u-select`, `u-slider`, `u-switch`, `u-rating`, `u-menu`, `u-tree`, `u-form` |
| `input` | `unknown` | ✗ | `u-input`, `u-textarea` |
| `pick` | `PickEventDetail` | ✗ | `u-chip`, `u-menu-item`, `u-tree-item` |
| `check` | `unknown` | ✗ | `u-tree-item` |
| `remove` | `unknown` | ✓ | `u-chip`, `u-tab` |
| `navigate` | `unknown` | ✓ | `u-breadcrumb-item` |
| `expand` | `unknown` | ✗ | `u-tree-item` |
| `collapse` | `unknown` | ✗ | `u-tree-item` |
| `shift` | `ShiftEventDetail` | ✗ | `u-split-panel` (during drag) |
| `shift-start` | `ShiftEventDetail` | ✗ | `u-split-panel` (drag start) |
| `shift-end` | `ShiftEventDetail` | ✗ | `u-split-panel` (drag end) |

> **`change` semantics** — `change` follows the native form-control convention: it fires only as a result of **user interaction** (option click, keyboard, drag commit, clear). Programmatic `value` assignment and option/slot registration never fire `change`, so controlled wrappers (React state binding etc.) can write values without echo loops or state pollution. `u-slider` fires on drag commit (`pointerup`), not on every move.

---

## Listening to events

```ts
// Typed via GlobalEventHandlersEventMap
document.querySelector('u-chip')?.addEventListener('pick', (e) => {
  const detail = e.detail; // PickEventDetail
  console.log(detail.value, detail.selected);
});

// Cancelling a show event
document.querySelector('u-dialog')?.addEventListener('show', (e) => {
  if (!userIsLoggedIn) {
    e.preventDefault(); // prevents the dialog from opening
  }
});
```

```html
<!-- Lit template -->
<u-select @change=${this.handleChange}></u-select>
```
