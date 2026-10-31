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

<u-file-input name="drawings" directory label="Drawing folder"></u-file-input>
```

```ts
const picker = document.querySelector('u-file-input');
picker.addEventListener('change', () => {
  console.log(picker.value); // File[] | null
});
```

`directory` picks a folder instead of files: every file under it lands in `value`, and each `File`'s
`webkitRelativePath` is its path from the picked folder (`plans/sub/b.txt`). The trigger reads "Choose folder"
and the status shows the folder name and file count. A folder implies `multiple`; browsers ignore `accept` in
folder mode, so filter `value` in `change` if you need to.

No drag-and-drop in this version — it is a minimal wrapper (trigger + status + clear), by design.

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `File[] \| null` | `null` | — | Selected files (always an array, even for single-file selection). Setting it to `null` (or `[]`) clears the native input as `reset()` does, so the same file can be picked again |
| `accept` | `string` | — | — | Passed through to the native `accept` attribute |
| `multiple` | `boolean` | `false` | ✓ | Allow selecting more than one file |
| `directory` | `boolean` | `false` | ✓ | Pick a folder — all files under it, each with `webkitRelativePath`; implies `multiple`, `accept` is not applied |
| `disabled` | `boolean` | `false` | ✓ | Disable the control |
| `readonly` | `boolean` | `false` | ✓ | Read-only (trigger and clear button inert) |
| `required` | `boolean` | `false` | ✓ | Required field |
| `invalid` | `boolean` | `false` | ✓ | Validation failed state |
| `name` | `string` | — | — | Form field name |
| `label` | `string` | — | — | Label text |
| `description` | `string` | — | — | Helper text below the control |
| `descriptionDisplay` | `'inline' \| 'hint'` | — | — | Attribute `description-display`. This field only — `hint` puts the description in a tooltip beside the label, `inline` under the control. Empty: the app-wide `UField.descriptionDisplay` |
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
| `status` | Status text — "No file chosen", the filename, "N files selected", or (folder mode) "folder (N files)" |
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
