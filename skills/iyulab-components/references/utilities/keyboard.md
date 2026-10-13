# keyboard

```ts
import { isImeComposing } from '@iyulab/components';
// or: import { isImeComposing } from '@iyulab/components/dist/utilities/keyboard.js';
```

## `isImeComposing(event: KeyboardEvent): boolean`

Whether a key event belongs to an IME composition — typing Korean, Japanese, Chinese and other
languages that build a character from several keystrokes.

The Enter (or Escape) that confirms a composition is not a command. A handler that submits, commits a
cell, or closes a layer on Enter should ignore it; otherwise the action fires in the middle of a word,
or the last syllable is committed after the action and sent twice.

`event.isComposing` alone is not enough: Safari delivers the confirming key after `compositionend`,
with `isComposing` false and `keyCode` 229. This helper checks both.

```ts
onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter' || isImeComposing(e)) return;
  this.submit();
}
```

`u-input` (implicit form submission), `Dialog.prompt`, and the overlay Escape handling already use it.

## Filtering as you type — `CompositionTracker`, `replayInput`

```ts
import { CompositionTracker, replayInput } from '@iyulab/components';
// or: '@iyulab/components/dist/utilities/composition.js'
```

An input that filters or searches on every `input` event sees each step of an IME composition: typing
«서울» in Korean passes through `ㅅ`, `서`, `성`, `서우`. Filtering on those hides what the person is
looking for, shows "No results", and — for a server search — sends queries for half-typed syllables.
Chromium sends the composition's last `input` with `isComposing: true` and then `compositionend`, so
a handler that only skips composing events never sees the finished text.

Attach a tracker to the input's composition events (it is an event listener object):

```ts
private readonly ime = new CompositionTracker(replayInput);

render() {
  return html`<input
    @compositionstart=${this.ime} @compositionupdate=${this.ime} @compositionend=${this.ime}
    @input=${this.onInput}>`;
}
```

- `ime.composing` — a composition is in progress.
- `ime.settled(input)` — the text without the part still being composed. Items containing the settled
  text are a superset of items containing the finished text, so filtering on it never hides a match.
- `ime.searchQuery(input)` — `{ query, composing }` for `Locale.matchesSearch(text, query, { composing })`:
  the settled text plus a Hangul syllable being composed at the end, which the matcher compares as a
  partial syllable.
- `replayInput` as the `onEnd` callback re-runs the input's own `input` handler when the composition
  ends. Use it for an input that waits: a server search, or a filter whose rule is not «contains»
  (equals, wildcard) or that announces its value to the outside.

Keep the text bound to the input (`.value=${…}`) as the whole box text — binding the settled text
re-renders the input mid-composition and cancels it.
