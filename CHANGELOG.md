# Changelog

## 0.1.11 (2026-01-06)

### Fixes
- Fixed d.ts generation error for `Theme` class by exporting the class

### Features
- **UTreeItem**: Added `loading` property with spinner indicator
- **UTreeItem**: Added MutationObserver for dynamic child loading support
- **UMenuItem**: Added `loading` property with spinner indicator

### Improvements
- **UDivider**: Simplified component (removed movable functionality)
- **USplitPanel**: Completely rewritten with native splitter implementation
  - Removed dependency on `UDivider` component
  - Added CSS variables (`--splitter-size`, `--splitter-color`, `--splitter-active-color`)
  - Improved drag handling with percentage-based sizing
- **UMenu/UMenuItem**: Refactored submenu handling logic
  - Simplified submenu detection using `submenu` property
  - Improved pointer/focus event handling for submenus
  - Fixed submenu auto-positioning with `slot` attribute assignment
- **UTreeItem**: Improved children slot handling with `processChildren` method
- **UTreeItem**: Changed indent styling to use CSS custom property (`--indent-level`)

## 0.1.10 (2025-12-19)
- Fixed circular dependency issue between `UMenu` and `UMenuItem`
- Changed `UMenuItem` to use tagName check instead of `instanceof` for submenu detection

## 0.1.9 (2025-12-19)
- Added `Tree`, `TreeItem` components for hierarchical data display
- Updated React wrapper plugin to support new file structure
- Removed `CopyButton` component
- Changed React wrapper output directory to `react-components`

## 0.1.8 (2025-12-18)
- **Breaking Change**: Added `U` prefix to all component class names (e.g., `Alert` → `UAlert`)
- **Breaking Change**: Changed file naming convention
  - `{Name}.ts` → `U{Name}.component.ts` (class implementation)
  - `{Name}.styles.ts` → `U{Name}.styles.ts` (styles)
  - `index.ts` → `U{Name}.ts` (element definition)

## 0.1.7 (2025-12-13)
- Added `FloatingElement` base class for popover, tooltip common logic
- Added `ModalElement` base class for dialog, drawer common logic
- Added `Drawer` component
- Added `Skeleton` component
- Improved `Menu` component with dropdown, contextmenu, submenu support
- Refactored `Dialog` component based on `ModalElement`
- Removed `ContextMenu`, `DropdownMenu` (merged into `Menu`)

## 0.1.5 (2025-12-10)
- Improved `Icon` component and refactored icon utilities
- Improved `Input` component styles and validation
- Improved `Tooltip`, `Divider`, `SplitPanel` components
- Improved `notifier` utility
- Removed `Panel` component
- Updated theme styles (light/dark)

## 0.1.4 (2025-12-05)
- Fixes some issues

## 0.1.3 (2025-11-17)
- fixed a theme `useBuiltIn` Option, now it works as expected.
- added `ProgressBar` component to show loading progress at the top of the page.

## 0.1.2 (2025-11-13)
- fixed a type issue in `theme` utility.

## 0.1.1 (2025-11-13)
- added `BrowserStorage` which supports `localStorage` and `cookie` with async methods for getting, setting, and removing items.
- changed theme `persist` option to `store` option, and fixed some issues.
- removed `toggle` method from theme utility.

## 0.1.0 (2025-11-12)
- Initial library version release
