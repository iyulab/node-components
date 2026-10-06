import { describe, it, expect, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import '../../src/components/dialog/UDialog.js';
import '../../src/components/drawer/UDrawer.js';
import '../../src/components/field/UField.js';
import '../../src/components/button/UButton.js';
import '../../src/components/progress-bar/UProgressBar.js';
import '../../src/components/progress-ring/UProgressRing.js';
import '../../src/components/spinner/USpinner.js';
import '../../src/components/carousel/UCarousel.js';
import '../../src/components/tree/UTree.js';
import '../../src/components/tree-item/UTreeItem.js';
import { Dialog } from '../../src/utilities/Dialog.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';
import type { UDrawer } from '../../src/components/drawer/UDrawer.js';

/**
 * Host roles and names are found by DOM-based role queries — Playwright's `getByRole`, Testing Library, axe-core.
 *
 * Those tools compute roles from the DOM, and `ElementInternals` defaults are invisible there by design: a dialog,
 * a labelled field group, progress indicators and a carousel region were in Chromium's accessibility tree but a
 * role-based e2e query found none of them. The role-based locator is what consumers write, so the host carries
 * the semantics as attributes. An author's own attribute always wins (NEGATIVE cases below).
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const count = (role: Parameters<typeof page.getByRole>[0], name?: string) =>
  page.getByRole(role, name === undefined ? undefined : { name, exact: true }).elements().length;

afterEach(() => {
  document.querySelectorAll('u-dialog, u-drawer').forEach((d) => (d as UDialog).hide?.());
  document.body.replaceChildren();
});

async function mount(html: string): Promise<void> {
  document.body.innerHTML = html;
  await sleep(150);
}

describe('getByRole finds the host', () => {
  it('u-dialog — dialog named by its header', async () => {
    await mount(`<u-dialog><h2 slot="header">Delete item</h2>Body<button>OK</button></u-dialog>`);
    (document.querySelector('u-dialog') as UDialog).show();
    await sleep(100);
    expect(count('dialog', 'Delete item')).toBe(1);
  });

  it('u-dialog — a text-only header names it too', async () => {
    await mount(`<u-dialog><span slot="header">Rename</span>Body</u-dialog>`);
    (document.querySelector('u-dialog') as UDialog).show();
    await sleep(100);
    expect(count('dialog', 'Rename')).toBe(1);
  });

  it('u-dialog — the name follows the header text', async () => {
    await mount(`<u-dialog><span slot="header">First</span>Body</u-dialog>`);
    const dlg = document.querySelector('u-dialog') as UDialog;
    dlg.show();
    await sleep(100);
    dlg.querySelector('[slot="header"]')!.textContent = 'Later';
    expect(count('dialog', 'Later')).toBe(1);
  });

  it('u-drawer — dialog', async () => {
    await mount(`<u-drawer><span slot="header">Filters</span>Body</u-drawer>`);
    (document.querySelector('u-drawer') as UDrawer).show();
    await sleep(100);
    expect(count('dialog', 'Filters')).toBe(1);
  });

  it('Dialog.confirm — alertdialog', async () => {
    void Dialog.confirm('Unsaved edits are lost.', { title: 'Discard changes?' });
    await sleep(200);
    expect(count('alertdialog', 'Discard changes?')).toBe(1);
  });

  it('u-field with two buttons — named group', async () => {
    await mount(`<u-field label="Theme"><u-button>Light</u-button><u-button>Dark</u-button></u-field>`);
    expect(count('group', 'Theme')).toBe(1);
  });

  it('progress bar · ring · spinner — progressbar', async () => {
    await mount(`
      <u-progress-bar value="40" aria-label="Upload"></u-progress-bar>
      <u-progress-ring value="10"></u-progress-ring>
      <u-spinner>Saving</u-spinner>`);
    expect(count('progressbar')).toBe(3);
    expect(count('progressbar', 'Saving')).toBe(1);
    const bar = document.querySelector('u-progress-bar')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
  });

  it('u-carousel — region', async () => {
    await mount(`<u-carousel aria-label="Featured"><div>One</div><div>Two</div></u-carousel>`);
    expect(count('region', 'Featured')).toBe(1);
  });

  it('u-tree-item — named by its own label, not its children', async () => {
    await mount(`<u-tree><u-tree-item expanded>Root<u-tree-item>Child</u-tree-item></u-tree-item></u-tree>`);
    expect(count('treeitem', 'Root')).toBe(1);
  });
});

describe('the author wins (NEGATIVE)', () => {
  it('an authored role is kept', async () => {
    await mount(`<u-carousel role="group" aria-roledescription="gallery"><div>One</div></u-carousel>`);
    const el = document.querySelector('u-carousel')!;
    expect(el.getAttribute('role')).toBe('group');
    expect(el.getAttribute('aria-roledescription')).toBe('gallery');
  });

  it('an authored aria-label on a dialog is not outranked by our aria-labelledby', async () => {
    await mount(`<u-dialog aria-label="Custom"><span slot="header">Header</span>Body</u-dialog>`);
    const dlg = document.querySelector('u-dialog') as UDialog;
    dlg.show();
    await sleep(100);
    expect(dlg.hasAttribute('aria-labelledby')).toBe(false);
    expect(count('dialog', 'Custom')).toBe(1);
  });

  it('a value the author writes later is not overwritten on the next update', async () => {
    await mount(`<u-progress-bar value="10"></u-progress-bar>`);
    const bar = document.querySelector('u-progress-bar') as HTMLElement & { value: number; updateComplete: Promise<unknown> };
    bar.setAttribute('aria-valuenow', '99');
    bar.value = 20;
    await bar.updateComplete;
    expect(bar.getAttribute('aria-valuenow')).toBe('99');
  });

  it('a field with a single input does not become a group', async () => {
    await mount(`<u-field label="Email"><input></u-field>`);
    expect(document.querySelector('u-field')!.hasAttribute('role')).toBe(false);
  });

  it('a header id the author gave is reused, not replaced', async () => {
    await mount(`<u-dialog><h2 slot="header" id="mine">Title</h2>Body</u-dialog>`);
    const dlg = document.querySelector('u-dialog') as UDialog;
    dlg.show();
    await sleep(100);
    expect(dlg.getAttribute('aria-labelledby')).toBe('mine');
  });
});
