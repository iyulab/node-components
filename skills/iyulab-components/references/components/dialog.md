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

## Sizing

The panel is **content-sized, capped at 90%** of the dialog's own box — 90% of the height and of
the width. Measured in an 896px-tall viewport: a short dialog renders a 235px panel, and the same
dialog carrying 3,000px of body content stops at 806px.

Past that cap the **body is the only scroll region**. The `header` and `footer` slots are
`flex-shrink: 0`, so the title and the actions stay visible however long the content grows.

There is no size property. To make the dialog smaller than 90% of the viewport, give the **host** a
height — that is what the 90% is measured against:

```css
u-dialog { height: 400px; }   /* the panel then caps at 360px */
```

⚠ That lever only shrinks: a height on the host lowers the panel's maximum, it does not reserve a
panel of that size. A short dialog stays short.

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
