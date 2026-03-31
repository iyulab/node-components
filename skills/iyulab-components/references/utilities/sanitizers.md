# sanitizers

```ts
import { escapeHtmlText, escapeHtmlAttr, escapeHtmlHref, stripZeroWidth } from '@iyulab/components';
```

XSS-safe escaping helpers for HTML output. Use these whenever inserting user-supplied content into HTML strings (e.g. inside `buildElementHTML` or custom template rendering).

## Functions

| Function | Use case | Description |
|----------|----------|-------------|
| `escapeHtmlText(value)` | Text node content | Escapes `&`, `<`, `>`, `"`, `'` |
| `escapeHtmlAttr(value)` | HTML attribute values | Escapes `&`, `<`, `>`, `"` |
| `escapeHtmlHref(value)` | `href` / `src` URLs | Escapes HTML entities + blocks `javascript:` and `data:` protocol injection |
| `stripZeroWidth(value)` | Any string output | Removes zero-width Unicode characters (e.g. U+200B) |

## Example

```ts
import { escapeHtmlText, escapeHtmlHref } from '@iyulab/components';

const userInput = '<script>alert(1)</script>';
const html = `<p>${escapeHtmlText(userInput)}</p>`;
// → <p>&lt;script&gt;alert(1)&lt;/script&gt;</p>

const url = 'javascript:alert(1)';
const safe = escapeHtmlHref(url);
// → '' (blocked)
```

> Lit templates using `html` tagged literals automatically escape interpolated values. These helpers are needed when building raw HTML strings manually.
