import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/field/UField.js';
import '../../src/components/button/UButton.js';
import '../../src/components/input/UInput.js';
import { axTree } from './ax.js';

/**
 * `u-field` 의 라벨이 버튼 묶음이나 글자로 이름을 갖는 컨트롤을 감쌀 때는 **묶음의 이름**이다(role=group) — 컨트롤의 이름을
 * 덮지 않는다. 종전에는 언제나 첫 컨트롤에 얹어, «테마» 아래의 «밝은 모드 · 어두운 모드» 중 첫 버튼이 «테마» 로 읽혔다
 * (보이는 글자와 이름이 어긋남 — WCAG 2.5.3 Label in Name · 레퍼런스 앱 설정 화면 실기에서 발견).
 */
const mount = async (html: string) => {
  document.body.innerHTML = html;
  for (const el of document.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>('*')) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 50));
};
const nodes = async () => (await axTree()).filter((n) => !n.ignored);
const named = async (role: string) => (await nodes()).filter((n) => n.role?.value === role).map((n) => n.name?.value);

describe('u-field — 묶음 라벨', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('버튼 둘: 라벨은 group 의 이름, 버튼은 자기 글자', async () => {
    await mount('<u-field label="Theme" description="Pick one"><u-button>Light</u-button><u-button>Dark</u-button></u-field>');
    expect(await named('group')).toContain('Theme');
    expect(await named('button')).toEqual(['Light', 'Dark']);
  });

  it('글자를 가진 버튼 하나도 덮지 않는다', async () => {
    await mount('<u-field label="Language"><u-button>English</u-button></u-field>');
    expect(await named('button')).toEqual(['English']);
    expect(await named('group')).toContain('Language');
  });

  it('컨트롤이 하나에서 둘로 늘면 첫 컨트롤에 얹었던 이름을 걷는다', async () => {
    await mount('<u-field label="Name"><input></u-field>');
    const field = document.querySelector('u-field')!;
    expect(field.querySelector('input')!.getAttribute('aria-label')).toBe('Name');
    const second = document.createElement('input');
    field.append(second);
    await new Promise((r) => setTimeout(r, 50));
    expect(field.querySelector('input')!.hasAttribute('aria-label')).toBe(false);
    expect(await named('group')).toContain('Name');
  });

  it('NEGATIVE — 입력 하나는 종전대로 그 입력의 이름이다(묶음 없음)', async () => {
    await mount('<u-field label="Email"><input type="email"></u-field>');
    expect(await named('textbox')).toEqual(['Email']);
    expect(await named('group')).not.toContain('Email');
  });

  it('NEGATIVE — 소비자가 단 aria-label 은 걷지 않는다', async () => {
    await mount('<u-field label="Size"><u-button aria-label="Small size">S</u-button><u-button>M</u-button></u-field>');
    expect(await named('button')).toEqual(['Small size', 'M']);
  });
});
