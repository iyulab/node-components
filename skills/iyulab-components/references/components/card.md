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
  <u-button slot="footer" variant="ghost">Read more</u-button>
</u-card>

<u-card orientation="horizontal" hoverable>
  <img slot="media" src="/thumb.jpg" />
  <p>Horizontal layout card.</p>
</u-card>
```

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
| `borderless` | `boolean` | `false` | ✓ | Remove border |
| `hoverable` | `boolean` | `false` | ✓ | Lift effect on hover |

## CSS Parts

| Part | Description |
|------|-------------|
| `media` | Media area wrapper |
| `content` | Full content wrapper (header + body + footer) |
| `header` | Header slot wrapper |
| `body` | Body (default slot) wrapper |
| `footer` | Footer slot wrapper |
