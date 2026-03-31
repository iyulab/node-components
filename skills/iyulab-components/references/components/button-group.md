# u-button-group

```ts
import '@iyulab/components/dist/components/button-group/UButtonGroup.js';
```

**Tag:** `u-button-group`

Groups `u-button` or `u-icon-button` elements. Propagates `variant` and `disabled` to all child buttons automatically.

```html
<u-button-group variant="outlined">
  <u-button>Left</u-button>
  <u-button>Center</u-button>
  <u-button>Right</u-button>
</u-button-group>

<u-button-group vertical disabled>
  <u-button>Top</u-button>
  <u-button>Bottom</u-button>
</u-button-group>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-button` or `u-icon-button` elements |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'solid'\|'surface'\|'filled'\|'outlined'\|'ghost'\|'link'` | `'solid'` | ✓ | Variant propagated to all child buttons |
| `vertical` | `boolean` | `false` | ✓ | Stack buttons vertically |
| `disabled` | `boolean` | `false` | ✓ | Disable all child buttons |
