# u-copy-button

```ts
import '@iyulab/components/dist/components/copy-button/UCopyButton.js';
```

**Tag:** `u-copy-button`

Copies text to the clipboard and shows a transient confirmation by swapping its icon.

Two shapes:

- **Icon only** (default) — the default slot becomes the tooltip.
- **Icon + label** — set `label` to render visible text beside the icon.

The clipboard logic is identical in both.

```html
<!-- Icon only; slot content is the tooltip -->
<u-copy-button value="npm i @iyulab/components">Copy install command</u-copy-button>

<!-- Icon + label -->
<u-copy-button value="RESULT-1024" label="Copy result"></u-copy-button>

<!-- Stays in the copied state until reset explicitly -->
<u-copy-button value="token" .delay=${0}></u-copy-button>
```

## Changing or cancelling what gets copied

The `copy` event fires **before** the write, so a handler can rewrite the payload or cancel:

```ts
button.addEventListener('copy', (e: ClipboardEvent) => {
  e.clipboardData?.setData('text/plain', transform(button.value));
  e.preventDefault(); // cancel the built-in write
});
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Tooltip content, icon-only shape. Unused when `label` is set |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'solid'\|'outline'\|'ghost'\|'link'` | `'ghost'` | ✓ | Button style |
| `rounded` | `boolean` | `false` | ✓ | Circular shape |
| `disabled` | `boolean` | `false` | ✓ | Disabled state |
| `copied` | `boolean` | `false` | ✓ | Currently showing the copied state |
| `tooltipPlacement` | `Placement` | `"top"` | | Tooltip placement (`tooltip-placement`) |
| `tooltipOffset` | `OffsetOptions` | `4` | | Tooltip distance (`tooltip-offset`) |
| `delay` | `number` | `1_000` | | Milliseconds before leaving the copied state; `0` or less keeps it |
| `value` | `string` | — | | Text to copy |
| `label` | `string` | — | | Inline label; switches to the icon + label shape |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `copy` | native `ClipboardEvent` | Fires before the write. `preventDefault()` cancels it; `clipboardData.setData` replaces the payload |

## CSS Parts

| Part | Description |
|------|-------------|
| `button` | Inner button element |
| `icon` | Icon element |
| `tooltip` | Tooltip element (icon-only shape) |

## Sizing

This component keeps a **fixed** font size (18px) rather than inheriting the surrounding
typography — it reads as an affordance next to text of any size. See
[design-tokens.md](../../../../docs/design-tokens.md) for the four components that do this.
