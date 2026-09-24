import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/chip/UChip.js';
import type { UChip } from '../../src/components/chip/UChip.js';

afterEach(() => { document.body.innerHTML = ''; });

/**
 * `selectable` 칩은 토글 버튼이다(WAI-ARIA APG «Button» — `aria-pressed`). 종전에는 클릭 핸들러만 있고
 * 역할·포커스·키가 없어 키보드 사용자는 닿지 못했고(WCAG 2.1.1) 보조기기는 그것이 토글인지 몰랐다(4.1.2).
 */
async function mount(html: string): Promise<UChip> {
  document.body.innerHTML = `<input id="before" />${html}`;
  const chip = document.querySelector('u-chip') as UChip;
  await chip.updateComplete;
  return chip;
}

describe('UChip — selectable is a keyboard-operable toggle button', () => {
  it('is reachable with Tab and exposes a toggle-button role and its pressed state', async () => {
    const chip = await mount('<u-chip selectable value="a">Open</u-chip>');
    (document.getElementById('before') as HTMLElement).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(chip);
    expect(chip.getAttribute('role')).toBe('button');
    expect(chip.getAttribute('aria-pressed')).toBe('false');
    // 포커스가 보인다 — UElement 의 `:host(:focus-visible)` 링을 상속한다(WCAG 2.4.7).
    expect(getComputedStyle(chip).outlineStyle).toBe('solid');
  });

  it('Space and Enter toggle it and fire pick, like a click', async () => {
    const chip = await mount('<u-chip selectable value="a">Open</u-chip>');
    const picks: boolean[] = [];
    chip.addEventListener('pick', (e) => picks.push((e as CustomEvent).detail.selected));
    chip.focus();
    await userEvent.keyboard(' ');
    await chip.updateComplete;
    expect(chip.selected).toBe(true);
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    await userEvent.keyboard('{Enter}');
    await chip.updateComplete;
    expect(chip.selected).toBe(false);
    expect(picks).toEqual([true, false]);
  });

  it('NEGATIVE — a chip that is not selectable is not a stop in the tab order and has no role', async () => {
    const chip = await mount('<u-chip value="a">Status</u-chip>');
    expect(chip.hasAttribute('tabindex')).toBe(false);
    expect(chip.hasAttribute('role')).toBe(false);
  });

  it('turning selectable off takes it back out of the tab order', async () => {
    const chip = await mount('<u-chip selectable value="a">Open</u-chip>');
    chip.selectable = false;
    await chip.updateComplete;
    expect(chip.hasAttribute('tabindex')).toBe(false);
    expect(chip.hasAttribute('role')).toBe(false);
    expect(chip.hasAttribute('aria-pressed')).toBe(false);
  });

  it('keeps a tabindex the consumer set', async () => {
    const chip = await mount('<u-chip selectable tabindex="-1" value="a">Open</u-chip>');
    expect(chip.getAttribute('tabindex')).toBe('-1');
  });
});
