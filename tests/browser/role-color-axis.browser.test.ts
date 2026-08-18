import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/button/UButton.js';
import '../../src/components/tag/UTag.js';
import '../../src/components/badge/UBadge.js';
import '../../src/components/checkbox/UCheckbox.js';

/**
 * The `color` attribute's **role axis** (`primary`·`info`·`success`·`warning`·`danger`).
 *
 * It guards two properties that are the exact opposite of the decoration axis:
 *   ⑴ **it follows rebranding** — when a consumer overrides a role token, the color moves with it.
 *   ⑵ **it inherits a contrast pairing** — a surface and the text on it arrive as a pair.
 *
 * ★⑵ is why this axis exists. Interpreting a role value as a decoration-lamp shade
 * (shade-600) would fail AA for white text on 6 of 8 colors in light mode
 * (green 3.30 · orange 2.37 · cyan 2.74) — trading readability for a *semantic name*.
 * `warning` is the litmus test — white text on a yellow surface isn't readable at any step,
 * so the foreground must arrive **together** with it.
 *
 * That the decoration axis stayed unchanged is proven not by this file but by
 * `tag-color-matrix` and `checkbox-color-matrix` (rendered colors captured before the refactor).
 */

const ROLES = ['primary', 'info', 'success', 'warning', 'danger'] as const;

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

async function mount(tag: string, attrs: Record<string, string>) {
  const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** Normalizes to `rgb(a, b, c)` — tokens are hex and computed values are rgb, so they don't compare directly. */
function normalize(color: string): string {
  const probe = document.createElement('div');
  probe.style.color = color;
  document.body.appendChild(probe);
  const out = getComputedStyle(probe).color;
  probe.remove();
  return out;
}

describe('color role axis', () => {
  beforeAll(() => {
    expect(token('--u-danger-color'), 'this test assumes the token sheet is loaded').not.toBe('');
  });
  afterEach(() => {
    document.body.replaceChildren();
    document.documentElement.style.removeProperty('--u-danger-color');
  });

  it('u-button solid — the surface gets -color, and the text on it gets -txt-color', async () => {
    const wrong: string[] = [];
    for (const role of ROLES) {
      const el = await mount('u-button', { variant: 'solid', color: role });
      const s = getComputedStyle(el);
      const bg = normalize(token(`--u-${role}-color`));
      const fg = normalize(token(`--u-${role}-txt-color`));
      if (s.backgroundColor !== bg) wrong.push(`${role} surface: ${s.backgroundColor} ≠ ${bg}`);
      if (s.color !== fg) wrong.push(`${role} text: ${s.color} ≠ ${fg}`);
    }
    expect(wrong).toEqual([]);
  });

  it('★warning solid text is not white — the reason this axis exists', async () => {
    // On the decoration axis, text on a surface is always fixed white regardless of color.
    // If the role axis had inherited that, it'd be white text on a yellow surface — unreadable.
    // This assertion guards against that regression.
    const el = await mount('u-button', { variant: 'solid', color: 'warning' });
    const fg = getComputedStyle(el).color;
    expect(fg).not.toBe('rgb(255, 255, 255)');
    expect(fg).toBe(normalize(token('--u-warning-txt-color')));
  });

  it('u-button link — text on the background gets -strong, not the surface step', async () => {
    // In dark mode, using the surface step (-color) as text-on-background fails at 3.07 (Cycle 141).
    // This pins with computed values that the two spots do not share a slot.
    const wrong: string[] = [];
    for (const role of ROLES) {
      const el = await mount('u-button', { variant: 'link', color: role });
      const fg = getComputedStyle(el).color;
      const strong = normalize(token(`--u-${role}-color-strong`));
      const surface = normalize(token(`--u-${role}-color`));
      if (fg !== strong) wrong.push(`${role}: ${fg} ≠ -strong ${strong}`);
      if (fg === surface && strong !== surface) wrong.push(`${role}: using the surface step as text`);
    }
    expect(wrong).toEqual([]);
  });

  it('u-tag solid / u-badge — surface and foreground arrive as a pair', async () => {
    const wrong: string[] = [];
    for (const role of ROLES) {
      const tag = await mount('u-tag', { variant: 'solid', color: role });
      const ts = getComputedStyle(tag);
      if (ts.backgroundColor !== normalize(token(`--u-${role}-color`)))
        wrong.push(`u-tag ${role} surface`);
      if (ts.color !== normalize(token(`--u-${role}-txt-color`)))
        wrong.push(`u-tag ${role} text`);

      const badge = await mount('u-badge', { color: role });
      const bs = getComputedStyle(badge);
      if (bs.backgroundColor !== normalize(token(`--u-${role}-color`)))
        wrong.push(`u-badge ${role} surface`);
      if (bs.color !== normalize(token(`--u-${role}-txt-color`)))
        wrong.push(`u-badge ${role} text`);
    }
    expect(wrong).toEqual([]);
  });

  it('★follows rebranding — overriding a role token moves the color with it', async () => {
    // Where it diverges from the decoration axis. `color="red"` must be immune to this
    // override, and `color="danger"` must follow it.
    document.documentElement.style.setProperty('--u-danger-color', 'rgb(1, 2, 3)');

    const role = await mount('u-button', { variant: 'solid', color: 'danger' });
    const decorative = await mount('u-button', { variant: 'solid', color: 'red' });

    expect(getComputedStyle(role).backgroundColor, 'the role value did not follow the brand')
      .toBe('rgb(1, 2, 3)');
    expect(getComputedStyle(decorative).backgroundColor, 'the decoration value got contaminated by the brand')
      .not.toBe('rgb(1, 2, 3)');
  });

  it('u-checkbox — the same checkmark gets a different step on a surface (filled) vs. on the background (outline)', async () => {
    const wrong: string[] = [];
    for (const role of ROLES) {
      const filled = await mount('u-checkbox', { variant: 'filled', color: role, checked: '' });
      const outline = await mount('u-checkbox', { variant: 'outline', color: role, checked: '' });
      const box = (el: HTMLElement) =>
        getComputedStyle(el.shadowRoot!.querySelector('.checkbox') as Element);

      if (box(filled).color !== normalize(token(`--u-${role}-txt-color`)))
        wrong.push(`${role} filled checkmark is not on-color`);
      if (box(outline).color !== normalize(token(`--u-${role}-color-strong`)))
        wrong.push(`${role} outline checkmark is not -strong`);
    }
    expect(wrong).toEqual([]);
  });
});
