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
`aria-live="off"` while rotating and `polite` when stopped. For a user who has asked for reduced
motion (`prefers-reduced-motion: reduce`) the carousel starts stopped — the start button turns
rotation on — and it stops if that setting is turned on while the page is open.

Assistive technology gets the WAI-ARIA APG carousel structure: the host is a `region` described as a
"carousel" (in the active locale), and each slide is a `group` described as a "slide" and named by its
position ("2 of 5"). Name the carousel with `aria-label` on the host — a region needs a name to be a
landmark. A `role`, `aria-roledescription` or `aria-label` you put on a slide is kept; only the empty
ones are filled.

### A rotating wall display — `pagination-style="labels"`

For a screen read from across a room, the dots are not enough: the viewer has to see which page this is, what comes
next and when it changes. `labels` draws a row under the slides (never over them — it would cover a list's last
row): each tab is named by its slide's `aria-label` (the position when there is none), the passed tabs are full, and
the current tab fills over `autoplay-interval` while the carousel rotates. When rotation stops, the fill stops too.

```html
<u-carousel autoplay loop pagination pagination-style="labels" autoplay-interval="20000" aria-label="Floor board">
  <section aria-label="Late">…</section>
  <section aria-label="Stages">…</section>
  <section aria-label="Batches">…</section>
</u-carousel>
```

Give the carousel a height (`flex: 1` in a full-screen column, or a fixed height) — the row takes its share of it.

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
| `paginationStyle` | `'dots'\|'labels'` | `'dots'` | `pagination-style` — `labels` puts a row under the slides: each slide's name and a progress bar (see below) |
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
| `dot` | Individual pagination dot — with `labels`, one named tab |
| `dot-label` | A tab's name (`labels` only) |
| `dot-track` | A tab's progress track (`labels` only) |
| `dot-progress` | A tab's fill — runs over `autoplay-interval` on the current tab while rotating (`labels` only) |
| `rotation-button` | Stop/start button (only with `autoplay`, inside the indicator) |
