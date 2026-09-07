import { describe, it, expect } from 'vitest';
import { Locale } from '../../src/utilities/Locale.js';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';

/**
 * The document that hosts these tests declares `<html lang="en">` (tests/index.html),
 * while this machine's browser reports a non-English `navigator.language`. That is
 * exactly the configuration where the two sources disagree, so it is the one that
 * proves which of them the library actually honours — a jsdom stub cannot, because
 * there `navigator.language` is whatever the stub says it is.
 *
 * Before the reordering, an `<html lang="en">` document emitted accessible names in
 * the browser's language: a screen reader announced them with English pronunciation
 * rules (WCAG 3.1.1 Language of Page / 3.1.2 Language of Parts).
 *
 * ⚠This file must not call `Locale.set()` before the assertions — the value under
 * test is the one `detectLocale()` produced at module load.
 */
describe('locale detection in a real browser', () => {
  it('honours <html lang> over the browser language', () => {
    expect(document.documentElement.lang).toBe('en');
    // Guard the premise: with both sources equal the assertion below would pass
    // for the wrong reason.
    expect(navigator.language).toBeTruthy();
    expect(Locale.get()).toBe('en');
  });

  it('gives an icon-only password toggle an accessible name in the document language', async () => {
    const el = document.createElement('u-input') as UInput;
    el.setAttribute('type', 'password');
    el.setAttribute('toggle-password', '');
    document.body.appendChild(el);
    await el.updateComplete;

    const toggle = el.shadowRoot?.querySelector('[aria-label]');
    expect(toggle).toBeTruthy();
    expect(toggle?.getAttribute('aria-label')).toBe('Show password');

    el.remove();
  });
});
