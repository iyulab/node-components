# u-alert

```ts
import '@iyulab/components/dist/components/alert/UAlert.js';
```

**Tag:** `u-alert`

Closable message banner with status icons, auto-dismiss timer, and open/hide transition.

```html
<u-alert status="success" closable open>
  Your changes have been saved.
</u-alert>

<u-alert status="error" variant="outlined" open>
  Failed to load data.
  <u-button slot="footer" variant="solid">Retry</u-button>
</u-alert>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Alert body content |
| `footer` | Bottom area (e.g. action buttons) |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `open` | `boolean` | `false` | ✓ | Show/hide the alert |
| `closable` | `boolean` | `false` | ✓ | Show close button |
| `variant` | `'solid'\|'filled'\|'outlined'\|'glass'` | `'solid'` | ✓ | Visual style |
| `status` | `'error'\|'warning'\|'success'\|'info'\|'notice'` | — | ✓ | Status type; controls icon and color |
| `title` | `string` | `''` | — | Title label (falls back to status name) |
| `duration` | `number` | `0` | — | Auto-dismiss delay in ms; `0` disables |

## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `show` | ✓ | Fires before the alert becomes visible |
| `hide` | ✓ | Fires before the alert is hidden |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `show()` | `boolean` | Opens the alert; returns `false` if cancelled |
| `hide()` | `boolean` | Closes the alert; returns `false` if cancelled |

## CSS Parts

| Part | Description |
|------|-------------|
| `container` | Outer flex column wrapper |
| `header` | Row containing icon, title, and close button |
| `icon` | Status icon (hidden when `status` is unset) |
| `title` | Title text |
| `close-btn` | Close button (visible when `closable`) |
| `content` | Scrollable body area |
| `footer` | Footer slot wrapper |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--alert-background-color` | Background color (auto-set by status) |
| `--alert-border-color` | Border color (auto-set by status) |
| `--alert-icon-color` | Icon color (auto-set by status) |
