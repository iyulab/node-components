/**
 * Copy and paste for a keyboard shortcut on something that is not a text field — a grid's selected
 * cells, a list's selected rows.
 *
 * Neither browser mechanism works everywhere on its own:
 * - The browser's `copy`/`cut`/`paste` events carry `clipboardData`, need no permission and work on
 *   any page — but Safari fires `copy`/`cut` only when the page has a text selection, so a grid
 *   whose selection is its own state never gets one there.
 * - The async Clipboard API (`navigator.clipboard`) works in Safari inside the key press — but it
 *   needs a secure context, may be refused, and `readText()` asks the person (or is missing).
 *
 * These helpers use the event when the browser fires it and the Clipboard API when it does not. Call
 * them from the `keydown` handler of the shortcut and **do not `preventDefault()` that key** — the
 * browser's own copy or paste is what fires the event.
 *
 * @example
 * ```ts
 * onKeydown(e: KeyboardEvent) {
 *   if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
 *     const range = this.selection;
 *     copyFromKey(this.selectionAsTsv()).then((ok) => { if (ok) this.clear(range); });
 *   }
 * }
 * ```
 */

/**
 * Puts `text` on the clipboard for the copy or cut key being pressed. Resolves `true` once the text
 * is on the clipboard, `false` when neither the browser's copy event nor the Clipboard API took it —
 * clear a cut selection only on `true`.
 */
export function copyFromKey(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('copy', onEvent, true);
      window.removeEventListener('cut', onEvent, true);
      resolve(ok);
    };
    const onEvent = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      e.preventDefault();
      e.clipboardData.setData('text/plain', text);
      finish(true);
    };
    window.addEventListener('copy', onEvent, true);
    window.addEventListener('cut', onEvent, true);

    // Started inside the key press, where Safari allows it. Where the copy event also comes, the
    // event has already settled this and the write only repeats the same text.
    const write = navigator.clipboard?.writeText?.(text);
    if (!write) {
      setTimeout(() => finish(false));
      return;
    }
    // A refusal waits one task: the browser's copy event, fired as the key's default action, wins.
    write.then(() => finish(true), () => setTimeout(() => finish(false)));
  });
}

/**
 * Reads the clipboard text for the paste key being pressed — from the browser's paste event, or, when
 * none comes, from the Clipboard API. Rejects with the Clipboard API's error when neither gives text.
 */
export function pasteFromKey(): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const onEvent = (e: ClipboardEvent) => {
      if (settled || !e.clipboardData) return;
      settled = true;
      window.removeEventListener('paste', onEvent, true);
      e.preventDefault();
      resolve(e.clipboardData.getData('text/plain'));
    };
    window.addEventListener('paste', onEvent, true);

    // `readText()` may ask the person, so it is the fallback only — after the key's default action
    // has had its turn to fire the paste event.
    setTimeout(() => {
      if (settled) return;
      settled = true;
      window.removeEventListener('paste', onEvent, true);
      const read = navigator.clipboard?.readText?.();
      if (!read) {
        reject(new Error('Clipboard read is not available'));
        return;
      }
      read.then(resolve, reject);
    });
  });
}
