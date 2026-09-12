# u-panel

```ts
import '@iyulab/components/dist/components/panel/UPanel.js';
```

**Tag:** `u-panel`

General-purpose content panel. Matches a tab or tree node when using `value`.

> Looking for a collapsible section? Use [`u-expander`](expander.md). `u-panel` previously
> declared a `collapsible` property that was never implemented — it has been removed.

```html
<!-- Standalone panel -->
<u-panel>Content inside panel</u-panel>

<!-- Inside u-tab-panel (matched by value) -->
<u-tab-panel>
  <u-tab value="tab1">Tab 1</u-tab>
  <u-tab value="tab2">Tab 2</u-tab>
  <u-panel value="tab1">Content for Tab 1</u-panel>
  <u-panel value="tab2">Content for Tab 2</u-panel>
</u-tab-panel>
```

---

## Sizing

`u-panel` has `overflow: auto` and no height of its own, so it behaves two ways — both intended:

- **No height** — it grows with its content. Nothing is clipped and no scrollbar appears.
- **A height (or a height-bearing parent)** — it becomes the scroll container for its content.

```html
<u-panel style="height: 240px">…</u-panel>   <!-- scrolls its content -->
<u-panel>…</u-panel>                          <!-- grows with its content -->
```

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Panel content |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | ✓ | Identifier used for tab/tree matching |
| `disabled` | `boolean` | `false` | ✓ | Disable the panel |
