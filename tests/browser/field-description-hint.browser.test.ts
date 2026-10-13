import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/index.js';
import { UField } from '../../src/components/field/UField.js';

/**
 * `description-display="hint"` — the description moves from a line under the control to an info icon beside the label,
 * shown as a tooltip on hover. The control keeps `aria-description` either way, and a validation message is always shown
 * under the control (errors are never hidden behind a hover).
 */

type El = HTMLElement & { updateComplete?: Promise<unknown> };

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    for (const el of Array.from(document.body.querySelectorAll('*')) as El[]) {
      if (el.updateComplete) await el.updateComplete;
    }
    await new Promise((r) => setTimeout(r, 30));
  }
}

const shadow = (sel: string) => (document.querySelector(sel) as HTMLElement).shadowRoot!;
const fieldOf = (sel: string) => shadow(sel).querySelector('u-field') as UField;

describe('u-field description display', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { UField.descriptionDisplay = 'inline'; });

  it('inline (default) renders the description under the control and no hint icon', async () => {
    document.body.innerHTML = '<u-input label="Email" description="Used for receipts"></u-input>';
    await settle();
    const root = fieldOf('u-input').shadowRoot!;
    expect(root.querySelector('.footer')?.textContent).toContain('Used for receipts');
    expect(root.querySelector('.hint')).toBeNull();
  });

  it('hint moves the description into a tooltip beside the label and frees the line under the control', async () => {
    document.body.innerHTML = '<u-field label="Email" description="Used for receipts" description-display="hint"><input></u-field>';
    await settle();
    const root = shadow('u-field');
    expect(root.querySelector('.footer')).toBeNull();
    const hint = root.querySelector('.header .hint') as HTMLElement;
    expect(hint).not.toBeNull();
    expect(hint.querySelector('u-icon')).not.toBeNull();
    expect(hint.querySelector('u-tooltip')?.textContent).toContain('Used for receipts');
    // Assistive technology still gets it from the control.
    expect(document.querySelector('input')!.getAttribute('aria-description')).toBe('Used for receipts');
  });

  it('the app-wide default reaches fields that controls render inside their own shadow roots', async () => {
    UField.descriptionDisplay = 'hint';
    document.body.innerHTML = '<u-input label="Email" description="Used for receipts"></u-input>';
    await settle();
    const root = fieldOf('u-input').shadowRoot!;
    expect(root.querySelector('.footer')).toBeNull();
    expect(root.querySelector('.hint u-tooltip')?.textContent).toContain('Used for receipts');
  });

  it('an explicit inline on one field wins over the app-wide hint default', async () => {
    UField.descriptionDisplay = 'hint';
    document.body.innerHTML = '<u-field label="Email" description="Used for receipts" description-display="inline"><input></u-field>';
    await settle();
    expect(shadow('u-field').querySelector('.footer')?.textContent).toContain('Used for receipts');
    expect(shadow('u-field').querySelector('.hint')).toBeNull();
  });

  it('a validation message is still shown under the control in hint mode', async () => {
    document.body.innerHTML = '<u-field label="Email" description="Used for receipts" description-display="hint" invalid validation-message="Required"><input></u-field>';
    await settle();
    expect(shadow('u-field').querySelector('.footer')?.textContent).toContain('Required');
  });

  it('without a label there is nowhere to put the icon, so the description stays inline', async () => {
    document.body.innerHTML = '<u-field description="Used for receipts" description-display="hint"><input></u-field>';
    await settle();
    expect(shadow('u-field').querySelector('.footer')?.textContent).toContain('Used for receipts');
    expect(shadow('u-field').querySelector('.hint')).toBeNull();
  });

  it('the hint sits right after the label, not pushed to the far edge', async () => {
    document.body.innerHTML = '<div style="width:400px"><u-field label="Email" description="Used for receipts" description-display="hint"><input></u-field></div>';
    await settle();
    const root = shadow('u-field');
    const label = root.querySelector('.label')!.getBoundingClientRect();
    const hint = root.querySelector('.hint')!.getBoundingClientRect();
    expect(hint.left - label.right).toBeLessThan(16);
  });
});

/**
 * Reaching the hint without a mouse. The icon is not focusable (a Tab stop per field would double the Tabs through a
 * form of dozens of fields), so a sighted keyboard user and a touch user each need their own way to the text that a
 * mouse user gets on hover: entering the field's control with the keyboard shows it, and tapping the icon pins it.
 */
describe('u-field description hint — keyboard and touch', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  const tooltip = () => shadow('u-field').querySelector('.hint u-tooltip') as HTMLElement & { open: boolean };
  const icon = () => shadow('u-field').querySelector('.hint') as HTMLElement;
  const mount = async () => {
    document.body.innerHTML = `
      <button id="before">before</button>
      <u-field label="Email" description="Used for receipts" description-display="hint"><input id="email"></u-field>
      <button id="after">after</button>`;
    await settle();
  };
  const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));
  const tap = (el: Element, target: Element = el) => {
    for (const type of ['pointerdown', 'pointerup', 'pointerout', 'pointerleave']) {
      target.dispatchEvent(new PointerEvent(type, { bubbles: type !== 'pointerleave', composed: true, pointerType: 'touch' }));
    }
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
  };

  it('Tab into the control shows the hint; Tab out hides it', async () => {
    await mount();
    (document.getElementById('before') as HTMLElement).focus();
    await userEvent.keyboard('{Tab}');
    await wait();
    expect(document.activeElement?.id).toBe('email');
    expect(tooltip().open).toBe(true);
    await userEvent.keyboard('{Tab}');
    await wait();
    expect(tooltip().open).toBe(false);
  });

  it('Escape hides the hint the keyboard opened, focus staying in the control', async () => {
    await mount();
    (document.getElementById('before') as HTMLElement).focus();
    await userEvent.keyboard('{Tab}');
    await wait();
    expect(tooltip().open).toBe(true);
    await userEvent.keyboard('{Escape}');
    await wait();
    expect(tooltip().open).toBe(false);
    expect(document.activeElement?.id).toBe('email');
  });

  it('NEGATIVE clicking into the control does not show the hint — the mouse has hover', async () => {
    await mount();
    await userEvent.click(document.getElementById('email')!);
    await wait();
    expect(tooltip().open).toBe(false);
  });

  it('a tap on the icon pins the hint open; a tap elsewhere closes it', async () => {
    await mount();
    tap(icon());
    await wait();
    expect(tooltip().open).toBe(true);
    // A tap outside: the pointerdown lands on another element.
    document.getElementById('after')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, pointerType: 'touch' }));
    await wait();
    expect(tooltip().open).toBe(false);
  });

  it('a second tap on the icon closes it', async () => {
    await mount();
    tap(icon());
    await wait();
    expect(tooltip().open).toBe(true);
    tap(icon());
    await wait();
    expect(tooltip().open).toBe(false);
  });
});
