# u-option

```ts
import '@iyulab/components/dist/components/option/UOption.js';
```

**Tag:** `u-option`

Selectable option item. Used inside `u-select`, `u-radio`, and `u-input` (combobox mode).

```html
<!-- Inside u-select -->
<u-select name="color">
  <u-option value="red">Red</u-option>
  <u-option value="blue" selected>Blue</u-option>
  <u-option value="green" disabled>Green</u-option>
</u-select>

<!-- With prefix icon -->
<u-option value="admin">
  <u-icon slot="prefix" lib="tabler" name="shield"></u-icon>
  Admin
</u-option>

<!-- With marker -->
<u-option value="check" marker="check">With checkmark</u-option>
<u-option value="radio" marker="radio">Radio style</u-option>
```

---

## Slots

| Name | Description |
|------|-------------|
| `prefix` | Leading content |
| *(default)* | Option label |
| `suffix` | Trailing content |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | — | Submitted value |
| `disabled` | `boolean` | `false` | ✓ | Disable the option |
| `selected` | `boolean` | `false` | ✓ | Selected state |
| `marker` | `'radio'\|'check'` | — | ✓ | Show leading marker icon |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getText()` | `string` | Returns the visible text content of the option |

## CSS Parts

| Part | Description |
|------|-------------|
| `content` | Main content wrapper |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--option-color-interactive` | Text color on hover |
| `--option-background-color-interactive` | Background on hover |
| `--option-color-active` | Text color when selected |
| `--option-background-color-active` | Background when selected |
| `--option-color-active-interactive` | Text color when selected + hovered |
| `--option-background-color-active-interactive` | Background when selected + hovered |
