# u-tab-panel / u-tab

```ts
import '@iyulab/components/dist/components/tab-panel/UTabPanel.js';
import '@iyulab/components/dist/components/tab/UTab.js';
import '@iyulab/components/dist/components/panel/UPanel.js';
```

**Tags:** `u-tab-panel`, `u-tab`

Tab-based content switcher. Pair each `u-tab` with a `u-panel` of the same `value`. For tabs that are links to other
URLs (saved views), use [`u-tab-nav`](./tab-nav.md).

```html
<u-tab-panel value="home">
  <u-tab value="home">Home</u-tab>
  <u-tab value="profile">Profile</u-tab>
  <u-tab value="settings">Settings</u-tab>

  <u-panel value="home">Home content</u-panel>
  <u-panel value="profile">Profile content</u-panel>
  <u-panel value="settings">Settings content</u-panel>
</u-tab-panel>

<!-- Card appearance, left placement -->
<u-tab-panel appearance="card" placement="left">
  <u-tab value="a" removable>Tab A</u-tab>
  <u-panel value="a">Panel A</u-panel>
</u-tab-panel>
```

---

## u-tab-panel

### Sizing

`u-tab-panel` is a flex shell with no height of its own, so it behaves two ways — both intended:

- **No height** — it grows with the active panel's content; nothing is clipped and no scrollbar
  appears (measured: a 900px panel under a `top` tab bar gives a 935px-tall component — the 34px bar
  plus the content).
- **A height, or a height-bearing parent** — the **content area** becomes the scroll region and the
  tab bar keeps its place (measured: 300px tall → a 265px content area with 635px to scroll).

```html
<u-tab-panel style="height: 300px">…</u-tab-panel>
```

The tab bar scrolls on its own axis when the tabs overflow it — horizontally for `placement="top"`
and `"bottom"`, vertically for `"left"` and `"right"` — so a long tab list never pushes the content
out of the component.

### Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-tab` and `u-panel` elements |
| `toolbar` | Toolbar area at the end of the tab bar |

### Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | ✓ | Currently active tab value |
| `appearance` | `'line'\|'card'\|'pill'\|'plain'` | `'line'` | ✓ | Tab bar style |
| `placement` | `'top'\|'bottom'\|'left'\|'right'` | `'top'` | ✓ | Tab bar position |
| `draggable` | `boolean` | `false` | ✓ | Native drag attribute — **no built-in reordering** |
| `disabled` | `boolean` | `false` | ✓ | Disable all tabs |

### Events

| Event | Description |
|-------|-------------|
| `change` | Fires on user-driven tab changes (click/keyboard). Not emitted for initial mount or direct `value` assignment. |

### Accessibility

The panel wires the WAI-ARIA tabs pattern itself: each tab carries `aria-selected`, only the
selected tab is a tab stop (arrow keys, Home and End move between tabs and select them), each
`u-panel` becomes a `tabpanel`, and a tab and its panel (same `value`) point at each other with
`aria-controls` / `aria-labelledby`. Ids are generated when missing; ids you set are kept.

### CSS Parts

| Part | Description |
|------|-------------|
| `header` | Tab bar row |
| `nav` | Tab navigation container |
| `toolbar` | Toolbar slot area |
| `content` | Panel content area |

---

## u-tab

### Slots

| Name | Description |
|------|-------------|
| `prefix` | Leading content |
| *(default)* | Tab label |
| `suffix` | Trailing content |

A control placed in a slot (a button, a link) keeps its own keys and clicks — it does not select or
activate the tab, and the tab's arrow-key navigation applies only while the tab itself has focus.

**Link tabs.** With `href` the tab renders as a link for [`u-tab-nav`](./tab-nav.md): no tab role and no host tab
stop (the inner `<a>` is the stop), `aria-current="page"` while `active`, and no remove button.

**Count.** `count` draws a quiet number after the label — smaller, weaker, tabular digits in the active locale — in a
panel tab or a link tab. It is part of the tab's name.

### Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | ✓ | Matches a `u-panel` with the same `value` |
| `disabled` | `boolean` | `false` | ✓ | Disable the tab |
| `removable` | `boolean` | `false` | ✓ | Show close/remove button |
| `draggable` | `boolean` | `false` | ✓ | Native drag attribute — **no built-in reordering** |
| `active` | `boolean` | `false` | ✓ | The selected tab — set by the container's `value`; set it yourself on a link tab when `u-tab-nav` has no `value` |
| `href` | `string` | — | ✓ | Makes the tab a link (inside `u-tab-nav`) |
| `target` | `string` | — | | Link target (with `href`) |
| `rel` | `string` | — | | Link relationship (with `href`) |
| `count` | `number` | — | | Quiet count after the label, in the active locale's digits |
| `countAppearance` | `'badge' \| 'plain'` | — | | Attribute `count-appearance`. `badge` (a pill) or `plain` (no pill — a smaller, weaker number, for a row of many tabs where pills would read before the labels). Empty: the app-wide `UTab.countAppearance` (default `badge`) |

### Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `remove` | ✓ | Fires when the remove button is clicked |

### CSS Parts

| Part | Description |
|------|-------------|
| `base` | Tab box — the `<a>` when `href` is set |
| `count` | The count (only with `count`) |
| `remove-btn` | Remove button |
