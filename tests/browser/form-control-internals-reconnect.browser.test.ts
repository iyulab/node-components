import { describe, it, expect } from 'vitest';
import '../../src/components/button/UButton.js';
import '../../src/components/input/UInput.js';
import type { UButton } from '../../src/components/button/UButton.js';
import type { UInput } from '../../src/components/input/UInput.js';

// Custom-element callback reactions (connectedCallback 포함) 안에서 던진 예외는
// 호출자에게 동기 throw로 전파되지 않고 "report the exception" 알고리즘을 거쳐
// window error 이벤트로 보고된다(HTML 스펙) — 그래서 try/catch가 아니라
// window 'error' 리스너로 잡아야 재현·회귀 둘 다 정확히 관찰된다.
function captureWindowErrors() {
  const messages: string[] = [];
  const handler = (e: ErrorEvent) => {
    messages.push(e.message || String(e.error));
  };
  window.addEventListener('error', handler);
  return {
    messages,
    stop: () => window.removeEventListener('error', handler),
  };
}

async function reconnect(el: HTMLElement) {
  const parent = el.parentElement;
  if (!parent) throw new Error('element must be connected before reconnect()');
  parent.removeChild(el);
  await new Promise(r => setTimeout(r, 0));
  parent.appendChild(el);
  await new Promise(r => setTimeout(r, 0));
}

describe('form-associated connectedCallback survives disconnect+reconnect (docket #165)', () => {
  it('UButton — attachInternals()를 재호출하지 않는다', async () => {
    const el = document.createElement('u-button') as UButton;
    document.body.appendChild(el);
    await el.updateComplete;

    const capture = captureWindowErrors();
    await reconnect(el);
    capture.stop();

    expect(capture.messages.join('\n')).not.toMatch(/NotSupportedError/);
    el.remove();
  });

  it('UInput(UFormControlElement 상속) — attachInternals()를 재호출하지 않는다', async () => {
    const el = document.createElement('u-input') as UInput;
    document.body.appendChild(el);
    await el.updateComplete;

    const capture = captureWindowErrors();
    await reconnect(el);
    capture.stop();

    expect(capture.messages.join('\n')).not.toMatch(/NotSupportedError/);
    el.remove();
  });

  it('UButton — 재연결 후에도 click 핸들러가 여전히 동작한다', async () => {
    const el = document.createElement('u-button') as UButton;
    document.body.appendChild(el);
    await el.updateComplete;
    await reconnect(el);

    let clicked = false;
    el.addEventListener('click', () => { clicked = true; });
    el.click();

    expect(clicked).toBe(true);
    el.remove();
  });
});
