import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/components/dialog/UDialog.js';
import '../../src/components/drawer/UDrawer.js';
import '../../src/components/switch/USwitch.js';
import { Dialog } from '../../src/utilities/Dialog.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';
import { axTree, type AxNode } from './ax.js';

/**
 * 오버레이는 보조기기에 **대화상자**로 나간다 — 역할 · 모달 여부 · 이름(WCAG 4.1.2, APG Dialog/Alert Dialog).
 *
 * 결함: 포커스는 가두면서 역할이 없어, 낭독기 사용자는 «무엇이 열렸는지» 듣지 못한 채 낯선 버튼에 갇혔다. 네이티브 `confirm()`
 * 은 `alertdialog` 로 나가므로 `Dialog.confirm` 으로 옮기는 것이 접근성에서는 퇴보였다. `u-switch` 도 같은 축 — 체크박스로 나갔다.
 *
 * DOM 속성이 아니라 Chromium 접근성 트리를 읽는다(`ax.ts`) — 섀도 경계·`ElementInternals`·이름 계산을 거친 뒤의 것.
 */
const nodes = async (role: string): Promise<AxNode[]> =>
  (await axTree())
    .filter((n) => !n.ignored && n.role?.value === role)
    .map((n) => ({
      role: n.role?.value ?? '',
      name: n.name?.value ?? '',
      description: (n as { description?: { value: string } }).description?.value ?? '',
      props: Object.fromEntries((n.properties ?? []).map((p) => [p.name, p.value.value])),
    }));

const settle = async (el: Element) => {
  await (el as UDialog).updateComplete;
  await new Promise((r) => setTimeout(r, 50));
};

describe('오버레이 = 대화상자', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => {
    document.body.querySelectorAll('u-dialog, u-drawer').forEach((d) => (d as UDialog).hide?.());
    document.body.innerHTML = '';
  });

  it('u-dialog(modal) — dialog · modal · 머리 슬롯이 이름', async () => {
    document.body.innerHTML = `
      <u-dialog><span slot="header">제목 삭제</span>본문<button>확인</button></u-dialog>`;
    const dlg = document.querySelector('u-dialog') as UDialog;
    dlg.show();
    await settle(dlg);
    const [d] = await nodes('dialog');
    expect(d?.name).toBe('제목 삭제');
    expect(d?.props.modal).toBe(true);
  });

  it('머리 내용이 바뀌면 이름도 따라간다', async () => {
    document.body.innerHTML = `<u-dialog><span slot="header">처음</span>본문</u-dialog>`;
    const dlg = document.querySelector('u-dialog') as UDialog;
    dlg.show();
    await settle(dlg);
    dlg.querySelector('[slot="header"]')!.textContent = '나중';
    await settle(dlg);
    expect((await nodes('dialog'))[0]?.name).toBe('나중');
  });

  it('non-modal — 모달 아님', async () => {
    document.body.innerHTML = `<u-dialog mode="non-modal"><span slot="header">도움말</span>본문</u-dialog>`;
    const dlg = document.querySelector('u-dialog') as UDialog;
    dlg.show();
    await settle(dlg);
    const [d] = await nodes('dialog');
    expect(d?.name).toBe('도움말');
    expect(d?.props.modal).not.toBe(true);
  });

  it('호스트의 aria-label 이 이긴다', async () => {
    document.body.innerHTML = `<u-dialog aria-label="저자 이름">본문</u-dialog>`;
    const dlg = document.querySelector('u-dialog') as UDialog;
    dlg.show();
    await settle(dlg);
    expect((await nodes('dialog'))[0]?.name).toBe('저자 이름');
  });

  it('u-drawer 도 대화상자다', async () => {
    document.body.innerHTML = `<u-drawer><span slot="header">필터</span>본문</u-drawer>`;
    const drw = document.querySelector('u-drawer') as UDialog;
    drw.show();
    await settle(drw);
    const [d] = await nodes('dialog');
    expect(d?.name).toBe('필터');
    expect(d?.props.modal).toBe(true);
  });

  it('닫힌 오버레이는 트리에 없다', async () => {
    document.body.innerHTML = `<u-dialog><span slot="header">숨김</span>본문</u-dialog>`;
    await settle(document.querySelector('u-dialog')!);
    expect(await nodes('dialog')).toHaveLength(0);
  });
});

describe('Dialog.* = alertdialog / dialog', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => {
    document.body.querySelectorAll('u-dialog').forEach((d) => (d as UDialog).hide?.());
    document.body.innerHTML = '';
  });
  const opened = async () => {
    await vi.waitFor(() => expect(document.body.querySelector('u-dialog[open]')).toBeTruthy());
    const dlg = document.body.querySelector('u-dialog') as UDialog;
    await settle(dlg);
    return dlg;
  };

  it('confirm(제목 없음) — alertdialog · 메시지가 이름', async () => {
    void Dialog.confirm('삭제하시겠습니까?');
    await opened();
    const [d] = await nodes('alertdialog');
    expect(d?.name).toBe('삭제하시겠습니까?');
    expect(d?.props.modal).toBe(true);
  });

  it('confirm(제목) — 제목이 이름 · 메시지가 설명', async () => {
    void Dialog.confirm('되돌릴 수 없습니다.', { title: '항목 삭제' });
    await opened();
    const [d] = await nodes('alertdialog');
    expect(d?.name).toBe('항목 삭제');
    expect(d?.description).toBe('되돌릴 수 없습니다.');
  });

  it('alert — alertdialog', async () => {
    void Dialog.alert('저장했습니다.');
    await opened();
    expect((await nodes('alertdialog'))[0]?.name).toBe('저장했습니다.');
  });

  it('prompt — 입력을 받는 dialog · 메시지가 이름', async () => {
    void Dialog.prompt('새 이름');
    await opened();
    expect((await nodes('dialog'))[0]?.name).toBe('새 이름');
    expect(await nodes('alertdialog')).toHaveLength(0);
  });

  it('show — dialog · 제목이 이름', async () => {
    void Dialog.show({ title: '설정', content: '<p>본문</p>' });
    await opened();
    expect((await nodes('dialog'))[0]?.name).toBe('설정');
  });
});

describe('u-switch = switch', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('스위치로 나가고 켬/끔을 싣는다', async () => {
    document.body.innerHTML = `<u-switch checked>알림 받기</u-switch>`;
    await settle(document.querySelector('u-switch')!);
    const [s] = await nodes('switch');
    expect(s?.name).toBe('알림 받기');
    expect(s?.props.checked).toBe('true');
    expect(await nodes('checkbox')).toHaveLength(0);
  });
});
