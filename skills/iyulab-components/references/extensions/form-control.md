# UFormControlElement\<T\>

```ts
import { UFormControlElement } from '@iyulab/components';
```

Abstract base class for all form-associated controls. Enables native `<form>` participation via the [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) API.

## When to extend

Use when building a custom input that should participate in forms (`formAssociated = true`), support `name`/`value` submission, and integrate with the library's validation pattern.

```ts
import { UFormControlElement } from '@iyulab/components';
import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import type { PropertyValues } from 'lit';
import { Locale } from '@iyulab/components';

@customElement('my-input')
export class MyInput extends UFormControlElement<string> {
  @property() value = '';

  render() {
    return html`
      <input
        .value=${this.value}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        @change=${(e: Event) => {
          this.value = (e.target as HTMLInputElement).value;
          this.fire('change');
        }}
      />
    `;
  }

  protected override setValidity(): void {
    if (this.required && !this.value) {
      this.commit({ valueMissing: true }, Locale.getValue('valueMissing'));
      return;
    }
    this.commit({}, '');
  }

  protected override shouldValidate(changed: PropertyValues): boolean {
    return super.shouldValidate(changed);
  }

  reset(): void {
    this.value = '';
    this.setCustomValidity('');
    this.commit({}, '');
    this.invalid = false;
  }
}
```

## Inherited Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `name` | `string` | — | — | Form field name |
| `value` | `T` | — | — | Submitted value |
| `disabled` | `boolean` | `false` | ✓ | Disable the control |
| `readonly` | `boolean` | `false` | ✓ | Read-only |
| `required` | `boolean` | `false` | ✓ | Required field |
| `invalid` | `boolean` | `false` | ✓ | Validation failed state |
| `novalidate` | `boolean` | `false` | — | Skip automatic validation |
| `label` | `string` | — | — | Field label |
| `description` | `string` | — | — | Helper description |
| `validationMessage` | `string` | — | — | Custom validation error text |

## Inherited Getters

| Getter | Returns | Description |
|--------|---------|-------------|
| `form` | `HTMLFormElement \| null` | Associated form element |
| `validity` | `ValidityState \| undefined` | Native validity state |

## Model value (`u-form`)

`modelValue` (getter/setter, `unknown`) is the value a `u-form` reads into and writes from its `model`. It defaults to
`value`. Override it when the control's state lives in another property — `u-checkbox` and `u-switch` exchange
`checked` (a boolean), not the submitted `value`.

## Abstract Methods (must implement)

| Method | Returns | Description |
|--------|---------|-------------|
| `setValidity()` | `void` | Compute current validity and call `commit(flags, message, anchor?)` |
| `reset()` | `void` | Reset value and clear validation state |

## Validation Helpers (inherited)

| Member | Type | Description |
|--------|------|-------------|
| `validate(report?)` | `boolean` | Validate now (`true` = report/update invalid UI, `false` = silent check) |
| `setCustomValidity(message)` | `void` | Set or clear custom error text (`''` clears) |
| `commit(flags, message, anchor?)` | `void` | Apply validity state to `ElementInternals` with native-like custom-error precedence |
| `shouldValidate(changed)` | `boolean` | Select which property updates should trigger re-validation (`value`/`required` by default) |
