import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/input/UInput.js';
import '../../src/components/field/UField.js';
import '../../src/components/option-group/UOptionGroup.js';
import '../../src/components/option/UOption.js';
import '../../src/components/select/USelect.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import '../../src/components/tooltip/UTooltip.js';
import { setCustomState, hasCustomState } from '../../src/utilities/customState.js';

/** 컨트롤이 쥔 `ElementInternals`(보호된 필드) — 시험은 상태 집합을 직접 만져 본다. */
function internalsOf(el: Element): ElementInternals {
  return (el as unknown as { internals: ElementInternals }).internals;
}

/**
 * Chromium 90–124 의 `CustomStateSet` 은 `--` 로 시작하지 않는 이름을 `SyntaxError` 로 거부한다(`:state(x)` 를 125 에서야
 * 접두 없이 받는다). 그런 엔진을 이 창에서 흉내 낸다 — `add`/`delete` 가 접두 없는 이름에 던지게 고친다. 지금 Chromium 은
 * 접두 있는 이름도 같은 집합에 담으므로 «`--이름` 이 섰는가» 를 `:state(--이름)` 으로 읽을 수 있다.
 *
 * 소비자 현장(Chrome/Edge 109 · Windows 7/8.1 — GA4 의 `SyntaxError` 16건 · 13명)에서는 컨트롤이 연결될 때
 * `states.add('field')` 가 던져 연결 반응이 예외로 끝났다. 이 시험은 «던지지 않는다 · 접두 형이 선다» 를 지킨다.
 */
describe('custom states on an engine that only takes `--`-prefixed names (Chromium 90–124)', () => {
  const originalAdd = CustomStateSet.prototype.add;
  const originalDelete = CustomStateSet.prototype.delete;
  let errors: unknown[] = [];
  const onError = (e: ErrorEvent) => { errors.push(e.error ?? e.message); e.preventDefault(); };

  function reject(name: unknown): void {
    if (typeof name === 'string' && !name.startsWith('--')) {
      throw new DOMException(`Failed to execute 'add' on 'CustomStateSet': The specified value '${name}' must start with '--'.`, 'SyntaxError');
    }
  }

  beforeEach(() => {
    document.body.innerHTML = '';
    errors = [];
    window.addEventListener('error', onError);
    CustomStateSet.prototype.add = function (this: CustomStateSet, value: string) { reject(value); return originalAdd.call(this, value); };
    CustomStateSet.prototype.delete = function (this: CustomStateSet, value: string) { reject(value); return originalDelete.call(this, value); };
  });

  afterEach(() => {
    CustomStateSet.prototype.add = originalAdd;
    CustomStateSet.prototype.delete = originalDelete;
    window.removeEventListener('error', onError);
  });

  async function mount(markup: string): Promise<HTMLElement> {
    const box = document.createElement('div');
    box.innerHTML = markup;
    document.body.appendChild(box);
    await Promise.all([...box.querySelectorAll('*')].map((el) => (el as { updateComplete?: Promise<unknown> }).updateComplete));
    return box;
  }

  it('the stand-in really rejects an unprefixed name (control)', () => {
    const el = document.createElement('u-input');
    document.body.appendChild(el);
    expect(() => internalsOf(el).states.add('x')).toThrow(/must start with '--'/);
  });

  it('setCustomState falls back to the `--` form instead of throwing', () => {
    const host = document.createElement('u-input');
    document.body.appendChild(host);
    setCustomState(internalsOf(host), 'probe', true);
    expect(host.matches(':state(--probe)')).toBe(true);
    expect(hasCustomState(host, 'probe')).toBe(true);
    setCustomState(internalsOf(host), 'probe', false);
    expect(host.matches(':state(--probe)')).toBe(false);
    expect(hasCustomState(host, 'probe')).toBe(false);
  });

  it('setCustomState tolerates an engine without `ElementInternals.states`', () => {
    expect(() => setCustomState({} as ElementInternals, 'probe', true)).not.toThrow();
    expect(() => setCustomState(undefined, 'probe', false)).not.toThrow();
  });

  it('form controls connect without an exception and carry the `field` state', async () => {
    const box = await mount('<u-input></u-input><u-select></u-select><u-date-picker></u-date-picker><u-date-range-picker></u-date-range-picker>');
    expect(errors).toEqual([]);
    for (const tag of ['u-input', 'u-select', 'u-date-picker', 'u-date-range-picker']) {
      expect(box.querySelector(tag)!.matches(':state(--field)'), tag).toBe(true);
    }
  });

  it('u-field carries `field`', async () => {
    const box = await mount('<u-field label="Name"><u-input></u-input></u-field>');
    expect(errors).toEqual([]);
    expect(box.querySelector('u-field')!.matches(':state(--field)')).toBe(true);
  });

  it('u-select and the pickers publish `open` while their popover shows', async () => {
    const box = await mount('<u-select><u-option value="a">A</u-option></u-select><u-date-picker></u-date-picker><u-date-range-picker></u-date-range-picker>');
    for (const tag of ['u-select', 'u-date-picker', 'u-date-range-picker']) {
      const el = box.querySelector(tag) as HTMLElement & { open: boolean; updateComplete: Promise<unknown> };
      el.open = true;
      await el.updateComplete;
      expect(el.matches(':state(--open)'), `${tag} open`).toBe(true);
      el.open = false;
      await el.updateComplete;
      expect(el.matches(':state(--open)'), `${tag} closed`).toBe(false);
    }
    expect(errors).toEqual([]);
  });

  it('u-option-group publishes `empty` while every option is hidden', async () => {
    const box = await mount('<u-option-group label="G"><u-option value="a">A</u-option></u-option-group>');
    const group = box.querySelector('u-option-group') as HTMLElement;
    expect(group.matches(':state(--empty)')).toBe(false);
    box.querySelector('u-option')!.toggleAttribute('hidden', true);
    // 옵션의 `hidden` 변화는 MutationObserver 가 다시 읽는다 — 마이크로태스크 뒤.
    await new Promise((r) => requestAnimationFrame(r));
    expect(errors).toEqual([]);
    expect(group.matches(':state(--empty)')).toBe(true);
    box.querySelector('u-option')!.toggleAttribute('hidden', false);
    await new Promise((r) => requestAnimationFrame(r));
    expect(group.matches(':state(--empty)')).toBe(false);
  });

  it('a floating element parks while closed (`parked`), so it does not stay in the layout', async () => {
    const box = await mount('<button id="a">anchor</button><u-tooltip>tip</u-tooltip>');
    const tip = box.querySelector('u-tooltip') as HTMLElement;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    expect(errors).toEqual([]);
    expect(tip.matches(':state(--parked)')).toBe(true);
  });
});

