import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Dialog } from '../../src/utilities/Dialog.js';
import { isImeComposing } from '../../src/utilities/keyboard.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';
import { compose, commitWithEnter } from './ime.js';

/**
 * IME 조합(한국어·일본어·중국어)을 확정하는 Enter 는 명령이 아니다.
 *
 * `isComposing` 만 보면 Safari 를 놓친다 — Safari 는 확정 키를 `compositionend` 뒤에
 * `isComposing: false` · `keyCode: 229` 로 보낸다. 그래서 공통 판정은 둘을 함께 본다.
 */
const enter = (init: KeyboardEventInit & { keyCode?: number }) => {
  const e = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, ...init });
  if (init.keyCode !== undefined) Object.defineProperty(e, 'keyCode', { value: init.keyCode });
  return e;
};

describe('isImeComposing', () => {
  it('조합 중(isComposing) 과 Safari 의 확정 키(keyCode 229) 를 둘 다 조합으로 본다', () => {
    expect(isImeComposing(enter({ isComposing: true }))).toBe(true);
    expect(isImeComposing(enter({ keyCode: 229 }))).toBe(true);
  });

  it('NEGATIVE: 보통 Enter 는 조합이 아니다', () => {
    expect(isImeComposing(enter({ keyCode: 13 }))).toBe(false);
  });
});

describe('Dialog.prompt — 조합을 확정하는 Enter 로 닫히지 않는다', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  const openPrompt = async () => {
    let settled: string | null | undefined;
    void Dialog.prompt('이름').then((v) => { settled = v; });
    await vi.waitFor(() => expect(document.body.querySelector('u-dialog u-input')).toBeTruthy());
    const dialog = document.body.querySelector('u-dialog') as UDialog;
    await dialog.updateComplete;
    const input = dialog.querySelector('u-input')!;
    return { input, result: () => settled };
  };

  it('실제 조합을 Enter 로 확정하면 확인이 아니다 — 글자는 들어간다', async () => {
    const { input, result } = await openPrompt();
    (input.shadowRoot!.querySelector('input') as HTMLInputElement).focus();
    await compose(['ㄱ', '가']);
    await commitWithEnter('가');
    await new Promise((r) => setTimeout(r, 200));
    expect(result()).toBeUndefined();
    expect(document.body.querySelector('u-dialog')).toBeTruthy();
    expect((input as HTMLElement & { value?: string }).value).toBe('가');
  });

  it('keyCode 229(Safari — Chromium 이 낼 수 없어 합성 대역) Enter 는 확인이 아니다', async () => {
    const { input, result } = await openPrompt();
    input.dispatchEvent(enter({ keyCode: 229 }));
    await new Promise((r) => setTimeout(r, 200));
    expect(result()).toBeUndefined();
    expect(document.body.querySelector('u-dialog')).toBeTruthy();
  });

  it('대조군 — 보통 Enter 는 확인한다', async () => {
    const { input, result } = await openPrompt();
    input.dispatchEvent(enter({ keyCode: 13 }));
    await vi.waitFor(() => expect(result()).toBe(''));
  });
});
