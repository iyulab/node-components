import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/menu/UMenu.js';
import '../../src/components/menu-item/UMenuItem.js';
import type { UMenuItem } from '../../src/components/menu-item/UMenuItem.js';
import { axTree } from './ax.js';

/**
 * 하위 메뉴를 가진 `u-menu-item` 의 이름은 자기 라벨뿐이다. 역할이 호스트에 있고 하위 항목은 그 자식이라, 내용에서 짓는
 * 이름이 하위 항목의 글자까지 모아 «Theme Light Dark System» 으로 읽혔다(소비자 실측 · Playwright `getByRole('menuitem',
 * { name: 'Theme' })` 가 부모를 못 찾음). 하위 메뉴가 있음과 열림도 알린다(WAI-ARIA 메뉴 패턴).
 */
const mount = async (html: string) => {
  document.body.innerHTML = html;
  for (const el of document.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>('*')) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 50));
};
const nodes = async () => (await axTree()).filter((n) => !n.ignored);
const named = async (role: string) => (await nodes()).filter((n) => n.role?.value === role).map((n) => n.name?.value);

const NESTED = (inline: boolean) => `
  <u-menu ${inline ? 'inline' : ''}>
    <u-menu-item value="theme">Theme
      <u-menu-item value="light">Light</u-menu-item>
      <u-menu-item value="dark">Dark</u-menu-item>
    </u-menu-item>
    <u-menu-item value="about">About</u-menu-item>
  </u-menu>`;

describe('u-menu-item — a submenu parent is named by its own label', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  for (const inline of [false, true]) {
    it(`🔴${inline ? 'inline' : 'popover'}: parent name is the label only, with haspopup · expanded`, async () => {
      await mount(NESTED(inline));
      const parent = document.querySelector<UMenuItem>('u-menu-item[value="theme"]')!;
      expect(await named('menuitem')).toContain('Theme');
      expect(await named('menuitem')).not.toContain('Theme Light Dark');
      expect(parent.getAttribute('aria-haspopup')).toBe('menu');
      expect(parent.getAttribute('aria-expanded')).toBe('false');
      parent.expanded = true;
      await parent.updateComplete;
      expect(parent.getAttribute('aria-expanded')).toBe('true');
      // 하위 항목은 메뉴 안에 있다 — 하위 묶음이 menu 역할
      const menus = (await nodes()).filter((n) => n.role?.value === 'menu');
      expect(menus.length).toBeGreaterThanOrEqual(2);
    });
  }

  it('🔴a label change follows', async () => {
    await mount(NESTED(false));
    const parent = document.querySelector<UMenuItem>('u-menu-item[value="theme"]')!;
    parent.firstChild!.textContent = 'Appearance';
    await new Promise((r) => setTimeout(r, 30));
    expect(parent.getAttribute('aria-label')).toBe('Appearance');
  });

  it('NEGATIVE — a leaf item keeps its content name and gets no popup state', async () => {
    await mount(NESTED(false));
    const leaf = document.querySelector<UMenuItem>('u-menu-item[value="about"]')!;
    expect(await named('menuitem')).toContain('About');
    expect(leaf.hasAttribute('aria-label')).toBe(false);
    expect(leaf.hasAttribute('aria-haspopup')).toBe(false);
    expect(leaf.hasAttribute('aria-expanded')).toBe(false);
  });

  it('NEGATIVE — an author aria-label wins', async () => {
    await mount(`<u-menu><u-menu-item value="t" aria-label="Colour theme">Theme<u-menu-item>Light</u-menu-item></u-menu-item></u-menu>`);
    expect(document.querySelector('u-menu-item[value="t"]')!.getAttribute('aria-label')).toBe('Colour theme');
    expect(await named('menuitem')).toContain('Colour theme');
  });
});
