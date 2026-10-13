/**
 * `relay()` 가 다시 낸 이벤트는 원본의 초기값을 잇는다 — 버블하고, 호스트가 공개 경계이므로 섀도를 넘는다.
 *
 * `Event` 의 `bubbles`·`cancelable`·`composed` 와 `InputEvent` 의 `data`·`inputType` 은 프로토타입 getter 라
 * 객체 펼침(`{ ...event }`)에 들어오지 않는다. 그렇게 만든 이벤트는 호스트에서만 들리고 조상(위임 리스너 ·
 * `u-form`)에는 닿지 않았다. 여기서는 실제 사용자 조작으로 컨트롤마다 조상이 한 번씩 받는지 잰다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/checkbox/UCheckbox.js';
import '../../src/components/switch/USwitch.js';
import '../../src/components/textarea/UTextarea.js';
import '../../src/components/input/UInput.js';
import '../../src/components/file-input/UFileInput.js';
import '../../src/components/form/UForm.js';
import type { UCheckbox } from '../../src/components/checkbox/UCheckbox.js';
import type { USwitch } from '../../src/components/switch/USwitch.js';
import type { UTextarea } from '../../src/components/textarea/UTextarea.js';
import type { UInput } from '../../src/components/input/UInput.js';
import type { UFileInput } from '../../src/components/file-input/UFileInput.js';
import type { UForm } from '../../src/components/form/UForm.js';

type Lit = HTMLElement & { updateComplete: Promise<boolean> };

async function settle(el: Lit) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

/** 조상에서 `type` 이벤트를 모은다(대상이 `host` 인 것만). */
function collect(ancestor: HTMLElement, type: string, host: HTMLElement): Event[] {
  const seen: Event[] = [];
  ancestor.addEventListener(type, e => { if (e.target === host) seen.push(e); });
  return seen;
}

function mount<T extends Lit>(html: string, selector: string): { wrap: HTMLDivElement; el: T } {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  return { wrap, el: wrap.querySelector(selector) as T };
}

/** 컨트롤 안쪽의 네이티브 입력 — 사용자 클릭·타이핑의 실제 대상. */
function inner<E extends Element>(host: HTMLElement, selector: string): E {
  return host.shadowRoot!.querySelector(selector) as E;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('relay() — 조상이 컨트롤의 이벤트를 한 번씩 받는다', () => {
  it('u-checkbox 클릭: 조상이 change 1 · input 1(이중 수신 없음)', async () => {
    const { wrap, el } = mount<UCheckbox>('<u-checkbox name="agree">Agree</u-checkbox>', 'u-checkbox');
    await settle(el);
    const changes = collect(wrap, 'change', el);
    const inputs = collect(wrap, 'input', el);

    await userEvent.click(el);
    await settle(el);

    expect(el.checked).toBe(true);
    expect(changes).toHaveLength(1);
    expect(changes[0].bubbles && changes[0].composed).toBe(true);
    expect(inputs).toHaveLength(1);
  });

  it('u-switch 클릭: 조상이 change 1 · input 1', async () => {
    const { wrap, el } = mount<USwitch>('<u-switch name="on">On</u-switch>', 'u-switch');
    await settle(el);
    const changes = collect(wrap, 'change', el);
    const inputs = collect(wrap, 'input', el);

    await userEvent.click(el);
    await settle(el);

    expect(el.checked).toBe(true);
    expect(changes).toHaveLength(1);
    expect(inputs).toHaveLength(1);
  });

  it('u-textarea 타이핑: 조상이 글자마다 input 1 · 포커스를 떠나면 change 1', async () => {
    const { wrap, el } = mount<UTextarea>('<u-textarea name="memo"></u-textarea>', 'u-textarea');
    await settle(el);
    const inputs = collect(wrap, 'input', el);
    const changes = collect(wrap, 'change', el);

    await userEvent.click(inner(el, 'textarea'));
    await userEvent.keyboard('ab');
    await userEvent.tab();
    await settle(el);

    expect(el.value).toBe('ab');
    expect(inputs).toHaveLength(2);
    expect(changes).toHaveLength(1);
  });

  it('u-input 타이핑: 조상이 글자마다 input 1 — InputEvent 의 data·inputType 을 잇는다', async () => {
    const { wrap, el } = mount<UInput>('<u-input name="title"></u-input>', 'u-input');
    await settle(el);
    const inputs = collect(wrap, 'input', el);

    await userEvent.click(inner(el, 'input'));
    await userEvent.keyboard('ab');
    await settle(el);

    expect(el.value).toBe('ab');
    expect(inputs).toHaveLength(2);
    const last = inputs[1] as InputEvent;
    expect(last).toBeInstanceOf(InputEvent);
    expect(last.data).toBe('b');
    expect(last.inputType).toBe('insertText');
  });

  it('u-file-input 파일 선택: 조상이 change 1', async () => {
    const { wrap, el } = mount<UFileInput>('<u-file-input name="doc"></u-file-input>', 'u-file-input');
    await settle(el);
    const changes = collect(wrap, 'change', el);

    // 파일 대화상자는 자동화할 수 없다 — 브라우저가 선택 뒤 하는 일(files 설정 + change)을 그대로 한다.
    const native = inner<HTMLInputElement>(el, 'input[type="file"]');
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'a.txt', { type: 'text/plain' }));
    native.files = dt.files;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await settle(el);

    expect(changes).toHaveLength(1);
  });
});

describe('u-form model — 사용자 조작이 model 로 간다', () => {
  it('체크박스 · 스위치 · 텍스트영역 변경이 model 에 반영된다', async () => {
    const { el: form } = mount<UForm>(
      '<u-form><u-checkbox name="agree">Agree</u-checkbox><u-switch name="on">On</u-switch>'
      + '<u-textarea name="memo"></u-textarea></u-form>',
      'u-form',
    );
    const model: Record<string, unknown> = {};
    form.model = model;
    await settle(form);
    const checkbox = form.querySelector('u-checkbox') as UCheckbox;
    const sw = form.querySelector('u-switch') as USwitch;
    const textarea = form.querySelector('u-textarea') as UTextarea;
    await settle(checkbox);

    await userEvent.click(checkbox);
    await userEvent.click(sw);
    await userEvent.click(inner(textarea, 'textarea'));
    await userEvent.keyboard('hi');
    await userEvent.tab();
    await settle(form);

    expect(model).toEqual({ agree: true, on: true, memo: 'hi' });
  });
});

describe('u-form model — model 이 켬/끔 컨트롤의 상태를 정한다', () => {
  it('model 의 불리언이 체크박스 · 스위치의 checked 가 되고, reset 이 그 값으로 되돌린다', async () => {
    const { el: form } = mount<UForm>(
      '<u-form><u-checkbox name="agree">Agree</u-checkbox><u-switch name="on">On</u-switch></u-form>',
      'u-form',
    );
    form.model = { agree: true, on: false };
    await settle(form);
    const checkbox = form.querySelector('u-checkbox') as UCheckbox;
    const sw = form.querySelector('u-switch') as USwitch;
    await settle(checkbox);

    expect(checkbox.checked).toBe(true);
    expect(sw.checked).toBe(false);

    await userEvent.click(checkbox);
    await settle(form);
    expect(form.model).toEqual({ agree: false, on: false });

    form.reset();
    await settle(checkbox);
    expect(checkbox.checked).toBe(true);
  });
});