/**
 * 스타일시트는 두 형을 한 규칙에 쓴다 — `:is(:state(x), :--x)`. 125+ 는 `:--x` 를, 90–124 는 `:state(x)` 를 모르는 선택자로
 * 보는데, `:is()` 는 그런 선택자를 버리고 나머지로 계속한다(선택자 목록에 그냥 섞으면 규칙이 통째로 죽는다). 이 창은 125+ 라
 * 낡은 쪽 절반은 못 보지만, 모르는 쪽을 버리고 아는 쪽이 일하는 것 자체는 여기서 잴 수 있다.
 */
describe('hasCustomState and the two-form selector', () => {
  it('an unknown pseudo-class inside :is() does not kill the rule', () => {
    const host = document.createElement('u-input');
    document.body.appendChild(host);
    setCustomState(internalsOf(host), 'probe', true);
    expect(host.matches(':is(:state(probe), :--probe)')).toBe(true);
    expect(host.matches(':is(:--probe, :state(probe))')).toBe(true);
    // 대조: 같은 두 형을 그냥 목록에 섞으면 모르는 쪽 때문에 해석 자체가 던진다.
    expect(() => host.matches(':state(probe), :--probe')).toThrow();
  });

  it('reports the state, and says no for a state that is not there', () => {
    const host = document.createElement('u-input');
    document.body.appendChild(host);
    expect(hasCustomState(host, 'probe')).toBe(false);
    setCustomState(internalsOf(host), 'probe', true);
    expect(hasCustomState(host, 'probe')).toBe(true);
    setCustomState(internalsOf(host), 'probe', false);
    expect(hasCustomState(host, 'probe')).toBe(false);
  });
});
