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

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--drawer-size` | Panel size along the slide axis — width for `placement="left"`/`"right"` (default `28rem`), height for `"top"`/`"bottom"` (default `16rem`). Auto-shrinks to `max-width`/`max-height: 100%` on narrow viewports |

---

## Edit-panel pattern

A side panel for editing a record needs no extra component — `u-drawer` already provides the
whole contract. Measured in a real browser
(`tests/browser/drawer-edit-panel-pattern.browser.test.ts`):

```html
<u-drawer id="edit" placement="right" closable>
  <span slot="header">Edit order</span>

  <u-input label="Quantity" autofocus></u-input>
  <u-textarea label="Note"></u-textarea>

  <div slot="footer">
    <u-button variant="ghost" @click=${() => edit.hide()}>Cancel</u-button>
    <u-button color="primary" @click=${save}>Save</u-button>
  </div>
</u-drawer>
```

| Requirement | How it is met |
|---|---|
| Focus the first input on open, restore the trigger on close | `[autofocus]` → first input control → first tabbable; focus is returned by the trap |
| Body scrolls, footer stays visible | `part="body"` is `flex: 1; overflow: auto`; the `footer` slot is `flex-shrink: 0` |
| Focus cannot leave the panel | `mode="modal"` (default) activates the focus trap |
| `Esc` closes, background scroll is locked | `closeOn` defaults to `['escape','backdrop','button']` |
| Nothing pops open by itself | Selects/comboboxes open only on user interaction |
