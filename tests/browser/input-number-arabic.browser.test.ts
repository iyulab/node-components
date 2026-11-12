import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * A person on an Arabic or Persian keyboard types the digits and the separators of their own script (`١٢٫٥`, `۱۲٫۵`).
 * `u-input type="number"` writes the locale's decimal separator on blur (`-1٫5` on an `ar-EG` page) and reads what is typed
 * with the same rules — but it did not know `٫` or the digits, so the field it had just written read as «not a number»: `value`
 * went empty and the field showed its invalid state. The `value` contract is unchanged: a dot-decimal string.
 */
async function mount(value = ''): Promise<UInput> {
  document.body.innerHTML = `<div dir="rtl"><u-input type="number" step="any" ${value ? `value="${value}"` : ''}></u-input></div>`;
  const el = document.querySelector('u-input') as UInput;
  await el.updateComplete;
  return el;
}
const inner = (el: UInput) => el.shadowRoot!.querySelector('input') as HTMLInputElement;
async function typeInto(el: UInput, text: string) {
  inner(el).focus();
  await userEvent.type(inner(el), text);
  await el.updateComplete;
}

describe('u-input type="number" — Arabic and Persian digits', () => {
  beforeEach(() => Locale.set('ar-EG'));
  afterEach(() => { Locale.set('en'); document.body.innerHTML = ''; });

  it('Arabic-Indic digits and the Arabic decimal separator are read: ١٢٫٥ → value "12.5"', async () => {
    const el = await mount();
    await typeInto(el, '١٢٫٥');
    expect(el.value).toBe('12.5');
    expect(el.valueAsNumber).toBe(12.5);
    expect(el.validate()).toBe(true);
  });

  it('a negative number typed with Arabic digits keeps its sign', async () => {
    const el = await mount();
    await typeInto(el, '-١٢٫٥');
    expect(el.value).toBe('-12.5');
  });

  it('what the field wrote on blur is read back (the separator round trip)', async () => {
    const el = await mount('1.5');
    inner(el).focus();
    inner(el).blur();
    await el.updateComplete;
    // the field shows the locale's separator; focusing and leaving again must not lose the value
    inner(el).focus();
    inner(el).blur();
    await el.updateComplete;
    expect(el.value).toBe('1.5');
  });

  it('Persian digits are read the same way', async () => {
    Locale.set('fa');
    const el = await mount();
    await typeInto(el, '۱۲٫۵');
    expect(el.value).toBe('12.5');
  });

  it('NEGATIVE: text that is not a number still reads as empty', async () => {
    const el = await mount();
    await typeInto(el, '١٢abc');
    expect(el.value).toBe('');
  });
});
