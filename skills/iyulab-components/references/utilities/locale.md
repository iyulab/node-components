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

## Resolution

A message is looked up along a chain, first match wins:

1. the exact tag (case-insensitive);
2. the tag with trailing subtags removed, one at a time (`zh-Hant-HK` → `zh-Hant` → `zh`);
3. the language's default regional table, for languages shipped only in regional form —
   `zh` → `zh-CN`, `zh-Hant` / `zh-HK` / `zh-MO` → `zh-TW`, `pt` → `pt-BR`;
4. `en`.

So `<html lang="zh">` or `lang="pt"` gets the shipped Chinese or Portuguese strings, and a
Traditional Chinese tag gets `zh-TW` rather than the Simplified default. A table you register for
the region-less tag (`Locale.register('pt', …)`) comes before step 3. `Locale.namespace()` uses the
same chain.

## API

| Method | Description |
|--------|-------------|
| `Locale.set(locale)` | Set active locale |
| `Locale.get()` | Get active locale |
| `Locale.register(locale, table)` | Register/override locale messages (partial merge supported) |
| `Locale.getValue(key, params?, locale?)` | Resolve a localized message for the current locale (or `locale`, along its fallback chain) |
| `Locale.namespace(name)` | A string table for a package or app area, keyed by its own union — returns a handle (below) |
| `Locale.subscribe(listener)` | Call `listener` whenever the locale changes (`set` to another locale, any `register`) — returns the unsubscribe function |
| `Locale.revision` | A number that grows on every change — a snapshot or cache key (`get()` stays the same when only a table changes) |

### Switching at runtime

`Locale.set()` and `Locale.register()` take effect on screen at once: every connected component
re-renders, including text it keeps outside its template — validation messages, accessible names,
the decimal separator of a number field. An element detached during the change catches up when it
is attached again. Your own code subscribes the same way:

```ts
const off = Locale.subscribe(() => renderMyView());
// React
const revision = useSyncExternalStore(Locale.subscribe, () => Locale.revision);
```

### Namespaces

`Locale.getValue` covers the library's own message keys. A package built on top keeps its own
strings in a namespace and follows the same active locale and chain:

```ts
const t = Locale.namespace<'empty' | 'greet'>('my-package');
t.register('en', { empty: 'No data', greet: 'Hello, {who}' });
t.register('ko', { empty: '데이터가 없습니다' });   // partial tables merge

t.text('empty');                       // active locale
t.text('greet', { who: 'Ann' });       // {name} substitution
t.textIn(el.locale, 'empty');          // a given locale (e.g. an element's own `locale`);
                                       // empty → active locale. Does not change the active one.
```

A key missing from every table in the chain returns the key itself, so a gap shows on screen
instead of rendering as an empty string.

## Example

```ts
import { Locale } from '@iyulab/components';

Locale.set('ko');

Locale.register('en', {
  valueMissing: 'Please fill out this field.'
});

const message = Locale.getValue('valueMissing');
```
