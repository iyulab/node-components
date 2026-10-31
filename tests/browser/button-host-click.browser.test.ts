import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/button/UButton.js';
import type { UButton } from '../../src/components/button/UButton.js';

/**
 * `u-button` hears clicks on its shadow root, not on its host — a click listener on the host had screen readers
 * read every button as «clickable, button». The host is presentational (`role="none"`) so an author's own listener
 * on it stays quiet too. A click that starts on the host (`button.click()`) does not pass the shadow root, so
 * `click()` carries the same rules.
 */
const mount = async (html: string) => {
  document.body.innerHTML = html;
  for (const el of document.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>('*')) await el.updateComplete;
};

describe('u-button — clicks heard off the host', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('the host is presentational; an author role wins', async () => {
    await mount('<u-button id="a">A</u-button><u-button id="b" role="tab">B</u-button>');
    expect(document.getElementById('a')!.getAttribute('role')).toBe('none');
    expect(document.getElementById('b')!.getAttribute('role')).toBe('tab');
  });

  it('a real press on a submit button submits its form', async () => {
    await mount('<form><u-button type="submit">Send</u-button></form>');
    let submits = 0;
    document.querySelector('form')!.addEventListener('submit', (e) => { e.preventDefault(); submits++; });
    await userEvent.click(document.querySelector('u-button')!);
    expect(submits).toBe(1);
  });

  it('click() on the host submits too', async () => {
    await mount('<form><u-button type="submit">Send</u-button></form>');
    let submits = 0;
    document.querySelector('form')!.addEventListener('submit', (e) => { e.preventDefault(); submits++; });
    (document.querySelector('u-button') as UButton).click();
    expect(submits).toBe(1);
  });

  it('disabled: neither a press nor click() reaches an author listener or submits', async () => {
    await mount('<form><u-button type="submit" disabled>Send</u-button></form>');
    const button = document.querySelector('u-button') as UButton;
    let clicks = 0;
    let submits = 0;
    button.addEventListener('click', () => clicks++);
    document.querySelector('form')!.addEventListener('submit', (e) => { e.preventDefault(); submits++; });
    button.click();
    await userEvent.click(button, { force: true });
    expect(clicks).toBe(0);
    expect(submits).toBe(0);
  });

  it('NEGATIVE — an enabled button still reaches an author listener once per press', async () => {
    await mount('<u-button>Go</u-button>');
    const button = document.querySelector('u-button')!;
    let clicks = 0;
    button.addEventListener('click', () => clicks++);
    await userEvent.click(button);
    (button as UButton).click();
    expect(clicks).toBe(2);
  });
});
