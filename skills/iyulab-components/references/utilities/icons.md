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

Resolver contract — the registry owns caching, so a resolver is a pure lookup:
return `string` = success (cached) · return `undefined` = definitive not-found (negative-cached, not retried) · `throw` = transient error (not cached, retried on next lookup).

`register()` ignores an already-registered `lib` name. To override a built-in library (e.g. air-gapped local bundle), call `unregister(lib)` first — this also evicts that library's cache.

## API

| Method | Description |
|--------|-------------|
| `IconRegistry.register(lib, resolver)` | Register an icon library (ignored if `lib` already registered) |
| `IconRegistry.unregister(lib)` | Remove a library + evict its cached entries |
| `IconRegistry.has(lib)` | Check if a library is registered |
| `IconRegistry.resolve(lib, name)` | `Promise<string \| undefined>` — resolve SVG source (cached + in-flight dedupe) |
| `IconRegistry.resolveUrl(url)` | `Promise<string \| undefined>` — fetch SVG by URL, cached under the reserved `url` namespace (used by `u-icon` `src`/base-URL paths) |

## Built-in Libraries

| `lib` | Style variants | CDN version |
|-------|----------------|-------------|
| `internal` | (bundled) | — |
| `tabler` | `name` / `name:filled` | 3.40.0 |
| `heroicons` | `name` / `name:solid` | 2.2.0 |
| `lucide` | `name` | 0.577.0 |
| `bootstrap` | `name` / `name:filled` | 1.13.1 |

## Caching

Resolved SVGs are cached by `lib:name` key (owned by `IconRegistry.resolve()` — resolvers are called once per name per session, concurrent lookups share one in-flight request). Not-found results are negative-cached; transient errors (`throw`) are retried. The cache persists for the lifetime of the page.

```ts
// Internal cache is managed automatically; manual access is rarely needed.
// IconCache.clear();        // clears all cached entries
// IconCache.clear('tabler'); // clears one library's entries
```
