# u-divider

```ts
import '@iyulab/components/dist/components/divider/UDivider.js';
```

**Tag:** `u-divider`

Horizontal or vertical separator line. Slot content is overlaid as an inline label.

```html
<u-divider></u-divider>

<u-divider>OR</u-divider>

<u-divider variant="dashed" align="start">Section</u-divider>

<!-- Vertical -->
<div style="display:flex; height:40px;">
  <span>Left</span>
  <u-divider vertical></u-divider>
  <span>Right</span>
</div>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Optional label overlaid on the divider line |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `vertical` | `boolean` | `false` | ✓ | Vertical orientation |
| `variant` | `'solid'\|'dashed'\|'dotted'` | `'solid'` | ✓ | Line style |
| `align` | `'start'\|'center'\|'end'` | `'center'` | ✓ | Label alignment |

## CSS Parts

| Part | Description |
|------|-------------|
| `line-start` | Line segment before the label |
| `label` | Label wrapper |
| `line-end` | Line segment after the label |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--divider-size` | Line thickness |
| `--divider-color` | Line color |
| `--divider-spacing` | Spacing around the label |
