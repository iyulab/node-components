# elements

```ts
import { getParentElement, querySelectorWithin, querySelectorAllWithin } from '@iyulab/components';
```

Shadow-DOM-aware DOM utility helpers.

## Functions

### `getParentElement(element)`

Traverses up the DOM, crossing shadow root boundaries.  
Returns the host element of a shadow root when the parent is a `ShadowRoot`.

```ts
const parent = getParentElement(myElement);
```

---

### `querySelectorWithin(element, selector)`

Queries within the same root (shadow root or document) as `element`.  
Avoids leaking queries across shadow boundaries.

```ts
const btn = querySelectorWithin(this, '#submit');
```

---

### `querySelectorAllWithin(element, selector)`

Same as `querySelectorWithin` but returns all matches.

```ts
const inputs = querySelectorAllWithin(this, 'u-input');
```

---

### `isCoarsePointer(event)`

Returns `true` for a pointer with no lasting hover state — touch and pen.

Such a pointer fires `pointerleave` immediately after `pointerenter` on a tap, so a
hover-triggered surface that does not check this opens and closes in the same gesture.
Branch on it before treating `pointerenter` as "the user is hovering here".

```ts
private onPointerEnter(e: PointerEvent) {
  if (isCoarsePointer(e)) return;   // let the click/tap handler own this instead
  this.open = true;
}
```

---

### `isFromControl(event, boundary)`

Returns `true` when `event` came from a control inside `boundary` — a link, a button, a form field, or an
element with a control role (`button`, `link`, `checkbox`, `switch`, `radio`, `menuitem`, `option`, `tab`).
Open shadow roots are looked into, so a `u-button` counts. The walk stops at `boundary`.

Use it where a box reads "pressed" for itself — a row or a cell that opens on click — so that pressing a
control the box renders stays that control's act.

```ts
cell.addEventListener('click', (e) => {
  if (isFromControl(e, cell)) return;   // the Delete button in the cell is not "open this row"
  openRow();
});
```
