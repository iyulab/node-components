import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Dialog } from '../../src/utilities/Dialog.js';
import { Locale } from '../../src/utilities/Locale.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';

/**
 * `Dialog.confirm`/`prompt` 의 기본 버튼 문구는 현재 로케일을 따른다.
 *
 * 결함(docket `#417`): 기본값이 영어 리터럴(`'Cancel'`·`'Confirm'`)이라, `Locale.set('ko')` 한
 * 앱의 한국어 본문 아래에 영어 버튼이 섰다. 같은 패키지의 다른 chrome 문구(`close`·`clear` …)는
 * 이미 `Locale` 표를 탔다 — 이 유틸리티 하나가 그것을 우회하고 있었다.
 */
describe('Dialog 기본 버튼 문구', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { Locale.set('en'); document.body.innerHTML = ''; });

  const labels = async () => {
    await vi.waitFor(() => expect(document.body.querySelector('u-dialog')).toBeTruthy());
    const dialog = document.body.querySelector('u-dialog') as UDialog;
    await dialog.updateComplete;
    return [...dialog.querySelectorAll('u-button')].map(b => b.textContent!.trim());
  };

  it.each([
    ['confirm', () => Dialog.confirm('삭제하시겠습니까?')],
    ['prompt', () => Dialog.prompt('이름을 입력하세요')],
  ])('%s: ko 로케일에서 버튼이 «취소 · 확인» 이다', async (_name, open) => {
    Locale.set('ko');
    void open();
    expect(await labels()).toEqual(['취소', '확인']);
  });

  it('NEGATIVE: 명시한 문구는 로케일보다 우선한다', async () => {
    Locale.set('ko');
    void Dialog.confirm('delete?', { confirmLabel: 'Delete', cancelLabel: 'Keep' });
    expect(await labels()).toEqual(['Keep', 'Delete']);
  });

  it('NEGATIVE: en 로케일은 종전 문구 그대로다', async () => {
    void Dialog.confirm('delete?');
    expect(await labels()).toEqual(['Cancel', 'Confirm']);
  });
});
