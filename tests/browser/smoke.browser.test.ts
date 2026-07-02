import { describe, it, expect } from 'vitest';
import '../../src/components/button/UButton.js';

describe('browser mode smoke test', () => {
  it('renders a real UButton with actual browser layout', async () => {
    const el = document.createElement('u-button');
    el.textContent = 'Click me';
    document.body.appendChild(el);
    await (el as unknown as { updateComplete: Promise<boolean> }).updateComplete;

    expect(el.shadowRoot).not.toBeNull();
    // jsdom would report 0 for all layout metrics — a non-zero width here
    // proves this test is running against a real browser engine, not jsdom.
    const rect = el.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);

    document.body.removeChild(el);
  });
});
