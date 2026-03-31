# u-drawer

```ts
import '@iyulab/components/dist/components/drawer/UDrawer.js';
```

**Tag:** `u-drawer`

Side panel that slides in from any screen edge. Extends `UOverlayElement` (focus-trap, scroll-lock, close policy).

```html
<u-drawer id="drawer" placement="right" closable>
  <span slot="header">Settings</span>
  <p>Drawer content here.</p>
  <u-button slot="footer" @click=${() => drawer.hide()}>Close</u-button>
</u-drawer>

<u-button @click=${() => drawer.show()}>Open Drawer</u-button>
```

---

## Slots

| Name | Description |
|------|-------------|
| `header` | Drawer header |
| *(default)* | Drawer body content |
| `footer` | Drawer footer |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `open` | `boolean` | `false` | ✓ | Show/hide state |
| `closable` | `boolean` | `false` | ✓ | Show close button |
| `placement` | `'left'\|'right'\|'top'\|'bottom'` | `'left'` | ✓ | Slide-in direction |
| `mode` | `'modal'\|'non-modal'` | `'modal'` | ✓ | Focus-trap mode |
| `contained` | `boolean` | `false` | ✓ | Contained to parent element |
| `closeOn` | `string[]` | `['escape','backdrop','button']` | ✓ | Close triggers |

## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `show` | ✓ | Before drawer opens |
| `hide` | ✓ | Before drawer closes |

## Methods

| Method | Description |
|--------|-------------|
| `show()` | Open the drawer |
| `hide()` | Close the drawer |

## CSS Parts

| Part | Description |
|------|-------------|
| `panel` | Drawer panel |
| `header` | Header area |
| `body` | Body area |
| `close-btn` | Close button |
