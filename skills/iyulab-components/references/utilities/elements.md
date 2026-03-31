# elements

```ts
import { getParentElement, querySelectorWithin, querySelectorAllWithin, buildElementHTML } from '@iyulab/components';
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

### `buildElementHTML(tag, attrs, content?)`

Builds an XSS-safe custom element HTML string. All attribute values and content are sanitized.

```ts
const html = buildElementHTML('u-alert', {
  status: 'success',
  open: '',
}, 'File saved.');
// → '<u-alert status="success" open="">File saved.</u-alert>'
```

> Use this when dynamically constructing HTML strings for `innerHTML` or server-side rendering.
