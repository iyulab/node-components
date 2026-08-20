# u-input

```ts
import '@iyulab/components/dist/components/input/UInput.js';
```

**Tag:** `u-input`

Text input field with prefix/suffix slots and label. Add `u-option` children for combobox (autocomplete) mode. Form-associated.

```html
<u-input name="search" type="search" placeholder="Search..." clearable></u-input>

<!-- With icon prefix -->
<u-input name="email" type="email" label="Email" required>
  <u-icon slot="prefix" lib="tabler" name="mail"></u-icon>
</u-input>

<!-- Combobox mode -->
<u-input name="country" placeholder="Select country">
  <u-option value="us">United States</u-option>
  <u-option value="kr">South Korea</u-option>
</u-input>

<!-- Number with a stepper — click +/- to adjust by `step` -->
<u-input type="number" value="5000" step="1000" min="0"></u-input>
```

`type="number"` replaces the browser's native spin buttons with `−`/`+` icons in the suffix
area — clicking delegates to the native `stepUp()`/`stepDown()`, so `min`/`max`/`step` are
respected exactly as they are for keyboard arrows. A field-specific step (e.g. `step="1000"`
for a KRW amount) is the consumer's call — the library does not infer one from field meaning.

---

## Slots

| Name | Description |
|------|-------------|
| `prefix` | Leading content (icon, text) |
| *(default)* | `u-option` elements for combobox mode |
| `suffix` | Trailing content |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'outlined'\|'filled'\|'underlined'\|'borderless'` | `'outlined'` | ✓ | Visual style |
| `type` | `'text'\|'password'\|'email'\|'tel'\|'url'\|'search'\|'number'\|'date'\|'time'`… | `'text'` | — | Input type |
| `placeholder` | `string` | — | — | Placeholder text |
| `clearable` | `boolean` | `false` | ✓ | Show clear button |
| `minlength` | `number` | — | — | Minimum character count |
| `maxlength` | `number` | — | — | Maximum character count |
| `min` | `string` | — | — | Minimum value (number/date) |
| `max` | `string` | — | — | Maximum value |
| `step` | `number` | — | — | Step increment used by both keyboard arrows and the stepper buttons below. Unset behaves like the native default of `1` |
| `pattern` | `string` | — | — | Regex validation pattern |
| `autofocus` | `boolean` | `false` | — | Auto-focus on render |
| `autocomplete` | `AutoFill` | — | — | Browser autocomplete |
| `spellcheck` | `boolean` | `false` | — | Spellcheck |
| `dirname` | `string` | — | — | Native `dirname` — submits the text direction with the form |
| `inputmode` | `'none'\|'text'\|'decimal'\|'numeric'\|'tel'\|'search'\|'email'\|'url'` | — | — | Virtual keyboard hint |
| `enterkeyhint` | `'enter'\|'done'\|'go'\|'next'\|'previous'\|'search'\|'send'` | — | — | Enter-key label hint |
| `autocorrect` | `boolean` | `false` | — | Native autocorrect (Safari/iOS) |
| `autocapitalize` | `'off'\|'none'\|'on'\|'sentences'\|'words'\|'characters'` | `'off'` | — | Auto-capitalization behavior |
| `size` | `number` | — | — | Native `size` — visible width in characters |
| `disabled` | `boolean` | `false` | ✓ | Disabled |
| `readonly` | `boolean` | `false` | ✓ | Read-only |
| `required` | `boolean` | `false` | ✓ | Required |
| `invalid` | `boolean` | `false` | ✓ | Validation failed |
| `name` | `string` | — | — | Form field name |
| `value` | `string` | — | — | Current value |
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
| `reset()` | Clear value and validation state |
| `focus(options?)` | Focus the input |
| `blur()` | Blur the input |

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | Outer field wrapper |
| `container` | Input area wrapper |
| `input` | Native `<input>` element |
| `popover` | Combobox dropdown |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--input-popover-width` | Combobox popover width (fixed to anchor width by default) |
| `--input-popover-min-height` | Combobox popover min-height |
| `--input-popover-max-height` | Combobox popover max-height |
