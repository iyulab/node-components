# u-file-input

```ts
import '@iyulab/components/dist/components/file-input/UFileInput.js';
```

**Tag:** `u-file-input`

File picker with a design-system-styled trigger button and a selected-file(s) status display,
wrapping a hidden native `<input type="file">`. Form-associated (`formAssociated = true`).

`value` is always `File[] | null` — even with `multiple` off, a selected file is held as a
one-element array. On form submission: 0 files → nothing is sent for `name`; 1 file → the `File`
itself; more than 1 file → a `FormData` with the same `File` repeatedly appended under `name`,
matching what a native `<input type="file" multiple>` submits.

```html
<u-file-input name="attachment" required accept="image/*"></u-file-input>

<u-file-input name="attachments" multiple accept=".csv,.xlsx"></u-file-input>
```

```ts
const picker = document.querySelector('u-file-input');
picker.addEventListener('change', () => {
  console.log(picker.value); // File[] | null
});
```

No drag-and-drop in this version — it is a minimal wrapper (trigger + status + clear), by design.

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `File[] \| null` | `null` | — | Selected files (always an array, even for single-file selection) |
| `accept` | `string` | — | — | Passed through to the native `accept` attribute |
| `multiple` | `boolean` | `false` | ✓ | Allow selecting more than one file |
| `disabled` | `boolean` | `false` | ✓ | Disable the control |
| `readonly` | `boolean` | `false` | ✓ | Read-only (trigger and clear button inert) |
| `required` | `boolean` | `false` | ✓ | Required field |
| `invalid` | `boolean` | `false` | ✓ | Validation failed state |
| `name` | `string` | — | — | Form field name |
| `label` | `string` | — | — | Label text |
| `description` | `string` | — | — | Helper text below the control |
| `validationMessage` | `string` | — | — | Custom validation message |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `validate()` | `boolean` | Run validation; sets `invalid` |
| `reset()` | `void` | Clear the selection and validation state |
| `focus(options?)` | `void` | Focus the trigger button |
| `blur()` | `void` | Blur the trigger button |

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | Inner `u-field` element (label/description/validation layout) |
| `container` | Wrapper around the trigger, status text, and clear button |
| `trigger` | The file-picker trigger button |
| `status` | Status text — "No file chosen", the filename, or "N files selected" |
| `clear-button` | Clear-selection button (a `u-icon`) |
| `input` | The hidden native `<input type="file">` |

## CSS Custom Properties

| Property | Description |
|----------|--------------|
| `--u-file-input-display` | Host `display` (default: `inline-block`) |
| `--u-file-input-width` | Host `width` (default: `auto`) |

## Events

| Event | Description |
|-------|-------------|
| `change` | Fires when the selection changes (picking files or clearing) |
