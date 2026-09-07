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
