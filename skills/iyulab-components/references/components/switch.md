# u-switch

```ts
import '@iyulab/components/dist/components/switch/USwitch.js';
```

**Tag:** `u-switch`

Toggle switch (on/off). Supports custom track and thumb content via slots. Form-associated.

```html
<u-switch name="notifications" checked>Enable notifications</u-switch>

<!-- Custom track labels -->
<u-switch name="mode">
  <span slot="track-checked">ON</span>
  <span slot="track-unchecked">OFF</span>
  Dark mode
</u-switch>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Label text |
| `track-checked` | Content inside the track when checked |
| `track-unchecked` | Content inside the track when unchecked |
| `thumb-checked` | Thumb content when checked |
| `thumb-unchecked` | Thumb content when unchecked |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `checked` | `boolean` | `false` | ✓ | On/off state |
| `disabled` | `boolean` | `false` | ✓ | Disable |
| `readonly` | `boolean` | `false` | ✓ | Read-only |
| `required` | `boolean` | `false` | ✓ | Required |
| `invalid` | `boolean` | `false` | ✓ | Validation failed |
| `name` | `string` | — | — | Form field name |
| `value` | `string` | — | — | Submitted value |

## Events

| Event | Description |
|-------|-------------|
| `change` | Fires when checked state changes |

## Methods

| Method | Description |
|--------|-------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Reset state |

## CSS Parts

| Part | Description |
|------|-------------|
| `wrapper` | Outer layout wrapper |
| `track` | Track element |
| `thumb` | Thumb element |
| `label` | Label text wrapper |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--switch-track-width` | Track width |
| `--switch-track-height` | Track height |
| `--switch-track-color` | Track color (unchecked) |
| `--switch-track-color-checked` | Track color (checked) |
| `--switch-thumb-size` | Thumb diameter |
| `--switch-thumb-offset` | Thumb padding from track edge |
| `--switch-thumb-color` | Thumb color (unchecked) |
| `--switch-thumb-color-checked` | Thumb color (checked) |
| `--switch-radius` | Track border radius |
| `--switch-duration` | Transition animation duration |
