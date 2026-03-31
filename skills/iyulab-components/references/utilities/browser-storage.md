# BrowserStorage

```ts
import { BrowserStorage } from '@iyulab/components';
```

Unified key-value storage API over `localStorage` or browser cookies.

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
  maxAge: 60 * 60 * 24 * 30  // 30 days
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
type BrowserStorageOptions = LocalStorageOptions | CookieOptions;

interface LocalStorageOptions {
  type: 'localStorage';
}

interface CookieOptions {
  type: 'cookie';
  path?: string;
  domain?: string;
  maxAge?: number;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
}
```
