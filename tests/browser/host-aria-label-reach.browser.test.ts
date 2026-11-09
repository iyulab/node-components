import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/index.js';

/**
 * 「호스트에 단 `aria-label` 이 안쪽 포커스 대상에 **도달하고, 연결 뒤에 바뀌어도 따라가는가**」 전수.
 *
 * 호스트의 `aria-label` 은 섀도 경계를 넘지 않는다 — 안쪽의 `<a>`·`<button>`·`<input>` 에 `render()` 가 옮겨 줘야 접근성
 * 이름이 생긴다. 그런데 이 속성은 Lit 의 선언된 프로퍼티가 아니라 `observedAttributes` 에 없고, 없는 속성은 연결 뒤에
 * 바뀌어도 아무것도 불리지 않는다. 처방(`static forwardedAttributes` — `UElement`)은 한때 `u-button` 한 곳에만 있었고,
 * `u-card` 링크는 «처음 그릴 때만» 맞았으며 `u-breadcrumb-item` 링크는 호스트 이름을 아예 옮기지 않았다.
 *
 * ⚠**이 스위트의 대상 목록은 손으로 쓴다**(`field-name-reach-census` 와 같다) — 어떤 컴포넌트가 «안쪽 요소에 이름을 옮겨야
 * 하는가» 는 리포에서 도출할 수 없는 이 패키지의 지식이다. 새 컴포넌트가 안쪽 링크·버튼·입력에 호스트 이름을 옮기면 여기
 * 한 줄을 더한다 — 더하지 않으면 그 컴포넌트는 이 게이트의 시야 밖이다. (시범 검사)
 */

/** [태그, 호스트 속성, 호스트 안의 글, 이름을 받는 내부 노드의 선택자] */
const FORWARDING: Array<[string, string, string, string]> = [
  ['u-button', '', 'x', 'button'],
  ['u-button', 'href="#"', 'x', 'a'],
  ['u-icon-button', 'name="x"', '', 'button'],
  ['u-card', 'href="#"', 'x', 'a'],
  ['u-breadcrumb-item', 'href="#"', 'x', 'a'],
  ['u-input', '', '', 'input'],
  ['u-textarea', '', '', 'textarea'],
  ['u-checkbox', '', '', 'input'],
  ['u-switch', '', '', 'input'],
  ['u-slider', '', '', '[role="slider"]'],
];

async function settle(): Promise<void> {
  const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 100));
}

/** 호스트의 섀도 안에서(아이콘 버튼처럼 한 겹 더 들어간 경우까지) 선택자에 맞는 첫 노드. */
function deepFind(root: Element, sel: string): Element | null {
  const direct = root.shadowRoot?.querySelector(sel);
  if (direct) return direct;
  for (const child of Array.from(root.shadowRoot?.querySelectorAll('*') ?? [])) {
    const hit = deepFind(child, sel);
    if (hit) return hit;
  }
  return null;
}

describe('호스트 aria-label → 안쪽 포커스 대상 도달', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it.each(FORWARDING)('%s[%s] 은 처음부터 단 이름을 안쪽에 싣는다', async (tag, attrs, text, sel) => {
    document.body.innerHTML = `<${tag} id="c" ${attrs} aria-label="Static name">${text}</${tag}>`;
    await settle();
    const inner = deepFind(document.getElementById('c')!, sel);
    expect(inner, `${tag}: ${sel} 를 찾지 못했다 — 내부 구조가 바뀌었으면 이 표를 함께 고칠 것`).not.toBeNull();
    expect(inner!.getAttribute('aria-label')).toBe('Static name');
  });

  it.each(FORWARDING)('%s[%s] 은 연결 뒤에 바뀐 이름도 따라간다', async (tag, attrs, text, sel) => {
    document.body.innerHTML = `<${tag} id="c" ${attrs}>${text}</${tag}>`;
    await settle();
    const host = document.getElementById('c')!;
    host.setAttribute('aria-label', 'First');
    await settle();
    expect(deepFind(host, sel)!.getAttribute('aria-label')).toBe('First');
    host.setAttribute('aria-label', 'Second');
    await settle();
    expect(deepFind(host, sel)!.getAttribute('aria-label')).toBe('Second');
  });

  // ── NEGATIVE ─────────────────────────────────────────────────────────────

  it('NEGATIVE: 슬롯에 글이 있는 체크박스는 보이는 라벨을 호스트 이름으로 덮지 않는다 (SC 2.5.3)', async () => {
    document.body.innerHTML = '<u-checkbox id="c" aria-label="Host">Visible label</u-checkbox>';
    await settle();
    expect(deepFind(document.getElementById('c')!, 'input')!.hasAttribute('aria-label')).toBe(false);
  });

  it('NEGATIVE: 자기 이름을 가진 복사 버튼은 호스트 이름으로 덮이지 않는다', async () => {
    document.body.innerHTML = '<u-copy-button id="c" aria-label="Host"></u-copy-button>';
    await settle();
    expect(deepFind(document.getElementById('c')!, 'button')!.getAttribute('aria-label')).not.toBe('Host');
  });

  it('NEGATIVE: 이름을 지우면 안쪽에서도 사라진다(옛 값이 남지 않는다)', async () => {
    document.body.innerHTML = '<u-card id="c" href="#" aria-label="Gone">x</u-card>';
    await settle();
    const host = document.getElementById('c')!;
    host.removeAttribute('aria-label');
    await settle();
    expect(deepFind(host, 'a')!.hasAttribute('aria-label')).toBe(false);
  });
});
