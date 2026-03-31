# u-chip

```ts
import '@iyulab/components/dist/components/chip/UChip.js';
```

**Tag:** `u-chip`

Interactive chip tag. Supports selectable toggle, removable button, and tooltip.

```html
<u-chip>React</u-chip>

<u-chip selectable color="blue">TypeScript</u-chip>

<u-chip removable @remove=${() => console.log('removed')}>
  Delete me
</u-chip>

<!-- Tooltip on hover -->
<u-chip>
  Tag
  <span slot="tooltip">More details here</span>
</u-chip>
```

---

## Slots

| Name | Description |
|------|-------------|
| `prefix` | Content before the label |
| *(default)* | Chip label |
| `suffix` | Content after the label |
| `tooltip` | Tooltip content shown on hover |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'filled'\|'solid'\|'surface'\|'outlined'` | `'filled'` | ✓ | Visual style |
| `color` | `'neutral'\|'blue'\|'green'\|'yellow'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'` | `'neutral'` | ✓ | Color |
| `rounded` | `boolean` | `false` | ✓ | Pill-shaped |
| `removable` | `boolean` | `false` | ✓ | Show remove button |
| `selectable` | `boolean` | `false` | ✓ | Can be toggled selected |
| `selected` | `boolean` | `false` | ✓ | Selected state |
| `value` | `string` | `''` | — | Unique identifier value |

## Events

| Event | Description |
|-------|-------------|
| `pick` | Fires when the chip is selected/deselected |
| `remove` | Fires when the remove button is clicked |

## CSS Parts

| Part | Description |
|------|-------------|
| `tag` | Main chip wrapper |
| `check` | Check icon shown when selected |
| `remove` | Remove button |
| `tooltip` | Tooltip element |
