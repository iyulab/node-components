import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-select[searchable]` 의 검색 입력은 **이름을 가진다** (SC 4.1.2 Name, Role, Value).
 *
 * 종전 입력은 `aria-label`·`placeholder`·`<label>` 이 하나도 없어, 보조기술에는 이름 없는
 * «편집 가능한 텍스트» 로만 읽혔다 — 무엇을 입력하는 칸인지 알 수 없다. 이름은 로케일
 * 메시지 `search` 에서 온다.
 */
describe('u-select 검색 입력 — 접근성 이름', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    Locale.set('en');
  });

  async function mount(): Promise<HTMLInputElement> {
    document.body.innerHTML =
      '<u-select searchable style="width:200px"><u-option value="a">A</u-option></u-select>';
    const select = document.querySelector('u-select') as HTMLElement & { updateComplete: Promise<boolean> };
    await select.updateComplete;
    return select.shadowRoot!.querySelector('.search-input input') as HTMLInputElement;
  }

  it('검색 입력은 로케일의 «Search» 로 이름 붙는다', async () => {
    // ⚠브라우저 프로젝트의 기본 로케일은 OS 를 따른다 — 명시한다.
    Locale.set('en');
    const input = await mount();
    expect(input.getAttribute('aria-label')).toBe('Search');
  });

  it('활성 로케일을 따른다 (ko → «검색»)', async () => {
    Locale.set('ko');
    const input = await mount();
    expect(input.getAttribute('aria-label')).toBe('검색');
  });
});
