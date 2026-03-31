# u-textarea

```ts
import '@iyulab/components/dist/components/textarea/UTextarea.js';
```

**Tag:** `u-textarea`

Multi-line text input with auto-resize and optional character counter. Form-associated.

```html
<u-textarea name="bio" placeholder="Tell us about yourself" auto-resize></u-textarea>

<!-- With counter and max length -->
<u-textarea name="comment" maxlength="500" counter min-rows="3" max-rows="8">
</u-textarea>
```

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | — | — | Current text value |
| `variant` | `'outlined'\|'filled'\|'underlined'\|'borderless'` | `'outlined'` | ✓ | Visual style |
| `resize` | `'none'\|'vertical'\|'horizontal'\|'both'\|'auto'` | `'auto'` | ✓ | Resize behavior |
| `minRows` | `number` | — | — | Minimum visible rows |
| `maxRows` | `number` | — | — | Maximum rows (auto-resize cap) |
| `counter` | `boolean` | `false` | ✓ | Show character counter |
| `minlength` | `number` | — | — | Minimum character count |
| `maxlength` | `number` | — | — | Maximum character count |
| `placeholder` | `string` | — | — | Placeholder text |
| `autofocus` | `boolean` | `false` | — | Auto-focus on render |
| `autocomplete` | `AutoFill` | — | — | Browser autocomplete |
| `spellcheck` | `boolean` | `false` | — | Spellcheck |
| `disabled` | `boolean` | `false` | ✓ | Disable |
| `readonly` | `boolean` | `false` | ✓ | Read-only |
| `required` | `boolean` | `false` | ✓ | Required |
| `invalid` | `boolean` | `false` | ✓ | Validation failed |
| `name` | `string` | — | — | Form field name |
| `label` | `string` | — | — | Field label |
| `description` | `string` | — | — | Helper text |
| `validationMessage` | `string` | — | — | Custom validation message |

## Events

| Event | Description |
|-------|-------------|
| `input` | Fires on every keystroke |
| `change` | Fires when value is committed |

## Methods

| Method | Description |
|--------|-------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Reset value |

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | Outer wrapper |
| `container` | Textarea area wrapper |
| `textarea` | Native `<textarea>` element |
| `counter` | Character counter display |
