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

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Panel content |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | ✓ | Identifier used for tab/tree matching |
| `disabled` | `boolean` | `false` | ✓ | Disable the panel |
