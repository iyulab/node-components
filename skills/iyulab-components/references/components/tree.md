# u-tree / u-tree-item

```ts
import '@iyulab/components/dist/components/tree/UTree.js';
import '@iyulab/components/dist/components/tree-item/UTreeItem.js';
```

**Tags:** `u-tree`, `u-tree-item`

Hierarchical tree with support for selection, checkboxes, cascade check, and drag-and-drop.

```html
<u-tree selectable checkable check-cascade>
  <u-tree-item value="root" expanded>
    Root
    <u-tree-item value="child1">Child 1</u-tree-item>
    <u-tree-item value="child2">
      Child 2
      <u-tree-item value="leaf1">Leaf</u-tree-item>
    </u-tree-item>
  </u-tree-item>
</u-tree>
```

---

## u-tree

### Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-tree-item` elements |
| `expand-icon` | Custom expand icon |
| `collapse-icon` | Custom collapse icon |

### Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `selectable` | `boolean` | `false` | ✓ | Enable item selection |
| `selectMultiple` | `boolean` | `false` | ✓ | Allow multiple items selected |
| `selectLeaf` | `boolean` | `false` | ✓ | Only leaf nodes are selectable |
| `checkable` | `boolean` | `false` | ✓ | Show checkboxes |
| `checkCascade` | `boolean` | `false` | ✓ | Parent/child checkbox cascade |
| `draggable` | `boolean` | `false` | ✓ | Enable drag |
| `droppable` | `boolean` | `false` | ✓ | Enable drop |
| `trigger` | `'item'\|'icon'` | `'item'` | — | Click target to expand/collapse |

### Events

| Event | Description |
|-------|-------------|
| `change` | Fires when selection or check state changes |

### Methods

| Method | Description |
|--------|-------------|
| `expandAll()` | Expand all items |
| `collapseAll()` | Collapse all items |
| `expand(value)` | Expand item by value |
| `collapse(value)` | Collapse item by value |
| `toggle(value)` | Toggle item by value |
| `getItem(value)` | Get `UTreeItem` by value |
| `getItems(fn)` | Get items matching a filter function |
| `mapItems(fn)` | Apply a function to all items |

### CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--tree-indent-size` | Indentation per depth level |
| `--tree-indent-guide-offset` | Guide line offset |
| `--tree-indent-guide-width` | Guide line width |
| `--tree-indent-guide-style` | Guide line CSS border-style |
| `--tree-indent-guide-color` | Guide line color |

---

## u-tree-item

### Slots

| Name | Description |
|------|-------------|
| `prefix` | Leading content |
| *(default)* | Item label |
| `suffix` | Trailing content |

### Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | `''` | — | Unique identifier |
| `disabled` | `boolean` | `false` | ✓ | Disable the item |
| `expanded` | `boolean` | `false` | ✓ | Show children |
| `selectable` | `boolean` | `false` | ✓ | This item can be selected |
| `checkable` | `boolean` | `false` | ✓ | Show checkbox |
| `loading` | `boolean` | `false` | ✓ | Loading state (async children) |
| `draggable` | `boolean` | `false` | ✓ | Draggable |
| `droppable` | `boolean` | `false` | ✓ | Accepts drops |
| `trigger` | `'item'\|'icon'` | `'item'` | — | Expand trigger target |

### Events

| Event | Description |
|-------|-------------|
| `expand` | Item is expanded |
| `collapse` | Item is collapsed |
| `pick` | Item is selected |
| `check` | Item checkbox toggled |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `expand()` | `boolean` | Expand this item |
| `collapse()` | `boolean` | Collapse this item |
| `toggle()` | `boolean` | Toggle expand/collapse |

### CSS Parts

| Part | Description |
|------|-------------|
| `header` | Item header row (icon + label + suffix) |
| `content` | Label content area |
| `subtree` | Children container |
