# u-auto-scroll

```ts
import '@iyulab/components/dist/components/auto-scroll/UAutoScroll.js';
```

**Tag:** `u-auto-scroll`

A box that scrolls its own overflowing content, slowly, for a screen nobody touches — a wall display on the
production floor, a kiosk, a lobby screen — so a list longer than the screen is still read to its end.

One round: it waits `pause` at the top, scrolls to the end at `speed` (px per second), waits `pause` at the end and
returns to the top. Content that fits does not move. It steps aside for a person: it stands still while the mouse is
over it or focus is inside it, and scrolling by hand always works (it carries on from where the person left it).
For a user who asked for reduced motion (`prefers-reduced-motion: reduce`) it does not move at all. When it leaves the
screen and comes back — a carousel returning to its slide — it starts over from the top.

While its content overflows, the box is a keyboard scroll region (`tabindex="0"`; a `tabindex` you set is kept).

```html
<!-- A rotating floor board: each slide's list runs to its end within the slide -->
<u-carousel autoplay loop pagination pagination-style="labels" autoplay-interval="20000" style="height: 100vh">
  <section aria-label="Late" style="display: flex; flex-direction: column">
    <h1>Late orders</h1>
    <u-auto-scroll speed="40" pause="3000" style="flex: 1">
      <ol>…</ol>
    </u-auto-scroll>
  </section>
</u-carousel>
```

Give it a height — a fixed one, or `flex: 1` in a column with `min-height: 0` (the host sets it). A slide shown for
20 seconds fits about `(20 - 2 × pause) × speed` pixels of travel; choose `speed` from the list's length.

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | The content to scroll |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `speed` | `number` | `30` | — | Scroll speed in px per second |
| `pause` | `number` | `3000` | — | Wait at the top and at the end, in ms |
| `paused` | `boolean` | `false` | ✓ | Do not scroll by itself — by hand only |

## Methods

| Method | Description |
|--------|-------------|
| `restart()` | Back to the top, and start the round over |
