# Theme

```ts
import { Theme } from '@iyulab/components';
```

Manages the document theme (light / dark / system). Uses CSS custom properties and injects built-in stylesheets on init.

## Initialization

Call once at app startup before rendering any components:

```ts
await Theme.init({
  default: 'system',      // initial theme — 'system' | 'light' | 'dark'
  useBuiltIn: true,       // inject bundled CSS variables (default: true)
  store: {                // persist to storage (optional)
    type: 'localStorage',
    key: 'theme'
  },
  debug: false
});
```

## API

| Member | Type | Description |
|--------|------|-------------|
| `Theme.init(options?)` | `Promise<void>` | Initialize and apply theme |
| `Theme.get()` | `ThemeType \| undefined` | Get current theme |
| `Theme.set(theme)` | `void` | Set theme (`'light'`, `'dark'`, `'system'`) |
| `Theme.isInitialized` | `boolean` | Whether `init()` has been called |

## Types

```ts
type ThemeType = 'system' | 'light' | 'dark';

interface ThemeInitOptions {
  debug?: boolean;
  store?: false | BrowserStorageOptions;
  default?: ThemeType;
  useBuiltIn?: boolean;
}
```
