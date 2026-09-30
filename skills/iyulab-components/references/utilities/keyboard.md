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
