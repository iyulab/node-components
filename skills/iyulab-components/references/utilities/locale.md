# Locale

```ts
import { Locale } from '@iyulab/components';
```

Locale registry utility for library-generated validation messages.

## Built-in Locales

Built in: `en`, `ko`, `ja`, `zh-CN`, `zh-TW`, `es`, `fr`, `de`, `pt-BR`, `vi`, `th`, `id`, `ru`, `ar`.

Initial locale is auto-detected from `navigator.language` / `document.documentElement.lang`, with English fallback.

## API

| Method | Description |
|--------|-------------|
| `Locale.set(locale)` | Set active locale |
| `Locale.get()` | Get active locale |
| `Locale.register(locale, table)` | Register/override locale messages (partial merge supported) |
| `Locale.getValue(key, params?)` | Resolve a localized message for current locale |

## Example

```ts
import { Locale } from '@iyulab/components';

Locale.set('ko');

Locale.register('en', {
  valueMissing: 'Please fill out this field.'
});

const message = Locale.getValue('valueMissing');
```
