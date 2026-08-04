# u-text

```ts
import '@iyulab/components/dist/components/text/UText.js';
```

**Tag:** `u-text`

Semantic typography. Applies one of the seven design-token type steps
(`display` → `overline`) so markup can use the scale without any consumer CSS.
The component reads the token sheet — it never defines its own type values.

```html
<u-text level="1" variant="display">Document title</u-text>
<u-text variant="subtitle" tone="weak">One-line description</u-text>

<u-text>Body copy is the default step.</u-text>
<u-text variant="caption" tone="weak">Helper text</u-text>

<u-text variant="overline">Section</u-text>
```

## Visual step and heading level are independent

`variant` chooses how the text *looks*; `level` chooses what it *is*. When
`level` is set the component renders a real `<h1>`–`<h6>` in its shadow root, so
assistive technology reads it as a heading whose accessible name is the slotted
text. Without `level` it renders a `<p>`.

```html
<!-- Second-level heading that is visually the largest thing on the page -->
<u-text level="2" variant="display">Overview</u-text>
```

This keeps the document outline honest while leaving the visual hierarchy free.

> **Do not nest a heading inside the slot** — `<u-text><h2>…</h2></u-text>` makes
> the UA rule `h2 { font-size: 1.5em }` multiply the step's font size. Use
> `level` instead. Wrapping the other way (`<h2><u-text>…</u-text></h2>`) is safe
> because the steps are absolute sizes, but the outer heading keeps its UA
> margin, so `level` is still the simpler choice.

## Colour

`tone` is a **neutral emphasis axis**, not a role-colour axis. Semantic status
colour belongs to the component that owns the status (`u-alert`, `u-tag`,
`u-badge`), and link colour belongs to the link.

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Text content |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'display'\|'title'\|'subtitle'\|'body'\|'label'\|'caption'\|'overline'` | `'body'` | ✓ | Semantic type step |
| `tone` | `'default'\|'weak'\|'strong'\|'inverse'` | `'default'` | ✓ | Neutral emphasis axis |
| `level` | `1\|2\|3\|4\|5\|6` | — | ✓ | Heading level; renders `<h1>`–`<h6>` |

## CSS Parts

| Part | Description |
|------|-------------|
| `base` | The rendered `<p>` or `<h1>`–`<h6>` element |

## Design tokens read

| Step | Tokens |
|------|--------|
| `display` · `title` · `subtitle` · `body` · `label` · `caption` · `overline` | `--u-text-{step}-size`, `--u-text-{step}-weight`, `--u-text-{step}-leading`, `--u-text-{step}-tracking` |
| `tone` | `--u-txt-color`, `--u-txt-color-weak`, `--u-txt-color-strong`, `--u-txt-color-inverse` |

Spacing between blocks is **not** this component's concern — it has no margin.
The surrounding layout decides rhythm (`u-group-box`, `u-card`, a flex column).
