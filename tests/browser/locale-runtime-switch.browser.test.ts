import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/alert/UAlert.js';
import '../../src/components/input/UInput.js';
import '../../src/components/date-picker/UDatePicker.js';
import { Locale } from '../../src/utilities/Locale.js';
import { axFirst } from './ax.js';

/**
 * 런타임 언어 전환 — `Locale.set` 뒤 이미 그려진 문장이 새 언어로 다시 그려진다(`UElement` 가 연결된 동안 구독한다).
 * 종전에는 값만 바뀌고 아무도 다시 그리지 않아, 다음 재렌더(아무 속성 변경)까지 옛 언어가 남았다.
 */
const settle = async () => {
  for (const el of document.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>('*')) await el.updateComplete;
};

describe('런타임 로캘 전환', () => {
  afterEach(() => Locale.set('en'));

  it('u-alert 기본 제목 · u-input 지우기 이름 · u-date-picker 달력 버튼 이름이 따라온다', async () => {
    Locale.set('en');
    document.body.innerHTML = '<u-alert open status="error">x</u-alert><u-input clearable value="v"></u-input><u-date-picker></u-date-picker>';
    await settle();
    const alertTitle = () => document.querySelector('u-alert')!.shadowRoot!.textContent!;
    const clearName = () => document.querySelector('u-input')!.shadowRoot!.querySelector('[role="button"]')!.getAttribute('aria-label');
    const calName = () => document.querySelector('u-date-picker')!.shadowRoot!.querySelector('.calendar-button')!.getAttribute('aria-label');
    const before = [clearName(), calName()];
    expect(alertTitle()).toContain('Error');

    Locale.set('ko');
    await settle();
    expect(alertTitle()).toContain('오류');
    expect(clearName()).not.toBe(before[0]);
    expect(calName()).not.toBe(before[1]);
  });

  it('등록(register)으로 문장이 바뀌어도 다시 그린다', async () => {
    Locale.set('en');
    document.body.innerHTML = '<u-alert open status="error">x</u-alert>';
    await settle();
    Locale.register('en', { alertError: 'Problem' });
    await settle();
    expect(document.querySelector('u-alert')!.shadowRoot!.textContent).toContain('Problem');
    Locale.register('en', { alertError: 'Error' });
  });

  it('떨어져 있는 동안 바뀐 로캘은 다시 붙을 때 따라간다', async () => {
    Locale.set('en');
    document.body.innerHTML = '<u-alert open status="error">x</u-alert>';
    const el = document.querySelector('u-alert')!;
    await settle();
    el.remove();
    Locale.set('ko');
    document.body.append(el);
    await settle();
    expect(el.shadowRoot!.textContent).toContain('오류');
  });
});

describe('런타임 로캘 전환 — 렌더 밖에 적어 둔 문장', () => {
  afterEach(() => Locale.set('en'));

  it('검증 메시지(internals)가 새 언어로 다시 계산된다', async () => {
    Locale.set('en');
    document.body.innerHTML = '<u-input required></u-input>';
    const el = document.querySelector('u-input') as HTMLElement & { validate(): boolean; validationMessage: string; updateComplete: Promise<unknown> };
    await el.updateComplete;
    el.validate();
    const en = el.validationMessage;
    Locale.set('ko');
    await el.updateComplete;
    expect(el.validationMessage).not.toBe(en);
    expect(el.validationMessage).toBe(Locale.getValue('valueMissing'));
  });

  it('u-spinner 기본 이름 · u-split-panel 핸들 이름', async () => {
    await import('../../src/components/spinner/USpinner.js');
    await import('../../src/components/split-panel/USplitPanel.js');
    Locale.set('en');
    document.body.innerHTML = '<u-spinner></u-spinner><u-split-panel style="height:100px"><div>A</div><div>B</div></u-split-panel>';
    await settle();
    await new Promise((r) => setTimeout(r, 50));
    const handle = () => document.querySelector('u-split-panel')!.shadowRoot!.querySelector('.splitter')!.getAttribute('aria-label');
    const enHandle = handle();
    expect((await axFirst('progressbar'))?.name).toBe('Loading');
    Locale.set('ko');
    await settle();
    expect(handle()).not.toBe(enHandle);
    expect(handle()).toBe(Locale.getValue('resizePanels'));
    expect((await axFirst('progressbar'))?.name).toBe(Locale.getValue('loading'));
  });

  it('u-input type=number 의 표시 소수점이 새 로캘을 따른다(입력 중이 아닐 때)', async () => {
    Locale.set('en');
    document.body.innerHTML = '<u-input type="number" value="1.5"></u-input>';
    const el = document.querySelector('u-input') as HTMLElement & { updateComplete: Promise<unknown> };
    await el.updateComplete;
    const shown = () => el.shadowRoot!.querySelector('input')!.value;
    expect(shown()).toBe('1.5');
    Locale.set('de');
    await el.updateComplete;
    expect(shown()).toBe('1,5');
  });
});
