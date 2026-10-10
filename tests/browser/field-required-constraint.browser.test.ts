import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/index.js';
import type { UField } from '../../src/components/field/UField.js';

/**
 * `u-field required` 는 별표만이 아니라 그 컨트롤의 **제약**이다. 종전에는 별표만 그려
 * `<u-field label="이메일" required><u-input></u-input></u-field>` 가 빈 채로 제출됐다.
 *
 * 규율은 라벨 전달과 같다: 필드가 가리키는 컨트롤 하나에만 넘기고(묶음이면 넘기지 않는다),
 * 끌 때는 필드가 켠 것만 끈다.
 */

type Control = HTMLElement & { updateComplete?: Promise<unknown>; required?: boolean; invalid?: boolean };

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    for (const el of Array.from(document.body.querySelectorAll('*')) as Control[]) {
      if (el.updateComplete) await el.updateComplete;
    }
    await new Promise((r) => setTimeout(r, 30));
  }
}

const $ = <T extends Element = Control>(sel: string) => document.querySelector(sel) as unknown as T;

describe('u-field required → 컨트롤 제약', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('필드만 required 여도 빈 컨트롤은 제출을 막고 오류를 보인다', async () => {
    document.body.innerHTML = '<form><u-field label="Email" required><u-input name="email"></u-input></u-field></form>';
    await settle();
    expect($('u-input').required).toBe(true);
    const form = $<HTMLFormElement>('form');
    let submitted = false;
    form.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
    form.requestSubmit();
    await settle();
    expect(submitted).toBe(false);
    expect($('u-input').invalid).toBe(true);
  });

  it('네이티브 입력을 슬롯해도 같다', async () => {
    document.body.innerHTML = '<u-field label="Email" required><input name="email"></u-field>';
    await settle();
    expect($<HTMLInputElement>('input').required).toBe(true);
  });

  it('필드가 required 를 끄면 필드가 켠 것은 꺼진다', async () => {
    document.body.innerHTML = '<u-field label="Email" required><u-input name="email"></u-input></u-field>';
    await settle();
    expect($('u-input').required).toBe(true);
    $<UField>('u-field').required = false;
    await settle();
    expect($('u-input').required).toBe(false);
  });

  it('소비자가 컨트롤에 단 required 는 필드가 끄지 않는다', async () => {
    document.body.innerHTML = '<u-field label="Email" required><u-input name="email" required></u-input></u-field>';
    await settle();
    $<UField>('u-field').required = false;
    await settle();
    expect($('u-input').required).toBe(true);
  });

  it('컨트롤을 바꾸면 옛 컨트롤에서는 걷고 새 컨트롤에 넘긴다', async () => {
    document.body.innerHTML = '<u-field label="Email" required><u-input id="old" name="a"></u-input></u-field>';
    await settle();
    const field = $<UField>('u-field');
    const old = $('#old');
    old.remove();
    field.insertAdjacentHTML('beforeend', '<u-input id="new" name="b"></u-input>');
    await settle();
    expect(old.required).toBe(false);
    expect($('#new').required).toBe(true);
  });

  it('컨트롤이 여럿인 묶음에는 넘기지 않는다 — 어느 것이 필수인지 필드는 모른다', async () => {
    document.body.innerHTML = '<u-field label="Range" required><u-input name="from"></u-input><u-input name="to"></u-input></u-field>';
    await settle();
    expect(Array.from(document.querySelectorAll('u-input')).map((el) => (el as Control).required)).toEqual([false, false]);
  });
});
