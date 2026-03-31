# IconRegistry

```ts
import { IconRegistry, getDefaultBaseUrl, setDefaultBaseUrl } from '@iyulab/components';
```

Manages icon library resolvers. Built-in libraries (`internal`, `tabler`, `heroicons`, `lucide`, `bootstrap`) are pre-registered.

## Base URL

Icons served from the file system use a configurable base path (default: `/assets/icons/`).

```ts
setDefaultBaseUrl('/static/icons/');  // change base URL
getDefaultBaseUrl();                  // get current base URL
```

## Register a custom library

```ts
IconRegistry.register('my-icons', async (name: string) => {
  const res = await fetch(`/icons/${name}.svg`);
  return res.ok ? res.text() : undefined;
});
```

## API

| Method | Description |
|--------|-------------|
| `IconRegistry.register(lib, resolver)` | Register an icon library |
| `IconRegistry.unregister(lib)` | Remove a library |
| `IconRegistry.has(lib)` | Check if a library is registered |
| `IconRegistry.resolve(lib, name)` | `Promise<string \| undefined>` — resolve SVG source |

## Built-in Libraries

| `lib` | Style variants | CDN version |
|-------|----------------|-------------|
| `internal` | (bundled) | — |
| `tabler` | `name` / `name:filled` | 3.40.0 |
| `heroicons` | `name` / `name:solid` | 2.2.0 |
| `lucide` | `name` | 0.503.0 |
| `bootstrap` | `name` / `name:filled` | 1.11.3 |

## Caching

Resolved SVGs are cached by `lib:name` key. The cache persists for the lifetime of the page.

```ts
// Internal cache is managed automatically; manual access is rarely needed.
// IconCache.clear(); // clears all cached entries
```
