# u-carousel

```ts
import '@iyulab/components/dist/components/carousel/UCarousel.js';
```

**Tag:** `u-carousel`

Slide carousel. Each direct child element becomes one slide.

```html
<u-carousel navigation pagination loop autoplay>
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</u-carousel>

<!-- Multi-slide view -->
<u-carousel slides-per-view="3" gap="16" draggable>
  <div>A</div><div>B</div><div>C</div><div>D</div>
</u-carousel>
```

With `autoplay`, the carousel renders a stop/start button as the first control of its indicator
row (WCAG 2.2.2). Rotation pauses while the mouse is over the carousel and stops when keyboard focus
moves into it, until the user presses start (WAI-ARIA APG carousel pattern). Slides are
`aria-live="off"` while rotating and `polite` when stopped.

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Slide elements (each direct child = one slide) |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `autoplay` | `boolean` | `false` | Auto-advance slides |
| `autoplayInterval` | `number` | `3000` | Auto-advance interval in ms |
| `loop` | `boolean` | `false` | Loop from last to first |
| `navigation` | `boolean` | `false` | Show prev/next buttons |
| `pagination` | `boolean` | `false` | Show dot pagination |
| `draggable` | `boolean` | `false` | Drag to navigate |
| `slidesPerView` | `number` | `1` | Visible slides at once |
| `slidesPerMove` | `number` | `1` | Slides to advance per step |
| `gap` | `number` | `0` | Gap between slides in px |
| `index` | `number` | `0` | Active slide index |

## Methods

| Method | Description |
|--------|-------------|
| `prev()` | Go to previous slide |
| `next()` | Go to next slide |
| `goTo(index)` | Jump to a specific slide index |

## CSS Parts

| Part | Description |
|------|-------------|
| `slides` | Slides track container |
| `prev-button` | Previous navigation button |
| `next-button` | Next navigation button |
| `indicator` | Pagination indicator wrapper |
| `dot` | Individual pagination dot |
| `rotation-button` | Stop/start button (only with `autoplay`, inside the indicator) |
