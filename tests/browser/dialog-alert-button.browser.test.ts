import { describe, it, expect, afterEach, vi } from 'vitest';
import { Dialog } from '../../src/utilities/Dialog.js';
import { Locale } from '../../src/utilities/Locale.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';

/**
 * `Dialog.alert` 에 누를 버튼이 있다 — 네이티브 `alert()` 의 «확인». 종전에는 버튼이 하나도 없어 닫는 길이 Esc·바깥 누르기
 * (둘 다 보이지 않는 조작)뿐이었고, `alertdialog` 안에 포커스가 들어갈 컨트롤이 없었다(APG Alert Dialog).
 */
const open = async () => {
  await vi.waitFor(() => expect(document.body.querySelector('u-dialog')).toBeTruthy());
  const dialog = document.body.querySelector('u-dialog') as UDialog;
  await dialog.updateComplete;
  await new Promise((r) => setTimeout(r, 350));
  return dialog;
};

describe('Dialog.alert 의 확인 버튼', () => {
  afterEach(() => { Locale.set('en'); document.body.innerHTML = ''; });

  it('버튼 하나 · 로케일의 «OK» · 열리면 거기 포커스', async () => {
    Locale.set('en');
    void Dialog.alert('Saved.');
    const dialog = await open();
    const buttons = [...dialog.querySelectorAll('u-button')];
    expect(buttons.map((b) => b.textContent!.trim())).toEqual(['OK']);
    await vi.waitFor(() => expect(buttons[0].matches(':focus-within') || document.activeElement === buttons[0]).toBe(true));
  });

  it('누르면 닫히고 약속이 풀린다', async () => {
    const done = Dialog.alert('Saved.');
    const dialog = await open();
    (dialog.querySelector('u-button') as HTMLElement).click();
    await expect(done).resolves.toBeUndefined();
  });

  it('ko 는 «확인» · confirmLabel 이 이긴다', async () => {
    Locale.set('ko');
    void Dialog.alert('저장했습니다.');
    let dialog = await open();
    expect(dialog.querySelector('u-button')!.textContent!.trim()).toBe('확인');
    (dialog.querySelector('u-button') as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 400));
    void Dialog.alert('삭제할 수 없습니다.', { confirmLabel: '알겠습니다' });
    dialog = await open();
    expect(dialog.querySelector('u-button')!.textContent!.trim()).toBe('알겠습니다');
  });
});
