# Architecture

## Package Structure

```
src/
├── index.ts                  # Public exports (components, events, utilities)
├── assets/
│   ├── icons/                # Bundled SVG icons (internal library)
│   └── styles/
│       ├── light.css         # CSS custom properties — light theme
│       └── dark.css          # CSS custom properties — dark theme
├── components/
│   ├── UElement.ts           # Root base class
│   ├── UFormControlElement.ts
│   ├── UFloatingElement.ts
│   ├── UOverlayElement.ts
│   ├── UDataElement.ts
│   └── <name>/
│       ├── U<Name>.ts           # Component class
│       └── U<Name>.styles.ts    # Component scoped styles
├── events/
│   └── *.ts                  # Typed CustomEvent declarations
└── utilities/
    └── *.ts                  # Theme, Toast, Dialog, icons, etc.
```

## Class Hierarchy

```
LitElement
└── UElement                      ← all components
    ├── UFormControlElement<T>    ← form inputs (formAssociated)
    ├── UFloatingElement          ← anchored floating UI
    ├── UOverlayElement           ← modal overlays
    └── UDataElement              ← JSON-driven components
```

## Styling Architecture

### Theme CSS Variables

All color tokens follow the pattern `--u-{color}-{shade}` (e.g. `--u-blue-500`).  
Shades: `0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000`  
Colors: `neutral, blue, green, yellow, red, orange, teal, cyan, purple, pink`

`Theme.init()` injects `light.css` or `dark.css` into the document (or switches based on `prefers-color-scheme`).

### Component Styles

Each component has a companion `U<Name>.styles.ts` file that exports a `styles` `CSSResult`. Component classes compose styles with:

```ts
static styles = [super.styles, styles];
```

Shadow DOM scopes all styles automatically — no class name collisions.

### CSS Parts

Components expose internal elements via `part` attributes, which can be styled with `::part()` from outside:

```css
u-input::part(input) { font-size: 1.125rem; }
```

## Event System

All custom events are declared in `src/events/` and registered on `GlobalEventHandlersEventMap` for TypeScript type safety.

Events are fired via `this.fire<T>(name)` (from `UElement`), which sets `bubbles: true`, `composed: true`, `cancelable: true` by default.

See [events.md](./events.md) for the full event catalog.

## Icon System

Icons are resolved at runtime by `IconRegistry`.  
Built-in icons are bundled at build time via Vite's `import.meta.glob` into `internalIconBundle`.  
Third-party icons (Tabler, Heroicons, etc.) are fetched from CDN and cached by `IconCache`.

## Build

```bash
npm run build        # eslint + vite build + build:plugins
npm run build:plugins  # tsc for the plugins/ directory
npm run test         # vite dev server (tests/index.html)
```
