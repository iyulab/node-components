import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/file-input/UFileInput.js';
import type { UFileInput } from '../../src/components/file-input/UFileInput.js';

function createFileInput(attrs: Record<string, string> = {}): UFileInput {
  const el = document.createElement('u-file-input') as UFileInput;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function mountInForm(attrs: Record<string, string> = {}): { form: HTMLFormElement; picker: UFileInput } {
  const form = document.createElement('form');
  const picker = createFileInput({ name: 'q', ...attrs });
  form.appendChild(picker);
  document.body.appendChild(form);
  return { form, picker };
}

/** 네이티브 file input은 `.files`를 직접 대입할 수 없다 — 실브라우저에서 통용되는
 *  방법대로 `DataTransfer`로 FileList를 만들어 대입한 뒤 실제 `change`를 dispatch해,
 *  `UFileInput.handleInputChange`가 타는 것과 같은 경로로 선택을 시뮬레이션한다. */
function selectFiles(picker: UFileInput, files: File[]): void {
  const nativeInput = picker.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;
  const dt = new DataTransfer();
  for (const file of files) dt.items.add(file);
  nativeInput.files = dt.files;
  nativeInput.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('UFileInput — 폼 제출값이 선택 상태와 동기화된다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('선택된 파일이 없으면 제출값도 없다', async () => {
    const { form, picker } = mountInForm();
    await picker.updateComplete;

    expect(new FormData(form).get('q')).toBeNull();
  });

  it('파일 1개 선택 시 File 그대로 제출값에 반영된다', async () => {
    const { form, picker } = mountInForm();
    await picker.updateComplete;

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    selectFiles(picker, [file]);
    await picker.updateComplete;

    expect(picker.value).toEqual([file]);
    const submitted = new FormData(form).get('q');
    expect(submitted).toBeInstanceOf(File);
    expect((submitted as File).name).toBe('hello.txt');
  });

  it('여러 파일 선택 시 같은 name으로 반복 append된 제출값을 낸다', async () => {
    const { form, picker } = mountInForm({ multiple: '' });
    await picker.updateComplete;

    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
    ];
    selectFiles(picker, files);
    await picker.updateComplete;

    expect(picker.value).toEqual(files);
    const submitted = new FormData(form).getAll('q');
    expect(submitted).toHaveLength(2);
    expect((submitted[0] as File).name).toBe('a.txt');
    expect((submitted[1] as File).name).toBe('b.txt');
  });

  it('지우기 버튼 클릭 시 선택이 비워지고 input/change 이벤트가 발생한다', async () => {
    const { form, picker } = mountInForm();
    await picker.updateComplete;
    selectFiles(picker, [new File(['x'], 'x.txt')]);
    await picker.updateComplete;
    expect(picker.value).not.toBeNull();

    const events: string[] = [];
    picker.addEventListener('input', () => events.push('input'));
    picker.addEventListener('change', () => events.push('change'));

    const clearBtn = picker.shadowRoot!.querySelector('.clear-btn') as HTMLElement;
    clearBtn.dispatchEvent(new PointerEvent('click', { bubbles: true }));
    await picker.updateComplete;

    expect(picker.value).toBeNull();
    expect(new FormData(form).get('q')).toBeNull();
    expect(events).toEqual(['input', 'change']);
  });

  it('required인데 파일이 없으면 validate()가 false를 반환하고 invalid를 세운다', async () => {
    const { picker } = mountInForm({ required: '' });
    await picker.updateComplete;

    expect(picker.validate()).toBe(false);
    expect(picker.invalid).toBe(true);

    selectFiles(picker, [new File(['x'], 'x.txt')]);
    await picker.updateComplete;

    expect(picker.validate()).toBe(true);
    expect(picker.invalid).toBe(false);
  });

  it('reset()은 선택과 invalid 상태를 함께 초기화한다', async () => {
    const { picker } = mountInForm({ required: '' });
    await picker.updateComplete;
    selectFiles(picker, [new File(['x'], 'x.txt')]);
    await picker.updateComplete;
    picker.validate();

    picker.reset();
    await picker.updateComplete;

    expect(picker.value).toBeNull();
    expect(picker.invalid).toBe(false);
  });
});
