# u-avatar

```ts
import '@iyulab/components/dist/components/avatar/UAvatar.js';
```

**Tag:** `u-avatar`

Displays a user avatar as an image, initials label, or custom slot content.

```html
<u-avatar image="/photo.jpg" label="Alice"></u-avatar>
<u-avatar label="AB" shape="square"></u-avatar>
<u-avatar outline>
  <u-icon lib="tabler" name="user"></u-icon>
</u-avatar>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Custom content shown when neither `image` nor `label` is set |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `shape` | `'circle'\|'square'\|'rounded'` | `'circle'` | ✓ | Avatar shape |
| `outline` | `boolean` | `false` | ✓ | Show border ring |
| `image` | `string` | — | — | Image URL |
| `label` | `string` | — | — | Initials text (first 2 chars shown; used as `alt` for image) |

## CSS Parts

| Part | Description |
|------|-------------|
| `image` | `<img>` element |
| `label` | Initials `<span>` element |
