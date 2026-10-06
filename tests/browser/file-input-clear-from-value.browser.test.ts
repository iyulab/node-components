import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/file-input/UFileInput.js';
import type { UFileInput } from '../../src/components/file-input/UFileInput.js';

/**
 * 바깥에서 `value` 를 비우면 안쪽 `<input type=file>` 도 빈다 — `reset()` 과 같은 결과.
 *
 * 결함: 폼 값만 동기화하고 안쪽 입력은 이전 선택을 들고 있었다. 상태에서 값을 내려주는 소비자(React 등)가 업로드 뒤
 * `null` 로 돌리면 화면은 «선택 없음» 인데, 사용자가 같은 파일을 다시 고르면 브라우저가 `change` 를 내지 않아 아무 일도
 * 일어나지 않았다.
 */
const nativeOf = (picker: UFileInput) => picker.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;

function select(picker: UFileInput, files: File[]): void {
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  nativeOf(picker).files = dt.files;
  nativeOf(picker).dispatchEvent(new Event('change', { bubbles: true }));
}

describe('UFileInput — value 를 비우면 안쪽 입력도 빈다', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it.each([
    ['null', null],
    ['빈 배열', []],
  ])('value = %s', async (_label, empty) => {
    const picker = document.createElement('u-file-input') as UFileInput;
    document.body.appendChild(picker);
    await picker.updateComplete;
    select(picker, [new File(['a'], 'a.txt', { type: 'text/plain' })]);
    await picker.updateComplete;
    expect(nativeOf(picker).files?.length).toBe(1);

    picker.value = empty as File[] | null;
    await picker.updateComplete;
    expect(nativeOf(picker).files?.length ?? 0).toBe(0);
    expect(nativeOf(picker).value).toBe('');
  });

  it('NEGATIVE — 선택이 남아 있는 동안은 건드리지 않는다', async () => {
    const picker = document.createElement('u-file-input') as UFileInput;
    document.body.appendChild(picker);
    await picker.updateComplete;
    const file = new File(['a'], 'a.txt', { type: 'text/plain' });
    select(picker, [file]);
    await picker.updateComplete;
    expect(picker.value).toEqual([file]);
    expect(nativeOf(picker).files?.length).toBe(1);
  });
});
