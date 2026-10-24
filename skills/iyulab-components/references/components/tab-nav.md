# u-tab-nav

```ts
import '@iyulab/components/dist/components/tab-nav/UTabNav.js';
import '@iyulab/components/dist/components/tab/UTab.js';
```

**Tags:** `u-tab-nav`, `u-tab` (with `href`)

A tab strip of **links** — saved views, sections of a record, anything where each tab is a URL. It looks like the
`line` appearance of [`u-tab-panel`](./tab-panel.md) but does a different job: `u-tab-panel` switches panels on the
same page (a `tablist`), `u-tab-nav` takes you to another URL (a `<nav>` landmark).

```html
<u-tab-nav label="Saved views" value="open">
  <u-tab value="all" href="?view=all">All</u-tab>
  <u-tab value="open" href="?view=open" count="12">Open</u-tab>
  <u-tab value="mine" href="?view=mine" count="3">Mine</u-tab>
</u-tab-nav>
```

Each `u-tab` needs an `href`. Mark the current view with `value` on the strip (the tab with the same `value` becomes
`active`), or leave `value` empty and put `active` on the current tab yourself. With a router, set `value` from the
route.

### Tiles — `appearance="tiles"`

Equal tiles instead of an underlined strip; the current tile is filled with `--tab-nav-color` and its text takes
`--tab-nav-contrast`. For a shop-floor terminal's stations, where a tile is a finger's width and how much is waiting at
each is why you pick one — pair it with `count-appearance="figure"` on the tabs, which draws the count as a large
number under the label. Tiles narrower than `--tab-nav-tile-min` wrap onto another row.

```html
<u-tab-nav label="Stations" appearance="tiles" value="press-1">
  <u-tab value="press-1" href="?station=press-1" count="383" count-appearance="figure">Press 1</u-tab>
  <u-tab value="press-2" href="?station=press-2" count="125" count-appearance="figure">Press 2</u-tab>
  <u-tab value="foil" href="?station=foil" count="137" count-appearance="figure">Foil</u-tab>
</u-tab-nav>
```

### Accessibility

- The strip is a `<nav>` named by `label` — give it one when the page has other navigation.
- Each tab is a link, and each link is a Tab stop; Enter follows it. There are no arrow keys and no tab role — the
  WAI-ARIA tabs pattern is for panels on one page, and a link announced as a «tab» promises a panel that never
  appears.
- The current tab carries `aria-current="page"`.
- A disabled link tab has no `href` and reports `aria-disabled`.
- A `count` is part of the link's name («Open 12»).

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | ✓ | The current view — the tab with this `value` becomes `active`. Empty leaves `active` to the tabs |
| `label` | `string` | `''` | | Accessible name of the navigation landmark |
| `appearance` | `'line' \| 'tiles'` | `'line'` | ✓ | `line` an underlined strip · `tiles` equal tiles, the current one filled |

`u-tab` properties for link tabs (`href`, `target`, `rel`, `active`, `count`) are in [tab-panel.md](./tab-panel.md#u-tab).

## Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-tab` elements with `href` |

## CSS Parts

| Part | Description |
|------|-------------|
| `base` | The `<nav>` strip |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--tab-nav-color` | Text and underline colour of the current tab, and the current tile's fill with `tiles` (default: `--u-primary-color`) |
| `--tab-nav-contrast` | Text colour of the current tile with `tiles` (default: `--u-primary-txt-color`) |
| `--tab-nav-tile-min` | Narrowest a tile gets before tiles wrap (default `7rem`) |
