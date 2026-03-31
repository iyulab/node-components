# u-dialog

```ts
import '@iyulab/components/dist/components/dialog/UDialog.js';
```

**Tag:** `u-dialog`

Modal or non-modal dialog window. Supports focus-trap, scroll-lock, ESC/backdrop close, and configurable placement.

For programmatic usage (`Dialog.alert`, `Dialog.confirm`, `Dialog.prompt`), see [dialog.md](../utilities/dialog.md).

```html
<u-dialog id="dlg" closable placement="center">
  <span slot="header">Confirm Action</span>
  <p>Are you sure you want to delete this item?</p>
  <div slot="footer">
    <u-button variant="ghost" @click=${() => dlg.hide()}>Cancel</u-button>
    <u-button variant="solid" @click=${handleConfirm}>Delete</u-button>
  </div>
</u-dialog>

<u-button @click=${() => dlg.show()}>Open</u-button>
```

---

## Slots

| Name | Description |
|------|-------------|
| `header` | Dialog header area |
| *(default)* | Dialog body content |
| `footer` | Dialog footer area |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `open` | `boolean` | `false` | ✓ | Show/hide state |
| `closable` | `boolean` | `false` | ✓ | Show close button |
| `placement` | `'top-start'\|'top'\|'top-end'\|'start'\|'center'\|'end'\|'bottom-start'\|'bottom'\|'bottom-end'` | `'center'` | ✓ | Position on screen |
| `offset` | `number` | `0` | ✓ | Distance from screen edge in px |
| `mode` | `'modal'\|'non-modal'` | `'modal'` | ✓ | `modal` enables focus-trap |
| `contained` | `boolean` | `false` | ✓ | Position relative to parent element |
| `closeOn` | `string[]` | `['escape','backdrop','button']` | ✓ | Close triggers |

## Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `show` | ✓ | Before the dialog opens |
| `hide` | ✓ | Before the dialog closes |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `show()` | `boolean` | Open the dialog |
| `hide()` | `boolean` | Close the dialog |
| `requestClose(source)` | `void` | Request close from a given source (checks `closeOn` policy) |

## CSS Parts

| Part | Description |
|------|-------------|
| `container` | Backdrop/positioning wrapper |
| `panel` | The dialog panel |
| `header` | Header area |
| `body` | Body area |
| `close-btn` | Close button |
