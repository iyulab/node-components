# u-expander

```ts
import '@iyulab/components/dist/components/expander/UExpander.js';
```

**Tag:** `u-expander`

Disclosure section — the header toggles the body open and closed. The header is a native
`<button>`, so keyboard operation (Enter / Space) and focus order come for free, and the
collapsed body is removed from both the accessibility tree and the tab order.

```html
<u-expander label="Shipping details" open>
  <p>Body content.</p>
</u-expander>

<!-- Custom header + trailing slot -->
<u-expander>
  <span slot="header">Order 1042</span>
  <u-tag slot="suffix" color="success">Paid</u-tag>
  <p>Body content.</p>
</u-expander>
```

The open/close transition runs on the motion tokens (`--u-duration-normal` /
`--u-ease-standard`) and is suppressed under `prefers-reduced-motion: reduce` — the
transition is decoration here, since the collapsed/expanded result reads the same when static.

---

## Slots

| Name | Description |
|------|-------------|
| `header` | Replaces the header text (wins over `label`) |
| *(default)* | Body content, shown while open |
| `suffix` | Content placed at the end of the header row |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `open` | `boolean` | `false` | ✓ | Expanded state |
| `disabled` | `boolean` | `false` | ✓ | Disable the header button |
| `label` | `string` | `''` | | Header text |

## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `expand` | ✓ | Before the body expands |
| `collapse` | ✓ | Before the body collapses |

## Methods

| Method | Description |
|--------|-------------|
| `expand()` | Expand; returns `false` if cancelled or already open |
| `collapse()` | Collapse; returns `false` if cancelled or already closed |
| `toggle()` | Switch to the opposite state |

## CSS Parts

| Part | Description |
|------|-------------|
| `header` | Header button |
| `icon` | Disclosure chevron |
| `label` | Header text area |
| `content` | Body wrapper |
