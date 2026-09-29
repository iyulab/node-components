import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/index.js';

/**
 * 조상 `<fieldset disabled>` 로 비활성인 폼 컨트롤은 **자기 `disabled` 로 비활성인 것과 똑같아야** 한다
 * (form-associated 표준 콜백 `formDisabledCallback`).
 *
 * 컨트롤마다 «비활성의 모양» 을 적지 않는다 — 두 경로의 관측값이 **같은가** 만 잰다. 그래서 대상은
 * 손으로 쓴 목록이 아니라 **`formAssociated` 를 선언한 등록 클래스 전부**에서 도출한다.
 */

type Host = HTMLElement & { updateComplete?: Promise<unknown>; disabled?: boolean };

const modules = import.meta.glob('../../src/components/**/U*.ts', { eager: true }) as Record<string, Record<string, unknown>>;
const TAGS = [...new Set(
  Object.values(modules).flatMap((m) => Object.values(m))
    .filter((v): v is CustomElementConstructor => typeof v === 'function' && (v as { formAssociated?: boolean }).formAssociated === true)
    .map((cls) => customElements.getName(cls))
    .filter((t): t is string => !!t),
)].sort();

async function settle(): Promise<void> {
  const all = Array.from(document.body.querySelectorAll('*')) as Host[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 60));
  for (const el of all) if (el.updateComplete) await el.updateComplete;
}

/** 섀도 트리를 (중첩까지) 훑는다. */
function* deep(root: ParentNode): Generator<Element> {
  for (const el of Array.from(root.querySelectorAll('*'))) {
    yield el;
    if (el.shadowRoot) yield* deep(el.shadowRoot);
  }
}

function deepActive(): Element | null {
  let a: Element | null = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
}

/** 비활성과 관련된 관측값 — 상호작용·접근성 축. */
function behavior(el: Host) {
  const inner = el.shadowRoot ? [...deep(el.shadowRoot)] : [];
  el.focus();
  const active = deepActive();
  const focusReached = !!active && (active === el || el.contains(active) || inner.includes(active));
  (active as HTMLElement | null)?.blur?.();
  return {
    matchesDisabled: el.matches(':disabled'),
    nativeDisabled: inner.filter((n) => 'disabled' in n && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(n.tagName))
      .map((n) => (n as HTMLInputElement).disabled),
    ariaDisabled: inner.filter((n) => n.hasAttribute('aria-disabled')).map((n) => n.getAttribute('aria-disabled')),
    tabindex: inner.filter((n) => n.hasAttribute('tabindex')).map((n) => n.getAttribute('tabindex')),
    focusReached,
  };
}

/** 비활성의 모양 — 전이(transition)가 끼지 않도록 «처음부터 그 상태로» 마운트한 것끼리만 비교한다. */
function look(el: Host) {
  const nodes = [el, ...(el.shadowRoot ? deep(el.shadowRoot) : [])] as Element[];
  return nodes.map((n) => {
    const cs = getComputedStyle(n);
    return [cs.opacity, cs.cursor, cs.backgroundColor, cs.color, cs.pointerEvents].join('|');
  });
}

async function mount(markup: string): Promise<Host> {
  document.body.innerHTML = `<form>${markup}</form>`;
  await settle();
  return document.getElementById('c') as Host;
}

describe('fieldset 비활성 = 자기 disabled (form-associated 전부)', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('대상이 도출된다 — 폼 컨트롤과 버튼이 들어 있다', () => {
    expect(TAGS).toContain('u-input');
    expect(TAGS).toContain('u-button');
    expect(TAGS.length).toBeGreaterThanOrEqual(11);
  });

  it.each(TAGS)('%s: 동작·접근성이 자기 disabled 와 같다', async (tag) => {
    const own = behavior(await mount(`<${tag} id="c" name="x" disabled></${tag}>`));
    const viaFieldset = behavior(await mount(`<fieldset disabled><${tag} id="c" name="x"></${tag}></fieldset>`));
    expect(viaFieldset).toEqual(own);
    expect(own.focusReached).toBe(false);
  });

  it.each(TAGS)('%s: 모양이 자기 disabled 와 같다', async (tag) => {
    const own = look(await mount(`<${tag} id="c" name="x" disabled></${tag}>`));
    const viaFieldset = look(await mount(`<fieldset disabled><${tag} id="c" name="x"></${tag}></fieldset>`));
    expect(viaFieldset).toEqual(own);
  });

  it.each(TAGS)('NEGATIVE %s: fieldset 을 다시 켜면 활성으로 돌아온다', async (tag) => {
    const enabled = behavior(await mount(`<${tag} id="c" name="x"></${tag}>`));
    const el = await mount(`<fieldset disabled><${tag} id="c" name="x"></${tag}></fieldset>`);
    (el.closest('fieldset') as HTMLFieldSetElement).disabled = false;
    await settle();
    expect(behavior(el)).toEqual(enabled);
  });

  it.each(TAGS)('%s: 사용자 disabled 는 fieldset 을 켰다 꺼도 남는다', async (tag) => {
    const own = behavior(await mount(`<${tag} id="c" name="x" disabled></${tag}>`));
    const el = await mount(`<fieldset disabled><${tag} id="c" name="x" disabled></${tag}></fieldset>`);
    (el.closest('fieldset') as HTMLFieldSetElement).disabled = false;
    await settle();
    expect(el.disabled).toBe(true);
    expect(behavior(el)).toEqual(own);
  });

  it('fieldset 안의 제출 버튼은 폼을 제출하지 않는다', async () => {
    const btn = await mount(`<fieldset disabled><u-button id="c" type="submit">Save</u-button></fieldset>`);
    let submitted = 0;
    btn.closest('form')!.addEventListener('submit', (e) => { e.preventDefault(); submitted++; });
    btn.shadowRoot!.querySelector('button')!.click();
    btn.click();
    await settle();
    expect(submitted).toBe(0);
  });
});
