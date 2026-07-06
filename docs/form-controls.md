# Form Controls

All form-aware components extend `UFormControlElement<T>` which sets `static formAssociated = true`, enabling native `<form>` participation via the [ElementInternals API](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals).

---

## Form-associated components

| Component | Value type |
|-----------|------------|
| `u-input` | `string` |
| `u-textarea` | `string` |
| `u-select` | `string \| string[]` |
| `u-checkbox` | `string` |
| `u-radio` | `string` |
| `u-switch` | `string` |
| `u-slider` | `number \| number[]` |
| `u-rating` | `number` |

---

## Using with native `<form>`

All components participate in standard form submission via `name`/`value`:

```html
<form id="profile-form" @submit=${handleSubmit}>
  <u-input name="username" required minlength="3"></u-input>
  <u-select name="role">
    <u-option value="admin">Admin</u-option>
    <u-option value="viewer">Viewer</u-option>
  </u-select>
  <u-checkbox name="agreed" required>I agree</u-checkbox>
  <u-button type="submit">Save</u-button>
</form>
```

```ts
function handleSubmit(e: SubmitEvent) {
  e.preventDefault();
  const data = new FormData(e.target as HTMLFormElement);
  console.log(Object.fromEntries(data));
}
```

---

## Validation

### Per-component

```ts
const input = document.querySelector('u-input')!;
input.validate(); // runs validation logic, sets input.invalid = true/false
input.reset();    // clears value and validation state
```

### Using `u-form`

`u-form` wraps multiple controls and exposes aggregate validation and two-way model binding:

```html
<u-form id="form">
  <u-input name="email" type="email" required></u-input>
  <u-select name="plan">
    <u-option value="free">Free</u-option>
    <u-option value="pro">Pro</u-option>
  </u-select>
</u-form>
```

```ts
const form = document.querySelector('#form') as UForm;

// Set initial values
form.model = { email: 'user@example.com', plan: 'free' };

// React to changes
form.addEventListener('change', () => {
  console.log(form.model); // current values
});

// Validate all
if (form.validate()) {
  submit(form.model);
}

// Reset all
form.reset();
```

### `novalidate`

Set `novalidate` to skip automatic validation on change:

```html
<u-input name="search" novalidate></u-input>
```

---

## Common Properties (all form controls)

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Form field name for submission |
| `value` | `T` | Current value |
| `disabled` | `boolean` | Disables the control |
| `readonly` | `boolean` | Prevents editing |
| `required` | `boolean` | Marks as required |
| `invalid` | `boolean` | Validation failure state (auto-set by `validate()`) |
| `novalidate` | `boolean` | Skip auto-validate on change |
| `label` | `string` | Field label (see note below for slot-based controls) |
| `description` | `string` | Helper text |
| `validationMessage` | `string` (read-only getter) | The message currently set on `internals.validationMessage`, shown when `invalid` |

> **`label` on slot-based controls (e.g. `UCheckbox`):** most form controls render `label` as a standalone field label. `UCheckbox` instead uses it as **default slot fallback content** — `<slot>${this.label}</slot>` — so an explicit `<u-checkbox>...</u-checkbox>` slot child always takes precedence over the `label` attribute. Set one or the other, not both, to avoid confusion.

---

## Implementing a custom form control

Extend `UFormControlElement<T>` and implement the two abstract methods, `setValidity()` and `reset()`. `validate()` is provided by the base class — don't override it.

```ts
import { UFormControlElement } from '@iyulab/components';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-color-picker')
export class MyColorPicker extends UFormControlElement<string> {
  @property() value = '#000000';

  render() { /* .validationMessage=${this.validationMessage} on your <u-field> or footer element */ }

  protected setValidity(): void {
    const valid = /^#[0-9A-Fa-f]{6}$/.test(this.value ?? '');
    this.commit(
      valid ? {} : { customError: true },
      valid ? '' : 'Invalid color',
    );
  }

  reset(): void {
    this.value = '#000000';
    this.invalid = false;
  }
}
```

`setValidity()` runs automatically whenever `value`/`required` change (via the base class's `updated()`), and again inside `validate()` right before it checks `internals.checkValidity()`. Call `this.commit(flags, message, anchor?)` instead of `internals.setValidity()` directly — `commit()` checks whether a consumer injected a message via `setCustomValidity()` and, if so, reports that instead (matching native `customError` priority).

`validationMessage` on `UFormControlElement` is a read-only getter over `internals.validationMessage` — there's no writable per-instance override prop. To inject a custom message, consumers call `element.setCustomValidity('...')` (mirrors native `HTMLInputElement.setCustomValidity()`): it only updates internal state, and stays invisible until the next `validate()` call actually reports it. Pass `''` to clear it.
