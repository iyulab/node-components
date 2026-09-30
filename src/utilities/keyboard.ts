/**
 * Whether a key event belongs to an IME composition — typing Korean, Japanese, Chinese and other
 * languages that build a character from several keystrokes.
 *
 * The Enter (or Escape) that confirms a composition is not a command: a handler that submits,
 * commits a cell or closes a layer on Enter should ignore it, or the last syllable is sent twice
 * or the action fires in the middle of a word.
 *
 * `isComposing` alone is not enough — Safari delivers the confirming key after `compositionend`,
 * with `isComposing` false and `keyCode` 229 ("IME is processing").
 *
 * @example
 * ```ts
 * onKeydown(e: KeyboardEvent) {
 *   if (e.key !== 'Enter' || isImeComposing(e)) return;
 *   this.submit();
 * }
 * ```
 */
export function isImeComposing(e: KeyboardEvent): boolean {
  return e.isComposing || e.keyCode === 229;
}
