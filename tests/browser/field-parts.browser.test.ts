import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/field/UField.js';
import '../../src/components/input/UInput.js';

/**
 * 테마가 라벨 줄과 컨트롤 아래 줄을 자기 모양으로 칠할 수 있다 — `header` · `label` · `required` · `footer` part.
 * 바깥 시트의 `::part()` 규칙이 실제로 닿는가를 계산값으로 잰다(이름이 소스에 있는가가 아니라).
 */
afterEach(() => document.body.replaceChildren());

async function mount(attrs: string) {
  document.body.innerHTML = `
    <style>
      u-field::part(header) { margin-bottom: 7px; }
      u-field::part(label) { color: rgb(10, 20, 30); }
      u-field::part(required) { color: rgb(200, 0, 0); }
      u-field::part(footer) { color: rgb(1, 2, 3); }
      u-field[invalid]::part(footer) { color: rgb(250, 0, 0); }
    </style>
    <u-field ${attrs}><u-input></u-input></u-field>`;
  const field = document.querySelector('u-field') as HTMLElement & { updateComplete: Promise<unknown> };
  await field.updateComplete;
  const q = (sel: string) => field.shadowRoot!.querySelector(sel) as HTMLElement;
  return { field, q };
}

describe('u-field parts', () => {
  it('🔴a theme reaches the label row, the label and the required marker', async () => {
    const { q } = await mount('label="Order number" required');
    expect(getComputedStyle(q('.header')).marginBottom).toBe('7px');
    expect(getComputedStyle(q('.label')).color).toBe('rgb(10, 20, 30)');
    expect(getComputedStyle(q('.required')).color).toBe('rgb(200, 0, 0)');
  });

  it('🔴a theme reaches the line under the control, and tells the description from the error', async () => {
    const help = await mount('label="Courier" description="Any carrier"');
    expect(getComputedStyle(help.q('.footer')).color).toBe('rgb(1, 2, 3)');
    const error = await mount('label="Courier" invalid validation-message="Required"');
    expect(error.q('.footer').textContent).toBe('Required');
    expect(getComputedStyle(error.q('.footer')).color).toBe('rgb(250, 0, 0)');
  });
});
