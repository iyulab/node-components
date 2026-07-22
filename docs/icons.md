# Icons

## Overview

`u-icon` renders SVG icons by name from a registered library. Icons are resolved at runtime via `IconRegistry` and cached by `IconCache`.

Built-in icons are bundled at **build time** via Vite's `import.meta.glob` into `src/assets/icons/` — no network request needed.

Third-party libraries (Tabler, Heroicons, Lucide, Bootstrap) are fetched from CDN on first use and cached.

---

## Built-in icons

Built-in icons live in `src/assets/icons/*.svg`. They are loaded via:

```ts
// src/utilities/icons.ts
const internalIconBundle = new Map<string, string>(
  Object.entries(import.meta.glob('../assets/icons/*.svg', {
    eager: true,
    query: '?raw',
    import: 'default',
  })).map(([path, module]) => [
    path.split('/').pop()!.replace('.svg', ''),
    module as string
  ])
);
```

To add a new built-in icon: place the `.svg` file in `src/assets/icons/` and rebuild.

### Base URL

If you serve static assets from a custom path (e.g. CDN), update the base URL at startup:

```ts
import { setDefaultBaseUrl } from '@iyulab/components';
setDefaultBaseUrl('https://cdn.example.com/icons/');
```

---

## Pre-registered third-party libraries

| `lib` | Style variants | CDN version |
|-------|----------------|-------------|
| `internal` | bundled | — |
| `tabler` | `name` / `name:filled` | 3.40.0 |
| `heroicons` | `name` / `name:solid` | 2.2.0 |
| `lucide` | `name` | 0.577.0 |
| `bootstrap` | `name` / `name:filled` | 1.13.1 |

```html
<u-icon lib="tabler" name="home"></u-icon>
<u-icon lib="tabler" name="home:filled"></u-icon>
<u-icon lib="heroicons" name="academic-cap:solid"></u-icon>
```

---

## Registering a custom library

```ts
import { IconRegistry } from '@iyulab/components';

IconRegistry.register('my-icons', async (name: string) => {
  const res = await fetch(`/icons/${name}.svg`);
  return res.ok ? res.text() : undefined;
});
```

```html
<u-icon lib="my-icons" name="logo"></u-icon>
```

### Resolver contract

The registry owns caching — a resolver is a **pure lookup** and is called at most once per icon name per session. Its return value declares the outcome:

| Resolver outcome | Meaning | Caching |
|------------------|---------|---------|
| returns `string` | success | cached for the session |
| returns `undefined` | **definitive not-found** (e.g. HTTP 404) | negative-cached — not retried (escape hatch: `IconCache.clear()`) |
| throws | **transient error** (e.g. network failure) | not cached — retried on next lookup |

Do **not** return `undefined` for transient failures — let the error propagate (`throw`) so the registry can retry later. Do not implement your own memoization inside a resolver; the registry already deduplicates concurrent lookups and caches results.

### Overriding a pre-registered library

`register()` ignores a `lib` name that is already registered. To replace a built-in CDN library (e.g. to serve icons from a local bundle in an air-gapped network), unregister first — this also evicts that library's cached entries:

```ts
IconRegistry.unregister('bootstrap');
IconRegistry.register('bootstrap', async (name) => {
  const res = await fetch(`/assets/bootstrap-icons/${name}.svg`);
  return res.ok ? res.text() : undefined;
});
```

Unregister when no longer needed:

```ts
IconRegistry.unregister('my-icons');
```

---

## Direct SVG

http(s) url directly via `src`:

```html
<u-icon src="https://example.com/icon.svg"></u-icon>
```

`src` URLs (and the no-`lib` base-URL path) are resolved through `IconRegistry.resolveUrl(url)` and cached under the reserved `url` namespace — the same URL is fetched once per session, even across unmount/remount.

---

## Caching

`IconCache` stores resolved SVGs keyed by `lib:name`. Cache persists for the page lifetime. The cache is shared across all `u-icon` instances and owned by `IconRegistry.resolve()` — the same icon is fetched once per session, including under repeated re-renders/remounts (e.g. streaming UI):

- **Success** is cached; **not-found** (`undefined`) is negative-cached so a missing icon does not re-fetch (no 404 storms).
- **Concurrent lookups** of the same `(lib, name)` share one in-flight request.
- **Transient errors** (resolver `throw`) are never cached — the next lookup retries.
- `IconCache.clear()` empties the whole cache; `IconCache.clear(lib)` empties one library (also done automatically by `IconRegistry.unregister(lib)`).

---

## `u-icon` inside other components

Many components accept icon sub-elements in slots:

```html
<u-button>
  <u-icon slot="prefix" lib="tabler" name="download"></u-icon>
  Download
</u-button>

<u-input name="search">
  <u-icon slot="prefix" lib="tabler" name="search"></u-icon>
</u-input>
```

`u-icon-button` has built-in icon support via `lib`/`name`/`src` properties — no child element needed:

```html
<u-icon-button lib="tabler" name="trash">Delete</u-icon-button>
```
