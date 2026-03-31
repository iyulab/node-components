# u-menu / u-menu-item

```ts
import '@iyulab/components/dist/components/menu/UMenu.js';
import '@iyulab/components/dist/components/menu-item/UMenuItem.js';
```

**Tags:** `u-menu`, `u-menu-item`

Keyboard-navigable menu. Supports single/multiple selection, highlight or checkmark indicator, and nested sub-menus.

```html
<u-menu selection="single" indicator="check">
  <u-menu-item value="home">Home</u-menu-item>
  <u-menu-item value="about">About</u-menu-item>
  <u-divider></u-divider>
  <u-menu-item value="settings">
    <u-icon slot="prefix" lib="tabler" name="settings"></u-icon>
    Settings
    <!-- Nested sub-menu -->
    <u-menu slot="children">
      <u-menu-item value="profile">Profile</u-menu-item>
      <u-menu-item value="security">Security</u-menu-item>
    </u-menu>
  </u-menu-item>
</u-menu>
```

---

## u-menu

### Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-menu-item` or `u-divider` elements |

### Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `selection` | `'none'\|'single'\|'multiple'` | `'none'` | ✓ | Selection mode |
| `indicator` | `'highlight'\|'check'` | `'highlight'` | ✓ | Selected item indicator style |
| `align` | `'left'\|'center'\|'right'` | `'left'` | ✓ | Item text alignment |
| `loop` | `boolean` | `false` | ✓ | Keyboard navigation wraps around |
| `inline` | `boolean` | `false` | ✓ | Horizontal layout |
| `borderless` | `boolean` | `false` | ✓ | Remove border |

### Events

| Event | Description |
|-------|-------------|
| `change` | Fires when selection changes |

### Getters

| Getter | Type | Description |
|--------|------|-------------|
| `items` | `readonly UMenuItem[]` | All direct menu items |
| `selectedItems` | `UMenuItem[]` | Currently selected items |

### CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--menu-indent-size` | Indentation per nesting level |

---

## u-menu-item

### Slots

| Name | Description |
|------|-------------|
| `prefix` | Leading content |
| *(default)* | Item label |
| `suffix` | Trailing content |
| `children` | Nested `u-menu` for sub-menu |

### Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | — | Unique identifier |
| `disabled` | `boolean` | `false` | ✓ | Disable the item |
| `selected` | `boolean` | `false` | ✓ | Selected state |
| `expanded` | `boolean` | `false` | ✓ | Sub-menu expanded |
| `indicator` | `'highlight'\|'check'` | `'highlight'` | ✓ | Selection indicator |
| `align` | `'left'\|'center'\|'right'` | `'left'` | ✓ | Text alignment |

### Events

| Event | Description |
|-------|-------------|
| `pick` | Fires when item (with no children) is selected |

### CSS Parts

| Part | Description |
|------|-------------|
| `header` | Item header row |
| `content` | Label content area |
| `submenu` | Inline sub-menu wrapper |
| `popover` | Popover sub-menu wrapper |
