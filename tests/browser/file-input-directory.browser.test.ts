import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/file-input/UFileInput.js';
import type { UFileInput } from '../../src/components/file-input/UFileInput.js';
import { Locale } from '../../src/utilities/Locale.js';

function mountInForm(attrs: Record<string, string> = {}): { form: HTMLFormElement; picker: UFileInput } {
  const form = document.createElement('form');
  const picker = document.createElement('u-file-input') as UFileInput;
  picker.setAttribute('name', 'q');
  for (const [k, v] of Object.entries(attrs)) picker.setAttribute(k, v);
  form.appendChild(picker);
  document.body.appendChild(form);
  return { form, picker };
}

const nativeOf = (picker: UFileInput) => picker.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement;
const triggerOf = (picker: UFileInput) => picker.shadowRoot!.querySelector('.trigger') as HTMLButtonElement;
const statusOf = (picker: UFileInput) => picker.shadowRoot!.querySelector('.status')!.textContent!.trim();

/** 폴더에서 고른 파일 — 브라우저가 채우는 `webkitRelativePath` 는 생성자로 줄 수 없어 인스턴스에 얹는다. */
function folderFile(path: string): File {
  const file = new File(['x'], path.split('/').pop()!, { type: 'text/plain' });
  Object.defineProperty(file, 'webkitRelativePath', { value: path });
  return file;
}

/** 실브라우저에서 통용되는 방법 — `DataTransfer` 로 FileList 를 만들어 대입하고 실제 `change` 를 낸다. */
function select(picker: UFileInput, files: File[]): void {
  const input = nativeOf(picker);
  const dt = new DataTransfer();
  for (const file of files) dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('UFileInput — directory (폴더 선택)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Locale.set('en');
  });
  afterEach(() => Locale.set('en'));

  it('기본은 파일 모드 — 안쪽 입력에 webkitdirectory 가 없다', async () => {
    const { picker } = mountInForm();
    await picker.updateComplete;
    expect(nativeOf(picker).webkitdirectory).toBe(false);
    expect(nativeOf(picker).hasAttribute('webkitdirectory')).toBe(false);
    expect(triggerOf(picker).textContent!.trim()).toBe('Choose file');
  });

  it('directory 를 켜면 안쪽 입력이 폴더를 고르고(multiple 함의) 트리거가 «폴더» 를 말한다', async () => {
    const { picker } = mountInForm({ directory: '' });
    await picker.updateComplete;
    expect(picker.directory).toBe(true);
    expect(nativeOf(picker).webkitdirectory).toBe(true);
    expect(nativeOf(picker).multiple).toBe(true);
    expect(triggerOf(picker).textContent!.trim()).toBe('Choose folder');
  });

  it('프로퍼티로 켜고 끄면 반영된다', async () => {
    const { picker } = mountInForm();
    picker.directory = true;
    await picker.updateComplete;
    expect(nativeOf(picker).webkitdirectory).toBe(true);
    expect(picker.hasAttribute('directory')).toBe(true);
    picker.directory = false;
    await picker.updateComplete;
    expect(nativeOf(picker).webkitdirectory).toBe(false);
    expect(nativeOf(picker).multiple).toBe(false);
  });

  it('라벨이 있으면 트리거 접근성 이름이 보이는 «폴더» 글자로 시작한다(Label in Name)', async () => {
    const { picker } = mountInForm({ directory: '', label: 'Drawings' });
    await picker.updateComplete;
    expect(triggerOf(picker).getAttribute('aria-label')).toBe('Choose folder, Drawings');
  });

  it('고른 폴더의 파일 전부가 value 에 · 상대 경로를 지닌 채 · 상태는 폴더 이름과 파일 수', async () => {
    const { form, picker } = mountInForm({ directory: '' });
    await picker.updateComplete;
    const files = [folderFile('plans/a.txt'), folderFile('plans/sub/b.txt'), folderFile('plans/c.txt')];
    select(picker, files);
    await picker.updateComplete;

    expect(picker.value).toHaveLength(3);
    expect(picker.value!.map(f => f.webkitRelativePath)).toEqual(['plans/a.txt', 'plans/sub/b.txt', 'plans/c.txt']);
    expect(statusOf(picker)).toBe('plans (3 files)');
    // 제출 형태는 multiple 과 같다 — 같은 name 으로 반복
    expect(new FormData(form).getAll('q')).toHaveLength(3);
  });

  it('상태 글자는 현재 로캘을 따른다', async () => {
    Locale.set('ko');
    const { picker } = mountInForm({ directory: '' });
    await picker.updateComplete;
    expect(triggerOf(picker).textContent!.trim()).toBe('폴더 선택');
    select(picker, [folderFile('사진/1.jpg'), folderFile('사진/2.jpg')]);
    await picker.updateComplete;
    expect(statusOf(picker)).toBe('사진 (파일 2개)');
  });

  it('상대 경로가 없는 값(코드가 넣은 파일)은 파일 모드의 상태 글자로', async () => {
    const { picker } = mountInForm({ directory: '' });
    picker.value = [new File(['x'], 'a.txt'), new File(['y'], 'b.txt')];
    await picker.updateComplete;
    expect(statusOf(picker)).toBe('2 files selected');
  });
});
