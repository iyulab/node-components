# u-tab-panel / u-tab

```ts
import '@iyulab/components/dist/components/tab-panel/UTabPanel.js';
import '@iyulab/components/dist/components/tab/UTab.js';
import '@iyulab/components/dist/components/panel/UPanel.js';
```

**Tags:** `u-tab-panel`, `u-tab`

Tab-based content switcher. Pair each `u-tab` with a `u-panel` of the same `value`.

```html
<u-tab-panel value="home">
  <u-tab value="home">Home</u-tab>
  <u-tab value="profile">Profile</u-tab>
  <u-tab value="settings">Settings</u-tab>

  <u-panel value="home">Home content</u-panel>
  <u-panel value="profile">Profile content</u-panel>
  <u-panel value="settings">Settings content</u-panel>
</u-tab-panel>

<!-- Card variant, right placement, editable -->
<u-tab-panel variant="card" placement="left" editable draggable>
  <u-tab value="a" removable>Tab A</u-tab>
  <u-panel value="a">Panel A</u-panel>
</u-tab-panel>
```

---

## u-tab-panel

### Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-tab` and `u-panel` elements |
| `toolbar` | Toolbar area at the end of the tab bar |

### Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | ✓ | Currently active tab value |
| `variant` | `'line'\|'card'\|'pill'\|'plain'` | `'line'` | ✓ | Tab bar style |
| `placement` | `'top'\|'bottom'\|'left'\|'right'` | `'top'` | ✓ | Tab bar position |
| `editable` | `boolean` | `false` | ✓ | Allow adding/removing tabs |
| `draggable` | `boolean` | `false` | ✓ | Allow reordering tabs by drag |
| `disabled` | `boolean` | `false` | ✓ | Disable all tabs |

### CSS Parts

| Part | Description |
|------|-------------|
| `header` | Tab bar row |
| `nav` | Tab navigation container |
| `toolbar` | Toolbar slot area |
| `content` | Panel content area |

---

## u-tab

### Slots

| Name | Description |
|------|-------------|
| `prefix` | Leading content |
| *(default)* | Tab label |
| `suffix` | Trailing content |

### Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | ✓ | Matches a `u-panel` with the same `value` |
| `disabled` | `boolean` | `false` | ✓ | Disable the tab |
| `removable` | `boolean` | `false` | ✓ | Show close/remove button |
| `draggable` | `boolean` | `false` | ✓ | Allow dragging to reorder |

### Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `remove` | ✓ | Fires when the remove button is clicked |

### CSS Parts

| Part | Description |
|------|-------------|
| `remove-btn` | Remove button |
