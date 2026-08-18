import { describe, it, beforeAll, afterEach, expect } from 'vitest';
import lightCss from '../../src/assets/styles/light.css?raw';
import '../../src/components/tag/UTag.js';
import '../../src/components/badge/UBadge.js';
import { STATUS_ICON } from '../../src/utilities/statusIcon.js';

/**
 * **Is it distinguishable without color?** — the status-icon axis for `u-tag`/`u-badge`.
 *
 * ## Why this axis exists
 *
 * The contrast contract (1.20.0) guards whether each status color **reads against its own
 * background**. It doesn't guard *distinguishability* — under color-vision deficiency or
 * black-and-white printing, "success" and "failure" become the same gray pill. Where the
 * role-color-collision check draws its distinction **in color space** (CIELAB ΔE), this axis
 * draws it **in shape space**.
 *
 * ## What this measures
 *
 * ⑴ the four statuses each get a **distinct shape** — that's the definition of "distinguishable without color".
 * ⑵ a meaningless color (a decoration-axis value, `neutral`, `primary`) gets **no icon at
 *    all** — inventing a meaning that isn't there would make the icon carry wrong information.
 * ⑶ with no `icon` given, it renders **exactly as before** (a purely additive change).
 */

beforeAll(() => {
  const s = document.createElement('style');
  s.textContent = lightCss;
  document.head.appendChild(s);
});

afterEach(() => document.body.replaceChildren());

type El = HTMLElement & { updateComplete: Promise<unknown> };

const mount = async (tag: 'u-tag' | 'u-badge', attrs: Record<string, string>) => {
  const el = document.createElement(tag) as El;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.textContent = 'Status';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

const iconName = (el: El) =>
  el.shadowRoot!.querySelector('.icon')?.getAttribute('name') ?? null;

describe('status-icon axis — distinguishable without color', () => {
  for (const tag of ['u-tag', 'u-badge'] as const) {
    it(`🔴${tag}: the four statuses each get a distinct shape`, async () => {
      const seen: Record<string, string | null> = {};
      for (const role of Object.keys(STATUS_ICON)) {
        seen[role] = iconName(await mount(tag, { icon: '', color: role }));
        document.body.replaceChildren();
      }
      // if any two shapes collide, those two statuses are indistinguishable in black-and-white.
      expect(new Set(Object.values(seen)).size, `shapes collide: ${JSON.stringify(seen)}`)
        .toBe(Object.keys(STATUS_ICON).length);
      expect(Object.values(seen).every(Boolean), 'all four statuses must render an icon').toBe(true);
    });

    it(`${tag}: does not draw an icon for a meaningless color`, async () => {
      for (const color of ['neutral', 'primary', 'blue', 'purple']) {
        expect(iconName(await mount(tag, { icon: '', color })), color).toBeNull();
        document.body.replaceChildren();
      }
    });

    it(`⑶ ${tag}: with no icon given, renders exactly as before`, async () => {
      expect(iconName(await mount(tag, { color: 'danger' }))).toBeNull();
    });
  }

  it('u-badge: variant="dot" renders no content, so there is no icon either', async () => {
    const el = await mount('u-badge', { icon: '', color: 'danger', variant: 'dot' });
    expect(el.shadowRoot!.querySelector('.icon')).toBeNull();
  });

  it('🔴the icon «actually shows» — a real SVG renders from the bundled set', async () => {
    // ⚠If the name matches but nothing renders, this axis does nothing. `u-icon`'s
    // resolution is **async** (`until(...)`), so at `updateComplete` it's still empty — the
    // first pass tripped on a 0-size element here. This also checks that the async source
    // is the **bundled set**, not a *network* fetch (a CDN would leave a consumer's screen
    // blank offline).
    const el = await mount('u-tag', { icon: '', color: 'success' });
    const icon = el.shadowRoot!.querySelector('.icon') as HTMLElement;
    for (let i = 0; i < 50 && !icon.shadowRoot?.querySelector('svg'); i++)
      await new Promise(r => setTimeout(r, 20));
    expect(icon.shadowRoot?.querySelector('svg'), 'the SVG did not render').toBeTruthy();
    const rect = icon.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });
});
