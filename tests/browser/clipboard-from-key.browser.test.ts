import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import { copyFromKey, pasteFromKey } from '../../src/utilities/clipboard.js';

/**
 * `copyFromKey` / `pasteFromKey` — the browser's clipboard event where it comes, the Clipboard API
 * where it does not.
 *
 * Chromium fires `copy`/`paste` at the focused element for a real Ctrl+C / Ctrl+V even without a
 * text selection; Safari does not fire `copy` without one. A call made outside a key press stands in
 * for that browser: no event comes, so the Clipboard API path is what is measured.
 */

type Writable = Clipboard & { writeText: Clipboard['writeText']; readText: Clipboard['readText'] };
const clipboard = navigator.clipboard as Writable;
const original = { writeText: clipboard.writeText, readText: clipboard.readText };

afterEach(() => {
  clipboard.writeText = original.writeText;
  clipboard.readText = original.readText;
  document.body.innerHTML = '';
});

const refuse = () => Promise.reject(new DOMException('denied', 'NotAllowedError'));

/** A focusable grid stand-in whose Ctrl+C / Ctrl+V call the helpers without preventing the key. */
function mountGrid(onCopy: (p: Promise<boolean>) => void, onPaste: (p: Promise<string>) => void) {
  const grid = document.createElement('div');
  grid.tabIndex = 0;
  grid.textContent = 'grid';
  grid.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === 'c') onCopy(copyFromKey('a\tb'));
    if (e.key === 'v') onPaste(pasteFromKey());
  });
  document.body.appendChild(grid);
  grid.focus();
  return grid;
}

describe('copyFromKey', () => {
  it('fills the browser copy event on a real key press — the Clipboard API refusing does not matter', async () => {
    clipboard.writeText = refuse;
    const seen: string[] = [];
    document.addEventListener('copy', (e) => seen.push(`${e.defaultPrevented}:${e.clipboardData?.getData('text/plain')}`));
    let result!: Promise<boolean>;
    mountGrid((p) => (result = p), () => {});
    await userEvent.keyboard('{Control>}c{/Control}');
    expect(await result).toBe(true);
    expect(seen).toEqual(['true:a\tb']);
  });

  it('writes through the Clipboard API when no copy event comes (Safari without a selection)', async () => {
    const written: string[] = [];
    clipboard.writeText = async (text: string) => { written.push(text); };
    expect(await copyFromKey('x\ty')).toBe(true);
    expect(written).toEqual(['x\ty']);
  });

  it('resolves false when neither path takes the text', async () => {
    clipboard.writeText = refuse;
    expect(await copyFromKey('x')).toBe(false);
  });
});

describe('pasteFromKey', () => {
  it('reads the browser paste event on a real key press, without calling readText', async () => {
    let reads = 0;
    clipboard.writeText = refuse;
    clipboard.readText = async () => { reads++; return 'from-api'; };
    let copied!: Promise<boolean>;
    let pasted!: Promise<string>;
    mountGrid((p) => (copied = p), (p) => (pasted = p));
    await userEvent.keyboard('{Control>}c{/Control}');
    expect(await copied).toBe(true);
    await userEvent.keyboard('{Control>}v{/Control}');
    expect(await pasted).toBe('a\tb');
    expect(reads).toBe(0);
  });

  it('falls back to readText when no paste event comes', async () => {
    clipboard.readText = async () => 'from-api';
    expect(await pasteFromKey()).toBe('from-api');
  });

  it('rejects with the Clipboard API error when neither path gives text', async () => {
    clipboard.readText = refuse;
    await expect(pasteFromKey()).rejects.toThrow('denied');
  });
});
