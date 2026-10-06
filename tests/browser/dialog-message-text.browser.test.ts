import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { html } from 'lit';
import { Dialog } from '../../src/utilities/Dialog.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';

/**
 * `Dialog.alert`·`confirm` 의 문자열 `message` 는 **글자**다(`prompt` 와 같다).
 *
 * 결함: 둘이 `show({ content: message })` 로 넘겨 `show` 의 «HTML 문자열» 계약을 조용히 물려받았다 — 확인 문구에 사용자
 * 입력(항목 이름)을 넣으면 마크업이 주입됐다(`<img src=x onerror=…>` — 저장형 XSS 의 전형적 싱크). 서식이 필요하면
 * `TemplateResult` 를 넘기고, HTML 문자열은 그것을 명시한 `show({ content })` 로만 쓴다.
 */
describe('Dialog 메시지는 글자다', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => {
    document.body.querySelectorAll('u-dialog').forEach((d) => (d as UDialog).hide?.());
    document.body.innerHTML = '';
    delete (window as unknown as { __pwned?: boolean }).__pwned;
  });

  const opened = async () => {
    await vi.waitFor(() => expect(document.body.querySelector('u-dialog')).toBeTruthy());
    const dialog = document.body.querySelector('u-dialog') as UDialog;
    await dialog.updateComplete;
    return dialog;
  };
  const PAYLOAD = 'Delete "<img src=x onerror="window.__pwned=true">"?';

  it.each([
    ['alert', () => Dialog.alert(PAYLOAD)],
    ['confirm', () => Dialog.confirm(PAYLOAD)],
  ])('%s: 문자열 속 마크업은 요소가 되지 않고 글자로 보인다', async (_name, open) => {
    void open();
    const dialog = await opened();
    await new Promise((r) => setTimeout(r, 50));
    expect(dialog.querySelector('img'), 'no element was injected').toBeNull();
    expect(dialog.textContent).toContain('<img src=x');
    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
  });

  it('서식은 TemplateResult 로 준다', async () => {
    void Dialog.confirm(html`Delete <strong>Order 12</strong>?`);
    const dialog = await opened();
    expect(dialog.querySelector('strong')?.textContent).toBe('Order 12');
  });

  it('NEGATIVE show({ content }) 의 HTML 문자열 계약은 그대로다', async () => {
    void Dialog.show({ content: '<em>formatted</em>' });
    const dialog = await opened();
    expect(dialog.querySelector('em')?.textContent).toBe('formatted');
  });
});
