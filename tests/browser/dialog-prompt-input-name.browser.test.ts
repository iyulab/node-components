import { describe, it, expect, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import '../../src/components/dialog/UDialog.js';
import { Dialog } from '../../src/utilities/Dialog.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';

/**
 * `Dialog.prompt`'s input is named by the question — a placeholder is not a name (it disappears as you type).
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
afterEach(() => {
  document.querySelectorAll('u-dialog').forEach((d) => (d as UDialog).hide?.());
  document.body.replaceChildren();
});

describe('Dialog.prompt input name', () => {
  it('the text box is named by the message', async () => {
    void Dialog.prompt('New file name?', { placeholder: 'name.txt' });
    await sleep(250);
    expect(page.getByRole('textbox', { name: 'New file name?', exact: true }).elements().length).toBe(1);
  });
});
