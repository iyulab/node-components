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

  validate(): boolean {
    if (this.required && !this.value) {
      this.invalid = true;
      return false;
    }
    this.invalid = false;
    return true;
  }

  reset(): void {
    this.value = '';
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

## Abstract Methods (must implement)

| Method | Returns | Description |
|--------|---------|-------------|
| `validate()` | `boolean` | Run validation logic; set `this.invalid` accordingly |
| `reset()` | `void` | Reset value and clear validation state |
