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

describe('u-field hint — who moved the focus, and per-control display', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { UField.descriptionDisplay = 'inline'; });
  const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));
  const hintTooltipOf = (control: Element) =>
    (control.shadowRoot!.querySelector('u-field') as UField).shadowRoot!.querySelector('.hint u-tooltip') as HTMLElement & { open: boolean };

  it('a drawer that focuses its first field on open does not open that field’s hint', async () => {
    UField.descriptionDisplay = 'hint';
    document.body.innerHTML = `
      <button id="opener">Open</button>
      <u-drawer placement="right">
        <u-select id="kind" label="Kind" description="Choose the kind first"></u-select>
        <u-input label="Name"></u-input>
      </u-drawer>`;
    await settle();
    const drawer = document.querySelector('u-drawer') as HTMLElement & { show(): boolean };
    const opener = document.getElementById('opener')!;
    opener.addEventListener('click', () => drawer.show());
    await userEvent.click(opener);
    await wait(400);
    const select = document.getElementById('kind')!;
    expect(select.matches(':focus-within') || select === document.activeElement).toBe(true);
    expect(hintTooltipOf(select).open).toBe(false);
  });

  it('Enter on the opener is not Tab either', async () => {
    UField.descriptionDisplay = 'hint';
    document.body.innerHTML = `
      <button id="opener">Open</button>
      <u-drawer placement="right"><u-select id="kind" label="Kind" description="Choose the kind first"></u-select></u-drawer>`;
    await settle();
    const drawer = document.querySelector('u-drawer') as HTMLElement & { show(): boolean };
    const opener = document.getElementById('opener')!;
    opener.addEventListener('click', () => drawer.show());
    opener.focus();
    await userEvent.keyboard('{Enter}');
    await wait(400);
    expect(hintTooltipOf(document.getElementById('kind')!).open).toBe(false);
  });

  it('programmatic focus() does not open the hint; Tab still does', async () => {
    document.body.innerHTML = `
      <button id="before">before</button>
      <u-input id="name" label="Name" description="As on the ID card" description-display="hint"></u-input>`;
    await settle();
    const input = document.getElementById('name') as HTMLElement;
    input.focus();
    await wait();
    expect(hintTooltipOf(input).open).toBe(false);
    (document.getElementById('before') as HTMLElement).focus();
    await userEvent.keyboard('{Tab}');
    await wait();
    expect(hintTooltipOf(input).open).toBe(true);
  });

  it('the open hint lets a click through to the control under it', async () => {
    document.body.innerHTML = `<u-input id="name" label="Name" description="As on the ID card" description-display="hint"></u-input>`;
    await settle();
    expect(getComputedStyle(hintTooltipOf(document.getElementById('name')!)).pointerEvents).toBe('none');
  });

  it('a control takes description-display per field — hint on one, inline beside it under the global default', async () => {
    document.body.innerHTML = `
      <u-input id="a" label="A" description="help" description-display="hint"></u-input>
      <u-select id="b" label="B" description="help"></u-select>`;
    await settle();
    const fieldA = document.getElementById('a')!.shadowRoot!.querySelector('u-field') as UField;
    const fieldB = document.getElementById('b')!.shadowRoot!.querySelector('u-field') as UField;
    expect(fieldA.shadowRoot!.querySelector('.hint')).not.toBeNull();
    expect(fieldA.shadowRoot!.querySelector('[part="footer"]')).toBeNull();
    expect(fieldB.shadowRoot!.querySelector('.hint')).toBeNull();
    expect(fieldB.shadowRoot!.querySelector('[part="footer"]')?.textContent?.trim()).toBe('help');
  });

  it('inline on one control wins over the app-wide hint — a status note stays visible', async () => {
    UField.descriptionDisplay = 'hint';
    document.body.innerHTML = `
      <u-textarea id="note" label="Note" description="Locked: the order type cannot change" description-display="inline"></u-textarea>
      <u-input id="other" label="Other" description="help"></u-input>`;
    await settle();
    const note = document.getElementById('note')!.shadowRoot!.querySelector('u-field') as UField;
    const other = document.getElementById('other')!.shadowRoot!.querySelector('u-field') as UField;
    expect(note.shadowRoot!.querySelector('[part="footer"]')?.textContent?.trim()).toBe('Locked: the order type cannot change');
    expect(other.shadowRoot!.querySelector('.hint')).not.toBeNull();
  });
});
