import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/textarea/UTextarea.js';
import '../../src/components/rating/URating.js';
import '../../src/components/radio/URadio.js';
import '../../src/components/slider/USlider.js';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';

/**
 * ISSUE-20260723-uinput-label-a11y: a u-field composite component's label renders in
 * u-field's own separate shadow scope, so it couldn't be connected to the native/role
 * control via label[for]. Because of that shadow boundary, cross-root `aria-labelledby`
 * also isn't delivered reliably in current browsers, so the root fix is for each component
 * to mirror `aria-label` onto its own accessible-name host (the native input/textarea, or
 * role=radiogroup). This test pins, as a regression guard, that `getByLabel`/screen readers
 * can find the control by name.
 */
describe('u-field composite component accessible name', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  async function mount(tag: string, attrs: Record<string, string>): Promise<HTMLElement> {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    return el;
  }

  it('u-input: the label is mirrored onto the native input as aria-label', async () => {
    const el = await mount('u-input', { label: 'Asset Name', description: 'Unique name' });
    const input = el.shadowRoot!.querySelector('input[part="input"]')!;
    expect(input.getAttribute('aria-label')).toBe('Asset Name');
    expect(input.getAttribute('aria-description')).toBe('Unique name');
  });

  it('u-input: with no label given, no aria-label attribute renders (ifDefined)', async () => {
    const el = await mount('u-input', {});
    const input = el.shadowRoot!.querySelector('input[part="input"]')!;
    expect(input.hasAttribute('aria-label')).toBe(false);
  });

  it('u-textarea: the label is mirrored onto the native textarea as aria-label', async () => {
    const el = await mount('u-textarea', { label: 'Notes', description: 'Optional input' });
    const ta = el.shadowRoot!.querySelector('textarea[part="textarea"]')!;
    expect(ta.getAttribute('aria-label')).toBe('Notes');
    expect(ta.getAttribute('aria-description')).toBe('Optional input');
  });

  it('u-rating: the label is mirrored onto role=radiogroup as aria-label', async () => {
    const el = await mount('u-rating', { label: 'Satisfaction' });
    const group = el.shadowRoot!.querySelector('[role="radiogroup"]')!;
    expect(group.getAttribute('aria-label')).toBe('Satisfaction');
  });

  it('u-rating: the symbols (role=radio) expose aria-checked based on the committed value', async () => {
    const el = await mount('u-rating', { label: 'Satisfaction', max: '5', value: '3' });
    const radios = el.shadowRoot!.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(5);
    // only the 3rd (score=3) is checked
    expect(radios[2].getAttribute('aria-checked')).toBe('true');
    expect(radios[0].getAttribute('aria-checked')).toBe('false');
    expect(radios[4].getAttribute('aria-checked')).toBe('false');
  });

  it('u-radio: the container is role=radiogroup and the label is mirrored as aria-label', async () => {
    const el = await mount('u-radio', { label: 'Priority' });
    const group = el.shadowRoot!.querySelector('[role="radiogroup"]')!;
    expect(group).toBeTruthy();
    expect(group.getAttribute('aria-label')).toBe('Priority');
  });

  it('u-slider: the thumb is role=slider and exposes label/value ARIA', async () => {
    const el = await mount('u-slider', { label: 'Volume', min: '0', max: '10', value: '3' });
    const thumb = el.shadowRoot!.querySelector('[role="slider"]')!;
    expect(thumb.getAttribute('aria-label')).toBe('Volume');
    expect(thumb.getAttribute('aria-valuenow')).toBe('3');
    expect(thumb.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb.getAttribute('aria-valuemax')).toBe('10');
    // aria-valuetext is the formatted display string (defaults to the raw value)
    expect(thumb.getAttribute('aria-valuetext')).toBe('3');
  });

  it('u-select: the trigger is role=combobox and exposes name/popup ARIA', async () => {
    const el = await mount('u-select', { label: 'Category' });
    const trigger = el.shadowRoot!.querySelector('[role="combobox"]')!;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-label')).toBe('Category');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    // starts closed
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    // aria-controls points at the actual id of the role=listbox popover
    const listbox = el.shadowRoot!.querySelector('[role="listbox"]')!;
    expect(listbox.id).toBeTruthy();
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);
  });

  it('u-option: role/state ARIA changes with context (radiogroup↔listbox pairing)', async () => {
    const opt = document.createElement('u-option') as HTMLElement & {
      selected: boolean; updateComplete: Promise<unknown>;
    };
    opt.setAttribute('value', 'a');
    document.body.appendChild(opt);
    await opt.updateComplete;

    // default (listbox): role=option + aria-selected
    expect(opt.getAttribute('role')).toBe('option');
    expect(opt.getAttribute('aria-selected')).toBe('false');
    expect(opt.hasAttribute('aria-checked')).toBe(false);

    // marker=radio (radiogroup context): role=radio + aria-checked, the opposite attribute is removed
    opt.setAttribute('marker', 'radio');
    opt.selected = true;
    await opt.updateComplete;
    expect(opt.getAttribute('role')).toBe('radio');
    expect(opt.getAttribute('aria-checked')).toBe('true');
    expect(opt.hasAttribute('aria-selected')).toBe(false);

    opt.remove();
  });
});
