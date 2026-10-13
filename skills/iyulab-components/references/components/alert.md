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

<u-alert status="error" appearance="outlined" open>
  Failed to load data.
  <u-button slot="footer" appearance="solid">Retry</u-button>
</u-alert>

<!-- In the page flow (a callout, an error summary): fills its place, no floating shadow -->
<u-alert inline open status="info" title="Totals follow the filters above">
  Clear a filter chip to widen them.
</u-alert>

<!-- A static note is not a live region: set the role, and swap the icon -->
<u-alert inline open status="notice" role="note" title="Note">
  <u-icon slot="icon" lib="bootstrap" name="pencil"></u-icon>
  Customer asked for the same cover as last year.
</u-alert>
```

Without `inline` the alert has the floating look a toast uses (content width, large shadow, scale transition) and
keeps its place while closed. `inline` is for an alert that sits in the page: it fills its container, drops the
shadow and the transition, and takes no space while closed. The role follows `status` (`error`/`warning` →
`alert`, otherwise `status`) unless you set one — a role you set is kept.

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Alert body content |
| `footer` | Bottom area (e.g. action buttons) |
| `icon` | Replaces the status icon (e.g. a pencil on a note); left empty, the status icon shows |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `open` | `boolean` | `false` | ✓ | Show/hide the alert |
| `closable` | `boolean` | `false` | ✓ | Show close button |
| `appearance` | `'soft'\|'outlined'` | `'soft'` | ✓ | `soft` status-colour tint, no outline · `outlined` status-colour border on a transparent face |
| `status` | `'error'\|'warning'\|'success'\|'info'\|'notice'` | — | ✓ | Status type; controls icon, color and role (`error`/`warning` are `role="alert"`). An outcome word, not a palette word — buttons and badges say `color="danger"`, an alert says `status="error"`; an unknown value renders as a neutral notice and warns in development, naming the likely word |
| `title` | `string` | `''` | — | Title label. Left empty, the status name in the current locale is shown (`Locale.set('ko')` → 「오류」), not the raw status value |
| `duration` | `number` | `0` | — | Auto-dismiss delay in ms; `0` disables |
| `inline` | `boolean` | `false` | ✓ | In the page flow: fills its container, no floating shadow or scale transition, no space while closed |

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
| `--alert-background-color` | Background color (auto-set by status; transparent for `appearance="outlined"`) |
| `--alert-border-color` | Border color (auto-set by status; transparent for `appearance="soft"`) |
| `--alert-icon-color` | Icon color (auto-set by status) |
