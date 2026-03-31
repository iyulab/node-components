# u-split-panel

```ts
import '@iyulab/components/dist/components/split-panel/USplitPanel.js';
```

**Tag:** `u-split-panel`

Resizable two-panel layout. Drag the splitter to adjust panel sizes.

```html
<u-split-panel style="height: 400px;">
  <div>Left panel content</div>
  <div>Right panel content</div>
</u-split-panel>

<!-- Vertical split -->
<u-split-panel orientation="vertical" default-ratio="[30,70]">
  <div>Top panel</div>
  <div>Bottom panel</div>
</u-split-panel>

<!-- Custom splitter handle -->
<u-split-panel>
  <div>Panel A</div>
  <div>Panel B</div>
  <div slot="splitter" style="background:blue; width:4px;"></div>
</u-split-panel>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Exactly two panel elements |
| `splitter` | Custom splitter/handle UI |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `orientation` | `'horizontal'\|'vertical'` | `'horizontal'` | ✓ | Split direction |
| `defaultRatio` | `number[]` | `[]` | ✓ | Initial size ratios (e.g. `[30, 70]`) |
| `ratio` | `number[]` | `[]` | ✓ | Current size ratios |
| `disabled` | `boolean` | `false` | ✓ | Prevent resizing |
| `lazy` | `boolean` | `false` | ✓ | Show preview while dragging, commit on release |

## Events

| Event | Description |
|-------|-------------|
| `shift-start` | Drag starts |
| `shift` | Dragging in progress |
| `shift-end` | Drag ends |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--splitter-size` | Splitter handle thickness |
| `--splitter-color` | Splitter default color |
| `--splitter-color-hover` | Splitter color on hover |
| `--splitter-color-active` | Splitter color while dragging |
