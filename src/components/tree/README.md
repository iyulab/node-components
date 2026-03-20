## tree
- props
  disabled?: boolean;
  trigger?: 'item' | 'icon'; (트리 토글시 어떤걸 대상으로 할지)

  selectable?: boolean;
  selectMultiple?: boolean;(Ctrl/Cmd additive selection)
  selectLeafOnly?: boolean;

  checkable?: boolean;
  checkCascade?: boolean;

  draggable?: boolean;
  droppable?: boolean;

- methods
  expandAll()
  collapseAll()
  expand(value)
  collapse(value)
  toggle(value)

- events
  expand
  collapse
  select
  check

- slot
  - expand-icon
  - collapse-icon
  - default

- css
  --tree-indent-size
  --tree-indent-guide-width
  --tree-indent-guide-color
  --tree-indent-guide-style
  --tree-indent-guide-offset

## tree-item
- props
  checkable?: boolean;
  selectable?: boolean;
  draggable?: boolean;
  droppable?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  lazy?: boolean;
  value: string;

- state
  loading?: boolean;
  leaf?: boolean;
  selected?: boolean;
  checked?: boolean;
  indeterminate?: boolean;

- events
  expand
  collapse
  select
  check
  load(lazy 플래그시 발생 this.emit의 결과를 보고 loading 변경)

- methods
  expand: () => void;
  collapse: () => void;

- slot
  prefix
  default
  suffix
  children

## example
<u-tree>
  <u-tree-item value="tree1">
    Tree1
    <u-tree-item value="tree1-1">Tree1-1</u-tree-item>
    <u-tree-item value="tree1-2">Tree1-2</u-tree-item>
    <u-tree-item value="tree1-3">Tree1-3</u-tree-item>
  </u-tree-item>
  <u-tree-item value="tree2">Tree2</u-tree-item>
  <u-tree-item value="tree3">Tree3</u-tree-item>
  <u-tree-item value="tree4">
    Tree4
    <u-tree-item value="tree4-1">Tree4-1</u-tree-item>
    <u-tree-item value="tree4-2">Tree4-2</u-tree-item>
  </u-tree-item>
</u-tree>
