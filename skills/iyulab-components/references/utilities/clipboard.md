# clipboard

```ts
import { copyFromKey, pasteFromKey } from '@iyulab/components';
// or: import { copyFromKey, pasteFromKey } from '@iyulab/components/dist/utilities/clipboard.js';
```

Copy and paste for a keyboard shortcut on something that is not a text field — a grid's selected
cells, a list's selected rows.

Neither browser mechanism works everywhere on its own:

- The browser's `copy` / `cut` / `paste` events carry `clipboardData`, need no permission and work on
  any page — but **Safari fires `copy`/`cut` only when the page has a text selection**, so a grid
  whose selection is its own state never gets one there.
- The async Clipboard API works in Safari inside the key press — but it needs a secure context, may be
  refused, and `readText()` asks the person (or is missing).

These helpers use the event when the browser fires it and the Clipboard API when it does not. Call
them from the shortcut's `keydown` handler and **do not `preventDefault()` that key** — the browser's
own copy or paste is what fires the event.

## `copyFromKey(text: string): Promise<boolean>`

Puts `text` on the clipboard. Resolves `true` once it is there, `false` when neither path took it. A
cut clears its selection only on `true` — otherwise the data is gone without being on the clipboard.

## `pasteFromKey(): Promise<string>`

Reads the clipboard text — from the paste event, or, when none comes, from `navigator.clipboard.readText()`.
Rejects with the Clipboard API's error when neither gives text.

```ts
onKeydown(e: KeyboardEvent) {
  if (!(e.ctrlKey || e.metaKey) || this.editing) return;   // a text field keeps its own clipboard
  const key = e.key.toLowerCase();
  if (key === 'c' || key === 'x') {
    const range = this.selection;
    copyFromKey(encodeTsv(this.cells(range))).then((ok) => {
      if (ok && key === 'x') this.clear(range);
    });
  } else if (key === 'v') {
    pasteFromKey().then((text) => this.paste(decodeTsv(text)), (error) => this.report(error));
  }
}
```

`flex-table`, `u-simple-sheet` and `u-rich-table` use them for Ctrl/Cmd + C, X and V.
