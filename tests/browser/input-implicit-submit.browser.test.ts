import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/input/UInput.js';
import '../../src/components/option/UOption.js';
import '../../src/components/button/UButton.js';
import '../../src/components/checkbox/UCheckbox.js';

/**
 * `u-input` 의 **암묵 제출** — 네이티브 단일 행 입력처럼 Enter 가 소유 `<form>` 을 제출한다(HTML «implicit submission»).
 *
 * 내부 `<input>` 은 섀도 안에 있어 바깥 폼의 폼 소유자가 아니다 — 컴포넌트가 흉내 내지 않으면 Enter 가 아무것도 하지
 * 않았다(종전 동작). 트러스티드 키 입력(`userEvent`)으로 잰다: 합성 `KeyboardEvent` 는 브라우저 기본 동작을 재현하지
 * 않으므로 «네이티브와 같은가» 를 비교하려면 실제 입력이어야 한다. IME 조합 케이스만 합성 이벤트로 재고, 그 옆에 같은
 * 합성 경로가 **제출은 한다** 는 대조군을 두어 공허하지 않게 한다.
 *
 * 안전장치: `submit` 은 항상 `preventDefault()` 로 관찰만 한다(실제 제출은 러너를 끊는다).
 * «폼의 keydown 에서 취소하면 제출하지 않는다» 는 `form-enter-preventdefault.browser.test.ts` 가 지킨다.
 */

type Host = HTMLElement & { updateComplete: Promise<unknown>; value?: unknown };

afterEach(() => {
  document.body.innerHTML = '';
});

async function mountForm(inner: string) {
  const form = document.createElement('form');
  form.innerHTML = inner;
  const submits: Array<HTMLElement | null> = [];
  form.addEventListener('submit', (e) => {
    submits.push((e as SubmitEvent).submitter);
    e.preventDefault();
  });
  document.body.appendChild(form);
  const hosts = Array.from(form.querySelectorAll('u-input')) as Host[];
  await Promise.all(hosts.map((h) => h.updateComplete));
  await new Promise((r) => setTimeout(r, 30));
  return { form, submits, hosts };
}

function focusInner(host: Element): HTMLInputElement {
  const input = (host as HTMLElement).shadowRoot!.querySelector('input')!;
  input.focus();
  return input;
}

const settle = () => new Promise((r) => setTimeout(r, 60));

describe('u-input 암묵 제출 (Enter → 소유 form)', () => {
  it('네이티브 제출 버튼이 있으면 Enter 가 제출하고, submitter 는 그 버튼이다', async () => {
    const { form, submits, hosts } = await mountForm('<u-input name="q"></u-input><button type="submit">Go</button>');
    focusInner(hosts[0]);
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(submits).toHaveLength(1);
    expect(submits[0]).toBe(form.querySelector('button'));
  });

  it('u-button[type=submit] 이 있으면 Enter 가 제출한다 (원 보고의 조합)', async () => {
    const { submits, hosts } = await mountForm(
      '<u-input name="u"></u-input><u-input name="p" type="password"></u-input><u-button type="submit">Sign in</u-button>',
    );
    focusInner(hosts[1]);
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(submits).toHaveLength(1);
  });

  it('제출 버튼이 없고 막는 필드가 하나뿐이면 제출한다 (명세 — 검색창 한 칸)', async () => {
    const { submits, hosts } = await mountForm('<u-input name="q"></u-input><u-checkbox name="c"></u-checkbox>');
    focusInner(hosts[0]);
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(submits).toEqual([null]);
  });

  it('⚪NEGATIVE — 제출 버튼이 없고 막는 필드가 둘 이상이면 제출하지 않는다 (명세)', async () => {
    const { submits, hosts } = await mountForm('<u-input name="a"></u-input><input name="b">');
    focusInner(hosts[0]);
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(submits).toEqual([]);
  });

  it('⚪NEGATIVE — 첫 제출 버튼이 비활성이면 제출하지 않는다 (네이티브 · u-button)', async () => {
    for (const button of ['<button type="submit" disabled>Go</button>', '<u-button type="submit" disabled>Go</u-button>']) {
      const { submits, hosts } = await mountForm(`<u-input name="q"></u-input>${button}`);
      focusInner(hosts[0]);
      await userEvent.keyboard('{Enter}');
      await settle();
      expect(submits, button).toEqual([]);
      document.body.innerHTML = '';
    }
  });

  it('⚪NEGATIVE — 수정 키가 붙은 Enter 는 제출하지 않는다', async () => {
    const { submits, hosts } = await mountForm('<u-input name="q"></u-input><button type="submit">Go</button>');
    focusInner(hosts[0]);
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    await settle();
    expect(submits).toEqual([]);
  });

  it('⚪NEGATIVE — IME 조합을 확정하는 Enter 는 제출하지 않는다 (같은 합성 경로의 대조군은 제출한다)', async () => {
    const { submits, hosts } = await mountForm('<u-input name="q"></u-input><button type="submit">Go</button>');
    const input = focusInner(hosts[0]);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, composed: true }));
    await settle();
    expect(submits, '조합 중 Enter').toEqual([]);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    await settle();
    expect(submits, '대조군 — 이 경로가 핸들러에 닿는다').toHaveLength(1);
  });

  it('🔴Enter 에서 직접 requestSubmit() 하고 preventDefault() 하는 소비자 우회는 이중 제출되지 않는다', async () => {
    const { form, submits, hosts } = await mountForm('<u-input name="q"></u-input><u-button type="submit">Go</u-button>');
    form.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') {
        e.preventDefault();
        form.requestSubmit();
      }
    });
    focusInner(hosts[0]);
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(submits).toHaveLength(1);
  });

  it('⚪NEGATIVE — 제안 목록의 항목에서 누른 Enter 는 항목을 고를 뿐 제출하지 않는다', async () => {
    const { submits, hosts } = await mountForm(
      '<u-input name="fruit"><u-option value="apple">Apple</u-option><u-option value="banana">Banana</u-option></u-input>' +
      '<button type="submit">Go</button>',
    );
    const host = hosts[0];
    focusInner(host);
    const popover = host.shadowRoot!.querySelector('u-popover')!;
    for (let i = 0; i < 50 && !popover.hasAttribute('open'); i++) await new Promise((r) => setTimeout(r, 20));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(host.value).toBe('apple');
    expect(submits).toEqual([]);
  });

  it('⚪NEGATIVE — 폼 밖의 u-input 에서 Enter 는 아무 일도 없다(오류 없이)', async () => {
    document.body.innerHTML = '<u-input name="q"></u-input>';
    const host = document.querySelector('u-input') as Host;
    await host.updateComplete;
    focusInner(host);
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(host.isConnected).toBe(true);
  });
});
