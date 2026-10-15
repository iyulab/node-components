# u-option-group

```ts
import '@iyulab/components/dist/components/option-group/UOptionGroup.js';
```

**Tag:** `u-option-group`

A labelled group of `u-option`s inside `u-select` or a `u-input` combobox — the native `<optgroup>`. Use it when one
list mixes kinds (regions and zones, projects and monitors) instead of repeating the kind inside every label.

```html
<u-select label="Context" searchable>
  <u-option value="all">Everything</u-option>
  <u-option-group label="Workspaces">
    <u-option value="w-north">North plant</u-option>
    <u-option value="w-south">South plant</u-option>
  </u-option-group>
  <u-option-group label="Monitors">
    <u-option value="m-press">Press line</u-option>
  </u-option-group>
</u-select>
```

- The heading is not an option — it takes no focus, cannot be selected, and the arrow keys go from the last option of
  one group to the first of the next.
- For assistive technology the group is `role="group"` named by `label` (the listbox pattern's grouping); the heading
  itself is not read a second time.
- While none of its options is visible — a `searchable` select's local filter hid them all, or it has none — the whole
  group, heading included, is hidden (`:state(empty)`). The heading takes no part in the search.
- Options added to or removed from a group later are picked up by the owning select or input.

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `label` | `string` | `''` | — | The heading, and the group's accessible name |

## Slots

| Slot | Description |
|------|-------------|
| (default) | `u-option` items |

## CSS Parts

| Part | Description |
|------|-------------|
| `label` | The heading |
| `options` | The box around the options |

## CSS Custom Properties

None of its own — the heading uses the overline type tokens (`--u-text-overline-*`) and `--u-txt-color-weak`.
