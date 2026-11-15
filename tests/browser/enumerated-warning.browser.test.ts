import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/components/button/UButton.js';
import { resetDevWarnings } from '../../src/utilities/devWarning.js';

/**
 * **열거형 속성의 목록 밖 값 — 개발 모드 한 번 경고** (`UElement.enumerated` · 소비자 보고 `#2663`).
 *
 * 템플릿의 속성 문자열은 타입 검사를 받지 않고, 목록 밖의 값(`appearance="filled"`)은 어떤 스타일 규칙에도 안 걸려 **에러 없이
 * 기본 모양으로 떨어진다** — 현재 탭 표시가 통째로 사라졌는데 콘솔이 비어 있었다. 계약은 셋이다: 목록 밖이면 **한 번**(같은
 * 요소 · 속성 · 값) · 목록 안이면 **0회** · 렌더 결과는 그대로. ★NEGATIVE 가 절반이다 — 정당한 값 · 비어 있는 값에 발화하면
 * 경고는 무시당한다. 게시본(dist)이 같은 계약을 지키는지는 `tests/build/dev-warning-dist.test.ts` 의 몫이다.
 */
describe('열거형 속성 — 목록 밖 값 경고', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    document.body.innerHTML = '';
    resetDevWarnings();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  /** 토큰 시트 부재 경고(UElement)는 같은 네임스페이스의 «다른» 경고라 세지 않는다. */
  const ours = () => (warn.mock.calls as unknown[][]).map((c) => String(c[0])).filter((m) => m.includes(' is not a value of '));

  type Btn = HTMLElement & { updateComplete: Promise<unknown>; appearance?: string; color?: string; size?: string };
  async function mount(attrs: Record<string, string>): Promise<Btn> {
    const el = document.createElement('u-button') as Btn;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('목록 밖의 appearance 는 한 번 경고하고, 무엇을 쓰면 되는지 적는다', async () => {
    await mount({ appearance: 'filled' });
    const msgs = ours();
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('[@iyulab/components]');
    expect(msgs[0]).toContain('<u-button appearance="filled">');
    expect(msgs[0]).toContain('solid, soft, outlined, plain, link');
  });

  it('같은 요소 · 속성 · 값은 몇 개를 더 그려도 한 번이다 — 다른 값은 따로 한 번', async () => {
    await mount({ appearance: 'filled' });
    await mount({ appearance: 'filled' });
    expect(ours()).toHaveLength(1);
    await mount({ appearance: 'text' });
    expect(ours()).toHaveLength(2);
  });

  it('color · size 도 같은 규칙을 따른다', async () => {
    await mount({ color: 'brand', size: 'xl' });
    const msgs = ours();
    expect(msgs).toHaveLength(2);
    expect(msgs.some((m) => m.includes('color="brand"'))).toBe(true);
    expect(msgs.some((m) => m.includes('size="xl"'))).toBe(true);
  });

  it('연결된 뒤 속성이 목록 밖 값으로 바뀌어도 알린다', async () => {
    const el = await mount({ appearance: 'solid' });
    expect(ours()).toHaveLength(0);
    el.setAttribute('appearance', 'text');
    await el.updateComplete;
    expect(ours()).toHaveLength(1);
    el.appearance = 'ghost';
    await el.updateComplete;
    expect(ours()).toHaveLength(2);
  });

  it('NEGATIVE — 정당한 값 · 주지 않은 값 · 기본값은 침묵한다', async () => {
    await mount({});
    for (const appearance of ['solid', 'soft', 'outlined', 'plain', 'link']) await mount({ appearance });
    for (const color of ['neutral', 'primary', 'danger', 'purple']) await mount({ color });
    for (const size of ['sm', 'md', 'lg']) await mount({ size });
    await mount({ color: '' });
    expect(ours()).toEqual([]);
  });

  it('렌더 결과는 바꾸지 않는다 — 속성은 그대로 반영되고 안쪽 버튼이 그려진다', async () => {
    const el = await mount({ appearance: 'filled' });
    expect(el.getAttribute('appearance')).toBe('filled');
    expect(el.shadowRoot!.querySelector('button, a')).not.toBeNull();
  });
});
