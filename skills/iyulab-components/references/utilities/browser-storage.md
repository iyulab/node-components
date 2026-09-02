# BrowserStorage

```ts
import { BrowserStorage } from '@iyulab/components';
```

Unified key-value storage API over `localStorage` or browser cookies.

⚠ Cookie storage uses the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore)
(`window.cookieStore`) — supported in Chromium browsers, not yet in Safari or Firefox as of
writing. `new BrowserStorage({ type: 'cookie' })` throws `"Cookies are not supported in this
browser."` where it's unavailable; `localStorage` has no such restriction.

## Usage

```ts
// localStorage
const storage = new BrowserStorage({ type: 'localStorage' });

await storage.set('theme', 'dark');
const theme = await storage.get('theme'); // 'dark'
await storage.remove('theme');

// Cookie
const cookieStorage = new BrowserStorage({
  type: 'cookie',
  path: '/',
  expires: Date.now() + 30 * 24 * 60 * 60 * 1000  // 30 days, ms since epoch
});

await cookieStorage.set('session', 'abc123');
```

## API

| Method | Returns | Description |
|--------|---------|-------------|
| `set(key, value)` | `Promise<void>` | Store a string value |
| `get(key)` | `Promise<string \| null>` | Retrieve a value |
| `remove(key)` | `Promise<void>` | Delete a value |

## Types

```ts
type BrowserStorageOptions = (LocalStorageOptions | CookieOptions) & {
  /** Prefix prepended to every key. */
  prefix?: string;
};

interface LocalStorageOptions {
  type: 'localStorage';
}

interface CookieOptions {
  type: 'cookie';
  path?: string;
  domain?: string | null;
  /** Expiry as ms since epoch (`DOMHighResTimeStamp`). Omit for a session cookie. */
  expires?: DOMHighResTimeStamp | null;
  sameSite?: 'strict' | 'lax' | 'none';
  /** Partitioned cookie (CHIPS) — isolates the cookie per top-level site in a third-party context. */
  partitioned?: boolean;
}
```

Only `'localStorage'` and `'cookie'` are valid `type` values — there is no `'sessionStorage'`
storage backend.
