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

Options of different kinds can be grouped under headings with [`u-option-group`](./option-group.md) — the native `<optgroup>`; a group whose options a search filtered out is hidden.

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
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | ✓ | Field size, like a button's: `--u-density` (14px) for md, 6/7 of it for sm (12px) and 8/7 for lg (16px) — change the density and all three follow. A field and a button of the same size share a height |
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
| `descriptionDisplay` | `'inline' \| 'hint'` | — | — | Attribute `description-display`. This field only — `hint` puts the description in a tooltip beside the label, `inline` under the control. Empty: the app-wide `UField.descriptionDisplay` |
| `validationMessage` | `string` | — | — | Custom validation message |

## Events

| Event | Description |
|-------|-------------|
| `change` | Fires when selection changes |
| `search` | Fires when the search text changes, when `searchable` (`detail: { query: string; composing: boolean }`). While an IME composition is in progress (Korean, Japanese, Chinese) `composing` is `true` and `query` ends in a partial syllable; when it ends the event fires again with `false` — a server search can skip composing queries. While composing, the built-in filter uses only the committed part, so it never hides an option the finished text would match. With `filter="none"` the select hides nothing, so the options you set from the server are shown as they are — otherwise the built-in local filter runs too |

## Methods

| Method | Description |
|--------|-------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Reset value |
| `focus(options?)` | Focus the trigger (its search input, when `searchable`) |
| `blur()` | Blur the trigger |

## Keyboard & accessibility

Without `searchable` the trigger is a `role="combobox"` (APG *select-only combobox*) whose dropdown holds a
`role="listbox"`; opening it focuses the first option. Typing on the closed trigger is **type-ahead**: a letter picks
the next option whose text starts with it (repeat the letter to cycle), and letters typed within half a second form a
word (`ch` → *cherry*); on an open list the same keys move the focus instead of picking.

With `searchable` the combobox is an **editable input inside the trigger** (APG *editable combobox with list
autocomplete*): `Tab` lands in it, and typing — including the first syllable of an IME composition — opens the list and
becomes the query at once, so nothing typed is lost. While there is a query the selected value is hidden behind it
(`multiple` keeps its chips and types after them). The first visible option is the **active candidate** — shown like a
hovered option and announced through the input's `aria-activedescendant` — and `Enter` picks it (closing the list, or
toggling it with `multiple`); the `Enter` that commits an IME composition does not. `ArrowDown`/`ArrowUp` open a closed
list and, on an open one, move to the first/last visible option; letters typed on an option go back to the input.
`Escape` closes the list (the focus stays in the input) and closing clears the query, so the trigger shows the value
again. On an option, arrows, `Home`/`End`, `Enter`/`Space` (select) and `Escape` (close) work as usual.

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | Outer field wrapper |
| `container` | Trigger area |
| `popover` | Dropdown list container |
| `search-input` | The edit field inside the trigger (the combobox, when `searchable`) — closed, it holds the chosen option's text (single selection) |
| `no-matches` | *No matches* status line in the dropdown (empty and hidden otherwise) |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--select-popover-width` | Dropdown width (fixed to anchor width by default; long option text ellipsizes instead of widening the popover) |
| `--select-popover-min-height` | Dropdown min-height |
| `--select-popover-max-height` | Dropdown max-height |
| `--select-min-text` | Minimum width of the displayed text (default `4ch`). The clear button and the dropdown arrow never squeeze the selection below it — a select given less width overflows its host visibly instead of showing nothing |
