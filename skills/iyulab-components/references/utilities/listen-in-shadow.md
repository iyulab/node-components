# listen-in-shadow

```ts
import { delegate, listenInShadow } from '@iyulab/components';
```

Without the barrel's component registrations:

```ts
import { delegate, listenInShadow } from '@iyulab/components/dist/utilities/listenInShadow.js';
```

Event handlers for the parts of a component's shadow tree, heard on the shadow root instead of on the part.

## Why

A `click`, `mousedown` or `mouseup` listener on an element makes the browser expose that element as clickable.
Screen readers announce it: NVDA says «clickable» on the element and when entering it, which covers everything
inside it. Measured with NVDA in browse mode:

| Listener on | Announced |
|---|---|
| an element whose role is button, link, menuitem, tab, option, radio, checkbox or switch | nothing extra |
| any other element (a label, a container, a grid cell, a tree item, a custom element's host) | «clickable» |
| the shadow root | nothing |
| `pointerdown` on any element | nothing |

So a convenience handler (a label that focuses its control, a field container that opens a calendar, a cell that
selects its row) belongs on the shadow root.

## `delegate(type, handler)` — in a Lit template

An element directive used in place of `@click`:

```ts
import { html, LitElement } from 'lit';
import { delegate } from '@iyulab/components';

class MyField extends LitElement {
  render() {
    return html`
      <label class="label" ${delegate('click', this.focusControl)}>Name</label>
      <div class="cell" data-row="3" ${delegate<MouseEvent>('click', (e, cell) => this.select(Number(cell.dataset.row)))}></div>
    `;
  }

  private focusControl = () => { /* … */ };
  private select(row: number) { /* … */ }
}
```

- The handler receives the event and the element it was written on; `this` is the component.
- Handlers on nested elements run innermost first, like element listeners, and `stopPropagation()` in one stops
  the ones further out.
- `event.currentTarget` is the shadow root, not the element — use the second argument.
- A `null` or `undefined` handler listens to nothing: `${delegate('click', sortable ? this.sort : undefined)}`.
- Delegated handlers run when the event reaches the shadow root. An element listener on an ancestor inside the same
  tree (a native `<button>` with `@click`) runs before them, so a delegated handler inside it cannot
  `stopPropagation()` that listener. Keep such an inner handler on its element — the children of a button are
  presentational, so it is not announced.

## `listenInShadow(root, type, selector, handler)` — imperative

```ts
const stop = listenInShadow<MouseEvent>(this.shadowRoot!, 'click', '.label', (e, label) => { /* … */ });
// later
stop();
```

Calls `handler` for the first element of `root` on the event's path that matches `selector`. Returns a function
that removes the listener.

## Hosts

A listener on a host makes the host and its whole shadow tree «clickable» — including the button inside a
button component. `u-button` therefore sets `role="none"` on its host (unless you give it a role), so your
`addEventListener('click', …)` on a `u-button` is not announced. A host that carries `aria-label` (or another
global ARIA attribute) cannot be presentational — browsers ignore `role="none"` then — so a listener on such a
host is still announced.
