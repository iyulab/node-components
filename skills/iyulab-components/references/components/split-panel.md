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
<u-split-panel orientation="vertical" default-ratio="30,70" style="height: 400px;">
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

## Sizing

**Give the host a height.** This is a shell: `:host` is `height: 100%` with `overflow: hidden`,
so the panels divide whatever height the host has — and an unconstrained host has none to divide.

```html
<u-split-panel style="height: 400px">…</u-split-panel>
```

⚠ Leave the height off — or nest the component in a container that has no height of its own — and
it collapses to a thin strip (measured: 18px, with 900px-tall panel content), the content is
clipped by `overflow: hidden`, and there is no scrollbar to reach it. No error, nothing in the
console. Every example below assumes a height on the host for this reason.

A height-bearing ancestor works the same way (measured):

```css
.page             { height: 100%; display: flex; flex-direction: column; }
.page u-split-panel { flex: 1 1 auto; min-height: 0; }
```

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Exactly two panel elements |
| `splitter` | Custom splitter/handle UI |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `orientation` | `'horizontal'\|'vertical'` | `'horizontal'` | ✓ | Split direction |
| `defaultRatio` | `number[]` | `[]` | ✓ | Initial size ratios. Attribute form is comma-separated, without brackets: `default-ratio="30,70"`. Ratios are shares of the space between the handles |
| `ratio` | `number[]` | `[]` | ✓ | Current size ratios |
| `disabled` | `boolean` | `false` | ✓ | Prevent resizing |
| `lazy` | `boolean` | `false` | ✓ | Show preview while dragging, commit on release |

## Events

| Event | Description |
|-------|-------------|
| `shift-start` | Drag starts |
| `shift` | Dragging in progress |
| `shift-end` | Drag ends |

## Keyboard & Accessibility

Each handle is a focusable `role="separator"` following the WAI-ARIA APG *Window Splitter*
pattern. Its value is the share of the panel **before** it (`aria-valuenow`, `0` to the combined
share of the two panels it sits between — `100` with two panels), and it is named by the
`resizePanels` locale message.

| Key | Effect |
|-----|--------|
| `←` / `→` (horizontal) · `↑` / `↓` (vertical) | Shrink / grow the panel before the handle by 5% |
| `Home` / `End` | Give the panel before the handle its smallest / largest size |
| `Enter` | Collapse the panel before the handle; press again to restore its previous size |

In a right-to-left layout `←` still moves the handle left. A keyboard change fires `shift-start`,
`shift` and `shift-end` in turn, so listening to `shift-end` alone covers both pointer and keyboard.

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--splitter-size` | Thickness of the visible line (default `4px`) |
| `--splitter-hit-size` | Thickness of the area that takes the pointer (default `24px`, WCAG 2.5.8). It occupies layout space between the panels, so it never covers a panel's scrollbar. The handle is the larger of the two; set it to `var(--splitter-size)` for a flush handle |
| `--splitter-color` | Splitter default color |
| `--splitter-color-hover` | Splitter color on hover |
| `--splitter-color-active` | Splitter color while dragging |
