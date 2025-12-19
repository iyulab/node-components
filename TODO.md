- Check `tree` and `tree-item` components

- Modify `split-panel` and `divider` components
  - `divider` remove hovering effect
  - `split-panel` use `divider` component just for visual part

- Modify `menu` and `menu-item` components like below

```html
<!-- Current -->
<u-menu>
  <u-menu-item>Item 1</u-menu-item>
  <u-menu-item>Item 2</u-menu-item>
  <u-menu-item>
    Submenu
    <u-menu slot="submenu">
      <u-menu-item>Subitem 1</u-menu-item>
      <u-menu-item>Subitem 2</u-menu-item>
    </u-menu>
  </u-menu-item>
</u-menu>

<!-- Changed to -->
<u-menu>
  <u-menu-item>Item 1</u-menu-item>
  <u-menu-item>Item 2</u-menu-item>
  <u-menu-item>
    Submenu
    <u-menu-item>Subitem 1</u-menu-item>
    <u-menu-item>Subitem 2</u-menu-item>
    <u-menu-item>Subitem 3</u-menu-item>
  </u-menu-item>
</u-menu>
```
