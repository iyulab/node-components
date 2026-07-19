import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Dialog } from '../../src/utilities/Dialog.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';

/**
 * Regression for the `no-async-promise-executor` defect surfaced when eslint was
 * first made to actually run on this package (Cycle 92).
 *
 * `Dialog.show()` used `new Promise(async (resolve) => {...})`. Two consequences:
 *
 *  1. If `await dialog.updateComplete` rejected, the async executor swallowed the
 *     error and the `hide` listener was never registered — `await Dialog.show(...)`
 *     hung forever with no way for the caller to recover.
 *  2. The listener was registered *after* the await, so a `hide` fired during that
 *     microtask gap was lost (same hang).
 *
 * The fix registers the listener before awaiting and resolves `null` on failure,
 * consistent with the documented "closed = null" contract.
 */
describe('Dialog.show() resolution contract', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const currentDialog = () => document.body.querySelector('u-dialog') as UDialog;

  it('resolves with the clicked action value', async () => {
    const pending = Dialog.show({
      content: 'pick one',
      actions: [{ label: 'OK', value: 'confirm' }],
    });

    await vi.waitFor(() => expect(currentDialog()).toBeTruthy());
    const dialog = currentDialog();
    await dialog.updateComplete;

    const button = dialog.querySelector('u-button') as HTMLElement;
    button.click();

    await expect(pending).resolves.toBe('confirm');
  });

  it('resolves null when the dialog is dismissed without an action', async () => {
    const pending = Dialog.show({ content: 'no actions' });

    await vi.waitFor(() => expect(currentDialog()).toBeTruthy());
    const dialog = currentDialog();
    await dialog.updateComplete;
    dialog.hide();

    await expect(pending).resolves.toBeNull();
  });

  it('resolves null (instead of hanging) when updateComplete rejects', async () => {
    // Force the failure mode the async executor used to swallow.
    const boom = new Error('update failed');
    const proto = Object.getPrototypeOf(document.createElement('u-dialog'));
    const spy = vi
      .spyOn(proto, 'updateComplete', 'get')
      .mockReturnValue(Promise.reject(boom));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      // The assertion that matters is that this settles at all.
      await expect(Dialog.show({ content: 'will fail' })).resolves.toBeNull();
      expect(consoleError).toHaveBeenCalled();
      // The orphaned element must not be left behind in the DOM.
      expect(document.body.querySelector('u-dialog')).toBeNull();
    } finally {
      spy.mockRestore();
      consoleError.mockRestore();
    }
  });
});
