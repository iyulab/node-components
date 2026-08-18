import { describe, it, expect, vi } from 'vitest';
import '../../src/components/button/UButton.js';

/**
 * Without a token sheet, a component renders unstyled with **no error** — the CSS gives no
 * signal at all. A dev-build warning is the only thing that breaks that silence, so this
 * checks that it actually fires.
 *
 * (This test environment never calls `Theme.init()` and never imports the CSS, so no tokens
 *  are present — it reproduces the problem state as-is.)
 */
describe('missing-token warning', () => {
  it('warns once, on the first component connecting, when tokens are absent', async () => {
    const probe = getComputedStyle(document.documentElement)
      .getPropertyValue('--u-blue-600').trim();
    expect(probe, 'this test assumes no tokens are present').toBe('');

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const a = document.createElement('u-button');
      document.body.appendChild(a);
      await (a as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;

      const messages = warn.mock.calls.map(c => String(c[0]));
      // ⚠The message text moved to English on 2026-08-04 (console-diagnostics language
      //   policy). This checks *what it says*, not the full sentence — pinning the whole
      //   string would break on every wording tweak.
      const hit = messages.filter(m => m.includes('No design-token sheet found'));
      expect(hit.length, `the warning did not fire. warnings received: ${JSON.stringify(messages)}`).toBe(1);
      expect(hit[0]).toContain('@iyulab/components/styles/tokens.css');

      // the second component does not warn again (avoids noise)
      warn.mockClear();
      const b = document.createElement('u-button');
      document.body.appendChild(b);
      await (b as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
      expect(warn.mock.calls.filter(c => String(c[0]).includes('No design-token sheet found'))).toHaveLength(0);

      a.remove();
      b.remove();
    } finally {
      warn.mockRestore();
    }
  });
});
