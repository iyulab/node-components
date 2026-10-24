# u-command-palette

```ts
import '@iyulab/components/dist/components/command-palette/UCommandPalette.js';
import { filterCommands } from '@iyulab/components';
```

**Tag:** `u-command-palette`

A find-anything dialog — the Ctrl/⌘ K box: one search field over results grouped by where they come from (screens,
recent items, records, actions). The field is a WAI-ARIA APG combobox over a listbox; the dialog is modal, traps
focus, closes on Escape and returns focus to where it was.

```js
const palette = document.querySelector('u-command-palette');
palette.sources = [
  { id: 'screens', label: 'Screens', search: (q) => filterCommands(SCREENS, q) },
  {
    id: 'orders', label: 'Orders',
    search: async (q, { signal }) => q ? (await fetch(`/api/orders?q=${encodeURIComponent(q)}`, { signal }).then(r => r.json())) : [],
  },
];
palette.addEventListener('command', (e) => {
  e.preventDefault();             // a client-side router: navigate yourself
  router.navigate(e.detail.item.href);
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); palette.show(); }
});
```

- **Sources.** Each is `{ id, label, search(query, { signal }) }` returning items or a promise of them. Opening asks
  every source with the empty query (show what belongs there before any typing — recent items, the screen list — or
  return `[]`). Typing asks again `debounce` ms after the last key; the previous request's `signal` is aborted.
  Results are grouped in source order, items in the order the source gave. A source that throws or rejects shows
  «Couldn't search {label}» in its place; the others are unaffected.
- **Choosing.** ↑/↓ move the candidate (the first result is the candidate after each search; the list wraps), Enter
  or a click chooses. `command` fires with `{ item, source }` — cancelable, does not bubble. Not canceled and the item
  has `href` → the page goes there (`location.assign`). The Enter that commits an IME composition does not choose.
- **The shortcut is yours.** The palette does not listen for Ctrl/⌘ K — where and when it opens belongs to the app
  (`@iyulab/modern-app`'s shell wires it to the sidebar). Do not take the shortcut inside editors that use it.
- `filterCommands(items, query)` filters static items by label, description and `keywords` with the locale's search
  match (the rule `u-select` uses — case and accents folded, Korean syllables matched as typed).

## Item

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique within its source |
| `label` | `string` | Shown name |
| `description` | `string?` | Secondary text beside the name; also the option's accessible description |
| `icon` / `iconLib` | `string?` | `u-icon` name and library |
| `href` | `string?` | Followed when chosen, unless `command` is canceled |
| `keywords` | `string[]?` | Extra words `filterCommands` matches |
| `data` | `unknown` | Yours — the palette does not read it |

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `sources` | — | `CommandSource[]` | `[]` | Where items come from, in group order (property only) |
| `placeholder` | `placeholder` | `string` | `''` | Field placeholder |
| `label` | `label` | `string` | `''` | Accessible name of the field and the dialog — empty uses the locale's `search` |
| `debounce` | `debounce` | `number` | `150` | ms after the last key before sources are asked |
| `open` | `open` | `boolean` | `false` | Shown (from the overlay base — also `show()` / `hide()`) |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `command` | `{ item, source }` | An item was chosen. Cancelable; does not bubble |
| `show` / `hide` | — | Before opening / closing (cancelable), from the overlay base |

## Methods

| Method | Description |
|--------|-------------|
| `show()` | Open — focuses the field and asks the sources with the empty query |
| `hide()` | Close — aborts pending requests; focus returns |

## CSS Parts

| Part | Description |
|------|-------------|
| `panel` | The dialog box |
| `input` | The search field |
| `listbox` | The result list |
| `group-label` | A group heading |
| `option` | One item |
| `status` | The searching / no-results / source-error lines |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--command-palette-width` | `40rem` | The dialog's width (capped by the viewport) |
