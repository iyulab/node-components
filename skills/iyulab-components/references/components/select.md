# u-select

```ts
import '@iyulab/components/dist/components/select/USelect.js';
import '@iyulab/components/dist/components/option/UOption.js';
```

**Tag:** `u-select`

Dropdown select with single or multiple selection, search, and clear support. Form-associated.

```html
<u-select name="country" placeholder="Select country">
  <u-option value="us">United States</u-option>
  <u-option value="kr">South Korea</u-option>
  <u-option value="jp">Japan</u-option>
</u-select>

<!-- Multiple + searchable -->
<u-select name="tags" multiple searchable clearable max-count="3">
  <u-option value="js">JavaScript</u-option>
  <u-option value="ts">TypeScript</u-option>
  <u-option value="py">Python</u-option>
</u-select>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-option` elements |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string \| string[]` | — | — | Selected value(s) |
| `appearance` | `'outlined'\|'soft'\|'underlined'\|'plain'` | `'outlined'` | ✓ | How much chrome: `outlined` · `soft` tinted face · `underlined` bottom line only · `plain` no chrome |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | ✓ | Field size, like a button's: 12px · `--u-density` (14px) · 16px. A field and a button of the same size share a height |
| `chars` | `number` | — | ✓ | Characters the field holds. An unsized field draws at N characters + its clear button and arrow + padding, so it no longer widens and narrows with the chosen option (a longer one ends in an ellipsis); a sized one (`--u-select-width`, `block`) uses it as the text floor, so a narrower box overflows. Same axis as `u-input`'s `chars`. N characters are measured as drawn — tabular figures and letter spacing count, which CSS `ch` leaves out |
| `multiple` | `boolean` | `false` | ✓ | Allow multiple selections |
| `searchable` | `boolean` | `false` | ✓ | Filter options by text |
| `filter` | `'local'\|'none'` | `'local'` | ✓ | Who filters by the search text. `local` shows options whose text or value contains it; `none` hides nothing — for remote search, where the `search` event drives a server query and you replace the options with its results. When the text matches nothing (and not `loading`), the popup says *No matches* |
| `clearable` | `boolean` | `false` | ✓ | Show clear button |
| `loading` | `boolean` | `false` | ✓ | Loading state |
| `placeholder` | `string` | — | — | Placeholder text |
| `minCount` | `number` | — | — | Minimum required selections |
| `maxCount` | `number` | — | — | Maximum allowed selections |
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
| `change` | Fires when selection changes |
| `search` | Fires on every search input change when `searchable` (`detail: { query: string }`). With `filter="none"` the select hides nothing, so the options you set from the server are shown as they are — otherwise the built-in local filter runs too |

## Methods

| Method | Description |
|--------|-------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Reset value |
| `focus(options?)` | Focus the trigger |
| `blur()` | Blur the trigger |

## Keyboard & accessibility

The trigger is a `role="combobox"`. Without `searchable` the dropdown holds a `role="listbox"`
and opening it focuses the first option. With `searchable` the dropdown is a `role="dialog"`
(named by `label`, or "Search") that holds the search field and the listbox; opening it focuses
the search field, so typing filters at once. From the search field `ArrowDown`/`ArrowUp` move to
the first/last visible option; on an option, arrows, `Home`/`End`, `Enter`/`Space` (select) and
`Escape` (close) work as usual.

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | Outer field wrapper |
| `container` | Trigger area |
| `popover` | Dropdown list container |
| `search-input` | Search input inside dropdown |
| `no-matches` | *No matches* status line in the dropdown (empty and hidden otherwise) |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--select-popover-width` | Dropdown width (fixed to anchor width by default; long option text ellipsizes instead of widening the popover) |
| `--select-popover-min-height` | Dropdown min-height |
| `--select-popover-max-height` | Dropdown max-height |
| `--select-min-text` | Minimum width of the displayed text (default `4ch`). The clear button and the dropdown arrow never squeeze the selection below it — a select given less width overflows its host visibly instead of showing nothing |
