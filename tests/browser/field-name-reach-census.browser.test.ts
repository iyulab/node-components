import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/index.js';

/**
 * 「필드 라벨이 **모든** 폼 컨트롤의 접근성 이름에 도달하는가」 전수 게이트.
 *
 * 앞선 판이 `u-input`·`u-select`·네이티브 셋만 실측해 놓고 나머지 일곱은 **소스 재배선만**
 * 했었다 — 이 리포가 반복 기록한 «배선 ≠ 도달» 그대로다. 전수로 재 보니 셋이 도달하지
 * 않았다: `u-file-input`(포커스 대상이 «파일 선택» 버튼이다) · `u-checkbox`·`u-switch`
 * (네이티브 라벨 감싸개가 이름을 만드는 구조라, 감싸개가 비면 이름이 별표 하나였다).
 *
 * ⚠**이 스위트의 대상 목록은 손으로 쓴다.** 어떤 태그가 «폼 컨트롤인가»는 리포에서 도출할
 * 수 있는 사실이 아니라 이 패키지의 지식이다(`u-form`·`u-option` 은 값을 받는 컨트롤이
 * 아니다). 새 폼 컨트롤을 만들면 여기 한 줄을 더해야 하고, 더하지 않으면 그 컨트롤은
 * 이 게이트의 시야 밖이다 — 그 사실을 여기 적어 둔다.
 *
 * ★NEGATIVE: 자기 이름을 가진 컨트롤은 덮이지 않아야 한다(WCAG SC 2.5.3 Label in Name).
 */

/** [태그, 접근성 이름을 갖는 내부 노드의 선택자] */
const CONTROLS: Array<[string, string]> = [
  ['u-input', 'input'],
  ['u-textarea', 'textarea'],
  ['u-select', '[role="combobox"]'],
  ['u-date-picker', '[role="combobox"]'],
  ['u-file-input', 'button.trigger'],
  ['u-checkbox', 'input'],
  ['u-radio', '[role="radiogroup"]'],
  ['u-switch', 'input'],
  ['u-slider', '[role="slider"]'],
  ['u-rating', '[role="radiogroup"]'],
];

async function settle(): Promise<void> {
  const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 120));
}

describe('u-field 라벨 → 폼 컨트롤 접근성 이름 전수 도달', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it.each(CONTROLS)('%s 가 바깥 필드 라벨을 접근성 이름으로 받는다', async (tag, sel) => {
    document.body.innerHTML = `<u-field label="FieldLabel"><${tag} id="c"></${tag}></u-field>`;
    await settle();
    const inner = document.getElementById('c')!.shadowRoot!.querySelector(sel);
    expect(inner, `${tag}: ${sel} 를 찾지 못했다 — 내부 구조가 바뀌었으면 이 표를 함께 고칠 것`).not.toBeNull();
    expect(inner!.getAttribute('aria-label')).toContain('FieldLabel');
  });

  it('u-file-input 은 «덮지 않고 합성»한다 — 보이는 글자가 이름 안에 남는다 (SC 2.5.3)', async () => {
    document.body.innerHTML = '<u-field label="Attachment"><u-file-input id="c"></u-file-input></u-field>';
    await settle();
    const trigger = document.getElementById('c')!.shadowRoot!.querySelector('button.trigger')!;
    const name = trigger.getAttribute('aria-label')!;
    expect(name).toContain(trigger.textContent!.trim());
    expect(name).toContain('Attachment');
  });

  // ── NEGATIVE ────────────────────────────────────────────────────────────────

  it('NEGATIVE: 슬롯에 라벨 텍스트를 가진 체크박스는 덮이지 않는다', async () => {
    document.body.innerHTML = '<u-field label="Outer"><u-checkbox id="c">I agree</u-checkbox></u-field>';
    await settle();
    expect(document.getElementById('c')!.shadowRoot!.querySelector('input')!.hasAttribute('aria-label')).toBe(false);
  });

  it('NEGATIVE: 자기 label 을 가진 스위치는 덮이지 않는다', async () => {
    document.body.innerHTML = '<u-field label="Outer"><u-switch id="c" label="Own"></u-switch></u-field>';
    await settle();
    expect(document.getElementById('c')!.shadowRoot!.querySelector('input')!.hasAttribute('aria-label')).toBe(false);
  });

  it('NEGATIVE: 필드 라벨이 없으면 u-file-input 트리거는 자기 글자만 갖는다', async () => {
    document.body.innerHTML = '<u-file-input id="c"></u-file-input>';
    await settle();
    expect(document.getElementById('c')!.shadowRoot!.querySelector('button.trigger')!.hasAttribute('aria-label')).toBe(false);
  });
});

/**
 * 같은 표의 두 번째 축 — 「비활성이 **그 접근성 노드**에 도달하는가」.
 *
 * 이름이 도달해야 하는 노드와 비활성이 도달해야 하는 노드는 같은 노드다(역할을 가진 노드가
 * 상태도 가진다). 그래서 표를 복제하지 않고 여기서 다시 쓴다 — 새 폼 컨트롤을 표에 더하면
 * 두 축이 함께 그것을 본다.
 *
 * 결함: `u-select`·`u-date-picker`(콤보박스 `div`)와 `u-radio`·`u-rating`(`radiogroup`)은
 * 비활성일 때 동작만 막고 **사실을 내지 않았다** — 네이티브 `disabled` 가 없는 노드인데
 * `aria-disabled` 도 없었다. 보조기술은 아무것도 읽지 않았고, 자동화 도구(Playwright
 * actionability)는 «활성»으로 보고 클릭했다가 그 클릭이 조용히 삼켜졌다.
 *
 * 판정: 네이티브 `disabled` 이거나 `aria-disabled="true"`.
 */
describe('폼 컨트롤 비활성 → 접근성 노드 전수 도달', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  const exposesDisabled = (node: Element) =>
    (node as HTMLElement & { disabled?: boolean }).disabled === true ||
    node.getAttribute('aria-disabled') === 'true';

  it.each(CONTROLS)('%s: disabled 가 내부 접근성 노드에 드러난다', async (tag, sel) => {
    document.body.innerHTML = `<${tag} id="c" disabled></${tag}>`;
    await settle();
    const inner = document.getElementById('c')!.shadowRoot!.querySelector(sel);
    expect(inner, `${tag}: ${sel} 를 찾지 못했다 — 내부 구조가 바뀌었으면 이 표를 함께 고칠 것`).not.toBeNull();
    expect(exposesDisabled(inner!)).toBe(true);
  });

  it.each(CONTROLS)('NEGATIVE: %s: 비활성을 풀면 그 표시도 사라진다', async (tag, sel) => {
    document.body.innerHTML = `<${tag} id="c" disabled></${tag}>`;
    await settle();
    const host = document.getElementById('c') as HTMLElement & { disabled: boolean };
    host.disabled = false;
    await settle();
    expect(exposesDisabled(host.shadowRoot!.querySelector(sel)!)).toBe(false);
  });
});
