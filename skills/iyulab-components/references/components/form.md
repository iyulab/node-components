# u-form

```ts
import '@iyulab/components/dist/components/form/UForm.js';
```

**Tag:** `u-form`

Form group with two-way model binding. Wraps `UFormControlElement`-based controls and observes value changes.

```html
<u-form id="form">
  <u-input name="email" type="email" required></u-input>
  <u-select name="role">
    <u-option value="admin">Admin</u-option>
    <u-option value="viewer">Viewer</u-option>
  </u-select>
</u-form>
```

```ts
const form = document.querySelector('#form') as UForm;

// Set initial model values
form.model = { email: 'user@example.com', role: 'viewer' };

// Listen for changes
form.addEventListener('change', () => {
  console.log(form.model); // { email: '...', role: '...' }
});

// Validate all controls
if (form.validate()) {
  submitData(form.model);
}

// Reset all controls
form.reset();
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Form control elements |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `model` | `Record<string, unknown>` | — | Two-way bound data model |
| `includes` | `string[]` | `[]` | Only include these field names (empty = all) |
| `excludes` | `string[]` | `[]` | Exclude these field names |

## Events

| Event | Description |
|-------|-------------|
| `change` | Fires when any control value changes |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `validate()` | `boolean` | Validate all child controls |
| `reset()` | `void` | Reset all child controls |
