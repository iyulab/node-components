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

`type="number"` reads what the user types **in the page's locale**: `1,5` on a German page and
`1.5` anywhere are both 1.5; `1.234,5` and `1,234.5` are both 1234.5 (rules: `parseNumber`). The
inner input is `type="text" inputmode="decimal"` — a native number input drops or rejects a
decimal comma depending on the browser (`1,5` became `15`, a valid number ten times too large).
`value` is always the canonical dot-decimal string — `""` when the text is not a number, which
then reports `badInput` — and `valueAsNumber` is the number. On blur the text is shown with the
locale's decimal separator; no grouping is inserted.

`min`/`max`/`step` are checked on the parsed number with native semantics: no `step` means 1, so a
field that takes decimals sets `step="any"` or a fractional step. The `−`/`+` icons in the suffix
area and ArrowUp/ArrowDown step the value, snapping to the step from `min` (or 0) and stopping at
`min`/`max`. A field-specific step (e.g. `step="1000"` for a KRW amount) is the consumer's call —
the library does not infer one from field meaning.

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
| `appearance` | `'outlined'\|'soft'\|'underlined'\|'plain'` | `'outlined'` | ✓ | How much chrome: `outlined` · `soft` tinted face · `underlined` bottom line only · `plain` no chrome |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | ✓ | Field size, like a button's: `--u-density` (14px) for md, 6/7 of it for sm (12px) and 8/7 for lg (16px) — change the density and all three follow. A field and a button of the same size share a height |
| `type` | `'text'\|'password'\|'email'\|'tel'\|'url'\|'search'\|'number'\|'date'\|'time'`… | `'text'` | — | Input type |
| `chars` | `number` | — | ✓ | Characters the field holds. An unsized field draws at N characters + its suffix icons + padding; a sized one (`width`, `block`) uses it as the text floor, so a narrower box overflows. Not `size` — that is the sm/md/lg scale. N characters are measured as drawn — tabular figures and letter spacing count, which CSS `ch` leaves out |
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
| `change` | Fires when the value is committed — on `Enter` or on blur, and only if it changed (like a native `<input>`). On `Enter` inside a form it fires before the form submits |

## Form submission

Pressing Enter in the field submits its `<form>`, as in a native text field (HTML implicit
submission): the form's first submit button is activated — `<button type="submit">` or
`<u-button type="submit">`; a disabled one does nothing — and with no submit button the form is
submitted only when it has no other single-line field. Enter that confirms an IME composition,
Enter with a modifier key, and Enter on a highlighted suggestion (`u-option`) do not submit.
Call `preventDefault()` on the `keydown` to cancel it. Do not also submit on Enter yourself.

```html
<form @submit=${onSubmit}>
  <u-input name="user" required></u-input>
  <u-input name="password" type="password" required></u-input>
  <u-button type="submit">Sign in</u-button>
</form>
```

## Methods

| Method | Description |
|--------|-------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Clear value and validation state |
| `valueAsNumber` *(getter)* | `type="number"`: the value as a number, `NaN` when empty or not a number |
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
| `--u-input-display` | Host `display` (default `inline-block`); set `block` to fill a form or grid cell |
| `--u-input-width` | Host `width` (default `auto`); set `100%` where `block` alone does not stretch, such as in a flex container |
| `--input-min-text` | Minimum width of the text area (default `4ch`). The stepper, clear and password-toggle icons never squeeze the text below it — a field given less width overflows its host visibly instead of drawing an input you cannot see into |
| `--input-popover-width` | Combobox popover width (fixed to anchor width by default) |
| `--input-popover-min-height` | Combobox popover min-height |
| `--input-popover-max-height` | Combobox popover max-height |
