# u-card

```ts
import '@iyulab/components/dist/components/card/UCard.js';
```

**Tag:** `u-card`

Content card with optional media, header, body, and footer sections.

```html
<u-card>
  <img slot="media" src="/cover.jpg" alt="Cover" />
  <span slot="header">Title</span>
  <p>Card body content.</p>
  <u-button slot="footer" appearance="plain">Read more</u-button>
</u-card>

<u-card orientation="horizontal" hoverable>
  <img slot="media" src="/thumb.jpg" />
  <p>Horizontal layout card.</p>
</u-card>

<!-- The whole card is a link -->
<u-card href="/orders/42" aria-label="Order 42">
  <span slot="header">Order 42</span>
  <p>Due Oct 20 · 3 items</p>
</u-card>
```

**A card that is a link (`href`).** The outer box renders as an `<a>`: the text stays ink with no underline, the
border carries hover, and the card does not lift (a lifting card shakes a grid row). Keep other interactive elements
— buttons, links — out of a link card; an `<a>` cannot contain them. The link's accessible name is all of the card's
text unless the host has an `aria-label`, which moves to the link.

---

## Slots

| Name | Description |
|------|-------------|
| `media` | Visual media (image, video) |
| `header` | Card header area |
| *(default)* | Card body content |
| `footer` | Card footer area |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `orientation` | `'vertical'\|'horizontal'` | `'vertical'` | ✓ | Layout direction |
| `shadowless` | `boolean` | `false` | ✓ | Remove drop shadow |
| `appearance` | `'outlined'\|'plain'` | `'outlined'` | ✓ | `outlined` border and drop shadow · `plain` no border and no shadow (layout only) |
| `hoverable` | `boolean` | `false` | ✓ | Lift effect on hover |
| `href` | `string` | — | ✓ | Makes the whole card a link to this URL |
| `target` | `string` | — | | Link target (with `href`) |
| `rel` | `string` | — | | Link relationship (with `href`) |
| `download` | `string` | — | | Download file name (with `href`) |

## CSS Parts

| Part | Description |
|------|-------------|
| `base` | Outer card box — the `<a>` when `href` is set |
| `media` | Media area wrapper |
| `content` | Full content wrapper (header + body + footer) |
| `header` | Header slot wrapper |
| `body` | Body (default slot) wrapper |
| `footer` | Footer slot wrapper |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--card-border-width` | Border thickness (`0` for `appearance="plain"`) |
| `--card-border-color` | Border color |
