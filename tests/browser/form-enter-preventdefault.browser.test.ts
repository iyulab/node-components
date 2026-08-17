import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/input/UInput.js';
import '../../src/components/drawer/UDrawer.js';
import '../../src/components/button/UButton.js';

/**
 * 외부 보고 하나가 `u-drawer`(`contained`, `mode="non-modal"`) 안의 `<form>`
 * (`u-input` 둘 + `u-button[type=submit]`)에서, 비밀번호 필드 포커스 상태로 Enter를
 * 누르면 `<form>`의 `keydown` 리스너에 건 `preventDefault()`가 무시되고 실제
 * 내비게이션이 일어난다고 서술했다. 핵심 단서는 `dispatchEvent`로 만든 합성 이벤트는
 * 재현되지 않고 트러스티드 이벤트일 때만 재현된다는 것이었다.
 *
 * 🔴**이 파일이 확인한 것 — 이 패키지의 컴포넌트만으로는 재현되지 않는다.** 보고된
 * 조합을 그대로 재구성해(`u-drawer[contained][mode="non-modal"]` + `u-input` 둘
 * (text/password) + `u-button[type=submit]`, 비밀번호 필드에 포커스) 실제 트러스티드
 * 키 입력(`userEvent.keyboard()` — Playwright CDP 백엔드, 원 보고와 같은 종류의 입력)
 * 으로 Enter를 눌러도 `keydown`의 `preventDefault()`가 `submit` 발화를 정상적으로
 * 막는다. 세 단계로 좁혔다: 네이티브 `<input>` 대조군 → `u-input` 단독(드로어 없이) →
 * 원 조합 전체 — **셋 다 재현되지 않았다.**
 *
 * ⇒ 원인이 이 패키지 소스에 있다는 증거가 지금은 없다. 그래도 영구 회귀 자산으로
 * 남긴다 — 실제 결함군 하나를 배제한 증거이고, 나중에 이 자리에서 진짜 원인이
 * 드러나면 그 수정의 테스트가 놓일 자리이기도 하다.
 *
 * 안전장치: 실제 내비게이션(폼 제출로 인한 리로드)이 일어나면 테스트 러너 자체가
 * 끊긴다. `submit` 이벤트에도 별도로 `preventDefault()`를 걸어 관찰만 하고 실제
 * 제출은 항상 막는다 — "keydown에서 막았는데도 submit이 발화하는가"만 잰다.
 */

afterEach(() => {
  document.body.innerHTML = '';
});

async function mountForm(controlHtml: string): Promise<{
  form: HTMLFormElement;
  submitFired: () => boolean;
  enterKeydownReceived: () => boolean;
}> {
  const form = document.createElement('form');
  form.innerHTML = `${controlHtml}<button type="submit">Submit</button>`;

  let submitFired = false;
  let enterKeydownReceived = false;
  // 재현 보고와 동일한 형태: <form>의 keydown 리스너에서 Enter를 preventDefault.
  form.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      enterKeydownReceived = true;
      e.preventDefault();
    }
  });
  // 안전장치 — submit이 실제로 발화해도 페이지 이동은 항상 막는다.
  form.addEventListener('submit', (e) => {
    submitFired = true;
    e.preventDefault();
  });

  document.body.appendChild(form);
  return { form, submitFired: () => submitFired, enterKeydownReceived: () => enterKeydownReceived };
}

describe('<form> Enter vs preventDefault() — 보고된 조합 재현 시도', () => {
  it('대조군 — 네이티브 <input>만 있으면 keydown의 preventDefault()가 submit을 막는다', async () => {
    const { form, submitFired, enterKeydownReceived } = await mountForm('<input name="username" type="text">');
    const input = form.querySelector('input')!;
    input.focus();

    await userEvent.keyboard('{Enter}');

    expect(enterKeydownReceived(), 'keydown 자체가 form까지 도달해야 이 테스트가 의미를 가진다').toBe(true);
    expect(submitFired(), '네이티브 input: keydown preventDefault가 submit을 막아야 한다').toBe(false);
  });

  it('🔴u-input만으로(u-drawer 없이) 재현되는가 — keydown preventDefault에도 submit이 발화하는가', async () => {
    const { form, submitFired, enterKeydownReceived } = await mountForm('<u-input name="username"></u-input>');
    const host = form.querySelector('u-input') as HTMLElement & { updateComplete: Promise<unknown> };
    await host.updateComplete;
    const nativeInput = host.shadowRoot!.querySelector('input')!;
    nativeInput.focus();

    await userEvent.keyboard('{Enter}');

    expect(enterKeydownReceived(), 'keydown 자체가 form까지 도달해야 이 테스트가 의미를 가진다(섀도 경계 통과 확인)').toBe(true);
    expect(submitFired(), 'u-input: keydown preventDefault만으로 submit 발화를 관측').toBe(false);
  });

  it('🔴원 재현 조건 그대로 — u-drawer[contained][mode=non-modal] 안에 <form>+u-input', async () => {
    const drawer = document.createElement('u-drawer') as HTMLElement & {
      contained: boolean; mode: string; open: boolean; updateComplete: Promise<unknown>;
    };
    drawer.contained = true;
    drawer.mode = 'non-modal';

    const form = document.createElement('form');
    // 원 재현 그대로: 제출 버튼도 네이티브 <button>이 아니라 <u-button type="submit">다 —
    // 브라우저의 "기본 제출 버튼 탐색" 알고리즘은 실제 <button>/<input type=submit>만
    // 인식하므로, 커스텀 엘리먼트만 있으면 암묵 제출 경로 자체가 달라질 수 있다.
    form.innerHTML = '<u-input name="username"></u-input><u-input name="password" type="password"></u-input><u-button type="submit">Submit</u-button>';
    let submitFired = false;
    let enterKeydownReceived = false;
    form.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') {
        enterKeydownReceived = true;
        e.preventDefault();
      }
    });
    form.addEventListener('submit', (e) => {
      submitFired = true;
      e.preventDefault();
    });
    drawer.appendChild(form);
    document.body.appendChild(drawer);
    drawer.open = true;
    await drawer.updateComplete;

    // 원 보고는 "비밀번호 필드 포커스 상태에서 Enter"를 특정했다 — username이 아니라
    // password 필드에 포커스를 맞춘다.
    const host = form.querySelector('u-input[type="password"]') as HTMLElement & { updateComplete: Promise<unknown> };
    await host.updateComplete;
    const nativeInput = host.shadowRoot!.querySelector('input')!;
    nativeInput.focus();

    await userEvent.keyboard('{Enter}');

    expect(enterKeydownReceived, 'keydown 자체가 form까지 도달해야 한다').toBe(true);
    expect(submitFired, 'u-drawer 조합에서 keydown preventDefault만으로 submit 발화를 관측').toBe(false);
  });
});
