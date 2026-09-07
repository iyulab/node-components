# Locale

```ts
import { Locale } from '@iyulab/components';
```

Locale registry utility for library-generated validation messages.

## Built-in Locales

Built in: `en`, `ko`, `ja`, `zh-CN`, `zh-TW`, `es`, `fr`, `de`, `pt-BR`, `vi`, `th`, `id`, `ru`, `ar`.

Initial locale is auto-detected from `document.documentElement.lang` first, then
`navigator.language`, with English fallback. `<html lang>` wins because it is the author's
declaration of the document's language and is what assistive technology uses to pick
pronunciation rules (WCAG 3.1.1 / 3.1.2); the browser language is the user-preference
fallback for when no such declaration exists. Call `Locale.set()` to override either.

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
